import { useCallback } from 'react';
import { useAchievementStore, useQuestStore } from '../store';
import type { BattleState, BattleLogEntry } from '../types/battle';

/**
 * Hook for tracking achievements and quests during gameplay
 */
export function useAchievementTracker() {
  const { incrementProgress, updateProgress } = useAchievementStore();
  const questStore = useQuestStore();

  /**
   * Track battle-related achievements and quests when a battle ends
   */
  const trackBattleEnd = useCallback((battleState: BattleState, isArena: boolean = false, isCampaign: boolean = false) => {
    if (!battleState.winner) return;

    const isVictory = battleState.winner === 'player';

    if (isVictory) {
      // Track battle wins - achievements
      incrementProgress('first_blood');
      incrementProgress('warrior_bronze');
      incrementProgress('warrior_silver');
      incrementProgress('warrior_gold');
      incrementProgress('warrior_platinum');

      if (isArena) {
        incrementProgress('arena_champion');
      }

      // Track battle wins - quests
      questStore.trackBattleWin(isArena, isCampaign);

      // Check for flawless victory (all player monsters survived)
      const allPlayerMonstersAlive = battleState.playerTeam.every(m => m.isAlive);
      if (allPlayerMonstersAlive) {
        incrementProgress('flawless_victory');
      }

      // Check for comeback king (1 monster left at <10% HP)
      const aliveMonsters = battleState.playerTeam.filter(m => m.isAlive);
      if (aliveMonsters.length === 1) {
        const lastMonster = aliveMonsters[0];
        const hpPercent = (lastMonster.currentHp / lastMonster.maxHp) * 100;
        if (hpPercent < 10) {
          incrementProgress('comeback_king');
        }
      }
    }

    // Track damage and crits from battle log
    let totalDamage = 0;
    let totalCrits = 0;

    battleState.battleLog.forEach((entry: BattleLogEntry) => {
      // Only count player team's actions
      const isPlayerAction = battleState.playerTeam.some(m => m.id === entry.actorId);
      if (isPlayerAction) {
        if (entry.damage && entry.damage > 0) {
          totalDamage += entry.damage;
        }
        if (entry.isCrit) {
          totalCrits++;
        }
      }
    });

    // Update cumulative achievements
    if (totalDamage > 0) {
      const currentDamage = useAchievementStore.getState().getProgress('damage_dealer')?.currentValue ?? 0;
      updateProgress('damage_dealer', currentDamage + totalDamage, true);
    }

    if (totalCrits > 0) {
      const currentCrits = useAchievementStore.getState().getProgress('critical_striker')?.currentValue ?? 0;
      updateProgress('critical_striker', currentCrits + totalCrits, true);
      // Track crits for quests
      questStore.trackCriticalHit(totalCrits);
    }

    // Check for speed demon (fast battle victory) - estimating ~30 ticks = 30 seconds
    if (isVictory && battleState.tick < 30) {
      incrementProgress('speed_demon');
    }
  }, [incrementProgress, updateProgress, questStore]);

  /**
   * Track monster collection achievements
   */
  const trackMonsterCollection = useCallback((
    totalMonsters: number,
    ssrCount: number,
    elementCounts: { fire: number; water: number; wind: number; light: number; dark: number }
  ) => {
    // Collection achievements
    updateProgress('collector_bronze', totalMonsters);
    updateProgress('collector_silver', totalMonsters);
    updateProgress('collector_gold', totalMonsters);

    // SSR achievements
    if (ssrCount >= 1) {
      incrementProgress('first_ssr');
    }
    updateProgress('ssr_collector', ssrCount);

    // Element-specific achievements
    updateProgress('element_master_fire', elementCounts.fire);
    updateProgress('element_master_water', elementCounts.water);
    updateProgress('element_master_wind', elementCounts.wind);
  }, [updateProgress, incrementProgress]);

  /**
   * Track player level achievements
   */
  const trackPlayerLevel = useCallback((level: number) => {
    updateProgress('level_10', level);
    updateProgress('level_25', level);
    updateProgress('level_50', level);
  }, [updateProgress]);

  /**
   * Track daily login streak
   */
  const trackDailyStreak = useCallback((streak: number) => {
    updateProgress('daily_dedication', streak);
    // Track daily login quest
    questStore.trackDailyLogin();
  }, [updateProgress, questStore]);

  /**
   * Track guild membership
   */
  const trackGuildJoin = useCallback(() => {
    incrementProgress('guild_member');
    questStore.trackGuildJoin();
  }, [incrementProgress, questStore]);

  /**
   * Track summons
   */
  const trackSummon = useCallback((count: number = 1, ssrCount: number = 0) => {
    questStore.trackSummon(count);
    // Check for double SSR in a 10-pull
    if (ssrCount >= 2) {
      incrementProgress('summoner_luck');
    }
  }, [questStore, incrementProgress]);

  /**
   * Track rune upgrades
   */
  const trackRuneUpgrade = useCallback((newLevel: number) => {
    questStore.trackRuneUpgrade();
    if (newLevel >= 15) {
      incrementProgress('perfect_rune');
    }
  }, [questStore, incrementProgress]);

  /**
   * Track rune equip
   */
  const trackRuneEquip = useCallback(() => {
    questStore.trackRuneEquip();
  }, [questStore]);

  /**
   * Track rune collection
   */
  const trackRuneCollection = useCallback((totalRunes: number) => {
    updateProgress('rune_collector', totalRunes);
  }, [updateProgress]);

  /**
   * Track campaign progress
   */
  const trackCampaignStage = useCallback(() => {
    incrementProgress('campaign_progress');
  }, [incrementProgress]);

  /**
   * Track monster awakening
   */
  const trackMonsterAwakening = useCallback(() => {
    incrementProgress('awaken_monster');
  }, [incrementProgress]);

  /**
   * Track max level monster
   */
  const trackMaxLevelMonster = useCallback(() => {
    incrementProgress('max_monster');
  }, [incrementProgress]);

  /**
   * Track +15 rune upgrade
   */
  const trackPerfectRune = useCallback(() => {
    incrementProgress('perfect_rune');
  }, [incrementProgress]);

  /**
   * Track double SSR in a single 10-pull
   */
  const trackDoubleSsr = useCallback(() => {
    incrementProgress('summoner_luck');
  }, [incrementProgress]);

  return {
    trackBattleEnd,
    trackMonsterCollection,
    trackPlayerLevel,
    trackDailyStreak,
    trackGuildJoin,
    trackSummon,
    trackRuneUpgrade,
    trackRuneEquip,
    trackRuneCollection,
    trackCampaignStage,
    trackMonsterAwakening,
    trackMaxLevelMonster,
    trackPerfectRune,
    trackDoubleSsr,
  };
}
