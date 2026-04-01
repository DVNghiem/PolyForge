# PolyForge Plugin

> Backend engineering command center for polyglot developers on [OpenClaw](https://docs.openclaw.ai)

**PolyForge** is an OpenClaw CLI plugin that provides a structured, research-first, language-aware workflow for backend engineers working in **Python**, **Rust**, **TypeScript** and more.

[![npm version](https://img.shields.io/npm/v/@dv.nghiem/polyforge)](https://www.npmjs.com/package/@dv.nghiem/polyforge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **8 Specialized Agents** — Atlas orchestrator, Sprint/Forge workers, Architect, Researcher, Analyst, Critic, Explorer
- **8 Workflow Definitions** — brainstorm, triage, research, intake, review, plan, execute, work
- **Language-Aware** — Auto-detects project language, injects relevant skills
- **Research-First Workflow** — Evaluate technologies before building with structured tech briefs
- **Task Intake** — Turn raw PM requests and issues into actionable plans
- **Anti-Hallucination Guardrails** — 8 rules injected into every prompt
- **Autorun Loop** — Self-correcting execution with configurable iteration limits
- **Todo Tracking** — Persistent todo management across sessions
- **Quality Gates** — Configurable enforcement levels for outputs
- **Adaptive Learning** — Learns approval patterns over time

## Installation

### Via OpenClaw CLI (Recommended)

```bash
openclaw plugins install @dv.nghiem/polyforge
openclaw pf-setup
```

### From Source

```bash
git clone https://github.com/DVNghiem/PolyForge.git
cd PolyForge/plugin
npm install
npm run build
npx pf-setup
```

## Quick Start

```bash
# Switch to the Atlas orchestrator
/pf atlas

# Triage an incoming task
/triage PM wants async audit logging for all API calls

# Research a technology
/research axum vs actix-web for our HTTP layer

# Full work pipeline: intake → research → plan → execute → review
/work implement rate limiting middleware for FastAPI

# Check status
/pf status

# List all agents
/pf list
```

## Commands

| Command | Description |
|---------|-------------|
| `/pf [subcommand]` | Main command — status, health, config, list, agent switch, off |
| `/triage [task]` | Classify and route a task |
| `/research [topic]` | Technology investigation workflow |
| `/intake [description]` | Turn a raw task into a structured brief |
| `/plan [topic]` | Produce an execution plan |
| `/execute [plan]` | Run an approved plan |
| `/work [task]` | Full pipeline: intake → plan → execute → review |
| `/review [target]` | Code or plan review |
| `/brainstorm [topic]` | Structured ideation with ≥3 approaches |
| `/todos` | List all tracked todos |
| `/autorun [maxIter]` | Start self-correcting execution loop |
| `/stop` | Stop the autorun loop |

## Workflows

PolyForge provides 8 predefined workflow definitions:

| Workflow | Phases | Use Case |
|----------|--------|----------|
| `brainstorm` | problem_framing → divergent → convergent → decision | Ideation with multiple approaches |
| `triage` | classify → assess → route | Quick task classification |
| `research` | scope → investigate → synthesize → present | Technology evaluation |
| `intake` | parse → gap_analysis → research_trigger → plan_stub → handoff | Request intake |
| `review` | scope_review → execute_review → recommend → signoff | Formal review process |
| `plan` | context_gather → decompose → gap_review → document → approve | Planning |
| `execute` | load_plan → resolve_deps → execute_batch → next_batch → update_plan | Plan execution |
| `work` | intake → research → plan → execute → review → ship | Full development cycle |

## Tools

The plugin registers these tools for use by agents:

| Tool | Description |
|------|-------------|
| `pf_delegate` | Delegate task to a specialized agent |
| `pf_spawn_acp` | Spawn an autonomous coding process |
| `pf_research` | Conduct technology research |
| `pf_intake` | Process raw task into structured brief |
| `pf_search` | Web search for technology comparison |
| `pf_checkpoint` | Save/restore execution state |
| `pf_todo_create` | Create a tracked todo |
| `pf_todo_list` | List all todos |
| `pf_todo_update` | Update todo status |
| `pf_phase_transition` | Transition workflow phase |
| `pf_spawn_subagent` | Spawn a subagent with specific role |

## Configuration

Add to your OpenClaw plugin config:

```json
{
  "polyforge": {
    "max_auto_iterations": 50,
    "preferred_language": "mixed",
    "research_depth": "standard",
    "checkpoint_dir": "workspace/checkpoints",
    "workflow_phase_enforcement": {
      "enabled": true,
      "default_approval_level": "medium"
    }
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `max_auto_iterations` | integer | 50 | Maximum autorun loop iterations |
| `preferred_language` | string | "mixed" | Primary language (python, rust, typescript, mixed) |
| `research_depth` | string | "standard" | Research depth (shallow, standard, deep) |
| `checkpoint_dir` | string | "workspace/checkpoints" | Directory for execution checkpoints |
| `todo_enforcer_enabled` | boolean | true | Enable todo continuation injection |
| `comment_checker_enabled` | boolean | true | Enable AI slop comment detection |
| `team_agent_ids` | array | [] | OpenCode agent IDs for team delegation |

### Workflow Phase Enforcement

```json
{
  "workflow_phase_enforcement": {
    "enabled": true,
    "default_approval_level": "medium",
    "per_workflow_overrides": {
      "review": "high",
      "triage": "low"
    }
  }
}
```

### Intelligent Features

```json
{
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
      "enforcement_level": "moderate",
      "default_threshold": 0.75
    }
  }
}
```

## Agents

| Agent | Role | Tier |
|-------|------|------|
| Atlas | Work coordinator & orchestrator | Strategy |
| Sprint | Quick implementation worker | Execution |
| Forge | Deep specialist (complex tasks) | Execution |
| Architect | System design (read-only) | Coordination |
| Researcher | Technology evaluation | Coordination |
| Analyst | Gap analysis & assessment | Coordination |
| Critic | Code & plan reviewer | Coordination |
| Explorer | Codebase search & navigation | Coordination |

## License

MIT

## Links

- [Main Repository](https://github.com/DVNghiem/PolyForge)
- [OpenClaw Documentation](https://docs.openclaw.ai)
- [Issue Tracker](https://github.com/DVNghiem/PolyForge/issues)
