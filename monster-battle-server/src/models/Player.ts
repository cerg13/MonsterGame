import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

// Player attributes interface
export interface PlayerAttributes {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  level: number;
  experience: number;
  crystals: number;
  gold: number;
  energy: number;
  maxEnergy: number;
  arenaTickets: number;
  maxArenaTickets: number;
  arenaPoints: number;
  guildId: string | null;
  lastEnergyRefresh: Date;
  lastLogin: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Attributes for creation (id is auto-generated)
export interface PlayerCreationAttributes extends Optional<PlayerAttributes, 'id' | 'level' | 'experience' | 'crystals' | 'gold' | 'energy' | 'maxEnergy' | 'arenaTickets' | 'maxArenaTickets' | 'arenaPoints' | 'guildId' | 'lastEnergyRefresh' | 'lastLogin' | 'createdAt' | 'updatedAt'> {}

// Player model class
export class Player extends Model<PlayerAttributes, PlayerCreationAttributes> implements PlayerAttributes {
  declare id: string;
  declare username: string;
  declare email: string;
  declare passwordHash: string;
  declare level: number;
  declare experience: number;
  declare crystals: number;
  declare gold: number;
  declare energy: number;
  declare maxEnergy: number;
  declare arenaTickets: number;
  declare maxArenaTickets: number;
  declare arenaPoints: number;
  declare guildId: string | null;
  declare lastEnergyRefresh: Date;
  declare lastLogin: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Instance methods
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }

  // Calculate max energy based on level
  static calculateMaxEnergy(level: number): number {
    return 80 + Math.floor(level / 5) * 10; // 80 base + 10 every 5 levels
  }

  // Calculate experience needed for next level
  static experienceForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  // Add experience and handle level ups
  async addExperience(amount: number): Promise<{ leveledUp: boolean; newLevel: number }> {
    let leveledUp = false;
    this.experience += amount;

    while (this.experience >= Player.experienceForLevel(this.level) && this.level < 100) {
      this.experience -= Player.experienceForLevel(this.level);
      this.level += 1;
      this.maxEnergy = Player.calculateMaxEnergy(this.level);
      leveledUp = true;
    }

    await this.save();
    return { leveledUp, newLevel: this.level };
  }

  // Consume energy
  async consumeEnergy(amount: number): Promise<boolean> {
    if (this.energy < amount) return false;
    this.energy -= amount;
    await this.save();
    return true;
  }

  // Refill energy (called periodically)
  async refillEnergy(): Promise<number> {
    const now = new Date();
    const minutesPassed = Math.floor((now.getTime() - this.lastEnergyRefresh.getTime()) / 60000);
    const energyToAdd = Math.floor(minutesPassed / 5); // 1 energy per 5 minutes

    if (energyToAdd > 0) {
      this.energy = Math.min(this.maxEnergy, this.energy + energyToAdd);
      this.lastEnergyRefresh = now;
      await this.save();
    }

    return this.energy;
  }

  // Safe JSON representation (excludes password)
  toSafeJSON(): Omit<PlayerAttributes, 'passwordHash'> {
    const { passwordHash, ...safe } = this.toJSON() as PlayerAttributes;
    return safe;
  }
}

// Initialize Player model
Player.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        isAlphanumeric: true,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 100,
      },
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    crystals: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 500,
      validate: {
        min: 0,
      },
    },
    gold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10000,
      validate: {
        min: 0,
      },
    },
    energy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
      validate: {
        min: 0,
      },
    },
    maxEnergy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 80,
      validate: {
        min: 80,
      },
    },
    arenaTickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 0,
      },
    },
    maxArenaTickets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    arenaPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1000,
      validate: {
        min: 0,
      },
    },
    guildId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'guilds',
        key: 'id',
      },
    },
    lastEnergyRefresh: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'players',
    modelName: 'Player',
    hooks: {
      beforeCreate: async (player) => {
        if (player.passwordHash && !player.passwordHash.startsWith('$2')) {
          player.passwordHash = await bcrypt.hash(player.passwordHash, 12);
        }
      },
      beforeUpdate: async (player) => {
        if (player.changed('passwordHash') && !player.passwordHash.startsWith('$2')) {
          player.passwordHash = await bcrypt.hash(player.passwordHash, 12);
        }
      },
    },
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['email'] },
      { fields: ['guild_id'] },
      { fields: ['arena_points'] },
    ],
  }
);

export default Player;
