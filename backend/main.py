import pandas as pd
import os
import logging
import joblib
from reddit_fetcher import fetch_daily_reddit_trends
from data_standardizer import standardize_datasets, create_synthetic_kaggle_data
from slang_extractor import extract_trending_slang
from model_trainer import train_virality_model, load_virality_model, predict_with_explainability

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("TrendSensePipeline")

def run_pipeline():
    logger.info("=== TRENDSENSE VIRALITY PREDICTOR PIPELINE DEPLOYED ===")
    
    # Files
    model_path = "virality_model.pkl"
    scaler_path = "scaler.pkl"
    
    # Step 1: Fetch Real-Time Data from Reddit
    logger.info("\n[Step 1] Fetching live data from Reddit...")
    reddit_df = fetch_daily_reddit_trends(limit=100)
    
    if reddit_df.empty:
        logger.warning("Using sample mock Reddit data since network fetch failed.")
        reddit_df = pd.DataFrame({
            'title': ['AI AI AI is taking over tech', 'GenZ loves this new skibidi slang', 'Meme economy crashing again', 'Bitcoin hits new all time high', 'The weather is great today no cap'],
            'score': [1500, 25000, 450, 6000, 150],
            'num_comments': [300, 1200, 50, 800, 10],
            'upvote_ratio': [0.98, 0.95, 0.70, 0.88, 0.99],
            'created_utc': [1700000000, 1700001000, 1700002000, 1700003000, 1700004000]
        })

    # Prepare Historical Data loading
    logger.info("\n[Data Preparation] Loading Kaggle historical dataset...")
    kaggle_csv_path = os.path.join('..', 'data', 'sentiment140.csv')
    try:
        if os.path.exists(kaggle_csv_path):
            kaggle_df = pd.read_csv(kaggle_csv_path, encoding='ISO-8859-1', header=None,
                                    names=['target', 'ids', 'date', 'flag', 'user', 'text'])
            logger.info(f"Loaded real Kaggle CSV with {len(kaggle_df)} rows.")
            kaggle_df = kaggle_df.sample(n=min(5000, len(kaggle_df)), random_state=42)
        else:
            logger.info(f"Kaggle file not found at {kaggle_csv_path}. Falling back to synthetic generator for testing framework.")
            kaggle_df = create_synthetic_kaggle_data(n_samples=2000)
    except Exception as e:
        logger.error(f"Error loading Kaggle data natively: {e}. Falling back to synthetic.")
        kaggle_df = create_synthetic_kaggle_data(n_samples=2000)

    # Step 2: Standardize Datasets (Generates Scaler)
    logger.info("\n[Step 2] Standardizing and combining Datasets (Extracting Sentiment & Virality Index)...")
    hybrid_df = standardize_datasets(kaggle_df, reddit_df, scaler_path)

    # Step 3: Extract Trending Slang
    logger.info("\n[Step 3] Extracting 'New Slang' from Reddit real-time data...")
    trending_slang = extract_trending_slang(reddit_df, top_n=20)
    logger.info(f"Top 20 Trending Slang/Keywords: {trending_slang}")

    # Step 4: Train Hybrid Model
    logger.info("\n[Step 4] Training Hybrid Machine Learning Model (Model Comparison)...")
    if not hybrid_df.empty:
        best_model, rmse, r2 = train_virality_model(hybrid_df, trending_slang, model_path)
    else:
        logger.error("\nPipeline Aborted: No valid data available for training.")
        return

    # --- Step 5: DASHBOARD INFERENCE DEMO ---
    logger.info("\n[Step 5] Dashboard Inference & Explainability Demo...")
    
    # Load artifact properly
    model_artifact = load_virality_model(model_path)
    
    if model_artifact:
        # Create a small inference DF from the latest Reddit data after feature engineering standardizations
        logger.info("Running explainability on latest 3 Reddit Posts...")
        
        # We need the features exactly as engineered during training for inference.
        # Since hybrid_df already ran through Feature Engineering inside model_trainer, 
        # normally we'd isolate the engineering logic. For this script MVP, we extract the matching rows from hybrid_df.
        
        # Taking last 3 rows (which represent the latest reddit posts in our concat logic)
        inference_df = hybrid_df.tail(3).copy()
        
        # Features required
        features = model_artifact["features"]
        
        # Recreate temporal/nlp features for inference df just to be explicit for the demo
        from model_trainer import contains_slang, calc_keyword_density
        inference_df['contains_trending_slang'] = inference_df['text'].apply(lambda x: contains_slang(x, trending_slang))
        inference_df['keyword_density'] = inference_df['text'].apply(lambda x: calc_keyword_density(x, trending_slang))
        inference_df['text_length'] = inference_df['text'].str.len().fillna(0)
        inference_df['hour_of_day'] = inference_df['timestamp'].dt.hour
        inference_df['day_of_week'] = inference_df['timestamp'].dt.dayofweek
        inference_df['is_weekend'] = inference_df['day_of_week'].isin([5, 6]).astype(int)
        
        # Predict using the wrapper
        scores, explanations = predict_with_explainability(model_artifact, inference_df)
        
        for idx, (text, score, explanation) in enumerate(zip(inference_df['text'], scores, explanations)):
            logger.info(f"--- Post {idx+1} ---")
            logger.info(f"Text: '{text}'")
            logger.info(f"Predicted Virality Index: {score:.2f} / 100")
            logger.info("Top 3 Dashboard Influencers:")
            for feat, cont in explanation:
                logger.info(f"  -> {feat} (Importance/Weight: {cont:.4f})")

    logger.info("\n=== Pipeline Execution Completed Successfully ===")

if __name__ == "__main__":
    run_pipeline()
