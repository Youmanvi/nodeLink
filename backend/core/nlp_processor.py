"""
Main NLP Processor
Orchestrates all NLP processing components
"""

from typing import Dict, Any
import logging
from datetime import datetime

from models.nlp_models import NLPModels
from core.entity_recognition import EntityRecognizer
from core.keyword_extraction import KeywordExtractor
from core.relationship_analysis import RelationshipAnalyzer
from core.sentiment_analysis import SentimentAnalyzer

logger = logging.getLogger(__name__)

class AdvancedNLPProcessor:
    """Advanced NLP processing class with comprehensive text analysis capabilities."""
    
    def __init__(self):
        """Initialize the NLP processor with required models and tools."""
        self.models = NLPModels()
        
        # Initialize processing components
        self.entity_recognizer = EntityRecognizer(self.models.nlp)
        self.keyword_extractor = KeywordExtractor(self.models.nlp, self.models.tfidf_vectorizer)
        self.relationship_analyzer = RelationshipAnalyzer(self.models.nlp)
        self.sentiment_analyzer = SentimentAnalyzer(self.models.sia)
    
    def classify_intent(self, text: str) -> str:
        """Classify the intent of the text."""
        import re
        text_lower = text.lower()
        
        for intent, patterns in self.models.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return intent
        
        return 'informational'
    
    def basic_preprocessing(self, text: str) -> str:
        """Basic text preprocessing."""
        if not text.strip():
            return ""
        
        doc = self.models.nlp(text)
        processed_tokens = []
        
        for token in doc:
            if (not token.is_stop and 
                not token.is_punct and 
                not token.is_space and 
                len(token.text) > 1):
                processed_tokens.append(token.lemma_.lower())
        
        return ' '.join(processed_tokens)
    
    def process_text_advanced(self, text: str, options: Dict[str, bool]) -> Dict[str, Any]:
        """
        Comprehensive text processing with all advanced NLP features.
        
        Args:
            text: Input text to process
            options: Dictionary of processing options
            
        Returns:
            Dictionary containing all analysis results
        """
        if not text or not text.strip():
            return {'error': 'Empty text provided'}
        
        results = {}
        processing_steps = []
        
        try:
            # Basic preprocessing
            if options.get('basicPreprocessing', True):
                results['processed_text'] = self.basic_preprocessing(text)
                processing_steps.append('Basic text preprocessing (tokenization, lemmatization, stop word removal)')
            else:
                results['processed_text'] = text
            
            # Context Analysis
            if options.get('intentClassification', True):
                intent = self.classify_intent(text)
                readability = self.sentiment_analyzer.calculate_readability(text)
                
                results['context_analysis'] = {
                    'intent': intent,
                    'complexity': readability['complexity'],
                    'readability_score': readability['flesch_ease'],
                    'grade_level': readability['flesch_kincaid'],
                    'language': 'english'
                }
                processing_steps.append(f'Context analysis: Intent={intent}')
            
            # Keyword Extraction
            if options.get('keywordExtraction', True):
                results['keywords'] = self.keyword_extractor.extract_keywords_advanced(text)
                processing_steps.append(f'Advanced keyword extraction: {len(results["keywords"])} keywords identified')
            
            # Named Entity Recognition
            if options.get('entityRecognition', True):
                results['entities'] = self.entity_recognizer.extract_named_entities(text)
                processing_steps.append(f'Named entity recognition: {len(results["entities"])} entities found')
            
            # Sentiment Analysis
            if options.get('sentimentAnalysis', True):
                results['sentiment'] = self.sentiment_analyzer.analyze_sentiment(text)
                processing_steps.append(f'Sentiment analysis: {results["sentiment"]["label"]} sentiment detected')
            
            # Relationship Mapping
            if options.get('relationshipMapping', True):
                keywords = results.get('keywords', [])
                entities = results.get('entities', [])
                results['relationships'] = self.relationship_analyzer.build_concept_relationships(text, keywords, entities)
                processing_steps.append(f'Relationship mapping: {len(results["relationships"])} concept relationships identified')
            
            # Readability Analysis
            results['readability'] = self.sentiment_analyzer.calculate_readability(text)
            
            # Generate Statistics
            original_words = len(text.split())
            processed_words = len(results['processed_text'].split()) if results.get('processed_text') else 0
            
            results['statistics'] = {
                'original_word_count': original_words,
                'processed_word_count': processed_words,
                'keyword_count': len(results.get('keywords', [])),
                'entity_count': len(results.get('entities', [])),
                'relationship_count': len(results.get('relationships', [])),
                'sentiment': results.get('sentiment', {}).get('label', 'neutral'),
                'complexity_score': results['readability']['flesch_ease'],
                'processing_reduction': round((1 - processed_words/max(original_words, 1)) * 100, 1)
            }
            
            results['processing_steps'] = processing_steps
            results['success'] = True
            
            logger.info(f"Successfully processed text of {original_words} words with {len(processing_steps)} steps")
            
        except Exception as e:
            logger.error(f"Error in advanced processing: {e}")
            results['error'] = str(e)
            results['success'] = False
        
        return results
