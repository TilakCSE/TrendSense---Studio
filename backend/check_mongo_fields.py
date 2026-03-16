"""
Diagnostic script to inspect the actual field names in MongoDB's historical_youtube collection.
This helps identify the correct column mappings for data_standardizer.py
"""
import os
import sys
from pprint import pprint

# Add data/db_scripts to path for mongo_client
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'data', 'db_scripts'))
from mongo_client import MongoDBClient

def check_mongo_fields():
    print("=" * 80)
    print("MONGODB FIELD INSPECTOR - historical_youtube collection")
    print("=" * 80)

    try:
        # Connect to MongoDB
        print("\n🔌 Connecting to MongoDB...")
        db = MongoDBClient().db
        collection = db["historical_youtube"]

        # Get total count
        total_docs = collection.count_documents({})
        print(f"✅ Connected! Total documents in collection: {total_docs:,}")

        if total_docs == 0:
            print("❌ Collection is empty. No documents to inspect.")
            return

        # Fetch exactly ONE document
        print("\n📄 Fetching one sample document...\n")
        sample_doc = collection.find_one()

        if not sample_doc:
            print("❌ Failed to fetch document.")
            return

        # Print all field names
        print("=" * 80)
        print("FIELD NAMES (Keys) in Document:")
        print("=" * 80)
        field_names = list(sample_doc.keys())
        for i, field in enumerate(field_names, 1):
            print(f"{i:3}. {field}")

        print(f"\n📊 Total Fields: {len(field_names)}")

        # Print full document with values for context
        print("\n" + "=" * 80)
        print("SAMPLE DOCUMENT (with values):")
        print("=" * 80)
        pprint(sample_doc, width=120, depth=3)

        # Specifically check for engagement-related fields
        print("\n" + "=" * 80)
        print("🔍 ENGAGEMENT METRICS CHECK:")
        print("=" * 80)

        engagement_keywords = ['view', 'like', 'score', 'engagement', 'comment', 'share', 'upvote', 'count']
        found_engagement_fields = [
            field for field in field_names
            if any(keyword in field.lower() for keyword in engagement_keywords)
        ]

        if found_engagement_fields:
            print("✅ Found potential engagement fields:")
            for field in found_engagement_fields:
                value = sample_doc.get(field)
                print(f"   • {field}: {value} (type: {type(value).__name__})")
        else:
            print("⚠️  No obvious engagement fields found. Check the full document above.")

        print("\n" + "=" * 80)
        print("✅ DIAGNOSTIC COMPLETE")
        print("=" * 80)
        print("\nNext Steps:")
        print("1. Identify the correct field names for views, likes, and score")
        print("2. Update data_standardizer.py to use these exact field names")
        print("3. Re-run retrain.py to train with real engagement data")
        print("=" * 80)

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_mongo_fields()
