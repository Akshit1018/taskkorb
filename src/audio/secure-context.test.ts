import {describe, expect, it} from 'vitest';
import {insecureMicMessage, isSecureAudioContext} from './secure-context';

describe('secure audio context', () => {
  it('treats explicit insecure pages as blocked', () => {
    expect(isSecureAudioContext({isSecureContext: false})).toBe(false);
    expect(isSecureAudioContext({isSecureContext: true})).toBe(true);
  });

  it('explains why the microphone cannot start on http', () => {
    expect(insecureMicMessage()).toMatch(/https/i);
  });
});
