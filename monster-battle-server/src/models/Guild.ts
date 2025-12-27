import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Guild member roles
export type GuildRole = 'leader' | 'vice_leader' | 'member';

// Guild attributes
export interface GuildAttributes {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  level: number;
  experience: number;
  maxMembers: number;
  memberCount: number;
  warWins: number;
  warLosses: number;
  weeklyContribution: number;
  isRecruiting: boolean;
  minLevel: number; // Minimum player level to join
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GuildCreationAttributes extends Optional<GuildAttributes, 'id' | 'description' | 'level' | 'experience' | 'maxMembers' | 'memberCount' | 'warWins' | 'warLosses' | 'weeklyContribution' | 'isRecruiting' | 'minLevel' | 'createdAt' | 'updatedAt'> {}

export class Guild extends Model<GuildAttributes, GuildCreationAttributes> implements GuildAttributes {
  declare id: string;
  declare name: string;
  declare description: string;
  declare leaderId: string;
  declare level: number;
  declare experience: number;
  declare maxMembers: number;
  declare memberCount: number;
  declare warWins: number;
  declare warLosses: number;
  declare weeklyContribution: number;
  declare isRecruiting: boolean;
  declare minLevel: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Calculate max members based on level
  static calculateMaxMembers(level: number): number {
    return 20 + Math.floor(level / 5) * 5; // 20 base + 5 every 5 levels, max 50
  }

  // Experience needed for next level
  static experienceForLevel(level: number): number {
    return Math.floor(1000 * Math.pow(1.5, level - 1));
  }

  // Add experience from contributions
  async addExperience(amount: number): Promise<{ leveledUp: boolean; newLevel: number }> {
    const maxLevel = 30;
    let leveledUp = false;

    this.experience += amount;

    while (this.experience >= Guild.experienceForLevel(this.level) && this.level < maxLevel) {
      this.experience -= Guild.experienceForLevel(this.level);
      this.level += 1;
      this.maxMembers = Guild.calculateMaxMembers(this.level);
      leveledUp = true;
    }

    await this.save();
    return { leveledUp, newLevel: this.level };
  }

  // Check if guild is full
  isFull(): boolean {
    return this.memberCount >= this.maxMembers;
  }

  // Get win rate
  getWinRate(): number {
    const total = this.warWins + this.warLosses;
    if (total === 0) return 0;
    return Math.round((this.warWins / total) * 100);
  }

  // Reset weekly contribution (called weekly)
  async resetWeeklyContribution(): Promise<void> {
    this.weeklyContribution = 0;
    await this.save();
  }
}

Guild.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    leaderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 30,
      },
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxMembers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
    },
    memberCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // Leader counts as 1
    },
    warWins: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    warLosses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    weeklyContribution: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    isRecruiting: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    minLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize,
    tableName: 'guilds',
    modelName: 'Guild',
    indexes: [
      { unique: true, fields: ['name'] },
      { fields: ['leader_id'] },
      { fields: ['level'] },
      { fields: ['is_recruiting'] },
      { fields: ['war_wins'] },
    ],
  }
);

// Guild Member attributes
export interface GuildMemberAttributes {
  id: string;
  guildId: string;
  playerId: string;
  role: GuildRole;
  contribution: number;
  weeklyContribution: number;
  lastCheckIn: Date | null;
  joinedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface GuildMemberCreationAttributes extends Optional<GuildMemberAttributes, 'id' | 'role' | 'contribution' | 'weeklyContribution' | 'lastCheckIn' | 'joinedAt' | 'createdAt' | 'updatedAt'> {}

export class GuildMember extends Model<GuildMemberAttributes, GuildMemberCreationAttributes> implements GuildMemberAttributes {
  declare id: string;
  declare guildId: string;
  declare playerId: string;
  declare role: GuildRole;
  declare contribution: number;
  declare weeklyContribution: number;
  declare lastCheckIn: Date | null;
  declare joinedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Check if can check in today
  canCheckIn(): boolean {
    if (!this.lastCheckIn) return true;

    const now = new Date();
    const lastCheckInDate = new Date(this.lastCheckIn);

    return now.toDateString() !== lastCheckInDate.toDateString();
  }

  // Perform daily check-in
  async checkIn(): Promise<{ success: boolean; points: number }> {
    if (!this.canCheckIn()) {
      return { success: false, points: 0 };
    }

    const points = 50; // Base check-in points
    this.contribution += points;
    this.weeklyContribution += points;
    this.lastCheckIn = new Date();

    await this.save();

    // Also update guild's weekly contribution
    await Guild.increment('weeklyContribution', {
      by: points,
      where: { id: this.guildId },
    });

    return { success: true, points };
  }

  // Add contribution (from guild activities)
  async addContribution(amount: number): Promise<void> {
    this.contribution += amount;
    this.weeklyContribution += amount;
    await this.save();

    await Guild.increment('weeklyContribution', {
      by: amount,
      where: { id: this.guildId },
    });
  }

  // Reset weekly contribution (called weekly)
  async resetWeeklyContribution(): Promise<void> {
    this.weeklyContribution = 0;
    await this.save();
  }

  // Promote member
  async promote(): Promise<boolean> {
    if (this.role === 'leader') return false;

    if (this.role === 'member') {
      this.role = 'vice_leader';
    }

    await this.save();
    return true;
  }

  // Demote member
  async demote(): Promise<boolean> {
    if (this.role === 'member' || this.role === 'leader') return false;

    this.role = 'member';
    await this.save();
    return true;
  }
}

GuildMember.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    guildId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'guilds',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    role: {
      type: DataTypes.ENUM('leader', 'vice_leader', 'member'),
      allowNull: false,
      defaultValue: 'member',
    },
    contribution: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    weeklyContribution: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    lastCheckIn: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'guild_members',
    modelName: 'GuildMember',
    indexes: [
      { fields: ['guild_id'] },
      { fields: ['player_id'] },
      { unique: true, fields: ['guild_id', 'player_id'] },
      { fields: ['guild_id', 'role'] },
      { fields: ['guild_id', 'contribution'] },
    ],
  }
);

export default Guild;
export { GuildMember };
