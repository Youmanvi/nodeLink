/**
 * Loading Overlay Component
 * Shows loading state with progress indicator
 */

import { GRAPH_CONFIG } from '../../config/graphConfig.js';

export const LoadingOverlay = ({ isLoading, isStabilizing, stabilizationSteps, maxStabilizationSteps }) => {
  if (!isLoading) return null;

  return (
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
            ? `Optimizing node positions... ${Math.round((stabilizationSteps / maxStabilizationSteps) * 100)}%`
            : 'Initializing nodes and connections...'
          }
        </p>
        {isStabilizing && (
          <div className="w-32 h-1 bg-gray-600 rounded-full mx-auto mt-2 overflow-hidden">
            <div 
              className="h-full bg-current rounded-full transition-all duration-100"
              style={{ 
                width: `${(stabilizationSteps / maxStabilizationSteps) * 100}%`,
                color: GRAPH_CONFIG.colors.people
              }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};
