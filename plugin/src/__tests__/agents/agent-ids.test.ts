import { describe, it, expect } from 'vitest';
import {
  ORCHESTRATOR_IDS,
  WORKER_IDS,
  ALL_AGENT_IDS,
  AGENT_MD_MAP,
  AGENT_TIER_MAP,
} from '../../agents/agent-ids.js';

describe('ORCHESTRATOR_IDS', () => {
  it('contains pf_atlas', () => {
    expect(ORCHESTRATOR_IDS.has('pf_atlas')).toBe(true);
  });

  it('all IDs start with pf_ prefix', () => {
    for (const id of ORCHESTRATOR_IDS) {
      expect(id.startsWith('pf_')).toBe(true);
    }
  });
});

describe('WORKER_IDS', () => {
  it('contains pf_sprint and pf_forge', () => {
    expect(WORKER_IDS.has('pf_sprint')).toBe(true);
    expect(WORKER_IDS.has('pf_forge')).toBe(true);
  });

  it('all IDs start with pf_ prefix', () => {
    for (const id of WORKER_IDS) {
      expect(id.startsWith('pf_')).toBe(true);
    }
  });
});

describe('ALL_AGENT_IDS', () => {
  it('includes all orchestrator IDs', () => {
    for (const id of ORCHESTRATOR_IDS) {
      expect(ALL_AGENT_IDS).toContain(id);
    }
  });

  it('includes all worker IDs', () => {
    for (const id of WORKER_IDS) {
      expect(ALL_AGENT_IDS).toContain(id);
    }
  });

  it('contains at least the core specialist agents', () => {
    expect(ALL_AGENT_IDS).toContain('pf_architect');
    expect(ALL_AGENT_IDS).toContain('pf_researcher');
    expect(ALL_AGENT_IDS).toContain('pf_analyst');
    expect(ALL_AGENT_IDS).toContain('pf_critic');
    expect(ALL_AGENT_IDS).toContain('pf_explorer');
  });

  it('has no duplicate entries', () => {
    const unique = new Set(ALL_AGENT_IDS);
    expect(unique.size).toBe(ALL_AGENT_IDS.length);
  });
});

describe('AGENT_MD_MAP', () => {
  it('every ALL_AGENT_ID key present in ALL_AGENT_IDS has an MD file mapping', () => {
    for (const id of ALL_AGENT_IDS) {
      expect(AGENT_MD_MAP).toHaveProperty(id);
    }
  });

  it('values are non-empty strings without .md extension', () => {
    for (const [, value] of Object.entries(AGENT_MD_MAP)) {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
      expect(value.endsWith('.md')).toBe(false);
    }
  });
});

describe('AGENT_TIER_MAP', () => {
  const validTiers = new Set(['reasoning', 'analysis', 'worker', 'deep-worker', 'search']);

  it('every ALL_AGENT_ID has a tier', () => {
    for (const id of ALL_AGENT_IDS) {
      expect(AGENT_TIER_MAP).toHaveProperty(id);
    }
  });

  it('all tier values are valid tier strings', () => {
    for (const [, tier] of Object.entries(AGENT_TIER_MAP)) {
      expect(validTiers.has(tier)).toBe(true);
    }
  });

  it('orchestrators use reasoning tier', () => {
    for (const id of ORCHESTRATOR_IDS) {
      expect(AGENT_TIER_MAP[id]).toBe('reasoning');
    }
  });
});
