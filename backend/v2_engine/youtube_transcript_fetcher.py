"""
TrendSense v3 — PURE API TURBO EDITION
=====================================
Combines Claude's enterprise-grade execution engine with the lightweight, 
BotGuard-immune API Fast-Pass strategy. 

THE STRATEGY:
  - NO yt-dlp. NO FFmpeg. NO Whisper. NO GPU VRAM limits.
  - Pure lightweight JSON requests masking as normal web traffic.
  - If a video is dead, geo-blocked, or has no captions, it drops instantly.
  - We use a massive 20-thread pool because API requests use almost zero CPU/RAM.
"""

import os
import time
import concurrent.futures
import pandas as pd
from tqdm import tqdm
from youtube_transcript_api import YouTubeTranscriptApi
from deep_translator import GoogleTranslator

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

# Uses your exported text file to bypass Age Restrictions
COOKIE_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "cookies.txt")
)

# Since we are just making tiny text requests, we can crank this up safely.
NET_WORKERS = 20 

# ---------------------------------------------------------------------------
# PIPELINE
# ---------------------------------------------------------------------------

class PureTextPipeline:

    def _extract_plain_text(self, transcript_data):
        words = []
        for item in transcript_data:
            text = (
                item.get("text", "") if isinstance(item, dict)
                else getattr(item, "text", "")
            )
            if text:
                words.append(str(text))
        return " ".join(words)

    def get_best_transcript(self, video_id):
        try:
            # 🚨 THE FIX: Instantiate the new v1.2.0 API object and DROP the disabled cookies!
            ytt_api = YouTubeTranscriptApi()
            transcript_list = ytt_api.list(video_id)
            
            # Phase 1: Native English (Manual or Auto-Generated)
            try:
                return self._extract_plain_text(
                    transcript_list.find_transcript(["en"]).fetch()
                )
            except Exception:
                pass

            # Phase 2: YouTube's Native API Translation
            try:
                first = list(transcript_list)[0]
                if first.is_translatable:
                    return self._extract_plain_text(first.translate("en").fetch())
            except Exception:
                pass

            # Phase 3: Deep-Translate via Google (300-word budget for speed)
            try:
                first = list(transcript_list)[0]
                raw = self._extract_plain_text(first.fetch())
                if raw:
                    limited = " ".join(raw.split()[:300])
                    return GoogleTranslator(source="auto", target="en").translate(limited)
            except Exception:
                pass

        except Exception:
            # If BotGuard blocks it, it's age-restricted, or the video is deleted, fail silently.
            pass

        return None

    def process_video(self, video_id):
        try:
            result = self.get_best_transcript(video_id)
            if result:
                # Return exactly the 150-word Viral Hook
                return " ".join(str(result).split()[:150])
        except Exception:
            pass
        return None

# =============================================================
# EXECUTION ENGINE (Claude's Architecture)
# =============================================================

if __name__ == "__main__":
    print("\n🚀 TrendSense v3 — PURE API TURBO EDITION")
    print("   No GPU | 100% Text Extraction | 20 Net Threads\n")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "..", "..", "data", "v2_cleaned_trends_FULL.parquet")
    checkpoint_dir = os.path.join(base_dir, "..", "..", "data", "checkpoints")
    os.makedirs(checkpoint_dir, exist_ok=True)

    print("📂 Loading dataset...")
    master_df = pd.read_parquet(data_path).drop_duplicates("video_id")

    # We can target a massive number of rows because text extraction is lightning fast
    DAILY_TARGET = 50_000
    CHUNK_SIZE = 1_000

    # Resume logic from checkpoints
    valid_chunks = []
    for f in os.listdir(checkpoint_dir):
        if not (f.startswith("v3_chunk_") and f.endswith(".parquet")):
            continue
        try:
            if len(pd.read_parquet(os.path.join(checkpoint_dir, f))) > 0:
                valid_chunks.append(f)
        except Exception:
            print(f"⚠️  Ignoring corrupted checkpoint: {f}")

    completed_chunks = len(valid_chunks)
    
    # 🚨 Manual override: Keep this at 0 if you want to start from the beginning
    # Or set it to wherever you want to resume testing.
    start_row = completed_chunks * CHUNK_SIZE 
    
    nightly_df = master_df.iloc[start_row : start_row + DAILY_TARGET].copy()
    total_chunks = (len(nightly_df) + CHUNK_SIZE - 1) // CHUNK_SIZE

    pipeline = PureTextPipeline()
    total_success = 0

    print(f"📍 Resuming Row   : {start_row:,}")
    print(f"🎯 Target Tonight : {DAILY_TARGET:,}")
    print(f"⚙️  Net Threads    : {NET_WORKERS}")
    print(f"📦 Chunk Size     : {CHUNK_SIZE}")
    print(f"🗂️  Total Chunks   : {total_chunks}\n")

    try:
        for i in range(total_chunks):
            chunk_start = i * CHUNK_SIZE
            chunk_end = min(chunk_start + CHUNK_SIZE, len(nightly_df))
            chunk_df = nightly_df.iloc[chunk_start:chunk_end].copy()
            abs_chunk = completed_chunks + i + 1

            print(
                f"⚙️  Chunk {abs_chunk}/{completed_chunks + total_chunks}"
                f"  (Rows {start_row + chunk_start:,}–{start_row + chunk_end:,})"
            )

            with concurrent.futures.ThreadPoolExecutor(max_workers=NET_WORKERS) as executor:
                # Map ensures results stay in the exact same order as the DataFrame
                results = list(
                    tqdm(
                        executor.map(pipeline.process_video, chunk_df["video_id"]),
                        total=len(chunk_df),
                        desc="Harvesting Text",
                    )
                )

            chunk_df["video_script"] = results
            success_chunk = chunk_df.dropna(subset=["video_script"])
            total_success += len(success_chunk)

            save_path = os.path.join(checkpoint_dir, f"v3_chunk_{abs_chunk}.parquet")
            success_chunk.to_parquet(save_path, index=False)
            
            print(f"✅ Yield: {len(success_chunk)} hooks | Running total: {total_success:,}")
            time.sleep(1) # Tiny breather to keep YouTube happy

    except KeyboardInterrupt:
        print("\n🛑 Manual Stop Detected. Saving progress...")
    
    finally:
        print(f"\n🎉 FAST-PASS HARVEST COMPLETE")
        print(f"✅ Total Successful Transcripts: {total_success:,}")