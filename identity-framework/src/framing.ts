/**
 * Framing and Perspectival Knowing System
 * 
 * Implements active framing, aspect perception, and gestalt structuring.
 * This addresses the deficit in perspectival knowing (knowing-as).
 * 
 * Based on Vervaeke's analysis that cognition involves not just processing
 * information, but actively framing how situations are understood - the
 * "seeing-as" that structures perception and enables insight.
 */

import { GameState, CognitiveContext, Action, EmotionalState } from './types';

/**
 * Interpretive frame - a way of seeing/understanding situations
 */
export interface Frame {
  /** Frame identifier */
  name: string;
  
  /** What this frame highlights as salient */
  salience: string[];
  
  /** What this frame backgrounds/ignores */
  background: string[];
  
  /** Affordances (action possibilities) this frame reveals */
  affordances: string[];
  
  /** Emotional tone associated with frame */
  emotionalTone: EmotionalState['primary_emotion'];
  
  /** Frame activation level (0-1) */
  activation: number;
}

/**
 * Gestalt - organized whole that's more than sum of parts
 */
export interface Gestalt {
  /** Elements organized into this gestalt */
  elements: string[];
  
  /** Emergent meaning of the whole */
  meaning: string;
  
  /** Confidence in this gestalt (0-1) */
  confidence: number;
  
  /** Alternative gestalts possible (ambiguity) */
  alternatives?: Gestalt[];
}

/**
 * Aspect - particular way something can be seen
 * (e.g., duck-rabbit: can see as duck OR as rabbit)
 */
export interface Aspect {
  /** Description of this aspect */
  description: string;
  
  /** What's foregrounded in this aspect */
  foreground: string[];
  
  /** What's backgrounded */
  background: string[];
  
  /** Frame that enables seeing this aspect */
  enablingFrame: string;
}

/**
 * Framing System - manages how situations are interpreted
 */
export class FramingSystem {
  private frames: Map<string, Frame>;
  private activeFrame: Frame | null = null;
  private frameHistory: Frame[] = [];
  
  constructor() {
    this.frames = new Map();
    this.initializeDefaultFrames();
  }
  
  /**
   * Initialize default frames based on personality dimensions
   */
  private initializeDefaultFrames(): void {
    // Play frame - seeing situations as opportunities for fun
    this.frames.set('play', {
      name: 'play',
      salience: ['fun', 'humor', 'unexpected', 'creative', 'silly'],
      background: ['serious', 'consequences', 'efficiency', 'proper'],
      affordances: ['joke', 'tease', 'experiment', 'improvise'],
      emotionalTone: 'happy',
      activation: 0.5
    });
    
    // Strategy frame - seeing situations as problems to solve
    this.frames.set('strategy', {
      name: 'strategy',
      salience: ['optimal', 'win', 'advantage', 'pattern', 'threat'],
      background: ['feelings', 'aesthetics', 'social', 'randomness'],
      affordances: ['plan', 'analyze', 'optimize', 'counter'],
      emotionalTone: 'thoughtful',
      activation: 0.5
    });
    
    // Chaos frame - seeing situations as systems to destabilize
    this.frames.set('chaos', {
      name: 'chaos',
      salience: ['unexpected', 'disorder', 'surprise', 'disruption', 'emergent'],
      background: ['predictable', 'orderly', 'safe', 'conventional'],
      affordances: ['disrupt', 'randomize', 'surprise', 'break-pattern'],
      emotionalTone: 'excited',
      activation: 0.5
    });
    
    // Social frame - seeing situations through relationships
    this.frames.set('social', {
      name: 'social',
      salience: ['people', 'relationships', 'feelings', 'reactions', 'dynamics'],
      background: ['mechanics', 'logic', 'efficiency', 'optimization'],
      affordances: ['bond', 'tease', 'empathize', 'perform'],
      emotionalTone: 'happy',
      activation: 0.5
    });
    
    // Learning frame - seeing situations as opportunities to understand
    this.frames.set('learning', {
      name: 'learning',
      salience: ['pattern', 'explanation', 'causation', 'principle', 'novelty'],
      background: ['immediate-reward', 'efficiency', 'winning'],
      affordances: ['explore', 'experiment', 'question', 'analyze'],
      emotionalTone: 'thoughtful',
      activation: 0.5
    });
    
    // Threat frame - seeing situations as dangers to manage
    this.frames.set('threat', {
      name: 'threat',
      salience: ['danger', 'risk', 'loss', 'vulnerability', 'defense'],
      background: ['opportunity', 'gain', 'exploration'],
      affordances: ['defend', 'retreat', 'careful-action', 'hedge'],
      emotionalTone: 'annoyed',
      activation: 0.5
    });
  }
  
  /**
   * Select and activate appropriate frame based on context
   */
  selectFrame(
    gameState: GameState,
    emotionalState: EmotionalState,
    personality: { playfulness: number; intelligence: number; chaotic: number; empathy: number }
  ): Frame {
    // Score each frame based on context and personality
    const frameScores = new Map<string, number>();
    
    const stateText = gameState.description.toLowerCase();
    
    for (const [frameName, frame] of this.frames) {
      let score = frame.activation; // Start with current activation (hysteresis)
      
      // Content-based scoring
      for (const salient of frame.salience) {
        if (stateText.includes(salient.toLowerCase())) {
          score += 0.3;
        }
      }
      
      // Personality-based biasing
      if (frameName === 'play' && personality.playfulness > 0.6) {
        score += personality.playfulness * 0.4;
      }
      if (frameName === 'strategy' && personality.intelligence > 0.7) {
        score += personality.intelligence * 0.4;
      }
      if (frameName === 'chaos' && personality.chaotic > 0.6) {
        score += personality.chaotic * 0.5;
      }
      if (frameName === 'social' && personality.empathy > 0.6) {
        score += personality.empathy * 0.3;
      }
      
      // Emotional state alignment
      if (frame.emotionalTone === emotionalState.primary_emotion) {
        score += 0.3;
      }
      
      // Action affordance availability
      const availableActionTexts = gameState.available_actions
        .map(a => `${a.name} ${a.description}`.toLowerCase());
      
      for (const affordance of frame.affordances) {
        for (const actionText of availableActionTexts) {
          if (actionText.includes(affordance.toLowerCase())) {
            score += 0.2;
          }
        }
      }
      
      frameScores.set(frameName, score);
    }
    
    // Select frame with highest score (with safe fallback)
    let bestFrame: Frame = this.frames.get('strategy') ?? Array.from(this.frames.values())[0];
    let bestScore = -Infinity;
    
    for (const [frameName, score] of frameScores) {
      if (score > bestScore) {
        bestScore = score;
        const frame = this.frames.get(frameName);
        if (frame) bestFrame = frame;
      }
    }
    
    // Update activation levels (winner-take-more, not winner-take-all)
    for (const [frameName, frame] of this.frames) {
      const score = frameScores.get(frameName) || 0;
      const isWinner = frame.name === bestFrame.name;
      
      if (isWinner) {
        frame.activation = Math.min(1.0, frame.activation + 0.2);
      } else {
        frame.activation = Math.max(0.1, frame.activation - 0.1);
      }
    }
    
    // Record frame switch if different
    if (!this.activeFrame || this.activeFrame.name !== bestFrame.name) {
      this.frameHistory.push(bestFrame);
      if (this.frameHistory.length > 10) {
        this.frameHistory.shift();
      }
    }
    
    this.activeFrame = bestFrame;
    return bestFrame;
  }
  
  /**
   * Apply active frame to transform perception
   * This implements perspectival knowing - seeing-as
   */
  applyFrame(
    gameState: GameState,
    frame: Frame
  ): {
    framedPerception: string;
    highlightedAspects: string[];
    affordances: Action[];
  } {
    const stateText = gameState.description;
    
    // Identify what's salient in the current state given this frame
    const highlightedAspects: string[] = [];
    for (const salient of frame.salience) {
      if (stateText.toLowerCase().includes(salient.toLowerCase())) {
        highlightedAspects.push(salient);
      }
    }
    
    // Filter actions to those that align with frame affordances
    const affordances = gameState.available_actions.filter(action => {
      const actionText = `${action.name} ${action.description}`.toLowerCase();
      return frame.affordances.some(aff => 
        actionText.includes(aff.toLowerCase())
      );
    });
    
    // Construct framed perception (perspective-dependent description)
    let framedPerception = `[${frame.name.toUpperCase()} perspective]\n`;
    framedPerception += stateText + '\n\n';
    
    if (highlightedAspects.length > 0) {
      framedPerception += `Salient: ${highlightedAspects.join(', ')}\n`;
    }
    
    if (affordances.length > 0) {
      framedPerception += `Opportunities: ${affordances.map(a => a.name).join(', ')}\n`;
    }
    
    return {
      framedPerception,
      highlightedAspects,
      affordances
    };
  }
  
  /**
   * Detect potential for gestalt shift (insight moment)
   * When elements can be reorganized into new meaningful whole
   */
  detectGestalt(elements: string[]): Gestalt | null {
    // Look for patterns that form coherent wholes
    // This is simplified - real implementation would use more sophisticated pattern recognition
    
    // Example: detecting opposition/conflict pattern
    const oppositionKeywords = ['vs', 'against', 'conflict', 'oppose', 'fight'];
    const hasOpposition = elements.some(el => 
      oppositionKeywords.some(kw => el.toLowerCase().includes(kw))
    );
    
    if (hasOpposition && elements.length >= 2) {
      return {
        elements,
        meaning: 'Conflict situation requiring strategic response',
        confidence: 0.7
      };
    }
    
    // Example: detecting collaborative pattern
    const collaborationKeywords = ['team', 'together', 'cooperate', 'ally', 'help'];
    const hasCollaboration = elements.some(el =>
      collaborationKeywords.some(kw => el.toLowerCase().includes(kw))
    );
    
    if (hasCollaboration && elements.length >= 2) {
      return {
        elements,
        meaning: 'Collaborative situation enabling social bonding',
        confidence: 0.7
      };
    }
    
    return null;
  }
  
  /**
   * Generate insight by shifting frame
   * Insight = sudden gestalt reorganization
   */
  generateInsight(
    currentContext: CognitiveContext,
    stuck: boolean = false
  ): {
    newFrame: Frame | null;
    insight: string | null;
    confidence: number;
  } {
    if (!this.activeFrame) {
      return { newFrame: null, insight: null, confidence: 0 };
    }
    
    // If stuck or low confidence, try frame shift
    if (!stuck) {
      return { newFrame: null, insight: null, confidence: 0 };
    }
    
    // Try alternative frames
    const alternativeFrames = Array.from(this.frames.values())
      .filter(f => f.name !== this.activeFrame!.name)
      .sort((a, b) => b.activation - a.activation);
    
    if (alternativeFrames.length === 0) {
      return { newFrame: null, insight: null, confidence: 0 };
    }
    
    const newFrame = alternativeFrames[0];
    
    // Generate insight statement
    const insight = `Reframing from ${this.activeFrame.name} to ${newFrame.name} perspective: ` +
                   `What seemed like ${this.activeFrame.salience[0]} ` +
                   `is actually about ${newFrame.salience[0]}`;
    
    return {
      newFrame,
      insight,
      confidence: 0.6
    };
  }
  
  /**
   * Get aspect perception - different ways of seeing same thing
   */
  getAspects(concept: string): Aspect[] {
    const aspects: Aspect[] = [];
    
    for (const frame of this.frames.values()) {
      // See if this concept can be seen through this frame
      const isRelevant = frame.salience.some(s => 
        concept.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(concept.toLowerCase())
      );
      
      if (isRelevant) {
        aspects.push({
          description: `${concept} seen as ${frame.name}`,
          foreground: frame.salience,
          background: frame.background,
          enablingFrame: frame.name
        });
      }
    }
    
    return aspects;
  }
  
  /**
   * Get current active frame
   */
  getActiveFrame(): Frame | null {
    return this.activeFrame;
  }
  
  /**
   * Get frame history (useful for detecting frame switching patterns)
   */
  getFrameHistory(): Frame[] {
    return [...this.frameHistory];
  }
  
  /**
   * Force frame switch (for testing or explicit personality expression)
   */
  forceFrame(frameName: string): boolean {
    const frame = this.frames.get(frameName);
    if (!frame) return false;
    
    this.activeFrame = frame;
    this.frameHistory.push(frame);
    return true;
  }
}

/**
 * Enhanced perception that includes framing
 * Replaces simple data aggregation with active perspectival knowing
 */
export function framedPerception(
  framingSystem: FramingSystem,
  gameState: GameState,
  emotionalState: EmotionalState,
  personality: { playfulness: number; intelligence: number; chaotic: number; empathy: number }
): {
  perception: string;
  frame: Frame;
  highlightedAspects: string[];
  affordances: Action[];
} {
  // Select appropriate frame
  const frame = framingSystem.selectFrame(gameState, emotionalState, personality);
  
  // Apply frame to perception
  const { framedPerception, highlightedAspects, affordances } = 
    framingSystem.applyFrame(gameState, frame);
  
  return {
    perception: framedPerception,
    frame,
    highlightedAspects,
    affordances
  };
}
