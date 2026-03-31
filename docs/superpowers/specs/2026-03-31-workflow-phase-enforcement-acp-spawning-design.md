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
| `investigate` | scope complete | All questions investigated (spawn detached researchers for parallel deep-dive optional) |
| `synthesize` | investigate complete | Tech brief drafted |
| `present` | synthesize complete | Tech brief finalized |

**ACP spawning note:** Research is primarily analytical - ACP spawning is optional and rare. If deep technical investigation is needed, a detached `pf_researcher` may spawn, but most research is done by the main agent directly.

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
| `execute_review` | scope_review complete | Findings documented (spawn nested `pf_critic` for code review if needed) |
| `recommend` | execute_review complete | Recommendations prioritized |
| `signoff` | recommend complete | Review summary delivered |

**ACP spawning note:** Review is primarily analytical. Nested `pf_critic` spawning is available for code review tasks, but the main agent can handle most review work directly.

#### plan (default approval: Medium)

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `context_gather` | Topic provided | Context collected |
| `decompose` | context_gather complete | Tasks identified (spawn nested `pf_sprint` or `pf_forge` for sub-plan estimation if needed) |
| `gap_review` | decompose complete | Gaps addressed |
| `document` | gap_review complete | Plan file drafted |
| `approve` | document complete | Plan approved (high approval gate) |

**ACP spawning note:** Planning is primarily analytical - spawning is for task estimation/effort analysis only. Most planning is done by the main agent.

**Note:** Approval level for `approve` phase should be elevated - this transitions to execution.

#### execute (default approval: Medium)

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `load_plan` | Plan file path | Plan loaded and parsed |
| `resolve_deps` | load_plan complete | Dependency graph resolved |
| `execute_batch` | resolve_deps complete | Batch completed + verified (spawn nested `pf_sprint`/`pf_forge` for parallel coding tasks) |
| `next_batch` | execute_batch complete | More batches? |
| `update_plan` | next_batch complete | Plan updated with progress |

**ACP spawning note:** Execute is the **primary use case** for ACP spawning. This is where coding happens. The main agent orchestrates, spawning nested `pf_sprint` (bounded tasks) or `pf_forge` (complex tasks) agents to implement code in parallel batches. Results are collected and verified before moving to the next batch.

#### work (default approval: Medium)

This is a meta-workflow orchestrating: intake → research → plan → execute → review → ship

| Phase | Entry Criteria | Exit Criteria |
|-------|---------------|---------------|
| `intake` | Task description | Task brief produced |
| `research` | intake complete | Research brief produced |
| `plan` | research complete | Approved plan produced |
| `execute` | plan complete | All batches completed (ACP spawning primary here) |
| `review` | execute complete | Review passed |
| `ship` | review complete | Deliverable shipped |

**Note:** Each phase transition uses the respective workflow's approval level. Final `ship` phase uses high approval.

**ACP spawning note:** ACP is used sparingly in work until the `execute` phase. Research, plan, review are primarily analytical. Only execute involves significant parallel coding via ACP agents.

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

**When is ACP spawning used?**
ACP (Agent Communication Protocol) spawning is for **coding tasks** - when actual code needs to be written, tested, or debugged. For purely analytical workflows (brainstorm, triage, research, intake, plan, review), the main agent handles most work directly.

**Primary use case: `execute` and `work` workflows** - These involve actual implementation where parallel coding agents can accelerate delivery.

**Available but secondary:** Code review (`pf_critic`), research deep-dive (`pf_researcher`), task estimation (`pf_sprint`/`pf_forge` for plan decomposition).

**What it replaces:**
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
| **nested** | Agent runs in same session hierarchy, parent can intercept tools, monitor progress | Parallel coding tasks within execute batch - parent orchestrates and can approve/block | Real-time via tool call interception |
| **detached** | Independent session, no parent monitoring, reports on completion | Long-running research, independent investigations, fire-and-forget tasks | Via result polling or completion callback |

**When to use each:**
- **Nested** (most common in execute): When you want visibility into what the subagent is doing, need approval gates for their actions, or want to coordinate multiple subagents
- **Detached** (rare): When the task is truly independent and long-running (e.g., deep research on a library, large refactoring that will take time)

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

## Part 4: Intelligent Workflow Features

The system becomes an intelligent workflow partner, not just a passive state machine. These features enable adaptive, proactive, and quality-aware workflow execution.

### 4.1 Adaptive Approval Learning

The system learns from your approval/denial patterns to reduce interruptions over time.

**Learning Mechanism:**
```typescript
interface ApprovalPattern {
  tool_name: string;
  workflow?: string;
  phase?: string;
  context_hash: string; // hash of task characteristics
  approval_rate: number; // 0.0 - 1.0
  total_decisions: number;
  last_evaluated: number;
}

class ApprovalLearner {
  private patterns: Map<string, ApprovalPattern>;

  // Called when user approves a tool call
  recordApproval(tool: string, workflow: string, phase: string, context: Record<string, unknown>): void;

  // Called when user denies a tool call
  recordDenial(tool: string, workflow: string, phase: string, context: Record<string, unknown>): void;

  // Returns predicted approval probability for a given context
  predictApproval(tool: string, workflow: string, phase: string, context: Record<string, unknown>): number;

  // Auto-approve if confidence is high enough (e.g., >90% approval rate over 5+ decisions)
  shouldAutoApprove(tool: string, workflow: string, phase: string, context: Record<string, unknown>): boolean;
}
```

**Context characteristics that influence learning:**
- Task complexity (estimated from description length, keywords)
- Current phase (some phases have higher denial rates)
- Time of day / session patterns
- Agent type being spawned
- Spawn mode (nested vs detached)

**Storage:** Approval patterns stored in `workspace/checkpoints/approval-patterns.json`

**Example behavior:**
- After 5+ nested spawn approvals in execute phase with high-confidence tasks, system auto-approves future nested spawns for similar tasks
- If user consistently denies detached spawns, system stops suggesting them
- System learns that "implement CRUD endpoints" is low-complexity and auto-approves, while "redesign authentication system" always prompts

### 4.2 Proactive Phase Suggestions

Instead of waiting for the AI to request a transition, the system proactively analyzes state and suggests next steps.

**Suggestion Engine:**
```typescript
interface PhaseSuggestion {
  workflow: string;
  current_phase: string;
  suggested_next_phase: string;
  reasoning: string;
  confidence: number; // 0.0 - 1.0
  blockers?: string[]; // if not ready to transition
  suggested_deliverables?: Record<string, string>;
}

class ProactiveSuggestionEngine {
  // Called periodically during workflow execution
  analyzeAndSuggest(sessionId: string): PhaseSuggestion | null;

  // Check if phase exit criteria are met
  evaluatePhaseCompletion(workflow: string, phase: string, deliverables: Deliverables): {
    complete: boolean;
    missing: string[];
    quality_score?: number;
  };
}
```

**Suggestion triggers:**
- After significant产出 (e.g., 3 approaches documented in divergent)
- When AI has been in a phase for extended time without progress
- When pending deliverables match exit criteria
- Before the AI explicitly requests transition

**Context injection format:**
```
[POLYFORGE SUGGESTION]
Your current phase: divergent (brainstorm)
Progress: 3 approaches documented
Suggestion: Ready to transition to convergent evaluation?
Reasoning: All approaches have implementation sketches and complexity ratings

If you agree, call: pf_phase_transition { target_phase: "convergent", deliverables: {...} }

Alternatively, if you need more work in divergent, continue and I'll update when ready.
```

**Behavior:**
- Suggestions are informational, not blocking
- AI can accept (call transition tool) or ignore (continue working)
- If ignored repeatedly, system waits longer before suggesting again

### 4.3 Smarter ACP Spawning Decisions

The system analyzes tasks and recommends optimal spawn strategies, including whether to spawn at all.

**Task Analysis:**
```typescript
interface SpawnStrategy {
  should_spawn: boolean;
  reason: string;
  mode: 'nested' | 'detached' | 'sequential';
  suggested_agents: Array<{
    agent_type: string;
    task_partition: string;
    estimated_effort: 'low' | 'medium' | 'high';
  }>;
  parallelization_benefit: number; // estimated speedup vs sequential
  risk_level: 'low' | 'medium' | 'high';
}

class SpawnStrategyAnalyzer {
  analyzeTask(task: string, workflow: string, phase: string): SpawnStrategy;

  // Decompose a task into spawnable subtasks
  decomposeForParallelism(task: string): string[];

  // Estimate if spawn overhead is worth the parallelism benefit
  calculateSpawnOverhead(task_size: 'tiny' | 'small' | 'medium' | 'large' | 'huge'): number;
}
```

**Decision logic:**
```typescript
// Example decision tree
function decideSpawnStrategy(task: string, workflow: string, phase: string): SpawnStrategy {
  const task_size = estimateTaskSize(task);
  const independence = assessTaskIndependence(task);
  const parallelizable = identifyParallelizableComponents(task);

  if (task_size === 'tiny' || task_size === 'small') {
    // Small tasks don't benefit from spawning overhead
    return { should_spawn: false, reason: "Task too small for parallelization benefit", ... };
  }

  if (independence === 'high' && parallelizable.length >= 2) {
    // Good candidate for nested parallel spawns
    return {
      should_spawn: true,
      mode: 'nested',
      suggested_agents: partitionTask(task, parallelizable),
      parallelization_benefit: calculateSpeedup(parallelizable.length),
      risk_level: 'low'
    };
  }

  if (independence === 'high' && task_size === 'large' && workflow === 'research') {
    // Large research tasks can use detached
    return { should_spawn: true, mode: 'detached', ... };
  }

  return { should_spawn: false, reason: "Task characteristics don't favor spawning", ... };
}
```

**Approval prompt enhancement:**
When approval is needed, instead of just "Spawn nested ACP for X?", the system provides intelligence:

```
[ACP SPAWN RECOMMENDATION]
Task: "Implement user authentication with JWT"
Recommended strategy: Nested parallel (2 agents)
- Agent 1 (pf_sprint): User registration + login endpoints
- Agent 2 (pf_sprint): JWT middleware + auth guards
Parallelization benefit: ~40% faster than sequential
Risk: Low (well-defined bounded tasks)

Spawn nested ACP with 2 agents? [Approve] [Modify] [Deny]
```

User can approve as-is, or click "Modify" to adjust the spawn strategy.

### 4.4 Quality-Aware Phase Gates

Phase exit criteria enforce not just quantity but quality of deliverables.

**Quality Assessment:**
```typescript
interface QualityGate {
  phase: string;
  criteria: QualityCriterion[];
  pass_threshold: number;
}

interface QualityCriterion {
  name: string;
  check: (deliverables: Deliverables) => QualityResult;
}

interface QualityResult {
  passed: boolean;
  score: number; // 0.0 - 1.0
  feedback: string; // specific improvement suggestions
  details: Record<string, unknown>;
}

// Example quality gates for brainstorm divergent phase
const divergentQualityGates: QualityGate = {
  phase: 'divergent',
  criteria: [
    {
      name: 'min_approaches',
      check: (d) => ({
        passed: d.approaches.length >= 3,
        score: Math.min(1.0, d.approaches.length / 5),
        feedback: d.approaches.length < 3 
          ? `Only ${d.approaches.length}/3 approaches documented`
          : `${d.approaches.length} approaches - good coverage`,
        details: { count: d.approaches.length }
      })
    },
    {
      name: 'implementation_sketches',
      check: (d) => {
        const withSketches = d.approaches.filter(a => a.implementation_sketch && a.implementation_sketch.length > 100);
        const score = withSketches.length / d.approaches.length;
        return {
          passed: score === 1.0,
          score,
          feedback: score < 1.0 
            ? `${d.approaches.length - withSketches.length} approaches lack implementation sketches`
            : "All approaches have implementation sketches",
          details: { with_sketches: withSketches.length, total: d.approaches.length }
        };
      }
    },
    {
      name: 'complexity_ratings',
      check: (d) => {
        const rated = d.approaches.filter(a => a.complexity && ['Low', 'Medium', 'High'].includes(a.complexity));
        const score = rated.length / d.approaches.length;
        return {
          passed: score === 1.0,
          score,
          feedback: score < 1.0
            ? `${d.approaches.length - rated.length} approaches missing complexity ratings`
            : "All approaches have complexity ratings",
          details: { rated: rated.length, total: d.approaches.length }
        };
      }
    },
    {
      name: 'no_criticism_in_divergent',
      check: (d) => {
        // Check that no approach has critical/negative language
        const hasCriticism = d.approaches.some(a => 
          a.summary && (a.summary.includes('bad') || a.summary.includes('wrong') || a.summary.includes('avoid'))
        );
        return {
          passed: !hasCriticism,
          score: hasCriticism ? 0.0 : 1.0,
          feedback: hasCriticism
            ? "Divergent phase should have no criticism - save evaluations for convergent"
            : "No criticism detected - divergent phase clean",
          details: {}
        };
      }
    }
  ],
  pass_threshold: 0.75 // must pass at least 75% of criteria
};
```

**Quality gate flow:**
1. AI requests phase transition
2. System validates deliverable quantity (e.g., ≥3 approaches)
3. System evaluates deliverable quality via quality gates
4. If quality insufficient:
   - Return detailed feedback on what's missing
   - Suggest specific improvements
   - Block transition until improvements made
5. If quality sufficient but not exceptional:
   - Allow transition with advisory notes
   - "Consider adding more detail to approach B's sketch before finalizing"

**Enforcement levels:**
- **Strict**: Must pass all criteria (100%)
- **Moderate**: Must pass threshold (default 75%)
- **Lenient**: Quantity check only, quality suggestions advisory

Configurable per workflow/phase.

---

## Part 6: Configuration

### 6.1 Plugin Config Additions

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
  },
  "intelligent_features": {
    "adaptive_learning": {
      "enabled": true,
      "min_samples_for_auto_approve": 5,
      "auto_approve_threshold": 0.9
    },
    "proactive_suggestions": {
      "enabled": true,
      "suggestion_interval_ms": 30000
    },
    "quality_gates": {
      "enabled": true,
      "enforcement_level": "moderate", // strict | moderate | lenient
      "default_threshold": 0.75
    }
  }
}
```

### 6.2 OpenClaw Config

OpenClaw config (`~/.openclaw/openclaw.json`) may need:
- Gateway method exposure for ACP spawning
- Session management settings for nested/detached

---

## Part 7: File Structure Additions

```
plugin/src/
├── services/
│   └── workflow-engine.ts      # Main workflow orchestration service
├── hooks/
│   ├── workflow-commands.ts    # MODIFIED: Add state tracking
│   ├── phase-transition.ts      # Phase transition hook
│   ├── approval-gate.ts        # Tool call interception for approvals
│   ├── detached-monitor.ts     # Monitor detached agent completions
│   ├── proactive-suggestion.ts  # NEW: Proactive phase suggestions
│   └── quality-gate.ts         # NEW: Quality-aware phase gates
├── lib/
│   ├── acp-client.ts           # ACP API client wrapper
│   ├── workflow-state.ts       # State machine definitions
│   ├── approval-gates.ts       # Approval level logic
│   ├── phase-validator.ts      # Phase exit criteria validation
│   ├── approval-learner.ts     # NEW: Adaptive approval learning
│   ├── spawn-strategy.ts       # NEW: Smarter ACP spawning decisions
│   └── quality-evaluator.ts    # NEW: Quality assessment for gates
├── tools/
│   ├── phase-transition.ts     # pf_phase_transition tool
│   ├── spawn-subagent.ts       # pf_spawn_subagent tool
│   └── detached-complete.ts    # pf_detached_complete tool
└── workflows/
    └── [existing .md files unchanged]
```

---

## Part 8: Error Handling

### 8.1 Phase Transition Errors
- Invalid transition → return error with valid transitions
- Missing deliverables → return list of missing with criteria
- Checkpoint read/write failure → attempt recovery, fallback to last valid state

### 8.2 ACP Spawning Errors
- Gateway unreachable → retry with backoff, fail after 3 attempts
- Agent spawn rejected → return rejection reason
- Detached agent timeout → mark as timeout, trigger cleanup

### 8.3 Detached Agent Failures
- Agent crashes → mark session as failed, inject error context
- Agent produces invalid result → allow retry or manual review

---

## Part 9: Testing Strategy

### 9.1 Unit Tests
- Workflow state machine transitions
- Approval gate threshold logic
- Phase validator deliverable checking
- ACP client method mocking

### 9.2 Integration Tests
- Full brainstorm workflow with phase transitions
- Nested spawn with approval
- Detached spawn + completion + result retrieval
- Service restart with checkpoint recovery

### 9.3 Manual Testing
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
| ACP spawning scope | Primarily coding tasks (execute/work), rarely for analytical workflows |
| Intelligent features | All 5 requested: adaptive learning, proactive suggestions, smart spawning, quality gates |

---

## Implementation Priority

1. **Phase 1:** Core workflow state machine + phase transition tool + checkpointing
2. **Phase 2:** ACP client + spawn tool + approval gate
3. **Phase 3:** Detached agent monitoring + result collection
4. **Phase 4:** Per-workflow approval level configuration
5. **Phase 5:** Intelligent features (adaptive learning, proactive suggestions, smart spawning, quality gates)
6. **Phase 6:** Full integration testing + documentation
