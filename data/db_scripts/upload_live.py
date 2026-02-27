import pandas as pd
import logging
from mongo_client import MongoDBClient
from pymongo import ASCENDING, UpdateOne

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def append_to_mongo(df: pd.DataFrame, collection_name: str = "live_trends"):
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

        # Ensure indexes
        logger.info("Ensuring indices on 'timestamp', 'platform', and 'engagement_score'...")
        collection.create_index([("timestamp", ASCENDING)])
        collection.create_index([("platform", ASCENDING)])
        collection.create_index([("engagement_score", ASCENDING)])

        # Data grooming: ensure timestamp is datetime
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Add ingestion_timestamp
        df['ingestion_timestamp'] = pd.Timestamp.now(tz="UTC")
        
        # Convert to dictionary
        records = df.to_dict('records')
        
        # Create UpdateOne operations to avoid exact duplicates
        # Based on "text" or "title" or "id", and "timestamp"
        operations = []
        for record in records:
            query = {}
            if 'id' in record:
                query['id'] = record['id']
            elif 'text' in record:
                query['text'] = record['text']
            elif 'title' in record:
                query['title'] = record['title']
                
            if 'timestamp' in record:
                query['timestamp'] = record['timestamp']
            
            # Fallback if no specific unique identifiers are found, match all non-ingestion fields
            if not query:
                 query = {k: v for k, v in record.items() if k != 'ingestion_timestamp'}

            operations.append(UpdateOne(query, {"$setOnInsert": record}, upsert=True))

        if operations:
            result = collection.bulk_write(operations)
            logger.info(f"Successfully appended to '{collection_name}'. Inserted (Upserted): {result.upserted_count}, Matched (Duplicates): {result.matched_count}")

    except Exception as e:
        logger.error(f"Failed to append to MongoDB: {e}")
    finally:
        if 'db_client' in locals():
            db_client.close()

if __name__ == "__main__":
    # Test with dummy data
    test_data = pd.DataFrame([
        {"text": "Live Reddit test post 1", "engagement_score": 50.0, "timestamp": pd.Timestamp.now(tz="UTC")},
        {"text": "Live Reddit test post 2", "engagement_score": 75.0, "timestamp": pd.Timestamp.now(tz="UTC")}
    ])
    append_to_mongo(test_data, "live_trends")
