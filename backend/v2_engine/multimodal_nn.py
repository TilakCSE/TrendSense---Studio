import torch
import torch.nn as nn
import torch.nn.functional as F

class TrendSenseMultiModal(nn.Module):
    def __init__(self, text_dim=384, vision_dim=768, tabular_dim=3):
        """
        The Multi-Modal Neural Network Architecture.
        It accepts three separate streams of data and fuses them into a single prediction.
        """
        super(TrendSenseMultiModal, self).__init__()
        print("🧠 [Deep Learning] Initializing TrendSense Multi-Modal Network...")
        
        # Calculate the total size of our fused input (384 + 768 + 3 = 1155)
        total_input_dim = text_dim + vision_dim + tabular_dim
        
        # --- The Network Layers ---
        # Layer 1: The Fusion Layer (Compresses the 1155 inputs down to 512 concepts)
        self.fc1 = nn.Linear(total_input_dim, 512)
        # Dropout randomly turns off 30% of neurons during training to prevent overfitting
        self.dropout1 = nn.Dropout(0.3)
        
        # Layer 2: The Hidden Reasoning Layer (Distills 512 down to 128 core patterns)
        self.fc2 = nn.Linear(512, 128)
        self.dropout2 = nn.Dropout(0.2)
        
        # Layer 3: The Output Oracle (Distills the 128 patterns into 1 Virality Score)
        self.output_layer = nn.Linear(128, 1)

    def forward(self, text_emb, vision_emb, tabular_data):
        """
        The Forward Pass: How data flows through the brain to make a prediction.
        """
        # 1. FUSION: Smash all three vectors together side-by-side
        # Resulting shape: [batch_size, 1155]
        fused_features = torch.cat((text_emb, vision_emb, tabular_data), dim=1)
        
        # 2. Pass through Layer 1 with a ReLU activation (introduces non-linearity)
        x = F.relu(self.fc1(fused_features))
        x = self.dropout1(x)
        
        # 3. Pass through Layer 2
        x = F.relu(self.fc2(x))
        x = self.dropout2(x)
        
        # 4. Generate Final Virality Score
        prediction = self.output_layer(x)
        return prediction

# --- Quick Test Execution (Simulating a Batch of 5 Videos) ---
if __name__ == "__main__":
    # Create the model
    model = TrendSenseMultiModal(text_dim=384, vision_dim=768, tabular_dim=3)
    
    print("\n🧪 [Simulation] Faking data for 5 viral videos to test the Forward Pass...")
    # Simulate a batch of 5 posts passing through SBERT
    dummy_text_embeddings = torch.rand(5, 384) 
    # Simulate a batch of 5 thumbnails passing through the Vision Transformer
    dummy_vision_embeddings = torch.rand(5, 768) 
    # Simulate the scaled tabular data (e.g., views, likes, comments)
    dummy_tabular_data = torch.rand(5, 3)        
    
    # Run the data through the network!
    predictions = model(dummy_text_embeddings, dummy_vision_embeddings, dummy_tabular_data)
    
    print("\n📊 [Output] Raw Virality Predictions for the 5 videos:")
    print(predictions.detach().numpy())
    print("\n✅ Network architecture is valid. Tensor math aligns perfectly.")