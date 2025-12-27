import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Daily reward configuration for 7-day cycle
export interface DailyReward {
  day: number;
  type: 'crystals' | 'gold' | 'energy' | 'summon_scroll' | 'mystical_scroll' | 'devilmon';
  amount: number;
  label: string;
  icon: string;
}

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, type: 'crystals', amount: 50, label: '50 Crystals', icon: '💎' },
  { day: 2, type: 'gold', amount: 10000, label: '10,000 Gold', icon: '🪙' },
  { day: 3, type: 'energy', amount: 50, label: '50 Energy', icon: '⚡' },
  { day: 4, type: 'crystals', amount: 100, label: '100 Crystals', icon: '💎' },
  { day: 5, type: 'summon_scroll', amount: 3, label: '3 Summon Scrolls', icon: '📜' },
  { day: 6, type: 'gold', amount: 50000, label: '50,000 Gold', icon: '🪙' },
  { day: 7, type: 'mystical_scroll', amount: 1, label: 'Mystical Scroll', icon: '✨' },
];

// Monthly milestone rewards (every 7 days)
export const MILESTONE_REWARDS: DailyReward[] = [
  { day: 7, type: 'mystical_scroll', amount: 1, label: 'Mystical Scroll', icon: '✨' },
  { day: 14, type: 'crystals', amount: 300, label: '300 Crystals', icon: '💎' },
  { day: 21, type: 'mystical_scroll', amount: 2, label: '2 Mystical Scrolls', icon: '✨' },
  { day: 28, type: 'devilmon', amount: 1, label: 'Devilmon', icon: '😈' },
];

interface DailyRewardState {
  // Streak tracking
  currentStreak: number;
  totalDaysLoggedIn: number;
  lastClaimDate: string | null;

  // Today's status
  hasClaimedToday: boolean;

  // Actions
  claimDailyReward: () => DailyReward | null;
  checkAndResetStreak: () => void;
  canClaimToday: () => boolean;
  getTodayReward: () => DailyReward;
  getNextMilestone: () => { day: number; reward: DailyReward } | null;
}

// Helper to get today's date as string (YYYY-MM-DD)
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to check if date is yesterday
const isYesterday = (dateString: string) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateString === yesterday.toISOString().split('T')[0];
};

// Helper to check if date is today
const isToday = (dateString: string) => {
  return dateString === getTodayString();
};

export const useDailyRewardStore = create<DailyRewardState>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      totalDaysLoggedIn: 0,
      lastClaimDate: null,
      hasClaimedToday: false,

      checkAndResetStreak: () => {
        const state = get();
        const today = getTodayString();

        // If already claimed today, just update hasClaimedToday
        if (state.lastClaimDate && isToday(state.lastClaimDate)) {
          set({ hasClaimedToday: true });
          return;
        }

        // If last claim was yesterday, keep the streak
        if (state.lastClaimDate && isYesterday(state.lastClaimDate)) {
          set({ hasClaimedToday: false });
          return;
        }

        // If more than 1 day passed, reset streak
        if (state.lastClaimDate && !isToday(state.lastClaimDate) && !isYesterday(state.lastClaimDate)) {
          set({ currentStreak: 0, hasClaimedToday: false });
          return;
        }

        // First time or no last claim
        set({ hasClaimedToday: false });
      },

      canClaimToday: () => {
        const state = get();
        if (!state.lastClaimDate) return true;
        return !isToday(state.lastClaimDate);
      },

      getTodayReward: () => {
        const state = get();
        // Rewards cycle through 7 days
        const dayInCycle = (state.currentStreak % 7) + 1;
        return DAILY_REWARDS[dayInCycle - 1];
      },

      getNextMilestone: () => {
        const state = get();
        const nextMilestoneDay = Math.ceil((state.totalDaysLoggedIn + 1) / 7) * 7;
        const milestoneIndex = Math.floor(nextMilestoneDay / 7) - 1;

        if (milestoneIndex >= 0 && milestoneIndex < MILESTONE_REWARDS.length) {
          return {
            day: nextMilestoneDay,
            reward: MILESTONE_REWARDS[milestoneIndex % MILESTONE_REWARDS.length],
          };
        }

        // Cycle through milestones after 28 days
        return {
          day: nextMilestoneDay,
          reward: MILESTONE_REWARDS[(milestoneIndex) % MILESTONE_REWARDS.length],
        };
      },

      claimDailyReward: () => {
        const state = get();

        if (!state.canClaimToday()) {
          return null;
        }

        const today = getTodayString();
        const reward = state.getTodayReward();

        // Check if yesterday was claimed (to continue streak)
        const continueStreak = state.lastClaimDate && isYesterday(state.lastClaimDate);

        set({
          currentStreak: continueStreak ? state.currentStreak + 1 : 1,
          totalDaysLoggedIn: state.totalDaysLoggedIn + 1,
          lastClaimDate: today,
          hasClaimedToday: true,
        });

        return reward;
      },
    }),
    {
      name: 'monster-battle-daily-rewards',
    }
  )
);

// Selectors
export const selectCurrentStreak = (state: DailyRewardState) => state.currentStreak;
export const selectTotalDaysLoggedIn = (state: DailyRewardState) => state.totalDaysLoggedIn;
export const selectHasClaimedToday = (state: DailyRewardState) => state.hasClaimedToday;
