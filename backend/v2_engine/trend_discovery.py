import os
import pandas as pd
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import CountVectorizer
from bertopic.representation import KeyBERTInspired

class LivePulseEngine:
    def __init__(self):
        print("🌍 [Live Pulse] Booting BERTopic Discovery Engine (Pro Version)...")
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        
        # 1. Strip basic grammar and common internet junk words
        self.vectorizer_model = CountVectorizer(stop_words="english")
        
        # 2. Use KeyBERT to actively find the most 'unique' words in a cluster
        self.representation_model = KeyBERTInspired()
        
        self.topic_model = BERTopic(
            embedding_model=self.embedding_model,
            vectorizer_model=self.vectorizer_model,
            representation_model=self.representation_model,
            min_topic_size=3, # Lowered to catch very niche, high-velocity trends
            nr_topics="auto", 
            verbose=False
        )
        print("✅ [Live Pulse] BERTopic Ready.")

    def discover_trends(self, df):
        """
        Takes a DataFrame of live posts and returns dynamic clusters sorted by Velocity.
        """
        if len(df) < 10:
            return []

        print(f"🔍 Analyzing {len(df)} live posts for velocity clustering...")
        
        # Extract just the text for the math model
        text_list = df['title'].tolist()
        
        # Run HDBSCAN + UMAP
        topics, probabilities = self.topic_model.fit_transform(text_list)
        
        # Map the topic IDs back to our dataframe so we can calculate velocity
        df['topic_id'] = topics
        
        topic_info = self.topic_model.get_topic_info()
        discovered_trends = []
        
        for index, row in topic_info.iterrows():
            tid = row['Topic']
            if tid == -1: 
                continue # Skip the noise cluster
                
            # Filter the dataframe to just the posts in THIS specific trend
            cluster_posts = df[df['topic_id'] == tid]
            
            # --- MATH: Calculate Trend Velocity ---
            # We want trends that have high average upvotes AND a decent number of posts
            avg_score = cluster_posts['score'].mean()
            # Adding 1 to len prevents multiplying by zero. Using a square root dampens massive clusters.
            velocity = (avg_score) * ((len(cluster_posts) + 1) ** 0.5)
            
            # Grab the AI-selected keywords
            keywords_data = self.topic_model.get_topic(tid)
            keywords = [word.capitalize() for word, weight in keywords_data[:3]]
            
            # Find the top post in this cluster to show the user as "Proof"
            top_post = cluster_posts.sort_values(by='score', ascending=False).iloc[0]
            
            discovered_trends.append({
                "topic_id": int(tid),
                "name": " + ".join(keywords),
                "post_count": len(cluster_posts),
                "velocity_score": round(velocity, 1),
                "sample_post": top_post['title'],
                "sample_score": int(top_post['score'])
            })
            
        # Sort by the hottest trends first
        sorted_trends = sorted(discovered_trends, key=lambda x: x['velocity_score'], reverse=True)
        return sorted_trends[:5] # Return the top 5