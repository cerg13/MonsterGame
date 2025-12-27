import { Container, Graphics, Text, TextStyle } from 'pixi.js';

/**
 * Animation easing functions
 */
export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/**
 * Simple tween animation
 */
export interface TweenOptions {
  duration: number;
  easing?: (t: number) => number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

export function tween(from: number, to: number, options: TweenOptions): () => void {
  const { duration, easing = Easing.easeOutQuad, onUpdate, onComplete } = options;
  const startTime = performance.now();
  let animationId: number;

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    const value = from + (to - from) * easedProgress;

    onUpdate(value);

    if (progress < 1) {
      animationId = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  animationId = requestAnimationFrame(animate);

  // Return cancel function
  return () => cancelAnimationFrame(animationId);
}

/**
 * Shake animation for hit effects
 */
export function shakeAnimation(
  target: Container,
  intensity: number = 5,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const originalX = target.x;
    const originalY = target.y;
    const startTime = performance.now();

    const shake = () => {
      const elapsed = performance.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        target.x = originalX;
        target.y = originalY;
        resolve();
        return;
      }

      const decay = 1 - progress;
      target.x = originalX + (Math.random() - 0.5) * intensity * decay * 2;
      target.y = originalY + (Math.random() - 0.5) * intensity * decay * 2;

      requestAnimationFrame(shake);
    };

    shake();
  });
}

/**
 * Flash animation for damage
 */
export function flashAnimation(
  target: Container,
  color: number = 0xff0000,
  duration: number = 200
): Promise<void> {
  return new Promise((resolve) => {
    const flash = new Graphics();
    flash.rect(-50, -50, 100, 100);
    flash.fill({ color, alpha: 0.5 });
    target.addChild(flash);

    tween(0.5, 0, {
      duration,
      onUpdate: (alpha) => {
        flash.alpha = alpha;
      },
      onComplete: () => {
        target.removeChild(flash);
        resolve();
      },
    });
  });
}

/**
 * Scale bounce animation
 */
export function bounceAnimation(
  target: Container,
  scale: number = 1.2,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const originalScaleX = target.scale.x;
    const originalScaleY = target.scale.y;

    // Scale up
    tween(1, scale, {
      duration: duration / 2,
      easing: Easing.easeOutQuad,
      onUpdate: (s) => {
        target.scale.set(originalScaleX * s, originalScaleY * s);
      },
      onComplete: () => {
        // Scale back
        tween(scale, 1, {
          duration: duration / 2,
          easing: Easing.easeOutElastic,
          onUpdate: (s) => {
            target.scale.set(originalScaleX * s, originalScaleY * s);
          },
          onComplete: resolve,
        });
      },
    });
  });
}

/**
 * Create floating damage number
 */
export function createDamageNumber(
  parent: Container,
  damage: number,
  x: number,
  y: number,
  options: {
    isCrit?: boolean;
    isHeal?: boolean;
    element?: string;
  } = {}
): void {
  const { isCrit = false, isHeal = false, element } = options;

  // Determine color
  let color = 0xffffff;
  if (isHeal) {
    color = 0x1dd1a1;
  } else if (isCrit) {
    color = 0xfeca57;
  } else if (element) {
    const elementColors: Record<string, number> = {
      fire: 0xff6b6b,
      water: 0x48dbfb,
      wind: 0x1dd1a1,
      light: 0xfeca57,
      dark: 0xa55eea,
    };
    color = elementColors[element] || 0xffffff;
  }

  const style = new TextStyle({
    fontSize: isCrit ? 28 : 22,
    fontWeight: 'bold',
    fill: color,
    stroke: { color: 0x000000, width: 4 },
    dropShadow: {
      color: 0x000000,
      blur: 4,
      distance: 2,
    },
  });

  const text = new Text({
    text: isHeal ? `+${damage}` : `-${damage}`,
    style,
  });

  text.anchor.set(0.5);
  text.x = x + (Math.random() - 0.5) * 20;
  text.y = y;
  text.alpha = 1;

  parent.addChild(text);

  // Animate up and fade
  const startY = text.y;
  const startTime = performance.now();
  const duration = 1000;

  const animate = () => {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Move up
    text.y = startY - 50 * Easing.easeOutQuad(progress);

    // Scale for crit
    if (isCrit && progress < 0.2) {
      const scaleProgress = progress / 0.2;
      const scale = 1 + 0.5 * Easing.easeOutBack(scaleProgress);
      text.scale.set(scale);
    }

    // Fade out in last 30%
    if (progress > 0.7) {
      text.alpha = 1 - (progress - 0.7) / 0.3;
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      parent.removeChild(text);
    }
  };

  animate();
}

/**
 * Create skill effect particles
 */
export function createSkillEffect(
  parent: Container,
  x: number,
  y: number,
  element: string,
  skillType: 'attack' | 'buff' | 'debuff' | 'heal' = 'attack'
): void {
  const colors: Record<string, number> = {
    fire: 0xff6b6b,
    water: 0x48dbfb,
    wind: 0x1dd1a1,
    light: 0xfeca57,
    dark: 0xa55eea,
  };

  const color = colors[element] || 0xffffff;
  const particleCount = skillType === 'attack' ? 15 : 8;

  for (let i = 0; i < particleCount; i++) {
    const particle = new Graphics();

    if (skillType === 'attack') {
      // Sharp particles for attack
      particle.circle(0, 0, 3 + Math.random() * 4);
      particle.fill(color);
    } else if (skillType === 'heal') {
      // Plus signs for heal
      particle.rect(-2, -6, 4, 12);
      particle.rect(-6, -2, 12, 4);
      particle.fill(0x1dd1a1);
    } else {
      // Circles for buff/debuff
      particle.circle(0, 0, 4);
      particle.fill(color);
    }

    particle.x = x;
    particle.y = y;
    particle.alpha = 1;

    parent.addChild(particle);

    // Random direction
    const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
    const speed = 50 + Math.random() * 50;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;

    const startTime = performance.now();
    const duration = 500 + Math.random() * 300;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      particle.x = x + dx * Easing.easeOutQuad(progress);
      particle.y = y + dy * Easing.easeOutQuad(progress);
      particle.alpha = 1 - Easing.easeInQuad(progress);
      particle.scale.set(1 - progress * 0.5);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(particle);
      }
    };

    animate();
  }
}

/**
 * Skill casting charge-up effect
 */
export function createCastingEffect(
  parent: Container,
  x: number,
  y: number,
  element: string,
  duration: number = 400
): Promise<void> {
  return new Promise((resolve) => {
    const colors: Record<string, number> = {
      fire: 0xff6b6b,
      water: 0x48dbfb,
      wind: 0x1dd1a1,
      light: 0xfeca57,
      dark: 0xa55eea,
    };
    const color = colors[element] || 0xffffff;

    // Create charging ring
    const ring = new Graphics();
    ring.circle(0, 0, 25);
    ring.stroke({ color, width: 3, alpha: 0.8 });
    ring.x = x;
    ring.y = y;
    ring.scale.set(0.3);
    ring.alpha = 0;
    parent.addChild(ring);

    // Create inner glow
    const glow = new Graphics();
    glow.circle(0, 0, 15);
    glow.fill({ color, alpha: 0.4 });
    glow.x = x;
    glow.y = y;
    glow.scale.set(0.5);
    glow.alpha = 0;
    parent.addChild(glow);

    // Create orbiting particles
    const particles: Graphics[] = [];
    for (let i = 0; i < 6; i++) {
      const p = new Graphics();
      p.circle(0, 0, 3);
      p.fill(color);
      p.x = x;
      p.y = y;
      p.alpha = 0;
      parent.addChild(p);
      particles.push(p);
    }

    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ring expands and fades in then out
      ring.scale.set(0.3 + progress * 0.7);
      ring.alpha = progress < 0.5 ? progress * 2 : (1 - progress) * 2;

      // Glow pulses
      glow.scale.set(0.5 + Math.sin(progress * Math.PI * 4) * 0.2);
      glow.alpha = progress < 0.8 ? progress : (1 - progress) * 5;

      // Particles orbit
      particles.forEach((p, i) => {
        const angle = (i / particles.length) * Math.PI * 2 + progress * Math.PI * 4;
        const radius = 20 + progress * 10;
        p.x = x + Math.cos(angle) * radius;
        p.y = y + Math.sin(angle) * radius;
        p.alpha = progress < 0.8 ? progress * 1.2 : (1 - progress) * 5;
        p.scale.set(1 - progress * 0.5);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(ring);
        parent.removeChild(glow);
        particles.forEach(p => parent.removeChild(p));
        resolve();
      }
    };

    animate();
  });
}

/**
 * Projectile effect that travels from source to target
 * Enhanced with element-specific visuals
 */
export function createProjectile(
  parent: Container,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  element: string,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const colors: Record<string, number> = {
      fire: 0xff6b6b,
      water: 0x48dbfb,
      wind: 0x1dd1a1,
      light: 0xfeca57,
      dark: 0xa55eea,
    };
    const secondaryColors: Record<string, number> = {
      fire: 0xffa500,
      water: 0x00bfff,
      wind: 0x90ee90,
      light: 0xffffff,
      dark: 0x4b0082,
    };
    const color = colors[element] || 0xffffff;
    const secondaryColor = secondaryColors[element] || 0xcccccc;

    // Calculate angle for directional effects
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Main projectile container
    const projectileContainer = new Container();
    projectileContainer.x = fromX;
    projectileContainer.y = fromY;
    parent.addChild(projectileContainer);

    // Element-specific projectile shapes
    const projectile = new Graphics();

    if (element === 'fire') {
      // Fire: Flame-shaped projectile
      projectile.moveTo(10, 0);
      projectile.bezierCurveTo(5, -6, -5, -4, -8, 0);
      projectile.bezierCurveTo(-5, 4, 5, 6, 10, 0);
      projectile.fill(color);
      projectile.moveTo(6, 0);
      projectile.bezierCurveTo(3, -3, -2, -2, -4, 0);
      projectile.bezierCurveTo(-2, 2, 3, 3, 6, 0);
      projectile.fill(secondaryColor);
    } else if (element === 'water') {
      // Water: Droplet/wave shape
      projectile.circle(0, 0, 8);
      projectile.fill({ color, alpha: 0.8 });
      projectile.circle(0, 0, 5);
      projectile.fill({ color: 0xffffff, alpha: 0.4 });
      // Wave ripples
      projectile.circle(0, 0, 12);
      projectile.stroke({ color: secondaryColor, width: 2, alpha: 0.5 });
    } else if (element === 'wind') {
      // Wind: Spiral/swirl shape
      for (let i = 0; i < 3; i++) {
        const spiralAngle = (i / 3) * Math.PI * 2;
        projectile.circle(Math.cos(spiralAngle) * 6, Math.sin(spiralAngle) * 6, 4);
        projectile.fill({ color, alpha: 0.7 });
      }
      projectile.circle(0, 0, 4);
      projectile.fill(secondaryColor);
    } else if (element === 'light') {
      // Light: Star burst shape
      for (let i = 0; i < 6; i++) {
        const rayAngle = (i / 6) * Math.PI * 2;
        projectile.moveTo(0, 0);
        projectile.lineTo(Math.cos(rayAngle) * 12, Math.sin(rayAngle) * 12);
        projectile.stroke({ color, width: 3, alpha: 0.8 });
      }
      projectile.circle(0, 0, 6);
      projectile.fill(0xffffff);
      projectile.circle(0, 0, 4);
      projectile.fill(color);
    } else if (element === 'dark') {
      // Dark: Void orb with tendrils
      projectile.circle(0, 0, 8);
      projectile.fill({ color: 0x000000, alpha: 0.8 });
      projectile.circle(0, 0, 6);
      projectile.fill(color);
      projectile.circle(0, 0, 10);
      projectile.stroke({ color: secondaryColor, width: 2, alpha: 0.6 });
    } else {
      // Default
      projectile.circle(0, 0, 8);
      projectile.fill(color);
    }

    projectile.rotation = angle;
    projectileContainer.addChild(projectile);

    // Trail particles
    const trail: (Graphics & { life: number; vx: number; vy: number })[] = [];
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = Easing.easeOutQuad(progress);

      // Move projectile
      projectileContainer.x = fromX + (toX - fromX) * eased;
      projectileContainer.y = fromY + (toY - fromY) * eased;

      // Element-specific animations
      if (element === 'fire') {
        // Flickering effect
        projectile.scale.set(1 + Math.sin(elapsed / 30) * 0.1);
        projectile.alpha = 0.8 + Math.sin(elapsed / 50) * 0.2;
      } else if (element === 'wind') {
        // Rotation for spiral effect
        projectile.rotation += 0.15;
      } else if (element === 'light') {
        // Pulsing glow
        projectile.scale.set(1 + Math.sin(elapsed / 40) * 0.15);
      } else if (element === 'dark') {
        // Wobble effect
        projectile.scale.x = 1 + Math.sin(elapsed / 60) * 0.1;
        projectile.scale.y = 1 + Math.cos(elapsed / 60) * 0.1;
      }

      // Element-specific trail particles
      if (progress < 0.85 && Math.random() < 0.4) {
        const t = new Graphics() as Graphics & { life: number; vx: number; vy: number };

        if (element === 'fire') {
          // Ember particles
          t.circle(0, 0, 2 + Math.random() * 3);
          t.fill(Math.random() > 0.5 ? color : secondaryColor);
          t.vx = (Math.random() - 0.5) * 3;
          t.vy = -Math.random() * 2 - 1;
        } else if (element === 'water') {
          // Bubble particles
          const size = 2 + Math.random() * 3;
          t.circle(0, 0, size);
          t.fill({ color, alpha: 0.5 });
          t.circle(0, 0, size);
          t.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
          t.vx = (Math.random() - 0.5) * 2;
          t.vy = (Math.random() - 0.5) * 2;
        } else if (element === 'wind') {
          // Leaf-like particles
          t.ellipse(0, 0, 4, 2);
          t.fill({ color: secondaryColor, alpha: 0.7 });
          t.rotation = Math.random() * Math.PI * 2;
          t.vx = (Math.random() - 0.5) * 4;
          t.vy = (Math.random() - 0.5) * 4;
        } else if (element === 'light') {
          // Sparkle particles
          t.moveTo(0, -3);
          t.lineTo(0, 3);
          t.moveTo(-3, 0);
          t.lineTo(3, 0);
          t.stroke({ color: 0xffffff, width: 2 });
          t.vx = (Math.random() - 0.5) * 3;
          t.vy = (Math.random() - 0.5) * 3;
        } else if (element === 'dark') {
          // Shadow wisps
          t.circle(0, 0, 3 + Math.random() * 2);
          t.fill({ color: 0x000000, alpha: 0.6 });
          t.vx = (Math.random() - 0.5) * 2;
          t.vy = Math.random() * 2;
        } else {
          t.circle(0, 0, 3);
          t.fill({ color, alpha: 0.6 });
          t.vx = (Math.random() - 0.5) * 2;
          t.vy = (Math.random() - 0.5) * 2;
        }

        t.x = projectileContainer.x;
        t.y = projectileContainer.y;
        t.life = 0;
        parent.addChild(t);
        trail.push(t);
      }

      // Animate trail particles
      trail.forEach((t, i) => {
        t.life += 0.04;
        t.x += t.vx;
        t.y += t.vy;

        if (element === 'fire') {
          t.vy -= 0.1; // Rise up
        } else if (element === 'wind') {
          t.rotation += 0.1;
        }

        t.alpha = 1 - t.life;
        t.scale.set(1 - t.life * 0.5);

        if (t.life >= 1) {
          parent.removeChild(t);
          trail.splice(i, 1);
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(projectileContainer);
        trail.forEach(t => {
          if (t.parent) parent.removeChild(t);
        });
        resolve();
      }
    };

    animate();
  });
}

/**
 * Impact burst effect at target location
 * Enhanced with element-specific visuals
 */
export function createImpactEffect(
  parent: Container,
  x: number,
  y: number,
  element: string,
  intensity: number = 1
): void {
  const colors: Record<string, number> = {
    fire: 0xff6b6b,
    water: 0x48dbfb,
    wind: 0x1dd1a1,
    light: 0xfeca57,
    dark: 0xa55eea,
  };
  const secondaryColors: Record<string, number> = {
    fire: 0xffa500,
    water: 0x00bfff,
    wind: 0x90ee90,
    light: 0xffffff,
    dark: 0x4b0082,
  };
  const color = colors[element] || 0xffffff;
  const secondaryColor = secondaryColors[element] || 0xcccccc;

  // Element-specific impact effects
  const particleCount = Math.floor(12 * intensity);
  const particles: (Graphics & { angle: number; speed: number; rotSpeed?: number })[] = [];

  if (element === 'fire') {
    // Fire: Explosion with heat shimmer
    const explosion = new Graphics();
    explosion.circle(0, 0, 25 * intensity);
    explosion.fill({ color, alpha: 0.6 });
    explosion.circle(0, 0, 15 * intensity);
    explosion.fill({ color: secondaryColor, alpha: 0.8 });
    explosion.x = x;
    explosion.y = y;
    explosion.scale.set(0.3);
    parent.addChild(explosion);

    // Embers flying outward
    for (let i = 0; i < particleCount; i++) {
      const p = new Graphics() as Graphics & { angle: number; speed: number };
      const size = 2 + Math.random() * 4;
      p.circle(0, 0, size);
      p.fill(Math.random() > 0.5 ? color : secondaryColor);
      p.x = x;
      p.y = y;
      p.angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      p.speed = (50 + Math.random() * 40) * intensity;
      parent.addChild(p);
      particles.push(p);
    }

    const startTime = performance.now();
    const duration = 500;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Explosion expands and fades
      explosion.scale.set(0.3 + progress * 1.5);
      explosion.alpha = (1 - progress) * 0.8;

      // Embers with gravity
      particles.forEach((p) => {
        const dist = p.speed * Easing.easeOutQuad(progress);
        p.x = x + Math.cos(p.angle) * dist;
        p.y = y + Math.sin(p.angle) * dist + progress * progress * 30; // Gravity
        p.alpha = 1 - Easing.easeInQuad(progress);
        p.scale.set((1 - progress * 0.5) * (0.8 + Math.sin(elapsed / 50) * 0.2));
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(explosion);
        particles.forEach(p => parent.removeChild(p));
      }
    };
    animate();

  } else if (element === 'water') {
    // Water: Splash with ripples
    const ripples: Graphics[] = [];
    for (let i = 0; i < 3; i++) {
      const ripple = new Graphics();
      ripple.circle(0, 0, 20);
      ripple.stroke({ color, width: 3, alpha: 0.8 });
      ripple.x = x;
      ripple.y = y;
      ripple.scale.set(0.2);
      ripple.alpha = 0;
      parent.addChild(ripple);
      ripples.push(ripple);
    }

    // Splash droplets
    for (let i = 0; i < particleCount; i++) {
      const p = new Graphics() as Graphics & { angle: number; speed: number };
      const size = 3 + Math.random() * 4;
      p.circle(0, 0, size);
      p.fill({ color, alpha: 0.7 });
      p.circle(0, 0, size * 0.6);
      p.fill({ color: 0xffffff, alpha: 0.4 });
      p.x = x;
      p.y = y;
      p.angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI; // Upward arc
      p.speed = (40 + Math.random() * 50) * intensity;
      parent.addChild(p);
      particles.push(p);
    }

    const startTime = performance.now();
    const duration = 600;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ripples expand with delay
      ripples.forEach((ripple, i) => {
        const delay = i * 0.15;
        const rippleProgress = Math.max(0, (progress - delay) / (1 - delay));
        if (rippleProgress > 0) {
          ripple.scale.set(0.2 + rippleProgress * 2);
          ripple.alpha = (1 - rippleProgress) * 0.8;
        }
      });

      // Droplets arc upward then fall
      particles.forEach((p) => {
        const dist = p.speed * progress;
        p.x = x + Math.cos(p.angle) * dist * 0.5;
        p.y = y + Math.sin(p.angle) * dist - (1 - progress * 2) * progress * 40; // Arc
        p.alpha = 1 - Easing.easeInQuad(progress);
        p.scale.set(1 - progress * 0.5);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        ripples.forEach(r => parent.removeChild(r));
        particles.forEach(p => parent.removeChild(p));
      }
    };
    animate();

  } else if (element === 'wind') {
    // Wind: Spiral burst with leaves
    const spiral = new Graphics();
    spiral.x = x;
    spiral.y = y;
    parent.addChild(spiral);

    // Leaf particles
    for (let i = 0; i < particleCount; i++) {
      const p = new Graphics() as Graphics & { angle: number; speed: number; rotSpeed: number };
      p.ellipse(0, 0, 5, 2);
      p.fill({ color: Math.random() > 0.5 ? color : secondaryColor, alpha: 0.8 });
      p.x = x;
      p.y = y;
      p.angle = (i / particleCount) * Math.PI * 2;
      p.speed = (30 + Math.random() * 40) * intensity;
      p.rotSpeed = (Math.random() - 0.5) * 0.3;
      p.rotation = Math.random() * Math.PI * 2;
      parent.addChild(p);
      particles.push(p);
    }

    const startTime = performance.now();
    const duration = 500;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Spiral effect
      spiral.clear();
      for (let i = 0; i < 20; i++) {
        const spiralProgress = (i / 20 + progress * 2) % 1;
        const spiralAngle = spiralProgress * Math.PI * 4;
        const spiralRadius = spiralProgress * 40 * intensity;
        const alpha = (1 - spiralProgress) * (1 - progress) * 0.5;
        spiral.circle(Math.cos(spiralAngle) * spiralRadius, Math.sin(spiralAngle) * spiralRadius, 3);
        spiral.fill({ color, alpha });
      }

      // Leaves spiral outward
      particles.forEach((p) => {
        p.angle += 0.05;
        const dist = p.speed * Easing.easeOutQuad(progress);
        p.x = x + Math.cos(p.angle) * dist;
        p.y = y + Math.sin(p.angle) * dist;
        p.rotation += p.rotSpeed || 0;
        p.alpha = 1 - Easing.easeInQuad(progress);
        p.scale.set(1 - progress * 0.3);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(spiral);
        particles.forEach(p => parent.removeChild(p));
      }
    };
    animate();

  } else if (element === 'light') {
    // Light: Radiant burst with star rays
    const burst = new Graphics();
    burst.x = x;
    burst.y = y;
    parent.addChild(burst);

    // Star rays
    const rayCount = 8;
    const rays: Graphics[] = [];
    for (let i = 0; i < rayCount; i++) {
      const ray = new Graphics();
      const angle = (i / rayCount) * Math.PI * 2;
      ray.moveTo(0, 0);
      ray.lineTo(Math.cos(angle) * 50, Math.sin(angle) * 50);
      ray.stroke({ color, width: 4, alpha: 0.8 });
      ray.x = x;
      ray.y = y;
      ray.scale.set(0.2);
      parent.addChild(ray);
      rays.push(ray);
    }

    // Sparkle particles
    for (let i = 0; i < particleCount; i++) {
      const p = new Graphics() as Graphics & { angle: number; speed: number };
      p.moveTo(0, -4);
      p.lineTo(0, 4);
      p.moveTo(-4, 0);
      p.lineTo(4, 0);
      p.stroke({ color: 0xffffff, width: 2 });
      p.x = x;
      p.y = y;
      p.angle = (i / particleCount) * Math.PI * 2;
      p.speed = (35 + Math.random() * 35) * intensity;
      parent.addChild(p);
      particles.push(p);
    }

    const startTime = performance.now();
    const duration = 400;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Central burst
      burst.clear();
      const burstSize = 15 * intensity * (1 - progress);
      burst.circle(0, 0, burstSize);
      burst.fill({ color: 0xffffff, alpha: 1 - progress });

      // Rays expand
      rays.forEach((ray, i) => {
        ray.scale.set(0.2 + progress * 1.2);
        ray.alpha = 1 - progress;
        ray.rotation = (i / rayCount) * Math.PI * 2 + progress * 0.3;
      });

      // Sparkles burst outward
      particles.forEach((p) => {
        const dist = p.speed * Easing.easeOutQuad(progress);
        p.x = x + Math.cos(p.angle) * dist;
        p.y = y + Math.sin(p.angle) * dist;
        p.alpha = 1 - Easing.easeInQuad(progress);
        p.scale.set((1 - progress * 0.5) * (1 + Math.sin(elapsed / 30) * 0.2));
        p.rotation += 0.1;
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(burst);
        rays.forEach(r => parent.removeChild(r));
        particles.forEach(p => parent.removeChild(p));
      }
    };
    animate();

  } else if (element === 'dark') {
    // Dark: Void implosion with shadow tendrils
    const void_center = new Graphics();
    void_center.circle(0, 0, 20 * intensity);
    void_center.fill({ color: 0x000000, alpha: 0.8 });
    void_center.circle(0, 0, 12 * intensity);
    void_center.fill(color);
    void_center.x = x;
    void_center.y = y;
    void_center.scale.set(1.5);
    parent.addChild(void_center);

    // Shadow tendrils
    const tendrils: Graphics[] = [];
    for (let i = 0; i < 6; i++) {
      const tendril = new Graphics();
      const angle = (i / 6) * Math.PI * 2;
      tendril.moveTo(0, 0);
      tendril.bezierCurveTo(
        Math.cos(angle) * 30, Math.sin(angle) * 30,
        Math.cos(angle + 0.3) * 50, Math.sin(angle + 0.3) * 50,
        Math.cos(angle) * 60, Math.sin(angle) * 60
      );
      tendril.stroke({ color: secondaryColor, width: 4, alpha: 0.7 });
      tendril.x = x;
      tendril.y = y;
      tendril.scale.set(0.5);
      parent.addChild(tendril);
      tendrils.push(tendril);
    }

    // Shadow particles
    for (let i = 0; i < particleCount; i++) {
      const p = new Graphics() as Graphics & { angle: number; speed: number };
      const size = 3 + Math.random() * 4;
      p.circle(0, 0, size);
      p.fill({ color: 0x000000, alpha: 0.7 });
      p.x = x + (Math.random() - 0.5) * 60;
      p.y = y + (Math.random() - 0.5) * 60;
      p.angle = Math.atan2(p.y - y, p.x - x);
      p.speed = 30 + Math.random() * 20;
      parent.addChild(p);
      particles.push(p);
    }

    const startTime = performance.now();
    const duration = 500;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Void center implodes then fades
      if (progress < 0.3) {
        void_center.scale.set(1.5 - progress * 4);
      } else {
        void_center.scale.set(0.3 + (progress - 0.3) * 0.5);
        void_center.alpha = 1 - (progress - 0.3) / 0.7;
      }

      // Tendrils writhe and fade
      tendrils.forEach((tendril, i) => {
        tendril.scale.set(0.5 + progress * 0.8);
        tendril.rotation = Math.sin(elapsed / 100 + i) * 0.2;
        tendril.alpha = 1 - progress;
      });

      // Particles get sucked in then disperse
      particles.forEach((p) => {
        if (progress < 0.3) {
          // Implode
          const dist = p.speed * (1 - progress / 0.3);
          p.x = x + Math.cos(p.angle) * dist;
          p.y = y + Math.sin(p.angle) * dist;
        } else {
          // Disperse
          const disperseProgress = (progress - 0.3) / 0.7;
          const dist = p.speed * disperseProgress * 1.5;
          p.x = x + Math.cos(p.angle + Math.PI) * dist;
          p.y = y + Math.sin(p.angle + Math.PI) * dist;
          p.alpha = 1 - disperseProgress;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(void_center);
        tendrils.forEach(t => parent.removeChild(t));
        particles.forEach(p => parent.removeChild(p));
      }
    };
    animate();

  } else {
    // Default: Simple burst
    const ring = new Graphics();
    ring.circle(0, 0, 20);
    ring.stroke({ color, width: 4 });
    ring.x = x;
    ring.y = y;
    ring.scale.set(0.2);
    parent.addChild(ring);

    for (let i = 0; i < particleCount; i++) {
      const p = new Graphics() as Graphics & { angle: number; speed: number };
      const size = 2 + Math.random() * 4;
      p.circle(0, 0, size);
      p.fill(color);
      p.x = x;
      p.y = y;
      p.angle = (i / particleCount) * Math.PI * 2;
      p.speed = (40 + Math.random() * 30) * intensity;
      parent.addChild(p);
      particles.push(p);
    }

    const startTime = performance.now();
    const duration = 400;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ring.scale.set(0.2 + progress * 1.5 * intensity);
      ring.alpha = 1 - progress;

      particles.forEach((p) => {
        const dist = p.speed * Easing.easeOutQuad(progress);
        p.x = x + Math.cos(p.angle) * dist;
        p.y = y + Math.sin(p.angle) * dist;
        p.alpha = 1 - Easing.easeInQuad(progress);
        p.scale.set(1 - progress * 0.7);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(ring);
        particles.forEach(p => parent.removeChild(p));
      }
    };
    animate();
  }
}

/**
 * Healing effect with rising particles
 */
export function createHealEffect(
  parent: Container,
  x: number,
  y: number
): void {
  const particleCount = 12;

  for (let i = 0; i < particleCount; i++) {
    const p = new Graphics();
    // Plus sign shape
    p.rect(-2, -5, 4, 10);
    p.rect(-5, -2, 10, 4);
    p.fill(0x1dd1a1);
    p.x = x + (Math.random() - 0.5) * 40;
    p.y = y + 20;
    p.alpha = 0;
    parent.addChild(p);

    const delay = i * 50;
    const startTime = performance.now() + delay;
    const duration = 800;
    const startX = p.x;
    const startY = p.y;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);

      p.y = startY - 60 * Easing.easeOutQuad(progress);
      p.x = startX + Math.sin(progress * Math.PI * 2) * 10;
      p.alpha = progress < 0.2 ? progress * 5 : progress > 0.7 ? (1 - progress) * 3.33 : 1;
      p.rotation = progress * Math.PI * 0.5;
      p.scale.set(0.8 + Math.sin(progress * Math.PI) * 0.4);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(p);
      }
    };

    animate();
  }
}

/**
 * Buff/debuff swirl effect
 */
export function createBuffEffect(
  parent: Container,
  x: number,
  y: number,
  isBuff: boolean
): void {
  const color = isBuff ? 0x48dbfb : 0xff6b6b;
  const particleCount = 8;

  for (let i = 0; i < particleCount; i++) {
    const p = new Graphics();
    p.circle(0, 0, 4);
    p.fill(color);
    p.x = x;
    p.y = y + 30;
    p.alpha = 0;
    parent.addChild(p);

    const delay = i * 40;
    const startTime = performance.now() + delay;
    const duration = 600;
    const angleOffset = (i / particleCount) * Math.PI * 2;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      const angle = angleOffset + progress * Math.PI * 3;
      const radius = 25 * (1 - progress * 0.5);

      p.x = x + Math.cos(angle) * radius;
      p.y = y + 30 - 50 * Easing.easeOutQuad(progress);
      p.alpha = progress < 0.2 ? progress * 5 : progress > 0.8 ? (1 - progress) * 5 : 1;
      p.scale.set(1 - progress * 0.5);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        parent.removeChild(p);
      }
    };

    animate();
  }

  // Add rising arrow for buff, falling for debuff
  const arrow = new Graphics();
  if (isBuff) {
    arrow.moveTo(0, 10);
    arrow.lineTo(8, 0);
    arrow.lineTo(0, -10);
    arrow.lineTo(-8, 0);
    arrow.closePath();
  } else {
    arrow.moveTo(0, -10);
    arrow.lineTo(8, 0);
    arrow.lineTo(0, 10);
    arrow.lineTo(-8, 0);
    arrow.closePath();
  }
  arrow.fill(color);
  arrow.x = x;
  arrow.y = y;
  arrow.alpha = 0;
  parent.addChild(arrow);

  const arrowStart = performance.now();
  const arrowAnimate = () => {
    const elapsed = performance.now() - arrowStart;
    const progress = Math.min(elapsed / 500, 1);

    arrow.y = y + (isBuff ? -40 : 40) * Easing.easeOutQuad(progress);
    arrow.alpha = progress < 0.3 ? progress * 3.33 : progress > 0.7 ? (1 - progress) * 3.33 : 1;
    arrow.scale.set(0.5 + progress * 0.5);

    if (progress < 1) {
      requestAnimationFrame(arrowAnimate);
    } else {
      parent.removeChild(arrow);
    }
  };
  arrowAnimate();
}

/**
 * ATB bar fill animation
 */
export function animateATBFill(
  bar: Graphics,
  fromPercent: number,
  toPercent: number,
  width: number,
  height: number,
  color: number,
  duration: number = 100
): void {
  tween(fromPercent, toPercent, {
    duration,
    easing: Easing.linear,
    onUpdate: (percent) => {
      bar.clear();
      bar.rect(0, 0, width * (percent / 100), height);
      bar.fill(color);
    },
  });
}

/**
 * Monster death animation
 */
export function deathAnimation(target: Container, duration: number = 500): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Fade and fall
      target.alpha = 1 - progress;
      target.y += 2 * (1 - progress);
      target.scale.y = 1 - progress * 0.5;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        target.visible = false;
        resolve();
      }
    };

    animate();
  });
}

/**
 * Attack lunge animation
 */
export function attackAnimation(
  target: Container,
  direction: 'left' | 'right',
  distance: number = 30,
  duration: number = 200
): Promise<void> {
  return new Promise((resolve) => {
    const originalX = target.x;
    const moveDirection = direction === 'right' ? 1 : -1;

    // Lunge forward
    tween(0, distance, {
      duration: duration / 2,
      easing: Easing.easeOutQuad,
      onUpdate: (d) => {
        target.x = originalX + d * moveDirection;
      },
      onComplete: () => {
        // Return back
        tween(distance, 0, {
          duration: duration / 2,
          easing: Easing.easeOutQuad,
          onUpdate: (d) => {
            target.x = originalX + d * moveDirection;
          },
          onComplete: resolve,
        });
      },
    });
  });
}

/**
 * Status Effect Animation: Freeze
 * Creates ice crystals and frozen particles around target
 * Returns cleanup function to stop the animation
 */
export function createFreezeEffect(
  parent: Container,
  x: number,
  y: number
): { container: Container; cleanup: () => void } {
  const container = new Container();
  container.x = x;
  container.y = y;
  parent.addChild(container);

  let animationId: number | null = null;
  let isActive = true;

  // Ice crystals
  const crystals: Graphics[] = [];
  for (let i = 0; i < 6; i++) {
    const crystal = new Graphics();
    // Diamond/crystal shape
    crystal.moveTo(0, -8);
    crystal.lineTo(4, 0);
    crystal.lineTo(0, 8);
    crystal.lineTo(-4, 0);
    crystal.closePath();
    crystal.fill({ color: 0x87ceeb, alpha: 0.8 });
    crystal.stroke({ color: 0xffffff, width: 1, alpha: 0.6 });

    const angle = (i / 6) * Math.PI * 2;
    crystal.x = Math.cos(angle) * 25;
    crystal.y = Math.sin(angle) * 15;
    crystal.scale.set(0.6 + Math.random() * 0.4);
    container.addChild(crystal);
    crystals.push(crystal);
  }

  // Frost overlay
  const frost = new Graphics();
  frost.circle(0, 0, 35);
  frost.fill({ color: 0x00ffff, alpha: 0.15 });
  container.addChild(frost);

  // Floating ice particles
  const particles: Graphics[] = [];
  const startTime = performance.now();

  const animate = () => {
    if (!isActive) return;

    const elapsed = performance.now() - startTime;

    // Crystals shimmer
    crystals.forEach((c, i) => {
      const shimmer = Math.sin((elapsed + i * 200) / 500) * 0.3 + 0.7;
      c.alpha = shimmer;
      c.rotation = Math.sin((elapsed + i * 100) / 1000) * 0.1;
    });

    // Frost pulses
    frost.alpha = 0.1 + Math.sin(elapsed / 800) * 0.05;

    // Spawn new particles occasionally
    if (particles.length < 8 && Math.random() < 0.05) {
      const p = new Graphics();
      p.circle(0, 0, 2);
      p.fill(0xffffff);
      p.x = (Math.random() - 0.5) * 50;
      p.y = 20;
      p.alpha = 0;
      container.addChild(p);
      particles.push(p);
      (p as Graphics & { startTime: number }).startTime = performance.now();
    }

    // Animate particles rising
    particles.forEach((p, i) => {
      const particleP = p as Graphics & { startTime: number };
      const pElapsed = performance.now() - particleP.startTime;
      const pProgress = pElapsed / 2000;

      if (pProgress >= 1) {
        container.removeChild(p);
        particles.splice(i, 1);
      } else {
        p.y = 20 - pProgress * 50;
        p.x += Math.sin(pElapsed / 200) * 0.5;
        p.alpha = pProgress < 0.2 ? pProgress * 5 : pProgress > 0.8 ? (1 - pProgress) * 5 : 1;
      }
    });

    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  return {
    container,
    cleanup: () => {
      isActive = false;
      if (animationId) cancelAnimationFrame(animationId);
      parent.removeChild(container);
    },
  };
}

/**
 * Status Effect Animation: Stun
 * Creates circling stars above the target
 */
export function createStunEffect(
  parent: Container,
  x: number,
  y: number
): { container: Container; cleanup: () => void } {
  const container = new Container();
  container.x = x;
  container.y = y - 40;
  parent.addChild(container);

  let animationId: number | null = null;
  let isActive = true;

  // Create stars
  const stars: (Graphics & { angle: number })[] = [];
  for (let i = 0; i < 4; i++) {
    const star = new Graphics() as Graphics & { angle: number };
    // 4-point star shape
    star.moveTo(0, -6);
    star.lineTo(2, -2);
    star.lineTo(6, 0);
    star.lineTo(2, 2);
    star.lineTo(0, 6);
    star.lineTo(-2, 2);
    star.lineTo(-6, 0);
    star.lineTo(-2, -2);
    star.closePath();
    star.fill(0xfeca57);
    star.stroke({ color: 0xffffff, width: 1, alpha: 0.5 });
    star.angle = (i / 4) * Math.PI * 2;
    container.addChild(star);
    stars.push(star);
  }

  const startTime = performance.now();

  const animate = () => {
    if (!isActive) return;

    const elapsed = performance.now() - startTime;

    stars.forEach((star) => {
      const currentAngle = star.angle + elapsed / 300;
      const radius = 18 + Math.sin(elapsed / 400) * 3;
      star.x = Math.cos(currentAngle) * radius;
      star.y = Math.sin(currentAngle) * 8 + Math.sin(elapsed / 200) * 2;
      star.rotation = elapsed / 200;
      star.scale.set(0.8 + Math.sin(elapsed / 300) * 0.2);
    });

    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  return {
    container,
    cleanup: () => {
      isActive = false;
      if (animationId) cancelAnimationFrame(animationId);
      parent.removeChild(container);
    },
  };
}

/**
 * Status Effect Animation: Burn (Continuous Damage)
 * Creates flame particles and orange glow
 */
export function createBurnEffect(
  parent: Container,
  x: number,
  y: number
): { container: Container; cleanup: () => void } {
  const container = new Container();
  container.x = x;
  container.y = y;
  parent.addChild(container);

  let animationId: number | null = null;
  let isActive = true;

  // Fire glow
  const glow = new Graphics();
  glow.circle(0, 0, 40);
  glow.fill({ color: 0xff4500, alpha: 0.15 });
  container.addChild(glow);

  // Flame particles
  const flames: (Graphics & { life: number; startY: number; offsetX: number })[] = [];

  const spawnFlame = () => {
    const flame = new Graphics() as Graphics & { life: number; startY: number; offsetX: number };
    // Flame shape (teardrop)
    flame.moveTo(0, -8);
    flame.bezierCurveTo(-4, -4, -4, 4, 0, 8);
    flame.bezierCurveTo(4, 4, 4, -4, 0, -8);
    flame.fill(Math.random() > 0.5 ? 0xff6b6b : 0xffa500);

    flame.offsetX = (Math.random() - 0.5) * 40;
    flame.startY = 25;
    flame.x = flame.offsetX;
    flame.y = flame.startY;
    flame.life = 0;
    flame.scale.set(0.4 + Math.random() * 0.4);
    container.addChild(flame);
    flames.push(flame);
  };

  const startTime = performance.now();

  const animate = () => {
    if (!isActive) return;

    const elapsed = performance.now() - startTime;

    // Glow pulses
    glow.alpha = 0.1 + Math.sin(elapsed / 200) * 0.05;
    glow.scale.set(1 + Math.sin(elapsed / 300) * 0.05);

    // Spawn new flames
    if (flames.length < 12 && Math.random() < 0.15) {
      spawnFlame();
    }

    // Animate flames
    flames.forEach((flame, i) => {
      flame.life += 0.02;

      if (flame.life >= 1) {
        container.removeChild(flame);
        flames.splice(i, 1);
      } else {
        flame.y = flame.startY - flame.life * 50;
        flame.x = flame.offsetX + Math.sin(flame.life * Math.PI * 3) * 5;
        flame.alpha = flame.life < 0.2 ? flame.life * 5 : flame.life > 0.7 ? (1 - flame.life) * 3.33 : 1;
        flame.scale.set((0.4 + Math.random() * 0.2) * (1 - flame.life * 0.5));
        flame.rotation = Math.sin(flame.life * Math.PI * 2) * 0.3;
      }
    });

    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  return {
    container,
    cleanup: () => {
      isActive = false;
      if (animationId) cancelAnimationFrame(animationId);
      parent.removeChild(container);
    },
  };
}

/**
 * Status Effect Animation: Sleep
 * Creates floating "Z" letters
 */
export function createSleepEffect(
  parent: Container,
  x: number,
  y: number
): { container: Container; cleanup: () => void } {
  const container = new Container();
  container.x = x;
  container.y = y;
  parent.addChild(container);

  let animationId: number | null = null;
  let isActive = true;

  const zLetters: (Text & { life: number; startX: number })[] = [];

  const spawnZ = () => {
    const z = new Text({
      text: 'Z',
      style: new TextStyle({
        fontSize: 14 + Math.random() * 6,
        fontWeight: 'bold',
        fill: 0x9b59b6,
        stroke: { color: 0xffffff, width: 2 },
      }),
    }) as Text & { life: number; startX: number };

    z.anchor.set(0.5);
    z.startX = -20 + Math.random() * 10;
    z.x = z.startX;
    z.y = -20;
    z.life = 0;
    z.alpha = 0;
    container.addChild(z);
    zLetters.push(z);
  };

  let lastSpawn = 0;

  const animate = () => {
    if (!isActive) return;

    const now = performance.now();

    // Spawn new Z every 600ms
    if (now - lastSpawn > 600 && zLetters.length < 4) {
      spawnZ();
      lastSpawn = now;
    }

    // Animate Z letters
    zLetters.forEach((z, i) => {
      z.life += 0.008;

      if (z.life >= 1) {
        container.removeChild(z);
        zLetters.splice(i, 1);
      } else {
        z.y = -20 - z.life * 40;
        z.x = z.startX + z.life * 30 + Math.sin(z.life * Math.PI * 2) * 5;
        z.alpha = z.life < 0.15 ? z.life * 6.67 : z.life > 0.7 ? (1 - z.life) * 3.33 : 1;
        z.rotation = Math.sin(z.life * Math.PI) * 0.3;
        z.scale.set(0.7 + z.life * 0.5);
      }
    });

    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  return {
    container,
    cleanup: () => {
      isActive = false;
      if (animationId) cancelAnimationFrame(animationId);
      parent.removeChild(container);
    },
  };
}

/**
 * Status Effect Animation: Poison
 * Creates green drip particles and toxic bubbles
 */
export function createPoisonEffect(
  parent: Container,
  x: number,
  y: number
): { container: Container; cleanup: () => void } {
  const container = new Container();
  container.x = x;
  container.y = y;
  parent.addChild(container);

  let animationId: number | null = null;
  let isActive = true;

  // Poison glow
  const glow = new Graphics();
  glow.circle(0, 0, 35);
  glow.fill({ color: 0x00ff00, alpha: 0.1 });
  container.addChild(glow);

  // Drip particles
  const drips: (Graphics & { life: number; startX: number; speed: number })[] = [];

  // Bubble particles
  const bubbles: (Graphics & { life: number; startX: number; startY: number })[] = [];

  const spawnDrip = () => {
    const drip = new Graphics() as Graphics & { life: number; startX: number; speed: number };
    drip.circle(0, 0, 3);
    drip.fill(0x32cd32);

    drip.startX = (Math.random() - 0.5) * 50;
    drip.x = drip.startX;
    drip.y = -10;
    drip.life = 0;
    drip.speed = 0.5 + Math.random() * 0.5;
    container.addChild(drip);
    drips.push(drip);
  };

  const spawnBubble = () => {
    const bubble = new Graphics() as Graphics & { life: number; startX: number; startY: number };
    const size = 2 + Math.random() * 3;
    bubble.circle(0, 0, size);
    bubble.fill({ color: 0x7cfc00, alpha: 0.6 });
    bubble.stroke({ color: 0x00ff00, width: 1, alpha: 0.8 });

    bubble.startX = (Math.random() - 0.5) * 40;
    bubble.startY = 20 + Math.random() * 10;
    bubble.x = bubble.startX;
    bubble.y = bubble.startY;
    bubble.life = 0;
    container.addChild(bubble);
    bubbles.push(bubble);
  };

  const animate = () => {
    if (!isActive) return;

    // Glow pulses
    glow.alpha = 0.08 + Math.sin(performance.now() / 500) * 0.04;

    // Spawn new effects
    if (drips.length < 5 && Math.random() < 0.08) spawnDrip();
    if (bubbles.length < 4 && Math.random() < 0.03) spawnBubble();

    // Animate drips (falling)
    drips.forEach((drip, i) => {
      drip.life += drip.speed * 0.02;

      if (drip.life >= 1) {
        container.removeChild(drip);
        drips.splice(i, 1);
      } else {
        drip.y = -10 + drip.life * 50;
        drip.alpha = drip.life > 0.8 ? (1 - drip.life) * 5 : 1;
        drip.scale.y = 1 + drip.life * 0.5; // Elongate as falling
      }
    });

    // Animate bubbles (rising)
    bubbles.forEach((bubble, i) => {
      bubble.life += 0.01;

      if (bubble.life >= 1) {
        container.removeChild(bubble);
        bubbles.splice(i, 1);
      } else {
        bubble.y = bubble.startY - bubble.life * 30;
        bubble.x = bubble.startX + Math.sin(bubble.life * Math.PI * 4) * 5;
        bubble.alpha = bubble.life < 0.2 ? bubble.life * 5 : bubble.life > 0.7 ? (1 - bubble.life) * 3.33 : 0.6;
        bubble.scale.set(1 + bubble.life * 0.3);
      }
    });

    animationId = requestAnimationFrame(animate);
  };

  animationId = requestAnimationFrame(animate);

  return {
    container,
    cleanup: () => {
      isActive = false;
      if (animationId) cancelAnimationFrame(animationId);
      parent.removeChild(container);
    },
  };
}
