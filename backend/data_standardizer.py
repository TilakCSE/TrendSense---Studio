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
    USES: comment_count (median imputed) as primary engagement feature.
    USES: engagement_score from MongoDB as-is (already computed).
    """
    logger.info("Standardizing YouTube Dataset for training with available MongoDB fields...")

    if df.empty:
        logger.warning("Input DataFrame is empty.")
        return df

    # Clean text
    df = df.dropna(subset=['text']).copy()
    df['text'] = df['text'].astype(str)

    # Calculate sentiment polarity for feature engineering
    logger.info("Extracting sentiment using VADER...")
    df['sentiment_polarity'] = df['text'].apply(get_sentiment)

    # Ensure timestamp exists
    if 'timestamp' in df.columns:
        df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce').fillna(pd.Timestamp.now())
    else:
        logger.warning("'timestamp' column missing. Using current time.")
        df['timestamp'] = pd.Timestamp.now()

    # --- HANDLE COMMENT_COUNT WITH MEDIAN IMPUTATION ---
    logger.info("Extracting comment_count as primary engagement feature...")

    if 'comment_count' in df.columns:
        # Convert to numeric and use MEDIAN imputation (not 0)
        df['comment_count'] = pd.to_numeric(df['comment_count'], errors='coerce')
        median_comments = df['comment_count'].median()

        if pd.isna(median_comments):
            logger.warning("All comment_count values are NaN. Using fallback value of 0.")
            median_comments = 0.0

        missing_count = df['comment_count'].isna().sum()
        df['comment_count'] = df['comment_count'].fillna(median_comments)

        if missing_count > 0:
            logger.info(f"Imputed {missing_count} missing comment_count values with median: {median_comments:.2f}")
    else:
        logger.error("❌ CRITICAL: 'comment_count' column is MISSING from MongoDB data!")
        df['comment_count'] = 0.0

    # Log-transform comment_count to handle skewed distribution
    df['log_comment_count'] = np.log1p(df['comment_count'])

    # --- USE EXISTING ENGAGEMENT_SCORE AS TARGET ---
    if 'engagement_score' not in df.columns:
        logger.error("❌ CRITICAL: 'engagement_score' column is MISSING from MongoDB data!")
        raise ValueError("engagement_score is required but missing from MongoDB collection.")

    # Ensure engagement_score is numeric
    df['engagement_score'] = pd.to_numeric(df['engagement_score'], errors='coerce')

    # Drop rows with missing engagement_score (can't train without target)
    initial_len = len(df)
    df = df.dropna(subset=['engagement_score'])
    dropped = initial_len - len(df)

    if dropped > 0:
        logger.warning(f"Dropped {dropped} rows with missing engagement_score.")

    logger.info(f"✅ Standardization complete. Output shape: {df.shape}")
    logger.info(f"✅ Features ready: comment_count, log_comment_count, sentiment_polarity, temporal features")
    logger.info(f"✅ Target variable: engagement_score (using existing MongoDB values)")

    return df
