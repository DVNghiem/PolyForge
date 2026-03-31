# PolyForge Enhanced Workflow Engine + ACP Spawning

**Date:** 2026-03-31
**Status:** Draft
**Features:** Workflow Phase Enforcement, Direct ACP Agent Spawning

---

## Executive Summary

This spec adds two interconnected capabilities to PolyForge:

1. **Workflow Phase Enforcement** - Transforms workflow commands from context-injection-only to actual phase-tracked execution with configurable approval levels
2. **Direct ACP Agent Spawning** - Replaces instruction-returning tools with actual ACP client that spawns, monitors, and collects results from subagents

Both features share a common pattern: **tool interception with approval gates**, powered by a background WorkflowEngine service.

---

## Part 1: Workflow Phase Enforcement

### 1.1 Overview

Currently, workflow commands like `/brainstorm` inject workflow content and persona prompts into context, but the AI can skip phases, miss deliverables, or transition incorrectly. Phase enforcement makes workflows **state machines** with explicit entry/exit criteria and approval-gated transitions.

### 1.2 Workflow State Machine Architecture

Each workflow defines:
- **Phases** - Ordered states with entry criteria and exit criteria
- **Transitions** - Allowed phase-to-phase movements
- **Deliverables** - What must be produced before transitioning
- **Approval Level** - Configured per-workflow (default: Medium)

### 1.3 Phase Definitions by Workflow

#### brainstorm (default approval: Medium)

| Phase | Entry Criteria | Exit Criteria (min) | Exit Criteria (complete) |
|-------|---------------|---------------------|--------------------------|
| `problem_framing` | Topic provided | Problem statement + goal defined | + Constraints + stakeholders |
| `divergent` | problem_framing complete | ≥3 approaches documented | ≥3 approaches with implementation sketches |
| `convergent` | divergent complete | All approaches scored | + Comparison matrix + hybrid identified |
| `decision` | convergent complete | Recommendation + rationale | + Decision file written |

**Hard rules enforced:**
- Cannot skip divergent (minimum 3 approaches)
- No criticism during divergent
- All approaches require implementation sketches
- Decision must be captured to file

#### triage (default approval: Low)

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `classify` | Task description | Category assigned (quick/deep/research/review/apex) |
| `assess` | classify complete | Complexity tier determined |
| `route` | assess complete | Routing target determined |

**Note:** Low approval - service handles most transitions autonomously, only major routing decisions prompt for approval.

#### research (default approval: Medium)

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `scope` | Topic provided | Research questions defined |
| `investigate` | scope complete | All questions investigated (parallel subagents possible) |
| `synthesize` | investigate complete | Tech brief drafted |
| `present` | synthesize complete | Tech brief finalized |

#### intake (default approval: Low)

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `parse` | Raw description | Structured requirements extracted |
| `gap_analysis` | parse complete | Gaps identified |
| `research_trigger` | gap_analysis complete | Research tasks identified (spawns detached research if needed) |
| `plan_stub` | research_trigger complete | Draft plan skeleton created |
| `handoff` | plan_stub complete | Task brief JSON produced |

**Note:** Low approval - this is a parsing/routing flow, interruptions should be minimal.

#### review (default approval: Medium)

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `scope_review` | Target + scope defined | Review boundaries clear |
| `execute_review` | scope_review complete | Findings documented |
| `recommend` | execute_review complete | Recommendations prioritized |
| `signoff` | recommend complete | Review summary delivered |

#### plan (default approval: Medium)

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `context_gather` | Topic provided | Context collected |
| `decompose` | context_gather complete | Tasks identified (spawn nested agents for sub-plans if needed) |
| `gap_review` | decompose complete | Gaps addressed |
| `document` | gap_review complete | Plan file drafted |
| `approve` | document complete | Plan approved (high approval gate) |

**Note:** Approval level for `approve` phase should be elevated - this transitions to execution.

#### execute (default approval: Medium)

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `load_plan` | Plan file path | Plan loaded and parsed |
| `resolve_deps` | load_plan complete | Dependency graph resolved |
| `execute_batch` | resolve_deps complete | Batch completed + verified |
| `next_batch` | execute_batch complete | More batches? |
| `update_plan` | next_batch complete | Plan updated with progress |

**Note:** Spawns nested ACP agents for parallel task execution within batches.

#### work (default approval: Medium)

This is a meta-workflow orchestrating: intake → research → plan → execute → review → ship

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `intake` | Task description | Task brief produced |
| `research` | intake complete | Research brief produced |
| `plan` | research complete | Approved plan produced |
| `execute` | plan complete | All batches completed |
| `review` | execute complete | Review passed |
| `ship` | review complete | Deliverable shipped |

**Note:** Each phase transition uses the respective workflow's approval level. Final `ship` phase uses high approval.

### 1.4 Phase Transition Tool

The AI calls `pf_phase_transition` to request phase movement:

```typescript
interface PhaseTransitionParams {
  workflow: 'brainstorm' | 'triage' | 'research' | 'intake' | 'review' | 'plan' | 'execute' | 'work';
  target_phase: string;
  deliverables: Record<string, string>; // deliverable name → content/filepath
  reasoning: string; // why transition is valid
}
```

**Hook behavior:**
1. Intercepts `pf_phase_transition` tool call
2. Loads workflow state from checkpoint
3. Validates transition is allowed (from_phase → to_phase)
4. Checks deliverables against exit criteria
5. If approval level met or transition pre-approved:
   - Updates state to new phase
   - Injects next phase context + entry criteria
   - Persists checkpoint
6. If approval needed:
   - Returns approval request UI data (not block)
   - OpenCode responds with APPROVE/DENY
   - If approved, continues; if denied, returns denial reason

### 1.5 Approval Levels for Phase Transitions

| Level | Phase Transitions |
|-------|-----------------|
| **Low** | Only workflow → workflow transitions require approval (e.g., intake → research, plan → execute) |
| **Medium** | Low + first entry into any phase, any phase that spawns agents |
| **High** | Medium + any phase transition, deliverables review |

### 1.6 Checkpoint Persistence

Workflow state stored in `workspace/checkpoints/workflow-{workflow_id}-{session_id}.json`:

```json
{
  "workflow": "brainstorm",
  "session_id": "abc123",
  "started_at": "2026-03-31T10:00:00Z",
  "current_phase": "divergent",
  "phase_history": [
    { "phase": "problem_framing", "entered_at": "...", "exited_at": "...", "deliverables": {...} },
    { "phase": "divergent", "entered_at": "...", "exited_at": null, "deliverables": {...} }
  ],
  "topic": "choose actixweb or axum",
  "approval_level": "medium",
  "context_injected": ["..."]
}
```

---

## Part 2: Direct ACP Agent Spawning

### 2.1 Overview

Currently, `pf_spawn_acp` and `pf_delegate` return text instructions like "call `sessions_spawn` with these parameters." This replaces that with an actual ACP client that:
- Spawns agents directly via ACP API
- Supports nested (monitored) and detached (async) spawning
- Captures results and reports back
- Intercepts tool calls for approval

### 2.2 ACP Client Architecture

```typescript
class ACPClient {
  private api: PfPluginApi;
  private gatewayUrl: string;
  private authToken: string;

  async spawn(params: SpawnParams): Promise<SpawnResult>;
  async send(sessionId: string, message: string): Promise<void>;
  async getResult(sessionId: string): Promise<SessionResult>;
  async listActive(): Promise<SessionInfo[]>;
  async terminate(sessionId: string): Promise<void>;
}
```

**Spawn Parameters:**

```typescript
interface SpawnParams {
  agent_type: 'pf_sprint' | 'pf_forge' | 'pf_researcher' | 'pf_explorer' | 'pf_analyst' | 'pf_critic';
  task: string;
  spawn_mode: 'nested' | 'detached';
  parent_session?: string; // for nested - parent session to report to
  workspace_override?: string; // optional workspace for detached
  model_hint?: string; // prefer specific model tier
  max_iterations?: number; // iteration cap for detached
}
```

**Spawn Result:**

```typescript
interface SpawnResult {
  success: boolean;
  session_id: string;
  mode: 'nested' | 'detached';
  status: 'spawned' | 'queued' | 'error';
  error?: string;
  nested_parent_session?: string;
}
```

### 2.3 Nested vs Detached Spawning

| Mode | Description | Use Case | Monitoring |
|------|-------------|----------|-----------|
| **nested** | Agent runs in same session hierarchy, parent can intercept tools, monitor progress | Coordinated work like brainstorm approaches, plan decomposition | Real-time via tool call interception |
| **detached** | Independent session, no parent monitoring, reports on completion | Parallel research, long-running tasks, independent investigations | Via result polling or callback |

### 2.4 Tool Interception Flow for Spawning

When AI calls `pf_spawn_subagent`:

1. **Hook intercepts** the tool call before execution
2. **Checks approval level** for current workflow + phase
3. **If approved or below threshold:**
   - Executes ACP spawn via ACPClient
   - Returns spawn result (session_id, mode, status)
4. **If approval required:**
   - Returns approval request structured data:
     ```json
     {
       "approval_required": true,
       "action": "spawn_subagent",
       "mode": "nested|detached",
       "agent_type": "pf_sprint",
       "task": "Investigate approach A: pure async/await with Actix",
       "reasoning": "Parallel investigation of approaches",
       "approve_url": "openclaw://approve?session={id}",
       "deny_url": "openclaw://deny?session={id}"
     }
     ```
   - OpenCode displays prompt: "Spawn nested/detached ACP for [task]? [Approve] [Deny]"
   - On approve → execute spawn
   - On deny → return denial to AI

### 2.5 Result Collection

**Nested agents:** Results returned directly via tool call response, parent AI processes them.

**Detached agents:**
- On completion, agent calls `pf_detached_complete` tool with session_id + results
- Hook intercepts, persists to `workspace/checkpoints/detached-{session_id}.json`
- Parent workflow polls or waits for completion signal
- WorkflowEngine monitors detached sessions, triggers next phase when results available

**Result structure:**
```json
{
  "session_id": "detached-xyz",
  "workflow": "research",
  "phase": "investigate",
  "agent_type": "pf_researcher",
  "task": "Research Actix-web ecosystem",
  "status": "completed",
  "result": {
    "tech_brief": "...",
    "files_created": ["workspace/research/actix-ecosystem.md"],
    "sources": ["..."]
  },
  "completed_at": "2026-03-31T12:00:00Z"
}
```

---

## Part 3: Shared Components

### 3.1 WorkflowEngine Service

Background service that:
- Maintains workflow state machines
- Handles phase transition logic
- Manages ACP client lifecycle
- Persists checkpoints to filesystem
- Monitors detached agent completion

```typescript
class WorkflowEngine {
  private api: PfPluginApi;
  private workflows: Map<string, WorkflowState>;
  private acpClient: ACPClient;
  private checkpointDir: string;

  start(): void;
  stop(): void;
  getState(sessionId: string): WorkflowState | null;
  requestTransition(sessionId: string, targetPhase: string, deliverables: Deliverables): TransitionResult;
  spawnAgent(params: SpawnParams): SpawnResult;
  monitorDetached(sessionId: string): void;
}
```

### 3.2 ApprovalGates

Shared module for checking if an action requires approval:

```typescript
enum ApprovalLevel { LOW, MEDIUM, HIGH }

interface ApprovalContext {
  workflow: string;
  phase: string;
  action: 'phase_transition' | 'spawn_nested' | 'spawn_detached' | 'write_file' | 'execute_tool';
  metadata: Record<string, unknown>;
}

function requiresApproval(context: ApprovalContext, config: WorkflowConfig): boolean;
```

**Default approval matrix:**

| Action | Low | Medium | High |
|--------|-----|--------|------|
| Phase transition (within workflow) | No | No | Yes |
| Phase transition (workflow → workflow) | Yes | Yes | Yes |
| Spawn nested agent | No | Yes | Yes |
| Spawn detached agent | No | Yes | Yes |
| Write decision/plan file | Yes | Yes | Yes |
| Execute verification tool | No | No | Yes |

### 3.3 Hook Registration Order

```typescript
// Priority 90: Workflow commands (user message → workflow)
// Priority 85: Approval gate interceptor (blocks/approves tool calls, tracks pending approvals)
// Priority 80: Keyword detector
// Priority 75: Phase transition handler
// Priority 60: Todo enforcer
// Priority 50: Context injector (collects and prepends context)
```

**Note:** Approval gate at priority 85 intercepts before phase transition handler (75).

**Approval State Tracking:**
When approval is granted, the approval gate stores approval in a temporary pending store:
```typescript
// In-memory Map, TTL 5 minutes
pendingApprovals: Map<string, { approved_at: number, approved_by: 'user' }>
```

When the same tool call is re-submitted after approval:
1. Approval gate checks `pendingApprovals` for matching approval key
2. If found and not expired → executes without re-prompting
3. If not found → prompts for new approval

Approval key format: `${sessionId}:${toolName}:${hash(params)}`

---

## Part 4: Configuration

### 4.1 Plugin Config Additions

```json
{
  "workflow_phase_enforcement": {
    "enabled": true,
    "default_approval_level": "medium",
    "per_workflow_overrides": {
      "triage": "low",
      "intake": "low",
      "brainstorm": "medium",
      "research": "medium",
      "review": "medium",
      "plan": "medium",
      "execute": "medium",
      "work": "medium"
    }
  },
  "acp_spawning": {
    "enabled": true,
    "allow_detached_by_default": false,
    "max_concurrent_detached": 5,
    "detached_timeout_ms": 3600000
  }
}
```

### 4.2 OpenClaw Config

OpenClaw config (`~/.openclaw/openclaw.json`) may need:
- Gateway method exposure for ACP spawning
- Session management settings for nested/detached

---

## Part 5: File Structure Additions

```
plugin/src/
├── services/
│   └── workflow-engine.ts      # NEW: Main workflow orchestration service
├── hooks/
│   ├── workflow-commands.ts    # MODIFIED: Add state tracking
│   ├── phase-transition.ts      # NEW: Phase transition hook
│   ├── approval-gate.ts        # NEW: Tool call interception for approvals
│   └── detached-monitor.ts     # NEW: Monitor detached agent completions
├── lib/
│   ├── acp-client.ts           # NEW: ACP API client wrapper
│   ├── workflow-state.ts       # NEW: State machine definitions
│   ├── approval-gates.ts       # NEW: Approval level logic
│   └── phase-validator.ts      # NEW: Phase exit criteria validation
├── tools/
│   ├── phase-transition.ts     # NEW: pf_phase_transition tool
│   ├── spawn-subagent.ts       # NEW: pf_spawn_subagent tool
│   └── detached-complete.ts    # NEW: pf_detached_complete tool
└── workflows/
    └── [existing .md files unchanged]
```

---

## Part 6: Error Handling

### 6.1 Phase Transition Errors
- Invalid transition → return error with valid transitions
- Missing deliverables → return list of missing with criteria
- Checkpoint read/write failure → attempt recovery, fallback to last valid state

### 6.2 ACP Spawning Errors
- Gateway unreachable → retry with backoff, fail after 3 attempts
- Agent spawn rejected → return rejection reason
- Detached agent timeout → mark as timeout, trigger cleanup

### 6.3 Detached Agent Failures
- Agent crashes → mark session as failed, inject error context
- Agent produces invalid result → allow retry or manual review

---

## Part 7: Testing Strategy

### 7.1 Unit Tests
- Workflow state machine transitions
- Approval gate threshold logic
- Phase validator deliverable checking
- ACP client method mocking

### 7.2 Integration Tests
- Full brainstorm workflow with phase transitions
- Nested spawn with approval
- Detached spawn + completion + result retrieval
- Service restart with checkpoint recovery

### 7.3 Manual Testing
- `/brainstorm choose actixweb or axum` with Medium approval
- `/triage implement user auth` with Low approval
- `/work build REST API for task manager` with full pipeline

---

## Open Questions (resolved in this spec)

| Question | Resolution |
|----------|------------|
| Execution model | Background service drives, OpenCode approves significant actions |
| Approval granularity | Configurable per workflow, default Medium |
| Default approval level | Medium, with triage/intake at Low |
| Approval config scope | Per-workflow configurable |
| Approval communication | Tool call interception with structured approval request |
| Nested vs detached | Both modes, user chooses per-spawn via approval prompt |
| State persistence | Filesystem checkpoints in workspace/checkpoints/ |
| Which workflows | All 8 workflows (brainstorm, triage, research, intake, review, plan, execute, work) |

---

## Implementation Priority

1. **Phase 1:** Core workflow state machine + phase transition tool + checkpointing
2. **Phase 2:** ACP client + spawn tool + approval gate
3. **Phase 3:** Detached agent monitoring + result collection
4. **Phase 4:** Per-workflow approval level configuration
5. **Phase 5:** Full integration testing + documentation
