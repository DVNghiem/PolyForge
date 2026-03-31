// plugin/src/tools/phase-transition.ts

import { PfPluginApi } from '../types.js';
import { workflowStateMachine } from '../lib/workflow-state.js';
import { checkpointStore } from '../lib/checkpoint-store.js';
import { LOG_PREFIX } from '../constants.js';

interface PhaseTransitionParams {
  session_id: string;
  workflow: string;
  target_phase: string;
  deliverables: Record<string, unknown>;
  reasoning: string;
}

export function registerPhaseTransitionTool(api: PfPluginApi): void {
  api.registerTool<PhaseTransitionParams>({
    name: 'pf_phase_transition',
    description: 'Request transition to the next workflow phase',
    parameters: {
      type: 'object',
      properties: {
        session_id: { type: 'string' },
        workflow: { type: 'string' },
        target_phase: { type: 'string' },
        deliverables: { type: 'object' },
        reasoning: { type: 'string' },
      },
      required: ['session_id', 'workflow', 'target_phase', 'deliverables', 'reasoning'],
    },
    execute: async (toolCallId: string, params: PhaseTransitionParams) => {
      const state = checkpointStore.load(params.session_id, params.workflow);
      if (!state) {
        return {
          content: [{ type: 'text', text: `Error: No active workflow found for session ${params.session_id}` }],
        };
      }

      const canTransition = workflowStateMachine.canTransition(state, params.target_phase as any);
      if (!canTransition) {
        const validPhases = workflowStateMachine.getNextPhases(state);
        return {
          content: [{
            type: 'text',
            text: `Error: Invalid transition. Current phase: ${state.currentPhase}. Valid next phase: ${validPhases.join(', ') || 'none'}`,
          }],
        };
      }

      // Update state
      state.phaseHistory.push({
        phase: params.target_phase as any,
        enteredAt: new Date().toISOString(),
        exitedAt: null,
        deliverables: params.deliverables,
      });

      // Mark previous phase as exited
      const prevEntry = state.phaseHistory[state.phaseHistory.length - 2];
      if (prevEntry) {
        prevEntry.exitedAt = new Date().toISOString();
      }

      state.currentPhase = params.target_phase as any;
      checkpointStore.save(state);

      api.logger.info(`${LOG_PREFIX} Phase transition: ${params.workflow}/${params.target_phase}`);

      return {
        content: [{
          type: 'text',
          text: `Phase transitioned to ${params.target_phase}. Use pf_get_phase_context to get entry criteria for this phase.`,
        }],
      };
    },
  });
}