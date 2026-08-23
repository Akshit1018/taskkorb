import {ErrorKind} from '../session/machine';

export function humanizeError(kind: ErrorKind, raw: string): string {
  const text = raw.toLowerCase();

  if (kind === 'mic' || text.includes('notallowed') || text.includes('permission')) {
    return 'Microphone was blocked. Allow it in the browser, then hold Talk.';
  }

  if (
    kind === 'key' ||
    text.includes('api key') ||
    text.includes('unauthenticated') ||
    text.includes('permission_denied') ||
    text.includes('401')
  ) {
    return 'That Gemini key was rejected. Check the key and try again.';
  }

  if (text.includes('notfound') || text.includes('404') || text.includes('model')) {
    return 'The live audio model is unavailable. Reconnect to try the fallback model.';
  }

  if (text.includes('429') || text.includes('wait a moment') || text.includes('too many')) {
    return 'Wait a moment, then reconnect. The hosted session is cooling down.';
  }

  if (kind === 'connect' || text.includes('network') || text.includes('failed to fetch')) {
    return 'Could not reach Gemini. Check the network and tap Reconnect.';
  }

  if (raw.trim()) {
    return raw.trim();
  }

  return 'Something went wrong. You can reconnect or use a different key.';
}
