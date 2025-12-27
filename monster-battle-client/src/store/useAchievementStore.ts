import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Achievement categories
export type AchievementCategory = 'combat' | 'collection' | 'progression' | 'social' | 'special';

// Achievement tiers for progressive achievements
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// Reward types
export interface AchievementReward {
  type: 'crystals' | 'gold' | 'energy' | 'summon_scroll' | 'title';
  amount?: number;
  titleId?: string;
}

// Achievement definition
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  tier?: AchievementTier;
  targetValue: number;
  reward: AchievementReward;
  hidden?: boolean; // Hidden until unlocked
}

// Player's achievement progress
export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  completed: boolean;
  completedAt?: Date;
  claimed: boolean;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Combat Achievements
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Win your first battle',
    category: 'combat',
    icon: '⚔️',
    targetValue: 1,
    reward: { type: 'crystals', amount: 50 },
  },
  {
    id: 'warrior_bronze',
    name: 'Novice Warrior',
    description: 'Win 10 battles',
    category: 'combat',
    icon: '🗡️',
    tier: 'bronze',
    targetValue: 10,
    reward: { type: 'crystals', amount: 100 },
  },
  {
    id: 'warrior_silver',
    name: 'Skilled Warrior',
    description: 'Win 50 battles',
    category: 'combat',
    icon: '🗡️',
    tier: 'silver',
    targetValue: 50,
    reward: { type: 'crystals', amount: 200 },
  },
  {
    id: 'warrior_gold',
    name: 'Master Warrior',
    description: 'Win 200 battles',
    category: 'combat',
    icon: '🗡️',
    tier: 'gold',
    targetValue: 200,
    reward: { type: 'crystals', amount: 500 },
  },
  {
    id: 'warrior_platinum',
    name: 'Legendary Warrior',
    description: 'Win 1000 battles',
    category: 'combat',
    icon: '🗡️',
    tier: 'platinum',
    targetValue: 1000,
    reward: { type: 'title', titleId: 'legendary_warrior' },
  },
  {
    id: 'critical_striker',
    name: 'Critical Striker',
    description: 'Land 100 critical hits',
    category: 'combat',
    icon: '💥',
    targetValue: 100,
    reward: { type: 'gold', amount: 50000 },
  },
  {
    id: 'damage_dealer',
    name: 'Damage Dealer',
    description: 'Deal 100,000 total damage',
    category: 'combat',
    icon: '🔥',
    targetValue: 100000,
    reward: { type: 'crystals', amount: 150 },
  },
  {
    id: 'flawless_victory',
    name: 'Flawless Victory',
    description: 'Win a battle without losing any monsters',
    category: 'combat',
    icon: '🏆',
    targetValue: 1,
    reward: { type: 'crystals', amount: 100 },
  },
  {
    id: 'arena_champion',
    name: 'Arena Champion',
    description: 'Win 50 arena battles',
    category: 'combat',
    icon: '🏟️',
    targetValue: 50,
    reward: { type: 'crystals', amount: 300 },
  },

  // Collection Achievements
  {
    id: 'collector_bronze',
    name: 'Monster Collector',
    description: 'Own 10 different monsters',
    category: 'collection',
    icon: '📦',
    tier: 'bronze',
    targetValue: 10,
    reward: { type: 'summon_scroll', amount: 1 },
  },
  {
    id: 'collector_silver',
    name: 'Monster Enthusiast',
    description: 'Own 25 different monsters',
    category: 'collection',
    icon: '📦',
    tier: 'silver',
    targetValue: 25,
    reward: { type: 'crystals', amount: 200 },
  },
  {
    id: 'collector_gold',
    name: 'Monster Master',
    description: 'Own 50 different monsters',
    category: 'collection',
    icon: '📦',
    tier: 'gold',
    targetValue: 50,
    reward: { type: 'crystals', amount: 500 },
  },
  {
    id: 'first_ssr',
    name: 'Lucky Find',
    description: 'Obtain your first SSR monster',
    category: 'collection',
    icon: '⭐',
    targetValue: 1,
    reward: { type: 'crystals', amount: 100 },
  },
  {
    id: 'ssr_collector',
    name: 'SSR Collector',
    description: 'Own 5 SSR monsters',
    category: 'collection',
    icon: '🌟',
    targetValue: 5,
    reward: { type: 'crystals', amount: 300 },
  },
  {
    id: 'element_master_fire',
    name: 'Fire Master',
    description: 'Own 10 fire element monsters',
    category: 'collection',
    icon: '🔥',
    targetValue: 10,
    reward: { type: 'gold', amount: 30000 },
  },
  {
    id: 'element_master_water',
    name: 'Water Master',
    description: 'Own 10 water element monsters',
    category: 'collection',
    icon: '💧',
    targetValue: 10,
    reward: { type: 'gold', amount: 30000 },
  },
  {
    id: 'element_master_wind',
    name: 'Wind Master',
    description: 'Own 10 wind element monsters',
    category: 'collection',
    icon: '🌪️',
    targetValue: 10,
    reward: { type: 'gold', amount: 30000 },
  },
  {
    id: 'rune_collector',
    name: 'Rune Collector',
    description: 'Own 50 runes',
    category: 'collection',
    icon: '🔮',
    targetValue: 50,
    reward: { type: 'gold', amount: 50000 },
  },

  // Progression Achievements
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach player level 10',
    category: 'progression',
    icon: '📈',
    targetValue: 10,
    reward: { type: 'crystals', amount: 100 },
  },
  {
    id: 'level_25',
    name: 'Experienced',
    description: 'Reach player level 25',
    category: 'progression',
    icon: '📈',
    targetValue: 25,
    reward: { type: 'crystals', amount: 200 },
  },
  {
    id: 'level_50',
    name: 'Veteran',
    description: 'Reach player level 50',
    category: 'progression',
    icon: '📈',
    targetValue: 50,
    reward: { type: 'crystals', amount: 500 },
  },
  {
    id: 'max_monster',
    name: 'Monster Trainer',
    description: 'Level a monster to max level',
    category: 'progression',
    icon: '🎓',
    targetValue: 1,
    reward: { type: 'crystals', amount: 150 },
  },
  {
    id: 'awaken_monster',
    name: 'Awakener',
    description: 'Awaken a monster',
    category: 'progression',
    icon: '✨',
    targetValue: 1,
    reward: { type: 'crystals', amount: 100 },
  },
  {
    id: 'campaign_progress',
    name: 'Campaign Hero',
    description: 'Complete 50 campaign stages',
    category: 'progression',
    icon: '🗺️',
    targetValue: 50,
    reward: { type: 'crystals', amount: 200 },
  },
  {
    id: 'perfect_rune',
    name: 'Rune Perfectionist',
    description: 'Upgrade a rune to +15',
    category: 'progression',
    icon: '💎',
    targetValue: 1,
    reward: { type: 'gold', amount: 100000 },
  },

  // Social Achievements
  {
    id: 'guild_member',
    name: 'Team Player',
    description: 'Join a guild',
    category: 'social',
    icon: '🤝',
    targetValue: 1,
    reward: { type: 'crystals', amount: 50 },
  },
  {
    id: 'guild_contributor',
    name: 'Guild Contributor',
    description: 'Donate 10,000 gold to guild',
    category: 'social',
    icon: '💰',
    targetValue: 10000,
    reward: { type: 'crystals', amount: 100 },
  },

  // Special/Hidden Achievements
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win a battle in under 30 seconds',
    category: 'special',
    icon: '⚡',
    targetValue: 1,
    hidden: true,
    reward: { type: 'title', titleId: 'speed_demon' },
  },
  {
    id: 'comeback_king',
    name: 'Comeback King',
    description: 'Win a battle with only 1 monster remaining at under 10% HP',
    category: 'special',
    icon: '👑',
    targetValue: 1,
    hidden: true,
    reward: { type: 'title', titleId: 'comeback_king' },
  },
  {
    id: 'daily_dedication',
    name: 'Daily Dedication',
    description: 'Log in for 30 consecutive days',
    category: 'special',
    icon: '📅',
    targetValue: 30,
    reward: { type: 'crystals', amount: 500 },
  },
  {
    id: 'summoner_luck',
    name: "Summoner's Luck",
    description: 'Get 2 SSR monsters in a single 10-pull',
    category: 'special',
    icon: '🍀',
    targetValue: 1,
    hidden: true,
    reward: { type: 'crystals', amount: 300 },
  },
];

// Player titles
export const TITLES: Record<string, { name: string; color: string }> = {
  legendary_warrior: { name: 'Legendary Warrior', color: '#ffd700' },
  speed_demon: { name: 'Speed Demon', color: '#48dbfb' },
  comeback_king: { name: 'Comeback King', color: '#a55eea' },
};

interface AchievementStore {
  // State
  progress: AchievementProgress[];
  unlockedTitles: string[];
  selectedTitle: string | null;
  newlyCompleted: string[]; // IDs of achievements completed but not yet seen

  // Actions
  updateProgress: (achievementId: string, value: number, absolute?: boolean) => void;
  incrementProgress: (achievementId: string, amount?: number) => void;
  claimReward: (achievementId: string) => AchievementReward | null;
  markAsSeen: (achievementId: string) => void;
  setSelectedTitle: (titleId: string | null) => void;

  // Getters
  getProgress: (achievementId: string) => AchievementProgress | undefined;
  getCompletedCount: () => number;
  getTotalCount: () => number;
  getUnclaimedCount: () => number;
  getCategoryProgress: (category: AchievementCategory) => { completed: number; total: number };
  isCompleted: (achievementId: string) => boolean;
  isClaimed: (achievementId: string) => boolean;
}

export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      progress: [],
      unlockedTitles: [],
      selectedTitle: null,
      newlyCompleted: [],

      updateProgress: (achievementId, value, absolute = false) => {
        set((state) => {
          const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
          if (!achievement) return state;

          const existingProgress = state.progress.find((p) => p.achievementId === achievementId);
          const currentValue = existingProgress?.currentValue ?? 0;
          const newValue = absolute ? value : Math.max(currentValue, value);

          // Check if already completed
          if (existingProgress?.completed) return state;

          const isNowCompleted = newValue >= achievement.targetValue;

          const updatedProgress = existingProgress
            ? state.progress.map((p) =>
                p.achievementId === achievementId
                  ? {
                      ...p,
                      currentValue: newValue,
                      completed: isNowCompleted,
                      completedAt: isNowCompleted ? new Date() : undefined,
                    }
                  : p
              )
            : [
                ...state.progress,
                {
                  achievementId,
                  currentValue: newValue,
                  completed: isNowCompleted,
                  completedAt: isNowCompleted ? new Date() : undefined,
                  claimed: false,
                },
              ];

          const newlyCompleted = isNowCompleted && !existingProgress?.completed
            ? [...state.newlyCompleted, achievementId]
            : state.newlyCompleted;

          return { progress: updatedProgress, newlyCompleted };
        });
      },

      incrementProgress: (achievementId, amount = 1) => {
        const currentProgress = get().getProgress(achievementId);
        const currentValue = currentProgress?.currentValue ?? 0;
        get().updateProgress(achievementId, currentValue + amount, true);
      },

      claimReward: (achievementId) => {
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        const progress = get().getProgress(achievementId);

        if (!achievement || !progress?.completed || progress.claimed) {
          return null;
        }

        set((state) => {
          const updatedProgress = state.progress.map((p) =>
            p.achievementId === achievementId ? { ...p, claimed: true } : p
          );

          // If reward is a title, unlock it
          const unlockedTitles =
            achievement.reward.type === 'title' && achievement.reward.titleId
              ? [...state.unlockedTitles, achievement.reward.titleId]
              : state.unlockedTitles;

          return { progress: updatedProgress, unlockedTitles };
        });

        return achievement.reward;
      },

      markAsSeen: (achievementId) => {
        set((state) => ({
          newlyCompleted: state.newlyCompleted.filter((id) => id !== achievementId),
        }));
      },

      setSelectedTitle: (titleId) => {
        set({ selectedTitle: titleId });
      },

      getProgress: (achievementId) => {
        return get().progress.find((p) => p.achievementId === achievementId);
      },

      getCompletedCount: () => {
        return get().progress.filter((p) => p.completed).length;
      },

      getTotalCount: () => {
        return ACHIEVEMENTS.length;
      },

      getUnclaimedCount: () => {
        return get().progress.filter((p) => p.completed && !p.claimed).length;
      },

      getCategoryProgress: (category) => {
        const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category);
        const completed = get().progress.filter(
          (p) => p.completed && categoryAchievements.some((a) => a.id === p.achievementId)
        ).length;
        return { completed, total: categoryAchievements.length };
      },

      isCompleted: (achievementId) => {
        return get().getProgress(achievementId)?.completed ?? false;
      },

      isClaimed: (achievementId) => {
        return get().getProgress(achievementId)?.claimed ?? false;
      },
    }),
    {
      name: 'monster-battle-achievements',
    }
  )
);

// Selectors
export const selectProgress = (state: AchievementStore) => state.progress;
export const selectUnlockedTitles = (state: AchievementStore) => state.unlockedTitles;
export const selectSelectedTitle = (state: AchievementStore) => state.selectedTitle;
export const selectNewlyCompleted = (state: AchievementStore) => state.newlyCompleted;
export const selectUnclaimedCount = (state: AchievementStore) => state.getUnclaimedCount();
