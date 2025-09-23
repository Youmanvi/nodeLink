/**
 * Basic NLP Processor
 * Fallback text processing without AI enhancement
 * Provides entity extraction, keyword analysis, and relationship detection
 */

export interface BasicNLPResults {
  entities: Array<{text: string, label: string, confidence: number}>;
  keywords: Array<{word: string, importance: number}>;
  relationships: Array<{source: string, target: string, type: string, strength?: number}>;
}

export async function performBasicNLP(text: string): Promise<BasicNLPResults> {
  // Simple entity extraction using regex patterns
  const entities = extractEntities(text);
  
  // Basic keyword extraction using frequency and importance
  const keywords = extractKeywords(text);
  
  // Simple relationship detection
  const relationships = detectRelationships(text, entities);
  
  return {
    entities,
    keywords, 
    relationships
  };
}

function extractEntities(text: string): Array<{text: string, label: string, confidence: number}> {
  const entities: Array<{text: string, label: string, confidence: number}> = [];
  
  // People detection (names, titles)
  const peopleRegex = /(President|Dr\.|Mr\.|Ms\.|Mrs\.)?\s*([A-Z][a-z]+ (?:[A-Z][a-z]+ )*[A-Z][a-z]+)/g;
  let match: RegExpExecArray | null;
  
  while ((match = peopleRegex.exec(text)) !== null) {
    entities.push({
      text: match[0].trim(),
      label: 'PERSON',
      confidence: 0.7
    });
  }
  
  // Places detection (proper nouns, geographic terms)
  const placesRegex = /\b([A-Z][a-z]+ (?:University|Institute|Center|Company|Corporation|Street|Avenue|City|State|Country|Headquarters))\b/g;
  
  while ((match = placesRegex.exec(text)) !== null) {
    entities.push({
      text: match[1],
      label: 'PLACE',
      confidence: 0.6
    });
  }
  
  // Events detection (wars, movements, programs)
  const eventsRegex = /\b([A-Z][a-z]+ (?:War|Movement|Program|Scandal|Crisis|Revolution|Discovery|Breakthrough))\b/g;
  
  while ((match = eventsRegex.exec(text)) !== null) {
    entities.push({
      text: match[1],
      label: 'EVENT', 
      confidence: 0.8
    });
  }
  
  // Additional entity patterns
  const additionalPatterns = [
    { regex: /\b(?:NASA|FBI|CIA|UN|USSR|USA)\b/g, label: 'ORGANIZATION', confidence: 0.9 },
    { regex: /\b(?:Apollo|Cold War|Vietnam|Watergate)\b/g, label: 'EVENT', confidence: 0.8 },
    { regex: /\b(?:Cambridge|Harvard|MIT|Stanford)\b/g, label: 'PLACE', confidence: 0.7 },
    { regex: /\b(?:Kennedy|Nixon|Johnson|Watson|Crick|Franklin)\b/g, label: 'PERSON', confidence: 0.8 }
  ];
  
  additionalPatterns.forEach(pattern => {
    while ((match = pattern.regex.exec(text)) !== null) {
      // Avoid duplicates
      if (match && !entities.some(e => e.text === match![0])) {
        entities.push({
          text: match[0],
          label: pattern.label,
          confidence: pattern.confidence
        });
      }
    }
  });
  
  return entities;
}

function extractKeywords(text: string): Array<{word: string, importance: number}> {
  // Remove common words and extract meaningful terms
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
    'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its',
    'our', 'their', 'from', 'up', 'down', 'out', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'now', 'also', 'back', 'even', 'still', 'well', 'much', 'new', 'old', 'right',
    'high', 'long', 'little', 'great', 'small', 'large', 'good', 'bad', 'first',
    'last', 'next', 'early', 'late', 'young', 'old', 'big', 'little', 'high', 'low'
  ]);
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
    
  const frequency: {[key: string]: number} = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      importance: Math.min((count as number) / words.length * 10, 1)
    }));
}

function detectRelationships(text: string, entities: Array<{text: string, label: string, confidence: number}>): Array<{source: string, target: string, type: string, strength?: number}> {
  const relationships: Array<{source: string, target: string, type: string, strength?: number}> = [];
  
  // Simple co-occurrence relationship detection
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const entity1 = entities[i];
      const entity2 = entities[j];
      
      // Check if entities appear in same sentence
      const sentences = text.split(/[.!?]/);
      const cooccurrences = sentences.filter(sentence => 
        sentence.includes(entity1.text) && sentence.includes(entity2.text)
      );
      
      if (cooccurrences.length > 0) {
        // Determine relationship type based on entity types
        let relationshipType = 'associative';
        if (entity1.label === 'PERSON' && entity2.label === 'EVENT') {
          relationshipType = 'participated_in';
        } else if (entity1.label === 'EVENT' && entity2.label === 'PLACE') {
          relationshipType = 'occurred_at';
        } else if (entity1.label === 'PERSON' && entity2.label === 'PLACE') {
          relationshipType = 'associated_with';
        }
        
        relationships.push({
          source: entity1.text,
          target: entity2.text,
          type: relationshipType,
          strength: cooccurrences.length / sentences.length
        });
      }
    }
  }
  
  // Temporal relationship detection
  const temporalWords = ['before', 'after', 'during', 'following', 'preceding', 'led to', 'resulted in'];
  temporalWords.forEach(temporal => {
    const regex = new RegExp(`\\b${temporal}\\b`, 'gi');
    if (regex.test(text)) {
      // Find entities around temporal words
      const sentences = text.split(/[.!?]/);
      sentences.forEach(sentence => {
        if (regex.test(sentence)) {
          const sentenceEntities = entities.filter(e => sentence.includes(e.text));
          if (sentenceEntities.length >= 2) {
            relationships.push({
              source: sentenceEntities[0].text,
              target: sentenceEntities[1].text,
              type: 'temporal',
              strength: 0.6
            });
          }
        }
      });
    }
  });
  
  return relationships;
}
