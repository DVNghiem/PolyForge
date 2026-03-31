# Git Master

Git operations reference for PolyForge agents.

## Commit Messages

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

Examples:
- `feat(auth): add JWT refresh token rotation`
- `fix(api): handle empty response body in rate limiter`
- `refactor(db): extract connection pool configuration`

## Branch Naming

Format: `<type>/<short-description>`

Examples: `feat/jwt-refresh`, `fix/rate-limiter-empty-body`

## Key Operations

- **Stage selectively**: `git add -p` to review each hunk
- **Amend safely**: `git commit --amend` only on unpushed commits
- **Rebase interactively**: `git rebase -i` for clean history before merge
- **Stash with message**: `git stash push -m "description"` not bare `git stash`

## Anti-Patterns

- `git add .` without reviewing what's staged
- Force push to shared branches
- Merge commits in feature branches (rebase instead)
- Committing generated files, secrets, or `.env` files
