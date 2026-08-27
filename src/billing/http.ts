import type {IncomingMessage} from 'node:http';

export function readHeader(req: IncomingMessage, name: string): string {
  const value = req.headers[name.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}

export function requestOrigin(req: IncomingMessage): string {
  const host = readHeader(req, 'host') || 'localhost:3000';
  const proto = readHeader(req, 'x-forwarded-proto') || 'http';
  return `${proto}://${host}`;
}

export function readJsonBody(req: IncomingMessage, limit = 32_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('body-too-large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    req.on('error', reject);
  });
}

export function parseUrl(raw: string): URL {
  return new URL(raw, 'http://taskkorb.local');
}
