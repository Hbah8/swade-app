import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DieType } from '@/models/character';
import { DIE_ORDER } from '@/models/character';

/** Tailwind merge-compatible className helper */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Get the numeric index of a die in the die order (0-based) */
export function dieToIndex(die: DieType): number {
  return DIE_ORDER.indexOf(die);
}

/** Get the numeric value of a die (e.g., 'd8' -> 8) */
export function dieToNumber(die: DieType): number {
  return parseInt(die.replace('d', '').replace(/\+.*/, ''));
}

/** Raise a die by one step */
export function raiseDie(die: DieType): DieType {
  const idx = DIE_ORDER.indexOf(die);
  if (idx === -1) return die;
  return idx < DIE_ORDER.length - 1 ? DIE_ORDER[idx + 1] : die;
}

/** Lower a die by one step */
export function lowerDie(die: DieType): DieType {
  const idx = DIE_ORDER.indexOf(die);
  if (idx === -1) return die;
  return idx > 0 ? DIE_ORDER[idx - 1] : die;
}

/** Calculate how many attribute points have been spent */
export function calcAttributePointsSpent(attributes: Record<string, DieType>): number {
  return Object.values(attributes).reduce((sum, die) => sum + dieToIndex(die), 0);
}

export function createId(cryptoApi: Crypto | undefined = globalThis.crypto): string {
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  if (cryptoApi?.getRandomValues) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  const randomPart = Math.random().toString(16).slice(2);
  const timePart = Date.now().toString(16);
  return `${timePart}-${randomPart}`;
}
