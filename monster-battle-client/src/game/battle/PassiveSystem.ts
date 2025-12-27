import type { BattleMonster, BattleLogEntry } from '../../types/battle';
import type {
  PassiveAbility,
  PassiveState,
  PassiveTrigger,
  PassiveEffect,
  PassiveCondition,
} from '../../types/passive';
import { getPassiveAbility } from '../../types/passive';

/**
 * Passive System
 *
 * Manages passive ability triggers, conditions, and effects during battle.
 */

export interface PassiveContext {
  actor: BattleMonster;
  target?: BattleMonster;
  attacker?: BattleMonster;
  allies: BattleMonster[];
  enemies: BattleMonster[];
  damage?: number;
  turn: number;
}

export interface PassiveResult {
  triggered: boolean;
  passiveId: string;
  passiveName: string;
  effects: AppliedEffect[];
  logEntry?: Partial<BattleLogEntry>;
}

export interface AppliedEffect {
  type: string;
  target: BattleMonster;
  value: number;
  stat?: string;
}

export class PassiveSystem {
  private passiveStates: Map<string, Map<string, PassiveState>> = new Map();

  /**
   * Initialize passive states for a monster
   */
  public initializeMonster(monster: BattleMonster, passiveIds: string[]): void {
    const states = new Map<string, PassiveState>();

    for (const passiveId of passiveIds) {
      const passive = getPassiveAbility(passiveId);
      if (passive) {
        states.set(passiveId, {
          passiveId,
          currentCooldown: 0,
          activationCount: 0,
          stackCount: 0,
          isActive: passive.trigger === 'always',
        });
      }
    }

    this.passiveStates.set(monster.id, states);
  }

  /**
   * Check and trigger passives for a specific trigger event
   */
  public triggerPassives(
    trigger: PassiveTrigger,
    context: PassiveContext
  ): PassiveResult[] {
    const results: PassiveResult[] = [];

    // Get actor's passives
    const actorStates = this.passiveStates.get(context.actor.id);
    if (!actorStates) return results;

    for (const [passiveId, state] of actorStates) {
      const passive = getPassiveAbility(passiveId);
      if (!passive || passive.trigger !== trigger) continue;

      // Check if passive can activate
      if (!this.canActivate(passive, state, context)) continue;

      // Execute passive effects
      const appliedEffects = this.executePassive(passive, context);

      if (appliedEffects.length > 0) {
        // Update state
        state.activationCount++;
        if (passive.cooldown) {
          state.currentCooldown = passive.cooldown;
        }

        results.push({
          triggered: true,
          passiveId: passive.id,
          passiveName: passive.name,
          effects: appliedEffects,
          logEntry: {
            actorId: context.actor.id,
            actorName: context.actor.name,
            action: `[Passive] ${passive.name} activated!`,
            effects: appliedEffects.map(e => `${e.type}: ${e.value}`),
          },
        });
      }
    }

    return results;
  }

  /**
   * Check if a passive can activate
   */
  private canActivate(
    passive: PassiveAbility,
    state: PassiveState,
    context: PassiveContext
  ): boolean {
    // Check cooldown
    if (state.currentCooldown > 0) return false;

    // Check max activations
    if (passive.maxActivations && state.activationCount >= passive.maxActivations) {
      return false;
    }

    // Check conditions
    if (passive.conditions) {
      for (const condition of passive.conditions) {
        if (!this.checkCondition(condition, context)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check a single condition
   */
  private checkCondition(condition: PassiveCondition, context: PassiveContext): boolean {
    switch (condition.type) {
      case 'hp_above':
        return (context.actor.currentHp / context.actor.maxHp) * 100 > condition.value;

      case 'hp_below':
        // For target-based conditions (like executioner), check target HP
        if (context.target) {
          return (context.target.currentHp / context.target.maxHp) * 100 < condition.value;
        }
        return (context.actor.currentHp / context.actor.maxHp) * 100 < condition.value;

      case 'buff_count':
        return context.actor.buffs.length >= condition.value;

      case 'debuff_count':
        return context.actor.debuffs.length >= condition.value;

      case 'ally_count':
        return context.allies.filter(a => a.isAlive && a.id !== context.actor.id).length >= condition.value;

      case 'enemy_count':
        return context.enemies.filter(e => e.isAlive).length >= condition.value;

      case 'element_match':
        return context.target?.element === condition.element;

      default:
        return true;
    }
  }

  /**
   * Execute passive effects
   */
  private executePassive(passive: PassiveAbility, context: PassiveContext): AppliedEffect[] {
    const appliedEffects: AppliedEffect[] = [];

    for (const effect of passive.effects) {
      // Check effect chance
      if (effect.chance && Math.random() * 100 > effect.chance) continue;

      const targets = this.resolveTargets(effect.target, context);

      for (const target of targets) {
        const applied = this.applyEffect(effect, target, context);
        if (applied) {
          appliedEffects.push(applied);
        }
      }
    }

    return appliedEffects;
  }

  /**
   * Resolve targets for an effect
   */
  private resolveTargets(
    targetType: string,
    context: PassiveContext
  ): BattleMonster[] {
    switch (targetType) {
      case 'self':
        return [context.actor];

      case 'attacker':
        return context.attacker ? [context.attacker] : [];

      case 'target':
        return context.target ? [context.target] : [];

      case 'allies':
        return context.allies.filter(a => a.isAlive);

      case 'allies_except_self':
        return context.allies.filter(a => a.isAlive && a.id !== context.actor.id);

      case 'enemies':
        return context.enemies.filter(e => e.isAlive);

      case 'random_ally':
        const aliveAllies = context.allies.filter(a => a.isAlive);
        return aliveAllies.length > 0
          ? [aliveAllies[Math.floor(Math.random() * aliveAllies.length)]]
          : [];

      case 'random_enemy':
        const aliveEnemies = context.enemies.filter(e => e.isAlive);
        return aliveEnemies.length > 0
          ? [aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)]]
          : [];

      case 'lowest_hp_ally':
        const sortedAllies = context.allies
          .filter(a => a.isAlive)
          .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
        return sortedAllies.length > 0 ? [sortedAllies[0]] : [];

      case 'lowest_hp_enemy':
        const sortedEnemies = context.enemies
          .filter(e => e.isAlive)
          .sort((a, b) => (a.currentHp / a.maxHp) - (b.currentHp / b.maxHp));
        return sortedEnemies.length > 0 ? [sortedEnemies[0]] : [];

      default:
        return [];
    }
  }

  /**
   * Apply a single effect to a target
   */
  private applyEffect(
    effect: PassiveEffect,
    target: BattleMonster,
    context: PassiveContext
  ): AppliedEffect | null {
    switch (effect.type) {
      case 'stat_boost': {
        const stat = effect.stat as keyof BattleMonster;
        if (typeof target[stat] === 'number') {
          const boost = Math.floor((target[stat] as number) * (effect.value / 100));
          (target[stat] as number) += boost;
          return { type: 'stat_boost', target, value: boost, stat: effect.stat };
        }
        return null;
      }

      case 'stat_reduction': {
        const stat = effect.stat as keyof BattleMonster;
        if (typeof target[stat] === 'number') {
          const reduction = Math.floor((target[stat] as number) * (effect.value / 100));
          (target[stat] as number) = Math.max(0, (target[stat] as number) - reduction);
          return { type: 'stat_reduction', target, value: reduction, stat: effect.stat };
        }
        return null;
      }

      case 'heal': {
        const healAmount = Math.floor(target.maxHp * (effect.value / 100));
        const actualHeal = Math.min(healAmount, target.maxHp - target.currentHp);
        target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
        return { type: 'heal', target, value: actualHeal };
      }

      case 'damage_reduction': {
        // This is stored as a modifier, applied during damage calculation
        // For now, we'll track it but the actual reduction happens in DamageCalculator
        return { type: 'damage_reduction', target, value: effect.value };
      }

      case 'damage_boost': {
        // Similar to damage_reduction, stored as modifier
        return { type: 'damage_boost', target, value: effect.value };
      }

      case 'lifesteal': {
        if (context.damage) {
          const healAmount = Math.floor(context.damage * (effect.value / 100));
          const actualHeal = Math.min(healAmount, context.actor.maxHp - context.actor.currentHp);
          context.actor.currentHp = Math.min(context.actor.maxHp, context.actor.currentHp + healAmount);
          return { type: 'lifesteal', target: context.actor, value: actualHeal };
        }
        return null;
      }

      case 'atb_boost': {
        const atbGain = effect.value;
        target.attackBar = Math.min(200, target.attackBar + atbGain);
        return { type: 'atb_boost', target, value: atbGain };
      }

      case 'atb_reduction': {
        const atbLoss = effect.value;
        target.attackBar = Math.max(0, target.attackBar - atbLoss);
        return { type: 'atb_reduction', target, value: atbLoss };
      }

      case 'reflect': {
        if (context.damage && context.attacker) {
          const reflectDamage = Math.floor(context.damage * (effect.value / 100));
          context.attacker.currentHp = Math.max(0, context.attacker.currentHp - reflectDamage);
          if (context.attacker.currentHp <= 0) {
            context.attacker.isAlive = false;
          }
          return { type: 'reflect', target: context.attacker, value: reflectDamage };
        }
        return null;
      }

      case 'shield': {
        // Add shield buff
        const shieldValue = Math.floor(target.maxHp * (effect.value / 100));
        target.buffs.push({
          id: `shield_${Date.now()}`,
          type: 'shield' as any,
          duration: effect.duration || 2,
          value: shieldValue,
          sourceId: context.actor.id,
          icon: 'shield.png',
        });
        return { type: 'shield', target, value: shieldValue };
      }

      case 'cleanse': {
        const cleansed = Math.min(effect.value, target.debuffs.length);
        target.debuffs = target.debuffs.slice(cleansed);
        return { type: 'cleanse', target, value: cleansed };
      }

      case 'apply_buff': {
        if (effect.buffId) {
          target.buffs.push({
            id: `${effect.buffId}_${Date.now()}`,
            type: effect.buffId as any,
            duration: effect.duration || 2,
            value: effect.value,
            sourceId: context.actor.id,
            icon: `${effect.buffId}.png`,
          });
          return { type: 'apply_buff', target, value: effect.duration || 2 };
        }
        return null;
      }

      case 'apply_debuff': {
        if (effect.buffId && target.resistance < Math.random() * 100) {
          target.debuffs.push({
            id: `${effect.buffId}_${Date.now()}`,
            type: effect.buffId as any,
            duration: effect.duration || 2,
            value: effect.value,
            sourceId: context.actor.id,
            icon: `${effect.buffId}.png`,
          });
          return { type: 'apply_debuff', target, value: effect.duration || 2 };
        }
        return null;
      }

      case 'revive': {
        if (!target.isAlive) {
          target.isAlive = true;
          target.currentHp = Math.floor(target.maxHp * (effect.value / 100));
          return { type: 'revive', target, value: target.currentHp };
        }
        return null;
      }

      default:
        return null;
    }
  }

  /**
   * Reduce cooldowns at turn end
   */
  public tickCooldowns(monsterId: string): void {
    const states = this.passiveStates.get(monsterId);
    if (!states) return;

    for (const state of states.values()) {
      if (state.currentCooldown > 0) {
        state.currentCooldown--;
      }
    }
  }

  /**
   * Get current passive state for a monster
   */
  public getPassiveState(monsterId: string, passiveId: string): PassiveState | undefined {
    return this.passiveStates.get(monsterId)?.get(passiveId);
  }

  /**
   * Get all passive states for a monster
   */
  public getAllPassiveStates(monsterId: string): Map<string, PassiveState> | undefined {
    return this.passiveStates.get(monsterId);
  }

  /**
   * Clear all passive states (for battle end)
   */
  public clear(): void {
    this.passiveStates.clear();
  }

  /**
   * Get stat modifiers from "always" passives
   */
  public getStatModifiers(
    monster: BattleMonster,
    stat: string,
    allies: BattleMonster[],
    enemies: BattleMonster[]
  ): number {
    let totalModifier = 0;

    const states = this.passiveStates.get(monster.id);
    if (!states) return totalModifier;

    for (const [passiveId] of states) {
      const passive = getPassiveAbility(passiveId);
      if (!passive || passive.trigger !== 'always') continue;

      for (const effect of passive.effects) {
        if (effect.type === 'stat_boost' && effect.stat === stat) {
          // Check if this passive applies to the monster
          const context: PassiveContext = {
            actor: monster,
            allies,
            enemies,
            turn: 0,
          };

          const targets = this.resolveTargets(effect.target, context);
          if (targets.some(t => t.id === monster.id)) {
            totalModifier += effect.value;
          }
        }
      }
    }

    return totalModifier;
  }
}
