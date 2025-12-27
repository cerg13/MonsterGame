// Export all models
export { default as Player, type PlayerAttributes, type PlayerCreationAttributes } from './Player';
export { default as Monster, type MonsterAttributes, type Element, type Rarity } from './Monster';
export { default as PlayerMonster, type PlayerMonsterAttributes, type PlayerMonsterCreationAttributes } from './PlayerMonster';
export { default as Rune, type RuneAttributes, type RuneCreationAttributes, type RuneSet, type StatType, type RuneStat } from './Rune';
export { default as Achievement, PlayerAchievement, type AchievementAttributes, type AchievementCategory, type AchievementReward, type PlayerAchievementAttributes } from './Achievement';
export { default as Quest, PlayerQuest, type QuestAttributes, type QuestType, type QuestAction, type QuestRequirement, type QuestReward, type PlayerQuestAttributes } from './Quest';
export { default as Guild, GuildMember, type GuildAttributes, type GuildMemberAttributes, type GuildRole } from './Guild';

// Import models for associations
import Player from './Player';
import Monster from './Monster';
import PlayerMonster from './PlayerMonster';
import Rune from './Rune';
import Achievement, { PlayerAchievement } from './Achievement';
import Quest, { PlayerQuest } from './Quest';
import Guild, { GuildMember } from './Guild';

/**
 * Setup model associations
 * Call this after database initialization
 */
export function setupAssociations(): void {
  // Player <-> Guild (many-to-one)
  Player.belongsTo(Guild, {
    foreignKey: 'guildId',
    as: 'guild',
  });
  Guild.hasMany(Player, {
    foreignKey: 'guildId',
    as: 'members',
  });

  // Player <-> PlayerMonster (one-to-many)
  Player.hasMany(PlayerMonster, {
    foreignKey: 'playerId',
    as: 'monsters',
    onDelete: 'CASCADE',
  });
  PlayerMonster.belongsTo(Player, {
    foreignKey: 'playerId',
    as: 'owner',
  });

  // Monster (template) <-> PlayerMonster (one-to-many)
  Monster.hasMany(PlayerMonster, {
    foreignKey: 'monsterId',
    as: 'instances',
  });
  PlayerMonster.belongsTo(Monster, {
    foreignKey: 'monsterId',
    as: 'template',
  });

  // Player <-> Rune (one-to-many)
  Player.hasMany(Rune, {
    foreignKey: 'playerId',
    as: 'runes',
    onDelete: 'CASCADE',
  });
  Rune.belongsTo(Player, {
    foreignKey: 'playerId',
    as: 'owner',
  });

  // PlayerMonster <-> Rune (one-to-many, for equipped runes)
  PlayerMonster.hasMany(Rune, {
    foreignKey: 'equippedTo',
    as: 'equippedRunes',
  });
  Rune.belongsTo(PlayerMonster, {
    foreignKey: 'equippedTo',
    as: 'equippedMonster',
  });

  // Player <-> PlayerAchievement (one-to-many)
  Player.hasMany(PlayerAchievement, {
    foreignKey: 'playerId',
    as: 'achievements',
    onDelete: 'CASCADE',
  });
  PlayerAchievement.belongsTo(Player, {
    foreignKey: 'playerId',
    as: 'player',
  });

  // Achievement (template) <-> PlayerAchievement (one-to-many)
  Achievement.hasMany(PlayerAchievement, {
    foreignKey: 'achievementId',
    as: 'playerProgress',
  });
  PlayerAchievement.belongsTo(Achievement, {
    foreignKey: 'achievementId',
    as: 'achievement',
  });

  // Player <-> PlayerQuest (one-to-many)
  Player.hasMany(PlayerQuest, {
    foreignKey: 'playerId',
    as: 'quests',
    onDelete: 'CASCADE',
  });
  PlayerQuest.belongsTo(Player, {
    foreignKey: 'playerId',
    as: 'player',
  });

  // Quest (template) <-> PlayerQuest (one-to-many)
  Quest.hasMany(PlayerQuest, {
    foreignKey: 'questId',
    as: 'playerProgress',
  });
  PlayerQuest.belongsTo(Quest, {
    foreignKey: 'questId',
    as: 'quest',
  });

  // Guild <-> GuildMember (one-to-many)
  Guild.hasMany(GuildMember, {
    foreignKey: 'guildId',
    as: 'memberDetails',
    onDelete: 'CASCADE',
  });
  GuildMember.belongsTo(Guild, {
    foreignKey: 'guildId',
    as: 'guild',
  });

  // Player <-> GuildMember (one-to-one)
  Player.hasOne(GuildMember, {
    foreignKey: 'playerId',
    as: 'guildMembership',
    onDelete: 'CASCADE',
  });
  GuildMember.belongsTo(Player, {
    foreignKey: 'playerId',
    as: 'player',
  });

  console.log('📦 Model associations configured');
}

// Export all models as default
export default {
  Player,
  Monster,
  PlayerMonster,
  Rune,
  Achievement,
  PlayerAchievement,
  Quest,
  PlayerQuest,
  Guild,
  GuildMember,
};
