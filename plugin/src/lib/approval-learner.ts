// plugin/src/lib/approval-learner.ts

interface ApprovalPattern {
  toolName: string;
  workflow?: string;
  phase?: string;
  approvalRate: number;
  totalDecisions: number;
  lastEvaluated: number;
}

const patterns = new Map<string, ApprovalPattern>();

function hashContext(context: Record<string, unknown>): string {
  return JSON.stringify(context);
}

function getPatternKey(tool: string, workflow: string, phase: string, context: Record<string, unknown>): string {
  return `${tool}:${workflow}:${phase}:${hashContext(context)}`;
}

export function recordApproval(tool: string, workflow: string, phase: string, context: Record<string, unknown>): void {
  const key = getPatternKey(tool, workflow, phase, context);
  const existing = patterns.get(key);
  if (existing) {
    existing.totalDecisions++;
    existing.approvalRate = ((existing.approvalRate * (existing.totalDecisions - 1)) + 1) / existing.totalDecisions;
    existing.lastEvaluated = Date.now();
  } else {
    patterns.set(key, {
      toolName: tool,
      workflow,
      phase,
      approvalRate: 1.0,
      totalDecisions: 1,
      lastEvaluated: Date.now(),
    });
  }
}

export function recordDenial(tool: string, workflow: string, phase: string, context: Record<string, unknown>): void {
  const key = getPatternKey(tool, workflow, phase, context);
  const existing = patterns.get(key);
  if (existing) {
    existing.totalDecisions++;
    existing.approvalRate = (existing.approvalRate * (existing.totalDecisions - 1)) / existing.totalDecisions;
    existing.lastEvaluated = Date.now();
  } else {
    patterns.set(key, {
      toolName: tool,
      workflow,
      phase,
      approvalRate: 0.0,
      totalDecisions: 1,
      lastEvaluated: Date.now(),
    });
  }
}

export function shouldAutoApprove(tool: string, workflow: string, phase: string, context: Record<string, unknown>, 
  minSamples: number = 5, threshold: number = 0.9): boolean {
  const key = getPatternKey(tool, workflow, phase, context);
  const pattern = patterns.get(key);
  if (!pattern) return false;
  return pattern.totalDecisions >= minSamples && pattern.approvalRate >= threshold;
}
