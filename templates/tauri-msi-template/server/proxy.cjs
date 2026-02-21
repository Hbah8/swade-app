const cors = require('cors');
const express = require('express');
const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');

const defaultCampaign = {
  schemaVersion: '1.0',
  catalog: [],
  locations: [],
};

const dataDir = path.resolve(process.cwd(), 'server', 'data');
const dataFile = path.resolve(dataDir, 'campaign.json');

async function ensureDataFile() {
  await fsPromises.mkdir(dataDir, { recursive: true });

  try {
    await fsPromises.access(dataFile);
  } catch {
    await fsPromises.writeFile(dataFile, JSON.stringify(defaultCampaign, null, 2), 'utf8');
  }
}

async function readCampaign() {
  await ensureDataFile();
  const raw = await fsPromises.readFile(dataFile, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return defaultCampaign;
    }

    return {
      schemaVersion: parsed.schemaVersion ?? '1.0',
      catalog: Array.isArray(parsed.catalog) ? parsed.catalog : [],
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
    };
  } catch {
    return defaultCampaign;
  }
}

async function writeCampaign(campaign) {
  await ensureDataFile();
  await fsPromises.writeFile(dataFile, JSON.stringify(campaign, null, 2), 'utf8');
}

const allowLan = process.env.ALLOW_LAN !== 'false';
const host = process.env.PROXY_HOST ?? (allowLan ? '0.0.0.0' : '127.0.0.1');
const port = Number(process.env.PROXY_PORT ?? process.env.PORT ?? 5174);
const serveStatic = process.env.SERVE_STATIC === 'true';
const staticDir = process.env.STATIC_DIR
  ? path.resolve(process.env.STATIC_DIR)
  : path.resolve(__dirname, '..', 'dist');

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

  const availableItemIds = Array.isArray(location.availableItemIds) ? location.availableItemIds : [];
  const itemSet = new Set(availableItemIds);
  const showAllItems = availableItemIds.length === 0;
  const manualPrices = location.manualPrices && typeof location.manualPrices === 'object' ? location.manualPrices : {};

  const items = campaign.catalog
    .filter((catalogItem) => showAllItems || itemSet.has(catalogItem.id))
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

if (serveStatic && fs.existsSync(staticDir)) {
  app.use(express.static(staticDir, { index: false }));

  app.use((request, response) => {
    if (request.path.startsWith('/api/')) {
      response.status(404).json({ message: 'Not found' });
      return;
    }

    response.sendFile(path.resolve(staticDir, 'index.html'));
  });
}

app.listen(port, host, () => {
  const mode = allowLan ? 'LAN-enabled' : 'localhost-only';
  console.log(`[proxy] running on http://${host}:${port} (${mode})`);
});
