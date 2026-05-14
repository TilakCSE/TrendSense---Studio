import pandas as pd
import os
import glob
import time
from tqdm import tqdm
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

ytt_api = YouTubeTranscriptApi()
formatter = TextFormatter()

def get_viral_hook(video_id: str):
    if not video_id: return None
    try:
        # 1. Ask YouTube what transcripts are available
        transcript_list = ytt_api.list_transcripts(video_id)
        
        try:
            # 2. Try to grab the native English one first
            transcript = transcript_list.find_transcript(['en']).fetch()
        except:
            # 3. THE POLYGLOT PIVOT: Translate whatever language is there to English!
            transcript = list(transcript_list)[0].translate('en').fetch()

        full_script = formatter.format_transcript(transcript)
        clean_script = " ".join(full_script.split())
        
        # Isolate the 150-word viral hook
        words = clean_script.split(' ')
        return ' '.join(words[:150])
        
    except Exception:
        # Subtitles are completely disabled by the creator
        return None

if __name__ == "__main__":
    print("🧪 Initializing Polyglot Harvester (100 Row Test Run)...")
    
    data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "v2_cleaned_trends_FULL.parquet"))
    checkpoint_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "checkpoints"))
    
    if not os.path.exists(checkpoint_dir):
        os.makedirs(checkpoint_dir)

    master_df = pd.read_parquet(data_path)
    
    # Check for already completed files
    existing_files = glob.glob(os.path.join(checkpoint_dir, "v3_chunk_*.parquet"))
    completed_ids = set()
    for file in existing_files:
        temp_df = pd.read_parquet(file)
        if 'video_id' in temp_df.columns:
            completed_ids.update(temp_df['video_id'].tolist())
            
    pending_df = master_df[~master_df['video_id'].isin(completed_ids)].copy()
    
    # 🎯 Set the goal to 100 for the test
    test_goal = 10000
    print(f"🚀 Target: Fetching {test_goal} new transcripts with Translation Engine...")
    
    batch_df = pending_df.head(test_goal).copy()
    
    # Run the fetcher
    tqdm.pandas(desc="Harvesting & Translating")
    batch_df['video_script'] = batch_df['video_id'].progress_apply(get_viral_hook)
    
    # Clean and save
    initial_count = len(batch_df)
    batch_df = batch_df.dropna(subset=['video_script'])
    final_count = len(batch_df)
    
    timestamp = int(time.time())
    save_path = os.path.join(checkpoint_dir, f"v3_polyglot_test_{timestamp}.parquet")
    batch_df.to_parquet(save_path, index=False)
    
    print(f"\n🎉 Test run complete! Dropped {initial_count - final_count} NaNs (Disabled Subtitles).")
    print(f"💾 Saved {final_count} translated English hooks to {save_path}")