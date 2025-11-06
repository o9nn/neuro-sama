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

// Export main framework
export * from './framework';

// Re-export main classes for convenience
export { NeuroIdentityFramework, createIdentityFramework } from './framework';
export { NeuroPersonalityEngine, DEFAULT_NEURO_TRAITS } from './personality';
export { NeuroMemorySystem, createEpisode, generateEpisodeId } from './memory';
export { NeuroCognitivePipeline, formatContextForLLM } from './cognition';
