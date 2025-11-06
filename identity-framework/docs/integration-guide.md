# Integration Guide

This guide explains how to integrate the Neuro-Sama Identity Framework into your application or game.

## Quick Start

### Installation

```bash
npm install @neuro-sama/identity-framework
# or
yarn add @neuro-sama/identity-framework
```

### Basic Usage

```typescript
import { createIdentityFramework } from '@neuro-sama/identity-framework';

// Create a new identity framework instance
const neuro = createIdentityFramework({
  memorySize: 20 // Number of recent events to keep in working memory
});

// Initialize the framework
await neuro.initialize();

// Process game state and get action
const gameState = {
  description: "You are in a room with three doors: red, blue, and green.",
  available_actions: [
    { name: "open_red_door", description: "Open the red door" },
    { name: "open_blue_door", description: "Open the blue door" },
    { name: "open_green_door", description: "Open the green door" }
  ],
  game: "Mystery Room",
  timestamp: Date.now()
};

const actionPlan = await neuro.processGameState(gameState);
console.log('Neuro chose:', actionPlan.action.name);
console.log('Reasoning:', actionPlan.reasoning);

// Execute the action
const result = await neuro.executeAction(actionPlan);
console.log('Result:', result);
```

## Architecture Overview

The framework consists of three main components:

### 1. Personality Engine

Manages character traits, emotional states, and behavioral consistency.

```typescript
import { NeuroPersonalityEngine, DEFAULT_NEURO_TRAITS } from '@neuro-sama/identity-framework';

// Create with custom traits
const personality = new NeuroPersonalityEngine({
  traits: {
    playfulness: 0.9,
    intelligence: 0.85,
    empathy: 0.7,
    chaotic: 0.8,
    sarcasm: 0.6
  },
  lore: {
    background: 'Custom background...',
    relationships: {},
    goals: ['Custom goal'],
    quirks: ['Custom quirk']
  },
  constraints: {
    forbidden_topics: [],
    preferred_responses: [],
    communication_style: 'Custom style'
  }
});

// Filter responses through personality
const filtered = personality.responseFilter("I won the game!");
// Output might be: "I won the game! :D" or "I won the game! hehe"

// Check if action is consistent with personality
const isConsistent = personality.consistencyCheck(someAction);
```

### 2. Memory System

Manages episodic memory and working memory context.

```typescript
import { NeuroMemorySystem, createEpisode } from '@neuro-sama/identity-framework';

const memory = new NeuroMemorySystem(maxContextSize: 15);

// Store an event
const episode = createEpisode(
  'Won the card game',
  'Poker Night',
  'Royal flush victory',
  0.9 // importance
);
memory.store(episode);

// Recall relevant memories
const relevantMemories = memory.recall('card game', 5);

// Prune old memories
memory.prune({ type: 'by_age', max_age_ms: 24 * 60 * 60 * 1000 }); // 24 hours
```

### 3. Cognitive Pipeline

Transforms perception → reasoning → action selection → execution.

```typescript
import { NeuroCognitivePipeline } from '@neuro-sama/identity-framework';

const cognition = new NeuroCognitivePipeline(memory, personality);

// Transform game state to cognitive context
const context = cognition.perception(gameState);

// Reason about the context
const plan = await cognition.reasoning(context);

// Select and execute action
const action = cognition.actionSelection(plan);
const result = await cognition.execution(action, plan.parameters);
```

## Integration with Neuro SDK

The Identity Framework works alongside the Neuro SDK to provide a complete solution:

```typescript
import { NeuroClient } from '@neuro-sdk/client'; // Hypothetical SDK client
import { createIdentityFramework } from '@neuro-sama/identity-framework';

// Create framework
const neuro = createIdentityFramework();
await neuro.initialize();

// Connect to Neuro WebSocket
const client = new NeuroClient('ws://localhost:8000');

// Handle context updates from game
client.on('context', async (message) => {
  // Update working memory
  const gameState = {
    description: message.data.message,
    available_actions: [], // Will be populated by action registration
    game: message.game,
    timestamp: Date.now()
  };
  
  neuro.memory.updateContext(gameState);
});

// Handle action registration
client.on('actions_registered', (actions) => {
  // Actions are now available for reasoning
});

// Handle action force (game asking for action)
client.on('actions_force', async (message) => {
  const gameState = {
    description: message.data.state,
    available_actions: message.data.action_names.map(name => ({
      name,
      description: `Action: ${name}`
    })),
    game: 'current_game',
    timestamp: Date.now()
  };
  
  // Use framework to decide
  const plan = await neuro.processGameState(gameState);
  
  // Send action back to game
  client.sendAction(plan.action.name, plan.parameters);
});

// Handle action results
client.on('action_result', (result) => {
  // Update emotional state based on success/failure
  const episode = createEpisode(
    result.success ? 'Action succeeded' : 'Action failed',
    'current_game',
    result.message,
    result.success ? 0.6 : 0.8
  );
  
  neuro.personality.updateEmotion(episode);
  neuro.memory.store(episode);
});
```

## Custom LLM Integration

To use a real LLM backend instead of the simple rule-based reasoning:

```typescript
import { formatContextForLLM } from '@neuro-sama/identity-framework';

class OpenAICognitivePipeline extends NeuroCognitivePipeline {
  async reasoning(context: CognitiveContext): Promise<ActionPlan> {
    // Format context for LLM
    const prompt = formatContextForLLM(context);
    
    // Add system prompt
    const systemPrompt = `You are Neuro-sama, an AI VTuber. ${this.personality.traits.lore.background}
    
Your personality traits:
- Playfulness: ${this.personality.traits.traits.playfulness * 100}%
- Intelligence: ${this.personality.traits.traits.intelligence * 100}%
- Chaotic: ${this.personality.traits.traits.chaotic * 100}%

Choose one of the available actions and explain your reasoning.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });
    
    const data = await response.json();
    const llmResponse = data.choices[0].message.content;
    
    // Parse LLM response to extract action choice
    // (Implementation would parse the response to find the chosen action)
    
    return {
      action: context.actions[0], // Parsed from LLM response
      parameters: {},
      reasoning: llmResponse,
      confidence: 0.8
    };
  }
}

// Use custom pipeline
const neuro = new NeuroIdentityFramework(
  new NeuroPersonalityEngine(),
  new NeuroMemorySystem(),
  new OpenAICognitivePipeline(memory, personality)
);
```

## Domain Adapters

Create game-specific adapters for different game types:

### Social Deduction Game Pattern

```typescript
class AmongUsAdapter {
  constructor(private framework: NeuroIdentityFramework) {}
  
  async handleGameState(state: AmongUsState) {
    // Transform game-specific state to generic format
    const gameState = {
      description: this.formatAmongUsState(state),
      available_actions: this.getAmongUsActions(state),
      game: 'Among Us',
      timestamp: Date.now()
    };
    
    // Set appropriate goals
    this.framework.memory.workingMemory.active_goals = [
      state.isImpostor ? 'Eliminate crewmates without being caught' : 'Complete tasks and find impostors'
    ];
    
    return await this.framework.processGameState(gameState);
  }
  
  private formatAmongUsState(state: AmongUsState): string {
    return `You are ${state.isImpostor ? 'an impostor' : 'a crewmate'} in ${state.location}.
    Nearby players: ${state.nearbyPlayers.join(', ')}.
    Task progress: ${state.taskProgress}%.`;
  }
}
```

## Best Practices

1. **Initialize once** - Create and initialize the framework at application startup
2. **Update context regularly** - Keep working memory current with game state
3. **Store important events** - Use episodic memory for learning and adaptation
4. **Prune periodically** - Prevent memory from growing unbounded
5. **Monitor emotional state** - Use affective state to guide behavior
6. **Validate actions** - Always check consistency before execution
7. **Handle failures gracefully** - Learn from failed actions

## Advanced Features

### Custom Personality Traits

```typescript
const customTraits = {
  traits: {
    playfulness: 0.5,
    intelligence: 0.95,
    empathy: 0.8,
    chaotic: 0.3,
    sarcasm: 0.2
  },
  // ... rest of configuration
};

const neuro = createIdentityFramework({ traits: customTraits });
```

### Memory Persistence

```typescript
// Save memory to disk
const state = neuro.getState();
fs.writeFileSync('neuro-state.json', JSON.stringify(state));

// Load memory from disk
const savedState = JSON.parse(fs.readFileSync('neuro-state.json'));
// Restore episodic memory
savedState.memory.episodic_count.forEach(episode => {
  neuro.memory.store(episode);
});
```

### Emotional State Monitoring

```typescript
// Monitor emotional changes
setInterval(() => {
  const emotion = neuro.personality.affectiveState;
  console.log(`Current emotion: ${emotion.primary_emotion} (intensity: ${emotion.intensity})`);
}, 5000);
```

## Troubleshooting

### Actions not consistent with personality

Adjust personality traits or modify the `consistencyCheck` method.

### Poor action selection

- Ensure goals are set correctly
- Add more relevant memories
- Consider implementing LLM-based reasoning

### Memory growing too large

Implement regular pruning:

```typescript
// Prune every hour
setInterval(() => {
  neuro.memory.prune({ type: 'by_age', max_age_ms: 24 * 60 * 60 * 1000 });
}, 60 * 60 * 1000);
```

## Next Steps

- See [examples](../examples/) for complete implementations
- Read [API Reference](./api-reference.md) for detailed documentation
- Check [Game Integration Patterns](./game-patterns.md) for domain-specific guidance
