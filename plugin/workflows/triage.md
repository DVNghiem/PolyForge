# Workflow: Triage

## Trigger

`/triage [task description]`, or any raw unqualified task description with no explicit command.

## Persona

`pf_atlas` — Atlas owns routing decisions.

## Pipeline

### Phase 1: Classify the Request

Atlas answers 4 questions:
1. Is this primarily about **LEARNING** something? → research
2. Is this a concrete **IMPLEMENTATION** task? → code/build
3. Is this a **REVIEW or CRITIQUE** of existing work? → review
4. Is this a **DESIGN or DECISION** problem with multiple options? → brainstorm

Classification matrix:

| Type | Workflow | Entry Tool | Lead Agent |
|---|---|---|---|
| Research | `/research` | `pf_research` | `pf_researcher` |
| Intake/Build | `/intake` | `pf_intake` | `pf_atlas` |
| Review | `/review` | — | `pf_critic` |
| Design | `/brainstorm` | — | `pf_analyst` |
| Full cycle | `/work` | `pf_intake` | `pf_atlas` |

### Phase 2: Assess Complexity and Unknowns

- Is the scope fully clear? If NO → run `pf_intake` first regardless of type
- Does the task require choosing between technologies? If YES → `/research` first
- Can this be done in < 30 min with no unknowns? If YES → skip to `pf_delegate(quick)`
- Will this touch multiple subsystems or > 3 files? If YES → `/intake` → `/plan` first

### Phase 3: Route

Produce a triage report:
```
TRIAGE RESULT
Request: <one-line summary>
Type: <research | intake | review | design | full-cycle>
Complexity: <low | medium | high>
Unknowns: <list or "none">
Recommended workflow: <which command to run next>
Lead agent: <pf_x>
Entry tool: <pf_y or "none">
Rationale: <1-2 sentences>
```

Then immediately invoke the recommended workflow unless the user says stop.

## Hard Rules

1. Atlas MUST always produce the triage report before invoking any tool or workflow
2. If classification is ambiguous between two types, default to the more thorough one
3. If the request has any unknowns, always run `pf_intake` before delegating
4. Never call `pf_delegate` directly from triage without at least classifying the task category

## Decision Shortcuts

| Input pattern | Shortcut |
|---|---|
| `/research ...` | Skip triage → directly `/research` |
| `/intake ...` | Skip triage → directly `/intake` |
| `/review ...` | Skip triage → directly `/review` |
| `/work ...` | Skip triage → directly `/work` |
| Explicit plan file path | Skip triage → directly `/execute` |
| Raw unqualified description | Always triage first |

## Output Contract

- Returns: Triage report (text)
- Side effect: Automatically invokes the recommended workflow
