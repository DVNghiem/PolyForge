# Ruby Backend

Ruby backend development patterns for PolyForge agents.

## Rails

- Follow convention over configuration — place files where Rails expects them
- Thin controllers: validate params, call a service/interactor, render response
- Concerns (`app/concerns/`) for shared, reusable behavior across models or controllers
- Use `before_action` for authentication/authorization; skip it explicitly when needed
- `strong_parameters` via `params.require(:resource).permit(...)` — always whitelist input

## ActiveRecord

- Prefer scopes over class methods for chainable query composition
- `includes` / `eager_load` to avoid N+1 queries; use `bullet` gem in development to detect them
- Validate at the model layer with `validates :field, presence: true, uniqueness: true`
- Callbacks sparingly — they make code harder to test and reason about
- Database indexes on all foreign keys and frequently queried columns

## Async / Background Jobs

- **Sidekiq** (preferred): multi-threaded, Redis-backed; define jobs as `include Sidekiq::Job`
- **ActiveJob** for framework-agnostic interface; back it with Sidekiq in production
- Idempotent jobs — any job may be retried; do not assume single execution
- `sidekiq-cron` or `whenever` for scheduled recurring jobs

## Testing (RSpec)

- `spec/models/`, `spec/requests/`, `spec/services/` mirror the app structure
- `FactoryBot` for test data; avoid fixtures for non-trivial models
- `let` for lazy setup; `let!` only when side effects are needed before the example
- `RSpec::Mocks` (`allow`, `expect(...).to receive`) for external service stubs
- `DatabaseCleaner` with `:transaction` strategy for fast test isolation

## API-Only Rails

- `rails new myapp --api` to skip view/session middleware
- Serialize responses with `ActiveModelSerializers` or `jbuilder`
- JWT or session-based auth via `devise-jwt` or `rodauth`
- Return proper HTTP status codes: 201 Created, 422 Unprocessable Entity, 404 Not Found

## Anti-Patterns

- Fat models — extract business logic into POROs (Plain Old Ruby Objects) or service objects
- `rescue Exception` — only rescue `StandardError` or specific subclasses
- Callbacks for cross-model side effects — use service objects instead
- Dynamic `send` or `eval` with user input — serious security risk
- Skipping `strong_parameters` — always whitelist permitted attributes
