#!/usr/bin/env python3
"""
Cleanup Script for Node-Link Project
Removes old files that have been reorganized
"""

import os
import shutil
from pathlib import Path

def cleanup_old_files():
    """Remove old files that have been reorganized."""
    old_files = [
        "app-compiled.js",
        "app.js", 
        "content_processor.js",
        "graph-visualization.html",
        "index.html",
        "script.js",
        "styles.css"
    ]
    
    old_dirs = [
        "src",
        "public"
    ]
    
    print("🧹 Cleaning up old files...")
    
    # Remove old files
    for file in old_files:
        if os.path.exists(file):
            os.remove(file)
            print(f"   Removed: {file}")
    
    # Remove old directories
    for dir_name in old_dirs:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"   Removed directory: {dir_name}")
    
    print("✅ Cleanup complete!")

if __name__ == "__main__":
    cleanup_old_files()
