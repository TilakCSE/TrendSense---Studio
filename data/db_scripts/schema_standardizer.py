import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)

def standardize_youtube_chunk(chunk: pd.DataFrame, country_code: str = "Unknown") -> pd.DataFrame:
    """
    Standardizes a chunk of YouTube data according to the TrendSense schema.
    
    Operations:
    - Renames title to text
    - Converts publish_time to datetime and renames to timestamp
    - Calculates engagement_score: log(1+v) + 0.5*log(1+l) + 0.5*log(1+c)
    - Adds platform="youtube" and country tag
    - Filters only necessary columns
    """
    
    # 1. Rename columns
    rename_map = {
        'title': 'text',
        'publish_time': 'timestamp'
    }
    chunk = chunk.rename(columns=rename_map)
    
    # 2. Convert timestamp
    chunk['timestamp'] = pd.to_datetime(chunk['timestamp'], errors='coerce')
    
    # 3. Calculate Engagement Score
    # Using log1p (log(1+x)) for numerical stability
    views = chunk.get('views', 0)
    likes = chunk.get('likes', 0)
    comments = chunk.get('comment_count', 0)
    
    chunk['engagement_score'] = (
        np.log1p(views) + 
        0.5 * np.log1p(likes) + 
        0.5 * np.log1p(comments)
    )
    
    # 4. Add constant tags
    chunk['platform'] = "youtube"
    chunk['country'] = country_code
    
    # 5. Final column selection
    cols_to_keep = [
        'text', 
        'views', 
        'likes', 
        'comment_count', 
        'timestamp', 
        'category_id', 
        'country', 
        'engagement_score', 
        'platform'
    ]
    
    # Ensure all columns exist before filtering
    final_cols = [c for c in cols_to_keep if c in chunk.columns]
    
    return chunk[final_cols].copy()
