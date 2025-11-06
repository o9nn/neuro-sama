/**
 * Main Identity Framework Implementation
 */

import {
  IdentityFramework,
  PersonalityEngine,
  MemorySystem,
  CognitivePipeline,
  GameState,
  ActionPlan,
  ActionResult
} from './types';

import { NeuroPersonalityEngine, DEFAULT_NEURO_TRAITS } from './personality';
import { NeuroMemorySystem, createEpisode } from './memory';
import { NeuroCognitivePipeline } from './cognition';

/**
 * Complete implementation of the Neuro-Sama Identity Framework
 */
export class NeuroIdentityFramework implements IdentityFramework {
  public personality: PersonalityEngine;
  public memory: MemorySystem;
  public cognition: CognitivePipeline;

  private initialized: boolean = false;

  constructor(
    personality?: PersonalityEngine,
    memory?: MemorySystem,
    cognition?: CognitivePipeline
  ) {
    // Use provided components or create defaults
    this.memory = memory || new NeuroMemorySystem();
    this.personality = personality || new NeuroPersonalityEngine(DEFAULT_NEURO_TRAITS);
    this.cognition = cognition || new NeuroCognitivePipeline(this.memory, this.personality);
  }

  /**
   * Initialize the framework
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Identity framework already initialized');
      return;
    }

    // Load any persistent state (could be from disk/database)
    // For now, just mark as initialized
    this.initialized = true;

    console.log('Neuro-Sama Identity Framework initialized');
    console.log('Personality traits:', this.personality.traits.traits);
    console.log('Emotional state:', this.personality.affectiveState.primary_emotion);
  }

  /**
   * Process game state and generate action plan
   */
  async processGameState(gameState: GameState): Promise<ActionPlan> {
    if (!this.initialized) {
      throw new Error('Framework not initialized. Call initialize() first.');
    }

    // Update working memory with current state
    this.memory.updateContext(gameState);

    // Transform to cognitive context
    const context = this.cognition.perception(gameState);

    // Generate action plan through reasoning
    const plan = await this.cognition.reasoning(context);

    // Store the decision-making process as an episode
    const episode = createEpisode(
      `Considering action: ${plan.action.name}`,
      gameState.game,
      plan.reasoning,
      0.5,
      this.personality.affectiveState
    );
    this.memory.store(episode);

    return plan;
  }

  /**
   * Execute action from plan
   */
  async executeAction(plan: ActionPlan): Promise<ActionResult> {
    if (!this.initialized) {
      throw new Error('Framework not initialized. Call initialize() first.');
    }

    // Execute the action
    const result = await this.cognition.execution(plan.action, plan.parameters);

    // Create episode for the execution
    const episode = createEpisode(
      `Executed action: ${plan.action.name}`,
      'current_game',
      result.success ? 'Success' : `Failed: ${result.message}`,
      result.success ? 0.7 : 0.8, // Failed actions are more important to remember
      this.personality.affectiveState
    );

    // Update emotional state based on outcome
    this.personality.updateEmotion(episode);

    // Store in memory
    this.memory.store(episode);

    return result;
  }

  /**
   * Get current framework state for debugging/monitoring
   */
  getState() {
    return {
      initialized: this.initialized,
      personality: {
        traits: this.personality.traits,
        emotion: this.personality.affectiveState
      },
      memory: {
        episodic_count: this.memory.episodicMemory.length,
        working_memory: this.memory.getContext()
      }
    };
  }

  /**
   * Reset framework to initial state
   */
  reset(): void {
    this.memory = new NeuroMemorySystem();
    this.personality = new NeuroPersonalityEngine(DEFAULT_NEURO_TRAITS);
    this.cognition = new NeuroCognitivePipeline(this.memory, this.personality);
    this.initialized = false;
  }
}

/**
 * Factory function to create a new identity framework instance
 */
export function createIdentityFramework(options?: {
  traits?: any;
  memorySize?: number;
}): NeuroIdentityFramework {
  const memory = new NeuroMemorySystem(options?.memorySize);
  const personality = new NeuroPersonalityEngine(options?.traits);
  const cognition = new NeuroCognitivePipeline(memory, personality);

  return new NeuroIdentityFramework(personality, memory, cognition);
}
