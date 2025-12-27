import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GuildWar,
  GuildDefense,
  GuildWarAttack as GuildAttack,
  GuildWarStats,
} from '../types/guild';

interface GuildWarState {
  // Current war
  currentWar: GuildWar | null;
  myDefenses: GuildDefense[];
  enemyDefenses: GuildDefense[];
  myAttacks: GuildAttack[];
  stats: GuildWarStats;

  // Actions
  setCurrentWar: (war: GuildWar) => void;
  setDefenses: (defenses: GuildDefense[]) => void;
  setEnemyDefenses: (defenses: GuildDefense[]) => void;
  addAttack: (attack: GuildAttack) => void;
  updateDefense: (defenseId: string, updates: Partial<GuildDefense>) => void;
  useSword: () => boolean; // Returns true if sword was used, false if no swords left
  resetWarData: () => void;

  // Helpers
  canAttack: () => boolean;
  getRemainingDefenses: () => GuildDefense[];
  getWarProgress: () => { guild1: number; guild2: number; guild1Wins: number; guild2Wins: number };
}

const DEFAULT_STATS: GuildWarStats = {
  swordsUsed: 0,
  maxSwords: 3,
  victories: 0,
  defeats: 0,
  totalPoints: 0,
};

export const useGuildWarStore = create<GuildWarState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWar: null,
      myDefenses: [],
      enemyDefenses: [],
      myAttacks: [],
      stats: DEFAULT_STATS,

      setCurrentWar: (war) => set({ currentWar: war }),

      setDefenses: (defenses) => set({ myDefenses: defenses }),

      setEnemyDefenses: (defenses) => set({ enemyDefenses: defenses }),

      addAttack: (attack) => {
        set((state) => ({
          myAttacks: [...state.myAttacks, attack],
          stats: {
            ...state.stats,
            victories: attack.result === 'victory' ? state.stats.victories + 1 : state.stats.victories,
            defeats: attack.result === 'defeat' ? state.stats.defeats + 1 : state.stats.defeats,
            totalPoints: state.stats.totalPoints + attack.pointsEarned,
          },
        }));
      },

      updateDefense: (defenseId, updates) => {
        set((state) => ({
          enemyDefenses: state.enemyDefenses.map((d) =>
            d.guildId === defenseId ? { ...d, ...updates } : d
          ),
        }));
      },

      useSword: () => {
        const state = get();
        if (state.stats.swordsUsed >= state.stats.maxSwords) {
          return false;
        }
        set((state) => ({
          stats: {
            ...state.stats,
            swordsUsed: state.stats.swordsUsed + 1,
          },
        }));
        return true;
      },

      resetWarData: () => {
        set({
          currentWar: null,
          myDefenses: [],
          enemyDefenses: [],
          myAttacks: [],
          stats: DEFAULT_STATS,
        });
      },

      canAttack: () => {
        const state = get();
        return state.stats.swordsUsed < state.stats.maxSwords;
      },

      getRemainingDefenses: () => {
        const state = get();
        return state.enemyDefenses.filter((d) => d.attackCount < 2);
      },

      getWarProgress: () => {
        const state = get();
        const { currentWar, myAttacks } = state;

        if (!currentWar) {
          return { guild1: 0, guild2: 0, guild1Wins: 0, guild2Wins: 0 };
        }

        const guild1Wins = myAttacks.filter((a) => a.result === 'victory').length;
        const guild2Wins = myAttacks.filter((a) => a.result === 'defeat').length;

        return {
          guild1: currentWar.ourScore,
          guild2: currentWar.enemyScore,
          guild1Wins,
          guild2Wins,
        };
      },
    }),
    {
      name: 'monster-battle-guild-war',
      partialize: (state) => ({
        currentWar: state.currentWar,
        myDefenses: state.myDefenses,
        enemyDefenses: state.enemyDefenses,
        myAttacks: state.myAttacks,
        stats: state.stats,
      }),
    }
  )
);

export default useGuildWarStore;
