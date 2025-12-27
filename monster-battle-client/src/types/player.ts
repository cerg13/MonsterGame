import type { PlayerMonster } from './monster';
import type { ArenaTier } from './arena';

// Re-export for convenience
export type { PlayerMonster };

// Player profile
export interface Player {
  id: string;
  username: string;
  email?: string;

  // Resources
  crystals: number;
  gold: number;
  energy: number;
  maxEnergy: number;
  energyRegenTime: Date;

  // Progress
  level: number;
  experience: number;

  // Arena
  arenaRank: number;
  arenaPoints: number;
  arenaTier: ArenaTier;

  // Loyalty
  loyaltyId?: string;
  loyaltyPoints: number;
  loyaltyTier: LoyaltyTier;

  // Stats
  createdAt: Date;
  lastLoginAt: Date;
  loginStreak: number;
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'diamond';

// Player inventory
export interface PlayerInventory {
  monsters: PlayerMonster[];
  runes: PlayerRune[];
  teamPresets: TeamPreset[];
}

// Team preset
export interface TeamPreset {
  id: string;
  name: string;
  monsterIds: string[];
  createdAt: Date;
}

// Rune types
export type RuneSet =
  | 'fatal'
  | 'swift'
  | 'blade'
  | 'rage'
  | 'energy'
  | 'guard'
  | 'vampire'
  | 'will';

export type StatType =
  | 'hp' | 'hpPercent'
  | 'atk' | 'atkPercent'
  | 'def' | 'defPercent'
  | 'spd'
  | 'critRate' | 'critDamage'
  | 'accuracy' | 'resistance';

export type RuneRarity = 'common' | 'magic' | 'rare' | 'hero' | 'legend';

// Player's rune
export interface PlayerRune {
  id: string;
  setType: RuneSet;
  slot: 1 | 2 | 3 | 4;
  stars: 1 | 2 | 3 | 4 | 5 | 6;
  rarity: RuneRarity;
  level: number;
  mainStat: StatType;
  mainStatValue: number;
  subStats: RuneSubStat[];
  equippedTo?: string;
  obtainedAt: Date;
}

export interface RuneSubStat {
  type: StatType;
  value: number;
  upgradeCount: number;
}

// Rune set bonuses (2-piece sets)
export const RUNE_SET_BONUSES: Record<RuneSet, { stat: string; value: number }> = {
  fatal: { stat: 'atk', value: 0.25 },      // +25% ATK
  swift: { stat: 'spd', value: 0.20 },      // +20% SPD
  blade: { stat: 'critRate', value: 0.12 }, // +12% Crit Rate
  rage: { stat: 'critDamage', value: 0.30 },// +30% Crit Damage
  energy: { stat: 'hp', value: 0.15 },      // +15% HP
  guard: { stat: 'def', value: 0.15 },      // +15% DEF
  vampire: { stat: 'lifesteal', value: 0.20 }, // +20% Lifesteal
  will: { stat: 'immunity', value: 1 },     // 1 turn Immunity
};

// Energy system
export const ENERGY_CONFIG = {
  maxEnergy: 120,
  regenRate: 6, // minutes per 1 energy
  battleCost: {
    min: 8,
    max: 12,
  },
};

// Experience table for player levels
export const PLAYER_EXP_TABLE: number[] = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  1750,   // Level 6
  2750,   // Level 7
  4000,   // Level 8
  5500,   // Level 9
  7500,   // Level 10
  // ... extends to max level
];
