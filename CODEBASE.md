# PolyForge — Codebase Reference

> Technical reference for the PolyForge OpenClaw plugin.

## Architecture

PolyForge uses a 3-layer architecture:

```
┌─────────────────────────────┐
│     Strategy Layer          │  Atlas (orchestrator)
│  Triage → Plan → Delegate   │
├─────────────────────────────┤
│   Coordination Layer        │  Architect, Researcher, Analyst, Critic, Explorer
│  Research → Review → Assess  │
├─────────────────────────────┤
│    Execution Layer          │  Sprint (quick), Forge (deep)
│  Code → Test → Verify        │
└─────────────────────────────┘
```

## Plugin Entry Point

`plugin/src/index.ts` — Uses `export default function register(api)` pattern.

Key mechanisms:
- **Generation counter**: Prevents stale hooks from firing after re-registration
- **guardedApi proxy**: Wraps `api.on()` to check generation number before hook execution
- **safeRegister**: Wraps each registration call in try/catch for resilience

## Directory Structure

### `src/` — TypeScript Source

- `constants.ts` — Plugin ID, tool prefix, categories, read-only deny list
- `types.ts` — All TypeScript interfaces and type exports
- `version.ts` — Reads version from package.json
- `agents/` — Agent IDs, configs, persona prompt resolution
- `cli/` — Setup wizard and model presets
- `commands/` — Slash command handlers
- `features/` — ContextCollector (session-scoped priority queue)
- `hooks/` — 11 hook modules (guardrails, detection, monitoring, sync)
- `services/` — Autorun loop service
- `tools/` — 6 tools + 3 todo tools
- `utils/` — Config, state, paths, validation, persona state

### `agents/` — Persona Markdown Files

8 agent personas with role definitions, available tools, working rules, and output formats.

### `skills/` — Skill Documents

21 skill files providing domain expertise that gets injected into agent prompts.

### `workflows/` — Workflow Pipelines

8 workflow definitions with phased pipelines, hard rules, and output contracts.

## State Management

Plugin state is stored in `.polyforge-state/`:
- `persona.json` — Active persona ID and metadata
- `todos.json` — Persistent todo items
- `agents.md.bak` — Backup of original AGENTS.md before persona switch

## Hook Priority Order

| Priority | Hook | Event |
|---|---|---|
| 50 | context-injector | before_prompt_build |
| 60 | todo-enforcer | before_prompt_build |
| 70 | lang-detector | before_prompt_build |
| 75 | keyword-detector | tool_result_persist |
| 80 | keyword-detector | before_prompt_build |
| 100 | guardrail-injector | before_prompt_build |
| 150 | spawn-guard | before_tool_call |
| 200 | session-sync | session_start/session_end |

## Tool Registration

All tools use `@sinclair/typebox` for parameter schemas. Tool names are prefixed with `pf_`.

## Category Routing

The `pf_delegate` tool routes tasks through 11 categories. Coding categories (quick, deep, rust, python, typescript) route through `pf_spawn_acp` → `sessions_spawn`. Non-coding categories route directly.
