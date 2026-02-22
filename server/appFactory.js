import cors from 'cors';
import express from 'express';
import path from 'node:path';

import {
  normalizeCampaign,
  readCampaign as defaultReadCampaign,
  writeCampaign as defaultWriteCampaign,
} from './campaignStore.js';

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
    response.json(normalizeCampaign(campaign));
  });

  app.put('/api/campaign', async (request, response) => {
    const campaign = normalizeCampaign(request.body);

    await writeCampaign(campaign);
    response.json({ ok: true });
  });

  app.get('/api/locations', async (request, response) => {
    const campaign = await readCampaign();
    const normalized = normalizeCampaign(campaign);
    const settingId = typeof request.query.settingId === 'string' ? request.query.settingId : null;
    const relevantSettings = settingId
      ? normalized.settings.filter((setting) => setting.id === settingId)
      : normalized.settings;

    const locations = relevantSettings.flatMap((setting) =>
      setting.locations.map((location) => ({
        id: location.id,
        name: location.name,
        settingId: setting.id,
      })),
    );
    response.json(locations);
  });

  app.get('/api/shop/:locationId', async (request, response) => {
    const campaign = await readCampaign();
    const normalized = normalizeCampaign(campaign);
    const matchedSetting = normalized.settings.find((setting) =>
      setting.locations.some((item) => item.id === request.params.locationId),
    );
    const location = matchedSetting?.locations.find((item) => item.id === request.params.locationId);

    if (!location) {
      response.status(404).json({ message: 'Location not found' });
      return;
    }

    const catalog = matchedSetting?.catalog ?? [];
    const rules = location.rules && typeof location.rules === 'object' ? location.rules : null;

    const availableItemIds = Array.isArray(location.availableItemIds) ? location.availableItemIds : [];
    const itemSet = new Set(availableItemIds);
    const showAllItems = availableItemIds.length === 0;
    const manualPrices = location.manualPrices && typeof location.manualPrices === 'object' ? location.manualPrices : {};

    const byRule = (catalogItem) => {
      if (!rules) {
        return showAllItems || itemSet.has(catalogItem.id);
      }

      const includeCategories = Array.isArray(rules.includeCategories) ? rules.includeCategories : [];
      const includeTags = Array.isArray(rules.includeTags) ? rules.includeTags : [];
      const excludeTags = Array.isArray(rules.excludeTags) ? rules.excludeTags : [];
      const legalStatuses = Array.isArray(rules.legalStatuses) ? rules.legalStatuses : [];
      const itemTags = Array.isArray(catalogItem.tags) ? catalogItem.tags : [];

      const categoryMatch = includeCategories.length === 0 || (catalogItem.category && includeCategories.includes(catalogItem.category));
      const includeTagMatch = includeTags.length === 0 || includeTags.some((tag) => itemTags.includes(tag));
      const excludeTagMatch = excludeTags.some((tag) => itemTags.includes(tag));
      const legalMatch = legalStatuses.length === 0 || (catalogItem.legalStatus && legalStatuses.includes(catalogItem.legalStatus));

      return categoryMatch && includeTagMatch && !excludeTagMatch && legalMatch;
    };

    const filtered = catalog.filter((catalogItem) => byRule(catalogItem));
    const pinnedItemIds = rules && Array.isArray(rules.pinnedItemIds) ? rules.pinnedItemIds : [];
    const bannedItemIds = rules && Array.isArray(rules.bannedItemIds) ? rules.bannedItemIds : [];
    const pinned = catalog.filter((catalogItem) => pinnedItemIds.includes(catalogItem.id));
    const merged = [...filtered, ...pinned].filter(
      (catalogItem, index, self) => self.findIndex((item) => item.id === catalogItem.id) === index,
    );

    const items = merged
      .filter((catalogItem) => !bannedItemIds.includes(catalogItem.id))
      .map((catalogItem) => {
        const ruleOverrides = rules && rules.manualPriceOverrides && typeof rules.manualPriceOverrides === 'object'
          ? rules.manualPriceOverrides
          : {};

        const manualPrice = typeof ruleOverrides[catalogItem.id] === 'number'
          ? ruleOverrides[catalogItem.id]
          : typeof manualPrices[catalogItem.id] === 'number'
            ? manualPrices[catalogItem.id]
            : undefined;

        const categoryModifiers = rules?.pricingProfile?.categoryModifiers && typeof rules.pricingProfile.categoryModifiers === 'object'
          ? rules.pricingProfile.categoryModifiers
          : {};
        const categoryModifier = catalogItem.category ? Number(categoryModifiers[catalogItem.category] ?? 0) : 0;
        const markupPercent = Number(rules?.markupPercent ?? location.percentMarkup ?? 0);
        const categoryAdjusted = catalogItem.basePrice * (1 + categoryModifier / 100);
        const computedPrice = categoryAdjusted * (1 + markupPercent / 100);
        const roundedPrice = rules?.pricingProfile?.rounding === 'none' ? computedPrice : Math.round(computedPrice);

        const source = typeof ruleOverrides[catalogItem.id] === 'number'
          ? 'override'
          : pinnedItemIds.includes(catalogItem.id)
            ? 'pinned'
            : 'rule';

        return {
          id: catalogItem.id,
          name: catalogItem.name,
          basePrice: catalogItem.basePrice,
          finalPrice: manualPrice ?? roundedPrice,
          weight: catalogItem.weight,
          source,
          ...(catalogItem.category ? { category: catalogItem.category } : {}),
          ...(catalogItem.notes ? { notes: catalogItem.notes } : {}),
          ...(Array.isArray(catalogItem.tags) ? { tags: catalogItem.tags } : {}),
          ...(catalogItem.legalStatus ? { legalStatus: catalogItem.legalStatus } : {}),
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