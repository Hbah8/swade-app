import type { Skill, AttributeName } from '@/models/character';

export interface SkillDefinition {
  name: string;
  linkedAttribute: AttributeName;
  isCore: boolean;
  description: string;
}

/** Core and common skills from SWADE */
export const SKILL_DEFINITIONS: SkillDefinition[] = [
  // Core Skills (all characters start with these at d4)
  { name: 'Athletics', linkedAttribute: 'Agility', isCore: true, description: 'Climbing, jumping, balancing, throwing, swimming, and other athletic endeavors.' },
  { name: 'Common Knowledge', linkedAttribute: 'Smarts', isCore: true, description: 'General knowledge common to most people in the setting.' },
  { name: 'Notice', linkedAttribute: 'Smarts', isCore: true, description: 'Awareness and perception. Used to detect ambushes, spot hidden things, etc.' },
  { name: 'Persuasion', linkedAttribute: 'Spirit', isCore: true, description: 'The ability to convince others to do what you want.' },
  { name: 'Stealth', linkedAttribute: 'Agility', isCore: true, description: 'Sneaking and hiding from others.' },

  // Non-core skills
  { name: 'Academics', linkedAttribute: 'Smarts', isCore: false, description: 'Liberal arts, humanities, and social sciences.' },
  { name: 'Battle', linkedAttribute: 'Smarts', isCore: false, description: 'Strategy, tactics, and commanding troops in mass battles.' },
  { name: 'Boating', linkedAttribute: 'Agility', isCore: false, description: 'Operating and navigating waterborne vessels.' },
  { name: 'Driving', linkedAttribute: 'Agility', isCore: false, description: 'Ground and hovering vehicles.' },
  { name: 'Electronics', linkedAttribute: 'Smarts', isCore: false, description: 'Using and repairing electronic devices.' },
  { name: 'Faith', linkedAttribute: 'Spirit', isCore: false, description: 'Channeling miracles through devotion (Arcane Background: Miracles).' },
  { name: 'Fighting', linkedAttribute: 'Agility', isCore: false, description: 'Close combat attacks and parrying.' },
  { name: 'Focus', linkedAttribute: 'Spirit', isCore: false, description: 'Channeling powers through concentration (Arcane Background: Gifted).' },
  { name: 'Gambling', linkedAttribute: 'Smarts', isCore: false, description: 'Games of chance and bluffing.' },
  { name: 'Hacking', linkedAttribute: 'Smarts', isCore: false, description: 'Breaking into computer systems.' },
  { name: 'Healing', linkedAttribute: 'Smarts', isCore: false, description: 'Stopping wounds and treating diseases.' },
  { name: 'Intimidation', linkedAttribute: 'Spirit', isCore: false, description: 'Frightening opponents through threats or displays.' },
  { name: 'Language', linkedAttribute: 'Smarts', isCore: false, description: 'Speaking a particular language.' },
  { name: 'Occult', linkedAttribute: 'Smarts', isCore: false, description: 'Knowledge of the supernatural, magic, and folklore.' },
  { name: 'Performance', linkedAttribute: 'Spirit', isCore: false, description: 'Singing, dancing, acting, or other performing arts.' },
  { name: 'Piloting', linkedAttribute: 'Agility', isCore: false, description: 'Flying aircraft and spacecraft.' },
  { name: 'Psionics', linkedAttribute: 'Smarts', isCore: false, description: 'Channeling powers through mental discipline (Arcane Background: Psionics).' },
  { name: 'Repair', linkedAttribute: 'Smarts', isCore: false, description: 'Fixing mechanical and electrical devices.' },
  { name: 'Research', linkedAttribute: 'Smarts', isCore: false, description: 'Finding information from libraries, databases, etc.' },
  { name: 'Riding', linkedAttribute: 'Agility', isCore: false, description: 'Riding horses and other mounts.' },
  { name: 'Science', linkedAttribute: 'Smarts', isCore: false, description: 'Hard sciences: biology, chemistry, physics, etc.' },
  { name: 'Shooting', linkedAttribute: 'Agility', isCore: false, description: 'Ranged attacks with firearms, bows, etc.' },
  { name: 'Spellcasting', linkedAttribute: 'Smarts', isCore: false, description: 'Channeling powers through arcane formulas (Arcane Background: Magic).' },
  { name: 'Survival', linkedAttribute: 'Smarts', isCore: false, description: 'Finding food and water, tracking, navigating wilderness.' },
  { name: 'Taunt', linkedAttribute: 'Smarts', isCore: false, description: 'Insulting and distracting opponents in combat.' },
  { name: 'Thievery', linkedAttribute: 'Agility', isCore: false, description: 'Picking locks, pickpocketing, sleight of hand, etc.' },
  { name: 'Weird Science', linkedAttribute: 'Smarts', isCore: false, description: 'Channeling powers through gadgets (Arcane Background: Weird Science).' },
];

/** Create a Skill instance from a definition with d4 default */
export function createSkillFromDefinition(def: SkillDefinition): Skill {
  return {
    id: def.name.toLowerCase().replace(/\s+/g, '-'),
    name: def.name,
    linkedAttribute: def.linkedAttribute,
    die: 'd4',
    isCore: def.isCore,
  };
}

/** Get all core skill definitions */
export function getCoreSkillDefinitions(): SkillDefinition[] {
  return SKILL_DEFINITIONS.filter((s) => s.isCore);
}

/** Initialize core skills at d4 for a new character */
export function getInitialCoreSkills(): Skill[] {
  return getCoreSkillDefinitions().map(createSkillFromDefinition);
}
