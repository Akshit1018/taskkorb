import {describe, expect, it} from 'vitest';
import {applyPlayAndRecordHint, resumeAudioGraph} from './unlock';

describe('audio unlock', () => {
  it('resumes every suspended context before playback', async () => {
    const calls: string[] = [];
    await resumeAudioGraph([
      {state: 'suspended', resume: async () => calls.push('in')},
      {state: 'running', resume: async () => calls.push('out')},
    ]);
    expect(calls).toEqual(['in']);
  });

  it('declares play-and-record when the Audio Session API exists', () => {
    const session = {type: 'auto'};
    applyPlayAndRecordHint({audioSession: session});
    expect(session.type).toBe('play-and-record');
  });
});
