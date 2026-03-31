/**
 * Canonical source for all PolyForge agent IDs and their metadata.
 * Single source of truth for agent identification across the plugin.
 */

/** Orchestrator-tier agents (coordination and task distribution) */
export const ORCHESTRATOR_IDS = new Set([
  'pf_atlas',
]);

/** Worker-tier agents (implementation and execution) */
export const WORKER_IDS = new Set([
  'pf_sprint',
  'pf_forge',
]);

/** Maps agent ID to markdown persona filename (without extension) */
export const AGENT_MD_MAP: Record<string, string> = {
  pf_atlas: 'atlas',
  pf_sprint: 'sprint',
  pf_forge: 'forge',
  pf_architect: 'architect',
  pf_researcher: 'researcher',
  pf_analyst: 'analyst',
  pf_critic: 'critic',
  pf_explorer: 'explorer',
};

/** Maps agent ID to model tier for provider preset selection */
export const AGENT_TIER_MAP: Record<string, 'reasoning' | 'analysis' | 'worker' | 'deep-worker' | 'search'> = {
  pf_atlas: 'reasoning',
  pf_architect: 'reasoning',
  pf_analyst: 'analysis',
  pf_critic: 'analysis',
  pf_researcher: 'analysis',
  pf_sprint: 'worker',
  pf_forge: 'deep-worker',
  pf_explorer: 'search',
};

/** All agent IDs (orchestrators + workers + read-only specialists) */
export const ALL_AGENT_IDS = [
  ...ORCHESTRATOR_IDS,
  ...WORKER_IDS,
  'pf_architect',
  'pf_researcher',
  'pf_analyst',
  'pf_critic',
  'pf_explorer',
];
