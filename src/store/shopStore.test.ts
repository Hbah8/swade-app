import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useShopStore } from '@/store/shopStore';
import { normalizeClientCampaign } from '@/services/shopCampaignState';

function resetStoreState() {
  const campaign = normalizeClientCampaign(undefined);
  useShopStore.setState({
    campaign,
    activeSetting: campaign.settings[0],
    isSyncing: false,
    syncError: null,
  });
}

describe('shopStore sync compatibility', () => {
  beforeEach(() => {
    resetStoreState();
    useShopStore.persist.clearStorage();
    vi.restoreAllMocks();
  });

  it('keeps local locations when server campaign returns empty locations', async () => {
    useShopStore.getState().addLocation('Downtown');

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ schemaVersion: '2.0', catalog: [], locations: [] }),
    } as Response);

    await useShopStore.getState().syncFromServer();

    expect(fetchMock).toHaveBeenCalledWith('/api/campaign');
    expect(useShopStore.getState().activeSetting.locations).toHaveLength(1);
    expect(useShopStore.getState().syncError).toContain('Local data kept');
  });

  it('removes a location from active setting', () => {
    useShopStore.getState().addLocation('Downtown');
    useShopStore.getState().addLocation('The Strip');

    const locationId = useShopStore.getState().activeSetting.locations[0]?.id;
    if (!locationId) {
      throw new Error('Location id must exist in test setup');
    }

    useShopStore.getState().removeLocation(locationId);

    const remainingLocationIds = useShopStore.getState().activeSetting.locations.map((location) => location.id);
    expect(remainingLocationIds).not.toContain(locationId);
    expect(remainingLocationIds).toHaveLength(1);
  });

  it('sends compatibility catalog and locations fields with sync payload', async () => {
    useShopStore.getState().addCatalogItem({
      id: 'custom-lockpick-set',
      name: 'Lockpick Set',
      basePrice: 120,
      weight: 0.5,
      source: 'custom',
      category: 'tool',
      legalStatus: 'restricted',
      tags: ['restricted', 'tool'],
    });
    useShopStore.getState().addLocation('Downtown');
    const locationId = useShopStore.getState().activeSetting.locations[0]?.id;
    if (!locationId) {
      throw new Error('Location id must exist in test setup');
    }
    useShopStore.getState().setLocationRules(locationId, (current) => ({
      ...current,
      includeCategories: ['tool'],
      includeTags: ['tool'],
      legalStatuses: ['restricted'],
      markupPercent: 0,
    }));

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
    } as Response);

    const result = await useShopStore.getState().syncToServer();

    expect(result).toBe(true);
    const [, requestInit] = fetchMock.mock.calls[0] ?? [];
    const payload = JSON.parse(String(requestInit?.body));

    expect(payload.settings).toBeDefined();
    expect(Array.isArray(payload.catalog)).toBe(true);
    expect(Array.isArray(payload.locations)).toBe(true);
    expect(payload.locations).toHaveLength(1);
    expect(payload.locations[0].availableItemIds).toEqual(['custom-lockpick-set']);
    expect(payload.locations[0].manualPrices['custom-lockpick-set']).toBe(120);
  });

  it('syncs only current location when using syncLocationToServer', async () => {
    useShopStore.getState().addLocation('Downtown');
    useShopStore.getState().addLocation('The Strip');

    const [downtownId, stripId] = useShopStore.getState().activeSetting.locations.map((location) => location.id);
    if (!downtownId || !stripId) {
      throw new Error('Location ids must exist in test setup');
    }

    useShopStore.getState().setLocationRules(downtownId, (current) => ({
      ...current,
      includeCategories: ['tool'],
      markupPercent: 15,
    }));

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      if (typeof input === 'string' && input === '/api/campaign' && !init) {
        return {
          ok: true,
          json: async () => useShopStore.getState().campaign,
        } as Response;
      }

      if (typeof input === 'string' && input === '/api/campaign' && init?.method === 'PUT') {
        return { ok: true } as Response;
      }

      throw new Error(`Unexpected fetch call: ${String(input)}`);
    });

    const didSync = await useShopStore.getState().syncLocationToServer(downtownId);

    expect(didSync).toBe(true);
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/campaign');
    const [, requestInit] = fetchMock.mock.calls[1] ?? [];
    const payload = JSON.parse(String(requestInit?.body));
    const activeSetting = payload.settings.find((setting: { id: string }) => setting.id === payload.activeSettingId);
    const syncedDowntown = activeSetting.locations.find((location: { id: string }) => location.id === downtownId);
    const untouchedStrip = activeSetting.locations.find((location: { id: string }) => location.id === stripId);

    expect(syncedDowntown.rules.includeCategories).toEqual(['tool']);
    expect(syncedDowntown.rules.markupPercent).toBe(15);
    expect(untouchedStrip.rules.includeCategories).toEqual([]);
  });
});
