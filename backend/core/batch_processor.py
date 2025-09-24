"""
Batch Processor for NLP Data
Handles chunking and processing of large NLP outputs
"""

import json
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class BatchConfig:
    """Configuration for batch processing"""
    entities_per_batch: int = 20
    keywords_per_batch: int = 30
    relationships_per_batch: int = 25
    max_batch_size: int = 1000

class BatchProcessor:
    """Processes NLP data in batches for LLM refinement"""
    
    def __init__(self, config: Optional[BatchConfig] = None):
        self.config = config or BatchConfig()
        self.batches = []
        
    def create_batches(self, nlp_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Split NLP data into manageable batches
        
        Args:
            nlp_data: Raw NLP output with entities, keywords, relationships
            
        Returns:
            List of batch objects ready for LLM processing
        """
        batches = []
        
        # Process entities in batches
        entities = nlp_data.get('entities', [])
        for i in range(0, len(entities), self.config.entities_per_batch):
            batch_entities = entities[i:i + self.config.entities_per_batch]
            batch = {
                'batch_id': f"entities_{i//self.config.entities_per_batch + 1}",
                'batch_type': 'entities',
                'data': batch_entities,
                'total_batches': (len(entities) + self.config.entities_per_batch - 1) // self.config.entities_per_batch
            }
            batches.append(batch)
            
        # Process keywords in batches
        keywords = nlp_data.get('keywords', [])
        for i in range(0, len(keywords), self.config.keywords_per_batch):
            batch_keywords = keywords[i:i + self.config.keywords_per_batch]
            batch = {
                'batch_id': f"keywords_{i//self.config.keywords_per_batch + 1}",
                'batch_type': 'keywords',
                'data': batch_keywords,
                'total_batches': (len(keywords) + self.config.keywords_per_batch - 1) // self.config.keywords_per_batch
            }
            batches.append(batch)
            
        # Process relationships in batches
        relationships = nlp_data.get('relationships', [])
        for i in range(0, len(relationships), self.config.relationships_per_batch):
            batch_relationships = relationships[i:i + self.config.relationships_per_batch]
            batch = {
                'batch_id': f"relationships_{i//self.config.relationships_per_batch + 1}",
                'batch_type': 'relationships',
                'data': batch_relationships,
                'total_batches': (len(relationships) + self.config.relationships_per_batch - 1) // self.config.relationships_per_batch
            }
            batches.append(batch)
            
        logger.info(f"Created {len(batches)} batches from NLP data")
        return batches
    
    def merge_batches(self, batch_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Merge refined batch results back into a single structure
        
        Args:
            batch_results: List of refined batch outputs from LLM
            
        Returns:
            Merged and deduplicated final structure
        """
        merged_data = {
            'entities': [],
            'keywords': [],
            'relationships': []
        }
        
        # Collect all refined data
        for batch_result in batch_results:
            batch_type = batch_result.get('batch_type')
            refined_data = batch_result.get('refined_data', [])
            
            if batch_type in merged_data:
                merged_data[batch_type].extend(refined_data)
        
        # Deduplicate entities
        merged_data['entities'] = self._deduplicate_entities(merged_data['entities'])
        
        # Deduplicate keywords
        merged_data['keywords'] = self._deduplicate_keywords(merged_data['keywords'])
        
        # Deduplicate relationships
        merged_data['relationships'] = self._deduplicate_relationships(merged_data['relationships'])
        
        logger.info(f"Merged batches: {len(merged_data['entities'])} entities, "
                   f"{len(merged_data['keywords'])} keywords, "
                   f"{len(merged_data['relationships'])} relationships")
        
        return merged_data
    
    def _deduplicate_entities(self, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate entities based on text similarity"""
        seen = set()
        unique_entities = []
        
        for entity in entities:
            text_key = entity.get('text', '').lower().strip()
            if text_key and text_key not in seen:
                seen.add(text_key)
                unique_entities.append(entity)
                
        return unique_entities
    
    def _deduplicate_keywords(self, keywords: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate keywords"""
        seen = set()
        unique_keywords = []
        
        for keyword in keywords:
            word_key = keyword.get('word', '').lower().strip()
            if word_key and word_key not in seen:
                seen.add(word_key)
                unique_keywords.append(keyword)
                
        return unique_keywords
    
    def _deduplicate_relationships(self, relationships: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate relationships"""
        seen = set()
        unique_relationships = []
        
        for rel in relationships:
            rel_key = f"{rel.get('source', '')}-{rel.get('target', '')}-{rel.get('type', '')}"
            if rel_key and rel_key not in seen:
                seen.add(rel_key)
                unique_relationships.append(rel)
                
        return unique_relationships
