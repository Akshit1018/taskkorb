import type {IncomingMessage, ServerResponse} from 'node:http';
import type {Plugin} from 'vite';

function writeJson(res: ServerResponse, body: unknown) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

export function healthPlugin(): Plugin {
  const hosted = Boolean(process.env.GEMINI_API_KEY?.trim());
  const preview = Boolean(process.env.PREVIEW_PASSWORD);
  return {
    name: 'taskkorb-health',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method === 'GET' && (req.url ?? '').startsWith('/api/health')) {
          writeJson(res, {ok: true, hostedToken: hosted, previewLocked: preview});
          return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next) => {
        if (req.method === 'GET' && (req.url ?? '').startsWith('/api/health')) {
          writeJson(res, {ok: true, hostedToken: hosted, previewLocked: preview});
          return;
        }
        next();
      });
    },
  };
}
