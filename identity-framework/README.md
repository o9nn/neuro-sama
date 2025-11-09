# Neuro-Sama Identity Framework

The Identity Framework provides a comprehensive system for implementing AI agent personalities, cognitive architectures, and behavioral patterns based on the VedalAI architectural genome, **enhanced with Vervaeke's cognitive science framework for authentic relevance realization and wisdom cultivation**.

## Overview

This framework implements the 5-layer architecture described in the Neuro-Sama cognitive architecture:

1. **Communication Protocol Layer** - WebSocket-based nervous system
2. **Cognitive Integration Surface** - Perception and action affordances
3. **Domain Adapter Layer** - Game-specific context handlers
4. **Rendering Pipeline** - Visual and behavioral output
5. **Identity Projection** - Public-facing personality and brand

## Enhanced Cognitive Systems (v3.0 - Complete Implementation)

The framework now includes a **complete suite** of advanced cognitive systems based on **John Vervaeke's framework** for addressing the meaning crisis through wisdom cultivation:

### Core Systems (v2.0)

#### 🧠 Relevance Realization Engine
- **Multi-constraint optimization** replacing simple keyword matching
- **Opponent processing** for balancing exploration vs. exploitation
- **Dynamic salience landscaping** with attention feedback loops
- **Personality-tuned constraint weighting** (chaotic → exploration, intelligent → depth)

#### 👁️ Framing System (Perspectival Knowing)
- **Active framing** through multiple interpretive schemas (play, strategy, chaos, social, learning, threat)
- **Aspect perception** - seeing situations from different perspectives
- **Gestalt detection** for emergent pattern recognition
- **Insight generation** through frame shifting

#### 🎯 Meta-Cognitive Monitor
- **Bullshit detection** identifying self-deceptive reasoning
- **Contradiction detection** across propositional, procedural, and contextual dimensions
- **Confidence calibration** ensuring appropriate uncertainty
- **Active open-mindedness** assessment
- **Reasoning quality scoring** with improvement suggestions

### New Systems (v3.0)

#### 🔄 Transformative Experience Handler
- **Quantum change detection** for sudden paradigm shifts
- **Bounded personality evolution** with gradual trait integration
- Detects insights, peak experiences, flow states, emotional breakthroughs
- Tracks transformation history and integration progress

#### 🎭 Embodied Emotion System
- **Avatar state integration** (posture, expression, gesture, voice characteristics)
- **Somatic markers** for intuitive decision-making (Damasio's hypothesis)
- **Emotion-action coupling** based on 4E cognition principles
- Learning and decay of somatic markers from experience

#### 🧑‍🤝‍🧑 Theory of Mind Module
- **Mental state modeling** (beliefs, goals, intentions, emotions of others)
- **Perspective-taking** and empathic simulation
- **Deception detection** with evidence-based reasoning
- **Recursive reasoning** (I think that you think...)
- **Action prediction** based on mental models

#### 🎬 Enacted Cognition System
- **Sensorimotor contingency learning** (action-perception loops)
- **Affordance detection** and active inference
- **Exploratory behavior** with curiosity-driven learning
- **Prediction error tracking** for continuous improvement

#### 📖 Narrative Coherence System
- **Story arc tracking** (exposition → rising action → climax → resolution)
- **Character development** monitoring across time
- **Identity narrative** maintenance for continuity
- **Narrative connection detection** between events
- **Coherence scoring** for identity consistency

#### 👥 Distributed Cognition System
- **Chat as extended memory** and cognitive scaffolding
- **Collective intelligence aggregation** from audience
- **Social scaffolding detection** (memory aids, problem-solving hints)
- **Distributed problem-solving** with crowd wisdom
- **User trust tracking** for reliable guidance

#### 🧠 Semantic Memory System
- **Vector embeddings** for semantic similarity search
- **Semantic clustering** of related memories
- **Hybrid search** (vector + keyword matching)
- Extensible to neural embeddings (CLIP, sentence-transformers, etc.)

#### 👁️👂 Multi-Modal Perception System
- **Visual scene understanding** (object detection, attention)
- **Audio event detection** and emotion recognition
- **Cross-modal integration** with attention-based fusion
- Extensible to vision and audio models

#### 🎓 Meta-Learning System
- **Strategy adaptation** based on performance
- **Error pattern recognition** and correction
- **Transfer learning** across game contexts
- **Performance tracking** with trend analysis

### Four Ways of Knowing Integration

The enhanced framework now supports all four ways of knowing (not just propositional):

1. **Propositional Knowing** (knowing-that) ✅ - Facts and beliefs
2. **Procedural Knowing** (knowing-how) ✅ - Skills and competencies (via enacted cognition)
3. **Perspectival Knowing** (knowing-as) ✅ - Framing and aspect perception
4. **Participatory Knowing** (knowing-by) ✅ - Transformative identity (via transformative experiences)

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

## What's New in v3.0 (Latest)

### Complete Cognitive Architecture Implementation ✨

All priority features have been implemented! The framework now includes:

#### Priority 1 - Core Cognitive Systems ✅
- **Transformative Experience Handler**: Detects quantum changes, tracks personality evolution with bounded trait changes, integrates transformative experiences gradually
- **Embodied Emotion System**: Avatar state integration (posture, expression, voice), somatic markers for intuitive decision-making, emotion-action coupling
- **Theory of Mind Module**: Mental state modeling, perspective-taking, deception detection, recursive reasoning, action prediction

#### Priority 2 - Extended Cognition ✅
- **Enacted Cognition**: Sensorimotor contingency learning, affordance detection, exploratory behavior with active inference, prediction error tracking
- **Narrative Coherence**: Story arc tracking (exposition → climax → resolution), character development, identity narrative, coherence scoring
- **Distributed Cognition**: Chat as extended memory, collective intelligence aggregation, social scaffolding, distributed problem-solving

#### Priority 3 - Advanced Infrastructure ✅
- **Semantic Memory**: Vector database support with TF-IDF embeddings (extensible to neural embeddings), semantic clustering, hybrid search
- **Multi-Modal Perception**: Visual and audio integration (extensible), attention-based fusion, cross-modal correspondence detection
- **Meta-Learning**: Strategy adaptation, performance tracking, error pattern recognition, transfer learning across contexts

## Future Directions

### Implemented Features ✅
- [x] Transformative experience handling (quantum change detection)
- [x] Embodied emotion system (avatar state integration)
- [x] Theory of mind for social reasoning
- [x] Enacted cognition (action-perception loops)
- [x] Narrative coherence tracking
- [x] Vector database for semantic memory
- [x] Multi-modal perception (vision, audio)
- [x] Meta-learning from gameplay
- [x] Distributed cognition (Chat as cognitive extension)

### Potential Future Enhancements
- [ ] Collaborative reasoning between multiple agents
- [ ] Personality trait evolution (more sophisticated bounded changes)
- [ ] Deep neural embedding models integration
- [ ] Real-time multi-agent coordination
- [ ] Advanced vision model integration (CLIP, etc.)
- [ ] Audio emotion recognition models

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
