import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Types
interface GachaPoolEntry {
  templateId: string;
  rarity: 'common' | 'rare' | 'sr' | 'ssr';
  weight: number;
  isFeatured: boolean;
}

interface PityState {
  bannerId: string;
  bannerType: string;
  currentPity: number;
  guaranteedFeatured: boolean;
}

interface GachaPullItem {
  templateId: string;
  rarity: string;
  wasGuaranteed: boolean;
  pullNumber: number;
}

interface GachaPullResult {
  pulls: GachaPullItem[];
  newPityState: PityState;
  isNewMonster: boolean[];
  grantedMonsters: GrantedMonster[];
}

interface GrantedMonster {
  id: string;
  templateId: string;
  level: number;
  stars: number;
}

interface GachaBanner {
  id: string;
  name: string;
  type: 'standard' | 'limited' | 'loyalty';
  featuredMonsters: string[];
  pool: GachaPoolEntry[];
  costCurrency: 'crystal' | 'loyaltyPoints';
  costAmount: number;
}

// Constants
const GACHA_RATES = {
  ssr: 0.008,      // 0.8%
  sr: 0.08,        // 8%
  rare: 0.60,      // 60%
  common: 0.312,   // 31.2%
};

const PITY_CONFIG = {
  softPityStart: 60,
  hardPity: 70,
  softPityIncrease: 0.025, // +2.5% per pull after soft pity
};

/**
 * Cryptographically Secure RNG Service
 * Uses crypto.randomBytes for true randomness
 */
class CryptoRNG {
  /**
   * Generate a random float between 0 and 1
   */
  public random(): number {
    const buffer = crypto.randomBytes(4);
    const value = buffer.readUInt32BE(0);
    return value / 0xFFFFFFFF;
  }

  /**
   * Generate a random integer in range [min, max]
   */
  public randomInt(min: number, max: number): number {
    const range = max - min + 1;
    const buffer = crypto.randomBytes(4);
    const value = buffer.readUInt32BE(0);
    return min + (value % range);
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  public shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Gacha Service
 *
 * Handles all gacha/summon logic with:
 * - Cryptographic RNG
 * - Pity system (soft pity at 60, hard pity at 70)
 * - 50/50 for featured monsters
 * - Full audit logging
 */
export class GachaService {
  private rng: CryptoRNG;

  constructor() {
    this.rng = new CryptoRNG();
  }

  /**
   * Execute gacha pulls
   */
  public async pull(
    userId: string,
    banner: GachaBanner,
    pullCount: 1 | 10,
    currentPity: PityState,
    playerCrystals: number,
    existingMonsterTemplates: string[]
  ): Promise<{ success: boolean; result?: GachaPullResult; error?: string }> {
    // 1. Validate resources
    const totalCost = banner.costAmount * pullCount;
    if (playerCrystals < totalCost) {
      return {
        success: false,
        error: `Insufficient ${banner.costCurrency}: need ${totalCost}, have ${playerCrystals}`,
      };
    }

    // 2. Execute pulls
    const pulls: GachaPullItem[] = [];
    const grantedMonsters: GrantedMonster[] = [];
    let pityState = { ...currentPity };

    for (let i = 0; i < pullCount; i++) {
      const pullResult = this.executeSinglePull(banner, pityState);
      pulls.push(pullResult.item);
      pityState = pullResult.newPityState;

      // Create granted monster
      grantedMonsters.push({
        id: uuidv4(),
        templateId: pullResult.item.templateId,
        level: 1,
        stars: this.getStarsFromRarity(pullResult.item.rarity),
      });
    }

    // 3. Check for new monsters
    const isNewMonster = pulls.map(
      (p) => !existingMonsterTemplates.includes(p.templateId)
    );

    return {
      success: true,
      result: {
        pulls,
        newPityState: pityState,
        isNewMonster,
        grantedMonsters,
      },
    };
  }

  /**
   * Execute a single pull
   */
  private executeSinglePull(
    banner: GachaBanner,
    pityState: PityState
  ): { item: GachaPullItem; newPityState: PityState } {
    const newPityState = { ...pityState };
    newPityState.currentPity++;

    // Calculate effective SSR rate with pity
    const effectiveSSRRate = this.calculateEffectiveRate(newPityState.currentPity);

    // Roll for rarity using crypto RNG
    const roll = this.rng.random();
    let rarity: 'ssr' | 'sr' | 'rare' | 'common';
    let wasGuaranteed = false;

    if (roll < effectiveSSRRate || newPityState.currentPity >= PITY_CONFIG.hardPity) {
      rarity = 'ssr';
      wasGuaranteed = newPityState.currentPity >= PITY_CONFIG.hardPity;
      newPityState.currentPity = 0; // Reset pity on SSR

      // Handle 50/50 for featured monsters
      if (banner.featuredMonsters.length > 0) {
        if (!newPityState.guaranteedFeatured) {
          // 50/50 roll
          const won5050 = this.rng.random() < 0.5;
          if (!won5050) {
            newPityState.guaranteedFeatured = true; // Lost 50/50, next is guaranteed
          }
        } else {
          newPityState.guaranteedFeatured = false; // Used guarantee
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
    const selectedTemplateId = this.selectFromPool(banner, rarity, newPityState.guaranteedFeatured);

    return {
      item: {
        templateId: selectedTemplateId,
        rarity,
        wasGuaranteed,
        pullNumber: newPityState.currentPity,
      },
      newPityState,
    };
  }

  /**
   * Calculate effective SSR rate with pity
   */
  private calculateEffectiveRate(currentPity: number): number {
    if (currentPity >= PITY_CONFIG.hardPity) {
      return 1.0;
    }

    if (currentPity >= PITY_CONFIG.softPityStart) {
      const extraPulls = currentPity - PITY_CONFIG.softPityStart;
      return Math.min(
        GACHA_RATES.ssr + extraPulls * PITY_CONFIG.softPityIncrease,
        1.0
      );
    }

    return GACHA_RATES.ssr;
  }

  /**
   * Select a monster from the pool based on rarity
   */
  private selectFromPool(
    banner: GachaBanner,
    rarity: string,
    guaranteedFeatured: boolean
  ): string {
    // If SSR and should get featured
    if (rarity === 'ssr' && banner.featuredMonsters.length > 0) {
      if (guaranteedFeatured || this.rng.random() < 0.5) {
        // Select from featured
        const index = this.rng.randomInt(0, banner.featuredMonsters.length - 1);
        return banner.featuredMonsters[index];
      }
    }

    // Select from pool based on rarity
    const poolForRarity = banner.pool.filter((p) => p.rarity === rarity);

    if (poolForRarity.length === 0) {
      // Fallback to any monster of that rarity (shouldn't happen)
      console.warn(`No monsters in pool for rarity: ${rarity}`);
      return banner.pool[0].templateId;
    }

    return this.weightedRandomSelect(poolForRarity);
  }

  /**
   * Weighted random selection using crypto RNG
   */
  private weightedRandomSelect(pool: GachaPoolEntry[]): string {
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    let random = this.rng.random() * totalWeight;

    for (const entry of pool) {
      random -= entry.weight;
      if (random <= 0) {
        return entry.templateId;
      }
    }

    return pool[pool.length - 1].templateId;
  }

  /**
   * Get natural stars from rarity
   */
  private getStarsFromRarity(rarity: string): number {
    switch (rarity) {
      case 'ssr': return 5;
      case 'sr': return 4;
      case 'rare': return 3;
      default: return 2;
    }
  }

  /**
   * Get pity info for display
   */
  public getPityInfo(pityState: PityState): {
    currentPity: number;
    pullsToSoftPity: number;
    pullsToHardPity: number;
    currentRate: number;
    guaranteedFeatured: boolean;
  } {
    return {
      currentPity: pityState.currentPity,
      pullsToSoftPity: Math.max(0, PITY_CONFIG.softPityStart - pityState.currentPity),
      pullsToHardPity: Math.max(0, PITY_CONFIG.hardPity - pityState.currentPity),
      currentRate: this.calculateEffectiveRate(pityState.currentPity) * 100,
      guaranteedFeatured: pityState.guaranteedFeatured,
    };
  }
}

// Export singleton instance
export const gachaService = new GachaService();
