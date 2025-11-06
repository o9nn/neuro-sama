# Neuro-Sama Identity Framework

The Identity Framework provides a comprehensive system for implementing AI agent personalities, cognitive architectures, and behavioral patterns based on the VedalAI architectural genome, **enhanced with Vervaeke's cognitive science framework for authentic relevance realization and wisdom cultivation**.

## Overview

This framework implements the 5-layer architecture described in the Neuro-Sama cognitive architecture:

1. **Communication Protocol Layer** - WebSocket-based nervous system
2. **Cognitive Integration Surface** - Perception and action affordances
3. **Domain Adapter Layer** - Game-specific context handlers
4. **Rendering Pipeline** - Visual and behavioral output
5. **Identity Projection** - Public-facing personality and brand

## Enhanced Cognitive Systems (NEW)

The framework now includes advanced cognitive systems based on **John Vervaeke's framework** for addressing the meaning crisis through wisdom cultivation:

### 🧠 Relevance Realization Engine
- **Multi-constraint optimization** replacing simple keyword matching
- **Opponent processing** for balancing exploration vs. exploitation
- **Dynamic salience landscaping** with attention feedback loops
- **Personality-tuned constraint weighting** (chaotic → exploration, intelligent → depth)

### 👁️ Framing System (Perspectival Knowing)
- **Active framing** through multiple interpretive schemas (play, strategy, chaos, social, learning, threat)
- **Aspect perception** - seeing situations from different perspectives
- **Gestalt detection** for emergent pattern recognition
- **Insight generation** through frame shifting

### 🎯 Meta-Cognitive Monitor
- **Bullshit detection** identifying self-deceptive reasoning
- **Contradiction detection** across propositional, procedural, and contextual dimensions
- **Confidence calibration** ensuring appropriate uncertainty
- **Active open-mindedness** assessment
- **Reasoning quality scoring** with improvement suggestions

### Four Ways of Knowing Integration

The enhanced framework now supports all four ways of knowing (not just propositional):

1. **Propositional Knowing** (knowing-that) ✓ - Facts and beliefs
2. **Procedural Knowing** (knowing-how) ⚠️ - Skills and competencies  
3. **Perspectival Knowing** (knowing-as) ✓ - Framing and aspect perception
4. **Participatory Knowing** (knowing-by) ⚠️ - Transformative identity

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

## Enhanced Usage Example

```typescript
import {
  createIdentityFramework,
  createRelevanceEngine,
  FramingSystem,
  createMetaCognitiveMonitor
} from '@neuro-sama/identity-framework';

// Initialize framework
const neuro = createIdentityFramework({ memorySize: 20 });
await neuro.initialize();

// Create enhanced cognitive systems
const relevanceEngine = createRelevanceEngine({
  chaotic: 0.7,      // High exploration
  intelligence: 0.9,  // Prefer depth and accuracy
  playfulness: 0.8
});

const framingSystem = new FramingSystem();
const metaCognition = createMetaCognitiveMonitor();

// Build memory context
relevanceEngine.updateLandscape(episode, 0.7);

// Realize relevance with opponent processing
const relevant = relevanceEngine.realizeRelevance(
  'Should I play safe or chaotic?',
  ['high stakes', 'audience watching'],
  5
);

// Apply framing for perspectival knowing
const framed = framedPerception(
  framingSystem,
  gameState,
  neuro.personality.affectiveState,
  { playfulness: 0.8, intelligence: 0.9, chaotic: 0.7, empathy: 0.6 }
);

// Monitor reasoning quality
const assessment = metaCognition.assessReasoning(context, plan);
if (assessment.bullshitDetected.length > 0) {
  console.log('Self-deception detected:', assessment.bullshitDetected);
}
```

## Character Trait Expression

### Original Implementation
- **Playfulness**: Random emoji injection
- **Intelligence**: Keyword matching
- **Chaotic**: Random action selection
- **Sarcasm**: Template prefixes

### Enhanced Implementation
- **Playfulness**: Frame selection bias toward play frame, higher exploration in opponent processing
- **Intelligence**: Multi-constraint optimization, depth preference, accuracy over speed
- **Chaotic**: High exploration vs. exploitation ratio, flexibility over stability
- **Sarcasm**: Pragmatic implicature detection (future), tone modeling
- **Self-awareness**: Meta-cognitive monitoring of own reasoning

## Cognitive Architecture Analysis

See [`docs/cognitive-architecture-analysis.md`](./docs/cognitive-architecture-analysis.md) for a comprehensive Vervaeke framework analysis identifying:

- Mechanisms for observed behavioral patterns
- Gaps in current implementation
- Priority improvements for authentic agency
- Mapping of character traits to cognitive processes

## Usage

See the [examples](./examples/) directory for implementation patterns:
- `simple-example.ts` - Basic framework usage
- `social-deduction.ts` - Advanced domain adapter
- **`enhanced-cognition-demo.ts`** - Demonstrates new relevance realization, framing, and meta-cognition systems

See the [docs](./docs/) directory for detailed API documentation:
- `integration-guide.md` - Step-by-step integration
- `architecture.md` - System architecture
- `game-patterns.md` - Game-specific patterns
- **`cognitive-architecture-analysis.md`** - Vervaeke framework analysis

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
8. **NEW**: Integrate relevance realization and framing systems
9. **NEW**: Enable meta-cognitive monitoring

See the [Integration Guide](./docs/integration-guide.md) for detailed instructions.

## What's New in v2.0

### Enhanced Cognitive Systems
- ✅ Relevance realization with opponent processing
- ✅ Perspectival knowing through framing system  
- ✅ Meta-cognitive monitoring and bullshit detection
- ✅ Insight generation through frame shifting
- ✅ Multi-constraint optimization for authentic intelligence

### Improved Character Expression
- ✅ Personality traits drive cognitive processes, not just text modification
- ✅ "Chaotic" expressed through exploration/exploitation balance
- ✅ "Intelligent" expressed through multi-constraint optimization
- ✅ "Playful" expressed through frame selection
- ✅ "Self-aware" expressed through meta-cognition

### Comprehensive Analysis
- ✅ 25,000+ word Vervaeke framework analysis document
- ✅ Identification of cognitive mechanisms for character traits
- ✅ Gap analysis and improvement roadmap
- ✅ Integration of four ways of knowing

## Future Directions

### Priority Enhancements (Identified in Analysis)
- [ ] Transformative experience handling (quantum change detection)
- [ ] Embodied emotion system (avatar state integration)
- [ ] Theory of mind for social reasoning
- [ ] Enacted cognition (action-perception loops)
- [ ] Narrative coherence tracking

### Advanced Features
- [ ] Vector database for semantic memory
- [ ] Multi-modal perception (vision, audio)
- [ ] Distributed memory across sessions
- [ ] Meta-learning from gameplay
- [ ] Personality trait evolution (bounded)

## References

**Vervaeke's Framework:**
- Awakening from the Meaning Crisis (Lecture Series)
- Relevance Realization in Cognitive Science
- Four Ways of Knowing
- Wisdom as Optimized Relevance Realization

**Framework Documentation:**
- [Architecture Overview](./docs/architecture.md)
- [Cognitive Analysis](./docs/cognitive-architecture-analysis.md)
- [Integration Guide](./docs/integration-guide.md)
- [Game Patterns](./docs/game-patterns.md)
