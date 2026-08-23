import {describe, expect, it} from 'vitest';
import {modelsToTry} from './models';

describe('modelsToTry', () => {
  it('does not spend a one-use hosted token on a second model', () => {
    expect(modelsToTry(true, 'primary', 'fallback')).toEqual(['primary']);
  });

  it('keeps the fallback for a pasted key', () => {
    expect(modelsToTry(false, 'primary', 'fallback')).toEqual(['primary', 'fallback']);
  });
});
