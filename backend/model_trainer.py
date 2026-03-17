import pandas as pd
import numpy as np
import logging
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split, KFold, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from scipy.sparse import hstack
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

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

        # Find all models with validation_r2 meeting threshold (prefer test_r2 or validation_r2)
        valid_models = []
        for model in models:
            # Try to get R2 score (different versions use different keys)
            r2_score = model.get("test_r2") or model.get("validation_r2") or model.get("cv_r2")
            if r2_score is not None and r2_score >= min_r2:
                valid_models.append((model, r2_score))

        if valid_models:
            # Sort by R2 score descending and pick the best one
            valid_models.sort(key=lambda x: x[1], reverse=True)
            best_model_meta = valid_models[0][0]
            best_r2 = valid_models[0][1]
            logger.info(f"🛡️  STABILITY GUARD: Found {len(valid_models)} models with R² >= {min_r2}")
            logger.info(f"✅ Selected best model: {best_model_meta['version']} with R² = {best_r2:.4f}")
        else:
            # Fallback to specified version
            logger.warning(f"⚠️  STABILITY GUARD: No models with R² >= {min_r2}. Falling back to {fallback_version}")
            best_model_meta = next((m for m in models if m["version"] == fallback_version), None)

            if not best_model_meta:
                # If fallback version not found, use the most recent one
                logger.warning(f"⚠️  Fallback version {fallback_version} not found. Using most recent model.")
                best_model_meta = models[-1]

            logger.info(f"✅ Using fallback model: {best_model_meta['version']}")

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
    """
    model = artifact["model"]
    tfidf_vectorizer = artifact["tfidf_vectorizer"]
    svd_transformer = artifact["svd_transformer"]  # NEW: SVD transformer
    engineered_features = artifact["engineered_features"]
    all_features = artifact["all_features"]
    model_type = artifact["model_type"]

    # Extract engineered features
    X_engineered = input_df[engineered_features].values

    # Extract TF-IDF features and apply SVD compression
    tfidf_matrix = tfidf_vectorizer.transform(input_df['text'].fillna(''))
    tfidf_dense = svd_transformer.transform(tfidf_matrix)  # Transform to dense topics

    # Combine features
    X_combined = np.hstack([X_engineered, tfidf_dense])

    predicted_score = model.predict(X_combined)

    explanations = []

    if model_type in ["RandomForest", "GradientBoosting"]:
        # Global feature importance as rough local proxy for dashboard MVP
        importances = model.feature_importances_
        top_indices = np.argsort(importances)[::-1][:3]
        explanation = [(all_features[i], float(importances[i])) for i in top_indices]
        for _ in predicted_score:
             explanations.append(explanation)

    return predicted_score, explanations

