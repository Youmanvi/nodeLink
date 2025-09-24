"""
Sentiment Analysis Module
Handles sentiment analysis and readability calculations
"""

from nltk.sentiment import SentimentIntensityAnalyzer
from textstat import flesch_reading_ease, flesch_kincaid_grade
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """Handles sentiment analysis and readability calculations."""
    
    def __init__(self, sia_model):
        self.sia = sia_model
    
    def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of the text."""
        if not self.sia or not text.strip():
            return {'compound': 0.0, 'label': 'neutral', 'confidence': 0.0}
        
        scores = self.sia.polarity_scores(text)
        compound = scores['compound']
        
        if compound >= 0.05:
            label = 'positive'
        elif compound <= -0.05:
            label = 'negative'
        else:
            label = 'neutral'
        
        return {
            'compound': compound,
            'positive': scores['pos'],
            'negative': scores['neg'],
            'neutral': scores['neu'],
            'label': label,
            'confidence': abs(compound)
        }
    
    def calculate_readability(self, text: str) -> Dict[str, Any]:
        """Calculate readability scores."""
        if not text.strip():
            return {'flesch_ease': 0, 'flesch_kincaid': 0, 'complexity': 'unknown'}
        
        try:
            ease_score = flesch_reading_ease(text)
            grade_level = flesch_kincaid_grade(text)
            
            if ease_score >= 90:
                complexity = 'very easy'
            elif ease_score >= 80:
                complexity = 'easy'
            elif ease_score >= 70:
                complexity = 'fairly easy'
            elif ease_score >= 60:
                complexity = 'standard'
            elif ease_score >= 50:
                complexity = 'fairly difficult'
            elif ease_score >= 30:
                complexity = 'difficult'
            else:
                complexity = 'very difficult'
            
            return {
                'flesch_ease': round(ease_score, 2),
                'flesch_kincaid': round(grade_level, 2),
                'complexity': complexity
            }
        except:
            return {'flesch_ease': 0, 'flesch_kincaid': 0, 'complexity': 'unknown'}
