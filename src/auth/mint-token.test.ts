import {describe, expect, it} from 'vitest';
import {LIVE_MODEL} from '../product/identity';
import {buildTokenCreateConfig, readMintedToken} from './mint-token';

describe('mint token helpers', () => {
  it('locks the live model and a short lifetime', () => {
    const config = buildTokenCreateConfig(Date.parse('2026-08-23T22:00:00Z'));
    expect(config.uses).toBe(1);
    expect(config.expireTime).toBe('2026-08-23T22:30:00.000Z');
    expect(config.newSessionExpireTime).toBe('2026-08-23T22:05:00.000Z');
    expect(config.liveConnectConstraints.model).toBe(LIVE_MODEL);
    expect(config.httpOptions.apiVersion).toBe('v1alpha');
  });

  it('rejects an empty minted name', () => {
    expect(() => readMintedToken({}, '2026-08-23T22:30:00Z')).toThrow(/empty/);
  });

  it('returns the token name for the client', () => {
    expect(readMintedToken({name: 'auth_tokens/abc'}, 't')).toEqual({
      token: 'auth_tokens/abc',
      expireTime: 't',
    });
  });
});
