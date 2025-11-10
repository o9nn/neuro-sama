/**
 * Type definitions for Neuro-Sama agent
 */

export type Message = {
    command: string;
    data?: { [key: string]: any };
};

export type Action = {
    name: string;
    description: string;
    schema?: any;
};

export type GameState = {
    state?: string;
    query?: string;
    availableActions: Action[];
    forcedActionNames?: string[];
};

export type EmotionalState = 
    | 'neutral' 
    | 'happy' 
    | 'excited' 
    | 'annoyed' 
    | 'thoughtful' 
    | 'confused';

export type Frame = 
    | 'play' 
    | 'strategy' 
    | 'chaos' 
    | 'social' 
    | 'learning' 
    | 'threat';

export type NeuroContext = {
    gameState: GameState;
    emotionalState: EmotionalState;
    activeFrame: Frame;
    recentHistory: string[];
};
