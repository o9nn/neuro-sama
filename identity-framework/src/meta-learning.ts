/**
 * Meta-Learning System
 * 
 * Learning to learn - adapts strategies and improves performance across
 * gameplay sessions. Implements principles of:
 * - Strategy adaptation
 * - Performance tracking
 * - Error pattern recognition
 * - Transfer learning across contexts
 * 
 * Based on Vervaeke's concept that wisdom involves systematic
 * improvement of relevance realization - meta-learning is learning
 * how to learn better.
 */

import { Episode, Action, ActionResult } from './types';

/**
 * Performance metric
 */
export interface PerformanceMetric {
  /** Metric name */
  name: string;
  
  /** Current value */
  value: number;
  
  /** Trend (improving/declining/stable) */
  trend: 'improving' | 'declining' | 'stable';
  
  /** Confidence in metric (0-1) */
  confidence: number;
  
  /** Historical values */
  history: Array<{ timestamp: number; value: number }>;
}

/**
 * Strategy - a way of approaching situations
 */
export interface Strategy {
  /** Strategy ID */
  id: string;
  
  /** Strategy description */
  description: string;
  
  /** Context where strategy applies */
  context: string[];
  
  /** Success rate */
  successRate: number;
  
  /** Number of times tried */
  attempts: number;
  
  /** Associated actions */
  actions: string[];
  
  /** Conditions for using strategy */
  conditions: string[];
}

/**
 * Error pattern - recurring mistakes
 */
export interface ErrorPattern {
  /** Pattern ID */
  id: string;
  
  /** Pattern description */
  description: string;
  
  /** Frequency */
  frequency: number;
  
  /** Context where it occurs */
  context: string;
  
  /** Root cause (if identified) */
  rootCause?: string;
  
  /** Suggested correction */
  correction?: string;
}

/**
 * Transfer learning record
 */
export interface TransferLearning {
  /** Source context */
  sourceContext: string;
  
  /** Target context */
  targetContext: string;
  
  /** Transferred knowledge */
  knowledge: string;
  
  /** Transfer effectiveness (0-1) */
  effectiveness: number;
  
  /** Timestamp */
  timestamp: number;
}

/**
 * Configuration for meta-learning
 */
export interface MetaLearningConfig {
  /** Minimum attempts before strategy evaluation */
  minAttemptsForEval: number;
  
  /** Success rate threshold for good strategy */
  successThreshold: number;
  
  /** Error pattern detection threshold */
  errorThreshold: number;
  
  /** Maximum strategies to track */
  maxStrategies: number;
  
  /** Learning rate for metric updates */
  metricLearningRate: number;
}

/**
 * Default configuration
 */
export const DEFAULT_METALEARNING_CONFIG: MetaLearningConfig = {
  minAttemptsForEval: 5,
  successThreshold: 0.6,
  errorThreshold: 3,  // Occurs at least 3 times
  maxStrategies: 20,
  metricLearningRate: 0.2
};

/**
 * Meta-Learning System
 * 
 * Learns to learn - adapts strategies and improves across sessions.
 */
export class MetaLearningSystem {
  private metrics: Map<string, PerformanceMetric>;
  private strategies: Strategy[];
  private errorPatterns: ErrorPattern[];
  private transferRecords: TransferLearning[];
  private sessionHistory: Array<{
    actions: string[];
    outcomes: string[];
    performance: number;
  }>;
  private config: MetaLearningConfig;
  
  constructor(config?: Partial<MetaLearningConfig>) {
    this.config = {
      ...DEFAULT_METALEARNING_CONFIG,
      ...config
    };
    
    this.metrics = new Map();
    this.strategies = [];
    this.errorPatterns = [];
    this.transferRecords = [];
    this.sessionHistory = [];
    
    this.initializeMetrics();
  }
  
  /**
   * Record action outcome for learning
   */
  recordOutcome(
    action: Action,
    result: ActionResult,
    context: string
  ): {
    strategiesUpdated: string[];
    errorsDetected: ErrorPattern[];
    metricsUpdated: string[];
  } {
    const response = {
      strategiesUpdated: [] as string[],
      errorsDetected: [] as ErrorPattern[],
      metricsUpdated: [] as string[]
    };
    
    // Update strategies
    const relevantStrategies = this.findRelevantStrategies(action, context);
    
    for (const strategy of relevantStrategies) {
      this.updateStrategy(strategy, result.success);
      response.strategiesUpdated.push(strategy.id);
    }
    
    // If no relevant strategy and action succeeded, learn new strategy
    if (relevantStrategies.length === 0 && result.success) {
      const newStrategy = this.learnNewStrategy(action, context);
      if (newStrategy) {
        this.strategies.push(newStrategy);
        response.strategiesUpdated.push(newStrategy.id);
        
        // Prune if too many
        if (this.strategies.length > this.config.maxStrategies) {
          this.pruneStrategies();
        }
      }
    }
    
    // Detect error patterns if failed
    if (!result.success) {
      const errorPattern = this.detectErrorPattern(action, context, result.message);
      if (errorPattern) {
        response.errorsDetected.push(errorPattern);
      }
    }
    
    // Update performance metrics
    this.updateMetrics(result.success);
    response.metricsUpdated = Array.from(this.metrics.keys());
    
    return response;
  }
  
  /**
   * Get recommended strategy for context
   */
  getRecommendedStrategy(context: string): Strategy | null {
    // Find strategies applicable to context
    const applicable = this.strategies.filter(s =>
      s.context.some(c => context.toLowerCase().includes(c.toLowerCase()))
    );
    
    if (applicable.length === 0) {
      return null;
    }
    
    // Filter by minimum attempts
    const evaluated = applicable.filter(s => 
      s.attempts >= this.config.minAttemptsForEval
    );
    
    if (evaluated.length === 0) {
      // Return most tried unevaluated strategy for exploration
      applicable.sort((a, b) => b.attempts - a.attempts);
      return applicable[0];
    }
    
    // Return best performing
    evaluated.sort((a, b) => b.successRate - a.successRate);
    return evaluated[0];
  }
  
  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    overallTrend: 'improving' | 'declining' | 'stable';
    strengths: string[];
    weaknesses: string[];
  } {
    const metrics = Array.from(this.metrics.values());
    
    // Calculate overall trend
    const improving = metrics.filter(m => m.trend === 'improving').length;
    const declining = metrics.filter(m => m.trend === 'declining').length;
    
    let overallTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (improving > declining) {
      overallTrend = 'improving';
    } else if (declining > improving) {
      overallTrend = 'declining';
    }
    
    // Identify strengths (high performing metrics)
    const strengths = metrics
      .filter(m => m.value > 0.7)
      .map(m => m.name);
    
    // Identify weaknesses (low performing metrics)
    const weaknesses = metrics
      .filter(m => m.value < 0.4)
      .map(m => m.name);
    
    return {
      metrics,
      overallTrend,
      strengths,
      weaknesses
    };
  }
  
  /**
   * Attempt transfer learning from one context to another
   */
  attemptTransfer(
    sourceContext: string,
    targetContext: string
  ): {
    transferred: boolean;
    knowledge?: string;
    strategy?: Strategy;
  } {
    // Find successful strategies in source context
    const sourceStrategies = this.strategies.filter(s =>
      s.context.includes(sourceContext) &&
      s.successRate > this.config.successThreshold &&
      s.attempts >= this.config.minAttemptsForEval
    );
    
    if (sourceStrategies.length === 0) {
      return { transferred: false };
    }
    
    // Take best strategy
    sourceStrategies.sort((a, b) => b.successRate - a.successRate);
    const bestStrategy = sourceStrategies[0];
    
    // Create adapted strategy for target context
    const adaptedStrategy: Strategy = {
      id: `transfer_${Date.now()}`,
      description: `Adapted from ${sourceContext}: ${bestStrategy.description}`,
      context: [targetContext, ...bestStrategy.context],
      successRate: 0.5,  // Start neutral
      attempts: 0,
      actions: [...bestStrategy.actions],
      conditions: [...bestStrategy.conditions]
    };
    
    this.strategies.push(adaptedStrategy);
    
    // Record transfer
    this.transferRecords.push({
      sourceContext,
      targetContext,
      knowledge: bestStrategy.description,
      effectiveness: 0.5,  // Will be updated with use
      timestamp: Date.now()
    });
    
    return {
      transferred: true,
      knowledge: bestStrategy.description,
      strategy: adaptedStrategy
    };
  }
  
  /**
   * Get error patterns
   */
  getErrorPatterns(): ErrorPattern[] {
    return [...this.errorPatterns];
  }
  
  /**
   * Get transfer learning history
   */
  getTransferHistory(): TransferLearning[] {
    return [...this.transferRecords];
  }
  
  /**
   * Get all strategies
   */
  getStrategies(): Strategy[] {
    return [...this.strategies];
  }
  
  /**
   * Clear all learned data (useful for fresh start)
   */
  clearLearning(): void {
    this.strategies = [];
    this.errorPatterns = [];
    this.transferRecords = [];
    this.sessionHistory = [];
    this.initializeMetrics();
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): void {
    const metricNames = ['decision_quality', 'win_rate', 'efficiency', 'adaptability'];
    
    for (const name of metricNames) {
      this.metrics.set(name, {
        name,
        value: 0.5,  // Start neutral
        trend: 'stable',
        confidence: 0.3,  // Low initial confidence
        history: []
      });
    }
  }
  
  /**
   * Find strategies relevant to current action and context
   */
  private findRelevantStrategies(action: Action, context: string): Strategy[] {
    return this.strategies.filter(s => {
      // Check if action matches strategy actions
      const actionMatch = s.actions.some(a => 
        action.name.toLowerCase().includes(a.toLowerCase())
      );
      
      // Check if context matches
      const contextMatch = s.context.some(c =>
        context.toLowerCase().includes(c.toLowerCase())
      );
      
      return actionMatch || contextMatch;
    });
  }
  
  /**
   * Update strategy based on outcome
   */
  private updateStrategy(strategy: Strategy, success: boolean): void {
    strategy.attempts += 1;
    
    // Update success rate (moving average)
    const alpha = 1 / strategy.attempts;  // Decreasing learning rate
    const outcome = success ? 1 : 0;
    
    strategy.successRate = strategy.successRate * (1 - alpha) + outcome * alpha;
  }
  
  /**
   * Learn new strategy from successful action
   */
  private learnNewStrategy(action: Action, context: string): Strategy | null {
    // Extract context keywords
    const contextKeywords = context.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
      .slice(0, 3);
    
    if (contextKeywords.length === 0) {
      return null;
    }
    
    return {
      id: `strategy_${Date.now()}`,
      description: `Use ${action.name} in ${contextKeywords.join(' ')} situations`,
      context: contextKeywords,
      successRate: 1.0,  // First success
      attempts: 1,
      actions: [action.name],
      conditions: [`Context contains: ${contextKeywords.join(', ')}`]
    };
  }
  
  /**
   * Detect error pattern from failure
   */
  private detectErrorPattern(
    action: Action,
    context: string,
    errorMessage?: string
  ): ErrorPattern | null {
    // Create pattern signature
    const signature = `${action.name}_${context}`;
    
    // Check if pattern already exists
    let pattern = this.errorPatterns.find(p => p.id === signature);
    
    if (!pattern) {
      // Create new pattern
      pattern = {
        id: signature,
        description: `${action.name} fails in ${context}`,
        frequency: 1,
        context,
        rootCause: errorMessage
      };
      this.errorPatterns.push(pattern);
    } else {
      // Increment frequency
      pattern.frequency += 1;
    }
    
    // Return if exceeds threshold
    if (pattern.frequency >= this.config.errorThreshold) {
      // Generate correction suggestion
      if (!pattern.correction) {
        pattern.correction = `Consider alternative to ${action.name} in ${context}`;
      }
      return pattern;
    }
    
    return null;
  }
  
  /**
   * Update performance metrics
   */
  private updateMetrics(success: boolean): void {
    const now = Date.now();
    
    // Update decision quality based on recent outcomes
    const decisionQuality = this.metrics.get('decision_quality')!;
    const outcome = success ? 1 : 0;
    
    decisionQuality.value = decisionQuality.value * (1 - this.config.metricLearningRate) +
                            outcome * this.config.metricLearningRate;
    
    // Store in history
    decisionQuality.history.push({ timestamp: now, value: decisionQuality.value });
    
    // Keep history size manageable
    if (decisionQuality.history.length > 100) {
      decisionQuality.history.shift();
    }
    
    // Update trend
    this.updateMetricTrend(decisionQuality);
    
    // Increase confidence with more data
    decisionQuality.confidence = Math.min(1.0, 
      decisionQuality.confidence + 0.01
    );
  }
  
  /**
   * Update metric trend based on history
   */
  private updateMetricTrend(metric: PerformanceMetric): void {
    if (metric.history.length < 10) {
      metric.trend = 'stable';
      return;
    }
    
    // Compare recent vs older values
    const recent = metric.history.slice(-5);
    const older = metric.history.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, h) => sum + h.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.value, 0) / older.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 0.05) {
      metric.trend = 'improving';
    } else if (diff < -0.05) {
      metric.trend = 'declining';
    } else {
      metric.trend = 'stable';
    }
  }
  
  /**
   * Prune least successful strategies
   */
  private pruneStrategies(): void {
    // Sort by success rate * attempts (favor tried and successful)
    this.strategies.sort((a, b) => {
      const scoreA = a.successRate * Math.log(1 + a.attempts);
      const scoreB = b.successRate * Math.log(1 + b.attempts);
      return scoreA - scoreB;
    });
    
    // Remove weakest
    const toRemove = this.strategies.length - this.config.maxStrategies;
    this.strategies.splice(0, toRemove);
  }
}

/**
 * Create meta-learning system
 */
export function createMetaLearningSystem(
  config?: Partial<MetaLearningConfig>
): MetaLearningSystem {
  return new MetaLearningSystem(config);
}
