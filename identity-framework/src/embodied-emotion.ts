/**
 * Embodied Emotion System
 * 
 * Implements embodied cognition principles where emotions are grounded
 * in bodily states (somatic markers) and avatar representations.
 * 
 * Based on Vervaeke's 4E cognition framework - emotions are:
 * - Embodied: Grounded in physical/avatar state
 * - Embedded: Contextually situated
 * - Enacted: Manifested through behavior
 * - Extended: Distributed across avatar and environment
 * 
 * Also implements Damasio's somatic marker hypothesis - emotions
 * guide decision-making through bodily signals.
 */

import { EmotionalState, Action, Episode } from './types';

/**
 * Avatar state representation
 * Physical/virtual body state that grounds emotion
 */
export interface AvatarState {
  /** Physical posture/stance */
  posture: 'neutral' | 'confident' | 'defensive' | 'aggressive' | 'relaxed' | 'tense';
  
  /** Movement energy level */
  energyLevel: number; // 0-1
  
  /** Facial expression (for avatar) */
  expression: 'neutral' | 'smile' | 'frown' | 'surprise' | 'anger' | 'confusion' | 'joy';
  
  /** Gesture tendency */
  gestureIntensity: number; // 0-1, how animated
  
  /** Voice characteristics (for TTS) */
  voice: {
    pitch: number; // 0-1, low to high
    speed: number; // 0-1, slow to fast
    volume: number; // 0-1, quiet to loud
  };
  
  /** Timestamp of last update */
  lastUpdate: number;
}

/**
 * Somatic marker - bodily signal associated with experience
 * These guide intuitive decision-making
 */
export interface SomaticMarker {
  /** Associated action or situation */
  trigger: string;
  
  /** Bodily sensation (positive/negative valence) */
  valence: number; // -1 to 1
  
  /** Intensity of sensation */
  intensity: number; // 0-1
  
  /** Confidence in this marker */
  confidence: number; // 0-1
  
  /** Number of reinforcements */
  reinforcements: number;
  
  /** Last activation timestamp */
  lastActivated: number;
}

/**
 * Emotion-action coupling
 * How emotional states predispose toward actions
 */
export interface EmotionActionCoupling {
  /** Emotional state */
  emotion: EmotionalState['primary_emotion'];
  
  /** Actions facilitated by this emotion */
  facilitatedActions: string[];
  
  /** Actions inhibited by this emotion */
  inhibitedActions: string[];
  
  /** Activation threshold for this emotion */
  threshold: number;
}

/**
 * Configuration for embodied emotion system
 */
export interface EmbodiedEmotionConfig {
  /** Rate of somatic marker learning */
  learningRate: number;
  
  /** Decay rate for unused markers */
  decayRate: number;
  
  /** Threshold for marker activation */
  activationThreshold: number;
  
  /** Avatar state update frequency (ms) */
  updateFrequency: number;
  
  /** Maximum somatic markers to maintain */
  maxMarkers: number;
}

/**
 * Default configuration
 */
export const DEFAULT_EMBODIED_EMOTION_CONFIG: EmbodiedEmotionConfig = {
  learningRate: 0.15,
  decayRate: 0.02,
  activationThreshold: 0.4,
  updateFrequency: 100,
  maxMarkers: 100
};

/**
 * Embodied Emotion System
 * 
 * Manages the integration of emotional states with avatar representation
 * and somatic markers for embodied decision-making.
 */
export class EmbodiedEmotionSystem {
  private avatarState: AvatarState;
  private somaticMarkers: Map<string, SomaticMarker>;
  private emotionActionCouplings: EmotionActionCoupling[];
  private config: EmbodiedEmotionConfig;
  
  constructor(config?: Partial<EmbodiedEmotionConfig>) {
    this.config = {
      ...DEFAULT_EMBODIED_EMOTION_CONFIG,
      ...config
    };
    
    this.avatarState = this.createDefaultAvatarState();
    this.somaticMarkers = new Map();
    this.emotionActionCouplings = this.initializeEmotionActionCouplings();
  }
  
  /**
   * Update avatar state based on emotional state
   * This is the embodiment - mapping emotion to physical representation
   */
  updateAvatarState(
    emotionalState: EmotionalState,
    contextualFactors?: {
      recentSuccess?: boolean;
      underThreat?: boolean;
      socialContext?: boolean;
    }
  ): AvatarState {
    const now = Date.now();
    
    // Map emotional state to avatar state
    const { primary_emotion, intensity, valence, arousal } = emotionalState;
    
    // Update posture based on emotion and context
    this.avatarState.posture = this.determinePosture(
      primary_emotion,
      valence,
      contextualFactors
    );
    
    // Update expression
    this.avatarState.expression = this.determineExpression(primary_emotion);
    
    // Update energy level (combines intensity and arousal)
    this.avatarState.energyLevel = (intensity * 0.5 + arousal * 0.5);
    
    // Update gesture intensity
    this.avatarState.gestureIntensity = this.determineGestureIntensity(
      primary_emotion,
      arousal,
      intensity
    );
    
    // Update voice characteristics
    this.avatarState.voice = this.determineVoiceCharacteristics(
      primary_emotion,
      arousal,
      valence
    );
    
    this.avatarState.lastUpdate = now;
    
    return { ...this.avatarState };
  }
  
  /**
   * Create or update somatic marker based on experience
   * This is how the body "learns" from experience
   */
  learnSomaticMarker(
    trigger: string,
    outcome: 'positive' | 'negative' | 'neutral',
    intensity: number
  ): void {
    const valenceMap = {
      positive: 1,
      neutral: 0,
      negative: -1
    };
    
    const targetValence = valenceMap[outcome];
    
    let marker = this.somaticMarkers.get(trigger);
    
    if (!marker) {
      // Create new marker
      marker = {
        trigger,
        valence: targetValence * intensity,
        intensity,
        confidence: 0.3,  // Start with low confidence
        reinforcements: 1,
        lastActivated: Date.now()
      };
      this.somaticMarkers.set(trigger, marker);
    } else {
      // Update existing marker (reinforcement learning)
      const learningRate = this.config.learningRate;
      
      // Update valence (moving average)
      marker.valence = marker.valence * (1 - learningRate) + 
                      (targetValence * intensity) * learningRate;
      
      // Update intensity (peak-based)
      marker.intensity = Math.max(marker.intensity, intensity);
      
      // Increase confidence with reinforcements
      marker.confidence = Math.min(1.0, 
        marker.confidence + 0.1 * (1 - marker.confidence)
      );
      
      marker.reinforcements += 1;
      marker.lastActivated = Date.now();
    }
    
    // Prune if too many markers
    if (this.somaticMarkers.size > this.config.maxMarkers) {
      this.pruneSomaticMarkers();
    }
  }
  
  /**
   * Get somatic guidance for action selection
   * Returns intuitive "gut feeling" about actions
   */
  getSomaticGuidance(actions: Action[]): Map<string, {
    valence: number;
    intensity: number;
    confidence: number;
  }> {
    const guidance = new Map<string, {
      valence: number;
      intensity: number;
      confidence: number;
    }>();
    
    // Apply decay to all markers
    this.applySomaticDecay();
    
    for (const action of actions) {
      // Check for direct marker
      const directMarker = this.somaticMarkers.get(action.name);
      
      // Check for similar markers (keyword matching)
      const similarMarkers = this.findSimilarMarkers(action.name);
      
      if (directMarker) {
        guidance.set(action.name, {
          valence: directMarker.valence,
          intensity: directMarker.intensity,
          confidence: directMarker.confidence
        });
      } else if (similarMarkers.length > 0) {
        // Aggregate similar markers
        const avgValence = similarMarkers.reduce((sum, m) => sum + m.valence, 0) / 
                          similarMarkers.length;
        const avgIntensity = similarMarkers.reduce((sum, m) => sum + m.intensity, 0) / 
                            similarMarkers.length;
        const avgConfidence = similarMarkers.reduce((sum, m) => sum + m.confidence, 0) / 
                             similarMarkers.length;
        
        guidance.set(action.name, {
          valence: avgValence * 0.7,  // Discounted for being indirect
          intensity: avgIntensity * 0.7,
          confidence: avgConfidence * 0.5
        });
      } else {
        // No marker - neutral guidance
        guidance.set(action.name, {
          valence: 0,
          intensity: 0,
          confidence: 0
        });
      }
    }
    
    return guidance;
  }
  
  /**
   * Get emotion-action coupling effects
   * How current emotion biases action selection
   */
  getEmotionActionBias(
    emotionalState: EmotionalState,
    actions: Action[]
  ): Map<string, number> {
    const bias = new Map<string, number>();
    
    // Find relevant coupling
    const coupling = this.emotionActionCouplings.find(c => 
      c.emotion === emotionalState.primary_emotion
    );
    
    if (!coupling) {
      // No coupling found - neutral bias
      actions.forEach(a => bias.set(a.name, 0));
      return bias;
    }
    
    for (const action of actions) {
      const actionText = `${action.name} ${action.description}`.toLowerCase();
      
      // Check if action is facilitated
      const isFacilitated = coupling.facilitatedActions.some(fa => 
        actionText.includes(fa.toLowerCase())
      );
      
      // Check if action is inhibited
      const isInhibited = coupling.inhibitedActions.some(ia => 
        actionText.includes(ia.toLowerCase())
      );
      
      let biasValue = 0;
      
      if (isFacilitated) {
        biasValue = emotionalState.intensity * 0.3;  // Positive bias
      } else if (isInhibited) {
        biasValue = -emotionalState.intensity * 0.3;  // Negative bias
      }
      
      bias.set(action.name, biasValue);
    }
    
    return bias;
  }
  
  /**
   * Integrate somatic and emotional biases into action scores
   */
  integrateEmbodiedBiases(
    actions: Action[],
    baseScores: Map<string, number>,
    emotionalState: EmotionalState
  ): Map<string, number> {
    const somaticGuidance = this.getSomaticGuidance(actions);
    const emotionBias = this.getEmotionActionBias(emotionalState, actions);
    
    const integratedScores = new Map<string, number>();
    
    for (const action of actions) {
      const baseScore = baseScores.get(action.name) || 0.5;
      const somatic = somaticGuidance.get(action.name)!;
      const bias = emotionBias.get(action.name) || 0;
      
      // Integrate signals with weighting
      let integratedScore = baseScore;
      
      // Somatic marker influence (weighted by confidence)
      if (somatic.confidence > this.config.activationThreshold) {
        integratedScore += somatic.valence * somatic.intensity * somatic.confidence * 0.2;
      }
      
      // Emotion-action coupling influence
      integratedScore += bias;
      
      // Normalize to 0-1 range
      integratedScore = Math.max(0, Math.min(1, integratedScore));
      
      integratedScores.set(action.name, integratedScore);
    }
    
    return integratedScores;
  }
  
  /**
   * Get current avatar state
   */
  getAvatarState(): AvatarState {
    return { ...this.avatarState };
  }
  
  /**
   * Get all somatic markers (for inspection/debugging)
   */
  getSomaticMarkers(): Map<string, SomaticMarker> {
    return new Map(this.somaticMarkers);
  }
  
  /**
   * Clear all somatic markers (useful for testing)
   */
  clearMarkers(): void {
    this.somaticMarkers.clear();
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Create default neutral avatar state
   */
  private createDefaultAvatarState(): AvatarState {
    return {
      posture: 'neutral',
      energyLevel: 0.5,
      expression: 'neutral',
      gestureIntensity: 0.5,
      voice: {
        pitch: 0.5,
        speed: 0.5,
        volume: 0.5
      },
      lastUpdate: Date.now()
    };
  }
  
  /**
   * Determine posture from emotional state
   */
  private determinePosture(
    emotion: EmotionalState['primary_emotion'],
    valence: number,
    context?: {
      recentSuccess?: boolean;
      underThreat?: boolean;
      socialContext?: boolean;
    }
  ): AvatarState['posture'] {
    // Threat response
    if (context?.underThreat) {
      return emotion === 'annoyed' ? 'aggressive' : 'defensive';
    }
    
    // Success boost
    if (context?.recentSuccess && valence > 0.5) {
      return 'confident';
    }
    
    // Emotion-based mapping
    switch (emotion) {
      case 'excited':
      case 'happy':
        return 'relaxed';
      case 'annoyed':
        return 'tense';
      case 'confused':
        return 'defensive';
      case 'thoughtful':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
  
  /**
   * Determine facial expression from emotion
   */
  private determineExpression(
    emotion: EmotionalState['primary_emotion']
  ): AvatarState['expression'] {
    const expressionMap: Record<string, AvatarState['expression']> = {
      'happy': 'smile',
      'excited': 'joy',
      'annoyed': 'anger',
      'confused': 'confusion',
      'thoughtful': 'neutral',
      'neutral': 'neutral'
    };
    
    return expressionMap[emotion] || 'neutral';
  }
  
  /**
   * Determine gesture intensity
   */
  private determineGestureIntensity(
    emotion: EmotionalState['primary_emotion'],
    arousal: number,
    intensity: number
  ): number {
    const baseIntensity = (arousal * 0.6 + intensity * 0.4);
    
    // Emotion modifiers
    const modifiers: Record<string, number> = {
      'excited': 1.3,
      'happy': 1.1,
      'annoyed': 0.7,
      'confused': 0.8,
      'thoughtful': 0.6,
      'neutral': 1.0
    };
    
    const modifier = modifiers[emotion] || 1.0;
    
    return Math.max(0, Math.min(1, baseIntensity * modifier));
  }
  
  /**
   * Determine voice characteristics
   */
  private determineVoiceCharacteristics(
    emotion: EmotionalState['primary_emotion'],
    arousal: number,
    valence: number
  ): AvatarState['voice'] {
    // Pitch correlates with arousal and valence
    const pitch = 0.5 + (arousal * 0.3) + (valence * 0.2);
    
    // Speed correlates with arousal
    const speed = 0.5 + (arousal * 0.4);
    
    // Volume correlates with arousal and intensity
    const volume = 0.5 + (arousal * 0.4);
    
    return {
      pitch: Math.max(0, Math.min(1, pitch)),
      speed: Math.max(0, Math.min(1, speed)),
      volume: Math.max(0, Math.min(1, volume))
    };
  }
  
  /**
   * Initialize emotion-action couplings
   */
  private initializeEmotionActionCouplings(): EmotionActionCoupling[] {
    return [
      {
        emotion: 'excited',
        facilitatedActions: ['attack', 'explore', 'experiment', 'risk', 'chaos'],
        inhibitedActions: ['wait', 'careful', 'conservative', 'defensive'],
        threshold: 0.6
      },
      {
        emotion: 'happy',
        facilitatedActions: ['social', 'cooperate', 'share', 'help', 'play'],
        inhibitedActions: ['aggressive', 'hostile', 'isolate'],
        threshold: 0.5
      },
      {
        emotion: 'annoyed',
        facilitatedActions: ['confront', 'challenge', 'aggressive', 'direct'],
        inhibitedActions: ['cooperate', 'friendly', 'patient'],
        threshold: 0.5
      },
      {
        emotion: 'confused',
        facilitatedActions: ['question', 'learn', 'seek-help', 'careful'],
        inhibitedActions: ['confident', 'decisive', 'quick'],
        threshold: 0.4
      },
      {
        emotion: 'thoughtful',
        facilitatedActions: ['analyze', 'plan', 'strategic', 'careful'],
        inhibitedActions: ['impulsive', 'rushed', 'careless'],
        threshold: 0.5
      },
      {
        emotion: 'neutral',
        facilitatedActions: [],
        inhibitedActions: [],
        threshold: 0.3
      }
    ];
  }
  
  /**
   * Find markers similar to trigger (keyword matching)
   */
  private findSimilarMarkers(trigger: string): SomaticMarker[] {
    const triggerWords = trigger.toLowerCase().split(/\s+/);
    const similar: SomaticMarker[] = [];
    
    for (const [markerTrigger, marker] of this.somaticMarkers) {
      const markerWords = markerTrigger.toLowerCase().split(/\s+/);
      
      // Check for word overlap
      const overlap = triggerWords.filter(w => 
        markerWords.some(mw => mw.includes(w) || w.includes(mw))
      );
      
      if (overlap.length > 0) {
        similar.push(marker);
      }
    }
    
    return similar;
  }
  
  /**
   * Apply temporal decay to somatic markers
   */
  private applySomaticDecay(): void {
    const now = Date.now();
    const decayRate = this.config.decayRate;
    
    for (const [trigger, marker] of this.somaticMarkers) {
      const timeSinceActivation = (now - marker.lastActivated) / 1000; // seconds
      
      // Exponential decay
      const decayFactor = Math.exp(-decayRate * timeSinceActivation / 60); // per minute
      
      marker.intensity *= decayFactor;
      marker.confidence *= decayFactor;
      
      // Remove if too weak
      if (marker.intensity < 0.1 || marker.confidence < 0.1) {
        this.somaticMarkers.delete(trigger);
      }
    }
  }
  
  /**
   * Prune weakest somatic markers to maintain size limit
   */
  private pruneSomaticMarkers(): void {
    const markers = Array.from(this.somaticMarkers.entries());
    
    // Sort by combined strength (confidence * intensity * reinforcements)
    markers.sort((a, b) => {
      const strengthA = a[1].confidence * a[1].intensity * Math.log(1 + a[1].reinforcements);
      const strengthB = b[1].confidence * b[1].intensity * Math.log(1 + b[1].reinforcements);
      return strengthA - strengthB;
    });
    
    // Remove weakest until under limit
    const toRemove = markers.length - this.config.maxMarkers;
    for (let i = 0; i < toRemove; i++) {
      this.somaticMarkers.delete(markers[i][0]);
    }
  }
}

/**
 * Create embodied emotion system
 */
export function createEmbodiedEmotionSystem(
  config?: Partial<EmbodiedEmotionConfig>
): EmbodiedEmotionSystem {
  return new EmbodiedEmotionSystem(config);
}
