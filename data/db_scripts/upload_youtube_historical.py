import pandas as pd
import logging
import time
import os
from mongo_client import MongoDBClient
from schema_standardizer import standardize_youtube_chunk
from pymongo import ASCENDING

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def upload_youtube_historical(file_path: str, chunk_size: int = 50000):
    """
    Uploads a YouTube dataset to MongoDB in chunks.
    """
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return

    file_name = os.path.basename(file_path)
    # Extract country code from filename if possible (e.g., USvideos.csv -> US)
    country_code = file_name[:2] if file_name[2:8] == "videos" else "Unknown"

    try:
        db_client = MongoDBClient()
        collection = db_client.get_collection("historical_youtube")

        # 4. Ensure index on timestamp
        logger.info("Ensuring index on 'timestamp' field...")
        collection.create_index([("timestamp", ASCENDING)])

        logger.info(f"Starting ingestion for {file_name} in chunks of {chunk_size}...")
        
        start_time = time.time()
        total_inserted = 0
        chunk_iter = pd.read_csv(file_path, chunksize=chunk_size)

        for i, chunk in enumerate(chunk_iter):
            chunk_start = time.time()
            
            # Standardize
            std_chunk = standardize_youtube_chunk(chunk, country_code)
            
            # Convert to dict for Mongo
            records = std_chunk.to_dict('records')
            
            if records:
                # Insert
                result = collection.insert_many(records)
                total_inserted += len(result.inserted_ids)
                
                chunk_end = time.time()
                logger.info(
                    f"Chunk {i+1} | "
                    f"Inserted: {len(result.inserted_ids)} | "
                    f"Total: {total_inserted} | "
                    f"Time: {chunk_end - chunk_start:.2f}s"
                )

        end_time = time.time()
        logger.info(f"Completed {file_name}! Total records: {total_inserted}. Total time: {end_time - start_time:.2f}s")

    except Exception as e:
        logger.error(f"Ingestion failed: {e}")
    finally:
        if 'db_client' in locals():
            db_client.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python upload_youtube_historical.py <path_to_csv>")
    else:
        upload_youtube_historical(sys.argv[1])
