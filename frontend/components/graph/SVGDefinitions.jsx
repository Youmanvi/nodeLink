/**
 * SVG Definitions Component
 * Handles SVG filters, gradients, and markers
 */

import { GRAPH_CONFIG } from '../../config/graphConfig.js';

export const SVGDefinitions = () => {
  return (
    <defs>
      {/* Glow filters */}
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
      
      <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.3)"/>
      </filter>
      
      {/* Gradient definitions for enhanced links */}
      <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={GRAPH_CONFIG.colors.linkDefault} stopOpacity={GRAPH_CONFIG.links.gradientOpacity} />
        <stop offset="100%" stopColor={GRAPH_CONFIG.colors.linkHighlight} stopOpacity={GRAPH_CONFIG.links.gradientOpacity} />
      </linearGradient>
      
      <linearGradient id="animatedLinkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor={GRAPH_CONFIG.colors.animatedParticle} stopOpacity="0.8" />
        <stop offset="50%" stopColor={GRAPH_CONFIG.colors.linkHighlight} stopOpacity="1.0" />
        <stop offset="100%" stopColor={GRAPH_CONFIG.colors.animatedParticle} stopOpacity="0.8" />
      </linearGradient>
      
      {/* Arrow marker */}
      <marker id="arrowhead" markerWidth="10" markerHeight="8" 
        refX="9" refY="4" orient="auto">
        <polygon points="0 0, 10 4, 0 8" fill={GRAPH_CONFIG.colors.foreground} opacity="0.8" />
      </marker>
    </defs>
  );
};
