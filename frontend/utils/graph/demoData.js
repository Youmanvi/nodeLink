/**
 * Demo Data Generator
 * Provides sample data for the knowledge graph
 */

import { getDynamicColor, getDynamicType } from './colorUtils.js';

export const generateDemoData = () => {
  const rawNodes = [
    // People
    { id: '1', label: 'Richard Nixon', shortLabel: 'Nixon', x: 200, y: 200, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'PERSON', label: 'Richard Nixon' }), type: getDynamicType({ aiCategory: 'PERSON' }), description: 'Former President of the United States, served from 1969 to 1974.' },
    { id: '3', label: 'John F. Kennedy', shortLabel: 'JFK', x: 300, y: 150, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'PERSON', label: 'John F. Kennedy' }), type: getDynamicType({ aiCategory: 'PERSON' }), description: '35th President of the United States, served from 1961 to 1963.' },
    { id: '6', label: 'Lyndon Johnson', shortLabel: 'LBJ', x: 250, y: 400, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'PERSON', label: 'Lyndon Johnson' }), type: getDynamicType({ aiCategory: 'PERSON' }), description: '36th President of the United States, served from 1963 to 1969.' },
    
    // Events
    { id: '2', label: 'Watergate Scandal', shortLabel: 'Watergate', x: 180, y: 100, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'EVENT', label: 'Watergate Scandal' }), type: getDynamicType({ aiCategory: 'EVENT' }), description: 'Political scandal that led to Nixon\'s resignation in 1974.' },
    { id: '4', label: 'Cold War', shortLabel: 'Cold War', x: 100, y: 250, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'EVENT', label: 'Cold War' }), type: getDynamicType({ aiCategory: 'EVENT' }), description: 'Period of geopolitical tension between the US and Soviet Union.' },
    { id: '5', label: 'Vietnam War', shortLabel: 'Vietnam', x: 150, y: 350, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'EVENT', label: 'Vietnam War' }), type: getDynamicType({ aiCategory: 'EVENT' }), description: 'Conflict in Vietnam from 1955 to 1975.' },
    { id: '7', label: 'Civil Rights Movement', shortLabel: 'Rights', x: 350, y: 300, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'EVENT', label: 'Civil Rights Movement' }), type: getDynamicType({ aiCategory: 'EVENT' }), description: 'Movement for racial equality in the United States.' },
    { id: '9', label: 'Apollo Program', shortLabel: 'Apollo', x: 380, y: 150, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'EVENT', label: 'Apollo Program' }), type: getDynamicType({ aiCategory: 'EVENT' }), description: 'Space program that landed humans on the Moon.' },
    { id: '16', label: 'Pentagon Papers', shortLabel: 'Papers', x: 220, y: 600, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'EVENT', label: 'Pentagon Papers' }), type: getDynamicType({ aiCategory: 'EVENT' }), description: 'Classified documents about Vietnam War.' },
    
    // Places
    { id: '8', label: 'NASA Headquarters', shortLabel: 'NASA', x: 320, y: 200, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'NASA Headquarters' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'National Aeronautics and Space Administration headquarters.' },
    { id: '10', label: 'Supreme Court', shortLabel: 'Court', x: 280, y: 500, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'Supreme Court' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'Highest judicial authority in the United States.' },
    { id: '11', label: 'US Congress', shortLabel: 'Congress', x: 200, y: 50, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'US Congress' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'Legislative branch of the US government.' },
    { id: '12', label: 'Soviet Union', shortLabel: 'USSR', x: 50, y: 200, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'Soviet Union' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'Former communist state and Cold War adversary.' },
    { id: '13', label: 'Media Centers', shortLabel: 'Media', x: 100, y: 400, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'Media Centers' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'Press and broadcasting institutions.' },
    { id: '14', label: 'Public Square', shortLabel: 'Public', x: 80, y: 320, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'Public Square' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'Center of public opinion and discourse.' },
    { id: '15', label: 'Wall Street', shortLabel: 'Economy', x: 350, y: 450, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'Wall Street' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'Financial center and economic hub.' },
    { id: '17', label: 'United Nations', shortLabel: 'UN', x: 150, y: 700, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'United Nations' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'International diplomatic headquarters.' },
    { id: '18', label: 'Silicon Valley', shortLabel: 'Tech', x: 300, y: 650, vx: 0, vy: 0, color: getDynamicColor({ aiCategory: 'LOCATION', label: 'Silicon Valley' }), type: getDynamicType({ aiCategory: 'LOCATION' }), description: 'Center of technological advancement and innovation.' }
  ];

  const links = [
    { source: '1', target: '2', animated: true },
    { source: '1', target: '5', animated: true },
    { source: '1', target: '4', animated: false },
    { source: '3', target: '8', animated: true },
    { source: '3', target: '7', animated: false },
    { source: '6', target: '5', animated: true },
    { source: '6', target: '7', animated: true },
    { source: '8', target: '9', animated: true },
    { source: '2', target: '13', animated: false },
    { source: '2', target: '14', animated: false },
    { source: '4', target: '12', animated: false },
    { source: '5', target: '13', animated: false },
    { source: '7', target: '10', animated: false },
    { source: '11', target: '3', animated: false },
    { source: '11', target: '1', animated: false },
    { source: '14', target: '13', animated: false },
    { source: '15', target: '1', animated: false },
    { source: '15', target: '6', animated: false },
    { source: '10', target: '15', animated: false },
    { source: '16', target: '5', animated: true },
    { source: '16', target: '13', animated: false },
    { source: '17', target: '1', animated: false },
    { source: '17', target: '4', animated: false },
    { source: '18', target: '8', animated: true },
    { source: '18', target: '9', animated: false }
  ];

  return { nodes: rawNodes, links };
};
