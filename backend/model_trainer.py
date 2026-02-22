import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
import joblib

def contains_slang(text: str, slang_list: list) -> int:
    """Helper to check if any trending slang exists in the text."""
    if not isinstance(text, str):
        return 0
    text_lower = text.lower()
    for slang in slang_list:
        if slang in text_lower:
            return 1
    return 0

def train_virality_model(hybrid_df: pd.DataFrame, trending_slang_list: list):
    """
    Trains a regression model to predict `engagement_score`.
    Uses the presence of "Trending Slang" as a heavily engineered feature.
    """
    print(f"Training Model with Hybrid Dataset size: {len(hybrid_df)}...")
    
    if hybrid_df.empty:
        raise ValueError("Cannot train model on empty DataFrame.")
        
    df = hybrid_df.copy()
    
    # Feature Engineering
    # 1. Presence of Trending Slang
    df['contains_trending_slang'] = df['text'].apply(lambda x: contains_slang(x, trending_slang_list))
    
    # 2. Text Length
    df['text_length'] = df['text'].str.len()
    
    # 3. Base Sentiment Analysis Placeholder
    # A real implementation might use nltk/VADER. 
    # For robust pipeline functioning out-of-the-box, we use random polarity here but note its intent.
    df['sentiment_polarity'] = np.random.uniform(-1, 1, size=len(df)) 
    
    features = ['contains_trending_slang', 'text_length', 'sentiment_polarity']
    X = df[features]
    y = df['engagement_score']
    
    # Train-test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize robust regressor (Random Forest)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    # Train
    model.fit(X_train, y_train)
    
    # Predict & Evaluate
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"--- Model Evaluation ---")
    print(f"MSE: {mse:.2f}")
    print(f"R2 Score: {r2:.4f}")
    
    # Feature Importance
    importance = model.feature_importances_
    print("--- Feature Importance ---")
    for feat, imp in zip(features, importance):
        print(f"{feat}: {imp:.4f}")
    
    return model, mse, r2
