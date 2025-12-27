import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Types
export type RuneSet = 'energy' | 'fatal' | 'blade' | 'swift' | 'focus' | 'guard' | 'endure' | 'violent';
export type RuneSlot = 1 | 2 | 3 | 4 | 5 | 6;
export type RuneRarity = 'common' | 'rare' | 'hero' | 'legend';
export type RuneStat = 'hp' | 'hp_percent' | 'atk' | 'atk_percent' | 'def' | 'def_percent' | 'spd' | 'crit_rate' | 'crit_dmg' | 'accuracy' | 'resistance';

export interface RuneSubStat {
  stat: RuneStat;
  value: number;
}

export interface Rune {
  id: string;
  userId: string;
  monsterId: string | null;
  set: RuneSet;
  slot: RuneSlot;
  stars: number;
  level: number;
  rarity: RuneRarity;
  mainStat: RuneStat;
  mainStatValue: number;
  subStats: RuneSubStat[];
  createdAt: Date;
}

// Constants
const SLOT_MAIN_STATS: Record<RuneSlot, RuneStat[]> = {
  1: ['atk'],
  2: ['hp', 'hp_percent', 'atk', 'atk_percent', 'def', 'def_percent', 'spd'],
  3: ['def'],
  4: ['hp', 'hp_percent', 'atk', 'atk_percent', 'def', 'def_percent', 'crit_rate', 'crit_dmg'],
  5: ['hp'],
  6: ['hp', 'hp_percent', 'atk', 'atk_percent', 'def', 'def_percent', 'accuracy', 'resistance'],
};

const MAIN_STAT_VALUES: Record<RuneStat, { base: number; perLevel: number }> = {
  hp: { base: 160, perLevel: 120 },
  hp_percent: { base: 5, perLevel: 3 },
  atk: { base: 10, perLevel: 8 },
  atk_percent: { base: 5, perLevel: 3 },
  def: { base: 10, perLevel: 6 },
  def_percent: { base: 5, perLevel: 3 },
  spd: { base: 5, perLevel: 2 },
  crit_rate: { base: 4, perLevel: 2 },
  crit_dmg: { base: 6, perLevel: 3 },
  accuracy: { base: 5, perLevel: 3 },
  resistance: { base: 5, perLevel: 3 },
};

const SUB_STAT_RANGES: Record<RuneStat, { min: number; max: number }> = {
  hp: { min: 100, max: 500 },
  hp_percent: { min: 3, max: 8 },
  atk: { min: 5, max: 20 },
  atk_percent: { min: 3, max: 8 },
  def: { min: 5, max: 20 },
  def_percent: { min: 3, max: 8 },
  spd: { min: 2, max: 6 },
  crit_rate: { min: 2, max: 6 },
  crit_dmg: { min: 3, max: 7 },
  accuracy: { min: 3, max: 8 },
  resistance: { min: 3, max: 8 },
};

const RARITY_SUBSTAT_COUNT: Record<RuneRarity, number> = {
  common: 0,
  rare: 1,
  hero: 2,
  legend: 3,
};

const UPGRADE_COSTS: Record<number, number> = {
  1: 1000, 2: 1500, 3: 2000, 4: 2500, 5: 3000,
  6: 4000, 7: 5000, 8: 6000, 9: 8000, 10: 10000,
  11: 15000, 12: 20000, 13: 30000, 14: 40000, 15: 50000,
};

const UPGRADE_SUCCESS_RATE: Record<number, number> = {
  1: 100, 2: 100, 3: 100, 4: 95, 5: 90,
  6: 85, 7: 80, 8: 75, 9: 70, 10: 65,
  11: 50, 12: 40, 13: 30, 14: 20, 15: 15,
};

/**
 * Rune Service
 * Handles rune generation, upgrading, and management
 */
export class RuneService {
  private playerRunes: Map<string, Rune[]> = new Map();

  /**
   * Secure random number generator
   */
  private secureRandom(): number {
    const buffer = crypto.randomBytes(4);
    return buffer.readUInt32BE(0) / 0xFFFFFFFF;
  }

  private secureRandomInt(min: number, max: number): number {
    return Math.floor(this.secureRandom() * (max - min + 1)) + min;
  }

  /**
   * Get player runes
   */
  public getPlayerRunes(userId: string): Rune[] {
    if (!this.playerRunes.has(userId)) {
      // Generate some starter runes
      const starterRunes = this.generateStarterRunes(userId);
      this.playerRunes.set(userId, starterRunes);
    }
    return this.playerRunes.get(userId)!;
  }

  /**
   * Generate starter runes for new player
   */
  private generateStarterRunes(userId: string): Rune[] {
    const runes: Rune[] = [];
    const sets: RuneSet[] = ['energy', 'fatal', 'blade', 'swift'];

    for (let i = 0; i < 12; i++) {
      runes.push(this.generateRune(
        userId,
        sets[Math.floor(Math.random() * sets.length)],
        ((i % 6) + 1) as RuneSlot,
        3 + Math.floor(Math.random() * 3),
        Math.random() < 0.3 ? 'rare' : 'common'
      ));
    }

    return runes;
  }

  /**
   * Generate a random rune
   */
  public generateRune(
    userId: string,
    set: RuneSet,
    slot: RuneSlot,
    stars: number,
    rarity: RuneRarity
  ): Rune {
    const possibleMainStats = SLOT_MAIN_STATS[slot];
    const mainStat = possibleMainStats[this.secureRandomInt(0, possibleMainStats.length - 1)];
    const mainStatConfig = MAIN_STAT_VALUES[mainStat];

    // Generate sub stats
    const subStats: RuneSubStat[] = [];
    const subStatCount = RARITY_SUBSTAT_COUNT[rarity];
    const usedStats = new Set<RuneStat>([mainStat]);

    for (let i = 0; i < subStatCount; i++) {
      const availableStats = Object.keys(SUB_STAT_RANGES).filter(
        s => !usedStats.has(s as RuneStat)
      ) as RuneStat[];

      if (availableStats.length > 0) {
        const stat = availableStats[this.secureRandomInt(0, availableStats.length - 1)];
        const range = SUB_STAT_RANGES[stat];
        const value = this.secureRandomInt(range.min, range.max);
        subStats.push({ stat, value });
        usedStats.add(stat);
      }
    }

    return {
      id: uuidv4(),
      userId,
      monsterId: null,
      set,
      slot,
      stars,
      level: 0,
      rarity,
      mainStat,
      mainStatValue: mainStatConfig.base * (1 + (stars - 1) * 0.25),
      subStats,
      createdAt: new Date(),
    };
  }

  /**
   * Upgrade rune
   */
  public upgradeRune(userId: string, runeId: string): {
    success: boolean;
    upgraded: boolean;
    newLevel?: number;
    newMainStatValue?: number;
    newSubStat?: RuneSubStat;
    cost?: number;
    error?: string;
  } {
    const runes = this.playerRunes.get(userId);
    if (!runes) {
      return { success: false, upgraded: false, error: 'No runes found' };
    }

    const rune = runes.find(r => r.id === runeId);
    if (!rune) {
      return { success: false, upgraded: false, error: 'Rune not found' };
    }

    if (rune.level >= 15) {
      return { success: false, upgraded: false, error: 'Rune already at max level' };
    }

    const cost = UPGRADE_COSTS[rune.level + 1];
    const successRate = UPGRADE_SUCCESS_RATE[rune.level + 1];
    const roll = this.secureRandom() * 100;

    if (roll > successRate) {
      return { success: true, upgraded: false, cost };
    }

    // Upgrade successful
    rune.level++;
    const mainStatConfig = MAIN_STAT_VALUES[rune.mainStat];
    rune.mainStatValue = (mainStatConfig.base + mainStatConfig.perLevel * rune.level) * (1 + (rune.stars - 1) * 0.25);

    let newSubStat: RuneSubStat | undefined;

    // Add or upgrade sub stat at levels 3, 6, 9, 12
    if (rune.level % 3 === 0 && rune.level <= 12) {
      if (rune.subStats.length < 4) {
        // Add new sub stat
        const usedStats = new Set<RuneStat>([rune.mainStat, ...rune.subStats.map(s => s.stat)]);
        const availableStats = Object.keys(SUB_STAT_RANGES).filter(
          s => !usedStats.has(s as RuneStat)
        ) as RuneStat[];

        if (availableStats.length > 0) {
          const stat = availableStats[this.secureRandomInt(0, availableStats.length - 1)];
          const range = SUB_STAT_RANGES[stat];
          const value = this.secureRandomInt(range.min, range.max);
          newSubStat = { stat, value };
          rune.subStats.push(newSubStat);
        }
      } else {
        // Upgrade existing sub stat
        const idx = this.secureRandomInt(0, rune.subStats.length - 1);
        const stat = rune.subStats[idx].stat;
        const range = SUB_STAT_RANGES[stat];
        const addValue = this.secureRandomInt(range.min, range.max);
        rune.subStats[idx].value += addValue;
        newSubStat = rune.subStats[idx];
      }
    }

    return {
      success: true,
      upgraded: true,
      newLevel: rune.level,
      newMainStatValue: rune.mainStatValue,
      newSubStat,
      cost,
    };
  }

  /**
   * Equip rune to monster
   */
  public equipRune(userId: string, runeId: string, monsterId: string): { success: boolean; error?: string } {
    const runes = this.playerRunes.get(userId);
    if (!runes) {
      return { success: false, error: 'No runes found' };
    }

    const rune = runes.find(r => r.id === runeId);
    if (!rune) {
      return { success: false, error: 'Rune not found' };
    }

    // Unequip from current monster if equipped
    if (rune.monsterId) {
      rune.monsterId = null;
    }

    // Unequip any rune in same slot from target monster
    const existingRune = runes.find(r => r.monsterId === monsterId && r.slot === rune.slot);
    if (existingRune) {
      existingRune.monsterId = null;
    }

    rune.monsterId = monsterId;
    return { success: true };
  }

  /**
   * Unequip rune
   */
  public unequipRune(userId: string, runeId: string): { success: boolean; error?: string } {
    const runes = this.playerRunes.get(userId);
    if (!runes) {
      return { success: false, error: 'No runes found' };
    }

    const rune = runes.find(r => r.id === runeId);
    if (!rune) {
      return { success: false, error: 'Rune not found' };
    }

    rune.monsterId = null;
    return { success: true };
  }

  /**
   * Sell rune
   */
  public sellRune(userId: string, runeId: string): { success: boolean; gold?: number; error?: string } {
    const runes = this.playerRunes.get(userId);
    if (!runes) {
      return { success: false, error: 'No runes found' };
    }

    const runeIndex = runes.findIndex(r => r.id === runeId);
    if (runeIndex === -1) {
      return { success: false, error: 'Rune not found' };
    }

    const rune = runes[runeIndex];
    if (rune.monsterId) {
      return { success: false, error: 'Unequip rune first' };
    }

    // Calculate sell value
    const baseValue = rune.stars * 500;
    const levelBonus = rune.level * 100;
    const rarityMultiplier = { common: 1, rare: 1.5, hero: 2, legend: 3 }[rune.rarity];
    const gold = Math.floor((baseValue + levelBonus) * rarityMultiplier);

    runes.splice(runeIndex, 1);
    return { success: true, gold };
  }

  /**
   * Add rune to player inventory
   */
  public addRune(userId: string, rune: Rune): void {
    const runes = this.getPlayerRunes(userId);
    runes.push(rune);
  }
}

// Export singleton
export const runeService = new RuneService();
