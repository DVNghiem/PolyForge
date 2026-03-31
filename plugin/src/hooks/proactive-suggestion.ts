// plugin/src/hooks/proactive-suggestion.ts

import { PfPluginApi, TypedHookContext, BeforePromptBuildEvent, BeforePromptBuildResult } from '../types.js';
import { workflowStateMachine } from '../lib/workflow-state.js';
import { checkpointStore } from '../lib/checkpoint-store.js';
import { LOG_PREFIX } from '../constants.js';

interface PhaseSuggestion {
  workflow: string;
  currentPhase: string;
  suggestedNextPhase: string;
  reasoning: string;
  confidence: number;
  blockers?: string[];
}

export function registerProactiveSuggestion(api: PfPluginApi): void {
  api.on<BeforePromptBuildEvent, BeforePromptBuildResult>(
    'before_prompt_build',
    (event: BeforePromptBuildEvent, ctx: TypedHookContext): BeforePromptBuildResult | void => {
      const sessionKey = ctx.sessionKey ?? 'default';
      // For now, only inject suggestion context if explicitly requested
      // Full proactive implementation would analyze state periodically
      return undefined;
    },
    { priority: 80 },
  );
}

export function analyzeAndSuggest(sessionId: string, workflow: string): PhaseSuggestion | null {
  const state = checkpointStore.load(sessionId, workflow);
  if (!state) return null;

  const nextPhases = workflowStateMachine.getNextPhases(state);
  if (nextPhases.length === 0) return null;

  return {
    workflow: state.workflow,
    currentPhase: state.currentPhase,
    suggestedNextPhase: nextPhases[0],
    reasoning: `Based on your progress in ${state.currentPhase}`,
    confidence: 0.8,
  };
}
