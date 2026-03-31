import { describe, it, expect } from 'vitest';
import { toolResponse, toolError } from '../../utils/helpers.js';

describe('toolResponse', () => {
  it('returns a ToolResult with text content', () => {
    const result = toolResponse('hello world');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('hello world');
  });

  it('preserves the exact text passed in', () => {
    const msg = 'multi\nline\ntext';
    const result = toolResponse(msg);
    expect(result.content[0].text).toBe(msg);
  });

  it('handles empty string', () => {
    const result = toolResponse('');
    expect(result.content[0].text).toBe('');
  });
});

describe('toolError', () => {
  it('returns a ToolResult prefixed with "Error:"', () => {
    const result = toolError('something went wrong');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toBe('Error: something went wrong');
  });

  it('handles empty message', () => {
    const result = toolError('');
    expect(result.content[0].text).toBe('Error: ');
  });

  it('does not double-prefix if message already starts with Error:', () => {
    const result = toolError('Error: already prefixed');
    expect(result.content[0].text).toBe('Error: Error: already prefixed');
  });
});
