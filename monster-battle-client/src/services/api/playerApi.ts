import apiClient from './client';
import type { Player, PlayerMonster, PlayerRune } from '../../types';

interface ProfileResponse {
  player: Player;
}

interface ResourcesResponse {
  crystals: number;
  gold: number;
  energy: number;
  maxEnergy: number;
  energyRegenAt: string;
}

interface InventoryResponse {
  monsters: PlayerMonster[];
  runes: PlayerRune[];
}

export const playerApi = {
  async getProfile(): Promise<Player> {
    const response = await apiClient.get<ProfileResponse>('/player/profile');
    return response.data.player;
  },

  async getResources(): Promise<ResourcesResponse> {
    const response = await apiClient.get<ResourcesResponse>('/player/resources');
    return response.data;
  },

  async getInventory(): Promise<InventoryResponse> {
    const response = await apiClient.get<InventoryResponse>('/player/inventory');
    return response.data;
  },
};

export default playerApi;
