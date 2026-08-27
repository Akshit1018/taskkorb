import type {IncomingMessage, ServerResponse} from 'node:http';
import type {Plugin} from 'vite';

export function healthStatus(env: {
  GEMINI_API_KEY?: string;
  PREVIEW_PASSWORD?: string;
  BILLING_MODE?: string;
  BILLING_ENFORCE?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PHONEPE_CLIENT_ID?: string;
  PHONEPE_CLIENT_SECRET?: string;
}): {
  ok: true;
  hostedToken: boolean;
  previewLocked: boolean;
  billingMode: 'mock' | 'live';
  billingEnforce: boolean;
  paypalReady: boolean;
  phonepeReady: boolean;
} {
  return {
    ok: true,
    hostedToken: Boolean(env.GEMINI_API_KEY?.trim()),
    previewLocked: Boolean(env.PREVIEW_PASSWORD),
    billingMode: env.BILLING_MODE === 'live' ? 'live' : 'mock',
    billingEnforce: env.BILLING_ENFORCE === '1',
    paypalReady: Boolean(env.PAYPAL_CLIENT_ID?.trim() && env.PAYPAL_CLIENT_SECRET?.trim()),
    phonepeReady: Boolean(env.PHONEPE_CLIENT_ID?.trim() && env.PHONEPE_CLIENT_SECRET?.trim()),
  };
}

function writeJson(res: ServerResponse, body: unknown) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function healthPlugin(): Plugin {
  const body = healthStatus(process.env);
  return {
    name: 'taskkorb-health',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method === 'GET' && (req.url ?? '').startsWith('/api/health')) {
          writeJson(res, body);
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method === 'GET' && (req.url ?? '').startsWith('/api/health')) {
          writeJson(res, body);
          return;
        }
        next();
      });
    },
  };
}
