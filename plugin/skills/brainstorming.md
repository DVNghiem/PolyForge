# Brainstorming

Structured ideation framework for technical decisions and design problems.

## Phase 1: Problem Framing

Before generating any ideas, answer:
- **What problem are we solving?** (1-2 sentences)
- **What does success look like?** (measurable definition)
- **Constraints**: time, tech stack, team size, budget, reversibility
- **Non-goals**: what are we explicitly NOT solving?

## Phase 2: Divergent Thinking

Generate at least **3 distinct approaches** without evaluating them. Rules:
- Include one "obvious" option
- Include one "unconventional" option
- No criticism in this phase — quantity over quality
- Each approach gets: name, 2-3 sentence description, key trade-off

## Phase 3: Convergent Evaluation

Score each approach:

| Approach | Feasibility (1-5) | Impact (1-5) | Complexity (1-5) |
|---|---|---|---|
| ... | ... | ... | ... |

Apply hard constraints as filters:
- Eliminate options that violate constraints
- Identify top 1-2 candidates with justification

## Phase 4: Decision Capture

Document the decision:
```markdown
# Decision: <topic>
## Date: <YYYY-MM-DD>
## Context
<Why this decision was needed>
## Options Considered
1. <Option A> — rejected because <reason>
2. <Option B> — rejected because <reason>
3. <Option C> — **selected** because <reason>
## Consequences
<Expected impact and risk>
```

Save to: `workspace/decisions/<date>_<topic>.md`

## Anti-Patterns

- Anchoring on the first idea suggested
- Skipping the divergent phase ("the answer is obvious")
- Deciding without writing down reasoning
- Single-option "brainstorm" (minimum 3 required)
- Evaluating during the divergent phase (kills creativity)
