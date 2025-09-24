"""
API Routes
Handles all API endpoints for the NLP processing service
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging

from core.nlp_processor import AdvancedNLPProcessor
from core.enhanced_nlp_processor import EnhancedNLPProcessor
from core.batch_processor import BatchConfig

logger = logging.getLogger(__name__)

# Create blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Initialize processors
nlp_processor = AdvancedNLPProcessor()
enhanced_nlp_processor = EnhancedNLPProcessor()

@api_bp.route('/health', methods=['GET'])
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
                'spacy': nlp_processor.models.nlp is not None,
                'nltk_sentiment': nlp_processor.models.sia is not None,
                'tfidf': nlp_processor.models.tfidf_vectorizer is not None
            },
            'test_processing': test_result.get('success', False)
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@api_bp.route('/process-advanced', methods=['POST'])
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
        
        # Set streamlined options - only what we need for knowledge graphs
        default_options = {
            'basicPreprocessing': True,
            'keywordExtraction': True,
            'entityRecognition': True,
            'relationshipMapping': True,
            'sentimentAnalysis': False,  # Not needed for knowledge graphs
            'topicModeling': False,      # Not needed for knowledge graphs
            'intentClassification': False, # Not needed for knowledge graphs
            'conceptExtraction': False,   # Not needed for knowledge graphs
            'contextualEmbedding': False  # Not needed for knowledge graphs
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
        
        # Return only essential data for knowledge graphs - no metadata
        response_data = {
            'entities': results.get('entities', []),
            'keywords': results.get('keywords', []),
            'relationships': results.get('relationships', [])
        }
        
        logger.info(f"Successfully processed text: {len(response_data['entities'])} entities, {len(response_data['keywords'])} keywords, {len(response_data['relationships'])} relationships")
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in process_text_advanced: {e}")
        return jsonify({
            'error': f'Internal processing error: {str(e)}',
            'timestamp': datetime.now().isoformat(),
            'success': False
        }), 500

@api_bp.route('/process-enhanced', methods=['POST'])
def process_text_enhanced():
    """
    Enhanced text processing endpoint with LLM refinement pipeline.
    
    Expected JSON payload:
    {
        "text": "Text to process...",
        "options": {
            "use_enhanced_pipeline": true,
            "batch_size": {
                "entities_per_batch": 20,
                "keywords_per_batch": 30,
                "relationships_per_batch": 25
            }
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
        
        # Configure batch processing
        batch_config = None
        if 'batch_size' in options:
            batch_config = BatchConfig(
                entities_per_batch=options['batch_size'].get('entities_per_batch', 20),
                keywords_per_batch=options['batch_size'].get('keywords_per_batch', 30),
                relationships_per_batch=options['batch_size'].get('relationships_per_batch', 25)
            )
        
        # Log processing request
        logger.info(f"Processing text with enhanced pipeline: {len(text)} characters, {len(text.split())} words")
        
        # Process the text with enhanced pipeline
        results = enhanced_nlp_processor.process_text_enhanced(text, None, options)
        
        # Get processing statistics
        stats = enhanced_nlp_processor.get_processing_stats(results)
        
        # Return enhanced results
        response_data = {
            'entities': results.get('entities', []),
            'keywords': results.get('keywords', []),
            'relationships': results.get('relationships', []),
            'processing_stats': stats,
            'enhanced_pipeline': True
        }
        
        logger.info(f"Enhanced processing complete: {stats['entities_count']} entities, "
                   f"{stats['keywords_count']} keywords, {stats['relationships_count']} relationships")
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in enhanced processing: {e}")
        return jsonify({
            'error': f'Enhanced processing error: {str(e)}',
            'timestamp': datetime.now().isoformat(),
            'success': False
        }), 500

@api_bp.route('/keywords-only', methods=['POST'])
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
        
        keywords = nlp_processor.keyword_extractor.extract_keywords_advanced(text, max_keywords)
        
        return jsonify({
            'keywords': keywords,
            'count': len(keywords),
            'processed_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in keywords extraction: {e}")
        return jsonify({'error': str(e)}), 500

@api_bp.route('/entities-only', methods=['POST'])
def extract_entities_only():
    """Endpoint for named entity extraction only."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Request body must be JSON'}), 400
        
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        entities = nlp_processor.entity_recognizer.extract_named_entities(text)
        
        return jsonify({
            'entities': entities,
            'count': len(entities),
            'entity_types': list(set(ent['label'] for ent in entities)),
            'processed_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in entity extraction: {e}")
        return jsonify({'error': str(e)}), 500

@api_bp.route('/sentiment-only', methods=['POST'])
def analyze_sentiment_only():
    """Endpoint for sentiment analysis only."""
    try:
        if not request.is_json:
            return jsonify({'error': 'Request body must be JSON'}), 400
        
        data = request.get_json()
        text = data.get('text', '').strip()
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        sentiment = nlp_processor.sentiment_analyzer.analyze_sentiment(text)
        
        return jsonify({
            'sentiment': sentiment,
            'processed_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in sentiment analysis: {e}")
        return jsonify({'error': str(e)}), 500
