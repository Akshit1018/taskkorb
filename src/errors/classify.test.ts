import {describe, expect, it} from 'vitest';
import {classifyLiveFailure, looksLikeKeyRejection} from './classify';
import {humanizeError} from './humanize';

describe('live failure classification', () => {
  it('treats Gemini auth failures as a rejected key, not a session blip', () => {
    expect(looksLikeKeyRejection('PERMISSION_DENIED: API key not valid')).toBe(true);
    expect(classifyLiveFailure('401 unauthenticated', 'byo')).toBe('key');
    expect(classifyLiveFailure('API_KEY_INVALID', 'hosted')).toBe('connect');
    expect(classifyLiveFailure('going away', 'byo')).toBe('session');
  });

  it('does not call a permission_denied key error a blocked microphone', () => {
    expect(humanizeError('session', 'PERMISSION_DENIED')).toMatch(/key was rejected/);
    expect(humanizeError('session', 'PERMISSION_DENIED')).not.toMatch(/Microphone/);
  });
});
