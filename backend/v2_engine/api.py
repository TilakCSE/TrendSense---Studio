import os
import re
import json
import base64
import torch
import torch.nn as nn
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import ollama
import uvicorn
import concurrent.futures

# ==========================================
# GPU MASTER SWITCH — Set BEFORE any model imports
# ==========================================
os.environ["CUDA_VISIBLE_DEVICES"] = "0"
os.environ["OLLAMA_NUM_GPU"] = "99"
os.environ["OLLAMA_GPU_OVERHEAD"] = "0"
os.environ["OLLAMA_GPU_DEVICE_IDS"] = "1"

# Keep heavy models on D: Drive
cache_dir = r"D:\Development\Projects\TrendSense---Studio\ml_cache"
os.environ["HF_HOME"] = cache_dir

from sentence_transformers import SentenceTransformer
from transformers import CLIPProcessor, CLIPModel

# ==========================================
# DEVICE DETECTION — Hard-fail if no CUDA
# ==========================================
if not torch.cuda.is_available():
    raise RuntimeError(
        "❌ CUDA NOT FOUND.\n"
        "Fix: pip uninstall torch && pip install torch --index-url https://download.pytorch.org/whl/cu121"
    )

device = "cuda"
print(f"🚀 INITIALIZING TRENDSENSE API SERVER...")
print(f"✅ CUDA CONFIRMED: {torch.cuda.get_device_name(0)} | VRAM: {torch.cuda.get_device_properties(0).total_memory // 1024**2}MB")

# ==========================================
# 1. NEURAL NETWORK ARCHITECTURE
# Matches trendsense_core_v4.pt: 385→256(BN)→128(BN)→64(BN)→1
# ==========================================
class ViralityPredictor(nn.Module):
    def __init__(self):
        super(ViralityPredictor, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(385, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 1)
        )

    def forward(self, x):
        return self.network(x)

# ==========================================
# 2. GLOBAL MODEL STATE
# ==========================================
sbert_model = None
clip_model = None
clip_processor = None
pytorch_model = None

def load_models():
    global sbert_model, clip_model, clip_processor, pytorch_model

    print(f"⚙️ Waking up Compute Device: {device.upper()} ({torch.cuda.get_device_name(0)})")

    print("🧠 Loading SBERT → GPU...")
    sbert_model = SentenceTransformer('all-MiniLM-L6-v2', device=device)

    print("🖼️ Loading CLIP → GPU...")
    clip_model = CLIPModel.from_pretrained(
        "openai/clip-vit-base-patch32", use_safetensors=True
    ).to(device)
    clip_processor = CLIPProcessor.from_pretrained(
        "openai/clip-vit-base-patch32", use_safetensors=True
    )

    print("🤖 Loading TrendSense Brain → GPU...")
    pytorch_model = ViralityPredictor().to(device)
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pt_path = os.path.join(base_dir, "trendsense_core_v4.pt")
    pytorch_model.load_state_dict(
        torch.load(pt_path, map_location=device, weights_only=True)
    )
    pytorch_model.eval()

    vram_used = torch.cuda.memory_allocated(0) // 1024**2
    vram_total = torch.cuda.get_device_properties(0).total_memory // 1024**2
    print(f"✅ PyTorch models loaded. VRAM used: {vram_used}MB / {vram_total}MB")
    print(f"✅ SERVER READY — {vram_total - vram_used}MB free for Ollama!")

# ==========================================
# LIFESPAN
# ==========================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    load_models()
    yield

app = FastAPI(title="TrendSense Engine API", lifespan=lifespan)

# ==========================================
# CORS — Allow Next.js dev server (port 3000)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# HELPERS
# ==========================================
def safe_parse_json(raw: str) -> dict:
    cleaned = re.sub(r"```(?:json)?", "", raw).strip().rstrip("`").strip()
    return json.loads(cleaned)

def free_cuda_cache():
    torch.cuda.empty_cache()
    torch.cuda.synchronize()

def letterbox_image(image: Image.Image, target_size=(224, 224)) -> Image.Image:
    """
    Pad to square before CLIP resize — preserves 16:9 aspect ratio.
    Without this CLIP receives a squashed image and cohesion scores tank.
    """
    width, height = image.size
    max_dim = max(width, height)
    square = Image.new("RGB", (max_dim, max_dim), (0, 0, 0))
    square.paste(image, ((max_dim - width) // 2, (max_dim - height) // 2))
    return square.resize(target_size, Image.Resampling.LANCZOS)

def ollama_with_timeout(model: str, messages: list, timeout: int = 120):
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(ollama.chat, model=model, messages=messages)
        try:
            return future.result(timeout=timeout)
        except concurrent.futures.TimeoutError:
            raise RuntimeError(f"⏰ Ollama '{model}' timed out after {timeout}s — run: ollama ps")

# ==========================================
# 3. THE MAIN ENDPOINT
# ==========================================
@app.post("/analyze")
async def analyze_video(
    title: str = Form(...),
    hook: str = Form(...),
    thumbnail: UploadFile = File(...),
    user_entities: str = Form(default="")
):
    print(f"\n{'='*50}")
    print(f"📥 INCOMING REQUEST: '{title}'")
    if user_entities:
        print(f"👤 USER PROVIDED ENTITIES: {user_entities}")

    # Read image into memory
    image_bytes = await thumbnail.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    # Letterbox before CLIP — preserves aspect ratio
    clip_image = letterbox_image(image, target_size=(224, 224))
    print(f"   ↳ Thumbnail letterboxed: {image.size} → 224x224")

    # ------------------------------------------
    # PHASE 1: MATH ENGINE (PyTorch + SBERT + CLIP) — GPU
    # ------------------------------------------
    print("⚙️ Executing Math Engine (GPU)...")
    fused_text = f"TITLE: {title} | SCRIPT HOOK: {hook}"
    text_tensor = torch.tensor(sbert_model.encode(fused_text)).to(device)

    inputs = clip_processor(
        text=[title], images=clip_image,
        return_tensors="pt", padding=True, truncation=True
    ).to(device)

    with torch.no_grad():
        outputs = clip_model(**inputs)
        cohesion = outputs.logits_per_image.item() / 100.0

    cohesion_tensor = torch.tensor([cohesion]).to(device)
    combined_features = torch.cat([text_tensor, cohesion_tensor]).unsqueeze(0)

    with torch.no_grad():
        base_score = pytorch_model(combined_features).item()
        base_score = max(0.0, min(100.0, base_score))

    print(f"   ↳ Base Score: {base_score:.1f} | Cohesion: {cohesion:.4f}")
    free_cuda_cache()

    # ------------------------------------------
    # PHASE 2: VISION ENGINE (LLaVA)
    # ------------------------------------------
    print("👁️ Executing Vision Engine (LLaVA → Ollama GPU)...")
    try:
        vision_res = ollama_with_timeout(
            model='llava',
            messages=[{
                'role': 'user',
                'content': (
                    'You are a literal image analyzer. Describe the objects, clothing, '
                    'background, and text in this image. Do not guess professions. '
                    'Just describe what you see in 2 sentences.'
                ),
                'images': [base64_image]
            }],
            timeout=120
        )
        thumbnail_desc = vision_res['message']['content']
        print(f"   ↳ Vision OK: {thumbnail_desc[:80]}...")
    except Exception as e:
        print(f"❌ LLaVA ERROR: {str(e)}")
        thumbnail_desc = "Could not analyze image."

    # ------------------------------------------
    # PHASE 3: CULTURE ENGINE (Llama 3)
    # ------------------------------------------
    print("🌐 Executing Culture Engine (Llama 3 → Ollama GPU)...")

    entity_multiplier = 1.0
    entity_tier = "None"

    if user_entities.strip():
        print(f"🔍 Analyzing User Entities: {user_entities}")
        zeitgeist_prompt = f"""You are a YouTube Culture Expert. The user claims these entities are in their video: "{user_entities}".
Rank the current internet virality/hype of these entities on this exact scale:
"S" = Global Megastars (e.g., MrBeast, Cristiano Ronaldo, Elon Musk)
"A" = Massive Internet Culture/Meme icons (e.g., IShowSpeed, Kai Cenat, Samay Raina)
"B" = Niche/Growing popularity (e.g., specific anime, standard vloggers, emerging TikTok trends)
"None" = Unknown or zero hype.

Return ONLY a valid JSON object. Example: {{"tier": "A"}}"""

        try:
            res = ollama_with_timeout(
                model='llama3',
                messages=[{'role': 'user', 'content': zeitgeist_prompt}],
                timeout=90
            )
            result_json = safe_parse_json(res['message']['content'])
            entity_tier = result_json.get("tier", "None")

            if entity_tier == "S":   entity_multiplier = 1.8
            elif entity_tier == "A": entity_multiplier = 1.58
            elif entity_tier == "B": entity_multiplier = 1.32

            print(f"📈 Entity Tier: {entity_tier} | Applying {entity_multiplier}x Multiplier")
        except Exception as e:
            print(f"❌ ZEITGEIST ERROR: {str(e)}")

    final_score = round(min(100.0, base_score * entity_multiplier), 1)

    # ------------------------------------------
    # PHASE 4: CONSULTANT (Llama 3)
    # ------------------------------------------
    print("🧠 Executing Strategic Reasoner (Llama 3 → Ollama GPU)...")

    cohesion_label = (
        "EXCELLENT — thumbnail and title are strongly aligned" if cohesion >= 0.35
        else "GOOD — solid alignment" if cohesion >= 0.28
        else "AVERAGE — some disconnect between image and title" if cohesion >= 0.23
        else "WEAK — thumbnail does not match the title promise" if cohesion >= 0.21
        else "STRONG CLICKBAIT — thumbnail intentionally mismatches title"
    )

    consultant_prompt = f"""You are an elite, data-driven YouTube Strategist.

Video Title: {title}
Predicted Virality Score: {final_score}/100 (Base Score: {base_score:.1f}, Entity Boost: {entity_multiplier}x)
User's Highlighted Entities: {user_entities if user_entities else 'None'}
Viral Hook: {hook}
Thumbnail Description (from Vision AI): {thumbnail_desc}
Thumbnail Cohesion Score: {cohesion:.4f}/1.0
Cohesion Classification (PRE-COMPUTED BY CLIP — accept as ground truth): {cohesion_label}

Write a direct 3-bullet-point strategy report:
1. Score Analysis: Explain the final score. If there's a big entity boost, explain how leveraging that entity carries the video. If the base score is low, explain why the core idea needs work.
2. Cohesion & Visuals: Treat the cohesion classification above as absolute fact. If GOOD or EXCELLENT, confirm alignment and suggest only minor polish. If WEAK or CLICKBAIT, explain the disconnect and give a specific fix.
3. Rewrite: Give a completely rewritten, high-retention hook."""

    try:
        strategy_res = ollama_with_timeout(
            model='llama3',
            messages=[{'role': 'user', 'content': consultant_prompt}],
            timeout=120
        )
        strategy_report = strategy_res['message']['content']
    except Exception as e:
        print(f"❌ REASONER ERROR: {str(e)}")
        strategy_report = "Error generating strategy."

    print("✅ Analysis Complete! Sending to Frontend.")
    print(f"{'='*50}")

    return {
        "title": title,
        "base_structural_score": round(base_score, 1),
        "entity_tier": entity_tier,
        "entity_multiplier": entity_multiplier,
        "final_virality_score": final_score,
        "cohesion_score": round(cohesion, 4),
        "thumbnail_analysis": thumbnail_desc,
        "ai_strategy_report": strategy_report
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)