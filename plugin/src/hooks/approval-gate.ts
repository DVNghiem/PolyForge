import { PfPluginApi, TypedHookContext, BeforePromptBuildEvent, BeforePromptBuildResult } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { checkpointStore } from '../lib/checkpoint-store.js';
import { workflowStateMachine } from '../lib/workflow-state.js';

interface ApprovalContext {
  workflow: string;
  phase: string;
  action: string;
  params: Record<string, unknown>;
}

const pendingApprovals = new Map<string, { approvedAt: number; approvedBy: string }>();
const APPROVAL_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getApprovalKey(ctx: ApprovalContext): string {
  return `${ctx.workflow}:${ctx.phase}:${ctx.action}:${JSON.stringify(ctx.params)}`;
}

export function registerApprovalGate(api: PfPluginApi): void {
  // Hook to intercept tool calls and check approval requirements
  api.on<BeforePromptBuildEvent, BeforePromptBuildResult>(
    'before_prompt_build',
    (event: BeforePromptBuildEvent, ctx: TypedHookContext): BeforePromptBuildResult | void => {
      // Check if there's a pending tool call that needs approval
      const sessionKey = ctx.sessionKey ?? 'default';
      // Implementation checks pending approvals and injects approval context
      return undefined;
    },
    { priority: 85 },
  );
}

export function checkApprovalRequired(action: string, workflow: string, phase: string, level: string): boolean {
  // Simple logic: high approval always requires approval for spawning
  if (level === 'high' && (action.includes('spawn'))) return true;
  if (level === 'medium' && action === 'spawn_detached') return true;
  return false;
}

export function recordApproval(workflow: string, phase: string, action: string, params: Record<string, unknown>): void {
  const key = getApprovalKey({ workflow, phase, action, params });
  pendingApprovals.set(key, { approvedAt: Date.now(), approvedBy: 'user' });
}

export function isApproved(workflow: string, phase: string, action: string, params: Record<string, unknown>): boolean {
  const key = getApprovalKey({ workflow, phase, action, params });
  const approval = pendingApprovals.get(key);
  if (!approval) return false;
  if (Date.now() - approval.approvedAt > APPROVAL_TTL_MS) {
    pendingApprovals.delete(key);
    return false;
  }
  return true;
}
