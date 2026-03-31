import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../../types.js';
import { LOG_PREFIX } from '../../constants.js';
import { toolResponse } from '../../utils/helpers.js';
import { loadTodos } from './store.js';

const TodoListParams = Type.Object({
  status: Type.Optional(
    Type.Unsafe<'pending' | 'in-progress' | 'done' | 'blocked' | 'all'>({
      description: 'Filter by status. Default: all.',
    }),
  ),
});

type TodoListInput = Static<typeof TodoListParams>;

export function registerTodoListTool(api: PfPluginApi): void {
  api.registerTool<TodoListInput>({
    name: 'pf_todo_list',
    description: 'List all todo items, optionally filtered by status.',
    parameters: TodoListParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const store = await loadTodos(api);
      const filter = params.status ?? 'all';

      const filtered =
        filter === 'all'
          ? store.todos
          : store.todos.filter((t) => t.status === filter);

      if (filtered.length === 0) {
        return toolResponse(filter === 'all' ? 'No todos found.' : `No todos with status "${filter}".`);
      }

      const lines = filtered.map((t) => {
        const marker =
          t.status === 'done' ? '✅' :
          t.status === 'in-progress' ? '🔄' :
          t.status === 'blocked' ? '🚫' : '⬜';
        return `${marker} [${t.id}] ${t.task} (${t.status})`;
      });

      const summary = [
        `**Todos (${filtered.length}${filter !== 'all' ? ` — ${filter}` : ''}):**`,
        '',
        ...lines,
      ];

      api.logger.info(`${LOG_PREFIX} pf_todo_list: returned ${filtered.length} items`);
      return toolResponse(summary.join('\n'));
    },
  });
}
