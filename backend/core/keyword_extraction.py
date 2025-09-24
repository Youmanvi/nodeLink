"""
Keyword Extraction Module
Handles advanced keyword extraction using TF-IDF and frequency analysis
"""

from collections import Counter
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class KeywordExtractor:
    """Handles advanced keyword extraction."""
    
    def __init__(self, nlp_model, tfidf_vectorizer):
        self.nlp = nlp_model
        self.tfidf_vectorizer = tfidf_vectorizer
    
    def extract_keywords_advanced(self, text: str, max_keywords: int = 20) -> List[Dict[str, Any]]:
        """Extract keywords using TF-IDF and frequency analysis."""
        if not text.strip():
            return []
        
        # Basic preprocessing
        doc = self.nlp(text)
        
        # Extract candidate terms (nouns, adjectives, proper nouns)
        candidates = []
        for token in doc:
            if (not token.is_stop and 
                not token.is_punct and 
                not token.is_space and 
                len(token.text) > 2 and
                token.pos_ in ['NOUN', 'ADJ', 'PROPN']):
                candidates.append(token.lemma_.lower())
        
        if not candidates:
            return []
        
        # Calculate TF-IDF scores
        try:
            candidate_text = ' '.join(candidates)
            tfidf_matrix = self.tfidf_vectorizer.fit_transform([candidate_text])
            feature_names = self.tfidf_vectorizer.get_feature_names_out()
            tfidf_scores = tfidf_matrix.toarray()[0]
            
            # Combine with frequency
            freq_counter = Counter(candidates)
            total_words = len(candidates)
            
            keyword_scores = []
            for word in set(candidates):
                if word in feature_names:
                    tfidf_idx = list(feature_names).index(word)
                    tfidf_score = tfidf_scores[tfidf_idx]
                else:
                    tfidf_score = 0
                
                freq_score = freq_counter[word] / total_words
                combined_score = (tfidf_score * 0.7) + (freq_score * 0.3)
                
                keyword_scores.append({
                    'word': word,
                    'score': combined_score,
                    'frequency': freq_counter[word],
                    'tfidf': tfidf_score
                })
            
            # Sort by combined score and return top keywords
            keyword_scores.sort(key=lambda x: x['score'], reverse=True)
            return keyword_scores[:max_keywords]
            
        except Exception as e:
            logger.error(f"Error in keyword extraction: {e}")
            # Fallback to simple frequency
            freq_counter = Counter(candidates)
            return [{'word': word, 'score': count/len(candidates), 'frequency': count, 'tfidf': 0} 
                   for word, count in freq_counter.most_common(max_keywords)]
