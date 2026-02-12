/** Dice types in Savage Worlds */
export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd12+1' | 'd12+2';

export const DIE_ORDER: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12'];

export const ATTRIBUTE_NAMES = ['Agility', 'Smarts', 'Spirit', 'Strength', 'Vigor'] as const;
export type AttributeName = (typeof ATTRIBUTE_NAMES)[number];

export interface Skill {
  id: string;
  name: string;
  linkedAttribute: AttributeName;
  die: DieType;
  isCore: boolean;
}

export type HindranceSeverity = 'Minor' | 'Major';

export interface Hindrance {
  id: string;
  name: string;
  severity: HindranceSeverity;
  description: string;
  effect: string;
}

export type EdgeCategory =
  | 'Background'
  | 'Combat'
  | 'Leadership'
  | 'Power'
  | 'Professional'
  | 'Social'
  | 'Weird'
  | 'Legendary';

export interface EdgeRequirement {
  type: 'rank' | 'attribute' | 'skill' | 'edge';
  target: string;
  value?: DieType | Rank;
}

export interface Edge {
  id: string;
  name: string;
  category: EdgeCategory;
  requirements: EdgeRequirement[];
  description: string;
}

export type Rank = 'Novice' | 'Seasoned' | 'Veteran' | 'Heroic' | 'Legendary';

export const RANK_ORDER: Rank[] = ['Novice', 'Seasoned', 'Veteran', 'Heroic', 'Legendary'];

export interface Race {
  id: string;
  name: string;
  abilities: RacialAbility[];
}

export interface RacialAbility {
  name: string;
  description: string;
}

export interface GearItem {
  name: string;
  weight: number;
  notes: string;
}

export interface Power {
  name: string;
  powerPoints: number;
  range: string;
  duration: string;
  trapping: string;
}

export interface DerivedStats {
  pace: number;
  parry: number;
  toughness: number;
}

export interface CreationPoints {
  attributePoints: number;
  skillPoints: number;
  hindrancePoints: number;
  spentAttributePoints: number;
  spentSkillPoints: number;
  spentHindrancePoints: number;
}

export interface SWCharacter {
  id: string;
  name: string;
  concept: string;
  race: string;
  rank: Rank;

  attributes: Record<AttributeName, DieType>;
  skills: Skill[];
  edges: Edge[];
  hindrances: Hindrance[];

  derivedStats: DerivedStats;
  creation: CreationPoints;

  gear: GearItem[];
  powers: Power[];
  notes: string;
}
