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

export function pruneMintLog(
  lastMintByIp: Map<string, number>,
  now: number,
  maxEntries = 256,
  ttlMs = 60_000,
): void {
  for (const [ip, at] of lastMintByIp) {
    if (now - at > ttlMs) {
      lastMintByIp.delete(ip);
    }
  }
  if (lastMintByIp.size <= maxEntries) {
    return;
  }
  const oldest = [...lastMintByIp.entries()].sort((left, right) => left[1] - right[1]);
  for (const [ip] of oldest.slice(0, lastMintByIp.size - maxEntries)) {
    lastMintByIp.delete(ip);
  }
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
