/**
 * Arena PvP Types
 *
 * Defines the arena battle system:
 * - Tiers and ranking
 * - Defense teams
 * - Battle logs
 * - Rewards
 */

// Arena tiers
export type ArenaTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';

// Tier thresholds (points needed to reach tier)
export const ARENA_TIER_THRESHOLDS: Record<ArenaTier, number> = {
  bronze: 0,
  silver: 1000,
  gold: 1500,
  diamond: 1800,
  legend: 2000,
};

// Tier info
export const ARENA_TIER_INFO: Record<ArenaTier, { name: string; color: string; icon: string }> = {
  bronze: { name: 'Bronze', color: '#cd7f32', icon: '🥉' },
  silver: { name: 'Silver', color: '#c0c0c0', icon: '🥈' },
  gold: { name: 'Gold', color: '#ffd700', icon: '🥇' },
  diamond: { name: 'Diamond', color: '#00bfff', icon: '💎' },
  legend: { name: 'Legend', color: '#ff4500', icon: '👑' },
};

// Arena opponent (simplified representation)
export interface ArenaOpponent {
  id: string;
  username: string;
  level: number;
  rank: number;
  points: number;
  tier: ArenaTier;
  defenseTeam: ArenaDefenseMonster[];
  winRate: number;
}

// Defense team monster representation
export interface ArenaDefenseMonster {
  templateId: string;
  stars: number;
  level: number;
  awakened: boolean;
}

// Battle result
export type ArenaBattleResult = 'victory' | 'defeat' | 'draw';

// Arena battle log entry
export interface ArenaBattleLog {
  id: string;
  timestamp: Date;
  isAttack: boolean; // true = we attacked, false = we were attacked
  opponentId: string;
  opponentName: string;
  opponentTier: ArenaTier;
  result: ArenaBattleResult;
  pointsChange: number;
  replayAvailable: boolean;
}

// Arena rewards by tier
export interface ArenaTierReward {
  tier: ArenaTier;
  crystals: number;
  gold: number;
  bonusItems?: { type: string; quantity: number }[];
}

export const ARENA_WEEKLY_REWARDS: ArenaTierReward[] = [
  { tier: 'bronze', crystals: 50, gold: 10000 },
  { tier: 'silver', crystals: 100, gold: 20000 },
  { tier: 'gold', crystals: 150, gold: 35000 },
  { tier: 'diamond', crystals: 250, gold: 50000, bonusItems: [{ type: 'devilmon', quantity: 1 }] },
  { tier: 'legend', crystals: 400, gold: 75000, bonusItems: [{ type: 'devilmon', quantity: 1 }, { type: 'legendary_scroll', quantity: 1 }] },
];

// Points change calculation
export const ARENA_POINTS = {
  victoryBase: 10,
  victoryBonus: 5, // Per tier difference (if opponent is higher)
  defeatBase: -8,
  defeatPenalty: -3, // Per tier difference (if opponent is lower)
  minPoints: 0,
};

// Arena wings (attack attempts)
export const ARENA_WINGS = {
  max: 10,
  regenMinutes: 30, // Time to regenerate 1 wing
};

// Player's arena state
export interface PlayerArenaState {
  rank: number;
  points: number;
  tier: ArenaTier;
  defenseTeamIds: string[]; // Monster IDs
  wings: number;
  lastWingRegen: Date;
  weeklyBattles: number;
  weeklyWins: number;
  battleLog: ArenaBattleLog[];
  lastRewardClaim: Date | null;
}

// Calculate tier from points
export function getTierFromPoints(points: number): ArenaTier {
  if (points >= ARENA_TIER_THRESHOLDS.legend) return 'legend';
  if (points >= ARENA_TIER_THRESHOLDS.diamond) return 'diamond';
  if (points >= ARENA_TIER_THRESHOLDS.gold) return 'gold';
  if (points >= ARENA_TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

// Calculate points change after battle
export function calculatePointsChange(
  playerTier: ArenaTier,
  opponentTier: ArenaTier,
  result: ArenaBattleResult
): number {
  const tierOrder: ArenaTier[] = ['bronze', 'silver', 'gold', 'diamond', 'legend'];
  const playerTierIndex = tierOrder.indexOf(playerTier);
  const opponentTierIndex = tierOrder.indexOf(opponentTier);
  const tierDiff = opponentTierIndex - playerTierIndex;

  if (result === 'victory') {
    return Math.max(ARENA_POINTS.victoryBase + tierDiff * ARENA_POINTS.victoryBonus, 5);
  } else if (result === 'defeat') {
    return Math.min(ARENA_POINTS.defeatBase + tierDiff * ARENA_POINTS.defeatPenalty, -3);
  }
  return 0; // Draw
}

// Create initial arena state
export function createInitialArenaState(): PlayerArenaState {
  return {
    rank: 0,
    points: 1000, // Start in Silver
    tier: 'silver',
    defenseTeamIds: [],
    wings: ARENA_WINGS.max,
    lastWingRegen: new Date(),
    weeklyBattles: 0,
    weeklyWins: 0,
    battleLog: [],
    lastRewardClaim: null,
  };
}
