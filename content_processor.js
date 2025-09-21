/**
 * Processes raw text and a list of NLP-generated entities to extract contextual, non-repetitive snippets.
 * This function acts as a crucial filter, preparing data for the Gemini Nano model.
 * @param {string} rawText The raw text content of the webpage.
 * @param {Array<Object>} nlpNodes A JSON array of nodes (entities and keywords) from the NLP pipeline.
 * @returns {Array<Object>} An array of objects, each containing a contextual sentence and the entities found within it.
 */
function extractContextualSnippets(rawText, nlpNodes) {
    const minScore = 0.15; // Minimum score for a keyword to be considered important for context.
    const importantEntities = nlpNodes
        .filter(node => node.type === 'entity' || (node.type === 'keyword' && node.score >= minScore))
        .map(node => node.label.toLowerCase());

    if (importantEntities.length < 2) {
        return []; // Not enough entities to form a relationship.
    }

    const sentences = rawText.split(/[.!?]\s+/);
    const uniqueSnippets = new Set();
    const contextualData = [];

    // Step 1: Pair up all important entities to look for relationships.
    const entityPairs = [];
    for (let i = 0; i < importantEntities.length; i++) {
        for (let j = i + 1; j < importantEntities.length; j++) {
            entityPairs.push([importantEntities[i], importantEntities[j]]);
        }
    }

    // Step 2: Iterate through each sentence to find relevant context.
    sentences.forEach(sentence => {
        const lowerCaseSentence = sentence.toLowerCase();

        // Step 3: Check if the sentence contains at least two paired entities.
        let foundPair = false;
        let entitiesInSentence = [];
        for (const [entity1, entity2] of entityPairs) {
            if (lowerCaseSentence.includes(entity1) && lowerCaseSentence.includes(entity2)) {
                foundPair = true;
                if (!entitiesInSentence.includes(entity1)) {
                    entitiesInSentence.push(entity1);
                }
                if (!entitiesInSentence.includes(entity2)) {
                    entitiesInSentence.push(entity2);
                }
            }
        }

        // Step 4: Eliminate repetitive data.
        // Create a unique key for the snippet based on the entities and a sentence hash.
        if (foundPair) {
            entitiesInSentence.sort(); // Consistent key regardless of order
            const snippetKey = entitiesInSentence.join('_') + '_' + hashCode(lowerCaseSentence);
            if (!uniqueSnippets.has(snippetKey)) {
                uniqueSnippets.add(snippetKey);
                contextualData.push({
                    context: sentence,
                    entities: entitiesInSentence
                });
            }
        }
    });

    return contextualData;
}

// Simple hash function for deduplication.
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

// Example usage with your data. This would be called from your background script.
// const nlpNodes = [
//   // Your provided JSON data for keywords and entities
// ];
// const rawText = "Your raw webpage text.";
// const filteredSnippets = extractContextualSnippets(rawText, nlpNodes);
// console.log(filteredSnippets);
