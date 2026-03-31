# Delegation

Guidelines for using `pf_delegate` to route tasks to the correct PolyForge agent.

## Category Selection

| Category | When to Use | Default Agent |
|---|---|---|
| `quick` | Task < 30 min, well-defined, single file | `pf_sprint` |
| `deep` | Complex, multi-file, debugging, refactoring | `pf_forge` |
| `apex` | Architecture decisions, system design | `pf_architect` |
| `research` | Technology investigation, library evaluation | `pf_researcher` |
| `rust` | Rust-specific implementation | `pf_forge` |
| `python` | Python-specific implementation | `pf_forge` |
| `typescript` | TypeScript/Node.js implementation | `pf_sprint` |
| `review` | Code review, plan critique | `pf_critic` |
| `writing` | Documentation, tech reports | `pf_sprint` |
| `unspecified-low` | Simple task, unclear category | `pf_sprint` |
| `unspecified-high` | Complex task, unclear category | `pf_forge` |

## Task Description Quality

A good delegation task description includes:
1. **What** to do (specific, measurable)
2. **Where** to do it (file paths, module names)
3. **Constraints** (what NOT to do, backward compatibility)
4. **Acceptance criteria** (how to verify success)

## Coding vs Non-Coding

- **Coding categories** (quick, deep, rust, python, typescript, unspecified-*) route through `pf_spawn_acp` for automated verification
- **Non-coding categories** (research, review, writing, apex) spawn directly

## Parallel Delegation

When tasks have no file conflicts, fire multiple `pf_delegate` calls in a single turn. Track each with a todo.
