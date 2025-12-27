import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { russianTranslations, englishTranslations, type Language, type Translations } from './translations';

interface LocalizationState {
  language: Language;
  t: Translations;
  setLanguage: (language: Language) => void;
}

const translations: Record<Language, Translations> = {
  ru: russianTranslations,
  en: englishTranslations,
};

export const useLocalization = create<LocalizationState>()(
  persist(
    (set, get) => ({
      language: 'ru', // Default to Russian
      t: russianTranslations,
      setLanguage: (language: Language) =>
        set({
          language,
          t: translations[language],
        }),
    }),
    {
      name: 'monster-battle-localization',
      partialize: (state) => ({ language: state.language }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { language?: Language } | undefined;
        const lang = persisted?.language || 'ru';
        return {
          ...currentState,
          language: lang,
          t: translations[lang],
        };
      },
    }
  )
);

// Helper hook for getting translations
export function useTranslations() {
  return useLocalization((state) => state.t);
}

// Helper hook for language switching
export function useLanguage() {
  return useLocalization((state) => ({
    language: state.language,
    setLanguage: state.setLanguage,
  }));
}
