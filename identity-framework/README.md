# Neuro-Sama Identity Framework

The Identity Framework provides a comprehensive system for implementing AI agent personalities, cognitive architectures, and behavioral patterns based on the VedalAI architectural genome.

## Overview

This framework implements the 5-layer architecture described in the Neuro-Sama cognitive architecture:

1. **Communication Protocol Layer** - WebSocket-based nervous system
2. **Cognitive Integration Surface** - Perception and action affordances
3. **Domain Adapter Layer** - Game-specific context handlers
4. **Rendering Pipeline** - Visual and behavioral output
5. **Identity Projection** - Public-facing personality and brand

## Core Components

### Personality Engine

The personality engine maintains character consistency and manages affective states:

```typescript
interface PersonalityEngine {
  traits: CharacterTraits;
  affectiveState: EmotionalState;
  responseFilter: (input: string) => string;
  consistencyCheck: (action: Action) => boolean;
}
```

### Memory System

Episodic and working memory for context-aware decision making:

```typescript
interface MemorySystem {
  episodicMemory: Episode[];
  workingMemory: Context;
  recall: (query: string) => Episode[];
  store: (event: Event) => void;
  prune: (strategy: PruningStrategy) => void;
}
```

### Cognitive Pipeline

Transforms perception to cognition to action:

```typescript
interface CognitivePipeline {
  perception: (gameState: GameState) => CognitiveContext;
  reasoning: (context: CognitiveContext) => ActionPlan;
  actionSelection: (plan: ActionPlan) => Action;
  execution: (action: Action) => ActionResult;
}
```

## Usage

See the [examples](./examples/) directory for implementation patterns and the [docs](./docs/) directory for detailed API documentation.

## Architecture

The framework follows these architectural invariants:

1. **Text-Mediated Cognition** - All state represented in natural language
2. **Action-Oriented Agency** - Discrete action model with explicit registration
3. **Asynchronous Cognition** - Non-blocking reasoning and graceful race condition handling
4. **Context-Specific Reasoning** - Domain adapters for different game types
5. **Extensibility-First Design** - Plugin architecture for community expansion

## Integration

To integrate this framework with your game or application:

1. Implement the WebSocket protocol layer
2. Select your cognitive substrate (LLM backend)
3. Create perception-to-cognition transformations
4. Implement cognition-to-action pipeline
5. Add memory system
6. Configure personality layer
7. Create domain-specific adapter

See the [Integration Guide](./docs/integration-guide.md) for detailed instructions.
