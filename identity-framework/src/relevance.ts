/**
 * Relevance Realization System
 * 
 * Implements dynamic salience landscaping and multi-constraint optimization
 * for authentic relevance realization, as opposed to simple heuristic scoring.
 * 
 * Based on Vervaeke's framework for relevance realization as the core process
 * of cognition - not a problem that can be solved algorithmically, but an
 * optimization process balancing multiple competing constraints.
 */

import { Episode } from './types';

/**
 * Salience landscape - represents what stands out as relevant
 */
export interface SalienceLandscape {
  /** Focal attention - what's currently in spotlight */
  focus: SalienceNode[];
  
  /** Peripheral awareness - background context */
  peripheral: SalienceNode[];
  
  /** Total activation energy */
  totalActivation: number;
  
  /** Timestamp of last update */
  lastUpdate: number;
}

/**
 * Individual node in salience landscape
 */
export interface SalienceNode {
  /** Content identifier */
  id: string;
  
  /** Activation level (0-1) */
  activation: number;
  
  /** Connections to other nodes */
  connections: Map<string, number>;
  
  /** Source episode or concept */
  source: Episode | string;
}

/**
 * Opponent processes for relevance realization
 * Balancing competing cognitive demands
 */
export interface OpponentProcesses {
  /** Exploration vs. Exploitation */
  exploration: number; // 0 = pure exploitation, 1 = pure exploration
  
  /** Breadth vs. Depth */
  breadth: number; // 0 = deep focus, 1 = broad scanning
  
  /** Stability vs. Flexibility */
  stability: number; // 0 = maintain frame, 1 = shift frame
  
  /** Speed vs. Accuracy */
  speed: number; // 0 = slow careful, 1 = fast approximate
}

/**
 * Relevance realization configuration
 */
export interface RelevanceConfig {
  /** Base opponent process settings (personality-dependent) */
  opponentProcesses: OpponentProcesses;
  
  /** Learning rate for salience updates */
  learningRate: number;
  
  /** Decay rate for activation */
  decayRate: number;
  
  /** Threshold for focal attention */
  focusThreshold: number;
  
  /** Maximum nodes in focal attention */
  maxFocusSize: number;
}

/**
 * Relevance Realization Engine
 * 
 * Core component for optimizing what becomes salient and relevant.
 * Uses opponent processing and circular causality rather than fixed rules.
 */
export class RelevanceRealizationEngine {
  private landscape: SalienceLandscape;
  private config: RelevanceConfig;
  
  constructor(config?: Partial<RelevanceConfig>) {
    this.config = {
      opponentProcesses: {
        exploration: 0.5,
        breadth: 0.5,
        stability: 0.5,
        speed: 0.5
      },
      learningRate: 0.1,
      decayRate: 0.05,
      focusThreshold: 0.6,
      maxFocusSize: 5,
      ...config
    };
    
    this.landscape = {
      focus: [],
      peripheral: [],
      totalActivation: 0,
      lastUpdate: Date.now()
    };
  }
  
  /**
   * Update salience landscape based on new information
   * Implements circular causality: processing updates salience
   */
  updateLandscape(
    content: Episode | string,
    initialActivation: number = 0.5
  ): void {
    const now = Date.now();
    const timeDelta = (now - this.landscape.lastUpdate) / 1000; // seconds
    
    // Apply decay to existing nodes
    this.applyDecay(timeDelta);
    
    // Create or update node
    const nodeId = typeof content === 'string' ? content : content.id;
    let node = this.findNode(nodeId);
    
    if (!node) {
      node = {
        id: nodeId,
        activation: initialActivation,
        connections: new Map(),
        source: content
      };
      this.landscape.peripheral.push(node);
    } else {
      // Strengthen activation with learning rate
      node.activation = Math.min(1.0, 
        node.activation + this.config.learningRate * initialActivation
      );
    }
    
    // Update connections based on co-occurrence
    this.updateConnections(node);
    
    // Reorganize focal vs peripheral based on activation
    this.reorganizeLandscape();
    
    this.landscape.lastUpdate = now;
  }
  
  /**
   * Realize relevance for a query - what should be attended to?
   * Uses multi-constraint optimization, not simple scoring
   */
  realizeRelevance(
    query: string,
    context: string[],
    limit: number = 5
  ): SalienceNode[] {
    // Create temporary activation for query
    const queryActivation = this.computeQueryActivation(query, context);
    
    // Apply opponent processes to modulate selection
    const candidates = this.gatherCandidates(queryActivation);
    
    // Multi-constraint optimization
    const optimized = this.optimizeRelevance(candidates, {
      query,
      context,
      opponentProcesses: this.config.opponentProcesses
    });
    
    // Return top-k by optimized score
    return optimized.slice(0, limit);
  }
  
  /**
   * Adjust opponent processes based on personality or context
   */
  adjustOpponentProcesses(adjustments: Partial<OpponentProcesses>): void {
    this.config.opponentProcesses = {
      ...this.config.opponentProcesses,
      ...adjustments
    };
  }
  
  /**
   * Get current salience landscape for inspection
   */
  getLandscape(): SalienceLandscape {
    return { ...this.landscape };
  }
  
  /**
   * Reset landscape (useful for context switches)
   */
  reset(): void {
    this.landscape = {
      focus: [],
      peripheral: [],
      totalActivation: 0,
      lastUpdate: Date.now()
    };
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Apply temporal decay to activation levels
   */
  private applyDecay(timeDelta: number): void {
    const decayFactor = Math.exp(-this.config.decayRate * timeDelta);
    
    for (const node of [...this.landscape.focus, ...this.landscape.peripheral]) {
      node.activation *= decayFactor;
    }
  }
  
  /**
   * Find node in landscape by ID
   */
  private findNode(id: string): SalienceNode | undefined {
    return [...this.landscape.focus, ...this.landscape.peripheral]
      .find(n => n.id === id);
  }
  
  /**
   * Update connections between nodes (Hebbian learning: fire together, wire together)
   */
  private updateConnections(node: SalienceNode): void {
    for (const focusNode of this.landscape.focus) {
      if (focusNode.id === node.id) continue;
      
      const currentStrength = node.connections.get(focusNode.id) || 0;
      const newStrength = Math.min(1.0, 
        currentStrength + this.config.learningRate * focusNode.activation
      );
      
      node.connections.set(focusNode.id, newStrength);
      
      // Symmetric connection
      const reverseStrength = focusNode.connections.get(node.id) || 0;
      focusNode.connections.set(node.id, 
        Math.min(1.0, reverseStrength + this.config.learningRate * node.activation)
      );
    }
  }
  
  /**
   * Reorganize landscape: high activation -> focus, low -> peripheral
   */
  private reorganizeLandscape(): void {
    const allNodes = [...this.landscape.focus, ...this.landscape.peripheral];
    
    // Sort by activation
    allNodes.sort((a, b) => b.activation - a.activation);
    
    // Split by threshold and max focus size
    this.landscape.focus = allNodes
      .filter(n => n.activation >= this.config.focusThreshold)
      .slice(0, this.config.maxFocusSize);
    
    this.landscape.peripheral = allNodes
      .filter(n => !this.landscape.focus.includes(n));
    
    // Calculate total activation
    this.landscape.totalActivation = allNodes
      .reduce((sum, n) => sum + n.activation, 0);
  }
  
  /**
   * Compute query activation pattern
   */
  private computeQueryActivation(
    query: string,
    context: string[]
  ): Map<string, number> {
    const activation = new Map<string, number>();
    const queryWords = this.extractKeywords(query);
    const contextWords = context.flatMap(c => this.extractKeywords(c));
    
    // Direct query matches
    for (const node of [...this.landscape.focus, ...this.landscape.peripheral]) {
      let score = 0;
      const nodeContent = this.getNodeContent(node);
      
      // Keyword overlap with query
      for (const word of queryWords) {
        if (nodeContent.includes(word)) {
          score += 0.3;
        }
      }
      
      // Context relevance
      for (const word of contextWords) {
        if (nodeContent.includes(word)) {
          score += 0.1;
        }
      }
      
      // Spread activation through connections
      for (const [connectedId, strength] of node.connections) {
        const connectedNode = this.findNode(connectedId);
        if (connectedNode) {
          const connectedContent = this.getNodeContent(connectedNode);
          for (const word of queryWords) {
            if (connectedContent.includes(word)) {
              score += 0.2 * strength; // Weighted by connection strength
            }
          }
        }
      }
      
      if (score > 0) {
        activation.set(node.id, score);
      }
    }
    
    return activation;
  }
  
  /**
   * Gather candidate nodes with base activation
   */
  private gatherCandidates(queryActivation: Map<string, number>): Array<{
    node: SalienceNode;
    baseScore: number;
  }> {
    const candidates: Array<{ node: SalienceNode; baseScore: number }> = [];
    
    for (const node of [...this.landscape.focus, ...this.landscape.peripheral]) {
      const baseScore = queryActivation.get(node.id) || 0;
      if (baseScore > 0) {
        candidates.push({ node, baseScore });
      }
    }
    
    return candidates;
  }
  
  /**
   * Multi-constraint optimization of relevance
   * This is where opponent processes come into play
   */
  private optimizeRelevance(
    candidates: Array<{ node: SalienceNode; baseScore: number }>,
    params: {
      query: string;
      context: string[];
      opponentProcesses: OpponentProcesses;
    }
  ): SalienceNode[] {
    const { opponentProcesses } = params;
    
    // Score each candidate with multiple constraints
    const scored = candidates.map(({ node, baseScore }) => {
      let finalScore = baseScore;
      
      // EXPLORATION vs EXPLOITATION
      // High exploration: boost novel/less-activated nodes
      // High exploitation: boost already-active nodes
      const noveltyBoost = (1 - node.activation) * opponentProcesses.exploration;
      const exploitBoost = node.activation * (1 - opponentProcesses.exploration);
      finalScore += (noveltyBoost + exploitBoost) * 0.3;
      
      // BREADTH vs DEPTH
      // High breadth: prefer weakly connected (diverse)
      // High depth: prefer strongly connected (integrated)
      const connectionStrength = Array.from(node.connections.values())
        .reduce((sum, s) => sum + s, 0) / Math.max(1, node.connections.size);
      const breadthBoost = (1 - connectionStrength) * opponentProcesses.breadth;
      const depthBoost = connectionStrength * (1 - opponentProcesses.breadth);
      finalScore += (breadthBoost + depthBoost) * 0.2;
      
      // STABILITY vs FLEXIBILITY  
      // High stability: prefer focal attention nodes
      // High flexibility: allow peripheral nodes
      const isFocal = this.landscape.focus.includes(node) ? 1 : 0;
      const stabilityBoost = isFocal * (1 - opponentProcesses.stability);
      const flexibilityBoost = (1 - isFocal) * opponentProcesses.stability;
      finalScore += (stabilityBoost + flexibilityBoost) * 0.2;
      
      // SPEED vs ACCURACY
      // High speed: use cached activation more
      // High accuracy: recompute based on content
      const speedBoost = node.activation * opponentProcesses.speed;
      const accuracyBoost = baseScore * (1 - opponentProcesses.speed);
      finalScore += (speedBoost + accuracyBoost) * 0.3;
      
      return { node, finalScore };
    });
    
    // Sort by final optimized score
    scored.sort((a, b) => b.finalScore - a.finalScore);
    
    return scored.map(s => s.node);
  }
  
  /**
   * Extract keywords from text (simple tokenization)
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3); // Filter short words
  }
  
  /**
   * Get textual content from node for matching
   */
  private getNodeContent(node: SalienceNode): string {
    if (typeof node.source === 'string') {
      return node.source.toLowerCase();
    } else {
      // Episode source
      return `${node.source.event} ${node.source.game_context} ${node.source.outcome || ''}`.toLowerCase();
    }
  }
}

/**
 * Create relevance realization engine with personality-tuned opponent processes
 */
export function createRelevanceEngine(personality: {
  chaotic?: number;
  intelligence?: number;
  playfulness?: number;
}): RelevanceRealizationEngine {
  // Map personality traits to opponent processes
  const chaotic = personality.chaotic || 0.5;
  const intelligence = personality.intelligence || 0.5;
  const playfulness = personality.playfulness || 0.5;
  
  const opponentProcesses: OpponentProcesses = {
    // Chaotic -> higher exploration and flexibility
    exploration: 0.3 + chaotic * 0.4, // 0.3-0.7 range
    stability: 0.7 - chaotic * 0.4,   // 0.3-0.7 range (inverse)
    
    // Intelligence -> prefer depth and accuracy
    breadth: 0.7 - intelligence * 0.3, // 0.4-0.7 range (inverse)
    speed: 0.7 - intelligence * 0.3,   // 0.4-0.7 range (inverse, more accurate)
  };
  
  return new RelevanceRealizationEngine({
    opponentProcesses,
    learningRate: 0.1,
    decayRate: 0.05,
    focusThreshold: 0.6,
    maxFocusSize: 5
  });
}
