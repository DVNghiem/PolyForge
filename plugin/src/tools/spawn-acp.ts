import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { toolResponse, toolError } from '../utils/helpers.js';

const SpawnAcpParams = Type.Object({
  task: Type.String({ description: 'Structured task prompt (should follow the 6-section format: TASK / EXPECTED OUTCOME / REQUIRED TOOLS / MUST DO / MUST NOT DO / CONTEXT).' }),
  agentId: Type.String({ description: 'Target OpenCode agent ID (e.g., pf_forge, pf_sprint).' }),
  model: Type.Optional(Type.String({ description: 'Override model tier for this session.' })),
  skills: Type.Optional(Type.Array(Type.String(), { description: 'Skill files to inject into the spawned session context.' })),
  notepads: Type.Optional(Type.Array(Type.String(), { description: 'Notepad paths to include in the CONTEXT section.' })),
  maxRetries: Type.Optional(Type.Integer({ description: 'Max re-spawn attempts on verifiable failure (default: 2).', minimum: 0, maximum: 5 })),
});

type SpawnAcpInput = Static<typeof SpawnAcpParams>;

const MIN_PROMPT_LINES = 30;

export function registerSpawnAcpTool(api: PfPluginApi): void {
  api.registerTool<SpawnAcpInput>({
    name: 'pf_spawn_acp',
    description:
      'Spawn an ACP agent to execute a coding task via OpenCode CLI. ' +
      'Handles session lifecycle, prompt construction, verification (pytest/cargo/vitest), and retry. ' +
      'Use pf_delegate for routing — this tool is the execution bridge.',
    parameters: SpawnAcpParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const { task, agentId, model, skills, notepads, maxRetries = 2 } = params;

      if (!task || task.trim().length === 0) {
        return toolError('Task prompt is required.');
      }

      if (!agentId || agentId.trim().length === 0) {
        return toolError('agentId is required.');
      }

      // Validate prompt quality
      const lineCount = task.split('\n').length;
      if (lineCount < MIN_PROMPT_LINES) {
        return toolError(
          `Task prompt is too short (${lineCount} lines). Minimum ${MIN_PROMPT_LINES} lines required. ` +
            `Use the 6-section format: TASK / EXPECTED OUTCOME / REQUIRED TOOLS / MUST DO / MUST NOT DO / CONTEXT.`,
        );
      }

      api.logger.info(
        `${LOG_PREFIX} pf_spawn_acp: spawning ${agentId} (model=${model ?? 'default'}, maxRetries=${maxRetries})`,
      );

      // Build the spawn instruction for the orchestrator
      const sections: string[] = [
        `## ACP Agent Spawn`,
        ``,
        `### Configuration`,
        `- **Agent:** ${agentId}`,
        model ? `- **Model:** ${model}` : '',
        `- **Max Retries:** ${maxRetries}`,
        skills?.length ? `- **Skills:** ${skills.join(', ')}` : '',
        notepads?.length ? `- **Notepads:** ${notepads.join(', ')}` : '',
        ``,
        `### Task Prompt`,
        '```',
        task,
        '```',
        ``,
        `### Execution Steps`,
        `1. Call \`sessions_spawn\` with agentId="${agentId}" and the task prompt above`,
        `2. Monitor progress via \`sessions_log <session_id>\``,
        `3. On session completion, run language-appropriate verification:`,
        `   - Python: \`pytest\` + \`mypy --strict\``,
        `   - Rust: \`cargo test\` + \`cargo clippy -- -D warnings\``,
        `   - TypeScript: \`vitest run\` + \`tsc --noEmit\``,
        `4. If verification fails and retries remain (${maxRetries} max):`,
        `   - Re-spawn with error output appended to CONTEXT section`,
        `5. If all retries exhausted:`,
        `   - Return structured failure report for human decision`,
        `6. On success, return: { status: 'ok', sessionId, filesChanged, verificationOutput }`,
      ];

      return toolResponse(sections.filter(Boolean).join('\n'));
    },
  });
}
