import {describe, expect, it} from 'vitest';
import {MAX_AUTO_RECONNECT, nextBackoffMs, nextResumptionHandle, shouldAutoReconnect} from './reconnect';

describe('reconnect policy', () => {
  it('backs off and stops after three unexpected closes', () => {
    expect(nextBackoffMs(0)).toBe(500);
    expect(nextBackoffMs(1)).toBe(1500);
    expect(nextBackoffMs(2)).toBe(4000);
    expect(shouldAutoReconnect({userClosed: false, attempt: 0})).toBe(true);
    expect(shouldAutoReconnect({userClosed: false, attempt: MAX_AUTO_RECONNECT})).toBe(
      false,
    );
  });

  it('does not auto-reconnect after the user clears the key or a mic/key error', () => {
    expect(shouldAutoReconnect({userClosed: true, attempt: 0})).toBe(false);
    expect(shouldAutoReconnect({userClosed: false, attempt: 0, errorKind: 'key'})).toBe(
      false,
    );
    expect(shouldAutoReconnect({userClosed: false, attempt: 0, errorKind: 'mic'})).toBe(
      false,
    );
  });

  it('keeps the last good handle while the model is generating', () => {
    expect(nextResumptionHandle(undefined, {resumable: true, newHandle: 'h1'})).toBe('h1');
    expect(nextResumptionHandle('h1', {resumable: false, newHandle: ''})).toBe('h1');
    expect(nextResumptionHandle('h1', {resumable: true})).toBe('h1');
  });
});
