// plugin/src/hooks/detached-monitor.ts

import { PfPluginApi } from '../types.js';
import { LOG_PREFIX } from '../constants.js';

interface DetachedSession {
  sessionId: string;
  workflow: string;
  phase: string;
  task: string;
  spawnedAt: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  result?: unknown;
}

const detachedSessions = new Map<string, DetachedSession>();

export function registerDetachedMonitor(api: PfPluginApi): void {
  // Hook to monitor detached agent completions
  api.on(
    'agent_complete',
    (event: { sessionId: string; result: unknown }) => {
      const session = detachedSessions.get(event.sessionId);
      if (session) {
        session.status = 'completed';
        session.result = event.result;
        api.logger.info(`${LOG_PREFIX} Detached agent ${event.sessionId} completed`);
      }
    },
    { priority: 70 },
  );
}

export function registerDetachedSession(session: DetachedSession): void {
  detachedSessions.set(session.sessionId, session);
}

export function getDetachedSession(sessionId: string): DetachedSession | undefined {
  return detachedSessions.get(sessionId);
}
