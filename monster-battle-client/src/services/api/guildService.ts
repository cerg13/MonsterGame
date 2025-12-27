/**
 * Guild Service
 * Handles Guild API calls
 */

import { apiClient } from './apiClient';
import type { Guild, GuildMember, GuildRank, GuildShopItem } from '../../types/guild';

export interface GuildState {
  guildId: string | null;
  guild: Guild | null;
  myRank: GuildRank | null;
  guildPoints: number;
  weeklyContribution: number;
  checkInStreak: number;
  lastCheckIn: string | null;
  purchasedItems: Record<string, number>;
}

export const guildService = {
  /**
   * Get guild state
   */
  async getState(): Promise<{ success: boolean; state?: GuildState; error?: string }> {
    const response = await apiClient.get<GuildState>('/guild/state');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, state: response.data };
  },

  /**
   * Search guilds
   */
  async searchGuilds(query: string): Promise<{ success: boolean; guilds?: Guild[]; error?: string }> {
    const response = await apiClient.get<{ guilds: Guild[] }>(`/guild/search?q=${encodeURIComponent(query)}`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, guilds: response.data?.guilds };
  },

  /**
   * Get guild by ID
   */
  async getGuild(guildId: string): Promise<{ success: boolean; guild?: Guild; error?: string }> {
    const response = await apiClient.get<{ guild: Guild }>(`/guild/${guildId}`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, guild: response.data?.guild };
  },

  /**
   * Get guild members
   */
  async getMembers(guildId: string): Promise<{ success: boolean; members?: GuildMember[]; error?: string }> {
    const response = await apiClient.get<{ members: GuildMember[] }>(`/guild/${guildId}/members`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, members: response.data?.members };
  },

  /**
   * Join guild
   */
  async joinGuild(guildId: string): Promise<{ success: boolean; guild?: Guild; error?: string }> {
    const response = await apiClient.post<{ guild: Guild }>('/guild/join', { guildId });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, guild: response.data?.guild };
  },

  /**
   * Leave guild
   */
  async leaveGuild(): Promise<{ success: boolean; error?: string }> {
    const response = await apiClient.post('/guild/leave');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true };
  },

  /**
   * Create guild
   */
  async createGuild(name: string, tag: string, description: string, icon: string): Promise<{ success: boolean; guild?: Guild; error?: string }> {
    const response = await apiClient.post<{ guild: Guild }>('/guild/create', { name, tag, description, icon });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, guild: response.data?.guild };
  },

  /**
   * Daily check-in
   */
  async checkIn(): Promise<{ success: boolean; points?: number; bonus?: { type: string; amount: number }; error?: string }> {
    const response = await apiClient.post<{ points: number; bonus?: { type: string; amount: number } }>('/guild/checkin');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, points: response.data?.points, bonus: response.data?.bonus };
  },

  /**
   * Get shop items
   */
  async getShopItems(): Promise<{ success: boolean; items?: GuildShopItem[]; error?: string }> {
    const response = await apiClient.get<{ items: GuildShopItem[] }>('/guild/shop/items');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, items: response.data?.items };
  },

  /**
   * Purchase from shop
   */
  async purchaseItem(itemId: string): Promise<{ success: boolean; item?: GuildShopItem; error?: string }> {
    const response = await apiClient.post<{ item: GuildShopItem }>('/guild/shop/purchase', { itemId });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, item: response.data?.item };
  },
};
