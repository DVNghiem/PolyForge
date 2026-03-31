import { Type, type Static } from '@sinclair/typebox';
import { PfPluginApi, ToolResult } from '../../types.js';
import { LOG_PREFIX } from '../../constants.js';
import { toolResponse, toolError } from '../../utils/helpers.js';
import { loadTodos, saveTodos, generateTodoId } from './store.js';

const TodoCreateParams = Type.Object({
  task: Type.String({ description: 'Description of the task.' }),
  notes: Type.Optional(Type.String({ description: 'Additional notes or context.' })),
});

type TodoCreateInput = Static<typeof TodoCreateParams>;

export function registerTodoCreateTool(api: PfPluginApi): void {
  api.registerTool<TodoCreateInput>({
    name: 'pf_todo_create',
    description: 'Create a new todo item in the PolyForge task tracker.',
    parameters: TodoCreateParams,
    execute: async (_toolCallId, params): Promise<ToolResult> => {
      const { task, notes } = params;

      if (!task || task.trim().length === 0) {
        return toolError('Task description is required.');
      }

      const store = await loadTodos(api);
      const now = new Date().toISOString();
      const id = generateTodoId();

      store.todos.push({
        id,
        task: task.trim(),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        notes: notes?.trim(),
      });

      await saveTodos(api, store);
      api.logger.info(`${LOG_PREFIX} pf_todo_create: created ${id} — "${task.trim()}"`);

      return toolResponse(`Todo created: ${id}\nTask: ${task.trim()}\nStatus: pending`);
    },
  });
}
