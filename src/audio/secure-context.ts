export function isSecureAudioContext(context: {isSecureContext?: boolean}): boolean {
  return context.isSecureContext !== false;
}

export function insecureMicMessage(): string {
  return 'This page is not a secure context. Open it over HTTPS so the microphone can work.';
}
