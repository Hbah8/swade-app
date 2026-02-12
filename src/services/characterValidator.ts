import type { Edge, SWCharacter, DieType, Rank } from '@/models/character';
import { DIE_ORDER, RANK_ORDER } from '@/models/character';
import { dieToIndex } from '@/lib/utils';

/** Check if a character meets a single Edge requirement */
function meetsRequirement(
  character: SWCharacter,
  req: Edge['requirements'][number],
): boolean {
  switch (req.type) {
    case 'rank': {
      const reqRankIdx = RANK_ORDER.indexOf(req.value as Rank);
      const charRankIdx = RANK_ORDER.indexOf(character.rank);
      return charRankIdx >= reqRankIdx;
    }
    case 'attribute': {
      const attrDie = character.attributes[req.target as keyof typeof character.attributes];
      if (!attrDie) return false;
      return dieToIndex(attrDie) >= dieToIndex(req.value as DieType);
    }
    case 'skill': {
      const skill = character.skills.find((s) => s.name === req.target);
      if (!skill) return false;
      return dieToIndex(skill.die) >= dieToIndex(req.value as DieType);
    }
    case 'edge': {
      return character.edges.some((e) => e.name === req.target);
    }
    default:
      return false;
  }
}

/** Check if a character qualifies for a given Edge */
export function canTakeEdge(character: SWCharacter, edge: Edge): boolean {
  // Already has it?
  if (character.edges.some((e) => e.id === edge.id)) return false;
  // Check all requirements
  return edge.requirements.every((req) => meetsRequirement(character, req));
}

/** Get unmet requirements for an Edge (for UI display) */
export function getUnmetRequirements(
  character: SWCharacter,
  edge: Edge,
): string[] {
  return edge.requirements
    .filter((req) => !meetsRequirement(character, req))
    .map((req) => {
      switch (req.type) {
        case 'rank':
          return `Rank: ${req.value}`;
        case 'attribute':
          return `${req.target} ${req.value}`;
        case 'skill':
          return `${req.target} ${req.value}`;
        case 'edge':
          return `Edge: ${req.target}`;
        default:
          return `Unknown requirement`;
      }
    });
}

/** Validate that a die type string is valid */
export function isValidDieType(die: string): die is DieType {
  return DIE_ORDER.includes(die as DieType);
}
