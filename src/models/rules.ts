export type RuleCategory =
  | 'Character Creation'
  | 'Traits'
  | 'Combat'
  | 'Damage'
  | 'Situational Rules'
  | 'Powers'
  | 'Setting Rules'
  | 'Game Mastering';

export const RULE_CATEGORIES: RuleCategory[] = [
  'Character Creation',
  'Traits',
  'Combat',
  'Damage',
  'Situational Rules',
  'Powers',
  'Setting Rules',
  'Game Mastering',
];

export interface RuleExample {
  title: string;
  description: string;
  steps?: string[];
}

export interface RuleSection {
  id: string;
  title: string;
  category: RuleCategory;
  content: string;
  relatedRules: string[];
  examples?: RuleExample[];
  tags: string[];
}
