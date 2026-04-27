import torch
import io
from PIL import Image
from transformers import ViTImageProcessor, ViTModel

class VisionEmbedder:
    def __init__(self):
        print("👁️ [Vision Engine] Booting Google ViT (Vision Transformer)...")
        # We use the base model which outputs the exact 768-dimension vector our PyTorch model expects
        model_name = "google/vit-base-patch16-224-in21k"
        
        # The processor handles resizing and standardizing the image pixels
        self.processor = ViTImageProcessor.from_pretrained(model_name)
        # The model actually calculates the math
        self.model = ViTModel.from_pretrained(model_name)
        self.model.eval() # Set to inference mode
        
        print("✅ [Vision Engine] ViT loaded successfully on CPU.")

    def generate_embedding(self, image_bytes):
        try:
            # 1. Convert the raw web bytes back into an actual Image
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # 2. Pre-process (resizes to 224x224 and normalizes colors)
            inputs = self.processor(images=image, return_tensors="pt")
            
            # 3. Pass through the Transformer
            with torch.no_grad():
                outputs = self.model(**inputs)
            
            # 4. Extract the "pooler_output" 
            # This is a 1x768 mathematical summary of the entire image's visual context
            vision_vector = outputs.pooler_output
            
            return vision_vector
            
        except Exception as e:
            print(f"❌ [Vision Engine] Failed to process image: {e}")
            # Safe fallback: if the user uploads a corrupted file, don't crash the server
            return torch.zeros((1, 768), dtype=torch.float32)