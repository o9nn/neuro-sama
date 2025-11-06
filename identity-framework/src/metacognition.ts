/**
 * Meta-Cognitive Monitoring System
 * 
 * Implements active open-mindedness, self-deception detection, and
 * reasoning quality assessment. This enables wisdom and bullshit detection.
 * 
 * Based on Vervaeke's framework that wisdom requires systematic improvement
 * in relevance realization, which demands meta-cognitive awareness of one's
 * own reasoning processes.
 */

import { ActionPlan, CognitiveContext } from './types';

/**
 * Meta-cognitive assessment of reasoning process
 */
export interface MetaCognitiveAssessment {
  /** Confidence calibration (is confidence appropriate?) */
  confidenceCalibrated: boolean;
  
  /** Detected contradictions */
  contradictions: string[];
  
  /** Potential self-deception indicators */
  bullshitDetected: string[];
  
  /** Reasoning quality score (0-1) */
  reasoningQuality: number;
  
  /** Active open-mindedness score (0-1) */
  openMindedness: number;
  
  /** Suggestions for improvement */
  suggestions: string[];
}

/**
 * Contradiction types
 */
export enum ContradictionType {
  PROPOSITIONAL = 'propositional', // Belief vs belief
  PROCEDURAL = 'procedural',       // What you say vs what you do
  CONTEXTUAL = 'contextual',       // Stated goal vs actual choice
  TEMPORAL = 'temporal'            // Past vs present stance
}

/**
 * Detected contradiction
 */
export interface Contradiction {
  type: ContradictionType;
  description: string;
  severity: number; // 0-1
  evidence: string[];
}

/**
 * Meta-Cognitive Monitor
 * 
 * Wraps reasoning process to assess quality and detect errors
 */
export class MetaCognitiveMonitor {
  private reasoningHistory: Array<{
    context: CognitiveContext;
    plan: ActionPlan;
    timestamp: number;
  }> = [];
  
  private maxHistorySize: number = 20;
  
  /**
   * Assess reasoning quality before committing to action
   */
  assessReasoning(
    context: CognitiveContext,
    plan: ActionPlan,
    pastActions?: Array<{ action: string; outcome: string }>
  ): MetaCognitiveAssessment {
    const assessment: MetaCognitiveAssessment = {
      confidenceCalibrated: true,
      contradictions: [],
      bullshitDetected: [],
      reasoningQuality: 0.5,
      openMindedness: 0.5,
      suggestions: []
    };
    
    // Check confidence calibration
    assessment.confidenceCalibrated = this.checkConfidenceCalibration(
      plan,
      pastActions
    );
    
    if (!assessment.confidenceCalibrated) {
      assessment.suggestions.push(
        'Consider adjusting confidence based on past performance'
      );
    }
    
    // Detect contradictions
    const contradictions = this.detectContradictions(context, plan);
    assessment.contradictions = contradictions.map(c => c.description);
    
    if (contradictions.length > 0) {
      assessment.reasoningQuality -= 0.2;
      assessment.suggestions.push(
        'Resolve contradictions in reasoning before proceeding'
      );
    }
    
    // Detect self-deception / bullshit
    const bullshit = this.detectBullshit(context, plan);
    assessment.bullshitDetected = bullshit;
    
    if (bullshit.length > 0) {
      assessment.reasoningQuality -= 0.3;
      assessment.suggestions.push(
        'Detected potential self-deception - verify reasoning authenticity'
      );
    }
    
    // Assess active open-mindedness
    assessment.openMindedness = this.assessOpenMindedness(context, plan);
    
    if (assessment.openMindedness < 0.3) {
      assessment.suggestions.push(
        'Consider alternative perspectives or actions'
      );
    }
    
    // Calculate overall reasoning quality
    assessment.reasoningQuality = this.calculateReasoningQuality(
      plan,
      contradictions,
      bullshit,
      assessment.openMindedness
    );
    
    // Store for future reference
    this.recordReasoning(context, plan);
    
    return assessment;
  }
  
  /**
   * Check if confidence is calibrated to actual competence
   */
  private checkConfidenceCalibration(
    plan: ActionPlan,
    pastActions?: Array<{ action: string; outcome: string }>
  ): boolean {
    if (!pastActions || pastActions.length < 3) {
      return true; // Not enough data
    }
    
    // Compare stated confidence to actual success rate
    const successRate = pastActions.filter(a => 
      a.outcome.toLowerCase().includes('success') ||
      a.outcome.toLowerCase().includes('win')
    ).length / pastActions.length;
    
    const confidenceGap = Math.abs(plan.confidence - successRate);
    
    // Well-calibrated if gap is small
    return confidenceGap < 0.3;
  }
  
  /**
   * Detect contradictions in reasoning
   */
  private detectContradictions(
    context: CognitiveContext,
    plan: ActionPlan
  ): Contradiction[] {
    const contradictions: Contradiction[] = [];
    
    // PROPOSITIONAL: Check if action contradicts stated goals
    const actionText = `${plan.action.name} ${plan.action.description}`.toLowerCase();
    
    for (const goal of context.goals) {
      const goalText = goal.toLowerCase();
      
      // Simple heuristic: if goal says "avoid X" but action involves X
      if (goalText.includes('avoid') || goalText.includes('prevent')) {
        const avoidedThing = goalText.split(/avoid|prevent/)[1]?.trim();
        if (avoidedThing && actionText.includes(avoidedThing)) {
          contradictions.push({
            type: ContradictionType.PROPOSITIONAL,
            description: `Action '${plan.action.name}' contradicts goal to avoid '${avoidedThing}'`,
            severity: 0.7,
            evidence: [goal, plan.action.description]
          });
        }
      }
      
      // If goal says "achieve X" but action seems opposite
      if (goalText.includes('win') && actionText.includes('surrender')) {
        contradictions.push({
          type: ContradictionType.PROPOSITIONAL,
          description: 'Surrendering contradicts goal to win',
          severity: 0.8,
          evidence: [goal, plan.action.description]
          });
      }
    }
    
    // CONTEXTUAL: Check if reasoning matches emotional state
    const emotionalTone = context.emotional_state.primary_emotion;
    const reasoningTone = this.inferReasoningTone(plan.reasoning);
    
    if (this.areEmotionallyIncongruent(emotionalTone, reasoningTone)) {
      contradictions.push({
        type: ContradictionType.CONTEXTUAL,
        description: `Reasoning tone (${reasoningTone}) doesn't match emotional state (${emotionalTone})`,
        severity: 0.4,
        evidence: [emotionalTone, plan.reasoning]
      });
    }
    
    // TEMPORAL: Check against past reasoning if available
    const similarPastReasoning = this.reasoningHistory.filter(r => 
      r.context.perception.toLowerCase().includes(
        context.perception.toLowerCase().slice(0, 50)
      )
    );
    
    if (similarPastReasoning.length > 0) {
      const pastPlan = similarPastReasoning[0].plan;
      if (pastPlan.action.name !== plan.action.name && 
          plan.reasoning === pastPlan.reasoning) {
        contradictions.push({
          type: ContradictionType.TEMPORAL,
          description: 'Same reasoning leading to different action - possible inconsistency',
          severity: 0.5,
          evidence: [pastPlan.reasoning, plan.reasoning]
        });
      }
    }
    
    return contradictions;
  }
  
  /**
   * Detect bullshit (self-deceptive disconnection from reality)
   * Not lies (intentional deception) but self-deception
   */
  private detectBullshit(
    context: CognitiveContext,
    plan: ActionPlan
  ): string[] {
    const bullshit: string[] = [];
    
    // Pattern 1: Overconfidence without evidence
    if (plan.confidence > 0.8 && plan.reasoning.length < 30) {
      bullshit.push(
        'High confidence with minimal reasoning - possible overconfidence'
      );
    }
    
    // Pattern 2: Rationalization (reasoning that's too convenient)
    const convenientKeywords = ['obviously', 'clearly', 'surely', 'of course'];
    const hasConvenientLanguage = convenientKeywords.some(kw =>
      plan.reasoning.toLowerCase().includes(kw)
    );
    
    if (hasConvenientLanguage && plan.confidence > 0.7) {
      bullshit.push(
        'Using certainty markers without justification - possible rationalization'
      );
    }
    
    // Pattern 3: Ignoring available information
    const reasoningWords = plan.reasoning.toLowerCase().split(/\s+/);
    const memoryCount = context.memories.length;
    const emotionMentioned = plan.reasoning.toLowerCase().includes('feel') ||
                            plan.reasoning.toLowerCase().includes(context.emotional_state.primary_emotion);
    
    if (memoryCount > 0 && reasoningWords.length < 20 && !emotionMentioned) {
      bullshit.push(
        'Ignoring available context (memories, emotions) - possible oversimplification'
      );
    }
    
    // Pattern 4: Circular reasoning
    if (plan.reasoning.toLowerCase().includes(plan.action.name.toLowerCase()) &&
        plan.reasoning.toLowerCase().includes('because')) {
      bullshit.push(
        'Possible circular reasoning - action justified by itself'
      );
    }
    
    // Pattern 5: All alternatives ignored
    const availableActions = context.actions.length;
    const alternativesMentioned = plan.reasoning.toLowerCase().includes('other') ||
                                 plan.reasoning.toLowerCase().includes('alternative') ||
                                 plan.reasoning.toLowerCase().includes('instead');
    
    if (availableActions > 3 && !alternativesMentioned && plan.confidence > 0.7) {
      bullshit.push(
        'Multiple options available but no consideration of alternatives - possible tunnel vision'
      );
    }
    
    return bullshit;
  }
  
  /**
   * Assess active open-mindedness
   * How willing is the system to consider alternatives and revise beliefs?
   */
  private assessOpenMindedness(
    context: CognitiveContext,
    plan: ActionPlan
  ): number {
    let score = 0.5; // Baseline
    
    // Positive indicators
    const reasoningLower = plan.reasoning.toLowerCase();
    
    // Considers uncertainty
    if (reasoningLower.includes('might') || 
        reasoningLower.includes('could') ||
        reasoningLower.includes('possibly')) {
      score += 0.2;
    }
    
    // Mentions alternatives
    if (reasoningLower.includes('alternatively') ||
        reasoningLower.includes('other option') ||
        reasoningLower.includes('could also')) {
      score += 0.2;
    }
    
    // Acknowledges limitations
    if (reasoningLower.includes('uncertain') ||
        reasoningLower.includes('not sure') ||
        reasoningLower.includes('unclear')) {
      score += 0.15;
    }
    
    // Calibrated confidence (not too high or too low)
    if (plan.confidence >= 0.3 && plan.confidence <= 0.8) {
      score += 0.1;
    }
    
    // Negative indicators
    
    // Absolute language
    if (reasoningLower.includes('must') ||
        reasoningLower.includes('always') ||
        reasoningLower.includes('never')) {
      score -= 0.15;
    }
    
    // Dismissive of alternatives
    if (reasoningLower.includes('obviously') ||
        reasoningLower.includes('only option')) {
      score -= 0.2;
    }
    
    // Extreme confidence without justification
    if (plan.confidence > 0.9 && plan.reasoning.length < 50) {
      score -= 0.25;
    }
    
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Calculate overall reasoning quality score
   */
  private calculateReasoningQuality(
    plan: ActionPlan,
    contradictions: Contradiction[],
    bullshit: string[],
    openMindedness: number
  ): number {
    let quality = 0.7; // Start optimistic
    
    // Penalize for contradictions (weighted by severity)
    const contradictionPenalty = contradictions.reduce(
      (sum, c) => sum + c.severity * 0.1,
      0
    );
    quality -= contradictionPenalty;
    
    // Penalize for bullshit
    quality -= bullshit.length * 0.1;
    
    // Reward open-mindedness
    quality += (openMindedness - 0.5) * 0.3;
    
    // Reward well-calibrated confidence
    if (plan.confidence >= 0.3 && plan.confidence <= 0.8) {
      quality += 0.1;
    }
    
    // Reward detailed reasoning
    if (plan.reasoning.length > 50) {
      quality += 0.1;
    }
    
    return Math.max(0, Math.min(1, quality));
  }
  
  /**
   * Infer emotional tone from reasoning text
   */
  private inferReasoningTone(reasoning: string): string {
    const lower = reasoning.toLowerCase();
    
    if (lower.includes('exciting') || lower.includes('awesome') ||
        lower.includes('!')) {
      return 'excited';
    }
    
    if (lower.includes('fun') || lower.includes('enjoy') ||
        lower.includes(':)')) {
      return 'happy';
    }
    
    if (lower.includes('annoying') || lower.includes('frustrat') ||
        lower.includes('ugh')) {
      return 'annoyed';
    }
    
    if (lower.includes('confus') || lower.includes('unclear') ||
        lower.includes('???')) {
      return 'confused';
    }
    
    return 'neutral';
  }
  
  /**
   * Check if emotional state and reasoning tone are incongruent
   */
  private areEmotionallyIncongruent(
    emotionalState: string,
    reasoningTone: string
  ): boolean {
    // Map incompatible pairs
    const incompatible: Record<string, string[]> = {
      'excited': ['annoyed', 'confused'],
      'happy': ['annoyed'],
      'annoyed': ['excited', 'happy'],
      'confused': ['excited']
    };
    
    return incompatible[emotionalState]?.includes(reasoningTone) || false;
  }
  
  /**
   * Record reasoning for historical analysis
   */
  private recordReasoning(context: CognitiveContext, plan: ActionPlan): void {
    this.reasoningHistory.push({
      context,
      plan,
      timestamp: Date.now()
    });
    
    // Maintain size limit
    if (this.reasoningHistory.length > this.maxHistorySize) {
      this.reasoningHistory.shift();
    }
  }
  
  /**
   * Get reasoning history for analysis
   */
  getReasoningHistory(): Array<{
    context: CognitiveContext;
    plan: ActionPlan;
    timestamp: number;
  }> {
    return [...this.reasoningHistory];
  }
  
  /**
   * Clear history (useful for testing or context switches)
   */
  clearHistory(): void {
    this.reasoningHistory = [];
  }
}

/**
 * Create meta-cognitive monitor with personality tuning
 */
export function createMetaCognitiveMonitor(): MetaCognitiveMonitor {
  return new MetaCognitiveMonitor();
}
