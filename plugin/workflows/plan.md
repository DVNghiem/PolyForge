# Workflow: Plan

## Trigger

`/plan [topic or file]`, or keywords: "create a plan", "break this down".

## Persona

`pf_atlas` by default.

## Pipeline

### Phase 1: Context Gathering
- **Input**: Topic or existing plan file
- **Actions**:
  - Read existing Task Brief (if available)
  - Identify target language(s)
  - Explore relevant codebase areas
- **Output**: Understanding of scope and context
- **Done when**: Language identified, relevant files mapped

### Phase 2: Task Decomposition
- **Input**: Requirements and context
- **Actions**:
  - Break work into discrete, delegable tasks
  - Assign category and default agent per task
  - Map dependencies between tasks
  - Estimate size: small / medium / large
- **Output**: Task list with dependencies
- **Done when**: All tasks are specific and actionable

### Phase 3: Gap Analysis Review
- **Input**: Draft plan
- **Actions**: Send to `pf_analyst` for gap analysis
- **Output**: Review feedback
- **Done when**: No BLOCKER issues remain

### Phase 4: Plan Document
- **Input**: Reviewed task list
- **Actions**:
  - Write plan to `workspace/plans/<YYYY-MM-DD>_<slug>.md`
  - Include: Goal, Language, Tasks, Dependencies, Acceptance Criteria, Risks, Status (draft)
- **Output**: Plan file
- **Done when**: Plan file written

### Phase 5: Approval
- **Input**: Plan file
- **Actions**: Present to user for review
- **Output**: Approved or revision requested
- **Done when**: User decides

## Hard Rules

1. Every task must have a category and default agent assigned
2. Acceptance criteria must be measurable and binary
3. Plan must include language field
4. Maximum 3 risks with mitigation for each
5. Plan starts as `draft` — never auto-approve

## Output Contract

- File: `workspace/plans/<YYYY-MM-DD>_<slug>.md`
- Response: Plan summary + request for approval
