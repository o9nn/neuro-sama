/**
 * Theory of Mind System
 * 
 * Implements perspective-taking and other-modeling capabilities for
 * social cognition and strategic reasoning about other agents.
 * 
 * Based on Vervaeke's framework that social intelligence requires:
 * - Perspective-taking (seeing from another's viewpoint)
 * - Mental state attribution (beliefs, desires, intentions)
 * - Recursive reasoning (I think that you think that I think...)
 * - Empathic simulation
 * - Deception detection
 * 
 * This enables sophisticated social deduction and collaborative gameplay.
 */

import { EmotionalState, Episode } from './types';

/**
 * Mental state model of another agent
 */
export interface MentalStateModel {
  /** Agent identifier */
  agentId: string;
  
  /** Believed beliefs of the agent */
  beliefs: string[];
  
  /** Inferred goals/desires */
  goals: string[];
  
  /** Predicted intentions */
  intentions: string[];
  
  /** Emotional state estimate */
  emotionalState: EmotionalState;
  
  /** Confidence in this model (0-1) */
  confidence: number;
  
  /** Last update timestamp */
  lastUpdate: number;
  
  /** Observed behaviors that inform this model */
  observations: string[];
}

/**
 * Perspective - a viewpoint on a situation
 */
export interface Perspective {
  /** Who's perspective */
  agentId: string;
  
  /** What's salient from this perspective */
  salience: string[];
  
  /** What's backgrounded */
  background: string[];
  
  /** Emotional coloring */
  emotionalTone: EmotionalState['primary_emotion'];
  
  /** Confidence in perspective accuracy (0-1) */
  confidence: number;
}

/**
 * Deception indicator
 */
export interface DeceptionIndicator {
  /** Agent suspected of deception */
  agentId: string;
  
  /** Type of deception */
  type: 'lying' | 'omission' | 'misdirection' | 'false-signaling';
  
  /** Confidence in deception (0-1) */
  confidence: number;
  
  /** Evidence for deception */
  evidence: string[];
  
  /** Predicted truth */
  predictedTruth?: string;
}

/**
 * Recursive reasoning structure
 * "I think that you think that I think..."
 */
export interface RecursiveReasoning {
  /** Depth of recursion (0 = direct, 1 = one level, etc.) */
  depth: number;
  
  /** Reasoning chain */
  chain: Array<{
    level: number;
    agent: string;
    belief: string;
  }>;
  
  /** Confidence degrades with depth */
  confidence: number;
}

/**
 * Configuration for Theory of Mind system
 */
export interface TheoryOfMindConfig {
  /** Maximum agents to track */
  maxAgents: number;
  
  /** Maximum recursion depth for reasoning */
  maxRecursionDepth: number;
  
  /** Confidence decay per recursion level */
  recursionConfidenceDecay: number;
  
  /** Threshold for deception detection */
  deceptionThreshold: number;
  
  /** Observation history size per agent */
  observationHistorySize: number;
  
  /** Model update frequency (ms) */
  updateFrequency: number;
}

/**
 * Default configuration
 */
export const DEFAULT_TOM_CONFIG: TheoryOfMindConfig = {
  maxAgents: 10,
  maxRecursionDepth: 3,
  recursionConfidenceDecay: 0.3,
  deceptionThreshold: 0.6,
  observationHistorySize: 20,
  updateFrequency: 1000
};

/**
 * Theory of Mind System
 * 
 * Manages models of other agents' mental states for social reasoning.
 */
export class TheoryOfMindSystem {
  private mentalModels: Map<string, MentalStateModel>;
  private deceptionHistory: Map<string, DeceptionIndicator[]>;
  private config: TheoryOfMindConfig;
  
  constructor(config?: Partial<TheoryOfMindConfig>) {
    this.config = {
      ...DEFAULT_TOM_CONFIG,
      ...config
    };
    
    this.mentalModels = new Map();
    this.deceptionHistory = new Map();
  }
  
  /**
   * Update mental model of an agent based on observation
   */
  updateMentalModel(
    agentId: string,
    observation: {
      action?: string;
      statement?: string;
      outcome?: string;
      context?: string;
    }
  ): MentalStateModel {
    let model = this.mentalModels.get(agentId);
    
    if (!model) {
      // Create new model
      model = {
        agentId,
        beliefs: [],
        goals: [],
        intentions: [],
        emotionalState: this.inferEmotionalState(observation),
        confidence: 0.3,
        lastUpdate: Date.now(),
        observations: []
      };
      this.mentalModels.set(agentId, model);
    }
    
    // Add observation
    const obsText = this.formatObservation(observation);
    model.observations.push(obsText);
    
    // Maintain history size
    if (model.observations.length > this.config.observationHistorySize) {
      model.observations.shift();
    }
    
    // Update beliefs based on observation
    if (observation.statement) {
      this.updateBeliefs(model, observation.statement);
    }
    
    // Update goals based on actions
    if (observation.action) {
      this.updateGoals(model, observation.action, observation.outcome);
    }
    
    // Update intentions
    this.updateIntentions(model, observation);
    
    // Update emotional state
    model.emotionalState = this.inferEmotionalState(observation);
    
    // Increase confidence with more observations
    model.confidence = Math.min(0.95, model.confidence + 0.05);
    
    model.lastUpdate = Date.now();
    
    return { ...model };
  }
  
  /**
   * Take another agent's perspective on a situation
   */
  takePerspective(
    agentId: string,
    situation: string,
    selfPerspective?: {
      salience: string[];
      emotionalTone: EmotionalState['primary_emotion'];
    }
  ): Perspective {
    const model = this.mentalModels.get(agentId);
    
    if (!model) {
      // No model - use empathic simulation with low confidence
      return {
        agentId,
        salience: this.extractKeywords(situation),
        background: [],
        emotionalTone: 'neutral',
        confidence: 0.2
      };
    }
    
    // Simulate what would be salient from their perspective
    const salience = this.inferSalience(model, situation);
    
    // What they would background
    const background = selfPerspective ? 
      selfPerspective.salience.filter(s => !salience.includes(s)) : [];
    
    return {
      agentId,
      salience,
      background,
      emotionalTone: model.emotionalState.primary_emotion,
      confidence: model.confidence * 0.8  // Perspective-taking has some uncertainty
    };
  }
  
  /**
   * Detect potential deception
   */
  detectDeception(
    agentId: string,
    statement: string,
    context: {
      knownFacts?: string[];
      previousStatements?: string[];
      observedBehavior?: string[];
    }
  ): DeceptionIndicator | null {
    const model = this.mentalModels.get(agentId);
    
    if (!model || model.confidence < 0.4) {
      return null;  // Not enough data
    }
    
    const evidence: string[] = [];
    let deceptionScore = 0;
    
    // Check for contradictions with known facts
    if (context.knownFacts) {
      for (const fact of context.knownFacts) {
        if (this.contradicts(statement, fact)) {
          evidence.push(`Statement contradicts known fact: ${fact}`);
          deceptionScore += 0.3;
        }
      }
    }
    
    // Check for self-contradiction
    if (context.previousStatements) {
      for (const prevStatement of context.previousStatements) {
        if (this.contradicts(statement, prevStatement)) {
          evidence.push(`Statement contradicts previous statement: ${prevStatement}`);
          deceptionScore += 0.25;
        }
      }
    }
    
    // Check for behavior-statement mismatch
    if (context.observedBehavior) {
      for (const behavior of context.observedBehavior) {
        if (this.behaviorStatementMismatch(statement, behavior)) {
          evidence.push(`Statement inconsistent with behavior: ${behavior}`);
          deceptionScore += 0.2;
        }
      }
    }
    
    // Check against inferred goals
    const goalMismatch = this.checkGoalAlignment(model, statement);
    if (goalMismatch) {
      evidence.push(`Statement doesn't align with inferred goals`);
      deceptionScore += 0.15;
    }
    
    // Determine deception type
    let type: DeceptionIndicator['type'] = 'lying';
    if (statement.toLowerCase().includes('forgot') || 
        statement.toLowerCase().includes('didn\'t')) {
      type = 'omission';
    } else if (evidence.length > 0 && evidence[0].includes('mismatch')) {
      type = 'false-signaling';
    }
    
    if (deceptionScore >= this.config.deceptionThreshold) {
      const indicator: DeceptionIndicator = {
        agentId,
        type,
        confidence: Math.min(0.95, deceptionScore),
        evidence
      };
      
      // Store in history
      if (!this.deceptionHistory.has(agentId)) {
        this.deceptionHistory.set(agentId, []);
      }
      this.deceptionHistory.get(agentId)!.push(indicator);
      
      return indicator;
    }
    
    return null;
  }
  
  /**
   * Perform recursive reasoning
   * "I think that you think that I think..."
   */
  recursiveReasoning(
    initialBelief: string,
    agents: string[],
    depth: number
  ): RecursiveReasoning {
    const maxDepth = Math.min(depth, this.config.maxRecursionDepth);
    const chain: RecursiveReasoning['chain'] = [];
    
    // Start with initial belief
    chain.push({
      level: 0,
      agent: 'self',
      belief: initialBelief
    });
    
    // Build chain of recursive beliefs
    for (let level = 1; level <= maxDepth; level++) {
      const agent = agents[(level - 1) % agents.length];
      const model = this.mentalModels.get(agent);
      
      if (!model) {
        break;  // Can't reason further without model
      }
      
      // Simulate what they would believe about previous level
      const prevBelief = chain[level - 1].belief;
      const theirBelief = this.simulateReasoningAbout(model, prevBelief);
      
      chain.push({
        level,
        agent,
        belief: theirBelief
      });
    }
    
    // Confidence degrades with depth
    const confidence = Math.pow(1 - this.config.recursionConfidenceDecay, chain.length - 1);
    
    return {
      depth: chain.length - 1,
      chain,
      confidence
    };
  }
  
  /**
   * Predict agent's next action based on mental model
   */
  predictAction(
    agentId: string,
    availableActions: string[],
    context: string
  ): {
    prediction: string;
    confidence: number;
    reasoning: string;
  } {
    const model = this.mentalModels.get(agentId);
    
    if (!model || model.confidence < 0.3) {
      return {
        prediction: availableActions[0] || 'unknown',
        confidence: 0.1,
        reasoning: 'Insufficient data for prediction'
      };
    }
    
    // Score actions based on alignment with goals and intentions
    const scores = new Map<string, number>();
    
    for (const action of availableActions) {
      let score = 0;
      
      // Goal alignment
      for (const goal of model.goals) {
        if (this.actionAlignedWithGoal(action, goal)) {
          score += 0.4;
        }
      }
      
      // Intention alignment
      for (const intention of model.intentions) {
        if (action.toLowerCase().includes(intention.toLowerCase())) {
          score += 0.3;
        }
      }
      
      // Emotional state influence
      if (this.actionFitsEmotionalState(action, model.emotionalState)) {
        score += 0.2;
      }
      
      scores.set(action, score);
    }
    
    // Find highest scoring action
    let bestAction = availableActions[0];
    let bestScore = -Infinity;
    
    for (const [action, score] of scores) {
      if (score > bestScore) {
        bestScore = score;
        bestAction = action;
      }
    }
    
    return {
      prediction: bestAction,
      confidence: Math.min(0.9, model.confidence * (bestScore / 0.9)),
      reasoning: `Based on goals: ${model.goals.join(', ')}`
    };
  }
  
  /**
   * Get mental model of an agent
   */
  getMentalModel(agentId: string): MentalStateModel | undefined {
    const model = this.mentalModels.get(agentId);
    return model ? { ...model } : undefined;
  }
  
  /**
   * Get all tracked agents
   */
  getTrackedAgents(): string[] {
    return Array.from(this.mentalModels.keys());
  }
  
  /**
   * Get deception history for an agent
   */
  getDeceptionHistory(agentId: string): DeceptionIndicator[] {
    return [...(this.deceptionHistory.get(agentId) || [])];
  }
  
  /**
   * Clear all models (useful for new game/context)
   */
  clearModels(): void {
    this.mentalModels.clear();
    this.deceptionHistory.clear();
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Format observation into text
   */
  private formatObservation(observation: {
    action?: string;
    statement?: string;
    outcome?: string;
    context?: string;
  }): string {
    const parts = [];
    if (observation.action) parts.push(`Action: ${observation.action}`);
    if (observation.statement) parts.push(`Said: ${observation.statement}`);
    if (observation.outcome) parts.push(`Result: ${observation.outcome}`);
    if (observation.context) parts.push(`Context: ${observation.context}`);
    return parts.join(' | ');
  }
  
  /**
   * Infer emotional state from observation
   */
  private inferEmotionalState(observation: {
    action?: string;
    statement?: string;
    outcome?: string;
  }): EmotionalState {
    // Simple heuristic-based inference
    const text = `${observation.action || ''} ${observation.statement || ''} ${observation.outcome || ''}`.toLowerCase();
    
    let emotion: EmotionalState['primary_emotion'] = 'neutral';
    let intensity = 0.5;
    let valence = 0;
    let arousal = 0.5;
    
    // Positive emotions
    if (text.includes('win') || text.includes('success') || text.includes('happy') || text.includes('!')) {
      emotion = 'happy';
      valence = 0.7;
      arousal = 0.6;
      intensity = 0.7;
    } else if (text.includes('exciting') || text.includes('amazing')) {
      emotion = 'excited';
      valence = 0.8;
      arousal = 0.9;
      intensity = 0.8;
    }
    // Negative emotions
    else if (text.includes('lose') || text.includes('fail') || text.includes('angry') || text.includes('annoyed')) {
      emotion = 'annoyed';
      valence = -0.6;
      arousal = 0.7;
      intensity = 0.6;
    } else if (text.includes('confus') || text.includes('unclear') || text.includes('?')) {
      emotion = 'confused';
      valence = -0.2;
      arousal = 0.4;
      intensity = 0.5;
    }
    
    return {
      primary_emotion: emotion,
      intensity,
      valence,
      arousal,
      last_update: Date.now()
    };
  }
  
  /**
   * Update beliefs based on statement
   */
  private updateBeliefs(model: MentalStateModel, statement: string): void {
    // Extract belief from statement
    const beliefKeywords = ['think', 'believe', 'know', 'sure', 'is', 'are'];
    const hasBeliefMarker = beliefKeywords.some(kw => 
      statement.toLowerCase().includes(kw)
    );
    
    if (hasBeliefMarker) {
      // Add as belief
      model.beliefs.push(statement);
      
      // Maintain reasonable size
      if (model.beliefs.length > 10) {
        model.beliefs.shift();
      }
    }
  }
  
  /**
   * Update goals based on actions and outcomes
   */
  private updateGoals(
    model: MentalStateModel,
    action: string,
    outcome?: string
  ): void {
    // Infer goal from action
    const goalKeywords = ['win', 'get', 'achieve', 'obtain', 'reach', 'protect', 'defend'];
    
    for (const keyword of goalKeywords) {
      if (action.toLowerCase().includes(keyword)) {
        const goal = `Goal to ${keyword}`;
        if (!model.goals.includes(goal)) {
          model.goals.push(goal);
        }
      }
    }
    
    // Update based on outcome
    if (outcome) {
      if (outcome.toLowerCase().includes('success') || outcome.toLowerCase().includes('win')) {
        // Achieved goal - remove it
        model.goals = model.goals.filter(g => !action.toLowerCase().includes(g.toLowerCase()));
      }
    }
    
    // Maintain size
    if (model.goals.length > 5) {
      model.goals.shift();
    }
  }
  
  /**
   * Update intentions based on observation
   */
  private updateIntentions(
    model: MentalStateModel,
    observation: {
      action?: string;
      statement?: string;
    }
  ): void {
    // Intentions are near-term action plans
    if (observation.statement) {
      const intentionKeywords = ['will', 'going to', 'plan to', 'intend to', 'next'];
      const hasIntentionMarker = intentionKeywords.some(kw =>
        observation.statement!.toLowerCase().includes(kw)
      );
      
      if (hasIntentionMarker) {
        model.intentions = [observation.statement];
      }
    }
    
    if (observation.action) {
      // Current action hints at intention
      model.intentions = [observation.action];
    }
  }
  
  /**
   * Infer what would be salient from agent's perspective
   */
  private inferSalience(model: MentalStateModel, situation: string): string[] {
    const salience: string[] = [];
    
    // Goals guide salience
    for (const goal of model.goals) {
      const goalKeywords = this.extractKeywords(goal);
      for (const keyword of goalKeywords) {
        if (situation.toLowerCase().includes(keyword.toLowerCase())) {
          salience.push(keyword);
        }
      }
    }
    
    // Emotional state biases salience
    const emotionKeywords = this.getEmotionKeywords(model.emotionalState.primary_emotion);
    for (const keyword of emotionKeywords) {
      if (situation.toLowerCase().includes(keyword)) {
        salience.push(keyword);
      }
    }
    
    return salience;
  }
  
  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);
  }
  
  /**
   * Get keywords associated with emotion
   */
  private getEmotionKeywords(emotion: EmotionalState['primary_emotion']): string[] {
    const keywordMap: Record<string, string[]> = {
      'happy': ['fun', 'good', 'positive', 'win'],
      'excited': ['exciting', 'amazing', 'awesome', 'intense'],
      'annoyed': ['annoying', 'frustrating', 'bad', 'wrong'],
      'confused': ['unclear', 'confusing', 'strange', 'odd'],
      'thoughtful': ['interesting', 'consider', 'think', 'analyze'],
      'neutral': []
    };
    
    return keywordMap[emotion] || [];
  }
  
  /**
   * Check if two statements contradict
   */
  private contradicts(statement1: string, statement2: string): boolean {
    const s1 = statement1.toLowerCase();
    const s2 = statement2.toLowerCase();
    
    // Simple contradiction detection
    const negationPairs = [
      ['is', 'is not'],
      ['did', 'did not'],
      ['can', 'cannot'],
      ['will', 'will not'],
      ['yes', 'no']
    ];
    
    for (const [pos, neg] of negationPairs) {
      if ((s1.includes(pos) && s2.includes(neg)) ||
          (s1.includes(neg) && s2.includes(pos))) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Check for behavior-statement mismatch
   */
  private behaviorStatementMismatch(statement: string, behavior: string): boolean {
    // If statement says one thing but behavior shows another
    const s = statement.toLowerCase();
    const b = behavior.toLowerCase();
    
    if (s.includes('peaceful') && b.includes('attack')) return true;
    if (s.includes('cooperate') && b.includes('betray')) return true;
    if (s.includes('help') && b.includes('hinder')) return true;
    
    return false;
  }
  
  /**
   * Check if statement misaligns with goals (returns true if mismatch detected)
   */
  private checkGoalAlignment(model: MentalStateModel, statement: string): boolean {
    if (model.goals.length === 0) return false;  // No goals, can't detect mismatch
    
    const s = statement.toLowerCase();
    
    // Check if statement supports any goal
    for (const goal of model.goals) {
      const goalKeywords = this.extractKeywords(goal);
      const hasGoalKeyword = goalKeywords.some(kw => s.includes(kw));
      if (hasGoalKeyword) return false;  // Statement aligns with goal - no mismatch
    }
    
    return true;  // No alignment found with any goal - mismatch detected
  }
  
  /**
   * Simulate what an agent would think about a belief
   */
  private simulateReasoningAbout(model: MentalStateModel, belief: string): string {
    // Simple simulation: assume they would reason based on their goals
    const primaryGoal = model.goals[0] || 'unknown goal';
    return `They think about "${belief}" in context of ${primaryGoal}`;
  }
  
  /**
   * Check if action aligns with goal
   */
  private actionAlignedWithGoal(action: string, goal: string): boolean {
    const actionWords = this.extractKeywords(action);
    const goalWords = this.extractKeywords(goal);
    
    return actionWords.some(aw => goalWords.some(gw => 
      aw.includes(gw) || gw.includes(aw)
    ));
  }
  
  /**
   * Check if action fits emotional state
   */
  private actionFitsEmotionalState(action: string, emotion: EmotionalState): boolean {
    const a = action.toLowerCase();
    
    switch (emotion.primary_emotion) {
      case 'excited':
        return a.includes('attack') || a.includes('aggressive') || a.includes('bold');
      case 'happy':
        return a.includes('cooperate') || a.includes('help') || a.includes('friendly');
      case 'annoyed':
        return a.includes('confront') || a.includes('challenge');
      case 'confused':
        return a.includes('wait') || a.includes('observe') || a.includes('ask');
      default:
        return true;
    }
  }
}

/**
 * Create Theory of Mind system
 */
export function createTheoryOfMindSystem(
  config?: Partial<TheoryOfMindConfig>
): TheoryOfMindSystem {
  return new TheoryOfMindSystem(config);
}
