import { PfPluginApi, TypedHookContext, BeforePromptBuildEvent, BeforePromptBuildResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { contextCollector } from '../features/context-collector.js';
import { checkpointStore } from '../lib/checkpoint-store.js';
import { WorkflowName } from '../lib/types/workflow-types.js';
import { getPhaseEntryContext, getWorkflowInstructions } from '../lib/phase-context.js';

// Track active workflow per session
const activeWorkflows = new Map<string, WorkflowName>();

export function setActiveWorkflow(sessionKey: string, workflow: WorkflowName): void {
  activeWorkflows.set(sessionKey, workflow);
}

export function getActiveWorkflow(sessionKey: string): WorkflowName | undefined {
  return activeWorkflows.get(sessionKey);
}

export function clearActiveWorkflow(sessionKey: string): void {
  activeWorkflows.delete(sessionKey);
}

export function registerContextInjector(api: PfPluginApi): void {
  api.on<BeforePromptBuildEvent, BeforePromptBuildResult>(
    'before_prompt_build',
    (_event: BeforePromptBuildEvent, ctx: TypedHookContext): BeforePromptBuildResult | void => {
      const sessionKey = ctx.sessionKey ?? 'default';
      const entries = contextCollector.collect(sessionKey);

      // Check for active workflow and inject phase context
      const activeWorkflow = activeWorkflows.get(sessionKey);
      let workflowContext = '';
      if (activeWorkflow) {
        const state = checkpointStore.load(sessionKey, activeWorkflow);
        if (state) {
          const phaseContext = getPhaseEntryContext(state);
          const workflowInstructions = getWorkflowInstructions(state);
          workflowContext = [
            '',
            '### Active Workflow Context',
            '',
            workflowInstructions,
            '',
            phaseContext,
          ].join('\n');
        }
      }

      const contextBlock = entries
        .map((e: { source: string; content: string }) => `[${e.source}] ${e.content}`)
        .join('\n');

      const fullContext = contextBlock + workflowContext;
      if (fullContext.length === 0) return;

      api.logger.info(`${LOG_PREFIX} Injecting ${entries.length} context entries via context-injector`);

      return {
        prependContext: `<polyforge-context>\n${fullContext}\n</polyforge-context>`,
      };
    },
    { priority: 50 },
  );
}
