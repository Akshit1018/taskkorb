import {describe, expect, it} from 'vitest';
import {
  deniedMicInstructions,
  isAppleTouchDevice,
  isEmbeddedBrowser,
  preserveWebGlContext,
  shouldAutoStartMicrophone,
  shouldReleaseMicrophoneOnHidden,
} from './runtime';

describe('mobile runtime policy', () => {
  it('detects iPhone, iPad, and iPadOS desktop-mode Safari', () => {
    expect(isAppleTouchDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X)')).toBe(
      true,
    );
    expect(isAppleTouchDevice('Mozilla/5.0 (Linux; Android 15) Chrome/130')).toBe(false);
    expect(
      isAppleTouchDevice(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        5,
      ),
    ).toBe(true);
    expect(
      isAppleTouchDevice(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
        0,
      ),
    ).toBe(false);
  });

  it('never auto-starts the microphone or redirects into system Settings', () => {
    expect(shouldAutoStartMicrophone()).toBe(false);
    expect(deniedMicInstructions('ios')).toMatch(/Website Settings → Microphone/);
    expect(deniedMicInstructions('ios')).toMatch(/Settings → Safari → Microphone/);
    expect(deniedMicInstructions('android')).toMatch(/Site settings/);
    expect(deniedMicInstructions('ios')).not.toMatch(/App-Prefs|prefs:root|chrome:\/\//);
    expect(deniedMicInstructions('android')).not.toMatch(/App-Prefs|intent:|chrome:\/\//);
  });

  it('releases the microphone when the tab is hidden and flags in-app browsers', () => {
    expect(shouldReleaseMicrophoneOnHidden()).toBe(true);
    expect(isEmbeddedBrowser('Mozilla/5.0 Instagram 192.168.1.2')).toBe(true);
    expect(isEmbeddedBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/605.1')).toBe(
      false,
    );
  });

  it('keeps a lost WebGL context restorable', () => {
    let prevented = false;
    preserveWebGlContext({
      preventDefault: () => {
        prevented = true;
      },
    });
    expect(prevented).toBe(true);
  });
});
