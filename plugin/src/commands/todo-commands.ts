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

  // Workflow trigger commands
  api.registerCommand({
    name: 'triage',
    description: 'Classify an incoming task and route it to the correct workflow.',
    acceptsArgs: true,
    handler: (ctx) => {
      const task = (ctx.args ?? '').trim();
      if (!task) {
        return { text: 'Usage: /triage <task description>' };
      }
      return {
        text: `**Triage requested:** ${task}\n\nActivating Atlas for task classification. Refer to triage.md workflow.`,
      };
    },
  });

  api.registerCommand({
    name: 'research',
    description: 'Start the technology research workflow.',
    acceptsArgs: true,
    handler: (ctx) => {
      const topic = (ctx.args ?? '').trim();
      if (!topic) {
        return { text: 'Usage: /research <topic>' };
      }
      return {
        text: `**Research requested:** ${topic}\n\nActivating Researcher. Use pf_research tool with this topic.`,
      };
    },
  });

  api.registerCommand({
    name: 'intake',
    description: 'Structured task intake from a team requirement or issue.',
    acceptsArgs: true,
    handler: (ctx) => {
      const desc = (ctx.args ?? '').trim();
      if (!desc) {
        return { text: 'Usage: /intake <task description>' };
      }
      return {
        text: `**Intake requested:** ${desc}\n\nActivating Atlas. Use pf_intake tool to parse this task.`,
      };
    },
  });

  api.registerCommand({
    name: 'review',
    description: 'Review code, a PR description, or an architecture plan.',
    acceptsArgs: true,
    handler: (ctx) => {
      const target = (ctx.args ?? '').trim();
      if (!target) {
        return { text: 'Usage: /review <target>' };
      }
      return {
        text: `**Review requested:** ${target}\n\nActivating Critic. Refer to review.md workflow.`,
      };
    },
  });

  api.registerCommand({
    name: 'brainstorm',
    description: 'Structured ideation for a technical decision or design problem.',
    acceptsArgs: true,
    handler: (ctx) => {
      const topic = (ctx.args ?? '').trim();
      if (!topic) {
        return { text: 'Usage: /brainstorm <topic>' };
      }
      return {
        text: `**Brainstorm requested:** ${topic}\n\nActivating Analyst. Refer to brainstorm.md workflow.`,
      };
    },
  });

  api.registerCommand({
    name: 'plan',
    description: 'Produce a structured execution plan.',
    acceptsArgs: true,
    handler: (ctx) => {
      const topic = (ctx.args ?? '').trim();
      if (!topic) {
        return { text: 'Usage: /plan <topic or file>' };
      }
      return {
        text: `**Plan requested:** ${topic}\n\nActivating Atlas. Refer to plan.md workflow.`,
      };
    },
  });

  api.registerCommand({
    name: 'execute',
    description: 'Load an approved plan and delegate execution.',
    acceptsArgs: true,
    handler: (ctx) => {
      const planFile = (ctx.args ?? '').trim();
      if (!planFile) {
        return { text: 'Usage: /execute <plan file>' };
      }
      return {
        text: `**Execution requested:** ${planFile}\n\nActivating Atlas. Refer to execute.md workflow.`,
      };
    },
  });

  api.registerCommand({
    name: 'work',
    description: 'Full engineering pipeline: intake → research → plan → execute → review.',
    acceptsArgs: true,
    handler: (ctx) => {
      const task = (ctx.args ?? '').trim();
      if (!task) {
        return { text: 'Usage: /work <task description>' };
      }
      return {
        text: `**Full work pipeline requested:** ${task}\n\nActivating Atlas. Refer to work.md workflow.`,
      };
    },
  });
}
