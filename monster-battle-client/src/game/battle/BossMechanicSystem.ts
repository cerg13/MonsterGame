import type { BattleMonster } from '../../types/battle';
import type { BossMechanic } from '../../types/dungeon';

export interface BossMechanicContext {
  boss: BattleMonster;
  attacker?: BattleMonster;
  damage?: number;
  isCrit?: boolean;
  turnNumber: number;
  allAllies: BattleMonster[];
  allEnemies: BattleMonster[];
}

export interface BossMechanicResult {
  triggered: boolean;
  mechanicId: string;
  mechanicName: string;
  effects: BossMechanicEffect[];
}

export interface BossMechanicEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'aoe_damage';
  targetIds: string[];
  value?: number;
  effectId?: string;
  message: string;
}

export class BossMechanicSystem {
  private mechanics: Map<string, BossMechanic[]> = new Map();
  private turnCounters: Map<string, number> = new Map();
  private triggeredThresholds: Map<string, Set<number>> = new Map();

  /**
   * Register boss mechanics for a monster
   */
  public registerBoss(monsterId: string, mechanics: BossMechanic[]): void {
    this.mechanics.set(monsterId, mechanics);
    this.turnCounters.set(monsterId, 0);
    this.triggeredThresholds.set(monsterId, new Set());
  }

  /**
   * Clear all registered mechanics
   */
  public clear(): void {
    this.mechanics.clear();
    this.turnCounters.clear();
    this.triggeredThresholds.clear();
  }

  /**
   * Increment turn counter for a boss
   */
  public incrementTurn(monsterId: string): void {
    const current = this.turnCounters.get(monsterId) || 0;
    this.turnCounters.set(monsterId, current + 1);
  }

  /**
   * Check and trigger mechanics on hit
   */
  public checkOnHit(context: BossMechanicContext): BossMechanicResult[] {
    const results: BossMechanicResult[] = [];
    const mechanics = this.mechanics.get(context.boss.id);
    if (!mechanics) return results;

    for (const mechanic of mechanics) {
      if (mechanic.trigger === 'on_hit') {
        const result = this.executeMechanic(mechanic, context);
        if (result) results.push(result);
      }
    }

    return results;
  }

  /**
   * Check and trigger mechanics on critical hit
   */
  public checkOnCrit(context: BossMechanicContext): BossMechanicResult[] {
    const results: BossMechanicResult[] = [];
    if (!context.isCrit) return results;

    const mechanics = this.mechanics.get(context.boss.id);
    if (!mechanics) return results;

    for (const mechanic of mechanics) {
      if (mechanic.trigger === 'on_crit') {
        const result = this.executeMechanic(mechanic, context);
        if (result) results.push(result);
      }
    }

    return results;
  }

  /**
   * Check and trigger mechanics at HP thresholds
   */
  public checkHpThreshold(context: BossMechanicContext): BossMechanicResult[] {
    const results: BossMechanicResult[] = [];
    const mechanics = this.mechanics.get(context.boss.id);
    if (!mechanics) return results;

    const hpPercent = (context.boss.currentHp / context.boss.maxHp) * 100;
    const triggeredSet = this.triggeredThresholds.get(context.boss.id) || new Set();

    for (const mechanic of mechanics) {
      if (mechanic.trigger === 'hp_threshold' && mechanic.triggerValue) {
        // Trigger when HP drops below threshold for the first time
        if (hpPercent <= mechanic.triggerValue && !triggeredSet.has(mechanic.triggerValue)) {
          triggeredSet.add(mechanic.triggerValue);
          this.triggeredThresholds.set(context.boss.id, triggeredSet);
          const result = this.executeMechanic(mechanic, context);
          if (result) results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * Check and trigger mechanics on turn interval
   */
  public checkTurnInterval(context: BossMechanicContext): BossMechanicResult[] {
    const results: BossMechanicResult[] = [];
    const mechanics = this.mechanics.get(context.boss.id);
    if (!mechanics) return results;

    const turnCount = this.turnCounters.get(context.boss.id) || 0;

    for (const mechanic of mechanics) {
      if (mechanic.trigger === 'turn_interval' && mechanic.triggerValue) {
        if (turnCount > 0 && turnCount % mechanic.triggerValue === 0) {
          const result = this.executeMechanic(mechanic, context);
          if (result) results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * Check and trigger mechanics on debuff application
   */
  public checkOnDebuff(context: BossMechanicContext): BossMechanicResult[] {
    const results: BossMechanicResult[] = [];
    const mechanics = this.mechanics.get(context.boss.id);
    if (!mechanics) return results;

    for (const mechanic of mechanics) {
      if (mechanic.trigger === 'on_debuff') {
        const result = this.executeMechanic(mechanic, context);
        if (result) results.push(result);
      }
    }

    return results;
  }

  /**
   * Execute a specific mechanic and return its effects
   */
  private executeMechanic(
    mechanic: BossMechanic,
    context: BossMechanicContext
  ): BossMechanicResult | null {
    const effects: BossMechanicEffect[] = [];

    switch (mechanic.effect) {
      case 'counterattack': {
        // Boss counterattacks the attacker
        if (context.attacker && context.attacker.isAlive) {
          const counterDamage = Math.floor(context.boss.atk * ((mechanic.effectValue || 100) / 100));
          effects.push({
            type: 'damage',
            targetIds: [context.attacker.id],
            value: counterDamage,
            message: `${context.boss.name} counterattacks for ${counterDamage} damage!`,
          });
        }
        break;
      }

      case 'aoe_attack': {
        // Boss attacks all enemies
        const aoeDamage = Math.floor(context.boss.atk * ((mechanic.effectValue || 100) / 100));
        const targetIds = context.allEnemies.filter(m => m.isAlive).map(m => m.id);
        effects.push({
          type: 'aoe_damage',
          targetIds,
          value: aoeDamage,
          message: `${context.boss.name} uses ${mechanic.name} on all enemies!`,
        });
        break;
      }

      case 'enrage': {
        // Boss gains attack buff
        effects.push({
          type: 'buff',
          targetIds: [context.boss.id],
          effectId: 'enrage',
          value: mechanic.effectValue || 50,
          message: `${context.boss.name} enters ${mechanic.name}! ATK increased by ${mechanic.effectValue || 50}%!`,
        });
        break;
      }

      case 'heal': {
        // Boss heals itself
        const healAmount = Math.floor(context.boss.maxHp * ((mechanic.effectValue || 20) / 100));
        effects.push({
          type: 'heal',
          targetIds: [context.boss.id],
          value: healAmount,
          message: `${context.boss.name} heals for ${healAmount} HP!`,
        });
        break;
      }

      case 'immunity': {
        // Boss gains immunity to debuffs
        effects.push({
          type: 'buff',
          targetIds: [context.boss.id],
          effectId: 'immunity',
          message: `${context.boss.name} is immune to debuffs!`,
        });
        break;
      }

      case 'shield': {
        // Boss gains damage reduction
        effects.push({
          type: 'buff',
          targetIds: [context.boss.id],
          effectId: 'shield',
          value: mechanic.effectValue || 50,
          message: `${context.boss.name} raises a shield! Damage reduced by ${mechanic.effectValue || 50}%!`,
        });
        break;
      }

      case 'summon': {
        // Summon minions or capture monster (special case)
        effects.push({
          type: 'summon',
          targetIds: [],
          message: `${context.boss.name} uses ${mechanic.name}!`,
        });
        break;
      }
    }

    if (effects.length === 0) return null;

    return {
      triggered: true,
      mechanicId: mechanic.id,
      mechanicName: mechanic.name,
      effects,
    };
  }

  /**
   * Get current enrage buff value for a boss
   */
  public getEnrageBonus(monsterId: string): number {
    // This would check for active enrage buffs
    // For now, return 0 as actual buff management is in BattleEngine
    return 0;
  }

  /**
   * Get current shield reduction for a boss
   */
  public getShieldReduction(monsterId: string): number {
    // This would check for active shield buffs
    return 0;
  }

  /**
   * Check if boss has immunity
   */
  public hasImmunity(monsterId: string): boolean {
    // This would check for active immunity
    return false;
  }
}

// Singleton instance for the current battle
export const bossMechanicSystem = new BossMechanicSystem();
