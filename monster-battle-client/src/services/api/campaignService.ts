/**
 * Campaign Service
 * Handles Campaign API calls
 */

import { apiClient } from './apiClient';

export interface CampaignRegion {
  id: string;
  name: string;
  description: string;
  requiredLevel: number;
  stages: CampaignStage[];
  isUnlocked: boolean;
}

export interface CampaignStage {
  id: string;
  regionId: string;
  stageNumber: number;
  name: string;
  difficulty: 'normal' | 'hard' | 'hell';
  energyCost: number;
  enemies: StageEnemy[];
  rewards: StageReward[];
  firstClearRewards: StageReward[];
  stars: number;
  cleared: boolean;
}

export interface StageEnemy {
  templateId: string;
  level: number;
  isBoss: boolean;
}

export interface StageReward {
  type: string;
  amount: number;
  chance: number;
}

export interface CampaignProgress {
  userId: string;
  unlockedRegions: string[];
  stageProgress: Record<string, { stars: number; cleared: boolean; clearCount: number }>;
  lastPlayedStage: string | null;
}

export const campaignService = {
  /**
   * Get all regions
   */
  async getRegions(): Promise<{ success: boolean; regions?: CampaignRegion[]; error?: string }> {
    const response = await apiClient.get<{ regions: CampaignRegion[] }>('/campaign/regions');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, regions: response.data?.regions };
  },

  /**
   * Get specific region
   */
  async getRegion(regionId: string): Promise<{ success: boolean; region?: CampaignRegion; error?: string }> {
    const response = await apiClient.get<{ region: CampaignRegion }>(`/campaign/regions/${regionId}`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, region: response.data?.region };
  },

  /**
   * Get region stars
   */
  async getRegionStars(regionId: string): Promise<{ success: boolean; earned?: number; total?: number; error?: string }> {
    const response = await apiClient.get<{ earned: number; total: number }>(`/campaign/regions/${regionId}/stars`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, earned: response.data?.earned, total: response.data?.total };
  },

  /**
   * Get stage
   */
  async getStage(stageId: string): Promise<{ success: boolean; stage?: CampaignStage; error?: string }> {
    const response = await apiClient.get<{ stage: CampaignStage }>(`/campaign/stages/${stageId}`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, stage: response.data?.stage };
  },

  /**
   * Start stage
   */
  async startStage(stageId: string): Promise<{ success: boolean; stage?: CampaignStage; error?: string }> {
    const response = await apiClient.post<{ stage: CampaignStage }>(`/campaign/stages/${stageId}/start`);

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, stage: response.data?.stage };
  },

  /**
   * Complete stage
   */
  async completeStage(stageId: string, won: boolean, stars: number): Promise<{ success: boolean; rewards?: StageReward[]; firstClear?: boolean; error?: string }> {
    const response = await apiClient.post<{ rewards: StageReward[]; firstClear: boolean }>(`/campaign/stages/${stageId}/complete`, { won, stars });

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, rewards: response.data?.rewards, firstClear: response.data?.firstClear };
  },

  /**
   * Get player progress
   */
  async getProgress(): Promise<{ success: boolean; progress?: CampaignProgress; error?: string }> {
    const response = await apiClient.get<{ progress: CampaignProgress }>('/campaign/progress');

    if (response.error) {
      return { success: false, error: response.error };
    }

    return { success: true, progress: response.data?.progress };
  },
};
