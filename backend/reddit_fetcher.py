import requests
import pandas as pd
import time
import logging

logger = logging.getLogger(__name__)

def fetch_daily_reddit_trends(subreddits=None, limit=100):
    """
    Connects to Reddit public JSON endpoints and scrapes the top rising posts.
    """
    if subreddits is None:
        subreddits = ['GenZ', 'technology', 'memes']
        
    headers = {'User-Agent': 'TrendSense/1.0 by Tilak'}
    posts_data = []
    
    logger.info(f"Starting Reddit fetch for subreddits: {subreddits}")
    
    for subreddit in subreddits:
        url = f"https://www.reddit.com/r/{subreddit}/rising.json?limit={limit}"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
            
            children = data.get('data', {}).get('children', [])
            for child in children:
                post = child.get('data', {})
                posts_data.append({
                    'title': post.get('title', ''),
                    'score': post.get('score', 0),
                    'num_comments': post.get('num_comments', 0),
                    'created_utc': post.get('created_utc', 0),
                    'upvote_ratio': post.get('upvote_ratio', 1.0) # Extraction of upvote_ratio
                })
            logger.info(f"Successfully fetched {len(children)} posts from r/{subreddit}")
        except Exception as e:
            logger.error(f"Error fetching from r/{subreddit}: {e}")
            
        # Smart rate limiting to stay within unauthenticated limits
        logger.debug("Sleeping for rate limits...")
        time.sleep(2)
        
    df = pd.DataFrame(posts_data)
    
    if not df.empty:
        # Convert UTC timestamp to readable datetime
        df['datetime'] = pd.to_datetime(df['created_utc'], unit='s')
        
    return df

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logger.info("Fetching Reddit test data...")
    test_df = fetch_daily_reddit_trends(limit=5)
    if not test_df.empty:
        print(test_df.head())
    else:
        logger.warning("No data fetched.")
