import { PfPluginApi, TypedHookContext, BeforePromptBuildEvent, BeforePromptBuildResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { contextCollector } from '../features/context-collector.js';
import { readPersonaPromptSync } from '../agents/persona-prompts.js';
import { setActivePersonaId } from '../utils/persona-state.js';
import { resolvePluginPath } from '../utils/paths.js';
import { readFileSync } from 'fs';

const WORKFLOW_COMMANDS = {
  brainstorm: {
    workflowFile: 'workflows/brainstorm.md',
    personaId: 'pf_analyst',
    description: 'Structured ideation for technical decisions',
  },
  triage: {
    workflowFile: 'workflows/triage.md',
    personaId: 'pf_atlas',
    description: 'Task classification and routing',
  },
  research: {
    workflowFile: 'workflows/research.md',
    personaId: 'pf_researcher',
    description: 'Technology research workflow',
  },
  intake: {
    workflowFile: 'workflows/intake.md',
    personaId: 'pf_atlas',
    description: 'Structured task intake',
  },
  review: {
    workflowFile: 'workflows/review.md',
    personaId: 'pf_critic',
    description: 'Code and plan review',
  },
  plan: {
    workflowFile: 'workflows/plan.md',
    personaId: 'pf_atlas',
    description: 'Execution planning',
  },
  execute: {
    workflowFile: 'workflows/execute.md',
    personaId: 'pf_atlas',
    description: 'Plan execution',
  },
  work: {
    workflowFile: 'workflows/work.md',
    personaId: 'pf_atlas',
    description: 'Full engineering pipeline',
  },
};

/**
 * Regex to match workflow commands with optional arguments.
 * Supports both slash commands (/brainstorm) and plain commands (brainstorm).
 * Matches: /brainstorm, /brainstorm <topic>, brainstorm, brainstorm <topic>
 */
const WORKFLOW_COMMAND_REGEX = /^\/?(\w+)(?:\s+(.+))?$/;

/**
 * Load workflow content from file.
 */
function loadWorkflowContent(workflowFile: string): string {
  try {
    const fullPath = resolvePluginPath(workflowFile);
    return readFileSync(fullPath, 'utf-8');
  } catch {
    return `[PolyForge] Workflow file not found: ${workflowFile}`;
  }
}

/**
 * Formats the workflow into a structured context entry for the AI.
 */
function formatWorkflowContext(
  commandName: string,
  topic: string | undefined,
  workflowContent: string,
  personaId: string,
  personaPrompt: string,
): string {
  const sections = [
    `## ${commandName.charAt(0).toUpperCase() + commandName.slice(1)} Workflow Activated`,
    '',
    topic ? `**Topic:** ${topic}` : '',
    '',
    '---',
    '',
    '### Workflow Instructions',
    workflowContent,
    '',
    '---',
    '',
    '### Persona',
    personaPrompt,
  ];
  return sections.filter(Boolean).join('\n');
}

export function registerWorkflowCommands(api: PfPluginApi): void {
  api.on<BeforePromptBuildEvent, BeforePromptBuildResult>(
    'before_prompt_build',
    (event: BeforePromptBuildEvent, ctx: TypedHookContext): BeforePromptBuildResult | void => {
      const userMessage = event.userMessage ?? event.latestMessage ?? '';
      if (!userMessage) return;

      // Check if message matches workflow command pattern
      const match = userMessage.match(WORKFLOW_COMMAND_REGEX);
      if (!match) return;

      const [, commandName, topic] = match;
      const workflowDef = (WORKFLOW_COMMANDS as Record<string, { workflowFile: string; personaId: string; description: string }>)[commandName.toLowerCase()];
      if (!workflowDef) return;

      const sessionKey = ctx.sessionKey ?? 'default';
      api.logger.info(`${LOG_PREFIX} workflow-commands: detected workflow command="${commandName}" topic="${topic ?? ''}" → ${workflowDef.personaId}`);

      // Load workflow content
      const workflowContent = loadWorkflowContent(workflowDef.workflowFile);

      // Load persona prompt
      const personaPrompt = readPersonaPromptSync(workflowDef.personaId);

      // Format context
      const contextContent = formatWorkflowContext(commandName, topic?.trim(), workflowContent, workflowDef.personaId, personaPrompt);

      // Inject workflow context with high priority
      contextCollector.register(sessionKey, {
        id: `workflow-${commandName}`,
        content: contextContent,
        priority: 'high',
        source: 'plugin',
        oneShot: true,
      });

      // Switch to appropriate persona
      setActivePersonaId(workflowDef.personaId);
      api.logger.info(`${LOG_PREFIX} workflow-commands: injected ${commandName} workflow context, persona=${workflowDef.personaId}`);

      // Return undefined so context-injector (priority 50) provides the prependContext
      // with all collected entries. My hook just registers context, doesn't modify prompt.
      return undefined;
    },
    { priority: 90 },
  );
}