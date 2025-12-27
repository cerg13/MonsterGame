import type { DungeonFloor, DroppedRune, SpecialDrop, DungeonRunResult } from '../types/dungeon';
import type { DungeonType } from '../types/dungeon';
import { DUNGEON_CONFIG } from '../data/dungeons';

// Rune stat types
const FLAT_STATS = ['atk', 'def', 'hp', 'spd'];
const PERCENT_STATS = ['atk%', 'def%', 'hp%', 'critRate', 'critDmg', 'accuracy', 'resistance'];

// Main stat options by slot
const MAIN_STAT_OPTIONS: Record<number, string[]> = {
  1: ['atk'],
  2: ['atk', 'atk%', 'def', 'def%', 'hp', 'hp%', 'spd'],
  3: ['def'],
  4: ['atk', 'atk%', 'def', 'def%', 'hp', 'hp%', 'critRate', 'critDmg'],
  5: ['hp'],
  6: ['atk', 'atk%', 'def', 'def%', 'hp', 'hp%', 'accuracy', 'resistance'],
};

// Base values for main stats at 6*
const MAIN_STAT_VALUES: Record<string, { base: number; perLevel: number }> = {
  'atk': { base: 22, perLevel: 8 },
  'atk%': { base: 8, perLevel: 3 },
  'def': { base: 22, perLevel: 8 },
  'def%': { base: 8, perLevel: 3 },
  'hp': { base: 270, perLevel: 105 },
  'hp%': { base: 8, perLevel: 3 },
  'spd': { base: 7, perLevel: 2 },
  'critRate': { base: 6, perLevel: 2 },
  'critDmg': { base: 8, perLevel: 3 },
  'accuracy': { base: 8, perLevel: 3 },
  'resistance': { base: 8, perLevel: 3 },
};

// Sub stat value ranges
const SUB_STAT_RANGES: Record<string, { min: number; max: number }> = {
  'atk': { min: 10, max: 20 },
  'atk%': { min: 4, max: 8 },
  'def': { min: 10, max: 20 },
  'def%': { min: 4, max: 8 },
  'hp': { min: 135, max: 375 },
  'hp%': { min: 4, max: 8 },
  'spd': { min: 3, max: 6 },
  'critRate': { min: 3, max: 6 },
  'critDmg': { min: 4, max: 7 },
  'accuracy': { min: 4, max: 8 },
  'resistance': { min: 4, max: 8 },
};

export interface RewardGenerationResult {
  gold: number;
  experience: number;
  runes: DroppedRune[];
  specialDrops: SpecialDrop[];
  energyRefund: number;
}

export class DungeonRewardService {
  /**
   * Generate rewards for completing a dungeon floor
   */
  public generateRewards(floor: DungeonFloor, success: boolean): RewardGenerationResult {
    if (!success) {
      return {
        gold: Math.floor(floor.rewards.gold.min * 0.3), // 30% gold on failure
        experience: Math.floor(floor.rewards.experience.min * 0.3),
        runes: [],
        specialDrops: [],
        energyRefund: 0,
      };
    }

    const rewards = floor.rewards;

    // Generate gold
    const gold = this.randomBetween(rewards.gold.min, rewards.gold.max);

    // Generate experience
    const experience = this.randomBetween(rewards.experience.min, rewards.experience.max);

    // Generate runes
    const runes: DroppedRune[] = [];
    if (Math.random() < rewards.runeDropRate && rewards.runeSets.length > 0) {
      const runeCount = this.getRuneDropCount(floor.floor);
      for (let i = 0; i < runeCount; i++) {
        const rune = this.generateRune(
          rewards.runeSets,
          rewards.runeStars.min,
          rewards.runeStars.max
        );
        runes.push(rune);
      }
    }

    // Generate special drops
    const specialDrops: SpecialDrop[] = [];
    if (rewards.specialDrops) {
      for (const drop of rewards.specialDrops) {
        if (Math.random() < drop.dropRate) {
          specialDrops.push(drop);
        }
      }
    }

    // Energy refund chance (5% base)
    const energyRefund = Math.random() < 0.05 ? floor.energyCost : 0;

    return {
      gold,
      experience,
      runes,
      specialDrops,
      energyRefund,
    };
  }

  /**
   * Generate a random rune
   */
  private generateRune(sets: string[], minStars: number, maxStars: number): DroppedRune {
    const set = sets[Math.floor(Math.random() * sets.length)];
    const slot = Math.floor(Math.random() * 6) + 1;
    const stars = this.randomBetween(minStars, maxStars);

    // Generate main stat
    const mainStatOptions = MAIN_STAT_OPTIONS[slot];
    const mainStatType = mainStatOptions[Math.floor(Math.random() * mainStatOptions.length)];
    const mainStatData = MAIN_STAT_VALUES[mainStatType];

    // Scale base value by stars (6* = 100%, 5* = 85%, etc.)
    const starMultiplier = 0.55 + (stars * 0.075);
    const mainStatValue = Math.floor(mainStatData.base * starMultiplier);

    // Generate sub stats (0-4 for new rune)
    const subStatCount = this.getInitialSubStatCount(stars);
    const subStats = this.generateSubStats(mainStatType, subStatCount, stars);

    return {
      set,
      slot,
      stars,
      mainStat: { type: mainStatType, value: mainStatValue },
      subStats,
    };
  }

  /**
   * Get number of initial sub stats based on rune stars
   */
  private getInitialSubStatCount(stars: number): number {
    if (stars >= 6) {
      // 6* runes: 15% 4 subs, 35% 3 subs, 50% 2 subs
      const roll = Math.random();
      if (roll < 0.15) return 4;
      if (roll < 0.50) return 3;
      return 2;
    } else if (stars >= 5) {
      // 5* runes: 10% 4 subs, 30% 3 subs, 60% 2 subs
      const roll = Math.random();
      if (roll < 0.10) return 4;
      if (roll < 0.40) return 3;
      return 2;
    } else {
      // 4* or less: 20% 3 subs, 80% 2 subs
      const roll = Math.random();
      if (roll < 0.20) return 3;
      return 2;
    }
  }

  /**
   * Generate sub stats for a rune
   */
  private generateSubStats(
    mainStatType: string,
    count: number,
    stars: number
  ): { type: string; value: number }[] {
    const availableStats = [...FLAT_STATS, ...PERCENT_STATS].filter(
      stat => stat !== mainStatType
    );

    const subStats: { type: string; value: number }[] = [];
    const usedStats = new Set<string>();

    for (let i = 0; i < count && availableStats.length > usedStats.size; i++) {
      // Pick a random unused stat
      let statType: string;
      do {
        statType = availableStats[Math.floor(Math.random() * availableStats.length)];
      } while (usedStats.has(statType));

      usedStats.add(statType);

      // Generate value
      const range = SUB_STAT_RANGES[statType] || { min: 1, max: 10 };
      const starMultiplier = 0.55 + (stars * 0.075);
      const value = Math.floor(
        this.randomBetween(range.min, range.max) * starMultiplier
      );

      subStats.push({ type: statType, value });
    }

    return subStats;
  }

  /**
   * Get number of runes to drop based on floor
   */
  private getRuneDropCount(floor: number): number {
    // Higher floors can drop more runes
    if (floor >= 10) {
      return Math.random() < 0.2 ? 2 : 1;
    }
    return 1;
  }

  /**
   * Calculate total power of rewards (for display)
   */
  public calculateRewardPower(rewards: RewardGenerationResult): number {
    let power = 0;

    // Gold contributes to power
    power += rewards.gold / 100;

    // Each rune contributes based on stars
    for (const rune of rewards.runes) {
      power += rune.stars * 100;
      power += rune.subStats.length * 50;
    }

    // Special drops are valuable
    power += rewards.specialDrops.length * 500;

    return Math.floor(power);
  }

  /**
   * Calculate sell value for a rune
   */
  public calculateRuneSellValue(rune: DroppedRune): number {
    const baseValue = 1000 * rune.stars;
    const subStatBonus = rune.subStats.length * 200;
    return baseValue + subStatBonus;
  }

  /**
   * Create a complete dungeon run result
   */
  public createRunResult(
    floor: DungeonFloor,
    success: boolean,
    timeElapsed: number,
    totalDamageDealt: number,
    totalDamageTaken: number
  ): DungeonRunResult {
    const rewards = this.generateRewards(floor, success);

    return {
      success,
      floor,
      waves: floor.waves.map((wave, index) => ({
        waveNumber: wave.waveNumber,
        completed: success || index < floor.waves.length - 1,
        damageDealt: Math.floor(totalDamageDealt / floor.waves.length),
        damageTaken: Math.floor(totalDamageTaken / floor.waves.length),
        monstersKilled: wave.enemies.length,
      })),
      totalDamageDealt,
      totalDamageTaken,
      timeElapsed,
      rewards: success ? {
        gold: rewards.gold,
        experience: rewards.experience,
        runes: rewards.runes,
        specialDrops: rewards.specialDrops,
      } : undefined,
    };
  }

  /**
   * Format rune for display
   */
  public formatRune(rune: DroppedRune): string {
    const stars = '★'.repeat(rune.stars);
    return `${stars} ${rune.set} (Slot ${rune.slot}) - ${rune.mainStat.type}: ${rune.mainStat.value}`;
  }

  /**
   * Get grade for Rift based on damage
   */
  public getRiftGrade(damage: number): 'F' | 'D' | 'C' | 'B' | 'A' | 'A+' | 'S' | 'SS' | 'SSS' {
    if (damage >= 5000000) return 'SSS';
    if (damage >= 4000000) return 'SS';
    if (damage >= 3000000) return 'S';
    if (damage >= 2500000) return 'A+';
    if (damage >= 2000000) return 'A';
    if (damage >= 1500000) return 'B';
    if (damage >= 1000000) return 'C';
    if (damage >= 500000) return 'D';
    return 'F';
  }

  private randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Export singleton instance
export const dungeonRewardService = new DungeonRewardService();
