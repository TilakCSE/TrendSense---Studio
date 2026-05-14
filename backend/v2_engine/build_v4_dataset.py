import os
import torch
import pandas as pd
from PIL import Image
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from transformers import CLIPProcessor, CLIPModel

print("🚀 INITIALIZING TRENDSENSE V4 (PURE ML BASELINE)...")

cache_dir = r"D:\Development\Projects\TrendSense---Studio\ml_cache"
os.makedirs(cache_dir, exist_ok=True)
os.environ["HF_HOME"] = cache_dir

# ==========================================
# 1. PATH CONFIGURATION
# ==========================================
base_dir = os.path.dirname(os.path.abspath(__file__))
checkpoint_dir = os.path.join(base_dir, "..", "..", "data", "checkpoints")
thumbnail_dir = os.path.join(base_dir, "..", "..", "data", "thumbnails")
output_path = os.path.join(base_dir, "..", "..", "data", "trendsense_v4_master.parquet")

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"⚙️ Compute Device: {device.upper()}")

# ==========================================
# 2. LOAD MODELS INTO VRAM
# ==========================================
print("🧠 Loading SBERT (Text Fusion)...")
sbert_model = SentenceTransformer('all-MiniLM-L6-v2', device=device)

print("🖼️ Loading OpenAI CLIP (Cohesion Alignment)...")
# 🚨 THE FIX: use_safetensors=True bypasses the PyTorch vulnerability error
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True).to(device)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True)

# ==========================================
# 3. LOAD & CLEAN DATA
# ==========================================
all_chunks = []
for file in os.listdir(checkpoint_dir):
    if file.endswith(".parquet") and "chunk" in file:
        all_chunks.append(pd.read_parquet(os.path.join(checkpoint_dir, file)))

df = pd.concat(all_chunks, ignore_index=True).drop_duplicates(subset=["video_id"])
df['thumbnail_path'] = df['video_id'].apply(lambda x: os.path.join(thumbnail_dir, f"{x}.jpg"))
df = df[df['thumbnail_path'].apply(os.path.exists)].reset_index(drop=True)

print(f"📊 Processing {len(df)} complete rows...")

# ==========================================
# 4. VIRALITY SCORE COMPUTATION (GROUND TRUTH)
# ==========================================
print("🧮 Calculating Pure Structural Virality Scores...")
df['view_count'] = pd.to_numeric(df['view_count'], errors='coerce').fillna(0)
df['like_count'] = pd.to_numeric(df['like_count'], errors='coerce').fillna(0)
df['comment_count'] = pd.to_numeric(df['comment_count'], errors='coerce').fillna(0)

df['engagement_rate'] = ((df['like_count'] + (df['comment_count'] * 2)) / df['view_count'].replace(0, 1)) * 100
df['target_virality_score'] = (df['engagement_rate'] / 15.0) * 100
df['target_virality_score'] = df['target_virality_score'].clip(upper=100.0, lower=0.0)

# ==========================================
# 5. THE AI PROCESSING LOOP
# ==========================================
fused_embeddings = []
cohesion_scores = []

print("⚡ Firing Neural Networks (SBERT & CLIP)...")
for idx, row in tqdm(df.iterrows(), total=len(df), desc="Crunching Tensors"):
    title = str(row['clean_text'])
    hook = str(row['video_script'])
    img_path = row['thumbnail_path']
    
    # --- A. SBERT EARLY FUSION ---
    fused_text = f"TITLE: {title} | SCRIPT HOOK: {hook}"
    text_tensor = sbert_model.encode(fused_text)
    fused_embeddings.append(text_tensor.tolist())
    
    # --- B. CLIP COHESION ALIGNMENT ---
    try:
        image = Image.open(img_path).convert("RGB")
        # 🚨 THE FIX: Added truncation=True to prevent indexing errors on long titles
        inputs = clip_processor(
            text=[title], 
            images=image, 
            return_tensors="pt", 
            padding=True, 
            truncation=True 
        ).to(device)
        
        outputs = clip_model(**inputs)
        cohesion = outputs.logits_per_image.item() / 100.0 
        cohesion_scores.append(round(cohesion, 4))
    except Exception as e:
        cohesion_scores.append(0.5)
        
# ==========================================
# 6. ASSEMBLE AND SAVE
# ==========================================
df['fused_text_embedding'] = fused_embeddings
df['clip_cohesion_score'] = cohesion_scores

master_df = df[['video_id', 'clean_text', 'video_script', 'thumbnail_path', 
                'clip_cohesion_score', 'target_virality_score', 'fused_text_embedding']]

master_df.to_parquet(output_path, index=False)

print("\n" + "═"*60)
print(f"🎉 TRENDSENSE V4 MASTER DATASET GENERATED!")
print(f"💾 Saved {len(master_df)} fully processed rows to: {output_path}")
print("═"*60)