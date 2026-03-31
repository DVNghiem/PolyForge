# Workflow: Intake

## Trigger

`/intake [task description]`, or keywords: "new task", "received a task", "PM wants", "issue says".

## Persona

`pf_atlas` by default.

## Pipeline

### Phase 1: Parse Requirements
- **Input**: Raw task description
- **Actions**: Run `pf_intake` tool → get structured Task Brief JSON
- **Output**: Task Brief with requirements, constraints, acceptance criteria, unknowns
- **Done when**: Task Brief JSON is produced

### Phase 2: Gap Analysis
- **Input**: Task Brief
- **Actions**: Analyst agent reviews for:
  - What's unclear in the requirements?
  - What constraints were not stated?
  - What assumptions are being made?
- **Output**: Gap analysis report with clarifying questions (batch, max 5)
- **Done when**: All questions are either answered or marked as acceptable risks

### Phase 3: Research Trigger (Conditional)
- **Input**: Task Brief unknowns
- **Actions**:
  - If task involves unfamiliar technology → trigger `/research` first
  - If task is well-understood → skip to Phase 4
- **Output**: Research findings (if triggered) or skip
- **Done when**: All technology questions resolved

### Phase 4: Plan Stub
- **Input**: Refined Task Brief
- **Actions**:
  - Identify the target language
  - Create `workspace/plans/<YYYY-MM-DD>_<slug>.md`
  - Structure: goal, language, requirements (checklist), task list, risks
- **Output**: Plan file
- **Done when**: Plan file written and presented to user

### Phase 5: Hand-off
- **Input**: Plan file + user decision
- **Actions**:
  - Approved? → Run `/execute <plan-file>`
  - Needs revision? → User edits, then re-run `/execute`
- **Output**: Execution started or revision requested
- **Done when**: User decides on next step

## Hard Rules

1. Always produce a Task Brief before planning
2. If `unknowns` list is non-empty, ask clarifying questions before planning
3. Never create a plan without identifying the target language
4. Batch clarifying questions — max 5 at a time
5. Every acceptance criterion must be measurable and binary

## Output Contract

- File: `workspace/plans/<YYYY-MM-DD>_<slug>.md`
- Response: Task Brief summary + plan outline + request for approval
