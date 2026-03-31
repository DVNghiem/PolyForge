/**
 * Defines the PolyForge plugin's local agent configuration contracts
 * and the canonical list of built-in PF agent definitions.
 */
import { READ_ONLY_DENY } from '../constants.js';

export type PfAgentConfig = {
  id: string;
  name?: string;
  model?: string | { primary: string; fallbacks?: string[] };
  skills?: string[];
  identity?: { name?: string; theme?: string; emoji?: string };
  subagents?: {
    allowAgents?: string[];
    model?: string | { primary: string; fallbacks?: string[] };
  };
  tools?: {
    profile?: 'minimal' | 'coding' | 'messaging' | 'full';
    allow?: string[];
    deny?: string[];
  };
};

export const PF_AGENT_CONFIGS: PfAgentConfig[] = [
  // Task orchestration coordinator.
  {
    id: 'pf_atlas',
    name: 'Atlas',
    model: {
      primary: 'anthropic/claude-opus-4-6-thinking',
      fallbacks: ['openai/gpt-5.3-codex'],
    },
    identity: {
      name: 'Atlas',
      emoji: '🗺️',
      theme: 'Work Coordinator',
    },
    tools: { profile: 'full' },
    subagents: { allowAgents: ['*'] },
  },
  // Primary implementation worker (quick tasks).
  {
    id: 'pf_sprint',
    name: 'Sprint',
    model: {
      primary: 'anthropic/claude-sonnet-4-6',
      fallbacks: ['openai/gpt-4.1'],
    },
    identity: {
      name: 'Sprint',
      emoji: '🏃',
      theme: 'Implementation Worker',
    },
    tools: { profile: 'full' },
    subagents: {
      allowAgents: ['pf_explorer', 'pf_researcher', 'pf_architect'],
    },
  },
  // Deep implementation specialist.
  {
    id: 'pf_forge',
    name: 'Forge',
    model: {
      primary: 'anthropic/claude-opus-4-6',
      fallbacks: ['openai/gpt-5.3-codex'],
    },
    identity: {
      name: 'Forge',
      emoji: '🔥',
      theme: 'Deep Implementation Specialist',
    },
    tools: { profile: 'full' },
    subagents: {
      allowAgents: ['pf_explorer', 'pf_researcher', 'pf_architect'],
    },
  },
  // Read-only architecture consultant (was Oracle).
  {
    id: 'pf_architect',
    name: 'Architect',
    model: {
      primary: 'openai/gpt-5.3-codex',
      fallbacks: ['anthropic/claude-opus-4-6'],
    },
    identity: {
      name: 'Architect',
      emoji: '🏛️',
      theme: 'Architecture Consultant',
    },
    tools: {
      profile: 'coding',
      deny: READ_ONLY_DENY,
    },
  },
  // Technology research specialist (was Librarian, significantly expanded).
  {
    id: 'pf_researcher',
    name: 'Researcher',
    model: 'anthropic/claude-sonnet-4-6',
    identity: {
      name: 'Researcher',
      emoji: '📡',
      theme: 'Technology Research',
    },
    tools: {
      profile: 'coding',
      deny: READ_ONLY_DENY,
    },
  },
  // Gap analysis / requirement completeness (was Metis).
  {
    id: 'pf_analyst',
    name: 'Analyst',
    model: {
      primary: 'anthropic/claude-opus-4-6',
      fallbacks: ['openai/gpt-5.3-codex'],
    },
    identity: {
      name: 'Analyst',
      emoji: '🧠',
      theme: 'Gap Analysis',
    },
    tools: {
      profile: 'coding',
      deny: READ_ONLY_DENY,
    },
  },
  // Plan and code critic (was Momus).
  {
    id: 'pf_critic',
    name: 'Critic',
    model: {
      primary: 'anthropic/claude-opus-4-6',
      fallbacks: ['openai/gpt-5.3-codex'],
    },
    identity: {
      name: 'Critic',
      emoji: '🎭',
      theme: 'Plan & Code Reviewer',
    },
    tools: {
      profile: 'coding',
      deny: READ_ONLY_DENY,
    },
  },
  // Read-only codebase search specialist.
  {
    id: 'pf_explorer',
    name: 'Explorer',
    model: 'anthropic/claude-sonnet-4-6',
    identity: {
      name: 'Explorer',
      emoji: '🔍',
      theme: 'Codebase Search',
    },
    tools: {
      profile: 'coding',
      deny: READ_ONLY_DENY,
    },
  },
];
