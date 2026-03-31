import { PfPluginApi, TypedHookContext, BeforePromptBuildEvent, BeforePromptBuildResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { contextCollector } from '../features/context-collector.js';

export function registerContextInjector(api: PfPluginApi): void {
  api.on<BeforePromptBuildEvent, BeforePromptBuildResult>(
    'before_prompt_build',
    (_event: BeforePromptBuildEvent, ctx: TypedHookContext): BeforePromptBuildResult | void => {
      const sessionKey = ctx.sessionKey ?? 'default';
      const entries = contextCollector.collect(sessionKey);
      if (entries.length === 0) return;

      const contextBlock = entries
        .map((e: { source: string; content: string }) => `[${e.source}] ${e.content}`)
        .join('\n');

      api.logger.info(`${LOG_PREFIX} Injecting ${entries.length} context entries via context-injector`);

      return {
        prependContext: `<polyforge-context>\n${contextBlock}\n</polyforge-context>`,
      };
    },
    { priority: 50 },
  );
}
