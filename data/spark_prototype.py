from pyspark.sql import SparkSession
from pyspark.sql.functions import col, length, when, hour, to_timestamp

def run_spark_pipeline():
    print("🚀 Initializing Apache Spark Session...")

    spark = SparkSession.builder \
        .appName("TrendSense_BigData_ETL") \
        .master("local[*]") \
        .config("spark.hadoop.hadoop.security.authentication", "simple") \
        .getOrCreate()

    spark.sparkContext.setLogLevel("ERROR")

    # 1. Read from HDFS
    hdfs_path = "hdfs://localhost:9000/user/TrendSense/data/raw/trending_yt_videos_113_countries.csv"
    print(f"📥 Loading massive dataset from HDFS: {hdfs_path}")

    df = spark.read.csv(
    hdfs_path, 
    header=True, 
    inferSchema=True, 
    escape='"',           # Tells Spark to ignore commas inside quotes
    multiLine=True,       # Handles YouTube descriptions that have line breaks
    mode="DROPMALFORMED"  # If a row is still completely broken, just drop it instead of crashing
    )

    # 2. Show dataset scale
    total_rows = df.count()
    print(f"📊 Total Rows in HDFS Data Lake: {total_rows:,}")

    # 3. Basic cleaning
    print("🧹 Applying distributed cleaning (Dropping Nulls, Filtering)...")

    clean_df = df.dropna(subset=['title', 'description']) \
                 .filter(length(col('title')) > 5)

    # 4. Feature Engineering (extract hour from timestamp)
    print("⚙️ Engineering Features (publish_hour + peak hour logic)...")

    processed_df = clean_df.withColumn(
        "publish_timestamp",
        to_timestamp(col("publish_date"))
    ).withColumn(
        "publish_hour",
        hour(col("publish_timestamp"))
    ).withColumn(
        "is_peak_hour",
        when((col("publish_hour") >= 15) & (col("publish_hour") <= 22), 1).otherwise(0)
    )

    # 5. Cache for performance (important in big data)
    processed_df.cache()

    # 6. Show schema + preview
    print("\n📌 Processed Schema:")
    processed_df.printSchema()

    print("\n📌 Sample Data:")
    processed_df.select(
        "title", "publish_date", "publish_hour", "is_peak_hour"
    ).show(5, truncate=False)

    print("\n✅ Spark ETL Prototype Complete. Ready for distributed ML in Round 2.")

    spark.stop()


if __name__ == "__main__":
    run_spark_pipeline()