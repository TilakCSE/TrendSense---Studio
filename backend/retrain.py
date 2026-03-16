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

        df = pd.DataFrame(data)

        # --- DIAGNOSTIC: Print available columns ---
        logger.info("\n" + "=" * 80)
        logger.info("📊 MONGODB FIELDS DIAGNOSTIC")
        logger.info("=" * 80)
        logger.info(f"Total records fetched: {len(df)}")
        logger.info(f"Available columns in MongoDB data: {list(df.columns)}")

        # Check for critical fields
        critical_fields = ['text', 'timestamp', 'comment_count', 'engagement_score']
        for field in critical_fields:
            if field in df.columns:
                non_null = df[field].notna().sum()
                logger.info(f"  ✅ {field:20s}: {non_null}/{len(df)} non-null values")
            else:
                logger.warning(f"  ❌ {field:20s}: MISSING from MongoDB!")

        logger.info("=" * 80 + "\n")

        return df

    except Exception as e:
        logger.error(f"Failed to fetch from MongoDB: {e}")
        return pd.DataFrame()

def run_retraining_pipeline():
    logger.info("=== STARTING YOUTUBE-CENTRIC MODEL RETRAINING PIPELINE ===")

    # Step 1: Fetch Training Data from MongoDB
    logger.info("\n[Step 1] Fetching Historical YouTube Data from MongoDB Atlas...")
    youtube_df = fetch_youtube_from_mongo(sample_size=5000)

    if youtube_df.empty:
        logger.error("Training aborted: No historical data available.")
        return

    # Step 2: Standardize & Extract Features (comment_count + temporal + NLP)
    logger.info("\n[Step 2] Standardizing YouTube Training Set (comment_count, sentiment, temporal)...")
    train_ready_df = standardize_youtube_for_training(youtube_df)

    # Step 3: Train & Version with KFold CV (Prints Feature Importance Report)
    logger.info("\n[Step 3] Training Best Model with KFold CV & Updating Registry...")
    if not train_ready_df.empty:
        best_model, rmse, r2 = train_virality_model(train_ready_df, models_dir="models")
        logger.info("\n" + "=" * 80)
        logger.info("🎉 RETRAINING COMPLETE!")
        logger.info("=" * 80)
        logger.info(f"📊 Final Test Set Metrics:")
        logger.info(f"   RMSE: {rmse:.4f}")
        logger.info(f"   R²:   {r2:.4f}")
        logger.info("=" * 80)

        if r2 < 0.10:
            logger.warning("⚠️  R² is still very low (<0.10). Check feature importance report above.")
            logger.warning("⚠️  This may indicate that comment_count alone is insufficient for prediction.")
    else:
        logger.error("No data available to train.")

    logger.info("\n=== RETRAINING PIPELINE COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_retraining_pipeline()
