/**
 * Link Renderer Component
 * Handles rendering of graph links/edges
 */

import { GRAPH_CONFIG } from '../../config/graphConfig.js';

export const LinkRenderer = ({ links, nodes, hoveredNode }) => {
  return (
    <>
      {links.map((link, index) => {
        const sourceNode = nodes.find(n => n.id === link.source);
        const targetNode = nodes.find(n => n.id === link.target);
        
        if (!sourceNode || !targetNode) return null;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dr = Math.sqrt(dx * dx + dy * dy) * GRAPH_CONFIG.links.curvature;
        
        const isHighlighted = hoveredNode && 
          (link.source === hoveredNode || link.target === hoveredNode);

        return (
          <g key={`${link.source}-${link.target}`}>
            {/* Enhanced link path with gradient */}
            <path
              d={`M${sourceNode.x},${sourceNode.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`}
              stroke={link.animated ? "url(#animatedLinkGradient)" : (isHighlighted ? GRAPH_CONFIG.colors.linkHighlight : "url(#linkGradient)")}
              strokeWidth={isHighlighted ? GRAPH_CONFIG.links.highlightWidth : GRAPH_CONFIG.links.defaultWidth}
              fill="none"
              filter="url(#linkGlow)"
              markerEnd={link.animated ? "url(#arrowhead)" : "none"}
              opacity={hoveredNode && !isHighlighted ? GRAPH_CONFIG.links.dimmedOpacity : (isHighlighted ? GRAPH_CONFIG.links.highlightOpacity : GRAPH_CONFIG.links.defaultOpacity)}
              className={`${GRAPH_CONFIG.animation.transitionDuration}`}
              style={{
                strokeDasharray: link.animated ? "5,3" : "none",
                animation: link.animated ? `linkFlow ${GRAPH_CONFIG.animation.linkFlowDuration} linear infinite` : "none"
              }}
            />
            
            {/* Enhanced animated particles */}
            {link.animated && (
              <>
                <circle r={GRAPH_CONFIG.links.particleRadius} fill={GRAPH_CONFIG.colors.animatedParticle}>
                  <animateMotion dur={GRAPH_CONFIG.links.animationDuration} repeatCount="indefinite">
                    <mpath href={`#path-${index}`} />
                  </animateMotion>
                </circle>
                <circle r={GRAPH_CONFIG.links.particleRadius * 0.6} fill={GRAPH_CONFIG.colors.linkHighlight} opacity="0.7">
                  <animateMotion dur={`${parseFloat(GRAPH_CONFIG.links.animationDuration) * 1.5}s`} repeatCount="indefinite">
                    <mpath href={`#path-${index}`} />
                  </animateMotion>
                </circle>
              </>
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
    </>
  );
};
