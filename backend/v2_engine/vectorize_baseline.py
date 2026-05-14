import pandas as pd
import os
from sentence_transformers import SentenceTransformer
import numpy as np

print("🚀 Initializing TrendSense MVP Vectorizer...")

checkpoint_dir = "../../data/checkpoints"
all_chunks = []

# 1. Merge all the 1.7k rows into one master dataframe
for file in os.listdir(checkpoint_dir):
    if file.endswith(".parquet"):
        all_chunks.append(pd.read_parquet(os.path.join(checkpoint_dir, file)))

df = pd.concat(all_chunks, ignore_index=True)
print(f"📊 Loaded {len(df)} viral hooks.")

# 2. Clean the text (remove empty rows, force string type)
df['video_script'] = df['video_script'].astype(str).str.strip()
df = df[df['video_script'] != ""]

# 3. Load the embedding model (Downloads automatically if not cached)
print("🧠 Loading NLP Embedder...")
model = SentenceTransformer('all-MiniLM-L6-v2')

# 4. Crunch the text into vectors (This takes CPU/GPU time)
print("⚙️ Vectorizing transcripts... (Go play cricket!)")
embeddings = model.encode(df['video_script'].tolist(), show_progress_bar=True)

# 5. Save the pure ML-ready dataset
df['embeddings'] = list(embeddings)
out_path = "../../data/trendsense_baseline_MVP.parquet"
df.to_parquet(out_path, index=False)

print(f"\n✅ DONE! ML-Ready Baseline saved to {out_path}")