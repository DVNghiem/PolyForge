import * as path from 'node:path';
import { readState, writeState, ensureDir } from '../../utils/state.js';
import { resolveWorkspacePath } from '../../utils/paths.js';
import { PfPluginApi } from '../../types.js';

export interface TodoItem {
  id: string;
  task: string;
  status: 'pending' | 'in-progress' | 'done' | 'blocked';
  createdAt: string;
  updatedAt: string;
  sessionId?: string;
  notes?: string;
}

export interface TodoStore {
  todos: TodoItem[];
}

const TODO_FILE = '.polyforge-state/todos.json';

function getTodoPath(api: PfPluginApi): string {
  const dir = resolveWorkspacePath(api.workspaceDir ?? '.', '.polyforge-state');
  return path.join(dir, 'todos.json');
}

export async function loadTodos(api: PfPluginApi): Promise<TodoStore> {
  const filePath = getTodoPath(api);
  await ensureDir(path.dirname(filePath));
  const result = await readState<TodoStore>(filePath);
  if (result.ok) return result.data;
  return { todos: [] };
}

export async function saveTodos(api: PfPluginApi, store: TodoStore): Promise<void> {
  const filePath = getTodoPath(api);
  await writeState(filePath, store);
}

export function generateTodoId(): string {
  return `todo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
