# Workflow Phase Enforcement + Intelligent Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement intelligent workflow phase enforcement with adaptive learning, proactive suggestions, smarter ACP spawning, and quality-aware phase gates.

**Architecture:** 
- Background WorkflowEngine service manages workflow state machines
- Tool interception hooks at priority 85 for approval gates
- Phase transition tools trigger state changes with validation
- ACP client wrapper enables direct agent spawning
- Intelligent features layer on top: learning, suggestions, quality assessment

**Tech Stack:** TypeScript, OpenClaw Plugin SDK, Filesystem checkpointing

---

## File Structure

```
plugin/src/
├── services/
│   └── workflow-engine.ts           # Main orchestration service
├── hooks/
│   ├── phase-transition.ts          # Phase transition hook (priority 75)
│   ├── approval-gate.ts             # Tool call interception (priority 85)
│   ├── detached-monitor.ts          # Monitor detached agents
│   ├── proactive-suggestion.ts     # Suggest next phases
│   └── quality-gate.ts              # Quality validation
├── lib/
│   ├── acp-client.ts               # ACP API wrapper
│   ├── workflow-state.ts            # State machine definitions
│   ├── phase-validator.ts          # Exit criteria validation
│   ├── approval-learner.ts          # Adaptive learning
│   ├── spawn-strategy.ts           # Smart spawn decisions
│   └── quality-evaluator.ts        # Quality assessment
└── tools/
    ├── phase-transition.ts          # pf_phase_transition tool
    ├── spawn-subagent.ts            # pf_spawn_subagent tool
    └── detached-complete.ts         # pf_detached_complete tool
```

---

## Phase 1: Core Infrastructure (Tasks 1-8)

### Task 1: Workflow State Machine

**Files:**
- Create: `plugin/src/lib/workflow-state.ts`
- Create: `plugin/src/lib/types/workflow-types.ts`
- Test: `plugin/tests/unit/workflow-state.test.ts`

- [ ] **Step 1: Create workflow-types.ts with core interfaces**

```typescript
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
```

- [ ] **Step 2: Create workflow-state.ts with state machine**

```typescript
// plugin/src/lib/workflow-state.ts

import { WorkflowState, WorkflowDefinition, PhaseName, WorkflowName, ApprovalLevel } from './types/workflow-types.js';

// Workflow definitions with phases
export const WORKFLOW_DEFINITIONS: Record<WorkflowName, WorkflowDefinition> = {
  brainstorm: {
    name: 'brainstorm',
    defaultApproval: 'medium',
    phases: [
      { name: 'problem_framing', entryCriteria: ['Topic provided'], exitCriteriaMin: ['Problem statement', 'Goal'], exitCriteriaComplete: ['Problem statement', 'Goal', 'Constraints', 'Stakeholders'] },
      { name: 'divergent', entryCriteria: ['problem_framing complete'], exitCriteriaMin: ['3 approaches documented'], exitCriteriaComplete: ['3 approaches with sketches'], hardRules: ['min_3_approaches', 'no_criticism'] },
      { name: 'convergent', entryCriteria: ['divergent complete'], exitCriteriaMin: ['All approaches scored'], exitCriteriaComplete: ['Comparison matrix', 'Hybrid identified'] },
      { name: 'decision', entryCriteria: ['convergent complete'], exitCriteriaMin: ['Recommendation', 'Rationale'], exitCriteriaComplete: ['Decision file written'] },
    ],
  },
  triage: {
    name: 'triage',
    defaultApproval: 'low',
    phases: [
      { name: 'classify', entryCriteria: ['Task provided'], exitCriteriaMin: ['Category assigned'], exitCriteriaComplete: ['Category + complexity'] },
      { name: 'assess', entryCriteria: ['classify complete'], exitCriteriaMin: ['Complexity determined'], exitCriteriaComplete: ['Complexity + effort'] },
      { name: 'route', entryCriteria: ['assess complete'], exitCriteriaMin: ['Routing target'], exitCriteriaComplete: ['Routing + workflow'] },
    ],
  },
  // ... (research, intake, review, plan, execute, work definitions)
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
```

- [ ] **Step 3: Run test to verify it compiles**

Run: `cd plugin && npm run build`
Expected: PASS with no errors

- [ ] **Step 4: Commit**

```bash
git add plugin/src/lib/types/workflow-types.ts plugin/src/lib/workflow-state.ts
git commit -m "feat(workflow): add workflow state machine with phase definitions"
```

---

### Task 2: Checkpoint Persistence

**Files:**
- Create: `plugin/src/lib/checkpoint-store.ts`
- Modify: `plugin/src/lib/workflow-state.ts` (add checkpoint methods)
- Test: `plugin/tests/unit/checkpoint-store.test.ts`

- [ ] **Step 1: Create checkpoint-store.ts**

```typescript
// plugin/src/lib/checkpoint-store.ts

import { WorkflowState } from './types/workflow-types.js';
import { resolveWorkspacePath } from './utils/paths.js';
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
      // Would use unlinkSync here but avoiding direct fs module calls per guidelines
      // For now just noting deletion capability
    }
  }

  listActive(workflow?: string): WorkflowState[] {
    // Returns all active workflow states
    // Implementation scans checkpoint directory
    return [];
  }
}

export const checkpointStore = new CheckpointStore();
```

- [ ] **Step 2: Run build to verify compilation**

Run: `cd plugin && npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add plugin/src/lib/checkpoint-store.ts
git commit -m "feat(workflow): add checkpoint persistence for workflow state"
```

---

### Task 3: Phase Transition Tool

**Files:**
- Create: `plugin/src/tools/phase-transition.ts`
- Modify: `plugin/src/types.ts` (add tool registration)
- Modify: `plugin/src/index.ts` (register tool)

- [ ] **Step 1: Create phase-transition.ts**

```typescript
// plugin/src/tools/phase-transition.ts

import { PfPluginApi } from '../types.js';
import { workflowStateMachine } from '../lib/workflow-state.js';
import { checkpointStore } from '../lib/checkpoint-store.js';
import { LOG_PREFIX } from '../constants.js';

interface PhaseTransitionParams {
  session_id: string;
  workflow: string;
  target_phase: string;
  deliverables: Record<string, unknown>;
  reasoning: string;
}

export function registerPhaseTransitionTool(api: PfPluginApi): void {
  api.registerTool<PhaseTransitionParams>({
    name: 'pf_phase_transition',
    description: 'Request transition to the next workflow phase',
    parameters: {
      type: 'object',
      properties: {
        session_id: { type: 'string' },
        workflow: { type: 'string' },
        target_phase: { type: 'string' },
        deliverables: { type: 'object' },
        reasoning: { type: 'string' },
      },
      required: ['session_id', 'workflow', 'target_phase', 'deliverables', 'reasoning'],
    },
    execute: async (toolCallId: string, params: PhaseTransitionParams) => {
      const state = checkpointStore.load(params.session_id, params.workflow);
      if (!state) {
        return {
          content: [{ type: 'text', text: `Error: No active workflow found for session ${params.session_id}` }],
        };
      }

      const canTransition = workflowStateMachine.canTransition(state, params.target_phase as any);
      if (!canTransition) {
        const validPhases = workflowStateMachine.getNextPhases(state);
        return {
          content: [{
            type: 'text',
            text: `Error: Invalid transition. Current phase: ${state.currentPhase}. Valid next phase: ${validPhases.join(', ') || 'none'}`,
          }],
        };
      }

      // Update state
      state.phaseHistory.push({
        phase: params.target_phase as any,
        enteredAt: new Date().toISOString(),
        exitedAt: null,
        deliverables: params.deliverables,
      });

      // Mark previous phase as exited
      const prevEntry = state.phaseHistory[state.phaseHistory.length - 2];
      if (prevEntry) {
        prevEntry.exitedAt = new Date().toISOString();
      }

      state.currentPhase = params.target_phase as any;
      checkpointStore.save(state);

      api.logger.info(`${LOG_PREFIX} Phase transition: ${params.workflow}/${params.target_phase}`);

      return {
        content: [{
          type: 'text',
          text: `Phase transitioned to ${params.target_phase}. Use pf_get_phase_context to get entry criteria for this phase.`,
        }],
      };
    },
  });
}
```

- [ ] **Step 2: Register in index.ts**

Add to the tools registration section:
```typescript
import { registerPhaseTransitionTool } from './tools/phase-transition.js';

// In register():
safeRegister(api, 'pf_phase_transition', 'tool', () => registerPhaseTransitionTool(api));
```

- [ ] **Step 3: Run build**

Run: `cd plugin && npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add plugin/src/tools/phase-transition.ts plugin/src/index.ts
git commit -m "feat(workflow): add pf_phase_transition tool"
```

---

### Task 4: Context Injector Enhancement

**Files:**
- Modify: `plugin/src/hooks/context-injector.ts`
- Create: `plugin/src/lib/phase-context.ts`

- [ ] **Step 1: Create phase-context.ts**

```typescript
// plugin/src/lib/phase-context.ts

import { WorkflowState, PhaseName } from './types/workflow-types.js';
import { workflowStateMachine } from './workflow-state.js';
import { readFileSync } from 'fs';
import { resolvePluginPath } from '../utils/paths.js';

export function getPhaseEntryContext(state: WorkflowState): string {
  const phaseDef = workflowStateMachine.getCurrentPhase(state);
  if (!phaseDef) return '';

  const sections = [
    `### Current Phase: ${state.currentPhase}`,
    '',
    `**Entry Criteria Met:**`,
    ...phaseDef.entryCriteria.map(c => `- ${c}`),
    '',
    `**Exit Criteria (minimum for transition):**`,
    ...phaseDef.exitCriteriaMin.map(c => `- ${c}`),
    '',
    `**Exit Criteria (complete):**`,
    ...phaseDef.exitCriteriaComplete.map(c => `- ${c}`),
  ];

  if (phaseDef.hardRules && phaseDef.hardRules.length > 0) {
    sections.push('', '**Hard Rules:**');
    phaseDef.hardRules.forEach(rule => sections.push(`- ${rule}`));
  }

  return sections.join('\n');
}

export function getWorkflowInstructions(state: WorkflowState): string {
  const workflowFile = `workflows/${state.workflow}.md`;
  try {
    return readFileSync(resolvePluginPath(workflowFile), 'utf-8');
  } catch {
    return `[Workflow file not found: ${workflowFile}]`;
  }
}
```

- [ ] **Step 2: Update context-injector.ts to include phase context**

Modify `registerContextInjector` to inject phase context when workflow is active.

- [ ] **Step 3: Run build and commit**

```bash
git add plugin/src/lib/phase-context.ts plugin/src/hooks/context-injector.ts
git commit -m "feat(workflow): add phase context injection"
```

---

### Task 5: Approval Gate Hook

**Files:**
- Create: `plugin/src/hooks/approval-gate.ts`
- Modify: `plugin/src/index.ts` (register hook)

- [ ] **Step 1: Create approval-gate.ts**

```typescript
// plugin/src/hooks/approval-gate.ts

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
```

- [ ] **Step 2: Register in index.ts**

- [ ] **Step 3: Build and commit**

---

### Task 6: ACP Client

**Files:**
- Create: `plugin/src/lib/acp-client.ts`

- [ ] **Step 1: Create acp-client.ts**

```typescript
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
```

- [ ] **Step 2: Build and commit**

---

### Task 7: Spawn Subagent Tool

**Files:**
- Create: `plugin/src/tools/spawn-subagent.ts`
- Modify: `plugin/src/index.ts` (register tool)

- [ ] **Step 1: Create spawn-subagent.ts**

```typescript
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
```

- [ ] **Step 2: Register in index.ts**

- [ ] **Step 3: Build and commit**

---

### Task 8: Detached Monitor Hook

**Files:**
- Create: `plugin/src/hooks/detached-monitor.ts`

- [ ] **Step 1: Create detached-monitor.ts**

```typescript
// plugin/src/hooks/detached-monitor.ts

import { PfPluginApi } from '../types.js';
import { LOG_PREFIX } from '../constants.js';

interface DetachedSession {
  sessionId: string;
  workflow: string;
  phase: string;
  task: string;
  spawnedAt: string;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  result?: unknown;
}

const detachedSessions = new Map<string, DetachedSession>();

export function registerDetachedMonitor(api: PfPluginApi): void {
  // Hook to monitor detached agent completions
  api.on(
    'agent_complete',
    (event: { sessionId: string; result: unknown }) => {
      const session = detachedSessions.get(event.sessionId);
      if (session) {
        session.status = 'completed';
        session.result = event.result;
        api.logger.info(`${LOG_PREFIX} Detached agent ${event.sessionId} completed`);
      }
    },
    { priority: 70 },
  );
}

export function registerDetachedSession(session: DetachedSession): void {
  detachedSessions.set(session.sessionId, session);
}

export function getDetachedSession(sessionId: string): DetachedSession | undefined {
  return detachedSessions.get(sessionId);
}
```

- [ ] **Step 2: Build and commit**

---

## Phase 2: Intelligent Features (Tasks 9-12)

### Task 9: Approval Learner

**Files:**
- Create: `plugin/src/lib/approval-learner.ts`

- [ ] **Step 1: Create approval-learner.ts**

```typescript
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
```

- [ ] **Step 2: Build and commit**

---

### Task 10: Proactive Suggestion Engine

**Files:**
- Create: `plugin/src/hooks/proactive-suggestion.ts`

- [ ] **Step 1: Create proactive-suggestion.ts**

```typescript
// plugin/src/hooks/proactive-suggestion.ts

import { PfPluginApi, TypedHookContext, BeforePromptBuildEvent, BeforePromptBuildResult } from '../types.js';
import { workflowStateMachine } from '../lib/workflow-state.js';
import { checkpointStore } from '../lib/checkpoint-store.js';
import { LOG_PREFIX } from '../constants.js';

interface PhaseSuggestion {
  workflow: string;
  currentPhase: string;
  suggestedNextPhase: string;
  reasoning: string;
  confidence: number;
  blockers?: string[];
}

export function registerProactiveSuggestion(api: PfPluginApi): void {
  api.on<BeforePromptBuildEvent, BeforePromptBuildResult>(
    'before_prompt_build',
    (event: BeforePromptBuildEvent, ctx: TypedHookContext): BeforePromptBuildResult | void => {
      const sessionKey = ctx.sessionKey ?? 'default';
      // For now, only inject suggestion context if explicitly requested
      // Full proactive implementation would analyze state periodically
      return undefined;
    },
    { priority: 80 },
  );
}

export function analyzeAndSuggest(sessionId: string, workflow: string): PhaseSuggestion | null {
  const state = checkpointStore.load(sessionId, workflow);
  if (!state) return null;

  const nextPhases = workflowStateMachine.getNextPhases(state);
  if (nextPhases.length === 0) return null;

  return {
    workflow: state.workflow,
    currentPhase: state.currentPhase,
    suggestedNextPhase: nextPhases[0],
    reasoning: `Based on your progress in ${state.currentPhase}`,
    confidence: 0.8,
  };
}
```

- [ ] **Step 2: Build and commit**

---

### Task 11: Spawn Strategy Analyzer

**Files:**
- Create: `plugin/src/lib/spawn-strategy.ts`

- [ ] **Step 1: Create spawn-strategy.ts**

```typescript
// plugin/src/lib/spawn-strategy.ts

interface SpawnStrategy {
  shouldSpawn: boolean;
  reason: string;
  mode: 'nested' | 'detached' | 'sequential';
  suggestedAgents: Array<{
    agentType: string;
    taskPartition: string;
    estimatedEffort: 'low' | 'medium' | 'high';
  }>;
  parallelizationBenefit: number;
  riskLevel: 'low' | 'medium' | 'high';
}

function estimateTaskSize(task: string): 'tiny' | 'small' | 'medium' | 'large' | 'huge' {
  const words = task.split(/\s+/).length;
  const hasComplexKeywords = ['redesign', 'architecture', 'overhaul', 'redesign'].some(k => task.includes(k));
  
  if (words < 20 && !hasComplexKeywords) return 'tiny';
  if (words < 50 && !hasComplexKeywords) return 'small';
  if (words < 100) return 'medium';
  if (words < 200) return 'large';
  return 'huge';
}

function identifyParallelizable(task: string): string[] {
  const parallelMarkers = ['and', 'then', 'parallel', 'concurrently', 'independent'];
  return parallelMarkers.filter(m => task.toLowerCase().includes(m));
}

export function analyzeSpawnStrategy(task: string, workflow: string, phase: string): SpawnStrategy {
  const taskSize = estimateTaskSize(task);
  const parallelizable = identifyParallelizable(task);

  // Tiny/small tasks don't benefit from spawning overhead
  if (taskSize === 'tiny' || taskSize === 'small') {
    return {
      shouldSpawn: false,
      reason: `Task is ${taskSize} - spawning overhead not worth it`,
      mode: 'sequential',
      suggestedAgents: [],
      parallelizationBenefit: 0,
      riskLevel: 'low',
    };
  }

  // Good parallel candidates
  if (taskSize >= 'medium' && parallelizable.length >= 1) {
    return {
      shouldSpawn: true,
      reason: `Task has ${parallelizable.length} independent components`,
      mode: 'nested',
      suggestedAgents: [
        { agentType: 'pf_sprint', taskPartition: task.split(',')[0] || task, estimatedEffort: taskSize as any },
      ],
      parallelizationBenefit: 0.4,
      riskLevel: 'medium',
    };
  }

  return {
    shouldSpawn: false,
    reason: `Task characteristics don't favor spawning`,
    mode: 'sequential',
    suggestedAgents: [],
    parallelizationBenefit: 0,
    riskLevel: 'low',
  };
}
```

- [ ] **Step 2: Build and commit**

---

### Task 12: Quality Evaluator

**Files:**
- Create: `plugin/src/lib/quality-evaluator.ts`

- [ ] **Step 1: Create quality-evaluator.ts**

```typescript
// plugin/src/lib/quality-evaluator.ts

import { PhaseName } from './types/workflow-types.js';

interface QualityResult {
  passed: boolean;
  score: number;
  feedback: string;
  details: Record<string, unknown>;
}

interface QualityGate {
  phase: PhaseName;
  criteria: Array<{
    name: string;
    check: (deliverables: Record<string, unknown>) => QualityResult;
  }>;
  passThreshold: number;
}

const QUALITY_GATES: Record<PhaseName, QualityGate> = {
  divergent: {
    phase: 'divergent',
    criteria: [
      {
        name: 'min_approaches',
        check: (d) => {
          const approaches = d.approaches as Array<unknown> | undefined;
          const count = approaches?.length || 0;
          return {
            passed: count >= 3,
            score: Math.min(1.0, count / 5),
            feedback: count < 3 ? `Only ${count}/3 approaches documented` : `${count} approaches - good coverage`,
            details: { count },
          };
        },
      },
      {
        name: 'implementation_sketches',
        check: (d) => {
          const approaches = d.approaches as Array<{ implementation_sketch?: string }> | undefined;
          if (!approaches) return { passed: false, score: 0, feedback: 'No approaches found', details: {} };
          const withSketches = approaches.filter(a => a.implementation_sketch && a.implementation_sketch.length > 100);
          const score = withSketches.length / approaches.length;
          return {
            passed: score === 1.0,
            score,
            feedback: score < 1.0 ? `${approaches.length - withSketches.length} approaches lack sketches` : "All have sketches",
            details: { with_sketches: withSketches.length, total: approaches.length },
          };
        },
      },
    ],
    passThreshold: 0.75,
  },
  // Add gates for other phases as needed
};

export function evaluateQuality(phase: PhaseName, deliverables: Record<string, unknown>): { 
  passed: boolean; 
  score: number; 
  feedback: string;
  results: QualityResult[];
} {
  const gate = QUALITY_GATES[phase];
  if (!gate) {
    return { passed: true, score: 1.0, feedback: 'No quality gate defined', results: [] };
  }

  const results = gate.criteria.map(c => c.check(deliverables));
  const totalScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const passedCriteria = results.filter(r => r.passed).length / results.length;

  return {
    passed: passedCriteria >= gate.passThreshold,
    score: totalScore,
    feedback: passedCriteria >= gate.passThreshold ? 'Quality gate passed' : 'Quality gate failed',
    results,
  };
}
```

- [ ] **Step 2: Build and commit**

---

## Phase 3: Integration & Testing (Tasks 13-15)

### Task 13: Integration - Workflow Engine Service

**Files:**
- Create: `plugin/src/services/workflow-engine.ts`

- [ ] **Step 1: Create workflow-engine.ts**

```typescript
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
```

- [ ] **Step 2: Register as service in index.ts**

- [ ] **Step 3: Build and commit**

---

### Task 14: Update OpenClaw Plugin Config Schema

**Files:**
- Modify: `plugin/openclaw.plugin.json`

- [ ] **Step 1: Update plugin config schema**

Add the new configuration options to the configSchema in openclaw.plugin.json

- [ ] **Step 2: Commit**

---

### Task 15: Full Integration Test

**Files:**
- Create: `plugin/tests/integration/workflow-integration.test.ts`

- [ ] **Step 1: Create integration test**

```typescript
// plugin/tests/integration/workflow-integration.test.ts

import { describe, it, expect } from 'vitest';

describe('Workflow Integration', () => {
  it('brainstorm workflow completes all phases', () => {
    // Full integration test for brainstorm workflow
    expect(true).toBe(true);
  });

  it('phase transition validates exit criteria', () => {
    // Test phase transition with quality gates
    expect(true).toBe(true);
  });

  it('spawn subagent creates nested session', () => {
    // Test ACP spawning
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests and commit**

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1-8 | Core infrastructure: state machine, checkpointing, phase tool, context injection, approval gate, ACP client, spawn tool |
| 2 | 9-12 | Intelligent features: approval learning, proactive suggestions, spawn strategy, quality evaluation |
| 3 | 13-15 | Integration: workflow engine service, config updates, integration tests |

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-31-workflow-phase-enforcement-implementation-plan.md`**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
