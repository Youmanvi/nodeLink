import React, { useState } from 'react';
import { performBasicNLP } from '../utils/basicNLP';
import { convertToGraphData } from '../utils/graphConverter';

// Global Configuration - matches NodeLinkGraph
const GRAPH_CONFIG = {
  colors: {
    background: '#2C2C2C',
    foreground: '#E4E4E4',
    border: '#4A4A4A',
    accent: '#3A3A3A',
    muted: '#B8B8B8',
    people: '#B39CD0',      // Lavender
    events: '#FFC1CC',      // Soft Pink
    places: '#A8DADC',       // Light Cyan
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

interface Link {
  source: string;
  target: string;
  animated?: boolean;
}

interface TextProcessorProps {
  onGraphUpdate: (nodes: Node[], links: Link[]) => void;
  geminiProcessor: any;
}

const TextProcessor: React.FC<TextProcessorProps> = ({ 
  onGraphUpdate, 
  geminiProcessor 
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);

  const processText = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Basic NLP processing (we'll implement this next)
      const basicNLP = await performBasicNLP(inputText);
      
      // AI Enhancement if available
      let enhancedResults = basicNLP;
      if (aiEnabled && geminiProcessor && geminiProcessor.isInitialized) {
        try {
          const aiResults = await geminiProcessor.enhanceNLPResults(
            basicNLP, 
            inputText
          );
          if (aiResults.enhanced) {
            enhancedResults = aiResults;
          }
        } catch (error) {
          console.warn('AI enhancement failed, using basic results:', error);
        }
      }
      
      // Convert to graph format
      const { nodes, links } = convertToGraphData(enhancedResults);
      
      // Update the graph
      onGraphUpdate(nodes, links);
      
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: GRAPH_CONFIG.colors.foreground }}>
          Input Text for Analysis
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to analyze and visualize as a knowledge graph..."
          className="w-full h-32 p-3 border rounded-lg resize-none"
          style={{
            backgroundColor: GRAPH_CONFIG.colors.accent,
            borderColor: GRAPH_CONFIG.colors.border,
            color: GRAPH_CONFIG.colors.foreground
          }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            disabled={!geminiProcessor || !geminiProcessor.isSupported}
            className="rounded"
          />
          <span className="text-sm" style={{ color: GRAPH_CONFIG.colors.muted }}>
            AI Enhancement {(!geminiProcessor || !geminiProcessor.isSupported) && '(Not Available)'}
          </span>
        </label>
        
        <button
          onClick={processText}
          disabled={isProcessing || !inputText.trim()}
          className="px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          style={{
            backgroundColor: GRAPH_CONFIG.colors.people,
            color: GRAPH_CONFIG.colors.background
          }}
        >
          {isProcessing ? 'Processing...' : 'Analyze Text'}
        </button>
      </div>
      
      {/* Example text suggestions */}
      <div className="mt-4">
        <p className="text-sm mb-2" style={{ color: GRAPH_CONFIG.colors.muted }}>
          Try these examples:
        </p>
        <div className="space-y-2">
          <button
            onClick={() => setInputText("President John F. Kennedy established the Apollo Program in 1961 to land Americans on the Moon. NASA Headquarters coordinated the massive effort, which involved thousands of engineers and scientists. The program succeeded in 1969 when Apollo 11 landed on the Moon during the Cold War tensions with the Soviet Union.")}
            className="text-left text-xs p-2 rounded border w-full hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: GRAPH_CONFIG.colors.accent,
              borderColor: GRAPH_CONFIG.colors.border,
              color: GRAPH_CONFIG.colors.muted
            }}
          >
            Historical Analysis: Apollo Program
          </button>
          <button
            onClick={() => setInputText("The discovery of DNA structure by Watson and Crick at Cambridge University revolutionized molecular biology. Their work built on X-ray crystallography research by Rosalind Franklin at King's College London. This breakthrough led to the development of genetic engineering and modern biotechnology.")}
            className="text-left text-xs p-2 rounded border w-full hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: GRAPH_CONFIG.colors.accent,
              borderColor: GRAPH_CONFIG.colors.border,
              color: GRAPH_CONFIG.colors.muted
            }}
          >
            Scientific Discovery: DNA Structure
          </button>
        </div>
      </div>
    </div>
  );
};


export default TextProcessor;
