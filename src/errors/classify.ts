import type {ErrorKind} from '../session/machine';

export type LiveAuthMode = 'hosted' | 'byo' | 'unknown';

export function looksLikeKeyRejection(raw: string): boolean {
  const text = raw.toLowerCase();
  return (
    text.includes('api key') ||
    text.includes('api_key') ||
    text.includes('unauthenticated') ||
    text.includes('permission_denied') ||
    text.includes('401')
  );
}

export function classifyLiveFailure(
  raw: string,
  authMode: LiveAuthMode,
): ErrorKind {
  if (looksLikeKeyRejection(raw)) {
    return authMode === 'hosted' ? 'connect' : 'key';
  }
  if (/notallowed|microphone/i.test(raw)) {
    return 'mic';
  }
  if (authMode === 'hosted') {
    return 'connect';
  }
  return 'session';
}
