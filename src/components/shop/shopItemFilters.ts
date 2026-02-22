import type { LocationShopViewItem } from '@/models/shop';

/**
 * Filter inputs for player-facing shop item search.
 */
export interface ShopItemFilters {
  nameQuery: string;
  category: string;
  notesQuery: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Filter shop items using intersection semantics across all fields.
 * All criteria are combined using intersection (AND) semantics.
 */
export function filterShopItems(items: LocationShopViewItem[], filters: ShopItemFilters): LocationShopViewItem[] {
  const normalizedName = filters.nameQuery.trim().toLowerCase();
  const normalizedCategory = filters.category.trim().toLowerCase();
  const normalizedNotes = filters.notesQuery.trim().toLowerCase();

  return items.filter((item) => {
    const nameMatch = !normalizedName || item.name.toLowerCase().includes(normalizedName);
    const categoryMatch =
      !normalizedCategory ||
      normalizedCategory === 'all' ||
      (item.category ?? '').toLowerCase() === normalizedCategory;
    const notesMatch = !normalizedNotes || (item.notes ?? '').toLowerCase().includes(normalizedNotes);
    const minMatch = typeof filters.minPrice !== 'number' || item.finalPrice >= filters.minPrice;
    const maxMatch = typeof filters.maxPrice !== 'number' || item.finalPrice <= filters.maxPrice;

    return nameMatch && categoryMatch && notesMatch && minMatch && maxMatch;
  });
}
