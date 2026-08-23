import {describe, expect, it} from 'vitest';
import {clampVolume, languageInstruction, normalizePrefs} from './prefs';

describe('user prefs', () => {
  it('rejects unknown voices and out-of-range volume', () => {
    expect(normalizePrefs({voice: 'Nope', volume: 4, language: 'de'})).toEqual({
      voice: 'Orus',
      language: 'auto',
      volume: 1,
    });
    expect(clampVolume(-2)).toBe(0);
  });

  it('locks a Hindi reply instruction', () => {
    expect(languageInstruction('hi')).toMatch(/Hindi/);
    expect(languageInstruction('en')).toMatch(/English/);
  });
});
