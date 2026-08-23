import {describe, expect, it} from 'vitest';
import {
  EMPTY_TRANSCRIPT,
  appendTranscript,
  appendTurn,
  clipTranscript,
  exportTranscript,
  flattenSide,
} from './store';

describe('transcript store', () => {
  it('caps growing transcripts from the end', () => {
    expect(clipTranscript('abcdef', 4)).toBe('cdef');
    expect(appendTranscript('hello', 'world', 8)).toBe('lo world');
  });

  it('merges consecutive fragments on the same side', () => {
    const first = appendTurn(EMPTY_TRANSCRIPT, 'user', 'hold');
    const second = appendTurn(first, 'user', 'talk');
    expect(second.turns).toHaveLength(1);
    expect(second.turns[0].text).toBe('hold talk');
  });

  it('starts a new turn when the speaker changes', () => {
    const spoken = appendTurn(
      appendTurn(EMPTY_TRANSCRIPT, 'user', 'hello'),
      'orb',
      'hi',
    );
    expect(spoken.turns.map((turn) => turn.side)).toEqual(['user', 'orb']);
  });

  it('marks the log when older turns are clipped', () => {
    const long = 'x'.repeat(30);
    const clipped = appendTurn(EMPTY_TRANSCRIPT, 'user', long, 1, 10);
    expect(clipped.clipped).toBe(true);
    expect(flattenSide(clipped, 'user').length).toBe(10);
  });

  it('exports dated turns without secrets', () => {
    const state = appendTurn(
      appendTurn(EMPTY_TRANSCRIPT, 'user', 'hi', 1_700_000_000_000),
      'orb',
      'hello',
      1_700_000_000_100,
    );
    const text = exportTranscript(state);
    expect(text).toContain('You (');
    expect(text).toContain('hi');
    expect(text).toContain('Orb (');
    expect(text.toLowerCase()).not.toContain('api');
  });

  it('migrates the old user/orb shape', () => {
    const text = exportTranscript({user: 'hi', orb: 'hello'});
    expect(text).toContain('You (');
    expect(text).toContain('Orb (');
  });
});
