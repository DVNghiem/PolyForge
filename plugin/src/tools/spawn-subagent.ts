// plugin/src/tools/spawn-subagent.ts

import { PfPluginApi } from '../types.js';
import { ACPClient } from '../lib/acp-client.js';
import { LOG_PREFIX } from '../constants.js';

interface SpawnSubagentParams {
  session_id: string;
  workflow: string;
  phase: string;
  agent_type: 'pf_sprint' | 'pf_forge' | 'pf_researcher' | 'pf_explorer' | 'pf_analyst' | 'pf_critic';
  task: string;
  spawn_mode: 'nested' | 'detached';
  reasoning: string;
}

export function registerSpawnSubagentTool(api: PfPluginApi): void {
  const acpClient = new ACPClient(api);

  api.registerTool<SpawnSubagentParams>({
    name: 'pf_spawn_subagent',
    description: 'Spawn an ACP subagent for parallel task execution',
    parameters: {
      type: 'object',
      properties: {
        session_id: { type: 'string' },
        workflow: { type: 'string' },
        phase: { type: 'string' },
        agent_type: { type: 'string' },
        task: { type: 'string' },
        spawn_mode: { type: 'string', enum: ['nested', 'detached'] },
        reasoning: { type: 'string' },
      },
      required: ['session_id', 'workflow', 'agent_type', 'task', 'spawn_mode', 'reasoning'],
    },
    execute: async (toolCallId: string, params: SpawnSubagentParams) => {
      const result = await acpClient.spawn({
        agent_type: params.agent_type,
        task: params.task,
        spawn_mode: params.spawn_mode,
        parent_session: params.spawn_mode === 'nested' ? params.session_id : undefined,
      });

      api.logger.info(`${LOG_PREFIX} Spawned ${params.agent_type} in ${params.spawn_mode} mode: ${result.session_id}`);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result),
        }],
      };
    },
  });
}
