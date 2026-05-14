import os
import requests
import pandas as pd
import concurrent.futures
from tqdm import tqdm

print("🚀 Initializing TrendSense Thumbnail Fetcher (Smart-Skip Edition)...")

# =========================================================
# PATH CONFIGURATION
# =========================================================
base_dir = os.path.dirname(os.path.abspath(__file__))
checkpoint_dir = os.path.join(base_dir, "..", "..", "data", "checkpoints")
thumbnail_dir = os.path.join(base_dir, "..", "..", "data", "thumbnails")
output_path = os.path.join(base_dir, "..", "..", "data", "trendsense_intermediate_MVP.parquet")

os.makedirs(thumbnail_dir, exist_ok=True)

# =========================================================
# 1. MERGE THE CHECKPOINTS
# =========================================================
all_chunks = []
for file in os.listdir(checkpoint_dir):
    if file.endswith(".parquet") and "chunk" in file:
        file_path = os.path.join(checkpoint_dir, file)
        all_chunks.append(pd.read_parquet(file_path))

df = pd.concat(all_chunks, ignore_index=True)
df = df.drop_duplicates(subset=["video_id"])
print(f"📊 Merged checkpoints. Loaded {len(df)} unique viral hooks. Commencing download...")

# =========================================================
# 2. DOWNLOAD LOGIC (WITH SMART SKIP)
# =========================================================
def download_thumbnail(video_id):
    save_path = os.path.join(thumbnail_dir, f"{video_id}.jpg")
    
    # SMART SKIP: Instantly return if the file is already there
    if os.path.exists(save_path):
        return video_id, save_path, "skipped"

    urls_to_try = [
        f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
        f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
    ]

    for url in urls_to_try:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                with open(save_path, 'wb') as f:
                    f.write(response.content)
                return video_id, save_path, "downloaded"
        except requests.RequestException:
            pass
            
    return video_id, None, "failed"

# =========================================================
# 3. MULTI-THREADED EXECUTION
# =========================================================
video_ids = df['video_id'].tolist()
results_map = {}
skipped_count = 0
downloaded_count = 0

with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    results = list(tqdm(executor.map(download_thumbnail, video_ids), total=len(video_ids), desc="Processing Images"))

for vid, path, status in results:
    if status == "skipped":
        skipped_count += 1
    elif status == "downloaded":
        downloaded_count += 1
    
    results_map[vid] = path

df['thumbnail_path'] = df['video_id'].map(results_map)

initial_len = len(df)
df = df.dropna(subset=['thumbnail_path'])
dropped = initial_len - len(df)

df.to_parquet(output_path, index=False)

print(f"\n🎉 THUMBNAIL HARVEST COMPLETE")
print(f"⏩ Skipped (Already existed): {skipped_count}")
print(f"📥 Newly Downloaded: {downloaded_count}")
if dropped > 0:
    print(f"⚠️ Dropped {dropped} rows because images could not be found.")
print(f"💾 Saved unified dataset to: {output_path}")