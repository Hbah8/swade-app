// @vitest-environment node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from './appFactory.js';

const cleanupPaths = [];

afterEach(async () => {
  while (cleanupPaths.length > 0) {
    const targetPath = cleanupPaths.pop();
    if (targetPath) {
      await fs.rm(targetPath, { recursive: true, force: true });
    }
  }
});

describe('proxy static SPA fallback', () => {
  it('serves index.html for deep links when static mode is enabled', async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'swade-static-'));
    cleanupPaths.push(tempRoot);

    const indexHtml = path.join(tempRoot, 'index.html');
    await fs.writeFile(indexHtml, '<html><body>shop app</body></html>', 'utf8');

    const app = createApp({
      serveStatic: true,
      staticDir: tempRoot,
    });

    const server = await new Promise((resolve) => {
      const running = app.listen(0, '127.0.0.1', () => resolve(running));
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Could not determine server address');
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/shop/riverfall`);
    const text = await response.text();

    expect(response.status).toBe(200);
    expect(text).toContain('shop app');

    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(undefined);
      });
    });
  });
});

describe('shop api', () => {
  it('returns full catalog when location availableItemIds is empty', async () => {
    const campaign = {
      schemaVersion: '1.0',
      catalog: [
        { id: 'rope', name: 'Rope', basePrice: 10, weight: 1 },
        { id: 'torch', name: 'Torch', basePrice: 5, weight: 0.5 },
      ],
      locations: [
        {
          id: 'riverfall',
          name: 'Riverfall',
          availableItemIds: [],
          percentMarkup: 10,
          manualPrices: {},
        },
      ],
    };

    const app = createApp({
      readCampaign: async () => campaign,
      writeCampaign: async () => undefined,
    });

    const server = await new Promise((resolve) => {
      const running = app.listen(0, '127.0.0.1', () => resolve(running));
    });

    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Could not determine server address');
    }

    const response = await fetch(`http://127.0.0.1:${address.port}/api/shop/riverfall`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(2);

    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(undefined);
      });
    });
  });
});
