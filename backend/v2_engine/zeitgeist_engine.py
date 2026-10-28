import ollama
import json

def extract_cultural_entities(title: str):
    """
    Forces Llama 3 to act as a Named Entity Recognition (NER) model.
    It identifies influencers, memes, or inside jokes.
    """
    prompt = f"""
    Analyze this YouTube video title: "{title}"
    
    Identify any specific influencers, internet memes, inside jokes, or cultural phenomena.
    If you find one, return a JSON object with "entity", "category", and "is_viral_meme" (boolean).
    If it is just a generic title (e.g., "How to bake a cake"), return {{"entity": null}}.
    
    ONLY output valid JSON. Do not add any conversational text.
    """

    try:
        response = ollama.chat(model='llama3.2:3b-instruct-q4_K_M', messages=[
            {'role': 'user', 'content': prompt}
        ], options={"num_ctx": 2048})
        
        # Parse the JSON response
        content = response.message.content if hasattr(response, "message") else response['message']['content']
        result = json.loads(content)
        return result
        
    except Exception as e:
        return {"entity": None, "error": str(e)}

# --- TEST THE ENGINE ---
if __name__ == "__main__":
    # Test 1: Generic Title
    generic_title = "My Morning Routine 2024"
    print(f"Testing Generic: {generic_title}")
    print(extract_cultural_entities(generic_title))
    
    print("-" * 40)
    
    # Test 2: The Professor's Test
    meme_title = "Samay Raina STILL ALIVE!"
    print(f"Testing Zeitgeist: {meme_title}")
    print(extract_cultural_entities(meme_title))
