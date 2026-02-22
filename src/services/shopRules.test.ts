import { describe, expect, it } from 'vitest';

import { buildRuleBasedShopPreview } from '@/services/shopRules';
import type { EquipmentItemDefinition } from '@/models/shop';

describe('shopRules', () => {
  const catalog: EquipmentItemDefinition[] = [
    {
      id: 'snub',
      name: 'Snub Revolver',
      basePrice: 180,
      weight: 1,
      category: 'firearm',
      tags: ['firearm', 'restricted'],
      legalStatus: 'restricted',
    },
    {
      id: 'gloves',
      name: 'Leather Gloves',
      basePrice: 35,
      weight: 0.2,
      category: 'tool',
      tags: ['legal', 'starter'],
      legalStatus: 'legal',
    },
  ];

  it('matches items by include/exclude tags and legal statuses', () => {
    const result = buildRuleBasedShopPreview({
      catalog,
      rules: {
        includeCategories: ['firearm', 'tool'],
        includeTags: ['firearm'],
        excludeTags: ['starter'],
        legalStatuses: ['restricted'],
        markupPercent: 10,
        pricingProfile: {
          id: 'default',
          name: 'Default',
          categoryModifiers: {},
          rounding: 'integer',
        },
        pinnedItemIds: [],
        bannedItemIds: [],
        manualPriceOverrides: {},
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('snub');
    expect(result.items[0]?.source).toBe('rule');
  });

  it('applies pricing order base -> category modifier -> shop markup -> override -> rounding', () => {
    const result = buildRuleBasedShopPreview({
      catalog,
      rules: {
        includeCategories: ['firearm'],
        includeTags: [],
        excludeTags: [],
        legalStatuses: ['restricted'],
        markupPercent: 12,
        pricingProfile: {
          id: 'premium',
          name: 'Premium',
          categoryModifiers: { firearm: 20 },
          rounding: 'integer',
        },
        pinnedItemIds: [],
        bannedItemIds: [],
        manualPriceOverrides: { snub: 333 },
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.finalPrice).toBe(333);
    expect(result.items[0]?.source).toBe('override');
  });

  it('keeps pinned items and removes banned items after rule match', () => {
    const result = buildRuleBasedShopPreview({
      catalog,
      rules: {
        includeCategories: ['firearm'],
        includeTags: [],
        excludeTags: [],
        legalStatuses: ['restricted'],
        markupPercent: 0,
        pricingProfile: {
          id: 'default',
          name: 'Default',
          categoryModifiers: {},
          rounding: 'integer',
        },
        pinnedItemIds: ['gloves'],
        bannedItemIds: ['snub'],
        manualPriceOverrides: {},
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('gloves');
    expect(result.items[0]?.source).toBe('pinned');
  });
});
