import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player, PlayerMonster, PlayerRune, TeamPreset } from '../types';
import type { PlayerEssences, EssenceType } from '../types/evolution';
import type { Element } from '../types/monster';
import { createEmptyEssences, EVOLUTION_REQUIREMENTS, AWAKENING_REQUIREMENTS, MAX_SKILL_LEVEL, SKILL_UPGRADE_COSTS } from '../types/evolution';
import { MAX_LEVEL_BY_STARS } from '../types/monster';

interface PlayerState {
  // Player data
  player: Player | null;
  isAuthenticated: boolean;

  // Inventory
  monsters: PlayerMonster[];
  runes: PlayerRune[];
  teamPresets: TeamPreset[];

  // Evolution/Awakening materials
  essences: PlayerEssences;
  devilmons: number;

  // Actions
  setPlayer: (player: Player) => void;
  logout: () => void;
  updateResources: (resources: Partial<Pick<Player, 'crystals' | 'gold' | 'energy'>>) => void;

  // Monster actions
  addMonster: (monster: PlayerMonster) => void;
  addMonsters: (monsters: PlayerMonster[]) => void;
  updateMonster: (id: string, updates: Partial<PlayerMonster>) => void;
  removeMonster: (id: string) => void;

  // Rune actions
  addRune: (rune: PlayerRune) => void;
  addRunes: (runes: PlayerRune[]) => void;
  updateRune: (id: string, updates: Partial<PlayerRune>) => void;
  removeRune: (id: string) => void;
  equipRune: (runeId: string, monsterId: string) => void;
  unequipRune: (runeId: string) => void;
  upgradeRune: (runeId: string, newLevel: number, newMainStatValue: number, newSubStats?: PlayerRune['subStats']) => void;
  sellRune: (runeId: string) => number; // returns gold gained
  getRunesForMonster: (monsterId: string) => PlayerRune[];
  getUnequippedRunes: () => PlayerRune[];

  // Team actions
  saveTeamPreset: (preset: TeamPreset) => void;
  deleteTeamPreset: (id: string) => void;

  // Evolution/Awakening actions
  addEssence: (element: Element, essenceType: EssenceType, quantity: number) => void;
  addDevilmons: (quantity: number) => void;
  evolveMonster: (monsterId: string, fodderIds: string[]) => { success: boolean; error?: string };
  awakenMonster: (monsterId: string) => { success: boolean; error?: string };
  upgradeSkill: (monsterId: string, skillIndex: number) => { success: boolean; error?: string };
  levelUpMonster: (monsterId: string, expGained: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      player: null,
      isAuthenticated: false,
      monsters: [],
      runes: [],
      teamPresets: [],
      essences: createEmptyEssences(),
      devilmons: 0,

      // Player actions
      setPlayer: (player) =>
        set({
          player,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          player: null,
          isAuthenticated: false,
          monsters: [],
          runes: [],
          teamPresets: [],
        }),

      updateResources: (resources) =>
        set((state) => ({
          player: state.player
            ? { ...state.player, ...resources }
            : null,
        })),

      // Monster actions
      addMonster: (monster) =>
        set((state) => ({
          monsters: [...state.monsters, monster],
        })),

      addMonsters: (monsters) =>
        set((state) => ({
          monsters: [...state.monsters, ...monsters],
        })),

      updateMonster: (id, updates) =>
        set((state) => ({
          monsters: state.monsters.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      removeMonster: (id) =>
        set((state) => ({
          monsters: state.monsters.filter((m) => m.id !== id),
        })),

      // Rune actions
      addRune: (rune) =>
        set((state) => ({
          runes: [...state.runes, rune],
        })),

      addRunes: (runes) =>
        set((state) => ({
          runes: [...state.runes, ...runes],
        })),

      updateRune: (id, updates) =>
        set((state) => ({
          runes: state.runes.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      removeRune: (id) =>
        set((state) => ({
          runes: state.runes.filter((r) => r.id !== id),
        })),

      equipRune: (runeId, monsterId) =>
        set((state) => {
          const rune = state.runes.find((r) => r.id === runeId);
          if (!rune) return state;

          // Unequip any rune in the same slot from this monster
          const updatedRunes = state.runes.map((r) => {
            if (r.id === runeId) {
              return { ...r, equippedTo: monsterId };
            }
            // Unequip if same monster and same slot
            if (r.equippedTo === monsterId && r.slot === rune.slot) {
              return { ...r, equippedTo: undefined };
            }
            return r;
          });

          return { runes: updatedRunes };
        }),

      unequipRune: (runeId) =>
        set((state) => ({
          runes: state.runes.map((r) =>
            r.id === runeId ? { ...r, equippedTo: undefined } : r
          ),
        })),

      upgradeRune: (runeId, newLevel, newMainStatValue, newSubStats) =>
        set((state) => ({
          runes: state.runes.map((r) =>
            r.id === runeId
              ? {
                  ...r,
                  level: newLevel,
                  mainStatValue: newMainStatValue,
                  subStats: newSubStats || r.subStats,
                }
              : r
          ),
        })),

      sellRune: (runeId) => {
        const state = get();
        const rune = state.runes.find((r) => r.id === runeId);
        if (!rune) return 0;

        // Calculate sell value based on rune quality
        const baseValue = 500;
        const starMultiplier = rune.stars;
        const levelMultiplier = 1 + rune.level * 0.1;
        const rarityMultipliers: Record<string, number> = {
          common: 1,
          magic: 1.5,
          rare: 2,
          hero: 3,
          legend: 5,
        };
        const goldGained = Math.floor(
          baseValue * starMultiplier * levelMultiplier * (rarityMultipliers[rune.rarity] || 1)
        );

        set((state) => ({
          runes: state.runes.filter((r) => r.id !== runeId),
          player: state.player
            ? { ...state.player, gold: state.player.gold + goldGained }
            : null,
        }));

        return goldGained;
      },

      getRunesForMonster: (monsterId) => {
        const state = get();
        return state.runes.filter((r) => r.equippedTo === monsterId);
      },

      getUnequippedRunes: () => {
        const state = get();
        return state.runes.filter((r) => !r.equippedTo);
      },

      // Team actions
      saveTeamPreset: (preset) =>
        set((state) => {
          const existing = state.teamPresets.findIndex((t) => t.id === preset.id);
          if (existing >= 0) {
            const newPresets = [...state.teamPresets];
            newPresets[existing] = preset;
            return { teamPresets: newPresets };
          }
          return { teamPresets: [...state.teamPresets, preset] };
        }),

      deleteTeamPreset: (id) =>
        set((state) => ({
          teamPresets: state.teamPresets.filter((t) => t.id !== id),
        })),

      // Evolution/Awakening actions
      addEssence: (element, essenceType, quantity) =>
        set((state) => ({
          essences: {
            ...state.essences,
            [element]: {
              ...state.essences[element],
              [essenceType]: state.essences[element][essenceType] + quantity,
            },
          },
        })),

      addDevilmons: (quantity) =>
        set((state) => ({
          devilmons: state.devilmons + quantity,
        })),

      evolveMonster: (monsterId, fodderIds) => {
        const state = get();
        const monster = state.monsters.find((m) => m.id === monsterId);
        if (!monster) return { success: false, error: 'Monster not found' };

        const requirements = EVOLUTION_REQUIREMENTS[monster.stars];
        if (!requirements) return { success: false, error: 'Cannot evolve further' };

        const maxLevel = MAX_LEVEL_BY_STARS[monster.stars];
        if (monster.level < maxLevel) {
          return { success: false, error: `Monster must be level ${maxLevel}` };
        }

        if (fodderIds.length !== requirements.fodderCount) {
          return { success: false, error: `Need ${requirements.fodderCount} fodder monsters` };
        }

        // Verify fodder monsters exist and have correct stars
        const fodderMonsters = fodderIds.map((id) => state.monsters.find((m) => m.id === id));
        for (const fodder of fodderMonsters) {
          if (!fodder) return { success: false, error: 'Fodder monster not found' };
          if (fodder.stars !== requirements.fodderStars) {
            return { success: false, error: `Fodder must be ${requirements.fodderStars}★` };
          }
          if (fodder.id === monsterId) {
            return { success: false, error: 'Cannot use same monster as fodder' };
          }
        }

        // Check gold
        if (!state.player || state.player.gold < requirements.goldCost) {
          return { success: false, error: 'Not enough gold' };
        }

        // Perform evolution
        set((state) => ({
          monsters: state.monsters
            .filter((m) => !fodderIds.includes(m.id))
            .map((m) =>
              m.id === monsterId
                ? { ...m, stars: requirements.targetStars, level: 1, experience: 0 }
                : m
            ),
          player: state.player
            ? { ...state.player, gold: state.player.gold - requirements.goldCost }
            : null,
        }));

        return { success: true };
      },

      awakenMonster: (monsterId) => {
        const state = get();
        const monster = state.monsters.find((m) => m.id === monsterId);
        if (!monster) return { success: false, error: 'Monster not found' };

        if (monster.awakened) {
          return { success: false, error: 'Monster already awakened' };
        }

        // Get monster template to find element and natural stars
        // For now we'll need to get this from somewhere - using a placeholder
        // In a real implementation, we'd look up the template
        const naturalStars = 3; // Placeholder - should come from template
        const element: Element = 'fire'; // Placeholder - should come from template

        const baseReqs = AWAKENING_REQUIREMENTS[naturalStars] || AWAKENING_REQUIREMENTS[3];

        // Check gold
        if (!state.player || state.player.gold < baseReqs.goldCost) {
          return { success: false, error: 'Not enough gold' };
        }

        // Check essences
        for (const mat of baseReqs.materials) {
          if (state.essences[element][mat.essenceType] < mat.quantity) {
            return { success: false, error: `Not enough ${mat.essenceType} essence` };
          }
        }

        // Perform awakening
        set((state) => {
          const newEssences = { ...state.essences };
          for (const mat of baseReqs.materials) {
            newEssences[element] = {
              ...newEssences[element],
              [mat.essenceType]: newEssences[element][mat.essenceType] - mat.quantity,
            };
          }

          return {
            monsters: state.monsters.map((m) =>
              m.id === monsterId ? { ...m, awakened: true } : m
            ),
            essences: newEssences,
            player: state.player
              ? { ...state.player, gold: state.player.gold - baseReqs.goldCost }
              : null,
          };
        });

        return { success: true };
      },

      upgradeSkill: (monsterId, skillIndex) => {
        const state = get();
        const monster = state.monsters.find((m) => m.id === monsterId);
        if (!monster) return { success: false, error: 'Monster not found' };

        const currentLevel = monster.skillLevels[skillIndex] || 1;
        if (currentLevel >= MAX_SKILL_LEVEL) {
          return { success: false, error: 'Skill already at max level' };
        }

        const cost = SKILL_UPGRADE_COSTS[currentLevel - 1];
        if (!cost) return { success: false, error: 'Invalid skill level' };

        // Check devilmons
        if (state.devilmons < cost.devilmonRequired) {
          return { success: false, error: 'Not enough Devilmons' };
        }

        // Check gold
        if (!state.player || state.player.gold < cost.goldCost) {
          return { success: false, error: 'Not enough gold' };
        }

        // Perform upgrade
        set((state) => {
          const newSkillLevels = [...(monster.skillLevels || [1, 1, 1])];
          newSkillLevels[skillIndex] = currentLevel + 1;

          return {
            monsters: state.monsters.map((m) =>
              m.id === monsterId ? { ...m, skillLevels: newSkillLevels } : m
            ),
            devilmons: state.devilmons - cost.devilmonRequired,
            player: state.player
              ? { ...state.player, gold: state.player.gold - cost.goldCost }
              : null,
          };
        });

        return { success: true };
      },

      levelUpMonster: (monsterId, expGained) =>
        set((state) => {
          const monster = state.monsters.find((m) => m.id === monsterId);
          if (!monster) return state;

          const maxLevel = MAX_LEVEL_BY_STARS[monster.stars] || 40;
          if (monster.level >= maxLevel) return state;

          let newExp = monster.experience + expGained;
          let newLevel = monster.level;

          // Calculate level ups (simple formula: 100 * level per level)
          while (newLevel < maxLevel) {
            const expForNextLevel = 100 * newLevel;
            if (newExp >= expForNextLevel) {
              newExp -= expForNextLevel;
              newLevel++;
            } else {
              break;
            }
          }

          if (newLevel >= maxLevel) {
            newLevel = maxLevel;
            newExp = 0;
          }

          return {
            monsters: state.monsters.map((m) =>
              m.id === monsterId
                ? { ...m, level: newLevel, experience: newExp }
                : m
            ),
          };
        }),
    }),
    {
      name: 'monster-battle-player',
      partialize: (state) => ({
        // Only persist these fields
        player: state.player,
        isAuthenticated: state.isAuthenticated,
        monsters: state.monsters,
        runes: state.runes,
        teamPresets: state.teamPresets,
      }),
    }
  )
);

// Selectors
export const selectPlayer = (state: PlayerState) => state.player;
export const selectIsAuthenticated = (state: PlayerState) => state.isAuthenticated;
export const selectMonsters = (state: PlayerState) => state.monsters;
export const selectRunes = (state: PlayerState) => state.runes;
export const selectTeamPresets = (state: PlayerState) => state.teamPresets;

// Get monster by ID
export const selectMonsterById = (id: string) => (state: PlayerState) =>
  state.monsters.find((m) => m.id === id);

// Get monsters by template ID
export const selectMonstersByTemplate = (templateId: string) => (state: PlayerState) =>
  state.monsters.filter((m) => m.templateId === templateId);
