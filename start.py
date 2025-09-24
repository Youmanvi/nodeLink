#!/usr/bin/env python3
"""
Startup Script for Node-Link Knowledge Graph Platform
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed."""
    try:
        import flask
        import spacy
        import nltk
        import sklearn
        print("All Python dependencies are installed")
        return True
    except ImportError as e:
        print("Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_spacy_model():
    """Check if spaCy English model is installed."""
    try:
        import spacy
        nlp = spacy.load("en_core_web_sm")
        print("spaCy English model is installed")
        return True
    except OSError:
        print("spaCy English model not found")
        print("Please run: python -m spacy download en_core_web_sm")
        return False

def start_server():
    """Start the Flask server."""
    print("Starting Node-Link Knowledge Graph Platform...")
    print("Backend will be available at: http://127.0.0.1:5000")
    print("Frontend will be available at: http://127.0.0.1:5000")
    print("\nStarting server...")
    
    # Change to backend directory
    current_dir = Path.cwd()
    backend_dir = current_dir / "backend"
    os.chdir(backend_dir)
    
    # Start the Flask app
    subprocess.run([sys.executable, "app.py"])

def main():
    """Main startup function."""
    print("Node-Link Knowledge Graph Platform")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    if not check_spacy_model():
        sys.exit(1)
    
    print("\nSystem Requirements:")
    print("   • Python 3.8+")
    print("   • Chrome browser with experimental AI features")
    print("   • Internet connection for initial setup")
    
    print("\nChrome AI Setup:")
    print("   1. Open Chrome and go to chrome://flags/")
    print("   2. Search for 'optimization-guide-on-device-model'")
    print("   3. Enable the flag and restart Chrome")
    
    print("\n" + "=" * 50)
    
    # Start the server
    try:
        start_server()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"\nError starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
