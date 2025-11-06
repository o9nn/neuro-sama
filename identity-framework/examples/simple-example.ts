/**
 * Simple example demonstrating the Identity Framework
 */

import {
  createIdentityFramework,
  GameState,
  Action
} from '../src';

async function main() {
  console.log('=== Neuro-Sama Identity Framework Example ===\n');

  // Create and initialize framework
  const neuro = createIdentityFramework({
    memorySize: 10
  });

  await neuro.initialize();
  console.log('Framework initialized!\n');

  // Simulate a simple card game
  console.log('=== Card Game Scenario ===\n');

  // Round 1: Choose a card to play
  const round1: GameState = {
    description: "You have three cards in your hand: Ace of Spades, King of Hearts, and Queen of Diamonds. Your opponent just played a Jack. Which card do you play?",
    available_actions: [
      { name: "play_ace", description: "Play the Ace of Spades (highest card)" },
      { name: "play_king", description: "Play the King of Hearts (second highest)" },
      { name: "play_queen", description: "Play the Queen of Diamonds (lowest of your cards)" }
    ],
    game: "Card Game",
    timestamp: Date.now()
  };

  console.log('Game state:', round1.description);
  console.log('\nNeuro is thinking...\n');

  const plan1 = await neuro.processGameState(round1);
  console.log(`Neuro chose: ${plan1.action.name}`);
  console.log(`Reasoning: ${plan1.reasoning}`);
  console.log(`Confidence: ${(plan1.confidence * 100).toFixed(1)}%`);
  console.log(`Emotional state: ${neuro.personality.affectiveState.primary_emotion}\n`);

  // Execute action and simulate success
  const result1 = await neuro.executeAction(plan1);
  console.log(`Result: ${result1.message}\n`);

  // Round 2: React to opponent's move
  const round2: GameState = {
    description: "Your opponent played a 10 and you won the round! You gain 5 points. Now it's a new round and you have: 7 of Clubs, 9 of Spades, and Jack of Hearts.",
    available_actions: [
      { name: "play_seven", description: "Play the 7 of Clubs" },
      { name: "play_nine", description: "Play the 9 of Spades" },
      { name: "play_jack", description: "Play the Jack of Hearts" }
    ],
    game: "Card Game",
    timestamp: Date.now()
  };

  // Simulate time passing
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('=== Round 2 ===\n');
  console.log('Game state:', round2.description);
  console.log('\nNeuro is thinking...\n');

  const plan2 = await neuro.processGameState(round2);
  console.log(`Neuro chose: ${plan2.action.name}`);
  console.log(`Reasoning: ${plan2.reasoning}`);
  console.log(`Confidence: ${(plan2.confidence * 100).toFixed(1)}%`);
  console.log(`Emotional state: ${neuro.personality.affectiveState.primary_emotion}\n`);

  // Check memory
  console.log('=== Memory Check ===\n');
  const memories = neuro.memory.recall('card', 5);
  console.log(`Neuro has ${memories.length} relevant memories about cards:`);
  memories.forEach((mem, i) => {
    console.log(`${i + 1}. ${mem.event} - ${mem.outcome || 'no outcome yet'}`);
  });

  // Check overall state
  console.log('\n=== Framework State ===\n');
  const state = neuro.getState();
  console.log(`Total memories: ${state.memory.episodic_count}`);
  console.log(`Working memory events: ${state.memory.working_memory.recent_events.length}`);
  console.log(`Current emotional state: ${state.personality.emotion.primary_emotion}`);
  console.log(`Emotional intensity: ${(state.personality.emotion.intensity * 100).toFixed(1)}%`);
  console.log('\nPersonality traits:');
  Object.entries(state.personality.traits.traits).forEach(([trait, value]) => {
    console.log(`  ${trait}: ${(value * 100).toFixed(0)}%`);
  });
}

main().catch(console.error);
