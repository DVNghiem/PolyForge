import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { resolvePluginPath } from '../utils/paths.js';
import { PF_AGENT_CONFIGS, type PfAgentConfig } from './agent-configs.js';
import { AGENT_MD_MAP } from './agent-ids.js';

export interface PersonaInfo {
  id: string;
  name: string;
  role: string;
  shortName: string;
  displayName: string;
  emoji: string;
  theme: string;
}

export const DEFAULT_PERSONA_ID = 'pf_atlas';

export function listPersonas(): PersonaInfo[] {
  return PF_AGENT_CONFIGS.map((config: PfAgentConfig) => ({
    id: config.id,
    name: config.identity?.name ?? config.name ?? config.id,
    role: config.identity?.theme ?? 'Agent',
    shortName: config.id.replace('pf_', ''),
    displayName: config.identity?.name ?? config.name ?? config.id,
    emoji: config.identity?.emoji ?? '🤖',
    theme: config.identity?.theme ?? 'Agent',
  }));
}

export function resolvePersonaId(input: string): string | null {
  const normalized = input.trim().toLowerCase();

  // Direct match
  const directMatch = PF_AGENT_CONFIGS.find((c) => c.id === normalized || c.id === `pf_${normalized}`);
  if (directMatch) return directMatch.id;

  // Name match
  const nameMatch = PF_AGENT_CONFIGS.find(
    (c) => c.name?.toLowerCase() === normalized || c.identity?.name?.toLowerCase() === normalized,
  );
  if (nameMatch) return nameMatch.id;

  return null;
}

function getPersonaFilePath(personaId: string): string {
  const filename = AGENT_MD_MAP[personaId] ?? personaId.replace('pf_', '');
  return resolvePluginPath('agents', `${filename}.md`);
}

export async function readPersonaPrompt(personaId: string): Promise<string> {
  try {
    return await readFile(getPersonaFilePath(personaId), 'utf-8');
  } catch {
    return `[PolyForge] Persona file not found for ${personaId}`;
  }
}

export function readPersonaPromptSync(personaId: string): string {
  try {
    return readFileSync(getPersonaFilePath(personaId), 'utf-8');
  } catch {
    return `[PolyForge] Persona file not found for ${personaId}`;
  }
}
