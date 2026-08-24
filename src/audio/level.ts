export const SILENCE_RMS = 0.012;

export function rootMeanSquare(samples: Float32Array): number {
  if (samples.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

export function isAudible(samples: Float32Array, threshold = SILENCE_RMS): boolean {
  return rootMeanSquare(samples) >= threshold;
}
