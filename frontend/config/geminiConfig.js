/**
 * Gemini Nano Configuration
 * Centralized configuration for Gemini Nano processing
 */

export const GEMINI_CONFIG = {
    temperature: 0.3,
    topK: 3,
    maxOutputTokens: 1024,
    systemPrompt: `You are an advanced NLP analysis assistant. Analyze text and provide structured insights for knowledge extraction.`,
    outputLanguage: 'en'
};

export default GEMINI_CONFIG;
