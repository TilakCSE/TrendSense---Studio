import os
import re
import emoji
from pyspark.sql import SparkSession
import pyspark.sql.functions as F
from pyspark.sql.types import StringType

# 1. Initialize the Spark Cluster (Running locally for now, but ready for the cloud)
print("⏳ [Spark Cluster] Initializing Apache Spark Session...")
spark = SparkSession.builder \
    .appName("TrendSense_MultiModal_ETL") \
    .config("spark.driver.memory", "8g") \
    .config("spark.executor.memory", "8g") \
    .getOrCreate()

spark.sparkContext.setLogLevel("WARN")
print("✅ [Spark Cluster] Session Active.")

# 2. Define the Distributed Text Cleaning Function (UDF)
def clean_and_demojize(text):
    if not text:
        return ""
    # Demojize first to capture the sentiment of the emojis
    text = emoji.demojize(text).replace(":", " ")
    # Strip garbage characters but keep the demojized words
    text = re.sub(r"http\S+|www\S+|https\S+", '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    return text.strip().lower()

# Register the Python function so Spark can distribute it across CPU cores
clean_text_udf = F.udf(clean_and_demojize, StringType())

def run_pipeline():
    # Setup paths relative to this script
    raw_data_path = os.path.join(os.path.dirname(__file__), "..", "raw", "trending_yt_videos_113_countries.csv")
    output_parquet_path = os.path.join(os.path.dirname(__file__), "..", "v2_cleaned_trends.parquet")

    print(f"📥 [Spark ETL] Ingesting 6GB Data Lake from: {raw_data_path}")
    
    # 3. Read the Data (Solving the Multiline & Shifted Column issue from Round 1)
    df = spark.read.csv(
        raw_data_path,
        header=True,
        escape='"',           
        multiLine=True,       
        mode="DROPMALFORMED"  
    ).limit(250000)

    print("🧹 [Spark ETL] Applying Multi-Modal Transformations...")

    # 4. The Transformation Phase (WITH THE LIKE_COUNT FIX)
    processed_df = df.select(
        F.col("video_id"),
        F.col("view_count").cast("long"),
        F.col("like_count").cast("long"),       # <-- FIXED SCHEMA MISMATCH HERE
        F.col("comment_count").cast("long"),
        
        # Merge Title and Description, then apply our Demojize UDF
        clean_text_udf(
            F.concat_ws(" ", F.col("title"), F.col("description"))
        ).alias("clean_text"),
        
        # Automatically construct the high-res thumbnail URL for the Vision Transformer later
        F.concat(F.lit("https://img.youtube.com/vi/"), F.col("video_id"), F.lit("/maxresdefault.jpg")).alias("thumbnail_url")
    )

    # Filter out empty rows and massive outliers
    processed_df = processed_df.filter(F.col("clean_text") != "") \
                               .filter(F.col("view_count").isNotNull()) \
                               .dropDuplicates(["video_id"])

    print(f"📤 [Spark ETL] Writing highly optimized Parquet to: {output_parquet_path}")
    
    # 5. Export to Parquet (Overwrites old data safely)
    processed_df.write.mode("overwrite").parquet(output_parquet_path)
    
    print("✅ [Spark ETL] Pipeline Complete. Data is ready for PyTorch.")

if __name__ == "__main__":
    run_pipeline()
    spark.stop()