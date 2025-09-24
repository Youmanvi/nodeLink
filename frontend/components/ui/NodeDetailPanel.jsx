/**
 * Node Detail Panel Component
 * Shows detailed information about selected nodes
 */

import React from 'react';
import { X } from 'lucide-react';
import { GRAPH_CONFIG } from '../../config/graphConfig.js';

export const NodeDetailPanel = ({ selectedNodeData, onClose }) => {
  if (!selectedNodeData) return null;

  return (
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
          onClick={onClose}
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
      {selectedNodeData.aiConfidence && (
        <div className="mt-3 pt-2" style={{ borderTop: `1px solid ${GRAPH_CONFIG.colors.border}` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span style={{ color: GRAPH_CONFIG.colors.foreground }} className="text-xs font-medium">
              AI Enhanced
            </span>
            <span style={{ color: GRAPH_CONFIG.colors.muted }} className="text-xs">
              ({selectedNodeData.aiConfidence * 100}% confidence)
            </span>
          </div>
          {selectedNodeData.aiInsights && (
            <div className="space-y-1">
              {selectedNodeData.aiInsights.map((insight, index) => (
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
  );
};
