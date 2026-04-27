import os
import torch
from multimodal_nn import TrendSenseMultiModal
from text_sbert import TextEmbedder

def test_virality():
    print("🤖 Booting TrendSense Inference Engine...")
    
    # 1. Initialize the Brain and the Text Embedder
    model = TrendSenseMultiModal()
    text_embedder = TextEmbedder()
    
    # 2. Load our trained weights!
    weights_path = os.path.join(os.path.dirname(__file__), "..", "models", "v2_multimodal_weights.pt")
    
    # We use map_location='cpu' just in case you are testing on a machine without a GPU
    model.load_state_dict(torch.load(weights_path, map_location='cpu'))
    
    # Put the model in "Evaluation Mode" (turns off training features like Dropout)
    model.eval()
    print("✅ Model loaded and ready.\n")

    # --- THE TEST CASES ---
    # We will test a garbage title vs. a highly optimized viral title
    titles_to_test = [
        "Hi", 
        "This NEW AI feature is absolutely INSANE! 🔥 (Must Watch)",
        "7x7 Brainrot Minecraft Parkour Challenge"
    ]

    print("📊 Running Predictions...\n")
    
    # We don't want PyTorch to calculate gradients (memory saving since we aren't training)
    with torch.no_grad():
        for title in titles_to_test:
            # 1. Get the SBERT Context
            text_vector = text_embedder.generate_embedding(title)
            text_tensor = torch.tensor(text_vector, dtype=torch.float32).unsqueeze(0)
            
            # 2. Mock Vision (Empty thumbnail for this baseline test)
            vision_tensor = torch.zeros((1, 768), dtype=torch.float32)
            
            # 3. Mock Tabular Stats (Assume a brand new video with 0 views/likes)
            tabular_tensor = torch.tensor([[0.0, 0.0, 0.0]], dtype=torch.float32)
            
            # 4. Predict!
            prediction = model(text_tensor, vision_tensor, tabular_tensor)
            
            # Extract the raw number
            score = prediction.item()
            
            # Print the result clearly
            print(f"📝 Title: '{title}'")
            print(f"📈 Predicted Engagement Score: {score:.2f}")
            print("-" * 50)

if __name__ == "__main__":
    test_virality()