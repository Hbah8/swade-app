export interface EquipmentItemDefinition {
  id: string;
  name: string;
  basePrice: number;
  weight: number;
  category?: string;
  notes?: string;
  tags?: string[];
  legalStatus?: string;
  source?: 'built-in' | 'custom' | 'imported';
}

export interface EquipmentCatalog {
  schemaVersion: string;
  items: EquipmentItemDefinition[];
}

export interface ShopLocation {
  id: string;
  name: string;
  availableItemIds: string[];
  percentMarkup: number;
  manualPrices: Record<string, number>;
  rules?: ShopRuleConfig;
  shareColumns?: string[];
}

export interface PricingProfile {
  id: string;
  name: string;
  categoryModifiers: Record<string, number>;
  rounding: 'integer' | 'none';
}

export interface ShopRuleConfig {
  includeCategories: string[];
  includeTags: string[];
  excludeTags: string[];
  legalStatuses: string[];
  markupPercent: number;
  pricingProfile: PricingProfile;
  pinnedItemIds: string[];
  bannedItemIds: string[];
  manualPriceOverrides: Record<string, number>;
}

export interface LocationPriceInput {
  basePrice: number;
  percentMarkup: number;
  manualOverride?: number;
}

export interface LocationShopViewItem {
  id: string;
  name: string;
  basePrice: number;
  finalPrice: number;
  weight: number;
  category?: string;
  notes?: string;
  tags?: string[];
  legalStatus?: string;
  source?: 'rule' | 'pinned' | 'override';
}

export interface LocationShopView {
  locationId: string;
  locationName: string;
  items: LocationShopViewItem[];
}

export interface BuildLocationShopViewInput {
  location: ShopLocation;
  catalog: EquipmentItemDefinition[];
}

export interface ShopCampaignState {
  schemaVersion: '2.0';
  activeSettingId: string;
  settings: ShopSetting[];
}

export interface LegacyShopCampaignState {
  schemaVersion: string;
  catalog: EquipmentItemDefinition[];
  locations: ShopLocation[];
}

export interface ShopSetting {
  id: string;
  name: string;
  catalog: EquipmentItemDefinition[];
  locations: ShopLocation[];
}
