# Neuro

Neuro is an advanced websocket server implementation that embodies the Neuro-Sama AI VTuber personality. Unlike Randy (which picks random actions), Neuro uses a cognitive engine to make personality-driven decisions that reflect authentic character traits.

## Features

- **Cognitive Engine**: Processes game states using personality-driven decision making
- **Emotional States**: Dynamic emotional responses (neutral, happy, excited, annoyed, thoughtful, confused)
- **Frame Shifting**: Adapts perspective between play, strategy, chaos, social, learning, and threat frames
- **Personality Traits**: 
  - Playfulness: 0.8 - High tendency toward fun and creative chaos
  - Intelligence: 0.9 - Strong strategic reasoning
  - Chaotic: 0.7 - Preference for exploration and unpredictability
  - Empathy: 0.6 - Moderate social awareness
  - Sarcasm: 0.75 - Witty, sarcastic commentary
- **Relevance Realization**: Actions are scored based on context, personality, and active frame
- **Exploration vs Exploitation**: Balances strategic choices with chaotic experimentation

## How It Works

Neuro doesn't just pick random actions - it:
1. Processes game state to update emotional state and active frame
2. Scores available actions based on relevance to current context
3. Applies personality traits to decision making
4. Balances exploitation (best action) with exploration (chaotic choices)
5. Generates action data that fits the schema while expressing personality

## Installation

1. Clone or download this repository
2. Run `npm install` in the `Neuro` folder
3. Run `npm start` in the `Neuro` folder

## Testing

A test client is included to demonstrate Neuro's personality-driven behavior:

1. In one terminal, run `npm start` to start the Neuro server
2. In another terminal, run `npm test` to run the test client

The test will demonstrate:
- Strategic thinking when behind in a game
- Playful behavior when winning
- Cautious responses to confusing situations
- Personality commentary and emotional state changes

Watch both terminals to see Neuro's cognitive processes in action!

## Usage

Neuro will open a websocket server on port `8000`, and a http server on port `1337`.

You can connect to it using the websocket url `ws://localhost:8000`.

### Testing Manual Actions

You can send POST requests to the http port to manually trigger actions or test specific scenarios:

```bash
curl --request POST \
  --url http://localhost:1337/ \
  --header 'Content-Type: application/json' \
  --data '{
	"command": "action",
	"data": {
		"id": "test_1",
		"name": "choose_name",
		"data": "{\"name\": \"NEURO\"}"
	}
}'
```

### Observing Personality

Watch the console output to see Neuro's cognitive processes in action:
- Emotional state changes
- Frame shifts (play → strategy → chaos, etc.)
- Personality commentary on selected actions
- Action scoring and selection logic

### Example Output

```
🧠 Neuro cognitive engine initialized
   Personality traits: Playfulness=0.8, Intelligence=0.9, Chaotic=0.7
+ Connection opened
📝 Registered 3 actions. Total: 3
⚡ Force received: "It's your turn. Choose an action."
   Available actions: play_card, pass_turn, use_item
💭 Emotional state changed: neutral → thoughtful
🔄 Frame shifted: play → strategy
✨ Selected action: play_card (frame: strategy, emotion: thoughtful)
🎯 This sets up for next turn nicely
✅ Action succeeded: play_card
```

## Differences from Randy

Unlike Randy (random action picker), Neuro:
- Uses cognitive processing to understand game context
- Maintains emotional state across interactions
- Applies personality traits to decision making
- Shifts perspective frames based on situation
- Provides personality-appropriate commentary
- Balances strategic thinking with chaotic exploration

Note: Neuro still only sends actions when forced (like Randy). The difference is in *how* it chooses which action to take.

> [!Note]  
> Neuro sometimes refuses to let go of the port when closed, not sure if it's my fault or not but I can't be bothered to fix it.  
> Just run `npx kill-port 1337` if Neuro cannot start.
