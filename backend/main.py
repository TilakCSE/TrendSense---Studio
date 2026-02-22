import pandas as pd
import os
from reddit_fetcher import fetch_daily_reddit_trends
from data_standardizer import standardize_datasets
from slang_extractor import extract_trending_slang
from model_trainer import train_virality_model

def run_pipeline():
    print("=== TRENDSENSE VIRALITY PREDICTOR PIPELINE ===")
    
    # Step 1: Fetch Real-Time Data from Reddit
    print("\n[Step 1] Fetching live data from Reddit...")
    try:
        reddit_df = fetch_daily_reddit_trends(limit=100)
        print(f"Fetched {len(reddit_df)} recent posts from Reddit.")
    except Exception as e:
        print(f"Failed to fetch Reddit data: {e}")
        reddit_df = pd.DataFrame()

    # Create dummy Reddit Data if fetch failed
    if reddit_df.empty:
        print("Using sample mock Reddit data since fetch failed.")
        reddit_df = pd.DataFrame({
            'title': ['AI AI AI is taking over tech', 'GenZ loves this new skibidi slang', 'Meme economy crashing again', 'Bitcoin hits new all time high', 'The weather is great today no cap'],
            'score': [1500, 25000, 450, 6000, 150],
            'num_comments': [300, 1200, 50, 800, 10],
            'created_utc': [1700000000, 1700001000, 1700002000, 1700003000, 1700004000]
        })

    # Prepare Historical Data loading
    print("\n[Data Preparation] Loading Kaggle historical dataset...")
    kaggle_csv_path = os.path.join('..', 'data', 'sentiment140.csv')
    try:
        if os.path.exists(kaggle_csv_path):
            kaggle_df = pd.read_csv(kaggle_csv_path, encoding='ISO-8859-1', header=None,
                                    names=['target', 'ids', 'date', 'flag', 'user', 'text'])
            print(f"Loaded Kaggle CSV with {len(kaggle_df)} rows.")
            # Sample to keep execution fast for first test runs
            kaggle_df = kaggle_df.sample(n=min(5000, len(kaggle_df)), random_state=42)
        else:
            print(f"Kaggle file not found at {kaggle_csv_path}. Using mock historical data.")
            kaggle_df = pd.DataFrame({
                'text': ["I am happy today", "I feel terrible", "Wow, great weather", "So sad to hear that", "Amazing news everyone!"],
                'target': [4, 0, 4, 0, 4],
                'date': ["Sat May 16 23:58:44 UTC 2009", "Sat May 16 23:58:45 UTC 2009", "Sat May 16 23:58:46 UTC 2009", "Sat May 16 23:58:47 UTC 2009", "Sat May 16 23:58:48 UTC 2009"]
            })
    except Exception as e:
        print(f"Error loading Kaggle data: {e}")
        kaggle_df = pd.DataFrame()

    # Step 2: Standardize Datasets
    print("\n[Step 2] Standardizing and combining Datasets...")
    hybrid_df = standardize_datasets(kaggle_df, reddit_df)
    print(f"Hybrid Dataset created with {len(hybrid_df)} total records.")

    # Step 3: Extract Trending Slang
    print("\n[Step 3] Extracting 'New Slang' from Reddit real-time data...")
    trending_slang = extract_trending_slang(reddit_df, top_n=20)
    print(f"Top 20 Trending Slang/Keywords: {trending_slang}")

    # Step 4: Train Hybrid Model
    print("\n[Step 4] Training Hybrid Machine Learning Model (Random Forest)...")
    if not hybrid_df.empty:
        model, mse, r2 = train_virality_model(hybrid_df, trending_slang)
        print("\n=== Pipeline Execution Completed Successfully ===")
    else:
        print("\nPipeline Aborted: No valid data available for training.")

if __name__ == "__main__":
    run_pipeline()
