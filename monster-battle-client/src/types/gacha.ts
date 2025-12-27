import type { Rarity } from './monster';

// Gacha banner definition
export interface GachaBanner {
  id: string;
  name: string;
  type: 'standard' | 'limited' | 'loyalty';
  featuredMonsters: string[];
  pool: GachaPoolEntry[];
  startDate: Date;
  endDate?: Date;
  costPerPull: {
    currency: 'crystal' | 'loyaltyPoints';
    amount: number;
  };
  backgroundImage: string;
  isActive: boolean;
}

export interface GachaPoolEntry {
  templateId: string;
  rarity: Rarity;
  weight: number;
  isFeatured: boolean;
}

// Pity state tracking
export interface PityState {
  bannerId: string;
  bannerType: string;
  currentPity: number;
  guaranteedFeatured: boolean;
  softPityStart: number;
  hardPity: number;
}

// Pull request/response
export interface GachaPullRequest {
  bannerId: string;
  pullCount: 1 | 10;
}

export interface GachaPullResult {
  pulls: GachaPullItem[];
  newPityState: PityState;
  isNewMonster: boolean[];
}

export interface GachaPullItem {
  templateId: string;
  rarity: Rarity;
  wasGuaranteed: boolean;
  pullNumber: number;
}

// Gacha history entry
export interface GachaHistoryEntry {
  id: string;
  bannerId: string;
  bannerName: string;
  templateId: string;
  monsterName: string;
  rarity: Rarity;
  wasGuaranteed: boolean;
  pulledAt: Date;
}

// Gacha rates configuration
export const GACHA_RATES = {
  ssr: 0.008,      // 0.8%
  sr: 0.08,        // 8%
  rare: 0.60,      // 60%
  common: 0.312,   // 31.2%
};

export const PITY_CONFIG = {
  softPityStart: 60,
  hardPity: 70,
  softPityIncrease: 0.025, // +2.5% per pull after soft pity
};

// Calculate effective rate with pity
export function calculateEffectiveSSRRate(currentPity: number): number {
  const { softPityStart, hardPity, softPityIncrease } = PITY_CONFIG;

  if (currentPity >= hardPity) {
    return 1.0;
  }

  if (currentPity >= softPityStart) {
    const extraPulls = currentPity - softPityStart;
    return Math.min(GACHA_RATES.ssr + extraPulls * softPityIncrease, 1.0);
  }

  return GACHA_RATES.ssr;
}
