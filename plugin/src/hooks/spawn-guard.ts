import { PfPluginApi } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { getActivePersona } from '../utils/persona-state.js';

/**
 * Blocks raw `sessions_spawn` calls when a PolyForge persona is active,
 * forcing agents to use `pf_delegate` instead so routing rules are respected.
 */
export function registerSpawnGuard(api: PfPluginApi): void {
  api.on(
    'before_tool_call',
    async (event: { tool_name?: string }, _ctx: unknown): Promise<{ block?: boolean; reason?: string } | void> => {
      if (event.tool_name !== 'sessions_spawn') return;

      const personaId = await getActivePersona();
      if (!personaId) return;

      api.logger.warn(
        `${LOG_PREFIX} spawn-guard: blocked raw sessions_spawn while persona "${personaId}" is active. Use pf_delegate instead.`,
      );

      return {
        block: true,
        reason:
          'Direct sessions_spawn is disabled while a PolyForge persona is active. ' +
          'Use the pf_delegate tool to route tasks through the PolyForge team hierarchy.',
      };
    },
    { priority: 150 },
  );
}
