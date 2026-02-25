import pandas as pd
import logging
from mongo_client import MongoDBClient
from pymongo import ASCENDING
import sys
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def upload_in_chunks(file_path, collection_name, chunk_size=1000):
    """
    Reads a CSV file in chunks and uploads to MongoDB Atlas.
    """
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return

    try:
        # Initialize MongoDB Client
        db_client = MongoDBClient()
        collection = db_client.get_collection(collection_name)

        # Create index on timestamp if it doesn't exist
        logger.info(f"Ensuring index on 'timestamp' for collection: {collection_name}")
        collection.create_index([("timestamp", ASCENDING)])

        logger.info(f"Starting chunked upload for: {file_path}")
        
        # Determine total rows for progress tracking (optional, slow for huge files)
        # For simplicity, we just use the chunk loop
        
        reader = pd.read_csv(file_path, chunksize=chunk_size)
        total_inserted = 0

        for i, chunk in enumerate(reader):
            # Convert timestamp to datetime if present
            if 'timestamp' in chunk.columns:
                chunk['timestamp'] = pd.to_datetime(chunk['timestamp'])
            elif 'created_utc' in chunk.columns: # Fallback for raw Reddit data
                chunk['timestamp'] = pd.to_datetime(chunk['created_utc'], unit='s')
                chunk.drop(columns=['created_utc'], inplace=True, errors='ignore')
            
            # Convert DataFrame to list of dictionaries
            records = chunk.to_dict('records')
            
            if records:
                collection.insert_many(records)
                total_inserted += len(records)
                logger.info(f"Chunk {i+1}: Inserted {len(records)} records. (Total: {total_inserted})")

        logger.info(f"Upload complete! Total records inserted into '{collection_name}': {total_inserted}")

    except Exception as e:
        logger.error(f"An error occurred during upload: {e}")
    finally:
        if 'db_client' in locals():
            db_client.close()

if __name__ == "__main__":
    # Example usage
    if len(sys.argv) < 3:
        print("Usage: python upload_historical.py <file_path> <collection_name>")
    else:
        path = sys.argv[1]
        coll = sys.argv[2]
        upload_in_chunks(path, coll)
