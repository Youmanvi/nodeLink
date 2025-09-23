const { useState, useEffect, useRef, useCallback } = React;

// Graph Configuration (Enhanced from template)
const GRAPH_CONFIG = {
    colors: {
        background: '#2C2C2C',
        foreground: '#E4E4E4',
        border: '#4A4A4A',
        accent: '#3A3A3A',
        muted: '#B8B8B8',
        // Primary entity types
        people: '#B39CD0',      // Lavender
        events: '#FFC1CC',      // Soft Pink
        places: '#A8DADC',      // Light Cyan
        // Extended entity types
        organizations: '#FFD93D', // Yellow
        concepts: '#6BCF7F',      // Green
        dates: '#4ECDC4',         // Teal
        money: '#FF8A80',         // Light Red
        quantities: '#A8DADC',    // Light Blue
        technology: '#F4A261',    // Orange
        science: '#E76F51',       // Coral
        politics: '#9B59B6',      // Purple
        culture: '#E67E22',       // Dark Orange
        health: '#1ABC9C',        // Turquoise
        education: '#3498DB',     // Blue
        // Link colors
        linkDefault: '#B8B8B8',
        linkHighlight: '#E4E4E4',
        animatedParticle: '#B39CD0'
    },
    nodes: {
        baseRadius: 28,
        glowRadius: 32,
        hoverGlowRadius: 40,
        innerRadius: 22,
        strokeWidth: 2,
        selectedStrokeWidth: 3,
        fontSize: 11,
        fontWeight: '600'
    },
    links: {
        defaultWidth: 1.5,
        highlightWidth: 3,
        defaultOpacity: 0.6,
        highlightOpacity: 0.9,
        dimmedOpacity: 0.2,
        animationDuration: '3s',
        particleRadius: 2.5,
        curvature: 0.3
    },
    layout: {
        containerHeight: 1200,
        nodeSpacing: 80,
        repulsionForce: 2000,
        repulsionDistance: 200,
        attractionForce: 0.08,
        idealDistance: 180,
        centerForce: 0.01,
        damping: 0.9,
        animationInterval: 50,
        nodePadding: 60
    },
    animation: {
        glowStdDeviation: 4,
        linkGlowStdDeviation: 1.5
    }
};

// Graph Visualization Component
function GraphVisualization({ graphData, onNodeSelect, selectedNode }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isStabilizing, setIsStabilizing] = useState(false);
    const [error, setError] = useState(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const [data, setData] = useState(null);
    const stabilizationSteps = useRef(0);
    const maxStabilizationSteps = 120; // 6 seconds at 50ms intervals
    const simulationRef = useRef(null);
    const isStabilizingRef = useRef(false);

    // Handle window resize and initial sizing
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                // Make height much larger to enable scrolling
                const height = Math.max(2000, window.innerHeight * 2);
                setDimensions({ width: rect.width, height });
            }
        };

        const initializeDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                if (rect.width > 0) {
                    // Make height much larger to enable scrolling
                    const height = Math.max(2000, window.innerHeight * 2);
                    setDimensions({ width: rect.width, height });
                } else {
                    setTimeout(initializeDimensions, 10);
                }
            }
        };

        initializeDimensions();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Initialize graph with proper two-phase loading
    const initializeGraph = async () => {
        // Step 1: Prevent loading if container not ready
        if (dimensions.width === 0 || dimensions.height === 0) {
            return;
        }

        // Step 2: Set loading state and reset stabilization counter
        setIsLoading(true);
        setIsStabilizing(false);
        isStabilizingRef.current = false;
        stabilizationSteps.current = 0;
        setError(null);

        // Step 3: Brief delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

        // Debug: Log the incoming graph data
        console.log('🔍 Initializing graph with data:', graphData);
        console.log('🔍 Data structure check:', {
            hasGraphData: !!graphData,
            hasNodes: !!graphData?.nodes,
            nodeCount: graphData?.nodes?.length || 0,
            hasLinks: !!graphData?.links,
            linkCount: graphData?.links?.length || 0,
            firstNode: graphData?.nodes?.[0]
        });

        // Step 4: Process and center the data
        const processedData = processGraphData(graphData);
        
        console.log('🔍 Processed data:', processedData);
        console.log('🔍 Processed nodes count:', processedData.nodes?.length);
        
        // Step 5: Set the processed data
        setData(processedData);
        
        // Step 6: Begin stabilization phase
        setIsLoading(false);
        setIsStabilizing(true);
        isStabilizingRef.current = true;
    };

    // Process graph data with coordinate transformation and centering
    const processGraphData = (rawData) => {
        if (!rawData || !rawData.nodes || !rawData.links) {
            throw new Error('Invalid graph data structure');
        }

        // Generate initial positions for nodes that don't have them
        const nodesWithPositions = rawData.nodes.map((node, index) => {
            if (!node.x || !node.y) {
                // Generate positions in a tighter grid-like pattern
                const cols = Math.ceil(Math.sqrt(rawData.nodes.length));
                const row = Math.floor(index / cols);
                const col = index % cols;
                const spacing = 80; // Much closer spacing
                const startX = 200; // Start closer to center
                const startY = 200; // Start closer to center
                
                return {
                    ...node,
                    x: startX + col * spacing,
                    y: startY + row * spacing
                };
            }
            return node;
        });

        // Calculate the geometric center of all nodes
        const centerX = nodesWithPositions.reduce((sum, node) => sum + node.x, 0) / nodesWithPositions.length;
        const centerY = nodesWithPositions.reduce((sum, node) => sum + node.y, 0) / nodesWithPositions.length;

        // Calculate target center (middle of container)
        const targetX = dimensions.width / 2;
        const targetY = dimensions.height / 2;

        // Calculate offset needed to center the graph
        const offsetX = targetX - centerX;
        const offsetY = targetY - centerY;
        
        console.log('🎯 Centering calculation:', {
            centerX, centerY, targetX, targetY, offsetX, offsetY,
            dimensions: { width: dimensions.width, height: dimensions.height }
        });

        // Apply offset to all nodes and add required properties
        const centeredNodes = nodesWithPositions.map(node => ({
            ...node,
            x: node.x + offsetX,
            y: node.y + offsetY,
            vx: 0,
            vy: 0,
            shortLabel: node.label && node.label.length > 15 ? node.label.substring(0, 15) + "..." : node.label,
            color: getNodeColor(node),
            type: getNodeType(node),
            description: node.aiInsights ? node.aiInsights.join('. ') : `Type: ${node.type || 'unknown'}`
        }));

        return {
            nodes: centeredNodes,
            links: rawData.links || []
        };
    };

    // Helper functions for color assignment
    const getNodeColor = (node) => {
        // Check AI categories first
        if (node.aiCategory === 'PERSON') return GRAPH_CONFIG.colors.people;
        if (node.aiCategory === 'ORG' || node.aiCategory === 'ORGANIZATION') return GRAPH_CONFIG.colors.organizations;
        if (node.aiCategory === 'LOCATION' || node.aiCategory === 'GPE') return GRAPH_CONFIG.colors.places;
        if (node.aiCategory === 'EVENT') return GRAPH_CONFIG.colors.events;
        if (node.aiCategory === 'DATE' || node.aiCategory === 'TIME') return GRAPH_CONFIG.colors.dates;
        if (node.aiCategory === 'MONEY' || node.aiCategory === 'PERCENT') return GRAPH_CONFIG.colors.money;
        if (node.aiCategory === 'QUANTITY') return GRAPH_CONFIG.colors.quantities;
        if (node.aiCategory === 'CARDINAL' || node.aiCategory === 'ORDINAL') return GRAPH_CONFIG.colors.quantities;
        if (node.aiCategory === 'TECHNOLOGY') return GRAPH_CONFIG.colors.technology;
        if (node.aiCategory === 'SCIENCE') return GRAPH_CONFIG.colors.science;
        if (node.aiCategory === 'POLITICS') return GRAPH_CONFIG.colors.politics;
        if (node.aiCategory === 'CULTURE') return GRAPH_CONFIG.colors.culture;
        if (node.aiCategory === 'HEALTH') return GRAPH_CONFIG.colors.health;
        if (node.aiCategory === 'EDUCATION') return GRAPH_CONFIG.colors.education;
        
        // Check entity types
        if (node.type === 'entity') return GRAPH_CONFIG.colors.people;
        if (node.type === 'keyword') return GRAPH_CONFIG.colors.concepts;
        
        // Check labels for common patterns
        const label = node.label?.toLowerCase() || '';
        if (label.includes('person') || label.includes('people') || label.includes('individual')) return GRAPH_CONFIG.colors.people;
        if (label.includes('organization') || label.includes('company') || label.includes('agency')) return GRAPH_CONFIG.colors.organizations;
        if (label.includes('location') || label.includes('place') || label.includes('city') || label.includes('country')) return GRAPH_CONFIG.colors.places;
        if (label.includes('event') || label.includes('meeting') || label.includes('conference')) return GRAPH_CONFIG.colors.events;
        if (label.includes('date') || label.includes('time') || label.includes('year')) return GRAPH_CONFIG.colors.dates;
        if (label.includes('money') || label.includes('dollar') || label.includes('cost') || label.includes('price')) return GRAPH_CONFIG.colors.money;
        if (label.includes('number') || label.includes('count') || label.includes('amount')) return GRAPH_CONFIG.colors.quantities;
        if (label.includes('tech') || label.includes('software') || label.includes('computer')) return GRAPH_CONFIG.colors.technology;
        if (label.includes('science') || label.includes('research') || label.includes('study')) return GRAPH_CONFIG.colors.science;
        if (label.includes('political') || label.includes('government') || label.includes('policy')) return GRAPH_CONFIG.colors.politics;
        if (label.includes('culture') || label.includes('art') || label.includes('music')) return GRAPH_CONFIG.colors.culture;
        if (label.includes('health') || label.includes('medical') || label.includes('doctor')) return GRAPH_CONFIG.colors.health;
        if (label.includes('education') || label.includes('school') || label.includes('university')) return GRAPH_CONFIG.colors.education;
        
        // Default colorful assignment - no gray!
        const colors = [
            GRAPH_CONFIG.colors.people,    // Lavender
            GRAPH_CONFIG.colors.events,    // Soft Pink  
            GRAPH_CONFIG.colors.places,    // Light Cyan
            GRAPH_CONFIG.colors.organizations, // Yellow
            GRAPH_CONFIG.colors.concepts,  // Green
            GRAPH_CONFIG.colors.dates,     // Teal
            GRAPH_CONFIG.colors.money,     // Light Red
            GRAPH_CONFIG.colors.quantities, // Light Blue
            GRAPH_CONFIG.colors.technology, // Orange
            GRAPH_CONFIG.colors.science,   // Coral
            GRAPH_CONFIG.colors.politics,  // Purple
            GRAPH_CONFIG.colors.culture,   // Dark Orange
            GRAPH_CONFIG.colors.health,    // Turquoise
            GRAPH_CONFIG.colors.education  // Blue
        ];
        
        // Use hash of label to consistently assign color
        let hash = 0;
        for (let i = 0; i < label.length; i++) {
            hash = ((hash << 5) - hash + label.charCodeAt(i)) & 0xffffffff;
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const getNodeType = (node) => {
        if (node.aiCategory === 'PERSON') return 'people';
        if (node.aiCategory === 'ORG' || node.aiCategory === 'ORGANIZATION') return 'organizations';
        if (node.aiCategory === 'LOCATION' || node.aiCategory === 'GPE') return 'places';
        if (node.aiCategory === 'EVENT') return 'events';
        if (node.aiCategory === 'DATE' || node.aiCategory === 'TIME') return 'dates';
        if (node.aiCategory === 'MONEY' || node.aiCategory === 'PERCENT') return 'money';
        if (node.aiCategory === 'QUANTITY') return 'quantities';
        if (node.aiCategory === 'CARDINAL' || node.aiCategory === 'ORDINAL') return 'quantities';
        if (node.aiCategory === 'TECHNOLOGY') return 'technology';
        if (node.aiCategory === 'SCIENCE') return 'science';
        if (node.aiCategory === 'POLITICS') return 'politics';
        if (node.aiCategory === 'CULTURE') return 'culture';
        if (node.aiCategory === 'HEALTH') return 'health';
        if (node.aiCategory === 'EDUCATION') return 'education';
        if (node.type === 'entity') return 'people';
        if (node.type === 'keyword') return 'concepts';
        return 'concepts';
    };

    useEffect(() => {
        if (graphData) {
            initializeGraph();
        } else {
            setError('No graph data available');
            setIsLoading(false);
            setIsStabilizing(false);
        }
    }, [graphData]);

    // Render graph when data is ready and not loading
    useEffect(() => {
        console.log('🔄 Render effect triggered:', { 
            hasData: !!data, 
            isLoading, 
            hasSvgRef: !!svgRef.current,
            nodeCount: data?.nodes?.length 
        });
        
        if (data && !isLoading && svgRef.current) {
            console.log('📊 Data ready, triggering renderGraph...');
            console.log('📊 Data structure:', { 
                hasNodes: !!data.nodes, 
                nodeCount: data.nodes?.length,
                hasLinks: !!data.links,
                linkCount: data.links?.length,
                firstNode: data.nodes?.[0]
            });
            renderGraph();
        }
    }, [data, isLoading]);

    // Cleanup simulation on unmount
    useEffect(() => {
        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop();
            }
        };
    }, []);

    const renderGraph = () => {
        try {
            console.log('🎨 renderGraph() called');
            console.log('🔍 Data check:', { 
                hasData: !!data, 
                hasNodes: !!data?.nodes, 
                nodeCount: data?.nodes?.length,
                hasLinks: !!data?.links,
                linkCount: data?.links?.length,
                isLoading,
                isStabilizing,
                svgRef: !!svgRef.current,
                dimensions
            });
            
            if (!data || !data.nodes || !data.links) {
                throw new Error('No processed data available for rendering');
            }

            console.log('🎨 renderGraph() called with processed data:', data);
            console.log('📏 SVG dimensions:', dimensions);
            console.log('🎯 SVG ref available:', !!svgRef.current);
            
            // Use processed data
            const validNodes = data.nodes;
            const validLinks = data.links.filter(link => {
                const sourceExists = validNodes.some(node => node.id === link.source);
                const targetExists = validNodes.some(node => node.id === link.target);
                if (!sourceExists || !targetExists) {
                    console.warn('Removing invalid link:', link, 'Source exists:', sourceExists, 'Target exists:', targetExists);
                    return false;
                }
                return true;
            });
            
            console.log('🔍 Processing nodes and links:', {
                validNodes: validNodes.length,
                validLinks: validLinks.length,
                nodeIds: validNodes.map(n => n.id),
                linkSources: validLinks.map(l => l.source),
                linkTargets: validLinks.map(l => l.target)
            });
            
            if (validNodes.length === 0) {
                throw new Error('No valid nodes to render');
            }
            
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = dimensions.width;
        const height = dimensions.height;
        
        console.log('SVG dimensions:', width, height);
        
        // Add a test circle to verify SVG is working
        svg.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", 20)
            .attr("fill", "red")
            .attr("opacity", 0.8);
        console.log('🔴 Test circle added at center');
            
            // Nodes are already centered by processGraphData
            const centeredNodes = validNodes;

        // Create force simulation with enhanced physics
        console.log('🔧 Creating D3 force simulation...');
        const simulation = d3.forceSimulation(centeredNodes)
            .force("link", d3.forceLink(validLinks).id(d => d.id).distance(60)) // Much closer ideal distance
            .force("charge", d3.forceManyBody().strength(-800)) // Reduced repulsion
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(GRAPH_CONFIG.nodes.baseRadius + 5)) // Smaller collision radius
            .alpha(0.3) // Start with some energy
            .alphaDecay(0.02); // Slower decay for better positioning
        
        simulationRef.current = simulation;
        console.log('✅ Force simulation created and started');

        // Add SVG definitions for filters and markers
        const defs = svg.append("defs");
        
        // Glow filter for nodes
        const glowFilter = defs.append("filter")
            .attr("id", "glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
        
        glowFilter.append("feGaussianBlur")
            .attr("stdDeviation", GRAPH_CONFIG.animation.glowStdDeviation)
            .attr("result", "coloredBlur");
        
        const feMerge = glowFilter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
        
        // Link glow filter
        const linkGlowFilter = defs.append("filter")
            .attr("id", "linkGlow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
        
        linkGlowFilter.append("feGaussianBlur")
            .attr("stdDeviation", GRAPH_CONFIG.animation.linkGlowStdDeviation)
            .attr("result", "coloredBlur");
        
        const linkFeMerge = linkGlowFilter.append("feMerge");
        linkFeMerge.append("feMergeNode").attr("in", "coloredBlur");
        linkFeMerge.append("feMergeNode").attr("in", "SourceGraphic");
        
        // Arrow marker
        defs.append("marker")
            .attr("id", "arrowhead")
            .attr("markerWidth", 8)
            .attr("markerHeight", 6)
            .attr("refX", 7)
            .attr("refY", 3)
            .attr("orient", "auto")
            .append("polygon")
            .attr("points", "0 0, 8 3, 0 6")
            .attr("fill", GRAPH_CONFIG.colors.foreground)
            .attr("opacity", 0.7);

        // Create links with enhanced styling
        const link = svg.append("g")
            .selectAll("path")
            .data(validLinks)
            .enter().append("path")
            .attr("stroke", GRAPH_CONFIG.colors.linkDefault)
            .attr("stroke-opacity", GRAPH_CONFIG.links.defaultOpacity)
            .attr("stroke-width", GRAPH_CONFIG.links.defaultWidth)
            .attr("fill", "none")
            .attr("filter", "url(#linkGlow)")
            .attr("marker-end", d => d.animated ? "url(#arrowhead)" : "none");

        // Create nodes
        console.log('🎯 Creating D3 nodes from:', centeredNodes.length, 'nodes');
        console.log('🎯 First few node positions:', centeredNodes.slice(0, 3).map(n => ({ id: n.id, x: n.x, y: n.y, color: n.color })));
        
        const node = svg.append("g")
            .selectAll("g")
            .data(centeredNodes)
            .enter().append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));
        
        console.log('✅ D3 nodes created:', node.size());
        console.log('✅ Node transforms:', node.nodes().slice(0, 3).map(n => n.getAttribute('transform')));

        // Nodes already have color assigned in processGraphData

        // Node glow effect
        node.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", GRAPH_CONFIG.nodes.glowRadius)
            .attr("fill", d => d.color)
            .attr("opacity", 0.4)
            .attr("filter", "url(#glow)");
        
        console.log('🎨 Node glow circles added');
        console.log('🎨 First glow circle attributes:', node.select('circle').node()?.getAttribute('fill'));

        // Main node circle
        node.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", GRAPH_CONFIG.nodes.baseRadius)
            .attr("fill", d => d.color)
            .attr("stroke", d => d.color)
            .attr("stroke-width", GRAPH_CONFIG.nodes.strokeWidth)
            .attr("opacity", 0.85)
            .style("cursor", "pointer")
            .on("click", (event, d) => onNodeSelect(d))
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("r", GRAPH_CONFIG.nodes.hoverGlowRadius)
                    .attr("stroke-width", GRAPH_CONFIG.nodes.selectedStrokeWidth)
                    .attr("opacity", 1);
                
                // Update glow
                d3.select(this.parentNode).select("circle:first-child")
                    .attr("r", GRAPH_CONFIG.nodes.hoverGlowRadius)
                    .attr("opacity", 0.6);
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("r", GRAPH_CONFIG.nodes.baseRadius)
                    .attr("stroke-width", GRAPH_CONFIG.nodes.strokeWidth)
                    .attr("opacity", 0.85);
                
                // Reset glow
                d3.select(this.parentNode).select("circle:first-child")
                    .attr("r", GRAPH_CONFIG.nodes.glowRadius)
                    .attr("opacity", 0.4);
            });

        // Inner circle for contrast
        node.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", GRAPH_CONFIG.nodes.innerRadius)
            .attr("fill", `${GRAPH_CONFIG.colors.background}1A`)
            .style("pointer-events", "none");

        // Node label with text wrapping
        node.each(function(d) {
            const textElement = d3.select(this).append("text")
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("x", 0)
                .attr("y", 0)
                .attr("font-size", GRAPH_CONFIG.nodes.fontSize)
                .attr("font-family", "Inter, sans-serif")
                .attr("font-weight", GRAPH_CONFIG.nodes.fontWeight)
                .attr("fill", GRAPH_CONFIG.colors.background)
                .style("pointer-events", "none")
                .style("user-select", "none");
            
            // Text wrapping function
            const wrapText = (text, width) => {
                const words = text.split(/\s+/).reverse();
                const lines = [];
                let word;
                let line = [];
                let lineNumber = 0;
                const maxLines = 3; // Maximum 3 lines
                
                while (word = words.pop()) {
                    line.push(word);
                    const testLine = line.join(' ');
                    const testWidth = testLine.length * (GRAPH_CONFIG.nodes.fontSize * 0.6); // Approximate character width
                    
                    if (testWidth > width && line.length > 1) {
                        line.pop();
                        lines.push(line.join(' '));
                        line = [word];
                        lineNumber++;
                        
                        if (lineNumber >= maxLines - 1) {
                            // On last line, add ellipsis if needed
                            const lastLine = line.join(' ');
                            if (lastLine.length * (GRAPH_CONFIG.nodes.fontSize * 0.6) > width) {
                                line = [lastLine.substring(0, Math.floor(width / (GRAPH_CONFIG.nodes.fontSize * 0.6)) - 3) + '...'];
                            }
                            break;
                        }
                    }
                }
                if (line.length > 0) {
                    lines.push(line.join(' '));
                }
                
                return lines;
            };
            
            // Apply text wrapping
            const label = d.shortLabel || d.label || 'Unknown';
            const maxWidth = GRAPH_CONFIG.nodes.baseRadius * 2.5; // Max width for text
            const lines = wrapText(label, maxWidth);
            const lineHeight = 1.1; // Line height - defined outside wrapText function
            
            // Create tspan elements for each line
            lines.forEach((line, i) => {
                textElement.append("tspan")
                    .attr("x", 0)
                    .attr("dy", i === 0 ? 0 : `${GRAPH_CONFIG.nodes.fontSize * lineHeight}px`)
                    .text(line);
            });
        });

        // Update positions on simulation tick with stabilization tracking
        simulation.on("tick", () => {
            // Update curved links
            link.attr("d", d => {
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const dr = Math.sqrt(dx * dx + dy * dy) * GRAPH_CONFIG.links.curvature;
                return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
            });

            // Update node positions
            node.attr("transform", d => `translate(${d.x},${d.y})`);
            
            // Check stabilization progress
            if (isStabilizingRef.current) {
                stabilizationSteps.current++;
                
                if (stabilizationSteps.current >= maxStabilizationSteps) {
                    console.log('✅ Stabilization complete, stopping simulation');
                    isStabilizingRef.current = false;
                    setIsStabilizing(false);
                    simulation.alphaTarget(0); // Stop the simulation
                    
                    // Auto-scroll to center of graph after stabilization
                    setTimeout(() => {
                        if (containerRef.current && centeredNodes.length > 0) {
                            const avgX = centeredNodes.reduce((sum, node) => sum + node.x, 0) / centeredNodes.length;
                            const avgY = centeredNodes.reduce((sum, node) => sum + node.y, 0) / centeredNodes.length;
                            const scrollTop = Math.max(0, avgY - (window.innerHeight / 2));
                            const scrollLeft = Math.max(0, avgX - (window.innerWidth / 2));
                            containerRef.current.scrollTo({
                                top: scrollTop,
                                left: scrollLeft,
                                behavior: 'smooth'
                            });
                            console.log('📍 Auto-scrolled to center:', { scrollTop, scrollLeft, avgX, avgY });
                        }
                    }, 100);
                }
            }
        });

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
        
        console.log('🎉 Graph rendered successfully!');
        console.log('🔍 Final check - SVG children:', svg.selectAll('*').size());
        console.log('🔍 Final check - Nodes:', node.size());
        } catch (error) {
            console.error('Error rendering graph:', error);
            setError('Failed to render graph: ' + error.message);
            setIsLoading(false);
            setIsStabilizing(false);
        }
    };

    console.log('GraphVisualization render:', { isLoading, isStabilizing, error, graphData: !!graphData, data: !!data, dimensions });

    if (isLoading) {
        return React.createElement('div', { className: 'loading' }, 'Loading graph visualization...');
    }

    if (error) {
        return React.createElement('div', { className: 'error' },
            React.createElement('div', null, error),
            React.createElement('div', { style: { fontSize: '0.875rem', marginTop: '0.5rem' } }, 'Process text to generate graph data')
        );
    }

    if (!window.d3) {
        return React.createElement('div', { className: 'error' },
            React.createElement('div', null, 'D3.js not loaded'),
            React.createElement('div', { style: { fontSize: '0.875rem', marginTop: '0.5rem' } }, 'Please refresh the page')
        );
    }

    return React.createElement('div', { 
        ref: containerRef,
        className: 'graph-container',
        style: { 
            height: '100vh',
            overflow: 'auto',
            position: 'relative',
            scrollbarWidth: 'thin',
            scrollbarColor: '#4A4A4A #2C2C2C'
        }
    },
        // Two-Phase Loading Overlay
        (isLoading || isStabilizing) && React.createElement('div', { 
            className: 'loading-overlay',
            style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(44, 44, 44, 0.95)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50
            }
        },
            React.createElement('div', { style: { textAlign: 'center' } },
                React.createElement('div', { 
                    className: 'loading-spinner',
                    style: {
                        width: '2rem',
                        height: '2rem',
                        border: '2px solid transparent',
                        borderTop: `2px solid ${GRAPH_CONFIG.colors.people}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 0.75rem auto'
                    }
                }),
                React.createElement('p', { 
                    style: { 
                        color: GRAPH_CONFIG.colors.foreground,
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        margin: 0
                    }
                }, isStabilizing ? 'Stabilizing Graph Layout' : 'Loading Knowledge Graph'),
                React.createElement('p', { 
                    style: { 
                        color: GRAPH_CONFIG.colors.muted,
                        fontSize: '0.75rem',
                        margin: '0.25rem 0 0 0'
                    }
                }, isStabilizing 
                    ? `Optimizing node positions... ${Math.round((stabilizationSteps.current / maxStabilizationSteps) * 100)}%`
                    : 'Initializing nodes and connections...'
                ),
                isStabilizing && React.createElement('div', { 
                    style: {
                        width: '8rem',
                        height: '0.25rem',
                        backgroundColor: '#4A4A4A',
                        borderRadius: '0.125rem',
                        margin: '0.5rem auto 0 auto',
                        overflow: 'hidden'
                    }
                },
                    React.createElement('div', { 
                        style: {
                            height: '100%',
                            backgroundColor: GRAPH_CONFIG.colors.people,
                            borderRadius: '0.125rem',
                            transition: 'width 0.1s',
                            width: `${(stabilizationSteps.current / maxStabilizationSteps) * 100}%`
                        }
                    })
                )
            )
        ),
        // Graph Header
        React.createElement('div', { className: 'graph-header' },
            React.createElement('h2', { className: 'graph-title' }, 'Knowledge Graph'),
            React.createElement('p', { className: 'graph-subtitle' }, 'AI-Enhanced Node-Link Visualization'),
            React.createElement('div', { className: 'graph-legend' },
                React.createElement('div', { className: 'legend-item' },
                    React.createElement('div', { 
                        className: 'legend-dot',
                        style: { backgroundColor: GRAPH_CONFIG.colors.people }
                    }),
                    React.createElement('span', { className: 'legend-text' }, 'People')
                ),
                React.createElement('div', { className: 'legend-item' },
                    React.createElement('div', { 
                        className: 'legend-dot',
                        style: { backgroundColor: GRAPH_CONFIG.colors.events }
                    }),
                    React.createElement('span', { className: 'legend-text' }, 'Events')
                ),
                React.createElement('div', { className: 'legend-item' },
                    React.createElement('div', { 
                        className: 'legend-dot',
                        style: { backgroundColor: GRAPH_CONFIG.colors.places }
                    }),
                    React.createElement('span', { className: 'legend-text' }, 'Places')
                ),
                React.createElement('div', { className: 'legend-item' },
                    React.createElement('div', { 
                        className: 'legend-dot',
                        style: { backgroundColor: GRAPH_CONFIG.colors.organizations }
                    }),
                    React.createElement('span', { className: 'legend-text' }, 'Organizations')
                ),
                React.createElement('div', { className: 'legend-item' },
                    React.createElement('div', { 
                        className: 'legend-dot',
                        style: { backgroundColor: GRAPH_CONFIG.colors.concepts }
                    }),
                    React.createElement('span', { className: 'legend-text' }, 'Concepts')
                ),
                React.createElement('div', { className: 'legend-item' },
                    React.createElement('div', { 
                        className: 'legend-dot',
                        style: { backgroundColor: GRAPH_CONFIG.colors.technology }
                    }),
                    React.createElement('span', { className: 'legend-text' }, 'Technology')
                )
            )
        ),
        
        // Graph Info
        React.createElement('div', { className: 'graph-info' },
            `${graphData?.nodes?.length || 0} nodes, ${graphData?.links?.length || 0} links`
        ),
        
        // SVG Graph
        React.createElement('svg', {
            ref: svgRef,
            className: 'graph-svg',
            width: dimensions.width,
            height: dimensions.height,
            viewBox: `0 0 ${dimensions.width} ${dimensions.height}`,
            style: { 
                display: 'block',
                border: '1px solid red' // Temporary border to see SVG bounds
            }
        }),
        
        // Node Details Panel
        selectedNode && React.createElement('div', { className: 'node-details' },
            React.createElement('div', { className: 'node-details-header' },
                React.createElement('div', { className: 'node-details-title' },
                    React.createElement('div', { 
                        className: 'node-details-dot',
                        style: { 
                            backgroundColor: selectedNode.aiCategory === 'PERSON' ? GRAPH_CONFIG.colors.people :
                                           selectedNode.aiCategory === 'ORG' ? GRAPH_CONFIG.colors.events :
                                           selectedNode.aiCategory === 'LOCATION' ? GRAPH_CONFIG.colors.places :
                                           selectedNode.type === 'entity' ? GRAPH_CONFIG.colors.people :
                                           selectedNode.type === 'keyword' ? GRAPH_CONFIG.colors.events :
                                           GRAPH_CONFIG.colors.accent
                        }
                    }),
                    React.createElement('h3', null, selectedNode.label)
                ),
                React.createElement('button', {
                    onClick: () => onNodeSelect(null),
                    className: 'close'
                }, '×')
            ),
            React.createElement('div', { className: 'node-details-description' },
                selectedNode.aiInsights && selectedNode.aiInsights.length > 0 
                    ? selectedNode.aiInsights.join('. ')
                    : `Type: ${selectedNode.type}, Category: ${selectedNode.aiCategory}`
            ),
            React.createElement('div', { className: 'node-details-type' },
                `${selectedNode.aiCategory} • ${(selectedNode.aiConfidence * 100).toFixed(0)}% confidence`
            )
        )
    );
}

// Main App Component
function App() {
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [geminiProcessor, setGeminiProcessor] = useState(null);
    const [aiEnabled, setAiEnabled] = useState(false);
    const [results, setResults] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState('');
    const [loadTimes, setLoadTimes] = useState({});

    // Initialize Gemini Nano Processor and demo data
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
        
        // Initialize with demo data
        console.log('🔍 Initializing with demo data...');
        const demoData = {
            nodes: [
                { id: 'demo1', label: 'Demo Person', aiCategory: 'PERSON', type: 'entity' },
                { id: 'demo2', label: 'Demo Organization', aiCategory: 'ORG', type: 'entity' },
                { id: 'demo3', label: 'Demo Location', aiCategory: 'LOCATION', type: 'entity' },
                { id: 'demo4', label: 'Demo Concept', aiCategory: 'CONCEPT', type: 'keyword' }
            ],
            links: [
                { source: 'demo1', target: 'demo2', animated: true },
                { source: 'demo2', target: 'demo3', animated: false },
                { source: 'demo3', target: 'demo4', animated: true }
            ]
        };
        setGraphData(demoData);
    }, []);

    // Display functions
    const displayNodeLinkGraph = (data) => {
        console.log('📊 displayNodeLinkGraph called with:', data);
        setResults({
            type: 'nodeLinkGraph',
            data: data,
            summary: `Graph with ${data.nodes?.length || 0} nodes and ${data.links?.length || 0} links`
        });
        console.log('🔄 Setting graphData state...');
        setGraphData(data);
        console.log('✅ graphData state set');
    };

    const displayFlaskResults = (flaskData) => {
        setResults({
            type: 'flaskNLP',
            data: flaskData,
            summary: `${flaskData.entities?.length || 0} entities, ${flaskData.keywords?.length || 0} keywords, ${flaskData.relationships?.length || 0} relationships`
        });
    };

    const handleNodeSelect = (node) => {
        setSelectedNode(node);
    };

    const processText = async () => {
        if (!inputText.trim()) return;
        
        setIsProcessing(true);
        setResults(null);
        setGraphData(null);
        setSelectedNode(null);
        setProgress(0);
        setCurrentStep('Initializing...');
        setLoadTimes({});
        
        const startTime = performance.now();
        console.log('🚀 Starting text processing...');
        
        try {
            // Step 1: Flask NLP preprocessing
            setCurrentStep('Step 1: Flask NLP Preprocessing...');
            setProgress(10);
            console.log('📊 Step 1: Running Flask NLP preprocessing...');
            
            const flaskStartTime = performance.now();
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
            const flaskEndTime = performance.now();
            const flaskLoadTime = (flaskEndTime - flaskStartTime).toFixed(2);
            
            setLoadTimes(prev => ({ ...prev, flaskNLP: `${flaskLoadTime}ms` }));
            setProgress(50);
            console.log(`✅ Flask NLP completed in ${flaskLoadTime}ms`);
            console.log('Flask NLP Results:', flaskResults);
            
            // Step 2: Gemini conversion to NodeLinkGraph format
            let nodeLinkGraph = null;
            let geminiLoadTime = null;
            if (aiEnabled && geminiProcessor && geminiProcessor.isInitialized) {
                try {
                    setCurrentStep('Step 2: Gemini AI Processing...');
                    setProgress(70);
                    console.log('🤖 Step 2: Converting to NodeLinkGraph format with Gemini...');
                    
                    const geminiStartTime = performance.now();
                    const aiResults = await geminiProcessor.enhanceNLPResults(
                        flaskResults, 
                        inputText
                    );
                    const geminiEndTime = performance.now();
                    geminiLoadTime = (geminiEndTime - geminiStartTime).toFixed(2);
                    
                    setLoadTimes(prev => ({ ...prev, geminiAI: `${geminiLoadTime}ms` }));
                    setProgress(90);
                    console.log(`✅ Gemini AI completed in ${geminiLoadTime}ms`);
                    console.log('Gemini NodeLinkGraph Results:', aiResults);
                    
                    if (aiResults.enhanced && aiResults.nodeLinkGraph) {
                        nodeLinkGraph = aiResults.nodeLinkGraph;
                        console.log('✅ NodeLinkGraph conversion successful!');
                        console.log('📊 Graph Data Structure:', {
                            hasNodes: !!nodeLinkGraph.nodes,
                            hasLinks: !!nodeLinkGraph.links,
                            nodeCount: nodeLinkGraph.nodes?.length || 0,
                            linkCount: nodeLinkGraph.links?.length || 0,
                            nodeSample: nodeLinkGraph.nodes?.slice(0, 2),
                            linkSample: nodeLinkGraph.links?.slice(0, 2)
                        });
                        console.log('📊 Full Graph Data:', JSON.stringify(nodeLinkGraph, null, 2));
                    } else {
                        console.log('⚠️ NodeLinkGraph conversion failed:', {
                            enhanced: aiResults.enhanced,
                            hasNodeLinkGraph: !!aiResults.nodeLinkGraph,
                            error: aiResults.error
                        });
                    }
                } catch (error) {
                    console.warn('❌ NodeLinkGraph conversion failed:', error);
                }
            } else {
                console.log('⚠️ AI not enabled or not available, using Flask NLP only');
            }
            
            // Step 3: Display results
            setCurrentStep('Step 3: Rendering Results...');
            setProgress(95);
            
            const totalEndTime = performance.now();
            const totalLoadTime = (totalEndTime - startTime).toFixed(2);
            setLoadTimes(prev => ({ ...prev, total: `${totalLoadTime}ms` }));
            
            console.log('🎯 Final Processing Results:', {
                originalText: inputText,
                flaskNLP: flaskResults,
                nodeLinkGraph: nodeLinkGraph,
                processingMethod: aiEnabled && geminiProcessor?.isInitialized ? 'Flask NLP + Gemini NodeLinkGraph' : 'Flask NLP Only',
                loadTimes: {
                    flaskNLP: `${flaskLoadTime}ms`,
                    geminiAI: geminiLoadTime ? `${geminiLoadTime}ms` : 'N/A',
                    total: `${totalLoadTime}ms`
                }
            });
            
            // Display NodeLinkGraph JSON in the UI
            if (nodeLinkGraph) {
                console.log('🎯 Setting graphData:', nodeLinkGraph);
                displayNodeLinkGraph(nodeLinkGraph);
            } else {
                console.log('⚠️ No nodeLinkGraph, displaying Flask results only');
                displayFlaskResults(flaskResults);
            }
            
            setProgress(100);
            setCurrentStep('Complete!');
            
        } catch (error) {
            console.error('❌ Processing failed:', error);
            setCurrentStep('Error occurred');
            setProgress(0);
        } finally {
            setTimeout(() => {
                setIsProcessing(false);
                setCurrentStep('');
                setProgress(0);
            }, 1000);
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
        
        // Progress Bar (only show when processing)
        isProcessing && React.createElement('div', { className: 'progress-section' },
            React.createElement('h3', { className: 'progress-title' }, 'Processing Progress'),
            React.createElement('div', { className: 'progress-bar-container' },
                React.createElement('div', { 
                    className: 'progress-bar',
                    style: { width: `${progress}%` }
                }),
                React.createElement('div', { className: 'progress-text' }, `${progress}%`)
            ),
            React.createElement('div', { className: 'current-step' }, currentStep),
            Object.keys(loadTimes).length > 0 && React.createElement('div', { className: 'load-times' },
                React.createElement('h4', null, 'Load Times:'),
                Object.entries(loadTimes).map(([key, time]) =>
                    React.createElement('div', { key: key, className: 'load-time-item' },
                        React.createElement('span', { className: 'load-time-label' }, `${key}:`),
                        React.createElement('span', { className: 'load-time-value' }, time)
                    )
                )
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
            React.createElement('div', { className: 'results-data' },
                React.createElement('pre', { className: 'json-display' },
                    JSON.stringify(results.data, null, 2)
                )
            )
        ),
        
        // Graph Visualization Section
        graphData && React.createElement('div', { className: 'results-section graph-section' },
            React.createElement('h3', { className: 'results-title' }, 'Knowledge Graph Visualization'),
            React.createElement('div', { style: { padding: '1rem', backgroundColor: '#2C2C2C', borderRadius: '0.5rem', marginBottom: '1rem' } },
                React.createElement('p', { style: { color: '#B39CD0', fontSize: '0.875rem', margin: 0 } }, 
                    `Graph Data: ${graphData?.nodes?.length || 0} nodes, ${graphData?.links?.length || 0} links`
                )
            ),
            React.createElement(GraphVisualization, {
                graphData: graphData,
                onNodeSelect: handleNodeSelect,
                selectedNode: selectedNode
            })
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
