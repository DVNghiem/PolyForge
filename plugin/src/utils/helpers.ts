import { PfPluginApi, ToolResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';

/**
 * Wraps a registration function in try/catch with logging.
 */
export function safeRegister(
  api: PfPluginApi,
  name: string,
  category: string,
  fn: () => void,
): void {
  try {
    fn();
  } catch (err) {
    api.logger.error(`${LOG_PREFIX} Failed to register ${category} ${name}:`, err);
  }
}

/**
 * Creates a standard tool response envelope with text content.
 */
export function toolResponse(text: string): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

/**
 * Creates an error-formatted tool response.
 */
export function toolError(message: string): ToolResult {
  return {
    content: [
      {
        type: 'text',
        text: `Error: ${message}`,
      },
    ],
  };
}
