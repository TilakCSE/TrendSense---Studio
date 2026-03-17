import requests
import pandas as pd
import time
import logging
import os
import sys

# Add data/db_scripts to path for mongo upload
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data', 'db_scripts'))
from upload_live import append_to_mongo

logger = logging.getLogger(__name__)

def fetch_daily_reddit_trends(subreddits=None, limit=50, upload_to_mongo=True):
    """
    Fetches top daily posts from 10+ cultural subreddits.
    Uses top.json?t=day endpoint for highest-engagement posts from last 24 hours.
    Automatically uploads to MongoDB live_trends collection.
    """
    if subreddits is None:
        # Vastness: 10+ subreddits covering Gen Z, tech, memes, culture, news
        subreddits = [
            'GenZ', 'technology', 'memes', 'TikTokCringe',
            'InstagramReality', 'popculturechat', 'Fauxmoi',
            'whitepeopletwitter', 'worldnews', 'Damnthatsinteresting'
        ]

    headers = {'User-Agent': 'TrendSense/2.0 by TilakChauhan'}
    posts_data = []

    logger.info(f"🌐 Starting Reddit fetch for {len(subreddits)} subreddits")
    logger.info(f"📋 Subreddits: {subreddits}")

    for subreddit in subreddits:
        # CRITICAL: Use top.json?t=day for DAILY highest-engagement posts
        url = f"https://www.reddit.com/r/{subreddit}/top.json?t=day&limit={limit}"
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()

            children = data.get('data', {}).get('children', [])
            for child in children:
                post = child.get('data', {})
                posts_data.append({
                    'title': post.get('title', ''),
                    'text': post.get('title', ''),  # Use title as text for standardization
                    'score': post.get('score', 0),
                    'num_comments': post.get('num_comments', 0),
                    'comment_count': post.get('num_comments', 0),  # Alias for MongoDB schema
                    'created_utc': post.get('created_utc', 0),
                    'upvote_ratio': post.get('upvote_ratio', 1.0),
                    'subreddit': subreddit,
                    'platform': 'reddit'
                })
            logger.info(f"  ✅ r/{subreddit}: {len(children)} top daily posts fetched")
        except requests.exceptions.Timeout:
            logger.error(f"  ❌ r/{subreddit}: Request timed out")
        except Exception as e:
            logger.error(f"  ❌ r/{subreddit}: {e}")

        # AGGRESSIVE rate limiting (4 seconds) to prevent Reddit IP bans
        time.sleep(4)

    df = pd.DataFrame(posts_data)

    if not df.empty:
        # Convert UTC timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['created_utc'], unit='s')

        # Calculate engagement_score for MongoDB (weighted formula)
        df['engagement_score'] = (
            df['score'] * 0.6 +
            df['comment_count'] * 0.3 +
            (df['upvote_ratio'] * 100) * 0.1
        )

        logger.info(f"\n✅ Reddit fetch complete. Total posts: {len(df)}")
        logger.info(f"📊 Engagement stats:")
        logger.info(f"   - Avg score: {df['score'].mean():.1f}")
        logger.info(f"   - Avg comments: {df['comment_count'].mean():.1f}")
        logger.info(f"   - Avg engagement: {df['engagement_score'].mean():.1f}")

        # CRITICAL: Upload to MongoDB live_trends collection
        if upload_to_mongo:
            logger.info(f"\n📤 Uploading {len(df)} posts to MongoDB live_trends collection...")
            try:
                append_to_mongo(df, collection_name="live_trends")
                logger.info("✅ MongoDB upload successful!")
            except Exception as e:
                logger.error(f"❌ MongoDB upload failed: {e}")
    else:
        logger.warning("⚠️  No Reddit data fetched. All requests may have failed.")

    return df

if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    logger.info("=== TESTING REDDIT FETCHER WITH MONGODB UPLOAD ===")
    test_df = fetch_daily_reddit_trends(limit=10, upload_to_mongo=True)
    if not test_df.empty:
        print("\n" + "=" * 80)
        print("SAMPLE DATA:")
        print("=" * 80)
        print(test_df[['title', 'score', 'comment_count', 'subreddit', 'engagement_score']].head(10))
    else:
        logger.warning("No data fetched during test.")
