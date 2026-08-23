import {describe, expect, it} from 'vitest';
import {
  INITIAL_SESSION,
  canRetry,
  canStartListening,
  reduceSession,
} from './machine';

describe('session machine', () => {
  it('starts locked until a key is submitted', () => {
    expect(INITIAL_SESSION.phase).toBe('locked');
    expect(canStartListening(INITIAL_SESSION.phase)).toBe(false);
  });

  it('ignores OPENED before a key is submitted', () => {
    expect(reduceSession(INITIAL_SESSION, {type: 'OPENED'}).phase).toBe('locked');
  });

  it('ignores CONNECT_STARTED while locked', () => {
    expect(reduceSession(INITIAL_SESSION, {type: 'CONNECT_STARTED'}).phase).toBe(
      'locked',
    );
  });

  it('connects, opens, then allows listening only when ready', () => {
    const connecting = reduceSession(INITIAL_SESSION, {type: 'KEY_SUBMITTED'});
    const ready = reduceSession(connecting, {type: 'OPENED'});

    expect(connecting.phase).toBe('connecting');
    expect(ready.phase).toBe('ready');
    expect(canStartListening(ready.phase)).toBe(true);
    expect(canStartListening('speaking')).toBe(false);
  });

  it('moves listening to speaking on audio out and back on interrupt', () => {
    const connecting = reduceSession(INITIAL_SESSION, {type: 'KEY_SUBMITTED'});
    const ready = reduceSession(connecting, {type: 'OPENED'});
    const arming = reduceSession(ready, {type: 'LISTEN_START_REQUESTED'});
    const listening = reduceSession(arming, {type: 'LISTEN_STARTED'});
    const speaking = reduceSession(listening, {type: 'AUDIO_OUT'});
    const interrupted = reduceSession(speaking, {type: 'INTERRUPTED'});

    expect(arming.status).toMatch(/microphone/i);
    expect(speaking.phase).toBe('speaking');
    expect(interrupted.phase).toBe('listening');
  });

  it('surfaces errors and can retry or clear the key', () => {
    const failed = reduceSession(INITIAL_SESSION, {
      type: 'ERROR',
      kind: 'key',
      message: 'That Gemini key was rejected.',
    });
    const retried = reduceSession(failed, {type: 'RETRY'});
    const cleared = reduceSession(failed, {type: 'KEY_CLEARED'});

    expect(failed.phase).toBe('error');
    expect(failed.errorKind).toBe('key');
    expect(canRetry(failed.phase)).toBe(true);
    expect(retried.phase).toBe('connecting');
    expect(cleared.phase).toBe('locked');
  });

  it('returns to ready through the reducer when talk is capped', () => {
    const connecting = reduceSession(INITIAL_SESSION, {type: 'KEY_SUBMITTED'});
    const ready = reduceSession(connecting, {type: 'OPENED'});
    const listening = reduceSession(
      reduceSession(ready, {type: 'LISTEN_START_REQUESTED'}),
      {type: 'LISTEN_STARTED'},
    );
    const capped = reduceSession(listening, {type: 'LISTEN_CAPPED'});

    expect(capped.phase).toBe('ready');
    expect(capped.status).toMatch(/limit/i);
    expect(canStartListening(capped.phase)).toBe(true);
  });

  it('does not leave error when listen stops after a failure', () => {
    const failed = reduceSession(INITIAL_SESSION, {
      type: 'ERROR',
      kind: 'mic',
      message: 'Microphone was blocked.',
    });
    expect(reduceSession(failed, {type: 'LISTEN_STOPPED'}).phase).toBe('error');
  });
});
