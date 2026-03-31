import { PfPluginApi, AutorunLoopState, ServiceContext } from '../types.js';
import { LOG_PREFIX, ABSOLUTE_MAX_AUTO_ITERATIONS } from '../constants.js';
import { readState, writeState } from '../utils/state.js';
import { resolveWorkspacePath } from '../utils/paths.js';

const AUTORUN_STATE_FILE = '.polyforge-state/autorun.json';

function getStatePath(api: PfPluginApi): string {
  return resolveWorkspacePath(api.workspaceDir ?? '.', AUTORUN_STATE_FILE);
}

async function loadAutorunState(api: PfPluginApi): Promise<AutorunLoopState | null> {
  const result = await readState<AutorunLoopState>(getStatePath(api));
  return result.ok ? result.data : null;
}

async function saveAutorunState(api: PfPluginApi, state: AutorunLoopState): Promise<void> {
  await writeState(getStatePath(api), state);
}

export function registerAutorunService(api: PfPluginApi): void {
  api.registerService({
    id: 'polyforge-autorun',
    start: async (_ctx: ServiceContext) => {
      api.logger.info(`${LOG_PREFIX} Autorun service started`);

      const state = await loadAutorunState(api);
      if (state?.active) {
        api.logger.info(
          `${LOG_PREFIX} Resuming autorun loop: iteration ${state.iteration}/${state.maxIterations}`,
        );
      }
    },
    stop: async (_ctx: ServiceContext) => {
      const state = await loadAutorunState(api);
      if (state?.active) {
        state.active = false;
        await saveAutorunState(api, state);
        api.logger.info(`${LOG_PREFIX} Autorun service stopped — loop deactivated`);
      } else {
        api.logger.info(`${LOG_PREFIX} Autorun service stopped`);
      }
    },
  });
}

/**
 * Advance the autorun loop by one iteration.
 * Returns true if the loop should continue, false if it should stop.
 */
export async function advanceAutorun(api: PfPluginApi): Promise<{ shouldContinue: boolean; iteration: number; maxIterations: number }> {
  const state = await loadAutorunState(api);

  if (!state || !state.active) {
    return { shouldContinue: false, iteration: 0, maxIterations: 0 };
  }

  state.iteration++;

  if (state.iteration >= state.maxIterations || state.iteration >= ABSOLUTE_MAX_AUTO_ITERATIONS) {
    state.active = false;
    await saveAutorunState(api, state);
    api.logger.info(
      `${LOG_PREFIX} Autorun loop completed: ${state.iteration}/${state.maxIterations} iterations`,
    );
    return { shouldContinue: false, iteration: state.iteration, maxIterations: state.maxIterations };
  }

  await saveAutorunState(api, state);
  return { shouldContinue: true, iteration: state.iteration, maxIterations: state.maxIterations };
}
