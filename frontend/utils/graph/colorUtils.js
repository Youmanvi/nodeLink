/**
 * Color and Type Assignment Utilities
 * Handles dynamic color and type assignment for graph nodes
 */

import { GRAPH_CONFIG } from '../config/graphConfig.js';

// Dynamic color assignment function with random selection from predefined palette
export const getDynamicColor = (node: any): string => {
  // Predefined color palette for random selection
  const colorPalette = [
    GRAPH_CONFIG.colors.people,       // Lavender
    GRAPH_CONFIG.colors.events,       // Soft Pink  
    GRAPH_CONFIG.colors.places,       // Light Cyan
    GRAPH_CONFIG.colors.organizations, // Yellow
    GRAPH_CONFIG.colors.concepts,     // Green
    GRAPH_CONFIG.colors.dates,        // Teal
    GRAPH_CONFIG.colors.money,        // Light Red
    GRAPH_CONFIG.colors.quantities,   // Light Blue
    GRAPH_CONFIG.colors.technology,   // Orange
    GRAPH_CONFIG.colors.science,      // Coral
    GRAPH_CONFIG.colors.politics,     // Purple
    GRAPH_CONFIG.colors.culture,      // Dark Orange
    GRAPH_CONFIG.colors.health,       // Turquoise
    GRAPH_CONFIG.colors.education     // Blue
  ];

  // Create a consistent seed based on node properties for deterministic randomness
  const nodeIdentifier = `${node.id || node.label || 'default'}_${node.type || 'unknown'}`;
  
  // Use a simple hash function to create a pseudo-random but consistent index
  let hash = 0;
  for (let i = 0; i < nodeIdentifier.length; i++) {
    hash = ((hash << 5) - hash + nodeIdentifier.charCodeAt(i)) & 0xffffffff;
  }
  
  // Convert hash to a more random-like distribution
  const randomIndex = Math.abs(hash) % colorPalette.length;
  
  return colorPalette[randomIndex];
};

// Dynamic type assignment function with random selection
export const getDynamicType = (node: any): string => {
  // Predefined type palette for random selection
  const typePalette = [
    'people',
    'events', 
    'places',
    'organizations',
    'concepts',
    'dates',
    'money',
    'quantities',
    'technology',
    'science',
    'politics',
    'culture',
    'health',
    'education'
  ];

  // Create a consistent seed based on node properties for deterministic randomness
  const nodeIdentifier = `${node.id || node.label || 'default'}_type_${node.type || 'unknown'}`;
  
  // Use a simple hash function to create a pseudo-random but consistent index
  let hash = 0;
  for (let i = 0; i < nodeIdentifier.length; i++) {
    hash = ((hash << 5) - hash + nodeIdentifier.charCodeAt(i)) & 0xffffffff;
  }
  
  // Convert hash to a more random-like distribution
  const randomIndex = Math.abs(hash) % typePalette.length;
  
  return typePalette[randomIndex];
};
