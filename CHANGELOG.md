# Changelog

All notable changes to PolyForge will be documented in this file.

## [0.2.0] - 2026-04-01

### Added
- Workflow engine service with phase definitions and state machine
- Phase transition tool (pf_phase_transition) for controlled workflow progression
- Phase context injection hook for enriching agent context per phase
- ACP client for spawning subagents with pf_spawn_subagent tool
- Approval gate hook for tool interception and workflow control
- Detached agent monitor hook for tracking spawned agents
- Intelligent spawn strategy analyzer for optimized agent distribution
- Proactive suggestion engine for anticipatory guidance
- Quality evaluator for workflow phase gates
- Approval learner for adaptive workflow learning
- Workflow enforcement and intelligent features configuration
- Integration tests for workflow engine

### Changed
- Updated initial state tests to use timestamps for accuracy

## [0.1.0] - 2026-03-31

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
