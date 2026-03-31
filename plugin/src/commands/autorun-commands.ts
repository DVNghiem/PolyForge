import { PfPluginApi, AutorunLoopState } from '../types.js';
import { LOG_PREFIX, ABSOLUTE_MAX_AUTO_ITERATIONS } from '../constants.js';
import { getConfig } from '../utils/config.js';
import { readState, writeState } from '../utils/state.js';
import { resolveWorkspacePath } from '../utils/paths.js';

const AUTORUN_STATE_FILE = '.polyforge-state/autorun.json';

function getStatePath(api: PfPluginApi): string {
  return resolveWorkspacePath(api.workspaceDir ?? '.', AUTORUN_STATE_FILE);
}

export function registerAutorunCommands(api: PfPluginApi): void {
  api.registerCommand({
    name: 'autorun',
    description: 'Start the self-correcting execution loop — /autorun [maxIter] [taskFile]',
    acceptsArgs: true,
    handler: (ctx) => {
      const parts = (ctx.args ?? '').trim().split(/\s+/);
      const config = getConfig(api);
      let maxIter = config.max_auto_iterations;
      let taskFile = '';

      if (parts[0] && /^\d+$/.test(parts[0])) {
        maxIter = Math.min(parseInt(parts[0], 10), ABSOLUTE_MAX_AUTO_ITERATIONS);
        taskFile = parts.slice(1).join(' ');
      } else {
        taskFile = parts.join(' ');
      }

      const state: AutorunLoopState = {
        active: true,
        iteration: 0,
        maxIterations: maxIter,
        taskFile: taskFile || '',
        startedAt: new Date().toISOString(),
      };

      writeState(getStatePath(api), state);
      api.logger.info(`${LOG_PREFIX} Autorun started: maxIter=${maxIter}, taskFile="${taskFile}"`);

      return {
        text: [
          `**Autorun started**`,
          `Max iterations: ${maxIter}`,
          taskFile ? `Task file: ${taskFile}` : 'No task file specified',
          ``,
          `Use \`/stop\` to halt the loop.`,
        ].join('\n'),
      };
    },
  });

  api.registerCommand({
    name: 'stop',
    description: 'Stop the active autorun loop.',
    handler: async () => {
      const result = await readState<AutorunLoopState>(getStatePath(api));
      if (!result.ok || !result.data.active) {
        return { text: 'No active autorun loop.' };
      }

      const state = result.data;
      state.active = false;
      await writeState(getStatePath(api), state);
      api.logger.info(`${LOG_PREFIX} Autorun stopped at iteration ${state.iteration}`);

      return {
        text: `**Autorun stopped** at iteration ${state.iteration}/${state.maxIterations}.`,
      };
    },
  });
}
