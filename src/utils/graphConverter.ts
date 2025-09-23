/**
 * Graph Converter Utility
 * Converts NLP results to graph data format for visualization
 */

// Removed unused interface

interface AIEnhancedNode {
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
  aiConfidence?: number;
  aiCategory?: string;
  aiInsights?: string[];
  sourceText?: string;
}

interface AIEnhancedLink {
  source: string;
  target: string;
  animated?: boolean;
  strength?: number;
  aiDetected?: boolean;
  description?: string;
  context?: string;
}

export function convertToGraphData(nlpResults: any): {
  nodes: AIEnhancedNode[],
  links: AIEnhancedLink[]
} {
  const nodes: AIEnhancedNode[] = [];
  const links: AIEnhancedLink[] = [];
  const nodeMap = new Map<string, string>();
  
  // Process entities into nodes
  const entities = nlpResults.original?.entities || nlpResults.entities || [];
  
  entities.forEach((entity: any, index: number) => {
    const nodeId = `entity-${index}`;
    const nodeType = mapEntityToNodeType(entity.label);
    
    nodes.push({
      id: nodeId,
      label: entity.text,
      shortLabel: truncateLabel(entity.text),
      x: Math.random() * 400 + 100,
      y: Math.random() * 400 + 100,
      vx: 0,
      vy: 0,
      color: getNodeColor(nodeType),
      type: nodeType,
      description: entity.description || `${entity.label}: ${entity.text}`,
      aiConfidence: entity.confidence || 0.8,
      aiCategory: entity.label,
      sourceText: entity.context
    });
    
    nodeMap.set(entity.text.toLowerCase(), nodeId);
  });
  
  // Process AI-enhanced relationships
  if (nlpResults.geminiEnhanced?.relationships?.relationships) {
    nlpResults.geminiEnhanced.relationships.relationships.forEach(
      (rel: any) => {
        const sourceId = findNodeId(rel.source, nodeMap);
        const targetId = findNodeId(rel.target, nodeMap);
        
        if (sourceId && targetId) {
          links.push({
            source: sourceId,
            target: targetId,
            animated: rel.type === 'causal' || rel.type === 'temporal',
            strength: rel.strength || 0.5,
            aiDetected: true,
            description: rel.description,
            context: rel.context
          });
        }
      }
    );
  }
  
  // Process basic relationships as fallback
  const relationships = nlpResults.original?.relationships || nlpResults.relationships || [];
  relationships.forEach((rel: any) => {
    const sourceId = findNodeId(rel.source, nodeMap);
    const targetId = findNodeId(rel.target, nodeMap);
    
    if (sourceId && targetId) {
      // Avoid duplicates
      const exists = links.some(link => 
        (link.source === sourceId && link.target === targetId) ||
        (link.source === targetId && link.target === sourceId)
      );
      
      if (!exists) {
        links.push({
          source: sourceId,
          target: targetId,
          animated: rel.type === 'temporal' || rel.type === 'causal',
          strength: rel.strength || 0.3,
          aiDetected: false,
          description: `${rel.type} relationship`,
          context: `Detected from text analysis`
        });
      }
    }
  });
  
  // Add AI insights to nodes if available
  if (nlpResults.geminiEnhanced?.snippets?.snippets) {
    nlpResults.geminiEnhanced.snippets.snippets.forEach((snippet: any) => {
      snippet.entities?.forEach((entityText: string) => {
        const nodeId = findNodeId(entityText, nodeMap);
        if (nodeId) {
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            if (!node.aiInsights) node.aiInsights = [];
            node.aiInsights.push(snippet.text);
          }
        }
      });
    });
  }
  
  return { nodes, links };
}

function mapEntityToNodeType(label: string): 'people' | 'events' | 'places' {
  const peopleLabels = ['PERSON', 'PER', 'PEOPLE'];
  const eventLabels = ['EVENT', 'HAPPENING', 'OCCURRENCE'];
  
  if (peopleLabels.includes(label.toUpperCase())) return 'people';
  if (eventLabels.includes(label.toUpperCase())) return 'events';
  return 'places';
}

function getNodeColor(type: 'people' | 'events' | 'places'): string {
  const colors = {
    people: '#B39CD0',      // Lavender
    events: '#FFC1CC',      // Soft Pink
    places: '#A8DADC'       // Light Cyan
  };
  return colors[type];
}

function truncateLabel(text: string): string {
  if (text.length <= 10) return text;
  
  // Try to break at word boundaries
  const words = text.split(' ');
  if (words.length > 1) {
    let result = '';
    for (const word of words) {
      if (result.length + word.length + 1 <= 10) {
        result += (result ? ' ' : '') + word;
      } else {
        break;
      }
    }
    return result || text.substring(0, 10);
  }
  
  return text.substring(0, 10) + '...';
}

function findNodeId(text: string, nodeMap: Map<string, string>): string | null {
  // Try exact match first
  let nodeId = nodeMap.get(text.toLowerCase());
  if (nodeId) return nodeId;
  
  // Try partial matches
  for (const [key, value] of nodeMap.entries()) {
    if (key.includes(text.toLowerCase()) || text.toLowerCase().includes(key)) {
      return value;
    }
  }
  
  return null;
}

// Helper function to generate unique IDs
let nodeIdCounter = 0;
export function generateNodeId(): string {
  return `node-${++nodeIdCounter}`;
}

// Helper function to calculate optimal node positions
export function calculateNodePositions(nodes: AIEnhancedNode[], width: number, height: number): AIEnhancedNode[] {
  if (nodes.length === 0) return nodes;
  
  // Simple grid layout for small numbers of nodes
  if (nodes.length <= 6) {
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    return nodes.map((node, index) => ({
      ...node,
      x: (index % cols) * cellWidth + cellWidth / 2,
      y: Math.floor(index / cols) * cellHeight + cellHeight / 2
    }));
  }
  
  // Force-directed layout simulation for larger graphs
  return simulateForceDirectedLayout(nodes, width, height);
}

function simulateForceDirectedLayout(nodes: AIEnhancedNode[], width: number, height: number): AIEnhancedNode[] {
  const iterations = 100;
  const k = Math.sqrt((width * height) / nodes.length);
  const temperature = width / 10;
  
  // Initialize positions randomly
  let positions = nodes.map(node => ({
    ...node,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0,
    vy: 0
  }));
  
  for (let iter = 0; iter < iterations; iter++) {
    positions = positions.map(node => {
      let fx = 0, fy = 0;
      
      // Repulsion from other nodes
      positions.forEach(other => {
        if (other.id !== node.id) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (k * k) / distance;
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }
      });
      
      // Center attraction
      fx += (width / 2 - node.x) * 0.01;
      fy += (height / 2 - node.y) * 0.01;
      
      // Update velocity and position
      const newVx = (node.vx + fx) * 0.9;
      const newVy = (node.vy + fy) * 0.9;
      
      return {
        ...node,
        vx: newVx,
        vy: newVy,
        x: Math.max(50, Math.min(width - 50, node.x + newVx)),
        y: Math.max(50, Math.min(height - 50, node.y + newVy))
      };
    });
    
    // Cool down temperature
    const currentTemp = temperature * (1 - iter / iterations);
    positions = positions.map(node => ({
      ...node,
      vx: node.vx * currentTemp,
      vy: node.vy * currentTemp
    }));
  }
  
  return positions;
}
