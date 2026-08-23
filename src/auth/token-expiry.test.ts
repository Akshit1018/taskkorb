import {describe, expect, it} from 'vitest';
import {shouldRemint} from './token-expiry';

describe('shouldRemint', () => {
  it('remints when the hosted token is inside the lead window', () => {
    const now = Date.parse('2026-08-23T22:00:00Z');
    expect(shouldRemint('2026-08-23T22:00:20Z', now, 30_000)).toBe(true);
    expect(shouldRemint('2026-08-23T22:10:00Z', now, 30_000)).toBe(false);
    expect(shouldRemint(undefined, now)).toBe(false);
  });
});
