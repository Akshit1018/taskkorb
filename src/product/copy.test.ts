import {describe, expect, it} from 'vitest';
import {localizeStatus, talkHint, uiLanguage} from './copy';

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
});
