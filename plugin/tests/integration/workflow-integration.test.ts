// plugin/tests/integration/workflow-integration.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowStateMachine } from '../../src/lib/workflow-state.js';
import { CheckpointStore } from '../../src/lib/checkpoint-store.js';
import { WorkflowName } from '../../src/lib/types/workflow-types.js';

describe('Workflow Integration', () => {
  let stateMachine: WorkflowStateMachine;
  let checkpointStore: CheckpointStore;

  beforeEach(() => {
    stateMachine = new WorkflowStateMachine();
    checkpointStore = new CheckpointStore('/tmp/test-checkpoints');
  });

  it('brainstorm workflow completes all phases', () => {
    // Test that brainstorm workflow can transition through all phases
    const state = stateMachine.createInitialState('brainstorm', 'test-session', 'test topic');
    
    expect(state.currentPhase).toBe('problem_framing');
    
    // Simulate completing problem_framing and transitioning to divergent
    const canTransitionToDivergent = stateMachine.canTransition(state, 'divergent');
    expect(canTransitionToDivergent).toBe(true);
  });

  it('phase transition validates correctly', () => {
    const state = stateMachine.createInitialState('brainstorm', 'test-session', 'test topic');
    
    // Cannot skip to convergent
    const canSkipToConvergent = stateMachine.canTransition(state, 'convergent');
    expect(canSkipToConvergent).toBe(false);
    
    // Can transition to divergent
    const canTransitionToDivergent = stateMachine.canTransition(state, 'divergent');
    expect(canTransitionToDivergent).toBe(true);
  });

  it('checkpoint persistence works', () => {
    const state = stateMachine.createInitialState('brainstorm', 'persist-test', 'persistence test');
    checkpointStore.save(state);
    
    const loaded = checkpointStore.load('persist-test', 'brainstorm');
    expect(loaded).not.toBeNull();
    expect(loaded?.currentPhase).toBe('problem_framing');
    expect(loaded?.topic).toBe('persistence test');
  });

  it('execute workflow supports nested spawning phases', () => {
    const state = stateMachine.createInitialState('execute', 'exec-test', 'execute plan');
    expect(state.currentPhase).toBe('load_plan');
    
    const nextPhases = stateMachine.getNextPhases(state);
    expect(nextPhases).toContain('resolve_deps');
  });

  it('work workflow is a meta-workflow with full pipeline', () => {
    const state = stateMachine.createInitialState('work', 'work-test', 'full engineering pipeline');
    expect(state.currentPhase).toBe('intake');
    
    const nextPhases = stateMachine.getNextPhases(state);
    expect(nextPhases).toContain('research');
  });
});
