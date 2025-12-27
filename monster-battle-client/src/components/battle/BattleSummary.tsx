import React, { useMemo } from 'react';
import type { BattleState, BattleStatistics, MonsterBattleStats, BattleLogEntry, BattleMonster } from '../../types/battle';
import './BattleSummary.css';

interface BattleSummaryProps {
  battleState: BattleState;
  onClose: () => void;
}

// Calculate statistics from battle log
function calculateStatistics(state: BattleState): BattleStatistics {
  const playerStats = new Map<string, MonsterBattleStats>();
  const enemyStats = new Map<string, MonsterBattleStats>();

  // Initialize stats for all monsters
  const initMonsterStats = (monster: BattleMonster): MonsterBattleStats => ({
    monsterId: monster.id,
    monsterName: monster.name,
    element: monster.element,
    damageDealt: 0,
    damageTaken: 0,
    healingDone: 0,
    criticalHits: 0,
    totalHits: 0,
    debuffsApplied: 0,
    buffsApplied: 0,
    turnsActed: 0,
    survived: monster.isAlive,
  });

  state.playerTeam.forEach(m => playerStats.set(m.id, initMonsterStats(m)));
  state.enemyTeam.forEach(m => enemyStats.set(m.id, initMonsterStats(m)));

  // Process battle log
  state.battleLog.forEach((entry: BattleLogEntry) => {
    const isPlayerActor = state.playerTeam.some(m => m.id === entry.actorId);
    const actorStats = isPlayerActor ? playerStats.get(entry.actorId) : enemyStats.get(entry.actorId);

    if (actorStats) {
      // Track turns
      if (entry.action !== 'effect' && entry.action !== 'passive') {
        actorStats.turnsActed++;
      }

      // Track damage dealt
      if (entry.damage && entry.damage > 0) {
        actorStats.damageDealt += entry.damage;
        actorStats.totalHits++;
        if (entry.isCrit) {
          actorStats.criticalHits++;
        }
      }

      // Track healing
      if (entry.healing && entry.healing > 0) {
        actorStats.healingDone += entry.healing;
      }

      // Track effects applied
      if (entry.effects) {
        entry.effects.forEach(effect => {
          const isDebuff = ['stun', 'freeze', 'sleep', 'atkDown', 'defDown', 'spdDown', 'continuousDamage'].some(
            d => effect.toLowerCase().includes(d.toLowerCase())
          );
          if (isDebuff) {
            actorStats.debuffsApplied++;
          } else {
            actorStats.buffsApplied++;
          }
        });
      }
    }

    // Track damage taken by targets
    if (entry.damage && entry.damage > 0 && entry.targets) {
      entry.targets.forEach(targetName => {
        // Find target by name in both teams
        const playerTarget = state.playerTeam.find(m => m.name === targetName);
        const enemyTarget = state.enemyTeam.find(m => m.name === targetName);

        if (playerTarget) {
          const targetStats = playerStats.get(playerTarget.id);
          if (targetStats) {
            targetStats.damageTaken += entry.damage! / entry.targets.length;
          }
        } else if (enemyTarget) {
          const targetStats = enemyStats.get(enemyTarget.id);
          if (targetStats) {
            targetStats.damageTaken += entry.damage! / entry.targets.length;
          }
        }
      });
    }
  });

  const playerStatsArray = Array.from(playerStats.values());
  const enemyStatsArray = Array.from(enemyStats.values());

  const totalDamageDealt = playerStatsArray.reduce((sum, s) => sum + s.damageDealt, 0);
  const totalDamageTaken = playerStatsArray.reduce((sum, s) => sum + s.damageTaken, 0);
  const totalHealing = playerStatsArray.reduce((sum, s) => sum + s.healingDone, 0);

  return {
    playerStats: playerStatsArray.sort((a, b) => b.damageDealt - a.damageDealt),
    enemyStats: enemyStatsArray.sort((a, b) => b.damageDealt - a.damageDealt),
    totalDamageDealt,
    totalDamageTaken,
    totalHealing,
    battleDuration: state.tick,
    totalTurns: state.turn,
  };
}

const ElementIcon: React.FC<{ element: string }> = ({ element }) => {
  const colors: Record<string, string> = {
    fire: '#ff6b6b',
    water: '#48dbfb',
    wind: '#feca57',
    light: '#fff9c4',
    dark: '#9c88ff',
  };

  return (
    <span
      className="element-dot"
      style={{ backgroundColor: colors[element] || '#888' }}
      title={element}
    />
  );
};

const StatBar: React.FC<{ value: number; maxValue: number; color: string }> = ({ value, maxValue, color }) => {
  const percentage = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;
  return (
    <div className="stat-bar-container">
      <div className="stat-bar-fill" style={{ width: `${percentage}%`, backgroundColor: color }} />
    </div>
  );
};

const MonsterStatRow: React.FC<{ stats: MonsterBattleStats; maxDamage: number }> = ({ stats, maxDamage }) => (
  <div className={`monster-stat-row ${!stats.survived ? 'defeated' : ''}`}>
    <div className="monster-info">
      <ElementIcon element={stats.element} />
      <span className="monster-name">{stats.monsterName}</span>
      {!stats.survived && <span className="defeated-badge">KO</span>}
    </div>
    <div className="stat-columns">
      <div className="stat-column damage">
        <StatBar value={stats.damageDealt} maxValue={maxDamage} color="#ff6b6b" />
        <span className="stat-value">{formatNumber(stats.damageDealt)}</span>
      </div>
      <div className="stat-column healing">
        <span className="stat-value healing">{stats.healingDone > 0 ? formatNumber(stats.healingDone) : '-'}</span>
      </div>
      <div className="stat-column crits">
        <span className="stat-value">
          {stats.criticalHits}/{stats.totalHits}
          {stats.totalHits > 0 && (
            <span className="crit-rate">({Math.round((stats.criticalHits / stats.totalHits) * 100)}%)</span>
          )}
        </span>
      </div>
      <div className="stat-column effects">
        <span className="buff-count" title="Buffs applied">+{stats.buffsApplied}</span>
        <span className="debuff-count" title="Debuffs applied">-{stats.debuffsApplied}</span>
      </div>
    </div>
  </div>
);

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return Math.round(num).toString();
}

export const BattleSummary: React.FC<BattleSummaryProps> = ({ battleState, onClose }) => {
  const statistics = useMemo(() => calculateStatistics(battleState), [battleState]);
  const isVictory = battleState.winner === 'player';

  const maxPlayerDamage = Math.max(...statistics.playerStats.map(s => s.damageDealt), 1);

  return (
    <div className="battle-summary-overlay">
      <div className="battle-summary-panel">
        <div className={`summary-header ${isVictory ? 'victory' : 'defeat'}`}>
          <h2>Battle Summary</h2>
          <div className="battle-outcome">{isVictory ? 'VICTORY' : 'DEFEAT'}</div>
        </div>

        <div className="summary-overview">
          <div className="overview-stat">
            <span className="overview-value">{statistics.totalTurns}</span>
            <span className="overview-label">Turns</span>
          </div>
          <div className="overview-stat damage">
            <span className="overview-value">{formatNumber(statistics.totalDamageDealt)}</span>
            <span className="overview-label">Total Damage</span>
          </div>
          <div className="overview-stat healing">
            <span className="overview-value">{formatNumber(statistics.totalHealing)}</span>
            <span className="overview-label">Total Healing</span>
          </div>
          <div className="overview-stat taken">
            <span className="overview-value">{formatNumber(statistics.totalDamageTaken)}</span>
            <span className="overview-label">Damage Taken</span>
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-header">
            <span className="header-monster">Monster</span>
            <span className="header-damage">Damage</span>
            <span className="header-healing">Healing</span>
            <span className="header-crits">Crits</span>
            <span className="header-effects">Effects</span>
          </div>

          <div className="team-label player">Your Team</div>
          {statistics.playerStats.map(stats => (
            <MonsterStatRow key={stats.monsterId} stats={stats} maxDamage={maxPlayerDamage} />
          ))}

          <div className="team-label enemy">Enemy Team</div>
          {statistics.enemyStats.map(stats => (
            <MonsterStatRow
              key={stats.monsterId}
              stats={stats}
              maxDamage={Math.max(...statistics.enemyStats.map(s => s.damageDealt), 1)}
            />
          ))}
        </div>

        <button className="close-summary-btn" onClick={onClose}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default BattleSummary;
