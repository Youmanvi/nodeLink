const { useState, useEffect } = React;

// Main App Component
function App() {
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [geminiProcessor, setGeminiProcessor] = useState(null);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [results, setResults] = useState(null);

    // Initialize Gemini Nano Processor
    useEffect(() => {
        if (window.GeminiNanoProcessor) {
            const processor = new window.GeminiNanoProcessor();
            setGeminiProcessor(processor);
            console.log('Gemini Nano Processor initialized:', processor);
            
            // Auto-enable AI if it's supported and available
            processor.checkSupport().then(() => {
                if (processor.isSupported) {
                    processor.initialize().then(() => {
                        if (processor.isInitialized) {
                            setAiEnabled(true);
                            console.log('✅ AI automatically enabled - Gemini Nano is ready!');
                        }
                    }).catch(error => {
                        console.warn('Failed to auto-initialize AI:', error);
                    });
                }
            });
        }
    }, []);

    // Display functions
    const displayNodeLinkGraph = (graphData) => {
        setResults({
            type: 'nodeLinkGraph',
            data: graphData,
            summary: `Graph with ${graphData.nodes?.length || 0} nodes and ${graphData.links?.length || 0} links`
        });
        
        // Store graph data globally for visualization
        window.currentGraphData = graphData;
    };

    const displayFlaskResults = (flaskData) => {
        setResults({
            type: 'flaskNLP',
            data: flaskData,
            summary: `${flaskData.entities?.length || 0} entities, ${flaskData.keywords?.length || 0} keywords, ${flaskData.relationships?.length || 0} relationships`
        });
    };

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
            
            // Step 2: Gemini conversion to NodeLinkGraph format
            let nodeLinkGraph = null;
            if (aiEnabled && geminiProcessor && geminiProcessor.isInitialized) {
                try {
                    console.log('Step 2: Converting to NodeLinkGraph format with Gemini...');
                    const aiResults = await geminiProcessor.enhanceNLPResults(
                        flaskResults, 
                        inputText
                    );
                    console.log('Gemini NodeLinkGraph Results:', aiResults);
                    
                    if (aiResults.enhanced && aiResults.nodeLinkGraph) {
                        nodeLinkGraph = aiResults.nodeLinkGraph;
                        console.log('✅ NodeLinkGraph conversion successful!');
                        console.log('📊 Graph Data:', JSON.stringify(nodeLinkGraph, null, 2));
                    } else {
                        console.log('⚠️ NodeLinkGraph conversion failed, using Flask results only');
                    }
                } catch (error) {
                    console.warn('❌ NodeLinkGraph conversion failed:', error);
                }
            } else {
                console.log('⚠️ AI not enabled or not available, using Flask NLP only');
            }
            
            // Step 3: Display results
            console.log('🎯 Final Processing Results:', {
                originalText: inputText,
                flaskNLP: flaskResults,
                nodeLinkGraph: nodeLinkGraph,
                processingMethod: aiEnabled && geminiProcessor?.isInitialized ? 'Flask NLP + Gemini NodeLinkGraph' : 'Flask NLP Only'
            });
            
            // Display NodeLinkGraph JSON in the UI
            if (nodeLinkGraph) {
                displayNodeLinkGraph(nodeLinkGraph);
            } else {
                displayFlaskResults(flaskResults);
            }
            
        } catch (error) {
            console.error('❌ Processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return React.createElement('div', { className: 'container' },
        // Header
        React.createElement('div', { className: 'header' },
            React.createElement('h1', { className: 'title' }, 'NLP + Gemini Processing'),
            React.createElement('p', { className: 'subtitle' }, 'Flask handles NLP preprocessing, React handles Gemini post-processing. Check browser console for detailed results.')
        ),
        
        // Text Input
        React.createElement('div', { className: 'input-group' },
            React.createElement('div', null,
                React.createElement('label', { className: 'label' }, 'Input Text for Processing'),
                React.createElement('textarea', {
                    value: inputText,
                    onChange: (e) => setInputText(e.target.value),
                    placeholder: 'Enter text to analyze with Flask NLP + Gemini processing...',
                    className: 'textarea'
                })
            ),
            
            React.createElement('div', { className: 'controls' },
                React.createElement('label', { className: 'checkbox-group' },
                    React.createElement('input', {
                        type: 'checkbox',
                        checked: aiEnabled,
                        onChange: (e) => setAiEnabled(e.target.checked),
                        disabled: !geminiProcessor || !geminiProcessor.isSupported,
                        className: 'checkbox'
                    }),
                    React.createElement('span', { className: 'checkbox-label' }, 
                        'Enable Gemini AI Enhancement ' + ((!geminiProcessor || !geminiProcessor.isSupported) ? '(Not Available)' : '')
                    )
                ),
                
                React.createElement('button', {
                    onClick: processText,
                    disabled: isProcessing || !inputText.trim(),
                    className: 'button'
                }, isProcessing ? 'Processing...' : 'Process Text')
            )
        ),
        
        // Status Information
        React.createElement('div', { className: 'status-card' },
            React.createElement('h3', { className: 'status-title' }, 'Processing Status'),
            
            React.createElement('div', { className: 'status-item' },
                React.createElement('div', { 
                    className: `status-dot ${geminiProcessor?.isSupported ? 'bg-green-400' : 'bg-red-400'}`
                }),
                React.createElement('span', { className: 'status-text' }, 
                    'Gemini Support: ' + (geminiProcessor?.isSupported ? 'Available' : 'Not Available')
                )
            ),
            
            React.createElement('div', { className: 'status-item' },
                React.createElement('div', { 
                    className: `status-dot ${geminiProcessor?.isInitialized ? 'bg-green-400' : 'bg-yellow-400'}`
                }),
                React.createElement('span', { className: 'status-text' }, 
                    'AI Status: ' + (geminiProcessor?.isInitialized ? 'Ready' : 'Initializing...')
                )
            ),
            
            React.createElement('div', { className: 'status-item' },
                React.createElement('div', { 
                    className: `status-dot ${isProcessing ? 'bg-blue-400' : 'bg-gray-400'}`
                }),
                React.createElement('span', { className: 'status-text' }, 
                    'Processing: ' + (isProcessing ? 'In Progress' : 'Ready')
                )
            ),
            
            React.createElement('div', { className: 'console-info' },
                React.createElement('p', { className: 'console-text' },
                    React.createElement('strong', null, 'Console Output: '),
                    'Open your browser\'s developer console (F12) to see detailed processing results, including Flask NLP preprocessing and Gemini enhancement steps.'
                )
            )
        ),
        
        // Results Display
        results && React.createElement('div', { className: 'results-section' },
            React.createElement('h3', { className: 'results-title' }, 'Processing Results'),
            React.createElement('div', { className: 'results-summary' },
                React.createElement('strong', null, results.summary)
            ),
            results.type === 'nodeLinkGraph' && React.createElement('div', { className: 'graph-actions' },
                React.createElement('button', {
                    onClick: () => window.open('graph-visualization.html', '_blank'),
                    className: 'button',
                    style: { marginBottom: '1rem' }
                }, 'Open Graph Visualization')
            ),
            React.createElement('div', { className: 'results-data' },
                React.createElement('pre', { className: 'json-display' },
                    JSON.stringify(results.data, null, 2)
                )
            )
        ),
        
        // Example Text
        React.createElement('div', { className: 'example-section' },
            React.createElement('p', { className: 'example-text' }, 'Try this example text:'),
            React.createElement('button', {
                onClick: () => setInputText("President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists. The program succeeded in 1969 when Apollo 11 landed on the Moon during the Cold War tensions with the Soviet Union."),
                className: 'example-button'
            }, 'President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists...')
        )
    );
}

// Render the app using React 18's createRoot API
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
