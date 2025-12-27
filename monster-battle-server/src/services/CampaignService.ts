import { v4 as uuidv4 } from 'uuid';

// Types
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
  stars: number; // 0-3
  cleared: boolean;
}

export interface StageEnemy {
  templateId: string;
  level: number;
  isBoss: boolean;
}

export interface StageReward {
  type: 'gold' | 'crystal' | 'energy' | 'exp' | 'rune' | 'monster_piece';
  amount: number;
  chance: number; // 0-100
}

export interface PlayerCampaignProgress {
  userId: string;
  unlockedRegions: string[];
  stageProgress: Record<string, { stars: number; cleared: boolean; clearCount: number }>;
  lastPlayedStage: string | null;
}

// Campaign data
const CAMPAIGN_REGIONS: Omit<CampaignRegion, 'isUnlocked'>[] = [
  {
    id: 'forest',
    name: 'Enchanted Forest',
    description: 'A mystical forest filled with creatures.',
    requiredLevel: 1,
    stages: [],
  },
  {
    id: 'mountain',
    name: 'Dragon Mountain',
    description: 'Home of ancient dragons.',
    requiredLevel: 10,
    stages: [],
  },
  {
    id: 'desert',
    name: 'Scorching Desert',
    description: 'A vast desert with hidden treasures.',
    requiredLevel: 20,
    stages: [],
  },
  {
    id: 'volcano',
    name: 'Volcanic Depths',
    description: 'The fiery heart of the world.',
    requiredLevel: 30,
    stages: [],
  },
  {
    id: 'shadow',
    name: 'Shadow Realm',
    description: 'A dimension of darkness.',
    requiredLevel: 40,
    stages: [],
  },
];

const ENEMY_TEMPLATES = [
  { id: 'slime_water', name: 'Water Slime', element: 'water' },
  { id: 'wolf_wind', name: 'Wind Wolf', element: 'wind' },
  { id: 'golem_fire', name: 'Fire Golem', element: 'fire' },
  { id: 'spirit_light', name: 'Light Spirit', element: 'light' },
  { id: 'wraith_dark', name: 'Dark Wraith', element: 'dark' },
];

/**
 * Campaign Service
 * Handles campaign progression and battles
 */
export class CampaignService {
  private playerProgress: Map<string, PlayerCampaignProgress> = new Map();
  private regions: CampaignRegion[];

  constructor() {
    this.regions = this.initializeRegions();
  }

  private initializeRegions(): CampaignRegion[] {
    return CAMPAIGN_REGIONS.map(region => {
      const stages: CampaignStage[] = [];

      // Generate 10 stages per region
      for (let i = 1; i <= 10; i++) {
        const baseLevel = region.requiredLevel + (i - 1) * 2;
        const enemies: StageEnemy[] = [];

        // Regular enemies
        const enemyCount = 2 + Math.floor(i / 4);
        for (let j = 0; j < enemyCount; j++) {
          enemies.push({
            templateId: ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)].id,
            level: baseLevel + Math.floor(Math.random() * 3),
            isBoss: false,
          });
        }

        // Boss on every 5th stage
        if (i % 5 === 0) {
          enemies.push({
            templateId: ENEMY_TEMPLATES[Math.floor(Math.random() * ENEMY_TEMPLATES.length)].id,
            level: baseLevel + 5,
            isBoss: true,
          });
        }

        stages.push({
          id: `${region.id}_${i}`,
          regionId: region.id,
          stageNumber: i,
          name: `Stage ${i}`,
          difficulty: 'normal',
          energyCost: 4 + Math.floor(i / 3),
          enemies,
          rewards: [
            { type: 'gold', amount: 500 + i * 100, chance: 100 },
            { type: 'exp', amount: 100 + i * 20, chance: 100 },
            { type: 'rune', amount: 1, chance: 10 + i * 2 },
          ],
          firstClearRewards: [
            { type: 'crystal', amount: 5 + Math.floor(i / 2), chance: 100 },
          ],
          stars: 0,
          cleared: false,
        });
      }

      return {
        ...region,
        stages,
        isUnlocked: region.requiredLevel <= 1,
      };
    });
  }

  /**
   * Get player progress
   */
  public getProgress(userId: string): PlayerCampaignProgress {
    let progress = this.playerProgress.get(userId);

    if (!progress) {
      progress = {
        userId,
        unlockedRegions: ['forest'],
        stageProgress: {},
        lastPlayedStage: null,
      };
      this.playerProgress.set(userId, progress);
    }

    return progress;
  }

  /**
   * Get all regions with player progress
   */
  public getRegions(userId: string, playerLevel: number): CampaignRegion[] {
    const progress = this.getProgress(userId);

    return this.regions.map(region => ({
      ...region,
      isUnlocked: playerLevel >= region.requiredLevel || progress.unlockedRegions.includes(region.id),
      stages: region.stages.map(stage => {
        const stageProgress = progress.stageProgress[stage.id];
        return {
          ...stage,
          stars: stageProgress?.stars || 0,
          cleared: stageProgress?.cleared || false,
        };
      }),
    }));
  }

  /**
   * Get specific region
   */
  public getRegion(userId: string, regionId: string, playerLevel: number): CampaignRegion | null {
    const regions = this.getRegions(userId, playerLevel);
    return regions.find(r => r.id === regionId) || null;
  }

  /**
   * Get stage
   */
  public getStage(userId: string, stageId: string): CampaignStage | null {
    for (const region of this.regions) {
      const stage = region.stages.find(s => s.id === stageId);
      if (stage) {
        const progress = this.getProgress(userId);
        const stageProgress = progress.stageProgress[stageId];
        return {
          ...stage,
          stars: stageProgress?.stars || 0,
          cleared: stageProgress?.cleared || false,
        };
      }
    }
    return null;
  }

  /**
   * Start stage battle
   */
  public startStage(userId: string, stageId: string, energy: number): {
    success: boolean;
    stage?: CampaignStage;
    error?: string;
  } {
    const stage = this.getStage(userId, stageId);

    if (!stage) {
      return { success: false, error: 'Stage not found' };
    }

    if (energy < stage.energyCost) {
      return { success: false, error: 'Not enough energy' };
    }

    const progress = this.getProgress(userId);
    progress.lastPlayedStage = stageId;

    return { success: true, stage };
  }

  /**
   * Complete stage
   */
  public completeStage(
    userId: string,
    stageId: string,
    won: boolean,
    stars: number
  ): {
    success: boolean;
    rewards?: StageReward[];
    firstClear?: boolean;
    error?: string;
  } {
    if (!won) {
      return { success: true, rewards: [] };
    }

    const stage = this.getStage(userId, stageId);
    if (!stage) {
      return { success: false, error: 'Stage not found' };
    }

    const progress = this.getProgress(userId);
    const existing = progress.stageProgress[stageId];
    const isFirstClear = !existing?.cleared;

    // Update progress
    progress.stageProgress[stageId] = {
      stars: Math.max(existing?.stars || 0, stars),
      cleared: true,
      clearCount: (existing?.clearCount || 0) + 1,
    };

    // Calculate rewards
    const rewards: StageReward[] = [];

    for (const reward of stage.rewards) {
      if (Math.random() * 100 <= reward.chance) {
        rewards.push(reward);
      }
    }

    if (isFirstClear) {
      rewards.push(...stage.firstClearRewards);
    }

    // Unlock next region if needed
    const stageNumber = parseInt(stageId.split('_')[1]);
    if (stageNumber === 10) {
      const regionId = stageId.split('_')[0];
      const regionIndex = this.regions.findIndex(r => r.id === regionId);
      if (regionIndex < this.regions.length - 1) {
        const nextRegion = this.regions[regionIndex + 1];
        if (!progress.unlockedRegions.includes(nextRegion.id)) {
          progress.unlockedRegions.push(nextRegion.id);
        }
      }
    }

    return { success: true, rewards, firstClear: isFirstClear };
  }

  /**
   * Get total stars for a region
   */
  public getRegionStars(userId: string, regionId: string): { earned: number; total: number } {
    const progress = this.getProgress(userId);
    const region = this.regions.find(r => r.id === regionId);

    if (!region) {
      return { earned: 0, total: 0 };
    }

    let earned = 0;
    for (const stage of region.stages) {
      const stageProgress = progress.stageProgress[stage.id];
      earned += stageProgress?.stars || 0;
    }

    return { earned, total: region.stages.length * 3 };
  }
}

// Export singleton
export const campaignService = new CampaignService();
