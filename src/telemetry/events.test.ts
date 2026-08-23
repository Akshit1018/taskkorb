import {describe, expect, it} from 'vitest';
import {track} from './events';

describe('telemetry', () => {
  it('records ordinary product events', () => {
    const event = track('session_opened', {model: 'test'});
    expect(event.name).toBe('session_opened');
    expect(event.detail?.model).toBe('test');
  });

  it('refuses secret-like fields', () => {
    expect(() => track('session_error', {apiKey: 'x'})).toThrow(/secret-like/);
  });
});
