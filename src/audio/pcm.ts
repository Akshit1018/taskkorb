import {Blob} from '@google/genai';

export function clampUnitSample(sample: number): number {
  if (Number.isNaN(sample)) {
    return 0;
  }
  if (sample > 1) {
    return 1;
  }
  if (sample < -1) {
    return -1;
  }
  return sample;
}

export function float32ToPcm16(data: Float32Array): Int16Array {
  const pcm = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    pcm[i] = Math.round(clampUnitSample(data[i]) * 32767);
  }
  return pcm;
}

export function pcm16ToFloat32(data: Int16Array): Float32Array {
  const samples = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    samples[i] = data[i] / 32768;
  }
  return samples;
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function createBlob(data: Float32Array): Blob {
  const pcm = float32ToPcm16(data);
  return {
    data: encodeBase64(new Uint8Array(pcm.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export function decode(base64: string): Uint8Array {
  return decodeBase64(base64);
}

export function encode(bytes: Uint8Array): string {
  return encodeBase64(bytes);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const channels = numChannels > 0 ? numChannels : 1;
  const frameCount = Math.floor(data.byteLength / 2 / channels);
  const buffer = ctx.createBuffer(channels, frameCount, sampleRate);
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, frameCount * channels);
  const dataFloat32 = pcm16ToFloat32(dataInt16);

  if (channels === 1) {
    buffer.copyToChannel(dataFloat32, 0);
    return buffer;
  }

  for (let channel = 0; channel < channels; channel++) {
    const isolated = dataFloat32.filter((_, index) => index % channels === channel);
    buffer.copyToChannel(isolated, channel);
  }

  return buffer;
}
