import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

// Global Configuration - Easy to modify
const GRAPH_CONFIG = {
  // Color Palette (Muted Pastels)
  colors: {
    background: '#2C2C2C',
    foreground: '#E4E4E4',
    border: '#4A4A4A',
    accent: '#3A3A3A',
    muted: '#B8B8B8',
    people: '#B39CD0',      // Lavender
    events: '#FFC1CC',      // Soft Pink
    places: '#A8DADC',      // Light Cyan
    linkDefault: '#B8B8B8',
    linkHighlight: '#E4E4E4',
    animatedParticle: '#B39CD0'
  },
  
  // Node Configuration
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
  
  // Link Configuration
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
  
  // Layout Configuration
  layout: {
    sidebarWidth: 'w-80',
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
  
  // UI Configuration
  ui: {
    headerHeight: 'p-4',
    panelPadding: 'p-3',
    borderRadius: 'rounded-lg',
    backdropBlur: 'backdrop-blur-sm',
    legendGap: 'gap-4',
    legendSize: 'w-2 h-2'
  },
  
  // Animation Configuration
  animation: {
    glowStdDeviation: 4,
    linkGlowStdDeviation: 1.5,
    transitionDuration: 'transition-colors'
  }
};

interface Node {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  type: 'people' | 'events' | 'places';
  description: string;
}

interface AIEnhancedNode extends Node {
  aiConfidence?: number;
  aiCategory?: string;
  aiInsights?: string[];
  sourceText?: string;
}

interface Link {
  source: string;
  target: string;
  animated?: boolean;
}

interface AIEnhancedLink extends Link {
  strength?: number;
  aiDetected?: boolean;
  description?: string;
  context?: string;
}

interface GraphData {
  nodes: AIEnhancedNode[];
  links: AIEnhancedLink[];
}

interface NodeLinkGraphProps {
  data?: GraphData | null;
  geminiProcessor?: any;
}

const NodeLinkGraph: React.FC<NodeLinkGraphProps> = ({ data: externalData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 1200 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const stabilizationSteps = useRef(0);
  const maxStabilizationSteps = 120; // About 6 seconds at 50ms intervals
  const [data, setData] = useState<GraphData>({
    nodes: [],
    links: []
  });

  // Initialize graph data with stabilization
  useEffect(() => {
    const initializeGraph = async () => {
      if (dimensions.width === 0 || dimensions.height === 0) {
        return;
      }

      setIsLoading(true);
      stabilizationSteps.current = 0;

      // Brief initial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use external data if provided, otherwise use default demo data
      let rawNodes: AIEnhancedNode[];
      let links: AIEnhancedLink[];

      if (externalData && externalData.nodes.length > 0) {
        rawNodes = externalData.nodes;
        links = externalData.links;
      } else {
        // Default demo data
        rawNodes = [
        // People
        { id: '1', label: 'Richard Nixon', shortLabel: 'Nixon', x: 200, y: 200, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.people, type: 'people', description: 'Former President of the United States, served from 1969 to 1974.' },
        { id: '3', label: 'John F. Kennedy', shortLabel: 'JFK', x: 300, y: 150, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.people, type: 'people', description: '35th President of the United States, served from 1961 to 1963.' },
        { id: '6', label: 'Lyndon Johnson', shortLabel: 'LBJ', x: 250, y: 400, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.people, type: 'people', description: '36th President of the United States, served from 1963 to 1969.' },
        
        // Events
        { id: '2', label: 'Watergate Scandal', shortLabel: 'Watergate', x: 180, y: 100, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.events, type: 'events', description: 'Political scandal that led to Nixon\'s resignation in 1974.' },
        { id: '4', label: 'Cold War', shortLabel: 'Cold War', x: 100, y: 250, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.events, type: 'events', description: 'Period of geopolitical tension between the US and Soviet Union.' },
        { id: '5', label: 'Vietnam War', shortLabel: 'Vietnam', x: 150, y: 350, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.events, type: 'events', description: 'Conflict in Vietnam from 1955 to 1975.' },
        { id: '7', label: 'Civil Rights Movement', shortLabel: 'Rights', x: 350, y: 300, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.events, type: 'events', description: 'Movement for racial equality in the United States.' },
        { id: '9', label: 'Apollo Program', shortLabel: 'Apollo', x: 380, y: 150, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.events, type: 'events', description: 'Space program that landed humans on the Moon.' },
        { id: '16', label: 'Pentagon Papers', shortLabel: 'Papers', x: 220, y: 600, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.events, type: 'events', description: 'Classified documents about Vietnam War.' },
        
        // Places
        { id: '8', label: 'NASA Headquarters', shortLabel: 'NASA', x: 320, y: 200, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'National Aeronautics and Space Administration headquarters.' },
        { id: '10', label: 'Supreme Court', shortLabel: 'Court', x: 280, y: 500, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'Highest judicial authority in the United States.' },
        { id: '11', label: 'US Congress', shortLabel: 'Congress', x: 200, y: 50, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'Legislative branch of the US government.' },
        { id: '12', label: 'Soviet Union', shortLabel: 'USSR', x: 50, y: 200, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'Former communist state and Cold War adversary.' },
        { id: '13', label: 'Media Centers', shortLabel: 'Media', x: 100, y: 400, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'Press and broadcasting institutions.' },
        { id: '14', label: 'Public Square', shortLabel: 'Public', x: 80, y: 320, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'Center of public opinion and discourse.' },
        { id: '15', label: 'Wall Street', shortLabel: 'Economy', x: 350, y: 450, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'Financial center and economic hub.' },
        { id: '17', label: 'United Nations', shortLabel: 'UN', x: 150, y: 700, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'International diplomatic headquarters.' },
        { id: '18', label: 'Silicon Valley', shortLabel: 'Tech', x: 300, y: 650, vx: 0, vy: 0, color: GRAPH_CONFIG.colors.places, type: 'places', description: 'Center of technological advancement and innovation.' }
        ];

        links = [
        { source: '1', target: '2', animated: true },
        { source: '1', target: '5', animated: true },
        { source: '1', target: '4', animated: false },
        { source: '3', target: '8', animated: true },
        { source: '3', target: '7', animated: false },
        { source: '6', target: '5', animated: true },
        { source: '6', target: '7', animated: true },
        { source: '8', target: '9', animated: true },
        { source: '2', target: '13', animated: false },
        { source: '2', target: '14', animated: false },
        { source: '4', target: '12', animated: false },
        { source: '5', target: '13', animated: false },
        { source: '7', target: '10', animated: false },
        { source: '11', target: '3', animated: false },
        { source: '11', target: '1', animated: false },
        { source: '14', target: '13', animated: false },
        { source: '15', target: '1', animated: false },
        { source: '15', target: '6', animated: false },
        { source: '10', target: '15', animated: false },
        { source: '16', target: '5', animated: true },
        { source: '16', target: '13', animated: false },
        { source: '17', target: '1', animated: false },
        { source: '17', target: '4', animated: false },
        { source: '18', target: '8', animated: true },
        { source: '18', target: '9', animated: false }
        ];
      }

      // Calculate initial center and apply offset
      const centerX = rawNodes.reduce((sum, node) => sum + node.x, 0) / rawNodes.length;
      const centerY = rawNodes.reduce((sum, node) => sum + node.y, 0) / rawNodes.length;
      const targetX = dimensions.width / 2;
      const targetY = dimensions.height / 2;
      const offsetX = targetX - centerX;
      const offsetY = targetY - centerY;
      
      const centeredNodes = rawNodes.map(node => ({
        ...node,
        x: node.x + offsetX,
        y: node.y + offsetY
      }));

      // Set data and begin stabilization
      setData({
        nodes: centeredNodes,
        links: links
      });

      setIsStabilizing(true);
    };

    if (dimensions.width > 0 && dimensions.height > 0) {
      initializeGraph();
    }
  }, [dimensions.width, dimensions.height, externalData]);

  // Force simulation with stabilization tracking
  useEffect(() => {
    if (data.nodes.length === 0 || dimensions.width === 0 || dimensions.height === 0) return;
    
    const animate = () => {
      setData(prevData => {
        if (prevData.nodes.length === 0) return prevData;
        
        const newNodes = prevData.nodes.map(node => {
          let fx = 0, fy = 0;
          
          // Repulsion from other nodes
          prevData.nodes.forEach(other => {
            if (other.id !== node.id) {
              const dx = node.x - other.x;
              const dy = node.y - other.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 0 && distance < GRAPH_CONFIG.layout.repulsionDistance) {
                const force = GRAPH_CONFIG.layout.repulsionForce / (distance * distance);
                fx += (dx / distance) * force;
                fy += (dy / distance) * force;
              }
            }
          });

          // Attraction to connected nodes
          prevData.links.forEach(link => {
            if (link.source === node.id || link.target === node.id) {
              const otherId = link.source === node.id ? link.target : link.source;
              const other = prevData.nodes.find(n => n.id === otherId);
              if (other) {
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const idealDistance = GRAPH_CONFIG.layout.idealDistance;
                if (distance > idealDistance) {
                  const force = GRAPH_CONFIG.layout.attractionForce * (distance - idealDistance);
                  fx += (dx / distance) * force;
                  fy += (dy / distance) * force;
                }
              }
            }
          });

          // Center attraction
          const centerX = dimensions.width / 2;
          const centerY = dimensions.height / 2;
          fx += (centerX - node.x) * GRAPH_CONFIG.layout.centerForce;
          fy += (centerY - node.y) * GRAPH_CONFIG.layout.centerForce;

          // Update velocity and position
          const newVx = (node.vx + fx) * GRAPH_CONFIG.layout.damping;
          const newVy = (node.vy + fy) * GRAPH_CONFIG.layout.damping;
          
          return {
            ...node,
            vx: newVx,
            vy: newVy,
            x: Math.max(GRAPH_CONFIG.layout.nodePadding, Math.min(dimensions.width - GRAPH_CONFIG.layout.nodePadding, node.x + newVx)),
            y: Math.max(GRAPH_CONFIG.layout.nodePadding, Math.min(dimensions.height - GRAPH_CONFIG.layout.nodePadding, node.y + newVy))
          };
        });

        // Check stabilization progress
        if (isStabilizing) {
          stabilizationSteps.current++;
          
          if (stabilizationSteps.current >= maxStabilizationSteps) {
            setIsStabilizing(false);
            setIsLoading(false);
            
            // Auto-scroll to center of graph after stabilization
            setTimeout(() => {
              if (containerRef.current && newNodes.length > 0) {
                const avgY = newNodes.reduce((sum, node) => sum + node.y, 0) / newNodes.length;
                const scrollTop = Math.max(0, avgY - (window.innerHeight / 2));
                containerRef.current.scrollTo({
                  top: scrollTop,
                  behavior: 'smooth'
                });
              }
            }, 100);
          }
        }

        return { ...prevData, nodes: newNodes };
      });
    };

    const interval = setInterval(animate, GRAPH_CONFIG.layout.animationInterval);
    return () => clearInterval(interval);
  }, [data.nodes.length, isStabilizing, dimensions.width, dimensions.height]);

  // Handle window resize and initial sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const height = Math.max(GRAPH_CONFIG.layout.containerHeight, 19 * GRAPH_CONFIG.layout.nodeSpacing);
        setDimensions({ width: rect.width, height });
      }
    };

    // Ensure we get the correct initial dimensions
    const initializeDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          const height = Math.max(GRAPH_CONFIG.layout.containerHeight, 19 * GRAPH_CONFIG.layout.nodeSpacing);
          setDimensions({ width: rect.width, height });
        } else {
          // Retry if container not ready
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

  const getConnectedNodes = useCallback((nodeId: string) => {
    const connected = new Set<string>();
    data.links.forEach(link => {
      if (link.source === nodeId) connected.add(link.target);
      if (link.target === nodeId) connected.add(link.source);
    });
    return connected;
  }, [data.links]);

  const handleNodeHover = (nodeId: string | null) => {
    setHoveredNode(nodeId);
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const selectedNodeData = selectedNode ? data.nodes.find(n => n.id === selectedNode) : null;

  return (
    <div 
      ref={containerRef}
      className={`relative ${GRAPH_CONFIG.layout.sidebarWidth} h-screen overflow-y-auto hide-scrollbar`}
      style={{ 
        backgroundColor: GRAPH_CONFIG.colors.background,
        borderRight: `1px solid ${GRAPH_CONFIG.colors.border}`
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center"
             style={{ 
               backgroundColor: `${GRAPH_CONFIG.colors.background}95`,
               backdropFilter: 'blur(8px)'
             }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent border-t-current mx-auto mb-3"
                 style={{ color: GRAPH_CONFIG.colors.people }}>
            </div>
            <p style={{ color: GRAPH_CONFIG.colors.foreground }} className="text-sm font-medium">
              {isStabilizing ? 'Stabilizing Graph Layout' : 'Loading Knowledge Graph'}
            </p>
            <p style={{ color: GRAPH_CONFIG.colors.muted }} className="text-xs mt-1">
              {isStabilizing 
                ? `Optimizing node positions... ${Math.round((stabilizationSteps.current / maxStabilizationSteps) * 100)}%`
                : 'Initializing nodes and connections...'
              }
            </p>
            {isStabilizing && (
              <div className="w-32 h-1 bg-gray-600 rounded-full mx-auto mt-2 overflow-hidden">
                <div 
                  className="h-full bg-current rounded-full transition-all duration-100"
                  style={{ 
                    width: `${(stabilizationSteps.current / maxStabilizationSteps) * 100}%`,
                    color: GRAPH_CONFIG.colors.people
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>
      )}
      <div 
        className={`sticky top-0 z-10 ${GRAPH_CONFIG.ui.backdropBlur} border-b ${GRAPH_CONFIG.ui.headerHeight}`}
        style={{ 
          backgroundColor: `${GRAPH_CONFIG.colors.background}90`,
          borderBottom: `1px solid ${GRAPH_CONFIG.colors.border}`
        }}
      >
        <h2 style={{ color: GRAPH_CONFIG.colors.foreground }} className="font-medium">Knowledge Graph</h2>
        <p style={{ color: GRAPH_CONFIG.colors.muted }} className="text-sm mt-1">
          People, Events & Places
        </p>
        <div className={`flex ${GRAPH_CONFIG.ui.legendGap} mt-2 text-xs`}>
          <div className="flex items-center gap-1">
            <div 
              className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
              style={{ backgroundColor: GRAPH_CONFIG.colors.people }}
            ></div>
            <span style={{ color: GRAPH_CONFIG.colors.muted }}>People</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
              style={{ backgroundColor: GRAPH_CONFIG.colors.events }}
            ></div>
            <span style={{ color: GRAPH_CONFIG.colors.muted }}>Events</span>
          </div>
          <div className="flex items-center gap-1">
            <div 
              className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
              style={{ backgroundColor: GRAPH_CONFIG.colors.places }}
            ></div>
            <span style={{ color: GRAPH_CONFIG.colors.muted }}>Places</span>
          </div>
        </div>
      </div>
      <svg
        ref={svgRef}
        width="100%"
        height={dimensions.height}
        className={`block transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Gradient definitions */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={GRAPH_CONFIG.animation.glowStdDeviation} result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="linkGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={GRAPH_CONFIG.animation.linkGlowStdDeviation} result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" 
            refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={GRAPH_CONFIG.colors.foreground} opacity="0.7" />
          </marker>
        </defs>

        {/* Render links */}
        {data.links.map((link, index) => {
          const sourceNode = data.nodes.find(n => n.id === link.source);
          const targetNode = data.nodes.find(n => n.id === link.target);
          
          if (!sourceNode || !targetNode) return null;

          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * GRAPH_CONFIG.links.curvature;
          
          const isHighlighted = hoveredNode && 
            (link.source === hoveredNode || link.target === hoveredNode);

          return (
            <g key={`${link.source}-${link.target}`}>
              <path
                d={`M${sourceNode.x},${sourceNode.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`}
                stroke={isHighlighted ? GRAPH_CONFIG.colors.linkHighlight : GRAPH_CONFIG.colors.linkDefault}
                strokeWidth={isHighlighted ? GRAPH_CONFIG.links.highlightWidth : GRAPH_CONFIG.links.defaultWidth}
                fill="none"
                filter="url(#linkGlow)"
                markerEnd={link.animated ? "url(#arrowhead)" : "none"}
                opacity={hoveredNode && !isHighlighted ? GRAPH_CONFIG.links.dimmedOpacity : (isHighlighted ? GRAPH_CONFIG.links.highlightOpacity : GRAPH_CONFIG.links.defaultOpacity)}
              />
              {link.animated && (
                <circle r={GRAPH_CONFIG.links.particleRadius} fill={GRAPH_CONFIG.colors.animatedParticle}>
                  <animateMotion dur={GRAPH_CONFIG.links.animationDuration} repeatCount="indefinite">
                    <mpath href={`#path-${index}`} />
                  </animateMotion>
                </circle>
              )}
              <path
                id={`path-${index}`}
                d={`M${sourceNode.x},${sourceNode.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`}
                fill="none"
                opacity="0"
              />
            </g>
          );
        })}

        {/* Render nodes */}
        {data.nodes.map(node => {
          const isHovered = hoveredNode === node.id;
          const isConnected = hoveredNode && getConnectedNodes(hoveredNode).has(node.id);
          const isSelected = selectedNode === node.id;
          const shouldDim = hoveredNode && !isHovered && !isConnected && hoveredNode !== node.id;

          return (
            <g key={node.id}>
              {/* Node glow effect */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? GRAPH_CONFIG.nodes.hoverGlowRadius : GRAPH_CONFIG.nodes.glowRadius}
                fill={node.color}
                opacity={shouldDim ? 0.1 : (isHovered || isConnected ? 0.6 : 0.4)}
                filter="url(#glow)"
              />
              {/* Main node background */}
              <circle
                cx={node.x}
                cy={node.y}
                r={GRAPH_CONFIG.nodes.baseRadius}
                fill={node.color}
                stroke={isSelected ? GRAPH_CONFIG.colors.foreground : node.color}
                strokeWidth={isSelected ? GRAPH_CONFIG.nodes.selectedStrokeWidth : GRAPH_CONFIG.nodes.strokeWidth}
                opacity={shouldDim ? 0.3 : (isHovered || isConnected ? 1 : 0.85)}
                className="cursor-pointer"
                onMouseEnter={() => handleNodeHover(node.id)}
                onMouseLeave={() => handleNodeHover(null)}
                onClick={() => handleNodeClick(node.id)}
              />
              {/* Node inner circle for better contrast */}
              <circle
                cx={node.x}
                cy={node.y}
                r={GRAPH_CONFIG.nodes.innerRadius}
                fill={`${GRAPH_CONFIG.colors.background}1A`}
                opacity={shouldDim ? 0.3 : 1}
                className="pointer-events-none"
              />
              {/* Node label inside circle */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={GRAPH_CONFIG.colors.background}
                fontSize={GRAPH_CONFIG.nodes.fontSize}
                fontFamily="Inter, sans-serif"
                fontWeight={GRAPH_CONFIG.nodes.fontWeight}
                opacity={shouldDim ? 0.4 : 1}
                className="pointer-events-none select-none"
              >
                {node.shortLabel}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Detail Panel */}
      {selectedNodeData && (
        <div 
          className={`absolute inset-x-4 bottom-4 ${GRAPH_CONFIG.ui.backdropBlur} ${GRAPH_CONFIG.ui.borderRadius} ${GRAPH_CONFIG.ui.panelPadding} shadow-lg`}
          style={{ 
            backgroundColor: `${GRAPH_CONFIG.colors.accent}95`,
            border: `1px solid ${GRAPH_CONFIG.colors.border}`
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedNodeData.color }}
              ></div>
              <h3 style={{ color: GRAPH_CONFIG.colors.foreground }} className="font-medium">{selectedNodeData.label}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className={GRAPH_CONFIG.animation.transitionDuration}
              style={{ color: GRAPH_CONFIG.colors.muted }}
              onMouseEnter={(e) => e.currentTarget.style.color = GRAPH_CONFIG.colors.foreground}
              onMouseLeave={(e) => e.currentTarget.style.color = GRAPH_CONFIG.colors.muted}
            >
              <X size={14} />
            </button>
          </div>
          <p style={{ color: GRAPH_CONFIG.colors.muted }} className="text-sm leading-relaxed">
            {selectedNodeData.description}
          </p>
          
          {/* AI Enhancement Information */}
          {(selectedNodeData as AIEnhancedNode).aiConfidence && (
            <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${GRAPH_CONFIG.colors.border}` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span style={{ color: GRAPH_CONFIG.colors.foreground }} className="text-xs font-medium">
                  AI Enhanced
                </span>
                <span style={{ color: GRAPH_CONFIG.colors.muted }} className="text-xs">
                  ({(selectedNodeData as AIEnhancedNode).aiConfidence! * 100}% confidence)
                </span>
              </div>
              {(selectedNodeData as AIEnhancedNode).aiInsights && (
                <div className="space-y-1">
                  {(selectedNodeData as AIEnhancedNode).aiInsights!.map((insight, index) => (
                    <p key={index} style={{ color: GRAPH_CONFIG.colors.muted }} className="text-xs">
                      • {insight}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${GRAPH_CONFIG.colors.border}` }}>
            <span 
              style={{ color: `${GRAPH_CONFIG.colors.muted}70` }} 
              className="text-xs uppercase tracking-wide"
            >
              {selectedNodeData.type}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeLinkGraph;