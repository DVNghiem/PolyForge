# Workflow: Research

## Trigger

`/research [topic]`, `pf_researcher` persona active, or keywords: "investigate", "evaluate", "should we use", "compare".

## Persona

`pf_researcher` by default.

## Pipeline

### Phase 1: Scope Definition
- **Input**: Topic and optional goal
- **Actions**: Define what decision this research informs. Set acceptance criteria for the recommendation.
- **Output**: Scoped research question
- **Done when**: Research question and acceptance criteria are stated

### Phase 2: Parallel Investigation
- **Input**: Scoped research question
- **Actions**:
  - Search for official documentation (context7 MCP if available)
  - Web search: benchmarks, comparisons, community sentiment
  - GitHub: repo health, issue velocity, recent commits
  - Identify competitors/alternatives
- **Output**: Raw research data
- **Done when**: At least 4 searches completed with relevant results

### Phase 3: Synthesis
- **Input**: Raw research data
- **Actions**: Write structured Tech Brief:
  - Summary (2-3 sentences)
  - Pros / Cons
  - Performance / Maturity / Community notes
  - Use case fit assessment
  - Recommendation with confidence level
- **Output**: Tech Brief markdown
- **Done when**: All sections of Tech Brief are filled

### Phase 4: Presentation
- **Input**: Tech Brief
- **Actions**:
  - Save to `workspace/research/<date>_<topic>.md`
  - Present brief to user
  - Ask: "Proceed with implementation based on this recommendation?"
- **Output**: Saved Tech Brief + user decision
- **Done when**: User acknowledges the brief

## Hard Rules

1. Never recommend a technology without checking its current GitHub activity
2. Always include at least one alternative in the comparison
3. Always state confidence level: HIGH / MEDIUM / LOW
4. Save the tech brief to disk — don't leave findings only in chat
5. For "deep" research depth, require at least 8 searches

## Output Contract

- File: `workspace/research/<YYYY-MM-DD>_<topic-slug>.md`
- Response: Tech Brief summary + recommendation
