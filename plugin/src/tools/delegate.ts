import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../types.js';
import { LOG_PREFIX, Category, CATEGORIES } from '../constants.js';
import { toolResponse, toolError } from '../utils/helpers.js';
import { getConfig } from '../utils/config.js';
import { AGENT_TIER_MAP } from '../agents/agent-ids.js';

const CATEGORY_AGENT_MAP: Record<Category, string> = {
  'quick': 'pf_sprint',
  'deep': 'pf_forge',
  'apex': 'pf_architect',
  'research': 'pf_researcher',
  'rust': 'pf_forge',
  'python': 'pf_forge',
  'typescript': 'pf_sprint',
  'review': 'pf_critic',
  'writing': 'pf_sprint',
  'unspecified-low': 'pf_sprint',
  'unspecified-high': 'pf_forge',
};

/** Categories that involve writing code and should route through pf_spawn_acp */
const CODING_CATEGORIES = new Set<Category>([
  'quick', 'deep', 'rust', 'python', 'typescript', 'unspecified-low', 'unspecified-high',
]);

const DelegateParams = Type.Object({
  task: Type.String({ description: 'Full task description for the delegate agent.' }),
  category: Type.Unsafe<Category>({
    description: `Task category. One of: ${CATEGORIES.join(', ')}`,
  }),
  agentId: Type.Optional(Type.String({ description: 'Override the default agent for this category.' })),
  model: Type.Optional(Type.String({ description: 'Override model tier for this delegation.' })),
  skills: Type.Optional(Type.Array(Type.String(), { description: 'Skill files to inject.' })),
  notepads: Type.Optional(Type.Array(Type.String(), { description: 'Notepad paths for context.' })),
});

type DelegateInput = Static<typeof DelegateParams>;

export function registerDelegateTool(api: PfPluginApi): void {
  api.registerTool<DelegateInput>({
    name: 'pf_delegate',
    description:
      'Route a task to the appropriate PolyForge agent based on category. ' +
      'Coding categories route through pf_spawn_acp for verification. ' +
      'Non-coding categories (research, review, writing, apex) spawn directly.',
    parameters: DelegateParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const { task, category, agentId, model, skills, notepads } = params;

      if (!task || task.trim().length === 0) {
        return toolError('Task description is required.');
      }

      if (!(CATEGORIES as readonly string[]).includes(category)) {
        return toolError(`Invalid category "${category}". Must be one of: ${CATEGORIES.join(', ')}`);
      }

      const targetAgent = agentId ?? CATEGORY_AGENT_MAP[category];
      const tier = AGENT_TIER_MAP[targetAgent] ?? 'worker';
      const config = getConfig(api);

      api.logger.info(
        `${LOG_PREFIX} pf_delegate: category=${category} agent=${targetAgent} tier=${tier}`,
      );

      if (CODING_CATEGORIES.has(category)) {
        // Route through ACP agent for coding tasks
        const acpInstruction = [
          `## Delegation via pf_spawn_acp`,
          ``,
          `**Category:** ${category}`,
          `**Target Agent:** ${targetAgent}`,
          `**Model Tier:** ${model ?? tier}`,
          skills?.length ? `**Skills:** ${skills.join(', ')}` : '',
          notepads?.length ? `**Notepads:** ${notepads.join(', ')}` : '',
          ``,
          `### Task`,
          task,
          ``,
          `### Instructions`,
          `Use pf_spawn_acp to spawn agent "${targetAgent}" with the above task.`,
          `The ACP agent will handle session lifecycle, verification, and retry logic.`,
          config.preferred_language !== 'mixed'
            ? `Preferred language: ${config.preferred_language}`
            : '',
        ]
          .filter(Boolean)
          .join('\n');

        return toolResponse(acpInstruction);
      }

      // Non-coding categories: direct spawn instruction
      const spawnInstruction = [
        `## Direct Delegation`,
        ``,
        `**Category:** ${category}`,
        `**Agent:** ${targetAgent}`,
        `**Model:** ${model ?? tier}`,
        ``,
        `### Task`,
        task,
        ``,
        `### Instructions`,
        `Spawn agent "${targetAgent}" directly via sessions_spawn with this task.`,
        `This is a non-coding delegation (${category}) — no ACP verification layer needed.`,
      ].join('\n');

      return toolResponse(spawnInstruction);
    },
  });
}
