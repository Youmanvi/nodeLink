"""
Main Flask Application
Entry point for the NLP processing service
"""

from flask import Flask, jsonify, send_file
from flask_cors import CORS
import logging
import os

from api.routes import api_bp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app with static folder configuration
app = Flask(__name__, static_folder='../static', static_url_path='/static')
CORS(app)

# Register blueprints
app.register_blueprint(api_bp)

@app.route('/')
def serve_frontend():
    """Serve the main frontend HTML file."""
    try:
        return send_file('../static/index.html')
    except Exception as e:
        logger.error(f"Error serving frontend: {e}")
        return jsonify({'error': 'Frontend not available'}), 500

@app.route('/favicon.ico')
def favicon():
    """Serve favicon."""
    try:
        return send_file('../static/favicon.ico')
    except:
        return '', 404

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': [
            '/',
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
    print("Starting Advanced NLP Text Preprocessor Server...")
    print("Server will be available at: http://127.0.0.1:5000")
    print("Frontend will be available at: http://127.0.0.1:5000")
    print("Health check: http://127.0.0.1:5000/api/health")
    print("Main endpoint: http://127.0.0.1:5000/api/process-advanced")
    print("\nRequired dependencies:")
    print("   pip install flask flask-cors spacy nltk textstat scikit-learn networkx numpy")
    print("   python -m spacy download en_core_web_sm")
    print("\nStarting server...")
    
    app.run(debug=True, host='127.0.0.1', port=5000)
