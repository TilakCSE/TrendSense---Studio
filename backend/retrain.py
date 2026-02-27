import pandas as pd
import os
import sys
import logging
from datetime import datetime

# Add data/db_scripts to path for mongo_client
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data', 'db_scripts'))
from mongo_client import MongoDBClient
from data_standardizer import standardize_youtube_for_training
from model_trainer import train_virality_model

# Configure structured logging for retraining
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("TrendSenseRetrainer")

def fetch_youtube_from_mongo(sample_size=5000):
    """Fetches a sampled historical subset from MongoDB for fast retraining."""
    logger.info(f"Connecting to MongoDB to fetch {sample_size} YouTube training records...")
    try:
        db = MongoDBClient().db
        collection = db["historical_youtube"]
        
        # Using aggregation to get a random sample
        cursor = collection.aggregate([{"$sample": {"size": sample_size}}])
        data = list(cursor)
        
        if not data:
            logger.warning("No data found in historical_youtube collection.")
            return pd.DataFrame()
            
        return pd.DataFrame(data)
    except Exception as e:
        logger.error(f"Failed to fetch from MongoDB: {e}")
        return pd.DataFrame()

def run_retraining_pipeline():
    logger.info("=== STARTING YOUTUBE-CENTRIC MODEL RETRAINING PIPELINE ===")
    
    # Step 1: Fetch Training Data from MongoDB
    # Reasoning: 6.4GB Local CSV is too large; Mongo sampling is faster and cloud-native.
    logger.info("\n[Step 1] Fetching Historical YouTube Data from MongoDB Atlas...")
    youtube_df = fetch_youtube_from_mongo(sample_size=5000)
    
    if youtube_df.empty:
        logger.error("Training aborted: No historical data available.")
        return

    # Step 2: Standardize & Generate Scaler
    logger.info("\n[Step 2] Standardizing YouTube Training Set...")
    # This automatically saves models/scaler.pkl
    train_ready_df = standardize_youtube_for_training(youtube_df)

    # Step 3: Train & Version (Automatic Registry Update)
    logger.info("\n[Step 3] Training Best Model & Updating Registry...")
    if not train_ready_df.empty:
        # train_virality_model now handles registry updates internally
        best_model, rmse, r2 = train_virality_model(train_ready_df, models_dir="models")
        logger.info(f"Retraining Complete. Final Metrics -> RMSE: {rmse:.4f}, R2: {r2:.4f}")
    else:
        logger.error("No data available to train.")

    logger.info("\n=== RETRAINING PIPELINE COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_retraining_pipeline()

if __name__ == "__main__":
    run_retraining_pipeline()
