# Task Intake

PolyForge's task intake workflow transforms raw requests from PMs, issues, or self-initiated tasks into structured, actionable plans.

## Quick Start

```bash
/intake PM wants async audit logging for all API calls by Friday
```

## How It Works

### Phase 1: Parse the Request
- Extract requirements from natural language
- Identify the task type (feature, bug, refactor, research)
- Detect mentioned technologies and languages

### Phase 2: Gap Analysis
- Identify unknowns and ambiguities
- Flag missing requirements (acceptance criteria, scope boundaries)
- Ask focused clarifying questions (max 3)

### Phase 3: Research Trigger (Conditional)
- If unknowns involve unfamiliar technology, trigger `/research`
- Feed research results back into the brief

### Phase 4: Plan Stub
- Generate a structured Task Brief JSON
- Suggest category and default agent
- List files likely to be affected

### Phase 5: Handoff
- Present brief to user for approval
- On approval, transition to `/plan` or `/execute`

## Task Brief Format

```json
{
  "title": "Async Audit Logging API Middleware",
  "type": "feature",
  "language": "python",
  "requirements": [
    "Log all API calls asynchronously",
    "Include request/response metadata",
    "Must not impact API response time"
  ],
  "acceptance_criteria": [
    "All endpoints logged",
    "< 5ms overhead per request",
    "Logs queryable by endpoint and time range"
  ],
  "unknowns": [],
  "suggested_category": "deep",
  "estimated_complexity": "medium",
  "files_involved": ["src/middleware/", "src/logging/"]
}
```

## Integration

```bash
# Intake → Plan → Execute
/intake Fix the login timeout bug reported in issue #142
# → Task Brief produced
# → User approves
/plan  # → Execution plan
/execute  # → Delegated work
```

## Tips

- Be as specific as possible in the task description
- Include context: deadlines, constraints, related issues
- If the intake asks questions, answer them — it produces better plans
