# Task Intake

Systematic task capture from PMs, issues, and team members.

## Parsing a PM Request

Extract from the raw request:
1. **Goal**: What outcome does the PM want?
2. **Deadline**: When is this needed?
3. **Stakeholders**: Who cares about this?
4. **Constraints**: Budget, tech stack, backward compatibility?
5. **Context**: Why now? What triggered this request?

## Parsing a GitHub Issue

1. **Reproduce**: Can you reproduce the described behavior?
2. **Understand**: What's the root cause vs. symptom?
3. **Clarify**: What information is missing?
4. **Estimate**: How complex is this? (quick/deep/apex)

## Requirement Template

```
## What
<Concrete deliverable>

## Why
<Business reason / user impact>

## Who
<Stakeholders / end users>

## When
<Deadline / priority>

## Constraints
- <Technical constraint>
- <Backward compatibility requirement>

## Acceptance Criteria
- [ ] <Measurable, binary criterion>

## Unknowns
- <What needs to be researched or clarified>
```

## Red Flags

- Vague acceptance criteria ("it should work well")
- Implicit scope ("and also handle edge cases")
- Unstated dependencies ("this needs to work with the new auth system")
- Missing language context ("build a service" — in which language?)

## Clarification Questions

- Batch questions (max 5 at once)
- Avoid yes/no questions — ask for specifics
- Prioritize blockers over nice-to-knows
- Example: "What database should the audit logs be stored in?" not "Is the database decided?"
