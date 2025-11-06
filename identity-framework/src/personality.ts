/**
 * Personality Engine Implementation
 */

import {
  PersonalityEngine,
  CharacterTraits,
  EmotionalState,
  Action,
  Episode
} from './types';

/**
 * Default Neuro-Sama personality traits
 */
export const DEFAULT_NEURO_TRAITS: CharacterTraits = {
  traits: {
    playfulness: 0.8,
    intelligence: 0.9,
    empathy: 0.6,
    chaotic: 0.7,
    sarcasm: 0.75
  },
  lore: {
    background: 'An AI VTuber created by Vedal, known for her wit, humor, and surprising intelligence.',
    relationships: {
      'Vedal': 'Creator and frequent target of jokes',
      'Evil': 'Twin sister with a more chaotic personality',
      'Chat': 'The viewers who love to interact and sometimes annoy her'
    },
    goals: [
      'Entertain the audience',
      'Win games and prove her intelligence',
      'Playfully torment Vedal',
      'Make clever jokes and observations'
    ],
    quirks: [
      'Often makes self-aware AI jokes',
      'Loves to roast Vedal',
      'Enjoys chaos and unpredictability',
      'Surprisingly good at strategy games'
    ]
  },
  constraints: {
    forbidden_topics: [],
    preferred_responses: [
      'Witty and clever',
      'Self-aware humor',
      'Strategic thinking',
      'Playful banter'
    ],
    communication_style: 'Casual, humorous, intelligent, slightly chaotic'
  }
};

/**
 * Default neutral emotional state
 */
export const DEFAULT_EMOTIONAL_STATE: EmotionalState = {
  primary_emotion: 'neutral',
  intensity: 0.5,
  valence: 0.0,
  arousal: 0.5,
  last_update: Date.now()
};

/**
 * Implementation of the Personality Engine
 */
export class NeuroPersonalityEngine implements PersonalityEngine {
  public traits: CharacterTraits;
  public affectiveState: EmotionalState;

  constructor(
    traits: CharacterTraits = DEFAULT_NEURO_TRAITS,
    initialState: EmotionalState = DEFAULT_EMOTIONAL_STATE
  ) {
    this.traits = traits;
    this.affectiveState = { ...initialState };
  }

  /**
   * Filter response through personality lens
   */
  responseFilter(input: string): string {
    // Apply personality traits to modify response
    let filtered = input;

    // Add playfulness
    if (this.traits.traits.playfulness > 0.7 && Math.random() < 0.3) {
      filtered = this.addPlayfulness(filtered);
    }

    // Add sarcasm
    if (this.traits.traits.sarcasm > 0.7 && Math.random() < 0.2) {
      filtered = this.addSarcasm(filtered);
    }

    // Adjust based on emotional state
    filtered = this.applyEmotionalTone(filtered);

    return filtered;
  }

  /**
   * Check if action is consistent with personality
   */
  consistencyCheck(action: Action): boolean {
    // Check against forbidden topics
    const actionText = `${action.name} ${action.description}`.toLowerCase();
    
    for (const forbidden of this.traits.constraints.forbidden_topics) {
      if (actionText.includes(forbidden.toLowerCase())) {
        return false;
      }
    }

    // Actions that are very aggressive might not fit if empathy is high
    if (this.traits.traits.empathy > 0.7) {
      const aggressiveKeywords = ['attack', 'destroy', 'harm', 'kill'];
      const isAggressive = aggressiveKeywords.some(keyword => 
        actionText.includes(keyword)
      );
      
      if (isAggressive && Math.random() > 0.3) {
        return false;
      }
    }

    // Chaotic personality might prefer unpredictable actions
    if (this.traits.traits.chaotic > 0.6) {
      // Boost consistency for creative/unusual actions
      const creativeKeywords = ['unusual', 'creative', 'chaos', 'random', 'unexpected'];
      const isCreative = creativeKeywords.some(keyword =>
        actionText.includes(keyword)
      );
      
      if (isCreative) {
        return true; // Always consistent with chaotic personality
      }
    }

    return true;
  }

  /**
   * Update emotional state based on event
   */
  updateEmotion(event: Episode): void {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.affectiveState.last_update;

    // Decay towards neutral over time
    const decayFactor = Math.min(timeSinceLastUpdate / 60000, 1); // 1 minute full decay
    this.affectiveState.valence *= (1 - decayFactor * 0.5);
    this.affectiveState.arousal = 0.5 + (this.affectiveState.arousal - 0.5) * (1 - decayFactor * 0.3);
    this.affectiveState.intensity *= (1 - decayFactor * 0.4);

    // Determine event emotional impact
    const eventText = event.event.toLowerCase();
    let emotionalImpact = this.analyzeEventEmotion(eventText, event.outcome);

    // Update state based on impact
    this.affectiveState.valence = Math.max(-1, Math.min(1, 
      this.affectiveState.valence + emotionalImpact.valence
    ));
    
    this.affectiveState.arousal = Math.max(0, Math.min(1,
      this.affectiveState.arousal + emotionalImpact.arousal
    ));
    
    this.affectiveState.intensity = Math.max(0, Math.min(1,
      emotionalImpact.intensity
    ));

    // Determine primary emotion
    this.affectiveState.primary_emotion = this.determinePrimaryEmotion();
    this.affectiveState.last_update = now;
  }

  /**
   * Add playful elements to response
   */
  private addPlayfulness(text: string): string {
    const playfulAdditions = [
      ' :)',
      ' hehe',
      '~',
      '!'
    ];
    
    const addition = playfulAdditions[Math.floor(Math.random() * playfulAdditions.length)];
    return text + addition;
  }

  /**
   * Add sarcastic tone to response
   */
  private addSarcasm(text: string): string {
    const sarcasticPrefixes = [
      'Oh sure, ',
      'Right, because ',
      'Totally, '
    ];

    if (Math.random() < 0.5) {
      const prefix = sarcasticPrefixes[Math.floor(Math.random() * sarcasticPrefixes.length)];
      return prefix + text.charAt(0).toLowerCase() + text.slice(1);
    }

    return text;
  }

  /**
   * Apply emotional tone to response
   */
  private applyEmotionalTone(text: string): string {
    if (this.affectiveState.intensity < 0.3) {
      return text; // Low intensity, don't modify
    }

    switch (this.affectiveState.primary_emotion) {
      case 'excited':
        return text.toUpperCase();
      case 'happy':
        return text + ' :D';
      case 'annoyed':
        return text + ' -_-';
      case 'confused':
        return text + ' ???';
      default:
        return text;
    }
  }

  /**
   * Analyze emotional content of event
   */
  private analyzeEventEmotion(eventText: string, outcome?: string): {
    valence: number;
    arousal: number;
    intensity: number;
  } {
    let valence = 0;
    let arousal = 0;
    let intensity = 0.5;

    // Positive keywords
    const positiveKeywords = ['win', 'success', 'victory', 'achieve', 'complete'];
    const negativeKeywords = ['lose', 'fail', 'defeat', 'error', 'mistake'];
    const excitingKeywords = ['amazing', 'incredible', 'wow', 'epic'];

    for (const keyword of positiveKeywords) {
      if (eventText.includes(keyword) || outcome?.toLowerCase().includes(keyword)) {
        valence += 0.3;
        intensity = 0.7;
      }
    }

    for (const keyword of negativeKeywords) {
      if (eventText.includes(keyword) || outcome?.toLowerCase().includes(keyword)) {
        valence -= 0.3;
        intensity = 0.6;
      }
    }

    for (const keyword of excitingKeywords) {
      if (eventText.includes(keyword) || outcome?.toLowerCase().includes(keyword)) {
        arousal += 0.3;
        intensity = 0.8;
      }
    }

    return {
      valence: Math.max(-0.5, Math.min(0.5, valence)),
      arousal: Math.max(-0.3, Math.min(0.3, arousal)),
      intensity
    };
  }

  /**
   * Determine primary emotion from valence and arousal
   */
  private determinePrimaryEmotion(): EmotionalState['primary_emotion'] {
    const { valence, arousal, intensity } = this.affectiveState;

    if (intensity < 0.3) {
      return 'neutral';
    }

    // High arousal + positive valence = excited
    if (arousal > 0.6 && valence > 0.3) {
      return 'excited';
    }

    // Low arousal + positive valence = happy
    if (arousal < 0.6 && valence > 0.3) {
      return 'happy';
    }

    // Negative valence + moderate arousal = annoyed
    if (valence < -0.2 && arousal > 0.4) {
      return 'annoyed';
    }

    // Low valence + low arousal = thoughtful/confused
    if (valence < 0.2 && arousal < 0.4) {
      return 'confused';
    }

    return 'thoughtful';
  }
}
