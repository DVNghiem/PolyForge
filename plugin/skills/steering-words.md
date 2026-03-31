# Steering Words

Keyword patterns that trigger PolyForge workflows and persona switches.

## Workflow Triggers

| Keyword Pattern | Action |
|---|---|
| `/research`, "investigate", "evaluate", "should we use", "compare" | Research workflow → `pf_researcher` |
| `/intake`, "new task", "received a task", "PM wants", "issue says" | Task intake → `pf_atlas` |
| `/review`, "code review", "PR review", "review this" | Review workflow → `pf_critic` |
| `/brainstorm`, "which approach", "evaluate options", "how should we design" | Brainstorm workflow → `pf_analyst` |
| `/work`, "full pipeline", "end to end" | Full work pipeline → `pf_atlas` |
| `/plan`, "create a plan", "break this down" | Planning workflow → `pf_atlas` |
| `/execute`, "start work", "run the plan" | Execution → `pf_atlas` |

## Language Triggers

| Keyword Pattern | Skill Injected |
|---|---|
| "in Rust", "cargo", "crate", "tokio", "lifetime" | `rust-systems.md` |
| "in Python", "pytest", "FastAPI", "Pydantic", "async def" | `python-backend.md` |
| "in TypeScript", "Fastify", "Bun", "tsconfig", "Vitest" | `typescript-backend.md` |

## Category Signals

| Signal | Category |
|---|---|
| "quick fix", "small change", "typo", "rename" | `quick` |
| "refactor", "redesign", "complex", "overhaul" | `deep` |
| "architecture", "system design", "maximum depth" | `apex` |
| "research", "investigate", "explore", "study" | `research` |
| "review", "audit", "feedback", "check my code" | `review` |

## Priority

When multiple keywords match, the most specific pattern wins. Language-specific keywords override general category keywords.
