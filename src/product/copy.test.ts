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

  it('lets testers type a note without promising a Gemini key', () => {
    expect(copy('en').typeNote).toMatch(/Type a note/);
    expect(copy('en').speak).toBe('Speak');
    expect(copy('en').typedHint).toMatch(/no Gemini key needed/i);
    expect(copy('en').typedHint).not.toMatch(/paste a Gemini/i);
    expect(copy('hi').typeNote).toMatch(/नोट/);
    expect(copy('hi').speak).toBe('बोलो');
    expect(copy('hi').typedHint).toMatch(/कुंजी नहीं/);
  });

  it('names PayPal and PhonePe without promising a Gemini key is required to pay', () => {
    expect(copy('en').payPaypal).toBe('PayPal');
    expect(copy('en').payPhonepe).toBe('PhonePe');
    expect(copy('en').payHint).toMatch(/PayPal or PhonePe/);
    expect(copy('en').payHint).toMatch(/stays free/);
    expect(copy('hi').payPaypal).toBe('PayPal');
    expect(copy('hi').payTitle).toMatch(/ऑर्ब/);
  });

  it('lets testers close the pay wall and names the demo', () => {
    expect(copy('en').closeGate).toBe('Close');
    expect(copy('en').skipDemo).toMatch(/demo/i);
    expect(copy('en').showPay).toMatch(/payment/i);
    expect(copy('en').demoHint).toMatch(/demo/i);
    expect(copy('hi').closeGate).toMatch(/बंद/);
    expect(copy('hi').showPay).toMatch(/पेमेंट/);
    expect(
      localizeStatus('Demo mode. Talk to hear a sample. This is not Gemini.', 'hi'),
    ).toMatch(/डेमो/);
  });
});
