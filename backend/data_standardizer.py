import pandas as pd
import numpy as np
import logging
import joblib
import os
from sklearn.preprocessing import MinMaxScaler
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)
analyzer = SentimentIntensityAnalyzer()

def get_sentiment(text: str) -> float:
    """Extracts compound sentiment score from text using VADER (-1 to 1)."""
    if not isinstance(text, str) or not text.strip():
        return 0.0
    return analyzer.polarity_scores(text)['compound']

def standardize_youtube_for_training(df: pd.DataFrame, scaler_path: str = "models/scaler.pkl") -> pd.DataFrame:
    """
    Standardizes YouTube Trending data for the ML Training pipeline.
    Expects 'text' (title) and 'engagement_score' (pre-calculated).
    Outputs Scaled Virality Index (0-100).
    """
    logger.info("Standardizing YouTube Dataset for training...")
    
    if df.empty:
        logger.warning("Input DataFrame is empty.")
        return df
        
    # Clean text
    df = df.dropna(subset=['text']).copy()
    df['text'] = df['text'].astype(str)
    
    # Calculate sentiment polarity for feature engineering
    logger.info("Extracting true sentiment using VADER...")
    df['sentiment_polarity'] = df['text'].apply(get_sentiment)
    
    # Ensure timestamp exists
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce').fillna(pd.Timestamp.now())
    else:
        df['timestamp'] = pd.Timestamp.now()
        
    # --- VIRALITY INDEX SCALING (0 - 100) ---
    logger.info("Scaling to formal Virality Index (0-100)...")
    scaler = MinMaxScaler(feature_range=(0, 100))
    
    # Use existing engagement_score pre-calculated in DB scripts
    if 'engagement_score' not in df.columns:
        logger.warning("'engagement_score' missing. Defaulting to 0.")
        df['engagement_score'] = 0.0
        
    raw_scores = df['engagement_score'].values.reshape(-1, 1)
    df['engagement_score'] = scaler.fit_transform(raw_scores).flatten()
    
    logger.info(f"Saving Scaler to {scaler_path}...")
    os.makedirs(os.path.dirname(scaler_path), exist_ok=True)
    joblib.dump(scaler, scaler_path)
    
    logger.info(f"Standardization complete. Output shape: {df.shape}")
    return df
