import path from 'node:path';

export function resolveRuntimeConfig({ env = process.env, baseDir = process.cwd() } = {}) {
  const allowLan = env.ALLOW_LAN !== 'false';
  const host = allowLan ? '0.0.0.0' : '127.0.0.1';
  const port = Number(env.PROXY_PORT ?? env.PORT ?? 5174);
  const serveStatic = env.SERVE_STATIC === 'true';
  const staticDir = env.STATIC_DIR ? path.resolve(env.STATIC_DIR) : path.resolve(baseDir, '..', 'dist');

  return {
    allowLan,
    host,
    port,
    serveStatic,
    staticDir,
  };
}
