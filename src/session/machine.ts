export type SessionPhase =
  | 'locked'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'speaking'
  | 'error'
  | 'closed';

export type ErrorKind = 'key' | 'mic' | 'connect' | 'session' | 'unknown';

export type SessionEvent =
  | {type: 'KEY_SUBMITTED'}
  | {type: 'KEY_CLEARED'}
  | {type: 'CONNECT_STARTED'}
  | {type: 'OPENED'}
  | {type: 'LISTEN_START_REQUESTED'}
  | {type: 'LISTEN_STARTED'}
  | {type: 'AUDIO_OUT'}
  | {type: 'INTERRUPTED'; holding?: boolean}
  | {type: 'LISTEN_STOPPED'}
  | {type: 'LISTEN_CAPPED'}
  | {type: 'SPEAKING_DONE'; holding?: boolean}
  | {type: 'ERROR'; message: string; kind: ErrorKind}
  | {type: 'CLOSED'; reason: string; autoRetry?: boolean}
  | {type: 'RESET'}
  | {type: 'RETRY'}
  | {type: 'RECONNECT_SCHEDULED'; attempt: number};

export interface SessionSnapshot {
  phase: SessionPhase;
  status: string;
  error: string;
  errorKind?: ErrorKind;
}

export const INITIAL_SESSION: SessionSnapshot = {
  phase: 'locked',
  status: 'Add a Gemini API key to begin.',
  error: '',
};

export function canStartListening(phase: SessionPhase): boolean {
  return phase === 'ready';
}

export function canRetry(phase: SessionPhase): boolean {
  return phase === 'error' || phase === 'closed';
}

function connectingState(): SessionSnapshot {
  return {
    phase: 'connecting',
    status: 'Connecting to the orb…',
    error: '',
  };
}

export function reduceSession(
  state: SessionSnapshot,
  event: SessionEvent,
): SessionSnapshot {
  switch (event.type) {
    case 'KEY_CLEARED':
      return INITIAL_SESSION;
    case 'KEY_SUBMITTED':
      return connectingState();
    case 'CONNECT_STARTED':
    case 'RESET':
      if (state.phase === 'locked') {
        return state;
      }
      return connectingState();
    case 'RETRY':
      if (state.phase !== 'error' && state.phase !== 'closed') {
        return state;
      }
      return connectingState();
    case 'OPENED':
      if (state.phase !== 'connecting' && state.phase !== 'ready') {
        return state;
      }
      return {
        phase: 'ready',
        status: 'Connected. Hold Talk and speak.',
        error: '',
      };
    case 'LISTEN_START_REQUESTED':
      if (state.phase !== 'ready') {
        return state;
      }
      return {
        ...state,
        status: 'Requesting microphone access…',
      };
    case 'LISTEN_STARTED':
      if (state.phase !== 'ready' && state.phase !== 'listening') {
        return state;
      }
      return {
        phase: 'listening',
        status: 'Listening… Release Talk to pause.',
        error: '',
      };
    case 'AUDIO_OUT':
      if (
        state.phase !== 'listening' &&
        state.phase !== 'speaking' &&
        state.phase !== 'ready'
      ) {
        return state;
      }
      return {
        ...state,
        phase: 'speaking',
        status: 'The orb is speaking…',
      };
    case 'INTERRUPTED':
      if (state.phase !== 'speaking') {
        return state;
      }
      if (event.holding === false) {
        return {
          phase: 'ready',
          status: 'Interrupted. Hold Talk to continue.',
          error: '',
        };
      }
      return {
        phase: 'listening',
        status: 'Interrupted. Keep talking.',
        error: '',
      };
    case 'LISTEN_STOPPED':
      if (state.phase === 'locked' || state.phase === 'connecting') {
        return state;
      }
      if (state.phase === 'error') {
        return state;
      }
      return {
        phase: 'ready',
        status: 'Paused. Hold Talk to speak again.',
        error: '',
      };
    case 'SPEAKING_DONE':
      if (state.phase !== 'speaking') {
        return state;
      }
      if (event.holding) {
        return {
          phase: 'listening',
          status: 'Listening… Release Talk to pause.',
          error: '',
        };
      }
      return {
        phase: 'ready',
        status: 'Paused. Hold Talk to speak again.',
        error: '',
      };
    case 'LISTEN_CAPPED':
      if (state.phase !== 'listening' && state.phase !== 'speaking') {
        return state;
      }
      return {
        phase: 'ready',
        status: 'Talk limit reached. Hold Talk to start again.',
        error: '',
      };
    case 'ERROR':
      if (
        event.kind === 'mic' &&
        (state.phase === 'ready' ||
          state.phase === 'listening' ||
          state.phase === 'speaking')
      ) {
        return {
          phase: 'ready',
          status: 'Connected. Hold Talk and speak.',
          error: event.message,
          errorKind: event.kind,
        };
      }
      return {
        phase: 'error',
        status: 'Something went wrong.',
        error: event.message,
        errorKind: event.kind,
      };
    case 'CLOSED':
      return {
        phase: 'closed',
        status: event.autoRetry
          ? 'Connection dropped. Reconnecting…'
          : event.reason
            ? `Disconnected: ${event.reason}`
            : 'Disconnected. Tap Reconnect.',
        error: '',
      };
    case 'RECONNECT_SCHEDULED':
      if (state.phase !== 'closed' && state.phase !== 'error') {
        return state;
      }
      return {
        phase: 'connecting',
        status:
          event.attempt > 0
            ? `Reconnecting (try ${event.attempt + 1})…`
            : 'Reconnecting…',
        error: '',
      };
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
}
