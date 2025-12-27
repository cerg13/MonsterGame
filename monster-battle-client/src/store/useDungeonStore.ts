import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DungeonType,
  DungeonFloor,
  DungeonProgress,
  ToAProgress,
  RiftProgress,
  DungeonRunResult,
  RiftGrade,
} from '../types/dungeon';
import type { Element } from '../types/monster';
import { DUNGEON_CONFIG } from '../data/dungeons';

interface DungeonState {
  // Progress tracking
  dungeonProgress: Record<DungeonType, DungeonProgress>;
  toaProgress: {
    normal: ToAProgress;
    hard: ToAProgress;
  };
  riftProgress: Record<Element, RiftProgress>;

  // Current dungeon state
  selectedDungeon: DungeonType | null;
  selectedFloor: number;
  isInDungeon: boolean;
  currentRun: DungeonRunResult | null;

  // Auto-battle settings
  autoRepeat: boolean;
  autoRepeatCount: number;
  maxAutoRepeat: number;

  // Actions
  selectDungeon: (type: DungeonType) => void;
  selectFloor: (floor: number) => void;
  startDungeonRun: (floor: DungeonFloor) => void;
  completeDungeonRun: (result: DungeonRunResult) => void;
  failDungeonRun: () => void;

  // ToA actions
  advanceToA: (difficulty: 'normal' | 'hard') => void;
  resetToA: () => void;
  addUsedMonster: (difficulty: 'normal' | 'hard', monsterId: string) => void;

  // Rift actions
  completeRift: (element: Element, grade: RiftGrade, damage: number) => void;

  // Settings
  setAutoRepeat: (enabled: boolean) => void;
  setMaxAutoRepeat: (count: number) => void;

  // Helpers
  canEnterFloor: (type: DungeonType, floor: number) => boolean;
  getHighestUnlockedFloor: (type: DungeonType) => number;
}

const initialDungeonProgress: DungeonProgress = {
  dungeonType: 'giants',
  highestFloor: 1,
  totalClears: 0,
  fastestClear: null,
  lastClearTime: null,
};

const initialToAProgress: ToAProgress = {
  difficulty: 'normal',
  currentFloor: 1,
  highestFloor: 1,
  usedMonsters: [],
  lastReset: new Date(),
};

const initialRiftProgress: RiftProgress = {
  element: 'fire',
  highestGrade: 'F',
  bestDamage: 0,
  totalClears: 0,
};

export const useDungeonStore = create<DungeonState>()(
  persist(
    (set, get) => ({
      // Initial state
      dungeonProgress: {
        giants: { ...initialDungeonProgress, dungeonType: 'giants' },
        dragons: { ...initialDungeonProgress, dungeonType: 'dragons' },
        necropolis: { ...initialDungeonProgress, dungeonType: 'necropolis' },
        toa: { ...initialDungeonProgress, dungeonType: 'toa' },
        rift: { ...initialDungeonProgress, dungeonType: 'rift' },
      },
      toaProgress: {
        normal: { ...initialToAProgress, difficulty: 'normal' },
        hard: { ...initialToAProgress, difficulty: 'hard' },
      },
      riftProgress: {
        fire: { ...initialRiftProgress, element: 'fire' },
        water: { ...initialRiftProgress, element: 'water' },
        wind: { ...initialRiftProgress, element: 'wind' },
        light: { ...initialRiftProgress, element: 'light' },
        dark: { ...initialRiftProgress, element: 'dark' },
      },

      selectedDungeon: null,
      selectedFloor: 1,
      isInDungeon: false,
      currentRun: null,

      autoRepeat: false,
      autoRepeatCount: 0,
      maxAutoRepeat: 10,

      // Actions
      selectDungeon: (type) => {
        const state = get();
        const highestFloor = state.dungeonProgress[type]?.highestFloor || 1;
        set({
          selectedDungeon: type,
          selectedFloor: Math.min(highestFloor, DUNGEON_CONFIG[type].maxFloor),
        });
      },

      selectFloor: (floor) => {
        const state = get();
        if (state.selectedDungeon && state.canEnterFloor(state.selectedDungeon, floor)) {
          set({ selectedFloor: floor });
        }
      },

      startDungeonRun: (_floor) => {
        set({
          isInDungeon: true,
          currentRun: null,
        });
      },

      completeDungeonRun: (result) => {
        const state = get();
        const { dungeonProgress } = state;
        const dungeonType = result.floor.dungeonType;

        if (result.success) {
          const currentProgress = dungeonProgress[dungeonType];
          const newHighestFloor = Math.max(
            currentProgress.highestFloor,
            result.floor.floor + 1
          );

          // Update fastest clear time
          const newFastestClear =
            currentProgress.fastestClear === null
              ? result.timeElapsed
              : Math.min(currentProgress.fastestClear, result.timeElapsed);

          set({
            isInDungeon: false,
            currentRun: result,
            autoRepeatCount: state.autoRepeat ? state.autoRepeatCount + 1 : 0,
            dungeonProgress: {
              ...dungeonProgress,
              [dungeonType]: {
                ...currentProgress,
                highestFloor: Math.min(newHighestFloor, DUNGEON_CONFIG[dungeonType].maxFloor),
                totalClears: currentProgress.totalClears + 1,
                fastestClear: newFastestClear,
                lastClearTime: new Date(),
              },
            },
          });
        } else {
          set({
            isInDungeon: false,
            currentRun: result,
            autoRepeat: false, // Stop auto-repeat on failure
            autoRepeatCount: 0,
          });
        }
      },

      failDungeonRun: () => {
        set({
          isInDungeon: false,
          currentRun: null,
          autoRepeat: false,
          autoRepeatCount: 0,
        });
      },

      // ToA actions
      advanceToA: (difficulty) => {
        const state = get();
        const progress = state.toaProgress[difficulty];

        if (progress.currentFloor < 100) {
          set({
            toaProgress: {
              ...state.toaProgress,
              [difficulty]: {
                ...progress,
                currentFloor: progress.currentFloor + 1,
                highestFloor: Math.max(progress.highestFloor, progress.currentFloor + 1),
              },
            },
          });
        }
      },

      resetToA: () => {
        const now = new Date();
        set({
          toaProgress: {
            normal: {
              ...initialToAProgress,
              difficulty: 'normal',
              lastReset: now,
            },
            hard: {
              ...initialToAProgress,
              difficulty: 'hard',
              lastReset: now,
            },
          },
        });
      },

      addUsedMonster: (difficulty, monsterId) => {
        const state = get();
        const progress = state.toaProgress[difficulty];

        if (!progress.usedMonsters.includes(monsterId)) {
          set({
            toaProgress: {
              ...state.toaProgress,
              [difficulty]: {
                ...progress,
                usedMonsters: [...progress.usedMonsters, monsterId],
              },
            },
          });
        }
      },

      // Rift actions
      completeRift: (element, grade, damage) => {
        const state = get();
        const progress = state.riftProgress[element];

        // Grade comparison
        const gradeOrder: RiftGrade[] = ['F', 'D', 'C', 'B', 'A', 'A+', 'S', 'SS', 'SSS'];
        const currentGradeIndex = gradeOrder.indexOf(progress.highestGrade);
        const newGradeIndex = gradeOrder.indexOf(grade);

        set({
          riftProgress: {
            ...state.riftProgress,
            [element]: {
              ...progress,
              highestGrade: newGradeIndex > currentGradeIndex ? grade : progress.highestGrade,
              bestDamage: Math.max(progress.bestDamage, damage),
              totalClears: progress.totalClears + 1,
            },
          },
        });
      },

      // Settings
      setAutoRepeat: (enabled) => {
        set({
          autoRepeat: enabled,
          autoRepeatCount: enabled ? 0 : get().autoRepeatCount,
        });
      },

      setMaxAutoRepeat: (count) => {
        set({ maxAutoRepeat: Math.max(1, Math.min(100, count)) });
      },

      // Helpers
      canEnterFloor: (type, floor) => {
        const state = get();
        const progress = state.dungeonProgress[type];

        // Can enter if floor is <= highest unlocked floor
        // Floor 1 is always available
        if (floor === 1) return true;
        return floor <= progress.highestFloor;
      },

      getHighestUnlockedFloor: (type) => {
        const state = get();
        return state.dungeonProgress[type]?.highestFloor || 1;
      },
    }),
    {
      name: 'monster-battle-dungeon',
      partialize: (state) => ({
        dungeonProgress: state.dungeonProgress,
        toaProgress: state.toaProgress,
        riftProgress: state.riftProgress,
        maxAutoRepeat: state.maxAutoRepeat,
      }),
    }
  )
);

export default useDungeonStore;
