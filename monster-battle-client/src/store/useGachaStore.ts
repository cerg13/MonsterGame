import { create } from 'zustand';
import type {
  GachaBanner,
  GachaPullResult,
  GachaPullItem,
  PityState,
} from '../types/gacha';
import {
  GACHA_RATES,
  PITY_CONFIG,
  calculateEffectiveSSRRate,
} from '../types/gacha';
import { monsterTemplates } from '../data/monsters';

interface GachaStore {
  // State
  banners: GachaBanner[];
  currentBanner: GachaBanner | null;
  pityStates: Record<string, PityState>;
  pullHistory: GachaPullItem[];
  lastPullResult: GachaPullResult | null;
  isAnimating: boolean;

  // Actions
  setBanners: (banners: GachaBanner[]) => void;
  selectBanner: (bannerId: string) => void;
  executePull: (count: 1 | 10) => GachaPullResult;
  setPullAnimating: (animating: boolean) => void;
  getPityState: (bannerType: string) => PityState;
}

// Default standard banner
const defaultBanner: GachaBanner = {
  id: 'standard',
  name: 'Standard Summon',
  type: 'standard',
  featuredMonsters: [],
  pool: monsterTemplates.map((m) => ({
    templateId: m.id,
    rarity: m.rarity,
    weight: m.rarity === 'ssr' ? 1 : m.rarity === 'sr' ? 5 : m.rarity === 'rare' ? 20 : 50,
    isFeatured: false,
  })),
  startDate: new Date(),
  costPerPull: { currency: 'crystal', amount: 100 },
  backgroundImage: 'banner_standard.png',
  isActive: true,
};

export const useGachaStore = create<GachaStore>((set, get) => ({
  banners: [defaultBanner],
  currentBanner: defaultBanner,
  pityStates: {},
  pullHistory: [],
  lastPullResult: null,
  isAnimating: false,

  setBanners: (banners) => set({ banners }),

  selectBanner: (bannerId) => {
    const banner = get().banners.find((b) => b.id === bannerId);
    if (banner) {
      set({ currentBanner: banner });
    }
  },

  executePull: (count) => {
    const { currentBanner, pityStates } = get();
    if (!currentBanner) {
      throw new Error('No banner selected');
    }

    const bannerType = currentBanner.type;
    let pityState = pityStates[bannerType] || {
      bannerId: currentBanner.id,
      bannerType,
      currentPity: 0,
      guaranteedFeatured: false,
      softPityStart: PITY_CONFIG.softPityStart,
      hardPity: PITY_CONFIG.hardPity,
    };

    const pulls: GachaPullItem[] = [];
    const isNewMonster: boolean[] = [];

    for (let i = 0; i < count; i++) {
      pityState.currentPity++;

      // Calculate effective SSR rate
      const effectiveSSRRate = calculateEffectiveSSRRate(pityState.currentPity);

      // Roll for rarity
      const roll = Math.random();
      let rarity: 'ssr' | 'sr' | 'rare' | 'common';
      let wasGuaranteed = false;

      if (roll < effectiveSSRRate || pityState.currentPity >= pityState.hardPity) {
        rarity = 'ssr';
        wasGuaranteed = pityState.currentPity >= pityState.hardPity;
        pityState.currentPity = 0; // Reset pity on SSR

        // 50/50 for featured (if applicable)
        if (currentBanner.featuredMonsters.length > 0) {
          if (pityState.guaranteedFeatured) {
            pityState.guaranteedFeatured = false;
          } else if (Math.random() >= 0.5) {
            pityState.guaranteedFeatured = true; // Lost 50/50
          }
        }
      } else if (roll < effectiveSSRRate + GACHA_RATES.sr) {
        rarity = 'sr';
      } else if (roll < effectiveSSRRate + GACHA_RATES.sr + GACHA_RATES.rare) {
        rarity = 'rare';
      } else {
        rarity = 'common';
      }

      // Select monster from pool
      const poolForRarity = currentBanner.pool.filter((p) => p.rarity === rarity);
      const selectedEntry = weightedRandomSelect(poolForRarity);

      pulls.push({
        templateId: selectedEntry.templateId,
        rarity,
        wasGuaranteed,
        pullNumber: pityState.currentPity,
      });

      // Check if new (simplified - would check player's collection)
      isNewMonster.push(Math.random() < 0.3);
    }

    // Update pity state
    const newPityStates = {
      ...pityStates,
      [bannerType]: pityState,
    };

    const result: GachaPullResult = {
      pulls,
      newPityState: pityState,
      isNewMonster,
    };

    set({
      pityStates: newPityStates,
      pullHistory: [...get().pullHistory, ...pulls],
      lastPullResult: result,
    });

    return result;
  },

  setPullAnimating: (animating) => set({ isAnimating: animating }),

  getPityState: (bannerType) => {
    const { pityStates } = get();
    return (
      pityStates[bannerType] || {
        bannerId: '',
        bannerType,
        currentPity: 0,
        guaranteedFeatured: false,
        softPityStart: PITY_CONFIG.softPityStart,
        hardPity: PITY_CONFIG.hardPity,
      }
    );
  },
}));

// Helper function for weighted random selection
function weightedRandomSelect<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }

  return items[items.length - 1];
}

// Selectors
export const selectCurrentBanner = (state: GachaStore) => state.currentBanner;
export const selectBanners = (state: GachaStore) => state.banners;
export const selectLastPullResult = (state: GachaStore) => state.lastPullResult;
export const selectIsAnimating = (state: GachaStore) => state.isAnimating;
export const selectPullHistory = (state: GachaStore) => state.pullHistory;
