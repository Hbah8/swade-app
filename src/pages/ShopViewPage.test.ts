import { describe, expect, it } from 'vitest';

import { getShopEmptyStateMessage } from '@/pages/shopView.helpers';

describe('getShopEmptyStateMessage', () => {
  it('returns explicit message when location has no items', () => {
    const message = getShopEmptyStateMessage({
      locationId: 'riverfall',
      locationName: 'Riverfall',
      items: [],
    });

    expect(message).toBe('No items are currently available in this shop.');
  });

  it('returns null when location has items', () => {
    const message = getShopEmptyStateMessage({
      locationId: 'riverfall',
      locationName: 'Riverfall',
      items: [
        {
          id: 'rope',
          name: 'Rope',
          basePrice: 10,
          finalPrice: 11,
          weight: 1,
        },
      ],
    });

    expect(message).toBeNull();
  });
});
