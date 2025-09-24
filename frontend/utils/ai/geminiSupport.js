/**
 * Gemini Nano Support Detection
 * Handles browser support detection and availability checking
 */

export class GeminiSupportDetector {
    constructor() {
        this.isSupported = false;
        this.availability = 'unknown';
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
            
            this.availability = available;
            
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
