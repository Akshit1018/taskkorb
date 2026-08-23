import {describe, expect, it} from 'vitest';
import {validateApiKey} from './api-key';

describe('validateApiKey', () => {
  it('rejects empty and whitespace', () => {
    expect(validateApiKey('').ok).toBe(false);
    expect(validateApiKey('   ').ok).toBe(false);
  });

  it('rejects short, huge, spaced, and placeholder values', () => {
    expect(validateApiKey('a').ok).toBe(false);
    expect(validateApiKey('a'.repeat(20_000)).ok).toBe(false);
    expect(validateApiKey('AIza fake key with spaces 123456').ok).toBe(false);
    expect(validateApiKey('your-api-key').ok).toBe(false);
  });

  it('accepts a compact key of normal length', () => {
    const result = validateApiKey('  AIzaSyDummyTestKeyValue12  ');
    expect(result).toEqual({ok: true, key: 'AIzaSyDummyTestKeyValue12'});
  });
});
