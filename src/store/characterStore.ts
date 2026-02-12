import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SWCharacter, DieType, Edge, Hindrance, Skill, AttributeName } from '@/models/character';

import { getInitialCoreSkills } from '@/data/skills';
import { dieToIndex, dieToNumber, raiseDie, lowerDie } from '@/lib/utils';

// ── Default character ───────────────────────────────────────

function createDefaultCharacter(): SWCharacter {
  return {
    id: crypto.randomUUID(),
    name: '',
    concept: '',
    race: 'Human',
    rank: 'Novice',
    attributes: {
      Agility: 'd4',
      Smarts: 'd4',
      Spirit: 'd4',
      Strength: 'd4',
      Vigor: 'd4',
    },
    skills: getInitialCoreSkills(),
    edges: [],
    hindrances: [],
    derivedStats: { pace: 6, parry: 2, toughness: 4 },
    creation: {
      attributePoints: 5,
      skillPoints: 12,
      hindrancePoints: 0,
      spentAttributePoints: 0,
      spentSkillPoints: 0,
      spentHindrancePoints: 0,
    },
    gear: [],
    powers: [],
    notes: '',
  };
}

// ── Validation ──────────────────────────────────────────────

export function validateCharacter(c: SWCharacter): string[] {
  const errors: string[] = [];
  const remainAttr = c.creation.attributePoints - c.creation.spentAttributePoints;
  const remainSkill = c.creation.skillPoints - c.creation.spentSkillPoints;

  if (remainAttr < 0) errors.push('Too many attribute points spent');
  if (remainSkill < 0) errors.push('Too many skill points spent');

  const majors = c.hindrances.filter((h) => h.severity === 'Major');
  const minors = c.hindrances.filter((h) => h.severity === 'Minor');
  if (majors.length > 1) errors.push('Maximum 1 Major Hindrance');
  if (minors.length > 2) errors.push('Maximum 2 Minor Hindrances');
  if (c.creation.hindrancePoints > 4) errors.push('Maximum 4 Hindrance points');

  if (!c.name.trim()) errors.push('Character name is required');

  return errors;
}

// ── Derived stat computation ────────────────────────────────

function computeDerived(c: SWCharacter): SWCharacter['derivedStats'] {
  const fighting = c.skills.find((s) => s.name === 'Fighting');
  const parry = fighting ? 2 + Math.floor(dieToNumber(fighting.die) / 2) : 2;
  const toughness = 2 + Math.floor(dieToNumber(c.attributes.Vigor) / 2);
  return { pace: 6, parry, toughness };
}

// ── Skill point cost computation ────────────────────────────

function computeSkillPointsSpent(skills: Skill[], attributes: Record<AttributeName, DieType>): number {
  let total = 0;
  for (const skill of skills) {
    const skillIdx = dieToIndex(skill.die);
    const attrIdx = dieToIndex(attributes[skill.linkedAttribute]);

    // Core skills start at d4 for free, non-core must buy d4
    const startIdx = skill.isCore ? 0 : -1;

    for (let i = startIdx + 1; i <= skillIdx; i++) {
      total += i > attrIdx ? 2 : 1;
    }
  }
  return total;
}

// ── Store ───────────────────────────────────────────────────

interface CharacterState {
  character: SWCharacter;
  validationErrors: string[];

  // Actions
  setName: (name: string) => void;
  setConcept: (concept: string) => void;
  setRace: (race: string) => void;
  setAttribute: (attr: AttributeName, die: DieType) => void;
  addSkill: (skill: Skill) => void;
  removeSkill: (skillId: string) => void;
  setSkillDie: (skillId: string, die: DieType) => void;
  raiseSkill: (skillId: string) => void;
  lowerSkill: (skillId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  addHindrance: (hindrance: Hindrance) => void;
  removeHindrance: (hindranceId: string) => void;
  setNotes: (notes: string) => void;
  validate: () => string[];
  reset: () => void;

  // Import/Export
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
  importCharacter: (character: SWCharacter) => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => {
      /** Recalculate points and derived stats */
      function recalc(c: SWCharacter): SWCharacter {
        const spentAttributePoints = Object.values(c.attributes).reduce(
          (sum, die) => sum + dieToIndex(die),
          0,
        );
        const spentSkillPoints = computeSkillPointsSpent(c.skills, c.attributes);
        const derivedStats = computeDerived(c);
        return {
          ...c,
          creation: { ...c.creation, spentAttributePoints, spentSkillPoints },
          derivedStats,
        };
      }

      return {
        character: recalc(createDefaultCharacter()),
        validationErrors: [],

        setName: (name) =>
          set((s) => ({ character: { ...s.character, name } })),

        setConcept: (concept) =>
          set((s) => ({ character: { ...s.character, concept } })),

        setRace: (race) =>
          set((s) => ({ character: recalc({ ...s.character, race }) })),

        setAttribute: (attr, die) =>
          set((s) => {
            const updated = {
              ...s.character,
              attributes: { ...s.character.attributes, [attr]: die },
            };
            return { character: recalc(updated) };
          }),

        addSkill: (skill) =>
          set((s) => {
            const updated = {
              ...s.character,
              skills: [...s.character.skills, skill],
            };
            return { character: recalc(updated) };
          }),

        removeSkill: (skillId) =>
          set((s) => {
            const updated = {
              ...s.character,
              skills: s.character.skills.filter((sk) => sk.id !== skillId),
            };
            return { character: recalc(updated) };
          }),

        setSkillDie: (skillId, die) =>
          set((s) => {
            const skills = s.character.skills.map((sk) =>
              sk.id === skillId ? { ...sk, die } : sk,
            );
            return { character: recalc({ ...s.character, skills }) };
          }),

        raiseSkill: (skillId) =>
          set((s) => {
            const skills = s.character.skills.map((sk) =>
              sk.id === skillId ? { ...sk, die: raiseDie(sk.die) } : sk,
            );
            return { character: recalc({ ...s.character, skills }) };
          }),

        lowerSkill: (skillId) =>
          set((s) => {
            const skills = s.character.skills.map((sk) =>
              sk.id === skillId ? { ...sk, die: lowerDie(sk.die) } : sk,
            );
            return { character: recalc({ ...s.character, skills }) };
          }),

        addEdge: (edge) =>
          set((s) => ({
            character: recalc({
              ...s.character,
              edges: [...s.character.edges, edge],
            }),
          })),

        removeEdge: (edgeId) =>
          set((s) => ({
            character: recalc({
              ...s.character,
              edges: s.character.edges.filter((e) => e.id !== edgeId),
            }),
          })),

        addHindrance: (hindrance) =>
          set((s) => {
            const pts = hindrance.severity === 'Major' ? 2 : 1;
            const updated = {
              ...s.character,
              hindrances: [...s.character.hindrances, hindrance],
              creation: {
                ...s.character.creation,
                hindrancePoints: s.character.creation.hindrancePoints + pts,
              },
            };
            return { character: recalc(updated) };
          }),

        removeHindrance: (hindranceId) =>
          set((s) => {
            const h = s.character.hindrances.find((x) => x.id === hindranceId);
            if (!h) return s;
            const pts = h.severity === 'Major' ? 2 : 1;
            const updated = {
              ...s.character,
              hindrances: s.character.hindrances.filter((x) => x.id !== hindranceId),
              creation: {
                ...s.character.creation,
                hindrancePoints: s.character.creation.hindrancePoints - pts,
              },
            };
            return { character: recalc(updated) };
          }),

        setNotes: (notes) =>
          set((s) => ({ character: { ...s.character, notes } })),

        validate: () => {
          const errors = validateCharacter(get().character);
          set({ validationErrors: errors });
          return errors;
        },

        reset: () =>
          set({
            character: recalc(createDefaultCharacter()),
            validationErrors: [],
          }),

        exportJSON: () => JSON.stringify(get().character, null, 2),

        importJSON: (json: string) => {
          try {
            const parsed = JSON.parse(json) as SWCharacter;
            set({ character: parsed, validationErrors: [] });
            return true;
          } catch {
            return false;
          }
        },

        importCharacter: (character: SWCharacter) => {
          set({ character, validationErrors: [] });
        },
      };
    },
    { name: 'sw-character-storage' },
  ),
);
