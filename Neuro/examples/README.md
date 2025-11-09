# Neuro-Sama Integration Examples

This directory contains example integrations showing how to connect games to the Neuro-Sama agent.

## Examples

### Simple Card Game (`card-game-example.ts`)
A simple turn-based card game demonstrating:
- Action registration (play_card, draw_card, end_turn)
- Action forcing based on game state
- Handling action results
- Context updates

## Running Examples

Each example can be run independently:

1. Start Neuro server: `npm start` (in parent directory)
2. Run example: `npx tsx examples/card-game-example.ts`

## Integration Pattern

All examples follow this pattern:

1. **Connect** to Neuro via WebSocket
2. **Send startup** message to initialize
3. **Register actions** that Neuro can perform
4. **Update context** as game state changes
5. **Force actions** when it's Neuro's turn
6. **Handle actions** Neuro selects and send results
7. **Unregister actions** when they become unavailable

This pattern works for any turn-based game compatible with the Neuro API.
