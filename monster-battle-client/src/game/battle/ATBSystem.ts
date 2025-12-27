import type { BattleMonster } from '../../types/battle';
import { ATB_FULL } from '../../types/battle';

/**
 * ATB (Attack Bar) System
 *
 * Each tick, a monster's ATB increases by: SPD × TICK_PERCENTAGE (default 7%)
 * When ATB reaches 100%, the monster gets a turn.
 *
 * Speed Breakpoints (at 7% tick):
 * - 286+ SPD = 5 ticks to turn
 * - 239+ SPD = 6 ticks to turn
 * - 205+ SPD = 7 ticks to turn
 * - 179+ SPD = 8 ticks to turn
 * - 143+ SPD = 10 ticks to turn
 */
export class ATBSystem {
  private tickPercentage: number;

  constructor(tickPercentage: number = 0.07) {
    this.tickPercentage = tickPercentage;
  }

  /**
   * Calculate ATB increase for a given speed
   */
  public calculateIncrease(speed: number): number {
    return speed * this.tickPercentage;
  }

  /**
   * Increase a monster's ATB based on their speed
   */
  public increaseATB(currentATB: number, speed: number): number {
    return Math.min(currentATB + this.calculateIncrease(speed), ATB_FULL * 2);
  }

  /**
   * Reset ATB after a turn
   */
  public resetATB(monster: BattleMonster): void {
    monster.attackBar = 0;
  }

  /**
   * Modify ATB directly (for skills that boost/reduce ATB)
   */
  public modifyATB(monster: BattleMonster, modification: number): void {
    monster.attackBar = Math.max(0, Math.min(ATB_FULL * 2, monster.attackBar + modification));
  }

  /**
   * Calculate how many ticks until a monster reaches 100% ATB
   */
  public getTicksToTurn(currentATB: number, speed: number): number {
    if (currentATB >= ATB_FULL) return 0;
    const remaining = ATB_FULL - currentATB;
    return Math.ceil(remaining / this.calculateIncrease(speed));
  }

  /**
   * Get speed breakpoints for reference
   */
  public getSpeedBreakpoints(): { ticks: number; minSpeed: number }[] {
    return [
      { ticks: 5, minSpeed: Math.ceil(ATB_FULL / (5 * this.tickPercentage)) },
      { ticks: 6, minSpeed: Math.ceil(ATB_FULL / (6 * this.tickPercentage)) },
      { ticks: 7, minSpeed: Math.ceil(ATB_FULL / (7 * this.tickPercentage)) },
      { ticks: 8, minSpeed: Math.ceil(ATB_FULL / (8 * this.tickPercentage)) },
      { ticks: 10, minSpeed: Math.ceil(ATB_FULL / (10 * this.tickPercentage)) },
    ];
  }

  /**
   * Sort monsters by turn order (who goes first)
   */
  public getTurnOrder(monsters: BattleMonster[]): BattleMonster[] {
    return [...monsters]
      .filter(m => m.isAlive)
      .sort((a, b) => {
        // First by ATB (higher goes first)
        if (b.attackBar !== a.attackBar) {
          return b.attackBar - a.attackBar;
        }
        // Then by speed (higher goes first)
        return b.spd - a.spd;
      });
  }
}
