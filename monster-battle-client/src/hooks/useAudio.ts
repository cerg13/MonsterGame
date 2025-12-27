/**
 * React hook for game audio
 */

import { useCallback, useEffect, useRef } from 'react';
import { audioGenerator } from '../utils/AudioGenerator';

// Audio settings store
interface AudioSettings {
  masterVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

const AUDIO_SETTINGS_KEY = 'monster_battle_audio';

const defaultSettings: AudioSettings = {
  masterVolume: 0.5,
  musicEnabled: true,
  sfxEnabled: true,
};

function loadSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(AUDIO_SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load audio settings');
  }
  return defaultSettings;
}

function saveSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save audio settings');
  }
}

// Global settings state
let currentSettings = loadSettings();
audioGenerator.setMasterVolume(currentSettings.masterVolume);

export function useAudio() {
  const settingsRef = useRef(currentSettings);

  // UI Sounds
  const playClick = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.buttonClick();
    }
  }, []);

  const playHover = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.buttonHover();
    }
  }, []);

  const playMenuOpen = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.menuOpen();
    }
  }, []);

  const playMenuClose = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.menuClose();
    }
  }, []);

  const playNotification = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.notification();
    }
  }, []);

  const playError = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.error();
    }
  }, []);

  // Battle Sounds
  const playAttackHit = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.attackHit();
    }
  }, []);

  const playAttackCrit = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.attackCrit();
    }
  }, []);

  const playAttackMiss = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.attackMiss();
    }
  }, []);

  const playSkillUse = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.skillUse();
    }
  }, []);

  const playSkillBuff = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.skillBuff();
    }
  }, []);

  const playSkillDebuff = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.skillDebuff();
    }
  }, []);

  const playSkillHeal = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.skillHeal();
    }
  }, []);

  const playMonsterDeath = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.monsterDeath();
    }
  }, []);

  const playBattleStart = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.battleStart();
    }
  }, []);

  const playBattleVictory = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.battleVictory();
    }
  }, []);

  const playBattleDefeat = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.battleDefeat();
    }
  }, []);

  // Gacha Sounds
  const playSummonStart = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.summonStart();
    }
  }, []);

  const playSummonReveal = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.summonReveal();
    }
  }, []);

  const playSummonByRarity = useCallback((rarity: 'common' | 'rare' | 'sr' | 'ssr') => {
    if (!settingsRef.current.sfxEnabled) return;

    switch (rarity) {
      case 'common':
        audioGenerator.summonCommon();
        break;
      case 'rare':
        audioGenerator.summonRare();
        break;
      case 'sr':
        audioGenerator.summonSR();
        break;
      case 'ssr':
        audioGenerator.summonSSR();
        break;
    }
  }, []);

  // Misc Sounds
  const playLevelUp = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.levelUp();
    }
  }, []);

  const playRewardCollect = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.rewardCollect();
    }
  }, []);

  const playMonsterEvolve = useCallback(() => {
    if (settingsRef.current.sfxEnabled) {
      audioGenerator.monsterEvolve();
    }
  }, []);

  // Music
  const playMusic = useCallback((type: 'menu' | 'battle' | 'victory' | 'gacha') => {
    if (settingsRef.current.musicEnabled) {
      audioGenerator.playBackgroundMusic(type);
    }
  }, []);

  const stopMusic = useCallback(() => {
    audioGenerator.stopBackgroundMusic();
  }, []);

  // Settings
  const setMasterVolume = useCallback((volume: number) => {
    currentSettings.masterVolume = volume;
    settingsRef.current = currentSettings;
    audioGenerator.setMasterVolume(volume);
    saveSettings(currentSettings);
  }, []);

  const toggleMusic = useCallback(() => {
    currentSettings.musicEnabled = !currentSettings.musicEnabled;
    settingsRef.current = currentSettings;
    if (!currentSettings.musicEnabled) {
      audioGenerator.stopBackgroundMusic();
    }
    saveSettings(currentSettings);
    return currentSettings.musicEnabled;
  }, []);

  const toggleSfx = useCallback(() => {
    currentSettings.sfxEnabled = !currentSettings.sfxEnabled;
    settingsRef.current = currentSettings;
    saveSettings(currentSettings);
    return currentSettings.sfxEnabled;
  }, []);

  const getSettings = useCallback(() => ({ ...currentSettings }), []);

  return {
    // UI
    playClick,
    playHover,
    playMenuOpen,
    playMenuClose,
    playNotification,
    playError,
    // Battle
    playAttackHit,
    playAttackCrit,
    playAttackMiss,
    playSkillUse,
    playSkillBuff,
    playSkillDebuff,
    playSkillHeal,
    playMonsterDeath,
    playBattleStart,
    playBattleVictory,
    playBattleDefeat,
    // Gacha
    playSummonStart,
    playSummonReveal,
    playSummonByRarity,
    // Misc
    playLevelUp,
    playRewardCollect,
    playMonsterEvolve,
    // Music
    playMusic,
    stopMusic,
    // Settings
    setMasterVolume,
    toggleMusic,
    toggleSfx,
    getSettings,
  };
}

// Global audio context initializer (call on first user interaction)
export function initAudio(): void {
  // Trigger audio context creation
  audioGenerator.setMasterVolume(currentSettings.masterVolume);
}
