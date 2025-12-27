import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PlayerGuildState,
  Guild,
  GuildMember,
  GuildRank,
  GuildShopItem,
} from '../types/guild';
import {
  createInitialGuildState,
  GUILD_SHOP_ITEMS,
  GUILD_CHECKIN_REWARDS,
  GUILD_RANK_PERMISSIONS,
} from '../types/guild';
import { guildService } from '../services/api';

interface GuildState extends PlayerGuildState {
  // Search results
  searchResults: Guild[];
  isSearching: boolean;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Guild Management
  fetchState: () => Promise<void>;
  searchGuilds: (query: string) => Promise<void>;
  joinGuild: (guildId: string) => Promise<{ success: boolean; error?: string }>;
  leaveGuild: () => Promise<{ success: boolean; error?: string }>;
  createGuild: (name: string, tag: string, description: string, icon: string) => Promise<{ success: boolean; error?: string }>;

  // Actions - Member Management
  promoteMember: (memberId: string) => { success: boolean; error?: string };
  demoteMember: (memberId: string) => { success: boolean; error?: string };
  kickMember: (memberId: string) => { success: boolean; error?: string };

  // Actions - Daily
  checkIn: () => Promise<{ success: boolean; points: number; bonusReward?: { type: string; amount: number } }>;
  canCheckIn: () => boolean;

  // Actions - Shop
  purchaseItem: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  canPurchaseItem: (itemId: string) => { canPurchase: boolean; reason?: string };

  // Actions - Contribution
  addContribution: (amount: number) => void;

  // Reset
  resetGuild: () => void;
}

export const useGuildStore = create<GuildState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...createInitialGuildState(),
      searchResults: [],
      isSearching: false,
      isLoading: false,
      error: null,

      // Fetch guild state from server
      fetchState: async () => {
        set({ isLoading: true, error: null });
        const response = await guildService.getState();

        if (response.success && response.state) {
          set({
            guildId: response.state.guildId,
            guild: response.state.guild,
            myRank: response.state.myRank,
            guildPoints: response.state.guildPoints,
            weeklyContribution: response.state.weeklyContribution,
            checkInStreak: response.state.checkInStreak,
            lastCheckIn: response.state.lastCheckIn ? new Date(response.state.lastCheckIn) : null,
            purchasedItems: response.state.purchasedItems,
            isLoading: false,
          });

          // If in a guild, fetch members
          if (response.state.guildId) {
            const membersResponse = await guildService.getMembers(response.state.guildId);
            if (membersResponse.success && membersResponse.members) {
              set({ members: membersResponse.members });
            }
          }
        } else {
          set({ isLoading: false, error: response.error || 'Failed to fetch guild state' });
        }
      },

      // Search guilds
      searchGuilds: async (query) => {
        set({ isSearching: true });
        const response = await guildService.searchGuilds(query);

        if (response.success && response.guilds) {
          set({ searchResults: response.guilds, isSearching: false });
        } else {
          set({ searchResults: [], isSearching: false, error: response.error });
        }
      },

      // Join guild
      joinGuild: async (guildId) => {
        const state = get();
        if (state.guildId) {
          return { success: false, error: 'Already in a guild' };
        }

        const response = await guildService.joinGuild(guildId);

        if (response.success && response.guild) {
          // Fetch members after joining
          const membersResponse = await guildService.getMembers(guildId);

          set({
            guildId: response.guild.id,
            guild: response.guild,
            myRank: 'member',
            members: membersResponse.members || [],
            searchResults: [],
          });

          return { success: true };
        }

        return { success: false, error: response.error };
      },

      // Leave guild
      leaveGuild: async () => {
        const state = get();
        if (!state.guildId) {
          return { success: false, error: 'Not in a guild' };
        }

        if (state.myRank === 'leader') {
          return { success: false, error: 'Leader must transfer leadership first' };
        }

        const response = await guildService.leaveGuild();

        if (response.success) {
          set({
            ...createInitialGuildState(),
            searchResults: state.searchResults,
            isLoading: false,
            error: null,
          });
          return { success: true };
        }

        return { success: false, error: response.error };
      },

      // Create guild
      createGuild: async (name, tag, description, icon) => {
        const state = get();
        if (state.guildId) {
          return { success: false, error: 'Already in a guild' };
        }

        if (name.length < 3 || name.length > 20) {
          return { success: false, error: 'Name must be 3-20 characters' };
        }

        if (tag.length < 2 || tag.length > 4) {
          return { success: false, error: 'Tag must be 2-4 characters' };
        }

        const response = await guildService.createGuild(name, tag, description, icon);

        if (response.success && response.guild) {
          const selfMember: GuildMember = {
            id: 'self',
            username: 'You',
            level: 35,
            rank: 'leader',
            contribution: 0,
            lastActive: new Date(),
            joinedAt: new Date(),
            weeklyContribution: 0,
            defenseTeamPower: 40000,
          };

          set({
            guildId: response.guild.id,
            guild: response.guild,
            myRank: 'leader',
            members: [selfMember],
          });

          return { success: true };
        }

        return { success: false, error: response.error };
      },

      // Promote member
      promoteMember: (memberId) => {
        const state = get();
        if (!state.myRank || !GUILD_RANK_PERMISSIONS[state.myRank].canPromote) {
          return { success: false, error: 'No permission to promote' };
        }

        const member = state.members.find((m) => m.id === memberId);
        if (!member) {
          return { success: false, error: 'Member not found' };
        }

        const promotionPath: Record<GuildRank, GuildRank | null> = {
          member: 'senior',
          senior: 'vice_leader',
          vice_leader: null,
          leader: null,
        };

        const newRank = promotionPath[member.rank];
        if (!newRank) {
          return { success: false, error: 'Cannot promote further' };
        }

        set({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, rank: newRank } : m
          ),
        });

        return { success: true };
      },

      // Demote member
      demoteMember: (memberId) => {
        const state = get();
        if (!state.myRank || !GUILD_RANK_PERMISSIONS[state.myRank].canPromote) {
          return { success: false, error: 'No permission to demote' };
        }

        const member = state.members.find((m) => m.id === memberId);
        if (!member) {
          return { success: false, error: 'Member not found' };
        }

        const demotionPath: Record<GuildRank, GuildRank | null> = {
          member: null,
          senior: 'member',
          vice_leader: 'senior',
          leader: null,
        };

        const newRank = demotionPath[member.rank];
        if (!newRank) {
          return { success: false, error: 'Cannot demote further' };
        }

        set({
          members: state.members.map((m) =>
            m.id === memberId ? { ...m, rank: newRank } : m
          ),
        });

        return { success: true };
      },

      // Kick member
      kickMember: (memberId) => {
        const state = get();
        if (!state.myRank || !GUILD_RANK_PERMISSIONS[state.myRank].canKick) {
          return { success: false, error: 'No permission to kick' };
        }

        const member = state.members.find((m) => m.id === memberId);
        if (!member) {
          return { success: false, error: 'Member not found' };
        }

        if (member.rank === 'leader') {
          return { success: false, error: 'Cannot kick the leader' };
        }

        set({
          members: state.members.filter((m) => m.id !== memberId),
          guild: state.guild
            ? { ...state.guild, memberCount: state.guild.memberCount - 1 }
            : null,
        });

        return { success: true };
      },

      // Check in
      checkIn: async () => {
        const state = get();
        if (!state.guildId) {
          return { success: false, points: 0 };
        }

        if (!get().canCheckIn()) {
          return { success: false, points: 0 };
        }

        const response = await guildService.checkIn();

        if (response.success && response.points !== undefined) {
          const newStreak = (state.checkInStreak % 7) + 1;

          set({
            checkInStreak: newStreak,
            lastCheckIn: new Date(),
            guildPoints: state.guildPoints + response.points,
            weeklyContribution: state.weeklyContribution + response.points,
          });

          return {
            success: true,
            points: response.points,
            bonusReward: response.bonus,
          };
        }

        // Fallback to local calculation
        const newStreak = (state.checkInStreak % 7) + 1;
        const reward = GUILD_CHECKIN_REWARDS[newStreak - 1];

        set({
          checkInStreak: newStreak,
          lastCheckIn: new Date(),
          guildPoints: state.guildPoints + reward.guildPoints,
          weeklyContribution: state.weeklyContribution + reward.guildPoints,
        });

        return {
          success: true,
          points: reward.guildPoints,
          bonusReward: reward.bonusReward,
        };
      },

      // Can check in
      canCheckIn: () => {
        const state = get();
        if (!state.guildId) return false;
        if (!state.lastCheckIn) return true;

        const lastCheckIn = new Date(state.lastCheckIn);
        const now = new Date();

        // Check if it's a new day
        return (
          lastCheckIn.getDate() !== now.getDate() ||
          lastCheckIn.getMonth() !== now.getMonth() ||
          lastCheckIn.getFullYear() !== now.getFullYear()
        );
      },

      // Can purchase item
      canPurchaseItem: (itemId) => {
        const state = get();
        const item = GUILD_SHOP_ITEMS.find((i) => i.id === itemId);

        if (!item) {
          return { canPurchase: false, reason: 'Item not found' };
        }

        if (state.guildPoints < item.cost) {
          return { canPurchase: false, reason: 'Not enough guild points' };
        }

        const purchased = state.purchasedItems[itemId] || 0;
        if (purchased >= item.weeklyLimit) {
          return { canPurchase: false, reason: 'Weekly limit reached' };
        }

        return { canPurchase: true };
      },

      // Purchase item
      purchaseItem: async (itemId) => {
        const state = get();
        const check = get().canPurchaseItem(itemId);

        if (!check.canPurchase) {
          return { success: false, error: check.reason };
        }

        const response = await guildService.purchaseItem(itemId);

        if (response.success) {
          const item = GUILD_SHOP_ITEMS.find((i) => i.id === itemId)!;

          set({
            guildPoints: state.guildPoints - item.cost,
            purchasedItems: {
              ...state.purchasedItems,
              [itemId]: (state.purchasedItems[itemId] || 0) + 1,
            },
          });

          return { success: true };
        }

        return { success: false, error: response.error };
      },

      // Add contribution
      addContribution: (amount) => {
        set((state) => ({
          weeklyContribution: state.weeklyContribution + amount,
          guild: state.guild
            ? { ...state.guild, totalContribution: state.guild.totalContribution + amount }
            : null,
        }));
      },

      // Reset guild
      resetGuild: () => {
        set({
          ...createInitialGuildState(),
          searchResults: [],
          isSearching: false,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'monster-battle-guild',
      partialize: (state) => ({
        guildId: state.guildId,
        guild: state.guild,
        myRank: state.myRank,
        guildPoints: state.guildPoints,
        weeklyContribution: state.weeklyContribution,
        checkInStreak: state.checkInStreak,
        lastCheckIn: state.lastCheckIn,
        purchasedItems: state.purchasedItems,
      }),
    }
  )
);

// Selectors
export const selectGuild = (state: GuildState) => state.guild;
export const selectGuildMembers = (state: GuildState) => state.members;
export const selectMyRank = (state: GuildState) => state.myRank;
export const selectGuildPoints = (state: GuildState) => state.guildPoints;
export const selectSearchResults = (state: GuildState) => state.searchResults;
