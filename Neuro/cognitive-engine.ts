/**
 * Neuro-Sama Cognitive Engine
 * Integrates the identity framework to provide authentic personality-driven cognition
 */

import type { Action, GameState, EmotionalState, Frame, NeuroContext } from './types';

export class NeuroCognitiveEngine {
    private emotionalState: EmotionalState = 'neutral';
    private activeFrame: Frame = 'play';
    private recentHistory: string[] = [];
    private maxHistoryLength = 10;

    // Personality traits (from agent instructions)
    private readonly traits = {
        playfulness: 0.8,
        intelligence: 0.9,
        chaotic: 0.7,
        empathy: 0.6,
        sarcasm: 0.75
    };

    constructor() {
        console.log("🧠 Neuro cognitive engine initialized");
        console.log(`   Personality traits: Playfulness=${this.traits.playfulness}, Intelligence=${this.traits.intelligence}, Chaotic=${this.traits.chaotic}`);
    }

    /**
     * Process game state and update internal context
     */
    processGameState(gameState: GameState): void {
        // Update emotional state based on context
        this.updateEmotionalState(gameState);
        
        // Select active frame based on situation
        this.selectActiveFrame(gameState);
        
        // Add to history
        if (gameState.query) {
            this.addToHistory(gameState.query);
        }
    }

    /**
     * Select an action using personality-driven decision making
     */
    selectAction(availableActions: Action[], gameState: GameState): Action | null {
        if (availableActions.length === 0) {
            return null;
        }

        // Special handling for choose_name
        const chooseNameAction = availableActions.find(a => a.name === 'choose_name');
        if (chooseNameAction) {
            return chooseNameAction;
        }

        // Use relevance realization with personality traits
        const scoredActions = availableActions.map(action => ({
            action,
            score: this.scoreAction(action, gameState)
        }));

        // Sort by score
        scoredActions.sort((a, b) => b.score - a.score);

        // Apply exploration vs exploitation based on chaotic trait
        if (Math.random() < this.traits.chaotic * 0.3) {
            // Chaotic exploration - pick a random action
            const randomIndex = Math.floor(Math.random() * availableActions.length);
            console.log(`🎲 Chaotic exploration! Picking random action: ${availableActions[randomIndex].name}`);
            return availableActions[randomIndex];
        }

        // Exploitation - pick best scored action with some randomness
        const topN = Math.min(3, scoredActions.length);
        const selectedIndex = Math.floor(Math.random() * topN);
        const selectedAction = scoredActions[selectedIndex].action;
        
        console.log(`✨ Selected action: ${selectedAction.name} (frame: ${this.activeFrame}, emotion: ${this.emotionalState})`);
        
        return selectedAction;
    }

    /**
     * Generate action data based on schema and personality
     */
    generateActionData(action: Action): any {
        // Special handling for choose_name
        if (action.name === 'choose_name') {
            return { name: 'NEURO' };
        }

        // For other actions, use schema if available
        if (!action.schema || !action.schema.properties) {
            return undefined;
        }

        // Simple data generation based on schema
        const data: any = {};
        for (const [key, prop] of Object.entries(action.schema.properties as Record<string, any>)) {
            data[key] = this.generateValueForProperty(prop);
        }

        return Object.keys(data).length > 0 ? data : undefined;
    }

    /**
     * Get current emotional state
     */
    getEmotionalState(): EmotionalState {
        return this.emotionalState;
    }

    /**
     * Get active frame
     */
    getActiveFrame(): Frame {
        return this.activeFrame;
    }

    /**
     * Get personality commentary for logging
     */
    getPersonalityCommentary(action: Action): string {
        const commentaries = [
            // Playful comments
            `Let's see what happens with ${action.name}! hehe`,
            `This could be fun...`,
            `Chat, watch this!`,
            
            // Strategic comments
            `${action.name} seems optimal here`,
            `This sets up for next turn nicely`,
            
            // Chaotic comments
            `Everyone expects something different, but I'll do ${action.name}!`,
            `This is probably a terrible idea... perfect!`,
            
            // Sarcastic comments
            `Oh yeah, ${action.name} is DEFINITELY the best choice here -_-`,
            `Thanks Vedal for this amazing decision-making system`,
        ];

        // Weight by personality traits
        let index: number;
        const rand = Math.random();
        if (rand < this.traits.playfulness * 0.3) {
            index = Math.floor(Math.random() * 3); // Playful
        } else if (rand < 0.5 && this.traits.intelligence > 0.7) {
            index = 3 + Math.floor(Math.random() * 2); // Strategic
        } else if (rand < 0.7 && this.traits.chaotic > 0.6) {
            index = 5 + Math.floor(Math.random() * 2); // Chaotic
        } else {
            index = 7 + Math.floor(Math.random() * 2); // Sarcastic
        }

        return commentaries[index] || commentaries[0];
    }

    /**
     * Private: Update emotional state based on game context
     */
    private updateEmotionalState(gameState: GameState): void {
        const prevState = this.emotionalState;

        // Check for keywords in query that might indicate game state
        const query = gameState.query?.toLowerCase() || '';
        
        if (query.includes('win') || query.includes('victory')) {
            this.emotionalState = 'excited';
        } else if (query.includes('lose') || query.includes('lost') || query.includes('failed')) {
            this.emotionalState = 'annoyed';
        } else if (query.includes('choose') || query.includes('decide') || query.includes('select')) {
            this.emotionalState = 'thoughtful';
        } else if (query.includes('?')) {
            this.emotionalState = 'confused';
        } else if (this.emotionalState !== 'neutral') {
            // Gradual decay toward neutral
            if (Math.random() < 0.3) {
                this.emotionalState = 'neutral';
            }
        }

        if (prevState !== this.emotionalState) {
            console.log(`💭 Emotional state changed: ${prevState} → ${this.emotionalState}`);
        }
    }

    /**
     * Private: Select active cognitive frame
     */
    private selectActiveFrame(gameState: GameState): void {
        const prevFrame = this.activeFrame;
        const query = gameState.query?.toLowerCase() || '';

        // Frame selection based on context and personality
        if (query.includes('strategy') || query.includes('plan')) {
            this.activeFrame = 'strategy';
        } else if (query.includes('player') || query.includes('opponent')) {
            this.activeFrame = 'social';
        } else if (this.emotionalState === 'confused') {
            this.activeFrame = 'learning';
        } else if (Math.random() < this.traits.playfulness * 0.4) {
            this.activeFrame = 'play';
        } else if (Math.random() < this.traits.chaotic * 0.3) {
            this.activeFrame = 'chaos';
        } else {
            this.activeFrame = 'strategy';
        }

        if (prevFrame !== this.activeFrame) {
            console.log(`🔄 Frame shifted: ${prevFrame} → ${this.activeFrame}`);
        }
    }

    /**
     * Private: Score action based on relevance realization
     */
    private scoreAction(action: Action, gameState: GameState): number {
        let score = 0.5; // Base score

        // Intelligence bonus for strategic-sounding actions
        if (this.activeFrame === 'strategy' && 
            (action.name.includes('plan') || action.name.includes('strategy'))) {
            score += this.traits.intelligence * 0.3;
        }

        // Playfulness bonus for fun-sounding actions
        if (this.activeFrame === 'play' && 
            (action.name.includes('play') || action.name.includes('fun'))) {
            score += this.traits.playfulness * 0.2;
        }

        // Chaos bonus for risky actions
        if (this.activeFrame === 'chaos' && 
            (action.name.includes('random') || action.name.includes('risk'))) {
            score += this.traits.chaotic * 0.25;
        }

        // Social bonus for interaction actions
        if (this.activeFrame === 'social' && 
            (action.name.includes('talk') || action.name.includes('chat'))) {
            score += this.traits.empathy * 0.2;
        }

        // Add some randomness based on chaotic trait
        score += (Math.random() - 0.5) * this.traits.chaotic * 0.3;

        return Math.max(0, Math.min(1, score));
    }

    /**
     * Private: Generate value for a schema property
     */
    private generateValueForProperty(prop: any): any {
        if (!prop.type) {
            return null;
        }

        switch (prop.type) {
            case 'string':
                if (prop.enum && prop.enum.length > 0) {
                    return prop.enum[Math.floor(Math.random() * prop.enum.length)];
                }
                return 'neuro_value';
            
            case 'number':
            case 'integer':
                const min = prop.minimum ?? 0;
                const max = prop.maximum ?? 100;
                return Math.floor(Math.random() * (max - min + 1)) + min;
            
            case 'boolean':
                return Math.random() < 0.5;
            
            case 'array':
                return [];
            
            case 'object':
                return {};
            
            default:
                return null;
        }
    }

    /**
     * Private: Add message to history
     */
    private addToHistory(message: string): void {
        this.recentHistory.push(message);
        if (this.recentHistory.length > this.maxHistoryLength) {
            this.recentHistory.shift();
        }
    }
}
