# Dispatching Parallel Agents

Orchestrating multiple `pf_delegate` calls simultaneously.

## Dependency Analysis

Before firing agents, map task dependencies:
- Tasks with no shared output files and no logical dependency → parallel
- Tasks writing to the same file → serialize
- Tasks where output of A is input to B → serialize

## Conflict Detection

Two tasks conflict if they:
1. Write to the same file
2. Modify the same database table/migration
3. Change the same configuration

Always serialize conflicting tasks.

## Firing Pattern

Issue all independent `pf_delegate` calls in a **single message** to trigger parallel execution. Do not wait for one before issuing the next.

```
pf_delegate(task=A, category=quick) ← independent
pf_delegate(task=B, category=deep) ← independent
pf_delegate(task=C, category=rust) ← independent
```

## Progress Tracking

After firing parallel tasks:
1. Create a `pf_todo_create` for each parallel task
2. Mark each done as its result arrives
3. Don't proceed to next phase until ALL parallel tasks complete

## Result Merging

After collecting all results:
1. Verify consistency — check for contradictions
2. Check for file conflicts (two agents changed the same file)
3. Run full test suite on merged changes
4. If conflicts exist, resolve manually before proceeding

## Error Handling

If one parallel task fails:
- **Dependent tasks**: Cancel or pause them
- **Independent tasks**: Let them complete, then address the failure
- Don't retry a failed task while other parallel tasks are still running

## Max Concurrency

- **Recommended**: 4-6 concurrent tasks for complex work
- **Maximum**: 8 tasks (beyond this, coordination overhead outweighs gains)
- **Large fan-outs (10+)**: Break into batches of 4-6
