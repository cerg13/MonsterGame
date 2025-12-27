import type { DungeonFloor, DungeonType, BossMechanic } from '../types/dungeon';
import type { Element } from '../types/monster';

// Boss mechanics definitions
export const BOSS_MECHANICS: Record<string, BossMechanic[]> = {
  // Giants Keep boss mechanics
  giants_boss: [
    {
      id: 'counter_on_crit',
      name: 'Каменная Месть',
      description: 'Контратака при получении критического удара',
      trigger: 'on_crit',
      effect: 'counterattack',
      effectValue: 150, // 150% ATK damage
    },
    {
      id: 'aoe_slam',
      name: 'Сокрушительный Удар',
      description: 'AoE атака каждые 3 хода',
      trigger: 'turn_interval',
      triggerValue: 3,
      effect: 'aoe_attack',
      effectValue: 200,
    },
    {
      id: 'enrage',
      name: 'Ярость',
      description: 'Увеличение урона при HP < 50%',
      trigger: 'hp_threshold',
      triggerValue: 50,
      effect: 'enrage',
      effectValue: 50, // +50% damage
    },
  ],

  // Dragons Lair boss mechanics
  dragons_boss: [
    {
      id: 'immunity_aura',
      name: 'Аура Иммунитета',
      description: 'Иммунитет к дебаффам пока живы башни',
      trigger: 'on_debuff',
      effect: 'immunity',
    },
    {
      id: 'breath_attack',
      name: 'Огненное Дыхание',
      description: 'DoT атака на всю команду',
      trigger: 'turn_interval',
      triggerValue: 2,
      effect: 'aoe_attack',
      effectValue: 100,
    },
    {
      id: 'rage_mode',
      name: 'Режим Ярости',
      description: 'Удвоенная скорость атаки при HP < 30%',
      trigger: 'hp_threshold',
      triggerValue: 30,
      effect: 'enrage',
      effectValue: 100,
    },
  ],

  // Necropolis boss mechanics
  necropolis_boss: [
    {
      id: 'soul_capture',
      name: 'Захват Души',
      description: 'Берёт под контроль одного из ваших монстров',
      trigger: 'turn_interval',
      triggerValue: 4,
      effect: 'summon', // Special: captures player monster
    },
    {
      id: 'soul_shield',
      name: 'Щит Душ',
      description: 'Поглощает урон, пока живы миньоны',
      trigger: 'on_hit',
      effect: 'shield',
      effectValue: 50, // 50% damage reduction
    },
    {
      id: 'resurrect',
      name: 'Воскрешение',
      description: 'Воскрешает миньонов каждые 5 ходов',
      trigger: 'turn_interval',
      triggerValue: 5,
      effect: 'summon',
    },
  ],
};

// Dungeon configurations
export const DUNGEON_CONFIG: Record<DungeonType, {
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  icon: string;
  color: string;
  element: Element;
  runeSets: string[];
  maxFloor: number;
}> = {
  giants: {
    name: 'Giants Keep',
    nameRu: 'Замок Гигантов',
    description: 'Defeat the Giant Golem to obtain powerful runes',
    descriptionRu: 'Победите Гигантского Голема и получите мощные руны',
    icon: '🏔️',
    color: '#4a90d9',
    element: 'water',
    runeSets: ['energy', 'fatal', 'blade', 'swift'],
    maxFloor: 10,
  },
  dragons: {
    name: 'Dragons Lair',
    nameRu: 'Логово Дракона',
    description: 'Face the Fire Dragon for rare violent runes',
    descriptionRu: 'Сразитесь с Огненным Драконом за редкие руны',
    icon: '🐉',
    color: '#e74c3c',
    element: 'fire',
    runeSets: ['violent', 'revenge', 'focus', 'guard'],
    maxFloor: 10,
  },
  necropolis: {
    name: 'Necropolis',
    nameRu: 'Некрополис',
    description: 'Challenge the Lich King for will and vampire runes',
    descriptionRu: 'Бросьте вызов Лич-Королю за руны воли и вампира',
    icon: '💀',
    color: '#9b59b6',
    element: 'dark',
    runeSets: ['will', 'nemesis', 'destroy', 'vampire'],
    maxFloor: 10,
  },
  toa: {
    name: 'Trial of Ascension',
    nameRu: 'Испытание Вознесения',
    description: 'Climb 100 floors for legendary rewards',
    descriptionRu: 'Пройдите 100 этажей за легендарные награды',
    icon: '🗼',
    color: '#f39c12',
    element: 'light',
    runeSets: [],
    maxFloor: 100,
  },
  rift: {
    name: 'Rift of Worlds',
    nameRu: 'Разлом Миров',
    description: 'Raid elemental bosses for special materials',
    descriptionRu: 'Рейды на элементальных боссов за материалы',
    icon: '🌀',
    color: '#1abc9c',
    element: 'wind',
    runeSets: [],
    maxFloor: 5,
  },
};

// Generate dungeon floors
function generateDungeonFloors(dungeonType: DungeonType): DungeonFloor[] {
  const config = DUNGEON_CONFIG[dungeonType];
  const floors: DungeonFloor[] = [];

  for (let floor = 1; floor <= config.maxFloor; floor++) {
    const isEasyFloor = floor <= 3;
    const isMidFloor = floor > 3 && floor <= 7;
    const isHardFloor = floor > 7;

    // Enemy level scales with floor
    const baseLevel = 10 + floor * 3;
    const bossLevel = baseLevel + 5;

    // Recommended power scales exponentially
    const recommendedPower = Math.floor(5000 * Math.pow(1.3, floor - 1));

    // Energy cost scales with floor
    const energyCost = 4 + Math.floor(floor / 2);

    // Determine enemy elements based on dungeon type
    const enemyElements: Element[] = dungeonType === 'giants'
      ? ['water', 'wind']
      : dungeonType === 'dragons'
        ? ['fire', 'water']
        : dungeonType === 'necropolis'
          ? ['dark', 'light']
          : ['fire', 'water', 'wind', 'light', 'dark'];

    // Create waves
    const waveCount = isEasyFloor ? 2 : isMidFloor ? 3 : 4;
    const waves = [];

    for (let w = 1; w <= waveCount; w++) {
      const isBossWave = w === waveCount;
      const enemyCount = isBossWave ? (isHardFloor ? 3 : 2) : (isEasyFloor ? 2 : 3);

      const enemies = [];
      for (let e = 0; e < enemyCount; e++) {
        const isBoss = isBossWave && e === 0;
        const isMiniBoss = isBossWave && e > 0 && isHardFloor;

        enemies.push({
          monsterId: isBoss
            ? `${dungeonType}_boss`
            : isMiniBoss
              ? `${dungeonType}_tower`
              : `${dungeonType}_minion_${(e % 3) + 1}`,
          level: isBoss ? bossLevel : baseLevel,
          stars: isBoss ? 6 : isMiniBoss ? 5 : 4,
          isBoss,
          isMiniBoss,
          specialMechanics: isBoss ? BOSS_MECHANICS[`${dungeonType}_boss`] : undefined,
        });
      }

      waves.push({
        waveNumber: w,
        enemies,
        isBossWave,
      });
    }

    // Calculate rewards
    const goldBase = 1000 * floor;
    const expBase = 500 * floor;

    floors.push({
      id: `${dungeonType}_b${floor}`,
      dungeonType,
      floor,
      name: `${config.name} B${floor}`,
      description: `Floor ${floor} of ${config.name}`,
      energyCost,
      recommendedPower,
      enemyElements,
      waves,
      bossId: `${dungeonType}_boss`,
      rewards: {
        gold: { min: goldBase * 0.8, max: goldBase * 1.2 },
        experience: { min: expBase * 0.8, max: expBase * 1.2 },
        runeSets: config.runeSets,
        runeStars: {
          min: isEasyFloor ? 3 : isMidFloor ? 4 : 5,
          max: isEasyFloor ? 4 : isMidFloor ? 5 : 6,
        },
        runeDropRate: isEasyFloor ? 0.3 : isMidFloor ? 0.5 : 0.7,
        specialDrops: floor === 10
          ? [
              { type: 'scroll', id: 'mystical_scroll', name: 'Mystical Scroll', dropRate: 0.05 },
              { type: 'essence', id: `${config.element}_essence_high`, name: 'High Essence', dropRate: 0.1 },
            ]
          : undefined,
      },
    });
  }

  return floors;
}

// Generate ToA floors
function generateToAFloors(difficulty: 'normal' | 'hard'): DungeonFloor[] {
  const floors: DungeonFloor[] = [];
  const isHard = difficulty === 'hard';
  const levelMultiplier = isHard ? 1.5 : 1;

  for (let floor = 1; floor <= 100; floor++) {
    const isBossFloor = floor % 10 === 0;
    const isRewardFloor = floor === 30 || floor === 60 || floor === 90 || floor === 100;

    const baseLevel = Math.floor((20 + floor * 0.5) * levelMultiplier);
    const recommendedPower = Math.floor(10000 * Math.pow(1.02, floor - 1) * levelMultiplier);

    // Vary enemy elements throughout tower
    const floorElement = (['fire', 'water', 'wind', 'light', 'dark'] as Element[])[floor % 5];

    const waves = [];
    const waveCount = isBossFloor ? 1 : 3;

    for (let w = 1; w <= waveCount; w++) {
      const isBossWave = isBossFloor || w === waveCount;
      const enemyCount = isBossFloor ? 1 : 3;

      const enemies = [];
      for (let e = 0; e < enemyCount; e++) {
        enemies.push({
          monsterId: isBossFloor ? `toa_boss_${Math.ceil(floor / 10)}` : `toa_enemy_${(floor % 10) + 1}`,
          level: baseLevel + (isBossFloor ? 10 : 0),
          stars: isBossFloor ? 6 : 5,
          isBoss: isBossFloor,
          isMiniBoss: false,
        });
      }

      waves.push({
        waveNumber: w,
        enemies,
        isBossWave,
      });
    }

    // Special rewards for milestone floors
    const specialDrops = isRewardFloor
      ? [
          {
            type: 'scroll' as const,
            id: floor === 100 ? 'legendary_scroll' : 'mystical_scroll',
            name: floor === 100 ? 'Legendary Scroll' : 'Mystical Scroll',
            dropRate: 1,
          },
          ...(floor === 100
            ? [{ type: 'material' as const, id: 'devilmon', name: 'Devilmon', dropRate: 1 }]
            : []),
        ]
      : undefined;

    floors.push({
      id: `toa_${difficulty}_${floor}`,
      dungeonType: 'toa',
      floor,
      name: `${isHard ? 'ToA Hard' : 'ToA Normal'} ${floor}F`,
      description: isBossFloor ? `Boss Floor - Stage ${Math.ceil(floor / 10)}` : `Floor ${floor}`,
      energyCost: 0, // ToA is free
      recommendedPower,
      enemyElements: [floorElement],
      waves,
      bossId: isBossFloor ? `toa_boss_${Math.ceil(floor / 10)}` : null,
      rewards: {
        gold: { min: 1000 * floor, max: 1500 * floor },
        experience: { min: 500 * floor, max: 750 * floor },
        runeSets: [],
        runeStars: { min: 5, max: 6 },
        runeDropRate: isBossFloor ? 0.3 : 0,
        specialDrops,
      },
    });
  }

  return floors;
}

// Export all dungeon floors
export const GIANTS_FLOORS = generateDungeonFloors('giants');
export const DRAGONS_FLOORS = generateDungeonFloors('dragons');
export const NECROPOLIS_FLOORS = generateDungeonFloors('necropolis');
export const TOA_NORMAL_FLOORS = generateToAFloors('normal');
export const TOA_HARD_FLOORS = generateToAFloors('hard');

// All dungeons combined
export const ALL_DUNGEON_FLOORS: Record<DungeonType, DungeonFloor[]> = {
  giants: GIANTS_FLOORS,
  dragons: DRAGONS_FLOORS,
  necropolis: NECROPOLIS_FLOORS,
  toa: TOA_NORMAL_FLOORS,
  rift: [], // Rift is handled separately
};

// Get dungeon floor by ID
export function getDungeonFloor(id: string): DungeonFloor | undefined {
  for (const floors of Object.values(ALL_DUNGEON_FLOORS)) {
    const floor = floors.find(f => f.id === id);
    if (floor) return floor;
  }
  return undefined;
}

// Get all floors for a dungeon type
export function getDungeonFloors(type: DungeonType): DungeonFloor[] {
  return ALL_DUNGEON_FLOORS[type] || [];
}

// Rift boss configurations
export const RIFT_BOSSES: Record<Element, {
  name: string;
  nameRu: string;
  description: string;
  recommendedPower: number;
  mechanics: BossMechanic[];
}> = {
  fire: {
    name: 'Fire Beast',
    nameRu: 'Огненный Зверь',
    description: 'A massive fire elemental with devastating AoE attacks',
    recommendedPower: 150000,
    mechanics: [
      {
        id: 'fire_breath',
        name: 'Огненное Дыхание',
        description: 'Наносит урон всей команде и накладывает горение',
        trigger: 'turn_interval',
        triggerValue: 2,
        effect: 'aoe_attack',
        effectValue: 300,
      },
    ],
  },
  water: {
    name: 'Water Beast',
    nameRu: 'Водный Зверь',
    description: 'A tidal monster that freezes and drowns enemies',
    recommendedPower: 150000,
    mechanics: [
      {
        id: 'tidal_wave',
        name: 'Приливная Волна',
        description: 'Замораживает случайных монстров',
        trigger: 'turn_interval',
        triggerValue: 3,
        effect: 'aoe_attack',
        effectValue: 250,
      },
    ],
  },
  wind: {
    name: 'Wind Beast',
    nameRu: 'Ветряной Зверь',
    description: 'A swift creature that attacks multiple times',
    recommendedPower: 150000,
    mechanics: [
      {
        id: 'tornado',
        name: 'Торнадо',
        description: 'Многократные удары по случайным целям',
        trigger: 'turn_interval',
        triggerValue: 2,
        effect: 'aoe_attack',
        effectValue: 200,
      },
    ],
  },
  light: {
    name: 'Light Beast',
    nameRu: 'Светлый Зверь',
    description: 'A holy beast with powerful healing abilities',
    recommendedPower: 180000,
    mechanics: [
      {
        id: 'holy_light',
        name: 'Святой Свет',
        description: 'Лечит себя при низком здоровье',
        trigger: 'hp_threshold',
        triggerValue: 30,
        effect: 'heal',
        effectValue: 30,
      },
    ],
  },
  dark: {
    name: 'Dark Beast',
    nameRu: 'Тёмный Зверь',
    description: 'A shadow monster that absorbs power',
    recommendedPower: 180000,
    mechanics: [
      {
        id: 'soul_drain',
        name: 'Поглощение Душ',
        description: 'Крадёт ATB у всей команды',
        trigger: 'turn_interval',
        triggerValue: 3,
        effect: 'aoe_attack',
        effectValue: 150,
      },
    ],
  },
};
