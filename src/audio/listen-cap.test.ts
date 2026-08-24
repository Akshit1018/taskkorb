import {describe, expect, it} from 'vitest';
import {MAX_LISTEN_MS, formatListenRemaining, remainingListenMs} from './listen-cap';

describe('listen cap', () => {
  it('starts at three minutes and never goes negative', () => {
    expect(MAX_LISTEN_MS).toBe(180_000);
    expect(remainingListenMs(1_000, 1_000)).toBe(180_000);
    expect(remainingListenMs(1_000, 1_000 + 181_000)).toBe(0);
  });

  it('formats remaining time for the Talk button', () => {
    expect(formatListenRemaining(180_000)).toBe('3:00');
    expect(formatListenRemaining(61_200)).toBe('1:02');
    expect(formatListenRemaining(900)).toBe('0:01');
    expect(formatListenRemaining(0)).toBe('0:00');
  });
});
