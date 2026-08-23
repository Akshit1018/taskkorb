export const MIN_MINT_INTERVAL_MS = 2000;

export function checkMintRate(
  lastAt: number,
  now: number,
  minIntervalMs = MIN_MINT_INTERVAL_MS,
): {allowed: true} | {allowed: false; retryAfterMs: number} {
  if (lastAt > 0 && now - lastAt < minIntervalMs) {
    return {allowed: false, retryAfterMs: minIntervalMs - (now - lastAt)};
  }
  return {allowed: true};
}

export function parseRetryAfterMs(
  header: string | null,
  fallbackMs = MIN_MINT_INTERVAL_MS,
): number {
  if (!header) {
    return fallbackMs;
  }

  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(Math.round(seconds * 1000), 30_000);
  }

  const date = Date.parse(header);
  if (!Number.isNaN(date)) {
    return Math.max(0, Math.min(date - Date.now(), 30_000));
  }

  return fallbackMs;
}
