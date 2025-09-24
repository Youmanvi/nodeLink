/**
 * Main NodeLinkGraph Component
 * Orchestrates all graph visualization components
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GRAPH_CONFIG } from '../config/graphConfig.js';
import { ForceSimulation } from '../utils/graph/forceSimulation.js';
import { generateDemoData } from '../utils/graph/demoData.js';
import { getDynamicColor, getDynamicType } from '../utils/graph/colorUtils.js';

// Import components
import { SVGDefinitions } from './graph/SVGDefinitions.jsx';
import { LinkRenderer } from './graph/LinkRenderer.jsx';
import { NodeRenderer } from './graph/NodeRenderer.jsx';
import { LoadingOverlay } from './ui/LoadingOverlay.jsx';
import { GraphHeader } from './ui/GraphHeader.jsx';
import { NodeDetailPanel } from './ui/NodeDetailPanel.jsx';

const NodeLinkGraph = ({ data: externalData }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 1200 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [data, setData] = useState({ nodes: [], links: [] });
  const forceSimulation = useRef(null);

  // Initialize graph data with stabilization
  useEffect(() => {
    const initializeGraph = async () => {
      if (dimensions.width === 0 || dimensions.height === 0) {
        return;
      }

      setIsLoading(true);

      // Brief initial delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Use external data if provided, otherwise use default demo data
      let rawNodes, links;

      if (externalData && externalData.nodes.length > 0) {
        // Process external data with dynamic colors and types
        rawNodes = externalData.nodes.map((node, index) => {
          const x = node.x || (Math.random() * (dimensions.width - 200) + 100);
          const y = node.y || (Math.random() * (dimensions.height - 200) + 100);
          
          return {
            ...node,
            id: node.id || `node_${index}`,
            label: node.label || 'Unknown',
            shortLabel: node.shortLabel || (node.label && node.label.length > 15 ? node.label.substring(0, 15) + "..." : node.label) || 'Unknown',
            x,
            y,
            vx: 0,
            vy: 0,
            color: getDynamicColor(node),
            type: getDynamicType(node),
            description: node.description || node.aiInsights?.join('. ') || `Type: ${node.type || 'unknown'}`
          };
        });
        links = externalData.links || [];
      } else {
        // Use demo data
        const demoData = generateDemoData();
        rawNodes = demoData.nodes;
        links = demoData.links;
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

      // Initialize force simulation
      forceSimulation.current = new ForceSimulation(centeredNodes, links, dimensions);
      forceSimulation.current.startStabilization();
      setIsStabilizing(true);
    };

    if (dimensions.width > 0 && dimensions.height > 0) {
      initializeGraph();
    }
  }, [dimensions.width, dimensions.height, externalData]);

  // Force simulation with stabilization tracking
  useEffect(() => {
    if (!forceSimulation.current || data.nodes.length === 0) return;
    
    const animate = () => {
      const newNodes = forceSimulation.current.update();
      
      setData(prevData => ({ ...prevData, nodes: newNodes }));
      
      // Check if stabilization is complete
      if (forceSimulation.current.isStabilized() && isStabilizing) {
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
    };

    const interval = setInterval(animate, GRAPH_CONFIG.layout.animationInterval);
    return () => clearInterval(interval);
  }, [data.nodes.length, isStabilizing, dimensions.width, dimensions.height]);

  // Handle window resize and initial sizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const height = Math.max(GRAPH_CONFIG.layout.containerHeight, 25 * GRAPH_CONFIG.layout.nodeSpacing);
        setDimensions({ width: rect.width, height });
      }
    };

    const initializeDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          const height = Math.max(GRAPH_CONFIG.layout.containerHeight, 25 * GRAPH_CONFIG.layout.nodeSpacing);
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

  const getConnectedNodes = useCallback((nodeId) => {
    const connected = new Set();
    data.links.forEach(link => {
      if (link.source === nodeId) connected.add(link.target);
      if (link.target === nodeId) connected.add(link.source);
    });
    return connected;
  }, [data.links]);

  const handleNodeHover = (nodeId) => {
    setHoveredNode(nodeId);
  };

  const handleNodeClick = (nodeId) => {
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
      <LoadingOverlay 
        isLoading={isLoading}
        isStabilizing={isStabilizing}
        stabilizationSteps={forceSimulation.current?.stabilizationSteps || 0}
        maxStabilizationSteps={120}
      />
      
      <GraphHeader />
      
      <svg
        ref={svgRef}
        width="100%"
        height={dimensions.height}
        className={`block transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      >
        <SVGDefinitions />
        
        <LinkRenderer 
          links={data.links}
          nodes={data.nodes}
          hoveredNode={hoveredNode}
        />
        
        <NodeRenderer 
          nodes={data.nodes}
          hoveredNode={hoveredNode}
          selectedNode={selectedNode}
          getConnectedNodes={getConnectedNodes}
          handleNodeHover={handleNodeHover}
          handleNodeClick={handleNodeClick}
        />
      </svg>

      <NodeDetailPanel 
        selectedNodeData={selectedNodeData}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
};

export default NodeLinkGraph;
