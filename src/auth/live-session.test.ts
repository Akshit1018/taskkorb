import {describe, expect, it} from 'vitest';
import {fetchHostedCredential} from './live-session';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json'},
  });
}

describe('fetchHostedCredential', () => {
  it('uses BYO key when no issuer is deployed', async () => {
    const result = await fetchHostedCredential(async () => jsonResponse(200, {available: false}));
    expect(result).toEqual({mode: 'byo'});
  });

  it('returns a hosted token when the issuer mints one', async () => {
    const result = await fetchHostedCredential(async () =>
      jsonResponse(200, {
        available: true,
        token: 'auth_tokens/test',
        expireTime: '2026-08-23T22:40:00Z',
      }),
    );
    expect(result).toEqual({
      mode: 'hosted',
      token: 'auth_tokens/test',
      expireTime: '2026-08-23T22:40:00Z',
    });
  });

  it('surfaces issuer failures without inventing a token', async () => {
    const result = await fetchHostedCredential(async () =>
      jsonResponse(502, {available: true, error: 'Google rejected the server key.'}),
    );
    expect(result.mode).toBe('error');
  });

  it('falls back to BYO when the issuer is unreachable', async () => {
    const result = await fetchHostedCredential(async () => {
      throw new Error('offline');
    });
    expect(result).toEqual({mode: 'byo'});
  });

  it('retries a 429 once after Retry-After', async () => {
    let calls = 0;
    const waits: number[] = [];
    const result = await fetchHostedCredential(
      async () => {
        calls += 1;
        if (calls === 1) {
          return new Response(JSON.stringify({available: true, error: 'Wait a moment, then reconnect.'}), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '1',
            },
          });
        }
        return jsonResponse(200, {available: true, token: 'auth_tokens/retry'});
      },
      async (ms) => {
        waits.push(ms);
      },
    );

    expect(calls).toBe(2);
    expect(waits).toEqual([1000]);
    expect(result).toEqual({mode: 'hosted', token: 'auth_tokens/retry', expireTime: undefined});
  });
});

