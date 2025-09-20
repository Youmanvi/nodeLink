// Advanced NLP Preprocessing Frontend
class AdvancedNLPProcessor {
    constructor() {
        this.apiBaseUrl = 'http://127.0.0.1:5000/api';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Auto-resize textarea
        const textarea = document.getElementById('inputText');
        textarea.addEventListener('input', this.autoResizeTextarea);
        
        // Sample text on focus
        textarea.addEventListener('focus', this.showSampleText);
        
        // Real-time character count
        textarea.addEventListener('input', this.updateTextStats);
    }

    autoResizeTextarea(e) {
        e.target.style.height = 'auto';
        e.target.style.height = Math.max(250, e.target.scrollHeight) + 'px';
    }

    showSampleText(e) {
        if (e.target.value === '') {
            const samples = [
                "Artificial intelligence is revolutionizing healthcare by enabling faster diagnosis and personalized treatment plans. Machine learning algorithms can analyze medical images with unprecedented accuracy, while natural language processing helps doctors extract insights from clinical notes.",
                "Climate change continues to impact global ecosystems, with rising temperatures affecting biodiversity patterns. Scientists are developing innovative solutions including renewable energy technologies and carbon capture systems to mitigate environmental damage.",
                "The quantum computing breakthrough at IBM represents a significant milestone in computational science. Quantum supremacy could transform cryptography, drug discovery, and financial modeling by solving complex problems exponentially faster than classical computers."
            ];
            const randomSample = samples[Math.floor(Math.random() * samples.length)];
            e.target.placeholder = `Try this sample: "${randomSample}"`;
        }
    }

    updateTextStats() {
        const text = document.getElementById('inputText').value;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        const chars = text.length;
        
        const statsElement = document.getElementById('originalStats');
        if (statsElement) {
            statsElement.textContent = `${words} words, ${chars} characters`;
        }
    }

    getProcessingOptions() {
        const options = {};
        const checkboxes = [
            'basicPreprocessing', 'keywordExtraction', 'entityRecognition',
            'sentimentAnalysis', 'topicModeling', 'relationshipMapping',
            'domainDetection', 'intentClassification', 'conceptExtraction',
            'contextualEmbedding'
        ];
        
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                options[id] = checkbox.checked;
            }
        });
        
        return options;
    }

    async processText() {
        const inputText = document.getElementById('inputText').value.trim();
        
        if (!inputText) {
            this.showNotification('Please enter some text to process!', 'warning');
            return;
        }

        if (inputText.length < 10) {
            this.showNotification('Please enter more text for meaningful analysis (at least 10 characters).', 'warning');
            return;
        }

        const options = this.getProcessingOptions();
        
        // Update UI to show processing state
        this.setProcessingState(true);
        this.clearPreviousResults();
        this.initializeProcessingLog();

        try {
            const result = await this.callNLPAPI(inputText, options);
            this.displayResults(inputText, result, options);
            this.showNotification('Text processing completed successfully!', 'success');
        } catch (error) {
            console.error('Processing error:', error);
            this.displayError(error.message);
            this.showNotification('An error occurred during processing. Please try again.', 'error');
        } finally {
            this.setProcessingState(false);
        }
    }

    async callNLPAPI(text, options) {
        const requestBody = {
            text: text,
            options: options,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`${this.apiBaseUrl}/process-advanced`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.error || 'Server error'}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to the NLP server. Please ensure the backend is running on http://127.0.0.1:5000');
            }
            throw error;
        }
    }

    setProcessingState(isProcessing) {
        const button = document.querySelector('.process-btn');
        const btnText = document.querySelector('.btn-text');
        const btnLoader = document.querySelector('.btn-loader');
        
        if (isProcessing) {
            button.disabled = true;
            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
        } else {
            button.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    }

    clearPreviousResults() {
        document.getElementById('results').style.display = 'none';
        
        // Clear all result containers
        const containers = [
            'originalText', 'contextAnalysis', 'topKeywords', 'namedEntities',
            'relationships', 'processedText', 'llmFormat', 'processingLog'
        ];
        
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = '';
            }
        });
    }

    initializeProcessingLog() {
        const logContainer = document.getElementById('processingLog');
        if (logContainer) {
            logContainer.innerHTML = '<div class="log-entry"><div class="log-status processing"></div><span>Initializing NLP pipeline...</span></div>';
        }
    }

    updateProcessingLog(message, status = 'success') {
        const logContainer = document.getElementById('processingLog');
        if (!logContainer) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <div class="log-status ${status}"></div>
            <span>${message}</span>
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    displayResults(originalText, result, options) {
        // Show results container
        document.getElementById('results').style.display = 'block';
        
        // Display original text
        this.displayOriginalText(originalText);
        
        // Display context analysis
        this.displayContextAnalysis(result.context_analysis);
        
        // Display keywords and entities
        this.displayKeywordsAndEntities(result.keywords, result.entities);
        
        // Display relationships
        this.displayRelationships(result.relationships);
        
        // Display processed text
        this.displayProcessedText(result.processed_text);
        
        // Display LLM-ready format
        this.displayLLMFormat(result.llm_ready_format);
        
        // Display statistics
        this.displayStatistics(result.statistics);
        
        // Update processing log
        this.finalizeProcessingLog(result.processing_steps);
        
        // Scroll to results
        document.getElementById('results').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    displayOriginalText(text) {
        const container = document.getElementById('originalText');
        if (container) {
            container.textContent = text;
            
            // Update stats
            const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
            const chars = text.length;
            const statsElement = document.getElementById('originalStats');
            if (statsElement) {
                statsElement.textContent = `${words} words, ${chars} characters`;
            }
        }
    }

    displayContextAnalysis(contextData) {
        const container = document.getElementById('contextAnalysis');
        if (!container || !contextData) return;
        
        const analysisHTML = `
Domain: ${contextData.domain || 'General'}
Intent: ${contextData.intent || 'Informational'}
Complexity: ${contextData.complexity || 'Medium'}
Topic Confidence: ${(contextData.topic_confidence * 100 || 0).toFixed(1)}%
Language: ${contextData.language || 'English'}
Readability Score: ${contextData.readability_score || 'N/A'}
        `;
        
        container.textContent = analysisHTML.trim();
    }

    displayKeywordsAndEntities(keywords, entities) {
        // Display keywords
        const keywordsContainer = document.getElementById('topKeywords');
        if (keywordsContainer && keywords) {
            keywordsContainer.innerHTML = '';
            keywords.slice(0, 20).forEach(keyword => {
                const tag = document.createElement('div');
                tag.className = 'keyword-tag';
                tag.innerHTML = `
                    <span>${keyword.word}</span>
                    <span class="tag-score">${keyword.score.toFixed(2)}</span>
                `;
                keywordsContainer.appendChild(tag);
            });
        }
        
        // Display entities
        const entitiesContainer = document.getElementById('namedEntities');
        if (entitiesContainer && entities) {
            entitiesContainer.innerHTML = '';
            entities.forEach(entity => {
                const tag = document.createElement('div');
                tag.className = 'entity-tag';
                tag.innerHTML = `
                    <span>${entity.text}</span>
                    <span class="tag-score">${entity.label}</span>
                `;
                entitiesContainer.appendChild(tag);
            });
        }
    }

    displayRelationships(relationships) {
        const container = document.getElementById('relationships');
        if (!container || !relationships) return;
        
        container.innerHTML = '';
        relationships.forEach(rel => {
            const relItem = document.createElement('div');
            relItem.className = 'relationship-item';
            relItem.innerHTML = `
                <div class="relationship-type">${rel.type}</div>
                <div class="relationship-description">
                    <strong>${rel.source}</strong> → <strong>${rel.target}</strong>
                    <br><small>${rel.description}</small>
                </div>
            `;
            container.appendChild(relItem);
        });
    }

    displayProcessedText(processedText) {
        const container = document.getElementById('processedText');
        if (container && processedText) {
            container.textContent = processedText;
        }
    }

    displayLLMFormat(llmFormat) {
        const container = document.getElementById('llmFormat');
        if (container && llmFormat) {
            container.textContent = JSON.stringify(llmFormat, null, 2);
        }
    }

    displayStatistics(stats) {
        if (!stats) return;
        
        const statElements = {
            'originalWords': stats.original_word_count || 0,
            'processedWords': stats.processed_word_count || 0,
            'keywordCount': stats.keyword_count || 0,
            'entityCount': stats.entity_count || 0,
            'relationshipCount': stats.relationship_count || 0,
            'sentimentScore': stats.sentiment || 'Neutral'
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    finalizeProcessingLog(steps) {
        const logContainer = document.getElementById('processingLog');
        if (!logContainer || !steps) return;
        
        logContainer.innerHTML = '';
        steps.forEach((step, index) => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <div class="log-status"></div>
                <span>${index + 1}. ${step}</span>
            `;
            logContainer.appendChild(logEntry);
        });
    }

    displayError(message) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="result-panel full-width">
                <h3>❌ Processing Error</h3>
                <div class="result-content error">
                    <strong>Error:</strong> ${message}
                    
                    <br><br><strong>Troubleshooting:</strong>
                    <ul>
                        <li>Ensure the Python backend is running: <code>python app.py</code></li>
                        <li>Check that the server is accessible at: <code>http://127.0.0.1:5000</code></li>
                        <li>Verify all required Python packages are installed</li>
                        <li>Check the browser console for additional error details</li>
                    </ul>
                </div>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateY(-20px)',
            transition: 'all 0.3s ease',
            maxWidth: '400px'
        });
        
        // Set background color based on type
        const colors = {
            success: '#4ecdc4',
            warning: '#ffd93d',
            error: '#ff6b6b',
            info: '#667eea'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // Add to DOM and animate in
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const text = element.textContent;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Content copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Content copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('Failed to copy content.', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

// Initialize the NLP processor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nlpProcessor = new AdvancedNLPProcessor();
});

// Global function for the button onclick
function processText() {
    if (window.nlpProcessor) {
        window.nlpProcessor.processText();
    }
}

function copyToClipboard(elementId) {
    if (window.nlpProcessor) {
        window.nlpProcessor.copyToClipboard(elementId);
    }
}