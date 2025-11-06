/**
 * Cognitive Pipeline Implementation
 */

import {
  CognitivePipeline,
  GameState,
  CognitiveContext,
  ActionPlan,
  Action,
  ActionResult,
  MemorySystem,
  PersonalityEngine
} from './types';

/**
 * Simple cognitive pipeline implementation
 */
export class NeuroCognitivePipeline implements CognitivePipeline {
  constructor(
    private memory: MemorySystem,
    private personality: PersonalityEngine
  ) {}

  /**
   * Transform game state to cognitive context
   */
  perception(gameState: GameState): CognitiveContext {
    // Extract relevant memories
    const memories = this.memory.recall(gameState.description, 5);
    
    // Get current emotional state
    const emotionalState = this.personality.affectiveState;
    
    // Get working memory context
    const context = this.memory.getContext();
    
    return {
      perception: gameState.description,
      memories,
      emotional_state: emotionalState,
      actions: gameState.available_actions,
      goals: context.active_goals
    };
  }

  /**
   * Reason about context to generate action plan
   * Note: This is a simple implementation. Real implementation would use LLM.
   */
  async reasoning(context: CognitiveContext): Promise<ActionPlan> {
    // Filter actions through personality
    const validActions = context.actions.filter(action =>
      this.personality.consistencyCheck(action)
    );

    if (validActions.length === 0) {
      throw new Error('No valid actions available');
    }

    // Simple selection: prefer actions mentioned in goals or memories
    let selectedAction = validActions[0];
    let maxScore = 0;
    let reasoning = 'Random selection';

    for (const action of validActions) {
      let score = 0;
      const actionText = `${action.name} ${action.description}`.toLowerCase();

      // Check against goals
      for (const goal of context.goals) {
        if (actionText.includes(goal.toLowerCase())) {
          score += 3;
        }
      }

      // Check against recent memories
      for (const memory of context.memories) {
        if (memory.event.toLowerCase().includes(action.name.toLowerCase())) {
          score += memory.importance * 2;
        }
      }

      // Boost based on emotional state
      if (context.emotional_state.primary_emotion === 'excited') {
        // Prefer actions with exciting keywords
        if (actionText.includes('attack') || actionText.includes('special')) {
          score += 1;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        selectedAction = action;
        reasoning = `Selected based on goals and memories (score: ${score})`;
      }
    }

    // If no clear preference, use personality to choose
    if (maxScore === 0) {
      if (this.personality.traits.traits.chaotic > 0.6) {
        selectedAction = validActions[Math.floor(Math.random() * validActions.length)];
        reasoning = 'Chaotic personality: random choice';
      } else {
        selectedAction = validActions[0];
        reasoning = 'Default: first valid action';
      }
    }

    return {
      action: selectedAction,
      parameters: {},
      reasoning,
      confidence: maxScore > 0 ? Math.min(0.9, 0.3 + maxScore * 0.1) : 0.3
    };
  }

  /**
   * Select action from plan
   */
  actionSelection(plan: ActionPlan): Action {
    return plan.action;
  }

  /**
   * Execute action and return result
   * Note: This is a placeholder. Real implementation depends on game integration.
   */
  async execution(
    action: Action,
    parameters?: Record<string, any>
  ): Promise<ActionResult> {
    // This would be implemented by the game integration layer
    // For now, return a mock success result
    return {
      success: true,
      message: `Action ${action.name} executed successfully`
    };
  }
}

/**
 * LLM-based cognitive pipeline (interface for future implementation)
 */
export interface LLMCognitivePipeline extends CognitivePipeline {
  /** LLM backend configuration */
  llmConfig: {
    model: string;
    endpoint: string;
    apiKey?: string;
  };

  /** System prompt for the LLM */
  systemPrompt: string;

  /** Generate prompt from context */
  generatePrompt(context: CognitiveContext): string;

  /** Parse LLM response to action plan */
  parseResponse(response: string, availableActions: Action[]): ActionPlan;
}

/**
 * Helper to format context for LLM prompt
 */
export function formatContextForLLM(context: CognitiveContext): string {
  let prompt = '=== Current Situation ===\n';
  prompt += context.perception + '\n\n';

  if (context.goals.length > 0) {
    prompt += '=== Your Goals ===\n';
    prompt += context.goals.map(g => `- ${g}`).join('\n') + '\n\n';
  }

  if (context.memories.length > 0) {
    prompt += '=== Relevant Memories ===\n';
    context.memories.forEach(m => {
      prompt += `- ${m.event}`;
      if (m.outcome) prompt += ` (${m.outcome})`;
      prompt += '\n';
    });
    prompt += '\n';
  }

  prompt += '=== Available Actions ===\n';
  context.actions.forEach((action, i) => {
    prompt += `${i + 1}. ${action.name}: ${action.description}\n`;
  });

  prompt += '\n=== Emotional State ===\n';
  prompt += `Feeling ${context.emotional_state.primary_emotion} `;
  prompt += `(intensity: ${context.emotional_state.intensity.toFixed(2)})\n`;

  return prompt;
}
