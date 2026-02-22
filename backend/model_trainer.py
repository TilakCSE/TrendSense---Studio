import pandas as pd
import numpy as np
import logging
import joblib
from sklearn.model_selection import train_test_split, KFold
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
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

def train_virality_model(hybrid_df: pd.DataFrame, trending_slang_list: list, model_path: str = "virality_model.pkl"):
    """
    Trains and compares multiple regression models to predict formal `engagement_score`.
    Selects the best performing model based on R2 and saves it.
    """
    logger.info(f"Training Model Engine with Hybrid Dataset size: {len(hybrid_df)}...")
    
    if hybrid_df.empty:
        raise ValueError("Cannot train model on empty DataFrame.")
        
    df = hybrid_df.copy()
    
    # --- 1. FEATURE ENGINEERING ---
    logger.info("Extracting engineered features (NLP + Temporal)...")
    
    df['contains_trending_slang'] = df['text'].apply(lambda x: contains_slang(x, trending_slang_list))
    df['keyword_density'] = df['text'].apply(lambda x: calc_keyword_density(x, trending_slang_list))
    df['text_length'] = df['text'].str.len().fillna(0)
    df['hour_of_day'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # Sentiment polarity is now real from standardizer, verify it exists
    if 'sentiment_polarity' not in df.columns:
        df['sentiment_polarity'] = 0.0
        
    features = [
        'contains_trending_slang', 'keyword_density', 'text_length', 
        'hour_of_day', 'day_of_week', 'is_weekend', 'sentiment_polarity'
    ]
    
    X = df[features]
    y = df['engagement_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # --- 2. TRAIN MODELS FOR COMPARISON ---
    logger.info("Training Linear Regression vs Random Forest for comparison...")
    
    models = {
        "LinearRegression": LinearRegression(),
        "RandomForest": RandomForestRegressor(n_estimators=100, max_depth=10, random_state=42)
    }
    
    results = {}
    best_model_name = None
    best_r2 = -float("inf")
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)
        r2 = r2_score(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        results[name] = {"model": model, "R2": r2, "RMSE": rmse}
        
        logger.info(f"[{name}] R2: {r2:.4f} | RMSE: {rmse:.4f}")
        
        # Select best model based on R2
        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name

    logger.info(f"🏆 Best Model Selected: {best_model_name} with R2: {best_r2:.4f}")
    
    best_model = results[best_model_name]["model"]
    
    # If RF, print importances
    if best_model_name == "RandomForest":
        importance = best_model.feature_importances_
        logger.info("--- Feature Importance ---")
        for feat, imp in sorted(zip(features, importance), key=lambda x: x[1], reverse=True):
            logger.info(f"  {feat}: {imp:.4f}")
            
    # --- 3. PERSIST MODEL AND FEATURE LIST ---
    logger.info(f"Saving best model to {model_path}...")
    joblib.dump({"model": best_model, "features": features, "model_type": best_model_name}, model_path)
    
    return best_model, results[best_model_name]["RMSE"], best_r2

def load_virality_model(model_path: str = "virality_model.pkl"):
    """Safely load an existing model artifact."""
    try:
        artifact = joblib.load(model_path)
        logger.info(f"Successfully loaded existing model artifact from {model_path}")
        return artifact
    except FileNotFoundError:
        logger.warning(f"No existing model found at {model_path}")
        return None

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
    
    if model_type == "RandomForest":
        # Global feature importance as rough local proxy for dashboard MVP
        importances = model.feature_importances_
        top_indices = np.argsort(importances)[::-1][:3]
        explanation = [(features[i], float(importances[i])) for i in top_indices]
        for _ in predicted_score:
             explanations.append(explanation)
             
    elif model_type == "LinearRegression":
        # Coeffs * actual values for local explainability
        coeffs = model.coef_
        for idx, row in X.iterrows():
            contributions = np.abs(coeffs * row.values)
            top_indices = np.argsort(contributions)[::-1][:3]
            explanation = [(features[i], float(contributions[i])) for i in top_indices]
            explanations.append(explanation)
            
    return predicted_score, explanations

