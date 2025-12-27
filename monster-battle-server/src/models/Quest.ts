import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Quest types
export type QuestType = 'daily' | 'weekly' | 'story' | 'event';

// Quest action types (what needs to be done)
export type QuestAction =
  | 'win_battles'
  | 'complete_dungeon'
  | 'summon_monsters'
  | 'upgrade_runes'
  | 'arena_battles'
  | 'guild_check_in'
  | 'use_energy'
  | 'level_monster'
  | 'awaken_monster'
  | 'complete_daily_quests'
  | 'login';

// Quest requirement
export interface QuestRequirement {
  action: QuestAction;
  target: number;
  conditions?: {
    element?: string;
    rarity?: string;
    dungeonType?: string;
    minLevel?: number;
  };
}

// Quest reward
export interface QuestReward {
  type: 'crystals' | 'gold' | 'energy' | 'exp' | 'summon_scroll' | 'rune';
  amount: number;
}

// Quest template attributes
export interface QuestAttributes {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  requirement: QuestRequirement;
  rewards: QuestReward[];
  order: number; // For story quests
  prerequisiteId: string | null; // Previous quest required
  expiresAfter: number | null; // Hours until expiration (for daily/weekly)
}

// Quest model (static data)
export class Quest extends Model<QuestAttributes> implements QuestAttributes {
  declare id: string;
  declare name: string;
  declare description: string;
  declare type: QuestType;
  declare requirement: QuestRequirement;
  declare rewards: QuestReward[];
  declare order: number;
  declare prerequisiteId: string | null;
  declare expiresAfter: number | null;
}

Quest.init(
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
    type: {
      type: DataTypes.ENUM('daily', 'weekly', 'story', 'event'),
      allowNull: false,
    },
    requirement: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    rewards: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    prerequisiteId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    expiresAfter: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = never expires
    },
  },
  {
    sequelize,
    tableName: 'quests',
    modelName: 'Quest',
    timestamps: false,
    indexes: [
      { fields: ['type'] },
      { fields: ['order'] },
    ],
  }
);

// Player Quest progress attributes
export interface PlayerQuestAttributes {
  id: string;
  playerId: string;
  questId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  assignedAt: Date;
  completedAt: Date | null;
  expiresAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayerQuestCreationAttributes extends Optional<PlayerQuestAttributes, 'id' | 'progress' | 'completed' | 'claimed' | 'completedAt' | 'expiresAt' | 'createdAt' | 'updatedAt'> {}

// Player Quest model
export class PlayerQuest extends Model<PlayerQuestAttributes, PlayerQuestCreationAttributes> implements PlayerQuestAttributes {
  declare id: string;
  declare playerId: string;
  declare questId: string;
  declare progress: number;
  declare completed: boolean;
  declare claimed: boolean;
  declare assignedAt: Date;
  declare completedAt: Date | null;
  declare expiresAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Check if quest is expired
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  // Update progress
  async updateProgress(newProgress: number, requirement: number): Promise<boolean> {
    if (this.isExpired() || this.completed) {
      return false;
    }

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
    if (!this.completed || this.claimed || this.isExpired()) {
      return false;
    }

    this.claimed = true;
    await this.save();
    return true;
  }

  // Static method to assign daily quests
  static async assignDailyQuests(playerId: string): Promise<PlayerQuest[]> {
    // Get all daily quests
    const dailyQuests = await Quest.findAll({
      where: { type: 'daily' },
    });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(23, 59, 59, 999); // End of day

    const assignedQuests: PlayerQuest[] = [];

    for (const quest of dailyQuests) {
      // Check if already assigned today
      const existing = await PlayerQuest.findOne({
        where: {
          playerId,
          questId: quest.id,
          assignedAt: {
            [sequelize.Sequelize.Op.gte]: new Date(now.setHours(0, 0, 0, 0)),
          },
        },
      });

      if (!existing) {
        const playerQuest = await PlayerQuest.create({
          playerId,
          questId: quest.id,
          assignedAt: now,
          expiresAt,
        });
        assignedQuests.push(playerQuest);
      }
    }

    return assignedQuests;
  }

  // Static method to assign weekly quests
  static async assignWeeklyQuests(playerId: string): Promise<PlayerQuest[]> {
    // Get all weekly quests
    const weeklyQuests = await Quest.findAll({
      where: { type: 'weekly' },
    });

    const now = new Date();
    const expiresAt = new Date(now);
    // Set to end of week (Sunday 23:59:59)
    expiresAt.setDate(now.getDate() + (7 - now.getDay()));
    expiresAt.setHours(23, 59, 59, 999);

    // Get start of week (Monday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const assignedQuests: PlayerQuest[] = [];

    for (const quest of weeklyQuests) {
      // Check if already assigned this week
      const existing = await PlayerQuest.findOne({
        where: {
          playerId,
          questId: quest.id,
          assignedAt: {
            [sequelize.Sequelize.Op.gte]: startOfWeek,
          },
        },
      });

      if (!existing) {
        const playerQuest = await PlayerQuest.create({
          playerId,
          questId: quest.id,
          assignedAt: now,
          expiresAt,
        });
        assignedQuests.push(playerQuest);
      }
    }

    return assignedQuests;
  }
}

PlayerQuest.init(
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
    questId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'quests',
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
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'player_quests',
    modelName: 'PlayerQuest',
    indexes: [
      { fields: ['player_id'] },
      { fields: ['quest_id'] },
      { fields: ['player_id', 'quest_id', 'assigned_at'] },
      { fields: ['player_id', 'completed'] },
      { fields: ['expires_at'] },
    ],
  }
);

export default Quest;
export { PlayerQuest };
