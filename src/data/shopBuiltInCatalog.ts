import type { EquipmentItemDefinition } from '@/models/shop';

export interface BuiltInCatalogSet {
  id: string;
  name: string;
  itemIds: string[];
}

export const BUILT_IN_CATALOG_ITEMS: EquipmentItemDefinition[] = [
  {
    id: 'vegas-snub-revolver',
    name: 'Snub Revolver',
    basePrice: 180,
    weight: 1.1,
    category: 'firearm',
    tags: ['restricted', 'firearm', 'street'],
    legalStatus: 'restricted',
    source: 'built-in',
  },
  {
    id: 'vegas-wiretap-kit',
    name: 'Wiretap Kit',
    basePrice: 420,
    weight: 2.3,
    category: 'surveillance',
    tags: ['restricted', 'surveillance', 'professional'],
    legalStatus: 'restricted',
    source: 'built-in',
  },
  {
    id: 'vegas-cleanup-solvent',
    name: 'Cleanup Solvent',
    basePrice: 65,
    weight: 1.5,
    category: 'cleaning',
    tags: ['legal', 'cleaning', 'starter'],
    legalStatus: 'legal',
    source: 'built-in',
  },
];

export const BUILT_IN_CATALOG_SETS: BuiltInCatalogSet[] = [
  {
    id: 'vegas-starter',
    name: '70s Vegas Starter',
    itemIds: BUILT_IN_CATALOG_ITEMS.map((item) => item.id),
  },
];

export const VEGAS_TAG_POOL = [
  'legal',
  'restricted',
  'illegal',
  'underground',
  'military',
  'police',
  'firearm',
  'melee',
  'tool',
  'cleaning',
  'disposal',
  'surveillance',
  'interrogation',
  'deception',
  'restraint',
  'medical',
  'luxury',
] as const;
