/**
 * Simple test client for Neuro-Sama agent
 * This simulates a simple game to test personality-driven action selection
 */

import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8000');

let testStep = 0;

ws.on('open', () => {
    console.log('Connected to Neuro');
    
    // Step 1: Send startup
    setTimeout(() => {
        console.log('\n=== Test 1: Startup ===');
        ws.send(JSON.stringify({
            command: 'startup',
            game: 'TestGame'
        }));
    }, 100);
    
    // Step 2: Register some test actions
    setTimeout(() => {
        console.log('\n=== Test 2: Register Actions ===');
        ws.send(JSON.stringify({
            command: 'actions/register',
            game: 'TestGame',
            data: {
                actions: [
                    {
                        name: 'play_safe',
                        description: 'Play it safe and choose the cautious option',
                        schema: {
                            type: 'object',
                            properties: {
                                confidence: { type: 'number', minimum: 0, maximum: 100 }
                            }
                        }
                    },
                    {
                        name: 'play_risky',
                        description: 'Take a risk for a bigger reward',
                        schema: {
                            type: 'object',
                            properties: {
                                risk_level: { type: 'string', enum: ['low', 'medium', 'high', 'extreme'] }
                            }
                        }
                    },
                    {
                        name: 'analyze_strategy',
                        description: 'Analyze the situation and plan your next move',
                        schema: {
                            type: 'object',
                            properties: {
                                depth: { type: 'integer', minimum: 1, maximum: 5 }
                            }
                        }
                    },
                    {
                        name: 'chat_with_audience',
                        description: 'Talk to chat about the current situation',
                        schema: {
                            type: 'object',
                            properties: {
                                message: { type: 'string' }
                            }
                        }
                    }
                ]
            }
        }));
    }, 500);
    
    // Step 3: Force an action with a strategic context
    setTimeout(() => {
        console.log('\n=== Test 3: Force Action (Strategic Context) ===');
        ws.send(JSON.stringify({
            command: 'actions/force',
            game: 'TestGame',
            data: {
                state: 'Current score: 100. Opponent score: 120. You need to catch up.',
                query: 'You are behind. What strategy will you use?',
                action_names: ['play_safe', 'play_risky', 'analyze_strategy', 'chat_with_audience']
            }
        }));
    }, 1000);
});

ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    console.log('\n<-- Received from Neuro:');
    console.log(JSON.stringify(message, null, 2));
    
    // Respond to action messages
    if (message.command === 'action') {
        setTimeout(() => {
            console.log('\n--> Sending action result (success)');
            ws.send(JSON.stringify({
                command: 'action/result',
                game: 'TestGame',
                data: {
                    id: message.data.id,
                    success: true,
                    message: 'Action executed successfully!'
                }
            }));
            
            // After first action succeeds, test another force with different context
            if (testStep === 0) {
                testStep++;
                setTimeout(() => {
                    console.log('\n=== Test 4: Force Action (Playful Context) ===');
                    ws.send(JSON.stringify({
                        command: 'actions/force',
                        game: 'TestGame',
                        data: {
                            state: 'Everything is going great! You\'re winning easily.',
                            query: 'You\'re way ahead. Have some fun with it!',
                            action_names: ['play_safe', 'play_risky', 'analyze_strategy', 'chat_with_audience']
                        }
                    }));
                }, 1000);
            } else if (testStep === 1) {
                testStep++;
                setTimeout(() => {
                    console.log('\n=== Test 5: Force Action (Confusing Context) ===');
                    ws.send(JSON.stringify({
                        command: 'actions/force',
                        game: 'TestGame',
                        data: {
                            state: 'The rules just changed mid-game. What?!',
                            query: 'Wait... what\'s happening? Should you adapt?',
                            action_names: ['play_safe', 'play_risky', 'analyze_strategy', 'chat_with_audience']
                        }
                    }));
                }, 1000);
            } else {
                // All tests done
                setTimeout(() => {
                    console.log('\n=== All tests complete! ===');
                    ws.close();
                    process.exit(0);
                }, 2000);
            }
        }, 100);
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('Disconnected from Neuro');
});
