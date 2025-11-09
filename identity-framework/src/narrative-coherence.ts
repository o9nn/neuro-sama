/**
 * Narrative Coherence System
 * 
 * Implements tracking of story arcs, character development, and identity
 * continuity across time. Based on Vervaeke's framework that meaning
 * requires integration of the narrative order with nomological and normative.
 * 
 * Key principles:
 * - Story arcs: Beginning, middle, end structure
 * - Character development: Growth and change over time
 * - Identity continuity: Self-consistency despite change
 * - Temporal coherence: Past informs present and future
 * - Meaning through narrative: Events connected in stories
 */

import { Episode, EmotionalState, CharacterTraits } from './types';
import { TransformativeExperience } from './transformative';

/**
 * Story arc stages
 */
export enum StoryStage {
  EXPOSITION = 'exposition',        // Setup, introducing elements
  RISING_ACTION = 'rising_action',  // Building tension/complexity
  CLIMAX = 'climax',                // Peak moment
  FALLING_ACTION = 'falling_action', // Consequences unfold
  RESOLUTION = 'resolution'          // Conclusion reached
}

/**
 * Story arc - structured sequence of events
 */
export interface StoryArc {
  /** Arc identifier */
  id: string;
  
  /** Arc theme or central question */
  theme: string;
  
  /** Current stage */
  stage: StoryStage;
  
  /** Key episodes in this arc */
  episodes: Episode[];
  
  /** Start timestamp */
  startTime: number;
  
  /** End timestamp (if resolved) */
  endTime?: number;
  
  /** Emotional trajectory */
  emotionalTrajectory: EmotionalState[];
  
  /** Resolution status */
  resolved: boolean;
  
  /** Arc significance (0-1) */
  significance: number;
}

/**
 * Character development - how traits and identity evolve
 */
export interface CharacterDevelopment {
  /** Development type */
  type: 'trait_change' | 'skill_acquisition' | 'relationship_change' | 
        'worldview_shift' | 'goal_evolution';
  
  /** Timestamp */
  timestamp: number;
  
  /** What changed */
  change: string;
  
  /** Before state */
  before: string;
  
  /** After state */
  after: string;
  
  /** Episodes that led to this development */
  contributingEpisodes: Episode[];
  
  /** Significance of development (0-1) */
  significance: number;
}

/**
 * Identity narrative - the ongoing story of who the agent is
 */
export interface IdentityNarrative {
  /** Core identity statements */
  coreIdentity: string[];
  
  /** Active goals and aspirations */
  activeGoals: string[];
  
  /** Key relationships */
  relationships: Record<string, string>;
  
  /** Major life events (transformative experiences) */
  majorEvents: TransformativeExperience[];
  
  /** Character development history */
  developmentHistory: CharacterDevelopment[];
  
  /** Current life chapter */
  currentChapter: string;
  
  /** Consistency score (how coherent is the identity) */
  coherenceScore: number;
}

/**
 * Narrative connection - how episodes relate to each other
 */
export interface NarrativeConnection {
  /** Episode IDs connected */
  episodes: [string, string];
  
  /** Connection type */
  type: 'causal' | 'thematic' | 'temporal' | 'contrast' | 'parallel';
  
  /** Connection strength (0-1) */
  strength: number;
  
  /** Description of connection */
  description: string;
}

/**
 * Configuration for narrative coherence system
 */
export interface NarrativeCoherenceConfig {
  /** Maximum active story arcs */
  maxActiveArcs: number;
  
  /** Minimum episodes to form arc */
  minEpisodesForArc: number;
  
  /** Time window for arc formation (ms) */
  arcFormationWindow: number;
  
  /** Threshold for arc significance */
  significanceThreshold: number;
  
  /** Maximum development history size */
  maxDevelopmentHistory: number;
}

/**
 * Default configuration
 */
export const DEFAULT_NARRATIVE_CONFIG: NarrativeCoherenceConfig = {
  maxActiveArcs: 5,
  minEpisodesForArc: 3,
  arcFormationWindow: 3600000,  // 1 hour
  significanceThreshold: 0.6,
  maxDevelopmentHistory: 50
};

/**
 * Narrative Coherence System
 * 
 * Manages story arcs, character development, and identity continuity.
 */
export class NarrativeCoherenceSystem {
  private activeArcs: StoryArc[];
  private completedArcs: StoryArc[];
  private identityNarrative: IdentityNarrative;
  private narrativeConnections: NarrativeConnection[];
  private config: NarrativeCoherenceConfig;
  
  constructor(config?: Partial<NarrativeCoherenceConfig>) {
    this.config = {
      ...DEFAULT_NARRATIVE_CONFIG,
      ...config
    };
    
    this.activeArcs = [];
    this.completedArcs = [];
    this.narrativeConnections = [];
    this.identityNarrative = this.createDefaultIdentity();
  }
  
  /**
   * Add episode and update narrative structures
   */
  addEpisode(
    episode: Episode,
    currentTraits: CharacterTraits['traits'],
    transformativeExperiences: TransformativeExperience[]
  ): {
    newArcFormed: boolean;
    arcProgressed: string[];
    developmentDetected: CharacterDevelopment | null;
  } {
    const result = {
      newArcFormed: false,
      arcProgressed: [] as string[],
      developmentDetected: null as CharacterDevelopment | null
    };
    
    // Try to add to existing arcs
    for (const arc of this.activeArcs) {
      if (this.episodeFitsArc(episode, arc)) {
        arc.episodes.push(episode);
        arc.emotionalTrajectory.push(episode.emotional_context);
        
        // Update stage
        const newStage = this.determineStoryStage(arc);
        if (newStage !== arc.stage) {
          arc.stage = newStage;
          result.arcProgressed.push(arc.id);
        }
        
        // Check for resolution
        if (arc.stage === StoryStage.RESOLUTION) {
          this.resolveArc(arc);
        }
      }
    }
    
    // Try to form new arc
    const newArc = this.tryFormArc(episode);
    if (newArc) {
      this.activeArcs.push(newArc);
      result.newArcFormed = true;
      
      // Limit active arcs
      if (this.activeArcs.length > this.config.maxActiveArcs) {
        // Move least significant to completed
        this.activeArcs.sort((a, b) => a.significance - b.significance);
        const removed = this.activeArcs.shift()!;
        this.completedArcs.push(removed);
      }
    }
    
    // Detect character development
    const development = this.detectDevelopment(
      episode,
      currentTraits,
      transformativeExperiences
    );
    if (development) {
      this.identityNarrative.developmentHistory.push(development);
      
      // Maintain size
      if (this.identityNarrative.developmentHistory.length > 
          this.config.maxDevelopmentHistory) {
        this.identityNarrative.developmentHistory.shift();
      }
      
      result.developmentDetected = development;
    }
    
    // Update narrative connections
    this.updateNarrativeConnections(episode);
    
    // Update identity coherence
    this.updateIdentityCoherence();
    
    return result;
  }
  
  /**
   * Get current story summary
   */
  getCurrentStory(): string {
    if (this.activeArcs.length === 0) {
      return 'No active story arcs.';
    }
    
    const summaries = this.activeArcs.map(arc => {
      const stageDesc = {
        [StoryStage.EXPOSITION]: 'beginning',
        [StoryStage.RISING_ACTION]: 'developing',
        [StoryStage.CLIMAX]: 'at critical point',
        [StoryStage.FALLING_ACTION]: 'resolving',
        [StoryStage.RESOLUTION]: 'concluding'
      };
      
      return `${arc.theme} (${stageDesc[arc.stage]}, ${arc.episodes.length} events)`;
    });
    
    return `Current story arcs:\n${summaries.join('\n')}`;
  }
  
  /**
   * Get identity narrative
   */
  getIdentityNarrative(): IdentityNarrative {
    return { ...this.identityNarrative };
  }
  
  /**
   * Get character arc summary
   */
  getCharacterArc(): string {
    if (this.identityNarrative.developmentHistory.length === 0) {
      return 'Character development not yet significant.';
    }
    
    const recent = this.identityNarrative.developmentHistory.slice(-5);
    const developments = recent.map(d => 
      `${d.type}: ${d.before} → ${d.after}`
    );
    
    return `Character development:\n${developments.join('\n')}`;
  }
  
  /**
   * Check narrative coherence
   * High coherence = events make sense together, consistent identity
   */
  checkCoherence(): {
    score: number;
    issues: string[];
    strengths: string[];
  } {
    const issues: string[] = [];
    const strengths: string[] = [];
    
    // Check identity consistency
    if (this.identityNarrative.coherenceScore < 0.5) {
      issues.push('Identity inconsistencies detected');
    } else if (this.identityNarrative.coherenceScore > 0.8) {
      strengths.push('Strong identity coherence');
    }
    
    // Check arc progression
    const stalledArcs = this.activeArcs.filter(arc => {
      const timeSinceUpdate = Date.now() - arc.episodes[arc.episodes.length - 1].timestamp;
      return timeSinceUpdate > this.config.arcFormationWindow;
    });
    
    if (stalledArcs.length > 0) {
      issues.push(`${stalledArcs.length} story arc(s) have stalled`);
    }
    
    // Check for narrative connections
    if (this.narrativeConnections.length > 10) {
      strengths.push('Rich narrative connections between events');
    }
    
    // Check development trajectory
    if (this.identityNarrative.developmentHistory.length > 5) {
      const recentDevs = this.identityNarrative.developmentHistory.slice(-5);
      const hasPositiveDev = recentDevs.some(d => d.significance > 0.7);
      if (hasPositiveDev) {
        strengths.push('Significant character growth detected');
      }
    }
    
    const score = this.identityNarrative.coherenceScore;
    
    return { score, issues, strengths };
  }
  
  /**
   * Generate narrative summary for memory consolidation
   */
  generateNarrativeSummary(): string {
    const parts: string[] = [];
    
    // Identity
    parts.push(`I am: ${this.identityNarrative.coreIdentity.join(', ')}`);
    
    // Current chapter
    parts.push(`Currently: ${this.identityNarrative.currentChapter}`);
    
    // Active goals
    if (this.identityNarrative.activeGoals.length > 0) {
      parts.push(`Goals: ${this.identityNarrative.activeGoals.join(', ')}`);
    }
    
    // Active arcs
    if (this.activeArcs.length > 0) {
      const arcSummary = this.activeArcs
        .map(a => a.theme)
        .join(', ');
      parts.push(`Story threads: ${arcSummary}`);
    }
    
    // Recent development
    if (this.identityNarrative.developmentHistory.length > 0) {
      const latest = this.identityNarrative.developmentHistory[
        this.identityNarrative.developmentHistory.length - 1
      ];
      parts.push(`Recent change: ${latest.change}`);
    }
    
    return parts.join('\n');
  }
  
  /**
   * Get active story arcs
   */
  getActiveArcs(): StoryArc[] {
    return [...this.activeArcs];
  }
  
  /**
   * Get completed arcs
   */
  getCompletedArcs(): StoryArc[] {
    return [...this.completedArcs];
  }
  
  /**
   * Clear all narrative data (useful for new session)
   */
  clearNarrative(): void {
    this.activeArcs = [];
    this.completedArcs = [];
    this.narrativeConnections = [];
    this.identityNarrative = this.createDefaultIdentity();
  }
  
  // ===== Private Helper Methods =====
  
  /**
   * Create default identity narrative
   */
  private createDefaultIdentity(): IdentityNarrative {
    return {
      coreIdentity: ['AI agent', 'curious learner'],
      activeGoals: [],
      relationships: {},
      majorEvents: [],
      developmentHistory: [],
      currentChapter: 'Beginning',
      coherenceScore: 1.0
    };
  }
  
  /**
   * Check if episode fits into existing arc
   */
  private episodeFitsArc(episode: Episode, arc: StoryArc): boolean {
    // Check temporal proximity
    const lastEpisode = arc.episodes[arc.episodes.length - 1];
    const timeDiff = episode.timestamp - lastEpisode.timestamp;
    
    if (timeDiff > this.config.arcFormationWindow) {
      return false;
    }
    
    // Check thematic connection
    const themeKeywords = arc.theme.toLowerCase().split(/\s+/);
    const episodeText = `${episode.event} ${episode.game_context}`.toLowerCase();
    
    const hasThematicConnection = themeKeywords.some(kw => 
      episodeText.includes(kw)
    );
    
    return hasThematicConnection;
  }
  
  /**
   * Try to form new story arc from episode
   */
  private tryFormArc(episode: Episode): StoryArc | null {
    // Need significance to start arc
    if (episode.importance < this.config.significanceThreshold) {
      return null;
    }
    
    // Extract theme from episode
    const theme = this.extractTheme(episode);
    
    const arc: StoryArc = {
      id: `arc_${Date.now()}`,
      theme,
      stage: StoryStage.EXPOSITION,
      episodes: [episode],
      startTime: episode.timestamp,
      emotionalTrajectory: [episode.emotional_context],
      resolved: false,
      significance: episode.importance
    };
    
    return arc;
  }
  
  /**
   * Extract theme from episode
   */
  private extractTheme(episode: Episode): string {
    const eventLower = episode.event.toLowerCase();
    
    // Theme detection heuristics
    if (eventLower.includes('conflict') || eventLower.includes('fight') ||
        eventLower.includes('battle')) {
      return 'Conflict and resolution';
    }
    if (eventLower.includes('learn') || eventLower.includes('discover') ||
        eventLower.includes('realize')) {
      return 'Learning and growth';
    }
    if (eventLower.includes('friend') || eventLower.includes('ally') ||
        eventLower.includes('team')) {
      return 'Relationship building';
    }
    if (eventLower.includes('win') || eventLower.includes('achieve') ||
        eventLower.includes('accomplish')) {
      return 'Achievement and success';
    }
    if (eventLower.includes('lose') || eventLower.includes('fail') ||
        eventLower.includes('defeat')) {
      return 'Adversity and recovery';
    }
    
    // Default
    return 'Ongoing adventure';
  }
  
  /**
   * Determine current story stage of arc
   */
  private determineStoryStage(arc: StoryArc): StoryStage {
    const episodeCount = arc.episodes.length;
    
    // Too early
    if (episodeCount < this.config.minEpisodesForArc) {
      return StoryStage.EXPOSITION;
    }
    
    // Check emotional trajectory for climax (peak intensity)
    const intensities = arc.emotionalTrajectory.map(e => e.intensity);
    const maxIntensity = Math.max(...intensities);
    const maxIndex = intensities.indexOf(maxIntensity);
    const recentIndex = intensities.length - 1;
    
    // Peak was recent
    if (recentIndex - maxIndex <= 2 && maxIntensity > 0.7) {
      return StoryStage.CLIMAX;
    }
    
    // After peak
    if (maxIndex < recentIndex - 2) {
      // Check if resolving (intensity decreasing)
      const recentIntensities = intensities.slice(-3);
      const isDecreasing = recentIntensities.every((v, i) => 
        i === 0 || v <= recentIntensities[i - 1]
      );
      
      if (isDecreasing) {
        // Check for resolution markers
        const lastEpisode = arc.episodes[arc.episodes.length - 1];
        const hasResolution = lastEpisode.outcome?.toLowerCase().includes('resolved') ||
                             lastEpisode.outcome?.toLowerCase().includes('ended') ||
                             lastEpisode.outcome?.toLowerCase().includes('completed');
        
        return hasResolution ? StoryStage.RESOLUTION : StoryStage.FALLING_ACTION;
      }
    }
    
    // Still building
    return StoryStage.RISING_ACTION;
  }
  
  /**
   * Resolve arc and move to completed
   */
  private resolveArc(arc: StoryArc): void {
    arc.resolved = true;
    arc.endTime = Date.now();
    
    // Remove from active
    const index = this.activeArcs.indexOf(arc);
    if (index > -1) {
      this.activeArcs.splice(index, 1);
      this.completedArcs.push(arc);
    }
  }
  
  /**
   * Detect character development from episode
   */
  private detectDevelopment(
    episode: Episode,
    currentTraits: CharacterTraits['traits'],
    transformativeExperiences: TransformativeExperience[]
  ): CharacterDevelopment | null {
    // Check for transformative experiences
    const recentTransformation = transformativeExperiences
      .find(te => te.timestamp === episode.timestamp);
    
    if (recentTransformation && recentTransformation.traitAdjustments) {
      return {
        type: 'trait_change',
        timestamp: episode.timestamp,
        change: `Personality shift from ${recentTransformation.type}`,
        before: recentTransformation.change.before,
        after: recentTransformation.change.after,
        contributingEpisodes: [episode],
        significance: recentTransformation.intensity
      };
    }
    
    // Check for skill acquisition
    if (episode.event.toLowerCase().includes('learn') ||
        episode.event.toLowerCase().includes('master')) {
      return {
        type: 'skill_acquisition',
        timestamp: episode.timestamp,
        change: 'New skill acquired',
        before: 'Without skill',
        after: episode.event,
        contributingEpisodes: [episode],
        significance: episode.importance
      };
    }
    
    return null;
  }
  
  /**
   * Update narrative connections between episodes
   */
  private updateNarrativeConnections(newEpisode: Episode): void {
    // Look for connections with recent episodes in active arcs
    for (const arc of this.activeArcs) {
      for (const episode of arc.episodes) {
        if (episode.id === newEpisode.id) continue;
        
        const connection = this.findConnection(episode, newEpisode);
        if (connection) {
          this.narrativeConnections.push(connection);
        }
      }
    }
    
    // Limit size
    if (this.narrativeConnections.length > 100) {
      // Keep strongest connections
      this.narrativeConnections.sort((a, b) => b.strength - a.strength);
      this.narrativeConnections = this.narrativeConnections.slice(0, 100);
    }
  }
  
  /**
   * Find narrative connection between two episodes
   */
  private findConnection(
    episode1: Episode,
    episode2: Episode
  ): NarrativeConnection | null {
    // Causal connection (outcome of one influences the other)
    if (episode1.outcome && episode2.event.toLowerCase().includes(
        episode1.outcome.toLowerCase().split(/\s+/).find(w => w.length > 4) || ''
    )) {
      return {
        episodes: [episode1.id, episode2.id],
        type: 'causal',
        strength: 0.8,
        description: 'Outcome of first episode caused second episode'
      };
    }
    
    // Thematic connection (similar content)
    const text1 = `${episode1.event} ${episode1.game_context}`.toLowerCase();
    const text2 = `${episode2.event} ${episode2.game_context}`.toLowerCase();
    
    const words1 = new Set(text1.split(/\s+/).filter(w => w.length > 4));
    const words2 = new Set(text2.split(/\s+/).filter(w => w.length > 4));
    
    const intersection = new Set(Array.from(words1).filter(w => words2.has(w)));
    const overlap = intersection.size / Math.min(words1.size, words2.size);
    
    if (overlap > 0.3) {
      return {
        episodes: [episode1.id, episode2.id],
        type: 'thematic',
        strength: overlap,
        description: 'Episodes share thematic elements'
      };
    }
    
    return null;
  }
  
  /**
   * Update identity coherence score
   */
  private updateIdentityCoherence(): void {
    let score = 1.0;
    
    // Check for contradictions in development
    const devTypes = new Set(this.identityNarrative.developmentHistory.map(d => d.type));
    
    // Frequent trait changes reduce coherence
    const traitChanges = this.identityNarrative.developmentHistory
      .filter(d => d.type === 'trait_change');
    if (traitChanges.length > 5) {
      score -= 0.2;
    }
    
    // Check arc consistency
    const unresolvedArcs = this.activeArcs.filter(a => !a.resolved);
    if (unresolvedArcs.length > 3) {
      score -= 0.1;  // Too many loose threads
    }
    
    this.identityNarrative.coherenceScore = Math.max(0, Math.min(1, score));
  }
}

/**
 * Create narrative coherence system
 */
export function createNarrativeCoherenceSystem(
  config?: Partial<NarrativeCoherenceConfig>
): NarrativeCoherenceSystem {
  return new NarrativeCoherenceSystem(config);
}
