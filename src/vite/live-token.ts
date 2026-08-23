import {GoogleGenAI, type CreateAuthTokenConfig} from '@google/genai';
import type {IncomingMessage, ServerResponse} from 'node:http';
import type {Plugin} from 'vite';
import {issuerClientIp} from '../auth/client-ip';
import {buildTokenCreateConfig, readMintedToken} from '../auth/mint-token';
import {checkMintRate} from '../auth/mint-rate-limit';

const lastMintByIp = new Map<string, number>();

function writeJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

async function mintFromServerKey(apiKey: string) {
  const config = buildTokenCreateConfig(Date.now());
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {apiVersion: 'v1alpha'},
  });
  const created = await client.authTokens.create({
    config: config as CreateAuthTokenConfig,
  });
  return readMintedToken(created, config.expireTime);
}

function attachIssuer(
  middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void;
  },
  apiKey: string,
) {
  middlewares.use((req, res, next) => {
    const url = req.url ?? '/';
    if (req.method !== 'GET' || !url.startsWith('/api/live-session')) {
      next();
      return;
    }

    const ip = issuerClientIp(req);
    const now = Date.now();
    const rate = checkMintRate(lastMintByIp.get(ip) ?? 0, now);
    if (rate.allowed === false) {
      res.setHeader('Retry-After', String(Math.ceil(rate.retryAfterMs / 1000)));
      writeJson(res, 429, {
        available: true,
        error: 'Wait a moment, then reconnect.',
      });
      return;
    }
    lastMintByIp.set(ip, now);

    void mintFromServerKey(apiKey)
      .then((minted) => {
        writeJson(res, 200, {
          available: true,
          token: minted.token,
          expireTime: minted.expireTime,
        });
      })
      .catch(() => {
        writeJson(res, 502, {
          available: true,
          error: 'Hosted session is unavailable. Paste a Gemini key to test locally.',
        });
      });
  });
}

function attachUnavailable(middlewares: {
  use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void;
}) {
  middlewares.use((req, res, next) => {
    const url = req.url ?? '/';
    if (req.method !== 'GET' || !url.startsWith('/api/live-session')) {
      next();
      return;
    }
    writeJson(res, 404, {available: false});
  });
}

export function liveTokenPlugin(): Plugin {
  const apiKey = process.env.GEMINI_API_KEY?.trim() ?? '';
  return {
    name: 'taskkorb-live-token',
    configureServer(server) {
      if (!apiKey) {
        attachUnavailable(server.middlewares);
        return;
      }
      attachIssuer(server.middlewares, apiKey);
    },
    configurePreviewServer(server) {
      if (!apiKey) {
        attachUnavailable(server.middlewares);
        return;
      }
      attachIssuer(server.middlewares, apiKey);
    },
  };
}
