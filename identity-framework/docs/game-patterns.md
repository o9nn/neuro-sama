# Game Integration Patterns

This document describes domain-specific patterns for integrating the Identity Framework with different game types, based on the architectural genome.

## Pattern 1: Social Deduction Games (Among Us Pattern)

**Cognitive Requirements:**
- Theory of mind (predicting other players' thoughts)
- Strategic lying and deception
- Pattern recognition
- Social dynamics tracking

**State Representation:**

```typescript
interface SocialDeductionState {
  playerPositions: Map<string, { x: number; y: number }>;
  taskCompletionStates: Map<string, boolean>;
  socialDynamics: {
    suspicionLevels: Map<string, number>;
    alliances: string[][];
    recentInteractions: Array<{ player1: string; player2: string; type: string }>;
  };
  myRole: 'crewmate' | 'impostor';
  timeRemaining: number;
}
```

**Action Space:**

```typescript
const socialDeductionActions = {
  movement: [
    { name: 'move_to_location', description: 'Navigate to a specific location' },
    { name: 'follow_player', description: 'Follow another player' }
  ],
  tasks: [
    { name: 'complete_task', description: 'Work on an assigned task' },
    { name: 'fake_task', description: 'Pretend to do a task (impostor only)' }
  ],
  social: [
    { name: 'call_emergency_meeting', description: 'Call a meeting to discuss' },
    { name: 'vote_player', description: 'Vote to eject a player' },
    { name: 'defend_player', description: 'Argue in defense of a player' },
    { name: 'accuse_player', description: 'Accuse a player of being impostor' }
  ],
  impostor: [
    { name: 'eliminate_player', description: 'Eliminate a crewmate (impostor only)' },
    { name: 'sabotage', description: 'Sabotage ship systems (impostor only)' },
    { name: 'vent', description: 'Use vent system (impostor only)' }
  ]
};
```

**Implementation Pattern:**

```typescript
class SocialDeductionAdapter {
  constructor(private framework: NeuroIdentityFramework) {}

  async processGameState(state: SocialDeductionState): Promise<ActionPlan> {
    // Transform to generic format
    const description = this.formatState(state);
    const actions = this.getAvailableActions(state);

    // Set role-specific goals
    const goals = state.myRole === 'impostor' 
      ? ['Eliminate crewmates', 'Avoid suspicion', 'Create alibis']
      : ['Complete tasks', 'Identify impostor', 'Survive'];

    this.framework.memory.workingMemory.active_goals = goals;

    // Process through framework
    const gameState: GameState = {
      description,
      available_actions: actions,
      game: 'Social Deduction',
      timestamp: Date.now()
    };

    return await this.framework.processGameState(gameState);
  }

  private formatState(state: SocialDeductionState): string {
    const location = this.getCurrentLocation(state);
    const nearby = this.getNearbyPlayers(state);
    
    let desc = `You are ${state.myRole === 'impostor' ? 'an impostor' : 'a crewmate'} `;
    desc += `in ${location}. `;
    
    if (nearby.length > 0) {
      desc += `Nearby players: ${nearby.join(', ')}. `;
    }
    
    if (state.myRole === 'crewmate') {
      const tasksComplete = Array.from(state.taskCompletionStates.values())
        .filter(v => v).length;
      const totalTasks = state.taskCompletionStates.size;
      desc += `Tasks: ${tasksComplete}/${totalTasks} complete. `;
    }

    return desc;
  }

  private getCurrentLocation(state: SocialDeductionState): string {
    // Implementation to determine current location
    return 'Cafeteria';
  }

  private getNearbyPlayers(state: SocialDeductionState): string[] {
    // Implementation to find nearby players
    return [];
  }

  private getAvailableActions(state: SocialDeductionState): Action[] {
    // Filter actions based on role and situation
    const actions: Action[] = [...socialDeductionActions.movement, ...socialDeductionActions.social];
    
    if (state.myRole === 'impostor') {
      actions.push(...socialDeductionActions.impostor);
    } else {
      actions.push(...socialDeductionActions.tasks);
    }

    return actions;
  }
}
```

## Pattern 2: Knowledge-Based Games (Trivia/Millionaire Pattern)

**Cognitive Requirements:**
- Factual knowledge retrieval
- Confidence estimation
- Risk assessment
- Strategic resource management

**State Representation:**

```typescript
interface KnowledgeGameState {
  currentQuestion: {
    text: string;
    category: string;
    difficulty: number; // 1-5
    options: string[];
  };
  lifelines: {
    fiftyFifty: boolean;
    phoneFriend: boolean;
    askAudience: boolean;
  };
  moneyAtRisk: number;
  safeAmount: number;
  questionsRemaining: number;
}
```

**Action Space:**

```typescript
const knowledgeGameActions = {
  answers: [
    { name: 'select_answer_a', description: 'Choose answer A' },
    { name: 'select_answer_b', description: 'Choose answer B' },
    { name: 'select_answer_c', description: 'Choose answer C' },
    { name: 'select_answer_d', description: 'Choose answer D' }
  ],
  lifelines: [
    { name: 'use_fifty_fifty', description: 'Remove two wrong answers' },
    { name: 'phone_friend', description: 'Call a friend for help' },
    { name: 'ask_audience', description: 'Poll the audience' }
  ],
  strategic: [
    { name: 'walk_away', description: 'Leave with current winnings' }
  ]
};
```

**Implementation Pattern:**

```typescript
class KnowledgeGameAdapter {
  constructor(
    private framework: NeuroIdentityFramework,
    private knowledgeBase?: KnowledgeBase // Optional external knowledge
  ) {}

  async processQuestion(state: KnowledgeGameState): Promise<ActionPlan> {
    // Assess confidence in answer
    const confidence = await this.assessConfidence(state.currentQuestion);
    
    // Determine if lifeline should be used
    const shouldUseLifeline = this.shouldUseLifeline(confidence, state);
    
    const description = this.formatQuestion(state);
    const actions = this.getAvailableActions(state, shouldUseLifeline);

    // Set goals based on risk/reward
    const goals = [
      `Answer the ${state.currentQuestion.difficulty}/5 difficulty question`,
      confidence < 0.5 ? 'Consider using a lifeline' : 'Answer confidently',
      state.moneyAtRisk > state.safeAmount * 2 ? 'Consider walking away' : 'Keep playing'
    ];

    this.framework.memory.workingMemory.active_goals = goals;

    const gameState: GameState = {
      description,
      available_actions: actions,
      game: 'Knowledge Game',
      timestamp: Date.now()
    };

    return await this.framework.processGameState(gameState);
  }

  private async assessConfidence(question: any): Promise<number> {
    // Query knowledge base or use LLM to assess confidence
    if (this.knowledgeBase) {
      return await this.knowledgeBase.query(question.text, question.category);
    }
    
    // Default: low confidence
    return 0.3;
  }

  private shouldUseLifeline(confidence: number, state: KnowledgeGameState): boolean {
    // Use lifeline if confidence is low and we have lifelines available
    const hasLifelines = state.lifelines.fiftyFifty || 
                        state.lifelines.phoneFriend || 
                        state.lifelines.askAudience;
    
    return confidence < 0.6 && hasLifelines;
  }

  private formatQuestion(state: KnowledgeGameState): string {
    let desc = `Question (Difficulty ${state.currentQuestion.difficulty}/5): ${state.currentQuestion.text}\n`;
    desc += `Category: ${state.currentQuestion.category}\n`;
    desc += `Options:\n`;
    state.currentQuestion.options.forEach((opt, i) => {
      desc += `  ${String.fromCharCode(65 + i)}) ${opt}\n`;
    });
    desc += `\nMoney at risk: $${state.moneyAtRisk}`;
    desc += `, Safe amount: $${state.safeAmount}`;
    
    return desc;
  }

  private getAvailableActions(state: KnowledgeGameState, prioritizeLifeline: boolean): Action[] {
    const actions = [...knowledgeGameActions.answers];
    
    if (state.lifelines.fiftyFifty) {
      actions.push(knowledgeGameActions.lifelines[0]);
    }
    if (state.lifelines.phoneFriend) {
      actions.push(knowledgeGameActions.lifelines[1]);
    }
    if (state.lifelines.askAudience) {
      actions.push(knowledgeGameActions.lifelines[2]);
    }
    
    actions.push(knowledgeGameActions.strategic[0]);
    
    return actions;
  }
}
```

## Pattern 3: Swarm Control (Multi-Agent Coordination)

**Cognitive Requirements:**
- Crowd aggregation
- Real-time statistical processing
- Chaos/entropy management

**State Representation:**

```typescript
interface SwarmState {
  viewerVotes: Map<string, number>; // action -> vote count
  totalVoters: number;
  chaosMetric: number; // 0-1, entropy of vote distribution
  gameState: any; // The actual game state
  timeWindow: number; // milliseconds remaining for voting
}
```

**Action Space:**

```typescript
// Actions are dynamically generated based on viewer votes
function getSwarmActions(state: SwarmState): Action[] {
  const actions: Action[] = [];
  
  for (const [action, votes] of state.viewerVotes) {
    const probability = votes / state.totalVoters;
    actions.push({
      name: action,
      description: `${action} (${(probability * 100).toFixed(1)}% of votes)`,
      schema: {
        type: 'object',
        properties: {
          weight: { type: 'number', default: probability }
        }
      }
    });
  }
  
  return actions;
}
```

**Implementation Pattern:**

```typescript
class SwarmControlAdapter {
  constructor(private framework: NeuroIdentityFramework) {}

  async aggregateVotes(state: SwarmState): Promise<ActionPlan> {
    // Statistical decision making based on crowd
    const description = this.formatSwarmState(state);
    const actions = getSwarmActions(state);

    // Goals based on chaos level
    const goals = state.chaosMetric > 0.7
      ? ['Embrace the chaos', 'Go with majority vote']
      : ['Make strategic decision', 'Consider minority opinions'];

    this.framework.memory.workingMemory.active_goals = goals;

    const gameState: GameState = {
      description,
      available_actions: actions,
      game: 'Swarm Control',
      timestamp: Date.now()
    };

    return await this.framework.processGameState(gameState);
  }

  private formatSwarmState(state: SwarmState): string {
    let desc = `Swarm voting results (${state.totalVoters} voters):\n`;
    
    const sorted = Array.from(state.viewerVotes.entries())
      .sort((a, b) => b[1] - a[1]);
    
    sorted.forEach(([action, votes]) => {
      const pct = (votes / state.totalVoters * 100).toFixed(1);
      desc += `  ${action}: ${pct}%\n`;
    });
    
    desc += `\nChaos level: ${(state.chaosMetric * 100).toFixed(1)}%`;
    desc += `\nTime remaining: ${(state.timeWindow / 1000).toFixed(1)}s`;
    
    return desc;
  }

  // Weighted random selection based on votes
  selectWeightedAction(votes: Map<string, number>): string {
    const total = Array.from(votes.values()).reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (const [action, count] of votes) {
      random -= count;
      if (random <= 0) {
        return action;
      }
    }
    
    return Array.from(votes.keys())[0];
  }
}
```

## General Integration Guidelines

### 1. State Transformation

Always transform game-specific state to the standard GameState format:

```typescript
function transformState(gameSpecificState: any): GameState {
  return {
    description: formatGameState(gameSpecificState),
    available_actions: extractActions(gameSpecificState),
    game: 'YourGame',
    timestamp: Date.now()
  };
}
```

### 2. Goal Management

Set appropriate goals based on game context:

```typescript
framework.memory.workingMemory.active_goals = [
  'Primary objective',
  'Secondary objective',
  'Contextual goal'
];
```

### 3. Memory Integration

Store important game events:

```typescript
const episode = createEpisode(
  'Game event description',
  gameName,
  'Outcome',
  importance, // 0-1
  emotionalState
);

framework.memory.store(episode);
```

### 4. Personality Adaptation

Adjust personality traits for game-specific behavior:

```typescript
// For competitive games
framework.personality.traits.traits.chaotic = 0.8;

// For cooperative games
framework.personality.traits.traits.empathy = 0.9;
```

## Testing Patterns

Use mock agents to test integrations:

```typescript
// Randy pattern: random actions
async function testWithRandom(adapter: GameAdapter) {
  const action = actions[Math.floor(Math.random() * actions.length)];
  return action;
}

// Tony pattern: manual selection
async function testWithManual(adapter: GameAdapter) {
  console.log('Available actions:');
  actions.forEach((a, i) => console.log(`${i}: ${a.name}`));
  const choice = await getUserInput();
  return actions[choice];
}
```

## Performance Considerations

- **Turn-based games**: Framework works perfectly
- **Real-time games**: Use debouncing and action queuing
- **High-frequency updates**: Batch state updates
- **Large state spaces**: Prune action list intelligently

## Next Steps

1. Choose the pattern that matches your game type
2. Implement the adapter class
3. Transform game state to standard format
4. Test with mock agents
5. Integrate with full framework
6. Monitor and tune personality/memory settings
