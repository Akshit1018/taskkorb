import {describe, expect, it} from 'vitest';
import {appendTranscript, clipTranscript, exportTranscript} from './store';

describe('transcript store', () => {
  it('caps growing transcripts from the end', () => {
    expect(clipTranscript('abcdef', 4)).toBe('cdef');
    expect(appendTranscript('hello', 'world', 8)).toBe('lo world');
  });

  it('exports a readable transcript without secrets', () => {
    const text = exportTranscript({user: 'hi', orb: 'hello'});
    expect(text).toContain('You: hi');
    expect(text).toContain('Orb: hello');
    expect(text.toLowerCase()).not.toContain('api');
  });
});
