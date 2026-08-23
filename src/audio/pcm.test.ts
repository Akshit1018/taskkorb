import {describe, expect, it} from 'vitest';
import {
  clampUnitSample,
  createBlob,
  decodeBase64,
  encodeBase64,
  float32ToPcm16,
  pcm16ToFloat32,
} from './pcm';

describe('pcm converters', () => {
  it('clamps out-of-range and NaN samples', () => {
    expect(clampUnitSample(2)).toBe(1);
    expect(clampUnitSample(-4)).toBe(-1);
    expect(clampUnitSample(Number.NaN)).toBe(0);
  });

  it('round-trips mid-range float samples through PCM16', () => {
    const input = new Float32Array([0, 0.5, -0.5]);
    const pcm = float32ToPcm16(input);
    const restored = pcm16ToFloat32(pcm);

    expect(pcm[0]).toBe(0);
    expect(pcm[1]).toBe(Math.round(0.5 * 32767));
    expect(pcm[2]).toBe(Math.round(-0.5 * 32767));
    expect(restored[0]).toBeCloseTo(0);
    expect(restored[1]).toBeCloseTo(0.5, 2);
    expect(restored[2]).toBeCloseTo(-0.5, 2);
  });

  it('does not overflow at full-scale samples', () => {
    const pcm = float32ToPcm16(new Float32Array([1, -1]));
    expect(pcm[0]).toBe(32767);
    expect(pcm[1]).toBe(-32767);
  });

  it('round-trips base64 bytes', () => {
    const bytes = new Uint8Array([1, 2, 255, 0]);
    expect(Array.from(decodeBase64(encodeBase64(bytes)))).toEqual([1, 2, 255, 0]);
  });

  it('creates a 16 kHz PCM blob', () => {
    const blob = createBlob(new Float32Array([0.25, -0.25]));
    expect(blob.mimeType).toBe('audio/pcm;rate=16000');
    expect(blob.data.length).toBeGreaterThan(0);
  });
});
