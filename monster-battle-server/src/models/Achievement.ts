import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Achievement categories
export type AchievementCategory = 'combat' | 'collection' | 'progression' | 'social';

// Reward types
export interface AchievementReward {
  type: 'crystals' | 'gold' | 'energy' | 'summon_scroll' | 'mystical_scroll';
  amount: number;
}

// Achievement template attributes
export interface AchievementAttributes {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: number; // 1-5 for tiered achievements
  requirement: number; // Target value to complete
  rewards: AchievementReward[];
  icon: string;
  hidden: boolean; // Secret achievements
}

// Achievement model (static data)
export class Achievement extends Model<AchievementAttributes> implements AchievementAttributes {
  declare id: string;
  declare name: string;
  declare description: string;
  declare category: AchievementCategory;
  declare tier: number;
  declare requirement: number;
  declare rewards: AchievementReward[];
  declare icon: string;
  declare hidden: boolean;
}

Achievement.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM('combat', 'collection', 'progression', 'social'),
      allowNull: false,
    },
    tier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5,
      },
    },
    requirement: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rewards: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'trophy',
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'achievements',
    modelName: 'Achievement',
    timestamps: false,
    indexes: [
      { fields: ['category'] },
      { fields: ['tier'] },
    ],
  }
);

// Player Achievement progress attributes
export interface PlayerAchievementAttributes {
  id: string;
  playerId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completedAt: Date | null;
  claimedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayerAchievementCreationAttributes extends Optional<PlayerAchievementAttributes, 'id' | 'progress' | 'completed' | 'claimed' | 'completedAt' | 'claimedAt' | 'createdAt' | 'updatedAt'> {}

// Player Achievement model
export class PlayerAchievement extends Model<PlayerAchievementAttributes, PlayerAchievementCreationAttributes> implements PlayerAchievementAttributes {
  declare id: string;
  declare playerId: string;
  declare achievementId: string;
  declare progress: number;
  declare completed: boolean;
  declare claimed: boolean;
  declare completedAt: Date | null;
  declare claimedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Update progress
  async updateProgress(newProgress: number, requirement: number): Promise<boolean> {
    const wasCompleted = this.completed;
    this.progress = Math.min(newProgress, requirement);

    if (!wasCompleted && this.progress >= requirement) {
      this.completed = true;
      this.completedAt = new Date();
      await this.save();
      return true; // Newly completed
    }

    await this.save();
    return false;
  }

  // Claim rewards
  async claim(): Promise<boolean> {
    if (!this.completed || this.claimed) {
      return false;
    }

    this.claimed = true;
    this.claimedAt = new Date();
    await this.save();
    return true;
  }
}

PlayerAchievement.init(
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
    achievementId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'achievements',
        key: 'id',
      },
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    claimed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    claimedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'player_achievements',
    modelName: 'PlayerAchievement',
    indexes: [
      { fields: ['player_id'] },
      { fields: ['achievement_id'] },
      { unique: true, fields: ['player_id', 'achievement_id'] },
      { fields: ['player_id', 'completed'] },
      { fields: ['player_id', 'claimed'] },
    ],
  }
);

export default Achievement;
export { PlayerAchievement };
