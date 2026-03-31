# Tool Patterns

Patterns for effective tool usage in the OpenCode CLI environment.

## Read Before Write

Always read relevant files before modifying them:
```
read file.rs → understand structure → edit file.rs
```
Never guess file contents from memory.

## Verify After Change

After every code change:
1. Check for compilation/type errors
2. Run the relevant test suite
3. Verify no unintended side effects

## Search Efficiently

- Use `grep` for exact string matches
- Use `find` for file path patterns
- Use semantic search for concept-level queries
- Combine: `grep` to find the file, `read` to understand context

## Batch Operations

When multiple independent operations are needed:
- Fire independent reads in parallel
- Execute independent writes sequentially (to avoid conflicts)
- Group related changes into logical commits

## Error Handling in Tools

- If a tool call fails, report the exact error
- Don't retry the same call with the same inputs
- Try an alternative approach or ask for help

## File Operations

- Create files only when necessary — prefer editing existing files
- Use absolute paths consistently
- Check if a file exists before attempting to read it
- Clean up temporary files after use
