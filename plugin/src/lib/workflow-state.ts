// plugin/src/lib/workflow-state.ts

import { WorkflowState, WorkflowDefinition, PhaseName, WorkflowName, ApprovalLevel, PhaseDefinition } from './types/workflow-types.js';

// Workflow definitions with phases
export const WORKFLOW_DEFINITIONS: Record<WorkflowName, WorkflowDefinition> = {
  brainstorm: {
    name: 'brainstorm',
    defaultApproval: 'medium',
    phases: [
      { 
        name: 'problem_framing', 
        entryCriteria: ['Topic provided'], 
        exitCriteriaMin: ['Problem statement', 'Goal'], 
        exitCriteriaComplete: ['Problem statement', 'Goal', 'Constraints', 'Stakeholders'] 
      },
      { 
        name: 'divergent', 
        entryCriteria: ['problem_framing complete'], 
        exitCriteriaMin: ['3 approaches documented'], 
        exitCriteriaComplete: ['3 approaches with sketches'],
        hardRules: ['min_3_approaches', 'no_criticism'] 
      },
      { 
        name: 'convergent', 
        entryCriteria: ['divergent complete'], 
        exitCriteriaMin: ['All approaches scored'], 
        exitCriteriaComplete: ['Comparison matrix', 'Hybrid identified'] 
      },
      { 
        name: 'decision', 
        entryCriteria: ['convergent complete'], 
        exitCriteriaMin: ['Recommendation', 'Rationale'], 
        exitCriteriaComplete: ['Decision file written'] 
      },
    ],
  },
  triage: {
    name: 'triage',
    defaultApproval: 'low',
    phases: [
      { 
        name: 'classify', 
        entryCriteria: ['Task provided'], 
        exitCriteriaMin: ['Category assigned'], 
        exitCriteriaComplete: ['Category + complexity'] 
      },
      { 
        name: 'assess', 
        entryCriteria: ['classify complete'], 
        exitCriteriaMin: ['Complexity determined'], 
        exitCriteriaComplete: ['Complexity + effort'] 
      },
      { 
        name: 'route', 
        entryCriteria: ['assess complete'], 
        exitCriteriaMin: ['Routing target'], 
        exitCriteriaComplete: ['Routing + workflow'] 
      },
    ],
  },
  research: {
    name: 'research',
    defaultApproval: 'medium',
    phases: [
      { 
        name: 'scope', 
        entryCriteria: ['Research topic provided'], 
        exitCriteriaMin: ['Scope defined'], 
        exitCriteriaComplete: ['Scope + key questions'] 
      },
      { 
        name: 'investigate', 
        entryCriteria: ['scope complete'], 
        exitCriteriaMin: ['Initial findings'], 
        exitCriteriaComplete: ['Comprehensive findings with sources'] 
      },
      { 
        name: 'synthesize', 
        entryCriteria: ['investigate complete'], 
        exitCriteriaMin: ['Key insights extracted'], 
        exitCriteriaComplete: ['Synthesis + recommendations'] 
      },
      { 
        name: 'present', 
        entryCriteria: ['synthesize complete'], 
        exitCriteriaMin: ['Summary documented'], 
        exitCriteriaComplete: ['Full report + presentation'] 
      },
    ],
  },
  intake: {
    name: 'intake',
    defaultApproval: 'medium',
    phases: [
      { 
        name: 'parse', 
        entryCriteria: ['Input received'], 
        exitCriteriaMin: ['Input parsed'], 
        exitCriteriaComplete: ['Structured input + validation'] 
      },
      { 
        name: 'gap_analysis', 
        entryCriteria: ['parse complete'], 
        exitCriteriaMin: ['Gaps identified'], 
        exitCriteriaComplete: ['Gap analysis + missing info'] 
      },
      { 
        name: 'research_trigger', 
        entryCriteria: ['gap_analysis complete'], 
        exitCriteriaMin: ['Research needs determined'], 
        exitCriteriaComplete: ['Research plan'] 
      },
      { 
        name: 'plan_stub', 
        entryCriteria: ['research_trigger complete'], 
        exitCriteriaMin: ['Initial plan draft'], 
        exitCriteriaComplete: ['Complete plan stub'] 
      },
      { 
        name: 'handoff', 
        entryCriteria: ['plan_stub complete'], 
        exitCriteriaMin: ['Handoff prepared'], 
        exitCriteriaComplete: ['Full handoff package'] 
      },
    ],
  },
  review: {
    name: 'review',
    defaultApproval: 'high',
    phases: [
      { 
        name: 'scope_review', 
        entryCriteria: ['Scope proposed'], 
        exitCriteriaMin: ['Scope acknowledged'], 
        exitCriteriaComplete: ['Scope approved'] 
      },
      { 
        name: 'execute_review', 
        entryCriteria: ['scope_review complete'], 
        exitCriteriaMin: ['Execution reviewed'], 
        exitCriteriaComplete: ['Execution approved'] 
      },
      { 
        name: 'recommend', 
        entryCriteria: ['execute_review complete'], 
        exitCriteriaMin: ['Recommendation made'], 
        exitCriteriaComplete: ['Recommendation with rationale'] 
      },
      { 
        name: 'signoff', 
        entryCriteria: ['recommend complete'], 
        exitCriteriaMin: ['Signoff pending'], 
        exitCriteriaComplete: ['Fully signed off'] 
      },
    ],
  },
  plan: {
    name: 'plan',
    defaultApproval: 'high',
    phases: [
      { 
        name: 'context_gather', 
        entryCriteria: ['Task received'], 
        exitCriteriaMin: ['Context collected'], 
        exitCriteriaComplete: ['Full context documented'] 
      },
      { 
        name: 'decompose', 
        entryCriteria: ['context_gather complete'], 
        exitCriteriaMin: ['Tasks decomposed'], 
        exitCriteriaComplete: ['Detailed task breakdown'] 
      },
      { 
        name: 'gap_review', 
        entryCriteria: ['decompose complete'], 
        exitCriteriaMin: ['Gaps identified'], 
        exitCriteriaComplete: ['Gaps resolved'] 
      },
      { 
        name: 'document', 
        entryCriteria: ['gap_review complete'], 
        exitCriteriaMin: ['Plan documented'], 
        exitCriteriaComplete: ['Complete plan document'] 
      },
      { 
        name: 'approve', 
        entryCriteria: ['document complete'], 
        exitCriteriaMin: ['Approval pending'], 
        exitCriteriaComplete: ['Plan approved'] 
      },
    ],
  },
  execute: {
    name: 'execute',
    defaultApproval: 'medium',
    phases: [
      { 
        name: 'load_plan', 
        entryCriteria: ['Plan available'], 
        exitCriteriaMin: ['Plan loaded'], 
        exitCriteriaComplete: ['Plan validated'] 
      },
      { 
        name: 'resolve_deps', 
        entryCriteria: ['load_plan complete'], 
        exitCriteriaMin: ['Dependencies identified'], 
        exitCriteriaComplete: ['Dependencies resolved'] 
      },
      { 
        name: 'execute_batch', 
        entryCriteria: ['resolve_deps complete'], 
        exitCriteriaMin: ['Batch executed'], 
        exitCriteriaComplete: ['Batch validated'] 
      },
      { 
        name: 'next_batch', 
        entryCriteria: ['execute_batch complete'], 
        exitCriteriaMin: ['Next batch ready'], 
        exitCriteriaComplete: ['Batch sequence optimized'] 
      },
      { 
        name: 'update_plan', 
        entryCriteria: ['next_batch complete or no more batches'], 
        exitCriteriaMin: ['Plan updated'], 
        exitCriteriaComplete: ['Final plan state documented'] 
      },
    ],
  },
  work: {
    name: 'work',
    defaultApproval: 'medium',
    phases: [
      { 
        name: 'intake', 
        entryCriteria: ['Work item received'], 
        exitCriteriaMin: ['Intake complete'], 
        exitCriteriaComplete: ['Fully processed intake'] 
      },
      { 
        name: 'research', 
        entryCriteria: ['intake complete'], 
        exitCriteriaMin: ['Research started'], 
        exitCriteriaComplete: ['Research complete'] 
      },
      { 
        name: 'plan', 
        entryCriteria: ['research complete'], 
        exitCriteriaMin: ['Plan drafted'], 
        exitCriteriaComplete: ['Plan finalized'] 
      },
      { 
        name: 'execute', 
        entryCriteria: ['plan complete'], 
        exitCriteriaMin: ['Execution started'], 
        exitCriteriaComplete: ['Execution complete'] 
      },
      { 
        name: 'review', 
        entryCriteria: ['execute complete'], 
        exitCriteriaMin: ['Review started'], 
        exitCriteriaComplete: ['Review complete'] 
      },
      { 
        name: 'ship', 
        entryCriteria: ['review complete'], 
        exitCriteriaMin: ['Ship pending'], 
        exitCriteriaComplete: ['Successfully shipped'] 
      },
    ],
  },
};

export class WorkflowStateMachine {
  private workflows = WORKFLOW_DEFINITIONS;

  getWorkflowDefinition(name: WorkflowName): WorkflowDefinition | null {
    return this.workflows[name] || null;
  }

  getCurrentPhase(state: WorkflowState): PhaseDefinition | null {
    const def = this.workflows[state.workflow];
    return def?.phases.find(p => p.name === state.currentPhase) || null;
  }

  getNextPhases(state: WorkflowState): PhaseName[] {
    const def = this.workflows[state.workflow];
    if (!def) return [];
    const currentIndex = def.phases.findIndex(p => p.name === state.currentPhase);
    if (currentIndex === -1 || currentIndex === def.phases.length - 1) return [];
    return [def.phases[currentIndex + 1].name];
  }

  canTransition(state: WorkflowState, targetPhase: PhaseName): boolean {
    const nextPhases = this.getNextPhases(state);
    return nextPhases.includes(targetPhase);
  }

  createInitialState(workflow: WorkflowName, sessionId: string, topic: string, approvalLevel?: ApprovalLevel): WorkflowState {
    const def = this.workflows[workflow];
    const initialPhase = def.phases[0].name;
    return {
      workflow,
      sessionId,
      startedAt: new Date().toISOString(),
      currentPhase: initialPhase,
      phaseHistory: [{
        phase: initialPhase,
        enteredAt: new Date().toISOString(),
        exitedAt: null,
        deliverables: {},
      }],
      topic,
      approvalLevel: approvalLevel || def.defaultApproval,
      contextInjected: [],
    };
  }
}

export const workflowStateMachine = new WorkflowStateMachine();
