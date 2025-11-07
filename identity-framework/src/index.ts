/**
 * Neuro-Sama Identity Framework
 * Main entry point
 */

// Export all types
export * from './types';

// Export personality engine
export * from './personality';

// Export memory system
export * from './memory';

// Export cognitive pipeline
export * from './cognition';

// Export relevance realization system
export * from './relevance';

// Export framing system
export * from './framing';

// Export meta-cognition system
export * from './metacognition';

// Export transformative experience system
export * from './transformative';

// Export embodied emotion system
export * from './embodied-emotion';

// Export theory of mind system
export * from './theory-of-mind';

// Export enacted cognition system
export * from './enacted-cognition';

// Export narrative coherence system
export * from './narrative-coherence';

// Export distributed cognition system
export * from './distributed-cognition';

// Export main framework
export * from './framework';

// Re-export main classes for convenience
export { NeuroIdentityFramework, createIdentityFramework } from './framework';
export { NeuroPersonalityEngine, DEFAULT_NEURO_TRAITS } from './personality';
export { NeuroMemorySystem, createEpisode, generateEpisodeId } from './memory';
export { NeuroCognitivePipeline, formatContextForLLM } from './cognition';
export { RelevanceRealizationEngine, createRelevanceEngine } from './relevance';
export { FramingSystem, framedPerception } from './framing';
export { MetaCognitiveMonitor, createMetaCognitiveMonitor } from './metacognition';
export { TransformativeExperienceHandler, createTransformativeHandler } from './transformative';
export { EmbodiedEmotionSystem, createEmbodiedEmotionSystem } from './embodied-emotion';
export { TheoryOfMindSystem, createTheoryOfMindSystem } from './theory-of-mind';
export { EnactedCognitionSystem, createEnactedCognitionSystem } from './enacted-cognition';
export { NarrativeCoherenceSystem, createNarrativeCoherenceSystem } from './narrative-coherence';
export { DistributedCognitionSystem, createDistributedCognitionSystem } from './distributed-cognition';
