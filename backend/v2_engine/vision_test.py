import ollama
import os

def analyze_thumbnail(image_filename: str):
    # Dynamically find the image in your data folder
    image_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", image_filename))
    
    if not os.path.exists(image_path):
        return f"❌ Error: Could not find image at {image_path}"

    print(f"👁️ Waking up LLaVA to analyze: {image_filename}...")
    print("⏳ (This might take 5-10 seconds on the RTX 3050 as it processes the pixels...)")
    
    try:
        response = ollama.chat(
            model='llava', 
            messages=[
                {
                    'role': 'user',
                    'content': 'You are a YouTube thumbnail analyst. Describe exactly what is happening in this image in one highly detailed sentence. Do not add conversational filler.',
                    'images': [image_path] # Ollama reads the local file instantly!
                }
            ]
        )
        return response['message']['content']
    
    except Exception as e:
        return f"❌ LLaVA Engine Error: {str(e)}"

# --- RUN THE TEST ---
if __name__ == "__main__":
    # Make sure you saved a picture named test_thumb.png in your data folder!
    description = analyze_thumbnail("test_thumb.png")
    
    print("\n" + "═"*60)
    print("📸 LLaVA VISION ANALYSIS")
    print("═"*60)
    print(description)
    print("═"*60)