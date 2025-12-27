/**
 * Player Service
 * Handles Player API calls
 */

import { apiClient } from './apiClient';
import type { Player, PlayerMonster, PlayerRune } from '../../types/player';

export interface PlayerProfile {
  id: string;
  username: string;
  email: string;
  crystals: number;
  gold: number;
  energy: number;
  maxEnergy: number;
  level: number;
  experience: number;
  arenaRank: number;
  arenaPoints: number;
  arenaTier: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  createdAt: string;
  lastLoginAt: string;
  loginStreak: number;
}

export interface PlayerResources {
  crystals: number;
  gold: number;
  energy: number;
  maxEnergy: number;
  energyRegenAt: string;
}

export interface PlayerInventory {
  monsters: PlayerMonster[];
  runes: PlayerRune[];
}

export const playerService = {
  /**
   * Get player profile
   */
  async getProfile(): Promise<{ success: boolean; player?: PlayerProfile; error?: string }> {
    const response = await apiClient.get<{ player: PlayerProfile }>('/player/profile');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, player: response.data?.player };
  },

  /**
   * Get player resources
   */
  async getResources(): Promise<{ success: boolean; resources?: PlayerResources; error?: string }> {
    const response = await apiClient.get<PlayerResources>('/player/resources');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, resources: response.data };
  },

  /**
   * Get player inventory
   */
  async getInventory(): Promise<{ success: boolean; inventory?: PlayerInventory; error?: string }> {
    const response = await apiClient.get<PlayerInventory>('/player/inventory');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, inventory: response.data };
  },

  /**
   * Spend energy
   */
  async spendEnergy(amount: number): Promise<{ success: boolean; newEnergy?: number; error?: string }> {
    const response = await apiClient.post<{ energy: number }>('/player/energy/spend', { amount });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, newEnergy: response.data?.energy };
  },

  /**
   * Spend gold
   */
  async spendGold(amount: number): Promise<{ success: boolean; newGold?: number; error?: string }> {
    const response = await apiClient.post<{ gold: number }>('/player/gold/spend', { amount });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, newGold: response.data?.gold };
  },

  /**
   * Spend crystals
   */
  async spendCrystals(amount: number): Promise<{ success: boolean; newCrystals?: number; error?: string }> {
    const response = await apiClient.post<{ crystals: number }>('/player/crystals/spend', { amount });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, newCrystals: response.data?.crystals };
  },
};
