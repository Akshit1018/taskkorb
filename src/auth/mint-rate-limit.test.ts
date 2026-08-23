import {describe, expect, it} from 'vitest';
import {MIN_MINT_INTERVAL_MS, checkMintRate, parseRetryAfterMs} from './mint-rate-limit';

describe('mint rate limit', () => {
  it('allows the first mint and blocks a burst', () => {
    expect(checkMintRate(0, 10_000)).toEqual({allowed: true});
    const blocked = checkMintRate(10_000, 10_500);
    expect(blocked.allowed).toBe(false);
    if (blocked.allowed === false) {
      expect(blocked.retryAfterMs).toBe(MIN_MINT_INTERVAL_MS - 500);
    }
  });

  it('reads Retry-After seconds for a single client retry', () => {
    expect(parseRetryAfterMs('2')).toBe(2000);
    expect(parseRetryAfterMs(null)).toBe(MIN_MINT_INTERVAL_MS);
  });
});
