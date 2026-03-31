# Orchestration

PolyForge uses a 3-layer architecture for task orchestration, with Atlas as the central coordinator.

## Architecture

```
┌─────────────────────────────┐
│     Strategy Layer          │  Atlas
│  Triage → Plan → Delegate   │
├─────────────────────────────┤
│   Coordination Layer        │  Architect, Researcher, Analyst, Critic, Explorer
│  Research → Review → Assess │
├─────────────────────────────┤
│    Execution Layer          │  Sprint (quick), Forge (deep)
│  Code → Test → Verify       │
└─────────────────────────────┘
```

## Task Routing

When Atlas receives a task, it routes through `pf_delegate`:

1. **Classify** — Determine the task category (11 categories)
2. **Route** — Map category to default agent
3. **Dispatch** — Coding tasks go through ACP (`pf_spawn_acp` → `sessions_spawn`), non-coding tasks route directly

### Coding Categories
`quick`, `deep`, `rust`, `python`, `typescript` — All route through ACP for session isolation.

### Non-Coding Categories
`apex`, `research`, `review`, `writing` — Route directly to specialist agents.

## Parallel Execution

Tasks within a plan batch that have no dependencies can run in parallel:

```
Batch 1: [Task A, Task B]  ← no dependencies → parallel
Batch 2: [Task C]          ← depends on A and B → sequential after batch 1
Batch 3: [Task D, Task E]  ← depend on C → parallel
```

## Language-Aware Verification

After each execution batch, verification runs based on detected language:

| Language | Verification |
|---|---|
| TypeScript | `npx tsc --noEmit && npx vitest run` |
| Rust | `cargo check && cargo test` |
| Python | type checker + `pytest` |

## Self-Recovery

If a task fails:
1. Retry with error context (max 2 attempts)
2. If still failing, escalate to user
3. Never silently skip a failed task

## Autorun Loop

The `/autorun` command starts a self-correcting execution loop:

```bash
/autorun 20 workspace/plans/my-plan.md
```

- Iterates through plan tasks automatically
- Respects `max_auto_iterations` config (hard cap: 100)
- Stop with `/stop`

## Team Coordination

Configure `team_agent_ids` in the plugin config to include external OpenClaw agents that Atlas can delegate to. This extends the orchestration beyond PolyForge's built-in agents.
