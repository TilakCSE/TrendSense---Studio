import os
import torch
import pandas as pd
import numpy as np
from PIL import Image
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from transformers import CLIPProcessor, CLIPModel

# 🚨 THE SHIELD
cache_dir = r"D:\Development\Projects\TrendSense---Studio\ml_cache"
os.environ["HF_HOME"] = cache_dir

print("🚀 INITIALIZING TRENDSENSE V7 (PERCENTILE RANK + BATCH GPU)...")

# ==========================================
# PATH CONFIGURATION
# ==========================================
base_dir = os.path.dirname(os.path.abspath(__file__))
checkpoint_dir = os.path.join(base_dir, "..", "..", "data", "checkpoints")
thumbnail_dir  = os.path.join(base_dir, "..", "..", "data", "thumbnails")
output_path    = os.path.join(base_dir, "..", "..", "data", "trendsense_v7_master.parquet")

if not torch.cuda.is_available():
    raise RuntimeError(
        "❌ CUDA NOT FOUND.\n"
        "Fix: pip install torch --index-url https://download.pytorch.org/whl/cu121"
    )
device = "cuda"
print(f"✅ GPU: {torch.cuda.get_device_name(0)} | VRAM: {torch.cuda.get_device_properties(0).total_memory // 1024**2}MB")

# ==========================================
# LETTERBOX — preserves aspect ratio for CLIP
# Without this CLIP receives a squashed 16:9 image
# and cohesion scores tank on all widescreen thumbnails
# ==========================================
def letterbox_image(image: Image.Image, target_size=(224, 224)) -> Image.Image:
    width, height = image.size
    max_dim = max(width, height)
    square = Image.new("RGB", (max_dim, max_dim), (0, 0, 0))
    square.paste(image, ((max_dim - width) // 2, (max_dim - height) // 2))
    return square.resize(target_size, Image.Resampling.LANCZOS)

# ==========================================
# LOAD MODELS → GPU
# ==========================================
print("🧠 Loading SBERT → GPU...")
sbert_model = SentenceTransformer('all-MiniLM-L6-v2', device=device)

print("🖼️ Loading CLIP → GPU...")
clip_model     = CLIPModel.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True).to(device)
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32", use_safetensors=True)
clip_model.eval()

# ==========================================
# LOAD & CLEAN DATA
# ==========================================
all_chunks = []
for file in sorted(os.listdir(checkpoint_dir)):
    if file.endswith(".parquet") and "chunk" in file:
        all_chunks.append(pd.read_parquet(os.path.join(checkpoint_dir, file)))

if not all_chunks:
    raise FileNotFoundError(f"No chunk parquet files found in {checkpoint_dir}")

df = pd.concat(all_chunks, ignore_index=True).drop_duplicates(subset=["video_id"])
df['thumbnail_path'] = df['video_id'].apply(lambda x: os.path.join(thumbnail_dir, f"{x}.jpg"))
df = df[df['thumbnail_path'].apply(os.path.exists)].reset_index(drop=True)
print(f"📊 {len(df)} complete rows loaded (dupes dropped, thumbnails verified)")

# ==========================================
# VIRALITY SCORE — FIXED: PERCENTILE RANK
# ==========================================
# THE OLD BUG: dividing by hardcoded 15.0 crushed every score.
# A video with 4% engagement (genuinely viral on YouTube) scored only 26/100.
#
# THE FIX: percentile rank within the dataset.
# A video at the 85th percentile of engagement scores 85/100.
# This is relative scoring — it reflects how a video performs vs its peers,
# which is exactly what "virality" means.
# ==========================================
df['view_count']    = pd.to_numeric(df['view_count'],    errors='coerce').fillna(0)
df['like_count']    = pd.to_numeric(df['like_count'],    errors='coerce').fillna(0)
df['comment_count'] = pd.to_numeric(df['comment_count'], errors='coerce').fillna(0)

# Weighted engagement: comments carry 2x weight (higher intent signal than likes)
df['engagement_rate'] = (
    (df['like_count'] + (df['comment_count'] * 2)) /
    df['view_count'].replace(0, 1)
) * 100

# Percentile rank across the whole dataset, scaled to 0-100
df['target_virality_score'] = df['engagement_rate'].rank(pct=True) * 100
df['target_virality_score'] = df['target_virality_score'].clip(upper=100.0, lower=0.0)

# Print score distribution so you can verify it looks healthy (should spread 0-100)
print("\n📈 Target Score Distribution (should be roughly uniform 0-100):")
print(df['target_virality_score'].describe().round(2))
score_buckets = pd.cut(df['target_virality_score'], bins=[0,20,40,60,80,100]).value_counts().sort_index()
print("\nScore bucket counts:")
print(score_buckets.to_string())
print()

# ==========================================
# AI PROCESSING LOOP — BATCH GPU
# ==========================================
# OLD: processed one image at a time → slow, doesn't saturate GPU
# NEW: SBERT uses built-in batch_size param; CLIP processes in batches of 64
#      This will be significantly faster on your RTX 3050
# ==========================================

CLIP_BATCH_SIZE = 64  # Tune down to 32 if you hit OOM on 4GB VRAM

# --- SBERT: encode all titles+hooks in one batched call ---
print("🧠 Running SBERT batch encode (all rows at once)...")
fused_texts = [
    f"TITLE: {str(row['clean_text'])} | SCRIPT HOOK: {str(row['video_script'])}"
    for _, row in df.iterrows()
]
# show_progress_bar=True gives you a tqdm bar inside SBERT
all_embeddings = sbert_model.encode(
    fused_texts,
    batch_size=128,
    show_progress_bar=True,
    convert_to_numpy=True,
    device=device
)
print(f"✅ SBERT done. Embedding shape: {all_embeddings.shape}")

# --- CLIP: batch process thumbnails ---
print("\n🖼️ Running CLIP batch cohesion scoring...")
cohesion_scores = []
titles = df['clean_text'].tolist()
img_paths = df['thumbnail_path'].tolist()

for batch_start in tqdm(range(0, len(df), CLIP_BATCH_SIZE), desc="CLIP Batches"):
    batch_end    = min(batch_start + CLIP_BATCH_SIZE, len(df))
    batch_titles = titles[batch_start:batch_end]
    batch_paths  = img_paths[batch_start:batch_end]

    batch_images = []
    valid_mask   = []  # track which items loaded successfully

    for path in batch_paths:
        try:
            img = Image.open(path).convert("RGB")
            batch_images.append(letterbox_image(img))
            valid_mask.append(True)
        except Exception:
            # Corrupted/missing image — use a black placeholder so batch size stays consistent
            batch_images.append(Image.new("RGB", (224, 224), (0, 0, 0)))
            valid_mask.append(False)

    try:
        inputs = clip_processor(
            text=batch_titles,
            images=batch_images,
            return_tensors="pt",
            padding=True,
            truncation=True
        ).to(device)

        with torch.no_grad():
            outputs = clip_model(**inputs)
            # logits_per_image shape: [batch_size, batch_size] (image-text similarity matrix)
            # Diagonal = each image matched with its own title
            raw_logits = torch.diag(outputs.logits_per_image).cpu().numpy()

        for i, (logit, valid) in enumerate(zip(raw_logits, valid_mask)):
            if valid:
                cohesion_scores.append(round(float(logit) / 100.0, 4))
            else:
                cohesion_scores.append(None)  # Mark failed images as None, not 0.5

    except Exception as e:
        print(f"❌ CLIP batch {batch_start}-{batch_end} failed: {e}")
        cohesion_scores.extend([None] * len(batch_titles))

    # Free VRAM between batches
    torch.cuda.empty_cache()

# ==========================================
# COHESION SCORE DIAGNOSTICS
# ==========================================
cohesion_series = pd.Series(cohesion_scores)
failed_count = cohesion_series.isna().sum()
print(f"\n📊 Cohesion Score Distribution (letterboxed CLIP):")
print(cohesion_series.describe().round(4))
print(f"⚠️  Failed image loads: {failed_count} ({failed_count/len(df)*100:.1f}%)")

# Fill failed cohesion with the MEDIAN of successful scores (not 0.5 — data-driven default)
median_cohesion = cohesion_series.median()
cohesion_series = cohesion_series.fillna(median_cohesion)
print(f"✅ Failed images filled with dataset median: {median_cohesion:.4f}")

# Print percentile thresholds — use these to set your clickbait threshold in api.py
# instead of the hardcoded 0.5
p10 = cohesion_series.quantile(0.10)
p25 = cohesion_series.quantile(0.25)
p50 = cohesion_series.quantile(0.50)
print(f"\n🎯 COHESION THRESHOLDS FOR api.py (copy these):")
print(f"   Bottom 10% (strong clickbait signal): < {p10:.4f}")
print(f"   Bottom 25% (weak cohesion):           < {p25:.4f}")
print(f"   Median (neutral):                       {p50:.4f}")

# ==========================================
# ASSEMBLE AND SAVE
# ==========================================
df['fused_text_embedding'] = all_embeddings.tolist()
df['clip_cohesion_score']  = cohesion_series.values

master_df = df[[
    'video_id', 'clean_text', 'video_script', 'thumbnail_path',
    'clip_cohesion_score', 'target_virality_score', 'fused_text_embedding'
]].copy()

master_df.to_parquet(output_path, index=False)

vram_used = torch.cuda.memory_allocated(0) // 1024**2
print(f"\n{'═'*60}")
print(f"🎉 TRENDSENSE V7 DATASET SAVED!")
print(f"📁 Path:  {output_path}")
print(f"📊 Rows:  {len(master_df)}")
print(f"🔥 GPU VRAM used at exit: {vram_used}MB")
print(f"{'═'*60}")
print(f"\n⚡ NEXT STEP: Run train_trendsense.py — it will load trendsense_v7_master.parquet")