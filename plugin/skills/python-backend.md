# Python Backend

Python backend development patterns for PolyForge agents.

## FastAPI

- Define routes with type-annotated parameters: `async def get_user(user_id: int) -> User`
- Use Pydantic models for request/response validation, not raw dicts
- Dependency injection via `Depends()` for shared resources (DB sessions, auth)
- Background tasks: `BackgroundTasks` for fire-and-forget, Celery/ARQ for reliable queues
- Middleware: use `@app.middleware("http")` for cross-cutting concerns

## Async Patterns

- `async def` for I/O-bound handlers; never block the event loop with sync calls
- `asyncio.gather()` for parallel I/O; `asyncio.TaskGroup` (3.11+) for structured concurrency
- Use `httpx.AsyncClient` for HTTP calls, not `requests`
- Database: `asyncpg` or `databases` for async PostgreSQL

## Testing

- `pytest` with `pytest-asyncio` for async tests
- `httpx.AsyncClient` as test client for FastAPI
- Fixtures for database setup/teardown: `@pytest.fixture(scope="function")`
- Parametrize edge cases: `@pytest.mark.parametrize`

## Typing

- Use `TypeVar`, `Generic`, `Protocol` for generic interfaces
- `ParamSpec` for decorator type preservation
- `TypeAlias` for complex type annotations
- Avoid `Any` — use `object` or `Unknown` patterns

## Packaging

- `uv` (preferred) or `poetry` for dependency management
- `pyproject.toml` as single source of truth
- `__init__.py` for packages; `py.typed` marker for typed packages
- Version pinning: use `>=x.y,<x+1` for libraries, exact pins for applications

## Anti-Patterns

- Mutable default arguments: `def f(items=[])` → use `None` with default
- Bare `except:` — always catch specific exceptions
- Import cycles — restructure with dependency inversion
- Blocking calls in async context — use `asyncio.to_thread()` for sync I/O
- `os.path` in new code — use `pathlib.Path`
