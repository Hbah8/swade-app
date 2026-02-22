import { describe, expect, it } from 'vitest';
import type { ShopCampaignState } from '@/models/shop';

import {
  ensureUniqueLocationId,
  getActiveSetting,
  normalizeClientCampaign,
  addSetting,
} from '@/services/shopCampaignState';

describe('shopCampaignState', () => {
  it('normalizes legacy client campaign into setting-scoped structure', () => {
    const normalized = normalizeClientCampaign({
      schemaVersion: '1.0',
      catalog: [{ id: 'rope', name: 'Rope', basePrice: 10, weight: 1 }],
      locations: [{ id: 'riverfall', name: 'Riverfall', availableItemIds: [], percentMarkup: 0, manualPrices: {} }],
    });

    expect(normalized.schemaVersion).toBe('2.0');
    expect(normalized.activeSettingId).toBe('default-setting');
    expect(normalized.settings).toHaveLength(1);
    expect(normalized.settings[0]?.catalog).toHaveLength(1);
  });

  it('returns active setting and falls back to first when active is missing', () => {
    const campaign: ShopCampaignState = {
      schemaVersion: '2.0',
      activeSettingId: 'missing',
      settings: [
        { id: 'vegas', name: 'Vegas', catalog: [], locations: [] },
      ],
    };

    const setting = getActiveSetting(campaign);

    expect(setting.id).toBe('vegas');
  });

  it('adds a new empty setting and switches active setting to it', () => {
    const updated = addSetting(
      {
        schemaVersion: '2.0',
        activeSettingId: 'default-setting',
        settings: [{ id: 'default-setting', name: 'Default', catalog: [], locations: [] }],
      },
      '70s Vegas',
    );

    expect(updated.settings).toHaveLength(2);
    expect(updated.activeSettingId).toBe('70s-vegas');
    expect(updated.settings[1]?.locations).toEqual([]);
  });

  it('ensures location ids are globally unique across settings', () => {
    const unique = ensureUniqueLocationId(
      {
        schemaVersion: '2.0',
        activeSettingId: 'default-setting',
        settings: [
          {
            id: 'default-setting',
            name: 'Default',
            catalog: [],
            locations: [{ id: 'riverfall', name: 'Riverfall', availableItemIds: [], percentMarkup: 0, manualPrices: {} }],
          },
          {
            id: 'vegas',
            name: 'Vegas',
            catalog: [],
            locations: [{ id: 'riverfall-2', name: 'Riverfall 2', availableItemIds: [], percentMarkup: 0, manualPrices: {} }],
          },
        ],
      },
      'riverfall',
    );

    expect(unique).toBe('riverfall-3');
  });
});
