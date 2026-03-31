# Workflows for Skills

How to author a PolyForge workflow document.

## Purpose

A workflow document specifies a multi-phase pipeline with a well-defined trigger, structured phases, and hard rules.

## File Location

`plugin/workflows/<name>.md`

## Required Sections

### Trigger
- Exact command (e.g., `/brainstorm`)
- Natural-language patterns that match (e.g., "which approach", "evaluate options")

### Pipeline (Phases)
Each phase has:
- **Name**: Descriptive phase name
- **Inputs**: What data enters this phase
- **Actions**: What the agent does
- **Outputs**: What this phase produces
- **Completion condition**: How to know this phase is done

### Hard Rules
3-5 rules the agent MUST NEVER violate:
- Rules that override user instruction
- Safety constraints
- Quality gates

### Output Contract
- What files are written
- What is returned to the user
- In what format

### Persona
- Which agent runs this workflow by default
- Under what conditions a different agent is substituted

## Example

```markdown
# Workflow: <Name>

## Trigger
`/command` or natural-language patterns: "..."

## Persona
`pf_<agent>` by default

## Pipeline

### Phase 1: <Name>
- **Input**: <...>
- **Actions**: <...>
- **Output**: <...>
- **Done when**: <...>

## Hard Rules
1. Never skip <phase>
2. Always <constraint>

## Output Contract
- File: `workspace/<path>`
- Response: <format description>
```

## Companion Skill

Every workflow involving domain expertise should reference a companion skill file in its CONTEXT section.
