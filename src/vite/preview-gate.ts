import type {IncomingMessage, ServerResponse} from 'node:http';
import type {Plugin} from 'vite';

const COOKIE = 'taskkorb_preview';

function readCookie(req: IncomingMessage, name: string): string {
  const cookie = req.headers.cookie ?? '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function gatePage(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Taskkorb preview</title>
    <style>
      body { margin:0; min-height:100vh; display:grid; place-items:center; background:#100c14; color:#fff; font-family:system-ui,sans-serif; }
      form { width:min(360px,92vw); display:grid; gap:12px; }
      input, button { font:inherit; padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,.2); }
      input { background:#0006; color:#fff; }
      button { background:#fff; color:#100c14; font-weight:600; }
    </style>
  </head>
  <body>
    <form method="post" action="/__preview">
      <p>This preview is locked. Enter the shared preview password.</p>
      <input type="password" name="password" autocomplete="current-password" aria-label="Preview password" />
      <button type="submit">Open preview</button>
    </form>
  </body>
</html>`;
}

function attachGate(middlewares: {
  use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void;
}, password: string) {
  middlewares.use((req, res, next) => {
    const url = req.url ?? '/';
    if (
      url.startsWith('/@') ||
      url.startsWith('/src/') ||
      url.startsWith('/node_modules/') ||
      url.startsWith('/assets/') ||
      url.startsWith('/pcm-recorder-worklet.js') ||
      url.startsWith('/favicon')
    ) {
      next();
      return;
    }

    if (req.method === 'POST' && url.startsWith('/__preview')) {
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        const submitted = new URLSearchParams(body).get('password') ?? '';
        if (submitted === password) {
          res.statusCode = 302;
          res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(password)}; Path=/; SameSite=Lax`);
          res.setHeader('Location', '/');
          res.end();
          return;
        }
        res.statusCode = 401;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(gatePage());
      });
      return;
    }

    if (readCookie(req, COOKIE) === password) {
      next();
      return;
    }

    res.statusCode = 401;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(gatePage());
  });
}

export function previewGatePlugin(): Plugin {
  const password = process.env.PREVIEW_PASSWORD ?? '';
  return {
    name: 'taskkorb-preview-gate',
    configureServer(server) {
      if (!password) {
        return;
      }
      attachGate(server.middlewares, password);
    },
    configurePreviewServer(server) {
      if (!password) {
        return;
      }
      attachGate(server.middlewares, password);
    },
  };
}
