import type { LocationShopView } from '@/models/shop';

/**
 * Returns the canonical empty-state message for player shop view.
 */
export function getShopEmptyStateMessage(view: LocationShopView): string | null {
  if (view.items.length === 0) {
    return 'No items are currently available in this shop.';
  }

  return null;
}
