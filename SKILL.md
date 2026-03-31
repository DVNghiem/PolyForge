---
name: polyforge
description: Backend engineering command center for polyglot developers — 8 specialized agents, 11 task categories, language-aware routing, research-first workflow, anti-hallucination guardrails, and automated task completion loops for Python, Rust, and TypeScript projects on OpenClaw.
---

# PolyForge

> Structured, research-first, language-aware backend engineering workflow for OpenClaw.

## Overview

PolyForge provides a 3-layer agent architecture and opinionated workflow for backend engineers working across Python, Rust, and TypeScript. Every task flows through triage → planning → execution → verification.

- **3-Layer Architecture**: Strategy (Atlas) → Coordination (Architect, Researcher, Analyst, Critic, Explorer) → Execution (Sprint, Forge)
- **11 Task Categories**: Intent-based routing from quick fixes to deep research to architecture decisions
- **Language-Aware**: Auto-detects Python / Rust / TypeScript, injects relevant skills and verification rules
- **Research-First**: Evaluate technologies before building via structured Tech Briefs
- **Anti-Hallucination Guardrails**: 8 rules injected into every prompt
- **Autorun Loop**: Self-correcting execution with configurable iteration limits
- **Todo Tracking**: Persistent todo management across sessions via `pf_todo_*` tools

## Installation

```bash
git clone https://github.com/DVNghiem/PolyForge polyforge
cd polyforge/plugin
npm install
npm run build
npx pf-setup
```

Add to OpenClaw config:

```json
{
  "plugins": {
    "polyforge": {
      "path": "./polyforge/plugin"
    }
  }
}
```

### Verify Installation

```
/pf status
/pf list
```

## Trigger

This skill activates when:

- User invokes `/triage`, `/research`, `/intake`, `/plan`, `/execute`, or `/work`
- User asks for task routing, technology evaluation, or backend engineering help
- User needs multi-step coding pipeline coordination across Python, Rust, or TypeScript

## Architecture

### Layer 1: Strategy

| Agent     | Role                                                              | Categories        |
| --------- | ----------------------------------------------------------------- | ----------------- |
| **Atlas** | Orchestrator — triage, plan, delegate, verify, escalate           | apex, all routing |

### Layer 2: Coordination

| Agent          | Role                                                             | Category  |
| -------------- | ---------------------------------------------------------------- | --------- |
| **Architect**  | Read-only architecture consultation — API design, data models    | apex      |
| **Researcher** | Technology evaluation — produces structured Tech Briefs          | research  |
| **Analyst**    | Gap analysis — finds missing requirements before implementation  | review    |
| **Critic**     | Code & plan review — severity-categorized findings, fix guidance | review    |
| **Explorer**   | Codebase search — maps structure, traces dependencies, finds patterns | quick |

### Layer 3: Execution

| Agent      | Role                                                              | Category              |
| ---------- | ----------------------------------------------------------------- | --------------------- |
| **Sprint** | Quick worker — bounded features, bug fixes, docs, TypeScript work | quick, typescript, writing |
| **Forge**  | Deep specialist — complex refactors, async debugging, Rust/Python | deep, rust, python    |

### Category-to-Agent Routing

| Category         | Default Agent | Examples                                               |
| ---------------- | ------------- | ------------------------------------------------------ |
| `quick`          | Sprint        | Add a field, fix a typo, rename a function             |
| `deep`           | Forge         | Refactor auth module, implement rate limiter           |
| `apex`           | Architect     | Design a service boundary, evaluate caching strategy   |
| `research`       | Researcher    | Evaluate Axum vs Actix, compare PostgreSQL vs CockroachDB |
| `rust`           | Forge         | Fix lifetime issue, optimize hot path, async trait impl|
| `python`         | Forge         | Add FastAPI endpoint, write async background task      |
| `typescript`     | Sprint        | Add Fastify route, fix type error, write integration test |
| `review`         | Critic        | Review PR diff, critique a plan, identify security issues |
| `writing`        | Sprint        | Write a tech brief, update API docs, write changelog   |
| `unspecified-low`| Sprint        | Unknown low-complexity tasks                           |

Coding categories (`quick`, `deep`, `rust`, `python`, `typescript`) route through `pf_spawn_acp` → `sessions_spawn` for real sub-agent sessions.

## Workflows

### `/work` — Full Engineering Pipeline

1. **Intake** — `pf_intake` parses the task into a Task Brief (scope, category, files, acceptance criteria)
2. **Research** *(conditional)* — Triggered if technology is unknown; Researcher produces a Tech Brief
3. **Plan** — Atlas breaks the brief into ordered subtasks with dependencies
4. **Execute** — Sprint or Forge implement each subtask; `pf_spawn_acp` spawns coding sessions
5. **Review** — Critic reviews the output; Atlas verifies against acceptance criteria
6. **Done** — All todos marked complete; summary reported to user

### `/triage [task]` — Classify and Route

Atlas answers 4 questions and routes to the correct workflow:

| Type          | Workflow    | Lead Agent   |
| ------------- | ----------- | ------------ |
| Research/learn | `/research` | Researcher  |
| Build/implement | `/intake`  | Atlas        |
| Review/critique | `/review`  | Critic       |
| Design/decision | `/brainstorm` | Analyst    |
| Full cycle    | `/work`     | Atlas        |

### `/research [topic]` — Technology Investigation

1. Researcher runs 3-phase methodology: Discovery → Health Assessment → Adoption Signals
2. Produces a structured **Tech Brief** with recommendation and trade-offs
3. Findings feed back into task context for downstream planning

### `/intake [description]` — Structured Task Intake

Converts a raw PM request or issue description into a Task Brief JSON with: scope, acceptance criteria, suggested category, files involved, open questions.

### `/plan [topic]` — Planning Only

Atlas produces a phased execution plan with ordered subtasks, dependencies, and verification steps. Returns plan for user approval before execution.

### `/execute [plan]` — Execute Approved Plan

Atlas distributes approved plan tasks to Sprint or Forge via `pf_delegate`, tracks progress with `pf_todo_*`, and verifies each subtask before marking done.

## Tools

All tools are prefixed `pf_`. Coding tasks flow through `pf_delegate` → `pf_spawn_acp` → `sessions_spawn`.

| Tool               | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `pf_delegate`      | Route a task to the correct agent by category             |
| `pf_spawn_acp`     | Spawn a coding sub-agent session with verification loop   |
| `pf_intake`        | Parse task description into a structured Task Brief       |
| `pf_research`      | Initiate a technology research workflow                   |
| `pf_checkpoint`    | Save progress snapshot for recovery                       |
| `pf_search`        | Web search for documentation and resources                |
| `pf_todo_create`   | Create a tracked todo item                                |
| `pf_todo_list`     | List all pending todos                                    |
| `pf_todo_update`   | Update todo status (in-progress / done / blocked)         |

## Built-in Skills

Skills inject domain expertise into agent prompts. Relevant skills are loaded automatically by the language detector and keyword detector hooks.

| Skill                        | Trigger Keywords                          | Description                                                       |
| ---------------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| **git-master**               | commit, rebase, squash, blame, branch     | Atomic commits, rebase surgery, history archaeology               |
| **api-design**               | API, endpoint, REST, gRPC, schema         | URL conventions, error contracts, versioning patterns             |
| **rust-systems**             | Rust, cargo, tokio, lifetime, borrow      | Async patterns, error handling, zero-cost abstractions            |
| **python-backend**           | Python, FastAPI, asyncio, pytest          | Async patterns, type system, packaging with uv/pyproject.toml     |
| **typescript-backend**       | TypeScript, Fastify, Zod, ESM             | Strict types, Zod validation, Vitest testing patterns             |
| **tech-research**            | evaluate, compare, choose, benchmark      | Tech Brief methodology, health assessment, adoption signals        |
| **code-review**              | review, PR, critique, quality             | Severity-categorized review checklist, OWASP-aligned security     |
| **comment-checker**          | comment check, AI slop, code quality      | Anti-AI-slop guard — removes obvious comments, keeps WHY comments |
| **web-search**               | web search, docs, official, latest        | Documentation lookup and technology research via web              |
| **delegation**               | delegate, assign, spawn, coordinate       | Multi-agent delegation patterns and task distribution             |
| **dispatching-parallel-agents** | parallel, concurrent, batch           | Parallel sub-agent dispatch and coordination patterns             |
| **recovery**                 | stuck, failed, retry, checkpoint          | Checkpoint-based failure recovery and retry strategies            |
| **brainstorming**            | brainstorm, ideas, options, alternatives  | Structured ideation and decision framing                          |
| **task-intake**              | intake, brief, requirements, PM           | Converting raw descriptions into structured Task Briefs           |
| **writing-plan**             | plan, outline, document, RFC              | Structured writing and documentation planning                     |
| **writing-skills**           | README, docs, changelog, report           | Technical writing patterns for backend engineers                  |
| **self-learning**            | learn, adapt, pattern, lesson             | Self-improvement and pattern recognition across sessions          |
| **steering-words**           | guide, steer, adjust, course correct      | Mid-task steering without full restart                            |
| **tool-patterns**            | tool, MCP, API, call pattern              | Tool usage patterns and anti-patterns                             |
| **opencode-controller**      | opencode, OmO, tmux, delegate             | OpenCode/OmO delegation via tmux session management               |
| **workflows-for-skill**      | workflow, pipeline, phases, stages        | How to structure multi-phase skill workflows                      |

### Category + Skill Combos

| Combo               | Category     | Skills              | Effect                                                  |
| ------------------- | ------------ | ------------------- | ------------------------------------------------------- |
| **The Rusticist**   | `rust`       | rust-systems        | Lifetime-safe, tokio-async Rust with proper error handling |
| **The Pythonista**  | `python`     | python-backend      | FastAPI endpoints with async patterns and full type coverage |
| **The TS Worker**   | `typescript` | typescript-backend  | Strict-mode TypeScript with Zod validation and Vitest tests |
| **The Maintainer**  | `quick`      | git-master          | Quick fixes with clean atomic commits                   |
| **The Reviewer**    | `review`     | code-review, comment-checker | Deep review with AI slop detection           |
| **The Researcher**  | `research`   | tech-research, web-search | Structured Tech Brief with health assessment       |
| **The Architect**   | `apex`       | api-design          | API shape review with trade-off justification           |

## Guardrails

8 anti-hallucination rules injected into every prompt via `guardrail-injector` hook (priority 100):

1. Never invent file paths — verify they exist before referencing
2. Never assume a function signature — read the source first
3. Never claim tests pass without running them
4. Never use placeholder implementations in production code
5. State uncertainty explicitly rather than guessing
6. Prefer reading existing code over writing from memory
7. Verify library/package versions against the actual lockfile
8. Never skip the verification checklist before marking a task done

## Hook System

Hooks fire automatically during the OpenClaw request lifecycle:

| Priority | Hook                | Event                    | Effect                                              |
| -------- | ------------------- | ------------------------ | --------------------------------------------------- |
| 50       | context-injector    | before_prompt_build      | Injects session context and priority queue          |
| 60       | todo-enforcer       | before_prompt_build      | Forces todo continuation directive into prompt      |
| 70       | lang-detector       | before_prompt_build      | Detects language, injects relevant skills           |
| 75       | keyword-detector    | tool_result_persist      | Detects trigger keywords in tool results            |
| 80       | keyword-detector    | before_prompt_build      | Activates skill injection based on detected keywords|
| 100      | guardrail-injector  | before_prompt_build      | Injects 8 anti-hallucination rules                  |
| 150      | spawn-guard         | before_tool_call         | Validates sub-agent spawn parameters                |
| 200      | session-sync        | session_start/session_end| Persists and restores session state                 |

### Todo Enforcer Directive

Injected automatically when incomplete todos are detected:

```
[SYSTEM DIRECTIVE: POLYFORGE — TODO CONTINUATION]
You MUST continue working on incomplete todos.
- Do NOT stop until all tasks are marked complete
- Do NOT ask for permission to continue
- Mark each task complete immediately when finished
- If blocked, document the blocker and move to next task
```

## State Persistence

Plugin state is stored in `.polyforge-state/` at the workspace root:

| File              | Contents                                              |
| ----------------- | ----------------------------------------------------- |
| `persona.json`    | Active agent ID and switch metadata                   |
| `todos.json`      | Persistent todo items with status tracking            |
| `agents.md.bak`   | Backup of original AGENTS.md before persona switch    |

## Commands Reference

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `/pf`              | Main command — shows status                      |
| `/pf status`       | Plugin health and active persona                 |
| `/pf list`         | List all available agents                        |
| `/pf [agent]`      | Switch active persona (e.g. `/pf atlas`)         |
| `/pf off`          | Deactivate PolyForge persona                     |
| `/triage [task]`   | Classify and route a raw task description        |
| `/research [topic]`| Technology investigation workflow                |
| `/intake [desc]`   | Convert raw task into a structured brief         |
| `/plan [topic]`    | Produce a phased execution plan                  |
| `/execute [plan]`  | Run an approved plan                             |
| `/work [task]`     | Full pipeline: intake → research → plan → execute → review |

## Usage Examples

### Quick Fix

```
User: Fix the type error in auth.ts
Atlas: [Routes to Sprint — category: typescript]
```

### Complex Feature

```
User: /work implement rate limiting middleware for FastAPI
Atlas: [Intake → Research (optional) → Plan → Forge implements → Critic reviews]
```

### Technology Decision

```
User: /research axum vs actix-web for our HTTP layer
Researcher: [3-phase investigation → Tech Brief with recommendation]
```

### Architecture Review

```
User: /plan Design the service boundary for our auth microservice
Architect: [Read-only analysis → Design document with trade-offs]
```

### Full Triage

```
User: /triage PM wants async audit logging for all API calls
Atlas: [Classifies → Intake → Breaks into subtasks → Delegates to Forge]
```

## File Structure

```
polyforge/
  SKILL.md              # This file — AI usage guide
  README.md             # Project documentation
  CODEBASE.md           # Technical reference for contributors
  CHANGELOG.md          # Version history
  config/
    categories.json     # 11 categories with defaultAgent + examples
  docs/
    guide/              # Installation, orchestration, workflow guides
    reference/          # Configuration and feature reference
  plugin/
    agents/
      atlas.md          # Orchestrator — triage, plan, delegate, verify
      sprint.md         # Quick worker — bounded tasks, TypeScript, docs
      forge.md          # Deep specialist — Rust, Python, complex refactors
      architect.md      # Architecture consultant — read-only design advice
      researcher.md     # Tech evaluation — produces Tech Briefs
      analyst.md        # Gap analysis — catches missing requirements
      critic.md         # Code & plan reviewer — severity-categorized findings
      explorer.md       # Codebase search — maps structure, traces dependencies
    skills/             # 21 skill documents injected into agent prompts
    workflows/          # 8 workflow pipelines (triage, intake, plan, execute, etc.)
    src/                # TypeScript plugin source
      agents/           # Agent IDs, configs, persona prompt resolution
      cli/              # Setup wizard and model presets
      commands/         # Slash command handlers
      features/         # ContextCollector session-scoped priority queue
      hooks/            # 8 hook modules (guardrails, detection, monitoring)
      services/         # Autorun loop service
      tools/            # 6 tools + 3 todo tools (pf_ prefix)
      utils/            # Config, state, paths, validation, persona state
    bin/
      polyforge.mjs     # CLI entry point
```
