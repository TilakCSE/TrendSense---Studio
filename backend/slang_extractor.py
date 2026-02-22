import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer

# Standard stop words without importing nltk directly to avoid runtime download issues.
STOP_WORDS = set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", 
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", 
    "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", 
    "theirs", "themselves", "what", "which", "who", "whom", "this", "that", 
    "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", 
    "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", 
    "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", 
    "at", "by", "for", "with", "about", "against", "between", "into", "through", 
    "during", "before", "after", "above", "below", "to", "from", "up", "down", 
    "in", "out", "on", "off", "over", "under", "again", "further", "then", 
    "once", "here", "there", "when", "where", "why", "how", "all", "any", 
    "both", "each", "few", "more", "most", "other", "some", "such", "no", 
    "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", 
    "t", "can", "will", "just", "don", "should", "now", "like", "get", "just"
])

def clean_text(text: str) -> str:
    # Lowercase
    text = str(text).lower()
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    # Remove punctuation & special characters
    text = re.sub(r'[^a-z\s]', '', text)
    return text

def extract_trending_slang(reddit_df: pd.DataFrame, top_n: int = 20) -> list:
    """
    Analyzes daily Reddit text and extracts the top N most frequent "slang" or trending keywords
    using TF-IDF to highlight terms unique or highly relevant to the daily corpus.
    """
    if reddit_df.empty or 'title' not in reddit_df.columns:
        return []
    
    # Clean up texts
    documents = reddit_df['title'].apply(clean_text).tolist()
    
    if not documents:
        return []

    # Use TF-IDF to find important words (ngrams 1 to 2 for things like "skibidi toilet")
    vectorizer = TfidfVectorizer(
        stop_words=list(STOP_WORDS),
        max_df=0.95,  # Ignore words that appear in >95% of documents
        min_df=2,     # Ignore words that appear in <2 documents
        ngram_range=(1, 2)
    )
    
    try:
        tfidf_matrix = vectorizer.fit_transform(documents)
    except ValueError:
        return []

    # Get sum of TF-IDF scores for each feature
    sum_tfidf = tfidf_matrix.sum(axis=0)
    
    # Map features to their scores
    word_scores = [(word, sum_tfidf[0, idx]) for word, idx in vectorizer.vocabulary_.items()]
    
    # Sort by score descending
    word_scores = sorted(word_scores, key=lambda x: x[1], reverse=True)
    
    # Return top N keywords
    top_slang = [word for word, score in word_scores[:top_n]]
    
    return top_slang
