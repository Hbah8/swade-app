import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { EquipmentItemDefinition, ShopCampaignState, ShopLocation } from '@/models/shop';

const defaultCampaignState: ShopCampaignState = {
  schemaVersion: '1.0',
  catalog: [],
  locations: [],
};

interface ShopState {
  campaign: ShopCampaignState;
  isSyncing: boolean;
  syncError: string | null;
  importCatalog: (catalog: EquipmentItemDefinition[]) => void;
  addLocation: (name: string) => void;
  setLocationMarkup: (locationId: string, percentMarkup: number) => void;
  setLocationManualPrice: (locationId: string, itemId: string, price: number) => void;
  toggleItemAvailability: (locationId: string, itemId: string) => void;
  syncFromServer: () => Promise<void>;
  syncToServer: () => Promise<boolean>;
}

function normalizeId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      campaign: defaultCampaignState,
      isSyncing: false,
      syncError: null,

      importCatalog: (catalog) =>
        set((state) => ({
          campaign: { ...state.campaign, catalog },
        })),

      addLocation: (name) =>
        set((state) => {
          const baseId = normalizeId(name);
          const id = baseId || `location-${state.campaign.locations.length + 1}`;
          const existing = new Set(state.campaign.locations.map((location) => location.id));
          let uniqueId = id;
          let suffix = 2;
          while (existing.has(uniqueId)) {
            uniqueId = `${id}-${suffix}`;
            suffix += 1;
          }

          const location: ShopLocation = {
            id: uniqueId,
            name: name.trim() || 'New Location',
            availableItemIds: [],
            percentMarkup: 0,
            manualPrices: {},
          };

          return {
            campaign: {
              ...state.campaign,
              locations: [...state.campaign.locations, location],
            },
          };
        }),

      setLocationMarkup: (locationId, percentMarkup) =>
        set((state) => ({
          campaign: {
            ...state.campaign,
            locations: state.campaign.locations.map((location) =>
              location.id === locationId ? { ...location, percentMarkup } : location,
            ),
          },
        })),

      setLocationManualPrice: (locationId, itemId, price) =>
        set((state) => ({
          campaign: {
            ...state.campaign,
            locations: state.campaign.locations.map((location) =>
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
          },
        })),

      toggleItemAvailability: (locationId, itemId) =>
        set((state) => ({
          campaign: {
            ...state.campaign,
            locations: state.campaign.locations.map((location) => {
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
          },
        })),

      syncFromServer: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const response = await fetch('/api/campaign');
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          const campaign = (await response.json()) as ShopCampaignState;
          set({ campaign, isSyncing: false, syncError: null });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unable to load campaign data from server';
          set({ isSyncing: false, syncError: message });
        }
      },

      syncToServer: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const response = await fetch('/api/campaign', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(get().campaign),
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
    { name: 'sw-shop-storage' },
  ),
);
