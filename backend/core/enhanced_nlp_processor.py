"""
Enhanced NLP Processor
Integrates batch processing and LLM refinement for better graph data
"""

import json
import logging
from typing import Dict, Any, List, Optional
from .batch_processor import BatchProcessor, BatchConfig
from .llm_refinement_processor import LLMRefinementProcessor
from .nlp_processor import AdvancedNLPProcessor

logger = logging.getLogger(__name__)

class EnhancedNLPProcessor:
    """Enhanced NLP processor with batch processing and LLM refinement"""
    
    def __init__(self, batch_config: Optional[BatchConfig] = None):
        self.batch_processor = BatchProcessor(batch_config)
        self.llm_refinement = LLMRefinementProcessor()
        self.base_nlp_processor = AdvancedNLPProcessor()
        
    def process_text_enhanced(self, text: str, gemini_processor=None, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process text with enhanced pipeline: NLP → Batch → LLM Refinement → Merge
        
        Args:
            text: Input text to process
            gemini_processor: Gemini Nano processor for LLM refinement
            options: Processing options
            
        Returns:
            Enhanced and refined NLP results
        """
        try:
            logger.info(f"Starting enhanced NLP processing for text of {len(text)} characters")
            
            # Step 1: Basic NLP preprocessing
            logger.info("Step 1: Running basic NLP preprocessing...")
            raw_nlp_results = self.base_nlp_processor.process_text_advanced(text, options or {})
            
            # Step 2: Create batches
            logger.info("Step 2: Creating batches for LLM refinement...")
            batches = self.batch_processor.create_batches(raw_nlp_results)
            
            if not batches:
                logger.warning("No batches created, returning raw NLP results")
                return raw_nlp_results
            
            # Step 3: Refine each batch with LLM
            logger.info(f"Step 3: Refining {len(batches)} batches with LLM...")
            refined_batches = []
            
            for batch in batches:
                logger.info(f"Refining batch: {batch['batch_id']} ({batch['batch_type']})")
                refined_batch = self.llm_refinement.refine_batch(batch, gemini_processor)
                refined_batches.append(refined_batch)
            
            # Step 4: Merge refined batches
            logger.info("Step 4: Merging refined batches...")
            final_results = self.batch_processor.merge_batches(refined_batches)
            
            # Step 5: Add metadata
            final_results['processing_metadata'] = {
                'total_batches': len(batches),
                'refinement_methods': [batch.get('refinement_method', 'unknown') for batch in refined_batches],
                'original_text_length': len(text),
                'enhanced_pipeline': True
            }
            
            logger.info(f"Enhanced processing complete: {len(final_results['entities'])} entities, "
                       f"{len(final_results['keywords'])} keywords, "
                       f"{len(final_results['relationships'])} relationships")
            
            return final_results
            
        except Exception as e:
            logger.error(f"Enhanced NLP processing failed: {e}")
            # Fallback to basic processing
            logger.info("Falling back to basic NLP processing...")
            return self.base_nlp_processor.process_text_advanced(text, options or {})
    
    def process_text_basic(self, text: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process text with basic NLP pipeline (fallback)
        
        Args:
            text: Input text to process
            options: Processing options
            
        Returns:
            Basic NLP results
        """
        return self.base_nlp_processor.process_text_advanced(text, options or {})
    
    def get_processing_stats(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Get statistics about the processing results"""
        stats = {
            'entities_count': len(results.get('entities', [])),
            'keywords_count': len(results.get('keywords', [])),
            'relationships_count': len(results.get('relationships', [])),
            'enhanced_pipeline': results.get('processing_metadata', {}).get('enhanced_pipeline', False)
        }
        
        if 'processing_metadata' in results:
            stats['processing_metadata'] = results['processing_metadata']
            
        return stats
