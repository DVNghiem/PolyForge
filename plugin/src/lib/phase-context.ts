// plugin/src/lib/phase-context.ts

import { WorkflowState, PhaseName } from './types/workflow-types.js';
import { workflowStateMachine } from './workflow-state.js';
import { readFileSync } from 'fs';
import { resolvePluginPath } from '../utils/paths.js';

export function getPhaseEntryContext(state: WorkflowState): string {
  const phaseDef = workflowStateMachine.getCurrentPhase(state);
  if (!phaseDef) return '';

  const sections = [
    `### Current Phase: ${state.currentPhase}`,
    '',
    `**Entry Criteria Met:**`,
    ...phaseDef.entryCriteria.map(c => `- ${c}`),
    '',
    `**Exit Criteria (minimum for transition):**`,
    ...phaseDef.exitCriteriaMin.map(c => `- ${c}`),
    '',
    `**Exit Criteria (complete):**`,
    ...phaseDef.exitCriteriaComplete.map(c => `- ${c}`),
  ];

  if (phaseDef.hardRules && phaseDef.hardRules.length > 0) {
    sections.push('', '**Hard Rules:**');
    phaseDef.hardRules.forEach(rule => sections.push(`- ${rule}`));
  }

  return sections.join('\n');
}

export function getWorkflowInstructions(state: WorkflowState): string {
  const workflowFile = `workflows/${state.workflow}.md`;
  try {
    return readFileSync(resolvePluginPath(workflowFile), 'utf-8');
  } catch {
    return `[Workflow file not found: ${workflowFile}]`;
  }
}
