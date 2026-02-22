(async () => {
  const { createApp } = await import('./appFactory.js');
  const { resolveRuntimeConfig } = await import('./runtimeConfig.js');

  const { allowLan, host, port, serveStatic, staticDir } = resolveRuntimeConfig({
    env: process.env,
    baseDir: __dirname,
  });

  const app = createApp({ serveStatic, staticDir });

  app.listen(port, host, () => {
    const mode = allowLan ? 'LAN-enabled' : 'localhost-only';
    console.log(`[proxy] running on http://${host}:${port} (${mode})`);
  });
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
