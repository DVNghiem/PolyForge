import { PfPluginApi } from '../types.js';
import { LOG_PREFIX } from '../constants.js';

interface SpawnRecord {
  parentSessionId: string;
  childSessionId: string;
  agentId: string;
  startedAt: number;
}

const activeSpawns = new Map<string, SpawnRecord>();

export function registerSubagentTracker(api: PfPluginApi): void {
  // Track when sub-agents are spawned
  api.on(
    'tool_result_persist',
    (event: { tool_name?: string; result?: string; session_id?: string }, _ctx: unknown): void => {
      if (event.tool_name !== 'sessions_spawn' && event.tool_name !== 'pf_delegate') return;

      const result = event.result ?? '';
      // Try to extract session ID from result
      const sessionMatch = result.match(/session[_-]?id['":\s]+([a-zA-Z0-9_-]+)/i);
      const childSessionId = sessionMatch?.[1];
      if (!childSessionId) return;

      const agentMatch = result.match(/agent[_-]?id['":\s]+([a-zA-Z0-9_-]+)/i);

      const record: SpawnRecord = {
        parentSessionId: event.session_id ?? 'unknown',
        childSessionId,
        agentId: agentMatch?.[1] ?? 'unknown',
        startedAt: Date.now(),
      };

      activeSpawns.set(childSessionId, record);
      api.logger.info(
        `${LOG_PREFIX} subagent-tracker: tracking spawn ${childSessionId} (agent: ${record.agentId})`,
      );
    },
  );

  // Track when sub-agents complete
  api.on(
    'subagent_ended',
    (event: { session_id?: string; result?: string; status?: string }, _ctx: unknown): void => {
      const sessionId = event.session_id ?? '';
      const record = activeSpawns.get(sessionId);

      if (record) {
        const elapsed = Date.now() - record.startedAt;
        api.logger.info(
          `${LOG_PREFIX} subagent-tracker: ${record.agentId} (${sessionId}) ended ` +
            `after ${(elapsed / 1000).toFixed(1)}s — status: ${event.status ?? 'unknown'}`,
        );
        activeSpawns.delete(sessionId);
      } else {
        api.logger.info(
          `${LOG_PREFIX} subagent-tracker: untracked session ended: ${sessionId}`,
        );
      }
    },
  );
}

export function getActiveSpawnCount(): number {
  return activeSpawns.size;
}
