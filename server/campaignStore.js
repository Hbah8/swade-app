import fs from 'node:fs/promises';
import path from 'node:path';

const defaultCampaign = {
  schemaVersion: '2.0',
  activeSettingId: 'default-setting',
  settings: [
    {
      id: 'default-setting',
      name: 'Default Setting',
      catalog: [],
      locations: [],
    },
  ],
};

function normalizeLocation(location) {
  const defaultRules = {
    includeCategories: [],
    includeTags: [],
    excludeTags: [],
    legalStatuses: [],
    markupPercent: 0,
    pricingProfile: {
      id: 'default',
      name: 'Default',
      categoryModifiers: {},
      rounding: 'integer',
    },
    pinnedItemIds: [],
    bannedItemIds: [],
    manualPriceOverrides: {},
  };

  return {
    id: typeof location?.id === 'string' ? location.id : '',
    name: typeof location?.name === 'string' ? location.name : 'New Location',
    availableItemIds: Array.isArray(location?.availableItemIds) ? location.availableItemIds : [],
    percentMarkup: Number(location?.percentMarkup ?? 0),
    manualPrices: location?.manualPrices && typeof location.manualPrices === 'object' ? location.manualPrices : {},
    rules: location?.rules && typeof location.rules === 'object' ? {
      ...defaultRules,
      ...location.rules,
      pricingProfile: {
        ...defaultRules.pricingProfile,
        ...(location.rules.pricingProfile && typeof location.rules.pricingProfile === 'object' ? location.rules.pricingProfile : {}),
      },
      includeCategories: Array.isArray(location.rules.includeCategories) ? location.rules.includeCategories : [],
      includeTags: Array.isArray(location.rules.includeTags) ? location.rules.includeTags : [],
      excludeTags: Array.isArray(location.rules.excludeTags) ? location.rules.excludeTags : [],
      legalStatuses: Array.isArray(location.rules.legalStatuses) ? location.rules.legalStatuses : [],
      pinnedItemIds: Array.isArray(location.rules.pinnedItemIds) ? location.rules.pinnedItemIds : [],
      bannedItemIds: Array.isArray(location.rules.bannedItemIds) ? location.rules.bannedItemIds : [],
      manualPriceOverrides:
        location.rules.manualPriceOverrides && typeof location.rules.manualPriceOverrides === 'object'
          ? location.rules.manualPriceOverrides
          : {},
    } : defaultRules,
    shareColumns: Array.isArray(location?.shareColumns) ? location.shareColumns : ['name', 'category', 'finalPrice', 'weight'],
  };
}

function normalizeSetting(setting, fallbackId = 'default-setting') {
  return {
    id: typeof setting?.id === 'string' && setting.id.trim() ? setting.id : fallbackId,
    name: typeof setting?.name === 'string' && setting.name.trim() ? setting.name : 'Default Setting',
    catalog: Array.isArray(setting?.catalog) ? setting.catalog : [],
    locations: Array.isArray(setting?.locations) ? setting.locations.map((location) => normalizeLocation(location)) : [],
  };
}

export function normalizeCampaign(campaign) {
  if (!campaign || typeof campaign !== 'object') {
    return defaultCampaign;
  }

  if (campaign.schemaVersion === '2.0' && Array.isArray(campaign.settings)) {
    const settings = campaign.settings.map((setting, index) => normalizeSetting(setting, `setting-${index + 1}`));
    const fallbackActiveId = settings[0]?.id ?? defaultCampaign.activeSettingId;
    const activeSettingId = typeof campaign.activeSettingId === 'string' ? campaign.activeSettingId : fallbackActiveId;
    const hasActive = settings.some((setting) => setting.id === activeSettingId);

    return {
      schemaVersion: '2.0',
      activeSettingId: hasActive ? activeSettingId : fallbackActiveId,
      settings: settings.length > 0 ? settings : defaultCampaign.settings,
    };
  }

  const legacyCatalog = Array.isArray(campaign.catalog) ? campaign.catalog : [];
  const legacyLocations = Array.isArray(campaign.locations) ? campaign.locations.map((location) => normalizeLocation(location)) : [];

  return {
    schemaVersion: '2.0',
    activeSettingId: 'default-setting',
    settings: [
      {
        id: 'default-setting',
        name: 'Default Setting',
        catalog: legacyCatalog,
        locations: legacyLocations,
      },
    ],
  };
}

const dataDir = path.resolve(process.cwd(), 'server', 'data');
const dataFile = path.resolve(dataDir, 'campaign.json');
const backupFile = path.resolve(dataDir, 'campaign.backup.json');

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(defaultCampaign, null, 2), 'utf8');
  }
}

export async function readCampaign() {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return normalizeCampaign(parsed);
  } catch {
    return defaultCampaign;
  }
}

export async function writeCampaign(campaign) {
  await ensureDataFile();
  const existingRaw = await fs.readFile(dataFile, 'utf8');
  await fs.writeFile(backupFile, existingRaw, 'utf8');
  await fs.writeFile(dataFile, JSON.stringify(normalizeCampaign(campaign), null, 2), 'utf8');
}
