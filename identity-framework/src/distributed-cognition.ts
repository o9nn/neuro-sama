/**
 * Distributed Cognition System
 * 
 * Implements chat/audience as cognitive extension - recognizing that
 * cognition is distributed beyond the agent's internal processing to
 * include external resources, tools, and social systems.
 * 
 * Based on Vervaeke's 4E cognition - cognition is EXTENDED beyond
 * the individual mind into the environment and social context.
 * 
 * Key principles:
 * - Chat as extended memory
 * - Collective intelligence aggregation  
 * - Social scaffolding of cognition
 * - Distributed problem-solving
 * - Cultural cognitive tools
 */

import { Action, Episode } from './types';

/**
 * Chat message from audience
 */
export interface ChatMessage {
  /** Message ID */
  id: string;
  
  /** Username */
  user: string;
  
  /** Message content */
  content: string;
  
  /** Timestamp */
  timestamp: number;
  
  /** Message sentiment */
  sentiment?: 'positive' | 'negative' | 'neutral' | 'question';
  
  /** Extracted intent (if any) */
  intent?: 'suggestion' | 'question' | 'reaction' | 'information' | 'support';
}

/**
 * Collective intelligence signal
 * Aggregated wisdom from the crowd
 */
export interface CollectiveIntelligence {
  /** Topic/context */
  topic: string;
  
  /** Aggregated suggestions */
  suggestions: Array<{
    content: string;
    support: number;  // How many agree
    confidence: number;
  }>;
  
  /** Consensus (if reached) */
  consensus?: string;
  
  /** Disagreement level (0-1) */
  disagreement: number;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Social scaffolding - how chat supports cognition
 */
export interface SocialScaffolding {
  /** Type of support */
  type: 'memory-aid' | 'problem-solving' | 'emotional-support' | 
        'information-provision' | 'perspective-offering';
  
  /** Source messages */
  sources: ChatMessage[];
  
  /** Scaffolding content */
  content: string;
  
  /** Reliability of this scaffolding (0-1) */
  reliability: number;
}

/**
 * Distributed problem-solving state
 */
export interface DistributedProblemSolving {
  /** Problem being solved */
  problem: string;
  
  /** Proposed solutions from chat */
  proposedSolutions: Array<{
    solution: string;
    proposer: string;
    votes: number;
    rationale?: string;
  }>;
  
  /** Agent's evaluation of solutions */
  evaluations: Array<{
    solution: string;
    score: number;
    reasoning: string;
  }>;
  
  /** Selected solution (if any) */
  selectedSolution?: string;
  
  /** Outcome (if executed) */
  outcome?: string;
}

/**
 * Configuration for distributed cognition system
 */
export interface DistributedCognitionConfig {
  /** Maximum chat messages to process per update */
  maxMessagesPerUpdate: number;
  
  /** Time window for message aggregation (ms) */
  aggregationWindow: number;
  
  /** Minimum support for collective signal */
  minSupportThreshold: number;
  
  /** Weight for collective intelligence vs internal reasoning */
  collectiveWeight: number;
  
  /** Maximum stored scaffolding */
  maxScaffolding: number;
  
  /** Trust decay rate for repeated users */
  trustDecayRate: number;
}

/**
 * Default configuration
 */
export const DEFAULT_DISTRIBUTED_CONFIG: DistributedCognitionConfig = {
  maxMessagesPerUpdate: 50,
  aggregationWindow: 30000,  // 30 seconds
  minSupportThreshold: 3,
  collectiveWeight: 0.3,  // 30% weight to collective input
  maxScaffolding: 20,
  trustDecayRate: 0.05
};

/**
 * Distributed Cognition System
 * 
 * Manages integration of chat/audience as cognitive extension.
 */
export class DistributedCognitionSystem {
  private chatHistory: ChatMessage[];
  private scaffolding: SocialScaffolding[];
  private userTrust: Map<string, number>;
  private activeProblemSolving: DistributedProblemSolving | null;
  private config: DistributedCognitionConfig;
  
  constructor(config?: Partial<DistributedCognitionConfig>) {
    this.config = {
      ...DEFAULT_DISTRIBUTED_CONFIG,
      ...config
    };
    
    this.chatHistory = [];
    this.scaffolding = [];
    this.userTrust = new Map();
    this.activeProblemSolving = null;
  }
  
  /**
   * Process incoming chat messages
   */
  processChatMessages(messages: ChatMessage[]): {
    scaffoldingGenerated: SocialScaffolding[];
    collectiveSignals: CollectiveIntelligence[];
    notableMessages: ChatMessage[];
  } {
    // Add to history
    for (const msg of messages.slice(0, this.config.maxMessagesPerUpdate)) {
      this.chatHistory.push(msg);
      
      // Classify message
      msg.sentiment = this.classifySentiment(msg.content);
      msg.intent = this.classifyIntent(msg.content);
    }
    
    // Maintain history size
    if (this.chatHistory.length > 500) {
      this.chatHistory = this.chatHistory.slice(-500);
    }
    
    // Generate scaffolding
    const scaffoldingGenerated = this.generateScaffolding(messages);
    
    // Detect collective intelligence signals
    const collectiveSignals = this.detectCollectiveIntelligence(messages);
    
    // Find notable messages (high quality/relevance)
    const notableMessages = this.identifyNotableMessages(messages);
    
    return {
      scaffoldingGenerated,
      collectiveSignals,
      notableMessages
    };
  }
  
  /**
   * Get collective wisdom on action selection
   */
  getCollectiveActionGuidance(
    actions: Action[],
    context: string
  ): Map<string, {
    support: number;
    reasoning: string[];
    confidence: number;
  }> {
    const guidance = new Map<string, {
      support: number;
      reasoning: string[];
      confidence: number;
    }>();
    
    // Get recent relevant messages
    const recentMessages = this.getRecentMessages(this.config.aggregationWindow);
    
    for (const action of actions) {
      const actionText = `${action.name} ${action.description}`.toLowerCase();
      
      // Find messages mentioning this action
      const supportingMessages = recentMessages.filter(msg => {
        const content = msg.content.toLowerCase();
        
        // Check for action keywords
        const actionKeywords = actionText.split(/\s+/).filter(w => w.length > 3);
        return actionKeywords.some(kw => content.includes(kw));
      });
      
      if (supportingMessages.length === 0) {
        continue;
      }
      
      // Aggregate support
      let supportScore = 0;
      const reasoning: string[] = [];
      
      for (const msg of supportingMessages) {
        // Weight by user trust
        const trust = this.getUserTrust(msg.user);
        
        // Positive sentiment increases support
        if (msg.sentiment === 'positive') {
          supportScore += 1.0 * trust;
        } else if (msg.sentiment === 'neutral') {
          supportScore += 0.5 * trust;
        }
        
        // Extract reasoning if present
        if (msg.content.toLowerCase().includes('because') ||
            msg.content.toLowerCase().includes('should') ||
            msg.content.length > 50) {
          reasoning.push(msg.content);
        }
      }
      
      // Normalize support
      const normalizedSupport = Math.min(1.0, supportScore / 5);
      
      // Confidence based on number of messages
      const confidence = Math.min(1.0, supportingMessages.length / 10);
      
      guidance.set(action.name, {
        support: normalizedSupport,
        reasoning: reasoning.slice(0, 3),  // Top 3
        confidence
      });
    }
    
    return guidance;
  }
  
  /**
   * Integrate collective guidance into action scores
   */
  integrateCollectiveGuidance(
    actions: Action[],
    baseScores: Map<string, number>,
    context: string
  ): Map<string, number> {
    const collectiveGuidance = this.getCollectiveActionGuidance(actions, context);
    const integratedScores = new Map<string, number>();
    
    for (const action of actions) {
      const baseScore = baseScores.get(action.name) || 0.5;
      const guidance = collectiveGuidance.get(action.name);
      
      if (!guidance) {
        integratedScores.set(action.name, baseScore);
        continue;
      }
      
      // Integrate with configured weight
      const collectiveContribution = guidance.support * guidance.confidence * 
                                     this.config.collectiveWeight;
      
      const integratedScore = baseScore * (1 - this.config.collectiveWeight) + 
                             collectiveContribution;
      
      integratedScores.set(action.name, integratedScore);
    }
    
    return integratedScores;
  }
  
  /**
   * Start distributed problem-solving
   */
  startProblemSolving(problem: string): void {
    this.activeProblemSolving = {
      problem,
      proposedSolutions: [],
      evaluations: []
    };
  }
  
  /**
   * Collect proposed solutions from chat
   */
  collectProposedSolutions(messages: ChatMessage[]): void {
    if (!this.activeProblemSolving) return;
    
    for (const msg of messages) {
      // Look for solution-like messages
      if (msg.intent === 'suggestion' || 
          msg.content.toLowerCase().includes('should') ||
          msg.content.toLowerCase().includes('try')) {
        
        // Check if already proposed
        const exists = this.activeProblemSolving.proposedSolutions.some(
          ps => ps.solution === msg.content
        );
        
        if (!exists) {
          this.activeProblemSolving.proposedSolutions.push({
            solution: msg.content,
            proposer: msg.user,
            votes: 1
          });
        } else {
          // Increment votes
          const existing = this.activeProblemSolving.proposedSolutions.find(
            ps => ps.solution === msg.content
          );
          if (existing) {
            existing.votes += 1;
          }
        }
      }
    }
  }
  
  /**
   * Get best proposed solution from collective
   */
  getBestCollectiveSolution(): string | null {
    if (!this.activeProblemSolving || 
        this.activeProblemSolving.proposedSolutions.length === 0) {
      return null;
    }
    
    // Sort by votes
    const sorted = [...this.activeProblemSolving.proposedSolutions]
      .sort((a, b) => b.votes - a.votes);
    
    const best = sorted[0];
    
    // Check if meets threshold
    if (best.votes >= this.config.minSupportThreshold) {
      return best.solution;
    }
    
    return null;
  }
  
  /**
   * Get social scaffolding for current context
   */
  getScaffolding(context: string, type?: SocialScaffolding['type']): SocialScaffolding[] {
    let relevant = this.scaffolding;
    
    // Filter by type if specified
    if (type) {
      relevant = relevant.filter(s => s.type === type);
    }
    
    // Filter by context relevance
    relevant = relevant.filter(s => {
      const contextWords = context.toLowerCase().split(/\s+/);
      const contentWords = s.content.toLowerCase().split(/\s+/);
      
      const overlap = contextWords.filter(w => 
        w.length > 3 && contentWords.includes(w)
      );
      
      return overlap.length > 0;
    });
    
    // Sort by reliability
    relevant.sort((a, b) => b.reliability - a.reliability);
    
    return relevant;
  }
  
  /**
   * Get chat history
   */
  getChatHistory(limit?: number): ChatMessage[] {
    if (limit) {
      return this.chatHistory.slice(-limit);
    }
    return [...this.chatHistory];
  }
  
  /**
   * Clear chat history (useful for new session)
   */
  clearHistory(): void {
    this.chatHistory = [];
    this.scaffolding = [];
    this.userTrust.clear();
    this.activeProblemSolving = null;
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Classify message sentiment
   */
  private classifySentiment(content: string): ChatMessage['sentiment'] {
    const lower = content.toLowerCase();
    
    // Question indicators
    if (lower.includes('?') || lower.startsWith('what') || 
        lower.startsWith('how') || lower.startsWith('why')) {
      return 'question';
    }
    
    // Positive indicators
    const positiveWords = ['good', 'great', 'awesome', 'nice', 'yes', 'love', '!'];
    if (positiveWords.some(w => lower.includes(w))) {
      return 'positive';
    }
    
    // Negative indicators
    const negativeWords = ['bad', 'wrong', 'no', 'dont', 'stop', 'terrible'];
    if (negativeWords.some(w => lower.includes(w))) {
      return 'negative';
    }
    
    return 'neutral';
  }
  
  /**
   * Classify message intent
   */
  private classifyIntent(content: string): ChatMessage['intent'] {
    const lower = content.toLowerCase();
    
    // Question
    if (lower.includes('?')) {
      return 'question';
    }
    
    // Suggestion
    if (lower.includes('should') || lower.includes('try') || 
        lower.includes('suggest') || lower.includes('maybe')) {
      return 'suggestion';
    }
    
    // Information
    if (lower.includes('actually') || lower.includes('fact') || 
        lower.includes('fyi') || lower.includes('btw')) {
      return 'information';
    }
    
    // Support
    if (lower.includes('you got this') || lower.includes('good job') ||
        lower.includes('keep going') || lower.includes('believe')) {
      return 'support';
    }
    
    // Default to reaction
    return 'reaction';
  }
  
  /**
   * Generate social scaffolding from messages
   */
  private generateScaffolding(messages: ChatMessage[]): SocialScaffolding[] {
    const newScaffolding: SocialScaffolding[] = [];
    
    // Memory aids (reminders about past events)
    const memoryAids = messages.filter(msg => 
      msg.content.toLowerCase().includes('remember') ||
      msg.content.toLowerCase().includes('recall') ||
      msg.content.toLowerCase().includes('earlier')
    );
    
    if (memoryAids.length > 0) {
      newScaffolding.push({
        type: 'memory-aid',
        sources: memoryAids,
        content: memoryAids.map(m => m.content).join('; '),
        reliability: Math.min(1.0, memoryAids.length / 3)
      });
    }
    
    // Problem-solving hints
    const hints = messages.filter(msg => 
      msg.intent === 'suggestion' || msg.intent === 'information'
    );
    
    if (hints.length > 0) {
      newScaffolding.push({
        type: 'problem-solving',
        sources: hints,
        content: hints.map(h => h.content).join('; '),
        reliability: Math.min(1.0, hints.length / 5)
      });
    }
    
    // Emotional support
    const support = messages.filter(msg => msg.intent === 'support');
    
    if (support.length > 0) {
      newScaffolding.push({
        type: 'emotional-support',
        sources: support,
        content: support.map(s => s.content).join('; '),
        reliability: Math.min(1.0, support.length / 2)
      });
    }
    
    // Add to scaffolding store
    for (const scaffold of newScaffolding) {
      this.scaffolding.push(scaffold);
    }
    
    // Maintain size
    if (this.scaffolding.length > this.config.maxScaffolding) {
      // Keep most reliable
      this.scaffolding.sort((a, b) => b.reliability - a.reliability);
      this.scaffolding = this.scaffolding.slice(0, this.config.maxScaffolding);
    }
    
    return newScaffolding;
  }
  
  /**
   * Detect collective intelligence signals
   */
  private detectCollectiveIntelligence(messages: ChatMessage[]): CollectiveIntelligence[] {
    const signals: CollectiveIntelligence[] = [];
    
    // Group messages by topic (simple keyword clustering)
    const topics = new Map<string, ChatMessage[]>();
    
    for (const msg of messages) {
      const keywords = msg.content.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4);
      
      for (const keyword of keywords) {
        if (!topics.has(keyword)) {
          topics.set(keyword, []);
        }
        topics.get(keyword)!.push(msg);
      }
    }
    
    // Analyze each topic cluster
    for (const [topic, msgs] of topics) {
      if (msgs.length < this.config.minSupportThreshold) {
        continue;
      }
      
      // Aggregate suggestions
      const suggestions = new Map<string, number>();
      
      for (const msg of msgs) {
        if (msg.intent === 'suggestion') {
          const current = suggestions.get(msg.content) || 0;
          suggestions.set(msg.content, current + 1);
        }
      }
      
      // Convert to array
      const suggestionArray = Array.from(suggestions.entries()).map(([content, support]) => ({
        content,
        support,
        confidence: Math.min(1.0, support / msgs.length)
      }));
      
      // Check for consensus (>50% agree)
      const maxSupport = Math.max(...suggestionArray.map(s => s.support));
      const consensus = maxSupport > msgs.length / 2 ? 
        suggestionArray.find(s => s.support === maxSupport)?.content : 
        undefined;
      
      // Calculate disagreement
      const disagreement = 1 - (maxSupport / msgs.length);
      
      signals.push({
        topic,
        suggestions: suggestionArray,
        consensus,
        disagreement,
        timestamp: Date.now()
      });
    }
    
    return signals;
  }
  
  /**
   * Identify notable messages (high quality/relevance)
   */
  private identifyNotableMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages.filter(msg => {
      // Long, substantive messages
      const isSubstantive = msg.content.length > 50;
      
      // High-trust users
      const trust = this.getUserTrust(msg.user);
      const isTrusted = trust > 0.7;
      
      // Information or suggestions
      const isUseful = msg.intent === 'information' || msg.intent === 'suggestion';
      
      return (isSubstantive || isTrusted) && isUseful;
    });
  }
  
  /**
   * Get recent messages within time window
   */
  private getRecentMessages(timeWindow: number): ChatMessage[] {
    const now = Date.now();
    return this.chatHistory.filter(msg => 
      now - msg.timestamp < timeWindow
    );
  }
  
  /**
   * Get user trust score
   */
  private getUserTrust(user: string): number {
    return this.userTrust.get(user) || 0.5;  // Default moderate trust
  }
  
  /**
   * Update user trust based on outcome
   */
  updateUserTrust(user: string, outcomeGood: boolean): void {
    const currentTrust = this.getUserTrust(user);
    
    if (outcomeGood) {
      // Increase trust
      this.userTrust.set(user, Math.min(1.0, currentTrust + 0.1));
    } else {
      // Decrease trust
      this.userTrust.set(user, Math.max(0.0, currentTrust - 0.15));
    }
  }
}

/**
 * Create distributed cognition system
 */
export function createDistributedCognitionSystem(
  config?: Partial<DistributedCognitionConfig>
): DistributedCognitionSystem {
  return new DistributedCognitionSystem(config);
}
