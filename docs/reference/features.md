# Features Reference

## Hooks

### Anti-Hallucination Guardrails (`guardrail-injector`)
Injects 8 rules into every prompt via `before_prompt_build` (priority 100):
1. No placeholder code or fake implementations
2. No inventing APIs or endpoints
3. No assuming file contents without reading
4. No skipping verification steps
5. No silent language assumptions
6. No adding dependencies without approval
7. No bypassing tests
8. Prefer idiomatic code for the detected language

### Comment Checker (`comment-checker`)
Detects AI slop comments (e.g., "// Helper function to do the thing") using 11 regex patterns. Fires on `tool_result_persist`.

### Context Injector (`context-injector`)
Drains the ContextCollector's entries into a `<polyforge-context>` XML block on `before_prompt_build` (priority 50). Entries have priority ordering and TTL-based pruning.

### Keyword Detector (`keyword-detector`)
Scans user messages and tool results for category keywords (~60 keywords across research, rust, python, typescript, review categories). Adds detection results to the ContextCollector.

### Language Detector (`lang-detector`)
Detects programming languages from file extensions and code patterns. Injects language context into prompts via `before_prompt_build` (priority 70).

### Message Monitor (`message-monitor`)
Tracks message counts (sent/received) with LRU-capped counters (max 1000 entries).

### Session Sync (`session-sync`)
Restores persona state on `session_start` and persists on `session_end` (priority 200).

### Spawn Guard (`spawn-guard`)
Blocks raw `sessions_spawn` calls when a persona is active, requiring use of `pf_delegate` instead (priority 150).

### Subagent Tracker (`subagent-tracker`)
Tracks spawned sub-agents, logs completion times, maintains active spawn count.

### TODO Enforcer (`todo-enforcer`)
Injects role-aware TODO continuation directives on `agent:bootstrap` and `before_prompt_build` (priority 60).

### TODO Reminder (`todo-reminder`)
Reminds about pending todos after 10+ non-todo tool calls.

## Tools

### `pf_delegate`
Routes tasks to agents by category. Coding categories go through ACP; non-coding categories route directly.

### `pf_spawn_acp`
Spawns an ACP agent session with structured instructions. Validates minimum 30-line prompt.

### `pf_research`
Structured technology research with configurable depth (shallow/standard/deep).

### `pf_intake`
Produces a Task Brief JSON from a raw task description.

### `pf_search`
Web search wrapper for research workflows.

### `pf_checkpoint`
Saves session state checkpoints with verification status.

### `pf_todo_create` / `pf_todo_list` / `pf_todo_update`
Persistent todo CRUD operations. State stored in `.polyforge-state/todos.json`.

## Services

### Autorun Loop
Self-correcting execution loop started with `/autorun`, stopped with `/stop`. Respects `max_auto_iterations` config with a hard cap of 100.

## Context Collector

Session-scoped priority queue for context entries. Features:
- Priority-based ordering (lower number = higher priority)
- TTL-based expiration
- Automatic drain on `before_prompt_build`
- Thread-safe singleton instance
