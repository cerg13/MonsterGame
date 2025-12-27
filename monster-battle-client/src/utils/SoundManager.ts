/**
 * Sound Manager
 *
 * Handles all game audio including:
 * - Background music (procedural)
 * - Sound effects (procedural)
 * - Volume control
 * - Muting
 */

import { audioGenerator } from './AudioGenerator';

// Sound categories
export type SoundCategory = 'music' | 'sfx' | 'ui';

// Sound effect types
export type SoundEffect =
  // Battle sounds
  | 'attack_hit'
  | 'attack_crit'
  | 'attack_miss'
  | 'skill_use'
  | 'skill_buff'
  | 'skill_debuff'
  | 'skill_heal'
  | 'monster_death'
  | 'battle_start'
  | 'battle_victory'
  | 'battle_defeat'
  // UI sounds
  | 'button_click'
  | 'button_hover'
  | 'menu_open'
  | 'menu_close'
  | 'notification'
  | 'error'
  // Gacha sounds
  | 'summon_start'
  | 'summon_reveal'
  | 'summon_common'
  | 'summon_rare'
  | 'summon_sr'
  | 'summon_ssr'
  // Misc
  | 'level_up'
  | 'reward_collect'
  | 'monster_evolve';

// Background music tracks
export type MusicTrack =
  | 'main_menu'
  | 'battle_normal'
  | 'battle_boss'
  | 'victory'
  | 'defeat'
  | 'gacha'
  | 'campaign';

interface SoundConfig {
  src: string;
  volume: number;
  loop?: boolean;
}

// Sound configurations
const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  // Battle
  attack_hit: { src: '/sounds/sfx/attack_hit.mp3', volume: 0.6 },
  attack_crit: { src: '/sounds/sfx/attack_crit.mp3', volume: 0.8 },
  attack_miss: { src: '/sounds/sfx/attack_miss.mp3', volume: 0.4 },
  skill_use: { src: '/sounds/sfx/skill_use.mp3', volume: 0.7 },
  skill_buff: { src: '/sounds/sfx/skill_buff.mp3', volume: 0.6 },
  skill_debuff: { src: '/sounds/sfx/skill_debuff.mp3', volume: 0.6 },
  skill_heal: { src: '/sounds/sfx/skill_heal.mp3', volume: 0.6 },
  monster_death: { src: '/sounds/sfx/monster_death.mp3', volume: 0.7 },
  battle_start: { src: '/sounds/sfx/battle_start.mp3', volume: 0.8 },
  battle_victory: { src: '/sounds/sfx/battle_victory.mp3', volume: 0.8 },
  battle_defeat: { src: '/sounds/sfx/battle_defeat.mp3', volume: 0.7 },

  // UI
  button_click: { src: '/sounds/ui/button_click.mp3', volume: 0.5 },
  button_hover: { src: '/sounds/ui/button_hover.mp3', volume: 0.3 },
  menu_open: { src: '/sounds/ui/menu_open.mp3', volume: 0.5 },
  menu_close: { src: '/sounds/ui/menu_close.mp3', volume: 0.4 },
  notification: { src: '/sounds/ui/notification.mp3', volume: 0.6 },
  error: { src: '/sounds/ui/error.mp3', volume: 0.5 },

  // Gacha
  summon_start: { src: '/sounds/gacha/summon_start.mp3', volume: 0.7 },
  summon_reveal: { src: '/sounds/gacha/summon_reveal.mp3', volume: 0.8 },
  summon_common: { src: '/sounds/gacha/summon_common.mp3', volume: 0.6 },
  summon_rare: { src: '/sounds/gacha/summon_rare.mp3', volume: 0.7 },
  summon_sr: { src: '/sounds/gacha/summon_sr.mp3', volume: 0.8 },
  summon_ssr: { src: '/sounds/gacha/summon_ssr.mp3', volume: 1.0 },

  // Misc
  level_up: { src: '/sounds/sfx/level_up.mp3', volume: 0.8 },
  reward_collect: { src: '/sounds/sfx/reward_collect.mp3', volume: 0.6 },
  monster_evolve: { src: '/sounds/sfx/monster_evolve.mp3', volume: 0.8 },
};

const MUSIC_CONFIGS: Record<MusicTrack, SoundConfig> = {
  main_menu: { src: '/sounds/music/main_menu.mp3', volume: 0.4, loop: true },
  battle_normal: { src: '/sounds/music/battle_normal.mp3', volume: 0.5, loop: true },
  battle_boss: { src: '/sounds/music/battle_boss.mp3', volume: 0.6, loop: true },
  victory: { src: '/sounds/music/victory.mp3', volume: 0.6, loop: false },
  defeat: { src: '/sounds/music/defeat.mp3', volume: 0.5, loop: false },
  gacha: { src: '/sounds/music/gacha.mp3', volume: 0.5, loop: true },
  campaign: { src: '/sounds/music/campaign.mp3', volume: 0.4, loop: true },
};

class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private currentMusic: HTMLAudioElement | null = null;
  private currentMusicTrack: MusicTrack | null = null;

  // Volume settings
  private masterVolume = 1.0;
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  private uiVolume = 0.6;

  // Mute states
  private isMuted = false;
  private isMusicMuted = false;
  private isSfxMuted = false;

  // Settings persistence key
  private readonly STORAGE_KEY = 'sound_settings';

  private constructor() {
    this.loadSettings();
    this.initAudioContext();
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize audio context (requires user interaction)
   */
  private initAudioContext(): void {
    if (typeof window !== 'undefined' && !this.audioContext) {
      const resumeContext = () => {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        document.removeEventListener('click', resumeContext);
        document.removeEventListener('touchstart', resumeContext);
      };

      document.addEventListener('click', resumeContext, { once: true });
      document.addEventListener('touchstart', resumeContext, { once: true });
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        this.masterVolume = settings.masterVolume ?? 1.0;
        this.musicVolume = settings.musicVolume ?? 0.5;
        this.sfxVolume = settings.sfxVolume ?? 0.7;
        this.uiVolume = settings.uiVolume ?? 0.6;
        this.isMuted = settings.isMuted ?? false;
        this.isMusicMuted = settings.isMusicMuted ?? false;
        this.isSfxMuted = settings.isSfxMuted ?? false;
      }
    } catch (e) {
      console.warn('Failed to load sound settings:', e);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        masterVolume: this.masterVolume,
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        uiVolume: this.uiVolume,
        isMuted: this.isMuted,
        isMusicMuted: this.isMusicMuted,
        isSfxMuted: this.isSfxMuted,
      }));
    } catch (e) {
      console.warn('Failed to save sound settings:', e);
    }
  }

  /**
   * Calculate effective volume for a category
   */
  private getEffectiveVolume(category: SoundCategory, baseVolume: number): number {
    if (this.isMuted) return 0;

    let categoryVolume = 1.0;
    switch (category) {
      case 'music':
        if (this.isMusicMuted) return 0;
        categoryVolume = this.musicVolume;
        break;
      case 'sfx':
        if (this.isSfxMuted) return 0;
        categoryVolume = this.sfxVolume;
        break;
      case 'ui':
        if (this.isSfxMuted) return 0;
        categoryVolume = this.uiVolume;
        break;
    }

    return baseVolume * this.masterVolume * categoryVolume;
  }

  /**
   * Preload a sound
   */
  public preload(effect: SoundEffect): void {
    const config = SOUND_CONFIGS[effect];
    if (!config || this.sounds.has(effect)) return;

    const audio = new Audio(config.src);
    audio.preload = 'auto';
    this.sounds.set(effect, audio);
  }

  /**
   * Preload multiple sounds
   */
  public preloadAll(effects: SoundEffect[]): void {
    effects.forEach(effect => this.preload(effect));
  }

  /**
   * Play a sound effect using procedural audio
   */
  public play(effect: SoundEffect, category: SoundCategory = 'sfx'): void {
    const config = SOUND_CONFIGS[effect];
    if (!config) {
      console.warn(`Sound effect not found: ${effect}`);
      return;
    }

    const effectiveVolume = this.getEffectiveVolume(category, config.volume);
    if (effectiveVolume === 0) return;

    // Set volume and play procedural sound
    audioGenerator.setMasterVolume(effectiveVolume);

    // Map effect to procedural generator method
    const effectMap: Record<SoundEffect, () => void> = {
      // Battle
      attack_hit: () => audioGenerator.attackHit(),
      attack_crit: () => audioGenerator.attackCrit(),
      attack_miss: () => audioGenerator.attackMiss(),
      skill_use: () => audioGenerator.skillUse(),
      skill_buff: () => audioGenerator.skillBuff(),
      skill_debuff: () => audioGenerator.skillDebuff(),
      skill_heal: () => audioGenerator.skillHeal(),
      monster_death: () => audioGenerator.monsterDeath(),
      battle_start: () => audioGenerator.battleStart(),
      battle_victory: () => audioGenerator.battleVictory(),
      battle_defeat: () => audioGenerator.battleDefeat(),
      // UI
      button_click: () => audioGenerator.buttonClick(),
      button_hover: () => audioGenerator.buttonHover(),
      menu_open: () => audioGenerator.menuOpen(),
      menu_close: () => audioGenerator.menuClose(),
      notification: () => audioGenerator.notification(),
      error: () => audioGenerator.error(),
      // Gacha
      summon_start: () => audioGenerator.summonStart(),
      summon_reveal: () => audioGenerator.summonReveal(),
      summon_common: () => audioGenerator.summonCommon(),
      summon_rare: () => audioGenerator.summonRare(),
      summon_sr: () => audioGenerator.summonSR(),
      summon_ssr: () => audioGenerator.summonSSR(),
      // Misc
      level_up: () => audioGenerator.levelUp(),
      reward_collect: () => audioGenerator.rewardCollect(),
      monster_evolve: () => audioGenerator.monsterEvolve(),
    };

    const playFn = effectMap[effect];
    if (playFn) {
      playFn();
    }
  }

  /**
   * Play background music using procedural audio
   */
  public playMusic(track: MusicTrack): void {
    if (this.currentMusicTrack === track && audioGenerator.isMusicPlaying()) {
      return; // Already playing this track
    }

    const config = MUSIC_CONFIGS[track];
    if (!config) {
      console.warn(`Music track not found: ${track}`);
      return;
    }

    // Stop current music
    this.stopMusic();

    const effectiveVolume = this.getEffectiveVolume('music', config.volume);
    if (effectiveVolume === 0) return;

    audioGenerator.setMasterVolume(effectiveVolume);

    // Map track to procedural music type
    const trackMap: Record<MusicTrack, 'menu' | 'battle' | 'victory' | 'gacha'> = {
      main_menu: 'menu',
      battle_normal: 'battle',
      battle_boss: 'battle',
      victory: 'victory',
      defeat: 'menu',
      gacha: 'gacha',
      campaign: 'menu',
    };

    const musicType = trackMap[track] || 'menu';
    audioGenerator.playBackgroundMusic(musicType);
    this.currentMusicTrack = track;
  }

  /**
   * Stop background music
   */
  public stopMusic(): void {
    audioGenerator.stopBackgroundMusic();
    this.currentMusic = null;
    this.currentMusicTrack = null;
  }

  /**
   * Pause background music
   */
  public pauseMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume background music
   */
  public resumeMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.play().catch(err => {
        console.warn('Failed to resume music:', err);
      });
    }
  }

  /**
   * Fade out music
   */
  public fadeOutMusic(duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentMusic) {
        resolve();
        return;
      }

      const startVolume = this.currentMusic.volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        if (this.currentMusic) {
          this.currentMusic.volume = Math.max(0, startVolume - volumeStep * currentStep);
        }

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          this.stopMusic();
          resolve();
        }
      }, stepDuration);
    });
  }

  // Volume controls
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolume();
    this.saveSettings();
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolume();
    this.saveSettings();
  }

  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  public setUiVolume(volume: number): void {
    this.uiVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  private updateMusicVolume(): void {
    if (this.currentMusic && this.currentMusicTrack) {
      const config = MUSIC_CONFIGS[this.currentMusicTrack];
      this.currentMusic.volume = this.getEffectiveVolume('music', config.volume);
    }
  }

  // Mute controls
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.updateMusicVolume();
    this.saveSettings();
  }

  public toggleMusicMute(): void {
    this.isMusicMuted = !this.isMusicMuted;
    this.updateMusicVolume();
    this.saveSettings();
  }

  public toggleSfxMute(): void {
    this.isSfxMuted = !this.isSfxMuted;
    this.saveSettings();
  }

  // Getters
  public getMasterVolume(): number { return this.masterVolume; }
  public getMusicVolume(): number { return this.musicVolume; }
  public getSfxVolume(): number { return this.sfxVolume; }
  public getUiVolume(): number { return this.uiVolume; }
  public getIsMuted(): boolean { return this.isMuted; }
  public getIsMusicMuted(): boolean { return this.isMusicMuted; }
  public getIsSfxMuted(): boolean { return this.isSfxMuted; }
  public getCurrentTrack(): MusicTrack | null { return this.currentMusicTrack; }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

// Convenience functions
export const playSound = (effect: SoundEffect) => soundManager.play(effect);
export const playUI = (effect: SoundEffect) => soundManager.play(effect, 'ui');
export const playMusic = (track: MusicTrack) => soundManager.playMusic(track);
export const stopMusic = () => soundManager.stopMusic();
