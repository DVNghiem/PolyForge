# Recovery

Patterns for recovering from workflow failures, stuck loops, and blocked tasks.

## Stuck Loop Detection

Signs of a stuck loop:
- Same tool called 3+ times with identical inputs
- Agent cycling between two files without progress
- Error count increasing without resolution

## Recovery Actions

### Blocked by Error
1. Read the exact error message
2. Search for the error in documentation
3. Try an alternative approach
4. If blocked after 2 attempts → escalate to `pf_architect` for consultation

### Session Timeout
1. Save a checkpoint with `pf_checkpoint`
2. Record progress in notepad
3. Re-spawn with narrower scope, referencing the notepad

### Test Failure Loop
1. Read the failing test completely
2. Read the implementation code
3. Check if the test expectation is correct (test might be wrong)
4. Fix one failure at a time, verifying after each fix

### Dependency Conflict
1. Re-read the plan to check task ordering
2. Verify which files are in conflict
3. Serialize conflicting tasks
4. Resume parallel execution for non-conflicting tasks

## Escalation Ladder

1. **Retry** with adjusted approach (different search query, different tool)
2. **Consult** `pf_architect` for read-only guidance
3. **Report** to user with: what was attempted, what failed, what options remain

## Prevention

- Save checkpoints after every significant step
- Use notepads for inter-session state
- Don't attempt more than 2 retries on the same approach
- Break large tasks into smaller, independently-verifiable subtasks
