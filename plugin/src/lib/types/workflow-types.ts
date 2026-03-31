// plugin/src/lib/types/workflow-types.ts

export type WorkflowName = 'brainstorm' | 'triage' | 'research' | 'intake' | 'review' | 'plan' | 'execute' | 'work';

export type PhaseName = 
  | 'problem_framing' | 'divergent' | 'convergent' | 'decision'  // brainstorm
  | 'classify' | 'assess' | 'route'                                 // triage
  | 'scope' | 'investigate' | 'synthesize' | 'present'             // research
  | 'parse' | 'gap_analysis' | 'research_trigger' | 'plan_stub' | 'handoff'  // intake
  | 'scope_review' | 'execute_review' | 'recommend' | 'signoff'       // review
  | 'context_gather' | 'decompose' | 'gap_review' | 'document' | 'approve'  // plan
  | 'load_plan' | 'resolve_deps' | 'execute_batch' | 'next_batch' | 'update_plan'  // execute
  | 'intake' | 'research' | 'plan' | 'execute' | 'review' | 'ship';  // work

export type ApprovalLevel = 'low' | 'medium' | 'high';

export interface PhaseDefinition {
  name: PhaseName;
  entryCriteria: string[];
  exitCriteriaMin: string[];
  exitCriteriaComplete: string[];
  hardRules?: string[];
}

export interface WorkflowDefinition {
  name: WorkflowName;
  phases: PhaseDefinition[];
  defaultApproval: ApprovalLevel;
}

export interface PhaseHistoryEntry {
  phase: PhaseName;
  enteredAt: string;
  exitedAt: string | null;
  deliverables: Record<string, unknown>;
}

export interface WorkflowState {
  workflow: WorkflowName;
  sessionId: string;
  startedAt: string;
  currentPhase: PhaseName;
  phaseHistory: PhaseHistoryEntry[];
  topic: string;
  approvalLevel: ApprovalLevel;
  contextInjected: string[];
}
