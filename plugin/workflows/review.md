# Workflow: Review

## Trigger

`/review [target]`, or keywords: "code review", "PR review", "review this", "audit".

## Persona

`pf_critic` by default.

## Pipeline

### Phase 1: Scope
- **Input**: Review target (file path, PR description, design doc, plan file)
- **Actions**:
  - Identify what is being reviewed
  - Determine applicable criteria: correctness, security, performance, style, tests
  - Identify the language(s) involved
- **Output**: Review scope definition
- **Done when**: Target, criteria, and language identified

### Phase 2: Review Execution
- **Input**: Scoped review target
- **Actions**:
  - Read all relevant files
  - Apply `code-review.md` checklist per language:
    - Correctness: edge cases, error handling, concurrency safety
    - Security (OWASP): injection, auth, secrets, SSRF, error disclosure
    - Performance: N+1 queries, allocations, async correctness
    - Style: idiomatic code, naming, dead code
    - Tests: coverage, flakiness, naming
  - Report: [PASS] or [FAIL] per criterion
  - List specific issues with file:line references
- **Output**: Issue list with severity
- **Done when**: All applicable criteria checked

### Phase 3: Recommendations
- **Input**: Issue list
- **Actions**:
  - Prioritize: BLOCKER / MAJOR / MINOR / SUGGESTION
  - Provide concrete fix suggestions for all BLOCKERs
  - Provide fix suggestions for all MAJORs
- **Output**: Prioritized recommendations
- **Done when**: All issues categorized and fixes suggested

### Phase 4: Sign-off
- **Input**: Complete review
- **Actions**:
  - [APPROVED] if no blockers
  - [CHANGES REQUESTED] if blockers exist
  - Note positive aspects of the code
- **Output**: Review verdict
- **Done when**: Verdict delivered

## Hard Rules

1. Always read the actual code — never review from memory
2. Every issue above MINOR must include a concrete fix suggestion
3. Reference file:line for every issue
4. Acknowledge at least one positive aspect
5. Use severity levels consistently — BLOCKER = ship-stopping, not style preference

## Output Contract

- Response: Structured review with verdict, issues, and recommendations
- No files created unless user requests a written review document
