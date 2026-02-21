import { z } from 'zod';

import type {
  BuildLocationShopViewInput,
  EquipmentCatalog,
  LocationPriceInput,
  LocationShopView,
} from '@/models/shop';

const catalogSchema = z.object({
  schemaVersion: z.string().min(1),
  items: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      basePrice: z.number().nonnegative(),
      weight: z.number().nonnegative(),
      category: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
});

export function calculateLocationPrice(input: LocationPriceInput): number {
  if (typeof input.manualOverride === 'number') {
    return input.manualOverride;
  }

  const markupFactor = 1 + input.percentMarkup / 100;
  return Math.round(input.basePrice * markupFactor);
}

export function buildLocationShopView(input: BuildLocationShopViewInput): LocationShopView {
  const availableItemIds = Array.isArray(input.location.availableItemIds) ? input.location.availableItemIds : [];
  const showAllItems = availableItemIds.length === 0;
  const visibleItemIds = new Set(availableItemIds);
  const items = input.catalog
    .filter((item) => showAllItems || visibleItemIds.has(item.id))
    .map((item) => ({
      id: item.id,
      name: item.name,
      basePrice: item.basePrice,
      finalPrice: calculateLocationPrice({
        basePrice: item.basePrice,
        percentMarkup: input.location.percentMarkup,
        manualOverride: input.location.manualPrices[item.id],
      }),
      weight: item.weight,
    }));

  return {
    locationId: input.location.id,
    locationName: input.location.name,
    items,
  };
}

export function parseEquipmentCatalog(payload: string): EquipmentCatalog {
  const parsed = JSON.parse(payload);
  return catalogSchema.parse(parsed);
}
