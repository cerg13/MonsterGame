/**
 * Campaign/Dungeon System Types
 *
 * Defines the structure for campaign stages, dungeons,
 * and player progress tracking.
 */

import type { Element } from './monster';
import type { BattleReward } from './battle';

// Difficulty levels
export type Difficulty = 'normal' | 'hard' | 'hell';

// Stage star rating (0-3)
export type StageRating = 0 | 1 | 2 | 3;

// Campaign region
export interface CampaignRegion {
  id: string;
  name: string;
  description: string;
  background: string;
  requiredLevel: number;
  stages: CampaignStage[];
  unlockRequirements?: {
    previousRegion?: string;
    questComplete?: string;
  };
}

// Individual campaign stage
export interface CampaignStage {
  id: string;
  regionId: string;
  name: string;
  stageNumber: number;
  difficulty: Difficulty;

  // Energy cost
  energyCost: number;

  // Stage info
  recommendedLevel: number;
  bossStage: boolean;

  // Enemy configuration
  waves: StageWave[];

  // Rewards
  rewards: StageRewards;

  // Requirements
  requiredStars?: number; // Stars needed from previous stages
  requiredStage?: string; // Previous stage ID that must be completed
}

// Wave of enemies in a stage
export interface StageWave {
  waveNumber: number;
  enemies: WaveEnemy[];
}

// Enemy in a wave
export interface WaveEnemy {
  templateId: string;
  level: number;
  isBoss?: boolean;
  // Optional stat modifiers for difficulty scaling
  hpMod?: number;
  atkMod?: number;
  defMod?: number;
}

// Stage rewards
export interface StageRewards {
  // Guaranteed rewards
  expBase: number;
  goldBase: number;

  // Possible drops with rates
  drops: StageDrop[];

  // First clear bonus
  firstClearBonus?: BattleReward[];
}

// Possible stage drop
export interface StageDrop {
  type: 'rune' | 'monster' | 'material' | 'gold' | 'crystal';
  itemId?: string;
  minAmount?: number;
  maxAmount?: number;
  dropRate: number; // 0-100%
  runeGrade?: number; // For rune drops
  runeSet?: string; // Specific rune set
}

// Player's stage progress
export interface StageProgress {
  stageId: string;
  completed: boolean;
  bestRating: StageRating;
  clearCount: number;
  bestClearTime?: number; // Fastest clear in seconds
  firstClearClaimed: boolean;
}

// Player's campaign progress
export interface CampaignProgress {
  stages: Record<string, StageProgress>;
  unlockedRegions: string[];
  totalStars: number;
}

// Dungeon types
export type DungeonType =
  | 'giants'      // Rune dungeon - Fatal, Swift
  | 'dragons'     // Rune dungeon - Rage, Blade
  | 'necro'       // Rune dungeon - Vampire, Will
  | 'elemental'   // Essence dungeons
  | 'magic'       // Magic essence
  | 'light_dark'  // L/D essence
  | 'secret'      // Secret dungeons for monster pieces
  | 'tower';      // Trial tower

// Dungeon definition
export interface Dungeon {
  id: string;
  name: string;
  type: DungeonType;
  description: string;
  icon: string;
  element?: Element;
  floors: DungeonFloor[];
  unlockRequirement?: {
    playerLevel?: number;
    campaignStage?: string;
  };
}

// Dungeon floor
export interface DungeonFloor {
  floor: number;
  energyCost: number;
  recommendedLevel: number;
  waves: StageWave[];
  rewards: StageRewards;
}

// Secret dungeon (for monster pieces)
export interface SecretDungeon {
  id: string;
  monsterId: string;
  monsterName: string;
  element: Element;
  floors: DungeonFloor[];
  piecesPerClear: number;
  piecesRequired: number; // To summon
  expiresAt: Date;
  discoveredBy: string;
  isGuildDungeon: boolean;
}

// Trial tower floor
export interface TowerFloor {
  floor: number;
  enemies: WaveEnemy[];
  rewards: BattleReward[];
  cleared: boolean;
  element?: Element; // Elemental restriction
}

// Calculate star rating based on performance
export function calculateStarRating(
  allAlive: boolean,
  turnsUsed: number,
  maxTurns: number
): StageRating {
  if (!allAlive) return 1;
  if (turnsUsed <= maxTurns * 0.5) return 3;
  if (turnsUsed <= maxTurns * 0.75) return 2;
  return 1;
}

// Experience multiplier by difficulty
export const DIFFICULTY_MULTIPLIERS: Record<Difficulty, number> = {
  normal: 1.0,
  hard: 1.5,
  hell: 2.0,
};

// Energy cost multiplier by difficulty
export const DIFFICULTY_ENERGY_MULTIPLIERS: Record<Difficulty, number> = {
  normal: 1.0,
  hard: 1.2,
  hell: 1.5,
};
