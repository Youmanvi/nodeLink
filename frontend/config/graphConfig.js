/**
 * Graph Configuration
 * Centralized configuration for the knowledge graph visualization
 */

export const GRAPH_CONFIG = {
  // Enhanced Color Palette with more entity types
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
  
  // Node Configuration
  nodes: {
    baseRadius: 28,
    glowRadius: 32,
    hoverGlowRadius: 40,
    innerRadius: 22,
    strokeWidth: 2,
    selectedStrokeWidth: 3,
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.85,
    hoverOpacity: 1.0,
    selectedOpacity: 1.0,
    dimmedOpacity: 0.3
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
    curvature: 0.3,
    gradientOpacity: 0.8
  },
  
  // Layout Configuration
  layout: {
    sidebarWidth: 'w-80',
    containerHeight: 1400,
    nodeSpacing: 120,
    repulsionForce: 3000,
    repulsionDistance: 280,
    attractionForce: 0.06,
    idealDistance: 250,
    centerForce: 0, // Disabled center attraction
    damping: 0.9,
    animationInterval: 50,
    nodePadding: 80
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
    glowStdDeviation: 6,
    linkGlowStdDeviation: 2,
    transitionDuration: 'transition-all duration-300',
    nodePulseDuration: '2s',
    linkFlowDuration: '3s'
  }
};

export default GRAPH_CONFIG;
