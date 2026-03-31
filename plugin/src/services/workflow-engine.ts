// plugin/src/services/workflow-engine.ts

import { PfPluginApi } from '../types.js';
import { WorkflowState, WorkflowName } from '../lib/types/workflow-types.js';
import { workflowStateMachine } from '../lib/workflow-state.js';
import { checkpointStore } from '../lib/checkpoint-store.js';
import { ACPClient } from '../lib/acp-client.js';
import { LOG_PREFIX } from '../constants.js';

export class WorkflowEngine {
  private api: PfPluginApi;
  private acpClient: ACPClient;
  private activeWorkflows: Map<string, WorkflowState>;

  constructor(api: PfPluginApi) {
    this.api = api;
    this.acpClient = new ACPClient(api);
    this.activeWorkflows = new Map();
  }

  start(): void {
    this.api.logger.info(`${LOG_PREFIX} WorkflowEngine started`);
  }

  stop(): void {
    this.api.logger.info(`${LOG_PREFIX} WorkflowEngine stopped`);
  }

  startWorkflow(workflow: WorkflowName, sessionId: string, topic: string): WorkflowState {
    const state = workflowStateMachine.createInitialState(workflow, sessionId, topic);
    this.activeWorkflows.set(sessionId, state);
    checkpointStore.save(state);
    this.api.logger.info(`${LOG_PREFIX} Started workflow ${workflow} for session ${sessionId}`);
    return state;
  }

  getState(sessionId: string): WorkflowState | null {
    return this.activeWorkflows.get(sessionId) || checkpointStore.load(sessionId, 'unknown');
  }

  requestTransition(sessionId: string, targetPhase: string, deliverables: Record<string, unknown>): boolean {
    const state = this.getState(sessionId);
    if (!state) return false;
    
    if (workflowStateMachine.canTransition(state, targetPhase as any)) {
      // Update state and save
      this.activeWorkflows.set(sessionId, state);
      checkpointStore.save(state);
      return true;
    }
    return false;
  }
}

let engineInstance: WorkflowEngine | null = null;

export function registerWorkflowEngine(api: PfPluginApi): void {
  engineInstance = new WorkflowEngine(api);
  engineInstance.start();
}

export function getWorkflowEngine(): WorkflowEngine | null {
  return engineInstance;
}
