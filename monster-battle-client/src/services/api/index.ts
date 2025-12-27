/**
 * API Services
 * Export all API services for easy imports
 */

export { apiClient } from './apiClient';
export { authService } from './authService';
export { playerService } from './playerService';
export { arenaService } from './arenaService';
export { guildService } from './guildService';
export { runeService } from './runeService';
export { campaignService } from './campaignService';

// Re-export types
export type { ArenaState, ArenaOpponent, ArenaBattleResult, ArenaWeeklyReward } from './arenaService';
export type { GuildState } from './guildService';
export type { RuneUpgradeResult } from './runeService';
export type { CampaignRegion, CampaignStage, StageEnemy, StageReward, CampaignProgress } from './campaignService';
export type { PlayerProfile, PlayerResources, PlayerInventory } from './playerService';
