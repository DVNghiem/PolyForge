# PolyForge

> Backend engineering command center for polyglot developers.

**PolyForge** is an [OpenClaw](https://docs.openclaw.ai) CLI plugin that provides a structured, research-first, language-aware workflow for backend engineers working in **Python**, **Rust**, **TypeScript** and more languages.

## Features

- **8 Specialized Agents** — Orchestrator (Atlas), workers (Sprint, Forge), Architect, Researcher, Analyst, Critic, Explorer
- **11 Task Categories** — Intelligent routing from quick fixes to deep research
- **Language-Aware** — Auto-detects project language, injects relevant skills and verification
- **Research-First Workflow** — Evaluate technologies before building with structured tech briefs
- **Task Intake** — Turn raw PM requests and issues into actionable plans
- **Anti-Hallucination Guardrails** — 8 rules injected into every prompt
- **Autorun Loop** — Self-correcting execution with configurable iteration limits
- **Todo Tracking** — Persistent todo management across sessions

## Installation

```bash
# Clone the repository
git clone https://github.com/DVNghiem/PolyForge polyforge
cd polyforge/plugin

# Install dependencies
npm install

# Build the plugin
npm run build

# Run the setup wizard
npx pf-setup
```

### OpenClaw Configuration

Add PolyForge to your OpenClaw config:

```json
{
  "plugins": {
    "polyforge": {
      "path": "./polyforge/plugin"
    }
  }
}
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
|---|---|
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

## Agents

| Agent | Role | Tier |
|---|---|---|
| Atlas | Work coordinator & orchestrator | Strategy |
| Sprint | Quick implementation worker | Execution |
| Forge | Deep specialist (complex tasks) | Execution |
| Architect | System design (read-only) | Coordination |
| Researcher | Technology evaluation | Coordination |
| Analyst | Gap analysis & assessment | Coordination |
| Critic | Code & plan reviewer | Coordination |
| Explorer | Codebase search & navigation | Coordination |

## Configuration

Configuration is set in your OpenClaw plugin config:

```json
{
  "polyforge": {
    "max_auto_iterations": 10,
    "preferred_language": "mixed",
    "research_depth": "standard",
    "team_agent_ids": [],
    "checkpoint_dir": "workspace/checkpoints"
  }
}
```

See [docs/reference/configuration.md](docs/reference/configuration.md) for the full schema.

## Documentation

- [Installation Guide](docs/guide/installation.md)
- [Research Workflow](docs/guide/research-workflow.md)
- [Task Intake](docs/guide/task-intake.md)
- [Orchestration](docs/guide/orchestration.md)
- [Configuration Reference](docs/reference/configuration.md)
- [Features Reference](docs/reference/features.md)

## License

MIT
