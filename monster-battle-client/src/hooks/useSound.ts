/**
 * useSound Hook
 *
 * React hook for using the SoundManager in components.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  soundManager,
  type SoundEffect,
  type MusicTrack,
} from '../utils/SoundManager';

interface UseSoundReturn {
  // Play functions
  play: (effect: SoundEffect) => void;
  playUI: (effect: SoundEffect) => void;
  playMusic: (track: MusicTrack) => void;
  stopMusic: () => void;
  pauseMusic: () => void;
  resumeMusic: () => void;
  fadeOutMusic: (duration?: number) => Promise<void>;

  // Volume controls
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  uiVolume: number;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setUiVolume: (volume: number) => void;

  // Mute controls
  isMuted: boolean;
  isMusicMuted: boolean;
  isSfxMuted: boolean;
  toggleMute: () => void;
  toggleMusicMute: () => void;
  toggleSfxMute: () => void;

  // Current state
  currentTrack: MusicTrack | null;
}

export function useSound(): UseSoundReturn {
  // Local state for reactivity
  const [masterVolume, setMasterVolumeState] = useState(soundManager.getMasterVolume());
  const [musicVolume, setMusicVolumeState] = useState(soundManager.getMusicVolume());
  const [sfxVolume, setSfxVolumeState] = useState(soundManager.getSfxVolume());
  const [uiVolume, setUiVolumeState] = useState(soundManager.getUiVolume());
  const [isMuted, setIsMutedState] = useState(soundManager.getIsMuted());
  const [isMusicMuted, setIsMusicMutedState] = useState(soundManager.getIsMusicMuted());
  const [isSfxMuted, setIsSfxMutedState] = useState(soundManager.getIsSfxMuted());
  const [currentTrack, setCurrentTrack] = useState(soundManager.getCurrentTrack());

  // Play functions
  const play = useCallback((effect: SoundEffect) => {
    soundManager.play(effect, 'sfx');
  }, []);

  const playUI = useCallback((effect: SoundEffect) => {
    soundManager.play(effect, 'ui');
  }, []);

  const playMusic = useCallback((track: MusicTrack) => {
    soundManager.playMusic(track);
    setCurrentTrack(track);
  }, []);

  const stopMusic = useCallback(() => {
    soundManager.stopMusic();
    setCurrentTrack(null);
  }, []);

  const pauseMusic = useCallback(() => {
    soundManager.pauseMusic();
  }, []);

  const resumeMusic = useCallback(() => {
    soundManager.resumeMusic();
  }, []);

  const fadeOutMusic = useCallback((duration?: number) => {
    return soundManager.fadeOutMusic(duration).then(() => {
      setCurrentTrack(null);
    });
  }, []);

  // Volume setters with state update
  const setMasterVolume = useCallback((volume: number) => {
    soundManager.setMasterVolume(volume);
    setMasterVolumeState(volume);
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    soundManager.setMusicVolume(volume);
    setMusicVolumeState(volume);
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    soundManager.setSfxVolume(volume);
    setSfxVolumeState(volume);
  }, []);

  const setUiVolume = useCallback((volume: number) => {
    soundManager.setUiVolume(volume);
    setUiVolumeState(volume);
  }, []);

  // Mute toggles with state update
  const toggleMute = useCallback(() => {
    soundManager.toggleMute();
    setIsMutedState(soundManager.getIsMuted());
  }, []);

  const toggleMusicMute = useCallback(() => {
    soundManager.toggleMusicMute();
    setIsMusicMutedState(soundManager.getIsMusicMuted());
  }, []);

  const toggleSfxMute = useCallback(() => {
    soundManager.toggleSfxMute();
    setIsSfxMutedState(soundManager.getIsSfxMuted());
  }, []);

  return {
    play,
    playUI,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    fadeOutMusic,
    masterVolume,
    musicVolume,
    sfxVolume,
    uiVolume,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    setUiVolume,
    isMuted,
    isMusicMuted,
    isSfxMuted,
    toggleMute,
    toggleMusicMute,
    toggleSfxMute,
    currentTrack,
  };
}

/**
 * Hook for playing UI sounds on button interactions
 */
export function useUISound() {
  const { playUI } = useSound();

  const onClick = useCallback(() => {
    playUI('button_click');
  }, [playUI]);

  const onHover = useCallback(() => {
    playUI('button_hover');
  }, [playUI]);

  return { onClick, onHover };
}

/**
 * Hook for managing background music on a screen
 */
export function useBackgroundMusic(track: MusicTrack, options?: { fadeIn?: boolean }) {
  const { playMusic, fadeOutMusic } = useSound();

  useEffect(() => {
    playMusic(track);

    return () => {
      fadeOutMusic(500);
    };
  }, [track, playMusic, fadeOutMusic]);
}

export default useSound;
