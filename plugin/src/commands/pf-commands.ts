import { PfPluginApi } from '../types.js';
import { LOG_PREFIX } from '../constants.js';
import { getConfig } from '../utils/config.js';
import { getVersion } from '../version.js';
import { ALL_AGENT_IDS, AGENT_MD_MAP, AGENT_TIER_MAP } from '../agents/agent-ids.js';
import { getActivePersona, setActivePersonaId, resetPersonaState } from '../utils/persona-state.js';
import { listPersonas, resolvePersonaId } from '../agents/persona-prompts.js';

export function registerPfCommands(api: PfPluginApi): void {
  api.registerCommand({
    name: 'pf',
    description: 'PolyForge management — /pf [status|health|config|list|<agent>|off]',
    acceptsArgs: true,
    handler: (ctx) => {
      const args = (ctx.args ?? '').trim().toLowerCase();

      if (!args || args === 'status') {
        return handleStatus(api);
      }
      if (args === 'health') {
        return handleHealth(api);
      }
      if (args === 'config') {
        return handleConfig(api);
      }
      if (args === 'list') {
        return handleList();
      }
      if (args === 'off') {
        return handleOff(api);
      }

      // Try to match an agent name
      return handlePersonaSwitch(api, args);
    },
  });
}

async function handleStatus(api: PfPluginApi): Promise<{ text: string }> {
  const version = getVersion();
  const config = getConfig(api);
  const personaId = await getActivePersona();

  const lines = [
    `**PolyForge v${version}**`,
    ``,
    `Active Persona: ${personaId ?? 'none'}`,
    `Todo Enforcer: ${config.todo_enforcer_enabled ? 'enabled' : 'disabled'}`,
    `Comment Checker: ${config.comment_checker_enabled ? 'enabled' : 'disabled'}`,
    `Preferred Language: ${config.preferred_language}`,
    `Research Depth: ${config.research_depth}`,
    `Team Agents: ${config.team_agent_ids.length > 0 ? config.team_agent_ids.join(', ') : 'none'}`,
  ];

  return { text: lines.join('\n') };
}

async function handleHealth(api: PfPluginApi): Promise<{ text: string }> {
  const version = getVersion();
  const personaId = await getActivePersona();

  return {
    text: [
      `PolyForge v${version} — OK`,
      `Persona: ${personaId ?? 'none'}`,
      `Agents: ${ALL_AGENT_IDS.length} registered`,
    ].join('\n'),
  };
}

function handleConfig(api: PfPluginApi): { text: string } {
  const config = getConfig(api);
  const display = {
    ...config,
    model_routing: config.model_routing ? '(configured)' : '(default)',
  };

  return {
    text: '```json\n' + JSON.stringify(display, null, 2) + '\n```',
  };
}

function handleList(): { text: string } {
  const personas = listPersonas();
  const lines = personas.map((p) => {
    const tier = AGENT_TIER_MAP[p.id] ?? 'unknown';
    return `- **${p.displayName}** (\`${p.id}\`) — ${p.theme} [${tier}]`;
  });

  return { text: ['**PolyForge Agents:**', '', ...lines].join('\n') };
}

function handleOff(api: PfPluginApi): { text: string } {
  resetPersonaState();
  api.logger.info(`${LOG_PREFIX} Persona deactivated`);
  return { text: 'Persona deactivated. AGENTS.md restored to default.' };
}

function handlePersonaSwitch(api: PfPluginApi, agentName: string): { text: string } {
  const personaId = resolvePersonaId(agentName);
  if (!personaId) {
    const available = ALL_AGENT_IDS.map((id) => AGENT_MD_MAP[id] ?? id).join(', ');
    return { text: `Unknown agent: "${agentName}". Available: ${available}` };
  }

  setActivePersonaId(personaId);
  api.logger.info(`${LOG_PREFIX} Persona switched to ${personaId}`);
  return { text: `Persona switched to **${personaId}**.` };
}
