import pandas as pd
import logging
from mongo_client import MongoDBClient
from pymongo import ASCENDING

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def append_to_mongo(df: pd.DataFrame, collection_name: str):
    """
    Appends a Pandas DataFrame to a MongoDB collection.
    Used for live ingestion logic.
    """
    if df.empty:
        logger.warning("Received empty DataFrame. Skipping append.")
        return

    try:
        db_client = MongoDBClient()
        collection = db_client.get_collection(collection_name)

        # Ensure index on timestamp
        collection.create_index([("timestamp", ASCENDING)])

        # Data grooming: ensure timestamp is datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Convert and insert
        records = df.to_dict('records')
        result = collection.insert_many(records)
        
        logger.info(f"Successfully appended {len(result.inserted_ids)} records to '{collection_name}'.")

    except Exception as e:
        logger.error(f"Failed to append to MongoDB: {e}")
    finally:
        if 'db_client' in locals():
            db_client.close()

if __name__ == "__main__":
    # Test with dummy data
    test_data = pd.DataFrame([
        {"text": "Live test post", "engagement_score": 50.0, "sentiment_polarity": 0.5, "timestamp": pd.Timestamp.now()}
    ])
    append_to_mongo(test_data, "live_test_collection")
