import ollama

def generate_virality_feedback(title: str, viral_hook: str, thumbnail_desc: str, cohesion_score: float, predicted_score: float):
    print(f"⚙️ Waking up Llama 3 for analysis on: '{title}'...")

    # The Upgraded System Prompt
    prompt = f"""
    You are the strict, elite AI YouTube Strategist for 'TrendSense'.
    Analyze this video's metadata and its predicted virality score.

    Video Title: {title}
    Predicted Virality Score: {predicted_score}/100
    Viral Hook (First 150 words): {viral_hook}
    Thumbnail Description: {thumbnail_desc}
    Thumbnail-Title Cohesion Score: {cohesion_score}/1.0 (1.0 means perfect match, below 0.5 means clickbait or unrelated)

    Write a 3-bullet-point strategic report:
    1. If the Virality Score is high (>80), explain why the psychology of the hook and title works. If it is low (<50), ruthlessly explain why it is boring, slow, or unengaging.
    2. Analyze the Thumbnail Cohesion. Does the image match the promise of the title? If the cohesion is low, explicitly tell them the thumbnail is hurting them and suggest a better visual.
    3. Provide ONE highly specific, actionable piece of advice to rewrite the title or the hook to immediately increase viewer retention.

    Keep it professional, punchy, and direct. No generic fluff.
    """

    try:
        response = ollama.chat(model='llama3', messages=[
            {
                'role': 'user',
                'content': prompt
            }
        ])
        return response['message']['content']
    except Exception as e:
        return f"❌ Llama 3 Engine Error: {str(e)}"

# --- TEST THE LOW SCORE SCENARIO ---
if __name__ == "__main__":
    # A terrible, boring video scenario
    test_title = "My Tuesday Morning Vlog Part 4"
    test_hook = "Hey guys, welcome back to the channel. Um, today I don't really have much planned. I just woke up and I'm going to make some plain oatmeal. It's raining outside so I probably won't leave the house. Anyway, remember to hit subscribe if you want. Let's go to the kitchen and look at the fridge."
    
    # A thumbnail that has nothing to do with the vlog (Clickbait/Confusing)
    test_thumbnail = "A heavily edited picture of a red sports car exploding."
    test_cohesion = 0.12 # Extremely low match between a boring vlog and an exploding car
    test_score = 18.5    # Terrible virality score

    feedback = generate_virality_feedback(
        title=test_title, 
        viral_hook=test_hook, 
        thumbnail_desc=test_thumbnail, 
        cohesion_score=test_cohesion, 
        predicted_score=test_score
    )
    
    print("\n" + "═"*70)
    print("📉 TRENDSENSE AI STRATEGY REPORT (LOW SCORE DETECTED)")
    print("═"*70)
    print(feedback)
    print("═"*70)