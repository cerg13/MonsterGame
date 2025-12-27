import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Rune set types
export type RuneSet =
  | 'energy'    // +15% HP (2-set)
  | 'fatal'     // +35% ATK (4-set)
  | 'blade'     // +12% Crit Rate (2-set)
  | 'swift'     // +25% SPD (4-set)
  | 'focus'     // +20% Accuracy (2-set)
  | 'guard'     // +15% DEF (2-set)
  | 'endure'    // +20% Resistance (2-set)
  | 'violent'   // 22% chance to gain extra turn (4-set)
  | 'will'      // Immunity for 1 turn (2-set)
  | 'despair'   // 25% chance to stun (4-set)
  | 'vampire'   // 35% of damage as healing (4-set)
  | 'rage'      // +40% Crit Damage (4-set)
  | 'revenge'   // 15% chance to counterattack (2-set)
  | 'nemesis'   // +4% ATB when losing 7% HP (2-set)
  | 'destroy';  // 30% of damage destroys max HP (2-set)

// Stat types
export type StatType =
  | 'hp'          // Flat HP
  | 'hp_percent'  // HP %
  | 'atk'         // Flat ATK
  | 'atk_percent' // ATK %
  | 'def'         // Flat DEF
  | 'def_percent' // DEF %
  | 'spd'         // Speed
  | 'crit_rate'   // Critical Rate %
  | 'crit_dmg'    // Critical Damage %
  | 'accuracy'    // Accuracy %
  | 'resistance'; // Resistance %

// Stat with value
export interface RuneStat {
  type: StatType;
  value: number;
  upgrades?: number; // For substats: number of times upgraded
}

// Rune attributes
export interface RuneAttributes {
  id: string;
  playerId: string;
  set: RuneSet;
  slot: number; // 1-6
  stars: number; // 1-6
  level: number; // 0-15
  mainStat: RuneStat;
  subStats: RuneStat[];
  innateSubStat: RuneStat | null;
  equippedTo: string | null; // PlayerMonster ID
  locked: boolean;
  obtainedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RuneCreationAttributes extends Optional<RuneAttributes, 'id' | 'level' | 'subStats' | 'innateSubStat' | 'equippedTo' | 'locked' | 'obtainedAt' | 'createdAt' | 'updatedAt'> {}

export class Rune extends Model<RuneAttributes, RuneCreationAttributes> implements RuneAttributes {
  declare id: string;
  declare playerId: string;
  declare set: RuneSet;
  declare slot: number;
  declare stars: number;
  declare level: number;
  declare mainStat: RuneStat;
  declare subStats: RuneStat[];
  declare innateSubStat: RuneStat | null;
  declare equippedTo: string | null;
  declare locked: boolean;
  declare obtainedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Valid main stats per slot
  static readonly VALID_MAIN_STATS: Record<number, StatType[]> = {
    1: ['atk'],
    2: ['atk', 'atk_percent', 'def', 'def_percent', 'hp', 'hp_percent', 'spd'],
    3: ['def'],
    4: ['atk', 'atk_percent', 'def', 'def_percent', 'hp', 'hp_percent', 'crit_rate', 'crit_dmg'],
    5: ['hp'],
    6: ['atk', 'atk_percent', 'def', 'def_percent', 'hp', 'hp_percent', 'accuracy', 'resistance'],
  };

  // Base values for main stats at 6* +15
  static readonly MAX_MAIN_STAT_VALUES: Record<StatType, number> = {
    hp: 2448,
    hp_percent: 63,
    atk: 160,
    atk_percent: 63,
    def: 160,
    def_percent: 63,
    spd: 42,
    crit_rate: 58,
    crit_dmg: 80,
    accuracy: 64,
    resistance: 64,
  };

  // Get main stat value at current level
  getMainStatValue(): number {
    const maxValue = Rune.MAX_MAIN_STAT_VALUES[this.mainStat.type];
    const starMultiplier = this.stars / 6;
    const levelMultiplier = (this.level + 1) / 16; // Level 0 = 1/16, Level 15 = 1

    return Math.floor(maxValue * starMultiplier * levelMultiplier);
  }

  // Upgrade rune
  async upgrade(): Promise<{ success: boolean; newSubStat?: boolean }> {
    if (this.level >= 15) {
      return { success: false };
    }

    this.level += 1;

    // Every 3 levels, gain/upgrade a substat
    if (this.level % 3 === 0 && this.level <= 12) {
      const subStatIndex = Math.floor(this.level / 3) - 1;

      if (subStatIndex < this.subStats.length) {
        // Upgrade existing substat
        const newSubStats = [...this.subStats];
        newSubStats[subStatIndex] = {
          ...newSubStats[subStatIndex],
          value: newSubStats[subStatIndex].value * 1.2, // 20% increase
          upgrades: (newSubStats[subStatIndex].upgrades || 0) + 1,
        };
        this.subStats = newSubStats;
      } else if (this.subStats.length < 4) {
        // Add new substat (would need random generation in real implementation)
        await this.save();
        return { success: true, newSubStat: true };
      }
    }

    await this.save();
    return { success: true, newSubStat: false };
  }

  // Calculate sell value
  getSellValue(): number {
    const baseValue = this.stars * 1000;
    const levelBonus = this.level * 100;
    return baseValue + levelBonus;
  }

  // Calculate efficiency (how good the substats are)
  calculateEfficiency(): number {
    // Simplified efficiency calculation
    // Real efficiency compares to theoretical max rolls
    let totalValue = 0;

    this.subStats.forEach((stat) => {
      const maxValue = Rune.MAX_MAIN_STAT_VALUES[stat.type] * 0.1; // Substat ~10% of main
      totalValue += (stat.value / maxValue) * 100;
    });

    return Math.min(100, totalValue / 4); // Average of 4 substats
  }
}

Rune.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    set: {
      type: DataTypes.ENUM(
        'energy', 'fatal', 'blade', 'swift', 'focus', 'guard',
        'endure', 'violent', 'will', 'despair', 'vampire', 'rage',
        'revenge', 'nemesis', 'destroy'
      ),
      allowNull: false,
    },
    slot: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6,
      },
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6,
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 15,
      },
    },
    mainStat: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    subStats: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    innateSubStat: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    equippedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'player_monsters',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    locked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    obtainedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'runes',
    modelName: 'Rune',
    indexes: [
      { fields: ['player_id'] },
      { fields: ['set'] },
      { fields: ['slot'] },
      { fields: ['stars'] },
      { fields: ['equipped_to'] },
      { fields: ['player_id', 'locked'] },
    ],
  }
);

export default Rune;
