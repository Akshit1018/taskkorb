export const TRANSCRIPT_STORAGE = 'taskkorb.transcripts';
export const TRANSCRIPT_CAP = 2400;

export interface TranscriptState {
  user: string;
  orb: string;
}

export const EMPTY_TRANSCRIPT: TranscriptState = {
  user: '',
  orb: '',
};

export function clipTranscript(text: string, cap = TRANSCRIPT_CAP): string {
  if (text.length <= cap) {
    return text;
  }
  return text.slice(text.length - cap);
}

export function appendTranscript(
  current: string,
  incoming: string,
  cap = TRANSCRIPT_CAP,
): string {
  const next = `${current} ${incoming}`.replace(/\s+/g, ' ').trim();
  return clipTranscript(next, cap);
}

export function readStoredTranscript(): TranscriptState {
  try {
    const raw = localStorage.getItem(TRANSCRIPT_STORAGE);
    if (!raw) {
      return EMPTY_TRANSCRIPT;
    }
    const parsed = JSON.parse(raw) as Partial<TranscriptState>;
    return {
      user: clipTranscript(typeof parsed.user === 'string' ? parsed.user : ''),
      orb: clipTranscript(typeof parsed.orb === 'string' ? parsed.orb : ''),
    };
  } catch {
    return EMPTY_TRANSCRIPT;
  }
}

export function writeStoredTranscript(state: TranscriptState): void {
  try {
    localStorage.setItem(
      TRANSCRIPT_STORAGE,
      JSON.stringify({
        user: clipTranscript(state.user),
        orb: clipTranscript(state.orb),
      }),
    );
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

export function exportTranscript(state: TranscriptState): string {
  const lines = ['Taskkorb transcript', ''];
  if (state.user) {
    lines.push(`You: ${state.user}`, '');
  }
  if (state.orb) {
    lines.push(`Orb: ${state.orb}`, '');
  }
  return lines.join('\n');
}
