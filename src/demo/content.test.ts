import {describe, expect, it} from 'vitest';
import {demoTranscript, nextDemoExchange} from './content';

describe('demo content', () => {
  it('seeds a short You/Orb conversation', () => {
    const seeded = demoTranscript(1_700_000_000_000, 'en');
    expect(seeded.turns).toHaveLength(2);
    expect(seeded.turns[0]?.side).toBe('user');
    expect(seeded.turns[1]?.side).toBe('orb');
    expect(seeded.turns[0]?.text).toMatch(/remind/i);
    expect(seeded.turns[1]?.text).toMatch(/orb/i);
    expect(seeded.clipped).toBe(false);
  });

  it('seeds Hindi lines when the UI is Hindi', () => {
    const seeded = demoTranscript(1, 'hi');
    expect(seeded.turns[0]?.text).toMatch(/याद/);
    expect(seeded.turns[1]?.text).toMatch(/ऑर्ब/);
  });

  it('cycles demo Talk exchanges without inventing a Gemini session', () => {
    const first = nextDemoExchange(0, 'en');
    const second = nextDemoExchange(1, 'en');
    expect(first.user).toMatch(/hello/i);
    expect(first.orb).toMatch(/demo/i);
    expect(second.user).not.toBe(first.user);
    expect(nextDemoExchange(3, 'en').user).toBe(first.user);
  });
});
