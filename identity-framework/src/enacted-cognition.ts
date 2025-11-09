/**
 * Enacted Cognition System
 * 
 * Implements action-perception loops and exploratory behavior based on
 * Vervaeke's 4E cognition - cognition is ENACTED through interaction
 * with the environment, not just passive representation.
 * 
 * Key principles:
 * - Sensorimotor contingencies: What you can do shapes what you perceive
 * - Active inference: Acting to gather information
 * - Exploratory behavior: Curiosity-driven interaction
 * - Action-perception loops: Circular causality
 * - Affordance detection: Perceiving action possibilities
 */

import { Action, GameState, Episode } from './types';
import { Frame } from './framing';

/**
 * Sensorimotor contingency - relationship between action and perceptual change
 */
export interface SensoriomotorContingency {
  /** Action performed */
  action: string;
  
  /** Expected perceptual change */
  expectedChange: string;
  
  /** Actual perceptual change observed */
  actualChange?: string;
  
  /** Reliability of this contingency (0-1) */
  reliability: number;
  
  /** Number of observations */
  observations: number;
  
  /** Last observed timestamp */
  lastObserved: number;
}

/**
 * Affordance - action possibility perceived in environment
 */
export interface Affordance {
  /** What can be done */
  action: string;
  
  /** What enables this affordance */
  enabler: string;
  
  /** Confidence this affordance is available (0-1) */
  confidence: number;
  
  /** Expected outcome if taken */
  expectedOutcome: string;
  
  /** Salience (how much it stands out) */
  salience: number;
}

/**
 * Exploratory drive - motivation to gather information
 */
export interface ExploratoryDrive {
  /** Curiosity level (0-1) */
  curiosity: number;
  
  /** Information gap detected */
  informationGap: string[];
  
  /** Exploration strategy */
  strategy: 'random' | 'systematic' | 'novelty-seeking' | 'uncertainty-reduction';
  
  /** Priority for exploration (0-1) */
  priority: number;
}

/**
 * Action-perception loop state
 */
export interface ActionPerceptionLoop {
  /** Current perception */
  perception: string;
  
  /** Actions available */
  actions: Action[];
  
  /** Action selected */
  selectedAction?: Action;
  
  /** Expected perceptual change */
  expectedChange?: string;
  
  /** Actual resulting perception */
  resultingPerception?: string;
  
  /** Prediction error (difference between expected and actual) */
  predictionError?: number;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Configuration for enacted cognition system
 */
export interface EnactedCognitionConfig {
  /** Learning rate for sensorimotor contingencies */
  contingencyLearningRate: number;
  
  /** Decay rate for unused contingencies */
  contingencyDecayRate: number;
  
  /** Threshold for reliable contingency */
  reliabilityThreshold: number;
  
  /** Exploration bonus for novelty */
  explorationBonus: number;
  
  /** Base curiosity level */
  baseCuriosity: number;
  
  /** Maximum contingencies to track */
  maxContingencies: number;
  
  /** Loop history size */
  loopHistorySize: number;
}

/**
 * Default configuration
 */
export const DEFAULT_ENACTED_CONFIG: EnactedCognitionConfig = {
  contingencyLearningRate: 0.2,
  contingencyDecayRate: 0.01,
  reliabilityThreshold: 0.6,
  explorationBonus: 0.3,
  baseCuriosity: 0.5,
  maxContingencies: 200,
  loopHistorySize: 50
};

/**
 * Enacted Cognition System
 * 
 * Manages action-perception loops and exploratory behavior for
 * active, embodied interaction with the environment.
 */
export class EnactedCognitionSystem {
  private contingencies: Map<string, SensoriomotorContingency>;
  private loopHistory: ActionPerceptionLoop[];
  private config: EnactedCognitionConfig;
  private currentLoop: ActionPerceptionLoop | null = null;
  
  constructor(config?: Partial<EnactedCognitionConfig>) {
    this.config = {
      ...DEFAULT_ENACTED_CONFIG,
      ...config
    };
    
    this.contingencies = new Map();
    this.loopHistory = [];
  }
  
  /**
   * Start a new action-perception loop
   */
  startLoop(gameState: GameState): ActionPerceptionLoop {
    this.currentLoop = {
      perception: gameState.description,
      actions: gameState.available_actions,
      timestamp: Date.now()
    };
    
    return { ...this.currentLoop };
  }
  
  /**
   * Select action with exploratory bias
   * Balances exploitation (known good actions) with exploration (learning)
   */
  selectActionWithExploration(
    actions: Action[],
    baseScores: Map<string, number>,
    exploratoryDrive: ExploratoryDrive
  ): {
    action: Action;
    isExploratory: boolean;
    reasoning: string;
  } {
    // Apply exploration bonus to actions
    const exploratoryScores = new Map<string, number>();
    
    for (const action of actions) {
      const baseScore = baseScores.get(action.name) || 0.5;
      let score = baseScore;
      
      // Check novelty (have we tried this before?)
      const contingency = this.contingencies.get(action.name);
      if (!contingency || contingency.observations < 2) {
        // Novel action - exploration bonus
        score += exploratoryDrive.curiosity * this.config.explorationBonus;
      }
      
      // Check uncertainty (low reliability = high uncertainty)
      if (contingency && contingency.reliability < this.config.reliabilityThreshold) {
        // Uncertain outcome - exploration bonus (smaller)
        score += exploratoryDrive.curiosity * this.config.explorationBonus * 0.5;
      }
      
      // Check if action might fill information gap
      const actionText = `${action.name} ${action.description}`.toLowerCase();
      for (const gap of exploratoryDrive.informationGap) {
        if (actionText.includes(gap.toLowerCase())) {
          score += this.config.explorationBonus * 0.7;
        }
      }
      
      exploratoryScores.set(action.name, score);
    }
    
    // Select highest scoring action
    let bestAction = actions[0];
    let bestScore = -Infinity;
    
    for (const action of actions) {
      const score = exploratoryScores.get(action.name) || 0;
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }
    
    // Determine if this was exploratory or exploitative
    const baseScore = baseScores.get(bestAction.name) || 0.5;
    const exploratoryBoostApplied = bestScore - baseScore;
    const isExploratory = exploratoryBoostApplied > 0.1;
    
    const reasoning = isExploratory ?
      `Exploratory action to gather information about ${bestAction.name}` :
      `Exploitative action based on known reliable outcome`;
    
    // Update current loop
    if (this.currentLoop) {
      this.currentLoop.selectedAction = bestAction;
      
      // Predict expected change based on contingency
      const contingency = this.contingencies.get(bestAction.name);
      if (contingency) {
        this.currentLoop.expectedChange = contingency.expectedChange;
      }
    }
    
    return {
      action: bestAction,
      isExploratory,
      reasoning
    };
  }
  
  /**
   * Close action-perception loop with observed outcome
   * This is where learning happens - comparing expectation to reality
   */
  closeLoop(
    resultState: GameState,
    outcome: string
  ): {
    predictionError: number;
    learnedContingency: boolean;
    surprise: number;
  } {
    if (!this.currentLoop || !this.currentLoop.selectedAction) {
      return {
        predictionError: 0,
        learnedContingency: false,
        surprise: 0
      };
    }
    
    // Complete the loop
    this.currentLoop.resultingPerception = resultState.description;
    
    const actualChange = this.computePerceptualChange(
      this.currentLoop.perception,
      resultState.description
    );
    
    // Calculate prediction error
    const predictionError = this.currentLoop.expectedChange ?
      this.computePredictionError(this.currentLoop.expectedChange, actualChange) :
      0.5;  // High error if no expectation
    
    this.currentLoop.predictionError = predictionError;
    
    // Update or create sensorimotor contingency
    const learnedContingency = this.updateContingency(
      this.currentLoop.selectedAction.name,
      actualChange,
      outcome,
      predictionError
    );
    
    // Store in history
    this.loopHistory.push({ ...this.currentLoop });
    if (this.loopHistory.length > this.config.loopHistorySize) {
      this.loopHistory.shift();
    }
    
    // Surprise is prediction error weighted by confidence
    const surprise = predictionError;
    
    // Clear current loop
    this.currentLoop = null;
    
    return {
      predictionError,
      learnedContingency,
      surprise
    };
  }
  
  /**
   * Detect affordances in current game state
   * Affordances are action possibilities that the environment offers
   */
  detectAffordances(
    gameState: GameState,
    activeFrames: Frame[]
  ): Affordance[] {
    const affordances: Affordance[] = [];
    
    const stateText = gameState.description.toLowerCase();
    
    for (const action of gameState.available_actions) {
      // Check if action is enabled by current state
      const enablers = this.findEnablers(action, stateText);
      
      if (enablers.length === 0) {
        continue;  // No enablers found, not a clear affordance
      }
      
      // Get expected outcome from contingency
      const contingency = this.contingencies.get(action.name);
      const expectedOutcome = contingency ? contingency.expectedChange : 'unknown';
      
      // Calculate salience based on frame alignment
      let salience = 0.5;
      for (const frame of activeFrames) {
        const actionText = `${action.name} ${action.description}`.toLowerCase();
        for (const frameAffordance of frame.affordances) {
          if (actionText.includes(frameAffordance.toLowerCase())) {
            salience += 0.3;
          }
        }
      }
      
      affordances.push({
        action: action.name,
        enabler: enablers[0],
        confidence: contingency ? contingency.reliability : 0.3,
        expectedOutcome,
        salience: Math.min(1.0, salience)
      });
    }
    
    // Sort by salience
    affordances.sort((a, b) => b.salience - a.salience);
    
    return affordances;
  }
  
  /**
   * Generate exploratory drive based on current knowledge state
   */
  generateExploratoryDrive(
    gameState: GameState,
    recentLoops: ActionPerceptionLoop[]
  ): ExploratoryDrive {
    // Base curiosity from config (can be personality-dependent)
    let curiosity = this.config.baseCuriosity;
    
    // Increase curiosity if recent loops had high prediction error
    if (recentLoops.length > 0) {
      const avgError = recentLoops
        .filter(l => l.predictionError !== undefined)
        .reduce((sum, l) => sum + l.predictionError!, 0) / recentLoops.length;
      
      if (avgError > 0.5) {
        curiosity += 0.2;  // High error = high uncertainty = more curiosity
      }
    }
    
    // Identify information gaps
    const informationGap: string[] = [];
    
    // Find actions we haven't tried yet
    for (const action of gameState.available_actions) {
      const contingency = this.contingencies.get(action.name);
      if (!contingency || contingency.observations < 2) {
        informationGap.push(action.name);
      }
    }
    
    // Find uncertain contingencies
    for (const [actionName, contingency] of this.contingencies) {
      if (contingency.reliability < this.config.reliabilityThreshold) {
        if (!informationGap.includes(actionName)) {
          informationGap.push(actionName);
        }
      }
    }
    
    // Determine exploration strategy
    let strategy: ExploratoryDrive['strategy'] = 'systematic';
    
    if (informationGap.length > 5) {
      strategy = 'random';  // Too many gaps, random exploration
    } else if (informationGap.length > 0) {
      strategy = 'uncertainty-reduction';  // Target specific gaps
    } else if (curiosity > 0.7) {
      strategy = 'novelty-seeking';  // High curiosity, seek new experiences
    }
    
    // Priority based on information gap size
    const priority = Math.min(1.0, informationGap.length / 10);
    
    return {
      curiosity: Math.min(1.0, curiosity),
      informationGap,
      strategy,
      priority
    };
  }
  
  /**
   * Get sensorimotor contingencies (for inspection)
   */
  getContingencies(): Map<string, SensoriomotorContingency> {
    return new Map(this.contingencies);
  }
  
  /**
   * Get loop history
   */
  getLoopHistory(): ActionPerceptionLoop[] {
    return [...this.loopHistory];
  }
  
  /**
   * Get recent loops for analysis
   */
  getRecentLoops(count: number = 10): ActionPerceptionLoop[] {
    return this.loopHistory.slice(-count);
  }
  
  /**
   * Clear all learned contingencies (useful for new game/context)
   */
  clearContingencies(): void {
    this.contingencies.clear();
    this.loopHistory = [];
    this.currentLoop = null;
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Compute perceptual change between two states
   */
  private computePerceptualChange(before: string, after: string): string {
    // Simple diff - in practice could be more sophisticated
    const beforeWords = new Set(before.toLowerCase().split(/\s+/));
    const afterWords = new Set(after.toLowerCase().split(/\s+/));
    
    const added = Array.from(afterWords).filter(w => !beforeWords.has(w));
    const removed = Array.from(beforeWords).filter(w => !afterWords.has(w));
    
    if (added.length === 0 && removed.length === 0) {
      return 'no visible change';
    }
    
    const changes = [];
    if (added.length > 0) {
      changes.push(`added: ${added.slice(0, 3).join(', ')}`);
    }
    if (removed.length > 0) {
      changes.push(`removed: ${removed.slice(0, 3).join(', ')}`);
    }
    
    return changes.join('; ');
  }
  
  /**
   * Compute prediction error
   */
  private computePredictionError(expected: string, actual: string): number {
    // Simple text similarity - in practice could use embeddings
    const expectedWords = new Set(expected.toLowerCase().split(/\s+/));
    const actualWords = new Set(actual.toLowerCase().split(/\s+/));
    
    const intersection = new Set(
      Array.from(expectedWords).filter(w => actualWords.has(w))
    );
    
    const union = new Set([...expectedWords, ...actualWords]);
    
    // Jaccard distance as error
    const similarity = intersection.size / union.size;
    return 1 - similarity;
  }
  
  /**
   * Update or create sensorimotor contingency
   */
  private updateContingency(
    actionName: string,
    actualChange: string,
    outcome: string,
    predictionError: number
  ): boolean {
    let contingency = this.contingencies.get(actionName);
    
    if (!contingency) {
      // Create new contingency
      contingency = {
        action: actionName,
        expectedChange: actualChange,
        actualChange,
        reliability: 1 - predictionError,  // Start with observed reliability
        observations: 1,
        lastObserved: Date.now()
      };
      this.contingencies.set(actionName, contingency);
      
      // Prune if too many
      if (this.contingencies.size > this.config.maxContingencies) {
        this.pruneContingencies();
      }
      
      return true;
    }
    
    // Update existing contingency
    const learningRate = this.config.contingencyLearningRate;
    
    // Update expected change (moving toward actual)
    if (actualChange !== contingency.expectedChange) {
      // For simplicity, replace with most recent if different
      // In practice, could do more sophisticated aggregation
      contingency.expectedChange = actualChange;
    }
    
    contingency.actualChange = actualChange;
    
    // Update reliability based on prediction error
    // Low error -> increase reliability, high error -> decrease
    const reliabilityUpdate = (1 - predictionError) * learningRate;
    contingency.reliability = contingency.reliability * (1 - learningRate) + reliabilityUpdate;
    
    contingency.observations += 1;
    contingency.lastObserved = Date.now();
    
    return false;  // Updated existing, not learned new
  }
  
  /**
   * Find what enables an action in the current state
   */
  private findEnablers(action: Action, stateText: string): string[] {
    const enablers: string[] = [];
    
    // Look for objects/entities mentioned in action description
    const actionWords = action.description.toLowerCase().split(/\s+/);
    
    for (const word of actionWords) {
      if (word.length > 3 && stateText.includes(word)) {
        enablers.push(word);
      }
    }
    
    // Generic enablers based on action type
    if (action.name.toLowerCase().includes('attack') && stateText.includes('enemy')) {
      enablers.push('enemy');
    }
    if (action.name.toLowerCase().includes('use') && stateText.includes('item')) {
      enablers.push('item');
    }
    if (action.name.toLowerCase().includes('talk') && stateText.includes('person')) {
      enablers.push('person');
    }
    
    return enablers;
  }
  
  /**
   * Prune least reliable/useful contingencies
   */
  private pruneContingencies(): void {
    const contingencies = Array.from(this.contingencies.entries());
    
    // Apply decay to all
    const now = Date.now();
    const decayRate = this.config.contingencyDecayRate;
    
    for (const [, contingency] of contingencies) {
      const timeSinceUse = (now - contingency.lastObserved) / 1000 / 60;  // minutes
      const decayFactor = Math.exp(-decayRate * timeSinceUse);
      contingency.reliability *= decayFactor;
    }
    
    // Sort by reliability
    contingencies.sort((a, b) => a[1].reliability - b[1].reliability);
    
    // Remove weakest until under limit
    const toRemove = contingencies.length - this.config.maxContingencies;
    for (let i = 0; i < toRemove; i++) {
      this.contingencies.delete(contingencies[i][0]);
    }
  }
}

/**
 * Create enacted cognition system
 */
export function createEnactedCognitionSystem(
  config?: Partial<EnactedCognitionConfig>
): EnactedCognitionSystem {
  return new EnactedCognitionSystem(config);
}
