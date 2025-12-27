import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// VIP Level definitions
export type VipLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface VipLevelConfig {
  name: string;
  minSpending: number;
  lpMultiplier: number;
  maxEnergyBonus: number;
  shopDiscount: number;
}

export const VIP_LEVELS: Record<VipLevel, VipLevelConfig> = {
  bronze: { name: 'Bronze', minSpending: 0, lpMultiplier: 1.0, maxEnergyBonus: 0, shopDiscount: 0 },
  silver: { name: 'Silver', minSpending: 5000, lpMultiplier: 1.1, maxEnergyBonus: 10, shopDiscount: 0 },
  gold: { name: 'Gold', minSpending: 15000, lpMultiplier: 1.25, maxEnergyBonus: 25, shopDiscount: 0.1 },
  platinum: { name: 'Platinum', minSpending: 50000, lpMultiplier: 1.5, maxEnergyBonus: 50, shopDiscount: 0.15 },
  diamond: { name: 'Diamond', minSpending: 150000, lpMultiplier: 2.0, maxEnergyBonus: 100, shopDiscount: 0.2 },
};

// LP Earning configuration
export const LP_CONFIG = {
  visitBonus: 50,
  checkBonuses: [
    { min: 0, max: 500, lp: 100 },
    { min: 500, max: 1500, lp: 250 },
    { min: 1500, max: Infinity, lp: 500 },
  ],
  streakMultipliers: {
    2: 1.1,
    3: 1.2,
    5: 1.3,
    7: 1.5,
  } as Record<number, number>,
  streakBonuses: {
    3: { energy: 20 },
    5: { summonScrolls: 1 },
    7: { mysticalScrolls: 1 },
  } as Record<number, { energy?: number; summonScrolls?: number; mysticalScrolls?: number }>,
};

// LP Shop items
export interface LpShopItem {
  id: string;
  name: string;
  description: string;
  lpCost: number;
  type: 'energy' | 'crystals' | 'gold' | 'summonScroll' | 'mysticalScroll' | 'devilmon' | 'monster';
  amount: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  vipRequired?: VipLevel;
}

export const LP_SHOP_ITEMS: LpShopItem[] = [
  { id: 'energy_30', name: '30 Energy', description: 'Instantly restore 30 energy', lpCost: 100, type: 'energy', amount: 30 },
  { id: 'crystals_50', name: '50 Crystals', description: 'Premium currency for summons', lpCost: 200, type: 'crystals', amount: 50 },
  { id: 'gold_50k', name: '50,000 Gold', description: 'Currency for upgrades', lpCost: 150, type: 'gold', amount: 50000 },
  { id: 'summon_scroll', name: 'Summon Scroll', description: 'Summon a 3-4★ monster', lpCost: 300, type: 'summonScroll', amount: 1, weeklyLimit: 5 },
  { id: 'mystical_scroll', name: 'Mystical Scroll', description: 'Higher chance for rare monsters', lpCost: 1000, type: 'mysticalScroll', amount: 1, weeklyLimit: 2 },
  { id: 'devilmon', name: 'Devilmon', description: 'Upgrade monster skills', lpCost: 3000, type: 'devilmon', amount: 1, monthlyLimit: 2 },
];

// Visit history entry
export interface VisitEntry {
  id: string;
  timestamp: number;
  type: 'visit' | 'receipt' | 'referral' | 'review' | 'social' | 'birthday';
  receiptAmount?: number;
  lpEarned: number;
  description: string;
}

// Shop purchase history
export interface ShopPurchase {
  itemId: string;
  timestamp: number;
  lpSpent: number;
}

interface LoyaltyState {
  // Core loyalty data
  loyaltyPoints: number;
  totalSpending: number;
  vipLevel: VipLevel;

  // Visit tracking
  visitStreak: number;
  lastVisitDate: string | null; // ISO date string (YYYY-MM-DD)
  totalVisits: number;
  visitHistory: VisitEntry[];

  // Purchase tracking
  shopPurchases: ShopPurchase[];

  // Streak bonus tracking
  streakBonusesClaimed: Record<number, boolean>;

  // Actions
  recordVisit: () => { lpEarned: number; newStreak: number; bonuses: typeof LP_CONFIG.streakBonuses[number] | null };
  recordReceipt: (amount: number) => { lpEarned: number };
  recordReferral: () => { lpEarned: number };
  recordReview: (platform: 'google' | 'yandex') => { lpEarned: number };
  recordSocialPost: () => { lpEarned: number };
  recordBirthday: () => { lpEarned: number };

  claimStreakBonus: (streakDay: number) => { success: boolean; bonus: typeof LP_CONFIG.streakBonuses[number] | null };

  purchaseItem: (itemId: string) => { success: boolean; error?: string };
  canPurchaseItem: (itemId: string) => { canPurchase: boolean; reason?: string };

  // Utility
  calculateLpFromReceipt: (amount: number) => number;
  getNextVipLevel: () => VipLevel | null;
  getProgressToNextVip: () => { current: number; required: number; progress: number };

  // Admin/Testing
  addLoyaltyPoints: (amount: number) => void;
  resetStreak: () => void;
}

// Helper to get today's date as ISO string
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Helper to check if two dates are consecutive
function areConsecutiveDays(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

// Helper to calculate VIP level from spending
function calculateVipLevel(totalSpending: number): VipLevel {
  const levels: VipLevel[] = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];
  for (const level of levels) {
    if (totalSpending >= VIP_LEVELS[level].minSpending) {
      return level;
    }
  }
  return 'bronze';
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set, get) => ({
      // Initial state
      loyaltyPoints: 0,
      totalSpending: 0,
      vipLevel: 'bronze',
      visitStreak: 0,
      lastVisitDate: null,
      totalVisits: 0,
      visitHistory: [],
      shopPurchases: [],
      streakBonusesClaimed: {},

      recordVisit: () => {
        const state = get();
        const today = getTodayDate();

        // Check if already visited today
        if (state.lastVisitDate === today) {
          return { lpEarned: 0, newStreak: state.visitStreak, bonuses: null };
        }

        // Calculate streak
        let newStreak = 1;
        if (state.lastVisitDate && areConsecutiveDays(state.lastVisitDate, today)) {
          newStreak = state.visitStreak + 1;
        }

        // Calculate LP with streak multiplier
        const streakMult = LP_CONFIG.streakMultipliers[newStreak] || 1;
        const vipMult = VIP_LEVELS[state.vipLevel].lpMultiplier;
        const lpEarned = Math.floor(LP_CONFIG.visitBonus * streakMult * vipMult);

        // Check for streak bonus
        const streakBonus = LP_CONFIG.streakBonuses[newStreak] || null;

        const entry: VisitEntry = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'visit',
          lpEarned,
          description: `Restaurant visit (Day ${newStreak} streak)`,
        };

        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + lpEarned,
          visitStreak: newStreak,
          lastVisitDate: today,
          totalVisits: state.totalVisits + 1,
          visitHistory: [entry, ...state.visitHistory].slice(0, 100), // Keep last 100 entries
          streakBonusesClaimed: newStreak === 1 ? {} : state.streakBonusesClaimed, // Reset on streak break
        }));

        return { lpEarned, newStreak, bonuses: streakBonus };
      },

      recordReceipt: (amount) => {
        const state = get();
        const lpEarned = state.calculateLpFromReceipt(amount);
        const newTotalSpending = state.totalSpending + amount;
        const newVipLevel = calculateVipLevel(newTotalSpending);

        const entry: VisitEntry = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'receipt',
          receiptAmount: amount,
          lpEarned,
          description: `Receipt: ${amount.toLocaleString()}₽`,
        };

        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + lpEarned,
          totalSpending: newTotalSpending,
          vipLevel: newVipLevel,
          visitHistory: [entry, ...state.visitHistory].slice(0, 100),
        }));

        return { lpEarned };
      },

      recordReferral: () => {
        const state = get();
        const baseLp = 200;
        const vipMult = VIP_LEVELS[state.vipLevel].lpMultiplier;
        const lpEarned = Math.floor(baseLp * vipMult);

        const entry: VisitEntry = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'referral',
          lpEarned,
          description: 'Friend referral bonus',
        };

        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + lpEarned,
          visitHistory: [entry, ...state.visitHistory].slice(0, 100),
        }));

        return { lpEarned };
      },

      recordReview: (platform) => {
        const state = get();
        const baseLp = 300;
        const vipMult = VIP_LEVELS[state.vipLevel].lpMultiplier;
        const lpEarned = Math.floor(baseLp * vipMult);

        const entry: VisitEntry = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'review',
          lpEarned,
          description: `Review on ${platform === 'google' ? 'Google' : 'Yandex'}`,
        };

        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + lpEarned,
          visitHistory: [entry, ...state.visitHistory].slice(0, 100),
        }));

        return { lpEarned };
      },

      recordSocialPost: () => {
        const state = get();
        const baseLp = 150;
        const vipMult = VIP_LEVELS[state.vipLevel].lpMultiplier;
        const lpEarned = Math.floor(baseLp * vipMult);

        const entry: VisitEntry = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'social',
          lpEarned,
          description: 'Social media post',
        };

        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + lpEarned,
          visitHistory: [entry, ...state.visitHistory].slice(0, 100),
        }));

        return { lpEarned };
      },

      recordBirthday: () => {
        const state = get();
        const baseLp = 1000;
        const vipMult = VIP_LEVELS[state.vipLevel].lpMultiplier;
        const lpEarned = Math.floor(baseLp * vipMult);

        const entry: VisitEntry = {
          id: generateId(),
          timestamp: Date.now(),
          type: 'birthday',
          lpEarned,
          description: 'Birthday bonus!',
        };

        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + lpEarned,
          visitHistory: [entry, ...state.visitHistory].slice(0, 100),
        }));

        return { lpEarned };
      },

      claimStreakBonus: (streakDay) => {
        const state = get();

        if (state.visitStreak < streakDay) {
          return { success: false, bonus: null };
        }

        if (state.streakBonusesClaimed[streakDay]) {
          return { success: false, bonus: null };
        }

        const bonus = LP_CONFIG.streakBonuses[streakDay];
        if (!bonus) {
          return { success: false, bonus: null };
        }

        set((state) => ({
          streakBonusesClaimed: { ...state.streakBonusesClaimed, [streakDay]: true },
        }));

        return { success: true, bonus };
      },

      canPurchaseItem: (itemId) => {
        const state = get();
        const item = LP_SHOP_ITEMS.find((i) => i.id === itemId);

        if (!item) {
          return { canPurchase: false, reason: 'Item not found' };
        }

        // Check VIP requirement
        if (item.vipRequired) {
          const vipOrder: VipLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
          const currentIndex = vipOrder.indexOf(state.vipLevel);
          const requiredIndex = vipOrder.indexOf(item.vipRequired);
          if (currentIndex < requiredIndex) {
            return { canPurchase: false, reason: `Requires ${VIP_LEVELS[item.vipRequired].name} VIP` };
          }
        }

        // Apply VIP discount
        const discount = VIP_LEVELS[state.vipLevel].shopDiscount;
        const finalCost = Math.floor(item.lpCost * (1 - discount));

        // Check LP
        if (state.loyaltyPoints < finalCost) {
          return { canPurchase: false, reason: 'Not enough LP' };
        }

        // Check purchase limits
        const now = Date.now();
        const dayStart = new Date().setHours(0, 0, 0, 0);
        const weekStart = new Date().setDate(new Date().getDate() - new Date().getDay());
        const monthStart = new Date().setDate(1);

        const recentPurchases = state.shopPurchases.filter((p) => p.itemId === itemId);

        if (item.dailyLimit) {
          const todayPurchases = recentPurchases.filter((p) => p.timestamp >= dayStart);
          if (todayPurchases.length >= item.dailyLimit) {
            return { canPurchase: false, reason: 'Daily limit reached' };
          }
        }

        if (item.weeklyLimit) {
          const weekPurchases = recentPurchases.filter((p) => p.timestamp >= weekStart);
          if (weekPurchases.length >= item.weeklyLimit) {
            return { canPurchase: false, reason: 'Weekly limit reached' };
          }
        }

        if (item.monthlyLimit) {
          const monthPurchases = recentPurchases.filter((p) => p.timestamp >= monthStart);
          if (monthPurchases.length >= item.monthlyLimit) {
            return { canPurchase: false, reason: 'Monthly limit reached' };
          }
        }

        return { canPurchase: true };
      },

      purchaseItem: (itemId) => {
        const state = get();
        const { canPurchase, reason } = state.canPurchaseItem(itemId);

        if (!canPurchase) {
          return { success: false, error: reason };
        }

        const item = LP_SHOP_ITEMS.find((i) => i.id === itemId)!;
        const discount = VIP_LEVELS[state.vipLevel].shopDiscount;
        const finalCost = Math.floor(item.lpCost * (1 - discount));

        const purchase: ShopPurchase = {
          itemId,
          timestamp: Date.now(),
          lpSpent: finalCost,
        };

        set((state) => ({
          loyaltyPoints: state.loyaltyPoints - finalCost,
          shopPurchases: [purchase, ...state.shopPurchases].slice(0, 500), // Keep last 500 purchases
        }));

        return { success: true };
      },

      calculateLpFromReceipt: (amount) => {
        const state = get();
        let baseLp = LP_CONFIG.visitBonus; // 50 LP for visit

        // Add receipt bonus
        for (const tier of LP_CONFIG.checkBonuses) {
          if (amount >= tier.min && amount < tier.max) {
            baseLp += tier.lp;
            break;
          }
        }

        // Apply streak multiplier
        const streakMult = LP_CONFIG.streakMultipliers[state.visitStreak] || 1;

        // Apply VIP multiplier
        const vipMult = VIP_LEVELS[state.vipLevel].lpMultiplier;

        return Math.floor(baseLp * streakMult * vipMult);
      },

      getNextVipLevel: () => {
        const state = get();
        const vipOrder: VipLevel[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
        const currentIndex = vipOrder.indexOf(state.vipLevel);
        if (currentIndex < vipOrder.length - 1) {
          return vipOrder[currentIndex + 1];
        }
        return null;
      },

      getProgressToNextVip: () => {
        const state = get();
        const nextLevel = state.getNextVipLevel();
        if (!nextLevel) {
          return { current: state.totalSpending, required: state.totalSpending, progress: 100 };
        }

        const currentMin = VIP_LEVELS[state.vipLevel].minSpending;
        const nextMin = VIP_LEVELS[nextLevel].minSpending;
        const progress = Math.min(100, ((state.totalSpending - currentMin) / (nextMin - currentMin)) * 100);

        return {
          current: state.totalSpending,
          required: nextMin,
          progress,
        };
      },

      addLoyaltyPoints: (amount) =>
        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + amount,
        })),

      resetStreak: () =>
        set({
          visitStreak: 0,
          lastVisitDate: null,
          streakBonusesClaimed: {},
        }),
    }),
    {
      name: 'monster-battle-loyalty',
      partialize: (state) => ({
        loyaltyPoints: state.loyaltyPoints,
        totalSpending: state.totalSpending,
        vipLevel: state.vipLevel,
        visitStreak: state.visitStreak,
        lastVisitDate: state.lastVisitDate,
        totalVisits: state.totalVisits,
        visitHistory: state.visitHistory,
        shopPurchases: state.shopPurchases,
        streakBonusesClaimed: state.streakBonusesClaimed,
      }),
    }
  )
);

// Selectors
export const selectLoyaltyPoints = (state: LoyaltyState) => state.loyaltyPoints;
export const selectVipLevel = (state: LoyaltyState) => state.vipLevel;
export const selectVisitStreak = (state: LoyaltyState) => state.visitStreak;
export const selectTotalSpending = (state: LoyaltyState) => state.totalSpending;
export const selectVisitHistory = (state: LoyaltyState) => state.visitHistory;
export const selectTotalVisits = (state: LoyaltyState) => state.totalVisits;
