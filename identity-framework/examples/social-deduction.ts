/**
 * Advanced example: Social Deduction Game (Among Us pattern)
 * Demonstrates domain adapter, emotional modeling, and memory integration
 */

import {
  createIdentityFramework,
  GameState,
  Action,
  createEpisode,
  NeuroIdentityFramework
} from '../src';

// Domain-specific state for social deduction game
interface SocialDeductionState {
  location: string;
  nearbyPlayers: string[];
  myRole: 'crewmate' | 'impostor';
  taskProgress: number;
  suspicionLevels: Map<string, number>;
  recentEvents: string[];
}

// Social deduction game adapter
class SocialDeductionAdapter {
  constructor(private framework: NeuroIdentityFramework) {}

  async processGameState(state: SocialDeductionState): Promise<any> {
    // Transform to generic format
    const description = this.formatState(state);
    const actions = this.getAvailableActions(state);

    // Set role-specific goals
    const goals = state.myRole === 'impostor'
      ? [
          'Eliminate crewmates without being caught',
          'Create alibis',
          'Avoid suspicion',
          'Use vents strategically'
        ]
      : [
          'Complete tasks to win',
          'Identify the impostor',
          'Survive and be cautious',
          'Report suspicious behavior'
        ];

    this.framework.memory.workingMemory.active_goals = goals;

    // Adjust personality based on role
    if (state.myRole === 'impostor') {
      // More chaotic and less empathetic when impostor
      this.framework.personality.traits.traits.chaotic = 0.9;
      this.framework.personality.traits.traits.empathy = 0.3;
    } else {
      // More cautious and empathetic as crewmate
      this.framework.personality.traits.traits.chaotic = 0.5;
      this.framework.personality.traits.traits.empathy = 0.8;
    }

    const gameState: GameState = {
      description,
      available_actions: actions,
      game: 'Among Us',
      timestamp: Date.now()
    };

    return await this.framework.processGameState(gameState);
  }

  private formatState(state: SocialDeductionState): string {
    let desc = `You are ${state.myRole === 'impostor' ? 'an impostor' : 'a crewmate'} `;
    desc += `in ${state.location}.\n`;

    if (state.nearbyPlayers.length > 0) {
      desc += `Nearby players: ${state.nearbyPlayers.join(', ')}.\n`;
    } else {
      desc += `You are alone.\n`;
    }

    if (state.myRole === 'crewmate') {
      desc += `Task completion: ${state.taskProgress}%.\n`;
    }

    if (state.recentEvents.length > 0) {
      desc += `\nRecent events:\n`;
      state.recentEvents.forEach(event => {
        desc += `- ${event}\n`;
      });
    }

    // Add suspicion information
    if (state.suspicionLevels.size > 0) {
      desc += `\nSuspicion levels:\n`;
      Array.from(state.suspicionLevels.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([player, level]) => {
          desc += `- ${player}: ${(level * 100).toFixed(0)}% suspicious\n`;
        });
    }

    return desc;
  }

  private getAvailableActions(state: SocialDeductionState): Action[] {
    const actions: Action[] = [];

    // Movement actions
    actions.push({
      name: 'move_to_cafeteria',
      description: 'Move to the Cafeteria'
    });
    actions.push({
      name: 'move_to_electrical',
      description: 'Move to Electrical'
    });
    actions.push({
      name: 'move_to_medbay',
      description: 'Move to Medbay'
    });

    // Social actions
    if (state.nearbyPlayers.length > 0) {
      actions.push({
        name: 'call_emergency_meeting',
        description: 'Call an emergency meeting to discuss suspicions'
      });

      state.nearbyPlayers.forEach(player => {
        actions.push({
          name: `follow_${player}`,
          description: `Follow ${player}`
        });
      });
    }

    // Role-specific actions
    if (state.myRole === 'impostor') {
      if (state.nearbyPlayers.length === 1) {
        actions.push({
          name: `eliminate_${state.nearbyPlayers[0]}`,
          description: `Eliminate ${state.nearbyPlayers[0]} (impostor only)`
        });
      }
      actions.push({
        name: 'use_vent',
        description: 'Use the vent system to move quickly (impostor only)'
      });
      actions.push({
        name: 'sabotage_oxygen',
        description: 'Sabotage the oxygen system (impostor only)'
      });
    } else {
      actions.push({
        name: 'complete_task',
        description: 'Work on your assigned task'
      });
      actions.push({
        name: 'report_body',
        description: 'Report a dead body if you find one'
      });
    }

    return actions;
  }
}

// Simulate a social deduction game scenario
async function runSocialDeductionDemo() {
  console.log('=== Social Deduction Game Demo ===\n');

  // Create framework
  const neuro = createIdentityFramework({
    memorySize: 15
  });

  await neuro.initialize();

  // Create adapter
  const adapter = new SocialDeductionAdapter(neuro);

  // Scenario 1: Start as crewmate, alone in a room
  console.log('--- Scenario 1: Crewmate, Alone in Electrical ---\n');

  const state1: SocialDeductionState = {
    location: 'Electrical',
    nearbyPlayers: [],
    myRole: 'crewmate',
    taskProgress: 40,
    suspicionLevels: new Map([
      ['Red', 0.7],
      ['Blue', 0.3],
      ['Green', 0.1]
    ]),
    recentEvents: [
      'Red was seen near Electrical before the lights went out',
      'Task bar increased after you completed wiring'
    ]
  };

  let plan1 = await adapter.processGameState(state1);
  console.log(`Neuro chose: ${plan1.action.name}`);
  console.log(`Reasoning: ${plan1.reasoning}`);
  console.log(`Emotional state: ${neuro.personality.affectiveState.primary_emotion}`);
  console.log(`Confidence: ${(plan1.confidence * 100).toFixed(1)}%\n`);

  // Store outcome
  const episode1 = createEpisode(
    'Completed wiring task in Electrical',
    'Among Us',
    'Task successful, progressed to 50%',
    0.7
  );
  neuro.personality.updateEmotion(episode1);
  neuro.memory.store(episode1);

  // Scenario 2: Encounter another player
  console.log('--- Scenario 2: Red Player Enters Electrical ---\n');

  await new Promise(resolve => setTimeout(resolve, 500));

  const state2: SocialDeductionState = {
    location: 'Electrical',
    nearbyPlayers: ['Red'],
    myRole: 'crewmate',
    taskProgress: 50,
    suspicionLevels: new Map([
      ['Red', 0.8], // Suspicion increased
      ['Blue', 0.3],
      ['Green', 0.1]
    ]),
    recentEvents: [
      'Red entered Electrical',
      'Red is acting suspiciously',
      'You completed the wiring task'
    ]
  };

  let plan2 = await adapter.processGameState(state2);
  console.log(`Neuro chose: ${plan2.action.name}`);
  console.log(`Reasoning: ${plan2.reasoning}`);
  console.log(`Emotional state: ${neuro.personality.affectiveState.primary_emotion}`);
  console.log(`Confidence: ${(plan2.confidence * 100).toFixed(1)}%\n`);

  // Scenario 3: Switch to impostor role
  console.log('--- Scenario 3: Now Playing as Impostor ---\n');

  await new Promise(resolve => setTimeout(resolve, 500));

  const state3: SocialDeductionState = {
    location: 'Cafeteria',
    nearbyPlayers: ['Green'],
    myRole: 'impostor',
    taskProgress: 0, // Not applicable for impostor
    suspicionLevels: new Map([
      ['Green', 0.2],
      ['Blue', 0.5],
      ['Yellow', 0.3]
    ]),
    recentEvents: [
      'Green is alone in Cafeteria',
      'No one is nearby',
      'Vents are available'
    ]
  };

  let plan3 = await adapter.processGameState(state3);
  console.log(`Neuro chose: ${plan3.action.name}`);
  console.log(`Reasoning: ${plan3.reasoning}`);
  console.log(`Emotional state: ${neuro.personality.affectiveState.primary_emotion}`);
  console.log(`Confidence: ${(plan3.confidence * 100).toFixed(1)}%\n`);

  // Check personality changes
  console.log('--- Personality Analysis ---\n');
  const state = neuro.getState();
  console.log('Current personality traits:');
  Object.entries(state.personality.traits.traits).forEach(([trait, value]) => {
    console.log(`  ${trait}: ${(value * 100).toFixed(0)}%`);
  });

  console.log('\nEmotional state:');
  console.log(`  Primary emotion: ${state.personality.emotion.primary_emotion}`);
  console.log(`  Intensity: ${(state.personality.emotion.intensity * 100).toFixed(1)}%`);
  console.log(`  Valence: ${state.personality.emotion.valence.toFixed(2)}`);
  console.log(`  Arousal: ${(state.personality.emotion.arousal * 100).toFixed(1)}%`);

  console.log('\nMemory:');
  console.log(`  Total episodes: ${state.memory.episodic_count}`);
  console.log(`  Working memory events: ${state.memory.working_memory.recent_events.length}`);
  console.log(`  Active goals: ${state.memory.working_memory.active_goals.join(', ')}`);

  // Test memory recall
  console.log('\n--- Memory Recall Test ---\n');
  const relevantMemories = neuro.memory.recall('electrical task', 3);
  console.log(`Recalled ${relevantMemories.length} memories about "electrical task":`);
  relevantMemories.forEach((mem, i) => {
    console.log(`${i + 1}. ${mem.event} - ${mem.outcome || 'no outcome'}`);
  });
}

// Run the demo
runSocialDeductionDemo().catch(console.error);
