import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EquipmentItemDefinition, ShopCampaignState, ShopLocation, ShopRuleConfig, ShopSetting } from '@/models/shop';
import { addSetting, ensureUniqueLocationId, getActiveSetting, normalizeClientCampaign } from '@/services/shopCampaignState';
import { buildRuleBasedShopPreview, createDefaultShopRules } from '@/services/shopRules';

const defaultCampaignState: ShopCampaignState = normalizeClientCampaign(undefined);

interface ShopState {
  campaign: ShopCampaignState;
  activeSetting: ShopSetting;
  isSyncing: boolean;
  syncError: string | null;
  setActiveSetting: (settingId: string) => void;
  createSetting: (name: string) => void;
  addCatalogItem: (item: EquipmentItemDefinition) => void;
  cloneCatalogItemToCustom: (itemId: string) => void;
  deleteCatalogItem: (itemId: string) => boolean;
  importCatalog: (catalog: EquipmentItemDefinition[]) => void;
  addLocation: (name: string) => void;
  removeLocation: (locationId: string) => void;
  setLocationRules: (locationId: string, updater: (rules: ShopRuleConfig) => ShopRuleConfig) => void;
  setLocationShareColumns: (locationId: string, columns: string[]) => void;
  setLocationMarkup: (locationId: string, percentMarkup: number) => void;
  setLocationManualPrice: (locationId: string, itemId: string, price: number) => void;
  toggleItemAvailability: (locationId: string, itemId: string) => void;
  syncFromServer: () => Promise<void>;
  syncToServer: () => Promise<boolean>;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      campaign: defaultCampaignState,
      activeSetting: defaultCampaignState.settings[0],
      isSyncing: false,
      syncError: null,

      setActiveSetting: (settingId) =>
        set((state) => {
          const hasSetting = state.campaign.settings.some((setting) => setting.id === settingId);
          if (!hasSetting) {
            return state;
          }

          const campaign = {
            ...state.campaign,
            activeSettingId: settingId,
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      createSetting: (name) =>
        set((state) => {
          const campaign = addSetting(state.campaign, name);
          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      addCatalogItem: (item) =>
        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((setting) =>
              setting.id === state.campaign.activeSettingId
                ? {
                    ...setting,
                    catalog: [...setting.catalog.filter((existing) => existing.id !== item.id), item],
                  }
                : setting,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      cloneCatalogItemToCustom: (itemId) =>
        set((state) => {
          const setting = getActiveSetting(state.campaign);
          const sourceItem = setting.catalog.find((item) => item.id === itemId);
          if (!sourceItem) {
            return state;
          }

          const baseId = `custom-${sourceItem.id}`;
          const existingIds = new Set(setting.catalog.map((item) => item.id));
          let clonedId = baseId;
          let suffix = 2;
          while (existingIds.has(clonedId)) {
            clonedId = `${baseId}-${suffix}`;
            suffix += 1;
          }

          const cloned: EquipmentItemDefinition = {
            ...sourceItem,
            id: clonedId,
            source: 'custom',
          };

          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((entry) =>
              entry.id === state.campaign.activeSettingId
                ? {
                    ...entry,
                    catalog: [...entry.catalog, cloned],
                  }
                : entry,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      deleteCatalogItem: (itemId) => {
        const current = get();
        const setting = current.activeSetting;
        const existing = setting.catalog.find((item) => item.id === itemId);
        if (!existing || existing.source === 'built-in') {
          return false;
        }

        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((entry) =>
              entry.id === state.campaign.activeSettingId
                ? {
                    ...entry,
                    catalog: entry.catalog.filter((item) => item.id !== itemId),
                  }
                : entry,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        });

        return true;
      },

      importCatalog: (catalog) =>
        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((setting) =>
              setting.id === state.campaign.activeSettingId ? { ...setting, catalog } : setting,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      addLocation: (name) =>
        set((state) => {
          const uniqueId = ensureUniqueLocationId(state.campaign, name);

          const location: ShopLocation = {
            id: uniqueId,
            name: name.trim() || 'New Location',
            availableItemIds: [],
            percentMarkup: 0,
            manualPrices: {},
            rules: createDefaultShopRules(),
            shareColumns: ['name', 'category', 'finalPrice', 'weight'],
          };

          return {
            campaign: (() => {
              const campaign = {
                ...state.campaign,
                settings: state.campaign.settings.map((setting) =>
                  setting.id === state.campaign.activeSettingId
                    ? { ...setting, locations: [...setting.locations, location] }
                    : setting,
                ),
              };
              return campaign;
            })(),
            activeSetting: (() => {
              const campaign = {
                ...state.campaign,
                settings: state.campaign.settings.map((setting) =>
                  setting.id === state.campaign.activeSettingId
                    ? { ...setting, locations: [...setting.locations, location] }
                    : setting,
                ),
              };
              return getActiveSetting(campaign);
            })(),
          };
        }),

      removeLocation: (locationId) =>
        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((setting) =>
              setting.id === state.campaign.activeSettingId
                ? {
                    ...setting,
                    locations: setting.locations.filter((location) => location.id !== locationId),
                  }
                : setting,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      setLocationRules: (locationId, updater) =>
        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((setting) =>
              setting.id === state.campaign.activeSettingId
                ? {
                    ...setting,
                    locations: setting.locations.map((location) =>
                      location.id === locationId
                        ? {
                            ...location,
                            rules: updater(location.rules ?? createDefaultShopRules()),
                          }
                        : location,
                    ),
                  }
                : setting,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      setLocationShareColumns: (locationId, columns) =>
        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((setting) =>
              setting.id === state.campaign.activeSettingId
                ? {
                    ...setting,
                    locations: setting.locations.map((location) =>
                      location.id === locationId
                        ? {
                            ...location,
                            shareColumns: columns,
                          }
                        : location,
                    ),
                  }
                : setting,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      setLocationMarkup: (locationId, percentMarkup) =>
        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((setting) =>
              setting.id === state.campaign.activeSettingId
                ? {
                    ...setting,
                    locations: setting.locations.map((location) =>
                      location.id === locationId ? { ...location, percentMarkup } : location,
                    ),
                  }
                : setting,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      setLocationManualPrice: (locationId, itemId, price) =>
        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((setting) =>
              setting.id === state.campaign.activeSettingId
                ? {
                    ...setting,
                    locations: setting.locations.map((location) =>
                      location.id === locationId
                        ? {
                            ...location,
                            manualPrices: {
                              ...location.manualPrices,
                              [itemId]: price,
                            },
                          }
                        : location,
                    ),
                  }
                : setting,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      toggleItemAvailability: (locationId, itemId) =>
        set((state) => {
          const campaign = {
            ...state.campaign,
            settings: state.campaign.settings.map((setting) =>
              setting.id === state.campaign.activeSettingId
                ? {
                    ...setting,
                    locations: setting.locations.map((location) => {
                      if (location.id !== locationId) {
                        return location;
                      }

                      const hasItem = location.availableItemIds.includes(itemId);
                      return {
                        ...location,
                        availableItemIds: hasItem
                          ? location.availableItemIds.filter((existingId) => existingId !== itemId)
                          : [...location.availableItemIds, itemId],
                      };
                    }),
                  }
                : setting,
            ),
          };

          return {
            campaign,
            activeSetting: getActiveSetting(campaign),
          };
        }),

      syncFromServer: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const response = await fetch('/api/campaign');
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          const campaign = normalizeClientCampaign(await response.json());

          const currentCampaign = get().campaign;
          const currentLocationCount = currentCampaign.settings.reduce((count, setting) => count + setting.locations.length, 0);
          const incomingLocationCount = campaign.settings.reduce((count, setting) => count + setting.locations.length, 0);

          if (currentLocationCount > 0 && incomingLocationCount === 0) {
            set({
              campaign: currentCampaign,
              activeSetting: getActiveSetting(currentCampaign),
              isSyncing: false,
              syncError: 'Server returned empty shop locations. Local data kept until explicit save.',
            });
            return;
          }

          set({ campaign, activeSetting: getActiveSetting(campaign), isSyncing: false, syncError: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to load campaign data from server';
          set({ isSyncing: false, syncError: message });
        }
      },

      syncToServer: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const currentCampaign = get().campaign;
          const activeSetting = getActiveSetting(currentCampaign);
          const compatibilityLocations = activeSetting.locations.map((location) => {
            const preview = buildRuleBasedShopPreview({
              catalog: activeSetting.catalog,
              rules: location.rules ?? createDefaultShopRules(),
            });

            return {
              ...location,
              availableItemIds: preview.items.map((item) => item.id),
              manualPrices: Object.fromEntries(preview.items.map((item) => [item.id, item.finalPrice])),
              percentMarkup: 0,
            };
          });

          const response = await fetch('/api/campaign', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...currentCampaign,
              catalog: activeSetting.catalog,
              locations: compatibilityLocations,
            }),
          });

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }

          set({ isSyncing: false, syncError: null });
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to save campaign data to server';
          set({ isSyncing: false, syncError: message });
          return false;
        }
      },
    }),
    {
      name: 'sw-shop-storage',
      version: 2,
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return {
            campaign: defaultCampaignState,
            activeSetting: defaultCampaignState.settings[0],
            isSyncing: false,
            syncError: null,
          };
        }

        const typedState = persistedState as { campaign?: unknown; isSyncing?: boolean; syncError?: string | null };
        const campaign = normalizeClientCampaign(typedState.campaign);

        return {
          ...typedState,
          campaign,
          activeSetting: getActiveSetting(campaign),
          isSyncing: false,
          syncError: null,
        };
      },
      partialize: (state) => ({
        campaign: state.campaign,
      }),
    },
  ),
);
