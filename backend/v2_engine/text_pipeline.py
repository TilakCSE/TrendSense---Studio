from sentence_transformers import SentenceTransformer
import torch
import time

class TextEmbedder:
    def __init__(self):
        # 1. Hardware Check: Route to RTX 3050
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"⚙️ Initializing Text Pipeline on: {self.device.upper()}")
        
        # 2. Load the lightweight, high-speed SBERT model
        print("🧠 Loading all-MiniLM-L6-v2 into VRAM...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2', device=self.device)

    def process_video_text(self, title: str, transcript_hook: str):
        """
        Fuses the Title and the Transcript Hook into a single 384-dimensional tensor.
        """
        start_time = time.time()
        
        # 3. Contextual Fusion (Industry Secret)
        # We don't embed them separately; we fuse them into a single context string
        # so the neural network understands how the title relates to the script.
        combined_text = f"TITLE: {title} | SCRIPT HOOK: {transcript_hook}"
        
        # 4. Generate the PyTorch Tensor
        tensor_output = self.model.encode(combined_text, convert_to_tensor=True)
        
        process_time = round((time.time() - start_time) * 1000, 2)
        print(f"⚡ Tensor generated in {process_time}ms. Shape: {tensor_output.shape}")
        
        return tensor_output

# --- TEST THE PIPELINE ---
if __name__ == "__main__":
    embedder = TextEmbedder()
    
    # Simulating the output from transcript_fetcher.py
    sample_title = "Samay Raina STILL ALIVE - Epic Heckler Response"
    sample_hook = "Guys I am not dead, the internet is crazy. I was just taking a break from the main channel to focus on some standup material, but then I saw the rumors..."
    
    # Run the tensor conversion
    final_tensor = embedder.process_video_text(sample_title, sample_hook)