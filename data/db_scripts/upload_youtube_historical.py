import pandas as pd
import logging
import time
import os
from mongo_client import MongoDBClient
from schema_standardizer import standardize_youtube_chunk
from pymongo import ASCENDING, UpdateOne

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def upload_youtube_historical(file_path: str, chunk_size: int = 50000, max_rows: int = 200000):
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

        # 4. Ensure index on timestamp and platform
        logger.info("Ensuring indices on 'timestamp' and 'platform' fields...")
        collection.create_index([("timestamp", ASCENDING)])
        collection.create_index([("platform", ASCENDING)])

        logger.info(f"Starting ingestion for {file_name} in chunks of {chunk_size}...")
        
        start_time = time.time()
        total_inserted = 0
        chunk_iter = pd.read_csv(file_path, chunksize=chunk_size)

        for i, chunk in enumerate(chunk_iter):
            chunk_start = time.time()
            
            # Standardize
            std_chunk = standardize_youtube_chunk(chunk, country_code)
            
            # Limit rows if approaching max_rows
            remaining_rows = max_rows - total_inserted
            if remaining_rows <= 0:
                logger.info(f"Reached max_rows limit of {max_rows}. Stopping ingestion.")
                break
                
            if len(std_chunk) > remaining_rows:
                std_chunk = std_chunk.head(remaining_rows)
            
            # Convert to dict for Mongo
            records = std_chunk.to_dict('records')
            
            if records:
                # Insert Idempotently (Upsert based on text + timestamp)
                operations = []
                for record in records:
                    query = {
                        "text": record.get("text"),
                        "timestamp": record.get("timestamp"),
                        "platform": record.get("platform")
                    }
                    operations.append(UpdateOne(query, {"$setOnInsert": record}, upsert=True))

                if operations:
                    result = collection.bulk_write(operations)
                    # We count upserted as inserted
                    total_inserted += result.upserted_count
                
                    chunk_end = time.time()
                    logger.info(
                        f"Chunk {i+1} | "
                        f"Upserted: {result.upserted_count} | Duplicates skipped: {result.matched_count} | "
                        f"Total Inserted: {total_inserted} | "
                        f"Time: {chunk_end - chunk_start:.2f}s"
                    )
                
            if total_inserted >= max_rows:
                logger.info(f"Reached max_rows limit of {max_rows}. Stopping ingestion.")
                break

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
