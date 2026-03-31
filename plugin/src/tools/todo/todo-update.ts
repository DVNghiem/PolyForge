import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../../types.js';
import { LOG_PREFIX } from '../../constants.js';
import { toolResponse, toolError } from '../../utils/helpers.js';
import { loadTodos, saveTodos } from './store.js';

const TodoUpdateParams = Type.Object({
  id: Type.String({ description: 'Todo item ID.' }),
  status: Type.Optional(
    Type.Unsafe<'pending' | 'in-progress' | 'done' | 'blocked'>({
      description: 'New status for the todo.',
    }),
  ),
  notes: Type.Optional(Type.String({ description: 'Update notes or context.' })),
});

type TodoUpdateInput = Static<typeof TodoUpdateParams>;

export function registerTodoUpdateTool(api: PfPluginApi): void {
  api.registerTool<TodoUpdateInput>({
    name: 'pf_todo_update',
    description: 'Update status or notes of an existing todo item.',
    parameters: TodoUpdateParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const { id, status, notes } = params;

      if (!id || id.trim().length === 0) {
        return toolError('Todo ID is required.');
      }

      const store = await loadTodos(api);
      const todo = store.todos.find((t) => t.id === id);

      if (!todo) {
        return toolError(`Todo not found: ${id}`);
      }

      if (status) todo.status = status;
      if (notes !== undefined) todo.notes = notes;
      todo.updatedAt = new Date().toISOString();

      await saveTodos(api, store);
      api.logger.info(`${LOG_PREFIX} pf_todo_update: ${id} → ${status ?? 'notes updated'}`);

      return toolResponse(
        `Todo updated: ${id}\nTask: ${todo.task}\nStatus: ${todo.status}${todo.notes ? `\nNotes: ${todo.notes}` : ''}`,
      );
    },
  });
}
