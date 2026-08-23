import {describe, expect, it} from 'vitest';
import {
  INITIAL_SESSION,
  canStartListening,
  reduceSession,
} from './machine';

describe('session machine', () => {
  it('starts locked until a key is submitted', () => {
    expect(INITIAL_SESSION.phase).toBe('locked');
    expect(canStartListening(INITIAL_SESSION.phase)).toBe(false);
  });

  it('connects, opens, then allows listening', () => {
    const connecting = reduceSession(INITIAL_SESSION, {type: 'KEY_SUBMITTED'});
    const ready = reduceSession(connecting, {type: 'OPENED'});

    expect(connecting.phase).toBe('connecting');
    expect(ready.phase).toBe('ready');
    expect(canStartListening(ready.phase)).toBe(true);
  });

  it('moves listening to speaking on audio out and back on interrupt', () => {
    const ready = reduceSession(INITIAL_SESSION, {type: 'OPENED'});
    const listening = reduceSession(ready, {type: 'LISTEN_STARTED'});
    const speaking = reduceSession(listening, {type: 'AUDIO_OUT'});
    const interrupted = reduceSession(speaking, {type: 'INTERRUPTED'});

    expect(speaking.phase).toBe('speaking');
    expect(interrupted.phase).toBe('listening');
  });

  it('surfaces errors and can reset back to connecting', () => {
    const failed = reduceSession(INITIAL_SESSION, {
      type: 'ERROR',
      message: 'live connect failed',
    });
    const reset = reduceSession(failed, {type: 'RESET'});

    expect(failed.phase).toBe('error');
    expect(failed.error).toBe('live connect failed');
    expect(reset.phase).toBe('connecting');
    expect(reset.error).toBe('');
  });
});
