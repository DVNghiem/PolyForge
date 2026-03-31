import { describe, it, expect } from 'vitest';
import { isValidCategory, sanitizeToolName, clampIterations } from '../../utils/validation.js';
import { TOOL_PREFIX, ABSOLUTE_MAX_AUTO_ITERATIONS } from '../../types.js';

describe('isValidCategory', () => {
  it('returns true for each valid category', () => {
    const valid = ['quick', 'deep', 'apex', 'research', 'rust', 'python', 'typescript', 'go', 'java', 'cpp', 'ruby', 'review', 'writing', 'unspecified-low', 'unspecified-high'];
    for (const cat of valid) {
      expect(isValidCategory(cat)).toBe(true);
    }
  });

  it('returns false for unknown strings', () => {
    expect(isValidCategory('unknown')).toBe(false);
    expect(isValidCategory('')).toBe(false);
    expect(isValidCategory('QUICK')).toBe(false);
    expect(isValidCategory('javascript')).toBe(false);
  });
});

describe('sanitizeToolName', () => {
  it('lowercases the name', () => {
    const result = sanitizeToolName('MyTool');
    expect(result).toBe(`${TOOL_PREFIX}mytool`);
  });

  it('replaces non-alphanumeric characters with underscores', () => {
    const result = sanitizeToolName('my-tool.name');
    expect(result).toBe(`${TOOL_PREFIX}my_tool_name`);
  });

  it('does not double-prefix when name already starts with TOOL_PREFIX', () => {
    const result = sanitizeToolName(`${TOOL_PREFIX}checkpoint`);
    expect(result).toBe(`${TOOL_PREFIX}checkpoint`);
    expect(result.startsWith(TOOL_PREFIX + TOOL_PREFIX)).toBe(false);
  });

  it('adds prefix to unprefixed names', () => {
    const result = sanitizeToolName('delegate');
    expect(result).toBe(`${TOOL_PREFIX}delegate`);
  });

  it('handles spaces by converting to underscores', () => {
    const result = sanitizeToolName('my tool name');
    expect(result).toBe(`${TOOL_PREFIX}my_tool_name`);
  });

  it('strips leading non-alphanumeric after lowercase', () => {
    const result = sanitizeToolName('---tool');
    // becomes "___tool" then prefix is prepended
    expect(result.endsWith('tool')).toBe(true);
    expect(result.startsWith(TOOL_PREFIX)).toBe(true);
  });
});

describe('clampIterations', () => {
  it('clamps to 0 for negative values', () => {
    expect(clampIterations(-5)).toBe(0);
    expect(clampIterations(-1)).toBe(0);
  });

  it('passes through values within range', () => {
    expect(clampIterations(0)).toBe(0);
    expect(clampIterations(10)).toBe(10);
    expect(clampIterations(ABSOLUTE_MAX_AUTO_ITERATIONS)).toBe(ABSOLUTE_MAX_AUTO_ITERATIONS);
  });

  it('clamps to max for values exceeding the default maximum', () => {
    expect(clampIterations(ABSOLUTE_MAX_AUTO_ITERATIONS + 1)).toBe(ABSOLUTE_MAX_AUTO_ITERATIONS);
    expect(clampIterations(9999)).toBe(ABSOLUTE_MAX_AUTO_ITERATIONS);
  });

  it('respects a custom max parameter', () => {
    expect(clampIterations(50, 20)).toBe(20);
    expect(clampIterations(5, 20)).toBe(5);
    expect(clampIterations(-3, 20)).toBe(0);
  });
});
