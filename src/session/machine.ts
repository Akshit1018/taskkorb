export type SessionPhase =
  | 'locked'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'speaking'
  | 'error'
  | 'closed';

export type SessionEvent =
  | {type: 'KEY_SUBMITTED'}
  | {type: 'CONNECT_STARTED'}
  | {type: 'OPENED'}
  | {type: 'LISTEN_STARTED'}
  | {type: 'AUDIO_OUT'}
  | {type: 'INTERRUPTED'}
  | {type: 'LISTEN_STOPPED'}
  | {type: 'ERROR'; message: string}
  | {type: 'CLOSED'; reason: string}
  | {type: 'RESET'};

export interface SessionSnapshot {
  phase: SessionPhase;
  status: string;
  error: string;
}

export const INITIAL_SESSION: SessionSnapshot = {
  phase: 'locked',
  status: 'Add a Gemini API key to begin.',
  error: '',
};

export function canStartListening(phase: SessionPhase): boolean {
  return phase === 'ready' || phase === 'speaking';
}

export function reduceSession(
  state: SessionSnapshot,
  event: SessionEvent,
): SessionSnapshot {
  switch (event.type) {
    case 'KEY_SUBMITTED':
    case 'CONNECT_STARTED':
    case 'RESET':
      return {
        phase: 'connecting',
        status: 'Connecting to the orb…',
        error: '',
      };
    case 'OPENED':
      return {
        phase: 'ready',
        status: 'Connected. Tap the red button and speak.',
        error: '',
      };
    case 'LISTEN_STARTED':
      return {
        phase: 'listening',
        status: 'Listening…',
        error: '',
      };
    case 'AUDIO_OUT':
      return {
        ...state,
        phase: state.phase === 'listening' ? 'speaking' : state.phase,
        status: state.phase === 'listening' ? 'The orb is speaking…' : state.status,
      };
    case 'INTERRUPTED':
      return {
        ...state,
        phase: state.phase === 'speaking' ? 'listening' : state.phase,
        status: 'Interrupted. Keep talking.',
      };
    case 'LISTEN_STOPPED':
      return {
        phase: state.phase === 'error' ? 'error' : 'ready',
        status: 'Paused. Tap the red button to speak again.',
        error: state.error,
      };
    case 'ERROR':
      return {
        phase: 'error',
        status: 'Something went wrong.',
        error: event.message,
      };
    case 'CLOSED':
      return {
        phase: 'closed',
        status: event.reason
          ? `Disconnected: ${event.reason}`
          : 'Disconnected. Tap reset to reconnect.',
        error: '',
      };
    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
}
