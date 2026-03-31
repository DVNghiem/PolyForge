# Code Review

Backend code review checklist for PolyForge agents.

## Correctness

- Edge cases: empty inputs, nulls, boundary values, concurrent access
- Error handling: are all error paths handled? Are errors propagated correctly?
- Concurrency: data races, deadlocks, proper locking, atomic operations
- Resource cleanup: file handles closed, connections returned to pool, locks released

## Security (OWASP-aligned)

- **Injection**: SQL parameterized queries, no string concatenation for commands
- **Authentication**: tokens validated, sessions managed, password hashing (bcrypt/argon2)
- **Authorization**: access checks on every endpoint, no privilege escalation paths
- **Secrets**: no credentials in code, environment variables or secret managers
- **SSRF**: validate/restrict outbound URLs
- **Error disclosure**: no stack traces in API responses, proper error sanitization

## Performance

- N+1 queries: batch database operations, use joins or prefetch
- Allocations: avoid unnecessary copies in hot paths (especially Rust)
- Async correctness: no blocking in async context
- Indexes: new queries have supporting database indexes
- Caching: appropriate cache invalidation strategy

## Style (Per Language)

### Rust
- No `unwrap()` in production (use `?` or `expect`)
- No excessive `.clone()` (restructure ownership)
- Clippy clean: `cargo clippy -- -D warnings`

### Python
- Type annotations on public functions
- No mutable default args
- No bare `except:`
- mypy clean: `mypy --strict`

### TypeScript
- No `any` (use `unknown` + type guards)
- Strict mode: `tsc --noEmit` clean
- Await all promises (no fire-and-forget)

## Tests

- Happy path covered
- Error cases covered (at least one per error type)
- No flaky assertions (avoid timing-dependent tests)
- Meaningful test names describing behavior

## Severity Levels

- **[BLOCKER]**: Must fix. Correctness, security, or data loss.
- **[MAJOR]**: Should fix. Performance, reliability, maintainability.
- **[MINOR]**: Nice to fix. Style, naming, minor improvement.
- **[SUGGESTION]**: Optional. Improvement for consideration.
