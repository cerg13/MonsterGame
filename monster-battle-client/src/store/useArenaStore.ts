import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PlayerArenaState,
  ArenaOpponent,
  ArenaBattleLog,
  ArenaBattleResult,
  ArenaTier,
} from '../types/arena';
import {
  createInitialArenaState,
  getTierFromPoints,
  calculatePointsChange,
  ARENA_WINGS,
  ARENA_POINTS,
} from '../types/arena';
import { arenaService } from '../services/api';

interface ArenaState extends PlayerArenaState {
  // Opponents
  opponents: ArenaOpponent[];
  selectedOpponentId: string | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchState: () => Promise<void>;
  refreshOpponents: () => Promise<void>;
  selectOpponent: (id: string | null) => void;
  setDefenseTeam: (monsterIds: string[]) => Promise<{ success: boolean; error?: string }>;

  // Battle actions
  startBattle: (opponentId: string) => Promise<{ canStart: boolean; error?: string }>;
  recordBattleResult: (opponentId: string, result: ArenaBattleResult) => Promise<{
    pointsChange: number;
    newPoints: number;
    newTier: ArenaTier;
  }>;

  // Wings
  useWing: () => boolean;
  regenerateWings: () => void;

  // Rewards
  canClaimWeeklyReward: () => boolean;
  claimWeeklyReward: () => Promise<{ crystals: number; gold: number }>;

  // Reset
  resetArena: () => void;
}

export const useArenaStore = create<ArenaState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...createInitialArenaState(),
      opponents: [],
      selectedOpponentId: null,
      isLoading: false,
      error: null,

      // Fetch arena state from server
      fetchState: async () => {
        set({ isLoading: true, error: null });
        const response = await arenaService.getState();

        if (response.success && response.state) {
          set({
            points: response.state.points,
            tier: response.state.tier,
            wings: response.state.wings,
            defenseTeamIds: response.state.defenseTeam,
            weeklyBattles: response.state.weeklyBattles,
            weeklyWins: response.state.weeklyWins,
            isLoading: false,
          });
        } else {
          set({ isLoading: false, error: response.error || 'Failed to fetch arena state' });
        }
      },

      // Refresh opponent list from server
      refreshOpponents: async () => {
        set({ isLoading: true, error: null });
        const response = await arenaService.refreshOpponents();

        if (response.success && response.opponents) {
          set({
            opponents: response.opponents as ArenaOpponent[],
            isLoading: false,
          });
        } else {
          set({ isLoading: false, error: response.error || 'Failed to refresh opponents' });
        }
      },

      // Select opponent
      selectOpponent: (id) => {
        set({ selectedOpponentId: id });
      },

      // Set defense team via API
      setDefenseTeam: async (monsterIds) => {
        if (monsterIds.length > 4) {
          monsterIds = monsterIds.slice(0, 4);
        }

        const response = await arenaService.setDefenseTeam(monsterIds);

        if (response.success) {
          set({ defenseTeamIds: monsterIds });
          return { success: true };
        }

        return { success: false, error: response.error };
      },

      // Start battle via API
      startBattle: async (opponentId) => {
        const state = get();

        if (state.wings <= 0) {
          return { canStart: false, error: 'No wings available' };
        }

        const opponent = state.opponents.find(o => o.id === opponentId);
        if (!opponent) {
          return { canStart: false, error: 'Opponent not found' };
        }

        const response = await arenaService.startBattle(opponentId);

        if (response.success) {
          return { canStart: true };
        }

        return { canStart: false, error: response.error };
      },

      // Record battle result via API
      recordBattleResult: async (opponentId, result) => {
        const state = get();
        const opponent = state.opponents.find(o => o.id === opponentId);

        if (!opponent) {
          return { pointsChange: 0, newPoints: state.points, newTier: state.tier };
        }

        const won = result === 'victory';
        const response = await arenaService.recordBattleResult(opponent.points, won);

        if (response.success && response.result) {
          const { pointsChange, newPoints, newTier, rewards } = response.result;

          // Create battle log entry
          const logEntry: ArenaBattleLog = {
            id: `battle_${Date.now()}`,
            timestamp: new Date(),
            isAttack: true,
            opponentId: opponent.id,
            opponentName: opponent.username,
            opponentTier: opponent.tier,
            result,
            pointsChange,
            replayAvailable: true,
          };

          set((state) => ({
            points: newPoints,
            tier: newTier,
            wings: state.wings - 1,
            weeklyBattles: state.weeklyBattles + 1,
            weeklyWins: won ? state.weeklyWins + 1 : state.weeklyWins,
            battleLog: [logEntry, ...state.battleLog.slice(0, 49)],
          }));

          return { pointsChange, newPoints, newTier };
        }

        // Fallback to local calculation
        const pointsChange = calculatePointsChange(state.tier, opponent.tier, result);
        const newPoints = Math.max(ARENA_POINTS.minPoints, state.points + pointsChange);
        const newTier = getTierFromPoints(newPoints);

        return { pointsChange, newPoints, newTier };
      },

      // Use a wing
      useWing: () => {
        const state = get();
        if (state.wings <= 0) return false;
        set({ wings: state.wings - 1 });
        return true;
      },

      // Regenerate wings based on time
      regenerateWings: () => {
        const state = get();
        const now = new Date();
        const lastRegen = new Date(state.lastWingRegen);
        const minutesPassed = (now.getTime() - lastRegen.getTime()) / (1000 * 60);
        const wingsToAdd = Math.floor(minutesPassed / ARENA_WINGS.regenMinutes);

        if (wingsToAdd > 0) {
          const newWings = Math.min(ARENA_WINGS.max, state.wings + wingsToAdd);
          set({
            wings: newWings,
            lastWingRegen: now,
          });
        }
      },

      // Check if can claim weekly reward
      canClaimWeeklyReward: () => {
        const state = get();
        if (!state.lastRewardClaim) return true;

        const lastClaim = new Date(state.lastRewardClaim);
        const now = new Date();

        // Check if it's a new week (Monday)
        const getWeekNumber = (d: Date) => {
          const onejan = new Date(d.getFullYear(), 0, 1);
          return Math.ceil(((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7);
        };

        return getWeekNumber(now) !== getWeekNumber(lastClaim) ||
               now.getFullYear() !== lastClaim.getFullYear();
      },

      // Claim weekly reward via API
      claimWeeklyReward: async () => {
        const state = get();

        const response = await arenaService.claimWeeklyRewards();

        if (response.success && response.rewards) {
          // Parse rewards
          let crystals = 0;
          let gold = 0;

          for (const reward of response.rewards) {
            if (reward.type === 'crystal') crystals += reward.amount;
            if (reward.type === 'gold') gold += reward.amount;
          }

          set({
            lastRewardClaim: new Date(),
            weeklyBattles: 0,
            weeklyWins: 0,
          });

          return { crystals, gold };
        }

        // Fallback to local calculation
        const tierRewards: Record<ArenaTier, { crystals: number; gold: number }> = {
          bronze: { crystals: 50, gold: 10000 },
          silver: { crystals: 100, gold: 20000 },
          gold: { crystals: 150, gold: 35000 },
          diamond: { crystals: 250, gold: 50000 },
          legend: { crystals: 400, gold: 75000 },
        };

        const reward = tierRewards[state.tier];

        set({
          lastRewardClaim: new Date(),
          weeklyBattles: 0,
          weeklyWins: 0,
        });

        return reward;
      },

      // Reset arena state
      resetArena: () => {
        set({
          ...createInitialArenaState(),
          opponents: [],
          selectedOpponentId: null,
        });
      },
    }),
    {
      name: 'monster-battle-arena',
      partialize: (state) => ({
        rank: state.rank,
        points: state.points,
        tier: state.tier,
        defenseTeamIds: state.defenseTeamIds,
        wings: state.wings,
        lastWingRegen: state.lastWingRegen,
        weeklyBattles: state.weeklyBattles,
        weeklyWins: state.weeklyWins,
        battleLog: state.battleLog,
        lastRewardClaim: state.lastRewardClaim,
      }),
    }
  )
);

// Selectors
export const selectArenaPoints = (state: ArenaState) => state.points;
export const selectArenaTier = (state: ArenaState) => state.tier;
export const selectArenaWings = (state: ArenaState) => state.wings;
export const selectArenaOpponents = (state: ArenaState) => state.opponents;
export const selectDefenseTeam = (state: ArenaState) => state.defenseTeamIds;
export const selectBattleLog = (state: ArenaState) => state.battleLog;
