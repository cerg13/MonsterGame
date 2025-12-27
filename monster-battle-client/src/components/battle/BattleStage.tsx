import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { useBattleStore, selectDungeonResult } from '../../store';
import type { BattleAction } from '../../types/battle';
import { useAudio } from '../../hooks/useAudio';
import { useAchievementTracker } from '../../hooks/useAchievementTracker';
import {
  shakeAnimation,
  createDamageNumber,
  createSkillEffect,
  attackAnimation,
  tween,
  Easing,
  createCastingEffect,
  createProjectile,
  createImpactEffect,
  createHealEffect,
  createBuffEffect,
  createFreezeEffect,
  createStunEffect,
  createBurnEffect,
  createSleepEffect,
  createPoisonEffect,
} from '../../utils/animations';
import { BattleSummary } from './BattleSummary';
import { DungeonRewardScreen } from '../dungeon';
import './BattleStage.css';

interface BattleStageProps {
  width?: number;
  height?: number;
}

export const BattleStage: React.FC<BattleStageProps> = ({
  width = 800,
  height = 500,
}) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const monsterGraphicsRef = useRef<Map<string, Graphics>>(new Map());
  const monsterGlowRef = useRef<Map<string, Graphics>>(new Map());
  const monsterHpBarRef = useRef<Map<string, { bar: Graphics; x: number; y: number }>>(new Map());
  const monsterPrevHpRef = useRef<Map<string, number>>(new Map());
  const monsterEffectIconsRef = useRef<Map<string, Container>>(new Map());
  const monsterTargetHighlightRef = useRef<Map<string, Graphics>>(new Map());
  const atbBarsRef = useRef<Map<string, { bar: Graphics; glow: Graphics; prevAtb: number }>>(new Map());
  const atbContainerRef = useRef<Container | null>(null);
  const monsterBasePositions = useRef<Map<string, { x: number; y: number; centerX: number; centerY: number }>>(new Map());
  const idleAnimationRef = useRef<number | null>(null);
  const eyeBlinkTimers = useRef<Map<string, number>>(new Map());
  const statusEffectAnimations = useRef<Map<string, { type: string; cleanup: () => void }[]>>(new Map());
  const effectContainerRef = useRef<Container | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);
  const [lastLogLength, setLastLogLength] = useState(0);
  const [showBattleSummary, setShowBattleSummary] = useState(false);
  const [showDungeonRewards, setShowDungeonRewards] = useState(false);
  const hasPlayedBattleStart = useRef(false);
  const hasPlayedBattleEnd = useRef(false);
  const hasInitializedMonsters = useRef(false);
  const activeGlowAnimation = useRef<number | null>(null);

  // Dungeon result
  const dungeonResult = useBattleStore(selectDungeonResult);
  const clearDungeonResult = useBattleStore((state) => state.clearDungeonResult);
  const endBattle = useBattleStore((state) => state.endBattle);

  const {
    battleState,
    submitAction,
    toggleAutoMode,
    processTick,
    battleSpeed,
    setBattleSpeed,
  } = useBattleStore();

  // Audio hooks for battle sounds
  const {
    playMusic,
    stopMusic,
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
    playClick,
  } = useAudio();

  // Achievement tracking
  const { trackBattleEnd } = useAchievementTracker();
  const hasTrackedAchievements = useRef(false);

  // Play battle music on mount
  useEffect(() => {
    playMusic('battle');
    return () => stopMusic();
  }, [playMusic, stopMusic]);

  // Play battle start sound
  useEffect(() => {
    if (battleState && !hasPlayedBattleStart.current) {
      playBattleStart();
      hasPlayedBattleStart.current = true;
    }
  }, [battleState, playBattleStart]);

  // Play victory/defeat sounds and track achievements
  useEffect(() => {
    if (battleState?.winner && !hasPlayedBattleEnd.current) {
      hasPlayedBattleEnd.current = true;
      stopMusic();
      if (battleState.winner === 'player') {
        playBattleVictory();
        // Play victory music after fanfare
        setTimeout(() => playMusic('victory'), 1000);
      } else {
        playBattleDefeat();
      }

      // Track achievements (only once per battle)
      if (!hasTrackedAchievements.current) {
        hasTrackedAchievements.current = true;
        trackBattleEnd(battleState, false); // TODO: Pass isArena flag based on battle type
      }
    }
  }, [battleState?.winner, playBattleVictory, playBattleDefeat, playMusic, stopMusic, battleState, trackBattleEnd]);

  // Show dungeon rewards when dungeon battle ends
  useEffect(() => {
    if (dungeonResult && battleState?.winner) {
      // Short delay to let victory animation play
      const timer = setTimeout(() => {
        setShowDungeonRewards(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [dungeonResult, battleState?.winner]);

  // Handle dungeon reward screen close
  const handleDungeonRewardClose = useCallback(() => {
    setShowDungeonRewards(false);
    clearDungeonResult();
    endBattle();
    navigate('/dungeons');
  }, [clearDungeonResult, endBattle, navigate]);

  // Handle dungeon repeat
  const handleDungeonRepeat = useCallback(() => {
    // TODO: Implement auto-repeat logic
    setShowDungeonRewards(false);
    clearDungeonResult();
    endBattle();
    navigate('/dungeons');
  }, [clearDungeonResult, endBattle, navigate]);

  // Game loop - process ticks to advance ATB bars
  useEffect(() => {
    if (!battleState || battleState.phase === 'battle_end' || battleState.winner) {
      return;
    }

    // Tick interval based on battle speed (faster = shorter interval)
    const baseInterval = 100; // 100ms base tick
    const interval = baseInterval / battleSpeed;

    const gameLoop = setInterval(() => {
      // Only process tick if we're in tick phase or need to advance
      if (battleState.phase === 'tick' || battleState.phase === 'initialization') {
        processTick();
      }
    }, interval);

    return () => clearInterval(gameLoop);
  }, [battleState?.phase, battleState?.winner, battleSpeed, processTick]);

  // Initialize PixiJS
  useEffect(() => {
    if (!containerRef.current || appRef.current) return;

    const app = new Application();

    const initApp = async () => {
      await app.init({
        width,
        height,
        backgroundColor: 0x1a1a2e,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
      });

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }

      appRef.current = app;

      // Create effect container
      effectContainerRef.current = new Container();
      effectContainerRef.current.zIndex = 1000;
      app.stage.sortableChildren = true;

      initBattleScene(app);

      // Use ticker to check for battle state and create sprites
      const checkBattleState = () => {
        const state = useBattleStore.getState().battleState;
        if (state && !hasInitializedMonsters.current) {
          // Element colors
          const COLORS: Record<string, number> = {
            fire: 0xff4500, water: 0x00bfff, wind: 0x32cd32, light: 0xffd700, dark: 0x8b00ff
          };

          // Create player team monsters
          state.playerTeam.forEach((monster, index) => {
            if (index >= 2) return;
            const x = 80;
            const y = 170 + index * 85;
            const color = COLORS[monster.element] || 0xff4500;

            // Create glow effect (behind monster)
            const glow = new Graphics();
            // Outer glow rings - more prominent
            glow.circle(x + 35, y + 35, 50);
            glow.fill({ color: 0x48dbfb, alpha: 0.2 });
            glow.circle(x + 35, y + 35, 45);
            glow.fill({ color: 0x48dbfb, alpha: 0.35 });
            glow.circle(x + 35, y + 35, 40);
            glow.fill({ color: 0x48dbfb, alpha: 0.5 });
            glow.circle(x + 35, y + 35, 36);
            glow.stroke({ color: 0x48dbfb, width: 4, alpha: 1.0 });
            glow.visible = false;
            glow.label = `glow_${monster.id}`;
            app.stage.addChild(glow);
            monsterGlowRef.current.set(monster.id, glow);

            const graphics = new Graphics();
            graphics.circle(x + 35, y + 35, 30);
            graphics.fill(color);
            graphics.circle(x + 35, y + 30, 22);
            graphics.fill({ color: 0xffffff, alpha: 0.15 });
            graphics.circle(x + 25, y + 30, 6);
            graphics.fill(0xffffff);
            graphics.circle(x + 45, y + 30, 6);
            graphics.fill(0xffffff);
            graphics.circle(x + 26, y + 31, 4);
            graphics.fill(color);
            graphics.circle(x + 46, y + 31, 4);
            graphics.fill(color);
            graphics.circle(x + 27, y + 32, 2);
            graphics.fill(0x000000);
            graphics.circle(x + 47, y + 32, 2);
            graphics.fill(0x000000);
            graphics.circle(x + 24, y + 29, 1.5);
            graphics.fill(0xffffff);
            graphics.circle(x + 44, y + 29, 1.5);
            graphics.fill(0xffffff);
            // HP bar background
            graphics.rect(x, y + 72, 70, 10);
            graphics.fill(0x333333);

            graphics.label = `monster_${monster.id}`;
            app.stage.addChild(graphics);
            monsterGraphicsRef.current.set(monster.id, graphics);

            // Store base position for idle animation
            monsterBasePositions.current.set(monster.id, { x, y, centerX: x + 35, centerY: y + 35 });
            eyeBlinkTimers.current.set(monster.id, Math.random() * 5000 + 3000);

            // Separate HP bar fill (for animation)
            const hpBar = new Graphics();
            const hpPct = monster.currentHp / monster.maxHp;
            hpBar.rect(0, 0, 68 * hpPct, 8);
            hpBar.fill(hpPct > 0.5 ? 0x00ff00 : hpPct > 0.25 ? 0xffff00 : 0xff0000);
            hpBar.x = x + 1;
            hpBar.y = y + 73;
            hpBar.label = `hpbar_${monster.id}`;
            app.stage.addChild(hpBar);
            monsterHpBarRef.current.set(monster.id, { bar: hpBar, x: x + 1, y: y + 73 });
            monsterPrevHpRef.current.set(monster.id, monster.currentHp);

            // Add name label
            const nameText = new Text({
              text: monster.name.substring(0, 10),
              style: new TextStyle({ fontSize: 10, fill: 0xffffff, fontWeight: 'bold' })
            });
            nameText.x = x + 35 - nameText.width / 2;
            nameText.y = y + 84;
            app.stage.addChild(nameText);

            // Create effect icons container (above monster)
            const effectIconsContainer = new Container();
            effectIconsContainer.x = x + 35;
            effectIconsContainer.y = y - 5;
            effectIconsContainer.label = `effects_${monster.id}`;
            app.stage.addChild(effectIconsContainer);
            monsterEffectIconsRef.current.set(monster.id, effectIconsContainer);

            // Create target highlight (green ring for ally targeting)
            const targetHighlight = new Graphics();
            targetHighlight.circle(x + 35, y + 35, 38);
            targetHighlight.stroke({ color: 0x44ff44, width: 3, alpha: 0.9 });
            targetHighlight.circle(x + 35, y + 35, 42);
            targetHighlight.stroke({ color: 0x00ff00, width: 2, alpha: 0.6 });
            targetHighlight.visible = false;
            targetHighlight.label = `target_${monster.id}`;
            app.stage.addChild(targetHighlight);
            monsterTargetHighlightRef.current.set(monster.id, targetHighlight);
          });

          // Create enemy team monsters
          state.enemyTeam.forEach((monster, index) => {
            if (index >= 2) return;
            const x = 650;
            const y = 170 + index * 85;
            const color = COLORS[monster.element] || 0xff4500;

            // Create glow effect (behind monster) - red for enemies
            const glow = new Graphics();
            glow.circle(x + 35, y + 35, 50);
            glow.fill({ color: 0xff6b6b, alpha: 0.2 });
            glow.circle(x + 35, y + 35, 45);
            glow.fill({ color: 0xff6b6b, alpha: 0.35 });
            glow.circle(x + 35, y + 35, 40);
            glow.fill({ color: 0xff6b6b, alpha: 0.5 });
            glow.circle(x + 35, y + 35, 36);
            glow.stroke({ color: 0xff6b6b, width: 4, alpha: 1.0 });
            glow.visible = false;
            glow.label = `glow_${monster.id}`;
            app.stage.addChild(glow);
            monsterGlowRef.current.set(monster.id, glow);

            const graphics = new Graphics();
            graphics.circle(x + 35, y + 35, 30);
            graphics.fill(color);
            graphics.circle(x + 35, y + 30, 22);
            graphics.fill({ color: 0xffffff, alpha: 0.15 });
            graphics.circle(x + 25, y + 30, 6);
            graphics.fill(0xffffff);
            graphics.circle(x + 45, y + 30, 6);
            graphics.fill(0xffffff);
            graphics.circle(x + 26, y + 31, 4);
            graphics.fill(color);
            graphics.circle(x + 46, y + 31, 4);
            graphics.fill(color);
            graphics.circle(x + 27, y + 32, 2);
            graphics.fill(0x000000);
            graphics.circle(x + 47, y + 32, 2);
            graphics.fill(0x000000);
            graphics.circle(x + 24, y + 29, 1.5);
            graphics.fill(0xffffff);
            graphics.circle(x + 44, y + 29, 1.5);
            graphics.fill(0xffffff);
            // HP bar background
            graphics.rect(x, y + 72, 70, 10);
            graphics.fill(0x333333);

            graphics.label = `monster_${monster.id}`;
            app.stage.addChild(graphics);
            monsterGraphicsRef.current.set(monster.id, graphics);

            // Store base position for idle animation (enemy team)
            monsterBasePositions.current.set(monster.id, { x, y, centerX: x + 35, centerY: y + 35 });
            eyeBlinkTimers.current.set(monster.id, Math.random() * 5000 + 3000);

            // Separate HP bar fill (for animation)
            const hpBar = new Graphics();
            const hpPct = monster.currentHp / monster.maxHp;
            hpBar.rect(0, 0, 68 * hpPct, 8);
            hpBar.fill(hpPct > 0.5 ? 0x00ff00 : hpPct > 0.25 ? 0xffff00 : 0xff0000);
            hpBar.x = x + 1;
            hpBar.y = y + 73;
            hpBar.label = `hpbar_${monster.id}`;
            app.stage.addChild(hpBar);
            monsterHpBarRef.current.set(monster.id, { bar: hpBar, x: x + 1, y: y + 73 });
            monsterPrevHpRef.current.set(monster.id, monster.currentHp);

            // Add name label
            const nameText = new Text({
              text: monster.name.substring(0, 10),
              style: new TextStyle({ fontSize: 10, fill: 0xffffff, fontWeight: 'bold' })
            });
            nameText.x = x + 35 - nameText.width / 2;
            nameText.y = y + 84;
            app.stage.addChild(nameText);

            // Create effect icons container (above monster)
            const effectIconsContainer = new Container();
            effectIconsContainer.x = x + 35;
            effectIconsContainer.y = y - 5;
            effectIconsContainer.label = `effects_${monster.id}`;
            app.stage.addChild(effectIconsContainer);
            monsterEffectIconsRef.current.set(monster.id, effectIconsContainer);

            // Create target highlight (red pulsing ring for targeting)
            const targetHighlight = new Graphics();
            targetHighlight.circle(x + 35, y + 35, 38);
            targetHighlight.stroke({ color: 0xff4444, width: 3, alpha: 0.9 });
            targetHighlight.circle(x + 35, y + 35, 42);
            targetHighlight.stroke({ color: 0xff0000, width: 2, alpha: 0.6 });
            targetHighlight.visible = false;
            targetHighlight.label = `target_${monster.id}`;
            app.stage.addChild(targetHighlight);
            monsterTargetHighlightRef.current.set(monster.id, targetHighlight);
          });

          hasInitializedMonsters.current = true;
          app.ticker.remove(checkBattleState);

          // Start idle animation loop (floating/bobbing + breathing)
          const startIdleAnimation = () => {
            const startTime = performance.now();

            const animateIdle = () => {
              const elapsed = performance.now() - startTime;

              monsterBasePositions.current.forEach((basePos, monsterId) => {
                const graphics = monsterGraphicsRef.current.get(monsterId);
                const glow = monsterGlowRef.current.get(monsterId);
                const hpBarData = monsterHpBarRef.current.get(monsterId);
                const effectIcons = monsterEffectIconsRef.current.get(monsterId);
                const targetHighlight = monsterTargetHighlightRef.current.get(monsterId);

                if (!graphics || graphics.alpha < 0.5) return; // Skip dead monsters

                // Unique phase offset based on monster ID hash
                const phaseOffset = monsterId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 1000;

                // Floating/bobbing motion (sine wave, 2-3% vertical movement)
                const floatSpeed = 1500 + (phaseOffset % 500); // Slightly different speeds
                const floatAmplitude = 3 + (phaseOffset % 2); // 3-4 pixels
                const floatOffset = Math.sin((elapsed + phaseOffset * 100) / floatSpeed) * floatAmplitude;

                // Breathing effect (subtle scale pulse)
                const breathSpeed = 2000 + (phaseOffset % 400);
                const breathScale = 1 + Math.sin((elapsed + phaseOffset * 50) / breathSpeed) * 0.015; // 1.5% scale variation

                // Apply transformations
                // For floating, we move relative to base position
                const newY = basePos.y + floatOffset;

                // Calculate the offset from current position
                graphics.pivot.set(35, 35); // Pivot at center (sprite is 70x70)
                graphics.position.set(basePos.x + 35, newY + 35);
                graphics.scale.set(breathScale);

                // Move glow with monster
                if (glow) {
                  glow.pivot.set(basePos.centerX, basePos.centerY);
                  glow.position.set(basePos.centerX, basePos.centerY + floatOffset);
                }

                // Move HP bar with monster (but don't scale it)
                if (hpBarData) {
                  hpBarData.bar.y = basePos.y + 73 + floatOffset;
                }

                // Move effect icons with monster
                if (effectIcons) {
                  effectIcons.y = basePos.y - 5 + floatOffset;
                }

                // Move target highlight with monster
                if (targetHighlight) {
                  targetHighlight.pivot.set(basePos.centerX, basePos.centerY);
                  targetHighlight.position.set(basePos.centerX, basePos.centerY + floatOffset);
                }
              });

              idleAnimationRef.current = requestAnimationFrame(animateIdle);
            };

            idleAnimationRef.current = requestAnimationFrame(animateIdle);
          };

          startIdleAnimation();
        }
      };
      app.ticker.add(checkBattleState);
    };

    initApp();

    return () => {
      monsterGraphicsRef.current.clear();
      monsterGlowRef.current.clear();
      monsterHpBarRef.current.clear();
      monsterPrevHpRef.current.clear();
      monsterEffectIconsRef.current.clear();
      monsterTargetHighlightRef.current.clear();
      monsterBasePositions.current.clear();
      eyeBlinkTimers.current.clear();
      // Cleanup status effect animations
      statusEffectAnimations.current.forEach((effects) => {
        effects.forEach(effect => effect.cleanup());
      });
      statusEffectAnimations.current.clear();
      hasInitializedMonsters.current = false;
      if (activeGlowAnimation.current) {
        cancelAnimationFrame(activeGlowAnimation.current);
        activeGlowAnimation.current = null;
      }
      if (idleAnimationRef.current) {
        cancelAnimationFrame(idleAnimationRef.current);
        idleAnimationRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [width, height]);

  // Initialize battle scene structure
  const initBattleScene = useCallback((app: Application) => {
    // Draw background
    const bg = new Graphics();
    bg.rect(0, 0, width, height);

    // Gradient-like effect with multiple rects
    bg.fill(0x1a1a2e);

    // Add subtle pattern
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      bg.circle(x, y, 2);
      bg.fill({ color: 0xffffff, alpha: 0.03 });
    }

    app.stage.addChild(bg);

    // Draw battle arena floor
    const arena = new Graphics();
    arena.ellipse(width / 2, height - 80, width * 0.45, 60);
    arena.fill({ color: 0x16213e, alpha: 0.6 });
    arena.ellipse(width / 2, height - 80, width * 0.45, 60);
    arena.stroke({ color: 0x0f3460, width: 3, alpha: 0.5 });
    app.stage.addChild(arena);

    // Divider line
    const divider = new Graphics();
    divider.moveTo(width / 2, 100);
    divider.lineTo(width / 2, height - 50);
    divider.stroke({ color: 0x333355, width: 2, alpha: 0.3 });
    app.stage.addChild(divider);

    // Team labels
    const playerLabelStyle = new TextStyle({
      fontSize: 14,
      fill: 0x48dbfb,
      fontWeight: 'bold',
    });
    const playerLabel = new Text({ text: 'YOUR TEAM', style: playerLabelStyle });
    playerLabel.x = 80;
    playerLabel.y = 140;
    app.stage.addChild(playerLabel);

    const enemyLabelStyle = new TextStyle({
      fontSize: 14,
      fill: 0xff6b6b,
      fontWeight: 'bold',
    });
    const enemyLabel = new Text({ text: 'ENEMY TEAM', style: enemyLabelStyle });
    enemyLabel.x = width - 170;
    enemyLabel.y = 140;
    app.stage.addChild(enemyLabel);

    // Add effect container
    if (effectContainerRef.current) {
      app.stage.addChild(effectContainerRef.current);
    }

    // Monster graphics will be created dynamically when battle starts
  }, [width, height]);


  // Update monsters when battle state changes
  useEffect(() => {
    if (!appRef.current || !battleState) return;

    updateMonsterSprites();
    updateActiveGlow();
    updateStatusEffects();
    updateStatusEffectAnimations();
    animateHpBars();
    updateATBDisplay();
    updateTurnIndicator();

    // Check for new battle log entries to trigger animations
    if (battleState.battleLog.length > lastLogLength) {
      const newEntries = battleState.battleLog.slice(lastLogLength);
      newEntries.forEach(entry => handleBattleLogEntry(entry));
      setLastLogLength(battleState.battleLog.length);
    }
  }, [battleState]);

  // Update monster sprites based on battle state (visibility/alpha only)
  const updateMonsterSprites = useCallback(() => {
    if (!appRef.current || !battleState) return;

    // Update all monsters
    [...battleState.playerTeam, ...battleState.enemyTeam].forEach((monster) => {
      const graphics = monsterGraphicsRef.current.get(monster.id);
      if (graphics) {
        graphics.alpha = monster.isAlive ? 1 : 0.3;
      }
    });
  }, [battleState]);

  // Update active monster glow
  const updateActiveGlow = useCallback(() => {
    if (!battleState) return;

    // Cancel any existing glow animation
    if (activeGlowAnimation.current) {
      cancelAnimationFrame(activeGlowAnimation.current);
      activeGlowAnimation.current = null;
    }

    // Hide all glows first
    monsterGlowRef.current.forEach((glow) => {
      glow.visible = false;
      glow.alpha = 1;
      glow.scale.set(1);
    });

    // Show and animate the active monster's glow
    const activeId = battleState.activeMonster;
    if (!activeId) return;

    const activeGlow = monsterGlowRef.current.get(activeId);
    if (!activeGlow) return;

    activeGlow.visible = true;

    // Pulsing animation
    const startTime = performance.now();
    const animate = () => {
      const elapsed = performance.now() - startTime;
      const pulse = Math.sin(elapsed / 300) * 0.15 + 0.85; // Oscillate between 0.7 and 1.0
      const scalePulse = Math.sin(elapsed / 400) * 0.05 + 1; // Slight scale pulse

      activeGlow.alpha = pulse;
      activeGlow.scale.set(scalePulse);

      activeGlowAnimation.current = requestAnimationFrame(animate);
    };

    activeGlowAnimation.current = requestAnimationFrame(animate);
  }, [battleState]);

  // Status effect icon colors and symbols
  const EFFECT_CONFIG: Record<string, { color: number; symbol: string; isBuff: boolean }> = {
    atkUp: { color: 0xff6b6b, symbol: '⚔', isBuff: true },
    atkDown: { color: 0xff6b6b, symbol: '⚔', isBuff: false },
    defUp: { color: 0x48dbfb, symbol: '🛡', isBuff: true },
    defDown: { color: 0x48dbfb, symbol: '🛡', isBuff: false },
    spdUp: { color: 0x1dd1a1, symbol: '⚡', isBuff: true },
    spdDown: { color: 0x1dd1a1, symbol: '⚡', isBuff: false },
    critRateUp: { color: 0xfeca57, symbol: '💥', isBuff: true },
    critRateDown: { color: 0xfeca57, symbol: '💥', isBuff: false },
    immunity: { color: 0xffffff, symbol: '✨', isBuff: true },
    invincibility: { color: 0xffd700, symbol: '🌟', isBuff: true },
    stun: { color: 0xffff00, symbol: '💫', isBuff: false },
    freeze: { color: 0x00ffff, symbol: '❄', isBuff: false },
    sleep: { color: 0x9b59b6, symbol: '💤', isBuff: false },
    continuousDamage: { color: 0x8b0000, symbol: '🔥', isBuff: false },
    heal: { color: 0x00ff00, symbol: '💚', isBuff: true },
  };

  // Update status effect icons above monsters
  const updateStatusEffects = useCallback(() => {
    if (!battleState) return;

    const allMonsters = [...battleState.playerTeam, ...battleState.enemyTeam];

    allMonsters.forEach((monster) => {
      const container = monsterEffectIconsRef.current.get(monster.id);
      if (!container) return;

      // Clear existing icons
      container.removeChildren();

      // Combine buffs and debuffs
      const allEffects = [...monster.buffs, ...monster.debuffs];
      if (allEffects.length === 0) return;

      // Icon size and spacing
      const iconSize = 16;
      const spacing = 18;
      const totalWidth = allEffects.length * spacing;
      const startX = -totalWidth / 2 + iconSize / 2;

      allEffects.forEach((effect, index) => {
        const config = EFFECT_CONFIG[effect.type];
        if (!config) return;

        const x = startX + index * spacing;

        // Background circle
        const bg = new Graphics();
        bg.circle(x, 0, iconSize / 2 + 2);
        bg.fill({ color: config.isBuff ? 0x2d5a27 : 0x5a2727, alpha: 0.9 });
        bg.circle(x, 0, iconSize / 2 + 2);
        bg.stroke({ color: config.isBuff ? 0x4ade80 : 0xf87171, width: 2 });
        container.addChild(bg);

        // Effect symbol
        const symbolText = new Text({
          text: config.symbol,
          style: new TextStyle({
            fontSize: 12,
            fill: config.color,
          }),
        });
        symbolText.anchor.set(0.5);
        symbolText.x = x;
        symbolText.y = 0;
        container.addChild(symbolText);

        // Duration indicator (small number)
        if (effect.duration > 0) {
          const durationText = new Text({
            text: effect.duration.toString(),
            style: new TextStyle({
              fontSize: 8,
              fill: 0xffffff,
              fontWeight: 'bold',
            }),
          });
          durationText.anchor.set(0.5);
          durationText.x = x + 6;
          durationText.y = 6;
          container.addChild(durationText);
        }
      });
    });
  }, [battleState]);

  // Map debuff types to their visual effect creators
  const STATUS_EFFECT_ANIMATIONS: Record<string, (parent: Container, x: number, y: number) => { container: Container; cleanup: () => void }> = {
    freeze: createFreezeEffect,
    stun: createStunEffect,
    continuousDamage: createBurnEffect,
    sleep: createSleepEffect,
    poison: createPoisonEffect,
  };

  // Update visual status effect animations on monsters
  const updateStatusEffectAnimations = useCallback(() => {
    if (!appRef.current || !battleState) return;

    const allMonsters = [...battleState.playerTeam, ...battleState.enemyTeam];

    allMonsters.forEach((monster) => {
      const basePos = monsterBasePositions.current.get(monster.id);
      if (!basePos) return;

      // Get current debuff types that have visual effects
      const currentEffectTypes = new Set(
        monster.debuffs
          .map(d => d.type)
          .filter(type => STATUS_EFFECT_ANIMATIONS[type])
      );

      // Get currently active animation types for this monster
      const activeAnimations = statusEffectAnimations.current.get(monster.id) || [];
      const activeTypes = new Set(activeAnimations.map(a => a.type));

      // Remove animations for effects that are no longer active
      const toRemove = activeAnimations.filter(a => !currentEffectTypes.has(a.type));
      toRemove.forEach(a => a.cleanup());

      // Keep only active animations
      const remaining = activeAnimations.filter(a => currentEffectTypes.has(a.type));

      // Add new animations for new effects
      currentEffectTypes.forEach(type => {
        if (!activeTypes.has(type) && monster.isAlive) {
          const createEffect = STATUS_EFFECT_ANIMATIONS[type];
          if (createEffect && appRef.current) {
            const effect = createEffect(
              appRef.current.stage,
              basePos.centerX,
              basePos.centerY
            );
            remaining.push({ type, cleanup: effect.cleanup });
          }
        }
      });

      // Update the map
      if (remaining.length > 0) {
        statusEffectAnimations.current.set(monster.id, remaining);
      } else {
        statusEffectAnimations.current.delete(monster.id);
      }

      // Cleanup animations for dead monsters
      if (!monster.isAlive) {
        const deadAnimations = statusEffectAnimations.current.get(monster.id);
        if (deadAnimations) {
          deadAnimations.forEach(a => a.cleanup());
          statusEffectAnimations.current.delete(monster.id);
        }
      }
    });
  }, [battleState]);

  // Animate HP bar changes
  const animateHpBars = useCallback(() => {
    if (!battleState) return;

    const allMonsters = [...battleState.playerTeam, ...battleState.enemyTeam];

    allMonsters.forEach((monster) => {
      const hpBarData = monsterHpBarRef.current.get(monster.id);
      const prevHp = monsterPrevHpRef.current.get(monster.id);

      if (!hpBarData || prevHp === undefined) return;

      const currentHp = monster.currentHp;
      const maxHp = monster.maxHp;

      // Only animate if HP changed
      if (prevHp !== currentHp) {
        const fromPct = prevHp / maxHp;
        const toPct = currentHp / maxHp;

        // Animate HP bar width
        tween(fromPct, toPct, {
          duration: 400,
          easing: Easing.easeOutQuad,
          onUpdate: (pct) => {
            const { bar } = hpBarData;
            bar.clear();
            bar.rect(0, 0, 68 * Math.max(0, pct), 8);
            // Color based on percentage
            const color = pct > 0.5 ? 0x00ff00 : pct > 0.25 ? 0xffff00 : 0xff0000;
            bar.fill(color);
          },
        });

        // Update previous HP
        monsterPrevHpRef.current.set(monster.id, currentHp);
      }
    });
  }, [battleState]);

  // Helper to find monster by name and get its graphics
  const findMonsterByName = useCallback((name: string) => {
    if (!battleState) return null;
    const allMonsters = [...battleState.playerTeam, ...battleState.enemyTeam];
    const monster = allMonsters.find(m => m.name === name);
    if (!monster) return null;
    const graphics = monsterGraphicsRef.current.get(monster.id);
    return { monster, graphics };
  }, [battleState]);

  // Helper to find monster by ID
  const findMonsterById = useCallback((id: string) => {
    if (!battleState) return null;
    const allMonsters = [...battleState.playerTeam, ...battleState.enemyTeam];
    const monster = allMonsters.find(m => m.id === id);
    if (!monster) return null;
    const graphics = monsterGraphicsRef.current.get(monster.id);
    const isPlayer = battleState.playerTeam.some(m => m.id === id);
    return { monster, graphics, isPlayer };
  }, [battleState]);

  // Play death animation
  const playDeathAnimation = useCallback((graphics: Graphics) => {
    const startY = graphics.y;
    const startAlpha = graphics.alpha;

    tween(0, 1, {
      duration: 600,
      easing: Easing.easeInQuad,
      onUpdate: (progress) => {
        graphics.alpha = startAlpha * (1 - progress);
        graphics.y = startY + 30 * progress;
        graphics.scale.y = 1 - progress * 0.5;
      },
      onComplete: () => {
        graphics.visible = false;
      },
    });
  }, []);

  // Play hit animation with flash effect
  const playHitAnimation = useCallback((graphics: Graphics, damage: number, isCrit: boolean = false) => {
    if (!effectContainerRef.current) return;

    // Get graphics center position for damage number
    const bounds = graphics.getBounds();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y;

    // Create damage number
    createDamageNumber(effectContainerRef.current, damage, centerX, centerY, { isCrit });

    // Shake animation
    shakeAnimation(graphics, isCrit ? 12 : 8, 300);

    // Flash red effect using tint
    const originalTint = graphics.tint;
    graphics.tint = 0xff0000;
    setTimeout(() => {
      graphics.tint = originalTint;
    }, 150);
  }, []);

  // Screen shake effect for critical hits
  const screenShake = useCallback((intensity: number = 8, duration: number = 300) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const startTime = performance.now();

    const shake = () => {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        container.style.transform = '';
        return;
      }

      const decay = 1 - progress;
      const offsetX = (Math.random() - 0.5) * intensity * decay * 2;
      const offsetY = (Math.random() - 0.5) * intensity * decay * 2;

      container.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      requestAnimationFrame(shake);
    };

    shake();
  }, []);

  // Handle battle log entries for sounds and animations
  const handleBattleLogEntry = useCallback((entry: {
    actorId?: string;
    action: string;
    damage?: number;
    healing?: number;
    targets?: string[];
    isCrit?: boolean;
    isMiss?: boolean;
    effects?: string[];
  }) => {
    // Get actor info for attack animation
    const actorInfo = entry.actorId ? findMonsterById(entry.actorId) : null;

    // Handle damage
    if (entry.damage && entry.targets) {
      playSkillUse();

      // Play attack animation on actor with casting effect
      if (actorInfo?.graphics && effectContainerRef.current) {
        const direction = actorInfo.isPlayer ? 'right' : 'left';
        const actorBounds = actorInfo.graphics.getBounds();
        const actorX = actorBounds.x + actorBounds.width / 2;
        const actorY = actorBounds.y + actorBounds.height / 2;

        // Casting charge-up effect
        createCastingEffect(
          effectContainerRef.current,
          actorX,
          actorY,
          actorInfo.monster.element,
          300
        );

        // Attack lunge animation
        attackAnimation(actorInfo.graphics, direction, 40, 250);
      }

      // Animate each target with projectile and impact
      entry.targets.forEach((targetName, index) => {
        setTimeout(() => {
          const targetInfo = findMonsterByName(targetName);
          if (targetInfo?.graphics && effectContainerRef.current && actorInfo?.graphics) {
            const actorBounds = actorInfo.graphics.getBounds();
            const targetBounds = targetInfo.graphics.getBounds();
            const actorX = actorBounds.x + actorBounds.width / 2;
            const actorY = actorBounds.y + actorBounds.height / 2;
            const targetX = targetBounds.x + targetBounds.width / 2;
            const targetY = targetBounds.y + targetBounds.height / 2;

            // Projectile from actor to target
            createProjectile(
              effectContainerRef.current,
              actorX,
              actorY,
              targetX,
              targetY,
              actorInfo.monster.element,
              250
            ).then(() => {
              // Impact effect on hit
              if (effectContainerRef.current) {
                createImpactEffect(
                  effectContainerRef.current,
                  targetX,
                  targetY,
                  actorInfo.monster.element,
                  entry.isCrit ? 1.5 : 1
                );
              }
            });

            // Play hit animation
            setTimeout(() => {
              if (targetInfo.graphics) {
                playHitAnimation(targetInfo.graphics, entry.damage!, entry.isCrit);

                // Check if monster died
                if (!targetInfo.monster.isAlive) {
                  setTimeout(() => {
                    playDeathAnimation(targetInfo.graphics!);
                    playMonsterDeath();
                  }, 300);
                }
              }
            }, 250);
          }

          // Play sound and screen shake for crits
          if (entry.isCrit) {
            playAttackCrit();
            screenShake(12, 400);
          } else {
            playAttackHit();
          }
        }, index * 200);
      });
    }

    // Handle miss
    if (entry.isMiss && entry.targets) {
      playAttackMiss();

      // Show "MISS" text
      entry.targets.forEach((targetName) => {
        const targetInfo = findMonsterByName(targetName);
        if (targetInfo?.graphics && effectContainerRef.current) {
          const bounds = targetInfo.graphics.getBounds();
          const missText = new Text({
            text: 'MISS',
            style: new TextStyle({
              fontSize: 18,
              fontWeight: 'bold',
              fill: 0xcccccc,
              stroke: { color: 0x000000, width: 3 },
            }),
          });
          missText.anchor.set(0.5);
          missText.x = bounds.x + bounds.width / 2;
          missText.y = bounds.y;
          effectContainerRef.current.addChild(missText);

          // Animate and remove
          tween(0, 1, {
            duration: 800,
            onUpdate: (progress) => {
              missText.y = bounds.y - 40 * progress;
              missText.alpha = 1 - progress;
            },
            onComplete: () => {
              effectContainerRef.current?.removeChild(missText);
            },
          });
        }
      });
    }

    // Handle healing
    if (entry.healing && entry.targets) {
      playSkillHeal();

      // Casting effect on healer
      if (actorInfo?.graphics && effectContainerRef.current) {
        const bounds = actorInfo.graphics.getBounds();
        createCastingEffect(
          effectContainerRef.current,
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
          'light',
          250
        );
      }

      entry.targets.forEach((targetName) => {
        const targetInfo = findMonsterByName(targetName);
        if (targetInfo?.graphics && effectContainerRef.current) {
          const bounds = targetInfo.graphics.getBounds();

          // Create heal number (green, positive)
          createDamageNumber(
            effectContainerRef.current,
            entry.healing!,
            bounds.x + bounds.width / 2,
            bounds.y,
            { isHeal: true }
          );

          // Create heal effect with rising plus signs
          createHealEffect(
            effectContainerRef.current,
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2
          );

          // Green flash
          const originalTint = targetInfo.graphics.tint;
          targetInfo.graphics.tint = 0x00ff00;
          setTimeout(() => {
            if (targetInfo.graphics) targetInfo.graphics.tint = originalTint;
          }, 200);
        }
      });
    }

    // Handle buff/debuff effects
    if (entry.effects && entry.effects.length > 0) {
      const hasBuffEffect = entry.effects.some(e =>
        e.includes('Up') || e === 'Immunity' || e === 'Invincibility'
      );
      const hasDebuffEffect = entry.effects.some(e =>
        e.includes('Down') || e === 'Stun' || e === 'Freeze' || e === 'Sleep'
      );

      if (hasBuffEffect) {
        playSkillBuff();
        // Casting effect then buff effect on actor with swirling particles and up arrow
        if (actorInfo?.graphics && effectContainerRef.current) {
          const bounds = actorInfo.graphics.getBounds();
          createCastingEffect(
            effectContainerRef.current,
            bounds.x + bounds.width / 2,
            bounds.y + bounds.height / 2,
            actorInfo.monster.element,
            200
          );
          // Delay buff effect slightly for better visual sequence
          setTimeout(() => {
            if (!effectContainerRef.current) return;
            createBuffEffect(
              effectContainerRef.current,
              bounds.x + bounds.width / 2,
              bounds.y + bounds.height / 2,
              true // isBuff = true
            );
          }, 150);
        }
      }

      if (hasDebuffEffect) {
        playSkillDebuff();
        // Casting effect on actor for debuff
        if (actorInfo?.graphics && effectContainerRef.current) {
          const actorBounds = actorInfo.graphics.getBounds();
          createCastingEffect(
            effectContainerRef.current,
            actorBounds.x + actorBounds.width / 2,
            actorBounds.y + actorBounds.height / 2,
            'dark',
            200
          );
        }
        // Create debuff effect on targets
        if (entry.targets && effectContainerRef.current) {
          entry.targets.forEach((targetName, index) => {
            setTimeout(() => {
              const targetInfo = findMonsterByName(targetName);
              if (targetInfo?.graphics && effectContainerRef.current) {
                const bounds = targetInfo.graphics.getBounds();
                createBuffEffect(
                  effectContainerRef.current,
                  bounds.x + bounds.width / 2,
                  bounds.y + bounds.height / 2,
                  false // isBuff = false (debuff)
                );
              }
            }, 150 + index * 100);
          });
        }
      }
    }
  }, [
    findMonsterByName,
    findMonsterById,
    playHitAnimation,
    playDeathAnimation,
    screenShake,
    playSkillUse,
    playAttackHit,
    playAttackCrit,
    playAttackMiss,
    playSkillHeal,
    playSkillBuff,
    playSkillDebuff,
    playMonsterDeath,
  ]);

  // Update ATB display with animations
  const updateATBDisplay = useCallback(() => {
    if (!appRef.current || !battleState) return;

    // Sort all monsters by ATB
    const allMonsters = [...battleState.playerTeam, ...battleState.enemyTeam]
      .filter(m => m.isAlive)
      .sort((a, b) => b.attackBar - a.attackBar);

    // Create container if it doesn't exist
    if (!atbContainerRef.current) {
      const container = new Container();
      container.name = 'atbContainer';
      container.x = 20;
      container.y = 20;

      // Background panel
      const panel = new Graphics();
      panel.roundRect(0, 0, 170, 140, 8);
      panel.fill({ color: 0x000000, alpha: 0.6 });
      panel.roundRect(0, 0, 170, 140, 8);
      panel.stroke({ color: 0x333355, width: 1 });
      container.addChild(panel);

      const titleStyle = new TextStyle({ fontSize: 12, fill: 0xffffff, fontWeight: 'bold' });
      const title = new Text({ text: 'TURN ORDER', style: titleStyle });
      title.x = 10;
      title.y = 8;
      container.addChild(title);

      atbContainerRef.current = container;
      appRef.current.stage.addChild(container);
    }

    const container = atbContainerRef.current;

    // Remove old monster entries (keep panel and title)
    while (container.children.length > 2) {
      container.removeChildAt(2);
    }

    // Clear old ATB bar refs for dead monsters
    const aliveIds = new Set(allMonsters.map(m => m.id));
    atbBarsRef.current.forEach((_, id) => {
      if (!aliveIds.has(id)) {
        atbBarsRef.current.delete(id);
      }
    });

    allMonsters.slice(0, 5).forEach((monster, i) => {
      const y = 30 + i * 22;
      const isPlayer = monster.team === 'player';
      const baseColor = isPlayer ? 0x48dbfb : 0xff6b6b;
      const bgColor = isPlayer ? 0x1e3a5f : 0x5f1e1e;

      // Background bar
      const bg = new Graphics();
      bg.roundRect(10, y, 150, 18, 4);
      bg.fill(bgColor);
      container.addChild(bg);

      // Get or create ATB bar data
      let atbData = atbBarsRef.current.get(monster.id);
      const prevAtb = atbData?.prevAtb ?? monster.attackBar;
      const currentAtb = monster.attackBar;

      // ATB progress bar
      const bar = new Graphics();
      const targetWidth = Math.max(0, (currentAtb / 100) * 148);
      const startWidth = Math.max(0, (prevAtb / 100) * 148);

      // Draw initial bar
      if (startWidth > 0) {
        bar.roundRect(11, y + 1, startWidth, 16, 3);
        bar.fill(baseColor);
      }
      container.addChild(bar);

      // Glow effect for bars near full
      const glow = new Graphics();
      container.addChild(glow);

      // Animate bar fill if value changed
      if (Math.abs(currentAtb - prevAtb) > 0.5) {
        const animDuration = 150; // Fast animation
        const startTime = performance.now();

        const animateBar = () => {
          const elapsed = performance.now() - startTime;
          const progress = Math.min(1, elapsed / animDuration);
          const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
          const currentWidth = startWidth + (targetWidth - startWidth) * easeProgress;

          bar.clear();
          if (currentWidth > 0) {
            bar.roundRect(11, y + 1, currentWidth, 16, 3);
            bar.fill(baseColor);

            // Add shine effect during fill
            if (progress < 1) {
              const shineX = 11 + currentWidth * progress;
              bar.roundRect(shineX - 5, y + 1, 10, 16, 3);
              bar.fill({ color: 0xffffff, alpha: 0.3 * (1 - progress) });
            }
          }

          if (progress < 1) {
            requestAnimationFrame(animateBar);
          }
        };
        requestAnimationFrame(animateBar);
      } else {
        // No animation needed, just draw final bar
        bar.clear();
        if (targetWidth > 0) {
          bar.roundRect(11, y + 1, targetWidth, 16, 3);
          bar.fill(baseColor);
        }
      }

      // Glow effect when ATB >= 90%
      if (currentAtb >= 90) {
        const glowIntensity = (currentAtb - 90) / 10; // 0 to 1
        glow.roundRect(10, y, 150, 18, 4);
        glow.stroke({ color: 0xffffff, width: 2, alpha: 0.3 + glowIntensity * 0.4 });

        // Pulsing glow animation
        const pulseGlow = () => {
          if (!glow.parent) return;
          const pulse = 0.3 + Math.sin(performance.now() / 200) * 0.2;
          glow.clear();
          glow.roundRect(10, y, 150, 18, 4);
          glow.stroke({ color: 0xffffff, width: 2, alpha: pulse * (0.5 + glowIntensity * 0.5) });
          requestAnimationFrame(pulseGlow);
        };
        pulseGlow();
      }

      // Ready flash effect at 100%
      if (currentAtb >= 100 && prevAtb < 100) {
        // Flash effect
        const flash = new Graphics();
        flash.roundRect(10, y, 150, 18, 4);
        flash.fill({ color: 0xffffff, alpha: 0.8 });
        container.addChild(flash);

        // Fade out flash
        const startTime = performance.now();
        const fadeFlash = () => {
          const elapsed = performance.now() - startTime;
          const alpha = 0.8 * (1 - elapsed / 300);
          if (alpha <= 0 || !flash.parent) {
            if (flash.parent) container.removeChild(flash);
            return;
          }
          flash.clear();
          flash.roundRect(10, y, 150, 18, 4);
          flash.fill({ color: 0xffffff, alpha });
          requestAnimationFrame(fadeFlash);
        };
        fadeFlash();
      }

      // Update stored ATB value
      atbBarsRef.current.set(monster.id, { bar, glow, prevAtb: currentAtb });

      // Monster name
      const nameStyle = new TextStyle({ fontSize: 10, fill: 0xffffff });
      const name = new Text({ text: monster.name.substring(0, 10), style: nameStyle });
      name.x = 15;
      name.y = y + 3;
      container.addChild(name);

      // ATB percentage with color based on fullness
      const percentColor = currentAtb >= 100 ? 0xfeca57 : currentAtb >= 90 ? 0x48dbfb : 0xffffff;
      const percentStyle = new TextStyle({ fontSize: 9, fill: percentColor, fontWeight: currentAtb >= 100 ? 'bold' : 'normal' });
      const percent = new Text({ text: `${Math.floor(currentAtb)}%`, style: percentStyle });
      percent.x = 140;
      percent.y = y + 3;
      container.addChild(percent);
    });
  }, [battleState]);

  // Update turn indicator
  const updateTurnIndicator = useCallback(() => {
    if (!appRef.current || !battleState?.activeMonster) return;

    // Remove old indicator
    const oldIndicator = appRef.current.stage.getChildByName('turnIndicator');
    if (oldIndicator) appRef.current.stage.removeChild(oldIndicator);

    const activeMonster = [...battleState.playerTeam, ...battleState.enemyTeam]
      .find(m => m.id === battleState.activeMonster);

    if (!activeMonster) return;

    const container = new Container();
    container.name = 'turnIndicator';

    // Background
    const bg = new Graphics();
    bg.roundRect(width / 2 - 100, 8, 200, 30, 8);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    bg.roundRect(width / 2 - 100, 8, 200, 30, 8);
    bg.stroke({ color: activeMonster.team === 'player' ? 0x48dbfb : 0xff6b6b, width: 2 });
    container.addChild(bg);

    const style = new TextStyle({
      fontSize: 14,
      fill: activeMonster.team === 'player' ? 0x48dbfb : 0xff6b6b,
      fontWeight: 'bold',
    });

    const text = new Text({
      text: `${activeMonster.name}'s Turn`,
      style,
    });
    text.x = width / 2 - text.width / 2;
    text.y = 14;
    container.addChild(text);

    appRef.current.stage.addChild(container);
  }, [battleState, width]);

  // Handle skill selection
  const handleSkillClick = (skillId: string) => {
    if (battleState?.phase !== 'action_selection') return;
    playClick();
    setSelectedSkill(skillId);
  };

  // Handle target selection
  const handleTargetClick = (targetId: string) => {
    if (!selectedSkill || battleState?.phase !== 'action_selection') return;
    playClick();

    const activeMonster = battleState?.activeMonster;
    if (!activeMonster) return;

    const action: BattleAction = {
      actorId: activeMonster,
      skillId: selectedSkill,
      targetIds: [targetId],
      timestamp: Date.now(),
    };

    submitAction(action);
    setSelectedSkill(null);
  };

  // Update target highlight based on hovered target
  useEffect(() => {
    // Hide all target highlights first
    monsterTargetHighlightRef.current.forEach((highlight) => {
      highlight.visible = false;
    });

    // Show highlight for hovered target with pulsing animation
    if (hoveredTarget) {
      const highlight = monsterTargetHighlightRef.current.get(hoveredTarget);
      if (highlight) {
        highlight.visible = true;
        highlight.alpha = 1;

        // Pulsing animation
        const startTime = performance.now();
        const animateHighlight = () => {
          if (!hoveredTarget || !highlight.visible) return;

          const elapsed = performance.now() - startTime;
          const pulse = Math.sin(elapsed / 150) * 0.3 + 0.7;
          const scale = Math.sin(elapsed / 200) * 0.05 + 1;

          highlight.alpha = pulse;
          highlight.scale.set(scale);

          requestAnimationFrame(animateHighlight);
        };
        requestAnimationFrame(animateHighlight);
      }
    }
  }, [hoveredTarget]);

  // Get current monster's skills
  const getCurrentSkills = () => {
    if (!battleState?.activeMonster) return [];
    const monster = battleState.playerTeam.find(m => m.id === battleState.activeMonster);
    return monster?.skills || [];
  };

  // Get selected skill's target type
  const getSelectedSkillTargetType = () => {
    if (!selectedSkill) return null;
    const skills = getCurrentSkills();
    const skill = skills.find(s => s.skillId === selectedSkill);
    return skill?.template.targetType || null;
  };

  // Get valid targets based on skill type
  const getValidTargets = () => {
    const targetType = getSelectedSkillTargetType();
    if (!targetType || !battleState) return [];

    switch (targetType) {
      case 'singleEnemy':
        return battleState.enemyTeam.filter(m => m.isAlive);
      case 'singleAlly':
        return battleState.playerTeam.filter(m => m.isAlive);
      case 'allEnemies':
        return battleState.enemyTeam.filter(m => m.isAlive);
      case 'allAllies':
        return battleState.playerTeam.filter(m => m.isAlive);
      case 'self':
        const activeMonster = battleState.playerTeam.find(m => m.id === battleState.activeMonster);
        return activeMonster ? [activeMonster] : [];
      default:
        return battleState.enemyTeam.filter(m => m.isAlive);
    }
  };

  // Check if skill targets allies
  const isAllyTargetSkill = () => {
    const targetType = getSelectedSkillTargetType();
    return targetType === 'singleAlly' || targetType === 'allAllies' || targetType === 'self';
  };

  // Check if skill is AoE (auto-targets all)
  const isAoESkill = () => {
    const targetType = getSelectedSkillTargetType();
    return targetType === 'allEnemies' || targetType === 'allAllies';
  };

  const isPlayerTurn = battleState?.activeMonster &&
    battleState.playerTeam.some(m => m.id === battleState.activeMonster);

  return (
    <div className="battle-stage-wrapper">
      <div className="battle-canvas" ref={containerRef} />

      {/* Battle UI Overlay */}
      <div className="battle-ui-overlay">
        {/* Turn info */}
        <div className="turn-info">
          <span className="turn-number">Turn {battleState?.turn || 0}</span>
          <span className="phase-indicator">{formatPhase(battleState?.phase)}</span>
        </div>

        {/* Battle controls */}
        <div className="battle-controls">
          <button
            className={`auto-button ${battleState?.isAutoMode ? 'active' : ''}`}
            onClick={() => { playClick(); toggleAutoMode(); }}
          >
            {battleState?.isAutoMode ? 'AUTO' : 'MANUAL'}
          </button>
          <div className="speed-controls">
            {[1, 2, 3].map((speed) => (
              <button
                key={speed}
                className={`speed-button ${battleSpeed === speed ? 'active' : ''}`}
                onClick={() => { playClick(); setBattleSpeed(speed); }}
              >
                x{speed}
              </button>
            ))}
          </div>
        </div>

        {/* Skill buttons (only show for player turn) */}
        {isPlayerTurn && battleState?.phase === 'action_selection' && (
          <div className="skill-panel">
            <h4>Select Skill</h4>
            <div className="skill-buttons">
              {getCurrentSkills().map((skill, index) => (
                <button
                  key={skill.skillId}
                  className={`skill-button ${selectedSkill === skill.skillId ? 'selected' : ''} ${!skill.isReady ? 'disabled' : ''}`}
                  onClick={() => handleSkillClick(skill.skillId)}
                  disabled={!skill.isReady}
                >
                  <span className="skill-number">{index + 1}</span>
                  <span className="skill-name">{skill.name}</span>
                  {skill.currentCooldown > 0 && (
                    <>
                      <div className="skill-cooldown-overlay">
                        <span className="cooldown-turns">{skill.currentCooldown}</span>
                        <span className="cooldown-label">turns</span>
                      </div>
                      <div
                        className="skill-cooldown-progress"
                        style={{
                          '--cooldown-progress': `${(skill.currentCooldown / skill.maxCooldown) * 100}%`
                        } as React.CSSProperties}
                      />
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Target selection */}
        {selectedSkill && isPlayerTurn && (
          <div className={`target-panel ${isAllyTargetSkill() ? 'ally-target' : ''}`}>
            <h4>
              {isAoESkill()
                ? `Target All ${isAllyTargetSkill() ? 'Allies' : 'Enemies'}`
                : `Select ${isAllyTargetSkill() ? 'Ally' : 'Target'}`}
            </h4>
            <div className="target-buttons">
              {isAoESkill() ? (
                // AoE skills - single button to confirm all targets
                <button
                  className={`target-button aoe-confirm ${isAllyTargetSkill() ? 'ally' : ''}`}
                  onClick={() => {
                    const targets = getValidTargets();
                    if (targets.length > 0) {
                      handleTargetClick(targets[0].id);
                    }
                  }}
                  onMouseEnter={() => {
                    // Highlight all targets for AoE
                    getValidTargets().forEach(m => {
                      const highlight = monsterTargetHighlightRef.current.get(m.id);
                      if (highlight) highlight.visible = true;
                    });
                  }}
                  onMouseLeave={() => {
                    // Hide all highlights
                    monsterTargetHighlightRef.current.forEach(h => h.visible = false);
                  }}
                >
                  <span className="target-name">
                    {isAllyTargetSkill() ? 'All Allies' : 'All Enemies'}
                  </span>
                  <span className="target-hp">
                    {getValidTargets().length} targets
                  </span>
                </button>
              ) : (
                // Single target skills
                getValidTargets().map((monster) => (
                  <button
                    key={monster.id}
                    className={`target-button ${isAllyTargetSkill() ? 'ally' : ''}`}
                    onClick={() => handleTargetClick(monster.id)}
                    onMouseEnter={() => setHoveredTarget(monster.id)}
                    onMouseLeave={() => setHoveredTarget(null)}
                  >
                    <span className="target-name">{monster.name}</span>
                    <span className="target-hp">
                      {Math.round(monster.currentHp / monster.maxHp * 100)}% HP
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Victory/Defeat overlay */}
        {battleState?.winner && (
          <div className={`battle-result ${battleState.winner}`}>
            {/* Victory effects */}
            {battleState.winner === 'player' && (
              <>
                {/* Rotating light rays */}
                <div className="victory-rays" />

                {/* Confetti particles */}
                <div className="confetti-container">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${-20 - Math.random() * 30}%`,
                        backgroundColor: ['#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1', '#ff9ff3', '#fff'][Math.floor(Math.random() * 6)],
                        animationDuration: `${2 + Math.random() * 2}s`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                        transform: `rotate(${Math.random() * 360}deg)`,
                      }}
                    />
                  ))}
                </div>

                {/* Twinkling stars */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="victory-star"
                    style={{
                      left: `${10 + Math.random() * 80}%`,
                      top: `${10 + Math.random() * 80}%`,
                      animationDelay: `${Math.random() * 1}s`,
                      color: Math.random() > 0.5 ? '#feca57' : '#fff',
                    }}
                  >
                    ✦
                  </span>
                ))}
              </>
            )}

            {/* Defeat effects */}
            {battleState.winner === 'enemy' && (
              <div className="defeat-cracks" />
            )}

            <div className="result-content">
              {/* Victory/Defeat icon */}
              {battleState.winner === 'player' ? (
                <span className="victory-icon">🏆</span>
              ) : (
                <span className="defeat-icon">💀</span>
              )}

              <h2>{battleState.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}</h2>
              <p>{battleState.winner === 'player' ? 'You won the battle!' : 'Better luck next time...'}</p>

              {/* Rewards display (only on victory) */}
              {battleState.winner === 'player' && useBattleStore.getState().battleResult && (
                <div className="rewards-container">
                  <h3>Rewards</h3>
                  <div className="rewards-list">
                    {useBattleStore.getState().battleResult?.rewards.map((reward, i) => (
                      <div key={i} className={`reward-item ${reward.type}`}>
                        <span className="reward-icon">{getRewardIcon(reward.type)}</span>
                        <span className="reward-amount">+{reward.amount}</span>
                      </div>
                    ))}
                  </div>
                  {useBattleStore.getState().battleResult?.experience &&
                   useBattleStore.getState().battleResult!.experience.length > 0 && (
                    <div className="exp-earned">
                      <span className="exp-icon">⭐</span>
                      <span>+{useBattleStore.getState().battleResult!.experience[0].exp} EXP</span>
                    </div>
                  )}
                </div>
              )}

              {/* View Statistics Button */}
              <button
                className="view-stats-btn"
                onClick={() => setShowBattleSummary(true)}
              >
                View Battle Statistics
              </button>
            </div>
          </div>
        )}

        {/* Battle Summary Modal */}
        {showBattleSummary && battleState && (
          <BattleSummary
            battleState={battleState}
            onClose={() => setShowBattleSummary(false)}
          />
        )}

        {/* Dungeon Reward Screen */}
        {showDungeonRewards && dungeonResult && (
          <DungeonRewardScreen
            result={dungeonResult}
            onClose={handleDungeonRewardClose}
            onRepeat={dungeonResult.success ? handleDungeonRepeat : undefined}
          />
        )}
      </div>
    </div>
  );
};

// Helper function to format phase names
function formatPhase(phase?: string): string {
  if (!phase) return '';
  const phases: Record<string, string> = {
    initialization: 'Starting...',
    tick: 'Processing',
    turn_start: 'Turn Start',
    action_selection: 'Select Action',
    action_execution: 'Attacking',
    effect_resolution: 'Effects',
    turn_end: 'Turn End',
    victory_check: 'Checking',
    battle_end: 'Battle Over',
  };
  return phases[phase] || phase;
}

// Helper function to get reward icons
function getRewardIcon(type: string): string {
  const icons: Record<string, string> = {
    gold: '🪙',
    crystal: '💎',
    energy: '⚡',
    rune: '🔮',
    monster: '🐉',
  };
  return icons[type] || '🎁';
}

export default BattleStage;
