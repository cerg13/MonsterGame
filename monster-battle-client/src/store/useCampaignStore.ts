import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CampaignProgress,
  StageProgress,
  StageRating,
} from '../types/campaign';
import { campaignRegions, getCampaignStage } from '../data/campaign';
import { campaignService } from '../services/api';

interface CampaignState {
  progress: CampaignProgress;
  selectedRegion: string | null;
  selectedStage: string | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProgress: () => Promise<void>;
  initializeProgress: () => void;
  startStage: (stageId: string) => Promise<{ success: boolean; error?: string }>;
  completeStage: (stageId: string, rating: StageRating, clearTime?: number) => Promise<void>;
  claimFirstClear: (stageId: string) => void;
  unlockRegion: (regionId: string) => void;
  selectRegion: (regionId: string | null) => void;
  selectStage: (stageId: string | null) => void;

  // Selectors
  getStageProgress: (stageId: string) => StageProgress | undefined;
  isStageUnlocked: (stageId: string) => boolean;
  isRegionUnlocked: (regionId: string) => boolean;
  getRegionStars: (regionId: string) => number;
}

const initialProgress: CampaignProgress = {
  stages: {},
  unlockedRegions: ['starter_fields'], // First region unlocked by default
  totalStars: 0,
};

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,
      selectedRegion: null,
      selectedStage: null,
      isLoading: false,
      error: null,

      // Fetch progress from server
      fetchProgress: async () => {
        set({ isLoading: true, error: null });
        const response = await campaignService.getProgress();

        if (response.success && response.progress) {
          // Convert server progress format to local format
          const stages: Record<string, StageProgress> = {};
          for (const [stageId, data] of Object.entries(response.progress.stageProgress)) {
            stages[stageId] = {
              stageId,
              completed: data.cleared,
              bestRating: data.stars as StageRating,
              clearCount: data.clearCount,
              firstClearClaimed: data.cleared, // Assume first clear claimed if cleared
            };
          }

          set({
            progress: {
              stages,
              unlockedRegions: response.progress.unlockedRegions,
              totalStars: Object.values(response.progress.stageProgress).reduce(
                (sum, s) => sum + s.stars,
                0
              ),
            },
            isLoading: false,
          });
        } else {
          set({ isLoading: false, error: response.error || 'Failed to fetch progress' });
        }
      },

      initializeProgress: () => {
        set({ progress: initialProgress });
      },

      // Start a stage via API
      startStage: async (stageId) => {
        const response = await campaignService.startStage(stageId);

        if (response.success) {
          return { success: true };
        }

        return { success: false, error: response.error };
      },

      completeStage: async (stageId, rating, clearTime) => {
        // Call API to record completion
        await campaignService.completeStage(stageId, true, rating);

        // Update local state
        set((state) => {
          const currentProgress = state.progress.stages[stageId];
          const isNewCompletion = !currentProgress?.completed;
          const isNewBestRating = !currentProgress || rating > currentProgress.bestRating;

          const starsGained = isNewBestRating
            ? rating - (currentProgress?.bestRating || 0)
            : 0;

          const newStageProgress: StageProgress = {
            stageId,
            completed: true,
            bestRating: isNewBestRating ? rating : currentProgress?.bestRating || rating,
            clearCount: (currentProgress?.clearCount || 0) + 1,
            bestClearTime: clearTime && (!currentProgress?.bestClearTime || clearTime < currentProgress.bestClearTime)
              ? clearTime
              : currentProgress?.bestClearTime,
            firstClearClaimed: currentProgress?.firstClearClaimed || false,
          };

          // Check if we should unlock the next region
          const stage = getCampaignStage(stageId);
          let unlockedRegions = [...state.progress.unlockedRegions];

          if (stage?.bossStage && isNewCompletion) {
            // Find the next region that requires this region
            const nextRegion = campaignRegions.find(
              r => r.unlockRequirements?.previousRegion === stage.regionId
            );
            if (nextRegion && !unlockedRegions.includes(nextRegion.id)) {
              unlockedRegions.push(nextRegion.id);
            }
          }

          return {
            progress: {
              ...state.progress,
              stages: {
                ...state.progress.stages,
                [stageId]: newStageProgress,
              },
              unlockedRegions,
              totalStars: state.progress.totalStars + starsGained,
            },
          };
        });
      },

      claimFirstClear: (stageId) => {
        set((state) => {
          const currentProgress = state.progress.stages[stageId];
          if (!currentProgress || currentProgress.firstClearClaimed) {
            return state;
          }

          return {
            progress: {
              ...state.progress,
              stages: {
                ...state.progress.stages,
                [stageId]: {
                  ...currentProgress,
                  firstClearClaimed: true,
                },
              },
            },
          };
        });
      },

      unlockRegion: (regionId) => {
        set((state) => {
          if (state.progress.unlockedRegions.includes(regionId)) {
            return state;
          }

          return {
            progress: {
              ...state.progress,
              unlockedRegions: [...state.progress.unlockedRegions, regionId],
            },
          };
        });
      },

      selectRegion: (regionId) => {
        set({ selectedRegion: regionId, selectedStage: null });
      },

      selectStage: (stageId) => {
        set({ selectedStage: stageId });
      },

      getStageProgress: (stageId) => {
        return get().progress.stages[stageId];
      },

      isStageUnlocked: (stageId) => {
        const stage = getCampaignStage(stageId);
        if (!stage) return false;

        // First stage is always unlocked if region is unlocked
        if (stage.stageNumber === 1) {
          return get().progress.unlockedRegions.includes(stage.regionId);
        }

        // Check if required stage is completed
        if (stage.requiredStage) {
          const requiredProgress = get().progress.stages[stage.requiredStage];
          return requiredProgress?.completed || false;
        }

        return false;
      },

      isRegionUnlocked: (regionId) => {
        return get().progress.unlockedRegions.includes(regionId);
      },

      getRegionStars: (regionId) => {
        const region = campaignRegions.find(r => r.id === regionId);
        if (!region) return 0;

        return region.stages.reduce((total, stage) => {
          const progress = get().progress.stages[stage.id];
          return total + (progress?.bestRating || 0);
        }, 0);
      },
    }),
    {
      name: 'campaign-storage',
    }
  )
);

// Selectors
export const selectCampaignProgress = (state: CampaignState) => state.progress;
export const selectSelectedRegion = (state: CampaignState) => state.selectedRegion;
export const selectSelectedStage = (state: CampaignState) => state.selectedStage;
export const selectTotalStars = (state: CampaignState) => state.progress.totalStars;
