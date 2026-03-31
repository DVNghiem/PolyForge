import { PfPluginApi } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { getActivePersona, initPersonaState } from '../utils/persona-state.js';

export function registerSessionSync(api: PfPluginApi): void {
  api.on(
    'session_start',
    async (_event: unknown, _ctx: unknown): Promise<void> => {
      try {
        const personaId = await getActivePersona();
        if (personaId) {
          api.logger.info(
            `${LOG_PREFIX} Session started — active persona: ${personaId}`,
          );
        } else {
          await initPersonaState(api);
          api.logger.info(`${LOG_PREFIX} Session started — persona state initialised`);
        }
      } catch (err) {
        api.logger.warn(`${LOG_PREFIX} session-sync: failed to restore persona state: ${err}`);
      }
    },
    { priority: 200 },
  );

  api.on(
    'session_end',
    (_event: unknown, _ctx: unknown): void => {
      api.logger.info(`${LOG_PREFIX} Session ended — persona state preserved on disk`);
    },
    { priority: 200 },
  );
}
