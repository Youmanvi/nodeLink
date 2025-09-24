"""
Relationship Analysis Module
Handles concept relationship detection and mapping
"""

from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class RelationshipAnalyzer:
    """Handles relationship analysis between concepts."""
    
    def __init__(self, nlp_model):
        self.nlp = nlp_model
    
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
