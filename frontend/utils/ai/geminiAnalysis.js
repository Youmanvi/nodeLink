/**
 * Gemini Nano Analysis Methods
 * Handles different types of AI analysis
 */

export class GeminiAnalysisMethods {
    constructor(sessionManager) {
        this.sessionManager = sessionManager;
    }

    /**
     * Enhanced keyword extraction using Gemini Nano
     */
    async enhanceKeywords(text, existingKeywords = []) {
        if (!await this.sessionManager._ensureInitialized()) {
            return { enhanced: false, keywords: existingKeywords, reason: 'Gemini Nano not available' };
        }

        const prompt = `
Analyze this text and identify the most important keywords and concepts:

TEXT: "${text}"

EXISTING KEYWORDS: ${existingKeywords.map(k => k.word || k).join(', ')}

Please provide:
1. Enhanced keywords with semantic importance
2. Missing key concepts
3. Topic classification
4. Contextual relevance scores

Format as JSON:
{
  "enhancedKeywords": [{"word": "keyword", "importance": 0.9, "category": "concept"}],
  "missingConcepts": ["concept1", "concept2"],
  "topicClassification": "primary topic",
  "contextualInsights": "brief insight about the content"
}`;

        try {
            const response = await this.sessionManager.session.prompt(prompt);
            const enhanced = this._parseJSONResponse(response);
            
            return {
                enhanced: true,
                ...enhanced,
                originalKeywords: existingKeywords
            };
        } catch (error) {
            console.error('Gemini Nano: Keyword enhancement failed:', error);
            return { enhanced: false, keywords: existingKeywords, error: error.message };
        }
    }

    /**
     * Advanced entity relationship analysis
     */
    async analyzeRelationships(text, entities = [], keywords = []) {
        if (!await this.sessionManager._ensureInitialized()) {
            return { enhanced: false, reason: 'Gemini Nano not available' };
        }

        const prompt = `
Analyze relationships between entities and concepts in this text:

TEXT: "${text}"

ENTITIES: ${entities.map(e => `${e.text} (${e.label})`).join(', ')}
KEYWORDS: ${keywords.map(k => k.word || k).join(', ')}

Identify:
1. Semantic relationships between entities
2. Concept hierarchies and dependencies
3. Contextual connections
4. Hidden or implicit relationships

Format as JSON:
{
  "relationships": [
    {
      "source": "entity1",
      "target": "entity2",
      "type": "relationship_type",
      "strength": 0.8,
      "description": "explanation",
      "context": "supporting evidence from text"
    }
  ],
  "conceptHierarchy": {
    "primary": ["main concepts"],
    "secondary": ["supporting concepts"],
    "connections": ["how they relate"]
  },
  "hiddenPatterns": ["implicit relationships or patterns found"]
}`;

        try {
            const response = await this.sessionManager.session.prompt(prompt);
            const analysis = this._parseJSONResponse(response);
            
            return {
                enhanced: true,
                ...analysis
            };
        } catch (error) {
            console.error('Gemini Nano: Relationship analysis failed:', error);
            return { enhanced: false, error: error.message };
        }
    }

    /**
     * Convert NLP results to NodeLinkGraph JSON format
     */
    async enhanceNLPResults(nlpResults, originalText) {
        if (!await this.sessionManager._ensureInitialized()) {
            console.log('Gemini Nano not available, returning original results');
            return {
                enhanced: false,
                original: nlpResults,
                reason: 'Gemini Nano not supported or failed to initialize'
            };
        }

        console.log('Converting NLP results to NodeLinkGraph format with Gemini Nano...');

        try {
            const prompt = `
Convert this NLP analysis into a NodeLinkGraph JSON format for visualization.

NLP INPUT:
- Entities: ${JSON.stringify(nlpResults.entities || [])}
- Keywords: ${JSON.stringify(nlpResults.keywords || [])}
- Relationships: ${JSON.stringify(nlpResults.relationships || [])}

ORIGINAL TEXT: "${originalText}"

Create a knowledge graph with:
1. NODES: Each entity and important keyword becomes a node
2. LINKS: Each relationship becomes a link between nodes
3. AI ENHANCEMENT: Add confidence scores, categories, and insights

Required JSON format:
{
  "nodes": [
    {
      "id": "unique_id",
      "label": "Node Name",
      "shortLabel": "Short Name",
      "type": "entity|keyword",
      "aiConfidence": 0.9,
      "aiCategory": "PERSON|ORG|LOCATION|EVENT|TECHNOLOGY|SCIENCE|POLITICS|CULTURE|HEALTH|EDUCATION|CONCEPT",
      "aiInsights": ["insight1", "insight2"],
      "sourceText": "original text snippet",
      "description": "detailed description",
      "importance": 0.8
    }
  ],
  "links": [
    {
      "source": "node_id_1",
      "target": "node_id_2", 
      "label": "relationship_type",
      "strength": 0.8,
      "aiDetected": true,
      "description": "relationship description",
      "context": "supporting context",
      "animated": true
    }
  ]
}

Guidelines:
- Use entity labels as primary nodes
- Include important keywords as concept nodes
- Create links based on relationships
- Add AI confidence scores (0.0-1.0)
- Provide meaningful categories and insights
- Keep node IDs simple and descriptive
- Ensure all links reference valid node IDs
- Add shortLabel for display (max 15 chars)
- Set animated: true for important relationships
- Use diverse aiCategory values for better color assignment

Respond with valid JSON only:`;

            const response = await this.sessionManager.session.prompt(prompt);
            const graphData = this._parseJSONResponse(response);
            
            return {
                enhanced: true,
                original: nlpResults,
                nodeLinkGraph: graphData,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Gemini Nano: NodeLinkGraph conversion failed:', error);
            return {
                enhanced: false,
                original: nlpResults,
                error: error.message
            };
        }
    }

    /**
     * Parse JSON response with fallback handling
     */
    _parseJSONResponse(response) {
        try {
            // Clean up the response - remove markdown code blocks if present
            const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error('Failed to parse Gemini Nano JSON response:', error);
            console.log('Raw response:', response);
            
            // Return a basic structure if parsing fails
            return {
                error: 'Failed to parse AI response',
                rawResponse: response,
                parsed: false
            };
        }
    }
}
