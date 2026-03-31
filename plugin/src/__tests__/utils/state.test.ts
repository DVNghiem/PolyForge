import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readState, writeState, ensureDir } from '../../utils/state.js';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pf-state-test-'));
});

afterEach(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('ensureDir', () => {
  it('creates a directory that does not exist', async () => {
    const dir = path.join(tmpDir, 'new', 'nested', 'dir');
    await ensureDir(dir);
    const stat = await fs.stat(dir);
    expect(stat.isDirectory()).toBe(true);
  });

  it('does not throw if directory already exists', async () => {
    await ensureDir(tmpDir);
    await expect(ensureDir(tmpDir)).resolves.not.toThrow();
  });
});

describe('writeState / readState', () => {
  it('round-trips a plain object', async () => {
    const filePath = path.join(tmpDir, 'state.json');
    const data = { foo: 'bar', count: 42 };
    await writeState(filePath, data);
    const result = await readState<typeof data>(filePath);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(data);
    }
  });

  it('round-trips nested structures', async () => {
    const filePath = path.join(tmpDir, 'nested.json');
    const data = { todos: [{ id: '1', task: 'do thing' }] };
    await writeState(filePath, data);
    const result = await readState(filePath);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(data);
    }
  });

  it('creates parent directories automatically when writing', async () => {
    const filePath = path.join(tmpDir, 'deep', 'nested', 'state.json');
    await writeState(filePath, { value: 1 });
    const result = await readState(filePath);
    expect(result.ok).toBe(true);
  });

  it('returns not_found when file does not exist', async () => {
    const filePath = path.join(tmpDir, 'missing.json');
    const result = await readState(filePath);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('not_found');
    }
  });

  it('returns corrupted for invalid JSON', async () => {
    const filePath = path.join(tmpDir, 'bad.json');
    await fs.writeFile(filePath, '{ not valid json }', 'utf-8');
    const result = await readState(filePath);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('corrupted');
    }
  });

  it('runs the validate callback when provided', async () => {
    const filePath = path.join(tmpDir, 'validated.json');
    await writeState(filePath, { name: 'test' });
    const result = await readState<{ name: string }>(filePath, (data) => {
      const d = data as { name: string };
      return { name: d.name.toUpperCase() };
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe('TEST');
    }
  });
});
