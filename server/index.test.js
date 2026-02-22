// @vitest-environment node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from './appFactory.js';
import { normalizeCampaign } from './campaignStore.js';
import { resolveRuntimeConfig } from './runtimeConfig.js';

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

describe('runtime config', () => {
  it('binds to LAN by default', () => {
    const config = resolveRuntimeConfig({
      env: {},
      baseDir: process.cwd(),
    });

    expect(config.allowLan).toBe(true);
    expect(config.host).toBe('0.0.0.0');
  });

  it('supports explicit localhost-only mode', () => {
    const config = resolveRuntimeConfig({
      env: { ALLOW_LAN: 'false' },
      baseDir: process.cwd(),
    });

    expect(config.allowLan).toBe(false);
    expect(config.host).toBe('127.0.0.1');
  });
});

describe('shop api', () => {
  it('returns full catalog when location availableItemIds is empty', async () => {
    const campaign = {
      schemaVersion: '1.0',
      catalog: [
        { id: 'rope', name: 'Rope', basePrice: 10, weight: 1, category: 'Gear', notes: 'Climbing aid' },
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
    expect(data.items[0].category).toBe('Gear');
    expect(data.items[0].notes).toBe('Climbing aid');

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

describe('campaign normalization', () => {
  it('migrates legacy schemaVersion 1.0 campaign into setting-scoped structure', () => {
    const normalized = normalizeCampaign({
      schemaVersion: '1.0',
      catalog: [{ id: 'rope', name: 'Rope', basePrice: 10, weight: 1 }],
      locations: [{ id: 'riverfall', name: 'Riverfall', availableItemIds: [], percentMarkup: 0, manualPrices: {} }],
    });

    expect(normalized.schemaVersion).toBe('2.0');
    expect(normalized.activeSettingId).toBe('default-setting');
    expect(normalized.settings).toHaveLength(1);
    expect(normalized.settings[0].catalog).toHaveLength(1);
    expect(normalized.settings[0].locations).toHaveLength(1);
  });

  it('keeps an already normalized 2.0 setting campaign unchanged in shape', () => {
    const input = {
      schemaVersion: '2.0',
      activeSettingId: 'vegas-70s',
      settings: [
        {
          id: 'vegas-70s',
          name: '70s Vegas',
          catalog: [],
          locations: [],
        },
      ],
    };

    const normalized = normalizeCampaign(input);

    expect(normalized.schemaVersion).toBe('2.0');
    expect(normalized.activeSettingId).toBe('vegas-70s');
    expect(normalized.settings).toHaveLength(1);
    expect(normalized.settings[0].id).toBe('vegas-70s');
  });
});
