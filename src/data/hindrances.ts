import type { Hindrance } from '@/models/character';

export interface HindranceDefinition {
  name: string;
  availableSeverities: ('Minor' | 'Major')[];
  description: string;
  effect: string;
}

/** Hindrances from SWADE core rules */
export const HINDRANCE_DEFINITIONS: HindranceDefinition[] = [
  {
    name: 'All Thumbs',
    availableSeverities: ['Minor'],
    description: 'The character has trouble with mechanical and electronic devices.',
    effect: '−2 when using mechanical or electrical devices. Roll of 1 on skill die causes malfunction.',
  },
  {
    name: 'Anemic',
    availableSeverities: ['Minor'],
    description: 'The character is particularly susceptible to sickness.',
    effect: '−2 to Vigor rolls to resist Fatigue from disease, poison, and environmental effects.',
  },
  {
    name: 'Arrogant',
    availableSeverities: ['Major'],
    description: 'The character believes they are the best and must prove it.',
    effect: 'Must challenge the "leader" of any opposition. Takes steep penalties when fighting "lesser" foes.',
  },
  {
    name: 'Bad Eyes',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character has bad eyesight.',
    effect: 'Minor: −1 to all Trait rolls dependent on vision (correctable with glasses). Major: −2 (not correctable).',
  },
  {
    name: 'Bad Luck',
    availableSeverities: ['Major'],
    description: 'The character starts each session with one fewer Benny.',
    effect: 'One fewer Benny per session.',
  },
  {
    name: 'Big Mouth',
    availableSeverities: ['Minor'],
    description: 'The character can\'t keep a secret.',
    effect: 'Unable to keep secrets; blurts out sensitive information.',
  },
  {
    name: 'Blind',
    availableSeverities: ['Major'],
    description: 'The character is completely blind.',
    effect: '−6 to all tasks that require vision; −2 to most social interactions. Gains extra Edge to compensate.',
  },
  {
    name: 'Bloodthirsty',
    availableSeverities: ['Major'],
    description: 'The character never takes prisoners.',
    effect: '−4 to Charisma. Villains and other bloodthirsty types react poorly.',
  },
  {
    name: 'Cautious',
    availableSeverities: ['Minor'],
    description: 'The character is overly careful.',
    effect: 'The character plans extensively and is reluctant to take risks.',
  },
  {
    name: 'Clueless',
    availableSeverities: ['Major'],
    description: 'The character is out of touch with everyday life.',
    effect: '−1 to Common Knowledge rolls.',
  },
  {
    name: 'Clumsy',
    availableSeverities: ['Major'],
    description: 'The character is uncoordinated.',
    effect: '−2 to Athletics and Stealth rolls.',
  },
  {
    name: 'Code of Honor',
    availableSeverities: ['Major'],
    description: 'The character keeps their word and acts honorably.',
    effect: 'Always keeps their word, won\'t fight dirty, etc.',
  },
  {
    name: 'Curious',
    availableSeverities: ['Major'],
    description: 'The character has to know everything.',
    effect: 'Must investigate any mystery or unknown.',
  },
  {
    name: 'Death Wish',
    availableSeverities: ['Minor'],
    description: 'The character wants to die completing some grand task.',
    effect: 'Pursues their goal recklessly.',
  },
  {
    name: 'Delusional',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character believes something that isn\'t true.',
    effect: 'Minor: Belief is mildly extravagant. Major: Belief is deeply ingrained and dangerous.',
  },
  {
    name: 'Driven',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character has a personal goal they must achieve.',
    effect: 'Minor: Goal is significant. Major: Goal consumes the character.',
  },
  {
    name: 'Elderly',
    availableSeverities: ['Major'],
    description: 'The character is old.',
    effect: '−1 to Pace, −1 die type to Agility, Strength, Vigor. +5 skill points for knowledge skills.',
  },
  {
    name: 'Enemy',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character has a recurring nemesis.',
    effect: 'Minor: Enemy is relatively minor. Major: Enemy is powerful and dangerous.',
  },
  {
    name: 'Greedy',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character is unusually obsessed with money and material possessions.',
    effect: 'Minor: Argues for biggest share. Major: Steals and cheats to get more.',
  },
  {
    name: 'Habit',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character has an annoying or harmful habit.',
    effect: 'Minor: Annoying habit (−1 Charisma). Major: Dangerous addiction (−2 Charisma).',
  },
  {
    name: 'Heroic',
    availableSeverities: ['Major'],
    description: 'The character always helps those in need.',
    effect: 'Always helps those in trouble; can\'t turn away from someone in danger.',
  },
  {
    name: 'Hesitant',
    availableSeverities: ['Minor'],
    description: 'The character freezes under pressure.',
    effect: 'Draw two Action Cards and act on the worst.',
  },
  {
    name: 'Illiterate',
    availableSeverities: ['Minor'],
    description: 'The character cannot read or write.',
    effect: 'Cannot read or write in any language.',
  },
  {
    name: 'Impulsive',
    availableSeverities: ['Major'],
    description: 'The character acts before thinking.',
    effect: 'Acts rashly without considering consequences.',
  },
  {
    name: 'Jealous',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character envies others.',
    effect: 'Minor: Covets what others have. Major: Dominates character\'s actions.',
  },
  {
    name: 'Loyal',
    availableSeverities: ['Minor'],
    description: 'The character is loyal to their friends.',
    effect: 'Will never leave a companion behind or betray them.',
  },
  {
    name: 'Mean',
    availableSeverities: ['Minor'],
    description: 'The character is rude and ill-tempered.',
    effect: '−1 to Persuasion rolls.',
  },
  {
    name: 'Mild Mannered',
    availableSeverities: ['Minor'],
    description: 'The character is not threatening at all.',
    effect: '−2 to Intimidation rolls.',
  },
  {
    name: 'Obese',
    availableSeverities: ['Minor'],
    description: 'The character is significantly overweight.',
    effect: '+1 Toughness, −1 Pace, d4 running die. May have trouble fitting in small spaces.',
  },
  {
    name: 'Obligation',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character has a duty to an organization or group.',
    effect: 'Minor: It\'s a time investment. Major: It dominates the character\'s time.',
  },
  {
    name: 'One Arm',
    availableSeverities: ['Major'],
    description: 'The character is missing an arm.',
    effect: '−4 to tasks requiring two hands.',
  },
  {
    name: 'One Eye',
    availableSeverities: ['Major'],
    description: 'The character is missing an eye.',
    effect: '−2 to Trait rolls requiring depth perception (Shooting, throwing, etc.).',
  },
  {
    name: 'Outsider',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character doesn\'t fit in the local society.',
    effect: 'Minor: −2 Persuasion with locals. Major: No legal rights, −2 Persuasion.',
  },
  {
    name: 'Overconfident',
    availableSeverities: ['Major'],
    description: 'The character thinks they can do anything.',
    effect: 'Believes they can handle any situation; takes on impossible odds.',
  },
  {
    name: 'Pacifist',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character dislikes violence.',
    effect: 'Minor: Only fights in self-defense. Major: Will not fight living things under any circumstances.',
  },
  {
    name: 'Phobia',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character has an irrational fear.',
    effect: 'Minor: −1 to Trait rolls in presence of fear. Major: −2 to Trait rolls, −2 to Fear checks.',
  },
  {
    name: 'Poverty',
    availableSeverities: ['Minor'],
    description: 'The character is chronically broke.',
    effect: 'Half starting funds. Regularly breaks or loses things.',
  },
  {
    name: 'Quirk',
    availableSeverities: ['Minor'],
    description: 'The character has some minor but pointed behavior others find annoying.',
    effect: '−1 to Persuasion with those who notice.',
  },
  {
    name: 'Ruthless',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character does what needs to be done.',
    effect: 'Minor: Willing to harm innocents for greater good. Major: Will do anything to achieve goals.',
  },
  {
    name: 'Secret',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character has a dangerous secret.',
    effect: 'Minor: Embarrassing if discovered. Major: Life-threatening if discovered.',
  },
  {
    name: 'Shamed',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character is haunted by past events.',
    effect: 'Minor: Ashamed of past events. Major: Deeply traumatized, may freeze up.',
  },
  {
    name: 'Slow',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character is slow on their feet.',
    effect: 'Minor: Pace 5, d4 running die. Major: Pace 4, d4 running die, −2 to Athletics and any rolls tied to reflexes.',
  },
  {
    name: 'Small',
    availableSeverities: ['Minor'],
    description: 'The character is smaller than average.',
    effect: '−1 Toughness. Size is reduced by 1.',
  },
  {
    name: 'Stubborn',
    availableSeverities: ['Minor'],
    description: 'The character always wants their way.',
    effect: 'Always wants their way and argues incessantly.',
  },
  {
    name: 'Suspicious',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character doesn\'t trust others.',
    effect: 'Minor: Distrusts strangers. Major: Paranoid about allies as well.',
  },
  {
    name: 'Thin Skinned',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character is particularly susceptible to taunts and insults.',
    effect: 'Minor: −2 to resist Taunt. Major: −4 to resist Taunt.',
  },
  {
    name: 'Tongue-Tied',
    availableSeverities: ['Major'],
    description: 'The character often trips over words or can\'t find the right things to say.',
    effect: '−1 to Persuasion, Intimidation, and Taunt rolls.',
  },
  {
    name: 'Ugly',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character is physically unattractive.',
    effect: 'Minor: −1 to Persuasion. Major: −2 to Persuasion.',
  },
  {
    name: 'Vengeful',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character holds grudges.',
    effect: 'Minor: Seeks legal or social retribution. Major: Will kill to settle scores.',
  },
  {
    name: 'Vow',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character has sworn an oath.',
    effect: 'Minor: Oath is a significant commitment. Major: Oath dominates the character\'s life.',
  },
  {
    name: 'Wanted',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character is wanted by authorities.',
    effect: 'Minor: Minor offense, small reward. Major: Serious crime, actively hunted.',
  },
  {
    name: 'Yellow',
    availableSeverities: ['Major'],
    description: 'The character is cowardly.',
    effect: '−2 to Fear checks and Spirit rolls to resist Intimidation.',
  },
  {
    name: 'Young',
    availableSeverities: ['Minor', 'Major'],
    description: 'The character is young (under 18).',
    effect: 'Minor: 4 attribute points, 10 skill points, +1 Benny per session. Major: 3 attribute points, 10 skill points, +2 Bennies per session.',
  },
];

/** Create a Hindrance instance from a definition */
export function createHindrance(name: string, severity: 'Minor' | 'Major'): Hindrance | null {
  const def = HINDRANCE_DEFINITIONS.find((h) => h.name === name);
  if (!def || !def.availableSeverities.includes(severity)) return null;

  return {
    id: `${def.name.toLowerCase().replace(/\s+/g, '-')}-${severity.toLowerCase()}`,
    name: def.name,
    severity,
    description: def.description,
    effect: def.effect,
  };
}
