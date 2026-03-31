// plugin/src/lib/acp-client.ts

import { PfPluginApi } from '../types.js';

interface SpawnParams {
  agent_type: 'pf_sprint' | 'pf_forge' | 'pf_researcher' | 'pf_explorer' | 'pf_analyst' | 'pf_critic';
  task: string;
  spawn_mode: 'nested' | 'detached';
  parent_session?: string;
  workspace_override?: string;
  model_hint?: string;
  max_iterations?: number;
}

interface SpawnResult {
  success: boolean;
  session_id: string;
  mode: 'nested' | 'detached';
  status: 'spawned' | 'queued' | 'error';
  error?: string;
}

export class ACPClient {
  private api: PfPluginApi;
  private gatewayUrl: string;

  constructor(api: PfPluginApi) {
    this.api = api;
    this.gatewayUrl = 'http://localhost:18789'; // Default gateway port
  }

  async spawn(params: SpawnParams): Promise<SpawnResult> {
    // In a real implementation, this would call the ACP gateway API
    // For now, return a placeholder result structure
    this.api.logger.info(`[ACPClient] spawn request: ${params.agent_type} in ${params.spawn_mode} mode`);
    
    return {
      success: true,
      session_id: `session-${Date.now()}`,
      mode: params.spawn_mode,
      status: 'spawned',
    };
  }

  async send(sessionId: string, message: string): Promise<void> {
    this.api.logger.info(`[ACPClient] send to ${sessionId}: ${message.substring(0, 50)}...`);
  }

  async getResult(sessionId: string): Promise<unknown> {
    this.api.logger.info(`[ACPClient] getResult for ${sessionId}`);
    return { status: 'pending' };
  }

  async listActive(): Promise<string[]> {
    return [];
  }

  async terminate(sessionId: string): Promise<void> {
    this.api.logger.info(`[ACPClient] terminate ${sessionId}`);
  }
}
