import {describe, expect, it} from 'vitest';
import {isAudible, rootMeanSquare} from './level';

describe('audio level', () => {
  it('treats silence as inaudible', () => {
    expect(rootMeanSquare(new Float32Array(128))).toBe(0);
    expect(isAudible(new Float32Array(128))).toBe(false);
  });

  it('treats a loud frame as audible', () => {
    const loud = new Float32Array(32).fill(0.2);
    expect(isAudible(loud)).toBe(true);
  });
});
