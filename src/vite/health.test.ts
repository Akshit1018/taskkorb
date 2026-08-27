import {describe, expect, it} from 'vitest';
import {healthStatus} from './health';

describe('health status', () => {
  it('stays secret-free and reports whether mint and preview lock exist', () => {
    expect(healthStatus({GEMINI_API_KEY: '', PREVIEW_PASSWORD: ''})).toEqual({
      ok: true,
      hostedToken: false,
      previewLocked: false,
      billingMode: 'mock',
      billingEnforce: false,
      paypalReady: false,
      phonepeReady: false,
    });
    expect(healthStatus({GEMINI_API_KEY: 'secret', PREVIEW_PASSWORD: 'gate'})).toEqual({
      ok: true,
      hostedToken: true,
      previewLocked: true,
      billingMode: 'mock',
      billingEnforce: false,
      paypalReady: false,
      phonepeReady: false,
    });
    expect(JSON.stringify(healthStatus({GEMINI_API_KEY: 'secret'}))).not.toMatch(/secret/);
  });
});
