import { PfPluginApi } from '../types.js';
import { loadTodos } from '../tools/todo/store.js';

export function registerTodoCommands(api: PfPluginApi): void {
  api.registerCommand({
    name: 'todos',
    description: 'List all todos across sessions.',
    handler: async () => {
      const store = await loadTodos(api);

      if (store.todos.length === 0) {
        return { text: 'No todos found.' };
      }

      const pending = store.todos.filter((t) => t.status === 'pending');
      const inProgress = store.todos.filter((t) => t.status === 'in-progress');
      const blocked = store.todos.filter((t) => t.status === 'blocked');
      const done = store.todos.filter((t) => t.status === 'done');

      const formatGroup = (items: typeof store.todos, label: string, marker: string): string[] => {
        if (items.length === 0) return [];
        return [
          `**${label} (${items.length}):**`,
          ...items.map((t) => `${marker} \`${t.id}\` ${t.task}`),
          '',
        ];
      };

      const lines = [
        `**Todos (${store.todos.length} total)**`,
        '',
        ...formatGroup(inProgress, 'In Progress', '🔄'),
        ...formatGroup(pending, 'Pending', '⬜'),
        ...formatGroup(blocked, 'Blocked', '🚫'),
        ...formatGroup(done, 'Done', '✅'),
      ];

      return { text: lines.join('\n') };
    },
  });

}
