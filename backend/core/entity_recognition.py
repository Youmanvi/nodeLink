"""
Entity Recognition Module
Handles named entity extraction and processing
"""

import spacy
from typing import List, Dict

class EntityRecognizer:
    """Handles named entity recognition and processing."""
    
    def __init__(self, nlp_model):
        self.nlp = nlp_model
    
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
