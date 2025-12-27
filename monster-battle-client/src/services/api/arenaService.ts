/**
 * Arena Service
 * Handles Arena API calls
 */

import { apiClient } from './apiClient';
import type { ArenaTier } from '../../types/arena';

export interface ArenaState {
  points: number;
  tier: ArenaTier;
  wings: number;
  maxWings: number;
  defenseTeam: string[];
  weeklyBattles: number;
  weeklyWins: number;
}

export interface ArenaOpponent {
  id: string;
  username: string;
  level: number;
  points: number;
  tier: ArenaTier;
  defenseTeamPower: number;
  defenseTeam: {
    templateId: string;
    name: string;
    element: string;
    stars: number;
    level: number;
  }[];
  winRate: number;
  potentialPoints: number;
}

export interface ArenaBattleResult {
  won: boolean;
  pointsChange: number;
  newPoints: number;
  newTier: ArenaTier;
  rewards: { type: string; amount: number }[];
}

export interface ArenaWeeklyReward {
  type: string;
  amount: number;
}

export const arenaService = {
  /**
   * Get arena state
   */
  async getState(): Promise<{ success: boolean; state?: ArenaState; error?: string }> {
    const response = await apiClient.get<ArenaState>('/arena/state');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, state: response.data };
  },

  /**
   * Get opponents list
   */
  async getOpponents(): Promise<{ success: boolean; opponents?: ArenaOpponent[]; error?: string }> {
    const response = await apiClient.get<{ opponents: ArenaOpponent[] }>('/arena/opponents');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, opponents: response.data?.opponents };
  },

  /**
   * Refresh opponents
   */
  async refreshOpponents(): Promise<{ success: boolean; opponents?: ArenaOpponent[]; error?: string }> {
    const response = await apiClient.post<{ opponents: ArenaOpponent[] }>('/arena/opponents/refresh');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, opponents: response.data?.opponents };
  },

  /**
   * Start arena battle
   */
  async startBattle(opponentId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post('/arena/battle/start', { opponentId });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  /**
   * Record battle result
   */
  async recordBattleResult(opponentPoints: number, won: boolean): Promise<{ success: boolean; result?: ArenaBattleResult; error?: string }> {
    const response = await apiClient.post<ArenaBattleResult>('/arena/battle/result', { opponentPoints, won });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, result: response.data };
  },

  /**
   * Set defense team
   */
  async setDefenseTeam(monsterIds: string[]): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post('/arena/defense', { monsterIds });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  /**
   * Get weekly rewards info
   */
  async getWeeklyRewards(): Promise<{ success: boolean; rewards?: ArenaWeeklyReward[]; tier?: ArenaTier; error?: string }> {
    const response = await apiClient.get<{ tier: ArenaTier; rewards: ArenaWeeklyReward[] }>('/arena/rewards/weekly');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, rewards: response.data?.rewards, tier: response.data?.tier };
  },

  /**
   * Claim weekly rewards
   */
  async claimWeeklyRewards(): Promise<{ success: boolean; rewards?: ArenaWeeklyReward[]; error?: string }> {
    const response = await apiClient.post<{ rewards: ArenaWeeklyReward[] }>('/arena/rewards/claim');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, rewards: response.data?.rewards };
  },
};
