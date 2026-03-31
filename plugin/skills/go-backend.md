# Go Backend

Go backend development patterns for PolyForge agents.

## HTTP (net/http + chi / gin / echo)

- Standard library `net/http` is sufficient for most services; reach for a router only for complex routing
- **chi**: lightweight, idiomatic middleware chain (`r.Use(middleware.Logger)`)
- **gin**: batteries-included, best for quick APIs with built-in validation (`c.ShouldBindJSON`)
- **echo**: clean handler signatures, excellent middleware support
- Always set `ReadTimeout`, `WriteTimeout`, and `IdleTimeout` on `http.Server`

## Concurrency

- Prefer channels and goroutines over shared memory with locks
- Use `sync.WaitGroup` to coordinate goroutine completion
- `context.Context` as first argument to all long-running functions — respect cancellation
- `errgroup.Group` (golang.org/x/sync) for parallel fanout with error propagation
- Never leak goroutines — always ensure they can exit via context or channel close

## Error Handling

- Return `(T, error)` tuples; wrap errors with `fmt.Errorf("operation: %w", err)`
- Use `errors.Is` / `errors.As` for sentinel/type matching
- Define domain error types for typed inspection by callers
- Avoid panics in library code; reserve for truly unrecoverable states

## Modules and Packages

- One package per directory; keep package names short and lowercase
- `go.mod` is the source of truth for dependencies — commit `go.sum`
- Organize by domain, not by layer: `internal/user/`, not `internal/handlers/`
- `internal/` packages cannot be imported by external modules

## Database

- `database/sql` with `lib/pq` (PostgreSQL) or `go-sqlite3` for relational stores
- **sqlc**: generate type-safe Go from SQL queries — preferred over ORMs
- **pgx**: direct PostgreSQL driver with superior performance and type support
- Use `sql.Tx` for multi-step operations; always `defer tx.Rollback()` before `tx.Commit()`

## Testing

- `testing.T` with table-driven tests: `tests := []struct{ ... }{ ... }`
- `httptest.NewRecorder()` and `httptest.NewRequest()` for HTTP handler tests
- `testcontainers-go` for integration tests with real databases
- `t.Parallel()` at the top of each test case in table-driven loops
- Use `t.Helper()` in assertion helpers to report failures at the call site

## Anti-Patterns

- Named return values (except for defer-based cleanup) — they obscure intent
- Global state — inject dependencies explicitly
- `interface{}` / `any` where a typed interface suffices
- Ignoring `error` returns — always check
- `init()` functions with side effects — prefer explicit initialization
