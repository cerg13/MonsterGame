/**
 * Evolution and Awakening Types
 *
 * Defines the systems for monster progression:
 * - Evolution: Increase star grade (2★ → 6★)
 * - Awakening: Unlock awakened form with bonus stats/skills
 */

import type { Element } from './monster';

// Evolution material types
export type EssenceType = 'low' | 'mid' | 'high';

// Awakening material for each element
export interface AwakeningMaterial {
  element: Element;
  essenceType: EssenceType;
  quantity: number;
}

// Evolution requirements - need same-star monsters as fodder
export interface EvolutionRequirements {
  currentStars: number;
  targetStars: number;
  fodderCount: number;      // Number of same-star monsters needed
  fodderStars: number;      // Star level of fodder monsters
  goldCost: number;
}

// Awakening requirements
export interface AwakeningRequirements {
  element: Element;
  materials: AwakeningMaterial[];
  goldCost: number;
}

// Evolution requirements table (stars needed to evolve)
export const EVOLUTION_REQUIREMENTS: Record<number, EvolutionRequirements> = {
  2: { currentStars: 2, targetStars: 3, fodderCount: 2, fodderStars: 2, goldCost: 5000 },
  3: { currentStars: 3, targetStars: 4, fodderCount: 3, fodderStars: 3, goldCost: 10000 },
  4: { currentStars: 4, targetStars: 5, fodderCount: 4, fodderStars: 4, goldCost: 20000 },
  5: { currentStars: 5, targetStars: 6, fodderCount: 5, fodderStars: 5, goldCost: 50000 },
};

// Awakening requirements by natural star grade
export const AWAKENING_REQUIREMENTS: Record<number, { materials: Omit<AwakeningMaterial, 'element'>[]; goldCost: number }> = {
  2: {
    materials: [
      { essenceType: 'low', quantity: 10 },
      { essenceType: 'mid', quantity: 5 },
    ],
    goldCost: 5000,
  },
  3: {
    materials: [
      { essenceType: 'low', quantity: 15 },
      { essenceType: 'mid', quantity: 10 },
      { essenceType: 'high', quantity: 5 },
    ],
    goldCost: 10000,
  },
  4: {
    materials: [
      { essenceType: 'mid', quantity: 15 },
      { essenceType: 'high', quantity: 10 },
    ],
    goldCost: 25000,
  },
  5: {
    materials: [
      { essenceType: 'mid', quantity: 20 },
      { essenceType: 'high', quantity: 15 },
    ],
    goldCost: 50000,
  },
};

// Essence display info
export const ESSENCE_INFO: Record<Element, Record<EssenceType, { name: string; icon: string; color: string }>> = {
  fire: {
    low: { name: 'Fire Essence (Low)', icon: '🔥', color: '#ff4444' },
    mid: { name: 'Fire Essence (Mid)', icon: '🔥', color: '#ff6644' },
    high: { name: 'Fire Essence (High)', icon: '🔥', color: '#ff8844' },
  },
  water: {
    low: { name: 'Water Essence (Low)', icon: '💧', color: '#4488ff' },
    mid: { name: 'Water Essence (Mid)', icon: '💧', color: '#66aaff' },
    high: { name: 'Water Essence (High)', icon: '💧', color: '#88ccff' },
  },
  wind: {
    low: { name: 'Wind Essence (Low)', icon: '🌪️', color: '#44ff44' },
    mid: { name: 'Wind Essence (Mid)', icon: '🌪️', color: '#66ff66' },
    high: { name: 'Wind Essence (High)', icon: '🌪️', color: '#88ff88' },
  },
  light: {
    low: { name: 'Light Essence (Low)', icon: '✨', color: '#ffff44' },
    mid: { name: 'Light Essence (Mid)', icon: '✨', color: '#ffff88' },
    high: { name: 'Light Essence (High)', icon: '✨', color: '#ffffcc' },
  },
  dark: {
    low: { name: 'Dark Essence (Low)', icon: '🌑', color: '#8844ff' },
    mid: { name: 'Dark Essence (Mid)', icon: '🌑', color: '#aa66ff' },
    high: { name: 'Dark Essence (High)', icon: '🌑', color: '#cc88ff' },
  },
};

// Player's essence inventory
export interface PlayerEssences {
  fire: { low: number; mid: number; high: number };
  water: { low: number; mid: number; high: number };
  wind: { low: number; mid: number; high: number };
  light: { low: number; mid: number; high: number };
  dark: { low: number; mid: number; high: number };
}

// Create empty essences inventory
export function createEmptyEssences(): PlayerEssences {
  return {
    fire: { low: 0, mid: 0, high: 0 },
    water: { low: 0, mid: 0, high: 0 },
    wind: { low: 0, mid: 0, high: 0 },
    light: { low: 0, mid: 0, high: 0 },
    dark: { low: 0, mid: 0, high: 0 },
  };
}

// Skill upgrade costs
export interface SkillUpgradeCost {
  skillLevel: number;
  devilmonRequired: number;
  goldCost: number;
}

export const SKILL_UPGRADE_COSTS: SkillUpgradeCost[] = [
  { skillLevel: 1, devilmonRequired: 1, goldCost: 5000 },
  { skillLevel: 2, devilmonRequired: 1, goldCost: 7500 },
  { skillLevel: 3, devilmonRequired: 1, goldCost: 10000 },
  { skillLevel: 4, devilmonRequired: 1, goldCost: 15000 },
  { skillLevel: 5, devilmonRequired: 2, goldCost: 20000 },
];

// Max skill level
export const MAX_SKILL_LEVEL = 6;

// Check if monster can evolve
export function canEvolve(stars: number, level: number, maxLevel: number): boolean {
  return stars < 6 && level >= maxLevel;
}

// Check if monster can awaken
export function canAwaken(awakened: boolean): boolean {
  return !awakened;
}

// Get evolution requirements for current stars
export function getEvolutionRequirements(currentStars: number): EvolutionRequirements | null {
  return EVOLUTION_REQUIREMENTS[currentStars] || null;
}

// Get awakening requirements for monster
export function getAwakeningRequirements(element: Element, naturalStars: number): AwakeningRequirements {
  const baseReqs = AWAKENING_REQUIREMENTS[naturalStars] || AWAKENING_REQUIREMENTS[3];
  return {
    element,
    materials: baseReqs.materials.map(m => ({ ...m, element })),
    goldCost: baseReqs.goldCost,
  };
}
