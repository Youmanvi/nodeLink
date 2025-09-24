/**
 * Type Definitions for Graph Components
 * Centralized type definitions for better maintainability
 */

export interface Node {
  id: string;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  type: string;
  description: string;
}

export interface AIEnhancedNode extends Node {
  aiConfidence?: number;
  aiCategory?: string;
  aiInsights?: string[];
  sourceText?: string;
  importance?: number;
  category?: string;
}

export interface Link {
  source: string;
  target: string;
  animated?: boolean;
}

export interface AIEnhancedLink extends Link {
  strength?: number;
  aiDetected?: boolean;
  description?: string;
  context?: string;
}

export interface GraphData {
  nodes: AIEnhancedNode[];
  links: AIEnhancedLink[];
}

export interface NodeLinkGraphProps {
  data?: GraphData | null;
  geminiProcessor?: any;
}

export interface TextProcessorProps {
  onGraphUpdate: (nodes: Node[], links: Link[]) => void;
  geminiProcessor: any;
}

export interface BasicNLPResults {
  entities: Array<{text: string, label: string, confidence: number}>;
  keywords: Array<{word: string, importance: number}>;
  relationships: Array<{source: string, target: string, type: string, strength?: number}>;
}
