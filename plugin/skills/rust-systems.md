# Rust Systems

Rust backend and systems development patterns for PolyForge agents.

## Async (Tokio)

- `#[tokio::main]` for application entry; `#[tokio::test]` for async tests
- `tokio::spawn` for fire-and-forget tasks; `JoinSet` for collecting results
- `async_trait` for trait methods that are async
- Never block the runtime: use `tokio::task::spawn_blocking` for CPU-heavy or sync I/O
- Graceful shutdown: `tokio::signal::ctrl_c()` + `CancellationToken`

## Web (Axum)

- Route organization: separate handlers into modules by domain
- `State` extractor for shared application state (wrapped in `Arc`)
- Tower middleware layers for cross-cutting concerns (logging, auth, rate limiting)
- `IntoResponse` trait for custom error responses
- Extract request data with typed extractors: `Path`, `Query`, `Json`

## Error Handling

- `anyhow::Result` for applications (propagate errors up the stack)
- `thiserror::Error` for libraries (define typed error enums)
- `?` operator for propagation; `.context("message")` for enriching errors
- Never `unwrap()` in production code — use `.expect("reason")` only for invariants

## Serialization

- `serde` with `#[derive(Serialize, Deserialize)]` for JSON/TOML/YAML
- `#[serde(rename_all = "camelCase")]` for JSON API conventions
- Custom serialization only when derive macros don't suffice
- `serde_json::Value` for dynamic JSON; prefer typed structs

## Testing

- `#[test]` for sync, `#[tokio::test]` for async tests
- Integration tests in `tests/` directory (separate binary crates)
- `cargo-nextest` for parallel test execution
- `assert_eq!` with descriptive messages; `insta` for snapshot testing

## Cargo Workspace

- `[workspace.dependencies]` for shared dependency versions
- Feature flags for optional functionality: `#[cfg(feature = "...")]`
- `[profile.release]` optimizations: `lto = true`, `codegen-units = 1`

## Anti-Patterns

- Excessive `.clone()` — restructure to avoid when possible
- `String` where `&str` suffices (unnecessary allocation)
- Blocking in async context (`std::fs::read` in tokio — use `tokio::fs`)
- `unwrap()` in production code (use `?` or `expect`)
- Ignoring clippy warnings — run `cargo clippy -- -D warnings`
