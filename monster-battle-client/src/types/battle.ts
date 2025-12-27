import type { Element, SkillTemplate } from './monster';

// Battle phases
export type BattlePhase =
  | 'initialization'
  | 'tick'
  | 'turn_start'
  | 'action_selection'
  | 'action_execution'
  | 'effect_resolution'
  | 'turn_end'
  | 'victory_check'
  | 'battle_end';

// Complete battle state
export interface BattleState {
  id: string;
  phase: BattlePhase;
  turn: number;
  tick: number;
  playerTeam: BattleMonster[];
  enemyTeam: BattleMonster[];
  activeMonster: string | null;
  actionQueue: BattleAction[];
  battleLog: BattleLogEntry[];
  isAutoMode: boolean;
  winner: 'player' | 'enemy' | null;
}

// Monster in battle context
export interface BattleMonster {
  id: string;
  templateId: string;
  name: string;
  element: Element;
  team: 'player' | 'enemy';

  // Current stats
  currentHp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;
  critDamage: number;
  accuracy: number;
  resistance: number;

  // ATB
  attackBar: number;

  // Skills
  skills: BattleSkill[];

  // Passive abilities
  passiveIds: string[];

  // Status effects
  buffs: ActiveEffect[];
  debuffs: ActiveEffect[];

  // State
  isAlive: boolean;
  canAct: boolean;

  // Visual
  spriteSheet: string;
  portrait: string;
}

export interface BattleSkill {
  skillId: string;
  name: string;
  currentCooldown: number;
  maxCooldown: number;
  isReady: boolean;
  template: SkillTemplate;
  skillLevel?: number; // Current skill level (1-15)
}

export interface ActiveEffect {
  id: string;
  type: EffectType;
  duration: number;
  value: number;
  sourceId: string;
  icon: string;
}

export type EffectType =
  | 'atkUp' | 'atkDown'
  | 'defUp' | 'defDown'
  | 'spdUp' | 'spdDown'
  | 'critRateUp' | 'critRateDown'
  | 'immunity'
  | 'invincibility'
  | 'stun'
  | 'freeze'
  | 'sleep'
  | 'continuousDamage'
  | 'heal';

export interface BattleAction {
  actorId: string;
  skillId: string;
  targetIds: string[];
  timestamp: number;
}

export interface BattleLogEntry {
  turn: number;
  tick: number;
  actorId: string;
  actorName: string;
  action: string;
  targets: string[];
  damage?: number;
  healing?: number;
  effects?: string[];
  isCrit?: boolean;
  isGlancing?: boolean;
  isCrushing?: boolean;
}

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  isGlancing: boolean;
  isCrushing: boolean;
}

export interface BattleResult {
  winner: 'player' | 'enemy';
  turns: number;
  duration: number;
  rewards: BattleReward[];
  experience: { monsterId: string; exp: number }[];
  statistics?: BattleStatistics;
}

export interface BattleStatistics {
  playerStats: MonsterBattleStats[];
  enemyStats: MonsterBattleStats[];
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  battleDuration: number;
  totalTurns: number;
}

export interface MonsterBattleStats {
  monsterId: string;
  monsterName: string;
  element: Element;
  damageDealt: number;
  damageTaken: number;
  healingDone: number;
  criticalHits: number;
  totalHits: number;
  debuffsApplied: number;
  buffsApplied: number;
  turnsActed: number;
  survived: boolean;
}

export interface BattleReward {
  type: 'gold' | 'crystal' | 'energy' | 'rune' | 'monster';
  amount?: number;
  itemId?: string;
}

// Battle configuration for starting a new battle
export interface BattleConfig {
  stageId?: string;
  playerTeamIds: string[];
  enemyTeam?: BattleMonster[];
  isArena?: boolean;
}

// ATB constants
export const ATB_TICK_PERCENTAGE = 0.07; // 7% per tick
export const ATB_FULL = 100;
