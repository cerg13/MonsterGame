import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { BattleMonster } from '../../types/battle';
import {
  shakeAnimation,
  flashAnimation,
  bounceAnimation,
  deathAnimation,
  attackAnimation,
  createDamageNumber,
  createSkillEffect,
} from '../../utils/animations';

/**
 * Element colors for visual styling - enhanced with gradients
 */
const ELEMENT_COLORS: Record<string, { primary: number; secondary: number; glow: number }> = {
  fire: { primary: 0xff4500, secondary: 0xffd700, glow: 0xff6b35 },
  water: { primary: 0x00bfff, secondary: 0x0066cc, glow: 0x48dbfb },
  wind: { primary: 0x32cd32, secondary: 0x98fb98, glow: 0x1dd1a1 },
  light: { primary: 0xffd700, secondary: 0xfffacd, glow: 0xfeca57 },
  dark: { primary: 0x8b00ff, secondary: 0x4a0080, glow: 0xa55eea },
};

/**
 * Rarity border colors
 */
const RARITY_COLORS: Record<string, number> = {
  common: 0x808080,
  rare: 0x4169e1,
  sr: 0x9932cc,
  ssr: 0xffd700,
};

/**
 * MonsterSprite class for animated battle monsters
 */
export class MonsterSprite extends Container {
  private monster: BattleMonster;
  private body: Graphics;
  private _innerGlow: Graphics;
  private hpBar: Graphics;
  private hpBarBg: Graphics;
  private atbBar: Graphics;
  private atbBarBg: Graphics;
  private atbGlow: Graphics;
  private animatedAtbWidth: number = 0;
  private targetAtbWidth: number = 0;
  private atbAnimationId: number | null = null;
  private nameText: Text;
  private hpText: Text;
  private buffContainer: Container;
  private effectContainer: Container;
  private _rarityFrame: Graphics;
  private _elementIndicator: Graphics;
  private isAnimating: boolean = false;
  private team: 'player' | 'enemy';

  // Idle animation properties
  private idleAnimationId: number | null = null;
  private idleStartTime: number = 0;
  private idlePhase: number = Math.random() * Math.PI * 2; // Random start phase
  private baseY: number = 0;
  private elementParticles: Container;
  private eyeState: { lastBlink: number; isBlinking: boolean; blinkPhase: number } = {
    lastBlink: 0,
    isBlinking: false,
    blinkPhase: 0,
  };

  constructor(monster: BattleMonster, team: 'player' | 'enemy') {
    super();
    this.monster = monster;
    this.team = team;

    // Create containers
    this.buffContainer = new Container();
    this.effectContainer = new Container();
    this.elementParticles = new Container();

    // Create visual elements - use same pattern as working test rectangles
    const colors = ELEMENT_COLORS[monster.element] || ELEMENT_COLORS.fire;

    // Create body graphics - simple filled shapes
    this.body = new Graphics();

    // Body circle (main monster body)
    this.body.circle(35, 35, 30);
    this.body.fill(colors.primary);

    // Eyes - white
    this.body.circle(25, 30, 6);
    this.body.fill(0xffffff);
    this.body.circle(45, 30, 6);
    this.body.fill(0xffffff);

    // Pupils - black
    this.body.circle(27, 32, 3);
    this.body.fill(0x000000);
    this.body.circle(47, 32, 3);
    this.body.fill(0x000000);

    this.addChild(this.body);

    // HP bar background
    this.hpBarBg = new Graphics();
    this.hpBarBg.rect(0, 72, 70, 10);
    this.hpBarBg.fill(0x333333);
    this.addChild(this.hpBarBg);

    // HP bar fill
    const hpPercent = monster.currentHp / monster.maxHp;
    const hpColor = hpPercent > 0.5 ? 0x00ff00 : hpPercent > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar = new Graphics();
    this.hpBar.rect(1, 73, 68 * hpPercent, 8);
    this.hpBar.fill(hpColor);
    this.addChild(this.hpBar);

    // ATB bar background (below HP bar)
    this.atbBarBg = new Graphics();
    this.atbBarBg.roundRect(0, 83, 70, 5, 2);
    this.atbBarBg.fill(0x1a1a2e);
    this.addChild(this.atbBarBg);

    // ATB bar
    this.atbBar = new Graphics();
    this.addChild(this.atbBar);

    // ATB glow effect
    this.atbGlow = new Graphics();
    this.addChild(this.atbGlow);

    // Store references (create dummy graphics for other refs)
    this._innerGlow = new Graphics();
    this._rarityFrame = new Graphics();
    this._elementIndicator = new Graphics();
    this.nameText = this.createNameText();
    this.hpText = this.createHPText();

    // Initialize animated ATB width
    this.animatedAtbWidth = (monster.attackBar / 100) * 70;
    this.targetAtbWidth = this.animatedAtbWidth;

    // Initial ATB bar render
    this.renderAtbBar();

    this.addChild(this.nameText);
    this.addChild(this.hpText);
    this.addChild(this.buffContainer);
    this.addChild(this.effectContainer);
    this.addChild(this.elementParticles);

    // Initial state
    if (!monster.isAlive) {
      this.alpha = 0.3;
    }

    // Start idle animations
    this.startIdleAnimation();

    console.log('[MonsterSprite] Created sprite for', monster.name, 'children:', this.children.length);
  }

  private _createInnerGlow(): Graphics {
    const glow = new Graphics();
    const colors = ELEMENT_COLORS[this.monster.element] || ELEMENT_COLORS.fire;

    // Outer glow - using chained API
    glow.circle(35, 35, 42).fill({ color: colors.glow, alpha: 0.15 });

    return glow;
  }

  private _createRarityFrame(): Graphics {
    const frame = new Graphics();
    const rarity = (this.monster as { rarity?: string }).rarity || 'common';
    const color = RARITY_COLORS[rarity.toLowerCase()] || RARITY_COLORS.common;

    // Hexagonal frame for higher rarities
    if (rarity === 'ssr' || rarity === 'sr') {
      const cx = 35, cy = 35, r = 38;
      const points: number[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        points.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      }
      frame.poly(points).stroke({ color, width: rarity === 'ssr' ? 4 : 3, alpha: 0.9 });

      // Corner gems for SSR
      if (rarity === 'ssr') {
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 2;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          frame.circle(x, y, 3).fill(0xffd700);
        }
      }
    } else {
      // Circle frame for common/rare
      frame.circle(35, 35, 36).stroke({ color, width: 2.5, alpha: 0.8 });
    }

    return frame;
  }

  private _createBody(): Graphics {
    const body = new Graphics();
    const colors = ELEMENT_COLORS[this.monster.element] || ELEMENT_COLORS.fire;

    // Main body circle - using PixiJS 8 API correctly
    body.circle(35, 35, 32).fill(colors.primary);

    // Secondary layer
    body.circle(35, 32, 28).fill({ color: colors.secondary, alpha: 0.3 });

    // Highlight
    body.ellipse(28, 25, 12, 8).fill({ color: 0xffffff, alpha: 0.25 });

    // Element pattern in center
    this.drawElementPattern(body, colors);

    // Eyes with more detail
    this.drawEyes(body);

    return body;
  }

  private drawElementPattern(body: Graphics, colors: { primary: number; secondary: number; glow: number }): void {
    const element = this.monster.element;

    switch (element) {
      case 'fire':
        // Flame pattern - simple triangle
        body.circle(35, 42, 8).fill({ color: colors.secondary, alpha: 0.5 });
        break;
      case 'water':
        // Water drop - simple ellipse
        body.ellipse(35, 40, 8, 12).fill({ color: colors.secondary, alpha: 0.5 });
        break;
      case 'wind':
        // Swirl pattern - simple arcs
        body.circle(35, 38, 10).stroke({ color: colors.secondary, width: 2, alpha: 0.5 });
        break;
      case 'light':
        // Star - simple circle
        body.circle(35, 38, 8).fill({ color: colors.secondary, alpha: 0.5 });
        break;
      case 'dark':
        // Crescent - simple ellipse
        body.ellipse(35, 38, 10, 8).fill({ color: colors.secondary, alpha: 0.4 });
        break;
    }
  }

  private drawEyes(body: Graphics): void {
    // Eye whites
    body.ellipse(27, 30, 6, 7).fill(0xffffff);
    body.ellipse(43, 30, 6, 7).fill(0xffffff);

    // Irises
    const colors = ELEMENT_COLORS[this.monster.element] || ELEMENT_COLORS.fire;
    body.circle(28, 31, 4).fill(colors.glow);
    body.circle(44, 31, 4).fill(colors.glow);

    // Pupils
    body.circle(29, 32, 2).fill(0x000000);
    body.circle(45, 32, 2).fill(0x000000);

    // Eye shine
    body.circle(26, 29, 1.5).fill(0xffffff);
    body.circle(42, 29, 1.5).fill(0xffffff);
  }

  private _createElementIndicator(): Graphics {
    const indicator = new Graphics();
    const colors = ELEMENT_COLORS[this.monster.element] || ELEMENT_COLORS.fire;

    // Element badge in top-right
    indicator.circle(58, 12, 10).fill(colors.primary);
    indicator.circle(58, 12, 10).stroke({ color: 0xffffff, width: 2 });

    return indicator;
  }

  private _createHPBarBackground(): Graphics {
    const bg = new Graphics();
    bg.roundRect(0, 72, 70, 12, 4).fill(0x222222);
    bg.roundRect(0, 72, 70, 12, 4).stroke({ color: 0x444444, width: 1 });
    return bg;
  }

  private _createHPBar(): Graphics {
    const bar = new Graphics();
    this.updateHPBar(bar);
    return bar;
  }

  private updateHPBar(bar: Graphics): void {
    bar.clear();
    const percent = this.monster.currentHp / this.monster.maxHp;
    const barWidth = 68 * percent;

    // Color based on HP percentage
    let color = 0x1dd1a1; // Green
    if (percent <= 0.25) {
      color = 0xff6b6b; // Red
    } else if (percent <= 0.5) {
      color = 0xfeca57; // Yellow
    }

    if (barWidth > 0) {
      // Main bar
      bar.roundRect(1, 73, barWidth, 10, 3).fill(color);
      // Highlight
      bar.roundRect(1, 73, barWidth, 5, 3).fill({ color: 0xffffff, alpha: 0.2 });
    }
  }

  private _createATBBarBackground(): Graphics {
    const bg = new Graphics();
    bg.roundRect(0, 66, 70, 5, 2).fill(0x1a1a2e);
    return bg;
  }

  private _createATBBar(): Graphics {
    const bar = new Graphics();
    this.updateATBBar(bar);
    return bar;
  }

  private updateATBBar(_bar: Graphics): void {
    const newTargetWidth = (this.monster.attackBar / 100) * 70;

    // If target changed, start animation
    if (Math.abs(newTargetWidth - this.targetAtbWidth) > 0.1) {
      this.targetAtbWidth = newTargetWidth;
      this.startAtbAnimation();
    }

    this.renderAtbBar();
  }

  private startAtbAnimation(): void {
    // Cancel any existing animation
    if (this.atbAnimationId !== null) {
      cancelAnimationFrame(this.atbAnimationId);
    }

    const animate = () => {
      // Smooth interpolation
      const diff = this.targetAtbWidth - this.animatedAtbWidth;
      if (Math.abs(diff) < 0.5) {
        this.animatedAtbWidth = this.targetAtbWidth;
        this.renderAtbBar();
        this.atbAnimationId = null;
        return;
      }

      // Ease towards target (faster when difference is larger)
      this.animatedAtbWidth += diff * 0.15;
      this.renderAtbBar();
      this.atbAnimationId = requestAnimationFrame(animate);
    };

    this.atbAnimationId = requestAnimationFrame(animate);
  }

  private renderAtbBar(): void {
    const bar = this.atbBar;
    bar.clear();

    // ATB bar color based on team
    const baseColor = this.team === 'player' ? 0x48dbfb : 0xff6b6b;
    const barWidth = Math.max(0, this.animatedAtbWidth);
    const barY = 83; // Below HP bar

    if (barWidth > 0) {
      bar.roundRect(0, barY, barWidth, 5, 2).fill(baseColor);

      // Gradient shine effect on the bar (moving highlight)
      const shineWidth = Math.min(15, barWidth);
      const shineOffset = (performance.now() / 20) % barWidth;
      bar.roundRect(Math.max(0, shineOffset - 5), barY, Math.min(shineWidth, barWidth - shineOffset + 5), 2, 1);
      bar.fill({ color: 0xffffff, alpha: 0.25 });
    }

    // Update glow effect
    this.atbGlow.clear();
    if (this.monster.attackBar >= 90) {
      const glowIntensity = (this.monster.attackBar - 90) / 10;
      const pulseAlpha = 0.3 + Math.sin(performance.now() / 150) * 0.2;

      this.atbGlow.roundRect(-1, barY - 1, barWidth + 2, 7, 3);
      this.atbGlow.stroke({
        color: 0xffffff,
        width: 2,
        alpha: pulseAlpha * (0.5 + glowIntensity * 0.5)
      });

      // Extra bright glow at 100%
      if (this.monster.attackBar >= 100) {
        this.atbGlow.roundRect(-2, barY - 2, barWidth + 4, 9, 4);
        this.atbGlow.stroke({
          color: this.team === 'player' ? 0x48dbfb : 0xff6b6b,
          width: 3,
          alpha: pulseAlpha * 0.6
        });
      }
    }
  }

  private createNameText(): Text {
    const style = new TextStyle({
      fontSize: 11,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: {
        color: 0x000000,
        distance: 1,
        blur: 2,
        alpha: 0.8,
      },
    });
    const text = new Text({ text: this.monster.name.substring(0, 12), style });
    text.x = 35 - text.width / 2;
    text.y = 91; // Adjusted for ATB bar
    return text;
  }

  private createHPText(): Text {
    const style = new TextStyle({
      fontSize: 8,
      fill: 0xcccccc,
    });
    const text = new Text({
      text: `${this.monster.currentHp}/${this.monster.maxHp}`,
      style,
    });
    text.x = 35 - text.width / 2;
    text.y = 103; // Adjusted for ATB bar
    return text;
  }

  /**
   * Update monster state
   */
  public updateMonster(monster: BattleMonster): void {
    const previousHp = this.monster.currentHp;
    const previousAtb = this.monster.attackBar;
    this.monster = monster;

    // Update HP bar with animation if HP changed
    if (previousHp !== monster.currentHp) {
      this.updateHPBar(this.hpBar);
      this.updateHPText();
    }

    // Update ATB bar
    if (previousAtb !== monster.attackBar) {
      this.updateATBBar(this.atbBar);
    }

    // Update alive state
    if (!monster.isAlive && this.alpha > 0.3) {
      this.playDeathAnimation();
    }

    // Update buffs display
    this.updateBuffs();
  }

  private updateHPText(): void {
    this.hpText.text = `${this.monster.currentHp}/${this.monster.maxHp}`;
    this.hpText.x = 35 - this.hpText.width / 2;
  }

  private updateBuffs(): void {
    this.buffContainer.removeChildren();

    const buffs = this.monster.buffs;
    const debuffs = this.monster.debuffs;

    let xOffset = 0;

    // Draw buff icons - simplified to circles
    buffs.forEach((_buff) => {
      const icon = new Graphics();
      // Simple up triangle for buffs
      icon.circle(8, 8, 6).fill(0x1dd1a1);
      icon.circle(8, 8, 6).stroke({ color: 0xffffff, width: 1 });
      icon.x = xOffset;
      icon.y = -20;
      this.buffContainer.addChild(icon);
      xOffset += 18;
    });

    // Draw debuff icons
    debuffs.forEach((_debuff) => {
      const icon = new Graphics();
      // Simple circle for debuffs
      icon.circle(8, 8, 6).fill(0xff6b6b);
      icon.circle(8, 8, 6).stroke({ color: 0xffffff, width: 1 });
      icon.x = xOffset;
      icon.y = -20;
      this.buffContainer.addChild(icon);
      xOffset += 18;
    });
  }

  /**
   * Set active turn indicator
   */
  public setActive(active: boolean): void {
    if (active) {
      // Add animated glowing border
      const glow = new Graphics();
      const colors = ELEMENT_COLORS[this.monster.element] || ELEMENT_COLORS.fire;

      // Double glow effect
      glow.circle(35, 35, 44).stroke({ color: colors.glow, width: 4, alpha: 0.6 });
      glow.circle(35, 35, 48).stroke({ color: 0xffffff, width: 2, alpha: 0.3 });
      glow.label = 'activeGlow';
      this.addChildAt(glow, 0);

      // Pulse animation
      bounceAnimation(this, 1.08, 400);
    } else {
      // Remove glow
      const glow = this.getChildByLabel('activeGlow');
      if (glow) {
        this.removeChild(glow);
      }
    }
  }

  /**
   * Play attack animation
   */
  public async playAttackAnimation(): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const direction = this.team === 'player' ? 'right' : 'left';
    await attackAnimation(this, direction, 50, 250);

    this.isAnimating = false;
  }

  /**
   * Play hit animation
   */
  public async playHitAnimation(damage: number, isCrit: boolean = false): Promise<void> {
    // Show damage number
    createDamageNumber(this.effectContainer, damage, 35, 0, {
      isCrit,
      element: this.monster.element,
    });

    // Flash and shake
    await Promise.all([
      flashAnimation(this.body, 0xff0000, 150),
      shakeAnimation(this, 10, 200),
    ]);
  }

  /**
   * Play heal animation
   */
  public playHealAnimation(amount: number): void {
    createDamageNumber(this.effectContainer, amount, 35, 0, { isHeal: true });
    createSkillEffect(this.effectContainer, 35, 35, 'light', 'heal');
    bounceAnimation(this, 1.12, 300);
  }

  /**
   * Play skill effect
   */
  public playSkillEffect(skillType: 'attack' | 'buff' | 'debuff' | 'heal' = 'attack'): void {
    createSkillEffect(this.effectContainer, 35, 35, this.monster.element, skillType);
  }

  /**
   * Play death animation
   */
  public async playDeathAnimation(): Promise<void> {
    if (this.isAnimating) return;
    this.isAnimating = true;

    await deathAnimation(this, 600);
    this.alpha = 0.3;
    this.visible = true;
    this.scale.set(1);

    this.isAnimating = false;
  }

  /**
   * Get monster data
   */
  public getMonster(): BattleMonster {
    return this.monster;
  }

  // ============================================
  // IDLE ANIMATIONS
  // ============================================

  /**
   * Start idle animation loop
   */
  public startIdleAnimation(): void {
    if (this.idleAnimationId !== null) return;

    this.idleStartTime = performance.now();
    this.baseY = this.body.y;

    const animate = () => {
      if (!this.monster.isAlive) {
        this.stopIdleAnimation();
        return;
      }

      const elapsed = performance.now() - this.idleStartTime;

      // Apply all idle effects
      this.applyFloatingEffect(elapsed);
      this.applyBreathingEffect(elapsed);
      this.applyBlinkEffect(elapsed);
      this.updateElementParticles(elapsed);

      this.idleAnimationId = requestAnimationFrame(animate);
    };

    this.idleAnimationId = requestAnimationFrame(animate);
  }

  /**
   * Stop idle animation loop
   */
  public stopIdleAnimation(): void {
    if (this.idleAnimationId !== null) {
      cancelAnimationFrame(this.idleAnimationId);
      this.idleAnimationId = null;
    }
    // Clear element particles
    this.elementParticles.removeChildren();
  }

  /**
   * Floating/bobbing effect - gentle up/down motion
   */
  private applyFloatingEffect(elapsed: number): void {
    // Parameters based on rarity
    const rarity = (this.monster as { rarity?: string }).rarity || 'common';
    const config = {
      common: { amplitude: 2, frequency: 0.002 },
      rare: { amplitude: 2.5, frequency: 0.0022 },
      sr: { amplitude: 3, frequency: 0.0025 },
      ssr: { amplitude: 3.5, frequency: 0.003 },
    };
    const { amplitude, frequency } = config[rarity as keyof typeof config] || config.common;

    // Sine wave motion
    const offset = Math.sin(elapsed * frequency + this.idlePhase) * amplitude;
    this.body.y = this.baseY + offset;
  }

  /**
   * Breathing effect - subtle scale pulse
   */
  private applyBreathingEffect(elapsed: number): void {
    const breathSpeed = 0.0015;
    const breathAmount = 0.02; // 2% scale change

    const breath = Math.sin(elapsed * breathSpeed + this.idlePhase) * breathAmount;
    this.body.scale.set(1 + breath, 1 + breath * 0.5);
  }

  /**
   * Eye blink effect
   */
  private applyBlinkEffect(_elapsed: number): void {
    const now = performance.now();
    const timeSinceLastBlink = now - this.eyeState.lastBlink;

    // Trigger blink every 3-7 seconds randomly
    if (!this.eyeState.isBlinking && timeSinceLastBlink > 3000 + Math.random() * 4000) {
      this.eyeState.isBlinking = true;
      this.eyeState.blinkPhase = 0;
      this.eyeState.lastBlink = now;
    }

    // Blink animation (150ms total)
    if (this.eyeState.isBlinking) {
      this.eyeState.blinkPhase += 16; // ~60fps

      // Redraw body with blink state
      if (this.eyeState.blinkPhase < 150) {
        const blinkProgress = this.eyeState.blinkPhase / 75; // 0 to 2
        const eyeScale = blinkProgress < 1
          ? 1 - blinkProgress // closing
          : blinkProgress - 1; // opening

        this.body.scale.y = this.body.scale.x * (0.95 + eyeScale * 0.05);
      } else {
        this.eyeState.isBlinking = false;
        // 20% chance of double blink
        if (Math.random() < 0.2) {
          this.eyeState.lastBlink = now - 2800; // Trigger another blink soon
        }
      }
    }
  }

  /**
   * Element-specific particle effects
   */
  private updateElementParticles(elapsed: number): void {
    const element = this.monster.element;
    const colors = ELEMENT_COLORS[element] || ELEMENT_COLORS.fire;

    // Spawn new particles occasionally
    if (this.elementParticles.children.length < 6 && Math.random() < 0.03) {
      this.spawnElementParticle(element, colors);
    }

    // Update existing particles
    const toRemove: Container[] = [];
    this.elementParticles.children.forEach((child) => {
      const particle = child as Graphics & {
        life: number;
        vx: number;
        vy: number;
        element: string;
        rotSpeed?: number;
      };

      particle.life += 0.016; // ~60fps

      if (particle.life >= 1) {
        toRemove.push(particle);
      } else {
        this.animateElementParticle(particle, elapsed);
      }
    });

    // Remove dead particles
    toRemove.forEach(p => this.elementParticles.removeChild(p));
  }

  /**
   * Spawn element-specific particle
   */
  private spawnElementParticle(
    element: string,
    colors: { primary: number; secondary: number; glow: number }
  ): void {
    const particle = new Graphics() as Graphics & {
      life: number;
      vx: number;
      vy: number;
      element: string;
      rotSpeed?: number;
    };

    particle.life = 0;
    particle.element = element;

    switch (element) {
      case 'fire':
        // Ember particle
        particle.circle(0, 0, 2 + Math.random() * 2);
        particle.fill(Math.random() > 0.5 ? colors.primary : colors.secondary);
        particle.x = 35 + (Math.random() - 0.5) * 30;
        particle.y = 50;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = -1 - Math.random() * 0.5;
        break;

      case 'water':
        // Water droplet/bubble
        const size = 2 + Math.random() * 2;
        particle.circle(0, 0, size);
        particle.fill({ color: colors.primary, alpha: 0.6 });
        particle.circle(0, 0, size * 0.5);
        particle.fill({ color: 0xffffff, alpha: 0.3 });
        particle.x = 35 + (Math.random() - 0.5) * 40;
        particle.y = 60;
        particle.vx = (Math.random() - 0.5) * 0.3;
        particle.vy = -0.5 - Math.random() * 0.3;
        break;

      case 'wind':
        // Leaf/petal particle
        particle.ellipse(0, 0, 4, 2);
        particle.fill({ color: colors.secondary, alpha: 0.7 });
        particle.x = 35 + (Math.random() - 0.5) * 50;
        particle.y = 35 + (Math.random() - 0.5) * 30;
        particle.vx = 0.8 + Math.random() * 0.5;
        particle.vy = (Math.random() - 0.5) * 0.3;
        particle.rotSpeed = 0.05 + Math.random() * 0.05;
        break;

      case 'light':
        // Sparkle
        particle.moveTo(0, -3);
        particle.lineTo(0, 3);
        particle.moveTo(-3, 0);
        particle.lineTo(3, 0);
        particle.stroke({ color: colors.secondary, width: 2, alpha: 0.8 });
        particle.x = 35 + (Math.random() - 0.5) * 40;
        particle.y = 35 + (Math.random() - 0.5) * 40;
        particle.vx = 0;
        particle.vy = 0;
        particle.rotSpeed = 0.02;
        break;

      case 'dark':
        // Shadow wisp
        particle.circle(0, 0, 3 + Math.random() * 2);
        particle.fill({ color: 0x000000, alpha: 0.5 });
        particle.x = 35 + (Math.random() - 0.5) * 40;
        particle.y = 55;
        particle.vx = (Math.random() - 0.5) * 0.3;
        particle.vy = 0.3 + Math.random() * 0.2;
        break;

      default:
        particle.circle(0, 0, 2);
        particle.fill(colors.primary);
        particle.x = 35;
        particle.y = 50;
        particle.vx = 0;
        particle.vy = -0.5;
    }

    this.elementParticles.addChild(particle);
  }

  /**
   * Animate element particle based on type
   */
  private animateElementParticle(
    particle: Graphics & {
      life: number;
      vx: number;
      vy: number;
      element: string;
      rotSpeed?: number;
    },
    elapsed: number
  ): void {
    const { element, life } = particle;

    // Movement
    particle.x += particle.vx;
    particle.y += particle.vy;

    // Element-specific behavior
    switch (element) {
      case 'fire':
        // Rise and flicker
        particle.vy -= 0.01; // Accelerate upward
        particle.alpha = (1 - life) * 0.8;
        particle.scale.set(1 - life * 0.5);
        // Flicker
        particle.x += Math.sin(elapsed * 0.02) * 0.3;
        break;

      case 'water':
        // Float up with wobble
        particle.alpha = life < 0.2 ? life * 5 : (1 - life) * 1.25;
        particle.x += Math.sin(life * Math.PI * 4) * 0.5;
        particle.scale.set(0.8 + life * 0.4);
        break;

      case 'wind':
        // Spiral motion
        particle.rotation += particle.rotSpeed || 0.05;
        particle.alpha = life < 0.1 ? life * 10 : (1 - life);
        particle.vy += Math.sin(life * Math.PI * 2) * 0.05;
        break;

      case 'light':
        // Twinkle in place
        particle.rotation += particle.rotSpeed || 0.02;
        particle.alpha = Math.sin(life * Math.PI) * 0.8;
        particle.scale.set(0.5 + Math.sin(life * Math.PI) * 0.5);
        break;

      case 'dark':
        // Sink and fade
        particle.alpha = (1 - life) * 0.6;
        particle.x += Math.sin(elapsed * 0.01 + particle.y) * 0.2;
        particle.scale.set(1 + life * 0.3);
        break;

      default:
        particle.alpha = 1 - life;
    }
  }

  /**
   * Cleanup when sprite is destroyed
   */
  public destroy(): void {
    this.stopIdleAnimation();
    if (this.atbAnimationId !== null) {
      cancelAnimationFrame(this.atbAnimationId);
    }
    super.destroy();
  }
}
