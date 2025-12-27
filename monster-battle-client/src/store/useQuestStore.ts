import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Quest types
export type QuestType = 'daily' | 'weekly' | 'story' | 'event';
export type QuestCategory = 'battle' | 'summon' | 'upgrade' | 'explore' | 'social' | 'special';

// Quest reward
export interface QuestReward {
  type: 'crystals' | 'gold' | 'energy' | 'summon_scroll' | 'exp';
  amount: number;
}

// Quest definition
export interface Quest {
  id: string;
  type: QuestType;
  category: QuestCategory;
  name: string;
  description: string;
  icon: string;
  targetValue: number;
  rewards: QuestReward[];
  // For story quests - chain requirements
  prerequisiteQuestId?: string;
  chapter?: number;
}

// Player's quest progress
export interface QuestProgress {
  questId: string;
  currentValue: number;
  completed: boolean;
  claimed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

// Daily quest templates (randomly selected each day)
const DAILY_QUEST_TEMPLATES: Omit<Quest, 'id'>[] = [
  // Battle quests
  {
    type: 'daily',
    category: 'battle',
    name: 'Battle Ready',
    description: 'Win 3 battles',
    icon: '⚔️',
    targetValue: 3,
    rewards: [{ type: 'crystals', amount: 20 }],
  },
  {
    type: 'daily',
    category: 'battle',
    name: 'Warrior Spirit',
    description: 'Win 5 battles',
    icon: '⚔️',
    targetValue: 5,
    rewards: [{ type: 'crystals', amount: 30 }],
  },
  {
    type: 'daily',
    category: 'battle',
    name: 'Arena Fighter',
    description: 'Complete 3 arena battles',
    icon: '🏟️',
    targetValue: 3,
    rewards: [{ type: 'crystals', amount: 25 }],
  },
  {
    type: 'daily',
    category: 'battle',
    name: 'Campaign Adventurer',
    description: 'Complete 5 campaign stages',
    icon: '🗺️',
    targetValue: 5,
    rewards: [{ type: 'energy', amount: 30 }],
  },
  {
    type: 'daily',
    category: 'battle',
    name: 'Critical Master',
    description: 'Land 10 critical hits',
    icon: '💥',
    targetValue: 10,
    rewards: [{ type: 'gold', amount: 10000 }],
  },
  // Summon quests
  {
    type: 'daily',
    category: 'summon',
    name: 'Lucky Draw',
    description: 'Perform 1 summon',
    icon: '🎰',
    targetValue: 1,
    rewards: [{ type: 'gold', amount: 5000 }],
  },
  {
    type: 'daily',
    category: 'summon',
    name: 'Summoner',
    description: 'Perform 3 summons',
    icon: '✨',
    targetValue: 3,
    rewards: [{ type: 'crystals', amount: 15 }],
  },
  // Upgrade quests
  {
    type: 'daily',
    category: 'upgrade',
    name: 'Power Up',
    description: 'Upgrade a rune',
    icon: '⬆️',
    targetValue: 1,
    rewards: [{ type: 'gold', amount: 8000 }],
  },
  {
    type: 'daily',
    category: 'upgrade',
    name: 'Monster Trainer',
    description: 'Level up a monster',
    icon: '📈',
    targetValue: 1,
    rewards: [{ type: 'exp', amount: 500 }],
  },
  // Explore quests
  {
    type: 'daily',
    category: 'explore',
    name: 'Daily Login',
    description: 'Claim daily reward',
    icon: '📅',
    targetValue: 1,
    rewards: [{ type: 'gold', amount: 3000 }],
  },
  {
    type: 'daily',
    category: 'explore',
    name: 'Energy Spender',
    description: 'Use 50 energy',
    icon: '⚡',
    targetValue: 50,
    rewards: [{ type: 'crystals', amount: 10 }],
  },
  // Social quests
  {
    type: 'daily',
    category: 'social',
    name: 'Guild Supporter',
    description: 'Donate to guild',
    icon: '🤝',
    targetValue: 1,
    rewards: [{ type: 'gold', amount: 5000 }],
  },
];

// Weekly quest definitions
export const WEEKLY_QUESTS: Quest[] = [
  {
    id: 'weekly_battles',
    type: 'weekly',
    category: 'battle',
    name: 'Weekly Warrior',
    description: 'Win 30 battles this week',
    icon: '🗡️',
    targetValue: 30,
    rewards: [
      { type: 'crystals', amount: 100 },
      { type: 'gold', amount: 50000 },
    ],
  },
  {
    id: 'weekly_arena',
    type: 'weekly',
    category: 'battle',
    name: 'Arena Champion',
    description: 'Complete 20 arena battles',
    icon: '🏆',
    targetValue: 20,
    rewards: [
      { type: 'crystals', amount: 150 },
    ],
  },
  {
    id: 'weekly_campaign',
    type: 'weekly',
    category: 'explore',
    name: 'Campaign Hero',
    description: 'Complete 50 campaign stages',
    icon: '🗺️',
    targetValue: 50,
    rewards: [
      { type: 'crystals', amount: 80 },
      { type: 'energy', amount: 100 },
    ],
  },
  {
    id: 'weekly_summon',
    type: 'weekly',
    category: 'summon',
    name: 'Summoning Spree',
    description: 'Perform 20 summons',
    icon: '✨',
    targetValue: 20,
    rewards: [
      { type: 'summon_scroll', amount: 3 },
    ],
  },
  {
    id: 'weekly_upgrade',
    type: 'weekly',
    category: 'upgrade',
    name: 'Power Grinder',
    description: 'Upgrade runes 30 times',
    icon: '💪',
    targetValue: 30,
    rewards: [
      { type: 'gold', amount: 100000 },
    ],
  },
  {
    id: 'weekly_login',
    type: 'weekly',
    category: 'explore',
    name: 'Dedicated Player',
    description: 'Log in 7 days',
    icon: '📅',
    targetValue: 7,
    rewards: [
      { type: 'crystals', amount: 50 },
      { type: 'summon_scroll', amount: 1 },
    ],
  },
];

// Story quest chain
export const STORY_QUESTS: Quest[] = [
  // Chapter 1: Beginning
  {
    id: 'story_1_1',
    type: 'story',
    category: 'special',
    name: 'The Journey Begins',
    description: 'Complete your first battle',
    icon: '📖',
    targetValue: 1,
    chapter: 1,
    rewards: [
      { type: 'crystals', amount: 50 },
      { type: 'gold', amount: 10000 },
    ],
  },
  {
    id: 'story_1_2',
    type: 'story',
    category: 'special',
    name: 'Building Your Team',
    description: 'Own 5 monsters',
    icon: '📖',
    targetValue: 5,
    chapter: 1,
    prerequisiteQuestId: 'story_1_1',
    rewards: [
      { type: 'summon_scroll', amount: 3 },
    ],
  },
  {
    id: 'story_1_3',
    type: 'story',
    category: 'special',
    name: 'Equip for Battle',
    description: 'Equip a rune on a monster',
    icon: '📖',
    targetValue: 1,
    chapter: 1,
    prerequisiteQuestId: 'story_1_2',
    rewards: [
      { type: 'gold', amount: 20000 },
    ],
  },
  // Chapter 2: Growth
  {
    id: 'story_2_1',
    type: 'story',
    category: 'special',
    name: 'Rising Power',
    description: 'Level a monster to 20',
    icon: '📖',
    targetValue: 20,
    chapter: 2,
    prerequisiteQuestId: 'story_1_3',
    rewards: [
      { type: 'crystals', amount: 100 },
    ],
  },
  {
    id: 'story_2_2',
    type: 'story',
    category: 'special',
    name: 'Campaign Conqueror',
    description: 'Complete 10 campaign stages',
    icon: '📖',
    targetValue: 10,
    chapter: 2,
    prerequisiteQuestId: 'story_2_1',
    rewards: [
      { type: 'energy', amount: 100 },
      { type: 'gold', amount: 30000 },
    ],
  },
  {
    id: 'story_2_3',
    type: 'story',
    category: 'special',
    name: 'Arena Challenger',
    description: 'Win 5 arena battles',
    icon: '📖',
    targetValue: 5,
    chapter: 2,
    prerequisiteQuestId: 'story_2_2',
    rewards: [
      { type: 'crystals', amount: 150 },
    ],
  },
  // Chapter 3: Mastery
  {
    id: 'story_3_1',
    type: 'story',
    category: 'special',
    name: 'Collector',
    description: 'Own 15 different monsters',
    icon: '📖',
    targetValue: 15,
    chapter: 3,
    prerequisiteQuestId: 'story_2_3',
    rewards: [
      { type: 'summon_scroll', amount: 5 },
    ],
  },
  {
    id: 'story_3_2',
    type: 'story',
    category: 'special',
    name: 'Rune Master',
    description: 'Upgrade a rune to +12',
    icon: '📖',
    targetValue: 12,
    chapter: 3,
    prerequisiteQuestId: 'story_3_1',
    rewards: [
      { type: 'gold', amount: 100000 },
    ],
  },
  {
    id: 'story_3_3',
    type: 'story',
    category: 'special',
    name: 'Guild Member',
    description: 'Join a guild',
    icon: '📖',
    targetValue: 1,
    chapter: 3,
    prerequisiteQuestId: 'story_3_2',
    rewards: [
      { type: 'crystals', amount: 200 },
      { type: 'summon_scroll', amount: 3 },
    ],
  },
];

// Helper to get today's date string
const getTodayString = () => new Date().toISOString().split('T')[0];

// Helper to get this week's start (Monday)
const getWeekStartString = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

// Generate random daily quests
function generateDailyQuests(seed: string): Quest[] {
  // Use date as seed for consistent daily quests
  const seedNum = seed.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const shuffled = [...DAILY_QUEST_TEMPLATES].sort((a, b) => {
    const aHash = (a.name.charCodeAt(0) * seedNum) % 100;
    const bHash = (b.name.charCodeAt(0) * seedNum) % 100;
    return aHash - bHash;
  });

  // Select 5 daily quests
  return shuffled.slice(0, 5).map((template, index) => ({
    ...template,
    id: `daily_${seed}_${index}`,
  }));
}

interface QuestStore {
  // State
  dailyQuests: Quest[];
  dailyQuestsDate: string | null;
  weeklyQuestsWeek: string | null;
  progress: QuestProgress[];

  // Actions
  refreshDailyQuests: () => void;
  refreshWeeklyQuests: () => void;
  updateQuestProgress: (questId: string, value: number, absolute?: boolean) => void;
  incrementQuestProgress: (questId: string, amount?: number) => void;
  claimQuestReward: (questId: string) => QuestReward[] | null;

  // Bulk progress updates by category
  trackBattleWin: (isArena?: boolean, isCampaign?: boolean) => void;
  trackCriticalHit: (count?: number) => void;
  trackSummon: (count?: number) => void;
  trackRuneUpgrade: () => void;
  trackMonsterLevelUp: (newLevel: number) => void;
  trackEnergyUse: (amount: number) => void;
  trackDailyLogin: () => void;
  trackGuildDonation: () => void;
  trackRuneEquip: () => void;
  trackMonsterOwned: (count: number) => void;
  trackGuildJoin: () => void;

  // Getters
  getQuestProgress: (questId: string) => QuestProgress | undefined;
  getDailyQuests: () => Quest[];
  getWeeklyQuests: () => Quest[];
  getStoryQuests: () => Quest[];
  getAvailableStoryQuests: () => Quest[];
  getCompletedQuestsCount: (type: QuestType) => number;
  getUnclaimedCount: () => number;
}

export const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      dailyQuests: [],
      dailyQuestsDate: null,
      weeklyQuestsWeek: null,
      progress: [],

      refreshDailyQuests: () => {
        const today = getTodayString();
        const state = get();

        if (state.dailyQuestsDate !== today) {
          const newDailyQuests = generateDailyQuests(today);
          set({
            dailyQuests: newDailyQuests,
            dailyQuestsDate: today,
            // Clear old daily progress
            progress: state.progress.filter(p => !p.questId.startsWith('daily_')),
          });
        }
      },

      refreshWeeklyQuests: () => {
        const weekStart = getWeekStartString();
        const state = get();

        if (state.weeklyQuestsWeek !== weekStart) {
          set({
            weeklyQuestsWeek: weekStart,
            // Clear old weekly progress
            progress: state.progress.filter(p => !p.questId.startsWith('weekly_')),
          });
        }
      },

      updateQuestProgress: (questId, value, absolute = false) => {
        set((state) => {
          const allQuests = [...state.dailyQuests, ...WEEKLY_QUESTS, ...STORY_QUESTS];
          const quest = allQuests.find(q => q.id === questId);
          if (!quest) return state;

          const existingProgress = state.progress.find(p => p.questId === questId);
          const currentValue = existingProgress?.currentValue ?? 0;
          const newValue = absolute ? value : Math.max(currentValue, value);

          if (existingProgress?.completed) return state;

          const isNowCompleted = newValue >= quest.targetValue;

          const updatedProgress = existingProgress
            ? state.progress.map(p =>
                p.questId === questId
                  ? {
                      ...p,
                      currentValue: Math.min(newValue, quest.targetValue),
                      completed: isNowCompleted,
                      completedAt: isNowCompleted ? new Date() : undefined,
                    }
                  : p
              )
            : [
                ...state.progress,
                {
                  questId,
                  currentValue: Math.min(newValue, quest.targetValue),
                  completed: isNowCompleted,
                  completedAt: isNowCompleted ? new Date() : undefined,
                  claimed: false,
                  startedAt: new Date(),
                },
              ];

          return { progress: updatedProgress };
        });
      },

      incrementQuestProgress: (questId, amount = 1) => {
        const currentProgress = get().getQuestProgress(questId);
        const currentValue = currentProgress?.currentValue ?? 0;
        get().updateQuestProgress(questId, currentValue + amount, true);
      },

      claimQuestReward: (questId) => {
        const allQuests = [...get().dailyQuests, ...WEEKLY_QUESTS, ...STORY_QUESTS];
        const quest = allQuests.find(q => q.id === questId);
        const progress = get().getQuestProgress(questId);

        if (!quest || !progress?.completed || progress.claimed) {
          return null;
        }

        set((state) => ({
          progress: state.progress.map(p =>
            p.questId === questId ? { ...p, claimed: true } : p
          ),
        }));

        return quest.rewards;
      },

      // Tracking functions
      trackBattleWin: (isArena = false, isCampaign = false) => {
        const state = get();

        // Update all relevant quests
        state.dailyQuests.forEach(q => {
          if (q.category === 'battle') {
            if (q.name.includes('Arena') && isArena) {
              state.incrementQuestProgress(q.id);
            } else if (q.name.includes('Campaign') && isCampaign) {
              state.incrementQuestProgress(q.id);
            } else if (!q.name.includes('Arena') && !q.name.includes('Campaign')) {
              state.incrementQuestProgress(q.id);
            }
          }
        });

        // Weekly quests
        if (isArena) {
          state.incrementQuestProgress('weekly_arena');
        }
        if (isCampaign) {
          state.incrementQuestProgress('weekly_campaign');
        }
        state.incrementQuestProgress('weekly_battles');

        // Story quests
        state.incrementQuestProgress('story_1_1');
        if (isArena) {
          state.incrementQuestProgress('story_2_3');
        }
        if (isCampaign) {
          state.incrementQuestProgress('story_2_2');
        }
      },

      trackCriticalHit: (count = 1) => {
        const state = get();
        state.dailyQuests.forEach(q => {
          if (q.name.includes('Critical')) {
            for (let i = 0; i < count; i++) {
              state.incrementQuestProgress(q.id);
            }
          }
        });
      },

      trackSummon: (count = 1) => {
        const state = get();
        state.dailyQuests.forEach(q => {
          if (q.category === 'summon') {
            for (let i = 0; i < count; i++) {
              state.incrementQuestProgress(q.id);
            }
          }
        });
        for (let i = 0; i < count; i++) {
          state.incrementQuestProgress('weekly_summon');
        }
      },

      trackRuneUpgrade: () => {
        const state = get();
        state.dailyQuests.forEach(q => {
          if (q.name.includes('Power Up') || q.name.includes('Upgrade')) {
            state.incrementQuestProgress(q.id);
          }
        });
        state.incrementQuestProgress('weekly_upgrade');
      },

      trackMonsterLevelUp: (newLevel) => {
        const state = get();
        state.dailyQuests.forEach(q => {
          if (q.name.includes('Monster Trainer')) {
            state.incrementQuestProgress(q.id);
          }
        });
        state.updateQuestProgress('story_2_1', newLevel);
      },

      trackEnergyUse: (amount) => {
        const state = get();
        state.dailyQuests.forEach(q => {
          if (q.name.includes('Energy Spender')) {
            for (let i = 0; i < amount; i++) {
              state.incrementQuestProgress(q.id);
            }
          }
        });
      },

      trackDailyLogin: () => {
        const state = get();
        state.dailyQuests.forEach(q => {
          if (q.name.includes('Daily Login')) {
            state.incrementQuestProgress(q.id);
          }
        });
        state.incrementQuestProgress('weekly_login');
      },

      trackGuildDonation: () => {
        const state = get();
        state.dailyQuests.forEach(q => {
          if (q.name.includes('Guild Supporter')) {
            state.incrementQuestProgress(q.id);
          }
        });
      },

      trackRuneEquip: () => {
        const state = get();
        state.incrementQuestProgress('story_1_3');
      },

      trackMonsterOwned: (count) => {
        const state = get();
        state.updateQuestProgress('story_1_2', count);
        state.updateQuestProgress('story_3_1', count);
      },

      trackGuildJoin: () => {
        const state = get();
        state.incrementQuestProgress('story_3_3');
      },

      // Getters
      getQuestProgress: (questId) => {
        return get().progress.find(p => p.questId === questId);
      },

      getDailyQuests: () => {
        get().refreshDailyQuests();
        return get().dailyQuests;
      },

      getWeeklyQuests: () => {
        get().refreshWeeklyQuests();
        return WEEKLY_QUESTS;
      },

      getStoryQuests: () => STORY_QUESTS,

      getAvailableStoryQuests: () => {
        const progress = get().progress;
        return STORY_QUESTS.filter(quest => {
          // No prerequisite - always available
          if (!quest.prerequisiteQuestId) return true;

          // Check if prerequisite is completed
          const prereqProgress = progress.find(p => p.questId === quest.prerequisiteQuestId);
          return prereqProgress?.completed ?? false;
        });
      },

      getCompletedQuestsCount: (type) => {
        const state = get();
        let quests: Quest[] = [];

        if (type === 'daily') quests = state.dailyQuests;
        else if (type === 'weekly') quests = WEEKLY_QUESTS;
        else if (type === 'story') quests = STORY_QUESTS;

        return state.progress.filter(
          p => p.completed && quests.some(q => q.id === p.questId)
        ).length;
      },

      getUnclaimedCount: () => {
        return get().progress.filter(p => p.completed && !p.claimed).length;
      },
    }),
    {
      name: 'monster-battle-quests',
    }
  )
);

// Selectors
export const selectDailyQuests = (state: QuestStore) => state.getDailyQuests();
export const selectWeeklyQuests = (state: QuestStore) => state.getWeeklyQuests();
export const selectStoryQuests = (state: QuestStore) => state.getStoryQuests();
export const selectQuestProgress = (state: QuestStore) => state.progress;
export const selectUnclaimedQuestCount = (state: QuestStore) => state.getUnclaimedCount();
