/**
 * Graph Header Component
 * Shows graph title, legend, and basic information
 */

import { GRAPH_CONFIG } from '../../config/graphConfig.js';

export const GraphHeader = () => {
  return (
    <div 
      className={`sticky top-0 z-10 ${GRAPH_CONFIG.ui.backdropBlur} border-b ${GRAPH_CONFIG.ui.headerHeight}`}
      style={{ 
        backgroundColor: `${GRAPH_CONFIG.colors.background}90`,
        borderBottom: `1px solid ${GRAPH_CONFIG.colors.border}`
      }}
    >
      <h2 style={{ color: GRAPH_CONFIG.colors.foreground }} className="font-medium">Knowledge Graph</h2>
      <p style={{ color: GRAPH_CONFIG.colors.muted }} className="text-sm mt-1">
        People, Events & Places
      </p>
      <div className={`flex flex-wrap ${GRAPH_CONFIG.ui.legendGap} mt-2 text-xs`}>
        <div className="flex items-center gap-1">
          <div 
            className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
            style={{ backgroundColor: GRAPH_CONFIG.colors.people }}
          ></div>
          <span style={{ color: GRAPH_CONFIG.colors.muted }}>People</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
            style={{ backgroundColor: GRAPH_CONFIG.colors.events }}
          ></div>
          <span style={{ color: GRAPH_CONFIG.colors.muted }}>Events</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
            style={{ backgroundColor: GRAPH_CONFIG.colors.places }}
          ></div>
          <span style={{ color: GRAPH_CONFIG.colors.muted }}>Places</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
            style={{ backgroundColor: GRAPH_CONFIG.colors.organizations }}
          ></div>
          <span style={{ color: GRAPH_CONFIG.colors.muted }}>Organizations</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
            style={{ backgroundColor: GRAPH_CONFIG.colors.concepts }}
          ></div>
          <span style={{ color: GRAPH_CONFIG.colors.muted }}>Concepts</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className={`${GRAPH_CONFIG.ui.legendSize} rounded-full`}
            style={{ backgroundColor: GRAPH_CONFIG.colors.technology }}
          ></div>
          <span style={{ color: GRAPH_CONFIG.colors.muted }}>Technology</span>
        </div>
      </div>
    </div>
  );
};
