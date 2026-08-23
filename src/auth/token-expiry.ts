export const TOKEN_REMIND_LEAD_MS = 30_000;

export function shouldRemint(
  expireTime: string | undefined,
  now: number,
  leadMs = TOKEN_REMIND_LEAD_MS,
): boolean {
  if (!expireTime) {
    return false;
  }
  const at = Date.parse(expireTime);
  if (Number.isNaN(at)) {
    return false;
  }
  return at - now <= leadMs;
}
