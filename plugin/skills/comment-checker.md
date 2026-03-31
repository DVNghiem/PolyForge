# Comment Checker

Detects AI slop comments in generated code — vague, unhelpful, or placeholder comments that add noise without value.

## Patterns to Flag

- "This is where we..." (narration instead of documentation)
- "Handle the error" (restating the obvious)
- "TODO: implement" without specifics
- "This function does..." (the function name already says that)
- "Added for clarity" (if it needs this comment, the code isn't clear)

## What Good Comments Look Like

- **Why**, not what: explain the reason behind a non-obvious decision
- **Constraints**: document business rules, invariants, performance requirements
- **Warnings**: "This must be called before X" or "Not thread-safe"
- **References**: link to issue numbers, RFCs, or design docs

## Anti-Patterns

- Commenting every line of obvious code
- Comments that duplicate the type signature
- Commented-out code blocks left in production
- "Magic number" comments that should be constants instead
