import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// PlayerMonster attributes
export interface PlayerMonsterAttributes {
  id: string;
  playerId: string;
  monsterId: string;
  level: number;
  stars: number;
  experience: number;
  awakened: boolean;
  skillLevels: number[]; // [skill1Level, skill2Level, skill3Level]
  equippedRunes: (string | null)[]; // [slot1RuneId, ..., slot6RuneId]
  locked: boolean;
  inStorage: boolean;
  obtainedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayerMonsterCreationAttributes extends Optional<PlayerMonsterAttributes, 'id' | 'level' | 'stars' | 'experience' | 'awakened' | 'skillLevels' | 'equippedRunes' | 'locked' | 'inStorage' | 'obtainedAt' | 'createdAt' | 'updatedAt'> {}

export class PlayerMonster extends Model<PlayerMonsterAttributes, PlayerMonsterCreationAttributes> implements PlayerMonsterAttributes {
  declare id: string;
  declare playerId: string;
  declare monsterId: string;
  declare level: number;
  declare stars: number;
  declare experience: number;
  declare awakened: boolean;
  declare skillLevels: number[];
  declare equippedRunes: (string | null)[];
  declare locked: boolean;
  declare inStorage: boolean;
  declare obtainedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Experience needed to reach next level
  static experienceForLevel(level: number): number {
    return Math.floor(50 * Math.pow(1.3, level - 1));
  }

  // Add experience and handle level ups
  async addExperience(amount: number): Promise<{ leveledUp: boolean; newLevel: number }> {
    const maxLevel = 40;
    let leveledUp = false;

    this.experience += amount;

    while (this.experience >= PlayerMonster.experienceForLevel(this.level) && this.level < maxLevel) {
      this.experience -= PlayerMonster.experienceForLevel(this.level);
      this.level += 1;
      leveledUp = true;
    }

    // Cap experience at max level
    if (this.level >= maxLevel) {
      this.experience = 0;
    }

    await this.save();
    return { leveledUp, newLevel: this.level };
  }

  // Upgrade skill level (using devilmon/duplicates)
  async upgradeSkill(skillIndex: number): Promise<boolean> {
    const maxSkillLevel = 15;

    if (skillIndex < 0 || skillIndex >= this.skillLevels.length) {
      return false;
    }

    if (this.skillLevels[skillIndex] >= maxSkillLevel) {
      return false;
    }

    const newSkillLevels = [...this.skillLevels];
    newSkillLevels[skillIndex] += 1;
    this.skillLevels = newSkillLevels;

    await this.save();
    return true;
  }

  // Evolve monster (increase stars)
  async evolve(): Promise<boolean> {
    const maxStars = 6;

    if (this.stars >= maxStars || this.level < 40) {
      return false;
    }

    this.stars += 1;
    this.level = 1; // Reset level after evolution
    this.experience = 0;

    await this.save();
    return true;
  }

  // Awaken monster
  async awaken(): Promise<boolean> {
    if (this.awakened) {
      return false;
    }

    this.awakened = true;
    await this.save();
    return true;
  }

  // Equip rune to slot
  async equipRune(slot: number, runeId: string | null): Promise<boolean> {
    if (slot < 1 || slot > 6) {
      return false;
    }

    const newEquippedRunes = [...this.equippedRunes];
    newEquippedRunes[slot - 1] = runeId;
    this.equippedRunes = newEquippedRunes;

    await this.save();
    return true;
  }

  // Calculate power rating
  calculatePower(): number {
    // Base power from level and stars
    const basePower = this.level * 10 + this.stars * 100;

    // Skill bonus
    const skillBonus = this.skillLevels.reduce((sum, lvl) => sum + lvl * 5, 0);

    // Awakening bonus
    const awakenBonus = this.awakened ? 100 : 0;

    return basePower + skillBonus + awakenBonus;
  }
}

PlayerMonster.init(
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
    monsterId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'monsters',
        key: 'id',
      },
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 40,
      },
    },
    stars: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 6,
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
    awakened: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    skillLevels: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [1, 1, 1],
    },
    equippedRunes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [null, null, null, null, null, null],
    },
    locked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    inStorage: {
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
    tableName: 'player_monsters',
    modelName: 'PlayerMonster',
    indexes: [
      { fields: ['player_id'] },
      { fields: ['monster_id'] },
      { fields: ['player_id', 'locked'] },
      { fields: ['player_id', 'in_storage'] },
    ],
  }
);

export default PlayerMonster;
