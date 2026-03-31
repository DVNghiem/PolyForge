# Writing Plans

How to author a PolyForge execution plan document.

## File Location

`workspace/plans/<YYYY-MM-DD>_<slug>.md`

## Required Sections

```markdown
# Plan: <Title>

## Goal
<One paragraph describing the objective>

## Language
python | rust | typescript | mixed

## Tasks
- [ ] task-1: <description> [category: quick] [agent: pf_sprint] [est: small]
- [ ] task-2: <description> [category: deep] [agent: pf_forge] [est: medium]
  - depends_on: [task-1]
- [ ] task-3: <description> [category: review] [agent: pf_critic] [est: small]
  - depends_on: [task-1, task-2]

## Dependencies
<Dependency graph — which tasks must complete before others>

## Acceptance Criteria
- [ ] <Measurable, binary criterion>
- [ ] <Another criterion>

## Risks
1. <Risk description> | likelihood: low/medium/high | mitigation: <...>

## Status
draft | approved | in-progress | completed | cancelled
```

## Task Entry Format

Each task must include:
- **task-id**: unique identifier within the plan
- **description**: what to do (specific, actionable)
- **category**: which `pf_delegate` category
- **agent**: default agent (can be overridden)
- **est**: size estimate (small/medium/large)
- **depends_on**: list of task-ids this depends on (optional)

## Writing Rules

- Acceptance criteria must be measurable and binary (pass/fail)
- Avoid subjective criteria like "code is clean"
- List at most 3 risks with mitigation for each
- Share plan with `pf_critic` for gap analysis before activating
- Status starts as `draft` until user approves
