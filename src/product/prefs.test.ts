import {describe, expect, it} from 'vitest';
import {clampVolume, defaultTalkMode, languageInstruction, normalizePrefs} from './prefs';

describe('user prefs', () => {
  it('rejects unknown voices and out-of-range volume', () => {
    expect(normalizePrefs({voice: 'Nope', volume: 4, language: 'de'})).toEqual({
      voice: 'Orus',
      language: 'auto',
      volume: 1,
      talkMode: 'hold',
      reduceMotion: false,
    });
    expect(clampVolume(-2)).toBe(0);
  });

  it('locks a Hindi reply instruction', () => {
    expect(languageInstruction('hi')).toMatch(/Hindi/);
    expect(languageInstruction('en')).toMatch(/English/);
  });

  it('defaults phones to tap-to-talk and desktops to hold', () => {
    expect(defaultTalkMode('ios')).toBe('tap');
    expect(defaultTalkMode('android')).toBe('tap');
    expect(defaultTalkMode('other')).toBe('hold');
  });
});
