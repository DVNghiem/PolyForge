import type { PfPluginApi, PluginConfig } from '../types.js';

const DEFAULTS: PluginConfig = {
  max_auto_iterations: 10,
  todo_enforcer_enabled: true,
  todo_enforcer_cooldown_ms: 2000,
  todo_enforcer_max_failures: 5,
  comment_checker_enabled: true,
  checkpoint_dir: 'workspace/checkpoints',
  preferred_language: 'mixed',
  research_depth: 'standard',
  team_agent_ids: [],
};

export function getConfig(api: PfPluginApi): PluginConfig {
  const raw = (api.pluginConfig ?? api.config ?? {}) as Partial<PluginConfig>;
  return {
    ...DEFAULTS,
    ...raw,
  };
}
