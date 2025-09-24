/**
 * Force Simulation Engine
 * Handles the physics simulation for node positioning
 */

import { GRAPH_CONFIG } from '../../config/graphConfig.js';

export class ForceSimulation {
  constructor(nodes, links, dimensions) {
    this.nodes = nodes;
    this.links = links;
    this.dimensions = dimensions;
    this.isStabilizing = false;
    this.stabilizationSteps = 0;
    this.maxStabilizationSteps = 120; // About 6 seconds at 50ms intervals
  }

  startStabilization() {
    this.isStabilizing = true;
    this.stabilizationSteps = 0;
  }

  update() {
    if (this.nodes.length === 0 || this.dimensions.width === 0 || this.dimensions.height === 0) {
      return this.nodes;
    }

    const newNodes = this.nodes.map(node => {
      let fx = 0, fy = 0;
      
      // Repulsion from other nodes
      this.nodes.forEach(other => {
        if (other.id !== node.id) {
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance > 0 && distance < GRAPH_CONFIG.layout.repulsionDistance) {
            const force = GRAPH_CONFIG.layout.repulsionForce / (distance * distance);
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        }
      });

      // Attraction to connected nodes
      this.links.forEach(link => {
        if (link.source === node.id || link.target === node.id) {
          const otherId = link.source === node.id ? link.target : link.source;
          const other = this.nodes.find(n => n.id === otherId);
          if (other) {
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const idealDistance = GRAPH_CONFIG.layout.idealDistance;
            if (distance > idealDistance) {
              const force = GRAPH_CONFIG.layout.attractionForce * (distance - idealDistance);
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          }
        }
      });

      // Update velocity and position
      const newVx = (node.vx + fx) * GRAPH_CONFIG.layout.damping;
      const newVy = (node.vy + fy) * GRAPH_CONFIG.layout.damping;
      
      return {
        ...node,
        vx: newVx,
        vy: newVy,
        x: Math.max(GRAPH_CONFIG.layout.nodePadding, Math.min(this.dimensions.width - GRAPH_CONFIG.layout.nodePadding, node.x + newVx)),
        y: Math.max(GRAPH_CONFIG.layout.nodePadding, Math.min(this.dimensions.height - GRAPH_CONFIG.layout.nodePadding, node.y + newVy))
      };
    });

    // Check stabilization progress
    if (this.isStabilizing) {
      this.stabilizationSteps++;
      
      if (this.stabilizationSteps >= this.maxStabilizationSteps) {
        this.isStabilizing = false;
      }
    }

    this.nodes = newNodes;
    return newNodes;
  }

  isStabilized() {
    return !this.isStabilizing;
  }

  getProgress() {
    return this.stabilizationSteps / this.maxStabilizationSteps;
  }
}
