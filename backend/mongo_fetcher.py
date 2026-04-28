import os
import pandas as pd
import logging
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

def fetch_live_trends_from_mongo(limit=1000):
    """
    Bypasses Reddit API blocks by pulling the latest trending 
    data directly from our MongoDB Atlas reservoir.
    """
    logger.info("🗄️ [Data Reservoir] Connecting to MongoDB Atlas...")
    
    mongo_uri = os.getenv("MONGO_URI")
    db_name = os.getenv("DB_NAME", "trendSenseDB")
    
    if not mongo_uri:
        logger.error("❌ MONGO_URI environment variable is missing!")
        return pd.DataFrame()

    try:
        # Connect to DB
        client = MongoClient(mongo_uri)
        db = client[db_name]
        collection = db["live_trends"] # Ensure this matches your actual table name!

        # Fetch the most recent posts, sorted by newest first
        logger.info(f"⚡ [Velocity Stream] Extracting latest {limit} posts from reservoir...")
        cursor = collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit)
        data = list(cursor)

        if not data:
            logger.warning("⚠️ No data found in MongoDB 'live_trends' collection.")
            return pd.DataFrame()

        # Convert to Pandas DataFrame for BERTopic
        df = pd.DataFrame(data)
        
        # Ensure we have the required text column for the clustering engine
        if 'text' not in df.columns:
            if 'title' in df.columns:
                df['text'] = df['title']
            else:
                logger.error("❌ MongoDB data is missing 'text' or 'title' fields.")
                return pd.DataFrame()

        logger.info(f"✅ [Data Reservoir] Successfully loaded {len(df)} posts into memory.")
        return df

    except Exception as e:
        logger.error(f"❌ MongoDB Fetch Error: {e}")
        return pd.DataFrame()