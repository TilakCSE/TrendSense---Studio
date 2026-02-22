import requests
import pandas as pd
import time

def fetch_daily_reddit_trends(subreddits=None, limit=100):
    """
    Connects to Reddit public JSON endpoints and scrapes the top rising posts.
    """
    if subreddits is None:
        subreddits = ['GenZ', 'technology', 'memes']
        
    headers = {'User-Agent': 'TrendSense/1.0 by Tilak'}
    posts_data = []
    
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
                    'created_utc': post.get('created_utc', 0)
                })
        except Exception as e:
            print(f"Error fetching from r/{subreddit}: {e}")
            
        # Smart rate limiting to stay within unauthenticated limits
        time.sleep(2)
        
    df = pd.DataFrame(posts_data)
    
    if not df.empty:
        # Convert UTC timestamp to readable datetime
        df['datetime'] = pd.to_datetime(df['created_utc'], unit='s')
        
    return df

if __name__ == "__main__":
    print("Fetching Reddit test data...")
    test_df = fetch_daily_reddit_trends(limit=5)
    if not test_df.empty:
        print(test_df.head())
    else:
        print("No data fetched.")
