import { PfPluginApi, TypedHookContext, BeforePromptBuildEvent, BeforePromptBuildResult } from '../../types.js';
import { LOG_PREFIX } from '../../constants.js';
import { detectCategory } from './detector.js';
import { contextCollector } from '../../features/context-collector.js';

export function registerKeywordDetector(api: PfPluginApi): void {
  // Scan incoming messages for category keywords
  api.on<BeforePromptBuildEvent, BeforePromptBuildResult>(
    'before_prompt_build',
    (event: BeforePromptBuildEvent, ctx: TypedHookContext): BeforePromptBuildResult | void => {
      const userMessage = event.userMessage ?? event.latestMessage ?? '';
      if (!userMessage) return;

      const result = detectCategory(userMessage);
      if (!result || result.confidence < 0.3) return;

      const sessionKey = ctx.sessionKey ?? 'default';
      api.logger.info(
        `${LOG_PREFIX} keyword-detector: detected category="${result.category}" ` +
          `(confidence=${result.confidence.toFixed(2)}, keywords=[${result.matchedKeywords.join(', ')}])`,
      );

      contextCollector.register(sessionKey, {
        id: `keyword-detect-${result.category}`,
        source: 'plugin',
        content: `Detected task category: **${result.category}** (confidence: ${result.confidence.toFixed(2)}). Matched keywords: ${result.matchedKeywords.join(', ')}.`,
        priority: 'normal',
        oneShot: true,
      });
    },
    { priority: 80 },
  );

  // Also scan tool results for category clues
  api.on(
    'tool_result_persist',
    (event: { tool_name?: string; result?: string }, ctx: unknown): void => {
      const text = event.result ?? '';
      if (text.length < 20) return;

      const result = detectCategory(text);
      if (!result || result.confidence < 0.5) return;

      const hookCtx = ctx as TypedHookContext;
      const sessionKey = hookCtx.sessionKey ?? 'default';
      api.logger.info(
        `${LOG_PREFIX} keyword-detector: tool result suggests category="${result.category}"`,
      );

      contextCollector.register(sessionKey, {
        id: `keyword-detect-tool-${result.category}`,
        source: 'plugin',
        content: `Tool result analysis suggests category: ${result.category}`,
        priority: 'low',
        oneShot: true,
      });
    },
    { priority: 75 },
  );
}
