import pandas as pd
import numpy as np
import logging
import time
import os
from google import genai
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'data', '.env'))

# Define Base Path for Models (always loads from backend/models/)
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')

# TrendSense Engine modules
from model_trainer import load_best_stable_model, predict_with_explainability, contains_slang, calc_keyword_density, count_viral_keywords
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
    "gemini_client": None,
    "trending_slang_cache": [],
    "last_slang_fetch": 0
}

def get_top_trending_terms(n=5):
    """
    Extracts top N trending TF-IDF terms from the loaded model artifact.
    Falls back to cached Reddit slang if TF-IDF is unavailable.
    """
    try:
        artifact = ml_engine.get("model_artifact")
        if artifact and "tfidf_vectorizer" in artifact:
            tfidf_vectorizer = artifact["tfidf_vectorizer"]
            # Get feature names (these are the actual words/bigrams)
            feature_names = tfidf_vectorizer.get_feature_names_out()

            # Get the top N terms by their IDF scores (importance)
            idf_scores = tfidf_vectorizer.idf_
            top_indices = np.argsort(idf_scores)[:n]  # Lower IDF = more important/common
            top_terms = [feature_names[i] for i in top_indices]

            logger.debug(f"Extracted top {n} TF-IDF terms: {top_terms}")
            return top_terms
        else:
            # Fallback to Reddit slang cache
            slang_cache = ml_engine.get("trending_slang_cache", [])
            top_terms = slang_cache[:n]
            logger.debug(f"Using Reddit slang fallback: {top_terms}")
            return top_terms
    except Exception as e:
        logger.error(f"Failed to extract trending terms: {e}")
        return ["viral", "trending", "no cap", "fr", "lowkey"]  # Emergency fallback

def generate_ai_suggestion(user_text: str, virality_score: float):
    """
    Calls Gemini 1.5 Flash to generate a viral content suggestion.
    Returns an unhinged, brainrot-style hook to improve the post.
    Uses the modern google-genai SDK.

    TEMPORARILY DISABLED to save API quota during calibration.
    """
    # TEMPORARY: Return hardcoded placeholder to save API quota
    return "AI Oracle is in hibernation mode for calibration."

    # COMMENTED OUT TO SAVE API QUOTA
    # gemini_client = ml_engine.get("gemini_client")
    # if not gemini_client:
    #     return "AI suggestions unavailable (API key not configured)"
    #
    # try:
    #     # Get current trending terms
    #     top_trends = ", ".join(get_top_trending_terms(n=5))
    #
    #     # Build the prompt - explicit instruction for complete sentence
    #     prompt = f"""Current internet trends: {top_trends}.
    #
    # User's draft post: "{user_text}"
    #
    # Our ML model rated this {virality_score:.0f}/100 for virality potential.
    #
    # Generate ONE complete, creative suggestion to make this post more viral. Use trending internet slang, humor, or "brainrot" style hooks. Return a full, grammatically complete sentence (not fragments).
    #
    # Your viral suggestion:"""
    #
    #     # Call Gemini 1.5 Flash with new SDK (using -002 model version for v1beta API)
    #     response = gemini_client.models.generate_content(
    #         model='gemini-flash-latest',
    #         contents=prompt,
    #         config={
    #             'temperature': 1.0,  # Balanced creativity and coherence
    #             'max_output_tokens': 100,  # Full sentence length
    #         }
    #     )
    #
    #     # Wait for full response and extract text
    #     suggestion = response.text.strip()
    #
    #     # Fallback if response is too short (likely a fragment)
    #     if len(suggestion) < 15:
    #         logger.warning(f"Gemini returned short fragment: '{suggestion}', using fallback")
    #         return "Try adding trending phrases like 'no cap', 'fr fr', or relevant emojis to boost engagement! 🔥"
    #
    #     logger.info(f"✅ Gemini suggestion generated: {suggestion[:50]}...")
    #     return suggestion
    #
    # except Exception as e:
    #     logger.error(f"Gemini API call failed: {e}", exc_info=True)
    #     return "AI suggestion temporarily unavailable"

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup sequence: Load the heavyweight ML artifacts precisely ONE time into memory.
    Uses STABILITY GUARD: Loads model with highest validation_r2 > 0.15, else falls back to v5.
    """
    logger.info("Starting up TrendSense AI Backend Engine...")

    # Load Model Artifact with stability guard
    artifact, meta = load_best_stable_model(MODEL_DIR, min_r2=0.15, fallback_version="v5")
    if not artifact:
        logger.error("Failed to load active model from registry! /predict will be disabled.")
    else:
        ml_engine["model_artifact"] = artifact
        ml_engine["model_meta"] = meta
        logger.info(f"✅ Globally mounted Model Artifact Version: {meta.get('version', 'Unknown')} | R2: {meta.get('validation_r2', 'Unknown')}")
        logger.info(f"✅ Model now predicts percentiles directly (0-100), no post-prediction scaling needed")

    # Initialize Gemini API Client with modern google-genai SDK
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        try:
            # Initialize client with explicit configuration for Google AI (not Vertex AI)
            gemini_client = genai.Client(
                api_key=GEMINI_API_KEY,
                http_options={'api_version': 'v1beta'}  # Explicit API version
            )
            ml_engine["gemini_client"] = gemini_client
            logger.info("✅ Gemini API client initialized successfully with google-genai SDK (v1beta)")
        except Exception as e:
            logger.warning(f"⚠️  Failed to initialize Gemini API client: {e}")
    else:
        logger.warning("⚠️  GEMINI_API_KEY not found in .env - AI suggestions will be disabled")

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
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:5173",      # Vite dev server (IP)
        "http://localhost:3000",      # Legacy React dev server
        "http://127.0.0.1:3000"       # Legacy React dev server (IP)
    ],
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

    if ml_engine["model_artifact"] is None:
        logger.error("Predict endpoint called but ML Engine is not initialized.")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "ML Model not loaded in memory. Server misconfigured."}
        )

    text = request.post_text
    model_version = ml_engine["model_artifact"].get("model_type", "Unknown")
    logger.info(f"Incoming prediction request | Length: {len(text)} chars | Model: {model_version}")

    try:
        # We need the formal engineered feature vector expected by the artifact
        current_slang = ml_engine["trending_slang_cache"]

        # 1. Native NLP Engineering
        # Calculate sentiment polarity from real VADER engine
        sentiment_score = get_sentiment(text)
        slang_present = contains_slang(text, current_slang)
        k_density = calc_keyword_density(text, current_slang)
        txt_length = len(text)

        # VIRAL KEYWORD COUNT (Combat Text Blindness)
        viral_kw_count = count_viral_keywords(text)
        logger.debug(f"   Detected {viral_kw_count} viral keywords in input text")

        # 2. Temporal Features (Use request params if provided, otherwise current time)
        # DESTROY TIME CARDINALITY: Use is_peak_hour (binary) instead of hour_of_day (24 values)
        now = pd.Timestamp.now()

        # Prioritize simulated_hour, then hour_of_day, then current time
        if request.simulated_hour is not None:
            hod = request.simulated_hour
            logger.info(f"   Using simulated_hour: {hod}")
        elif request.hour_of_day is not None:
            hod = request.hour_of_day
            logger.info(f"   Using hour_of_day: {hod}")
        else:
            hod = now.hour

        # Convert to binary is_peak_hour (3 PM - 10 PM = peak hours)
        is_peak_hour = int(15 <= hod <= 22)

        if request.day_of_week is not None:
            dow = request.day_of_week
            logger.info(f"   Using custom day_of_week: {dow} (0=Mon, 6=Sun)")
        else:
            dow = now.dayofweek

        if request.is_weekend is not None:
            weekend = int(request.is_weekend)
            logger.info(f"   Using custom is_weekend: {weekend}")
        else:
            # Auto-calculate from day_of_week
            weekend = int(dow in [5, 6])

        logger.info(f"   Temporal context: is_peak_hour={is_peak_hour} (hour={hod}), is_weekend={weekend}")

        # 3. Build Single Row Inference DataFrame with ALL required fields
        # CRITICAL: Must include 'text' for TF-IDF transformation
        feature_dict = {
            'text': text,  # CRITICAL: Required for TF-IDF vectorizer
            'contains_trending_slang': slang_present,
            'keyword_density': k_density,
            'text_length': txt_length,
            'is_peak_hour': is_peak_hour,  # NEW: Binary temporal feature (no cardinality)
            'is_weekend': weekend,
            'sentiment_polarity': sentiment_score,
            'uppercase_ratio': sum(1 for c in text if c.isupper()) / max(len([c for c in text if c.isalpha()]), 1),
            'exclamation_count': text.count('!'),
            'question_count': text.count('?'),
            'viral_keyword_count': viral_kw_count
        }

        inference_df = pd.DataFrame([feature_dict])

        # 4. Neural Explainability Wrapper (handles TF-IDF transformation internally)
        raw_pred_list, explanations = predict_with_explainability(ml_engine["model_artifact"], inference_df)
        raw_score = raw_pred_list[0]

        # Ensure we don't return null features and strictly sort descending by absolute importance
        top_feats = explanations[0] if explanations else []
        top_feats = sorted(top_feats, key=lambda x: abs(x[1]), reverse=True)

        # 5. Model Output is Already Percentile (0-100)
        # The model was trained on target_percentile, so raw prediction is the virality_index
        virality_index = round(float(raw_score), 2)

        # Boundary clamp for safety (model should already output 0-100)
        virality_index = max(0.0, min(100.0, virality_index))

        logger.info(f"   Model prediction: {virality_index:.2f}/100 (percentile rank)")
        logger.info(f"   This post is better than {virality_index:.0f}% of posts in the training dataset")

        # 6. Generate AI Content Suggestion using Gemini
        logger.info("🤖 Generating AI content suggestion with Gemini...")
        ai_suggestion = generate_ai_suggestion(text, virality_index)

        inference_duration_ms = (time.time() - start_time) * 1000
        logger.info(f"Success | Score: {virality_index:.2f} | Latency: {inference_duration_ms:.2f}ms")

        return PredictResponse(
            virality_index=round(virality_index, 2),
            sentiment_score=round(sentiment_score, 4),
            top_features=top_feats,
            ai_suggestion=ai_suggestion
        )

    except Exception as e:
        logger.error(f"Prediction inference failed fatally: {e}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": f"Error processing inference logic: {str(e)}"}
        )
