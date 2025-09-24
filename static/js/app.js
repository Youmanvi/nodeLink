/**
 * Main Application Component
 * Simplified main app that orchestrates all components
 */

const { useState, useEffect } = React;

// Import Gemini Nano Processor
let GeminiNanoProcessorClass = null;
if (typeof window !== 'undefined' && window.GeminiNanoProcessor) {
    GeminiNanoProcessorClass = window.GeminiNanoProcessor;
}

function App() {
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [geminiProcessor, setGeminiProcessor] = useState(null);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] });
    const [showGraph, setShowGraph] = useState(false);

    // Initialize Gemini Nano Processor
    useEffect(() => {
        if (GeminiNanoProcessorClass) {
            const processor = new GeminiNanoProcessorClass();
            setGeminiProcessor(processor);
            console.log('Gemini Nano Processor created:', processor);
            
            // Initialize the processor
            processor.initialize().then(() => {
                console.log('Gemini Nano Processor initialized successfully');
                // Auto-enable AI when Gemini Nano is ready
                setAiEnabled(true);
            }).catch(error => {
                console.warn('Gemini Nano Processor initialization failed:', error);
            });
        }
    }, []);

    // Convert NLP results to graph data
    const convertToGraphData = (nlpResults) => {
        console.log('Converting NLP results to graph data:', nlpResults);
        
        const nodes = [];
        const links = [];
        const nodeMap = new Map();

        // Debug: Check what properties are available
        console.log('Available properties:', Object.keys(nlpResults));

        // Handle Gemini Enhanced Results format (array of objects)
        if (Array.isArray(nlpResults)) {
            console.log('Processing Gemini Enhanced Results array:', nlpResults);
            nlpResults.forEach((item, index) => {
                const nodeId = item.id || `node_${index}`;
                const label = item.label || item.shortLabel || item.text || `Node ${index}`;
                const type = item.type || item.aiCategory || 'entity';
                
                nodeMap.set(label, nodeId);
                nodes.push({
                    id: nodeId,
                    label: label,
                    type: type,
                    size: Math.max(20, Math.min(80, label.length * 2 + (item.importance || 0.5) * 20)),
                    color: getNodeColor(type),
                    x: Math.random() * 800 + 100,
                    y: Math.random() * 400 + 100,
                    importance: item.importance || 0.5,
                    confidence: item.aiConfidence || 0.8,
                    description: item.description || ''
                });
            });

            // Create links based on co-occurrence and importance
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const node1 = nodes[i];
                    const node2 = nodes[j];
                    
                    // Create links based on importance and type similarity
                    const importanceScore = (node1.importance + node2.importance) / 2;
                    const typeSimilarity = node1.type === node2.type ? 0.8 : 0.3;
                    const linkStrength = importanceScore * typeSimilarity;
                    
                    if (linkStrength > 0.4) {
                        links.push({
                            id: `link_${i}_${j}`,
                            source: node1.id,
                            target: node2.id,
                            type: 'related',
                            strength: linkStrength,
                            label: 'related'
                        });
                    }
                }
            }
        }
        // Handle traditional NLP results format
        else {
            // Add entities as nodes - handle different possible structures
            const entities = nlpResults.entities || nlpResults.entity_recognition || [];
            if (entities && entities.length > 0) {
                console.log('Processing entities:', entities);
                entities.forEach((entity, index) => {
                    // Handle both string and object formats
                    const entityText = typeof entity === 'string' ? entity : (entity.text || entity.label || entity);
                    const entityLabel = typeof entity === 'object' ? (entity.label || entity.type || 'entity') : 'entity';
                    
                    const nodeId = `entity_${index}`;
                    nodeMap.set(entityText, nodeId);
                    nodes.push({
                        id: nodeId,
                        label: entityText,
                        type: entityLabel,
                        size: Math.max(20, Math.min(60, entityText.length * 2)),
                        color: getNodeColor(entityLabel),
                        x: Math.random() * 800 + 100,
                        y: Math.random() * 400 + 100
                    });
                });
            }

            // Add keywords as nodes - handle different possible structures
            const keywords = nlpResults.keywords || nlpResults.keyword_extraction || [];
            if (keywords && keywords.length > 0) {
                console.log('Processing keywords:', keywords);
                keywords.forEach((keyword, index) => {
                    const keywordText = typeof keyword === 'string' ? keyword : (keyword.text || keyword.word || keyword);
                    
                    if (!nodeMap.has(keywordText)) {
                        const nodeId = `keyword_${index}`;
                        nodeMap.set(keywordText, nodeId);
                        nodes.push({
                            id: nodeId,
                            label: keywordText,
                            type: 'keyword',
                            size: Math.max(15, Math.min(40, keywordText.length * 1.5)),
                            color: getNodeColor('keyword'),
                            x: Math.random() * 800 + 100,
                            y: Math.random() * 400 + 100
                        });
                    }
                });
            }

            // Add relationships as links - handle different possible structures
            const relationships = nlpResults.relationships || nlpResults.relationship_analysis || [];
            if (relationships && relationships.length > 0) {
                console.log('Processing relationships:', relationships);
                relationships.forEach((rel, index) => {
                    const source = rel.source || rel.from || rel.entity1;
                    const target = rel.target || rel.to || rel.entity2;
                    
                    if (source && target) {
                        const sourceId = nodeMap.get(source);
                        const targetId = nodeMap.get(target);
                        
                        if (sourceId && targetId) {
                            links.push({
                                id: `link_${index}`,
                                source: sourceId,
                                target: targetId,
                                type: rel.type || rel.relation || 'related',
                                strength: rel.strength || rel.weight || 0.5,
                                label: rel.type || rel.relation || 'related'
                            });
                        }
                    }
                });
            }
        }

        console.log('Generated graph data:', { nodes, links });
        
        // Fallback: If no nodes were created, try to extract any text data
        if (nodes.length === 0) {
            console.log('No nodes created, trying fallback extraction...');
            
            // Try to extract any text from the results
            const allTexts = [];
            
            // Look for any arrays of strings or objects with text
            Object.values(nlpResults).forEach(value => {
                if (Array.isArray(value)) {
                    value.forEach(item => {
                        if (typeof item === 'string') {
                            allTexts.push(item);
                        } else if (typeof item === 'object' && item.text) {
                            allTexts.push(item.text);
                        }
                    });
                }
            });
            
            // Create nodes from any text found
            allTexts.slice(0, 10).forEach((text, index) => {
                if (text && text.length > 1) {
                    nodes.push({
                        id: `fallback_${index}`,
                        label: text,
                        type: 'text',
                        size: Math.max(15, Math.min(40, text.length * 1.5)),
                        color: getNodeColor('text'),
                        x: Math.random() * 800 + 100,
                        y: Math.random() * 400 + 100
                    });
                }
            });
        }
        
        return { nodes, links };
    };

    // Get color for node type
    const getNodeColor = (type) => {
        const colors = {
            'PERSON': '#ff6b6b',
            'ORG': '#4ecdc4',
            'GPE': '#45b7d1',
            'EVENT': '#96ceb4',
            'PRODUCT': '#feca57',
            'LOCATION': '#45b7d1',
            'DATE': '#f39c12',
            'QUANTITY': '#9b59b6',
            'TECHNOLOGY': '#1abc9c',
            'SCIENCE': '#3498db',
            'CONCEPT': '#e67e22',
            'keyword': '#a55eea',
            'entity': '#26de81',
            'text': '#95a5a6'
        };
        return colors[type] || '#95a5a6';
    };

    // Render graph using D3.js
    const renderGraph = (svgElement, data) => {
        // Clear previous content
        svgElement.innerHTML = '';
        
        const width = svgElement.clientWidth || 800;
        const height = 500;
        
        // Create D3 force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links).id(d => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(d => d.size / 2 + 5));

        // Create SVG elements
        const svg = d3.select(svgElement);
        
        // Create links
        const link = svg.append("g")
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("stroke", "#666")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => Math.sqrt(d.strength || 1) * 2);

        // Create nodes
        const node = svg.append("g")
            .selectAll("g")
            .data(data.nodes)
            .enter().append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));

        // Add circles for nodes
        node.append("circle")
            .attr("r", d => d.size / 2)
            .attr("fill", d => d.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);

        // Add labels
        node.append("text")
            .text(d => d.label)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#fff")
            .attr("font-size", "12px")
            .attr("font-family", "Arial, sans-serif");

        // Add tooltips
        node.append("title")
            .text(d => `${d.label}\nType: ${d.type}`);

        // Update positions on simulation tick
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // Drag functions
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
    };

    const processText = async () => {
        if (!inputText.trim()) return;
        
        setIsProcessing(true);
        console.log('Starting text processing...');
        
        try {
                    // Step 1: Flask NLP preprocessing (enhanced pipeline)
                    console.log('Step 1: Running Flask NLP preprocessing with enhanced pipeline...');
                    const flaskResponse = await fetch('/api/process-enhanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: inputText,
                    options: {
                        use_enhanced_pipeline: true,
                        batch_size: {
                            entities_per_batch: 20,
                            keywords_per_batch: 30,
                            relationships_per_batch: 25
                        }
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
            
            // Step 3: Generate graph data and show visualization
            // Check if we have Gemini enhanced results (array format) or Flask results (object format)
            let finalResults;
            if (Array.isArray(enhancedResults)) {
                // Gemini enhanced results are directly an array
                finalResults = enhancedResults;
                console.log('Using Gemini Enhanced Results for graph');
            } else if (enhancedResults.enhanced && Array.isArray(enhancedResults.enhanced)) {
                // Gemini results wrapped in an enhanced property
                finalResults = enhancedResults.enhanced;
                console.log('Using Gemini Enhanced Results (wrapped) for graph');
            } else {
                // Fall back to Flask results
                finalResults = flaskResults;
                console.log('Using Flask Results for graph');
            }
            
            const graphData = convertToGraphData(finalResults);
            
            // Fallback: If no graph data was generated, create a demo graph
            if (graphData.nodes.length === 0) {
                console.log('No graph data generated, creating demo graph...');
                const demoGraphData = {
                    nodes: [
                        { id: 'demo1', label: 'Text Analysis', type: 'CONCEPT', size: 40, color: '#4ecdc4', x: 200, y: 150 },
                        { id: 'demo2', label: 'AI Enhancement', type: 'TECHNOLOGY', size: 35, color: '#1abc9c', x: 400, y: 150 },
                        { id: 'demo3', label: 'Knowledge Graph', type: 'CONCEPT', size: 45, color: '#e67e22', x: 300, y: 250 }
                    ],
                    links: [
                        { id: 'link1', source: 'demo1', target: 'demo2', type: 'related', strength: 0.8 },
                        { id: 'link2', source: 'demo2', target: 'demo3', type: 'related', strength: 0.9 },
                        { id: 'link3', source: 'demo1', target: 'demo3', type: 'related', strength: 0.7 }
                    ]
                };
                setGraphData(demoGraphData);
                console.log('Demo graph created:', demoGraphData);
            } else {
                setGraphData(graphData);
            }
            
            setShowGraph(true);
            
            console.log('🎯 Final Processing Results:', {
                originalText: inputText,
                flaskNLP: flaskResults,
                enhancedResults: enhancedResults,
                processingMethod: aiEnabled && geminiProcessor?.isInitialized ? 'Flask NLP + Gemini Nano' : 'Flask NLP Only',
                graphData: graphData
            });
            
        } catch (error) {
            console.error('❌ Processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen dark" style={{ backgroundColor: '#2C2C2C' }}>
            <div className="container">
                {/* Header */}
                <div className="header">
                    <h1 className="title">
                        AI-Enhanced Knowledge Graph
                    </h1>
                    <p className="subtitle">
                        Transform text into interactive knowledge graphs with AI enhancement
                    </p>
                </div>
                
                {/* Text Input */}
                <div className="input-group">
                    <label className="label">
                        Input Text for Analysis
                    </label>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Enter text to analyze and visualize as a knowledge graph..."
                        className="textarea"
                    />
                </div>
                
                {/* Controls */}
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
                            Enable AI Enhancement {(!geminiProcessor || !geminiProcessor.isSupported) && '(Not Available)'}
                        </span>
                    </label>
                    
                    <button
                        onClick={processText}
                        disabled={isProcessing || !inputText.trim()}
                        className="button"
                    >
                        {isProcessing ? 'Processing...' : 'Analyze Text'}
                    </button>
                </div>
                
                {/* Status Information */}
                <div className="status-panel">
                    <h3 className="status-title">
                        Processing Status
                    </h3>
                    <div className="status-item">
                        <div 
                            className={`status-dot ${
                                geminiProcessor?.isSupported ? 'green' : 'red'
                            }`}
                        />
                        <span>
                            AI Support: {geminiProcessor?.isSupported ? 'Available' : 'Not Available'}
                        </span>
                    </div>
                    
                    <div className="status-item">
                        <div 
                            className={`status-dot ${
                                geminiProcessor?.isInitialized ? 'green' : 'yellow'
                            }`}
                        />
                        <span>
                            AI Status: {geminiProcessor?.isInitialized ? 'Ready' : 'Initializing...'}
                        </span>
                    </div>
                    
                    <div className="status-item">
                        <div 
                            className={`status-dot ${
                                isProcessing ? 'blue' : 'gray'
                            }`}
                        />
                        <span>
                            Processing: {isProcessing ? 'In Progress' : 'Ready'}
                        </span>
                    </div>
                    
                    <div className="console-info">
                        <p>
                            <strong>Console Output:</strong> Open your browser's developer console (F12) to see detailed processing results, including NLP preprocessing and AI enhancement steps.
                        </p>
                    </div>
                </div>
                
                {/* Knowledge Graph Visualization */}
                {showGraph && graphData.nodes.length > 0 && (
                    <div className="graph-container">
                        <h3 className="graph-title">Knowledge Graph Visualization</h3>
                        <div className="graph-wrapper">
                            <svg 
                                width="100%" 
                                height="500" 
                                style={{ border: '1px solid #444', borderRadius: '8px', backgroundColor: '#1a1a1a' }}
                                ref={(svg) => {
                                    if (svg && graphData.nodes.length > 0) {
                                        renderGraph(svg, graphData);
                                    }
                                }}
                            />
                        </div>
                                <div className="graph-legend">
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: '#ff6b6b' }}></span>
                                        <span>People</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: '#4ecdc4' }}></span>
                                        <span>Organizations</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: '#45b7d1' }}></span>
                                        <span>Locations</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: '#96ceb4' }}></span>
                                        <span>Events</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: '#f39c12' }}></span>
                                        <span>Dates</span>
                                    </div>
                                    <div className="legend-item">
                                        <span className="legend-color" style={{ backgroundColor: '#a55eea' }}></span>
                                        <span>Keywords</span>
                                    </div>
                                </div>
                    </div>
                )}
                
                {/* Example Text */}
                <div className="example-text">
                    <p className="example-label">
                        Try this example text:
                    </p>
                    <button
                        onClick={() => setInputText("President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists. The program succeeded in 1969 when Apollo 11 landed on the Moon during the Cold War tensions with the Soviet Union.")}
                        className="example-button"
                    >
                        Historical Analysis: Apollo Program
                    </button>
                </div>
            </div>
        </div>
    );
}

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));
