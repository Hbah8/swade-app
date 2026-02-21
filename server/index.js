import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp } from './appFactory.js';
import { resolveRuntimeConfig } from './runtimeConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { allowLan, host, port, serveStatic, staticDir } = resolveRuntimeConfig({
  env: process.env,
  baseDir: __dirname,
});

const app = createApp({ serveStatic, staticDir });

app.listen(port, host, () => {
  const mode = allowLan ? 'LAN-enabled' : 'localhost-only';
  console.log(`[proxy] running on http://${host}:${port} (${mode})`);
});
