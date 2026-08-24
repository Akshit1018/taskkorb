import type {IncomingMessage, ServerResponse} from 'node:http';
import type {Plugin} from 'vite';

export function healthStatus(env: {
  GEMINI_API_KEY?: string;
  PREVIEW_PASSWORD?: string;
}): {ok: true; hostedToken: boolean; previewLocked: boolean} {
  return {
    ok: true,
    hostedToken: Boolean(env.GEMINI_API_KEY?.trim()),
    previewLocked: Boolean(env.PREVIEW_PASSWORD),
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
