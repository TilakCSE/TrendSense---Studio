import os
import sys
import io
import torch
import requests
import pandas as pd
from PIL import Image
from tqdm import tqdm
from transformers import ViTImageProcessor, ViTModel

# --- THE FIX: Point to the backend/v2_engine folder from the data folder ---
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend", "v2_engine"))
from text_sbert import TextEmbedder

def build_multimodal_dataset():
    print("🚀 [Data Pipeline] Booting Multi-Modal Extractor...")
    
    # 1. Load the Parquet file (now in the exact same 'data' folder as this script)
    data_path = os.path.join(os.path.dirname(__file__), "v2_cleaned_trends.parquet")
    df = pd.read_parquet(data_path)
    
    # Sample 500 rows for the "Smart" dataset
    df = df.sample(n=500, random_state=42).reset_index(drop=True)
    print(f"📊 Sampled 500 videos for Vision Processing.")

    # 2. Boot the AI Models
    print("🧠 Booting Google ViT and SBERT...")
    vit_processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224-in21k")
    vit_model = ViTModel.from_pretrained("google/vit-base-patch16-224-in21k")
    vit_model.eval()
    
    text_embedder = TextEmbedder()

    processed_data = []

    # 3. The Extraction Loop
    print("🌐 Downloading and embedding thumbnails from YouTube...")
    for index, row in tqdm(df.iterrows(), total=len(df)):
        try:
            video_id = row['video_id']
            thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
            
            # Download the image
            response = requests.get(thumbnail_url, timeout=5)
            if response.status_code != 200:
                continue 
                
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
            
            # Generate Vision Tensor
            inputs = vit_processor(images=image, return_tensors="pt")
            with torch.no_grad():
                vision_vector = vit_model(**inputs).pooler_output[0].numpy()
                
            # Generate Text Tensor
            text_vector = text_embedder.generate_embedding(row['clean_text'])
            
            # Calculate Target Score
            views = max(float(row['view_count']), 1.0)
            virality_score = ((float(row['like_count']) + float(row['comment_count'])) / views) * 100.0
            
            # Save the cleanly processed row
            processed_data.append({
                "video_id": video_id,
                "title": row['clean_text'],
                "text_embedding": text_vector.tolist(),
                "vision_embedding": vision_vector.tolist(),
                "view_count": row['view_count'],
                "like_count": row['like_count'],
                "comment_count": row['comment_count'],
                "virality_score": virality_score
            })
            
        except Exception as e:
            continue

    # 4. Save the new "Smart" dataset
    output_df = pd.DataFrame(processed_data)
    output_path = os.path.join(os.path.dirname(__file__), "v3_smart_training_data.parquet")
    output_df.to_parquet(output_path)
    
    print(f"\n✅ [Success] Generated {len(output_df)} fully multi-modal rows!")
    print(f"💾 Saved to {output_path}")

if __name__ == "__main__":
    build_multimodal_dataset()