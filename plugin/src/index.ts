import { PfPluginApi } from './types.js';
import { LOG_PREFIX } from './constants.js';
import { safeRegister } from './utils/helpers.js';
import { getVersion } from './version.js';

// Hooks
import { registerTodoEnforcer } from './hooks/todo-enforcer.js';
import { registerCommentChecker } from './hooks/comment-checker.js';
import { registerMessageMonitor } from './hooks/message-monitor.js';
import { registerGuardrailInjector } from './hooks/guardrail-injector.js';
import { registerContextInjector } from './hooks/context-injector.js';
import { registerSessionSync } from './hooks/session-sync.js';
import { registerSpawnGuard } from './hooks/spawn-guard.js';
import { registerKeywordDetector } from './hooks/keyword-detector/hook.js';
import { registerLangDetector } from './hooks/lang-detector.js';
import { registerSubagentTracker } from './hooks/subagent-tracker.js';
import { registerTodoReminder } from './hooks/todo-reminder.js';
import { registerWorkflowCommands } from './hooks/workflow-commands.js';

// Tools
import { registerDelegateTool } from './tools/delegate.js';
import { registerSpawnAcpTool } from './tools/spawn-acp.js';
import { registerResearchTool } from './tools/research.js';
import { registerIntakeTool } from './tools/intake.js';
import { registerWebSearchTool } from './tools/web-search.js';
import { registerCheckpointTool } from './tools/checkpoint.js';
import { registerTodoCreateTool, registerTodoListTool, registerTodoUpdateTool } from './tools/todo/index.js';

// Commands
import { registerPfCommands } from './commands/pf-commands.js';
import { registerAutorunCommands } from './commands/autorun-commands.js';
import { registerTodoCommands } from './commands/todo-commands.js';

// Services
import { registerAutorunService } from './services/autorun-loop.js';

// CLI
import { registerPfSetupCli } from './cli/pf-setup.js';

/**
 * Generation counter to handle multi-registration gracefully.
 * When OpenClaw re-registers the plugin, stale hooks from previous
 * registrations should not fire.
 */
let currentGeneration = 0;

/**
 * Creates a guarded API proxy that checks the generation counter
 * before firing hook handlers.
 */
function guardedApi(api: PfPluginApi, gen: number): PfPluginApi {
  return new Proxy(api, {
    get(target, prop, receiver) {
      if (prop === 'on') {
        return <TEvent, TResult>(
          hookName: string,
          handler: (event: TEvent, ctx: unknown) => TResult | void,
          opts?: { priority?: number },
        ) => {
          const guardedHandler = (event: TEvent, ctx: unknown): TResult | void => {
            if (gen !== currentGeneration) return;
            return handler(event, ctx);
          };
          return target.on(hookName, guardedHandler, opts);
        };
      }
      return Reflect.get(target, prop, receiver);
    },
  });
}

export default function register(api: PfPluginApi): void {
  currentGeneration++;
  const gen = currentGeneration;
  const guarded = guardedApi(api, gen);

  api.logger.info(`${LOG_PREFIX} PolyForge v${getVersion()} — registering (generation ${gen})`);

  // Register hooks (use guarded API for generation-safe hooks)
  safeRegister(api, 'session-sync', 'hook', () => registerSessionSync(guarded));
  safeRegister(api, 'spawn-guard', 'hook', () => registerSpawnGuard(guarded));
  safeRegister(api, 'guardrail-injector', 'hook', () => registerGuardrailInjector(guarded));
  safeRegister(api, 'keyword-detector', 'hook', () => registerKeywordDetector(guarded));
  safeRegister(api, 'lang-detector', 'hook', () => registerLangDetector(guarded));
  safeRegister(api, 'todo-enforcer', 'hook', () => registerTodoEnforcer(guarded));
  safeRegister(api, 'context-injector', 'hook', () => registerContextInjector(guarded));
  safeRegister(api, 'comment-checker', 'hook', () => registerCommentChecker(guarded));
  safeRegister(api, 'message-monitor', 'hook', () => registerMessageMonitor(guarded));
  safeRegister(api, 'subagent-tracker', 'hook', () => registerSubagentTracker(guarded));
  safeRegister(api, 'todo-reminder', 'hook', () => registerTodoReminder(guarded));
  safeRegister(api, 'workflow-commands', 'hook', () => registerWorkflowCommands(guarded));

  // Register tools
  safeRegister(api, 'pf_delegate', 'tool', () => registerDelegateTool(api));
  safeRegister(api, 'pf_spawn_acp', 'tool', () => registerSpawnAcpTool(api));
  safeRegister(api, 'pf_research', 'tool', () => registerResearchTool(api));
  safeRegister(api, 'pf_intake', 'tool', () => registerIntakeTool(api));
  safeRegister(api, 'pf_search', 'tool', () => registerWebSearchTool(api));
  safeRegister(api, 'pf_checkpoint', 'tool', () => registerCheckpointTool(api));
  safeRegister(api, 'pf_todo_create', 'tool', () => registerTodoCreateTool(api));
  safeRegister(api, 'pf_todo_list', 'tool', () => registerTodoListTool(api));
  safeRegister(api, 'pf_todo_update', 'tool', () => registerTodoUpdateTool(api));

  // Register commands
  safeRegister(api, 'pf', 'command', () => registerPfCommands(api));
  safeRegister(api, 'autorun', 'command', () => registerAutorunCommands(api));
  safeRegister(api, 'todos', 'command', () => registerTodoCommands(api));

  // Register services
  safeRegister(api, 'autorun', 'service', () => registerAutorunService(api));

  // Register CLI
  api.registerCli(
    (ctx) => registerPfSetupCli(ctx),
    { commands: ['pf-setup'] },
  );

  api.logger.info(`${LOG_PREFIX} PolyForge v${getVersion()} — registration complete`);
}
