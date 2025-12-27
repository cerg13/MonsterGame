import type { BattleMonster, BattleSkill, DamageResult } from '../../types/battle';
import type { Element } from '../../types/monster';
import { getElementAdvantage } from '../../types/monster';

/**
 * Damage Calculator
 *
 * Damage Formula:
 * 1. Raw Damage = ScalingStat × Multiplier × (1 + SkillUpBonus)
 * 2. Defense Reduction = 1000 / (1140 + 3.5 × Defense)
 * 3. Final Damage = Raw × DefReduction × CritModifier × ElementModifier × BuffModifiers
 *
 * Defense provides asymptotic reduction:
 * - DEF 0: ~12.3% reduction
 * - DEF 500: ~37.5% reduction
 * - DEF 1000: ~52.5% reduction
 * - DEF 2000: ~67.1% reduction
 */
export class DamageCalculator {
  /**
   * Calculate damage for a skill
   */
  public calculate(
    attacker: BattleMonster,
    defender: BattleMonster,
    skill: BattleSkill
  ): DamageResult {
    const template = skill.template;

    // Phase 1: Get scaling stat value
    const scalingStat = this.getScalingStat(attacker, template.scalingStat);

    // Phase 2: Calculate raw damage
    let rawDamage = scalingStat * template.multiplier;

    // Apply skill-up bonus
    const skillUpBonus = this.calculateSkillUpBonus(skill);
    rawDamage *= (1 + skillUpBonus);

    // Phase 3: Apply defense reduction
    const defReduction = this.calculateDefenseReduction(defender.def);
    let damage = rawDamage * defReduction;

    // Phase 4: Check for critical hit
    const { isCrit, critModifier } = this.rollCritical(attacker, defender);
    if (isCrit) {
      damage *= critModifier;
    }

    // Phase 5: Apply elemental modifier
    const elementResult = this.applyElementalModifier(
      attacker.element,
      defender.element
    );
    damage *= elementResult.multiplier;

    // Phase 6: Apply buffs/debuffs
    damage = this.applyBuffModifiers(damage, attacker, defender);

    // Minimum damage = 1% of raw
    damage = Math.max(damage, rawDamage * 0.01);

    return {
      damage: Math.floor(damage),
      isCrit,
      isGlancing: elementResult.isGlancing,
      isCrushing: elementResult.isCrushing,
    };
  }

  /**
   * Get the stat value used for scaling
   */
  private getScalingStat(monster: BattleMonster, scalingStat: string): number {
    switch (scalingStat) {
      case 'atk': return monster.atk;
      case 'def': return monster.def;
      case 'hp': return monster.maxHp;
      case 'spd': return monster.spd;
      default: return monster.atk;
    }
  }

  /**
   * Calculate skill-up damage bonus
   * Each skill level adds damage based on skillUpBonuses defined in template
   */
  private calculateSkillUpBonus(skill: BattleSkill): number {
    const skillLevel = skill.skillLevel || 1;

    // No bonus at level 1
    if (skillLevel <= 1) return 0;

    // Sum up bonuses from level 2 to current level
    const bonuses = skill.template.skillUpBonuses || [];
    let totalBonus = 0;

    for (let i = 0; i < Math.min(skillLevel - 1, bonuses.length); i++) {
      const bonus = bonuses[i];
      if (bonus.type === 'damage') {
        totalBonus += bonus.value;
      }
    }

    return totalBonus;
  }

  /**
   * Calculate defense reduction factor
   * Formula: 1000 / (1140 + 3.5 × Defense)
   */
  private calculateDefenseReduction(defense: number): number {
    return 1000 / (1140 + 3.5 * defense);
  }

  /**
   * Roll for critical hit
   */
  private rollCritical(
    attacker: BattleMonster,
    defender: BattleMonster
  ): { isCrit: boolean; critModifier: number } {
    // Get base crit rate, apply modifiers from element advantage
    let effectiveCritRate = attacker.critRate;

    // Check element advantage for crit rate modifier
    const advantage = getElementAdvantage(attacker.element, defender.element);
    if (advantage === 'strong') {
      effectiveCritRate += 15;
    } else if (advantage === 'weak') {
      effectiveCritRate -= 15;
    }

    effectiveCritRate = Math.max(0, Math.min(100, effectiveCritRate));

    const roll = Math.random() * 100;
    const isCrit = roll < effectiveCritRate;

    // Crit damage = 1 + (critDamage / 100)
    const critModifier = isCrit ? 1 + attacker.critDamage / 100 : 1;

    return { isCrit, critModifier };
  }

  /**
   * Apply elemental modifier
   */
  private applyElementalModifier(
    attackerElement: Element,
    defenderElement: Element
  ): { multiplier: number; isGlancing: boolean; isCrushing: boolean } {
    const advantage = getElementAdvantage(attackerElement, defenderElement);

    if (advantage === 'strong') {
      // Chance for Crushing Hit (+30% damage)
      const isCrushing = Math.random() < 0.15;
      return {
        multiplier: isCrushing ? 1.3 : 1.0,
        isGlancing: false,
        isCrushing,
      };
    }

    if (advantage === 'weak') {
      // 50% chance for Glancing Hit (-30% damage)
      const isGlancing = Math.random() < 0.5;
      return {
        multiplier: isGlancing ? 0.7 : 1.0,
        isGlancing,
        isCrushing: false,
      };
    }

    return {
      multiplier: 1.0,
      isGlancing: false,
      isCrushing: false,
    };
  }

  /**
   * Apply buff/debuff modifiers
   */
  private applyBuffModifiers(
    damage: number,
    attacker: BattleMonster,
    defender: BattleMonster
  ): number {
    let modifiedDamage = damage;

    // Attacker buffs
    const hasAtkUp = attacker.buffs.some(b => b.type === 'atkUp');
    const hasAtkDown = attacker.debuffs.some(d => d.type === 'atkDown');

    if (hasAtkUp) modifiedDamage *= 1.5;  // +50% ATK
    if (hasAtkDown) modifiedDamage *= 0.5; // -50% ATK

    // Defender debuffs
    const hasDefDown = defender.debuffs.some(d => d.type === 'defDown');
    const hasDefUp = defender.buffs.some(b => b.type === 'defUp');

    if (hasDefDown) modifiedDamage *= 1.7;  // DEF Break = +70% damage taken
    if (hasDefUp) modifiedDamage *= 0.3;    // DEF Up = -70% damage taken

    // Invincibility check
    const hasInvincibility = defender.buffs.some(b => b.type === 'invincibility');
    if (hasInvincibility) modifiedDamage = 0;

    return modifiedDamage;
  }

  /**
   * Calculate healing amount
   */
  public calculateHealing(
    healer: BattleMonster,
    target: BattleMonster,
    skill: BattleSkill
  ): number {
    const template = skill.template;
    const scalingStat = this.getScalingStat(healer, template.scalingStat);
    let healing = scalingStat * template.multiplier;

    // Check for skill effect value (often heals are % of max HP)
    const healEffect = template.effects.find(e => e.type === 'heal');
    if (healEffect && healEffect.value) {
      healing = target.maxHp * (healEffect.value / 100);
    }

    return Math.floor(healing);
  }
}
