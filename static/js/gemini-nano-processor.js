/**
 * Gemini Nano On-Device Text Processor
 * Privacy-first, cost-free local AI processing for NLP enhancement
 * 
 * This implementation uses the Chrome Built-in AI API (Gemini Nano)
 * for completely local processing without API keys or external calls.
 */

class GeminiNanoProcessor {
    constructor() {
        this.session = null;
        this.isInitialized = false;
        this.isSupported = false;
        this.initializationPromise = null;
        
        // Configuration
        this.config = {
            temperature: 0.3,
            topK: 3,
            maxOutputTokens: 1024,
            systemPrompt: `You are an advanced NLP analysis assistant. Analyze text and provide structured insights for knowledge extraction.`
        };
        
        // Check for browser support immediately
        this.checkSupport();
    }

    /**
     * Check if Gemini Nano is supported in the current browser
     */
    async checkSupport() {
        try {
            // Check if LanguageModel is available (the correct API)
            if (!('LanguageModel' in self)) {
                console.warn('Gemini Nano: LanguageModel API not available. Please enable chrome://flags/#prompt-api-for-gemini-nano and restart Chrome.');
                this.isSupported = false;
                return false;
            }

            console.log('Gemini Nano: LanguageModel API detected');
            
            // Check availability (this is the correct method according to the docs)
            const available = await LanguageModel.availability();
            console.log('Gemini Nano: LanguageModel availability:', available);
            
            if (available === 'unavailable') {
                this.isSupported = false;
                console.warn('Gemini Nano: LanguageModel is unavailable on this device/browser');
            } else if (available === 'downloadable') {
                this.isSupported = true;
                console.log('Gemini Nano: AI model needs to be downloaded');
            } else if (available === 'downloading') {
                this.isSupported = true;
                console.log('Gemini Nano: AI model is downloading...');
            } else if (available === 'available') {
                this.isSupported = true;
                console.log('Gemini Nano: AI ready for use');
            }
            
            return this.isSupported;
        } catch (error) {
            console.warn('Gemini Nano: Error checking support:', error);
            this.isSupported = false;
            return false;
        }
    }

    /**
     * Initialize Gemini Nano session
     */
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._doInitialize();
        return this.initializationPromise;
    }

    async _doInitialize() {
        try {
            if (!this.isSupported) {
                await this.checkSupport();
                if (!this.isSupported) {
                    throw new Error('Gemini Nano is not supported on this device');
                }
            }

            // Check availability before creating session
            const available = await LanguageModel.availability();
            if (available !== 'available') {
                throw new Error(`LanguageModel not ready. Status: ${available}`);
            }

            // Create session with configuration
            this.session = await LanguageModel.create({
                temperature: this.config.temperature,
                topK: this.config.topK,
                maxOutputTokens: this.config.maxOutputTokens,
                systemPrompt: this.config.systemPrompt,
                outputLanguage: 'en' // Specify output language to avoid warning
            });

            this.isInitialized = true;
            console.log('Gemini Nano: Successfully initialized');
            return true;
            
        } catch (error) {
            console.error('Gemini Nano: Initialization failed:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    /**
     * Get the status of Gemini Nano availability
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            isInitialized: this.isInitialized,
            hasActiveSession: !!this.session,
            browserSupport: 'LanguageModel' in self
        };
    }

    /**
     * Enhanced keyword extraction using Gemini Nano
     */
    async enhanceKeywords(text, existingKeywords = []) {
        if (!await this._ensureInitialized()) {
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
            const response = await this.session.prompt(prompt);
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
        if (!await this._ensureInitialized()) {
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
            const response = await this.session.prompt(prompt);
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
     * Deep content analysis for context and intent
     */
    async analyzeContent(text) {
        if (!await this._ensureInitialized()) {
            return { enhanced: false, reason: 'Gemini Nano not available' };
        }

        const prompt = `
Perform deep content analysis on this text:

TEXT: "${text}"

Provide comprehensive analysis:
1. Primary intent and purpose
2. Content complexity and sophistication level
3. Target audience identification
4. Key themes and underlying messages
5. Emotional tone and sentiment nuances
6. Information density and structure
7. Recommendations for LLM processing

Format as JSON:
{
  "intent": {
    "primary": "main purpose",
    "secondary": ["supporting purposes"],
    "confidence": 0.9
  },
  "complexity": {
    "level": "beginner|intermediate|advanced|expert",
    "reasoning": "explanation",
    "readabilityFactors": ["factors affecting readability"]
  },
  "audience": {
    "primary": "target audience",
    "characteristics": ["audience traits"],
    "expertiseLevel": "required knowledge level"
  },
  "themes": {
    "primary": ["main themes"],
    "secondary": ["supporting themes"],
    "implicit": ["underlying messages"]
  },
  "sentiment": {
    "overall": "positive|negative|neutral|mixed",
    "nuances": ["emotional subtleties"],
    "confidence": 0.8
  },
  "structure": {
    "organization": "how content is organized",
    "informationDensity": "high|medium|low",
    "keyPoints": ["main information points"]
  },
  "llmRecommendations": {
    "processingApproach": "recommended strategy",
    "focusAreas": ["what to emphasize"],
    "potentialChallenges": ["processing difficulties to expect"]
  }
}`;

        try {
            const response = await this.session.prompt(prompt);
            const analysis = this._parseJSONResponse(response);
            
            return {
                enhanced: true,
                ...analysis
            };
        } catch (error) {
            console.error('Gemini Nano: Content analysis failed:', error);
            return { enhanced: false, error: error.message };
        }
    }

    /**
     * Generate contextual snippets for knowledge graph integration
     */
    async generateContextualSnippets(text, entities = [], relationships = []) {
        if (!await this._ensureInitialized()) {
            return { enhanced: false, reason: 'Gemini Nano not available' };
        }

        const prompt = `
Generate contextual snippets from this text for knowledge graph integration:

TEXT: "${text}"

ENTITIES: ${entities.map(e => `${e.text} (${e.label})`).join(', ')}
RELATIONSHIPS: ${relationships.map(r => `${r.source} → ${r.target} (${r.type})`).join(', ')}

Create:
1. Concise, meaningful snippets that capture entity relationships
2. Remove redundant information
3. Focus on unique insights and connections
4. Provide context for knowledge graph nodes

Format as JSON:
{
  "snippets": [
    {
      "text": "contextual snippet",
      "entities": ["entities mentioned"],
      "relationships": ["relationship types"],
      "importance": 0.8,
      "category": "factual|opinion|analysis|description"
    }
  ],
  "summary": {
    "keyInsights": ["main insights"],
    "entityImportance": {"entity": 0.9},
    "conceptualDensity": 0.7
  },
  "graphIntegration": {
    "suggestedNodes": ["additional node suggestions"],
    "connectionStrengths": {"relationship": 0.8},
    "missingConnections": ["potential missing links"]
  }
}`;

        try {
            const response = await this.session.prompt(prompt);
            const snippets = this._parseJSONResponse(response);
            
            return {
                enhanced: true,
                ...snippets
            };
        } catch (error) {
            console.error('Gemini Nano: Snippet generation failed:', error);
            return { enhanced: false, error: error.message };
        }
    }

    /**
     * Convert NLP results to NodeLinkGraph JSON format
     */
    async enhanceNLPResults(nlpResults, originalText) {
        if (!await this._ensureInitialized()) {
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

            const response = await this.session.prompt(prompt);
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
     * Ensure session is initialized before use
     */
    async _ensureInitialized() {
        if (!this.isInitialized) {
            try {
                await this.initialize();
                return this.isInitialized;
            } catch (error) {
                console.error('Failed to initialize Gemini Nano:', error);
                return false;
            }
        }
        return true;
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

    /**
     * Clean up resources
     */
    async destroy() {
        if (this.session) {
            try {
                await this.session.destroy();
                this.session = null;
                this.isInitialized = false;
                console.log('Gemini Nano: Session destroyed');
            } catch (error) {
                console.error('Error destroying Gemini Nano session:', error);
            }
        }
    }

    /**
     * Update system prompt for different analysis contexts
     */
    updateSystemPrompt(newPrompt) {
        this.config.systemPrompt = newPrompt;
        
        // If we have an active session, we'll need to reinitialize
        if (this.session) {
            console.log('System prompt updated. Session will reinitialize on next use.');
            this.destroy();
        }
    }

    /**
     * Get detailed capability information
     */
    async getCapabilities() {
        if (!this.isSupported) {
            return {
                supported: false,
                reason: 'Browser does not support LanguageModel API'
            };
        }

        try {
            const availability = await LanguageModel.availability();
            return {
                supported: true,
                availability: availability,
                features: [
                    'Keyword Enhancement',
                    'Relationship Analysis', 
                    'Content Analysis',
                    'Contextual Snippets',
                    'Privacy-First Processing',
                    'No API Keys Required',
                    'Offline Capability'
                ]
            };
        } catch (error) {
            return {
                supported: false,
                error: error.message
            };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiNanoProcessor;
} else if (typeof window !== 'undefined') {
    window.GeminiNanoProcessor = GeminiNanoProcessor;
}

// Usage example and integration guide
/*
// Integration Example:

class EnhancedNLPProcessor extends AdvancedNLPProcessor {
    constructor() {
        super();
        this.geminiNano = new GeminiNanoProcessor();
    }

    async processTextWithAI(text, options) {
        // Get base NLP results
        const baseResults = await this.process_text_advanced(text, options);
        
        // Enhance with Gemini Nano if available
        const enhanced = await this.geminiNano.enhanceNLPResults(baseResults, text);
        
        return {
            ...baseResults,
            aiEnhanced: enhanced.enhanced,
            geminiResults: enhanced.geminiEnhanced,
            processingMethod: enhanced.enhanced ? 'NLP + Gemini Nano' : 'NLP Only'
        };
    }
}

// Initialize and use:
const processor = new EnhancedNLPProcessor();
const results = await processor.processTextWithAI("Your text here", options);
*/