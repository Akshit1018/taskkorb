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
  | 'transcript_received'
  | 'talk_capped'
  | 'transcript_clipped'
  | 'prefs_changed'
  | 'session_reconnecting'
  | 'session_reconnect_gave_up'
  | 'session_go_away'
  | 'typed_spoke'
  | 'billing_checkout';

export interface ProductEvent {
  name: ProductEventName;
  at: number;
  detail?: Record<string, string | number | boolean>;
}

const SECRET_VALUE = /AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9]{20,}|auth_tokens\//;

function assertNoSecrets(detail: ProductEvent['detail']): void {
  if (!detail) {
    return;
  }
  for (const [key, value] of Object.entries(detail)) {
    if (/key|token|secret|password/i.test(key)) {
      throw new Error(`Refusing to record secret-like field: ${key}`);
    }
    if (typeof value === 'string' && SECRET_VALUE.test(value)) {
      throw new Error('Refusing to record a secret-like value');
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
