import pandas as pd
import numpy as np
import logging
import joblib
import os
from sklearn.preprocessing import MinMaxScaler
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

logger = logging.getLogger(__name__)

# Initialize VADER and UPDATE LEXICON with Gen Z Internet Slang
analyzer = SentimentIntensityAnalyzer()

# CRITICAL: VADER was built for general social media and penalizes viral slang
# Manually boost sentiment scores for 100+ trending internet culture keywords
VIRAL_SLANG_LEXICON = {
    # Tier 1: Peak Viral Hype (3.0 - Maximum Positive)
    'gyat': 3.0, 'sheesh': 3.0, 'bussin': 3.0, 'fire': 3.0, 'goat': 3.0,
    'sigma': 3.0, 'alpha': 3.0, 'iconic': 3.0, 'legend': 3.0, 'god': 3.0,

    # Tier 2: Strong Positive Engagement (2.5)
    'insane': 2.5, 'crazy': 2.5, 'wild': 2.5, 'unreal': 2.5, 'unhinged': 2.5,
    'banger': 2.5, 'slaps': 2.5, 'hits': 2.5, 'goes': 2.5, 'rizz': 2.5,
    'w': 2.5, 'dub': 2.5, 'based': 2.5, 'chad': 2.5, 'gigachad': 2.5,

    # Tier 3: Moderate Hype (2.0)
    'lit': 2.0, 'slay': 2.0, 'vibe': 2.0, 'vibes': 2.0, 'valid': 2.0,
    'bet': 2.0, 'facts': 2.0, 'real': 2.0, 'fr': 2.0, 'fax': 2.0,
    'lowkey': 2.0, 'highkey': 2.0, 'ngl': 2.0, 'tbh': 2.0, 'fr fr': 2.0,

    # Tier 4: Engagement Markers (1.8)
    'pov': 1.8, 'imagine': 1.8, 'when': 1.8, 'caught': 1.8, 'exposed': 1.8,
    'omg': 1.8, 'omfg': 1.8, 'bruh': 1.8, 'bro': 1.8, 'sis': 1.8,
    'yall': 1.8, 'fam': 1.8, 'gang': 1.8, 'squad': 1.8, 'homie': 1.8,

    # Tier 5: Affirmation/Excitement (1.5)
    'yup': 1.5, 'yep': 1.5, 'yeah': 1.5, 'yessir': 1.5, 'period': 1.5,
    'periodt': 1.5, 'purr': 1.5, 'slay': 1.5, 'werk': 1.5, 'werk it': 1.5,
    'ate': 1.5, 'devoured': 1.5, 'destroyed': 1.5, 'demolished': 1.5,

    # Tier 6: Modern Slang Terms (1.5)
    'finna': 1.5, 'gonna': 1.5, 'wanna': 1.5, 'gotta': 1.5, 'imma': 1.5,
    'boutta': 1.5, 'tryna': 1.5, 'sus': 1.5, 'cap': 1.5, 'no cap': 2.5,
    'lowkey': 1.5, 'deadass': 1.5, 'for real': 1.8, 'on god': 2.0,

    # Tier 7: Energy Words (1.3)
    'hype': 1.3, 'hyped': 1.3, 'pumped': 1.3, 'stoked': 1.3, 'amped': 1.3,
    'fire emoji': 2.0, 'skull emoji': 1.8, 'crying emoji': 1.5,

    # Negative Slang (Negative scores for balance)
    'cooked': -1.5, 'rip': -1.0, 'oof': -1.0, 'cringe': -2.0, 'mid': -1.5,
    'ratio': -1.0, 'cancelled': -2.0, 'flop': -2.0, 'l': -2.0, 'took an l': -2.5,

    # Neutral-Positive Clickbait (Slight positive for engagement)
    'wait': 1.0, 'omg wait': 1.8, 'actually': 1.0, 'literally': 1.2,
    'tbh': 1.2, 'ngl': 1.5, 'icl': 1.3, 'imo': 1.0, 'imho': 1.0
}

# Update VADER's lexicon with internet slang
analyzer.lexicon.update(VIRAL_SLANG_LEXICON)
logger.info(f"✅ VADER lexicon updated with {len(VIRAL_SLANG_LEXICON)} viral slang terms for Gen Z sentiment accuracy")

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

    # --- ADVANCED NLP FEATURES: Extract stylistic signals from text ---
    logger.info("Extracting advanced NLP features (uppercase_ratio, exclamation_count, question_count)...")

    def calc_uppercase_ratio(text: str) -> float:
        """Calculate percentage of uppercase characters (indicates shouting/excitement)."""
        if not isinstance(text, str) or not text:
            return 0.0
        alpha_chars = [c for c in text if c.isalpha()]
        if not alpha_chars:
            return 0.0
        return sum(1 for c in alpha_chars if c.isupper()) / len(alpha_chars)

    df['uppercase_ratio'] = df['text'].apply(calc_uppercase_ratio)
    df['exclamation_count'] = df['text'].str.count('!').fillna(0)
    df['question_count'] = df['text'].str.count(r'\?').fillna(0)

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
    logger.info(f"✅ Features ready: sentiment_polarity, uppercase_ratio, exclamation_count, question_count, temporal features")
    logger.info(f"✅ Target variable: engagement_score (using existing MongoDB values)")

    return df
