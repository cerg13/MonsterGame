import type { BattleMonster, BattleAction, BattleSkill } from '../../types/battle';
import { getElementAdvantage } from '../../types/monster';

/**
 * AI Controller for Auto-Battle and Enemy AI
 *
 * Priority System:
 * 1. Self-preservation (heal if low HP)
 * 2. Save dying ally
 * 3. Kill low HP enemy
 * 4. Attack enemy with elemental disadvantage
 * 5. Use AoE if multiple enemies
 * 6. Default: Attack lowest HP enemy with best skill
 */
export class AIController {
  private readonly LOW_HP_THRESHOLD = 0.3;  // 30%
  private readonly CRITICAL_HP_THRESHOLD = 0.25; // 25%

  /**
   * Decide the best action for a monster
   */
  public decideAction(
    actor: BattleMonster,
    allies: BattleMonster[],
    enemies: BattleMonster[]
  ): BattleAction {
    const aliveAllies = allies.filter(a => a.isAlive);
    const aliveEnemies = enemies.filter(e => e.isAlive);

    // Priority 1: Self-preservation
    if (this.getHPPercent(actor) < this.LOW_HP_THRESHOLD) {
      const healSkill = this.findHealSkill(actor);
      if (healSkill && healSkill.isReady) {
        return this.createAction(actor, healSkill, [actor.id]);
      }
    }

    // Priority 2: Save dying ally
    const dyingAlly = aliveAllies.find(
      a => this.getHPPercent(a) < this.CRITICAL_HP_THRESHOLD && a.id !== actor.id
    );
    if (dyingAlly) {
      const healSkill = this.findHealSkill(actor);
      if (healSkill && healSkill.isReady) {
        return this.createAction(actor, healSkill, [dyingAlly.id]);
      }
    }

    // Priority 3: Kill low HP enemy
    const killableEnemy = this.findKillableEnemy(actor, aliveEnemies);
    if (killableEnemy) {
      const bestDamageSkill = this.getBestDamageSkill(actor, 'singleEnemy');
      if (bestDamageSkill) {
        return this.createAction(actor, bestDamageSkill, [killableEnemy.id]);
      }
    }

    // Priority 4: Attack enemy with elemental disadvantage
    const disadvantagedEnemy = aliveEnemies.find(
      e => getElementAdvantage(actor.element, e.element) === 'strong'
    );
    if (disadvantagedEnemy) {
      const bestSkill = this.getBestDamageSkill(actor, 'singleEnemy');
      if (bestSkill) {
        return this.createAction(actor, bestSkill, [disadvantagedEnemy.id]);
      }
    }

    // Priority 5: Use AoE if multiple enemies
    if (aliveEnemies.length >= 2) {
      const aoeSkill = this.getBestDamageSkill(actor, 'allEnemies');
      if (aoeSkill) {
        return this.createAction(actor, aoeSkill, aliveEnemies.map(e => e.id));
      }
    }

    // Priority 6: Apply buffs if available
    const buffSkill = this.findBuffSkill(actor);
    if (buffSkill && buffSkill.isReady && !this.hasImportantBuffs(actor)) {
      return this.createAction(actor, buffSkill, [actor.id]);
    }

    // Priority 7: Apply debuffs to enemy
    const debuffSkill = this.findDebuffSkill(actor);
    const targetForDebuff = this.getBestDebuffTarget(aliveEnemies);
    if (debuffSkill && debuffSkill.isReady && targetForDebuff) {
      return this.createAction(actor, debuffSkill, [targetForDebuff.id]);
    }

    // Default: Attack lowest HP enemy with best available skill
    const bestSkill = this.getBestAvailableSkill(actor);
    const lowestHPEnemy = this.getLowestHPEnemy(aliveEnemies);

    return this.createAction(
      actor,
      bestSkill,
      bestSkill.template.targetType === 'allEnemies'
        ? aliveEnemies.map(e => e.id)
        : [lowestHPEnemy.id]
    );
  }

  /**
   * Get HP percentage
   */
  private getHPPercent(monster: BattleMonster): number {
    return monster.currentHp / monster.maxHp;
  }

  /**
   * Find a healing skill
   */
  private findHealSkill(monster: BattleMonster): BattleSkill | undefined {
    return monster.skills.find(
      s => s.isReady && s.template.effects.some(e => e.type === 'heal')
    );
  }

  /**
   * Find a buff skill
   */
  private findBuffSkill(monster: BattleMonster): BattleSkill | undefined {
    return monster.skills.find(
      s => s.isReady && s.template.effects.some(e => e.type === 'buff')
    );
  }

  /**
   * Find a debuff skill
   */
  private findDebuffSkill(monster: BattleMonster): BattleSkill | undefined {
    return monster.skills.find(
      s => s.isReady && s.template.effects.some(e => e.type === 'debuff')
    );
  }

  /**
   * Check if monster has important buffs active
   */
  private hasImportantBuffs(monster: BattleMonster): boolean {
    return monster.buffs.some(
      b => b.type === 'atkUp' || b.type === 'defUp' || b.type === 'spdUp'
    );
  }

  /**
   * Find an enemy that can be killed with one attack
   */
  private findKillableEnemy(
    actor: BattleMonster,
    enemies: BattleMonster[]
  ): BattleMonster | undefined {
    // Simplified estimation: can kill if enemy HP < actor ATK * 2
    const estimatedDamage = actor.atk * 2;
    return enemies.find(e => e.currentHp <= estimatedDamage);
  }

  /**
   * Get the best damage skill for a target type
   */
  private getBestDamageSkill(
    monster: BattleMonster,
    targetType: 'singleEnemy' | 'allEnemies'
  ): BattleSkill | undefined {
    const damageSkills = monster.skills.filter(
      s => s.isReady &&
           s.template.targetType === targetType &&
           s.template.effects.some(e => e.type === 'damage')
    );

    if (damageSkills.length === 0) return undefined;

    // Return skill with highest multiplier
    return damageSkills.sort(
      (a, b) => b.template.multiplier - a.template.multiplier
    )[0];
  }

  /**
   * Get the best available skill (any ready skill with highest priority)
   */
  private getBestAvailableSkill(monster: BattleMonster): BattleSkill {
    const readySkills = monster.skills.filter(s => s.isReady);

    if (readySkills.length === 0) {
      // Return basic attack (first skill)
      return monster.skills[0];
    }

    // Prioritize by multiplier
    return readySkills.sort(
      (a, b) => b.template.multiplier - a.template.multiplier
    )[0];
  }

  /**
   * Get the enemy with the lowest HP percentage
   */
  private getLowestHPEnemy(enemies: BattleMonster[]): BattleMonster {
    return enemies.sort(
      (a, b) => this.getHPPercent(a) - this.getHPPercent(b)
    )[0];
  }

  /**
   * Get the best target for debuffs (highest threat)
   */
  private getBestDebuffTarget(enemies: BattleMonster[]): BattleMonster | undefined {
    // Target the enemy with highest ATK
    return enemies.sort((a, b) => b.atk - a.atk)[0];
  }

  /**
   * Create a battle action
   */
  private createAction(
    actor: BattleMonster,
    skill: BattleSkill,
    targetIds: string[]
  ): BattleAction {
    return {
      actorId: actor.id,
      skillId: skill.skillId,
      targetIds,
      timestamp: Date.now(),
    };
  }
}
