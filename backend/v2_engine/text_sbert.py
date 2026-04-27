import re
import emoji
import torch
from sentence_transformers import SentenceTransformer

class TextEmbedder:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Initializes the SBERT model. 
        'all-MiniLM-L6-v2' is chosen because it is incredibly fast, memory-efficient, 
        and produces high-quality 384-dimensional embeddings.
        """
        print(f"⏳ [Text Engine] Booting SBERT Model: {model_name}...")
        
        # Check if a GPU is available, otherwise fallback to CPU
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.model = SentenceTransformer(model_name, device=self.device)
        
        print(f"✅ [Text Engine] Model loaded successfully on {self.device.upper()}.")

    def preprocess_text(self, text: str) -> str:
        """
        Cleans the text and translates emojis into readable words for the AI.
        """
        if not isinstance(text, str) or not text.strip():
            return ""

        # 1. Demojize: Converts 🔥 to :fire: and 🚀 to :rocket:
        text = emoji.demojize(text)
        
        # 2. Clean emoji formatting: Converts :fire: to ' fire '
        text = text.replace(":", " ")
        
        # 3. Strip URLs, HTML tags, and extra whitespace
        text = re.sub(r"http\S+|www\S+|https\S+", '', text, flags=re.MULTILINE)
        text = re.sub(r'<.*?>', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text.lower()

    def generate_embedding(self, text: str):
        """
        Converts a clean string into a 384-dimensional contextual vector.
        """
        clean_text = self.preprocess_text(text)
        
        # Returns a numpy array representing the sentence's semantic meaning
        embedding = self.model.encode(clean_text, show_progress_bar=False)
        return embedding

# --- Quick Test Execution ---
if __name__ == "__main__":
    embedder = TextEmbedder()
    
    # Test strings: Notice how emojis are heavily used in viral titles
    sample_viral_post = "This new AI tool is absolutely INSANE 🔥🚀 Must watch!!!"
    
    clean_version = embedder.preprocess_text(sample_viral_post)
    print(f"\n📝 Cleaned Text: '{clean_version}'")
    
    vector = embedder.generate_embedding(sample_viral_post)
    print(f"🔢 Embedding Shape: {vector.shape} (This means 384 unique mathematical features)")
    print(f"📊 Vector Preview: {vector[:5]}...\n")