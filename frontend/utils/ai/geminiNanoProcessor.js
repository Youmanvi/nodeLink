/**
 * Main Gemini Nano Processor
 * Orchestrates all Gemini Nano functionality
 */

import { GeminiSupportDetector } from './geminiSupport.js';
import { GeminiSessionManager } from './geminiSession.js';
import { GeminiAnalysisMethods } from './geminiAnalysis.js';

export class GeminiNanoProcessor {
    constructor() {
        this.supportDetector = new GeminiSupportDetector();
        this.sessionManager = new GeminiSessionManager();
        this.analysisMethods = new GeminiAnalysisMethods(this.sessionManager);
        
        this.isInitialized = false;
        this.isSupported = false;
        
        // Check for browser support immediately
        this.checkSupport();
    }

    /**
     * Check if Gemini Nano is supported in the current browser
     */
    async checkSupport() {
        this.isSupported = await this.supportDetector.checkSupport();
        return this.isSupported;
    }

    /**
     * Initialize Gemini Nano session
     */
    async initialize() {
        if (!this.isSupported) {
            await this.checkSupport();
            if (!this.isSupported) {
                throw new Error('Gemini Nano is not supported on this device');
            }
        }

        await this.sessionManager.initialize();
        this.isInitialized = this.sessionManager.isInitialized;
        return this.isInitialized;
    }

    /**
     * Get the status of Gemini Nano availability
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            isInitialized: this.isInitialized,
            hasActiveSession: this.sessionManager.getStatus().hasActiveSession,
            browserSupport: this.sessionManager.getStatus().browserSupport,
            availability: this.supportDetector.availability
        };
    }

    /**
     * Enhanced keyword extraction using Gemini Nano
     */
    async enhanceKeywords(text, existingKeywords = []) {
        return await this.analysisMethods.enhanceKeywords(text, existingKeywords);
    }

    /**
     * Advanced entity relationship analysis
     */
    async analyzeRelationships(text, entities = [], keywords = []) {
        return await this.analysisMethods.analyzeRelationships(text, entities, keywords);
    }

    /**
     * Convert NLP results to NodeLinkGraph JSON format
     */
    async enhanceNLPResults(nlpResults, originalText) {
        return await this.analysisMethods.enhanceNLPResults(nlpResults, originalText);
    }

    /**
     * Clean up resources
     */
    async destroy() {
        await this.sessionManager.destroy();
        this.isInitialized = false;
    }

    /**
     * Update system prompt for different analysis contexts
     */
    updateSystemPrompt(newPrompt) {
        this.sessionManager.updateSystemPrompt(newPrompt);
    }

    /**
     * Get detailed capability information
     */
    async getCapabilities() {
        return await this.supportDetector.getCapabilities();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiNanoProcessor;
} else if (typeof window !== 'undefined') {
    window.GeminiNanoProcessor = GeminiNanoProcessor;
}
