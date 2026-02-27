import pandas as pd
import logging
from mongo_client import MongoDBClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def compute_metrics():
    """
    Connects to MongoDB and computes vital statistics using Aggregation Pipelines and Pandas.
    Operates within M0 memory limits.
    """
    try:
        db_client = MongoDBClient()
        db = db_client.db
        
        hist_col = db["historical_youtube"]
        live_col = db["live_trends"]

        logger.info("Computing MongoDB Metrics... (This may take a moment)")
        
        # 1. Document Counts
        hist_count = hist_col.count_documents({})
        live_count = live_col.count_documents({})
        
        # 2. Historical Constraints: Missing % and Engagement Score Stats
        # We use an aggregation pipeline to calculate min/max/avg and missing fields efficiently
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "min_engagement": {"$min": "$engagement_score"},
                    "max_engagement": {"$max": "$engagement_score"},
                    "avg_engagement": {"$avg": "$engagement_score"},
                    "missing_text_count": {"$sum": {"$cond": [{"$ifNull": ["$text", False]}, 0, 1]}},
                    "missing_views_count": {"$sum": {"$cond": [{"$ifNull": ["$views", False]}, 0, 1]}},
                    "missing_likes_count": {"$sum": {"$cond": [{"$ifNull": ["$likes", False]}, 0, 1]}}
                }
            }
        ]
        
        hist_stats_cursor = list(hist_col.aggregate(pipeline))
        hist_stats = hist_stats_cursor[0] if hist_stats_cursor else {}

        # Safe extraction
        min_eng = hist_stats.get("min_engagement", "N/A")
        max_eng = hist_stats.get("max_engagement", "N/A")
        avg_eng = hist_stats.get("avg_engagement", "N/A")
        
        # Missing % Calculation
        if hist_count > 0:
            missing_text_pct = (hist_stats.get("missing_text_count", 0) / hist_count) * 100
            missing_views_pct = (hist_stats.get("missing_views_count", 0) / hist_count) * 100
            missing_likes_pct = (hist_stats.get("missing_likes_count", 0) / hist_count) * 100
        else:
            missing_text_pct = missing_views_pct = missing_likes_pct = 0.0

        # 3. Skewness for `views` field using Pandas (fetching only the views field)
        # We limit the fetch to just the single needed field to save M0 RAM
        logger.info("Fetching 'views' projection to compute pandas skewness...")
        views_cursor = hist_col.find({}, {"views": 1, "_id": 0})
        views_df = pd.DataFrame(list(views_cursor))
        
        if not views_df.empty and 'views' in views_df.columns:
            views_df['views'] = pd.to_numeric(views_df['views'], errors='coerce')
            views_skewness = views_df['views'].skew()
        else:
            views_skewness = "N/A"

        # 4. Print Summary
        summary = f"""
=================================================
          MongoDB Atlas - TrendSense Metrics
=================================================

--- Document Totals ---
Historical YouTube Count : {hist_count:,}
Live Trends Count        : {live_count:,}

--- Data Integrity (Historical) ---
Missing 'text' (%)       : {missing_text_pct:.2f}%
Missing 'views' (%)      : {missing_views_pct:.2f}%
Missing 'likes' (%)      : {missing_likes_pct:.2f}%

--- Engagement Score Stats (Historical) ---
Min Engagement Score     : {min_eng if isinstance(min_eng, str) else f"{min_eng:.2f}"}
Max Engagement Score     : {max_eng if isinstance(max_eng, str) else f"{max_eng:.2f}"}
Mean Engagement Score    : {avg_eng if isinstance(avg_eng, str) else f"{avg_eng:.2f}"}

--- Distribution ---
Views Skewness           : {views_skewness if isinstance(views_skewness, str) else f"{views_skewness:.4f}"}

=================================================
"""
        print(summary)

    except Exception as e:
        logger.error(f"Failed to compute metrics: {e}")
    finally:
        if 'db_client' in locals():
            db_client.close()

if __name__ == "__main__":
    compute_metrics()
