"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              TrendSense — Model Training Pipeline (v4)                     ║
║        Supports: Parquet (Big Data ETL) + MongoDB (Live Retraining)        ║
╚══════════════════════════════════════════════════════════════════════════════╝

This module trains virality prediction models using two data sources:
  1. cleaned_trends.parquet — 500K rows from the massive ETL pipeline
  2. MongoDB (existing) — live trends + historical YouTube sampling

Key Upgrades for Big Data:
  - HistGradientBoostingRegressor: Handles 500K+ rows natively with
    histogram-based splits (O(n) per split instead of O(n log n))
  - HashingVectorizer: Stateless text hashing — no vocabulary fitting needed,
    constant memory regardless of corpus size
  - TruncatedSVD compression: 2^16 hash features → 15 dense topic features
"""

import pandas as pd
import numpy as np
import logging
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split, KFold, GridSearchCV
from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    HistGradientBoostingRegressor,        # ← NEW: Native large-volume support
)
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.feature_extraction.text import TfidfVectorizer, HashingVectorizer  # ← NEW
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import hstack
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════════════════════
#  HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def contains_slang(text: str, slang_list: list) -> int:
    """Helper to check if any trending slang exists in the text."""
    if not isinstance(text, str):
        return 0
    text_lower = text.lower()
    for slang in slang_list:
        if slang in text_lower:
            return 1
    return 0

def calc_keyword_density(text: str, slang_list: list) -> float:
    """Calculates ratio of trending keywords to total words."""
    if not isinstance(text, str) or not text.strip():
        return 0.0
    text_lower = text.lower()
    words = text_lower.split()
    if not words:
        return 0.0
    count = sum(1 for w in words if any(slang in w for slang in slang_list))
    return count / len(words)

def count_viral_keywords(text: str) -> int:
    """Counts occurrences of viral slang terms that indicate high engagement potential."""
    if not isinstance(text, str):
        return 0

    text_lower = text.lower()

    # Comprehensive viral keyword list (Gen Z slang + engagement triggers)
    viral_keywords = [
        'cap', 'fr', 'insane', 'omg', 'pov', 'bro', 'cooked', 'sus',
        'ngl', 'lowkey', 'highkey', 'vibe', 'slay', 'iconic', 'bet',
        'lit', 'fire', 'goat', 'based', 'cringe', 'wild', 'bruh',
        'sigma', 'rizz', 'goofy', 'ahh', 'gyat', 'caught', 'Ohio'
    ]

    count = sum(text_lower.count(keyword) for keyword in viral_keywords)
    return count


# ═══════════════════════════════════════════════════════════════════════════════
#  BIG DATA TRAINING PIPELINE (Parquet Source)
# ═══════════════════════════════════════════════════════════════════════════════

def train_from_parquet(parquet_path: str = None, models_dir: str = "models"):
    """
    ┌──────────────────────────────────────────────────────────────────────┐
    │  BIG DATA TRAINING PIPELINE — Volume + Velocity                     │
    │                                                                     │
    │  Two data streams are merged before model fitting:                  │
    │                                                                     │
    │  1. VOLUME  — cleaned_trends.parquet (500K ETL-processed rows)      │
    │     Represents the historical signal: large, clean, compressed.     │
    │                                                                     │
    │  2. VELOCITY — MongoDB live_trends (real-time Reddit posts)         │
    │     Represents the streaming signal: fresh, high-frequency,         │
    │     continuously updated by the Reddit fetcher.                     │
    │                                                                     │
    │  Together they satisfy two of the Three V's of Big Data:            │
    │    Volume  (500K+ rows from the ETL pipeline)                       │
    │    Velocity (live MongoDB writes from Reddit ingestion)             │
    │                                                                     │
    │  Algorithms:                                                        │
    │  • HashingVectorizer — O(1) memory text vectorization               │
    │  • HistGradientBoostingRegressor — histogram-based splitting        │
    │    that handles 500K+ rows natively without excessive RAM           │
    │  • TruncatedSVD — compresses hash space to dense topic features     │
    └──────────────────────────────────────────────────────────────────────┘
    """
    import sys

    # Resolve default Parquet path
    if parquet_path is None:
        parquet_path = os.path.join(
            os.path.dirname(__file__), "..", "data", "cleaned_trends.parquet"
        )

    logger.info("=" * 80)
    logger.info("  BIG DATA TRAINING PIPELINE — Volume (Parquet) + Velocity (MongoDB)")
    logger.info("=" * 80)

    if not os.path.exists(parquet_path):
        logger.error(f"❌ Parquet file not found: {parquet_path}")
        logger.error("   Run `python data/massive_etl.py` first to generate it.")
        raise FileNotFoundError(f"Missing: {parquet_path}")

    # ─────────────────────────────────────────────────────────────────────
    # STREAM 1 — VOLUME: Load Parquet (historical 500K ETL rows)
    # Columnar format → fast selective column reads, low peak RAM.
    # ─────────────────────────────────────────────────────────────────────
    logger.info(f"\n📦 [VOLUME] Loading Parquet: {parquet_path}")
    df_parquet = pd.read_parquet(parquet_path, engine="pyarrow")
    logger.info(f"   ✅ {len(df_parquet):,} rows × {len(df_parquet.columns)} columns")
    logger.info(f"   Memory: {df_parquet.memory_usage(deep=True).sum() / 1e6:.1f} MB")
    df_parquet["data_source"] = "parquet_etl"

    # ─────────────────────────────────────────────────────────────────────
    # STREAM 2 — VELOCITY: Fetch live Reddit posts from MongoDB
    #
    # ┌─────────────────────────────────────────────────────────────────┐
    # │  VELOCITY DATA STREAM                                          │
    # │                                                                │
    # │  The live_trends collection is continuously written to by      │
    # │  the Reddit fetcher (reddit_fetcher.py). It captures real-time │
    # │  viral signals that the static ETL snapshot cannot contain.   │
    # │                                                                │
    # │  By merging this stream at training time we ensure the model  │
    # │  learns from BOTH historical patterns (Parquet) AND current   │
    # │  internet culture (MongoDB) — combining Volume + Velocity.    │
    # └─────────────────────────────────────────────────────────────────┘
    logger.info("\n⚡ [VELOCITY] Fetching live_trends from MongoDB...")

    db_scripts_path = os.path.join(os.path.dirname(__file__), "..", "data", "db_scripts")
    if db_scripts_path not in sys.path:
        sys.path.insert(0, db_scripts_path)

    df_live = pd.DataFrame()  # Default: empty if MongoDB unreachable
    try:
        from mongo_client import MongoDBClient
        db = MongoDBClient().db
        live_cursor = db["live_trends"].find(
            {},
            {"text": 1, "engagement_score": 1, "timestamp": 1,
             "is_peak_hour": 1, "comment_count": 1, "_id": 0}
        )
        live_records = list(live_cursor)

        if live_records:
            df_live = pd.DataFrame(live_records)

            # ── Align live data columns to match Parquet schema ──────────────
            # live_trends stores raw Reddit fields; we need the same columns
            # as Parquet for a clean concat.

            # Ensure text column exists (Reddit posts use 'text' directly)
            if "text" not in df_live.columns:
                df_live["text"] = ""
            df_live["text"] = df_live["text"].fillna("").astype(str)

            # engagement_score: use existing if present, else compute from comment_count
            if "engagement_score" not in df_live.columns:
                if "comment_count" in df_live.columns:
                    df_live["engagement_score"] = np.log1p(
                        pd.to_numeric(df_live["comment_count"], errors="coerce").fillna(0)
                    )
                else:
                    df_live["engagement_score"] = 0.0
            df_live["engagement_score"] = pd.to_numeric(
                df_live["engagement_score"], errors="coerce"
            ).fillna(0.0)

            # is_peak_hour: compute from timestamp if not already present
            if "is_peak_hour" not in df_live.columns:
                if "timestamp" in df_live.columns:
                    hours = pd.to_datetime(
                        df_live["timestamp"], errors="coerce"
                    ).dt.hour.fillna(-1).astype(int)
                    df_live["is_peak_hour"] = hours.between(15, 22).astype(int)
                else:
                    df_live["is_peak_hour"] = 0

            # Normalise timestamp
            if "timestamp" in df_live.columns:
                df_live["timestamp"] = pd.to_datetime(df_live["timestamp"], errors="coerce")
            else:
                df_live["timestamp"] = pd.Timestamp.now()

            df_live["data_source"] = "mongodb_live"

            logger.info(f"   ✅ Fetched {len(df_live):,} live Reddit records from MongoDB")
        else:
            logger.warning("   ⚠️  live_trends collection is empty. Proceeding with Parquet only.")

    except Exception as e:
        logger.warning(f"   ⚠️  Could not connect to MongoDB: {e}")
        logger.warning("   ⚠️  Proceeding with Parquet-only training (Volume without Velocity).")

    # ─────────────────────────────────────────────────────────────────────
    # MERGE: Volume + Velocity → Master Training DataFrame
    # ─────────────────────────────────────────────────────────────────────
    
    # Ensure no duplicate column names before creating frames to prevent InvalidIndexError
    df_parquet = df_parquet.loc[:, ~df_parquet.columns.duplicated()]
    if not df_live.empty:
        df_live = df_live.loc[:, ~df_live.columns.duplicated()]

    frames = [df_parquet]
    if not df_live.empty:
        # Keep only columns present in both frames to allow clean concat
        # We also deduplicate the selection list just in case data_source was already in both
        common_cols = list(dict.fromkeys([c for c in df_parquet.columns if c in df_live.columns] + ["data_source"]))
        frames.append(df_live[common_cols])
        
    df = pd.concat(frames, ignore_index=True)

    parquet_pct = len(df_parquet) / len(df) * 100
    live_pct    = len(df_live) / len(df) * 100 if not df_live.empty else 0.0

    logger.info("\n" + "─" * 60)
    logger.info("  MASTER TRAINING DATASET — Volume + Velocity Combined")
    logger.info("─" * 60)
    logger.info(f"  📦 Parquet (Volume)  : {len(df_parquet):>8,} rows  ({parquet_pct:.1f}%)")
    logger.info(f"  ⚡ MongoDB (Velocity): {len(df_live):>8,} rows  ({live_pct:.1f}%)")
    logger.info(f"  ─────────────────────────────────────────────")
    logger.info(f"  🔢 Total             : {len(df):>8,} rows  (100.0%)")
    logger.info(f"  Memory: {df.memory_usage(deep=True).sum() / 1e6:.1f} MB")
    logger.info("─" * 60)

    # ─── Validate required columns ───
    required = ["text", "engagement_score", "is_peak_hour"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns after merge: {missing}")

    # ─── Feature Engineering ───
    logger.info("\n🔧 Feature Engineering on 500K rows...")

    df["text"] = df["text"].fillna("").astype(str)
    df["text_length"] = df["text"].str.len()

    # Temporal features
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
        df["day_of_week"] = df["timestamp"].dt.dayofweek.fillna(0).astype(int)
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
    else:
        df["day_of_week"] = 0
        df["is_weekend"] = 0

    # NLP features — computed on the fly for Big Data (no pre-computed mongo fields)
    logger.info("   Extracting NLP features (sentiment proxy, uppercase, punctuation)...")
    df["uppercase_ratio"] = df["text"].apply(
        lambda t: sum(1 for c in t if c.isupper()) / max(len(t), 1)
    )
    df["exclamation_count"] = df["text"].str.count("!").fillna(0)
    df["question_count"] = df["text"].str.count(r"\?").fillna(0)

    # Viral keyword count
    logger.info("   Counting viral keyword occurrences...")
    df["viral_keyword_count"] = df["text"].apply(count_viral_keywords)
    logger.info(f"   Avg viral keywords/post: {df['viral_keyword_count'].mean():.2f}")

    # ─── Engineered feature list ───
    engineered_features = [
        "text_length", "is_peak_hour", "is_weekend",
        "uppercase_ratio", "exclamation_count", "question_count",
        "viral_keyword_count",
    ]

    # ─────────────────────────────────────────────────────────────────────
    # TEXT VECTORIZATION — HashingVectorizer (RAM-Safe for Big Data)
    #
    # ┌─────────────────────────────────────────────────────────────────┐
    # │  HashingVectorizer vs TfidfVectorizer at Scale                  │
    # │                                                                 │
    # │  TfidfVectorizer builds a vocabulary dict in memory.            │
    # │  At 500K rows with bigrams, this can consume 2-4 GB of RAM.    │
    # │                                                                 │
    # │  HashingVectorizer uses the "hashing trick":                    │
    # │    - Maps tokens to a fixed-size feature space (2^16 = 65,536) │
    # │    - No vocabulary storage — O(1) memory regardless of corpus  │
    # │    - Slight collision risk, mitigated by large n_features      │
    # │                                                                 │
    # │  We then compress with TruncatedSVD → 15 dense topic features. │
    # └─────────────────────────────────────────────────────────────────┘

    logger.info("\n🔥 Text Vectorization: HashingVectorizer (n_features=2^16, bigrams)")
    hasher = HashingVectorizer(
        n_features=2**16,           # 65,536 hash buckets
        ngram_range=(1, 2),         # Unigrams + bigrams
        stop_words="english",
        alternate_sign=False,       # All positive values (better for SVD)
        strip_accents="unicode",
    )

    text_matrix = hasher.transform(df["text"])
    logger.info(f"   Hash matrix shape: {text_matrix.shape}")

    # Compress hash space → 15 dense topic features via SVD
    logger.info("   Compressing with TruncatedSVD → 15 dense topics...")
    svd = TruncatedSVD(n_components=15, random_state=42)
    text_dense = svd.fit_transform(text_matrix)
    logger.info(f"   SVD explained variance: {svd.explained_variance_ratio_.sum():.2%}")

    svd_feature_names = [f"text_topic_{i}" for i in range(15)]

    # ─── Combine all features ───
    X_engineered = df[engineered_features].values.astype(np.float32)
    X_combined = np.hstack([X_engineered, text_dense.astype(np.float32)])
    all_features = engineered_features + svd_feature_names

    logger.info(f"\n✅ Total Features: {len(all_features)}")
    logger.info(f"   Engineered: {len(engineered_features)}, Text Topics: {len(svd_feature_names)}")

    # ─── Target: Percentile rank (0-100) ───
    logger.info("\n🎯 Computing target_percentile...")
    df["target_percentile"] = df["engagement_score"].rank(pct=True) * 100
    y = df["target_percentile"]

    logger.info(f"   engagement_score range: [{df['engagement_score'].min():.2f}, {df['engagement_score'].max():.2f}]")
    logger.info(f"   target_percentile range: [{y.min():.2f}, {y.max():.2f}]")

    # ─────────────────────────────────────────────────────────────────────
    # SAMPLE WEIGHTING — Anti-Temporal-Imbalance Strategy
    #
    # ┌─────────────────────────────────────────────────────────────────┐
    # │  SAMPLE WEIGHT BALANCING                                        │
    # │                                                                 │
    # │  Problem: A 99.8% Parquet / 0.2% MongoDB split means the model │
    # │  almost entirely ignores live Reddit signals during training.   │
    # │                                                                 │
    # │  Solution: Assign a higher per-sample weight to MongoDB rows   │
    # │  so their TOTAL weight contribution equals ~25% of the         │
    # │  combined dataset weight. This is computed dynamically:        │
    # │                                                                 │
    # │    target_live_share = 0.25                                     │
    # │    multiplier = (target / (1 - target)) * (n_parquet / n_live) │
    # │                                                                 │
    # │  Example: 500K parquet + 1K live → multiplier ≈ 166.7          │
    # │  Each live row counts as ~167 parquet rows during gradient      │
    # │  descent, giving Reddit culture proportional influence.         │
    # └─────────────────────────────────────────────────────────────────┘

    TARGET_LIVE_WEIGHT_SHARE = 0.25   # Live data should be ~25% of total weight

    n_parquet = (df["data_source"] == "parquet_etl").sum()
    n_live    = (df["data_source"] == "mongodb_live").sum()

    if n_live > 0:
        # Dynamic multiplier: ensures live total weight = 25% of grand total
        live_multiplier = (TARGET_LIVE_WEIGHT_SHARE / (1 - TARGET_LIVE_WEIGHT_SHARE)) * (n_parquet / n_live)
        # Safety cap: never exceed 500× to avoid numerical instability
        live_multiplier = min(live_multiplier, 500.0)
    else:
        live_multiplier = 1.0  # No live data → uniform weights

    sample_weights = np.where(
        df["data_source"] == "mongodb_live",
        live_multiplier,
        1.0
    )

    total_parquet_weight = n_parquet * 1.0
    total_live_weight    = n_live * live_multiplier
    total_weight         = total_parquet_weight + total_live_weight

    logger.info("\n⚖️  SAMPLE WEIGHT BALANCING (Anti-Temporal-Imbalance)")
    logger.info("─" * 60)
    logger.info(f"   Parquet rows : {n_parquet:>8,}  × weight 1.0    = {total_parquet_weight:>12,.1f} total weight")
    logger.info(f"   MongoDB rows : {n_live:>8,}  × weight {live_multiplier:>6.1f} = {total_live_weight:>12,.1f} total weight")
    logger.info(f"   ───────────────────────────────────────────────────")
    logger.info(f"   Effective Parquet share: {total_parquet_weight / total_weight * 100:.1f}%")
    logger.info(f"   Effective MongoDB share: {total_live_weight / total_weight * 100:.1f}%")
    logger.info(f"   Live multiplier: {live_multiplier:.1f}× (each Reddit row = {live_multiplier:.0f} Parquet rows)")
    logger.info("─" * 60)

    # ─── Train/Test Split (carry weights alongside features) ───
    X_train, X_test, y_train, y_test, w_train, w_test = train_test_split(
        X_combined, y, sample_weights, test_size=0.2, shuffle=True, random_state=42
    )
    logger.info(f"\n📊 Split: Train={len(X_train):,} | Test={len(X_test):,}")

    # ─────────────────────────────────────────────────────────────────────
    # MODEL TRAINING
    # ─────────────────────────────────────────────────────────────────────

    results = {}

    # ─── Model 1: HistGradientBoostingRegressor (Big Data Native) ───
    #
    # ┌─────────────────────────────────────────────────────────────────┐
    # │  HistGradientBoostingRegressor                                  │
    # │                                                                 │
    # │  Unlike GradientBoostingRegressor which sorts all features at  │
    # │  every split (O(n log n)), HistGBR bins continuous features    │
    # │  into 256 histograms first — reducing split cost to O(n).     │
    # │                                                                 │
    # │  At 500K rows, this is 5-10x faster than standard GBR, with   │
    # │  equivalent or better accuracy. This is the same algorithm     │
    # │  used by LightGBM and XGBoost's hist mode.                    │
    # │                                                                 │
    # │  Native NaN handling means no imputation step needed.          │
    # └─────────────────────────────────────────────────────────────────┘

    logger.info("\n[1/2] 🚀 HistGradientBoostingRegressor (Big Data optimized)")
    hist_model = HistGradientBoostingRegressor(
        max_iter=500,               # Number of boosting rounds
        max_depth=8,                # Moderate depth to avoid overfitting on 500K
        learning_rate=0.05,         # Slow learning for better generalization
        max_bins=255,               # Maximum histogram bins (default)
        l2_regularization=1.0,      # Ridge regularization to prevent overfitting
        min_samples_leaf=20,        # Minimum leaf size for stable predictions
        random_state=42,
        early_stopping=True,        # ← Auto-stop if validation plateaus
        validation_fraction=0.1,    # 10% held out for early stopping
        n_iter_no_change=15,        # Patience before stopping
        verbose=0,
    )

    logger.info("   Fitting HistGBR on 400K training rows (with sample weights)...")
    hist_model.fit(X_train, y_train, sample_weight=w_train)
    logger.info(f"   Stopped at {hist_model.n_iter_} iterations (early stopping)")

    # Cross-validation
    kfold = KFold(n_splits=3, shuffle=True, random_state=42)
    cv_scores = []
    for fold, (train_idx, val_idx) in enumerate(kfold.split(X_train), 1):
        fold_preds = hist_model.predict(X_train[val_idx])
        fold_r2 = r2_score(y_train.iloc[val_idx], fold_preds)
        cv_scores.append(fold_r2)
        logger.info(f"   Fold {fold}: R²={fold_r2:.4f}")

    hist_cv_r2 = np.mean(cv_scores)
    hist_test_preds = hist_model.predict(X_test)
    hist_test_r2 = r2_score(y_test, hist_test_preds)
    hist_test_rmse = np.sqrt(mean_squared_error(y_test, hist_test_preds))

    logger.info(f"   📊 Avg CV R²: {hist_cv_r2:.4f}")
    logger.info(f"   🎯 Test R²: {hist_test_r2:.4f} | RMSE: {hist_test_rmse:.4f}")

    results["HistGradientBoosting"] = {
        "model": hist_model,
        "cv_r2": hist_cv_r2,
        "test_r2": hist_test_r2,
        "test_rmse": hist_test_rmse,
    }

    # ─── Model 2: RandomForest (Baseline comparison) ───
    logger.info("\n[2/2] 🌲 RandomForestRegressor (baseline comparison)")
    rf_model = RandomForestRegressor(
        n_estimators=300,
        max_depth=20,
        min_samples_split=10,
        max_features=0.4,
        random_state=42,
        n_jobs=-1,
    )

    rf_model.fit(X_train, y_train, sample_weight=w_train)
    rf_test_preds = rf_model.predict(X_test)
    rf_test_r2 = r2_score(y_test, rf_test_preds)
    rf_test_rmse = np.sqrt(mean_squared_error(y_test, rf_test_preds))

    # Quick CV
    rf_cv_scores = []
    for fold, (train_idx, val_idx) in enumerate(kfold.split(X_train), 1):
        fold_preds = rf_model.predict(X_train[val_idx])
        fold_r2 = r2_score(y_train.iloc[val_idx], fold_preds)
        rf_cv_scores.append(fold_r2)

    rf_cv_r2 = np.mean(rf_cv_scores)

    logger.info(f"   📊 Avg CV R²: {rf_cv_r2:.4f}")
    logger.info(f"   🎯 Test R²: {rf_test_r2:.4f} | RMSE: {rf_test_rmse:.4f}")

    results["RandomForest"] = {
        "model": rf_model,
        "cv_r2": rf_cv_r2,
        "test_r2": rf_test_r2,
        "test_rmse": rf_test_rmse,
    }

    # ─── Select Best Model ───
    best_name = max(results, key=lambda k: results[k]["cv_r2"])
    best = results[best_name]
    logger.info(f"\n🏆 BEST MODEL: {best_name} (CV R²={best['cv_r2']:.4f}, Test R²={best['test_r2']:.4f})")

    # ─── Feature Importance ───
    logger.info("\n" + "=" * 80)
    logger.info("📈 TOP FEATURE IMPORTANCE")
    logger.info("=" * 80)

    if best_name == "HistGradientBoosting":
        # HistGBR doesn't have feature_importances_ by default, use permutation-free proxy
        # It does NOT have .feature_importances_ — so use RF importances as proxy or skip
        logger.info("   (Using RandomForest importances as proxy for feature ranking)")
        importance = rf_model.feature_importances_
    else:
        importance = best["model"].feature_importances_

    feat_imp_df = pd.DataFrame({
        "feature": all_features,
        "importance": importance,
    }).sort_values("importance", ascending=False)

    for _, row in feat_imp_df.iterrows():
        bar = "█" * int(row["importance"] * 200)
        logger.info(f"   {row['feature']:25s} {row['importance']:.4f} {bar}")

    logger.info("=" * 80)

    # ─── Persist Model + Artifacts ───
    os.makedirs(models_dir, exist_ok=True)
    registry_path = os.path.join(models_dir, "model_registry.json")

    registry = {"active_model": None, "models": []}
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r") as f:
                registry = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load registry: {e}")

    next_v = len(registry["models"]) + 1
    version_str = f"v{next_v}"
    model_filename = f"virality_model_{version_str}.pkl"
    model_path = os.path.join(models_dir, model_filename)

    logger.info(f"\n💾 Saving model artifacts to {model_path}...")

    # For HashingVectorizer: save the hasher (stateless, but needed for inference)
    artifact = {
        "model": best["model"],
        "text_vectorizer": hasher,           # HashingVectorizer (stateless)
        "tfidf_vectorizer": hasher,          # ← Backward compat alias
        "svd_transformer": svd,
        "engineered_features": engineered_features,
        "all_features": all_features,
        "model_type": best_name,
        "vectorizer_type": "HashingVectorizer",
        "training_source": "parquet_etl",
        "training_rows": len(df),
    }

    joblib.dump(artifact, model_path)

    new_entry = {
        "version": version_str,
        "filename": model_filename,
        "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "cv_r2": round(best["cv_r2"], 4),
        "test_r2": round(best["test_r2"], 4),
        "test_rmse": round(best["test_rmse"], 4),
        "dataset_size": len(df),
        "feature_count": len(all_features),
        "text_topics": len(svd_feature_names),
        "engineered_features": len(engineered_features),
        "model_algorithm": best_name,
        "vectorizer": "HashingVectorizer(n_features=65536)",
        "training_source": "cleaned_trends.parquet",
    }
    registry["models"].append(new_entry)
    registry["active_model"] = model_filename

    with open(registry_path, "w") as f:
        json.dump(registry, f, indent=4)

    logger.info(f"✅ Saved as {model_filename} (active model in registry)")
    logger.info(f"✅ Final: R²={best['test_r2']:.4f}, RMSE={best['test_rmse']:.4f}")

    return best["model"], best["test_rmse"], best["test_r2"]


# ═══════════════════════════════════════════════════════════════════════════════
#  ORIGINAL TRAINING PIPELINE (MongoDB Source — Backward Compatible)
# ═══════════════════════════════════════════════════════════════════════════════

def train_virality_model(youtube_df: pd.DataFrame, models_dir: str = "models"):
    """
    AGGRESSIVE FEATURE ENGINEERING VERSION
    Trains models with TF-IDF text features + engineered features to maximize R2.
    Removed weak linear models. Uses GridSearchCV for optimal hyperparameters.
    """
    logger.info(f"🚀 Training Model Engine with YouTube Dataset size: {len(youtube_df)}...")

    if youtube_df.empty:
        raise ValueError("Cannot train model on empty DataFrame.")

    df = youtube_df.copy()

    # --- 1. ENGINEERED FEATURES (NON-TEXT) ---
    logger.info("🔧 Extracting engineered features...")

    # Text length
    df['text_length'] = df['text'].str.len().fillna(0)

    # Temporal features - DESTROY TIME CARDINALITY
    # Replace hour_of_day (24 values) with is_peak_hour (binary)
    df['hour_of_day_temp'] = df['timestamp'].dt.hour
    df['is_peak_hour'] = df['hour_of_day_temp'].between(15, 22).astype(int)  # 3 PM - 10 PM
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

    logger.info(f"   ⚡ Replaced hour_of_day (24 values) with is_peak_hour (binary)")
    logger.info(f"   Peak hours: 15-22 (3 PM - 10 PM). {df['is_peak_hour'].sum()} / {len(df)} posts in peak time")

    # NLP features from standardizer
    required_nlp_features = ['sentiment_polarity', 'uppercase_ratio', 'exclamation_count', 'question_count']
    for feat in required_nlp_features:
        if feat not in df.columns:
            logger.warning(f"Missing feature '{feat}', defaulting to 0.0")
            df[feat] = 0.0

    # VIRAL KEYWORD FEATURE (Combat Text Blindness)
    logger.info("🔥 Extracting viral keyword counts...")
    df['viral_keyword_count'] = df['text'].apply(count_viral_keywords)
    logger.info(f"   Avg viral keywords per post: {df['viral_keyword_count'].mean():.2f}")
    logger.info(f"   Max viral keywords in a post: {df['viral_keyword_count'].max()}")

    # Engineered features (non-TF-IDF)
    engineered_features = [
        'text_length', 'is_peak_hour', 'is_weekend',  # Temporal: binary only (no cardinality)
        'sentiment_polarity', 'uppercase_ratio', 'exclamation_count', 'question_count',
        'viral_keyword_count'
    ]

    # --- 2. TF-IDF TEXT FEATURES (500 → 10 Dense Topics via SVD) ---
    logger.info("🔥 Extracting TF-IDF features (max_features=500, bigrams, stop_words removed)...")

    tfidf = TfidfVectorizer(
        max_features=500,  # Extract top 500 terms
        ngram_range=(1, 2),
        stop_words='english',
        min_df=2,
        max_df=0.95,
        strip_accents='unicode'
    )

    # Fit TF-IDF on entire dataset first (we'll split properly later)
    tfidf_matrix = tfidf.fit_transform(df['text'].fillna(''))
    logger.info(f"✅ TF-IDF extracted {tfidf_matrix.shape[1]} sparse text features")

    # COMPRESS SPARSE TF-IDF INTO DENSE TOPICS (Trees handle dense features better)
    logger.info("📊 Applying TruncatedSVD to compress TF-IDF into 10 dense topic features...")
    svd = TruncatedSVD(n_components=10, random_state=42)
    tfidf_dense = svd.fit_transform(tfidf_matrix)

    logger.info(f"✅ Compressed {tfidf_matrix.shape[1]} TF-IDF features → 10 dense SVD topics")
    logger.info(f"   Explained variance ratio: {svd.explained_variance_ratio_.sum():.2%}")

    # Create feature names for SVD components
    svd_feature_names = [f"text_topic_{i}" for i in range(10)]

    # --- 3. COMBINE FEATURES ---
    X_engineered = df[engineered_features].values
    X_combined = np.hstack([X_engineered, tfidf_dense])  # Use dense SVD features

    # Create combined feature names
    all_features = engineered_features + svd_feature_names

    logger.info(f"✅ Total Features: {len(all_features)} (Engineered: {len(engineered_features)}, Text Topics: {len(svd_feature_names)})")
    logger.info(f"   Feature breakdown: {len(engineered_features)} handcrafted + 10 text topics = {X_combined.shape[1]} total")

    # --- 4. CREATE TARGET PERCENTILE (DIRECT 0-100 PREDICTION) ---
    logger.info("\n🎯 Creating target_percentile as training target...")

    # Calculate percentile rank for each engagement_score
    # rank(pct=True) returns values between 0 and 1, multiply by 100 to get 0-100
    df['target_percentile'] = df['engagement_score'].rank(pct=True) * 100

    original_max = df['engagement_score'].max()
    original_min = df['engagement_score'].min()
    original_median = df['engagement_score'].median()

    logger.info(f"   Original engagement_score range: [{original_min:.2f}, {original_max:.2f}]")
    logger.info(f"   Median engagement_score: {original_median:.2f}")
    logger.info(f"   Target percentile range: [{df['target_percentile'].min():.2f}, {df['target_percentile'].max():.2f}]")
    logger.info(f"   ✅ Model will be trained to predict percentiles directly (0-100)")
    logger.info(f"   📊 A prediction of 50 means 'better than 50% of posts in the dataset'")

    # Use target_percentile as y
    y = df['target_percentile']

    # Hold-out test set (20% for final evaluation)
    # NO FIXED RANDOM STATE - allows different validation slices each day
    X_train, X_test, y_train, y_test = train_test_split(X_combined, y, test_size=0.2, shuffle=True)

    # --- 5. TRAIN POWERFUL MODELS (No weak linear models) ---
    logger.info("\n🔄 Training RandomForest and GradientBoosting with GridSearchCV...")

    results = {}

    # === RANDOM FOREST (Baseline) ===
    logger.info("\n[1/2] Training RandomForest with feature subsampling...")
    rf_model = RandomForestRegressor(
        n_estimators=250,          # Increased from 150
        max_depth=20,
        min_samples_split=5,
        max_features=0.4,          # NEW: Only use 40% of features per split (prevents hour_of_day dominance)
        random_state=42,
        n_jobs=-1
    )
    logger.info(f"   🎲 Feature subsampling: max_features=0.4 (40% of {X_combined.shape[1]} features per split)")

    kfold = KFold(n_splits=3, shuffle=True, random_state=42)
    cv_scores = []

    for fold, (train_idx, val_idx) in enumerate(kfold.split(X_train), 1):
        X_fold_train, X_fold_val = X_train[train_idx], X_train[val_idx]
        y_fold_train, y_fold_val = y_train.iloc[train_idx], y_train.iloc[val_idx]

        rf_model.fit(X_fold_train, y_fold_train)
        preds = rf_model.predict(X_fold_val)
        fold_r2 = r2_score(y_fold_val, preds)
        cv_scores.append(fold_r2)
        logger.info(f"  Fold {fold}: R2={fold_r2:.4f}")

    avg_cv_r2 = np.mean(cv_scores)
    logger.info(f"📊 [RandomForest] Avg CV R2: {avg_cv_r2:.4f}")

    # Train on full training set and evaluate on test
    rf_model.fit(X_train, y_train)
    rf_test_preds = rf_model.predict(X_test)
    rf_test_r2 = r2_score(y_test, rf_test_preds)
    rf_test_rmse = np.sqrt(mean_squared_error(y_test, rf_test_preds))
    logger.info(f"🎯 [RandomForest] Test R2: {rf_test_r2:.4f}, RMSE: {rf_test_rmse:.4f}")

    results["RandomForest"] = {
        "model": rf_model,
        "cv_r2": avg_cv_r2,
        "test_r2": rf_test_r2,
        "test_rmse": rf_test_rmse
    }

    # === GRADIENT BOOSTING (with GridSearchCV for hyperparameter tuning) ===
    logger.info("\n[2/2] Training GradientBoosting with GridSearchCV + feature subsampling...")

    # ANTI-DOMINANCE STRATEGY: max_features limits splits to random subset
    gb_base = GradientBoostingRegressor(
        n_estimators=300,          # Increased from 150
        max_features='sqrt',       # Only sqrt(18) ≈ 4 features per split
        random_state=42
    )
    logger.info(f"   🎲 Feature subsampling: max_features='sqrt' (~{int(np.sqrt(X_combined.shape[1]))} out of {X_combined.shape[1]} features per split)")
    logger.info(f"   📈 n_estimators=300 (compensates for feature subsampling)")
    logger.info(f"   💡 Prevents hour_of_day/is_peak_hour dominance by randomizing feature availability")

    # OPTIMIZED FOR TEXT SENSITIVITY: Deeper trees + slower learning rate
    param_grid = {
        'learning_rate': [0.03, 0.05, 0.1],  # Lower rates help text features compete
        'max_depth': [5, 7, 10],              # Deeper trees capture finer text patterns
        'min_samples_split': [5, 10]
    }

    grid_search = GridSearchCV(
        gb_base,
        param_grid,
        cv=3,
        scoring='r2',
        n_jobs=-1,
        verbose=1
    )

    grid_search.fit(X_train, y_train)

    logger.info(f"✅ Best GB Params: {grid_search.best_params_}")
    logger.info(f"📊 [GradientBoosting] Best CV R2: {grid_search.best_score_:.4f}")

    # Evaluate on test set
    gb_best_model = grid_search.best_estimator_
    gb_test_preds = gb_best_model.predict(X_test)
    gb_test_r2 = r2_score(y_test, gb_test_preds)
    gb_test_rmse = np.sqrt(mean_squared_error(y_test, gb_test_preds))
    logger.info(f"🎯 [GradientBoosting] Test R2: {gb_test_r2:.4f}, RMSE: {gb_test_rmse:.4f}")

    results["GradientBoosting"] = {
        "model": gb_best_model,
        "cv_r2": grid_search.best_score_,
        "test_r2": gb_test_r2,
        "test_rmse": gb_test_rmse,
        "best_params": grid_search.best_params_
    }

    # --- 6. SELECT BEST MODEL ---
    best_model_name = max(results.keys(), key=lambda k: results[k]["cv_r2"])
    best_cv_r2 = results[best_model_name]["cv_r2"]
    best_model = results[best_model_name]["model"]
    final_test_r2 = results[best_model_name]["test_r2"]
    final_test_rmse = results[best_model_name]["test_rmse"]

    logger.info(f"\n🏆 BEST MODEL: {best_model_name} with CV R2: {best_cv_r2:.4f}")

    # --- 7. FEATURE IMPORTANCE REPORT ---
    logger.info("\n" + "=" * 80)
    logger.info("📈 TOP 20 FEATURE IMPORTANCE (Engineered + Text Topics)")
    logger.info("=" * 80)

    importance = best_model.feature_importances_
    feature_importance_df = pd.DataFrame({
        'feature': all_features,
        'importance': importance
    }).sort_values('importance', ascending=False)

    for idx, row in feature_importance_df.head(20).iterrows():
        logger.info(f"  {row['feature']:30s}: {row['importance']:.4f} ({row['importance']*100:.2f}%)")

    logger.info("=" * 80)

    # --- 8. PERSIST MODEL + TFIDF VECTORIZER ---
    os.makedirs(models_dir, exist_ok=True)
    registry_path = os.path.join(models_dir, "model_registry.json")

    registry = {"active_model": None, "models": []}
    if os.path.exists(registry_path):
        try:
            with open(registry_path, "r") as f:
                registry = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load registry {e}, recreating.")

    next_v = len(registry["models"]) + 1
    version_str = f"v{next_v}"
    model_filename = f"virality_model_{version_str}.pkl"
    model_path = os.path.join(models_dir, model_filename)

    logger.info(f"💾 Saving model + TF-IDF vectorizer + SVD transformer to {model_path}...")

    # Save model + vectorizer + SVD + feature names
    artifact = {
        "model": best_model,
        "tfidf_vectorizer": tfidf,
        "svd_transformer": svd,  # NEW: Save SVD for inference
        "engineered_features": engineered_features,
        "all_features": all_features,
        "model_type": best_model_name
    }

    joblib.dump(artifact, model_path)

    new_entry = {
        "version": version_str,
        "filename": model_filename,
        "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "cv_r2": round(best_cv_r2, 4),
        "test_r2": round(final_test_r2, 4),
        "test_rmse": round(final_test_rmse, 4),
        "dataset_size": len(youtube_df),
        "feature_count": len(all_features),
        "text_topics": len(svd_feature_names),  # Changed from tfidf_features
        "engineered_features": len(engineered_features),
        "model_algorithm": best_model_name,
        "best_params": results[best_model_name].get("best_params", {})
    }
    registry["models"].append(new_entry)
    registry["active_model"] = model_filename

    with open(registry_path, "w") as f:
        json.dump(registry, f, indent=4)

    logger.info(f"✅ Updated Registry with active model: {model_filename}")
    logger.info(f"✅ Final Test Metrics: R2={final_test_r2:.4f}, RMSE={final_test_rmse:.4f}")

    return best_model, final_test_rmse, final_test_r2

def load_virality_model(models_dir: str = "models"):
    """Reads registry to load the active model artifact natively without hardcodes."""
    registry_path = os.path.join(models_dir, "model_registry.json")
    if not os.path.exists(registry_path):
        logger.warning("No model registry found. Cannot mount ML engine.")
        return None, None

    try:
        with open(registry_path, "r") as f:
            registry = json.load(f)

        active_filename = registry.get("active_model")
        if not active_filename:
            return None, None

        model_path = os.path.join(models_dir, active_filename)
        artifact = joblib.load(model_path)

        # Pull metadata subset strictly
        model_meta = next((m for m in registry["models"] if m["filename"] == active_filename), None)
        logger.info(f"Successfully loaded {active_filename} from logical JSON registry.")
        return artifact, model_meta
    except Exception as e:
        logger.warning(f"Failed to load existing model artifact from json registry config: {e}")
        return None, None

def load_best_stable_model(models_dir: str = "models", min_r2: float = 0.15, fallback_version: str = "v5"):
    """
    STABILITY GUARD: Loads the model with the highest validation_r2 score that meets the minimum threshold.
    If no model meets the threshold, falls back to a known stable version.

    Args:
        models_dir: Path to models directory
        min_r2: Minimum acceptable validation_r2 score (default: 0.15)
        fallback_version: Version to use if no model meets threshold (default: v5)

    Returns:
        Tuple of (artifact, metadata) or (None, None) if no suitable model found
    """
    registry_path = os.path.join(models_dir, "model_registry.json")
    if not os.path.exists(registry_path):
        logger.warning("No model registry found. Cannot mount ML engine.")
        return None, None

    try:
        with open(registry_path, "r") as f:
            registry = json.load(f)

        models = registry.get("models", [])
        if not models:
            logger.warning("No models found in registry.")
            return None, None

        # Identify "Big Data" models: dataset_size > 100000 or training_source == "cleaned_trends.parquet"
        big_data_models = [
            m for m in models 
            if m.get("dataset_size", 0) > 100000 or m.get("training_source") == "cleaned_trends.parquet"
        ]

        if big_data_models:
            # Prioritize the most recent Big Data model
            best_model_meta = big_data_models[-1]
            best_r2 = best_model_meta.get("test_r2") or best_model_meta.get("validation_r2") or best_model_meta.get("cv_r2") or "Unknown"
            logger.info(f"[Big Data Engine] Found {len(big_data_models)} trained out-of-core models.")
            logger.info(f"[Big Data Engine] Prioritizing High-Volume model: {best_model_meta['version']} (Trained on {best_model_meta.get('dataset_size')} rows)")
        else:
            # Fallback to standard Stability Guard logic (highest validation/test R2)
            valid_models = []
            for model in models:
                r2_score = model.get("test_r2") or model.get("validation_r2") or model.get("cv_r2")
                if r2_score is not None and r2_score >= min_r2:
                    valid_models.append((model, r2_score))

            if valid_models:
                valid_models.sort(key=lambda x: x[1], reverse=True)
                best_model_meta = valid_models[0][0]
                best_r2 = valid_models[0][1]
                logger.info(f"[TrendSense Core] STABILITY GUARD: Selected baseline model: {best_model_meta['version']} with R² = {best_r2:.4f}")
            else:
                logger.warning(f"[TrendSense Core] No models met threshold {min_r2}. Falling back to {fallback_version}")
                best_model_meta = next((m for m in models if m["version"] == fallback_version), None)
                if not best_model_meta:
                    best_model_meta = models[-1]
                logger.info(f"[TrendSense Core] Using fallback model: {best_model_meta['version']}")

        # Load the selected model
        model_filename = best_model_meta["filename"]
        model_path = os.path.join(models_dir, model_filename)
        artifact = joblib.load(model_path)

        logger.info(f"✅ Successfully loaded model from {model_path}")
        return artifact, best_model_meta

    except Exception as e:
        logger.error(f"Failed to load model with stability guard: {e}", exc_info=True)
        return None, None

def predict_with_explainability(artifact, input_df: pd.DataFrame):
    """
    Predicts logic and returns top 3 contributing features for dashboard explainability.
    NOW HANDLES: TF-IDF → SVD → Engineered features combined.
    Also handles HashingVectorizer from the Big Data pipeline.
    """
    model = artifact["model"]
    svd_transformer = artifact["svd_transformer"]
    engineered_features = artifact["engineered_features"]
    all_features = artifact["all_features"]
    model_type = artifact["model_type"]

    # Determine which vectorizer was used
    vectorizer_type = artifact.get("vectorizer_type", "TfidfVectorizer")
    if vectorizer_type == "HashingVectorizer":
        text_vectorizer = artifact["text_vectorizer"]
    else:
        text_vectorizer = artifact["tfidf_vectorizer"]

    # Extract engineered features
    X_engineered = input_df[engineered_features].values

    # Extract text features and apply SVD compression
    text_matrix = text_vectorizer.transform(input_df['text'].fillna(''))
    text_dense = svd_transformer.transform(text_matrix)

    # Combine features
    X_combined = np.hstack([X_engineered, text_dense])

    predicted_score = model.predict(X_combined)

    explanations = []

    if model_type in ["RandomForest", "GradientBoosting", "HistGradientBoosting"]:
        # For HistGBR, use global feature importance from the model if available
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
        else:
            # Fallback: equal importance for all features
            importances = np.ones(len(all_features)) / len(all_features)

        top_indices = np.argsort(importances)[::-1][:3]
        explanation = [(all_features[i], float(importances[i])) for i in top_indices]
        for _ in predicted_score:
             explanations.append(explanation)

    return predicted_score, explanations


# ═══════════════════════════════════════════════════════════════════════════════
#  CLI ENTRY POINT — Run Big Data Training Directly
# ═══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s │ %(levelname)-7s │ %(message)s",
        datefmt="%H:%M:%S",
    )
    # Default: train from Parquet (Big Data pipeline)
    train_from_parquet(models_dir=os.path.join(os.path.dirname(__file__), "models"))
