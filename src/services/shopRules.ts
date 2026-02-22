import type { EquipmentItemDefinition, ShopRuleConfig } from '@/models/shop';

export interface RuleBasedPreviewResult {
  items: Array<
    Omit<EquipmentItemDefinition, 'source'> & {
      finalPrice: number;
      source: 'rule' | 'pinned' | 'override';
    }
  >;
}

export interface BuildRuleBasedShopPreviewInput {
  catalog: EquipmentItemDefinition[];
  rules: ShopRuleConfig;
}

export function createDefaultShopRules(): ShopRuleConfig {
  return {
    includeCategories: [],
    includeTags: [],
    excludeTags: [],
    legalStatuses: [],
    markupPercent: 0,
    pricingProfile: {
      id: 'default',
      name: 'Default',
      categoryModifiers: {},
      rounding: 'integer',
    },
    pinnedItemIds: [],
    bannedItemIds: [],
    manualPriceOverrides: {},
  };
}

function matchByRules(item: EquipmentItemDefinition, rules: ShopRuleConfig): boolean {
  const categoriesMatch = rules.includeCategories.length === 0 || (item.category ? rules.includeCategories.includes(item.category) : false);
  if (!categoriesMatch) {
    return false;
  }

  const itemTags = item.tags ?? [];
  const includeTagsMatch = rules.includeTags.length === 0 || rules.includeTags.some((tag) => itemTags.includes(tag));
  if (!includeTagsMatch) {
    return false;
  }

  const excludeTagsMatch = rules.excludeTags.some((tag) => itemTags.includes(tag));
  if (excludeTagsMatch) {
    return false;
  }

  const legalMatch = rules.legalStatuses.length === 0 || (item.legalStatus ? rules.legalStatuses.includes(item.legalStatus) : false);
  return legalMatch;
}

function applyPrice(item: EquipmentItemDefinition, rules: ShopRuleConfig): number {
  const categoryModifier = item.category ? (rules.pricingProfile.categoryModifiers[item.category] ?? 0) : 0;
  const categoryAdjusted = item.basePrice * (1 + categoryModifier / 100);
  const markedUp = categoryAdjusted * (1 + rules.markupPercent / 100);
  const overridden = typeof rules.manualPriceOverrides[item.id] === 'number' ? rules.manualPriceOverrides[item.id] : markedUp;

  if (rules.pricingProfile.rounding === 'none') {
    return overridden;
  }

  return Math.round(overridden);
}

export function buildRuleBasedShopPreview(input: BuildRuleBasedShopPreviewInput): RuleBasedPreviewResult {
  const banned = new Set(input.rules.bannedItemIds);
  const pinned = new Set(input.rules.pinnedItemIds);

  const ruleMatchedItems = input.catalog.filter((item) => matchByRules(item, input.rules));
  const map = new Map(ruleMatchedItems.map((item) => [item.id, item]));

  input.catalog.forEach((item) => {
    if (pinned.has(item.id)) {
      map.set(item.id, item);
    }
  });

  banned.forEach((itemId) => {
    map.delete(itemId);
  });

  const items = [...map.values()].map((item) => {
    const source: 'rule' | 'pinned' | 'override' = typeof input.rules.manualPriceOverrides[item.id] === 'number'
      ? 'override'
      : pinned.has(item.id)
        ? 'pinned'
        : 'rule';

    return {
      ...item,
      finalPrice: applyPrice(item, input.rules),
      source,
    };
  });

  return {
    items,
  };
}
