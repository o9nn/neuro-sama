/**
 * Memory System Implementation
 */

import {
  MemorySystem,
  Episode,
  Context,
  GameState,
  PruningStrategy
} from './types';

/**
 * Simple implementation of episodic memory system
 */
export class NeuroMemorySystem implements MemorySystem {
  public episodicMemory: Episode[] = [];
  public workingMemory: Context;

  constructor(maxContextSize: number = 10) {
    this.workingMemory = {
      recent_events: [],
      current_state: '',
      active_goals: [],
      focus: [],
      max_size: maxContextSize
    };
  }

  /**
   * Recall relevant memories based on query
   */
  recall(query: string, limit: number = 5): Episode[] {
    const queryLower = query.toLowerCase();
    
    // Score each memory by relevance
    const scoredMemories = this.episodicMemory.map(episode => {
      let score = 0;
      
      // Check event description
      const eventLower = episode.event.toLowerCase();
      const contextLower = episode.game_context.toLowerCase();
      
      // Exact word matches
      const queryWords = queryLower.split(/\s+/);
      for (const word of queryWords) {
        if (word.length < 3) continue; // Skip short words
        
        if (eventLower.includes(word)) score += 2;
        if (contextLower.includes(word)) score += 1;
        if (episode.outcome?.toLowerCase().includes(word)) score += 1;
      }
      
      // Boost recent memories
      const ageInHours = (Date.now() - episode.timestamp) / (1000 * 60 * 60);
      const recencyBoost = Math.max(0, 1 - ageInHours / 24);
      score += recencyBoost * 2;
      
      // Boost important memories
      score += episode.importance * 3;
      
      return { episode, score };
    });

    // Sort by score and return top results
    return scoredMemories
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.episode);
  }

  /**
   * Store new event in episodic memory
   */
  store(event: Episode): void {
    this.episodicMemory.push(event);
    
    // Add to working memory recent events
    this.workingMemory.recent_events.push(event);
    
    // Keep working memory bounded
    if (this.workingMemory.recent_events.length > this.workingMemory.max_size) {
      this.workingMemory.recent_events.shift();
    }
  }

  /**
   * Prune memories based on strategy
   */
  prune(strategy: PruningStrategy): void {
    switch (strategy.type) {
      case 'by_age':
        this.pruneByAge(strategy.max_age_ms);
        break;
      
      case 'by_importance':
        this.pruneByImportance(strategy.min_importance);
        break;
      
      case 'by_count':
        this.pruneByCount(strategy.max_count);
        break;
      
      case 'by_relevance':
        this.pruneByRelevance(strategy.query, strategy.top_k);
        break;
    }
  }

  /**
   * Get current working memory context
   */
  getContext(): Context {
    return { ...this.workingMemory };
  }

  /**
   * Update working memory with new game state
   */
  updateContext(gameState: GameState): void {
    this.workingMemory.current_state = gameState.description;
    
    // Update focus based on available actions
    this.workingMemory.focus = gameState.available_actions.map(a => a.name);
  }

  /**
   * Prune memories older than specified age
   */
  private pruneByAge(maxAgeMs: number): void {
    const cutoffTime = Date.now() - maxAgeMs;
    this.episodicMemory = this.episodicMemory.filter(
      episode => episode.timestamp > cutoffTime
    );
  }

  /**
   * Prune memories below importance threshold
   */
  private pruneByImportance(minImportance: number): void {
    this.episodicMemory = this.episodicMemory.filter(
      episode => episode.importance >= minImportance
    );
  }

  /**
   * Keep only the most recent N memories
   */
  private pruneByCount(maxCount: number): void {
    if (this.episodicMemory.length <= maxCount) return;
    
    // Sort by timestamp (most recent first) and keep top N
    this.episodicMemory.sort((a, b) => b.timestamp - a.timestamp);
    this.episodicMemory = this.episodicMemory.slice(0, maxCount);
  }

  /**
   * Keep only memories relevant to query
   */
  private pruneByRelevance(query: string, topK: number): void {
    const relevant = this.recall(query, topK);
    const relevantIds = new Set(relevant.map(e => e.id));
    
    this.episodicMemory = this.episodicMemory.filter(
      episode => relevantIds.has(episode.id)
    );
  }
}

/**
 * Generate unique ID for episodes
 */
export function generateEpisodeId(): string {
  return `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create episode from game event
 */
export function createEpisode(
  event: string,
  gameContext: string,
  outcome?: string,
  importance: number = 0.5,
  emotionalContext?: any
): Episode {
  return {
    id: generateEpisodeId(),
    timestamp: Date.now(),
    event,
    game_context: gameContext,
    emotional_context: emotionalContext || {
      primary_emotion: 'neutral',
      intensity: 0.5,
      valence: 0,
      arousal: 0.5,
      last_update: Date.now()
    },
    outcome,
    importance
  };
}
