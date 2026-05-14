import re
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

def extract_viral_hook(video_url: str) -> dict:
    """
    Extracts the full transcript from a YouTube video and isolates the 
    first 60 seconds (The 'Viral Hook') for NLP processing.
    """
    try:
        # 1. Extract the Video ID from the URL
        video_id_match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", video_url)
        if not video_id_match:
            return {"status": "error", "message": "Invalid YouTube URL"}
        video_id = video_id_match.group(1)

        # 2. Fetch the raw transcript dictionary
        print(f"📡 Fetching script for Video ID: {video_id}...")
        
        # --- THE FIX: Use the updated instance method ---
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id)
        # ------------------------------------------------
        
        # 3. Clean and format the full script
        formatter = TextFormatter()
        full_script = formatter.format_transcript(transcript)
        clean_script = re.sub(r'\s+', ' ', full_script).replace('\n', ' ').strip()
        
        # 4. Isolate the "Viral Hook" (roughly the first 150-200 words / 60 seconds)
        words = clean_script.split(' ')
        viral_hook = ' '.join(words[:150])

        return {
            "status": "success",
            "video_id": video_id,
            "word_count": len(words),
            "viral_hook": viral_hook,
            "full_script_preview": clean_script[:500] + "..." 
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to fetch transcript: {str(e)}"
        }

# --- TEST THE ENGINE ---
if __name__ == "__main__":
    # Testing on a MrBeast video
    test_url = "https://www.youtube.com/watch?v=0e3GPea1Tyg" 
    result = extract_viral_hook(test_url)
    
    if result["status"] == "success":
        print(f"✅ Success! Total Words: {result['word_count']}")
        print(f"🔥 The Viral Hook (First 150 words):\n{result['viral_hook']}")
    else:
        print(f"❌ Failed: {result['message']}")