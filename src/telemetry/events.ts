export type ProductEventName =
  | 'session_connect_started'
  | 'session_opened'
  | 'session_error'
  | 'session_closed'
  | 'mic_requested'
  | 'mic_granted'
  | 'mic_denied'
  | 'listen_started'
  | 'listen_stopped'
  | 'speech_interrupted'
  | 'transcript_received';

export interface ProductEvent {
  name: ProductEventName;
  at: number;
  detail?: Record<string, string | number | boolean>;
}

function assertNoSecrets(detail: ProductEvent['detail']): void {
  if (!detail) {
    return;
  }
  for (const key of Object.keys(detail)) {
    if (/key|token|secret|password/i.test(key)) {
      throw new Error(`Refusing to record secret-like field: ${key}`);
    }
  }
}

export function track(
  name: ProductEventName,
  detail?: ProductEvent['detail'],
): ProductEvent {
  assertNoSecrets(detail);
  const event: ProductEvent = {
    name,
    at: Date.now(),
    detail,
  };

  console.info('[taskkorb]', event);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('taskkorb:event', {detail: event}));
  }
  return event;
}
