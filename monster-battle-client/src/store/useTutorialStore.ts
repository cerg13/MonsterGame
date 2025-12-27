import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TutorialStepId =
  | 'welcome'
  | 'mainMenu'
  | 'campaign'
  | 'battle'
  | 'skills'
  | 'targeting'
  | 'monsters'
  | 'runes'
  | 'summon'
  | 'dailyRewards'
  | 'quests';

export interface TutorialStep {
  id: TutorialStepId;
  targetSelector?: string; // CSS selector for highlighting element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route?: string; // Route to navigate to for this step
  highlightArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'welcome', position: 'center' },
  { id: 'mainMenu', targetSelector: '.menu-grid', position: 'bottom', route: '/' },
  { id: 'campaign', targetSelector: '.menu-button:nth-child(1)', position: 'right', route: '/' },
  { id: 'battle', position: 'center', route: '/battle' },
  { id: 'skills', position: 'bottom', route: '/battle' },
  { id: 'targeting', position: 'bottom', route: '/battle' },
  { id: 'monsters', targetSelector: '.menu-button:nth-child(3)', position: 'right', route: '/' },
  { id: 'runes', targetSelector: '.menu-button:nth-child(4)', position: 'right', route: '/' },
  { id: 'summon', targetSelector: '.menu-button:nth-child(5)', position: 'right', route: '/' },
  { id: 'dailyRewards', targetSelector: '.menu-button-wrapper:nth-child(8)', position: 'left', route: '/' },
  { id: 'quests', targetSelector: '.menu-button-wrapper:nth-child(10)', position: 'left', route: '/' },
];

interface TutorialState {
  isActive: boolean;
  hasCompletedTutorial: boolean;
  currentStepIndex: number;
  skipped: boolean;

  // Actions
  startTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  resetTutorial: () => void;

  // Getters
  getCurrentStep: () => TutorialStep | null;
  getTotalSteps: () => number;
  isLastStep: () => boolean;
  isFirstStep: () => boolean;
}

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      isActive: false,
      hasCompletedTutorial: false,
      currentStepIndex: 0,
      skipped: false,

      startTutorial: () => {
        set({
          isActive: true,
          currentStepIndex: 0,
          skipped: false,
        });
      },

      nextStep: () => {
        const { currentStepIndex, completeTutorial } = get();
        if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          completeTutorial();
        }
      },

      previousStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipTutorial: () => {
        set({
          isActive: false,
          skipped: true,
          hasCompletedTutorial: true,
        });
      },

      completeTutorial: () => {
        set({
          isActive: false,
          hasCompletedTutorial: true,
        });
      },

      resetTutorial: () => {
        set({
          isActive: false,
          hasCompletedTutorial: false,
          currentStepIndex: 0,
          skipped: false,
        });
      },

      getCurrentStep: () => {
        const { currentStepIndex } = get();
        return TUTORIAL_STEPS[currentStepIndex] || null;
      },

      getTotalSteps: () => TUTORIAL_STEPS.length,

      isLastStep: () => {
        const { currentStepIndex } = get();
        return currentStepIndex === TUTORIAL_STEPS.length - 1;
      },

      isFirstStep: () => {
        const { currentStepIndex } = get();
        return currentStepIndex === 0;
      },
    }),
    {
      name: 'monster-battle-tutorial',
      partialize: (state) => ({
        hasCompletedTutorial: state.hasCompletedTutorial,
        skipped: state.skipped,
      }),
    }
  )
);
