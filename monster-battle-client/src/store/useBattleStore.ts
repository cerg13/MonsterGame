import { create } from 'zustand';
import type { BattleState, BattleAction, BattleConfig, BattleResult } from '../types/battle';
import type { DungeonFloor, DungeonRunResult, BossMechanic } from '../types/dungeon';
import { BattleEngine } from '../game/battle';
import { dungeonRewardService } from '../services/DungeonRewardService';

export interface DungeonContext {
  floor: DungeonFloor;
  bossMechanics?: BossMechanic[];
}

interface BattleStore {
  // State
  battleState: BattleState | null;
  battleEngine: BattleEngine | null;
  isLoading: boolean;
  error: string | null;
  battleSpeed: number; // 1 = normal, 2 = fast, 3 = very fast

  // Dungeon context
  dungeonContext: DungeonContext | null;
  dungeonResult: DungeonRunResult | null;

  // Battle flow
  startBattle: (config: BattleConfig) => void;
  startDungeonBattle: (config: BattleConfig, dungeonContext: DungeonContext) => void;
  submitAction: (action: BattleAction) => void;
  toggleAutoMode: () => void;
  processTick: () => void;
  endBattle: () => void;
  setBattleSpeed: (speed: number) => void;
  clearDungeonResult: () => void;

  // State updates (called by engine)
  updateState: (state: BattleState) => void;

  // Results
  battleResult: BattleResult | null;
  getBattleResult: () => BattleResult | null;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  battleState: null,
  battleEngine: null,
  isLoading: false,
  error: null,
  battleResult: null,
  battleSpeed: 1,
  dungeonContext: null,
  dungeonResult: null,

  startBattle: (config) => {
    set({ isLoading: true, error: null, battleResult: null, dungeonContext: null, dungeonResult: null });

    try {
      // Create new battle engine with state change callback
      const engine = new BattleEngine(config, (newState) => {
        get().updateState(newState);
      });

      set({
        battleEngine: engine,
        isLoading: false,
      });

      // Start the battle
      engine.start();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start battle',
        isLoading: false,
      });
    }
  },

  startDungeonBattle: (config, dungeonContext) => {
    set({ isLoading: true, error: null, battleResult: null, dungeonContext, dungeonResult: null });

    try {
      // Create new battle engine with state change callback
      const engine = new BattleEngine(config, (newState) => {
        get().updateState(newState);
      });

      // Register boss mechanics if any
      if (dungeonContext.bossMechanics) {
        // Find boss monster IDs from the last wave
        const lastWave = dungeonContext.floor.waves[dungeonContext.floor.waves.length - 1];
        const bossEnemies = lastWave.enemies.filter(e => e.isBoss);

        bossEnemies.forEach((bossEnemy, index) => {
          engine.registerBossMechanics(
            `dungeon_enemy_${lastWave.enemies.indexOf(bossEnemy)}`,
            dungeonContext.bossMechanics!
          );
        });
      }

      set({
        battleEngine: engine,
        isLoading: false,
      });

      // Start the battle
      engine.start();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start dungeon battle',
        isLoading: false,
      });
    }
  },

  submitAction: (action) => {
    const { battleEngine, battleState } = get();
    if (!battleEngine || !battleState) return;

    if (battleState.phase !== 'action_selection') {
      console.warn('Cannot submit action outside of action_selection phase');
      return;
    }

    battleEngine.submitAction(action);
  },

  toggleAutoMode: () => {
    const { battleEngine } = get();
    if (!battleEngine) return;

    battleEngine.toggleAutoMode();
  },

  processTick: () => {
    const { battleEngine } = get();
    if (!battleEngine) return;

    battleEngine.processTick();
  },

  setBattleSpeed: (speed: number) => {
    set({ battleSpeed: Math.max(1, Math.min(3, speed)) });
  },

  endBattle: () => {
    const { battleEngine } = get();

    if (battleEngine) {
      const result = battleEngine.getResult();
      set({ battleResult: result });
    }

    set({
      battleState: null,
      battleEngine: null,
    });
  },

  updateState: (state) => {
    set({ battleState: state });

    // Check if battle ended
    if (state.phase === 'battle_end' && state.winner) {
      const { battleEngine, dungeonContext } = get();
      if (battleEngine) {
        const result = battleEngine.getResult();
        set({ battleResult: result });

        // If this was a dungeon battle, generate dungeon results
        if (dungeonContext) {
          const stats = battleEngine.getBattleStats();
          const dungeonResult = dungeonRewardService.createRunResult(
            dungeonContext.floor,
            state.winner === 'player',
            stats.timeElapsed,
            stats.damageDealt,
            stats.damageTaken
          );
          set({ dungeonResult });
        }
      }
    }
  },

  clearDungeonResult: () => {
    set({ dungeonResult: null, dungeonContext: null });
  },

  getBattleResult: () => get().battleResult,
}));

// Selectors
export const selectBattleState = (state: BattleStore) => state.battleState;
export const selectIsInBattle = (state: BattleStore) => state.battleState !== null;
export const selectBattlePhase = (state: BattleStore) => state.battleState?.phase;
export const selectActiveMonster = (state: BattleStore) => {
  const { battleState } = state;
  if (!battleState?.activeMonster) return null;

  const allMonsters = [...battleState.playerTeam, ...battleState.enemyTeam];
  return allMonsters.find((m) => m.id === battleState.activeMonster);
};
export const selectPlayerTeam = (state: BattleStore) => state.battleState?.playerTeam ?? [];
export const selectEnemyTeam = (state: BattleStore) => state.battleState?.enemyTeam ?? [];
export const selectBattleLog = (state: BattleStore) => state.battleState?.battleLog ?? [];
export const selectIsAutoMode = (state: BattleStore) => state.battleState?.isAutoMode ?? false;
export const selectBattleSpeed = (state: BattleStore) => state.battleSpeed;
export const selectDungeonContext = (state: BattleStore) => state.dungeonContext;
export const selectDungeonResult = (state: BattleStore) => state.dungeonResult;
