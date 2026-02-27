import pandas as pd
import numpy as np
import logging
import time
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# TrendSense Engine modules
from model_trainer import load_virality_model, predict_with_explainability, contains_slang, calc_keyword_density
from data_standardizer import get_sentiment
from reddit_fetcher import fetch_daily_reddit_trends
from slang_extractor import extract_trending_slang
from api_models import PredictRequest, PredictResponse, HealthResponse, ModelInfoResponse

# Structured backend logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("TrendSenseAPI")

# Global Application State for Cold-Start caching
ml_engine = {
    "model_artifact": None,
    "model_meta": None,
    "scaler": None,
    "trending_slang_cache": [],
    "last_slang_fetch": 0
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup sequence: Load the heavyweight ML artifacts precisely ONE time into memory.
    Reads from the versioned `models/model_registry.json`.
    """
    logger.info("Starting up TrendSense AI Backend Engine...")
    
    # Load Model Artifact actively from registry
    artifact, meta = load_virality_model("models")
    if not artifact:
        logger.error("Failed to load active model from registry! /predict will be disabled.")
    else:
        ml_engine["model_artifact"] = artifact
        ml_engine["model_meta"] = meta
        logger.info(f"Globally mounted Model Artifact Version: {meta.get('version', 'Unknown')} | R2: {meta.get('validation_r2', 'Unknown')}")
        
    # Load Scaler
    import joblib
    try:
        scaler = joblib.load("models/scaler.pkl")
        ml_engine["scaler"] = scaler
        logger.info("Globally mounted models/scaler.pkl for Virality Index bounds.")
    except Exception as e:
        logger.error(f"Failed to load models/scaler.pkl: {e}")
        
    # Prime the Reddit Trending Slang Cache
    _refresh_trending_slang(force=True)
    
    yield
    
    logger.info("Shutting down TrendSense AI Backend Engine...")


# Initialize FastAPI with the Startup Hook
app = FastAPI(
    title="TrendSense API Backend",
    description="The ML inference engine for the TrendSense Social Media Virality Dashboard.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware (Allow frontend dashboard local requests)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _refresh_trending_slang(force: bool = False):
    """Updates the in-memory trending slang cache every 1 hour (3600s)."""
    current_time = time.time()
    # 1 hr TTL
    if force or (current_time - ml_engine["last_slang_fetch"] > 3600):
        logger.info("Slang Cache missing or expired. Fetching fresh Reddit Trends...")
        try:
            reddit_df = fetch_daily_reddit_trends(limit=100)
            if not reddit_df.empty:
                trending_slang = extract_trending_slang(reddit_df, top_n=20)
                ml_engine["trending_slang_cache"] = trending_slang
                ml_engine["last_slang_fetch"] = current_time
                logger.info(f"Successfully cached {len(trending_slang)} live trending keywords.")
            else:
                logger.warning("Reddit returned empty data. Retaining old cache if it exists.")
        except Exception as e:
            logger.error(f"Failed to fetch live trends: {e}")

@app.get("/health", response_model=HealthResponse)
def health_check():
    """Simple endpoint to verify the API server is up and routing."""
    return HealthResponse(status="ok")

@app.get("/model-info", response_model=ModelInfoResponse)
def get_model_info():
    """Returns the metadata of the currently active model version mounted in memory."""
    meta = ml_engine.get("model_meta")
    if not meta:
        raise HTTPException(status_code=503, detail="No active model metadata available.")
        
    return ModelInfoResponse(
        model_version=meta.get("version", "Unknown"),
        trained_at=meta.get("trained_at", "Unknown"),
        validation_r2=meta.get("validation_r2", 0.0),
        dataset_size=meta.get("dataset_size", 0),
        feature_count=meta.get("feature_count", 0)
    )

@app.get("/live-trends")
def get_live_trends():
    """
    Returns the top 10 trending keywords.
    Uses an in-memory 1hr TTL cache to prevent Reddit API ratelimits.
    """
    _refresh_trending_slang()
    # Return top 10 safely
    return {"trending_keywords": ml_engine["trending_slang_cache"][:10]}

@app.post("/predict", response_model=PredictResponse)
def predict_virality(request: PredictRequest):
    """
    Ingests raw social media post text, extracts advanced Temporal+NLP features,
    and infers the Virality Index and Top 3 Influencers without model retraining.
    """
    start_time = time.time()
    
    if ml_engine["model_artifact"] is None or ml_engine["scaler"] is None:
        logger.error("Predict endpoint called but ML Engine is not initialized.")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "ML Model or Scaler not loaded in memory. Server misconfigured."}
        )
        
    text = request.post_text
    model_version = ml_engine["model_artifact"].get("model_type", "Unknown")
    logger.info(f"Incoming prediction request | Length: {len(text)} chars | Model: {model_version}")
    
    try:
        # We need the formal engineered feature vector expected by the artifact
        features_required = ml_engine["model_artifact"]["features"]
        current_slang = ml_engine["trending_slang_cache"]
        
        # 1. Native NLP Engineering
        # Calculate sentiment polarity from real VADER engine
        sentiment_score = get_sentiment(text)
        slang_present = contains_slang(text, current_slang)
        k_density = calc_keyword_density(text, current_slang)
        txt_length = len(text)
        
        # 2. Temporal Features (Simulate "posted right now" for inference)
        now = pd.Timestamp.now()
        hod = now.hour
        dow = now.dayofweek
        weekend = int(dow in [5, 6])
        
        # 3. Build Single Row Inference DataFrame
        feature_dict = {
            'contains_trending_slang': slang_present,
            'keyword_density': k_density,
            'text_length': txt_length,
            'hour_of_day': hod,
            'day_of_week': dow,
            'is_weekend': weekend,
            'sentiment_polarity': sentiment_score
        }
        
        # Fill missing features if artifact expects something else
        for f in features_required:
            if f not in feature_dict:
                feature_dict[f] = 0.0
                
        inference_df = pd.DataFrame([feature_dict])
        
        # 4. Neural Explainability Wrapper
        raw_pred_list, explanations = predict_with_explainability(ml_engine["model_artifact"], inference_df)
        raw_score = raw_pred_list[0]
        
        # Ensure we don't return null features and strictly sort descending by absolute importance
        top_feats = explanations[0] if explanations else [] 
        top_feats = sorted(top_feats, key=lambda x: abs(x[1]), reverse=True)
        
        # 5. Dashboard MinMax Scaling
        # Scikit expects 2D array for transform
        scaled_score_array = ml_engine["scaler"].transform(np.array([[raw_score]]))
        virality_index = float(scaled_score_array[0][0])
        
        # Constrain 0-100 logically for dashboard UI bounds
        virality_index = min(max(virality_index, 0.0), 100.0)
        
        inference_duration_ms = (time.time() - start_time) * 1000
        logger.info(f"Success | Score: {virality_index:.2f} | Latency: {inference_duration_ms:.2f}ms")
        
        return PredictResponse(
            virality_index=round(virality_index, 2),
            sentiment_score=round(sentiment_score, 4),
            top_features=top_feats
        )
        
    except Exception as e:
        logger.error(f"Prediction inference failed fatally: {e}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Error processing inference logic. Please verify input data payload."}
        )
