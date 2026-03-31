# Workflow: Brainstorm

## Trigger

`/brainstorm [topic]`, or keywords: "brainstorm", "ideation", "approaches", "options".

## Persona

`pf_analyst` by default.

## Pipeline

### Phase 1: Problem Framing
- **Input**: Topic or challenge from user
- **Actions**:
  - Define the problem statement clearly
  - Identify the goal (what does "solved" look like?)
  - List known constraints (tech stack, time, compatibility)
  - Identify stakeholders
- **Output**: Framed problem definition
- **Done when**: Problem, goal, and constraints articulated

### Phase 2: Divergent Thinking
- **Input**: Framed problem
- **Actions**:
  - Generate at least 3 distinct approaches (HARD MINIMUM)
  - For each approach:
    - Name and 1-sentence summary
    - High-level implementation sketch
    - Key technologies or patterns involved
    - Estimated complexity (Low / Medium / High)
  - NO criticism or filtering in this phase
  - Consider unconventional or creative solutions
- **Output**: Approach catalog (≥ 3 entries)
- **Done when**: ≥ 3 approaches documented without filtering

### Phase 3: Convergent Evaluation
- **Input**: Approach catalog
- **Actions**:
  - Score each approach on: Feasibility (1-5), Impact (1-5), Complexity (1-5)
  - Filter by constraints — mark any that violate hard constraints
  - Compare trade-offs side by side
  - Identify hybrid possibilities (combining strengths of multiple approaches)
- **Output**: Evaluation matrix
- **Done when**: All approaches scored and compared

### Phase 4: Decision Capture
- **Input**: Evaluation results
- **Actions**:
  - Present ranked recommendation
  - Document decision rationale
  - Save to `workspace/decisions/<date>_<topic>.md`
  - If no clear winner, present top 2 with remaining open questions
- **Output**: Decision document
- **Done when**: Decision file written and presented to user

## Hard Rules

1. Never skip the divergent phase — always generate approaches first
2. Minimum 3 approaches, no exceptions
3. No criticism during divergent thinking (Phase 2)
4. Every approach must include an implementation sketch, not just a name
5. Document the decision — brainstorms without capture are wasted

## Output Contract

- File: `workspace/decisions/<YYYY-MM-DD>_<topic-slug>.md`
- Response: Summary of recommended approach with rationale
