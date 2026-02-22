import type {
  LegacyShopCampaignState,
  ShopCampaignState,
  ShopLocation,
  ShopSetting,
} from '@/models/shop';
import { BUILT_IN_CATALOG_ITEMS } from '@/data/shopBuiltInCatalog';
import { createDefaultShopRules } from '@/services/shopRules';

const defaultSettingId = 'default-setting';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeLocation(location: ShopLocation): ShopLocation {
  return {
    id: location.id,
    name: location.name,
    availableItemIds: Array.isArray(location.availableItemIds) ? location.availableItemIds : [],
    percentMarkup: Number(location.percentMarkup ?? 0),
    manualPrices: location.manualPrices && typeof location.manualPrices === 'object' ? location.manualPrices : {},
    rules: location.rules ?? createDefaultShopRules(),
    shareColumns: Array.isArray(location.shareColumns) ? location.shareColumns : ['name', 'category', 'finalPrice', 'weight'],
  };
}

function getDefaultSetting(): ShopSetting {
  return {
    id: defaultSettingId,
    name: '70s Vegas',
    catalog: BUILT_IN_CATALOG_ITEMS,
    locations: [],
  };
}

function normalizeSetting(setting: ShopSetting, fallbackId: string): ShopSetting {
  return {
    id: setting.id?.trim() ? setting.id : fallbackId,
    name: setting.name?.trim() ? setting.name : 'Default Setting',
    catalog: Array.isArray(setting.catalog) ? setting.catalog : [],
    locations: Array.isArray(setting.locations) ? setting.locations.map((location) => normalizeLocation(location)) : [],
  };
}

export function normalizeClientCampaign(campaign: ShopCampaignState | LegacyShopCampaignState | unknown): ShopCampaignState {
  if (!campaign || typeof campaign !== 'object') {
    return {
      schemaVersion: '2.0',
      activeSettingId: defaultSettingId,
      settings: [getDefaultSetting()],
    };
  }

  const typed = campaign as Record<string, unknown>;
  if (typed.schemaVersion === '2.0' && Array.isArray(typed.settings)) {
    const settings = (typed.settings as ShopSetting[]).map((setting, index) => normalizeSetting(setting, `setting-${index + 1}`));
    const fallbackActive = settings[0]?.id ?? defaultSettingId;
    const activeSettingId = typeof typed.activeSettingId === 'string' ? typed.activeSettingId : fallbackActive;

    return {
      schemaVersion: '2.0',
      activeSettingId: settings.some((setting) => setting.id === activeSettingId) ? activeSettingId : fallbackActive,
      settings: settings.length ? settings : [getDefaultSetting()],
    };
  }

  const legacy = typed as unknown as LegacyShopCampaignState;
  return {
    schemaVersion: '2.0',
    activeSettingId: defaultSettingId,
    settings: [
      {
        id: defaultSettingId,
        name: '70s Vegas',
        catalog: Array.isArray(legacy.catalog) && legacy.catalog.length > 0 ? legacy.catalog : BUILT_IN_CATALOG_ITEMS,
        locations: Array.isArray(legacy.locations) ? legacy.locations.map((location) => normalizeLocation(location)) : [],
      },
    ],
  };
}

export function getActiveSetting(campaign: ShopCampaignState): ShopSetting {
  return campaign.settings.find((setting) => setting.id === campaign.activeSettingId) ?? campaign.settings[0];
}

export function addSetting(campaign: ShopCampaignState, name: string): ShopCampaignState {
  const baseId = slugify(name) || `setting-${campaign.settings.length + 1}`;
  const existingIds = new Set(campaign.settings.map((setting) => setting.id));
  let nextId = baseId;
  let suffix = 2;

  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return {
    ...campaign,
    activeSettingId: nextId,
    settings: [...campaign.settings, { id: nextId, name: name.trim() || 'New Setting', catalog: [], locations: [] }],
  };
}

export function ensureUniqueLocationId(campaign: ShopCampaignState, baseId: string): string {
  const existingIds = new Set(campaign.settings.flatMap((setting) => setting.locations.map((location) => location.id)));
  const normalizedBase = slugify(baseId) || 'location';
  let nextId = normalizedBase;
  let suffix = 2;

  while (existingIds.has(nextId)) {
    nextId = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }

  return nextId;
}
