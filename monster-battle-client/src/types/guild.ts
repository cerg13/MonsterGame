/**
 * Guild System Types
 *
 * Defines the guild system:
 * - Guild structure and ranks
 * - Guild members
 * - Guild wars
 * - Guild shop and rewards
 */

// Guild member ranks
export type GuildRank = 'leader' | 'vice_leader' | 'senior' | 'member';

// Guild rank permissions
export const GUILD_RANK_PERMISSIONS: Record<GuildRank, {
  canKick: boolean;
  canInvite: boolean;
  canEditInfo: boolean;
  canStartWar: boolean;
  canPromote: boolean;
}> = {
  leader: { canKick: true, canInvite: true, canEditInfo: true, canStartWar: true, canPromote: true },
  vice_leader: { canKick: true, canInvite: true, canEditInfo: false, canStartWar: true, canPromote: false },
  senior: { canKick: false, canInvite: true, canEditInfo: false, canStartWar: false, canPromote: false },
  member: { canKick: false, canInvite: false, canEditInfo: false, canStartWar: false, canPromote: false },
};

// Guild rank display info
export const GUILD_RANK_INFO: Record<GuildRank, { name: string; color: string; icon: string }> = {
  leader: { name: 'Leader', color: '#ffd700', icon: '👑' },
  vice_leader: { name: 'Vice Leader', color: '#c0c0c0', icon: '⭐' },
  senior: { name: 'Senior', color: '#cd7f32', icon: '🔹' },
  member: { name: 'Member', color: '#888888', icon: '👤' },
};

// Guild member
export interface GuildMember {
  id: string;
  username: string;
  level: number;
  rank: GuildRank;
  contribution: number;
  lastActive: Date;
  joinedAt: Date;
  weeklyContribution: number;
  defenseTeamPower: number;
}

// Guild info
export interface Guild {
  id: string;
  name: string;
  tag: string; // 2-4 character tag like [ABC]
  description: string;
  icon: string; // Emoji icon
  level: number;
  experience: number;
  memberCount: number;
  maxMembers: number;
  leaderName: string;
  createdAt: Date;

  // Requirements
  minLevel: number;
  isPublic: boolean;

  // Stats
  totalContribution: number;
  weeklyRanking: number;
  warWins: number;
  warLosses: number;
}

// Guild war status
export type GuildWarStatus = 'idle' | 'matching' | 'preparation' | 'battle' | 'ended';

// Guild war
export interface GuildWar {
  id: string;
  status: GuildWarStatus;
  enemyGuild: {
    id: string;
    name: string;
    tag: string;
    level: number;
  };
  startTime: Date | null;
  endTime: Date | null;
  ourScore: number;
  enemyScore: number;
  ourAttacksRemaining: number;
  attacksPerMember: number;
}

// Guild war attack result
export interface GuildWarAttack {
  id: string;
  attackerId: string;
  attackerName: string;
  defenderId: string;
  defenderName: string;
  result: 'victory' | 'defeat';
  points: number;
  timestamp: Date;
}

// Guild defense setup
export interface GuildDefense {
  guildId: string;
  playerId: string;
  position: number;
  monsters: string[];
  defeatedBy: string | null;
  attackCount: number;
}

// Guild war stats
export interface GuildWarStats {
  swordsUsed: number;
  maxSwords: number;
  victories: number;
  defeats: number;
  totalPoints: number;
}

// Guild shop item
export interface GuildShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number; // Guild points
  stock: number; // -1 for unlimited
  weeklyLimit: number;
  type: 'scroll' | 'material' | 'rune' | 'currency';
}

// Guild shop
export const GUILD_SHOP_ITEMS: GuildShopItem[] = [
  { id: 'mystical_scroll', name: 'Mystical Scroll', description: 'Summon a 3-5★ monster', icon: '📜', cost: 150, stock: -1, weeklyLimit: 1, type: 'scroll' },
  { id: 'fire_essence_mid', name: 'Fire Essence (Mid)', description: 'Awakening material', icon: '🔥', cost: 50, stock: -1, weeklyLimit: 5, type: 'material' },
  { id: 'water_essence_mid', name: 'Water Essence (Mid)', description: 'Awakening material', icon: '💧', cost: 50, stock: -1, weeklyLimit: 5, type: 'material' },
  { id: 'wind_essence_mid', name: 'Wind Essence (Mid)', description: 'Awakening material', icon: '🌪️', cost: 50, stock: -1, weeklyLimit: 5, type: 'material' },
  { id: 'light_essence_mid', name: 'Light Essence (Mid)', description: 'Awakening material', icon: '✨', cost: 75, stock: -1, weeklyLimit: 3, type: 'material' },
  { id: 'dark_essence_mid', name: 'Dark Essence (Mid)', description: 'Awakening material', icon: '🌑', cost: 75, stock: -1, weeklyLimit: 3, type: 'material' },
  { id: 'rune_box_4star', name: '4★ Rune Box', description: 'Random 4★ rune', icon: '📦', cost: 100, stock: -1, weeklyLimit: 3, type: 'rune' },
  { id: 'gold_pack', name: 'Gold Pack', description: '50,000 Gold', icon: '🪙', cost: 30, stock: -1, weeklyLimit: 10, type: 'currency' },
  { id: 'energy_pack', name: 'Energy Pack', description: '50 Energy', icon: '⚡', cost: 40, stock: -1, weeklyLimit: 5, type: 'currency' },
];

// Guild check-in rewards
export interface GuildCheckInReward {
  day: number;
  guildPoints: number;
  bonusReward?: { type: string; amount: number };
}

export const GUILD_CHECKIN_REWARDS: GuildCheckInReward[] = [
  { day: 1, guildPoints: 10 },
  { day: 2, guildPoints: 15 },
  { day: 3, guildPoints: 20, bonusReward: { type: 'gold', amount: 5000 } },
  { day: 4, guildPoints: 20 },
  { day: 5, guildPoints: 25 },
  { day: 6, guildPoints: 30, bonusReward: { type: 'energy', amount: 30 } },
  { day: 7, guildPoints: 50, bonusReward: { type: 'crystals', amount: 20 } },
];

// Guild level requirements
export const GUILD_LEVEL_REQUIREMENTS: Record<number, { exp: number; maxMembers: number }> = {
  1: { exp: 0, maxMembers: 15 },
  2: { exp: 1000, maxMembers: 18 },
  3: { exp: 3000, maxMembers: 20 },
  4: { exp: 6000, maxMembers: 22 },
  5: { exp: 10000, maxMembers: 25 },
  6: { exp: 15000, maxMembers: 27 },
  7: { exp: 22000, maxMembers: 28 },
  8: { exp: 30000, maxMembers: 29 },
  9: { exp: 40000, maxMembers: 30 },
  10: { exp: 50000, maxMembers: 30 },
};

// Player's guild state
export interface PlayerGuildState {
  guildId: string | null;
  guild: Guild | null;
  myRank: GuildRank | null;
  members: GuildMember[];
  guildPoints: number;
  weeklyContribution: number;
  checkInStreak: number;
  lastCheckIn: Date | null;
  purchasedItems: Record<string, number>; // Item ID -> count this week
  currentWar: GuildWar | null;
  warAttacks: GuildWarAttack[];
}

// Create initial guild state
export function createInitialGuildState(): PlayerGuildState {
  return {
    guildId: null,
    guild: null,
    myRank: null,
    members: [],
    guildPoints: 0,
    weeklyContribution: 0,
    checkInStreak: 0,
    lastCheckIn: null,
    purchasedItems: {},
    currentWar: null,
    warAttacks: [],
  };
}

