import type { PricingProfile } from '@/models/shop';

export const PRICING_PROFILES: PricingProfile[] = [
  {
    id: 'default',
    name: 'Default',
    categoryModifiers: {},
    rounding: 'integer',
  },
  {
    id: 'black-market',
    name: 'Black Market',
    categoryModifiers: { firearm: 20, surveillance: 15 },
    rounding: 'integer',
  },
];

export const LEGAL_STATUSES = ['legal', 'restricted', 'illegal', 'underground', 'military', 'police'];

export function toggleValue(values: string[], target: string): string[] {
  return values.includes(target) ? values.filter((item) => item !== target) : [...values, target];
}
