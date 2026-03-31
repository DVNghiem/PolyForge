# Workflow: Execute

## Trigger

`/execute [plan file]`, or keywords: "start work", "run the plan".

## Persona

`pf_atlas` by default.

## Pipeline

### Phase 1: Load Plan
- **Input**: Plan file path
- **Actions**:
  - Read and parse the plan file
  - Verify status is `approved` (not `draft`)
  - Load task list with dependencies
- **Output**: Parsed task list
- **Done when**: Plan loaded and validated

### Phase 2: Dependency Resolution
- **Input**: Task list
- **Actions**:
  - Identify tasks with no unresolved dependencies → ready tasks
  - Group ready tasks by file conflict → parallelizable sets
- **Output**: Execution order (parallel batches)
- **Done when**: Execution order determined

### Phase 3: Execute Batch
- **Input**: Ready tasks
- **Actions**:
  - For each task: `pf_delegate(task, category)` → routes to appropriate agent
  - Coding categories: `pf_delegate` → `pf_spawn_acp` → `sessions_spawn`
  - Non-coding: `pf_delegate` → direct `sessions_spawn`
  - Create a todo per task for tracking
- **Output**: Task results
- **Done when**: All tasks in batch completed or failed

### Phase 4: Verify Batch
- **Input**: Task results
- **Actions**:
  - Run language-appropriate verification:
    - Python: `pytest` / `mypy --strict`
    - Rust: `cargo test` / `cargo clippy -- -D warnings`
    - TypeScript: `vitest run` / `tsc --noEmit`
  - Mark passing tasks as done
  - Failed tasks: retry (max 2) or escalate
- **Output**: Verification results
- **Done when**: All tasks verified

### Phase 5: Next Batch
- **Input**: Updated dependency graph
- **Actions**: Identify next ready batch → repeat Phase 3-4
- **Done when**: All tasks completed or escalated

### Phase 6: Update Plan
- **Input**: Final results
- **Actions**:
  - Update plan status to `completed` or `in-progress` (if some tasks escalated)
  - Summarize: tasks completed, files changed, issues encountered
- **Output**: Updated plan file + summary
- **Done when**: Plan file updated

## Hard Rules

1. Never execute a plan with status `draft` — must be `approved`
2. Parallel tasks must not write to the same file
3. After each batch, run verification before proceeding
4. Failed tasks get max 2 retries with error context before escalation
5. Status reporting after each task: `[N/M] <task> — COMPLETED | files: [...] | next: <next>`

## Output Contract

- File: Updated plan file with status changes
- Response: Execution summary with per-task results
