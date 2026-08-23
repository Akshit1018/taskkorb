export function issuerClientIp(req: {
  headers: Record<string, string | string[] | undefined>;
  socket?: {remoteAddress?: string};
}): string {
  const cloudflare = req.headers['cf-connecting-ip'];
  if (typeof cloudflare === 'string' && cloudflare.trim()) {
    return cloudflare.trim();
  }
  return req.socket?.remoteAddress ?? 'unknown';
}
