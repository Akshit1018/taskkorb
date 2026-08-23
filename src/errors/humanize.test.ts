import {describe, expect, it} from 'vitest';
import {humanizeError} from './humanize';

describe('humanizeError', () => {
  it('explains a blocked microphone', () => {
    expect(humanizeError('mic', 'NotAllowedError')).toMatch(/Microphone was blocked/);
  });

  it('explains a rejected key', () => {
    expect(humanizeError('connect', 'API key not valid')).toMatch(/key was rejected/);
  });

  it('keeps a useful raw message when nothing matches', () => {
    expect(humanizeError('unknown', 'quota exceeded')).toBe('quota exceeded');
  });
});
