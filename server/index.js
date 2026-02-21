import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from './appFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowLan = process.env.ALLOW_LAN === 'true';
const host = allowLan ? '0.0.0.0' : '127.0.0.1';
const port = Number(process.env.PROXY_PORT ?? process.env.PORT ?? 5174);
const serveStatic = process.env.SERVE_STATIC === 'true';
const staticDir = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : path.resolve(__dirname, '..', 'dist');

const app = createApp({ serveStatic, staticDir });

app.listen(port, host, () => {
  const mode = allowLan ? 'LAN-enabled' : 'localhost-only';
  console.log(`[proxy] running on http://${host}:${port} (${mode})`);
});
