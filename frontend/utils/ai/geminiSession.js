/**
 * Gemini Nano Session Manager
 * Handles session creation, management, and cleanup
 */

import { GEMINI_CONFIG } from '../../config/geminiConfig.js';

export class GeminiSessionManager {
    constructor() {
        this.session = null;
        this.isInitialized = false;
        this.initializationPromise = null;
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
            // Check availability before creating session
            const available = await LanguageModel.availability();
            if (available !== 'available') {
                throw new Error(`LanguageModel not ready. Status: ${available}`);
            }

            // Create session with configuration
            this.session = await LanguageModel.create({
                temperature: GEMINI_CONFIG.temperature,
                topK: GEMINI_CONFIG.topK,
                maxOutputTokens: GEMINI_CONFIG.maxOutputTokens,
                systemPrompt: GEMINI_CONFIG.systemPrompt,
                outputLanguage: GEMINI_CONFIG.outputLanguage
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
            isInitialized: this.isInitialized,
            hasActiveSession: !!this.session,
            browserSupport: 'LanguageModel' in self
        };
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
        GEMINI_CONFIG.systemPrompt = newPrompt;
        
        // If we have an active session, we'll need to reinitialize
        if (this.session) {
            console.log('System prompt updated. Session will reinitialize on next use.');
            this.destroy();
        }
    }
}
