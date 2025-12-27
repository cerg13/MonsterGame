/**
 * Rune Service
 * Handles Rune API calls
 */

import { apiClient } from './apiClient';
import type { PlayerRune } from '../../types/player';

export interface RuneUpgradeResult {
  success: boolean;
  upgraded: boolean;
  newLevel?: number;
  newMainStatValue?: number;
  newSubStat?: { stat: string; value: number };
  cost?: number;
}

export const runeService = {
  /**
   * Get all runes
   */
  async getRunes(): Promise<{ success: boolean; runes?: PlayerRune[]; error?: string }> {
    const response = await apiClient.get<{ runes: PlayerRune[] }>('/runes');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, runes: response.data?.runes };
  },

  /**
   * Get runes for specific monster
   */
  async getMonsterRunes(monsterId: string): Promise<{ success: boolean; runes?: PlayerRune[]; error?: string }> {
    const response = await apiClient.get<{ runes: PlayerRune[] }>(`/runes/monster/${monsterId}`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, runes: response.data?.runes };
  },

  /**
   * Upgrade rune
   */
  async upgradeRune(runeId: string): Promise<{ success: boolean; result?: RuneUpgradeResult; error?: string }> {
    const response = await apiClient.post<RuneUpgradeResult>(`/runes/${runeId}/upgrade`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, result: response.data };
  },

  /**
   * Equip rune to monster
   */
  async equipRune(runeId: string, monsterId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post(`/runes/${runeId}/equip`, { monsterId });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  /**
   * Unequip rune
   */
  async unequipRune(runeId: string): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post(`/runes/${runeId}/unequip`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  /**
   * Sell rune
   */
  async sellRune(runeId: string): Promise<{ success: boolean; gold?: number; error?: string }> {
    const response = await apiClient.delete<{ gold: number }>(`/runes/${runeId}`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, gold: response.data?.gold };
  },
};
