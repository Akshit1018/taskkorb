export const TRANSCRIPT_STORAGE = 'taskkorb.transcripts';
export const TRANSCRIPT_CAP = 2400;

export type TranscriptSide = 'user' | 'orb';

export interface TranscriptTurn {
  side: TranscriptSide;
  text: string;
  at: number;
}

export interface TranscriptState {
  turns: TranscriptTurn[];
  clipped: boolean;
}

export const EMPTY_TRANSCRIPT: TranscriptState = {
  turns: [],
  clipped: false,
};

export function clipTranscript(text: string, cap = TRANSCRIPT_CAP): string {
  if (text.length <= cap) {
    return text;
  }
  return text.slice(text.length - cap);
}

export function flattenSide(state: TranscriptState, side: TranscriptSide): string {
  return state.turns
    .filter((turn) => turn.side === side)
    .map((turn) => turn.text)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function totalChars(state: TranscriptState): number {
  return state.turns.reduce((sum, turn) => sum + turn.text.length, 0);
}

function clipState(state: TranscriptState, cap = TRANSCRIPT_CAP): TranscriptState {
  if (totalChars(state) <= cap) {
    return state;
  }

  const turns = [...state.turns];
  let extra = totalChars({turns, clipped: true}) - cap;
  while (extra > 0 && turns.length > 0) {
    const first = turns[0];
    if (first.text.length <= extra) {
      extra -= first.text.length;
      turns.shift();
    } else {
      turns[0] = {
        ...first,
        text: first.text.slice(extra),
      };
      extra = 0;
    }
  }
  return {turns, clipped: true};
}

export function appendTranscript(
  current: string,
  incoming: string,
  cap = TRANSCRIPT_CAP,
): string {
  const next = `${current} ${incoming}`.replace(/\s+/g, ' ').trim();
  return clipTranscript(next, cap);
}

export function appendTurn(
  state: TranscriptState,
  side: TranscriptSide,
  incoming: string,
  at = Date.now(),
  cap = TRANSCRIPT_CAP,
): TranscriptState {
  const text = incoming.replace(/\s+/g, ' ').trim();
  if (!text) {
    return state;
  }

  const turns = [...state.turns];
  const last = turns[turns.length - 1];
  if (last && last.side === side) {
    turns[turns.length - 1] = {
      ...last,
      text: `${last.text} ${text}`.replace(/\s+/g, ' ').trim(),
      at,
    };
  } else {
    turns.push({side, text, at});
  }

  return clipState({turns, clipped: state.clipped}, cap);
}

function coerceState(raw: unknown): TranscriptState {
  if (!raw || typeof raw !== 'object') {
    return EMPTY_TRANSCRIPT;
  }
  const value = raw as Partial<TranscriptState> & {user?: unknown; orb?: unknown};
  if (Array.isArray(value.turns)) {
    const turns = value.turns.flatMap((turn) => {
      if (!turn || (turn.side !== 'user' && turn.side !== 'orb')) {
        return [];
      }
      if (typeof turn.text !== 'string' || !turn.text.trim()) {
        return [];
      }
      return [
        {
          side: turn.side,
          text: turn.text,
          at: typeof turn.at === 'number' ? turn.at : Date.now(),
        },
      ];
    });
    return clipState({turns, clipped: Boolean(value.clipped)});
  }

  const user = typeof value.user === 'string' ? value.user : '';
  const orb = typeof value.orb === 'string' ? value.orb : '';
  let next = EMPTY_TRANSCRIPT;
  if (user) {
    next = appendTurn(next, 'user', user, Date.now() - 1);
  }
  if (orb) {
    next = appendTurn(next, 'orb', orb);
  }
  return next;
}

export function readStoredTranscript(): TranscriptState {
  try {
    const raw = localStorage.getItem(TRANSCRIPT_STORAGE);
    if (!raw) {
      return EMPTY_TRANSCRIPT;
    }
    return coerceState(JSON.parse(raw));
  } catch {
    return EMPTY_TRANSCRIPT;
  }
}

export function writeStoredTranscript(state: TranscriptState): void {
  try {
    const next = clipState(state);
    localStorage.setItem(TRANSCRIPT_STORAGE, JSON.stringify(next));
  } catch {
    // Quota or privacy mode — in-memory transcript is enough.
  }
}

export function clearStoredTranscript(): void {
  try {
    localStorage.removeItem(TRANSCRIPT_STORAGE);
  } catch {
    // ignore
  }
}

export function exportTranscript(state: TranscriptState | {user: string; orb: string}): string {
  const normalized = 'turns' in state ? state : coerceState(state);
  const lines = ['Taskkorb transcript', ''];
  for (const turn of normalized.turns) {
    const who = turn.side === 'user' ? 'You' : 'Orb';
    const when = new Date(turn.at).toISOString();
    lines.push(`${who} (${when}): ${turn.text}`, '');
  }
  return lines.join('\n');
}
