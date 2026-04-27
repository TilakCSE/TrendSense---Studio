import os
import time
import logging
import torch
from google import genai
from fastapi import FastAPI, HTTPException, status, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from pydantic import BaseModel
import io
from PIL import Image
import time


# Import our custom Deep Learning modules
from v2_engine.multimodal_nn import TrendSenseMultiModal
from v2_engine.text_sbert import TextEmbedder
from v2_engine.vision_vit import VisionEmbedder
from v2_engine.trend_discovery import LivePulseEngine
from reddit_fetcher import fetch_daily_reddit_trends

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'data', '.env'))

# Structured backend logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("TrendSenseDL_API")

# --- Global Application State ---
ml_engine = {
    "model": None,
    "text_embedder": None,
    "vision_embedder": None,
    "gemini_client": None,
    "pulse_engine": None
}

pulse_cache = {
    "data": None,
    "last_fetched": 0.0,
    "CACHE_TTL": 600.0 
}

# --- Data Validation Schemas ---
class PredictRequest(BaseModel):
    title: str
    view_count: int = 0
    like_count: int = 0
    comment_count: int = 0

class PredictResponse(BaseModel):
    title: str
    virality_score: float
    ai_suggestion: str
    model_version: str
    status: str

# --- Gemini AI Integration ---
def generate_ai_suggestion(user_text: str, virality_score: float):
    """
    Calls Gemini 1.5 Flash to generate a viral content suggestion based on the DL score.
    """

    return "AI Coach is currently hibernating to save API tokens! 😴"

    gemini_client = ml_engine.get("gemini_client")
    if not gemini_client:
        return "AI suggestions unavailable (API key not configured)"
    
    try:
        # Build the prompt using the new Neural Network score
        prompt = f"""
User's draft video title: "{user_text}"
Our Deep Learning Multi-Modal model rated this {virality_score:.1f}/100 for virality potential.

Generate ONE complete, creative suggestion to make this title more viral. 
Use modern internet slang or highly engaging YouTube clickbait psychology. 
Return a full, grammatically complete sentence.

Your viral suggestion:"""

        # Call Gemini 1.5 Flash
        response = gemini_client.models.generate_content(
            model='gemini-1.5-flash-latest',
            contents=prompt,
            config={
                'temperature': 0.9, 
                'max_output_tokens': 100, 
            }
        )

        suggestion = response.text.strip()
        logger.info(f"✅ Gemini suggestion generated: {suggestion[:50]}...")
        return suggestion

    except Exception as e:
        logger.error(f"Gemini API call failed: {e}", exc_info=True)
        return "Try adding high-arousal words like 'INSANE' or 'NEW' to boost the model's prediction! 🔥"

# --- Startup Sequence ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Boot sequence: Loads PyTorch weights and SBERT into memory once.
    """
    logger.info("🧠 [TrendSense Core] Booting Deep Learning Sequence...")

    # 1. Initialize PyTorch Brain & SBERT
    try:
        model = TrendSenseMultiModal()
        text_embedder = TextEmbedder()
        vision_embedder = VisionEmbedder()
        pulse_engine = LivePulseEngine()
        
        weights_path = os.path.join(os.path.dirname(__file__), "models", "v2_multimodal_weights.pt")
        
        if os.path.exists(weights_path):
            # Load weights to CPU for API inference
            model.load_state_dict(torch.load(weights_path, map_location='cpu'))
            model.eval() # Disable training features like Dropout
            
            ml_engine["model"] = model
            ml_engine["text_embedder"] = text_embedder
            ml_engine["vision_embedder"] = vision_embedder
            ml_engine["pulse_engine"] = pulse_engine
            logger.info("✅ [TrendSense Core] PyTorch Multi-Modal weights loaded successfully.")
        else:
            logger.error(f"❌ [TrendSense Core] Could not find weights at {weights_path}")
    except Exception as e:
        logger.error(f"❌ [TrendSense Core] Neural Network failed to initialize: {e}")

    # 2. Initialize Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    if GEMINI_API_KEY:
        try:
            ml_engine["gemini_client"] = genai.Client(api_key=GEMINI_API_KEY)
            logger.info("✅ Gemini API client initialized successfully.")
        except Exception as e:
            logger.warning(f"⚠️ Failed to initialize Gemini API client: {e}")
    else:
        logger.warning("⚠️ GEMINI_API_KEY not found in .env")

    yield
    logger.info("Shutting down TrendSense AI Backend Engine...")


# --- FastAPI App Initialization ---
app = FastAPI(
    title="TrendSense Deep Learning API",
    version="2.0",
    lifespan=lifespan
)

# CORS configuration for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Endpoints ---
@app.get("/health")
def health_check():
    return {"status": "TrendSense PyTorch API is running"}

@app.post("/api/predict", response_model=PredictResponse)
async def predict_virality(
    title: str = Form(...),
    view_count: int = Form(0),
    like_count: int = Form(0),
    comment_count: int = Form(0),
    thumbnail: UploadFile = File(None) # Make the image optional
):
    start_time = time.time()
    model = ml_engine["model"]
    text_embedder = ml_engine["text_embedder"]
    vision_embedder = ml_engine["vision_embedder"]

    if not model or not text_embedder or not vision_embedder:
        raise HTTPException(status_code=503, detail="AI Engine is offline.")

    logger.info(f"Incoming prediction request | Title: '{title}' | Image attached: {thumbnail is not None}")

    try:
        # 1. Text Pipeline
        text_vector = text_embedder.generate_embedding(title)
        text_tensor = torch.tensor(text_vector, dtype=torch.float32).unsqueeze(0)
        
        # 2. Vision Pipeline (THE EYE IS OPEN)
        if thumbnail:
            image_bytes = await thumbnail.read()
            vision_tensor = vision_embedder.generate_embedding(image_bytes)
            has_thumbnail = True
        else:
            # The Neutral Canvas Generator
            logger.info("   No thumbnail detected. Generating Neutral Canvas...")
            neutral_image = Image.new('RGB', (224, 224), color=(128, 128, 128))
            img_byte_arr = io.BytesIO()
            neutral_image.save(img_byte_arr, format='JPEG')
            
            vision_tensor = vision_embedder.generate_embedding(img_byte_arr.getvalue())
            has_thumbnail = False
        
        # 3. Tabular Pipeline (THIS WAS MISSING!)
        # We simulate a "baseline algorithm push" (e.g., 50k views) so the AI judges only the Title/Image.
        baseline_views = 50000.0 / 100000.0
        baseline_likes = 2500.0 / 10000.0
        baseline_comments = 250.0 / 1000.0
        tabular_tensor = torch.tensor([[baseline_views, baseline_likes, baseline_comments]], dtype=torch.float32)
        
        # 4. Neural Network Forward Pass
        with torch.no_grad():
            prediction = model(text_tensor, vision_tensor, tabular_tensor)
            raw_score = prediction.item() 
            
            # Scale 0-10% engagement up to our 1-100 UI Hype meter
            scaled_score = raw_score * 10.0
            ui_score = max(1.0, min(99.9, scaled_score))
            
        logger.info(f"   Model Raw Engagement Rate: {raw_score:.2f}% | UI Scaled Score: {ui_score:.1f}")

        # 5. Gemini Integration
        ai_suggestion = generate_ai_suggestion(title, ui_score)

        return PredictResponse(
            title=title,
            virality_score=round(ui_score, 1),
            ai_suggestion=ai_suggestion if has_thumbnail else "Upload a thumbnail to see your true virality potential! 🖼️",
            model_version="v2_pytorch_sbert_vit",
            status="success"
        )

    except Exception as e:
        logger.error(f"Prediction inference failed: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": str(e)})
    
    
@app.get("/api/live-pulse")
async def get_live_pulse():
    pulse_engine = ml_engine.get("pulse_engine")
    if not pulse_engine:
        raise HTTPException(status_code=503, detail="Live Pulse Engine offline.")

    # --- 1. CHECK THE CACHE FIRST ---
    current_time = time.time()
    time_since_last_fetch = current_time - pulse_cache["last_fetched"]
    
    if pulse_cache["data"] is not None and time_since_last_fetch < pulse_cache["CACHE_TTL"]:
        minutes_old = round(time_since_last_fetch / 60, 1)
        logger.info(f"⚡ Serving Live Pulse from Cache (Data is {minutes_old} minutes old)")
        
        return {
            "status": "success",
            "active_trends": pulse_cache["data"],
            "cached": True # Let the frontend know this was lightning fast
        }

    # --- 2. IF CACHE IS EMPTY OR EXPIRED, DO THE HARD WORK ---
    logger.info("⏳ Cache expired or empty. Fetching fresh firehose data...")
    try:
        # Fetching top 20 posts from the 22 targeted cultural epicenters
        reddit_df = fetch_daily_reddit_trends(limit=20) 
        
        if reddit_df.empty:
             raise HTTPException(status_code=500, detail="Failed to fetch Reddit stream.")

        # Pass the ENTIRE dataframe to the engine to calculate velocity
        trends = pulse_engine.discover_trends(reddit_df)
        
        # --- 3. SAVE TO CACHE FOR THE NEXT RELOAD ---
        pulse_cache["data"] = trends
        pulse_cache["last_fetched"] = current_time
        logger.info("💾 Live Pulse cache updated successfully!")
        
        return {
            "status": "success",
            "active_trends": trends,
            "cached": False
        }

    except Exception as e:
        logger.error(f"Live Pulse failed: {e}", exc_info=True)
        # Fallback: If Reddit crashes, try to serve stale cache instead of crashing the UI
        if pulse_cache["data"] is not None:
             logger.warning("Serving stale cache due to fetch failure.")
             return {"status": "success", "active_trends": pulse_cache["data"], "cached": True, "warning": "stale_data"}
        
        raise HTTPException(status_code=500, detail=str(e))