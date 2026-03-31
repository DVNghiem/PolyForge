# Research Workflow

PolyForge treats research as a first-class workflow, not an afterthought. Use it to evaluate technologies before committing to them.

## Quick Start

```bash
/research axum vs actix-web for our HTTP layer
```

## How It Works

The research workflow activates `pf_researcher` and follows a structured 4-phase pipeline:

### Phase 1: Scope Definition
- Define exactly what is being evaluated and why
- Set evaluation criteria and constraints
- Identify what "done" looks like

### Phase 2: Investigation
- Multi-source research: documentation, GitHub, benchmarks, community
- GitHub health checks: commit frequency, issue response time, bus factor
- Always check at least 2 alternatives when evaluating a technology

### Phase 3: Synthesis
- Produce a structured Tech Brief with findings
- Compare options on defined criteria
- Identify risks and unknowns

### Phase 4: Presentation
- Save to `workspace/research/<date>_<topic>.md`
- Present summary with clear recommendation

## Research Depth

Configure with `research_depth` in plugin config:

| Depth | Behavior |
|---|---|
| `shallow` | Quick overview, 1-2 sources per topic |
| `standard` | Balanced, GitHub health check + docs + community (default) |
| `deep` | Exhaustive, benchmarks + production case studies + source code review |

## Integration with Other Workflows

Research can be triggered:
- Directly via `/research [topic]`
- Automatically during `/intake` if unknowns are detected
- As part of `/work` when the task involves unfamiliar technology

## Example

```bash
# Direct research
/research should we adopt Bun for our TypeScript backend

# Research flows into planning
/intake PM wants a new real-time notification service
# → Intake detects unknowns about WebSocket libraries
# → Research workflow triggers automatically
# → Results feed back into the task plan
```

## Hard Rules

1. Never recommend a library without checking its GitHub health
2. Always present at least 2 alternatives
3. Findings must be saved to a file, not just displayed
4. Cite sources for every claim
