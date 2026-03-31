# Configuration Reference

PolyForge is configured through the OpenClaw plugin configuration system.

## Schema

| Property | Type | Default | Description |
|---|---|---|---|
| `max_auto_iterations` | integer (0-500) | `50` | Max iterations for `/autorun`. Hard cap: 500. |
| `todo_enforcer_enabled` | boolean | `true` | Enable TODO continuation injection on bootstrap |
| `todo_enforcer_cooldown_ms` | integer | `2000` | Cooldown between TODO enforcer injections |
| `todo_enforcer_max_failures` | integer (≥1) | `5` | Max consecutive enforcer failures before giving up |
| `comment_checker_enabled` | boolean | `true` | Detect and flag AI slop comments in code |
| `checkpoint_dir` | string | `"workspace/checkpoints"` | Directory for checkpoint files |
| `model_routing` | object | `{}` | Override default model per category |
| `preferred_language` | enum | `"mixed"` | Primary language: `python`, `rust`, `typescript`, `mixed` |
| `research_depth` | enum | `"standard"` | Default depth: `shallow`, `standard`, `deep` |
| `team_agent_ids` | string[] | `[]` | OpenClaw agent IDs for team coordination |

## Example Configuration

```json
{
  "plugins": {
    "polyforge": {
      "path": "./polyforge/plugin",
      "config": {
        "max_auto_iterations": 20,
        "preferred_language": "python",
        "research_depth": "deep",
        "team_agent_ids": ["team-lead", "frontend-agent"],
        "checkpoint_dir": "workspace/checkpoints",
        "model_routing": {
          "deep": {
            "model": "claude-sonnet-4-20250514",
            "alternatives": ["gpt-4o"]
          },
          "research": {
            "model": "claude-sonnet-4-20250514"
          }
        }
      }
    }
  }
}
```

## Model Routing

Use `model_routing` to specify which model handles each category:

```json
{
  "model_routing": {
    "<category>": {
      "model": "<primary-model-id>",
      "alternatives": ["<fallback-model-1>", "<fallback-model-2>"]
    }
  }
}
```

Categories: `quick`, `deep`, `apex`, `research`, `rust`, `python`, `typescript`, `review`, `writing`, `unspecified-low`, `unspecified-high`.

## Language Configuration

`preferred_language` affects:
- **lang-detector hook**: Prioritizes the configured language in detection
- **Skill injection**: Injects the corresponding language skill by default
- **Verification commands**: Uses the appropriate test runner

| Value | Skills Injected | Verification |
|---|---|---|
| `python` | `python-backend.md` | `pytest` + type checker |
| `rust` | `rust-systems.md` | `cargo check && cargo test` |
| `typescript` | `typescript-backend.md` | `tsc --noEmit && vitest run` |
| `mixed` | Detected per file | Per-language verification |

## Research Depth

| Depth | Description |
|---|---|
| `shallow` | Quick overview, 1-2 sources |
| `standard` | GitHub health check + docs + community |
| `deep` | Exhaustive: benchmarks + case studies + source review |
