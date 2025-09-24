"""
NLP Core Models and Configuration
Centralized configuration and model initialization
"""

import spacy
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
import logging

logger = logging.getLogger(__name__)

class NLPModels:
    """Manages NLP model initialization and configuration."""
    
    def __init__(self):
        self.nlp = None
        self.sia = None
        self.stop_words = set()
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        
        self.intent_patterns = {
            'question': [r'\?', r'what', r'how', r'why', r'when', r'where', r'who', r'which'],
            'explanation': [r'explain', r'describe', r'definition', r'means', r'is defined as', r'refers to'],
            'instruction': [r'steps', r'how to', r'process', r'method', r'procedure', r'tutorial', r'guide'],
            'analysis': [r'analyze', r'compare', r'evaluate', r'assess', r'examine', r'investigate'],
            'opinion': [r'think', r'believe', r'opinion', r'view', r'perspective', r'feel', r'consider'],
            'factual': [r'fact', r'data', r'statistics', r'research', r'study', r'evidence', r'proof']
        }
        
        self.initialize_models()
    
    def initialize_models(self):
        """Initialize NLP models and download required resources."""
        try:
            # Load spaCy model
            try:
                self.nlp = spacy.load("en_core_web_sm")
                logger.info("spaCy model loaded successfully")
            except OSError:
                logger.error("spaCy English model not found. Please run: python -m spacy download en_core_web_sm")
                raise
            
            # Initialize NLTK components
            try:
                nltk.download('vader_lexicon', quiet=True)
                nltk.download('stopwords', quiet=True)
                nltk.download('punkt', quiet=True)
                nltk.download('wordnet', quiet=True)
                nltk.download('averaged_perceptron_tagger', quiet=True)
                
                self.sia = SentimentIntensityAnalyzer()
                self.stop_words = set(stopwords.words('english'))
                logger.info("NLTK models initialized successfully")
            except Exception as e:
                logger.error(f"Error initializing NLTK: {e}")
                # Create fallback
                self.sia = None
                self.stop_words = set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
                
        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            raise
