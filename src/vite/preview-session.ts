import {randomBytes, timingSafeEqual} from 'node:crypto';

export const PREVIEW_COOKIE = 'taskkorb_preview';
export const PREVIEW_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function passwordsMatch(submitted: string, expected: string): boolean {
  const left = Buffer.from(submitted);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    timingSafeEqual(right, right);
    return false;
  }
  return timingSafeEqual(left, right);
}

export function createPreviewSessionToken(): string {
  return randomBytes(24).toString('hex');
}

export function readCookie(header: string | undefined, name: string): string {
  const cookie = header ?? '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

export class PreviewSessions {
  private readonly tokens = new Map<string, number>();

  constructor(private readonly now: () => number = Date.now) {}

  issue(ttlMs = PREVIEW_SESSION_TTL_MS): string {
    this.purge();
    const token = createPreviewSessionToken();
    this.tokens.set(token, this.now() + ttlMs);
    return token;
  }

  has(token: string): boolean {
    this.purge();
    const expires = this.tokens.get(token);
    return typeof expires === 'number' && expires > this.now();
  }

  private purge() {
    const now = this.now();
    for (const [token, expires] of this.tokens) {
      if (expires <= now) {
        this.tokens.delete(token);
      }
    }
  }
}
