const { useState, useEffect } = React;

// Main App Component
function App() {
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [geminiProcessor, setGeminiProcessor] = useState(null);
    const [aiEnabled, setAiEnabled] = useState(false);

    // Initialize Gemini Nano Processor
    useEffect(() => {
        if (window.GeminiNanoProcessor) {
            const processor = new window.GeminiNanoProcessor();
            setGeminiProcessor(processor);
            console.log('Gemini Nano Processor initialized:', processor);
        }
    }, []);

    const processText = async () => {
        if (!inputText.trim()) return;
        
        setIsProcessing(true);
        console.log('Starting text processing...');
        
        try {
            // Step 1: Flask NLP preprocessing
            console.log('Step 1: Running Flask NLP preprocessing...');
            const flaskResponse = await fetch('http://127.0.0.1:5000/api/process-advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputText,
                    options: {
                        basicPreprocessing: true,
                        keywordExtraction: true,
                        entityRecognition: true,
                        sentimentAnalysis: true,
                        contextualEmbedding: true,
                        relationshipMapping: true,
                        topicModeling: true,
                        intentClassification: true,
                        conceptExtraction: true
                    },
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!flaskResponse.ok) {
                throw new Error(`Flask API error: ${flaskResponse.status}`);
            }
            
            const flaskResults = await flaskResponse.json();
            console.log('Flask NLP Results:', flaskResults);
            
            // Step 2: Gemini post-processing and fine-tuning
            let enhancedResults = flaskResults;
            if (aiEnabled && geminiProcessor && geminiProcessor.isInitialized) {
                try {
                    console.log('Step 2: Running Gemini post-processing...');
                    const aiResults = await geminiProcessor.enhanceNLPResults(
                        flaskResults, 
                        inputText
                    );
                    console.log('Gemini Enhanced Results:', aiResults);
                    
                    if (aiResults.enhanced) {
                        enhancedResults = aiResults;
                        console.log('✅ AI enhancement successful!');
                    } else {
                        console.log('⚠️ AI enhancement failed, using Flask results');
                    }
                } catch (error) {
                    console.warn('❌ AI enhancement failed:', error);
                }
            } else {
                console.log('⚠️ AI not enabled or not available, using Flask NLP only');
            }
            
            // Step 3: Log final results
            console.log('🎯 Final Processing Results:', {
                originalText: inputText,
                flaskNLP: flaskResults,
                enhancedResults: enhancedResults,
                processingMethod: aiEnabled && geminiProcessor?.isInitialized ? 'Flask NLP + Gemini Nano' : 'Flask NLP Only'
            });
            
        } catch (error) {
            console.error('❌ Processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container">
            {/* Header */}
            <div className="header">
                <h1 className="title">
                    NLP + Gemini Processing
                </h1>
                <p className="subtitle">
                    Flask handles NLP preprocessing, React handles Gemini post-processing. Check browser console for detailed results.
                </p>
            </div>
            
            {/* Text Input */}
            <div className="input-group">
                <div>
                    <label className="label">
                        Input Text for Processing
                    </label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter text to analyze with Flask NLP + Gemini processing..."
                        className="textarea"
                    />
                </div>
                
                <div className="controls">
                    <label className="checkbox-group">
                        <input
                            type="checkbox"
                            checked={aiEnabled}
                            onChange={(e) => setAiEnabled(e.target.checked)}
                            disabled={!geminiProcessor || !geminiProcessor.isSupported}
                            className="checkbox"
                        />
                        <span className="checkbox-label">
                            Enable Gemini AI Enhancement {(!geminiProcessor || !geminiProcessor.isSupported) && '(Not Available)'}
                        </span>
                    </label>
                    
                    <button
                        onClick={processText}
                        disabled={isProcessing || !inputText.trim()}
                        className="button"
                    >
                        {isProcessing ? 'Processing...' : 'Process Text'}
                    </button>
                </div>
            </div>
            
            {/* Status Information */}
            <div className="status-card">
                <h3 className="status-title">
                    Processing Status
                </h3>
                <div className="status-item">
                    <div 
                        className={`status-dot ${
                            geminiProcessor?.isSupported ? 'bg-green-400' : 'bg-red-400'
                        }`}
                    />
                    <span className="status-text">
                        Gemini Support: {geminiProcessor?.isSupported ? 'Available' : 'Not Available'}
                    </span>
                </div>
                
                <div className="status-item">
                    <div 
                        className={`status-dot ${
                            geminiProcessor?.isInitialized ? 'bg-green-400' : 'bg-yellow-400'
                        }`}
                    />
                    <span className="status-text">
                        AI Status: {geminiProcessor?.isInitialized ? 'Ready' : 'Initializing...'}
                    </span>
                </div>
                
                <div className="status-item">
                    <div 
                        className={`status-dot ${
                            isProcessing ? 'bg-blue-400' : 'bg-gray-400'
                        }`}
                    />
                    <span className="status-text">
                        Processing: {isProcessing ? 'In Progress' : 'Ready'}
                    </span>
                </div>
                
                <div className="console-info">
                    <p className="console-text">
                        <strong>Console Output:</strong> Open your browser's developer console (F12) to see detailed processing results, including Flask NLP preprocessing and Gemini enhancement steps.
                    </p>
                </div>
            </div>
            
            {/* Example Text */}
            <div className="example-section">
                <p className="example-text">
                    Try this example text:
                </p>
                <button
                    onClick={() => setInputText("President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists. The program succeeded in 1969 when Apollo 11 landed on the Moon during the Cold War tensions with the Soviet Union.")}
                    className="example-button"
                >
                    President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists...
                </button>
            </div>
        </div>
    );
}

// Render the app using React 18's createRoot API
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
