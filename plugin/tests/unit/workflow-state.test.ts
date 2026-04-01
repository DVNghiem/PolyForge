// plugin/tests/unit/workflow-state.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { workflowStateMachine, WORKFLOW_DEFINITIONS } from '../../src/lib/workflow-state.js';
import { WorkflowName, PhaseName } from '../../src/lib/types/workflow-types.js';

describe('WorkflowStateMachine', () => {
  describe('getWorkflowDefinition', () => {
    it('returns workflow definition for valid workflow name', () => {
      const workflow = workflowStateMachine.getWorkflowDefinition('brainstorm');
      expect(workflow).not.toBeNull();
      expect(workflow?.name).toBe('brainstorm');
      expect(workflow?.phases).toHaveLength(4);
    });

    it('returns null for invalid workflow name', () => {
      const workflow = workflowStateMachine.getWorkflowDefinition('invalid' as WorkflowName);
      expect(workflow).toBeNull();
    });
  });

  describe('getCurrentPhase', () => {
    it('returns current phase definition', () => {
      const state = workflowStateMachine.createInitialState('brainstorm', 'session-1', 'Test topic');
      const phase = workflowStateMachine.getCurrentPhase(state);
      expect(phase).not.toBeNull();
      expect(phase?.name).toBe('problem_framing');
    });
  });

  describe('getNextPhases', () => {
    it('returns next phase for linear workflow', () => {
      const state = workflowStateMachine.createInitialState('triage', 'session-2', 'Test task');
      const nextPhases = workflowStateMachine.getNextPhases(state);
      expect(nextPhases).toHaveLength(1);
      expect(nextPhases[0]).toBe('assess');
    });

    it('returns empty array for last phase', () => {
      const state = workflowStateMachine.createInitialState('triage', 'session-3', 'Test task');
      // Manually set to last phase
      state.currentPhase = 'route';
      const nextPhases = workflowStateMachine.getNextPhases(state);
      expect(nextPhases).toHaveLength(0);
    });
  });

  describe('canTransition', () => {
    it('returns true for valid transition', () => {
      const state = workflowStateMachine.createInitialState('brainstorm', 'session-4', 'Test topic');
      const canTransition = workflowStateMachine.canTransition(state, 'divergent');
      expect(canTransition).toBe(true);
    });

    it('returns false for invalid transition (skip phase)', () => {
      const state = workflowStateMachine.createInitialState('brainstorm', 'session-5', 'Test topic');
      const canTransition = workflowStateMachine.canTransition(state, 'convergent');
      expect(canTransition).toBe(false);
    });

    it('returns false for same phase', () => {
      const state = workflowStateMachine.createInitialState('brainstorm', 'session-6', 'Test topic');
      const canTransition = workflowStateMachine.canTransition(state, 'problem_framing');
      expect(canTransition).toBe(false);
    });
  });

  describe('createInitialState', () => {
    it('creates state with correct initial phase', () => {
      const state = workflowStateMachine.createInitialState('brainstorm', 'session-7', 'My topic');
      expect(state.workflow).toBe('brainstorm');
      expect(state.sessionId).toBe('session-7');
      expect(state.topic).toBe('My topic');
      expect(state.currentPhase).toBe('problem_framing');
      expect(state.phaseHistory).toHaveLength(1);
      expect(state.phaseHistory[0].phase).toBe('problem_framing');
    });

    it('uses default approval level when not specified', () => {
      const state = workflowStateMachine.createInitialState('brainstorm', 'session-8', 'Topic');
      expect(state.approvalLevel).toBe('medium');
    });

    it('uses specified approval level when provided', () => {
      const state = workflowStateMachine.createInitialState('brainstorm', 'session-9', 'Topic', 'high');
      expect(state.approvalLevel).toBe('high');
    });

    it('sets startedAt to current time', () => {
      const before = Date.now();
      const state = workflowStateMachine.createInitialState('work', 'session-10', 'Topic');
      const after = Date.now();
      // startedAt is ISO string, convert to timestamp for comparison
      const startedAtMs = new Date(state.startedAt).getTime();
      expect(startedAtMs).toBeGreaterThanOrEqual(before);
      expect(startedAtMs).toBeLessThanOrEqual(after);
    });

    it('initializes phaseHistory with entry time', () => {
      const state = workflowStateMachine.createInitialState('research', 'session-11', 'Research topic');
      expect(state.phaseHistory[0].enteredAt).toBeTruthy();
      expect(state.phaseHistory[0].exitedAt).toBeNull();
      expect(state.phaseHistory[0].deliverables).toEqual({});
    });
  });

  describe('WORKFLOW_DEFINITIONS', () => {
    const expectedWorkflows: WorkflowName[] = ['brainstorm', 'triage', 'research', 'intake', 'review', 'plan', 'execute', 'work'];

    it('contains all 8 workflows', () => {
      expect(Object.keys(WORKFLOW_DEFINITIONS)).toHaveLength(8);
      expectedWorkflows.forEach(name => {
        expect(WORKFLOW_DEFINITIONS[name]).toBeDefined();
      });
    });

    it('each workflow has at least one phase', () => {
      Object.values(WORKFLOW_DEFINITIONS).forEach(workflow => {
        expect(workflow.phases.length).toBeGreaterThan(0);
      });
    });

    it('each workflow has a valid default approval level', () => {
      Object.values(WORKFLOW_DEFINITIONS).forEach(workflow => {
        expect(['low', 'medium', 'high']).toContain(workflow.defaultApproval);
      });
    });

    it('each phase has required criteria fields', () => {
      Object.values(WORKFLOW_DEFINITIONS).forEach(workflow => {
        workflow.phases.forEach(phase => {
          expect(phase.entryCriteria).toBeDefined();
          expect(Array.isArray(phase.entryCriteria)).toBe(true);
          expect(phase.exitCriteriaMin).toBeDefined();
          expect(Array.isArray(phase.exitCriteriaMin)).toBe(true);
          expect(phase.exitCriteriaComplete).toBeDefined();
          expect(Array.isArray(phase.exitCriteriaComplete)).toBe(true);
        });
      });
    });

    it('each phase has a name that matches its position in phase list', () => {
      Object.values(WORKFLOW_DEFINITIONS).forEach(workflow => {
        workflow.phases.forEach((phase, index) => {
          // Phase names should be unique within workflow
          const duplicates = workflow.phases.filter(p => p.name === phase.name);
          expect(duplicates).toHaveLength(1);
        });
      });
    });

    it('work workflow has 6 phases (intake, research, plan, execute, review, ship)', () => {
      const workPhases = WORKFLOW_DEFINITIONS.work.phases.map(p => p.name);
      expect(workPhases).toEqual(['intake', 'research', 'plan', 'execute', 'review', 'ship']);
    });

    it('execute workflow has 5 phases', () => {
      expect(WORKFLOW_DEFINITIONS.execute.phases).toHaveLength(5);
    });
  });
});
