import {describe, expect, it} from 'vitest';
import {copy, localizeStatus, talkHint, uiLanguage} from './copy';

describe('ui copy', () => {
  it('uses Hindi UI when the reply language is Hindi or the browser is Hindi', () => {
    expect(uiLanguage({language: 'hi'}, 'en-US')).toBe('hi');
    expect(uiLanguage({language: 'en'}, 'hi-IN')).toBe('en');
    expect(uiLanguage({language: 'auto'}, 'hi-IN')).toBe('hi');
  });

  it('explains tap-to-talk and translates the ready status', () => {
    expect(talkHint('tap', 'en')).toMatch(/Tap Talk/);
    expect(localizeStatus('Connected. Hold Talk and speak.', 'hi', 'tap')).toMatch(/बात/);
  });

  it('points first-time testers at the official Gemini key page', () => {
    expect(copy('en').getKey).toMatch(/Get a Gemini API key/);
    expect(copy('en').getKeyHref).toMatch(/aistudio\.google\.com/);
    expect(copy('hi').getKey).toMatch(/कुंजी/);
    expect(
      localizeStatus('Microphone was blocked. Allow it in the browser, then use Talk.', 'hi'),
    ).toMatch(/माइक्रोफ़ोन/);
  });
});
