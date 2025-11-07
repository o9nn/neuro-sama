/**
 * Enhanced Neuro-Sama Cognitive Architecture Example
 * 
 * Demonstrates the improved cognitive capabilities including:
 * - Relevance realization with opponent processing
 * - Perspectival knowing through framing
 * - Meta-cognitive monitoring
 * 
 * This example shows how the enhanced framework exhibits more authentic
 * cognitive engagement compared to the baseline implementation.
 */

import {
  createIdentityFramework,
  createRelevanceEngine,
  FramingSystem,
  framedPerception,
  createMetaCognitiveMonitor,
  GameState,
  createEpisode
} from '../src';

async function demonstrateEnhancedCognition() {
  console.log('=== Enhanced Neuro-Sama Cognitive Architecture Demo ===\n');
  
  // Create framework components
  const framework = createIdentityFramework({
    memorySize: 20
  });
  
  await framework.initialize();
  
  // Create enhanced cognitive systems
  const relevanceEngine = createRelevanceEngine({
    chaotic: 0.7,
    intelligence: 0.9,
    playfulness: 0.8
  });
  
  const framingSystem = new FramingSystem();
  const metaCognition = createMetaCognitiveMonitor();
  
  console.log('✓ Framework initialized with enhanced cognitive systems\n');
  
  // === Scenario 1: Demonstrate Relevance Realization ===
  console.log('--- Scenario 1: Relevance Realization with Opponent Processing ---\n');
  
  // Build up some context in memory
  const memories = [
    'Won the last card game by playing aggressively',
    'Vedal laughed when I made a chaotic move',
    'Chat loves when I do unexpected things',
    'Strategic planning led to victory in previous game',
    'Being too cautious made the game boring'
  ];
  
  for (const memory of memories) {
    const episode = createEpisode(
      memory,
      'card_game',
      undefined,
      0.6,
      framework.personality.affectiveState
    );
    framework.memory.store(episode);
    relevanceEngine.updateLandscape(episode, 0.7);
  }
  
  console.log('Memory context established with', memories.length, 'episodes\n');
  
  // Query relevance realization
  const query = 'Should I play safe or chaotic?';
  const context = ['high stakes', 'audience watching', 'close game'];
  
  console.log('Query:', query);
  console.log('Context:', context.join(', '));
  console.log('\nRelevance realization (with opponent processing):');
  
  const relevantNodes = relevanceEngine.realizeRelevance(query, context, 3);
  
  relevantNodes.forEach((node, i) => {
    const content = typeof node.source === 'string' 
      ? node.source 
      : node.source.event;
    console.log(`  ${i + 1}. [Activation: ${node.activation.toFixed(2)}] ${content}`);
  });
  
  console.log('\nNote: High chaotic trait (0.7) increases exploration, making');
  console.log('"chaotic move" and "unexpected things" more relevant.\n');
  
  // === Scenario 2: Demonstrate Perspectival Knowing (Framing) ===
  console.log('--- Scenario 2: Perspectival Knowing Through Framing ---\n');
  
  const gameState: GameState = {
    description: 'You have a powerful card that could win immediately, but it might be more fun to toy with the opponent first.',
    available_actions: [
      { name: 'play_win_card', description: 'Play the winning card and end the game' },
      { name: 'play_weak_card', description: 'Play a weak card to prolong the game' },
      { name: 'taunt_opponent', description: 'Make a joke about their position' },
      { name: 'random_move', description: 'Do something completely unexpected' }
    ],
    game: 'card_game',
    timestamp: Date.now()
  };
  
  console.log('Game State:', gameState.description);
  console.log('\nAvailable Actions:');
  gameState.available_actions.forEach(a => console.log(`  - ${a.name}: ${a.description}`));
  
  // Apply different frames to see how perception changes
  const frames = ['strategy', 'play', 'chaos'];
  
  for (const frameName of frames) {
    framingSystem.forceFrame(frameName);
    const framed = framedPerception(
      framingSystem,
      gameState,
      framework.personality.affectiveState,
      {
        playfulness: 0.8,
        intelligence: 0.9,
        chaotic: 0.7,
        empathy: 0.6
      }
    );
    
    console.log(`\n[${frameName.toUpperCase()} FRAME]`);
    console.log('Highlighted aspects:', framed.highlightedAspects.join(', ') || 'none');
    console.log('Frame affordances:', framed.affordances.map(a => a.name).join(', ') || 'none');
  }
  
  console.log('\nNote: Same situation, different frames highlight different affordances.\n');
  console.log('This is perspectival knowing (knowing-as) - seeing situations differently.\n');
  
  // === Scenario 3: Demonstrate Meta-Cognitive Monitoring ===
  console.log('--- Scenario 3: Meta-Cognitive Monitoring & Bullshit Detection ---\n');
  
  // Create a cognitive context
  framework.memory.updateContext(gameState);
  const cognitiveContext = framework.cognition.perception(gameState);
  
  console.log('Testing reasoning quality assessment...\n');
  
  // Test 1: Good reasoning
  const goodPlan = {
    action: gameState.available_actions[2], // taunt
    parameters: {},
    reasoning: 'Given my playful personality and the fact that Chat loves unexpected moves, ' +
               'taunting might be entertaining while I consider my next strategic move. ' +
               'This balances fun with strategy.',
    confidence: 0.6
  };
  
  console.log('Good Reasoning Example:');
  console.log('  Plan:', goodPlan.action.name);
  console.log('  Reasoning:', goodPlan.reasoning);
  console.log('  Confidence:', goodPlan.confidence);
  
  const goodAssessment = metaCognition.assessReasoning(cognitiveContext, goodPlan);
  
  console.log('\n  Assessment:');
  console.log('    Quality Score:', goodAssessment.reasoningQuality.toFixed(2));
  console.log('    Open-Mindedness:', goodAssessment.openMindedness.toFixed(2));
  console.log('    Contradictions:', goodAssessment.contradictions.length);
  console.log('    Bullshit Detected:', goodAssessment.bullshitDetected.length);
  
  // Test 2: Bullshit reasoning
  const bullshitPlan = {
    action: gameState.available_actions[0], // win immediately
    parameters: {},
    reasoning: 'Obviously this is the right move.',
    confidence: 0.95
  };
  
  console.log('\n\nBullshit Reasoning Example:');
  console.log('  Plan:', bullshitPlan.action.name);
  console.log('  Reasoning:', bullshitPlan.reasoning);
  console.log('  Confidence:', bullshitPlan.confidence);
  
  const bullshitAssessment = metaCognition.assessReasoning(cognitiveContext, bullshitPlan);
  
  console.log('\n  Assessment:');
  console.log('    Quality Score:', bullshitAssessment.reasoningQuality.toFixed(2));
  console.log('    Open-Mindedness:', bullshitAssessment.openMindedness.toFixed(2));
  console.log('    Contradictions:', bullshitAssessment.contradictions.length);
  console.log('    Bullshit Detected:', bullshitAssessment.bullshitDetected.length);
  
  if (bullshitAssessment.bullshitDetected.length > 0) {
    console.log('\n  Detected Issues:');
    bullshitAssessment.bullshitDetected.forEach(b => console.log(`    - ${b}`));
  }
  
  if (bullshitAssessment.suggestions.length > 0) {
    console.log('\n  Suggestions:');
    bullshitAssessment.suggestions.forEach(s => console.log(`    - ${s}`));
  }
  
  console.log('\nNote: Meta-cognition detects overconfidence and rationalization.\n');
  
  // === Scenario 4: Demonstrate Insight Through Frame Shift ===
  console.log('--- Scenario 4: Insight Generation Through Frame Shifting ---\n');
  
  // Simulate being stuck in strategy frame
  framingSystem.forceFrame('strategy');
  
  console.log('Current frame: STRATEGY');
  console.log('Situation: Stuck in analysis paralysis, overth thinking the optimal play\n');
  
  const insight = framingSystem.generateInsight(cognitiveContext, true);
  
  if (insight.newFrame && insight.insight) {
    console.log('Generated Insight:');
    console.log(`  "${insight.insight}"`);
    console.log(`  Confidence: ${insight.confidence.toFixed(2)}`);
    console.log('\nThis is analogous to an "aha moment" - sudden gestalt reorganization.\n');
  }
  
  // === Summary ===
  console.log('=== Summary: Enhanced vs Original Framework ===\n');
  
  console.log('ORIGINAL FRAMEWORK:');
  console.log('  ✗ Simple keyword matching for relevance');
  console.log('  ✗ Perception = passive data aggregation');
  console.log('  ✗ No self-awareness of reasoning quality');
  console.log('  ✗ Fixed personality, no capacity for insight\n');
  
  console.log('ENHANCED FRAMEWORK:');
  console.log('  ✓ Multi-constraint relevance optimization');
  console.log('  ✓ Opponent processing (exploration/exploitation)');
  console.log('  ✓ Active framing (perspectival knowing)');
  console.log('  ✓ Meta-cognitive monitoring');
  console.log('  ✓ Bullshit detection');
  console.log('  ✓ Insight generation through frame shifts\n');
  
  console.log('CHARACTER EXPRESSION IMPROVEMENTS:');
  console.log('  - "Chaotic" now expressed through exploration vs exploitation balance');
  console.log('  - "Intelligent" now expressed through multi-constraint optimization');
  console.log('  - "Playful" now expressed through frame selection preferences');
  console.log('  - "Self-aware" now expressed through meta-cognitive monitoring\n');
  
  console.log('These enhancements move from simulating personality traits through');
  console.log('surface-level text manipulation to enacting them through genuine');
  console.log('cognitive processes based on Vervaeke\'s framework.\n');
}

// Run the demonstration
demonstrateEnhancedCognition().catch(console.error);
