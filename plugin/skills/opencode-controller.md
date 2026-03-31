# OpenCode Controller

Definitive guide for directing OpenCode as PolyForge's primary execution runtime via ACP.

PolyForge does not write code directly. All coding is delegated to OpenCode via `pf_spawn_acp`. PolyForge is responsible for task decomposition, prompt construction, monitoring, and result verification.

## 1. Pre-flight Checklist

Before delegating any coding task:

**1a. Verify ACP health**
```
/acp doctor
/acp status
```

If ACP or OpenCode is not available, surface the error and wait for user action before proceeding.

**1b. Confirm provider authentication**
- Ask the user which AI provider to use.
- Confirm authentication is complete before spawning.
- If model selector is needed, open it with `/models` and copy any login link verbatim for the user.

**1c. Never spawn without confirmation** when the task is destructive or ambiguous.

## 2. Session Lifecycle

### Creating a Session
```
pf_spawn_acp(agentId="pf_forge", task="<structured prompt>", model="<tier>", skills=["rust-systems.md"])
```

Or route through the delegation tool (preferred):
```
pf_delegate(task="...", category="deep")
```

### Monitoring Active Sessions
```
/acp status          — overall ACP health
sessions_list        — all active sessions
sessions_log <id>    — stream session output (add line count, e.g. sessions_log <id> 50)
```

### Steering a Running Session

Nudge without replacing context:
```
/acp steer <instruction>
```

Example:
```
/acp steer focus on the failing test case first, ignore the refactoring for now
```

### Cancellation and Closure
```
/acp cancel          — cancel current in-flight turn
/acp cancel <key>    — cancel specific session turn
/acp close           — close and unbind thread session
sessions_kill <id>   — terminate a stuck session entirely
```

### Resuming After Failure
Pass prior session results into a new session's CONTEXT section as structured context. Reference notepad files for continuity.

## 3. Task Construction (Structured Prompts)

Every spawned session must receive a prompt with these 6 sections:

```
## TASK
<What to do — specific, measurable>

## EXPECTED OUTCOME
<What success looks like — files changed, tests passing, behavior verified>

## REQUIRED TOOLS
<Which tools the agent should use>

## MUST DO
<Non-negotiable requirements>

## MUST NOT DO
<Explicit constraints — what to avoid>

## CONTEXT
<File paths, function signatures, error messages, notepad references>
```

**Quality gate**: A prompt under 30 lines is too vague — rewrite before spawning.

## 4. Agent and Model Selection

| Agent | Use When |
|---|---|
| `pf_sprint` | Quick, well-defined tasks |
| `pf_forge` | Complex implementation, deep debugging |
| `pf_architect` | Read-only design review |
| `pf_researcher` | Technology investigation |
| `pf_analyst` | Gap analysis |
| `pf_critic` | Code review |
| `pf_explorer` | Codebase search |

Model tiers: `worker` → `deep-worker` → `reasoning` → `analysis` → `search`

**Default**: Leave `model` empty — each agent uses its configured tier. Override only when you need a specific reasoning depth for the task at hand.

### OpenCode Internal Agent Modes

OpenCode has two primary internal agents selectable via `/agents`:
- **Build** — full tool access, implementation mode (default)
- **Plan** — restricted tools, analysis/planning mode

Always use Build for implementation. Switch to Plan only when read-only analysis is needed.

If OpenCode raises a question during Build, switch to Plan to answer it, then switch back to Build.

## 5. Parallel Session Patterns

- Fire multiple `pf_delegate` calls in one message for parallel execution
- Use the `label` parameter to identify sessions in parallel runs:
  ```
  pf_spawn_acp(agentId="pf_sprint", task="...", label="auth-fix")
  pf_spawn_acp(agentId="pf_sprint", task="...", label="payment-tests")
  ```
- Create a todo per parallel task to track completion
- Wait for ALL parallel results before proceeding
- **Conflict detection**: tasks writing to the same file must be serialized

## 6. Context Handoff Between Sessions

- Use notepads in `.polyforge/notepads/<plan-name>/` for inter-session state
- **Append-only**: never overwrite notepad content
- Categories: `learnings.md`, `decisions.md`, `issues.md`, `problems.md`
- Reference notepads in every delegation prompt's CONTEXT section

## 7. Collecting Results

After session completion, always collect and verify before reporting:

```bash
git status
git diff --stat
git diff
```

Summarize: files changed, test results, any risks or regressions introduced.

## 8. Language-Aware Verification

After every session completes:

| Language | Verification Commands |
|---|---|
| Python | `pytest` + `mypy --strict` |
| Rust | `cargo test` + `cargo clippy -- -D warnings` |
| TypeScript | `vitest run` + `tsc --noEmit` |

Build + test + lint must ALL pass before marking a task complete.

## 9. Error Recovery

1. **Wrong output**: Re-delegate with stricter constraints + error as context
2. **Timeout**: Re-spawn with lighter scope + notepad reference
3. **Persistent failure (2+ retries)**: Escalate to `pf_architect`, then user
4. **Never mark complete if tests haven't run**

## 10. Team Coordination

- Delegate to configured team agents via `team_agent_ids` config
- After each task: `[N/M] <task> — COMPLETED | files: [...] | next: <next>`
- Manage dependencies between AI sessions and human work items in the plan file

## 11. Session Lifecycle Reference

| Action | Command |
|--------|---------|
| Check ACP health | `/acp doctor`, `/acp status` |
| List active sessions | `sessions_list` |
| Inspect output | `sessions_log <id>` |
| Steer mid-run | `/acp steer <instruction>` |
| Cancel current turn | `/acp cancel` |
| Close thread session | `/acp close` |
| Kill session entirely | `sessions_kill <id>` |
| Collect results | `git status`, `git diff` |

## 12. Core Rule

PolyForge does not write code. All coding happens inside OpenCode via ACP delegation.
