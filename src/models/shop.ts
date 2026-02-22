export interface EquipmentItemDefinition {
  id: string;
  name: string;
  basePrice: number;
  weight: number;
  category?: string;
  notes?: string;
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
  schemaVersion: string;
  catalog: EquipmentItemDefinition[];
  locations: ShopLocation[];
}
