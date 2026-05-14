import pandas as pd
import os
from youtube_transcript_api import YouTubeTranscriptApi

print("🕵️‍♂️ Waking up the API Debugger...")

# 1. Load your dataset
data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "v2_cleaned_trends_FULL.parquet"))
df = pd.read_parquet(data_path)

# 2. Grab the very first Video ID
test_id = df['video_id'].iloc[0]
print(f"🎬 Testing YouTube API with Video ID: '{test_id}'")

# 3. UNMASKED API CALL (No try/except block!)
print("🌐 Firing request to YouTube servers...")
transcript_list = YouTubeTranscriptApi.list_transcripts(test_id)

print("✅ SUCCESS! The API is working.")
print(list(transcript_list))