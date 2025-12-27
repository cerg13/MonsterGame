import type { Element } from './monster';

// Dungeon types
export type DungeonType =
  | 'giants'      // Giants Keep - Energy, Fatal, Blade, Swift runes
  | 'dragons'     // Dragons Lair - Violent, Revenge, Focus, Guard runes
  | 'necropolis'  // Necropolis - Will, Nemesis, Destroy, Vampire runes
  | 'toa'         // Trial of Ascension - Monthly tower
  | 'rift';       // Rift of Worlds - Elemental raids

// Difficulty/floor levels
export type DungeonDifficulty = 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7' | 'B8' | 'B9' | 'B10';

// ToA difficulty
export type ToADifficulty = 'normal' | 'hard';

// Rift grades
export type RiftGrade = 'F' | 'D' | 'C' | 'B' | 'A' | 'A+' | 'S' | 'SS' | 'SSS';

// Dungeon floor configuration
export interface DungeonFloor {
  id: string;
  dungeonType: DungeonType;
  floor: number;
  name: string;
  description: string;
  energyCost: number;
  recommendedPower: number;
  enemyElements: Element[];
  waves: DungeonWave[];
  bossId: string | null;
  rewards: DungeonReward;
}

// Wave of enemies in dungeon
export interface DungeonWave {
  waveNumber: number;
  enemies: DungeonEnemy[];
  isBossWave: boolean;
}

// Enemy in dungeon
export interface DungeonEnemy {
  monsterId: string;
  level: number;
  stars: number;
  isBoss: boolean;
  isMiniBoss: boolean;
  specialMechanics?: BossMechanic[];
}

// Boss special mechanics
export interface BossMechanic {
  id: string;
  name: string;
  description: string;
  trigger: 'on_hit' | 'on_crit' | 'hp_threshold' | 'turn_interval' | 'on_debuff';
  triggerValue?: number; // HP %, turn count, etc.
  effect: 'counterattack' | 'aoe_attack' | 'enrage' | 'heal' | 'summon' | 'immunity' | 'shield';
  effectValue?: number;
}

// Dungeon rewards
export interface DungeonReward {
  gold: { min: number; max: number };
  experience: { min: number; max: number };
  energy?: number; // Energy refund chance
  runeSets: string[]; // Possible rune sets
  runeStars: { min: number; max: number };
  runeDropRate: number; // 0-1
  specialDrops?: SpecialDrop[];
}

// Special drops (scrolls, essences, etc.)
export interface SpecialDrop {
  type: 'scroll' | 'essence' | 'material' | 'monster';
  id: string;
  name: string;
  dropRate: number;
}

// Dungeon run result
export interface DungeonRunResult {
  success: boolean;
  floor: DungeonFloor;
  waves: WaveResult[];
  totalDamageDealt: number;
  totalDamageTaken: number;
  timeElapsed: number;
  rewards?: {
    gold: number;
    experience: number;
    runes: DroppedRune[];
    specialDrops: SpecialDrop[];
  };
}

// Wave result
export interface WaveResult {
  waveNumber: number;
  completed: boolean;
  damageDealt: number;
  damageTaken: number;
  monstersKilled: number;
}

// Dropped rune
export interface DroppedRune {
  set: string;
  slot: number;
  stars: number;
  mainStat: { type: string; value: number };
  subStats: { type: string; value: number }[];
}

// Player's dungeon progress
export interface DungeonProgress {
  dungeonType: DungeonType;
  highestFloor: number;
  totalClears: number;
  fastestClear: number | null; // milliseconds
  lastClearTime: Date | null;
}

// ToA progress
export interface ToAProgress {
  difficulty: ToADifficulty;
  currentFloor: number;
  highestFloor: number;
  usedMonsters: string[]; // Monster IDs used this reset
  lastReset: Date;
}

// Rift progress
export interface RiftProgress {
  element: Element;
  highestGrade: RiftGrade;
  bestDamage: number;
  totalClears: number;
}
