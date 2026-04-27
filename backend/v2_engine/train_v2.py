import os
import torch
import pandas as pd
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

# Import the architecture
from multimodal_nn import TrendSenseMultiModal

# --- 1. The "Smart" PyTorch Dataset ---
class TrendSenseDataset(Dataset):
    def __init__(self, parquet_path):
        print(f"📥 [DataLoader] Loading Smart Dataset from {parquet_path}...")
        self.df = pd.read_parquet(parquet_path)
        print(f"✅ [DataLoader] Dataset ready. Found {len(self.df)} fully multi-modal records.")

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        
        # 1. Text Pipeline (Loading pre-computed SBERT vectors!)
        text_tensor = torch.tensor(row['text_embedding'], dtype=torch.float32)
        
        # 2. Vision Pipeline (THE EYE IS OPEN - Loading pre-computed ViT vectors!)
        vision_tensor = torch.tensor(row['vision_embedding'], dtype=torch.float32) 
        
        # 3. Tabular Pipeline
        views = float(row['view_count']) / 100000.0
        likes = float(row['like_count']) / 10000.0
        comments = float(row['comment_count']) / 1000.0
        tabular_tensor = torch.tensor([views, likes, comments], dtype=torch.float32)
        
        # 4. Target Variable
        target_tensor = torch.tensor([row['virality_score']], dtype=torch.float32)

        return text_tensor, vision_tensor, tabular_tensor, target_tensor


# --- 2. The Training Loop ---
def train_model():
    # Pointing to the NEW v3 dataset!
    data_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "v3_smart_training_data.parquet")
    
    dataset = TrendSenseDataset(data_path)
    dataloader = DataLoader(dataset, batch_size=32, shuffle=True)
    
    model = TrendSenseMultiModal()
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    model.to(device)
    
    criterion = nn.MSELoss()
    # Lowered the learning rate slightly for fine-tuning the vision weights
    optimizer = optim.Adam(model.parameters(), lr=0.0005) 
    
    # We can run more epochs now because pre-computed data is lightning fast
    epochs = 10 
    print(f"\n🚀 [Training Engine] Starting Vision-Enabled Phase on {device.upper()} for {epochs} Epochs...")
    
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        
        for batch_idx, (text, vision, tabular, target) in enumerate(dataloader):
            text, vision, tabular, target = text.to(device), vision.to(device), tabular.to(device), target.to(device)
            
            optimizer.zero_grad()
            predictions = model(text, vision, tabular)
            loss = criterion(predictions, target)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
                
        print(f"✅ Epoch [{epoch+1}/{epochs}] Complete | Average Loss: {running_loss/len(dataloader):.4f}")

    # --- 3. Save the Multi-Modal Weights ---
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    
    save_path = os.path.join(models_dir, "v2_multimodal_weights.pt")
    torch.save(model.state_dict(), save_path)
    print(f"\n💾 [System] Vision-enabled weights successfully saved to {save_path}!")

if __name__ == "__main__":
    train_model()