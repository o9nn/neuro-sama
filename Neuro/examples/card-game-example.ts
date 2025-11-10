/**
 * Simple Card Game Example
 * Demonstrates how to integrate a turn-based card game with Neuro-Sama
 */

import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8000');

// Game state
let playerHealth = 20;
let neuroHealth = 20;
let playerCards = ['Attack', 'Defend', 'Heal'];
let neuroCards = ['Attack', 'Defend', 'Heal', 'Special'];
let turnNumber = 1;

ws.on('open', () => {
    console.log('🎮 Card Game started! Connecting to Neuro...\n');
    
    // Step 1: Send startup
    ws.send(JSON.stringify({
        command: 'startup',
        game: 'SimpleCardGame'
    }));
    
    // Step 2: Start the game
    setTimeout(() => startTurn(), 500);
});

function startTurn() {
    console.log(`\n=== Turn ${turnNumber} ===`);
    console.log(`Player HP: ${playerHealth} | Neuro HP: ${neuroHealth}`);
    console.log(`Neuro's cards: ${neuroCards.join(', ')}\n`);
    
    // Register available actions based on current cards
    const actions = neuroCards.map(card => ({
        name: `play_${card.toLowerCase()}`,
        description: `Play the ${card} card`,
        schema: {
            type: 'object',
            properties: {
                card_name: { 
                    type: 'string',
                    enum: [card]
                }
            },
            required: ['card_name']
        }
    }));
    
    // Also allow passing turn
    actions.push({
        name: 'pass_turn',
        description: 'Skip your turn and draw a card',
        schema: undefined
    });
    
    console.log('📋 Registering actions...');
    ws.send(JSON.stringify({
        command: 'actions/register',
        game: 'SimpleCardGame',
        data: { actions }
    }));
    
    // Force Neuro to make a move
    setTimeout(() => {
        const state = `
Turn ${turnNumber}
Your Health: ${neuroHealth}/20
Opponent Health: ${playerHealth}/20
Your Cards: ${neuroCards.join(', ')}
        `.trim();
        
        let query: string;
        if (neuroHealth < playerHealth) {
            query = "You're behind! Choose your strategy carefully.";
        } else if (neuroHealth > playerHealth) {
            query = "You're winning! Keep up the pressure or play it safe?";
        } else {
            query = "It's tied! What's your move?";
        }
        
        console.log(`⚡ Forcing Neuro to choose an action...`);
        console.log(`Query: "${query}"\n`);
        
        ws.send(JSON.stringify({
            command: 'actions/force',
            game: 'SimpleCardGame',
            data: {
                state,
                query,
                action_names: actions.map(a => a.name)
            }
        }));
    }, 1000);
}

function handleNeuroAction(actionName: string, actionData: any) {
    console.log(`\n🎯 Neuro chose: ${actionName}`);
    if (actionData) {
        console.log(`   Data: ${JSON.stringify(actionData)}`);
    }
    
    let success = true;
    let message = '';
    
    // Process the action
    if (actionName === 'play_attack') {
        const damage = Math.floor(Math.random() * 3) + 3; // 3-5 damage
        playerHealth -= damage;
        message = `Dealt ${damage} damage to opponent!`;
        console.log(`   💥 ${message}`);
        neuroCards = neuroCards.filter(c => c !== 'Attack');
    } else if (actionName === 'play_defend') {
        message = `Defended! Reduced incoming damage for next turn.`;
        console.log(`   🛡️ ${message}`);
        neuroCards = neuroCards.filter(c => c !== 'Defend');
    } else if (actionName === 'play_heal') {
        const heal = Math.floor(Math.random() * 3) + 2; // 2-4 healing
        neuroHealth = Math.min(20, neuroHealth + heal);
        message = `Healed ${heal} HP!`;
        console.log(`   💚 ${message}`);
        neuroCards = neuroCards.filter(c => c !== 'Heal');
    } else if (actionName === 'play_special') {
        const damage = 7;
        playerHealth -= damage;
        neuroHealth -= 2; // Costs some health
        message = `Used special attack! Dealt ${damage} damage but took 2 damage.`;
        console.log(`   ⚡ ${message}`);
        neuroCards = neuroCards.filter(c => c !== 'Special');
    } else if (actionName === 'pass_turn') {
        // Draw a random card
        const newCard = ['Attack', 'Defend', 'Heal'][Math.floor(Math.random() * 3)];
        neuroCards.push(newCard);
        message = `Passed turn and drew ${newCard}`;
        console.log(`   📥 ${message}`);
    }
    
    // Unregister all actions for this turn
    const allActionNames = [...neuroCards.map(c => `play_${c.toLowerCase()}`), 'pass_turn'];
    ws.send(JSON.stringify({
        command: 'actions/unregister',
        game: 'SimpleCardGame',
        data: {
            action_names: allActionNames
        }
    }));
    
    return { success, message };
}

ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    
    if (message.command === 'action') {
        const actionData = message.data.data ? JSON.parse(message.data.data) : undefined;
        const result = handleNeuroAction(message.data.name, actionData);
        
        // Send action result
        setTimeout(() => {
            ws.send(JSON.stringify({
                command: 'action/result',
                game: 'SimpleCardGame',
                data: {
                    id: message.data.id,
                    success: result.success,
                    message: result.message
                }
            }));
            
            // Check for game over
            setTimeout(() => {
                if (playerHealth <= 0) {
                    console.log('\n🏆 Neuro wins! Game Over!');
                    ws.close();
                    process.exit(0);
                } else if (neuroHealth <= 0) {
                    console.log('\n💀 Neuro lost! Game Over!');
                    ws.close();
                    process.exit(0);
                } else if (turnNumber >= 10) {
                    console.log('\n⏱️ Game ended after 10 turns!');
                    if (neuroHealth > playerHealth) {
                        console.log('🏆 Neuro wins!');
                    } else if (neuroHealth < playerHealth) {
                        console.log('💀 Player wins!');
                    } else {
                        console.log('🤝 It\'s a tie!');
                    }
                    ws.close();
                    process.exit(0);
                } else {
                    // Continue to next turn
                    turnNumber++;
                    
                    // Simulate player's turn
                    console.log('\n--- Player\'s turn ---');
                    const playerAction = playerCards[Math.floor(Math.random() * playerCards.length)];
                    console.log(`Player plays: ${playerAction}`);
                    
                    if (playerAction === 'Attack') {
                        const damage = Math.floor(Math.random() * 3) + 2;
                        neuroHealth -= damage;
                        console.log(`💥 Dealt ${damage} damage to Neuro!`);
                    } else if (playerAction === 'Heal') {
                        const heal = Math.floor(Math.random() * 3) + 2;
                        playerHealth = Math.min(20, playerHealth + heal);
                        console.log(`💚 Player healed ${heal} HP!`);
                    } else if (playerAction === 'Defend') {
                        console.log(`🛡️ Player is defending!`);
                    }
                    
                    setTimeout(() => startTurn(), 1000);
                }
            }, 500);
        }, 100);
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('\n👋 Disconnected from Neuro');
});
