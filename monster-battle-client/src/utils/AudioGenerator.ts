/**
 * Procedural Audio Generator
 * Generates game sounds using Web Audio API
 */

type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle';

interface ToneConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
  gain?: number;
  detune?: number;
}

interface NoiseConfig {
  duration: number;
  type: 'white' | 'pink' | 'brown';
  gain?: number;
  filter?: {
    type: BiquadFilterType;
    frequency: number;
    Q?: number;
  };
}

class AudioGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private pendingMusic: ('menu' | 'battle' | 'victory' | 'gacha') | null = null;
  private isInitialized = false;

  constructor() {
    // Set up user interaction listeners to unlock audio
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (!this.isInitialized) {
          this.isInitialized = true;
          // Initialize context
          this.getContext();
          // Play pending music if any
          if (this.pendingMusic) {
            const musicType = this.pendingMusic;
            this.pendingMusic = null;
            this.playBackgroundMusic(musicType);
          }
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      };

      document.addEventListener('click', unlockAudio);
      document.addEventListener('touchstart', unlockAudio);
      document.addEventListener('keydown', unlockAudio);
    }
  }

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.5;
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  isReady(): boolean {
    return this.isInitialized && this.audioContext?.state === 'running';
  }

  private getMasterGain(): GainNode {
    this.getContext();
    return this.masterGain!;
  }

  setMasterVolume(volume: number): void {
    const gain = this.getMasterGain();
    gain.gain.value = Math.max(0, Math.min(1, volume));
  }

  // Play a tone with ADSR envelope
  private playTone(config: ToneConfig): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = config.type;
    osc.frequency.value = config.frequency;
    if (config.detune) osc.detune.value = config.detune;

    const attack = config.attack ?? 0.01;
    const decay = config.decay ?? 0.1;
    const sustain = config.sustain ?? 0.3;
    const release = config.release ?? 0.1;
    const maxGain = config.gain ?? 0.3;

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(maxGain, now + attack);
    gainNode.gain.linearRampToValueAtTime(maxGain * sustain, now + attack + decay);
    gainNode.gain.setValueAtTime(maxGain * sustain, now + config.duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + config.duration);

    osc.connect(gainNode);
    gainNode.connect(this.getMasterGain());

    osc.start(now);
    osc.stop(now + config.duration);
  }

  // Play noise
  private playNoise(config: NoiseConfig): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * config.duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    // Apply pink/brown filtering
    if (config.type === 'pink' || config.type === 'brown') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = data[i];
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(config.gain ?? 0.2, now);
    gainNode.gain.linearRampToValueAtTime(0, now + config.duration);

    source.connect(gainNode);

    if (config.filter) {
      const filter = ctx.createBiquadFilter();
      filter.type = config.filter.type;
      filter.frequency.value = config.filter.frequency;
      if (config.filter.Q) filter.Q.value = config.filter.Q;
      gainNode.connect(filter);
      filter.connect(this.getMasterGain());
    } else {
      gainNode.connect(this.getMasterGain());
    }

    source.start(now);
    source.stop(now + config.duration);
  }

  // ===== SOUND EFFECTS =====

  // UI Sounds
  buttonClick(): void {
    this.playTone({ frequency: 800, duration: 0.08, type: 'sine', gain: 0.2, attack: 0.005, release: 0.02 });
    this.playTone({ frequency: 1200, duration: 0.05, type: 'sine', gain: 0.15, attack: 0.005, release: 0.01 });
  }

  buttonHover(): void {
    this.playTone({ frequency: 600, duration: 0.05, type: 'sine', gain: 0.1, attack: 0.01, release: 0.02 });
  }

  menuOpen(): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    [400, 500, 600, 800].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.1, type: 'sine', gain: 0.15 });
      }, i * 30);
    });
  }

  menuClose(): void {
    [600, 500, 400].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.08, type: 'sine', gain: 0.12 });
      }, i * 25);
    });
  }

  notification(): void {
    this.playTone({ frequency: 880, duration: 0.15, type: 'sine', gain: 0.25 });
    setTimeout(() => {
      this.playTone({ frequency: 1100, duration: 0.2, type: 'sine', gain: 0.2 });
    }, 100);
  }

  error(): void {
    this.playTone({ frequency: 200, duration: 0.15, type: 'square', gain: 0.2 });
    setTimeout(() => {
      this.playTone({ frequency: 150, duration: 0.2, type: 'square', gain: 0.15 });
    }, 100);
  }

  // Battle Sounds
  attackHit(): void {
    this.playNoise({ duration: 0.1, type: 'white', gain: 0.3, filter: { type: 'highpass', frequency: 2000 } });
    this.playTone({ frequency: 150, duration: 0.1, type: 'sine', gain: 0.4, attack: 0.01, decay: 0.05 });
  }

  attackCrit(): void {
    this.attackHit();
    setTimeout(() => {
      this.playTone({ frequency: 800, duration: 0.15, type: 'sawtooth', gain: 0.25 });
      this.playTone({ frequency: 1200, duration: 0.1, type: 'sine', gain: 0.3 });
    }, 50);
    this.playNoise({ duration: 0.2, type: 'white', gain: 0.4, filter: { type: 'bandpass', frequency: 3000, Q: 2 } });
  }

  attackMiss(): void {
    this.playNoise({ duration: 0.15, type: 'white', gain: 0.15, filter: { type: 'highpass', frequency: 4000 } });
  }

  skillUse(): void {
    [300, 400, 500, 600, 800].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.15 - i * 0.02, type: 'sine', gain: 0.2 });
      }, i * 40);
    });
  }

  skillBuff(): void {
    [400, 500, 600, 800, 1000].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.2, type: 'sine', gain: 0.2, attack: 0.05 });
      }, i * 60);
    });
  }

  skillDebuff(): void {
    [500, 400, 300, 250, 200].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.15, type: 'sawtooth', gain: 0.15 });
      }, i * 50);
    });
  }

  skillHeal(): void {
    [523, 659, 784, 1047].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.3, type: 'sine', gain: 0.2, attack: 0.1, sustain: 0.5 });
      }, i * 100);
    });
  }

  monsterDeath(): void {
    this.playNoise({ duration: 0.3, type: 'brown', gain: 0.3 });
    [400, 300, 200, 100].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.2, type: 'sine', gain: 0.25, attack: 0.01 });
      }, i * 70);
    });
  }

  battleStart(): void {
    // Drum roll effect
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.playNoise({ duration: 0.05, type: 'white', gain: 0.2 + i * 0.02, filter: { type: 'lowpass', frequency: 500 } });
      }, i * 50);
    }
    // Final hit
    setTimeout(() => {
      this.playTone({ frequency: 100, duration: 0.3, type: 'sine', gain: 0.4 });
      this.playNoise({ duration: 0.2, type: 'white', gain: 0.3, filter: { type: 'lowpass', frequency: 800 } });
    }, 400);
  }

  battleVictory(): void {
    const melody = [523, 659, 784, 1047, 784, 1047];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.3, type: 'sine', gain: 0.3, attack: 0.02 });
        this.playTone({ frequency: freq * 1.5, duration: 0.2, type: 'sine', gain: 0.15, attack: 0.05 });
      }, i * 150);
    });
  }

  battleDefeat(): void {
    const melody = [400, 350, 300, 250, 200];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.4, type: 'sine', gain: 0.25, sustain: 0.6 });
      }, i * 200);
    });
  }

  // Gacha Sounds
  summonStart(): void {
    // Magical whoosh
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        this.playTone({
          frequency: 200 + i * 50,
          duration: 0.1,
          type: 'sine',
          gain: 0.15 + i * 0.01,
          attack: 0.02
        });
      }, i * 50);
    }
    this.playNoise({ duration: 1.0, type: 'pink', gain: 0.15, filter: { type: 'bandpass', frequency: 1000, Q: 1 } });
  }

  summonReveal(): void {
    this.playTone({ frequency: 800, duration: 0.05, type: 'sine', gain: 0.3 });
    setTimeout(() => {
      this.playTone({ frequency: 1200, duration: 0.3, type: 'sine', gain: 0.35, attack: 0.01 });
    }, 50);
  }

  summonCommon(): void {
    this.playTone({ frequency: 400, duration: 0.2, type: 'sine', gain: 0.25 });
    this.playTone({ frequency: 500, duration: 0.15, type: 'sine', gain: 0.2 });
  }

  summonRare(): void {
    [500, 600, 700].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.2, type: 'sine', gain: 0.25 });
      }, i * 80);
    });
  }

  summonSR(): void {
    [600, 750, 900, 1000].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.25, type: 'sine', gain: 0.3 });
        this.playTone({ frequency: freq * 1.5, duration: 0.15, type: 'sine', gain: 0.15 });
      }, i * 100);
    });
  }

  summonSSR(): void {
    // Epic fanfare
    const chord1 = [523, 659, 784];
    const chord2 = [587, 740, 880];
    const chord3 = [659, 830, 1047];

    chord1.forEach(freq => {
      this.playTone({ frequency: freq, duration: 0.4, type: 'sine', gain: 0.25, attack: 0.02 });
    });

    setTimeout(() => {
      chord2.forEach(freq => {
        this.playTone({ frequency: freq, duration: 0.4, type: 'sine', gain: 0.28, attack: 0.02 });
      });
    }, 300);

    setTimeout(() => {
      chord3.forEach(freq => {
        this.playTone({ frequency: freq, duration: 0.6, type: 'sine', gain: 0.35, attack: 0.02, sustain: 0.7 });
      });
      // Sparkle
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.playTone({ frequency: 2000 + Math.random() * 1000, duration: 0.1, type: 'sine', gain: 0.15 });
        }, i * 100);
      }
    }, 600);
  }

  // Misc Sounds
  levelUp(): void {
    const scale = [523, 587, 659, 698, 784, 880, 988, 1047];
    scale.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.15, type: 'sine', gain: 0.25 });
      }, i * 60);
    });
    setTimeout(() => {
      [1047, 1319, 1568].forEach(freq => {
        this.playTone({ frequency: freq, duration: 0.5, type: 'sine', gain: 0.3, sustain: 0.6 });
      });
    }, 500);
  }

  rewardCollect(): void {
    [800, 1000, 1200].forEach((freq, i) => {
      setTimeout(() => {
        this.playTone({ frequency: freq, duration: 0.1, type: 'sine', gain: 0.2 });
      }, i * 50);
    });
  }

  monsterEvolve(): void {
    // Building energy
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        this.playTone({ frequency: 200 + i * 30, duration: 0.1, type: 'sine', gain: 0.1 + i * 0.01 });
      }, i * 80);
    }
    // Explosion
    setTimeout(() => {
      this.playNoise({ duration: 0.3, type: 'white', gain: 0.4, filter: { type: 'lowpass', frequency: 2000 } });
      [400, 600, 800, 1000, 1200].forEach(freq => {
        this.playTone({ frequency: freq, duration: 0.4, type: 'sine', gain: 0.3 });
      });
    }, 1200);
  }

  // ===== MUSIC GENERATOR =====
  private musicInterval: number | null = null;
  private musicPlaying = false;

  playBackgroundMusic(type: 'menu' | 'battle' | 'victory' | 'gacha' = 'menu'): void {
    // If audio context isn't ready, queue the music for later
    if (!this.isInitialized) {
      this.pendingMusic = type;
      return;
    }

    this.stopBackgroundMusic();
    this.musicPlaying = true;

    const patterns: Record<string, { notes: number[], tempo: number, type: OscillatorType }> = {
      menu: {
        notes: [262, 294, 330, 349, 392, 349, 330, 294],
        tempo: 400,
        type: 'sine'
      },
      battle: {
        notes: [196, 220, 247, 262, 294, 262, 247, 220],
        tempo: 200,
        type: 'square'
      },
      victory: {
        notes: [523, 659, 784, 1047, 784, 659, 523, 659],
        tempo: 300,
        type: 'sine'
      },
      gacha: {
        notes: [330, 392, 494, 523, 659, 523, 494, 392],
        tempo: 350,
        type: 'triangle'
      }
    };

    const pattern = patterns[type];
    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.musicPlaying) return;

      const freq = pattern.notes[noteIndex];
      this.playTone({
        frequency: freq,
        duration: pattern.tempo / 1000 * 0.8,
        type: pattern.type,
        gain: 0.12,
        attack: 0.05,
        sustain: 0.4,
        release: 0.1
      });

      // Add harmony
      if (noteIndex % 2 === 0) {
        this.playTone({
          frequency: freq * 0.5,
          duration: pattern.tempo / 1000 * 1.5,
          type: 'sine',
          gain: 0.08,
          attack: 0.1,
          sustain: 0.5
        });
      }

      noteIndex = (noteIndex + 1) % pattern.notes.length;
    };

    playNextNote();
    this.musicInterval = window.setInterval(playNextNote, pattern.tempo);
  }

  stopBackgroundMusic(): void {
    this.musicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  isMusicPlaying(): boolean {
    return this.musicPlaying;
  }
}

// Export singleton
export const audioGenerator = new AudioGenerator();

// Convenience exports
export const playClick = () => audioGenerator.buttonClick();
export const playHover = () => audioGenerator.buttonHover();
export const playMenuOpen = () => audioGenerator.menuOpen();
export const playMenuClose = () => audioGenerator.menuClose();
export const playNotification = () => audioGenerator.notification();
export const playError = () => audioGenerator.error();

export const playAttackHit = () => audioGenerator.attackHit();
export const playAttackCrit = () => audioGenerator.attackCrit();
export const playAttackMiss = () => audioGenerator.attackMiss();
export const playSkillUse = () => audioGenerator.skillUse();
export const playSkillBuff = () => audioGenerator.skillBuff();
export const playSkillDebuff = () => audioGenerator.skillDebuff();
export const playSkillHeal = () => audioGenerator.skillHeal();
export const playMonsterDeath = () => audioGenerator.monsterDeath();
export const playBattleStart = () => audioGenerator.battleStart();
export const playBattleVictory = () => audioGenerator.battleVictory();
export const playBattleDefeat = () => audioGenerator.battleDefeat();

export const playSummonStart = () => audioGenerator.summonStart();
export const playSummonReveal = () => audioGenerator.summonReveal();
export const playSummonCommon = () => audioGenerator.summonCommon();
export const playSummonRare = () => audioGenerator.summonRare();
export const playSummonSR = () => audioGenerator.summonSR();
export const playSummonSSR = () => audioGenerator.summonSSR();

export const playLevelUp = () => audioGenerator.levelUp();
export const playRewardCollect = () => audioGenerator.rewardCollect();
export const playMonsterEvolve = () => audioGenerator.monsterEvolve();

export const playMusic = (type: 'menu' | 'battle' | 'victory' | 'gacha') => audioGenerator.playBackgroundMusic(type);
export const stopMusic = () => audioGenerator.stopBackgroundMusic();
