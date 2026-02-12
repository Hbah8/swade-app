import type { Race } from '@/models/character';

/** Races from SWADE core rules */
export const RACE_DEFINITIONS: Race[] = [
  {
    id: 'human',
    name: 'Human',
    abilities: [
      {
        name: 'Adaptable',
        description: 'Humans begin with a free Novice Edge of their choice (must meet requirements).',
      },
    ],
  },
  {
    id: 'android',
    name: 'Android',
    abilities: [
      { name: 'Construct', description: '+2 to recover from being Shaken. Ignore 1 point of wound penalties. No additional damage from Called Shots. Does not breathe. Immune to disease and poison.' },
      { name: 'Outsider', description: '−2 Persuasion with non-androids (but not Intimidation).' },
      { name: 'Pacifist', description: 'Androids must be programmed to kill. Otherwise they have the Pacifist (Major) Hindrance.' },
      { name: 'Vow', description: 'Androids are programmed with basic behavior protocols and must obey them.' },
    ],
  },
  {
    id: 'aquarian',
    name: 'Aquarian',
    abilities: [
      { name: 'Aquatic', description: 'Pace 6 swimming, d6 for running in water, cannot drown. +2 to swimming Athletics.' },
      { name: 'Dependency', description: 'Must immerse in water 1 hour per 24 or become Fatigued.' },
      { name: 'Low Light Vision', description: 'Ignore penalties for Dim and Dark Illumination.' },
      { name: 'Toughness', description: '+1 Toughness.' },
    ],
  },
  {
    id: 'avion',
    name: 'Avion',
    abilities: [
      { name: 'Can\'t Swim', description: '−2 to swimming Athletics. d4 running die in water.' },
      { name: 'Flight', description: 'Flying Pace 12.' },
      { name: 'Frail', description: '−1 Toughness.' },
      { name: 'Keen Senses', description: '+2 to Notice with sight.' },
    ],
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    abilities: [
      { name: 'Low Light Vision', description: 'Ignore penalties for Dim and Dark Illumination.' },
      { name: 'Reduced Pace', description: 'Pace 5, d4 running die.' },
      { name: 'Tough', description: '+2 Vigor for resisting Fatigue from environmental effects, +1 Toughness.' },
    ],
  },
  {
    id: 'elf',
    name: 'Elf',
    abilities: [
      { name: 'Agile', description: 'Start with d6 in Agility instead of d4.' },
      { name: 'All Thumbs', description: '−2 with mechanical and electronic devices.' },
      { name: 'Low Light Vision', description: 'Ignore penalties for Dim and Dark Illumination.' },
    ],
  },
  {
    id: 'half-elf',
    name: 'Half-Elf',
    abilities: [
      { name: 'Heritage', description: 'Start with either d6 in Agility, or a free Novice Edge of choice.' },
      { name: 'Low Light Vision', description: 'Ignore penalties for Dim and Dark Illumination.' },
      { name: 'Outsider', description: '−2 Persuasion with all but half-elves.' },
    ],
  },
  {
    id: 'half-folk',
    name: 'Half-Folk (Halfling)',
    abilities: [
      { name: 'Lucky', description: 'Start with the Luck Edge.' },
      { name: 'Reduced Pace', description: 'Pace 5, d4 running die.' },
      { name: 'Size −1', description: '−1 Size, −1 Toughness.' },
      { name: 'Spirited', description: 'Start with d6 in Spirit instead of d4.' },
    ],
  },
  {
    id: 'rakashian',
    name: 'Rakashian (Cat-folk)',
    abilities: [
      { name: 'Agile', description: 'Start with d6 in Agility instead of d4.' },
      { name: 'Bite/Claws', description: 'Natural weapons (Str+d4).' },
      { name: 'Bloodthirsty', description: 'Rakashians are violent and cruel, giving them the Bloodthirsty Hindrance.' },
      { name: 'Can\'t Swim', description: '−2 to swimming Athletics, d4 running die in water.' },
      { name: 'Low Light Vision', description: 'Ignore penalties for Dim and Dark Illumination.' },
      { name: 'Racial Enemy', description: '−2 Persuasion with Saurians.' },
    ],
  },
  {
    id: 'saurian',
    name: 'Saurian (Lizard-folk)',
    abilities: [
      { name: 'Bite', description: 'Natural weapon (Str+d4).' },
      { name: 'Environmental Weakness (Cold)', description: '−4 to resist cold effects, +4 damage from cold-based attacks.' },
      { name: 'Natural Armor', description: '+2 Armor.' },
      { name: 'Outsider', description: '−2 Persuasion with non-Saurians.' },
      { name: 'Racial Enemy', description: '−2 Persuasion with Rakashians.' },
    ],
  },
];
