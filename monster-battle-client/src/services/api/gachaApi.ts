import apiClient from './client';
import type { GachaBanner, GachaPullResult, PityState } from '../../types';

interface BannersResponse {
  banners: GachaBanner[];
}

interface BannerDetailResponse {
  banner: GachaBanner;
  rates: {
    ssr: string;
    sr: string;
    rare: string;
    common: string;
    softPity: string;
    hardPity: string;
  };
}

interface PityResponse {
  pityState: PityState;
  info: {
    currentPity: number;
    pullsToSoftPity: number;
    pullsToHardPity: number;
    currentRate: number;
    guaranteedFeatured: boolean;
  };
}

interface PullResponse {
  result: GachaPullResult;
  newCrystals: number;
}

interface HistoryResponse {
  history: Array<{
    templateId: string;
    rarity: string;
    wasGuaranteed: boolean;
    pullNumber: number;
    bannerId: string;
    bannerName: string;
    pulledAt: string;
  }>;
  total: number;
  page: number;
  totalPages: number;
}

export const gachaApi = {
  async getBanners(): Promise<GachaBanner[]> {
    const response = await apiClient.get<BannersResponse>('/gacha/banners');
    return response.data.banners;
  },

  async getBannerDetail(bannerId: string): Promise<BannerDetailResponse> {
    const response = await apiClient.get<BannerDetailResponse>(`/gacha/banners/${bannerId}`);
    return response.data;
  },

  async getPityState(bannerType: string = 'standard'): Promise<PityResponse> {
    const response = await apiClient.get<PityResponse>('/gacha/pity', {
      params: { bannerType },
    });
    return response.data;
  },

  async pull(bannerId: string, pullCount: 1 | 10): Promise<PullResponse> {
    const response = await apiClient.post<PullResponse>('/gacha/pull', {
      bannerId,
      pullCount,
    });
    return response.data;
  },

  async getHistory(page: number = 1, limit: number = 20): Promise<HistoryResponse> {
    const response = await apiClient.get<HistoryResponse>('/gacha/history', {
      params: { page, limit },
    });
    return response.data;
  },
};

export default gachaApi;
