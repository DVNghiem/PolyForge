import { PfPluginApi } from '../types.js';
import { LOG_PREFIX } from '../constants.js';

const NON_TODO_THRESHOLD = 10;

interface SessionState {
  nonTodoToolCalls: number;
  reminded: boolean;
}

const sessions = new Map<string, SessionState>();

function getSession(sessionId: string): SessionState {
  let state = sessions.get(sessionId);
  if (!state) {
    state = { nonTodoToolCalls: 0, reminded: false };
    sessions.set(sessionId, state);
  }
  return state;
}

export function registerTodoReminder(api: PfPluginApi): void {
  // Count non-todo tool calls and nudge agents to check their todos
  api.on(
    'tool_result_persist',
    (event: { tool_name?: string; session_id?: string }, _ctx: unknown): void => {
      const toolName = event.tool_name ?? '';
      const sessionId = event.session_id ?? 'default';

      // Don't count todo-related tool calls
      if (toolName.startsWith('pf_todo') || toolName === 'todo_read' || toolName === 'todo_write') {
        const state = getSession(sessionId);
        state.nonTodoToolCalls = 0;
        state.reminded = false;
        return;
      }

      const state = getSession(sessionId);
      state.nonTodoToolCalls++;

      if (state.nonTodoToolCalls >= NON_TODO_THRESHOLD && !state.reminded) {
        state.reminded = true;
        api.logger.warn(
          `${LOG_PREFIX} todo-reminder: ${state.nonTodoToolCalls} tool calls without checking todos. ` +
            `Consider using pf_todo_list to review your task list.`,
        );
      }
    },
  );

  // Warn about potentially incomplete todos at agent end
  api.on(
    'agent_end',
    (event: { session_id?: string }, _ctx: unknown): void => {
      const sessionId = event.session_id ?? 'default';
      const state = sessions.get(sessionId);

      if (state && state.nonTodoToolCalls > 5) {
        api.logger.warn(
          `${LOG_PREFIX} todo-reminder: agent ending with ${state.nonTodoToolCalls} tool calls since last todo check. ` +
            `Ensure all tasks are marked complete.`,
        );
      }

      // Clean up session state
      sessions.delete(sessionId);
    },
  );

  // Clean up on session end
  api.on(
    'session_end',
    (event: { session_id?: string }, _ctx: unknown): void => {
      const sessionId = event.session_id ?? 'default';
      sessions.delete(sessionId);
    },
  );
}
