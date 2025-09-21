"""
Advanced NLP Text Preprocessor Backend
Comprehensive text analysis with keyword extraction, entity recognition, 
relationship mapping, and context analysis for LLM preparation.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.corpus import stopwords
from textstat import flesch_reading_ease, flesch_kincaid_grade
from collections import Counter, defaultdict
import re
import math
import logging
from datetime import datetime
import json
from typing import Dict, List, Tuple, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

class AdvancedNLPProcessor:
    """Advanced NLP processing class with comprehensive text analysis capabilities."""
    
    def __init__(self):
        """Initialize the NLP processor with required models and tools."""
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
    
    
    def classify_intent(self, text: str) -> str:
        """Classify the intent of the text."""
        text_lower = text.lower()
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    return intent
        
        return 'informational'
    
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
    
    def extract_named_entities(self, text: str) -> List[Dict[str, str]]:
        """Extract named entities with their types."""
        if not text.strip():
            return []
        
        doc = self.nlp(text)
        entities = []
        
        for ent in doc.ents:
            if len(ent.text.strip()) > 1:  # Filter out single characters
                entities.append({
                    'text': ent.text.strip(),
                    'label': ent.label_,
                    'description': spacy.explain(ent.label_) or ent.label_,
                    'start': ent.start_char,
                    'end': ent.end_char
                })
        
        # Remove duplicates while preserving order
        seen = set()
        unique_entities = []
        for entity in entities:
            key = (entity['text'].lower(), entity['label'])
            if key not in seen:
                seen.add(key)
                unique_entities.append(entity)
        
        return unique_entities
    
    def build_concept_relationships(self, text: str, keywords: List[Dict], entities: List[Dict]) -> List[Dict[str, Any]]:
        """Build relationships between concepts, keywords, and entities."""
        if not text.strip():
            return []
        
        doc = self.nlp(text)
        relationships = []
        
        # Extract all important terms
        all_terms = set()
        keyword_terms = {kw['word'] for kw in keywords[:10]}  # Top 10 keywords
        entity_terms = {ent['text'].lower() for ent in entities}
        all_terms.update(keyword_terms)
        all_terms.update(entity_terms)
        
        # Analyze syntactic relationships
        for sent in doc.sents:
            sent_terms = []
            for token in sent:
                if token.lemma_.lower() in all_terms or token.text.lower() in entity_terms:
                    sent_terms.append({
                        'text': token.text,
                        'lemma': token.lemma_.lower(),
                        'pos': token.pos_,
                        'dep': token.dep_,
                        'head': token.head.text,
                        'idx': token.i
                    })
            
            # Create relationships within sentences
            for i, term1 in enumerate(sent_terms):
                for term2 in sent_terms[i+1:]:
                    # Distance-based relationship strength
                    distance = abs(term2['idx'] - term1['idx'])
                    if distance <= 5:  # Only consider nearby terms
                        rel_type = self._determine_relationship_type(term1, term2, sent)
                        if rel_type:
                            relationships.append({
                                'source': term1['text'],
                                'target': term2['text'],
                                'type': rel_type,
                                'strength': 1.0 / (distance + 1),
                                'context': sent.text.strip(),
                                'description': f"{term1['text']} {rel_type.lower()} {term2['text']}"
                            })
        
        # Co-occurrence relationships
        sentences = [sent.text for sent in doc.sents]
        for i, term1 in enumerate(list(all_terms)[:10]):  # Limit to prevent explosion
            for term2 in list(all_terms)[i+1:10]:
                cooccurrence = sum(1 for sent in sentences 
                                 if term1 in sent.lower() and term2 in sent.lower())
                if cooccurrence > 0:
                    relationships.append({
                        'source': term1,
                        'target': term2,
                        'type': 'co-occurs',
                        'strength': cooccurrence / len(sentences),
                        'context': f"Co-occurs in {cooccurrence} sentences",
                        'description': f"{term1} frequently appears with {term2}"
                    })
        
        # Remove duplicates and sort by strength
        unique_relationships = {}
        for rel in relationships:
            key = (rel['source'].lower(), rel['target'].lower(), rel['type'])
            if key not in unique_relationships or rel['strength'] > unique_relationships[key]['strength']:
                unique_relationships[key] = rel
        
        final_relationships = list(unique_relationships.values())
        final_relationships.sort(key=lambda x: x['strength'], reverse=True)
        
        return final_relationships[:15]  # Return top 15 relationships
    
    def _determine_relationship_type(self, term1: Dict, term2: Dict, sentence) -> str:
        """Determine the type of relationship between two terms."""
        # Simple rule-based relationship detection
        deps1, deps2 = term1['dep'], term2['dep']
        pos1, pos2 = term1['pos'], term2['pos']
        
        if 'subj' in deps1 and 'obj' in deps2:
            return 'acts-on'
        elif 'obj' in deps1 and 'subj' in deps2:
            return 'acted-on-by'
        elif pos1 == 'NOUN' and pos2 == 'ADJ':
            return 'has-property'
        elif pos1 == 'ADJ' and pos2 == 'NOUN':
            return 'describes'
        elif 'compound' in deps1 or 'compound' in deps2:
            return 'modifies'
        elif pos1 == 'NOUN' and pos2 == 'NOUN':
            return 'relates-to'
        else:
            return 'associated-with'
    
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
    
    def basic_preprocessing(self, text: str) -> str:
        """Basic text preprocessing."""
        if not text.strip():
            return ""
        
        doc = self.nlp(text)
        processed_tokens = []
        
        for token in doc:
            if (not token.is_stop and 
                not token.is_punct and 
                not token.is_space and 
                len(token.text) > 1):
                processed_tokens.append(token.lemma_.lower())
        
        return ' '.join(processed_tokens)
    
    def create_llm_ready_format(self, original_text: str, analysis_results: Dict) -> Dict[str, Any]:
        """Create a structured format optimized for LLM consumption."""
        return {
            'meta': {
                'processed_at': datetime.now().isoformat(),
                'text_length': len(original_text),
                'word_count': len(original_text.split()),
                'processing_version': '2.0'
            },
            'content': {
                'original_text': original_text,
                'processed_text': analysis_results.get('processed_text', ''),
                'intent': analysis_results.get('context_analysis', {}).get('intent', 'informational')
            },
            'keywords': {
                'primary': [kw['word'] for kw in analysis_results.get('keywords', [])[:5]],
                'secondary': [kw['word'] for kw in analysis_results.get('keywords', [])[5:10]],
                'all_with_scores': analysis_results.get('keywords', [])
            },
            'entities': {
                'named_entities': analysis_results.get('entities', []),
                'entity_types': list(set(ent['label'] for ent in analysis_results.get('entities', []))),
                'entity_count_by_type': {}
            },
            'relationships': {
                'concept_relationships': analysis_results.get('relationships', []),
                'relationship_types': list(set(rel['type'] for rel in analysis_results.get('relationships', []))),
                'relationship_strength': [rel['strength'] for rel in analysis_results.get('relationships', [])]
            },
            'sentiment': analysis_results.get('sentiment', {}),
            'context': {
                'readability': analysis_results.get('readability', {}),
                'complexity_indicators': {
                    'avg_word_length': sum(len(word) for word in original_text.split()) / max(len(original_text.split()), 1),
                    'sentence_count': len([s for s in original_text.split('.') if s.strip()]),
                    'unique_word_ratio': len(set(original_text.lower().split())) / max(len(original_text.split()), 1)
                }
            },
            'instructions_for_llm': {
                'context_summary': f"This text has {analysis_results.get('context_analysis', {}).get('intent', 'informational')} intent.",
                'key_focus_areas': [kw['word'] for kw in analysis_results.get('keywords', [])[:3]],
                'suggested_approach': self._suggest_llm_approach(analysis_results)
            }
        }
    
    def _suggest_llm_approach(self, analysis_results: Dict) -> str:
        """Suggest optimal LLM processing approach based on analysis."""
        intent = analysis_results.get('context_analysis', {}).get('intent', 'informational')
        complexity = analysis_results.get('readability', {}).get('complexity', 'standard')
        
        if intent == 'question':
            return "Answer the question with clear, structured responses."
        elif intent == 'explanation':
            return "Provide detailed explanation emphasizing key terminology and concepts."
        elif intent == 'analysis':
            return "Perform analytical breakdown with attention to relationships between key concepts."
        elif complexity in ['difficult', 'very difficult']:
            return "Simplify complex concepts while maintaining technical accuracy."
        else:
            return f"Process as {intent} content with standard approach."
    
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
                readability = self.calculate_readability(text)
                
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
                results['keywords'] = self.extract_keywords_advanced(text)
                processing_steps.append(f'Advanced keyword extraction: {len(results["keywords"])} keywords identified')
            
            # Named Entity Recognition
            if options.get('entityRecognition', True):
                results['entities'] = self.extract_named_entities(text)
                processing_steps.append(f'Named entity recognition: {len(results["entities"])} entities found')
            
            # Sentiment Analysis
            if options.get('sentimentAnalysis', True):
                results['sentiment'] = self.analyze_sentiment(text)
                processing_steps.append(f'Sentiment analysis: {results["sentiment"]["label"]} sentiment detected')
            
            # Relationship Mapping
            if options.get('relationshipMapping', True):
                keywords = results.get('keywords', [])
                entities = results.get('entities', [])
                results['relationships'] = self.build_concept_relationships(text, keywords, entities)
                processing_steps.append(f'Relationship mapping: {len(results["relationships"])} concept relationships identified')
            
            # Readability Analysis
            results['readability'] = self.calculate_readability(text)
            
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
            
            # Create LLM-Ready Format
            if options.get('contextualEmbedding', True):
                results['llm_ready_format'] = self.create_llm_ready_format(text, results)
                processing_steps.append('Generated LLM-optimized format with contextual embeddings')
            
            results['processing_steps'] = processing_steps
            results['success'] = True
            
            logger.info(f"Successfully processed text of {original_words} words with {len(processing_steps)} steps")
            
        except Exception as e:
            logger.error(f"Error in advanced processing: {e}")
            results['error'] = str(e)
            results['success'] = False
        
        return results

# Initialize the processor
nlp_processor = AdvancedNLPProcessor()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    try:
        # Test basic functionality
        test_result = nlp_processor.process_text_advanced("Test sentence.", {
            'basicPreprocessing': True,
            'keywordExtraction': False,
            'entityRecognition': False,
            'sentimentAnalysis': False,
            'topicModeling': False,
            'relationshipMapping': False,
            'domainDetection': False,
            'intentClassification': False,
            'conceptExtraction': False,
            'contextualEmbedding': False
        })
        
        return jsonify({
            'status': 'healthy',
            'timestamp': datetime.now().isoformat(),
            'models_loaded': {
                'spacy': nlp_processor.nlp is not None,
                'nltk_sentiment': nlp_processor.sia is not None,
                'tfidf': nlp_processor.tfidf_vectorizer is not None
            },
            'test_processing': test_result.get('success', False)
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/process-advanced', methods=['POST'])
def process_text_advanced():
    """
    Advanced text processing endpoint with comprehensive NLP analysis.
    
    Expected JSON payload:
    {
        "text": "Text to process...",
        "options": {
            "basicPreprocessing": true,
            "keywordExtraction": true,
            "entityRecognition": true,
            "sentimentAnalysis": true,
            "topicModeling": true,
            "relationshipMapping": true,
            "domainDetection": true,
            "intentClassification": true,
            "conceptExtraction": true,
            "contextualEmbedding": true
        }
    }
    """
    try:
        # Validate request
        if not request.is_json:
            return jsonify({'error': 'Request body must be JSON'}), 400
        
        data = request.get_json()
        text = data.get('text', '').strip()
        options = data.get('options', {})
        
        # Validate input
        if not text:
            return jsonify({'error': 'No text provided for processing'}), 400
        
        if len(text) > 50000:  # Limit text length
            return jsonify({'error': 'Text too long. Maximum 50,000 characters allowed.'}), 400
        
        # Set default options
        default_options = {
            'basicPreprocessing': True,
            'keywordExtraction': True,
            'entityRecognition': True,
            'sentimentAnalysis': True,
            'topicModeling': True,
            'relationshipMapping': True,
            'intentClassification': True,
            'conceptExtraction': True,
            'contextualEmbedding': True
        }
        
        # Merge with provided options
        processing_options = {**default_options, **options}
        
        # Log processing request
        logger.info(f"Processing text: {len(text)} characters, {len(text.split())} words")
        
        # Process the text
        results = nlp_processor.process_text_advanced(text, processing_options)
        
        if not results.get('success'):
            return jsonify({
                'error': results.get('error', 'Unknown processing error'),
                'timestamp': datetime.now().isoformat()
            }), 500
        
        # Add metadata
        response_data = {
            **results,
            'metadata': {
                'processed_at': datetime.now().isoformat(),
                'processing_time': 'calculated_by_frontend',
                'api_version': '2.0',
                'total_steps': len(results.get('processing_steps', [])),
                'options_used': processing_options
            }
        }
        
        logger.info(f"Successfully processed text with {len(results.get('processing_steps', []))} steps")
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in process_text_advanced: {e}")
        return jsonify({
            'error': f'Internal processing error: {str(e)}',
            'timestamp': datetime.now().isoformat(),
            'success': False
        }), 500

@app.route('/api/keywords-only', methods=['POST'])
def extract_keywords_only():
    """Endpoint for keyword extraction only."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Request body must be JSON'}), 400
        
        data = request.get_json()
        text = data.get('text', '').strip()
        max_keywords = data.get('max_keywords', 20)
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        keywords = nlp_processor.extract_keywords_advanced(text, max_keywords)
        
        return jsonify({
            'keywords': keywords,
            'count': len(keywords),
            'processed_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in keywords extraction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/entities-only', methods=['POST'])
def extract_entities_only():
    """Endpoint for named entity extraction only."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Request body must be JSON'}), 400
        
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        entities = nlp_processor.extract_named_entities(text)
        
        return jsonify({
            'entities': entities,
            'count': len(entities),
            'entity_types': list(set(ent['label'] for ent in entities)),
            'processed_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in entity extraction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sentiment-only', methods=['POST'])
def analyze_sentiment_only():
    """Endpoint for sentiment analysis only."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Request body must be JSON'}), 400
        
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        sentiment = nlp_processor.analyze_sentiment(text)
        
        return jsonify({
            'sentiment': sentiment,
            'processed_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': [
            '/api/health',
            '/api/process-advanced',
            '/api/keywords-only',
            '/api/entities-only',
            '/api/sentiment-only'
        ]
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        'error': 'Internal server error',
        'message': 'Please check server logs for details'
    }), 500

if __name__ == '__main__':
    print("🚀 Starting Advanced NLP Text Preprocessor Server...")
    print("📍 Server will be available at: http://127.0.0.1:5000")
    print("🔍 Health check: http://127.0.0.1:5000/api/health")
    print("📖 Main endpoint: http://127.0.0.1:5000/api/process-advanced")
    print("\n📋 Required dependencies:")
    print("   pip install flask flask-cors spacy nltk textstat scikit-learn networkx numpy")
    print("   python -m spacy download en_core_web_sm")
    print("\n⚡ Starting server...")
    
    app.run(debug=True, host='127.0.0.1', port=5000)