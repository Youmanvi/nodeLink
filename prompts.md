# Gemini Nano Prompts Documentation

This document tracks all prompts used in the Gemini Nano on-device implementation for consistent and effective AI processing.

## System Prompt

**Purpose**: Sets the overall context and behavior for all Gemini Nano interactions

```
You are an advanced NLP analysis assistant. Analyze text and provide structured insights for knowledge extraction.
```

**Configuration**:
- Temperature: 0.3 (Low for consistent, focused responses)
- TopK: 3 (Limited choices for precision)
- Max Output Tokens: 1024

---

## Keyword Enhancement Prompt

**Function**: `enhanceKeywords(text, existingKeywords)`

**Purpose**: Improve and expand keyword extraction using semantic understanding

```
Analyze this text and identify the most important keywords and concepts:

TEXT: "{text}"

EXISTING KEYWORDS: {existingKeywords}

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
}
```

**Expected Output Structure**:
```json
{
  "enhancedKeywords": [
    {
      "word": "artificial intelligence",
      "importance": 0.95,
      "category": "technology"
    }
  ],
  "missingConcepts": ["machine learning", "neural networks"],
  "topicClassification": "Technology/AI",
  "contextualInsights": "Text focuses on AI applications in healthcare"
}
```

---

## Relationship Analysis Prompt

**Function**: `analyzeRelationships(text, entities, keywords)`

**Purpose**: Identify complex relationships between entities and concepts

```
Analyze relationships between entities and concepts in this text:

TEXT: "{text}"

ENTITIES: {entities with labels}
KEYWORDS: {keywords list}

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
}
```

**Relationship Types**:
- `causal`: A causes B
- `temporal`: A occurs before/after B
- `hierarchical`: A is part of B
- `functional`: A serves purpose for B
- `associative`: A is related to B
- `oppositional`: A contrasts with B
- `dependent`: A requires B

---

## Content Analysis Prompt

**Function**: `analyzeContent(text)`

**Purpose**: Deep semantic analysis of content structure, intent, and characteristics

```
Perform deep content analysis on this text:

TEXT: "{text}"

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
}
```

**Intent Categories**:
- `informational`: Providing facts or explanations
- `instructional`: Teaching or guiding
- `analytical`: Examining or evaluating
- `persuasive`: Convincing or arguing
- `narrative`: Telling a story
- `descriptive`: Painting a picture
- `question`: Seeking information

**Complexity Levels**:
- `beginner`: Simple concepts, basic vocabulary
- `intermediate`: Some specialized terms, moderate complexity
- `advanced`: Complex ideas, technical language
- `expert`: Highly specialized, assumes deep knowledge

---

## Contextual Snippets Prompt

**Function**: `generateContextualSnippets(text, entities, relationships)`

**Purpose**: Create focused, meaningful snippets for knowledge graph integration

```
Generate contextual snippets from this text for knowledge graph integration:

TEXT: "{text}"

ENTITIES: {entities with labels}
RELATIONSHIPS: {relationships with types}

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
}
```

**Snippet Categories**:
- `factual`: Objective, verifiable information
- `opinion`: Subjective viewpoints or judgments
- `analysis`: Interpretive or evaluative content
- `description`: Descriptive or characterizing content

---

## Prompt Engineering Guidelines

### Best Practices

1. **Consistency**: Always use the same JSON structure for similar tasks
2. **Specificity**: Be explicit about what information is needed
3. **Context**: Provide relevant background information
4. **Format**: Clearly specify the expected output format
5. **Examples**: Include example structures when helpful

### Response Handling

```javascript
// Always wrap JSON parsing with error handling
try {
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
} catch (error) {
    return {
        error: 'Failed to parse AI response',
        rawResponse: response,
        parsed: false
    };
}
```

### Performance Considerations

- **Temperature**: Low (0.3) for consistent, structured responses
- **TopK**: Limited (3) for focused, relevant outputs  
- **Max Tokens**: 1024 to balance detail with performance
- **Parallel Processing**: Run multiple analyses simultaneously when possible

### Fallback Strategies

1. **Graceful Degradation**: Always provide fallback when AI fails
2. **Error Logging**: Log failures for debugging and improvement
3. **User Feedback**: Inform users when AI enhancement isn't available
4. **Hybrid Approach**: Combine AI insights with traditional NLP

---

## Integration Patterns

### Basic Enhancement Pattern

```javascript
// 1. Get traditional NLP results
const baseResults = await traditionalNLP(text);

// 2. Enhance with Gemini Nano
const aiResults = await geminiNano.enhanceNLPResults(baseResults, text);

// 3. Combine and return
return {
    ...baseResults,
    aiEnhanced: aiResults.enhanced,
    geminiInsights: aiResults.geminiEnhanced
};
```

### Progressive Enhancement Pattern

```javascript
// Start with basic results immediately
const quickResults = await basicNLP(text);
displayResults(quickResults);

// Enhance in background
geminiNano.enhanceNLPResults(quickResults, text)
    .then(enhanced => {
        if (enhanced.enhanced) {
            updateResultsWithAI(enhanced);
        }
    });
```

### Capability-Aware Pattern

```javascript
const capabilities = await geminiNano.getCapabilities();

if (capabilities.supported) {
    // Full AI-enhanced processing
    return await processWithAI(text);
} else {
    // Fallback to traditional NLP
    return await processWithoutAI(text);
}
```

---

## Version History

- **v1.0**: Initial prompt design with basic JSON structures
- **v1.1**: Added relationship types and complexity levels
- **v1.2**: Enhanced error handling and fallback strategies
- **v1.3**: Added performance optimizations and parallel processing

---

## Future Enhancements

### Planned Prompt Improvements

1. **Domain-Specific Prompts**: Specialized prompts for different content types
2. **Multi-Language Support**: Prompts adapted for different languages
3. **Context-Aware Prompting**: Adjust prompts based on previous analysis
4. **User Preference Integration**: Customize prompts based on user needs

### Advanced Features

1. **Prompt Chaining**: Link multiple prompts for complex analysis
2. **Iterative Refinement**: Use AI output to improve subsequent prompts
3. **Dynamic Prompt Generation**: Create prompts based on content characteristics
4. **Quality Scoring**: Evaluate and improve prompt effectiveness