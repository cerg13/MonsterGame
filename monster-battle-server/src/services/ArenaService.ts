import { v4 as uuidv4 } from 'uuid';

// Types
export interface ArenaPlayer {
  oderId: string;
  username: string;
  points: number;
  tier: ArenaTier;
  defenseTeam: string[];
  defenseTeamPower: number;
  winRate: number;
  playerLevel: number;
}

export type ArenaTier = 'bronze' | 'silver' | 'gold' | 'diamond' | 'legend';

export interface ArenaOpponent {
  id: string;
  username: string;
  level: number;
  points: number;
  tier: ArenaTier;
  defenseTeamPower: number;
  defenseTeam: ArenaDefenseMonster[];
  winRate: number;
  potentialPoints: number;
}

export interface ArenaDefenseMonster {
  templateId: string;
  name: string;
  element: string;
  stars: number;
  level: number;
}

export interface ArenaBattleResult {
  won: boolean;
  pointsChange: number;
  newPoints: number;
  newTier: ArenaTier;
  rewards: ArenaReward[];
}

export interface ArenaReward {
  type: 'gold' | 'crystal' | 'arena_token';
  amount: number;
}

interface ArenaState {
  points: number;
  tier: ArenaTier;
  wings: number;
  maxWings: number;
  defenseTeam: string[];
  weeklyBattles: number;
  weeklyWins: number;
  lastWingRegen: Date;
}

// Constants
const TIER_THRESHOLDS: Record<ArenaTier, number> = {
  bronze: 0,
  silver: 1000,
  gold: 1500,
  diamond: 1800,
  legend: 2000,
};

const WING_REGEN_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Arena Service
 * Handles PvP arena logic
 */
export class ArenaService {
  private playerStates: Map<string, ArenaState> = new Map();

  /**
   * Get or create player arena state
   */
  public getPlayerState(userId: string): ArenaState {
    let state = this.playerStates.get(userId);

    if (!state) {
      state = {
        points: 1000,
        tier: 'silver',
        wings: 10,
        maxWings: 10,
        defenseTeam: [],
        weeklyBattles: 0,
        weeklyWins: 0,
        lastWingRegen: new Date(),
      };
      this.playerStates.set(userId, state);
    }

    // Regenerate wings
    this.regenerateWings(state);

    return state;
  }

  /**
   * Regenerate wings based on time
   */
  private regenerateWings(state: ArenaState): void {
    const now = Date.now();
    const elapsed = now - state.lastWingRegen.getTime();
    const wingsToAdd = Math.floor(elapsed / WING_REGEN_MS);

    if (wingsToAdd > 0) {
      state.wings = Math.min(state.maxWings, state.wings + wingsToAdd);
      state.lastWingRegen = new Date(state.lastWingRegen.getTime() + wingsToAdd * WING_REGEN_MS);
    }
  }

  /**
   * Get tier from points
   */
  private getTierFromPoints(points: number): ArenaTier {
    if (points >= TIER_THRESHOLDS.legend) return 'legend';
    if (points >= TIER_THRESHOLDS.diamond) return 'diamond';
    if (points >= TIER_THRESHOLDS.gold) return 'gold';
    if (points >= TIER_THRESHOLDS.silver) return 'silver';
    return 'bronze';
  }

  /**
   * Generate opponents for player
   */
  public generateOpponents(userId: string, count: number = 5): ArenaOpponent[] {
    const state = this.getPlayerState(userId);
    const opponents: ArenaOpponent[] = [];

    const names = ['Shadow', 'Dragon', 'Phoenix', 'Thunder', 'Ice', 'Fire', 'Storm', 'Dark', 'Light', 'Chaos'];
    const suffixes = ['Master', 'Lord', 'Knight', 'Hunter', 'Slayer', 'King', 'Warrior', 'Mage', 'Sage', 'Champion'];

    for (let i = 0; i < count; i++) {
      // Generate opponent with points close to player
      const pointVariation = Math.floor(Math.random() * 200) - 100;
      const opponentPoints = Math.max(0, state.points + pointVariation);
      const opponentTier = this.getTierFromPoints(opponentPoints);

      // Generate defense team power
      const basePower = 30000 + opponentPoints * 20;
      const powerVariation = Math.floor(Math.random() * 10000) - 5000;
      const defensePower = basePower + powerVariation;

      // Calculate potential points
      const pointDiff = opponentPoints - state.points;
      let potentialPoints = 10;
      if (pointDiff > 100) potentialPoints = 15;
      if (pointDiff > 200) potentialPoints = 20;
      if (pointDiff < -100) potentialPoints = 7;
      if (pointDiff < -200) potentialPoints = 5;

      opponents.push({
        id: uuidv4(),
        username: `${names[Math.floor(Math.random() * names.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}${Math.floor(Math.random() * 100)}`,
        level: Math.floor(30 + Math.random() * 20),
        points: opponentPoints,
        tier: opponentTier,
        defenseTeamPower: defensePower,
        defenseTeam: this.generateDefenseTeam(),
        winRate: Math.floor(40 + Math.random() * 40),
        potentialPoints,
      });
    }

    return opponents.sort((a, b) => a.defenseTeamPower - b.defenseTeamPower);
  }

  /**
   * Generate random defense team
   */
  private generateDefenseTeam(): ArenaDefenseMonster[] {
    const monsters = [
      { templateId: 'phoenix_fire', name: 'Phoenix', element: 'fire' },
      { templateId: 'dragon_water', name: 'Water Dragon', element: 'water' },
      { templateId: 'golem_wind', name: 'Wind Golem', element: 'wind' },
      { templateId: 'valkyrie_light', name: 'Valkyrie', element: 'light' },
      { templateId: 'reaper_dark', name: 'Reaper', element: 'dark' },
    ];

    const teamSize = 3 + Math.floor(Math.random() * 2); // 3-4 monsters
    const team: ArenaDefenseMonster[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < teamSize; i++) {
      let idx: number;
      do {
        idx = Math.floor(Math.random() * monsters.length);
      } while (usedIndices.has(idx));
      usedIndices.add(idx);

      team.push({
        ...monsters[idx],
        stars: 4 + Math.floor(Math.random() * 2),
        level: 30 + Math.floor(Math.random() * 10),
      });
    }

    return team;
  }

  /**
   * Start arena battle
   */
  public startBattle(userId: string, opponentId: string): { success: boolean; error?: string } {
    const state = this.getPlayerState(userId);

    if (state.wings <= 0) {
      return { success: false, error: 'No arena wings available' };
    }

    state.wings--;
    return { success: true };
  }

  /**
   * Record battle result
   */
  public recordBattleResult(
    userId: string,
    opponentPoints: number,
    won: boolean
  ): ArenaBattleResult {
    const state = this.getPlayerState(userId);

    // Calculate points change
    const pointDiff = opponentPoints - state.points;
    let basePoints = won ? 10 : -8;

    if (won) {
      if (pointDiff > 100) basePoints = 15;
      if (pointDiff > 200) basePoints = 20;
    } else {
      if (pointDiff < -100) basePoints = -5;
      if (pointDiff < -200) basePoints = -3;
    }

    // Update state
    state.points = Math.max(0, state.points + basePoints);
    state.tier = this.getTierFromPoints(state.points);
    state.weeklyBattles++;
    if (won) state.weeklyWins++;

    // Generate rewards
    const rewards: ArenaReward[] = [];
    if (won) {
      rewards.push({ type: 'gold', amount: 1000 + Math.floor(Math.random() * 500) });
      rewards.push({ type: 'arena_token', amount: 5 + Math.floor(Math.random() * 5) });
      if (Math.random() < 0.1) {
        rewards.push({ type: 'crystal', amount: 5 });
      }
    }

    return {
      won,
      pointsChange: basePoints,
      newPoints: state.points,
      newTier: state.tier,
      rewards,
    };
  }

  /**
   * Set defense team
   */
  public setDefenseTeam(userId: string, monsterIds: string[]): { success: boolean; error?: string } {
    if (monsterIds.length < 1 || monsterIds.length > 4) {
      return { success: false, error: 'Defense team must have 1-4 monsters' };
    }

    const state = this.getPlayerState(userId);
    state.defenseTeam = monsterIds;
    return { success: true };
  }

  /**
   * Get weekly rewards
   */
  public getWeeklyRewards(tier: ArenaTier): ArenaReward[] {
    const baseRewards: Record<ArenaTier, ArenaReward[]> = {
      bronze: [{ type: 'crystal', amount: 50 }, { type: 'gold', amount: 10000 }],
      silver: [{ type: 'crystal', amount: 75 }, { type: 'gold', amount: 20000 }],
      gold: [{ type: 'crystal', amount: 100 }, { type: 'gold', amount: 35000 }],
      diamond: [{ type: 'crystal', amount: 150 }, { type: 'gold', amount: 50000 }],
      legend: [{ type: 'crystal', amount: 200 }, { type: 'gold', amount: 75000 }],
    };
    return baseRewards[tier];
  }

  /**
   * Claim weekly rewards
   */
  public claimWeeklyRewards(userId: string): { success: boolean; rewards?: ArenaReward[]; error?: string } {
    const state = this.getPlayerState(userId);
    const rewards = this.getWeeklyRewards(state.tier);

    // Reset weekly stats
    state.weeklyBattles = 0;
    state.weeklyWins = 0;

    return { success: true, rewards };
  }
}

// Export singleton
export const arenaService = new ArenaService();
