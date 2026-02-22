import pandas as pd
import numpy as np

def standardize_datasets(kaggle_df: pd.DataFrame, reddit_df: pd.DataFrame) -> pd.DataFrame:
    """
    Standardizes Kaggle historical CSVs and Reddit real-time DataFrame to universal columns:
    'text', 'engagement_score', and 'timestamp'.
    """
    
    # 1. Standardize Kaggle Dataset (Assuming Sentiment140 format or similar generic text/sentiment csv)
    kaggle_std = pd.DataFrame()
    
    if 'text' in kaggle_df.columns:
        kaggle_std['text'] = kaggle_df['text']
    elif 'tweet' in kaggle_df.columns:
         kaggle_std['text'] = kaggle_df['tweet']
    else:
        # Fallback to the first string column that looks like text
        text_cols = kaggle_df.select_dtypes(include=['object']).columns
        if len(text_cols) > 0:
            kaggle_std['text'] = kaggle_df[text_cols[0]]
        else:
            kaggle_std['text'] = ''
            
    # Map engagement/sentiment for Kaggle
    if 'target' in kaggle_df.columns:
        kaggle_std['engagement_score'] = kaggle_df['target']
    elif 'sentiment' in kaggle_df.columns:
        kaggle_std['engagement_score'] = kaggle_df['sentiment']
    else:
        kaggle_std['engagement_score'] = 1 # baseline
        
    # Map timestamp for kaggle
    if 'date' in kaggle_df.columns:
        kaggle_std['timestamp'] = pd.to_datetime(kaggle_df['date'], errors='coerce')
    else:
        kaggle_std['timestamp'] = pd.Timestamp.now()
        
    # 2. Standardize Reddit Dataset
    reddit_std = pd.DataFrame()
    
    if not reddit_df.empty:
        reddit_std['text'] = reddit_df['title']
        
        # Combine score and comments as a basic engagement_score metric
        # simple heuristic: score + (comments * 2)
        reddit_std['engagement_score'] = reddit_df['score'] + (reddit_df['num_comments'] * 2)
        
        reddit_std['timestamp'] = pd.to_datetime(reddit_df['created_utc'], unit='s', errors='coerce')
    
    # 3. Concatenate and clean
    hybrid_df = pd.concat([kaggle_std, reddit_std], ignore_index=True)
    
    # Clean up missed texts
    hybrid_df.dropna(subset=['text'], inplace=True)
    
    # Ensure text is string
    hybrid_df['text'] = hybrid_df['text'].astype(str)
    
    # Fill missing timestamps
    hybrid_df['timestamp'] = hybrid_df['timestamp'].fillna(pd.Timestamp.now())
    
    # Fill missing engagement with median or 0
    hybrid_df['engagement_score'] = hybrid_df['engagement_score'].fillna(0)
    
    return hybrid_df
