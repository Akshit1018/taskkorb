import {describe, expect, it} from 'vitest';
import {PreviewSessions, passwordsMatch, readCookie} from './preview-session';

describe('preview sessions', () => {
  it('compares passwords without accepting a length mismatch', () => {
    expect(passwordsMatch('secret', 'secret')).toBe(true);
    expect(passwordsMatch('nope', 'secret')).toBe(false);
  });

  it('issues an opaque token that expires', () => {
    let now = 1_000;
    const sessions = new PreviewSessions(() => now);
    const token = sessions.issue(50);
    expect(sessions.has(token)).toBe(true);
    now = 1_060;
    expect(sessions.has(token)).toBe(false);
  });

  it('reads the named cookie', () => {
    expect(readCookie('a=1; taskkorb_preview=abc', 'taskkorb_preview')).toBe('abc');
  });
});
