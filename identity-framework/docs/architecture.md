# Neuro-Sama Cognitive Architecture

This document describes the complete cognitive architecture of the Neuro-Sama Identity Framework, based on the VedalAI architectural genome.

## Architecture Overview

The framework implements a 5-layer architecture inspired by biological cognitive systems:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: Identity Projection (Public Interface)           │
│  - Web presence                                             │
│  - Brand representation                                     │
│  - Community interaction                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Rendering Pipeline (Perceptual Output)           │
│  - Avatar animation                                         │
│  - Emotional expression                                     │
│  - Voice synthesis                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Domain Adapters (Game Context)                   │
│  - Social deduction pattern                                 │
│  - Knowledge game pattern                                   │
│  - Swarm control pattern                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Cognitive Integration Surface (API)              │
│  - Personality Engine                                       │
│  - Memory System                                            │
│  - Cognitive Pipeline                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Communication Protocol (WebSocket)                │
│  - Game state updates                                       │
│  - Action registration                                      │
│  - Action execution                                         │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Communication Protocol

The nervous system of the architecture - WebSocket-based bidirectional communication.

### Message Flow

```typescript
Game → Agent:
- context_update      // Game state synchronization
- action_registration // Capability advertisement
- action_force        // Required action with timeout

Agent → Game:
- action_execution    // Decision → world modification
- query_response      // Information retrieval
```

### Key Features

- **Real-time**: Sub-second latency requirements
- **Bidirectional**: Full duplex communication
- **Atomic**: Race condition handling for action execution
- **Disposable lifecycle**: Register → Force → Execute → Unregister

## Layer 2: Cognitive Integration Surface

The core cognitive architecture with three main subsystems.

### 2.1 Personality Engine

Maintains character consistency and emotional modeling.

**Components:**

```typescript
interface PersonalityEngine {
  traits: CharacterTraits;        // Stable personality dimensions
  affectiveState: EmotionalState; // Dynamic emotional state
  responseFilter: Function;       // Personality-consistent output
  consistencyCheck: Function;     // Action validation
}
```

**Personality Model:**

- **Traits** (stable): playfulness, intelligence, empathy, chaotic, sarcasm
- **Emotional State** (dynamic): valence, arousal, intensity
- **Affective Dynamics**: Event-driven emotional updates with decay

**Emotional State Machine:**

```
                    ┌─────────┐
        High        │ Excited │
       Arousal      └────┬────┘
          ↑              │
          │         Positive
          │         Valence
          │              │
          │         ┌────▼────┐
    ┌─────┴─────┐  │  Happy  │
    │  Annoyed  │  └─────────┘
    └───────────┘
          │
          │         Negative
      Low │         Valence
      Arousal          │
          │         ┌──▼──────┐
          └─────────┤ Neutral │
                    └─────────┘
```

### 2.2 Memory System

Episodic and working memory for context-aware decisions.

**Architecture:**

```typescript
interface MemorySystem {
  episodicMemory: Episode[];    // Long-term event storage
  workingMemory: Context;       // Short-term active context
  recall: Function;             // Semantic retrieval
  store: Function;              // Event persistence
  prune: Function;              // Memory management
}
```

**Memory Types:**

1. **Episodic Memory**: Long-term event storage
   - Timestamped episodes
   - Emotional context
   - Importance scoring
   - Outcome tracking

2. **Working Memory**: Active context
   - Recent events (bounded window)
   - Current game state
   - Active goals
   - Attention focus

**Retrieval Mechanism:**

```
Query → Scoring (word match + recency + importance) → Ranking → Top-K
```

**Pruning Strategies:**

- By age (temporal decay)
- By importance (significance threshold)
- By count (capacity limit)
- By relevance (semantic filtering)

### 2.3 Cognitive Pipeline

Transform perception → cognition → action.

**Pipeline Stages:**

```typescript
interface CognitivePipeline {
  perception: GameState → CognitiveContext;
  reasoning: CognitiveContext → Promise<ActionPlan>;
  actionSelection: ActionPlan → Action;
  execution: Action → Promise<ActionResult>;
}
```

**Data Flow:**

```
Raw Game State
     ↓
[Perception] → Add memories, emotional state, goals
     ↓
Cognitive Context
     ↓
[Reasoning] → LLM or rule-based decision making
     ↓
Action Plan
     ↓
[Selection] → Extract chosen action
     ↓
Action
     ↓
[Execution] → Send to game, await result
     ↓
Action Result → Update emotion & memory
```

## Layer 3: Domain Adapters

Game-specific context handlers that bridge generic framework to specific games.

### Adapter Pattern

```typescript
class GameAdapter {
  constructor(private framework: IdentityFramework) {}
  
  // Transform game-specific state to generic format
  transformState(gameState: GameSpecificState): GameState;
  
  // Set game-specific goals and context
  configureContext(gameState: GameSpecificState): void;
  
  // Process and return action
  async decide(gameState: GameSpecificState): Promise<ActionPlan>;
}
```

### Game Patterns

1. **Social Deduction** (Among Us)
   - Theory of mind
   - Deception/truth detection
   - Social dynamics tracking

2. **Knowledge Games** (Millionaire)
   - Fact retrieval
   - Confidence assessment
   - Risk/reward analysis

3. **Swarm Control** (Twitch Plays)
   - Vote aggregation
   - Statistical decision making
   - Chaos management

## Layer 4: Rendering Pipeline

Visual and auditory output generation (future integration).

**Components:**

- Avatar animation system
- Facial expression mapping
- Voice synthesis (TTS)
- Emotional prosody modulation

**Emotion → Expression Mapping:**

```
Emotional State → Animation Parameters → Visual Rendering
                → Prosody Parameters → Voice Synthesis
```

## Layer 5: Identity Projection

Public-facing personality and brand presence.

**Components:**

- Character lore and background
- Relationship definitions
- Communication style
- Brand consistency

## Architectural Invariants

These principles MUST be maintained:

### 1. Text-Mediated Cognition

**Principle**: LLM cognitive substrate operates in linguistic space.

**Constraint**: Game state MUST be describable in natural language.

**Consequence**: Turn-based games are optimal domain.

### 2. Action-Oriented Agency

**Principle**: Agent makes decisions by selecting from action-space.

**Constraint**: All possible actions must be explicitly registered.

**Consequence**: Action registration = capability advertisement.

### 3. Asynchronous Cognition

**Principle**: Agent may deliberate while game continues.

**Constraint**: System must handle race conditions gracefully.

**Consequence**: Atomic action handling is critical.

### 4. Context-Specific Reasoning

**Principle**: Different games require different cognitive modes.

**Constraint**: Each game needs specialized integration module.

**Consequence**: SDK provides protocol, games provide context.

### 5. Extensibility-First Design

**Principle**: Community-driven ecosystem expansion.

**Constraint**: SDK must be engine/language agnostic.

**Consequence**: WebSocket protocol as universal interface.

## Cognitive Capabilities

Required capabilities for full implementation:

### Core Cognitive Layer

- ✅ Natural language understanding (via LLM)
- ✅ Strategic reasoning
- ✅ Decision making under uncertainty
- ✅ Episodic memory formation
- ✅ Natural language generation

### Protocol Layer

- ✅ WebSocket client implementation
- ✅ JSON serialization/deserialization
- ✅ Asynchronous message handling
- ✅ Race condition management

### Integration Layer

- ✅ Game state extraction
- ✅ Action injection
- ⚠️ Game engine hooking (game-specific)

## Implementation Template

### Step-by-Step Integration

1. **Implement Protocol**
   ```typescript
   const client = new WebSocketClient(url);
   client.on('message', handleMessage);
   ```

2. **Select Cognitive Substrate**
   ```typescript
   const llm = new LLMBackend('gpt-4');
   ```

3. **Perception → Cognition**
   ```typescript
   const context = cognition.perception(gameState);
   ```

4. **Cognition → Action**
   ```typescript
   const plan = await cognition.reasoning(context);
   ```

5. **Add Memory**
   ```typescript
   memory.store(episode);
   ```

6. **Add Personality**
   ```typescript
   const filtered = personality.responseFilter(response);
   ```

7. **Domain Adapter**
   ```typescript
   const adapter = new GameAdapter(framework);
   ```

## Performance Characteristics

### Time Complexity

- Perception: O(1)
- Memory recall: O(n log n) where n = total memories
- Reasoning: O(LLM latency) ≈ 1-5 seconds
- Action execution: O(1)

### Space Complexity

- Episodic memory: O(n) where n = stored episodes
- Working memory: O(k) where k = window size (constant)
- Personality state: O(1)

### Optimization Strategies

1. **Memory pruning**: Regular cleanup of old episodes
2. **Context windowing**: Bounded working memory
3. **Batch processing**: Group state updates
4. **Caching**: Pre-compute common patterns

## Testing Architecture

### Mock Agents

1. **Randy**: Random action generator (integration testing)
2. **Tony**: Manual action interface (debugging)
3. **Jippity**: LLM-powered mock (realistic testing)
4. **Gary**: Local LLM backend (advanced testing)

### Test Coverage

- Unit tests: Individual components
- Integration tests: Component interactions
- Domain tests: Game-specific adapters
- End-to-end tests: Full pipeline

## Future Extensions

### Planned Features

- [ ] Vector database for semantic memory
- [ ] Multi-modal perception (vision, audio)
- [ ] Distributed memory across sessions
- [ ] Meta-learning from gameplay
- [ ] Personality evolution over time

### Research Directions

- Improved emotional modeling
- Better theory of mind
- Advanced deception detection
- Collaborative reasoning
- Transfer learning across games

## References

- API Specification: `/API/SPECIFICATION.md`
- Integration Guide: `/identity-framework/docs/integration-guide.md`
- Game Patterns: `/identity-framework/docs/game-patterns.md`
- Unity SDK: `/Unity/README.md`
- Godot SDK: `/Godot/README.md`
