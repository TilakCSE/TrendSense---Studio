import pandas as pd
import os
from youtube_transcript_api import YouTubeTranscriptApi

print("📂 Loading dataset to inspect the Row 9,000 Graveyard...\n")

base_dir = os.path.dirname(os.path.abspath(__file__))
# Ensure this path matches your setup
data_path = os.path.join(base_dir, "..", "data", "v2_cleaned_trends_FULL.parquet")

df = pd.read_parquet(data_path).drop_duplicates("video_id")

# Grab 5 videos specifically from the chunk that yielded 0 hooks
test_vids = df.iloc[9000:9005]['video_id'].tolist()

ytt_api = YouTubeTranscriptApi()

for vid in test_vids:
    print(f"🔍 Testing Video ID: {vid}")
    print(f"🔗 Link: https://youtube.com/watch?v={vid}")
    try:
        transcript_list = ytt_api.list(vid)
        print("  ✅ SUCCESS: API connected! Found transcripts:")
        for t in transcript_list:
            print(f"     - Language: {t.language_code} (Auto-Generated: {t.is_generated})")
    except Exception as e:
        # We are catching the exact exception name and printing the message
        error_type = type(e).__name__
        print(f"  ❌ FAILED: {error_type}")
        
        # Some API errors are very long, we just want the core reason
        error_msg = str(e).split('\n')[0] 
        print(f"  📝 Reason: {error_msg}")
    print("-" * 60)