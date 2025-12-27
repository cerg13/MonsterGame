import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

// Element and Rarity types
export type Element = 'fire' | 'water' | 'wind' | 'light' | 'dark';
export type Rarity = 'common' | 'rare' | 'sr' | 'ssr';

// Monster template attributes (static data)
export interface MonsterAttributes {
  id: string;
  name: string;
  element: Element;
  rarity: Rarity;
  naturalStars: number;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  baseSpd: number;
  baseCritRate: number;
  baseCritDmg: number;
  baseAccuracy: number;
  baseResistance: number;
  leaderSkillId: string | null;
  skill1Id: string;
  skill2Id: string;
  skill3Id: string | null;
  awakenedFormId: string | null;
  description: string;
  obtainMethod: string;
}

// Monster template model (read-only reference data)
export class Monster extends Model<MonsterAttributes> implements MonsterAttributes {
  declare id: string;
  declare name: string;
  declare element: Element;
  declare rarity: Rarity;
  declare naturalStars: number;
  declare baseHp: number;
  declare baseAtk: number;
  declare baseDef: number;
  declare baseSpd: number;
  declare baseCritRate: number;
  declare baseCritDmg: number;
  declare baseAccuracy: number;
  declare baseResistance: number;
  declare leaderSkillId: string | null;
  declare skill1Id: string;
  declare skill2Id: string;
  declare skill3Id: string | null;
  declare awakenedFormId: string | null;
  declare description: string;
  declare obtainMethod: string;

  // Calculate stats at a given level and stars
  calculateStats(level: number, stars: number): {
    hp: number;
    atk: number;
    def: number;
    spd: number;
  } {
    // Base multiplier based on stars (each star = 15% increase)
    const starMultiplier = 1 + (stars - this.naturalStars) * 0.15;

    // Level multiplier (linear scaling)
    const maxLevel = 40;
    const levelMultiplier = 1 + (level - 1) * 0.05;

    return {
      hp: Math.floor(this.baseHp * starMultiplier * levelMultiplier),
      atk: Math.floor(this.baseAtk * starMultiplier * levelMultiplier),
      def: Math.floor(this.baseDef * starMultiplier * levelMultiplier),
      spd: Math.floor(this.baseSpd * (1 + (level - 1) * 0.01)), // Speed scales slower
    };
  }
}

Monster.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    element: {
      type: DataTypes.ENUM('fire', 'water', 'wind', 'light', 'dark'),
      allowNull: false,
    },
    rarity: {
      type: DataTypes.ENUM('common', 'rare', 'sr', 'ssr'),
      allowNull: false,
    },
    naturalStars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    baseHp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    baseAtk: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    baseDef: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    baseSpd: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    baseCritRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.15,
    },
    baseCritDmg: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.5,
    },
    baseAccuracy: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    baseResistance: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.15,
    },
    leaderSkillId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    skill1Id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    skill2Id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    skill3Id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    awakenedFormId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    obtainMethod: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'summon',
    },
  },
  {
    sequelize,
    tableName: 'monsters',
    modelName: 'Monster',
    timestamps: false, // Static data doesn't need timestamps
    indexes: [
      { fields: ['element'] },
      { fields: ['rarity'] },
      { fields: ['natural_stars'] },
    ],
  }
);

export default Monster;
