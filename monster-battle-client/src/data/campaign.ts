/**
 * Campaign Data
 *
 * Defines all campaign regions, stages, and dungeons.
 */

import type {
  CampaignRegion,
  CampaignStage,
  Dungeon,
  DungeonFloor,
} from '../types/campaign';

// =============================================
// CAMPAIGN REGIONS
// =============================================

export const campaignRegions: CampaignRegion[] = [
  // Region 1: Starter Fields
  {
    id: 'starter_fields',
    name: 'Starter Fields',
    description: 'A peaceful meadow where young tamers begin their journey.',
    background: 'starter_fields_bg.png',
    requiredLevel: 1,
    stages: [],
  },
  // Region 2: Dark Forest
  {
    id: 'dark_forest',
    name: 'Dark Forest',
    description: 'A mysterious forest filled with dark creatures.',
    background: 'dark_forest_bg.png',
    requiredLevel: 10,
    stages: [],
    unlockRequirements: {
      previousRegion: 'starter_fields',
    },
  },
  // Region 3: Volcanic Peaks
  {
    id: 'volcanic_peaks',
    name: 'Volcanic Peaks',
    description: 'Fiery mountains where fire monsters dwell.',
    background: 'volcanic_peaks_bg.png',
    requiredLevel: 20,
    stages: [],
    unlockRequirements: {
      previousRegion: 'dark_forest',
    },
  },
  // Region 4: Frozen Tundra
  {
    id: 'frozen_tundra',
    name: 'Frozen Tundra',
    description: 'An icy wasteland with powerful water creatures.',
    background: 'frozen_tundra_bg.png',
    requiredLevel: 30,
    stages: [],
    unlockRequirements: {
      previousRegion: 'volcanic_peaks',
    },
  },
  // Region 5: Sky Temple
  {
    id: 'sky_temple',
    name: 'Sky Temple',
    description: 'Ancient ruins in the clouds guarded by wind spirits.',
    background: 'sky_temple_bg.png',
    requiredLevel: 40,
    stages: [],
    unlockRequirements: {
      previousRegion: 'frozen_tundra',
    },
  },
];

// =============================================
// STAGE GENERATOR HELPERS
// =============================================

function generateStages(
  regionId: string,
  stageCount: number,
  baseLevel: number,
  baseEnergy: number,
  enemyPool: string[],
  bossId: string
): CampaignStage[] {
  const stages: CampaignStage[] = [];

  for (let i = 1; i <= stageCount; i++) {
    const isBoss = i === stageCount;
    const level = baseLevel + Math.floor((i - 1) * 1.5);

    stages.push({
      id: `${regionId}_stage_${i}`,
      regionId,
      name: isBoss ? 'Boss Stage' : `Stage ${i}`,
      stageNumber: i,
      difficulty: 'normal',
      energyCost: baseEnergy + Math.floor(i / 3),
      recommendedLevel: level,
      bossStage: isBoss,
      waves: generateWaves(enemyPool, level, isBoss ? bossId : null, i),
      rewards: {
        expBase: 50 + level * 10,
        goldBase: 100 + level * 20,
        drops: [
          { type: 'gold', minAmount: 50, maxAmount: 150, dropRate: 100 },
          { type: 'rune', runeGrade: Math.min(Math.ceil(level / 10), 6), dropRate: 15 + (isBoss ? 20 : 0) },
        ],
        firstClearBonus: [
          { type: 'crystal', amount: isBoss ? 10 : 3 },
          { type: 'gold', amount: level * 100 },
        ],
      },
      requiredStage: i > 1 ? `${regionId}_stage_${i - 1}` : undefined,
    });
  }

  return stages;
}

function generateWaves(
  enemyPool: string[],
  level: number,
  bossId: string | null,
  stageNumber: number
): CampaignStage['waves'] {
  const waveCount = bossId ? 3 : Math.min(1 + Math.floor(stageNumber / 4), 3);
  const waves: CampaignStage['waves'] = [];

  for (let w = 1; w <= waveCount; w++) {
    const isFinalWave = w === waveCount;
    const enemyCount = isFinalWave && bossId ? 1 : Math.min(2 + Math.floor(stageNumber / 3), 4);

    const enemies = [];
    for (let e = 0; e < enemyCount; e++) {
      if (isFinalWave && bossId && e === 0) {
        enemies.push({
          templateId: bossId,
          level: level + 5,
          isBoss: true,
          hpMod: 1.5,
          atkMod: 1.2,
        });
      } else {
        const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
        enemies.push({
          templateId: randomEnemy,
          level: level + Math.floor(Math.random() * 3),
        });
      }
    }

    waves.push({ waveNumber: w, enemies });
  }

  return waves;
}

// Populate regions with stages
campaignRegions[0].stages = generateStages(
  'starter_fields',
  7,
  1,
  3,
  ['fire_imp', 'water_spirit', 'wind_fairy', 'dark_bat'],
  'fire_knight'
);

campaignRegions[1].stages = generateStages(
  'dark_forest',
  7,
  10,
  4,
  ['dark_bat', 'dark_witch', 'wind_fairy', 'fire_imp'],
  'dark_knight'
);

campaignRegions[2].stages = generateStages(
  'volcanic_peaks',
  7,
  20,
  5,
  ['fire_imp', 'fire_knight', 'fire_dragon'],
  'fire_phoenix'
);

campaignRegions[3].stages = generateStages(
  'frozen_tundra',
  7,
  30,
  6,
  ['water_spirit', 'water_knight', 'water_mage'],
  'water_dragon'
);

campaignRegions[4].stages = generateStages(
  'sky_temple',
  7,
  40,
  7,
  ['wind_fairy', 'wind_archer', 'wind_assassin', 'light_pixie'],
  'wind_griffin'
);

// =============================================
// DUNGEONS
// =============================================

function generateDungeonFloors(
  baseLevel: number,
  maxFloor: number,
  enemyPool: string[],
  bossId: string,
  runeSet?: string
): DungeonFloor[] {
  const floors: DungeonFloor[] = [];

  for (let f = 1; f <= maxFloor; f++) {
    const level = baseLevel + (f - 1) * 5;
    const waveCount = f <= 5 ? 2 : 3;

    floors.push({
      floor: f,
      energyCost: 4 + Math.floor(f / 2),
      recommendedLevel: level,
      waves: Array.from({ length: waveCount }, (_, w) => ({
        waveNumber: w + 1,
        enemies: w === waveCount - 1
          ? [{ templateId: bossId, level: level + 10, isBoss: true, hpMod: 2.0, atkMod: 1.5 }]
          : Array.from({ length: 3 }, () => ({
              templateId: enemyPool[Math.floor(Math.random() * enemyPool.length)],
              level,
            })),
      })),
      rewards: {
        expBase: 100 + f * 50,
        goldBase: 200 + f * 100,
        drops: [
          { type: 'rune', runeGrade: Math.min(f, 6), runeSet, dropRate: 40 + f * 5 },
          { type: 'gold', minAmount: f * 100, maxAmount: f * 200, dropRate: 100 },
          { type: 'crystal', minAmount: 1, maxAmount: 3, dropRate: 5 + f },
        ],
      },
    });
  }

  return floors;
}

export const dungeons: Dungeon[] = [
  {
    id: 'giants_keep',
    name: "Giant's Keep",
    type: 'giants',
    description: 'Home of the Ancient Giant. Drops Swift and Fatal runes.',
    icon: 'giants_keep.png',
    element: 'water',
    floors: generateDungeonFloors(
      10,
      10,
      ['water_spirit', 'water_knight', 'water_mage'],
      'water_dragon',
      'swift'
    ),
    unlockRequirement: {
      playerLevel: 15,
      campaignStage: 'starter_fields_stage_7',
    },
  },
  {
    id: 'dragons_lair',
    name: "Dragon's Lair",
    type: 'dragons',
    description: 'Lair of the Fire Dragon. Drops Rage and Blade runes.',
    icon: 'dragons_lair.png',
    element: 'fire',
    floors: generateDungeonFloors(
      15,
      10,
      ['fire_imp', 'fire_knight', 'fire_dragon'],
      'fire_phoenix',
      'rage'
    ),
    unlockRequirement: {
      playerLevel: 20,
      campaignStage: 'dark_forest_stage_7',
    },
  },
  {
    id: 'necropolis',
    name: 'Necropolis',
    type: 'necro',
    description: 'Domain of the undead. Drops Vampire and Will runes.',
    icon: 'necropolis.png',
    element: 'dark',
    floors: generateDungeonFloors(
      20,
      10,
      ['dark_bat', 'dark_witch', 'dark_knight'],
      'dark_demon',
      'vampire'
    ),
    unlockRequirement: {
      playerLevel: 30,
      campaignStage: 'volcanic_peaks_stage_7',
    },
  },
  {
    id: 'hall_of_fire',
    name: 'Hall of Fire',
    type: 'elemental',
    description: 'Collect Fire essences to awaken Fire monsters.',
    icon: 'hall_fire.png',
    element: 'fire',
    floors: generateDungeonFloors(
      10,
      10,
      ['fire_imp', 'fire_knight'],
      'fire_dragon'
    ),
    unlockRequirement: {
      playerLevel: 10,
    },
  },
  {
    id: 'hall_of_water',
    name: 'Hall of Water',
    type: 'elemental',
    description: 'Collect Water essences to awaken Water monsters.',
    icon: 'hall_water.png',
    element: 'water',
    floors: generateDungeonFloors(
      10,
      10,
      ['water_spirit', 'water_knight'],
      'water_mage'
    ),
    unlockRequirement: {
      playerLevel: 10,
    },
  },
  {
    id: 'hall_of_wind',
    name: 'Hall of Wind',
    type: 'elemental',
    description: 'Collect Wind essences to awaken Wind monsters.',
    icon: 'hall_wind.png',
    element: 'wind',
    floors: generateDungeonFloors(
      10,
      10,
      ['wind_fairy', 'wind_archer'],
      'wind_assassin'
    ),
    unlockRequirement: {
      playerLevel: 10,
    },
  },
  {
    id: 'hall_of_light',
    name: 'Hall of Light',
    type: 'light_dark',
    description: 'Collect Light essences to awaken Light monsters.',
    icon: 'hall_light.png',
    element: 'light',
    floors: generateDungeonFloors(
      15,
      10,
      ['light_pixie', 'light_paladin'],
      'light_archangel'
    ),
    unlockRequirement: {
      playerLevel: 20,
    },
  },
  {
    id: 'hall_of_dark',
    name: 'Hall of Darkness',
    type: 'light_dark',
    description: 'Collect Dark essences to awaken Dark monsters.',
    icon: 'hall_dark.png',
    element: 'dark',
    floors: generateDungeonFloors(
      15,
      10,
      ['dark_bat', 'dark_witch'],
      'dark_demon'
    ),
    unlockRequirement: {
      playerLevel: 20,
    },
  },
];

// =============================================
// HELPER FUNCTIONS
// =============================================

export function getCampaignRegion(regionId: string): CampaignRegion | undefined {
  return campaignRegions.find(r => r.id === regionId);
}

export function getCampaignStage(stageId: string): CampaignStage | undefined {
  for (const region of campaignRegions) {
    const stage = region.stages.find(s => s.id === stageId);
    if (stage) return stage;
  }
  return undefined;
}

export function getDungeon(dungeonId: string): Dungeon | undefined {
  return dungeons.find(d => d.id === dungeonId);
}

export function getDungeonFloor(dungeonId: string, floor: number): DungeonFloor | undefined {
  const dungeon = getDungeon(dungeonId);
  return dungeon?.floors.find(f => f.floor === floor);
}

export function getNextUnlockedRegion(
  unlockedRegions: string[],
  playerLevel: number
): CampaignRegion | undefined {
  return campaignRegions.find(
    r => !unlockedRegions.includes(r.id) && r.requiredLevel <= playerLevel
  );
}

export function getTotalStarsInRegion(regionId: string): number {
  const region = getCampaignRegion(regionId);
  if (!region) return 0;
  return region.stages.length * 3; // 3 stars per stage
}
