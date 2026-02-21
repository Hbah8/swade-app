import cors from 'cors';
import express from 'express';
import path from 'node:path';

import { readCampaign as defaultReadCampaign, writeCampaign as defaultWriteCampaign } from './campaignStore.js';

export function createApp(options = {}) {
  const readCampaign = options.readCampaign ?? defaultReadCampaign;
  const writeCampaign = options.writeCampaign ?? defaultWriteCampaign;
  const serveStatic = options.serveStatic ?? false;
  const staticDir = options.staticDir
    ? path.resolve(options.staticDir)
    : path.resolve(process.cwd(), 'dist');

  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_request, response) => {
    response.json({ status: 'ok' });
  });

  app.get('/api/campaign', async (_request, response) => {
    const campaign = await readCampaign();
    response.json(campaign);
  });

  app.put('/api/campaign', async (request, response) => {
    const body = request.body;
    const campaign = {
      schemaVersion: typeof body?.schemaVersion === 'string' ? body.schemaVersion : '1.0',
      catalog: Array.isArray(body?.catalog) ? body.catalog : [],
      locations: Array.isArray(body?.locations) ? body.locations : [],
    };

    await writeCampaign(campaign);
    response.json({ ok: true });
  });

  app.get('/api/locations', async (_request, response) => {
    const campaign = await readCampaign();
    const locations = campaign.locations.map((location) => ({
      id: location.id,
      name: location.name,
    }));
    response.json(locations);
  });

  app.get('/api/shop/:locationId', async (request, response) => {
    const campaign = await readCampaign();
    const location = campaign.locations.find((item) => item.id === request.params.locationId);

    if (!location) {
      response.status(404).json({ message: 'Location not found' });
      return;
    }

    const itemSet = new Set(Array.isArray(location.availableItemIds) ? location.availableItemIds : []);
    const manualPrices = location.manualPrices && typeof location.manualPrices === 'object' ? location.manualPrices : {};

    const items = campaign.catalog
      .filter((catalogItem) => itemSet.has(catalogItem.id))
      .map((catalogItem) => {
        const manualPrice = typeof manualPrices[catalogItem.id] === 'number' ? manualPrices[catalogItem.id] : undefined;
        const percentMarkup = Number(location.percentMarkup ?? 0);
        const computedPrice = Math.round(catalogItem.basePrice * (1 + percentMarkup / 100));

        return {
          id: catalogItem.id,
          name: catalogItem.name,
          basePrice: catalogItem.basePrice,
          finalPrice: manualPrice ?? computedPrice,
          weight: catalogItem.weight,
        };
      });

    response.json({
      locationId: location.id,
      locationName: location.name,
      items,
    });
  });

  if (serveStatic) {
    app.use(express.static(staticDir));

    app.use((request, response) => {
      if (request.path.startsWith('/api/')) {
        response.status(404).json({ message: 'Not found' });
        return;
      }

      response.sendFile(path.resolve(staticDir, 'index.html'));
    });
  }

  return app;
}