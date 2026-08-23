import {describe, expect, it} from 'vitest';
import {issuerClientIp} from './client-ip';

describe('issuerClientIp', () => {
  it('prefers Cloudflare connecting IP over a spoofable X-Forwarded-For', () => {
    expect(
      issuerClientIp({
        headers: {
          'x-forwarded-for': '1.2.3.4',
          'cf-connecting-ip': '9.9.9.9',
        },
        socket: {remoteAddress: '10.0.0.1'},
      }),
    ).toBe('9.9.9.9');
  });

  it('falls back to the socket when no trusted header exists', () => {
    expect(
      issuerClientIp({
        headers: {'x-forwarded-for': '1.2.3.4'},
        socket: {remoteAddress: '10.0.0.1'},
      }),
    ).toBe('10.0.0.1');
  });
});
