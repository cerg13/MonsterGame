import type { PlayerMonster, MonsterTemplate } from '../types/monster';
import type { PlayerRune, RuneSet, StatType } from '../types/player';

/**
 * Monster Stat Calculator
 *
 * Calculates final monster stats considering:
 * 1. Base stats from template
 * 2. Level scaling (exponential growth)
 * 3. Star grade bonuses
 * 4. Awakening bonuses
 * 5. Rune stats (main + sub)
 * 6. Rune set bonuses
 */

// Level scaling constants
const LEVEL_SCALING = {
  base: 1,
  perLevel: 0.025, // 2.5% per level
  maxLevel: 40,
};

// Star grade multipliers
const STAR_MULTIPLIERS: Record<number, number> = {
  1: 0.6,
  2: 0.75,
  3: 0.9,
  4: 1.0,
  5: 1.15,
  6: 1.35,
};

// Rune set bonuses (imported from types for reference)
const RUNE_SET_BONUSES_MAP: Record<RuneSet, { stat: string; value: number; isPercent: boolean }> = {
  fatal: { stat: 'atk', value: 0.35, isPercent: true },      // +35% ATK
  swift: { stat: 'spd', value: 0.25, isPercent: true },      // +25% SPD
  blade: { stat: 'critRate', value: 12, isPercent: false },   // +12% Crit Rate (flat)
  rage: { stat: 'critDamage', value: 40, isPercent: false },  // +40% Crit Damage (flat)
  energy: { stat: 'hp', value: 0.15, isPercent: true },       // +15% HP
  guard: { stat: 'def', value: 0.15, isPercent: true },       // +15% DEF
  vampire: { stat: 'lifesteal', value: 0.35, isPercent: false }, // +35% Lifesteal
  will: { stat: 'immunity', value: 1, isPercent: false },     // 1 turn Immunity
};

// Runes needed for set activation
const RUNES_PER_SET = 2;

export interface CalculatedStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDamage: number;
  accuracy: number;
  resistance: number;
  // Special stats from rune sets
  lifesteal: number;
  startingImmunity: number;
}

export interface StatBreakdown {
  base: number;
  fromLevel: number;
  fromStars: number;
  fromAwakening: number;
  fromRunesFlat: number;
  fromRunesPercent: number;
  fromSetBonus: number;
  total: number;
}

/**
 * Calculate level multiplier using exponential growth
 */
function getLevelMultiplier(level: number): number {
  // Formula: 1 + (level - 1) * baseRate * (1 + level / 100)
  // This gives diminishing returns at higher levels but still meaningful growth
  const normalizedLevel = Math.min(level, LEVEL_SCALING.maxLevel);
  return LEVEL_SCALING.base + (normalizedLevel - 1) * LEVEL_SCALING.perLevel * (1 + normalizedLevel / 80);
}

/**
 * Get star grade multiplier
 */
function getStarMultiplier(stars: number): number {
  return STAR_MULTIPLIERS[Math.min(Math.max(stars, 1), 6)] || 1;
}

/**
 * Count active rune sets
 */
function countRuneSets(runes: PlayerRune[]): Map<RuneSet, number> {
  const setCounts = new Map<RuneSet, number>();

  for (const rune of runes) {
    const current = setCounts.get(rune.setType) || 0;
    setCounts.set(rune.setType, current + 1);
  }

  return setCounts;
}

/**
 * Calculate rune bonus for a specific stat
 */
function calculateRuneBonus(
  runes: PlayerRune[],
  statType: StatType,
  _baseStat: number // baseStat reserved for future percentage calculations
): { flat: number; percent: number } {
  let flat = 0;
  let percent = 0;

  for (const rune of runes) {
    // Main stat
    if (rune.mainStat === statType) {
      flat += rune.mainStatValue;
    } else if (rune.mainStat === `${statType}Percent`) {
      percent += rune.mainStatValue;
    }

    // Sub stats
    for (const subStat of rune.subStats) {
      if (subStat.type === statType) {
        flat += subStat.value;
      } else if (subStat.type === `${statType}Percent`) {
        percent += subStat.value;
      }
    }
  }

  return { flat, percent };
}

/**
 * Calculate set bonuses for equipped runes
 */
function calculateSetBonuses(runes: PlayerRune[]): Map<string, number> {
  const bonuses = new Map<string, number>();
  const setCounts = countRuneSets(runes);

  for (const [setType, count] of setCounts) {
    const activeSets = Math.floor(count / RUNES_PER_SET);
    if (activeSets > 0) {
      const bonus = RUNE_SET_BONUSES_MAP[setType];
      if (bonus) {
        const currentBonus = bonuses.get(bonus.stat) || 0;
        bonuses.set(bonus.stat, currentBonus + bonus.value * activeSets);
      }
    }
  }

  return bonuses;
}

/**
 * Calculate final stats for a monster
 */
export function calculateMonsterStats(
  template: MonsterTemplate,
  instance: PlayerMonster,
  equippedRunes: PlayerRune[] = []
): CalculatedStats {
  const levelMult = getLevelMultiplier(instance.level);
  const starMult = getStarMultiplier(instance.stars);

  // Calculate awakening bonuses
  const awakeningBonus = instance.awakened && template.awakenBonus
    ? template.awakenBonus
    : {};

  // Calculate set bonuses
  const setBonuses = calculateSetBonuses(equippedRunes);

  // Helper to calculate a single stat
  const calcStat = (statName: keyof typeof template.baseStats): number => {
    const baseStat = template.baseStats[statName];

    // Level and star scaling
    let scaledStat = baseStat * levelMult * starMult;

    // Awakening bonus (flat)
    const awakenFlat = (awakeningBonus as Record<string, number>)[statName] || 0;
    scaledStat += awakenFlat;

    // Rune bonuses
    const runeBonus = calculateRuneBonus(equippedRunes, statName as StatType, scaledStat);
    const fromRunesFlat = runeBonus.flat;
    const fromRunesPercent = scaledStat * (runeBonus.percent / 100);

    // Set bonus (percentage based on base + level)
    const setBonus = setBonuses.get(statName) || 0;
    const fromSetBonus = setBonus > 0 && setBonus < 1
      ? scaledStat * setBonus
      : setBonus; // Some bonuses are flat (like critRate)

    return Math.floor(scaledStat + fromRunesFlat + fromRunesPercent + fromSetBonus);
  };

  // Special handling for crit stats (they don't scale with level/stars)
  const critRate = Math.min(100,
    template.baseStats.critRate +
    (awakeningBonus.critRate || 0) +
    calculateRuneBonus(equippedRunes, 'critRate', template.baseStats.critRate).flat +
    (setBonuses.get('critRate') || 0)
  );

  const critDamage =
    template.baseStats.critDamage +
    (awakeningBonus.critDamage || 0) +
    calculateRuneBonus(equippedRunes, 'critDamage', template.baseStats.critDamage).flat +
    (setBonuses.get('critDamage') || 0);

  // Accuracy and Resistance (capped at 100)
  const accuracy = Math.min(100,
    template.baseStats.accuracy +
    (awakeningBonus.accuracy || 0) +
    calculateRuneBonus(equippedRunes, 'accuracy', template.baseStats.accuracy).flat
  );

  const resistance = Math.min(100,
    template.baseStats.resistance +
    (awakeningBonus.resistance || 0) +
    calculateRuneBonus(equippedRunes, 'resistance', template.baseStats.resistance).flat
  );

  return {
    hp: calcStat('hp'),
    atk: calcStat('atk'),
    def: calcStat('def'),
    spd: Math.floor(
      template.baseStats.spd +
      (awakeningBonus.spd || 0) +
      calculateRuneBonus(equippedRunes, 'spd', template.baseStats.spd).flat +
      template.baseStats.spd * ((setBonuses.get('spd') || 0))
    ),
    critRate,
    critDamage,
    accuracy,
    resistance,
    lifesteal: setBonuses.get('lifesteal') || 0,
    startingImmunity: setBonuses.get('immunity') || 0,
  };
}

/**
 * Get detailed stat breakdown for UI
 */
export function getStatBreakdown(
  template: MonsterTemplate,
  instance: PlayerMonster,
  equippedRunes: PlayerRune[],
  statName: keyof typeof template.baseStats
): StatBreakdown {
  const baseStat = template.baseStats[statName];
  const levelMult = getLevelMultiplier(instance.level);
  const starMult = getStarMultiplier(instance.stars);

  const fromLevel = baseStat * (levelMult - 1);
  const fromStars = baseStat * levelMult * (starMult - 1);
  const scaledBase = baseStat * levelMult * starMult;

  const awakeningBonus = instance.awakened && template.awakenBonus
    ? (template.awakenBonus as Record<string, number>)[statName] || 0
    : 0;

  const runeBonus = calculateRuneBonus(equippedRunes, statName as StatType, scaledBase);
  const fromRunesFlat = runeBonus.flat;
  const fromRunesPercent = scaledBase * (runeBonus.percent / 100);

  const setBonuses = calculateSetBonuses(equippedRunes);
  const setBonus = setBonuses.get(statName) || 0;
  const fromSetBonus = setBonus > 0 && setBonus < 1 ? scaledBase * setBonus : setBonus;

  const total = Math.floor(scaledBase + awakeningBonus + fromRunesFlat + fromRunesPercent + fromSetBonus);

  return {
    base: baseStat,
    fromLevel: Math.floor(fromLevel),
    fromStars: Math.floor(fromStars),
    fromAwakening: awakeningBonus,
    fromRunesFlat,
    fromRunesPercent: Math.floor(fromRunesPercent),
    fromSetBonus: Math.floor(fromSetBonus),
    total,
  };
}

/**
 * Calculate effective power rating for a monster
 */
export function calculatePowerRating(stats: CalculatedStats): number {
  // Weighted power calculation
  const hpWeight = 0.15;
  const atkWeight = 0.25;
  const defWeight = 0.20;
  const spdWeight = 0.20;
  const critWeight = 0.10;
  const critDmgWeight = 0.10;

  return Math.floor(
    stats.hp * hpWeight / 10 +
    stats.atk * atkWeight +
    stats.def * defWeight +
    stats.spd * spdWeight * 5 +
    stats.critRate * critWeight +
    stats.critDamage * critDmgWeight
  );
}

/**
 * Get max level for a star grade
 */
export function getMaxLevel(stars: number): number {
  const maxLevels: Record<number, number> = {
    1: 15,
    2: 20,
    3: 25,
    4: 30,
    5: 35,
    6: 40,
  };
  return maxLevels[stars] || 40;
}

/**
 * Calculate experience needed for next level
 */
export function getExpForNextLevel(currentLevel: number): number {
  // Exponential growth formula
  return Math.floor(100 * Math.pow(1.15, currentLevel - 1));
}

/**
 * Calculate total experience needed to reach a level
 */
export function getTotalExpForLevel(targetLevel: number): number {
  let total = 0;
  for (let i = 1; i < targetLevel; i++) {
    total += getExpForNextLevel(i);
  }
  return total;
}
