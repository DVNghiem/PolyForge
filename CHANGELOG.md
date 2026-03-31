# Changelog

All notable changes to PolyForge will be documented in this file.

## [0.1.0] - Unreleased

### Added
- Initial PolyForge plugin implementation
- 8 specialized agent personas: Atlas, Sprint, Forge, Architect, Researcher, Analyst, Critic, Explorer
- 11 task category routing system (quick, deep, apex, research, rust, python, typescript, review, writing, unspecified-low, unspecified-high)
- Core tools: pf_delegate, pf_spawn_acp, pf_research, pf_intake, pf_search, pf_checkpoint
- Todo management: pf_todo_create, pf_todo_list, pf_todo_update
- Commands: /pf, /triage, /research, /intake, /plan, /execute, /work, /review, /brainstorm, /todos, /autorun, /stop
- 11 hooks: todo-enforcer, comment-checker, message-monitor, guardrail-injector, context-injector, session-sync, spawn-guard, keyword-detector, lang-detector, subagent-tracker, todo-reminder
- 21 skill documents covering Python, Rust, TypeScript, research, intake, API design, code review, and more
- 8 workflow documents: triage, research, intake, plan, execute, review, brainstorm, work
- Language-aware verification (pytest/cargo/vitest per detected language)
- Anti-hallucination guardrails (8 rules)
- Autorun loop service with configurable iteration limits
- CLI setup wizard (pf-setup)
- Context collector with priority ordering and TTL pruning
