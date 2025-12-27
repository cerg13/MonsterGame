/**
 * Rune Utilities
 *
 * Helper functions for rune management, generation, and display.
 */

import type { PlayerRune, RuneSet, RuneRarity, StatType, RuneSubStat } from '../types/player';

// Rune set display info
export const RUNE_SET_INFO: Record<RuneSet, { name: string; description: string; color: string; icon: string }> = {
  fatal: { name: 'Fatal', description: '+35% ATK', color: '#ff4444', icon: '⚔️' },
  swift: { name: 'Swift', description: '+25% SPD', color: '#44ff44', icon: '💨' },
  blade: { name: 'Blade', description: '+12% Crit Rate', color: '#ff8844', icon: '🗡️' },
  rage: { name: 'Rage', description: '+40% Crit Damage', color: '#ff0088', icon: '💢' },
  energy: { name: 'Energy', description: '+15% HP', color: '#44ffff', icon: '💚' },
  guard: { name: 'Guard', description: '+15% DEF', color: '#8888ff', icon: '🛡️' },
  vampire: { name: 'Vampire', description: '+35% Lifesteal', color: '#880088', icon: '🦇' },
  will: { name: 'Will', description: '1 Turn Immunity', color: '#ffff44', icon: '✨' },
};

// Rune rarity info
export const RUNE_RARITY_INFO: Record<RuneRarity, { name: string; color: string; maxSubstats: number }> = {
  common: { name: 'Common', color: '#888888', maxSubstats: 0 },
  magic: { name: 'Magic', color: '#44ff44', maxSubstats: 1 },
  rare: { name: 'Rare', color: '#4488ff', maxSubstats: 2 },
  hero: { name: 'Hero', color: '#aa44ff', maxSubstats: 3 },
  legend: { name: 'Legend', color: '#ffaa00', maxSubstats: 4 },
};

// Stat type display info
export const STAT_TYPE_INFO: Record<StatType, { name: string; shortName: string; isPercent: boolean }> = {
  hp: { name: 'HP', shortName: 'HP', isPercent: false },
  hpPercent: { name: 'HP%', shortName: 'HP%', isPercent: true },
  atk: { name: 'ATK', shortName: 'ATK', isPercent: false },
  atkPercent: { name: 'ATK%', shortName: 'ATK%', isPercent: true },
  def: { name: 'DEF', shortName: 'DEF', isPercent: false },
  defPercent: { name: 'DEF%', shortName: 'DEF%', isPercent: true },
  spd: { name: 'Speed', shortName: 'SPD', isPercent: false },
  critRate: { name: 'Crit Rate', shortName: 'CR', isPercent: true },
  critDamage: { name: 'Crit Damage', shortName: 'CD', isPercent: true },
  accuracy: { name: 'Accuracy', shortName: 'ACC', isPercent: true },
  resistance: { name: 'Resistance', shortName: 'RES', isPercent: true },
};

// Slot-specific main stats
export const SLOT_MAIN_STATS: Record<1 | 2 | 3 | 4, StatType[]> = {
  1: ['atk', 'atkPercent', 'hp', 'hpPercent', 'def', 'defPercent'],
  2: ['spd', 'atkPercent', 'hpPercent', 'defPercent'],
  3: ['critRate', 'critDamage', 'atkPercent', 'hpPercent', 'defPercent'],
  4: ['accuracy', 'resistance', 'atkPercent', 'hpPercent', 'defPercent'],
};

// Sub stat pool (excludes main stat)
export const SUB_STAT_POOL: StatType[] = [
  'hp', 'hpPercent', 'atk', 'atkPercent', 'def', 'defPercent',
  'spd', 'critRate', 'critDamage', 'accuracy', 'resistance',
];

// Base main stat values by star grade (at level 0)
const BASE_MAIN_STAT_VALUES: Record<number, Record<StatType, number>> = {
  1: { hp: 100, hpPercent: 3, atk: 10, atkPercent: 3, def: 10, defPercent: 3, spd: 3, critRate: 3, critDamage: 5, accuracy: 3, resistance: 3 },
  2: { hp: 160, hpPercent: 4, atk: 14, atkPercent: 4, def: 14, defPercent: 4, spd: 4, critRate: 4, critDamage: 7, accuracy: 4, resistance: 4 },
  3: { hp: 220, hpPercent: 5, atk: 18, atkPercent: 5, def: 18, defPercent: 5, spd: 5, critRate: 5, critDamage: 9, accuracy: 5, resistance: 5 },
  4: { hp: 300, hpPercent: 6, atk: 24, atkPercent: 6, def: 24, defPercent: 6, spd: 6, critRate: 6, critDamage: 11, accuracy: 6, resistance: 6 },
  5: { hp: 400, hpPercent: 8, atk: 30, atkPercent: 8, def: 30, defPercent: 8, spd: 8, critRate: 8, critDamage: 14, accuracy: 8, resistance: 8 },
  6: { hp: 500, hpPercent: 11, atk: 40, atkPercent: 11, def: 40, defPercent: 11, spd: 11, critRate: 11, critDamage: 18, accuracy: 11, resistance: 11 },
};

// Main stat value increase per level
const MAIN_STAT_GROWTH: Record<StatType, number> = {
  hp: 50,
  hpPercent: 1,
  atk: 5,
  atkPercent: 1,
  def: 5,
  defPercent: 1,
  spd: 1,
  critRate: 1,
  critDamage: 1.5,
  accuracy: 1,
  resistance: 1,
};

// Sub stat value ranges by star grade
const SUB_STAT_RANGES: Record<number, Record<StatType, { min: number; max: number }>> = {
  1: { hp: { min: 30, max: 60 }, hpPercent: { min: 1, max: 3 }, atk: { min: 3, max: 6 }, atkPercent: { min: 1, max: 3 }, def: { min: 3, max: 6 }, defPercent: { min: 1, max: 3 }, spd: { min: 1, max: 2 }, critRate: { min: 1, max: 2 }, critDamage: { min: 2, max: 4 }, accuracy: { min: 1, max: 3 }, resistance: { min: 1, max: 3 } },
  2: { hp: { min: 50, max: 100 }, hpPercent: { min: 2, max: 4 }, atk: { min: 5, max: 10 }, atkPercent: { min: 2, max: 4 }, def: { min: 5, max: 10 }, defPercent: { min: 2, max: 4 }, spd: { min: 2, max: 3 }, critRate: { min: 2, max: 3 }, critDamage: { min: 3, max: 6 }, accuracy: { min: 2, max: 4 }, resistance: { min: 2, max: 4 } },
  3: { hp: { min: 80, max: 160 }, hpPercent: { min: 3, max: 5 }, atk: { min: 8, max: 15 }, atkPercent: { min: 3, max: 5 }, def: { min: 8, max: 15 }, defPercent: { min: 3, max: 5 }, spd: { min: 3, max: 5 }, critRate: { min: 3, max: 4 }, critDamage: { min: 4, max: 8 }, accuracy: { min: 3, max: 5 }, resistance: { min: 3, max: 5 } },
  4: { hp: { min: 120, max: 240 }, hpPercent: { min: 4, max: 6 }, atk: { min: 12, max: 22 }, atkPercent: { min: 4, max: 6 }, def: { min: 12, max: 22 }, defPercent: { min: 4, max: 6 }, spd: { min: 4, max: 6 }, critRate: { min: 4, max: 5 }, critDamage: { min: 5, max: 10 }, accuracy: { min: 4, max: 6 }, resistance: { min: 4, max: 6 } },
  5: { hp: { min: 180, max: 350 }, hpPercent: { min: 5, max: 8 }, atk: { min: 18, max: 32 }, atkPercent: { min: 5, max: 8 }, def: { min: 18, max: 32 }, defPercent: { min: 5, max: 8 }, spd: { min: 5, max: 8 }, critRate: { min: 5, max: 6 }, critDamage: { min: 6, max: 12 }, accuracy: { min: 5, max: 8 }, resistance: { min: 5, max: 8 } },
  6: { hp: { min: 250, max: 500 }, hpPercent: { min: 6, max: 10 }, atk: { min: 25, max: 45 }, atkPercent: { min: 6, max: 10 }, def: { min: 25, max: 45 }, defPercent: { min: 6, max: 10 }, spd: { min: 6, max: 10 }, critRate: { min: 6, max: 8 }, critDamage: { min: 8, max: 15 }, accuracy: { min: 6, max: 10 }, resistance: { min: 6, max: 10 } },
};

/**
 * Calculate main stat value at a given level
 */
export function calculateMainStatValue(stars: number, mainStat: StatType, level: number): number {
  const baseValue = BASE_MAIN_STAT_VALUES[stars]?.[mainStat] || 0;
  const growth = MAIN_STAT_GROWTH[mainStat] || 0;
  return Math.floor(baseValue + growth * level * (stars / 3));
}

/**
 * Calculate upgrade cost for a rune
 */
export function calculateUpgradeCost(rune: PlayerRune): number {
  const baseCost = 1000;
  const levelMultiplier = Math.pow(1.3, rune.level);
  const starMultiplier = rune.stars;
  return Math.floor(baseCost * levelMultiplier * starMultiplier);
}

/**
 * Calculate success rate for rune upgrade
 */
export function calculateUpgradeSuccessRate(level: number): number {
  if (level < 3) return 100;
  if (level < 6) return 85;
  if (level < 9) return 70;
  if (level < 12) return 50;
  return 35;
}

/**
 * Get max level for a rune based on stars
 */
export function getMaxRuneLevel(stars: number): number {
  return stars >= 5 ? 15 : stars >= 3 ? 12 : 9;
}

/**
 * Format stat value for display
 */
export function formatStatValue(statType: StatType, value: number): string {
  const info = STAT_TYPE_INFO[statType];
  if (info.isPercent || statType.includes('Percent')) {
    return `${value}%`;
  }
  return `+${value}`;
}

/**
 * Generate a random rune
 */
export function generateRandomRune(
  stars: 1 | 2 | 3 | 4 | 5 | 6,
  options?: {
    setType?: RuneSet;
    slot?: 1 | 2 | 3 | 4;
    rarity?: RuneRarity;
  }
): PlayerRune {
  const setTypes: RuneSet[] = ['fatal', 'swift', 'blade', 'rage', 'energy', 'guard', 'vampire', 'will'];
  const slots: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

  const setType = options?.setType || setTypes[Math.floor(Math.random() * setTypes.length)];
  const slot = options?.slot || slots[Math.floor(Math.random() * slots.length)];

  // Rarity chances
  const rarityRoll = Math.random();
  let rarity: RuneRarity = options?.rarity || 'common';
  if (!options?.rarity) {
    if (rarityRoll > 0.98) rarity = 'legend';
    else if (rarityRoll > 0.92) rarity = 'hero';
    else if (rarityRoll > 0.80) rarity = 'rare';
    else if (rarityRoll > 0.60) rarity = 'magic';
  }

  // Main stat based on slot
  const possibleMainStats = SLOT_MAIN_STATS[slot];
  const mainStat = possibleMainStats[Math.floor(Math.random() * possibleMainStats.length)];
  const mainStatValue = calculateMainStatValue(stars, mainStat, 0);

  // Sub stats based on rarity
  const maxSubStats = RUNE_RARITY_INFO[rarity].maxSubstats;
  const subStats: RuneSubStat[] = [];
  const usedStats = new Set<StatType>([mainStat]);

  for (let i = 0; i < maxSubStats; i++) {
    const availableStats = SUB_STAT_POOL.filter(s => !usedStats.has(s));
    if (availableStats.length === 0) break;

    const subStatType = availableStats[Math.floor(Math.random() * availableStats.length)];
    usedStats.add(subStatType);

    const range = SUB_STAT_RANGES[stars][subStatType];
    const value = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    subStats.push({
      type: subStatType,
      value,
      upgradeCount: 0,
    });
  }

  return {
    id: `rune_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    setType,
    slot,
    stars,
    rarity,
    level: 0,
    mainStat,
    mainStatValue,
    subStats,
    obtainedAt: new Date(),
  };
}

/**
 * Upgrade a rune (simulates the upgrade process)
 */
export function upgradeRune(rune: PlayerRune): { success: boolean; newRune: PlayerRune; addedSubStat?: RuneSubStat } {
  const successRate = calculateUpgradeSuccessRate(rune.level);
  const success = Math.random() * 100 < successRate;

  if (!success) {
    return { success: false, newRune: rune };
  }

  const newLevel = rune.level + 1;
  const newMainStatValue = calculateMainStatValue(rune.stars, rune.mainStat, newLevel);

  let newSubStats = [...rune.subStats];
  let addedSubStat: RuneSubStat | undefined;

  // Every 3 levels, either add a new substat or upgrade an existing one
  if (newLevel % 3 === 0 && newLevel <= 12) {
    const maxSubStats = RUNE_RARITY_INFO[rune.rarity].maxSubstats + Math.floor(newLevel / 3);
    const effectiveMaxSubStats = Math.min(maxSubStats, 4);

    if (newSubStats.length < effectiveMaxSubStats) {
      // Add new substat
      const usedStats = new Set<StatType>([rune.mainStat, ...newSubStats.map(s => s.type)]);
      const availableStats = SUB_STAT_POOL.filter(s => !usedStats.has(s));

      if (availableStats.length > 0) {
        const newStatType = availableStats[Math.floor(Math.random() * availableStats.length)];
        const range = SUB_STAT_RANGES[rune.stars][newStatType];
        const value = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

        addedSubStat = {
          type: newStatType,
          value,
          upgradeCount: 0,
        };
        newSubStats.push(addedSubStat);
      }
    } else {
      // Upgrade random existing substat
      const upgradeIndex = Math.floor(Math.random() * newSubStats.length);
      const stat = newSubStats[upgradeIndex];
      const range = SUB_STAT_RANGES[rune.stars][stat.type];
      const additionalValue = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

      newSubStats[upgradeIndex] = {
        ...stat,
        value: stat.value + additionalValue,
        upgradeCount: stat.upgradeCount + 1,
      };
    }
  }

  return {
    success: true,
    newRune: {
      ...rune,
      level: newLevel,
      mainStatValue: newMainStatValue,
      subStats: newSubStats,
    },
    addedSubStat,
  };
}

/**
 * Calculate rune efficiency (how good the substats are compared to max)
 */
export function calculateRuneEfficiency(rune: PlayerRune): number {
  if (rune.subStats.length === 0) return 0;

  let totalEfficiency = 0;

  for (const subStat of rune.subStats) {
    const range = SUB_STAT_RANGES[rune.stars][subStat.type];
    const maxPossible = range.max * (1 + subStat.upgradeCount);
    const efficiency = subStat.value / maxPossible;
    totalEfficiency += efficiency;
  }

  return Math.round((totalEfficiency / rune.subStats.length) * 100);
}

/**
 * Get rune power score for sorting
 */
export function getRunePowerScore(rune: PlayerRune): number {
  const starWeight = rune.stars * 100;
  const levelWeight = rune.level * 10;
  const rarityWeights: Record<RuneRarity, number> = {
    common: 0,
    magic: 20,
    rare: 40,
    hero: 70,
    legend: 100,
  };
  const rarityWeight = rarityWeights[rune.rarity];
  const efficiencyWeight = calculateRuneEfficiency(rune);

  return starWeight + levelWeight + rarityWeight + efficiencyWeight;
}

/**
 * Sort runes by various criteria
 */
export type RuneSortCriteria = 'power' | 'stars' | 'level' | 'set' | 'slot' | 'rarity';

export function sortRunes(runes: PlayerRune[], criteria: RuneSortCriteria, ascending = false): PlayerRune[] {
  const sorted = [...runes].sort((a, b) => {
    let comparison = 0;

    switch (criteria) {
      case 'power':
        comparison = getRunePowerScore(b) - getRunePowerScore(a);
        break;
      case 'stars':
        comparison = b.stars - a.stars;
        break;
      case 'level':
        comparison = b.level - a.level;
        break;
      case 'set':
        comparison = a.setType.localeCompare(b.setType);
        break;
      case 'slot':
        comparison = a.slot - b.slot;
        break;
      case 'rarity':
        const rarityOrder: Record<RuneRarity, number> = { legend: 5, hero: 4, rare: 3, magic: 2, common: 1 };
        comparison = rarityOrder[b.rarity] - rarityOrder[a.rarity];
        break;
    }

    return ascending ? -comparison : comparison;
  });

  return sorted;
}

/**
 * Filter runes by various criteria
 */
export interface RuneFilterOptions {
  sets?: RuneSet[];
  slots?: (1 | 2 | 3 | 4)[];
  minStars?: number;
  maxStars?: number;
  rarities?: RuneRarity[];
  equipped?: boolean;
  mainStats?: StatType[];
}

export function filterRunes(runes: PlayerRune[], filters: RuneFilterOptions): PlayerRune[] {
  return runes.filter(rune => {
    if (filters.sets && filters.sets.length > 0 && !filters.sets.includes(rune.setType)) return false;
    if (filters.slots && filters.slots.length > 0 && !filters.slots.includes(rune.slot)) return false;
    if (filters.minStars !== undefined && rune.stars < filters.minStars) return false;
    if (filters.maxStars !== undefined && rune.stars > filters.maxStars) return false;
    if (filters.rarities && filters.rarities.length > 0 && !filters.rarities.includes(rune.rarity)) return false;
    if (filters.equipped !== undefined) {
      const isEquipped = !!rune.equippedTo;
      if (filters.equipped !== isEquipped) return false;
    }
    if (filters.mainStats && filters.mainStats.length > 0 && !filters.mainStats.includes(rune.mainStat)) return false;
    return true;
  });
}
