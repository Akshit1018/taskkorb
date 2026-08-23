export const MAX_LISTEN_MS = 180_000;

export function remainingListenMs(
  startedAt: number,
  now: number,
  maxMs = MAX_LISTEN_MS,
): number {
  if (startedAt <= 0) {
    return maxMs;
  }
  return Math.max(0, maxMs - (now - startedAt));
}

export function formatListenRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
