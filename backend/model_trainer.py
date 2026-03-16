import pandas as pd
import numpy as np
import logging
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split, KFold
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.metrics import mean_squared_error, r2_score

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

def train_virality_model(youtube_df: pd.DataFrame, models_dir: str = "models"):
    """
    Trains and compares multiple regression models to predict formal `engagement_score`.
    NOW USES: comment_count (log-transformed) as primary engagement feature.
    IMPLEMENTS: KFold cross-validation for reliable accuracy metrics.
    Selects the best performing model based on R2 and saves it sequentially via a JSON registry.
    """
    logger.info(f"🚀 Training Model Engine with YouTube Dataset size: {len(youtube_df)}...")

    if youtube_df.empty:
        raise ValueError("Cannot train model on empty DataFrame.")

    df = youtube_df.copy()

    # --- 1. FEATURE ENGINEERING ---
    logger.info("🔧 Extracting engineered features (NLP + Temporal + Comment Engagement)...")

    # Text features
    df['text_length'] = df['text'].str.len().fillna(0)

    # Temporal features
    df['hour_of_day'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

    # Sentiment polarity from standardizer
    if 'sentiment_polarity' not in df.columns:
        logger.warning("sentiment_polarity missing, defaulting to 0.0")
        df['sentiment_polarity'] = 0.0

    # FEATURE SET (NO COMMENT_COUNT - causes target leakage!)
    # Model must learn from content (text) and temporal patterns only
    features = [
        'text_length', 'hour_of_day', 'day_of_week', 'is_weekend',
        'sentiment_polarity'
    ]

    logger.info("⚠️  NOTE: log_comment_count EXCLUDED to prevent target leakage")

    logger.info(f"✅ Final Feature Count: {len(features)}")
    logger.info(f"✅ Features: {features}")

    X = df[features]
    y = df['engagement_score']

    # Hold-out test set (20% for final evaluation)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # --- 2. TRAIN MODELS WITH KFOLD CROSS-VALIDATION ---
    logger.info("🔄 Training models with 5-Fold Cross-Validation for reliable metrics...")

    models = {
        "LinearRegression": LinearRegression(),
        "Ridge": Ridge(alpha=1.0),
        "RandomForest": RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42),
        "GradientBoosting": GradientBoostingRegressor(n_estimators=100, max_depth=5, learning_rate=0.1, random_state=42)
    }

    kfold = KFold(n_splits=5, shuffle=True, random_state=42)
    results = {}
    best_model_name = None
    best_cv_r2 = -float("inf")

    for name, model in models.items():
        logger.info(f"\n--- Training {name} ---")

        # KFold Cross-Validation
        cv_r2_scores = []
        cv_rmse_scores = []

        for fold, (train_idx, val_idx) in enumerate(kfold.split(X_train), 1):
            X_fold_train, X_fold_val = X_train.iloc[train_idx], X_train.iloc[val_idx]
            y_fold_train, y_fold_val = y_train.iloc[train_idx], y_train.iloc[val_idx]

            model.fit(X_fold_train, y_fold_train)
            preds = model.predict(X_fold_val)

            fold_r2 = r2_score(y_fold_val, preds)
            fold_rmse = np.sqrt(mean_squared_error(y_fold_val, preds))

            cv_r2_scores.append(fold_r2)
            cv_rmse_scores.append(fold_rmse)

            logger.info(f"  Fold {fold}: R2={fold_r2:.4f}, RMSE={fold_rmse:.4f}")

        # Average CV scores
        avg_cv_r2 = np.mean(cv_r2_scores)
        avg_cv_rmse = np.mean(cv_rmse_scores)
        std_cv_r2 = np.std(cv_r2_scores)

        logger.info(f"📊 [{name}] Avg CV R2: {avg_cv_r2:.4f} (±{std_cv_r2:.4f}) | Avg CV RMSE: {avg_cv_rmse:.4f}")

        # Train final model on full training set
        model.fit(X_train, y_train)
        test_preds = model.predict(X_test)
        test_r2 = r2_score(y_test, test_preds)
        test_rmse = np.sqrt(mean_squared_error(y_test, test_preds))

        logger.info(f"🎯 [{name}] Test Set Performance: R2={test_r2:.4f}, RMSE={test_rmse:.4f}")

        results[name] = {
            "model": model,
            "cv_r2": avg_cv_r2,
            "cv_rmse": avg_cv_rmse,
            "test_r2": test_r2,
            "test_rmse": test_rmse
        }

        # Select best model based on CV R2 (more reliable than single test split)
        if avg_cv_r2 > best_cv_r2:
            best_cv_r2 = avg_cv_r2
            best_model_name = name

    logger.info(f"\n🏆 Best Model Selected: {best_model_name} with CV R2: {best_cv_r2:.4f}")

    best_model = results[best_model_name]["model"]
    final_test_r2 = results[best_model_name]["test_r2"]
    final_test_rmse = results[best_model_name]["test_rmse"]

    # Feature importance logging (if tree-based model)
    if best_model_name in ["RandomForest", "GradientBoosting"]:
        importance = best_model.feature_importances_
        logger.info("\n" + "=" * 80)
        logger.info("📈 FEATURE IMPORTANCE REPORT (Top → Bottom)")
        logger.info("=" * 80)
        sorted_features = sorted(zip(features, importance), key=lambda x: x[1], reverse=True)
        for rank, (feat, imp) in enumerate(sorted_features, 1):
            logger.info(f"  {rank}. {feat:25s}: {imp:.4f} ({imp*100:.2f}%)")
        logger.info("=" * 80)

    # --- 3. PERSIST MODEL INTO VERSION REGISTRY ---
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

    logger.info(f"💾 Saving best model to {model_path} as version {version_str}...")
    joblib.dump({"model": best_model, "features": features, "model_type": best_model_name}, model_path)

    new_entry = {
        "version": version_str,
        "filename": model_filename,
        "trained_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "cv_r2": round(best_cv_r2, 4),
        "test_r2": round(final_test_r2, 4),
        "test_rmse": round(final_test_rmse, 4),
        "dataset_size": len(youtube_df),
        "feature_count": len(features),
        "features_used": features,
        "model_algorithm": best_model_name
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

def predict_with_explainability(artifact, input_df: pd.DataFrame):
    """
    Predicts logic and returns top 3 contributing features for dashboard explainability.
    """
    model = artifact["model"]
    features = artifact["features"]
    model_type = artifact["model_type"]
    
    X = input_df[features]
    predicted_score = model.predict(X)
    
    explanations = []
    
    if model_type in ["RandomForest", "GradientBoosting"]:
        # Global feature importance as rough local proxy for dashboard MVP
        importances = model.feature_importances_
        top_indices = np.argsort(importances)[::-1][:3]
        explanation = [(features[i], float(importances[i])) for i in top_indices]
        for _ in predicted_score:
             explanations.append(explanation)
             
    elif model_type in ["LinearRegression", "Ridge"]:
        # Coeffs * actual values for local explainability
        coeffs = model.coef_
        for idx, row in X.iterrows():
            contributions = np.abs(coeffs * row.values)
            top_indices = np.argsort(contributions)[::-1][:3]
            explanation = [(features[i], float(contributions[i])) for i in top_indices]
            explanations.append(explanation)
            
    return predicted_score, explanations

