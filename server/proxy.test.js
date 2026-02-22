// @vitest-environment node
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { afterEach, describe, expect, it } from 'vitest';

const cleanupPaths = [];

afterEach(async () => {
  while (cleanupPaths.length > 0) {
    const targetPath = cleanupPaths.pop();
    if (targetPath) {
      await fs.rm(targetPath, { recursive: true, force: true });
    }
  }
});

describe('proxy runtime', () => {
  it('preserves category and notes in /api/shop response', async () => {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'swade-proxy-'));
    cleanupPaths.push(tempRoot);

    const dataDir = path.join(tempRoot, 'server', 'data');
    await fs.mkdir(dataDir, { recursive: true });

    const campaign = {
      schemaVersion: '1.0',
      catalog: [
        {
          id: 'rope',
          name: 'Rope',
          basePrice: 10,
          weight: 1,
          category: 'Gear',
          notes: 'Climbing aid',
        },
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

    await fs.writeFile(path.join(dataDir, 'campaign.json'), JSON.stringify(campaign, null, 2), 'utf8');

    const port = 6200 + Math.floor(Math.random() * 200);
    const proxyPath = path.resolve(process.cwd(), 'server', 'proxy.cjs');

    const child = spawn(process.execPath, [proxyPath], {
      cwd: tempRoot,
      env: {
        ...process.env,
        PROXY_PORT: String(port),
        ALLOW_LAN: 'false',
        SERVE_STATIC: 'false',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const waitForReady = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Proxy did not start in time'));
      }, 10000);

      const onData = (chunk) => {
        const text = String(chunk);
        if (text.includes('[proxy] running on')) {
          clearTimeout(timeout);
          child.stdout.off('data', onData);
          resolve(undefined);
        }
      };

      child.stdout.on('data', onData);
      child.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.once('exit', (code) => {
        clearTimeout(timeout);
        reject(new Error(`Proxy exited before startup with code ${code ?? 'null'}`));
      });
    });

    expect(waitForReady).toBeUndefined();

    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/shop/riverfall`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].category).toBe('Gear');
      expect(data.items[0].notes).toBe('Climbing aid');
    } finally {
      child.kill();
      await new Promise((resolve) => {
        child.once('exit', () => resolve(undefined));
      });
    }
  });
});
