import type { Edge } from '@/models/character';

export interface EdgeDefinition {
  name: string;
  category: Edge['category'];
  requirements: Edge['requirements'];
  description: string;
}

/** Edges from SWADE core rules (selection of key edges) */
export const EDGE_DEFINITIONS: EdgeDefinition[] = [
  // Background Edges
  {
    name: 'Alertness',
    category: 'Background',
    requirements: [],
    description: '+2 to Notice rolls.',
  },
  {
    name: 'Ambidextrous',
    category: 'Background',
    requirements: [{ type: 'attribute', target: 'Agility', value: 'd8' }],
    description: 'Ignore −2 penalty for using off-hand.',
  },
  {
    name: 'Arcane Background',
    category: 'Background',
    requirements: [],
    description: 'Allows access to supernatural powers. Subtypes: Magic, Miracles, Psionics, Weird Science, Gifted.',
  },
  {
    name: 'Attractive',
    category: 'Background',
    requirements: [{ type: 'attribute', target: 'Vigor', value: 'd6' }],
    description: '+1 to Performance and Persuasion rolls.',
  },
  {
    name: 'Berserk',
    category: 'Background',
    requirements: [],
    description: 'After being Shaken or Wounded, make a Smarts roll or go berserk. +1 to melee attacks and Toughness, ignore wound penalties, −2 to Parry.',
  },
  {
    name: 'Brave',
    category: 'Background',
    requirements: [{ type: 'attribute', target: 'Spirit', value: 'd6' }],
    description: '+2 to Fear checks and resist Intimidation.',
  },
  {
    name: 'Brawny',
    category: 'Background',
    requirements: [{ type: 'attribute', target: 'Strength', value: 'd6' }, { type: 'attribute', target: 'Vigor', value: 'd6' }],
    description: 'Size and Toughness +1. Increase Encumbrance limit by one step.',
  },
  {
    name: 'Luck',
    category: 'Background',
    requirements: [],
    description: '+1 Benny per session.',
  },
  {
    name: 'Great Luck',
    category: 'Background',
    requirements: [{ type: 'edge', target: 'Luck' }],
    description: '+2 Bennies per session.',
  },
  {
    name: 'Quick',
    category: 'Background',
    requirements: [{ type: 'attribute', target: 'Agility', value: 'd8' }],
    description: 'Discard and redraw Action Cards of 5 or less.',
  },
  {
    name: 'Rich',
    category: 'Background',
    requirements: [],
    description: '3× starting funds. $150K annual salary.',
  },
  {
    name: 'Filthy Rich',
    category: 'Background',
    requirements: [{ type: 'edge', target: 'Rich' }],
    description: '5× starting funds. $500K annual salary.',
  },

  // Combat Edges
  {
    name: 'Block',
    category: 'Combat',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'skill', target: 'Fighting', value: 'd8' }],
    description: '+1 Parry.',
  },
  {
    name: 'Combat Reflexes',
    category: 'Combat',
    requirements: [{ type: 'rank', target: 'Seasoned' }],
    description: '+2 to recover from being Shaken or Stunned.',
  },
  {
    name: 'Dodge',
    category: 'Combat',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'attribute', target: 'Agility', value: 'd8' }],
    description: '−2 to be hit by ranged attacks.',
  },
  {
    name: 'First Strike',
    category: 'Combat',
    requirements: [{ type: 'attribute', target: 'Agility', value: 'd8' }],
    description: 'Free attack against one foe per round who moves adjacent.',
  },
  {
    name: 'Frenzy',
    category: 'Combat',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'skill', target: 'Fighting', value: 'd8' }],
    description: 'May make one extra Fighting attack at −2 per round.',
  },
  {
    name: 'Level Headed',
    category: 'Combat',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'attribute', target: 'Smarts', value: 'd8' }],
    description: 'Draw an extra Action Card and act on the best.',
  },
  {
    name: 'Marksman',
    category: 'Combat',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'skill', target: 'Shooting', value: 'd8' }],
    description: 'Ignore up to 2 points of ranged penalties when not moving.',
  },
  {
    name: 'Nerves of Steel',
    category: 'Combat',
    requirements: [{ type: 'attribute', target: 'Vigor', value: 'd8' }],
    description: 'Ignore 1 point of wound penalties.',
  },
  {
    name: 'Sweep',
    category: 'Combat',
    requirements: [{ type: 'attribute', target: 'Strength', value: 'd8' }, { type: 'skill', target: 'Fighting', value: 'd8' }],
    description: 'Attack all adjacent foes at −2.',
  },
  {
    name: 'Two-Fisted',
    category: 'Combat',
    requirements: [{ type: 'attribute', target: 'Agility', value: 'd8' }],
    description: 'May make one extra Fighting attack with off-hand weapon at no multi-action penalty.',
  },

  // Leadership Edges
  {
    name: 'Command',
    category: 'Leadership',
    requirements: [{ type: 'attribute', target: 'Smarts', value: 'd6' }],
    description: '+1 to allies\' recover from Shaken or Stunned within Command Range (5").',
  },
  {
    name: 'Hold the Line!',
    category: 'Leadership',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'attribute', target: 'Smarts', value: 'd8' }],
    description: '+1 Toughness to troops in Command Range.',
  },
  {
    name: 'Inspire',
    category: 'Leadership',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'edge', target: 'Command' }],
    description: '+1 bonus to all Trait rolls for allies in Command Range on a successful Battle roll.',
  },
  {
    name: 'Natural Leader',
    category: 'Leadership',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'attribute', target: 'Spirit', value: 'd8' }, { type: 'edge', target: 'Command' }],
    description: 'May share Bennies with allies in Command Range.',
  },

  // Social Edges
  {
    name: 'Charismatic',
    category: 'Social',
    requirements: [{ type: 'attribute', target: 'Spirit', value: 'd8' }],
    description: 'Free reroll on Persuasion.',
  },
  {
    name: 'Connections',
    category: 'Social',
    requirements: [],
    description: 'Call upon powerful friends for favors.',
  },
  {
    name: 'Streetwise',
    category: 'Social',
    requirements: [{ type: 'attribute', target: 'Smarts', value: 'd6' }],
    description: '+2 to Common Knowledge and criminal-related Networking.',
  },

  // Professional Edges
  {
    name: 'Investigator',
    category: 'Professional',
    requirements: [{ type: 'attribute', target: 'Smarts', value: 'd8' }, { type: 'skill', target: 'Research', value: 'd8' }],
    description: '+2 to Research and certain Notice rolls.',
  },
  {
    name: 'Jack-of-all-Trades',
    category: 'Professional',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'attribute', target: 'Smarts', value: 'd10' }],
    description: 'Gain d4 in any skill not currently possessed as a free action.',
  },
  {
    name: 'McGyver',
    category: 'Professional',
    requirements: [{ type: 'attribute', target: 'Smarts', value: 'd6' }, { type: 'skill', target: 'Repair', value: 'd6' }],
    description: 'Improvise temporary items. Ignore −2 for repairs without proper tools.',
  },
  {
    name: 'Scholar',
    category: 'Professional',
    requirements: [{ type: 'skill', target: 'Research', value: 'd8' }],
    description: '+2 to any two knowledge-based skills.',
  },
  {
    name: 'Woodsman',
    category: 'Professional',
    requirements: [{ type: 'attribute', target: 'Spirit', value: 'd6' }, { type: 'skill', target: 'Survival', value: 'd8' }],
    description: '+2 to Survival and Stealth in the wild.',
  },

  // Power Edges
  {
    name: 'New Powers',
    category: 'Power',
    requirements: [{ type: 'edge', target: 'Arcane Background' }],
    description: 'Learn two new powers.',
  },
  {
    name: 'Power Points',
    category: 'Power',
    requirements: [{ type: 'edge', target: 'Arcane Background' }],
    description: '+5 Power Points. May be taken multiple times.',
  },
  {
    name: 'Rapid Recharge',
    category: 'Power',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'attribute', target: 'Spirit', value: 'd6' }, { type: 'edge', target: 'Arcane Background' }],
    description: 'Recover 10 Power Points per hour.',
  },
  {
    name: 'Soul Drain',
    category: 'Power',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'edge', target: 'Arcane Background' }],
    description: 'Recover Power Points by causing Fatigue to a target.',
  },

  // Weird Edges
  {
    name: 'Beast Bond',
    category: 'Weird',
    requirements: [],
    description: 'Can spend Bennies for bonded animal companions.',
  },
  {
    name: 'Beast Master',
    category: 'Weird',
    requirements: [{ type: 'attribute', target: 'Spirit', value: 'd8' }],
    description: 'Gain a loyal animal companion.',
  },
  {
    name: 'Champion',
    category: 'Weird',
    requirements: [{ type: 'rank', target: 'Seasoned' }, { type: 'attribute', target: 'Spirit', value: 'd8' }, { type: 'skill', target: 'Fighting', value: 'd6' }],
    description: '+2 damage vs. supernaturally evil creatures.',
  },
];

/** Create an Edge instance from a definition */
export function createEdge(name: string): Edge | null {
  const def = EDGE_DEFINITIONS.find((e) => e.name === name);
  if (!def) return null;

  return {
    id: def.name.toLowerCase().replace(/\s+/g, '-'),
    name: def.name,
    category: def.category,
    requirements: def.requirements,
    description: def.description,
  };
}
