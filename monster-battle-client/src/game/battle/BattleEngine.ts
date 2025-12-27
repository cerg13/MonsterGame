import type {
  BattleState,
  BattlePhase,
  BattleMonster,
  BattleAction,
  BattleLogEntry,
  BattleConfig,
  BattleResult,
  BattleSkill,
  BattleReward,
} from '../../types/battle';
import { ATB_TICK_PERCENTAGE, ATB_FULL } from '../../types/battle';
import { ATBSystem } from './ATBSystem';
import { DamageCalculator } from './DamageCalculator';
import { AIController } from './AIController';
import { PassiveSystem } from './PassiveSystem';
import type { PassiveContext, PassiveResult } from './PassiveSystem';
import type { PassiveTrigger } from '../../types/passive';
import { BossMechanicSystem } from './BossMechanicSystem';
import type { BossMechanic } from '../../types/dungeon';

type StateHandler = {
  onEnter: () => void;
  onUpdate?: () => void;
  getNextPhase: () => BattlePhase;
};

export class BattleEngine {
  private state: BattleState;
  private atbSystem: ATBSystem;
  private damageCalculator: DamageCalculator;
  private aiController: AIController;
  private passiveSystem: PassiveSystem;
  private bossMechanicSystem: BossMechanicSystem;
  private stateHandlers: Map<BattlePhase, StateHandler>;
  private onStateChange?: (state: BattleState) => void;
  private totalDamageDealt: number = 0;
  private totalDamageTaken: number = 0;
  private battleStartTime: number = 0;

  constructor(config: BattleConfig, onStateChange?: (state: BattleState) => void) {
    this.atbSystem = new ATBSystem(ATB_TICK_PERCENTAGE);
    this.damageCalculator = new DamageCalculator();
    this.aiController = new AIController();
    this.passiveSystem = new PassiveSystem();
    this.bossMechanicSystem = new BossMechanicSystem();
    this.onStateChange = onStateChange;

    this.state = this.initializeState(config);
    this.stateHandlers = this.createStateHandlers();
  }

  private initializeState(config: BattleConfig): BattleState {
    return {
      id: crypto.randomUUID(),
      phase: 'initialization',
      turn: 0,
      tick: 0,
      playerTeam: [], // Will be populated
      enemyTeam: config.enemyTeam || [],
      activeMonster: null,
      actionQueue: [],
      battleLog: [],
      isAutoMode: false,
      winner: null,
    };
  }

  private createStateHandlers(): Map<BattlePhase, StateHandler> {
    const handlers = new Map<BattlePhase, StateHandler>();

    handlers.set('initialization', {
      onEnter: () => this.handleInitialization(),
      getNextPhase: () => 'tick',
    });

    handlers.set('tick', {
      onEnter: () => this.handleTick(),
      getNextPhase: () => this.hasMonsterReady() ? 'turn_start' : 'tick',
    });

    handlers.set('turn_start', {
      onEnter: () => this.handleTurnStart(),
      getNextPhase: () => 'action_selection',
    });

    handlers.set('action_selection', {
      onEnter: () => this.handleActionSelection(),
      getNextPhase: () => 'action_execution',
    });

    handlers.set('action_execution', {
      onEnter: () => this.handleActionExecution(),
      getNextPhase: () => 'effect_resolution',
    });

    handlers.set('effect_resolution', {
      onEnter: () => this.handleEffectResolution(),
      getNextPhase: () => 'turn_end',
    });

    handlers.set('turn_end', {
      onEnter: () => this.handleTurnEnd(),
      getNextPhase: () => 'victory_check',
    });

    handlers.set('victory_check', {
      onEnter: () => this.handleVictoryCheck(),
      getNextPhase: () => this.state.winner ? 'battle_end' : 'tick',
    });

    handlers.set('battle_end', {
      onEnter: () => this.handleBattleEnd(),
      getNextPhase: () => 'battle_end',
    });

    return handlers;
  }

  // Public API
  public getState(): BattleState {
    return { ...this.state };
  }

  public setPlayerTeam(team: BattleMonster[]): void {
    this.state.playerTeam = team.map(m => ({
      ...m,
      team: 'player' as const,
      attackBar: 0,
      isAlive: true,
      canAct: true,
    }));
  }

  public setEnemyTeam(team: BattleMonster[]): void {
    this.state.enemyTeam = team.map(m => ({
      ...m,
      team: 'enemy' as const,
      attackBar: 0,
      isAlive: true,
      canAct: true,
    }));
  }

  /**
   * Register boss mechanics for a specific monster
   */
  public registerBossMechanics(monsterId: string, mechanics: BossMechanic[]): void {
    this.bossMechanicSystem.registerBoss(monsterId, mechanics);
  }

  /**
   * Get battle statistics for dungeon rewards
   */
  public getBattleStats(): { damageDealt: number; damageTaken: number; timeElapsed: number } {
    return {
      damageDealt: this.totalDamageDealt,
      damageTaken: this.totalDamageTaken,
      timeElapsed: Date.now() - this.battleStartTime,
    };
  }

  public start(): void {
    this.battleStartTime = Date.now();
    this.totalDamageDealt = 0;
    this.totalDamageTaken = 0;
    this.transitionTo('initialization');
  }

  public submitAction(action: BattleAction): void {
    if (this.state.phase !== 'action_selection') {
      console.warn('Cannot submit action outside of action_selection phase');
      return;
    }

    this.state.actionQueue.push(action);
    this.transitionTo('action_execution');
  }

  public toggleAutoMode(): void {
    this.state.isAutoMode = !this.state.isAutoMode;
    this.notifyStateChange();

    // If auto mode was just enabled and we're waiting for action, let AI decide
    if (this.state.isAutoMode && this.state.phase === 'action_selection') {
      const activeMonster = this.getActiveMonster();
      if (activeMonster && activeMonster.team === 'player') {
        const action = this.aiController.decideAction(
          activeMonster,
          this.getTeamOf(activeMonster.team),
          this.getOpposingTeam(activeMonster.team)
        );
        this.state.actionQueue.push(action);
        this.transitionTo('action_execution');
      }
    }
  }

  public processTick(): void {
    if (this.state.phase === 'tick') {
      this.transitionTo('tick');
    }
  }

  // State handlers
  private handleInitialization(): void {
    // Reset ATB for all monsters
    const allMonsters = this.getAllMonsters();
    allMonsters.forEach(m => {
      m.attackBar = 0;
      m.isAlive = m.currentHp > 0;
      m.canAct = true;
    });

    this.state.turn = 0;
    this.state.tick = 0;
    this.state.winner = null;
    this.state.battleLog = [];

    // Initialize passive system for all monsters
    this.passiveSystem.clear();
    for (const monster of allMonsters) {
      const passiveIds = this.getMonsterPassiveIds(monster);
      if (passiveIds.length > 0) {
        this.passiveSystem.initializeMonster(monster, passiveIds);
      }
    }

    this.addLogEntry({
      turn: 0,
      tick: 0,
      actorId: '',
      actorName: 'System',
      action: 'Battle started!',
      targets: [],
    });

    // Trigger battle_start passives for all monsters
    for (const monster of allMonsters) {
      if (monster.isAlive) {
        this.triggerPassivesFor(monster, 'battle_start');
      }
    }
  }

  private handleTick(): void {
    this.state.tick++;

    // Increase ATB for all alive monsters
    const allMonsters = this.getAllMonsters();
    allMonsters.forEach(m => {
      if (m.isAlive) {
        m.attackBar = this.atbSystem.increaseATB(m.attackBar, m.spd);
      }
    });
  }

  private hasMonsterReady(): boolean {
    return this.getAllMonsters().some(m => m.isAlive && m.attackBar >= ATB_FULL);
  }

  private handleTurnStart(): void {
    this.state.turn++;

    // Find monster with highest ATB >= 100
    const activeMonster = this.getNextActiveMonster();
    if (!activeMonster) {
      console.error('No active monster found despite passing hasMonsterReady');
      return;
    }

    this.state.activeMonster = activeMonster.id;

    // Process start-of-turn effects
    this.processStartOfTurnEffects(activeMonster);

    // Trigger turn_start passives for the active monster
    this.triggerPassivesFor(activeMonster, 'turn_start');

    // Check if monster can act (not stunned, frozen, etc.)
    if (!activeMonster.canAct) {
      // Skip turn
      this.addLogEntry({
        turn: this.state.turn,
        tick: this.state.tick,
        actorId: activeMonster.id,
        actorName: activeMonster.name,
        action: 'is unable to act!',
        targets: [],
      });
      this.atbSystem.resetATB(activeMonster);
      this.transitionTo('turn_end');
      return;
    }
  }

  private handleActionSelection(): void {
    const activeMonster = this.getActiveMonster();
    if (!activeMonster) return;

    // If auto mode or AI-controlled enemy, let AI decide
    if (this.state.isAutoMode || activeMonster.team === 'enemy') {
      const action = this.aiController.decideAction(
        activeMonster,
        this.getTeamOf(activeMonster.team),
        this.getOpposingTeam(activeMonster.team)
      );
      this.state.actionQueue.push(action);
      this.transitionTo('action_execution');
    }
    // Otherwise wait for player input via submitAction()
  }

  private handleActionExecution(): void {
    const action = this.state.actionQueue.shift();
    if (!action) return;

    const actor = this.findMonster(action.actorId);
    if (!actor || !actor.isAlive) return;

    const skill = actor.skills.find(s => s.skillId === action.skillId);
    if (!skill) return;

    // Determine targets based on skill target type
    let targets = this.resolveTargets(action, skill, actor);
    if (targets.length === 0) return;

    // Process each effect of the skill
    const effects = skill.template.effects;
    let totalDamage = 0;
    let totalHealing = 0;
    let appliedEffects: string[] = [];
    let isCrit = false;
    let isGlancing = false;
    let isCrushing = false;

    for (const target of targets) {
      for (const effect of effects) {
        // Check if effect applies (based on chance)
        const effectChance = effect.chance || 100;
        if (Math.random() * 100 > effectChance) continue;

        switch (effect.type) {
          case 'damage': {
            const result = this.damageCalculator.calculate(actor, target, skill);
            target.currentHp = Math.max(0, target.currentHp - result.damage);
            totalDamage += result.damage;
            isCrit = isCrit || result.isCrit;
            isGlancing = isGlancing || result.isGlancing;
            isCrushing = isCrushing || result.isCrushing;

            // Track damage statistics
            if (actor.team === 'player') {
              this.totalDamageDealt += result.damage;
            } else {
              this.totalDamageTaken += result.damage;
            }

            // Trigger boss mechanics
            this.processBossMechanicsOnDamage(actor, target, result.damage, result.isCrit);

            if (target.currentHp <= 0) {
              target.isAlive = false;
            }
            break;
          }

          case 'heal': {
            // Heal value is percentage of max HP
            const healPercent = effect.value || 0;
            const healAmount = Math.floor(target.maxHp * (healPercent / 100));
            const actualHeal = Math.min(healAmount, target.maxHp - target.currentHp);
            target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
            totalHealing += actualHeal;
            appliedEffects.push(`healed ${actualHeal}`);
            break;
          }

          case 'buff': {
            const effectId = effect.effectId as string;
            const duration = effect.duration || 2;

            // Check if buff already exists
            const existingBuff = target.buffs.find(b => b.type === effectId);
            if (existingBuff) {
              // Refresh duration
              existingBuff.duration = Math.max(existingBuff.duration, duration);
            } else {
              // Add new buff
              target.buffs.push({
                id: `${effectId}_${Date.now()}`,
                type: effectId as any,
                duration,
                value: this.getEffectValue(effectId),
                sourceId: actor.id,
                icon: `${effectId}.png`,
              });
            }
            appliedEffects.push(this.formatEffectName(effectId));
            break;
          }

          case 'debuff': {
            const effectId = effect.effectId as string;
            const duration = effect.duration || 2;

            // Check resistance
            const resistChance = target.resistance || 0;
            if (Math.random() * 100 < resistChance) {
              appliedEffects.push(`${target.name} resisted ${this.formatEffectName(effectId)}`);
              continue;
            }

            // Check if debuff already exists
            const existingDebuff = target.debuffs.find(d => d.type === effectId);
            if (existingDebuff) {
              // Refresh duration
              existingDebuff.duration = Math.max(existingDebuff.duration, duration);
            } else {
              // Add new debuff
              target.debuffs.push({
                id: `${effectId}_${Date.now()}`,
                type: effectId as any,
                duration,
                value: this.getEffectValue(effectId),
                sourceId: actor.id,
                icon: `${effectId}.png`,
              });
            }
            appliedEffects.push(this.formatEffectName(effectId));
            break;
          }

          case 'atkBar': {
            // ATB manipulation
            const barChange = effect.value || 0;
            target.attackBar = Math.max(0, Math.min(100, target.attackBar + barChange));
            appliedEffects.push(barChange > 0 ? 'ATB boost' : 'ATB reduction');
            break;
          }
        }
      }

      // Log death separately
      if (!target.isAlive) {
        this.addLogEntry({
          turn: this.state.turn,
          tick: this.state.tick,
          actorId: target.id,
          actorName: target.name,
          action: 'has been defeated!',
          targets: [],
        });
      }
    }

    // Log the action
    this.addLogEntry({
      turn: this.state.turn,
      tick: this.state.tick,
      actorId: actor.id,
      actorName: actor.name,
      action: `uses ${skill.name}`,
      targets: targets.map(t => t.name),
      damage: totalDamage > 0 ? totalDamage : undefined,
      healing: totalHealing > 0 ? totalHealing : undefined,
      effects: appliedEffects.length > 0 ? appliedEffects : undefined,
      isCrit,
      isGlancing,
      isCrushing,
    });

    // Put skill on cooldown
    skill.currentCooldown = skill.maxCooldown;
    skill.isReady = false;
  }

  /**
   * Resolve targets based on skill target type
   */
  private resolveTargets(
    action: BattleAction,
    skill: BattleSkill,
    actor: BattleMonster
  ): BattleMonster[] {
    const targetType = skill.template.targetType;

    switch (targetType) {
      case 'singleEnemy':
      case 'singleAlly':
        // Use the target from action
        return action.targetIds
          .map(id => this.findMonster(id))
          .filter((m): m is BattleMonster => m !== undefined && m.isAlive);

      case 'allEnemies':
        return this.getOpposingTeam(actor.team).filter(m => m.isAlive);

      case 'allAllies':
        return this.getTeamOf(actor.team).filter(m => m.isAlive);

      case 'self':
        return [actor];

      default:
        return action.targetIds
          .map(id => this.findMonster(id))
          .filter((m): m is BattleMonster => m !== undefined && m.isAlive);
    }
  }

  /**
   * Get the value for a buff/debuff effect
   */
  private getEffectValue(effectId: string): number {
    const effectValues: Record<string, number> = {
      atkUp: 50,      // +50% ATK
      atkDown: -50,   // -50% ATK
      defUp: 70,      // +70% DEF
      defDown: -70,   // -70% DEF
      spdUp: 30,      // +30% SPD
      spdDown: -30,   // -30% SPD
      critRateUp: 30, // +30% crit rate
      critRateDown: -30,
      continuousDamage: 5, // 5% max HP per turn
      stun: 0,
      freeze: 0,
      sleep: 0,
      immunity: 0,
      invincibility: 0,
    };
    return effectValues[effectId] || 0;
  }

  /**
   * Format effect name for display
   */
  private formatEffectName(effectId: string): string {
    const names: Record<string, string> = {
      atkUp: 'ATK Up',
      atkDown: 'ATK Down',
      defUp: 'DEF Up',
      defDown: 'DEF Down',
      spdUp: 'SPD Up',
      spdDown: 'SPD Down',
      critRateUp: 'Crit Rate Up',
      critRateDown: 'Crit Rate Down',
      continuousDamage: 'Continuous Damage',
      stun: 'Stun',
      freeze: 'Freeze',
      sleep: 'Sleep',
      immunity: 'Immunity',
      invincibility: 'Invincibility',
    };
    return names[effectId] || effectId;
  }

  private handleEffectResolution(): void {
    // Apply any triggered effects (buffs, debuffs, etc.)
    // This is simplified - full implementation would handle complex effect chains
    const allMonsters = this.getAllMonsters();

    for (const monster of allMonsters) {
      if (!monster.isAlive) continue;

      // Process continuous damage
      const continuousDamage = monster.debuffs.filter(d => d.type === 'continuousDamage');
      for (const _dot of continuousDamage) {
        const damage = Math.floor(monster.maxHp * 0.05); // 5% max HP per tick
        monster.currentHp = Math.max(0, monster.currentHp - damage);

        if (monster.currentHp <= 0) {
          monster.isAlive = false;
          this.addLogEntry({
            turn: this.state.turn,
            tick: this.state.tick,
            actorId: monster.id,
            actorName: monster.name,
            action: 'died from continuous damage!',
            targets: [],
          });
        }
      }
    }
  }

  private handleTurnEnd(): void {
    const activeMonster = this.getActiveMonster();
    if (activeMonster) {
      // Trigger turn_end passives for the active monster
      this.triggerPassivesFor(activeMonster, 'turn_end');

      // Trigger enemy_turn_end passives for opposing team
      const opposingTeam = this.getOpposingTeam(activeMonster.team);
      for (const monster of opposingTeam) {
        if (monster.isAlive) {
          this.triggerPassivesFor(monster, 'enemy_turn_end');
        }
      }

      // Process boss turn mechanics if this is an enemy (potential boss)
      if (activeMonster.team === 'enemy') {
        this.processBossTurnMechanics(activeMonster);
      }

      // Tick passive cooldowns
      this.passiveSystem.tickCooldowns(activeMonster.id);

      // Reset ATB
      this.atbSystem.resetATB(activeMonster);

      // Reduce cooldowns
      for (const skill of activeMonster.skills) {
        if (skill.currentCooldown > 0) {
          skill.currentCooldown--;
          if (skill.currentCooldown === 0) {
            skill.isReady = true;
          }
        }
      }

      // Reduce buff/debuff durations
      this.tickEffectDurations(activeMonster);
    }

    this.state.activeMonster = null;
  }

  private handleVictoryCheck(): void {
    const playerAlive = this.state.playerTeam.some(m => m.isAlive);
    const enemyAlive = this.state.enemyTeam.some(m => m.isAlive);

    if (!playerAlive) {
      this.state.winner = 'enemy';
    } else if (!enemyAlive) {
      this.state.winner = 'player';
    }
  }

  private handleBattleEnd(): void {
    const winnerText = this.state.winner === 'player' ? 'Victory!' : 'Defeat!';
    this.addLogEntry({
      turn: this.state.turn,
      tick: this.state.tick,
      actorId: '',
      actorName: 'System',
      action: winnerText,
      targets: [],
    });
  }

  // Helper methods
  private transitionTo(phase: BattlePhase): void {
    this.state.phase = phase;
    const handler = this.stateHandlers.get(phase);
    if (handler) {
      handler.onEnter();
      this.notifyStateChange();

      // Auto-advance for non-waiting phases
      if (phase !== 'action_selection' && phase !== 'battle_end') {
        const nextPhase = handler.getNextPhase();
        if (nextPhase !== phase) {
          // Use setTimeout to allow UI updates
          setTimeout(() => this.transitionTo(nextPhase), 100);
        }
      }
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  private getAllMonsters(): BattleMonster[] {
    return [...this.state.playerTeam, ...this.state.enemyTeam];
  }

  private getNextActiveMonster(): BattleMonster | undefined {
    return this.getAllMonsters()
      .filter(m => m.isAlive && m.attackBar >= ATB_FULL)
      .sort((a, b) => b.attackBar - a.attackBar)[0];
  }

  private getActiveMonster(): BattleMonster | undefined {
    if (!this.state.activeMonster) return undefined;
    return this.findMonster(this.state.activeMonster);
  }

  private findMonster(id: string): BattleMonster | undefined {
    return this.getAllMonsters().find(m => m.id === id);
  }

  private getTeamOf(team: 'player' | 'enemy'): BattleMonster[] {
    return team === 'player' ? this.state.playerTeam : this.state.enemyTeam;
  }

  private getOpposingTeam(team: 'player' | 'enemy'): BattleMonster[] {
    return team === 'player' ? this.state.enemyTeam : this.state.playerTeam;
  }

  private processStartOfTurnEffects(monster: BattleMonster): void {
    // Check for stun, freeze, sleep
    const disablingEffects = monster.debuffs.filter(
      d => d.type === 'stun' || d.type === 'freeze' || d.type === 'sleep'
    );

    if (disablingEffects.length > 0) {
      monster.canAct = false;
    } else {
      monster.canAct = true;
    }
  }

  private tickEffectDurations(monster: BattleMonster): void {
    // Reduce buff durations
    monster.buffs = monster.buffs.filter(b => {
      b.duration--;
      return b.duration > 0;
    });

    // Reduce debuff durations
    monster.debuffs = monster.debuffs.filter(d => {
      d.duration--;
      return d.duration > 0;
    });
  }

  private addLogEntry(entry: BattleLogEntry): void {
    this.state.battleLog.push(entry);
  }

  /**
   * Get passive ability IDs for a monster
   */
  private getMonsterPassiveIds(monster: BattleMonster): string[] {
    const passiveIds: string[] = [];

    // Get passives from monster's template data if available
    if (monster.passiveIds) {
      passiveIds.push(...monster.passiveIds);
    }

    return passiveIds;
  }

  /**
   * Trigger passives for a monster with the given trigger event
   */
  private triggerPassivesFor(
    monster: BattleMonster,
    trigger: PassiveTrigger,
    extraContext?: Partial<PassiveContext>
  ): PassiveResult[] {
    const context: PassiveContext = {
      actor: monster,
      allies: this.getTeamOf(monster.team),
      enemies: this.getOpposingTeam(monster.team),
      turn: this.state.turn,
      ...extraContext,
    };

    const results = this.passiveSystem.triggerPassives(trigger, context);

    // Log passive activations
    for (const result of results) {
      if (result.triggered && result.logEntry) {
        this.addLogEntry({
          turn: this.state.turn,
          tick: this.state.tick,
          actorId: result.logEntry.actorId || monster.id,
          actorName: result.logEntry.actorName || monster.name,
          action: result.logEntry.action || `[Passive] ${result.passiveName} activated!`,
          targets: [],
          effects: result.logEntry.effects,
        });
      }
    }

    return results;
  }

  /**
   * Trigger on_attack passives during action execution
   */
  private triggerOnAttackPassives(
    attacker: BattleMonster,
    target: BattleMonster,
    damage: number,
    isCrit: boolean
  ): void {
    // Trigger on_attack passive for attacker
    this.triggerPassivesFor(attacker, 'on_attack', {
      target,
      damage,
    });

    // Trigger on_crit passive if critical hit
    if (isCrit) {
      this.triggerPassivesFor(attacker, 'on_crit', {
        target,
        damage,
      });
    }

    // Trigger on_hit passive for the target
    this.triggerPassivesFor(target, 'on_hit', {
      attacker,
      damage,
    });

    // Trigger ally_attacked passives for the target's allies
    const targetAllies = this.getTeamOf(target.team).filter(
      m => m.isAlive && m.id !== target.id
    );
    for (const ally of targetAllies) {
      this.triggerPassivesFor(ally, 'ally_attacked', {
        target,
        attacker,
        damage,
      });
    }
  }

  /**
   * Trigger on_kill passives when a monster is defeated
   */
  private triggerOnKillPassives(killer: BattleMonster, killed: BattleMonster): void {
    // Trigger on_kill passive for the killer
    this.triggerPassivesFor(killer, 'on_kill', {
      target: killed,
    });

    // Trigger ally_killed passives for killed monster's allies
    const killedAllies = this.getTeamOf(killed.team).filter(
      m => m.isAlive && m.id !== killed.id
    );
    for (const ally of killedAllies) {
      this.triggerPassivesFor(ally, 'ally_killed', {
        target: killed,
        attacker: killer,
      });
    }
  }

  /**
   * Process boss mechanics when damage is dealt
   */
  private processBossMechanicsOnDamage(
    attacker: BattleMonster,
    target: BattleMonster,
    damage: number,
    isCrit: boolean
  ): void {
    const context = {
      boss: target,
      attacker,
      damage,
      isCrit,
      turnNumber: this.state.turn,
      allAllies: this.getTeamOf(target.team),
      allEnemies: this.getOpposingTeam(target.team),
    };

    // Check on_hit mechanics
    const hitResults = this.bossMechanicSystem.checkOnHit(context);
    for (const result of hitResults) {
      this.applyBossMechanicResult(result);
    }

    // Check on_crit mechanics
    if (isCrit) {
      const critResults = this.bossMechanicSystem.checkOnCrit(context);
      for (const result of critResults) {
        this.applyBossMechanicResult(result);
      }
    }

    // Check HP threshold mechanics
    const hpResults = this.bossMechanicSystem.checkHpThreshold(context);
    for (const result of hpResults) {
      this.applyBossMechanicResult(result);
    }
  }

  /**
   * Apply effects from a boss mechanic result
   */
  private applyBossMechanicResult(result: {
    triggered: boolean;
    mechanicId: string;
    mechanicName: string;
    effects: Array<{
      type: 'damage' | 'heal' | 'buff' | 'debuff' | 'summon' | 'aoe_damage';
      targetIds: string[];
      value?: number;
      effectId?: string;
      message: string;
    }>;
  }): void {
    if (!result.triggered) return;

    for (const effect of result.effects) {
      // Log the mechanic activation
      this.addLogEntry({
        turn: this.state.turn,
        tick: this.state.tick,
        actorId: '',
        actorName: 'Boss',
        action: effect.message,
        targets: [],
      });

      switch (effect.type) {
        case 'damage':
        case 'aoe_damage': {
          for (const targetId of effect.targetIds) {
            const target = this.findMonster(targetId);
            if (target && target.isAlive && effect.value) {
              target.currentHp = Math.max(0, target.currentHp - effect.value);
              this.totalDamageTaken += effect.value;
              if (target.currentHp <= 0) {
                target.isAlive = false;
                this.addLogEntry({
                  turn: this.state.turn,
                  tick: this.state.tick,
                  actorId: target.id,
                  actorName: target.name,
                  action: 'has been defeated!',
                  targets: [],
                });
              }
            }
          }
          break;
        }

        case 'heal': {
          for (const targetId of effect.targetIds) {
            const target = this.findMonster(targetId);
            if (target && target.isAlive && effect.value) {
              target.currentHp = Math.min(target.maxHp, target.currentHp + effect.value);
            }
          }
          break;
        }

        case 'buff': {
          for (const targetId of effect.targetIds) {
            const target = this.findMonster(targetId);
            if (target && target.isAlive && effect.effectId) {
              const existingBuff = target.buffs.find(b => b.type === effect.effectId);
              if (!existingBuff) {
                target.buffs.push({
                  id: `boss_${effect.effectId}_${Date.now()}`,
                  type: effect.effectId as any,
                  duration: 3,
                  value: effect.value || 0,
                  sourceId: 'boss',
                  icon: `${effect.effectId}.png`,
                });
              }
            }
          }
          break;
        }

        case 'debuff': {
          for (const targetId of effect.targetIds) {
            const target = this.findMonster(targetId);
            if (target && target.isAlive && effect.effectId) {
              const existingDebuff = target.debuffs.find(d => d.type === effect.effectId);
              if (!existingDebuff) {
                target.debuffs.push({
                  id: `boss_${effect.effectId}_${Date.now()}`,
                  type: effect.effectId as any,
                  duration: 2,
                  value: effect.value || 0,
                  sourceId: 'boss',
                  icon: `${effect.effectId}.png`,
                });
              }
            }
          }
          break;
        }

        case 'summon': {
          // Summon mechanics would spawn additional monsters
          // For now, just log it
          break;
        }
      }
    }
  }

  /**
   * Process boss turn interval mechanics at end of boss turn
   */
  private processBossTurnMechanics(boss: BattleMonster): void {
    this.bossMechanicSystem.incrementTurn(boss.id);

    const context = {
      boss,
      turnNumber: this.state.turn,
      allAllies: this.getTeamOf(boss.team),
      allEnemies: this.getOpposingTeam(boss.team),
    };

    const results = this.bossMechanicSystem.checkTurnInterval(context);
    for (const result of results) {
      this.applyBossMechanicResult(result);
    }
  }

  // Get battle result
  public getResult(): BattleResult | null {
    if (!this.state.winner) return null;

    const rewards = this.calculateRewards();
    const experience = this.calculateExperience();

    return {
      winner: this.state.winner,
      turns: this.state.turn,
      duration: 0, // Would track actual time
      rewards,
      experience,
    };
  }

  /**
   * Calculate rewards based on enemy team defeated
   */
  private calculateRewards(): BattleReward[] {
    if (this.state.winner !== 'player') return [];

    const rewards: BattleReward[] = [];

    // Base gold reward based on enemy stats
    const totalEnemyPower = this.state.enemyTeam.reduce((sum, m) => {
      return sum + m.maxHp + m.atk * 5 + m.def * 3;
    }, 0);

    const goldReward = Math.floor(totalEnemyPower / 50) + Math.floor(Math.random() * 100);
    rewards.push({ type: 'gold', amount: goldReward });

    // Crystal reward (small chance)
    if (Math.random() < 0.1) {
      const crystalReward = Math.floor(Math.random() * 5) + 1;
      rewards.push({ type: 'crystal', amount: crystalReward });
    }

    // Energy refund (small chance)
    if (Math.random() < 0.05) {
      rewards.push({ type: 'energy', amount: 1 });
    }

    // Bonus rewards based on turn efficiency
    if (this.state.turn <= 5) {
      // Quick victory bonus
      rewards.push({ type: 'gold', amount: 50 });
    }

    return rewards;
  }

  /**
   * Calculate experience for player monsters
   */
  private calculateExperience(): { monsterId: string; exp: number }[] {
    if (this.state.winner !== 'player') return [];

    // Base exp from enemy team
    const totalEnemyStars = this.state.enemyTeam.reduce((sum, m) => {
      // Estimate stars from stats
      const estimatedStars = Math.min(5, Math.floor(m.maxHp / 2500) + 1);
      return sum + estimatedStars;
    }, 0);

    const baseExp = totalEnemyStars * 50;

    // Distribute exp to alive monsters (bonus for surviving)
    return this.state.playerTeam
      .filter(m => m.isAlive)
      .map(m => ({
        monsterId: m.id,
        exp: baseExp + Math.floor(Math.random() * 20),
      }));
  }
}
