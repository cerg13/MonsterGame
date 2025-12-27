import { v4 as uuidv4 } from 'uuid';

// Types
export type GuildRank = 'leader' | 'vice_leader' | 'senior' | 'member';

export interface Guild {
  id: string;
  name: string;
  tag: string;
  icon: string;
  description: string;
  level: number;
  experience: number;
  memberCount: number;
  maxMembers: number;
  minLevel: number;
  isPublic: boolean;
  warWins: number;
  warLosses: number;
  totalContribution: number;
  weeklyRanking: number;
  createdAt: Date;
}

export interface GuildMember {
  id: string;
  userId: string;
  username: string;
  level: number;
  rank: GuildRank;
  contribution: number;
  weeklyContribution: number;
  lastActive: Date;
  joinedAt: Date;
  defenseTeamPower: number;
}

export interface GuildShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  weeklyLimit: number;
  rewardType: string;
  rewardAmount: number;
}

export interface PlayerGuildState {
  guildId: string | null;
  guild: Guild | null;
  myRank: GuildRank | null;
  guildPoints: number;
  weeklyContribution: number;
  checkInStreak: number;
  lastCheckIn: Date | null;
  purchasedItems: Record<string, number>;
}

// Constants
const GUILD_LEVEL_REQUIREMENTS: Record<number, { exp: number; maxMembers: number }> = {
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

const CHECKIN_REWARDS = [
  { day: 1, points: 10 },
  { day: 2, points: 15 },
  { day: 3, points: 20, bonus: { type: 'gold', amount: 5000 } },
  { day: 4, points: 25 },
  { day: 5, points: 30 },
  { day: 6, points: 40, bonus: { type: 'crystal', amount: 10 } },
  { day: 7, points: 50, bonus: { type: 'energy', amount: 50 } },
];

const GUILD_SHOP_ITEMS: GuildShopItem[] = [
  { id: 'energy_50', name: 'Energy x50', description: 'Restore 50 energy', icon: '⚡', cost: 100, weeklyLimit: 3, rewardType: 'energy', rewardAmount: 50 },
  { id: 'gold_10k', name: 'Gold x10,000', description: '10,000 gold', icon: '💰', cost: 50, weeklyLimit: 5, rewardType: 'gold', rewardAmount: 10000 },
  { id: 'crystal_10', name: 'Crystal x10', description: '10 crystals', icon: '💎', cost: 200, weeklyLimit: 2, rewardType: 'crystal', rewardAmount: 10 },
  { id: 'rune_box', name: 'Rune Box', description: 'Random 4-6★ rune', icon: '📦', cost: 300, weeklyLimit: 1, rewardType: 'rune_box', rewardAmount: 1 },
  { id: 'scroll_mystical', name: 'Mystical Scroll', description: 'Summon scroll', icon: '📜', cost: 500, weeklyLimit: 1, rewardType: 'scroll', rewardAmount: 1 },
];

const RANK_PERMISSIONS: Record<GuildRank, { canKick: boolean; canInvite: boolean; canPromote: boolean }> = {
  leader: { canKick: true, canInvite: true, canPromote: true },
  vice_leader: { canKick: true, canInvite: true, canPromote: true },
  senior: { canKick: false, canInvite: true, canPromote: false },
  member: { canKick: false, canInvite: false, canPromote: false },
};

/**
 * Guild Service
 * Handles guild management logic
 */
export class GuildService {
  private guilds: Map<string, Guild> = new Map();
  private guildMembers: Map<string, GuildMember[]> = new Map();
  private playerStates: Map<string, PlayerGuildState> = new Map();

  constructor() {
    // Create some initial guilds for search
    this.createInitialGuilds();
  }

  private createInitialGuilds(): void {
    const guildData = [
      { name: 'Dragon Slayers', tag: 'DRG', icon: '🐉', level: 8 },
      { name: 'Phoenix Rising', tag: 'PHX', icon: '🔥', level: 6 },
      { name: 'Shadow Legion', tag: 'SHD', icon: '👥', level: 7 },
      { name: 'Storm Riders', tag: 'STM', icon: '⚡', level: 5 },
      { name: 'Crystal Guard', tag: 'CRY', icon: '💎', level: 4 },
    ];

    for (const data of guildData) {
      const guild: Guild = {
        id: uuidv4(),
        name: data.name,
        tag: data.tag,
        icon: data.icon,
        description: `Welcome to ${data.name}! Active guild looking for members.`,
        level: data.level,
        experience: GUILD_LEVEL_REQUIREMENTS[data.level].exp,
        memberCount: 10 + Math.floor(Math.random() * 10),
        maxMembers: GUILD_LEVEL_REQUIREMENTS[data.level].maxMembers,
        minLevel: 10,
        isPublic: true,
        warWins: Math.floor(Math.random() * 50),
        warLosses: Math.floor(Math.random() * 30),
        totalContribution: Math.floor(Math.random() * 100000),
        weeklyRanking: Math.floor(Math.random() * 500) + 1,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      };
      this.guilds.set(guild.id, guild);
      this.guildMembers.set(guild.id, this.generateMembers(guild.memberCount));
    }
  }

  private generateMembers(count: number): GuildMember[] {
    const names = ['Knight', 'Mage', 'Warrior', 'Hunter', 'Sage', 'Champion', 'Master', 'Lord'];
    const members: GuildMember[] = [];

    // Add leader
    members.push({
      id: uuidv4(),
      userId: uuidv4(),
      username: `Guild${names[0]}`,
      level: 50,
      rank: 'leader',
      contribution: 50000,
      weeklyContribution: 500,
      lastActive: new Date(),
      joinedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
      defenseTeamPower: 80000,
    });

    // Add vice leaders
    for (let i = 0; i < 2; i++) {
      members.push({
        id: uuidv4(),
        userId: uuidv4(),
        username: `Vice${names[i + 1]}${i}`,
        level: 45 + Math.floor(Math.random() * 5),
        rank: 'vice_leader',
        contribution: 30000 + Math.floor(Math.random() * 10000),
        weeklyContribution: 300 + Math.floor(Math.random() * 200),
        lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        joinedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        defenseTeamPower: 60000 + Math.floor(Math.random() * 20000),
      });
    }

    // Add other members
    for (let i = 3; i < count; i++) {
      const isSenior = Math.random() > 0.7;
      members.push({
        id: uuidv4(),
        userId: uuidv4(),
        username: `${names[Math.floor(Math.random() * names.length)]}${Math.floor(Math.random() * 1000)}`,
        level: 20 + Math.floor(Math.random() * 30),
        rank: isSenior ? 'senior' : 'member',
        contribution: Math.floor(Math.random() * 20000),
        weeklyContribution: Math.floor(Math.random() * 300),
        lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        joinedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        defenseTeamPower: 20000 + Math.floor(Math.random() * 40000),
      });
    }

    return members;
  }

  /**
   * Get player guild state
   */
  public getPlayerState(userId: string): PlayerGuildState {
    let state = this.playerStates.get(userId);

    if (!state) {
      state = {
        guildId: null,
        guild: null,
        myRank: null,
        guildPoints: 0,
        weeklyContribution: 0,
        checkInStreak: 0,
        lastCheckIn: null,
        purchasedItems: {},
      };
      this.playerStates.set(userId, state);
    }

    return state;
  }

  /**
   * Search guilds
   */
  public searchGuilds(query: string): Guild[] {
    const lowerQuery = query.toLowerCase();
    const results: Guild[] = [];

    for (const guild of this.guilds.values()) {
      if (
        guild.name.toLowerCase().includes(lowerQuery) ||
        guild.tag.toLowerCase().includes(lowerQuery) ||
        query === ''
      ) {
        results.push(guild);
      }
    }

    return results.slice(0, 20);
  }

  /**
   * Join guild
   */
  public joinGuild(userId: string, guildId: string, username: string, level: number): { success: boolean; error?: string } {
    const state = this.getPlayerState(userId);

    if (state.guild) {
      return { success: false, error: 'Already in a guild' };
    }

    const guild = this.guilds.get(guildId);
    if (!guild) {
      return { success: false, error: 'Guild not found' };
    }

    if (guild.memberCount >= guild.maxMembers) {
      return { success: false, error: 'Guild is full' };
    }

    if (level < guild.minLevel) {
      return { success: false, error: `Minimum level ${guild.minLevel} required` };
    }

    // Add member
    const members = this.guildMembers.get(guildId) || [];
    const newMember: GuildMember = {
      id: uuidv4(),
      userId: userId,
      username,
      level,
      rank: 'member',
      contribution: 0,
      weeklyContribution: 0,
      lastActive: new Date(),
      joinedAt: new Date(),
      defenseTeamPower: 0,
    };
    members.push(newMember);
    this.guildMembers.set(guildId, members);

    // Update guild
    guild.memberCount++;

    // Update player state
    state.guildId = guildId;
    state.guild = guild;
    state.myRank = 'member';

    return { success: true };
  }

  /**
   * Leave guild
   */
  public leaveGuild(userId: string): { success: boolean; error?: string } {
    const state = this.getPlayerState(userId);

    if (!state.guild) {
      return { success: false, error: 'Not in a guild' };
    }

    if (state.myRank === 'leader') {
      return { success: false, error: 'Leader cannot leave. Transfer leadership first.' };
    }

    const guildId = state.guildId!;
    const members = this.guildMembers.get(guildId) || [];
    const memberIndex = members.findIndex(m => m.userId === userId);

    if (memberIndex !== -1) {
      members.splice(memberIndex, 1);
      const guild = this.guilds.get(guildId);
      if (guild) guild.memberCount--;
    }

    // Reset player state
    state.guildId = null;
    state.guild = null;
    state.myRank = null;
    state.guildPoints = 0;
    state.weeklyContribution = 0;
    state.checkInStreak = 0;

    return { success: true };
  }

  /**
   * Create guild
   */
  public createGuild(
    userId: string,
    username: string,
    level: number,
    name: string,
    tag: string,
    description: string,
    icon: string
  ): { success: boolean; guild?: Guild; error?: string } {
    const state = this.getPlayerState(userId);

    if (state.guild) {
      return { success: false, error: 'Already in a guild' };
    }

    if (name.length < 3 || name.length > 20) {
      return { success: false, error: 'Name must be 3-20 characters' };
    }

    if (tag.length < 2 || tag.length > 4) {
      return { success: false, error: 'Tag must be 2-4 characters' };
    }

    const guild: Guild = {
      id: uuidv4(),
      name,
      tag: tag.toUpperCase(),
      icon,
      description,
      level: 1,
      experience: 0,
      memberCount: 1,
      maxMembers: GUILD_LEVEL_REQUIREMENTS[1].maxMembers,
      minLevel: 1,
      isPublic: true,
      warWins: 0,
      warLosses: 0,
      totalContribution: 0,
      weeklyRanking: 999,
      createdAt: new Date(),
    };

    this.guilds.set(guild.id, guild);

    // Add creator as leader
    const members: GuildMember[] = [{
      id: uuidv4(),
      userId: userId,
      username,
      level,
      rank: 'leader',
      contribution: 0,
      weeklyContribution: 0,
      lastActive: new Date(),
      joinedAt: new Date(),
      defenseTeamPower: 0,
    }];
    this.guildMembers.set(guild.id, members);

    // Update player state
    state.guildId = guild.id;
    state.guild = guild;
    state.myRank = 'leader';

    return { success: true, guild };
  }

  /**
   * Get guild members
   */
  public getMembers(guildId: string): GuildMember[] {
    return this.guildMembers.get(guildId) || [];
  }

  /**
   * Daily check-in
   */
  public checkIn(userId: string): { success: boolean; points?: number; bonus?: { type: string; amount: number }; error?: string } {
    const state = this.getPlayerState(userId);

    if (!state.guild) {
      return { success: false, error: 'Not in a guild' };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (state.lastCheckIn) {
      const lastCheckInDate = new Date(state.lastCheckIn);
      const lastCheckInDay = new Date(lastCheckInDate.getFullYear(), lastCheckInDate.getMonth(), lastCheckInDate.getDate());

      if (lastCheckInDay.getTime() === today.getTime()) {
        return { success: false, error: 'Already checked in today' };
      }

      // Check if streak continues
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastCheckInDay.getTime() !== yesterday.getTime()) {
        state.checkInStreak = 0;
      }
    }

    // Get reward for current streak day
    const streakDay = (state.checkInStreak % 7) + 1;
    const reward = CHECKIN_REWARDS.find(r => r.day === streakDay) || CHECKIN_REWARDS[0];

    state.checkInStreak++;
    state.lastCheckIn = now;
    state.guildPoints += reward.points;

    return {
      success: true,
      points: reward.points,
      bonus: reward.bonus,
    };
  }

  /**
   * Purchase from guild shop
   */
  public purchaseItem(userId: string, itemId: string): { success: boolean; item?: GuildShopItem; error?: string } {
    const state = this.getPlayerState(userId);

    if (!state.guild) {
      return { success: false, error: 'Not in a guild' };
    }

    const item = GUILD_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) {
      return { success: false, error: 'Item not found' };
    }

    const purchased = state.purchasedItems[itemId] || 0;
    if (purchased >= item.weeklyLimit) {
      return { success: false, error: 'Weekly limit reached' };
    }

    if (state.guildPoints < item.cost) {
      return { success: false, error: 'Not enough guild points' };
    }

    state.guildPoints -= item.cost;
    state.purchasedItems[itemId] = purchased + 1;

    return { success: true, item };
  }

  /**
   * Get shop items
   */
  public getShopItems(): GuildShopItem[] {
    return GUILD_SHOP_ITEMS;
  }
}

// Export singleton
export const guildService = new GuildService();
