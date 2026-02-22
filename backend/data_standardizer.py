import pandas as pd
import numpy as np
import logging
import joblib
from sklearn.preprocessing import MinMaxScaler
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)
analyzer = SentimentIntensityAnalyzer()

def compute_raw_engagement_score(df: pd.DataFrame) -> pd.Series:
    """
    Computes a raw formalized engagement_score.
    Formula: Base Engagement (Score + Comments * Weight) * Upvote Ratio Multiplier
    We then normalize using Log transformation log(1 + x) for scalability.
    """
    score = df.get('score', pd.Series(0, index=df.index))
    comments = df.get('num_comments', pd.Series(0, index=df.index))
    upvote_ratio = df.get('upvote_ratio', pd.Series(1.0, index=df.index))
    
    comment_weight = 2.0
    raw_engagement = score + (comments * comment_weight)
    weighted_engagement = raw_engagement * upvote_ratio
    normalized_score = np.log1p(np.maximum(0, weighted_engagement))
    return normalized_score

def get_sentiment(text: str) -> float:
    """Extracts compound sentiment score from text using VADER (-1 to 1)."""
    if not isinstance(text, str) or not text.strip():
        return 0.0
    return analyzer.polarity_scores(text)['compound']

def create_synthetic_kaggle_data(n_samples=1000) -> pd.DataFrame:
    """Generates realistic synthentic Kaggle CSV equivalent for academic testing."""
    logger.info(f"Generating synthetic Kaggle dataset with {n_samples} items for robust validation.")
    import random
    
    scores = np.random.lognormal(mean=2.0, sigma=1.5, size=n_samples)
    comments = np.random.lognormal(mean=1.0, sigma=1.0, size=n_samples)
    upvote_ratios = np.random.uniform(0.6, 1.0, size=n_samples)
    
    vocab = ["amazing", "skibidi", "cap", "terrible", "ai", "tech", "funny", "sad", "stock", "crypto", "good", "bad", "love", "hate"]
    
    df = pd.DataFrame({
        'target': np.random.choice([0, 2, 4], size=n_samples), # sentiment140 style
        'text': [" ".join(random.choices(vocab, k=random.randint(5, 15))) for _ in range(n_samples)],
        'date': pd.date_range(start="2024-01-01", periods=n_samples, freq="h"),
        'score': scores.astype(int),
        'num_comments': comments.astype(int),
        'upvote_ratio': upvote_ratios
    })
    return df

def standardize_datasets(kaggle_df: pd.DataFrame, reddit_df: pd.DataFrame, scaler_path: str = "scaler.pkl") -> pd.DataFrame:
    """
    Standardizes datasets to universal columns: 'text', 'engagement_score', 'sentiment_polarity', and 'timestamp'.
    Introduces 'Virality Index' (0-100) using MinMaxScaler.
    """
    logger.info("Standardizing Datasets...")
    
    kaggle_std = pd.DataFrame()
    if not kaggle_df.empty:
        if 'text' in kaggle_df.columns:
            kaggle_std['text'] = kaggle_df['text']
        else:
            text_cols = kaggle_df.select_dtypes(include=['object']).columns
            kaggle_std['text'] = kaggle_df[text_cols[0]] if len(text_cols) > 0 else ''
                
        kaggle_std['raw_score'] = compute_raw_engagement_score(kaggle_df)
        kaggle_std['timestamp'] = pd.to_datetime(kaggle_df.get('date', pd.Timestamp.now()), errors='coerce')
            
    reddit_std = pd.DataFrame()
    if not reddit_df.empty:
        reddit_std['text'] = reddit_df['title']
        reddit_std['raw_score'] = compute_raw_engagement_score(reddit_df)
        reddit_std['timestamp'] = pd.to_datetime(reddit_df['created_utc'], unit='s', errors='coerce')
    
    hybrid_df = pd.concat([kaggle_std, reddit_std], ignore_index=True)
    
    if hybrid_df.empty:
        logger.warning("Hybrid DF is empty after concat.")
        return hybrid_df
        
    hybrid_df.dropna(subset=['text'], inplace=True)
    hybrid_df['text'] = hybrid_df['text'].astype(str)
    
    logger.info("Extracting true sentiment using VADER...")
    hybrid_df['sentiment_polarity'] = hybrid_df['text'].apply(get_sentiment)
    
    hybrid_df['timestamp'] = hybrid_df['timestamp'].fillna(pd.Timestamp.now())
    hybrid_df['raw_score'] = hybrid_df['raw_score'].fillna(0)
    
    # --- VIRALITY INDEX (0 - 100) ---
    logger.info("Scaling to formal Virality Index (0-100)...")
    scaler = MinMaxScaler(feature_range=(0, 100))
    # Reshape for sklearn
    raw_scores = hybrid_df['raw_score'].values.reshape(-1, 1)
    hybrid_df['engagement_score'] = scaler.fit_transform(raw_scores).flatten()
    
    logger.info(f"Saving Scaler to {scaler_path}...")
    joblib.dump(scaler, scaler_path)
    
    # Drop intermediate raw_score
    hybrid_df.drop(columns=['raw_score'], inplace=True)
    
    logger.info(f"Standardization complete. Output shape: {hybrid_df.shape}")
    return hybrid_df
