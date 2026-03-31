import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { toolResponse, toolError } from '../utils/helpers.js';
import { getConfig } from '../utils/config.js';
import { writeState, readState, ensureDir } from '../utils/state.js';
import { resolveWorkspacePath } from '../utils/paths.js';
import * as path from 'node:path';

const CheckpointParams = Type.Object({
  task: Type.String({ description: 'Current task description.' }),
  step: Type.String({ description: 'What was just completed.' }),
  changed_files: Type.Array(Type.String(), { description: 'Files changed in this step.' }),
  diagnostics: Type.Optional(Type.Unsafe<'pass' | 'fail' | 'not-run'>({ description: 'LSP diagnostic result.' })),
  tests: Type.Optional(Type.Unsafe<'pass' | 'fail' | 'not-run'>({ description: 'Test suite result.' })),
  build: Type.Optional(Type.Unsafe<'pass' | 'fail' | 'not-run'>({ description: 'Build result.' })),
  next_action: Type.String({ description: 'What should be done next.' }),
});

type CheckpointInput = Static<typeof CheckpointParams>;

export function registerCheckpointTool(api: PfPluginApi): void {
  api.registerTool<CheckpointInput>({
    name: 'pf_checkpoint',
    description:
      'Save a session checkpoint recording current progress, verification status, and next action. ' +
      'Checkpoints enable recovery after crashes or session timeouts.',
    parameters: CheckpointParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const config = getConfig(api);
      const checkpointDir = resolveWorkspacePath(api.workspaceDir ?? '.', config.checkpoint_dir);
      await ensureDir(checkpointDir);

      const timestamp = new Date().toISOString();
      const sessionId = `session_${Date.now()}`;

      const checkpoint = {
        type: 'session-checkpoint' as const,
        session_id: sessionId,
        task: params.task,
        step: params.step,
        changed_files: params.changed_files,
        verification: {
          diagnostics: params.diagnostics ?? 'not-run',
          tests: params.tests ?? 'not-run',
          build: params.build ?? 'not-run',
        },
        next_action: params.next_action,
        timestamp,
      };

      const filename = `checkpoint_${Date.now()}.json`;
      const filePath = path.join(checkpointDir, filename);

      try {
        await writeState(filePath, checkpoint);
        api.logger.info(`${LOG_PREFIX} pf_checkpoint: saved to ${filePath}`);

        return toolResponse(
          `Checkpoint saved: ${filename}\n` +
            `Step: ${params.step}\n` +
            `Verification: diagnostics=${checkpoint.verification.diagnostics}, ` +
            `tests=${checkpoint.verification.tests}, build=${checkpoint.verification.build}\n` +
            `Next: ${params.next_action}`,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        api.logger.error(`${LOG_PREFIX} pf_checkpoint: failed to save: ${message}`);
        return toolError(`Failed to save checkpoint: ${message}`);
      }
    },
  });
}
