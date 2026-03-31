import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveWorkspacePath, resolveOpenClawWorkspaceDir } from '../../utils/paths.js';
import { homedir } from 'os';
import * as path from 'path';

describe('resolveWorkspacePath', () => {
  it('joins workspaceDir with a single segment', () => {
    const result = resolveWorkspacePath('/my/workspace', '.polyforge-state');
    expect(result).toBe(path.join('/my/workspace', '.polyforge-state'));
  });

  it('joins workspaceDir with multiple segments', () => {
    const result = resolveWorkspacePath('/root', 'a', 'b', 'c.json');
    expect(result).toBe(path.join('/root', 'a', 'b', 'c.json'));
  });

  it('uses absolute workspaceDir as-is', () => {
    const result = resolveWorkspacePath('/abs/path', 'file.txt');
    expect(result.startsWith('/abs/path')).toBe(true);
  });
});

describe('resolveOpenClawWorkspaceDir', () => {
  const originalEnv = process.env.OPENCLAW_PROFILE;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.OPENCLAW_PROFILE;
    } else {
      process.env.OPENCLAW_PROFILE = originalEnv;
    }
  });

  it('returns provided workspaceDir directly', () => {
    const dir = '/custom/workspace';
    expect(resolveOpenClawWorkspaceDir(dir)).toBe(dir);
  });

  it('falls back to ~/.openclaw/workspace when no args and default profile', () => {
    delete process.env.OPENCLAW_PROFILE;
    const result = resolveOpenClawWorkspaceDir();
    expect(result).toBe(path.join(homedir(), '.openclaw', 'workspace'));
  });

  it('uses profile-specific path when OPENCLAW_PROFILE is set', () => {
    process.env.OPENCLAW_PROFILE = 'dev';
    const result = resolveOpenClawWorkspaceDir();
    expect(result).toBe(path.join(homedir(), '.openclaw', 'workspace-dev'));
  });

  it('falls back to default when OPENCLAW_PROFILE is "default"', () => {
    process.env.OPENCLAW_PROFILE = 'default';
    const result = resolveOpenClawWorkspaceDir();
    expect(result).toBe(path.join(homedir(), '.openclaw', 'workspace'));
  });

  it('trims whitespace from OPENCLAW_PROFILE', () => {
    process.env.OPENCLAW_PROFILE = '  staging  ';
    const result = resolveOpenClawWorkspaceDir();
    expect(result).toBe(path.join(homedir(), '.openclaw', 'workspace-staging'));
  });
});
