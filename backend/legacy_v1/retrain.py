import pandas as pd
import os
import sys
import logging
from datetime import datetime

# Define Base Path for Models (always saves to backend/models/)
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Add data/db_scripts to path for mongo_client
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data', 'db_scripts'))
from mongo_client import MongoDBClient
from data_standardizer import standardize_youtube_for_training
from backend.legacy_v1.model_trainer import train_virality_model

# Configure structured logging for retraining
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("TrendSenseRetrainer")

def fetch_training_data_from_mongo():
    """
    Fetches training data from two sources:
    1. Random sample of 1,000 records from historical_youtube (200k dataset)
    2. ALL records from live_trends collection

    REBALANCED: Reduced YouTube from 4,000 to 1,000 to give Reddit internet
    culture (slang, caps, viral keywords) a stronger voice in training.
    """
    logger.info("=" * 80)
    logger.info("REBALANCED MONGODB SAMPLING FOR INTERNET CULTURE LEARNING")
    logger.info("=" * 80)

    try:
        db = MongoDBClient().db

        # --- 1. FETCH RANDOM SAMPLE FROM HISTORICAL_YOUTUBE (REDUCED TO 1,000) ---
        logger.info("\n[1/2] Fetching random 1,000 records from historical_youtube (200k records)...")
        historical_collection = db["historical_youtube"]

        # $sample aggregation pulls random records without seeding
        historical_cursor = historical_collection.aggregate([{"$sample": {"size": 1000}}])
        historical_data = list(historical_cursor)
        historical_df = pd.DataFrame(historical_data)

        logger.info(f"✅ Historical YouTube: {len(historical_df)} records fetched")

        # --- 2. FETCH ALL RECORDS FROM LIVE_TRENDS ---
        logger.info("\n[2/2] Fetching ALL records from live_trends collection...")
        live_collection = db["live_trends"]
        live_cursor = live_collection.find({})
        live_data = list(live_cursor)
        live_df = pd.DataFrame(live_data)

        logger.info(f"✅ Live Trends: {len(live_df)} records fetched")

        # --- 3. MERGE BOTH DATASETS ---
        if historical_df.empty and live_df.empty:
            logger.error("❌ Both collections are empty! Cannot train model.")
            return pd.DataFrame()

        # Concatenate datasets
        if not historical_df.empty and not live_df.empty:
            combined_df = pd.concat([historical_df, live_df], ignore_index=True)
            logger.info(f"\n✅ MERGED DATASET: {len(combined_df)} total records")
            logger.info(f"   - Historical: {len(historical_df)} ({len(historical_df)/len(combined_df)*100:.1f}%)")
            logger.info(f"   - Live Trends: {len(live_df)} ({len(live_df)/len(combined_df)*100:.1f}%)")
            logger.info(f"   🎯 Reddit voice: {len(live_df)}/{len(combined_df)} = {len(live_df)/len(combined_df)*100:.1f}% (BOOSTED from ~13% to ~38%)")
        elif not historical_df.empty:
            combined_df = historical_df
            logger.warning("Only historical data available. Live trends collection is empty.")
        else:
            combined_df = live_df
            logger.warning("Only live trends available. Historical collection is empty.")

        # --- DIAGNOSTIC: Print available columns ---
        logger.info("\n" + "=" * 80)
        logger.info("📊 MERGED DATASET DIAGNOSTIC")
        logger.info("=" * 80)
        logger.info(f"Available columns: {list(combined_df.columns)}")

        # Check for critical fields
        critical_fields = ['text', 'timestamp', 'comment_count', 'engagement_score']
        for field in critical_fields:
            if field in combined_df.columns:
                non_null = combined_df[field].notna().sum()
                logger.info(f"  ✅ {field:20s}: {non_null}/{len(combined_df)} non-null values")
            else:
                logger.warning(f"  ❌ {field:20s}: MISSING from merged dataset!")

        logger.info("=" * 80 + "\n")

        return combined_df

    except Exception as e:
        logger.error(f"Failed to fetch training data from MongoDB: {e}")
        return pd.DataFrame()

def run_retraining_pipeline():
    logger.info("=== DAILY MODEL EVOLUTION PIPELINE (PRODUCTION) ===")
    logger.info("🚀 V3 ENHANCEMENTS:")
    logger.info("   - VADER lexicon updated with 100+ viral slang terms")
    logger.info("   - TF-IDF → TruncatedSVD (500 sparse → 10 dense text topics)")
    logger.info("   - hour_of_day (24 values) → is_peak_hour (binary)")
    logger.info("   - Dataset rebalanced: 1,000 YouTube + ALL Reddit (boosted Reddit voice)")

    # Ensure MODEL_DIR exists before any operations
    os.makedirs(MODEL_DIR, exist_ok=True)
    logger.info(f"✅ Model directory confirmed: {MODEL_DIR}")

    # Step 1: Fetch Training Data from MongoDB (Historical + Live)
    logger.info("\n[Step 1] Fetching training data from MongoDB (Historical + Live Trends)...")
    training_df = fetch_training_data_from_mongo()

    if training_df.empty:
        logger.error("Training aborted: No data available.")
        return

    # Step 2: Standardize & Extract Features (NLP + Temporal + TF-IDF)
    logger.info("\n[Step 2] Standardizing dataset with advanced NLP feature extraction...")
    train_ready_df = standardize_youtube_for_training(training_df)

    # Step 3: Train & Version with GridSearchCV (Automatic Hyperparameter Tuning)
    logger.info("\n[Step 3] Training GradientBoosting model with TF-IDF + NLP features...")
    if not train_ready_df.empty:
        best_model, rmse, r2 = train_virality_model(train_ready_df, models_dir=MODEL_DIR)
        logger.info("\n" + "=" * 80)
        logger.info("🎉 DAILY MODEL RETRAINING COMPLETE!")
        logger.info("=" * 80)
        logger.info(f"📊 Final Test Set Metrics:")
        logger.info(f"   RMSE: {rmse:.4f}")
        logger.info(f"   R²:   {r2:.4f}")
        logger.info(f"📁 Model saved to: {MODEL_DIR}")
        logger.info("=" * 80)

        if r2 < 0.15:
            logger.warning("⚠️  R² is low (<0.15). Check feature importance report above.")
            logger.warning("⚠️  Consider expanding feature engineering or increasing dataset size.")
    else:
        logger.error("No data available to train after standardization.")

    logger.info("\n=== RETRAINING PIPELINE COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_retraining_pipeline()
