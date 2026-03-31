/**
 * Model presets for different agent tiers.
 * Maps tier names to recommended model configurations.
 */

export interface ModelPreset {
  model: string;
  alternatives: string[];
  description: string;
}

export const MODEL_PRESETS: Record<string, ModelPreset> = {
  reasoning: {
    model: 'claude-sonnet-4-20250514',
    alternatives: ['o4-mini', 'minimax-m2.7'],
    description: 'High-capability reasoning model for orchestrators and architects',
  },
  analysis: {
    model: 'claude-sonnet-4-20250514',
    alternatives: ['gpt-4.1', 'minimax-m2.7'],
    description: 'Analysis-focused model for analysts, critics, and researchers',
  },
  worker: {
    model: 'claude-sonnet-4-20250514',
    alternatives: ['gpt-4.1-mini', 'minimax-m2.7'],
    description: 'Efficient worker model for quick implementation tasks',
  },
  'deep-worker': {
    model: 'claude-sonnet-4-20250514',
    alternatives: ['o4-mini', 'minimax-m2.7'],
    description: 'Deep implementation model for complex coding tasks',
  },
  search: {
    model: 'gemini-2.5-flash',
    alternatives: ['gpt-4.1-mini', 'minimax-m2.7'],
    description: 'Fast model for codebase exploration and search',
  },
};

export function getModelPreset(tier: string): ModelPreset | undefined {
  return MODEL_PRESETS[tier];
}

export function listModelPresets(): Array<{ tier: string; preset: ModelPreset }> {
  return Object.entries(MODEL_PRESETS).map(([tier, preset]) => ({ tier, preset }));
}
