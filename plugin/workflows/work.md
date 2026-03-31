# Workflow: Work

## Trigger

`/work [task description]`, or natural task phrasing like "implement X", "build Y", "fix Z".

## Persona

`pf_atlas` (orchestrator) — delegates to specialists as needed.

## Pipeline

### Phase 1: Intake
- **Input**: User task description
- **Actions**:
  - Run `pf_intake` tool to produce a Task Brief
  - Parse the brief for: scope, suggested category, files involved, acceptance criteria
  - If brief has gaps, ask user for clarification (max 2 rounds)
- **Output**: Complete Task Brief JSON
- **Done when**: Task Brief has all required fields, no critical gaps

### Phase 2: Research (Conditional)
- **Input**: Task Brief
- **Actions**:
  - Skip if `suggested_category` is NOT `research` and the task is well-understood
  - If triggered: run `/research` workflow on unknown technologies or patterns
  - Feed research findings back into the Task Brief context
- **Output**: Updated Task Brief with research context
- **Done when**: All unknowns resolved or research complete

### Phase 3: Planning
- **Input**: Task Brief (possibly research-enriched)
- **Actions**:
  - Atlas produces an execution plan
  - Analyst (`pf_analyst`) runs gap analysis on the plan
  - If gaps found, Atlas revises
  - Critic (`pf_critic`) reviews the plan for feasibility
  - Plan stored in `.polyforge-state/current-plan.md`
- **Output**: Approved execution plan
- **Done when**: Plan passes Analyst gap check and Critic review

### Phase 4: Execution
- **Input**: Approved plan
- **Actions**:
  - Process tasks in dependency order
  - For each task:
    - Route via `pf_delegate` → category → agent
    - Coding tasks go through `pf_spawn_acp` → `sessions_spawn`
    - Run tasks in parallel batches where dependencies allow
  - Language-aware verification after each batch:
    - TypeScript: `npx tsc --noEmit && npx vitest run`
    - Rust: `cargo check && cargo test`
    - Python: type checker + `pytest`
  - If a task fails, attempt self-recovery (max 2 retries)
  - Update todo list after each task completes
- **Output**: Implemented changes
- **Done when**: All plan tasks completed and verified

### Phase 5: Final Review
- **Input**: All implemented changes
- **Actions**:
  - Critic (`pf_critic`) reviews all changes against acceptance criteria
  - Full test suite runs
  - If blockers found, route fixes back to Phase 4
- **Output**: Review verdict
- **Done when**: [APPROVED] with no blockers

### Phase 6: Ship
- **Input**: Approved changes
- **Actions**:
  - Summarize what was done (files changed, features added, tests passing)
  - Update plan status to completed
  - Draft commit message(s) and/or PR description
  - Present summary to user
- **Output**: Ship summary with commit messages
- **Done when**: Summary presented to user

## Hard Rules

1. Never skip intake — every task needs a Task Brief
2. Never skip final review — all changes must be reviewed before shipping
3. Parallel execution only when tasks have no dependencies
4. Language-specific verification is mandatory, not optional
5. Self-recovery limited to 2 retries per task — escalate to user after that
6. Always update the todo list — no silent progress
7. Commit messages follow conventional commits format

## Output Contract

- Files: Modified/created source files as needed
- State: `.polyforge-state/current-plan.md` updated
- Response: Ship summary with what changed, test results, and draft commit messages
