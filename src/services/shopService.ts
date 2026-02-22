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
      tags: z.array(z.string()).optional(),
      legalStatus: z.string().optional(),
      source: z.enum(['built-in', 'custom', 'imported']).optional(),
    }),
  ),
});

/**
 * Resolve the final item price for a location.
 * Manual price takes precedence over percent-based markup.
 */
export function calculateLocationPrice(input: LocationPriceInput): number {
  if (typeof input.manualOverride === 'number') {
    return input.manualOverride;
  }

  const markupFactor = 1 + input.percentMarkup / 100;
  return Math.round(input.basePrice * markupFactor);
}

/**
 * Build a player-facing shop read-model from catalog and location settings.
 * Includes optional category/notes fields when present in source catalog.
 */
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
      ...(item.category ? { category: item.category } : {}),
      ...(item.notes ? { notes: item.notes } : {}),
      ...(Array.isArray(item.tags) ? { tags: item.tags } : {}),
      ...(item.legalStatus ? { legalStatus: item.legalStatus } : {}),
    }));

  return {
    locationId: input.location.id,
    locationName: input.location.name,
    items,
  };
}

/**
 * Parse and validate equipment catalog payload against schema constraints.
 */
export function parseEquipmentCatalog(payload: string): EquipmentCatalog {
  const parsed = JSON.parse(payload);
  return catalogSchema.parse(parsed);
}
