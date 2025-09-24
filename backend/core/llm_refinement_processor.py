"""
LLM Refinement Processor
Uses Gemini Nano to clean and standardize NLP outputs
"""

import json
import logging
from typing import Dict, Any, List, Optional
import re

logger = logging.getLogger(__name__)

class LLMRefinementProcessor:
    """Refines NLP data using LLM for better graph visualization"""
    
    def __init__(self):
        self.refinement_prompts = {
            'entities': self._get_entity_refinement_prompt(),
            'keywords': self._get_keyword_refinement_prompt(),
            'relationships': self._get_relationship_refinement_prompt()
        }
    
    def refine_batch(self, batch_data: Dict[str, Any], gemini_processor=None) -> Dict[str, Any]:
        """
        Refine a batch of NLP data using LLM
        
        Args:
            batch_data: Batch containing entities, keywords, or relationships
            gemini_processor: Gemini Nano processor instance
            
        Returns:
            Refined batch data
        """
        batch_type = batch_data.get('batch_type')
        raw_data = batch_data.get('data', [])
        
        if not raw_data:
            return batch_data
            
        try:
            if gemini_processor and gemini_processor.isInitialized:
                # Use Gemini Nano for refinement
                refined_data = self._refine_with_gemini(raw_data, batch_type, gemini_processor)
            else:
                # Fallback to rule-based refinement
                refined_data = self._refine_with_rules(raw_data, batch_type)
                
            return {
                **batch_data,
                'refined_data': refined_data,
                'refinement_method': 'gemini' if gemini_processor else 'rules'
            }
            
        except Exception as e:
            logger.error(f"Error refining batch {batch_data.get('batch_id')}: {e}")
            # Return original data if refinement fails
            return {
                **batch_data,
                'refined_data': raw_data,
                'refinement_method': 'failed'
            }
    
    def _refine_with_gemini(self, raw_data: List[Dict[str, Any]], batch_type: str, gemini_processor) -> List[Dict[str, Any]]:
        """Refine data using Gemini Nano"""
        prompt = self.refinement_prompts.get(batch_type, "")
        raw_json = json.dumps(raw_data, indent=2)
        
        # Create the full prompt
        full_prompt = prompt.replace("{RAW_NLP_BATCH_JSON}", raw_json)
        
        try:
            # Use Gemini Nano to refine the data
            response = gemini_processor.processText(full_prompt)
            
            # Parse the JSON response
            refined_data = json.loads(response)
            
            # Extract the appropriate array based on batch type
            if batch_type in refined_data:
                return refined_data[batch_type]
            else:
                logger.warning(f"Gemini response missing {batch_type} key")
                return raw_data
                
        except Exception as e:
            logger.error(f"Gemini refinement failed: {e}")
            return self._refine_with_rules(raw_data, batch_type)
    
    def _refine_with_rules(self, raw_data: List[Dict[str, Any]], batch_type: str) -> List[Dict[str, Any]]:
        """Fallback rule-based refinement"""
        if batch_type == 'entities':
            return self._refine_entities_rules(raw_data)
        elif batch_type == 'keywords':
            return self._refine_keywords_rules(raw_data)
        elif batch_type == 'relationships':
            return self._refine_relationships_rules(raw_data)
        else:
            return raw_data
    
    def _refine_entities_rules(self, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rule-based entity refinement"""
        refined = []
        
        for entity in entities:
            # Extract text and label
            text = entity.get('text', entity.get('label', '')).strip()
            label = entity.get('label', entity.get('type', 'ENTITY')).upper()
            
            # Clean and standardize text
            text = self._clean_text(text)
            
            # Generate description based on type
            description = self._generate_entity_description(text, label)
            
            refined_entity = {
                'text': text,
                'label': label,
                'description': description
            }
            
            refined.append(refined_entity)
            
        return refined
    
    def _refine_keywords_rules(self, keywords: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rule-based keyword refinement"""
        refined = []
        
        for keyword in keywords:
            # Extract word and score
            word = keyword.get('word', keyword.get('text', keyword.get('keyword', ''))).strip()
            score = keyword.get('score', keyword.get('weight', 0.5))
            
            # Clean word
            word = word.lower().strip()
            
            # Ensure score is between 0 and 1
            score = max(0, min(1, float(score)))
            
            refined_keyword = {
                'word': word,
                'score': score
            }
            
            refined.append(refined_keyword)
            
        return refined
    
    def _refine_relationships_rules(self, relationships: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rule-based relationship refinement"""
        refined = []
        
        for rel in relationships:
            # Extract relationship components
            source = rel.get('source', rel.get('from', '')).strip()
            target = rel.get('target', rel.get('to', '')).strip()
            rel_type = rel.get('type', rel.get('relation', 'associated-with')).strip()
            
            # Clean text
            source = self._clean_text(source)
            target = self._clean_text(target)
            
            # Generate context
            context = self._generate_relationship_context(source, target, rel_type)
            
            refined_rel = {
                'source': source,
                'target': target,
                'type': rel_type,
                'context': context
            }
            
            refined.append(refined_rel)
            
        return refined
    
    def _clean_text(self, text: str) -> str:
        """Clean and standardize text"""
        if not text:
            return ""
            
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text.strip())
        
        # Handle common acronyms
        acronyms = {
            'USA': 'United States',
            'US': 'United States',
            'UK': 'United Kingdom',
            'USSR': 'Soviet Union',
            'NASA': 'National Aeronautics and Space Administration',
            'JFK': 'John F. Kennedy'
        }
        
        for acronym, expansion in acronyms.items():
            if text.upper() == acronym:
                return expansion
                
        return text
    
    def _generate_entity_description(self, text: str, label: str) -> str:
        """Generate a simple description for an entity"""
        descriptions = {
            'PERSON': f"{text} is a person mentioned in the text.",
            'ORG': f"{text} is an organization.",
            'GPE': f"{text} is a geopolitical entity.",
            'EVENT': f"{text} is an event or occurrence.",
            'DATE': f"{text} is a date or time reference.",
            'LOCATION': f"{text} is a location or place.",
            'PRODUCT': f"{text} is a product or service."
        }
        
        return descriptions.get(label, f"{text} is mentioned in the text.")
    
    def _generate_relationship_context(self, source: str, target: str, rel_type: str) -> str:
        """Generate context for a relationship"""
        contexts = {
            'associated-with': f"{source} is associated with {target}.",
            'co-occurs': f"{source} and {target} appear together in the text.",
            'established': f"{source} established {target}.",
            'landed-on': f"{source} landed on {target}.",
            'worked-for': f"{source} worked for {target}.",
            'located-in': f"{source} is located in {target}."
        }
        
        return contexts.get(rel_type, f"{source} is related to {target}.")
    
    def _get_entity_refinement_prompt(self) -> str:
        """Get the prompt for entity refinement"""
        return """You are an assistant that cleans and formats NLP outputs for graph visualization.

Input: I will provide you JSON from an NLP pipeline with entities. The data may contain duplicates, acronyms, inconsistent formatting, or missing context.

Your tasks:
1. Merge duplicates (e.g., "Kennedy" + "John F. Kennedy").
2. Expand acronyms (e.g., "USSR" → "Soviet Union").
3. Add short, factual descriptions for each entity (1 sentence max).
4. Standardize entity labels (PERSON, ORG, GPE, EVENT, DATE, etc.).

Strictly return valid JSON with top-level key: { "entities": [] }.

Each entity must have:
- "text": canonical name
- "label": the type (PERSON, ORG, GPE, EVENT, DATE, etc.)
- "description": 1-sentence context

Output: Only JSON, no commentary.

Here is the NLP output:
{RAW_NLP_BATCH_JSON}"""
    
    def _get_keyword_refinement_prompt(self) -> str:
        """Get the prompt for keyword refinement"""
        return """You are an assistant that cleans and formats NLP outputs for graph visualization.

Input: I will provide you JSON from an NLP pipeline with keywords. The data may contain duplicates, inconsistent formatting, or missing scores.

Your tasks:
1. Remove duplicates.
2. Keep keywords concise and lowercase.
3. Ensure scores are between 0 and 1.
4. Standardize format.

Strictly return valid JSON with top-level key: { "keywords": [] }.

Each keyword must have:
- "word": the keyword text
- "score": float between 0 and 1

Output: Only JSON, no commentary.

Here is the NLP output:
{RAW_NLP_BATCH_JSON}"""
    
    def _get_relationship_refinement_prompt(self) -> str:
        """Get the prompt for relationship refinement"""
        return """You are an assistant that cleans and formats NLP outputs for graph visualization.

Input: I will provide you JSON from an NLP pipeline with relationships. The data may contain duplicates, inconsistent formatting, or missing context.

Your tasks:
1. Remove duplicates.
2. Standardize relationship types.
3. Add context field with short natural-language snippet.
4. Clean source and target names.

Strictly return valid JSON with top-level key: { "relationships": [] }.

Each relationship must have:
- "source": source entity name
- "target": target entity name
- "type": relationship type (associated-with, co-occurs, established, etc.)
- "context": short natural-language description

Output: Only JSON, no commentary.

Here is the NLP output:
{RAW_NLP_BATCH_JSON}"""
