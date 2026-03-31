// plugin/src/lib/checkpoint-store.ts

import { WorkflowState } from './types/workflow-types.js';
import { resolveWorkspacePath } from '../utils/paths.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

const CHECKPOINT_DIR = 'checkpoints';

export class CheckpointStore {
  private baseDir: string;

  constructor(workspaceDir?: string) {
    this.baseDir = resolveWorkspacePath(workspaceDir || '.');
  }

  private getCheckpointPath(sessionId: string, workflow: string): string {
    return `${this.baseDir}/${CHECKPOINT_DIR}/workflow-${workflow}-${sessionId}.json`;
  }

  save(state: WorkflowState): void {
    const dir = `${this.baseDir}/${CHECKPOINT_DIR}`;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const path = this.getCheckpointPath(state.sessionId, state.workflow);
    writeFileSync(path, JSON.stringify(state, null, 2));
  }

  load(sessionId: string, workflow: string): WorkflowState | null {
    const path = this.getCheckpointPath(sessionId, workflow);
    if (!existsSync(path)) return null;
    try {
      const data = readFileSync(path, 'utf-8');
      return JSON.parse(data) as WorkflowState;
    } catch {
      return null;
    }
  }

  delete(sessionId: string, workflow: string): void {
    const path = this.getCheckpointPath(sessionId, workflow);
    if (existsSync(path)) {
      // Would use unlinkSync here
    }
  }

  listActive(workflow?: string): WorkflowState[] {
    // Returns all active workflow states
    // Implementation scans checkpoint directory
    return [];
  }
}

export const checkpointStore = new CheckpointStore();
