/**
 * Node Renderer Component
 * Handles rendering of graph nodes
 */

import { GRAPH_CONFIG } from '../../config/graphConfig.js';

export const NodeRenderer = ({ 
  nodes, 
  hoveredNode, 
  selectedNode, 
  getConnectedNodes, 
  handleNodeHover, 
  handleNodeClick 
}) => {
  return (
    <>
      {nodes.map(node => {
        const isHovered = hoveredNode === node.id;
        const isConnected = hoveredNode && getConnectedNodes(hoveredNode).has(node.id);
        const isSelected = selectedNode === node.id;
        const shouldDim = hoveredNode && !isHovered && !isConnected && hoveredNode !== node.id;

        return (
          <g key={node.id}>
            {/* Enhanced outer glow effect */}
            <circle
              cx={node.x}
              cy={node.y}
              r={isHovered ? GRAPH_CONFIG.nodes.hoverGlowRadius + 8 : GRAPH_CONFIG.nodes.glowRadius + 4}
              fill={node.color}
              opacity={shouldDim ? 0.05 : (isHovered || isConnected ? 0.4 : 0.25)}
              filter="url(#glow)"
            />
            
            {/* Node glow effect */}
            <circle
              cx={node.x}
              cy={node.y}
              r={isHovered ? GRAPH_CONFIG.nodes.hoverGlowRadius : GRAPH_CONFIG.nodes.glowRadius}
              fill={node.color}
              opacity={shouldDim ? 0.1 : (isHovered || isConnected ? 0.7 : 0.5)}
              filter="url(#glow)"
            />
            
            {/* Main node background with enhanced styling */}
            <circle
              cx={node.x}
              cy={node.y}
              r={GRAPH_CONFIG.nodes.baseRadius}
              fill={node.color}
              stroke={isSelected ? GRAPH_CONFIG.colors.foreground : 'rgba(255,255,255,0.2)'}
              strokeWidth={isSelected ? GRAPH_CONFIG.nodes.selectedStrokeWidth : GRAPH_CONFIG.nodes.strokeWidth}
              opacity={shouldDim ? GRAPH_CONFIG.nodes.dimmedOpacity : (isHovered ? GRAPH_CONFIG.nodes.hoverOpacity : (isSelected ? GRAPH_CONFIG.nodes.selectedOpacity : GRAPH_CONFIG.nodes.opacity))}
              className={`cursor-pointer ${GRAPH_CONFIG.animation.transitionDuration}`}
              onMouseEnter={() => handleNodeHover(node.id)}
              onMouseLeave={() => handleNodeHover(null)}
              onClick={() => handleNodeClick(node.id)}
            />
            
            {/* Enhanced inner circle with gradient effect */}
            <circle
              cx={node.x}
              cy={node.y}
              r={GRAPH_CONFIG.nodes.innerRadius}
              fill={`${GRAPH_CONFIG.colors.background}20`}
              opacity={shouldDim ? 0.3 : (isHovered ? 0.8 : 0.6)}
              className="pointer-events-none"
            />
            
            {/* Node label with enhanced styling */}
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={GRAPH_CONFIG.colors.background}
              fontSize={GRAPH_CONFIG.nodes.fontSize}
              fontFamily="Inter, system-ui, sans-serif"
              fontWeight={GRAPH_CONFIG.nodes.fontWeight}
              opacity={shouldDim ? 0.4 : (isHovered ? 1 : 0.95)}
              className="pointer-events-none select-none"
              style={{
                textShadow: isHovered ? `0 0 4px ${node.color}40` : 'none',
                filter: isHovered ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none'
              }}
            >
              {node.shortLabel}
            </text>
            
            {/* Subtle pulse animation for selected nodes */}
            {isSelected && (
              <circle
                cx={node.x}
                cy={node.y}
                r={GRAPH_CONFIG.nodes.baseRadius + 4}
                fill="none"
                stroke={GRAPH_CONFIG.colors.foreground}
                strokeWidth="1"
                opacity="0.6"
                className="animate-pulse"
              />
            )}
          </g>
        );
      })}
    </>
  );
};
