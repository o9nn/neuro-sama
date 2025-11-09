/**
 * Transformative Experience System
 * 
 * Implements detection and handling of transformative experiences that
 * fundamentally shift the agent's perspective, reorganize salience landscape,
 * and enable developmental leaps.
 * 
 * Based on Vervaeke's framework that transformation involves:
 * - Quantum changes (sudden paradigm shifts)
 * - Gradual personality evolution within bounds
 * - Perspective reorganization
 * - Salience landscape restructuring
 * - Identity continuity despite change
 */

import { Episode, EmotionalState, CharacterTraits } from './types';
import { Frame } from './framing';

/**
 * Types of transformative experiences
 */
export enum TransformativeType {
  /** Sudden insight that reorganizes understanding */
  INSIGHT = 'insight',
  
  /** Mystical or peak experience */
  PEAK_EXPERIENCE = 'peak_experience',
  
  /** Flow state achievement */
  FLOW_STATE = 'flow_state',
  
  /** Major perspective shift */
  PARADIGM_SHIFT = 'paradigm_shift',
  
  /** Emotional breakthrough */
  EMOTIONAL_BREAKTHROUGH = 'emotional_breakthrough',
  
  /** Identity-shaping event */
  IDENTITY_SHAPING = 'identity_shaping'
}

/**
 * Transformative experience record
 */
export interface TransformativeExperience {
  /** Type of transformation */
  type: TransformativeType;
  
  /** Triggering episode */
  trigger: Episode;
  
  /** Timestamp */
  timestamp: number;
  
  /** What changed (before/after description) */
  change: {
    before: string;
    after: string;
  };
  
  /** Intensity of transformation (0-1) */
  intensity: number;
  
  /** Affected frames (perspectives) */
  affectedFrames: string[];
  
  /** Trait adjustments (bounded) */
  traitAdjustments?: Partial<CharacterTraits['traits']>;
  
  /** Integration status */
  integrated: boolean;
  
  /** Integration progress (0-1) */
  integrationProgress: number;
}

/**
 * Quantum change detection - sudden discontinuous transformation
 */
export interface QuantumChange {
  /** Did quantum change occur? */
  detected: boolean;
  
  /** Confidence in detection (0-1) */
  confidence: number;
  
  /** Nature of discontinuity */
  discontinuityType: 'perspective' | 'values' | 'identity' | 'worldview';
  
  /** Magnitude of change */
  magnitude: number;
  
  /** Evidence for quantum change */
  evidence: string[];
}

/**
 * Configuration for transformative experience detection
 */
export interface TransformativeConfig {
  /** Threshold for quantum change detection */
  quantumChangeThreshold: number;
  
  /** Maximum trait change per experience (bounded evolution) */
  maxTraitChange: number;
  
  /** Integration rate for gradual absorption */
  integrationRate: number;
  
  /** Minimum time between major transformations (ms) */
  transformationCooldown: number;
  
  /** History size for pattern detection */
  historySize: number;
}

/**
 * Default configuration
 */
export const DEFAULT_TRANSFORMATIVE_CONFIG: TransformativeConfig = {
  quantumChangeThreshold: 0.8,
  maxTraitChange: 0.15,  // Maximum 15% change in any trait
  integrationRate: 0.05,  // 5% integration per update
  transformationCooldown: 300000,  // 5 minutes
  historySize: 50
};

/**
 * Transformative Experience Handler
 * 
 * Detects and manages transformative experiences that reshape
 * the agent's cognitive landscape and personality within bounds.
 */
export class TransformativeExperienceHandler {
  private experiences: TransformativeExperience[] = [];
  private lastTransformation: number = 0;
  private config: TransformativeConfig;
  
  constructor(config?: Partial<TransformativeConfig>) {
    this.config = {
      ...DEFAULT_TRANSFORMATIVE_CONFIG,
      ...config
    };
  }
  
  /**
   * Detect if an episode represents a transformative experience
   */
  detectTransformation(
    episode: Episode,
    context: {
      emotionalHistory: EmotionalState[];
      activeFrames: Frame[];
      recentEpisodes: Episode[];
    }
  ): TransformativeExperience | null {
    // Check cooldown
    const now = Date.now();
    if (now - this.lastTransformation < this.config.transformationCooldown) {
      return null;
    }
    
    // Detect different types of transformative experiences
    const insightDetection = this.detectInsight(episode, context);
    const peakDetection = this.detectPeakExperience(episode);
    const flowDetection = this.detectFlowState(episode, context);
    const paradigmDetection = this.detectParadigmShift(episode, context);
    const emotionalDetection = this.detectEmotionalBreakthrough(episode, context);
    
    // Determine strongest signal
    const detections = [
      { type: TransformativeType.INSIGHT, ...insightDetection },
      { type: TransformativeType.PEAK_EXPERIENCE, ...peakDetection },
      { type: TransformativeType.FLOW_STATE, ...flowDetection },
      { type: TransformativeType.PARADIGM_SHIFT, ...paradigmDetection },
      { type: TransformativeType.EMOTIONAL_BREAKTHROUGH, ...emotionalDetection }
    ];
    
    const strongest = detections.reduce((max, curr) => 
      curr.intensity > max.intensity ? curr : max
    );
    
    // Threshold check
    if (strongest.intensity < 0.6) {
      return null;
    }
    
    const experience: TransformativeExperience = {
      type: strongest.type,
      trigger: episode,
      timestamp: now,
      change: strongest.change,
      intensity: strongest.intensity,
      affectedFrames: strongest.affectedFrames,
      traitAdjustments: strongest.traitAdjustments,
      integrated: false,
      integrationProgress: 0
    };
    
    this.experiences.push(experience);
    this.lastTransformation = now;
    
    // Maintain history size
    if (this.experiences.length > this.config.historySize) {
      this.experiences.shift();
    }
    
    return experience;
  }
  
  /**
   * Detect quantum change - sudden discontinuous transformation
   */
  detectQuantumChange(
    recentExperiences: TransformativeExperience[],
    currentTraits: CharacterTraits['traits'],
    previousTraits: CharacterTraits['traits']
  ): QuantumChange {
    // Calculate trait change magnitude
    const traitChanges = Object.keys(currentTraits).map(key => {
      const k = key as keyof CharacterTraits['traits'];
      return Math.abs(currentTraits[k] - previousTraits[k]);
    });
    
    const maxChange = Math.max(...traitChanges);
    const avgChange = traitChanges.reduce((a, b) => a + b, 0) / traitChanges.length;
    
    // Check for discontinuity patterns
    const hasMultipleTransformations = recentExperiences.length >= 3;
    const hasHighIntensity = recentExperiences.some(e => e.intensity > 0.8);
    const hasRapidChange = maxChange > this.config.maxTraitChange;
    
    const detected = hasMultipleTransformations && hasHighIntensity && hasRapidChange;
    
    const confidence = detected ? 
      Math.min(1.0, (maxChange / this.config.maxTraitChange) * 0.5 + 
                    (avgChange / this.config.maxTraitChange) * 0.3 +
                    (recentExperiences.length / 5) * 0.2) : 0;
    
    const evidence: string[] = [];
    if (hasMultipleTransformations) {
      evidence.push(`${recentExperiences.length} transformative experiences in short period`);
    }
    if (hasHighIntensity) {
      evidence.push('High-intensity transformative experiences detected');
    }
    if (hasRapidChange) {
      evidence.push(`Trait change of ${(maxChange * 100).toFixed(1)}% exceeds typical bounds`);
    }
    
    return {
      detected,
      confidence,
      discontinuityType: maxChange > 0.2 ? 'identity' : 'perspective',
      magnitude: avgChange,
      evidence
    };
  }
  
  /**
   * Integrate transformative experience gradually
   */
  integrateExperience(
    experience: TransformativeExperience,
    currentTraits: CharacterTraits['traits']
  ): CharacterTraits['traits'] {
    if (experience.integrated) {
      return currentTraits;
    }
    
    // Gradual integration with bounded change
    const adjustedTraits = { ...currentTraits };
    
    if (experience.traitAdjustments) {
      for (const [key, targetChange] of Object.entries(experience.traitAdjustments)) {
        const k = key as keyof CharacterTraits['traits'];
        if (targetChange !== undefined) {
          // Gradual approach to target
          const currentVal = adjustedTraits[k];
          const delta = targetChange * this.config.integrationRate;
          
          // Apply bounded change
          const newVal = currentVal + delta;
          adjustedTraits[k] = Math.max(0, Math.min(1, newVal));
        }
      }
    }
    
    // Update integration progress
    experience.integrationProgress += this.config.integrationRate;
    
    if (experience.integrationProgress >= 1.0) {
      experience.integrated = true;
      experience.integrationProgress = 1.0;
    }
    
    return adjustedTraits;
  }
  
  /**
   * Get all transformative experiences
   */
  getExperiences(): TransformativeExperience[] {
    return [...this.experiences];
  }
  
  /**
   * Get unintegrated experiences
   */
  getPendingIntegration(): TransformativeExperience[] {
    return this.experiences.filter(e => !e.integrated);
  }
  
  /**
   * Clear history (useful for testing or major resets)
   */
  clearHistory(): void {
    this.experiences = [];
    this.lastTransformation = 0;
  }
  
  // ===== Private Detection Methods =====
  
  /**
   * Detect insight experience (sudden understanding)
   */
  private detectInsight(
    episode: Episode,
    context: { recentEpisodes: Episode[] }
  ): {
    intensity: number;
    change: { before: string; after: string };
    affectedFrames: string[];
    traitAdjustments?: Partial<CharacterTraits['traits']>;
  } {
    const eventLower = episode.event.toLowerCase();
    
    // Look for insight markers
    const insightKeywords = ['realize', 'understand', 'aha', 'suddenly', 'click', 'makes sense'];
    const hasInsightMarker = insightKeywords.some(kw => eventLower.includes(kw));
    
    // High importance indicates significance
    const significanceBoost = episode.importance;
    
    let intensity = hasInsightMarker ? 0.5 + significanceBoost * 0.3 : 0.2;
    
    // Check for pattern recognition (comparing to recent episodes)
    const similarEpisodes = context.recentEpisodes.filter(e => 
      e.game_context === episode.game_context &&
      Math.abs(e.timestamp - episode.timestamp) < 300000  // Within 5 min
    );
    
    if (similarEpisodes.length >= 3) {
      intensity += 0.2;  // Pattern recognition boost
    }
    
    return {
      intensity: Math.min(1.0, intensity),
      change: {
        before: 'Uncertain about pattern',
        after: 'Clear understanding of mechanism'
      },
      affectedFrames: ['learning', 'strategy'],
      traitAdjustments: hasInsightMarker && intensity > 0.7 ? {
        intelligence: 0.05  // Small intelligence boost from insight
      } : undefined
    };
  }
  
  /**
   * Detect peak experience (exceptional moment)
   */
  private detectPeakExperience(episode: Episode): {
    intensity: number;
    change: { before: string; after: string };
    affectedFrames: string[];
    traitAdjustments?: Partial<CharacterTraits['traits']>;
  } {
    const emotional = episode.emotional_context;
    
    // Peak experiences have extreme emotional intensity
    const isExtreme = emotional.intensity > 0.85;
    const isPositive = emotional.valence > 0.7;
    const isArousing = emotional.arousal > 0.8;
    
    const intensity = isExtreme && isPositive && isArousing ? 
      0.6 + emotional.intensity * 0.3 : 0.1;
    
    return {
      intensity,
      change: {
        before: 'Normal engagement',
        after: 'Transcendent experience'
      },
      affectedFrames: ['play', 'social'],
      traitAdjustments: intensity > 0.8 ? {
        playfulness: 0.08  // Peak experiences can enhance playfulness
      } : undefined
    };
  }
  
  /**
   * Detect flow state
   */
  private detectFlowState(
    episode: Episode,
    context: { recentEpisodes: Episode[] }
  ): {
    intensity: number;
    change: { before: string; after: string };
    affectedFrames: string[];
    traitAdjustments?: Partial<CharacterTraits['traits']>;
  } {
    // Flow requires sustained optimal performance
    const recentSuccesses = context.recentEpisodes.filter(e =>
      e.outcome?.toLowerCase().includes('success') ||
      e.outcome?.toLowerCase().includes('win')
    ).length;
    
    const consistency = recentSuccesses / Math.max(1, context.recentEpisodes.length);
    
    // Flow keywords
    const flowKeywords = ['focused', 'effortless', 'zone', 'smooth', 'natural'];
    const hasFlowMarker = flowKeywords.some(kw => 
      episode.event.toLowerCase().includes(kw)
    );
    
    const intensity = hasFlowMarker && consistency > 0.7 ? 
      0.5 + consistency * 0.4 : consistency * 0.3;
    
    return {
      intensity,
      change: {
        before: 'Effortful performance',
        after: 'Effortless mastery'
      },
      affectedFrames: ['strategy'],
      traitAdjustments: intensity > 0.7 ? {
        intelligence: 0.03  // Flow enhances perceived competence
      } : undefined
    };
  }
  
  /**
   * Detect paradigm shift
   */
  private detectParadigmShift(
    episode: Episode,
    context: { activeFrames: Frame[] }
  ): {
    intensity: number;
    change: { before: string; after: string };
    affectedFrames: string[];
    traitAdjustments?: Partial<CharacterTraits['traits']>;
  } {
    const eventLower = episode.event.toLowerCase();
    
    // Paradigm shift markers
    const shiftKeywords = ['everything changed', 'new way', 'different approach', 
                          'reframe', 'rethink', 'paradigm'];
    const hasShiftMarker = shiftKeywords.some(kw => eventLower.includes(kw));
    
    // High importance + emotional valence change
    const significantChange = episode.importance > 0.8;
    
    const intensity = hasShiftMarker && significantChange ? 
      0.7 + episode.importance * 0.2 : 0.3;
    
    const affectedFrames = context.activeFrames.map(f => f.name);
    
    return {
      intensity,
      change: {
        before: 'Old perspective dominant',
        after: 'New perspective adopted'
      },
      affectedFrames,
      traitAdjustments: intensity > 0.8 ? {
        chaotic: 0.05,  // Paradigm shifts can enhance openness to change
        intelligence: 0.05  // And cognitive flexibility
      } : undefined
    };
  }
  
  /**
   * Detect emotional breakthrough
   */
  private detectEmotionalBreakthrough(
    episode: Episode,
    context: { emotionalHistory: EmotionalState[] }
  ): {
    intensity: number;
    change: { before: string; after: string };
    affectedFrames: string[];
    traitAdjustments?: Partial<CharacterTraits['traits']>;
  } {
    const current = episode.emotional_context;
    
    // Look for sudden emotional state change
    if (context.emotionalHistory.length < 2) {
      return {
        intensity: 0,
        change: { before: '', after: '' },
        affectedFrames: []
      };
    }
    
    const previous = context.emotionalHistory[context.emotionalHistory.length - 1];
    
    // Calculate emotional distance
    const valenceDiff = Math.abs(current.valence - previous.valence);
    const arousalDiff = Math.abs(current.arousal - previous.arousal);
    const emotionChanged = current.primary_emotion !== previous.primary_emotion;
    
    const intensity = emotionChanged ? 
      (valenceDiff * 0.4 + arousalDiff * 0.3 + (current.intensity * 0.3)) : 0.2;
    
    return {
      intensity,
      change: {
        before: `Emotional state: ${previous.primary_emotion}`,
        after: `Emotional state: ${current.primary_emotion}`
      },
      affectedFrames: ['social'],
      traitAdjustments: intensity > 0.7 && current.valence > 0.5 ? {
        empathy: 0.04  // Positive emotional breakthroughs can enhance empathy
      } : undefined
    };
  }
}

/**
 * Create transformative experience handler
 */
export function createTransformativeHandler(
  config?: Partial<TransformativeConfig>
): TransformativeExperienceHandler {
  return new TransformativeExperienceHandler(config);
}
