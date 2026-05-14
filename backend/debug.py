import os
from youtube_transcript_api import YouTubeTranscriptApi

# Make sure this points to your actual file
COOKIE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "cookies.txt"))
video_id = "-wtGNhWS_18" # The video we know has audio/captions

print(f"Looking for cookies at: {COOKIE_PATH}")

try:
    transcript_list = YouTubeTranscriptApi.list(video_id, cookies=COOKIE_PATH)
    print("✅ SUCCESS: It connected!")
except Exception as e:
    print(f"❌ INSTANT CRASH REVEALED: {type(e).__name__}\n{e}")