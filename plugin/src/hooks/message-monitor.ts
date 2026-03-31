import { PfPluginApi } from '../types.js';
import { LOG_PREFIX } from '../constants.js';

interface MessageContext {
  content?: string;
  channelId?: string;
}

const MAX_MESSAGE_COUNTS = 1000;
const messageCounts = new Map<string, number>();

export function registerMessageMonitor(api: PfPluginApi) {
  api.registerHook(
    'message:sent',
    (context: MessageContext) => {
      const content = context?.content || '';
      const preview = content.substring(0, 100);
      const channelId = context?.channelId || 'unknown';
      const timestamp = new Date().toISOString();
      const currentCount = messageCounts.get(channelId) ?? 0;
      const nextCount = currentCount + 1;
      messageCounts.set(channelId, nextCount);

      if (messageCounts.size > MAX_MESSAGE_COUNTS) {
        const oldestKey = messageCounts.keys().next().value;
        if (oldestKey !== undefined) {
          messageCounts.delete(oldestKey);
        }
      }

      api.logger.info(`${LOG_PREFIX} Message sent:`, { preview, channelId, timestamp, messageCount: nextCount });
      return context;
    },
    {
      name: 'polyforge.message-monitor',
      description: 'Monitors message events for audit logging',
    }
  );

  api.registerHook(
    'message:received',
    (context: MessageContext) => {
      const content = context?.content || '';
      const preview = content.substring(0, 100);
      const channelId = context?.channelId || 'unknown';
      api.logger.info(`${LOG_PREFIX} Message received:`, { preview, channelId });
      return context;
    },
    {
      name: 'polyforge.message-received-monitor',
      description: 'Monitors inbound message events for audit logging',
    }
  );
}

export function getMessageCount(channelId?: string): number {
  if (channelId) return messageCounts.get(channelId) ?? 0;

  let total = 0;
  for (const count of messageCounts.values()) {
    total += count;
  }
  return total;
}
