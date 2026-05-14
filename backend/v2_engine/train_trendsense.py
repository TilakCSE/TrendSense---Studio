import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
import pandas as pd
import numpy as np

print("🚀 INITIALIZING TRENDSENSE NEURAL FORGE V2...")

# ==========================================
# 1. PATH CONFIGURATION
# ==========================================
base_dir        = os.path.dirname(os.path.abspath(__file__))
# Points to the new V7 dataset built with percentile rank scoring
data_path       = os.path.join(base_dir, "..", "..", "data", "trendsense_v7_master.parquet")
model_save_path = os.path.join(base_dir, "trendsense_core_v4.pt")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"⚙️ Training Device: {str(device).upper()}")
if device.type == "cuda":
    print(f"✅ GPU: {torch.cuda.get_device_name(0)}")

# ==========================================
# 2. DATASET DEFINITION
# ==========================================
class TrendSenseDataset(Dataset):
    def __init__(self, parquet_path):
        print(f"📂 Loading dataset from: {parquet_path}")
        self.df = pd.read_parquet(parquet_path)
        print(f"   Rows loaded: {len(self.df)}")

        # Build feature matrix: SBERT embedding (384) + CLIP cohesion (1) = 385 dims
        # Using np.stack instead of a Python loop — much faster for large datasets
        embeddings = np.stack(self.df['fused_text_embedding'].values).astype(np.float32)
        cohesions  = self.df['clip_cohesion_score'].values.astype(np.float32).reshape(-1, 1)
        X_np       = np.concatenate([embeddings, cohesions], axis=1)

        self.X = torch.tensor(X_np, dtype=torch.float32)
        self.y = torch.tensor(
            self.df['target_virality_score'].values,
            dtype=torch.float32
        ).unsqueeze(1)

        print(f"   Feature matrix: {self.X.shape} | Target range: "
              f"{self.y.min().item():.1f} – {self.y.max().item():.1f}")

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        return self.X[idx], self.y[idx]

# ==========================================
# 3. NEURAL NETWORK ARCHITECTURE
# ==========================================
class ViralityPredictor(nn.Module):
    """
    385 → 256 → 128 → 64 → 1

    Wider than v2 (was 385→128→32→1) because the new percentile-ranked
    targets have a healthier 0-100 distribution and the model needs more
    capacity to learn the full range without underfitting.

    BatchNorm replaces the raw ReLU → it normalizes activations per batch,
    which stabilizes training and reduces sensitivity to learning rate.

    Dropout kept at 0.3 — aggressive enough to prevent memorization,
    not so heavy it kills signal on the wider layers.
    """
    def __init__(self):
        super(ViralityPredictor, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(385, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(64, 1)
        )

    def forward(self, x):
        return self.network(x)

# ==========================================
# 4. THE TRAINING LOOP
# ==========================================
def train_model():
    full_dataset = TrendSenseDataset(data_path)

    # 70% train / 15% val / 15% test — proper 3-way split
    # Previously 80/20 with no true held-out test set
    n         = len(full_dataset)
    train_n   = int(0.70 * n)
    val_n     = int(0.15 * n)
    test_n    = n - train_n - val_n

    train_dataset, val_dataset, test_dataset = random_split(
        full_dataset, [train_n, val_n, test_n],
        generator=torch.Generator().manual_seed(42)  # Reproducible splits
    )

    # num_workers=0 on Windows (multiprocessing with CUDA causes issues on Win)
    train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True,  num_workers=0, pin_memory=True)
    val_loader   = DataLoader(val_dataset,   batch_size=64, shuffle=False, num_workers=0, pin_memory=True)
    test_loader  = DataLoader(test_dataset,  batch_size=64, shuffle=False, num_workers=0, pin_memory=True)

    print(f"\n📊 Split: {train_n} train | {val_n} val | {test_n} test")

    model     = ViralityPredictor().to(device)
    criterion = nn.L1Loss()  # MAE — penalizes large errors proportionally, good for 0-100 range

    # Weight decay = L2 regularization baked into Adam — adds another layer of
    # overfitting resistance beyond Dropout
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)

    # ReduceLROnPlateau: if val loss doesn't improve for 7 epochs, cut LR by 50%
    # This lets the model escape plateaus instead of bouncing around them
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', patience=7, factor=0.5, verbose=True
    )

    # ==========================================
    # EARLY STOPPING
    # ==========================================
    # Your v2 training showed val error plateauing at epoch 25 then RISING.
    # Without early stopping you were saving the OVERFIT model (epoch 50),
    # not the BEST model (epoch ~25). This saves the best checkpoint and
    # stops training when the model stops generalizing.
    # ==========================================
    best_val_loss    = float('inf')
    patience_counter = 0
    PATIENCE         = 15  # Stop if no improvement for 15 epochs
    MAX_EPOCHS       = 150  # Upper ceiling — early stopping will fire before this

    print(f"🔥 Training (max {MAX_EPOCHS} epochs, early stop patience={PATIENCE})...\n")
    print(f"{'Epoch':>6} | {'Train MAE':>9} | {'Val MAE':>7} | {'LR':>8} | {'Status'}")
    print("─" * 55)

    for epoch in range(MAX_EPOCHS):
        # --- TRAIN ---
        model.train()
        train_loss = 0.0
        for batch_X, batch_y in train_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            optimizer.zero_grad()
            loss = criterion(model(batch_X), batch_y)
            loss.backward()
            # Gradient clipping — prevents exploding gradients on bad batches
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            train_loss += loss.item()

        avg_train = train_loss / len(train_loader)

        # --- VALIDATE ---
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for batch_X, batch_y in val_loader:
                batch_X, batch_y = batch_X.to(device), batch_y.to(device)
                val_loss += criterion(model(batch_X), batch_y).item()

        avg_val = val_loss / len(val_loader)
        current_lr = optimizer.param_groups[0]['lr']

        # --- EARLY STOPPING LOGIC ---
        if avg_val < best_val_loss:
            best_val_loss = avg_val
            patience_counter = 0
            # Save the BEST model, not the last one
            torch.save(model.state_dict(), model_save_path)
            status = "✅ saved"
        else:
            patience_counter += 1
            status = f"patience {patience_counter}/{PATIENCE}"

        # Print every epoch (not just every 5) so you can watch the curve
        print(f"{epoch+1:>6} | {avg_train:>9.2f} | {avg_val:>7.2f} | {current_lr:>8.6f} | {status}")

        scheduler.step(avg_val)

        if patience_counter >= PATIENCE:
            print(f"\n⏹️ Early stopping triggered at epoch {epoch+1}.")
            print(f"   Best val MAE: {best_val_loss:.2f} (saved at that checkpoint)")
            break

    # ==========================================
    # 5. FINAL EVALUATION ON HELD-OUT TEST SET
    # ==========================================
    # Load the best saved model (not the overfit last state)
    print(f"\n📋 Loading best checkpoint for final test evaluation...")
    model.load_state_dict(torch.load(model_save_path, map_location=device, weights_only=True))
    model.eval()

    test_loss  = 0.0
    all_preds  = []
    all_labels = []

    with torch.no_grad():
        for batch_X, batch_y in test_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            preds = model(batch_X)
            test_loss += criterion(preds, batch_y).item()
            all_preds.append(preds.cpu().numpy())
            all_labels.append(batch_y.cpu().numpy())

    avg_test = test_loss / len(test_loader)
    all_preds  = np.concatenate(all_preds).flatten()
    all_labels = np.concatenate(all_labels).flatten()

    # Additional diagnostics beyond MAE
    errors      = np.abs(all_preds - all_labels)
    within_10   = (errors <= 10).mean() * 100
    within_20   = (errors <= 20).mean() * 100
    pred_mean   = all_preds.mean()
    pred_std    = all_preds.std()
    label_mean  = all_labels.mean()

    print(f"\n{'═'*60}")
    print(f"🎉 TRAINING COMPLETE — FINAL TEST RESULTS")
    print(f"{'═'*60}")
    print(f"  Test MAE:              {avg_test:.2f} pts  (avg error on unseen data)")
    print(f"  Best Val MAE:          {best_val_loss:.2f} pts")
    print(f"  Within ±10 pts:        {within_10:.1f}% of predictions")
    print(f"  Within ±20 pts:        {within_20:.1f}% of predictions")
    print(f"  Prediction mean:       {pred_mean:.1f} (label mean: {label_mean:.1f})")
    print(f"  Prediction std dev:    {pred_std:.1f}")
    print(f"\n  ⚠️  If prediction mean is far from label mean, the model")
    print(f"      is biased. Ideal: both close to 50.0 with std ~25.")
    print(f"\n💾 Model saved: {model_save_path}")
    print(f"{'═'*60}")
    print(f"\n⚡ NEXT STEP: Update api.py to load trendsense_core_v4.pt")

if __name__ == "__main__":
    train_model()