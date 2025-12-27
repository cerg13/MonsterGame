import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArenaStore } from '../store/useArenaStore';
import { usePlayerStore } from '../store';
import { MONSTER_TEMPLATES, getMonsterTemplate } from '../data/monsters';
import { ARENA_TIER_INFO, ARENA_WINGS, ARENA_WEEKLY_REWARDS } from '../types/arena';
import type { ArenaOpponent, ArenaTier } from '../types/arena';
import './ArenaScreen.css';

type ArenaTab = 'battle' | 'defense' | 'ranking' | 'rewards';

const elementEmojis: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  wind: '🌪️',
  light: '✨',
  dark: '🌑',
};

export const ArenaScreen: React.FC = () => {
  const navigate = useNavigate();

  // Arena store
  const points = useArenaStore((s) => s.points);
  const tier = useArenaStore((s) => s.tier);
  const wings = useArenaStore((s) => s.wings);
  const opponents = useArenaStore((s) => s.opponents);
  const defenseTeamIds = useArenaStore((s) => s.defenseTeamIds);
  const battleLog = useArenaStore((s) => s.battleLog);
  const weeklyBattles = useArenaStore((s) => s.weeklyBattles);
  const weeklyWins = useArenaStore((s) => s.weeklyWins);

  const refreshOpponents = useArenaStore((s) => s.refreshOpponents);
  const setDefenseTeam = useArenaStore((s) => s.setDefenseTeam);
  const startBattle = useArenaStore((s) => s.startBattle);
  const recordBattleResult = useArenaStore((s) => s.recordBattleResult);
  const regenerateWings = useArenaStore((s) => s.regenerateWings);
  const canClaimWeeklyReward = useArenaStore((s) => s.canClaimWeeklyReward);
  const claimWeeklyReward = useArenaStore((s) => s.claimWeeklyReward);

  // Player store
  const player = usePlayerStore((s) => s.player);
  const monsters = usePlayerStore((s) => s.monsters);
  const updateResources = usePlayerStore((s) => s.updateResources);

  const [activeTab, setActiveTab] = useState<ArenaTab>('battle');
  const [selectedOpponent, setSelectedOpponent] = useState<ArenaOpponent | null>(null);
  const [showBattleResult, setShowBattleResult] = useState<{ result: 'victory' | 'defeat'; points: number } | null>(null);
  const [editingDefense, setEditingDefense] = useState(false);
  const [selectedDefenseMonsters, setSelectedDefenseMonsters] = useState<string[]>(defenseTeamIds);

  const tierInfo = ARENA_TIER_INFO[tier];

  // Regenerate wings on mount
  useEffect(() => {
    regenerateWings();
  }, [regenerateWings]);

  // Load opponents on mount
  useEffect(() => {
    if (opponents.length === 0) {
      refreshOpponents();
    }
  }, [opponents.length, refreshOpponents]);

  // Get defense team monsters
  const defenseTeamMonsters = useMemo(() => {
    return defenseTeamIds.map((id) => {
      const monster = monsters.find((m) => m.id === id);
      if (!monster) return null;
      const template = getMonsterTemplate(monster.templateId);
      return { monster, template };
    }).filter(Boolean);
  }, [defenseTeamIds, monsters]);

  // Handle attack
  const handleAttack = (opponent: ArenaOpponent) => {
    const result = startBattle(opponent.id);
    if (!result.canStart) {
      alert(result.error);
      return;
    }

    setSelectedOpponent(opponent);

    // Simulate battle (in real game, would go to battle screen)
    setTimeout(() => {
      const battleResult = Math.random() > 0.4 ? 'victory' : 'defeat';
      const { pointsChange } = recordBattleResult(opponent.id, battleResult);

      setShowBattleResult({ result: battleResult, points: pointsChange });
      setSelectedOpponent(null);

      // Auto-hide result after 3 seconds
      setTimeout(() => setShowBattleResult(null), 3000);
    }, 2000);
  };

  // Handle defense team save
  const handleSaveDefense = () => {
    setDefenseTeam(selectedDefenseMonsters);
    setEditingDefense(false);
  };

  // Toggle defense monster selection
  const toggleDefenseMonster = (monsterId: string) => {
    if (selectedDefenseMonsters.includes(monsterId)) {
      setSelectedDefenseMonsters(selectedDefenseMonsters.filter((id) => id !== monsterId));
    } else if (selectedDefenseMonsters.length < 4) {
      setSelectedDefenseMonsters([...selectedDefenseMonsters, monsterId]);
    }
  };

  // Claim weekly reward
  const handleClaimReward = () => {
    if (!canClaimWeeklyReward()) return;

    const reward = claimWeeklyReward();
    updateResources({
      crystals: (player?.crystals || 0) + reward.crystals,
      gold: (player?.gold || 0) + reward.gold,
    });

    alert(`Claimed: ${reward.crystals} 💎 and ${reward.gold.toLocaleString()} 🪙`);
  };

  return (
    <div className="arena-screen">
      {/* Header */}
      <div className="arena-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="arena-info">
          <span className="tier-badge" style={{ background: tierInfo.color }}>
            {tierInfo.icon} {tierInfo.name}
          </span>
          <span className="points">{points} pts</span>
        </div>
        <div className="wings-info">
          <span className="wings-icon">⚔️</span>
          <span>{wings}/{ARENA_WINGS.max}</span>
        </div>
      </div>

      {/* Battle Result Overlay */}
      {showBattleResult && (
        <div className={`battle-result-overlay ${showBattleResult.result}`}>
          <div className="result-content">
            <span className="result-icon">
              {showBattleResult.result === 'victory' ? '🏆' : '💀'}
            </span>
            <h2>{showBattleResult.result === 'victory' ? 'Victory!' : 'Defeat'}</h2>
            <span className="points-change" style={{ color: showBattleResult.points > 0 ? '#4caf50' : '#f44336' }}>
              {showBattleResult.points > 0 ? '+' : ''}{showBattleResult.points} pts
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="arena-tabs">
        {(['battle', 'defense', 'ranking', 'rewards'] as ArenaTab[]).map((tab) => (
          <button
            key={tab}
            className={`arena-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'battle' && '⚔️'}
            {tab === 'defense' && '🛡️'}
            {tab === 'ranking' && '📊'}
            {tab === 'rewards' && '🎁'}
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="arena-content">
        {/* Battle Tab */}
        {activeTab === 'battle' && (
          <div className="battle-tab">
            <div className="refresh-bar">
              <span className="opponent-count">{opponents.length} Opponents</span>
              <button className="refresh-btn" onClick={refreshOpponents}>
                🔄 Refresh List
              </button>
            </div>

            <div className="opponent-list">
              {opponents.map((opponent) => (
                <div key={opponent.id} className="opponent-card">
                  <div className="opponent-header">
                    <span className="opponent-name">{opponent.username}</span>
                    <span
                      className="opponent-tier"
                      style={{ background: ARENA_TIER_INFO[opponent.tier].color }}
                    >
                      {ARENA_TIER_INFO[opponent.tier].icon}
                    </span>
                  </div>

                  <div className="opponent-stats">
                    <span>Lv. {opponent.level}</span>
                    <span>{opponent.points} pts</span>
                    <span>{opponent.winRate}% WR</span>
                  </div>

                  <div className="opponent-team">
                    {opponent.defenseTeam.map((mon, idx) => {
                      const template = MONSTER_TEMPLATES.find((t) => t.id === mon.templateId);
                      return (
                        <div key={idx} className="team-monster">
                          <span className="monster-element">
                            {template ? elementEmojis[template.element] : '?'}
                          </span>
                          <span className="monster-stars">{'★'.repeat(mon.stars)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    className="attack-btn"
                    onClick={() => handleAttack(opponent)}
                    disabled={wings <= 0 || !!selectedOpponent}
                  >
                    {selectedOpponent?.id === opponent.id ? 'Fighting...' : 'Attack'}
                  </button>
                </div>
              ))}
            </div>

            {opponents.length === 0 && (
              <div className="no-opponents">
                <p>No opponents available</p>
                <button onClick={refreshOpponents}>Find Opponents</button>
              </div>
            )}
          </div>
        )}

        {/* Defense Tab */}
        {activeTab === 'defense' && (
          <div className="defense-tab">
            <h3>Defense Team</h3>
            <p className="defense-desc">
              Set up your defense team. Other players will battle this team when attacking you.
            </p>

            {!editingDefense ? (
              <>
                <div className="defense-team-display">
                  {defenseTeamIds.length > 0 ? (
                    defenseTeamMonsters.map((item, idx) => {
                      if (!item) return null;
                      const { monster, template } = item;
                      return (
                        <div key={idx} className="defense-monster-card">
                          <span className="monster-icon">
                            {template ? elementEmojis[template.element] : '?'}
                          </span>
                          <span className="monster-name">
                            {template?.name || 'Unknown'}
                          </span>
                          <span className="monster-level">
                            Lv.{monster.level} {'★'.repeat(monster.stars)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-defense">No defense team set</p>
                  )}
                </div>
                <button
                  className="edit-defense-btn"
                  onClick={() => {
                    setSelectedDefenseMonsters(defenseTeamIds);
                    setEditingDefense(true);
                  }}
                >
                  Edit Defense Team
                </button>
              </>
            ) : (
              <>
                <div className="monster-selection">
                  <p>Select up to 4 monsters ({selectedDefenseMonsters.length}/4)</p>
                  <div className="monster-grid">
                    {monsters.map((monster) => {
                      const template = getMonsterTemplate(monster.templateId);
                      if (!template) return null;
                      const isSelected = selectedDefenseMonsters.includes(monster.id);

                      return (
                        <div
                          key={monster.id}
                          className={`select-monster-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleDefenseMonster(monster.id)}
                        >
                          <span className="monster-icon">
                            {elementEmojis[template.element]}
                          </span>
                          <span className="monster-name">{template.name}</span>
                          <span className="monster-info">
                            Lv.{monster.level} {'★'.repeat(monster.stars)}
                          </span>
                          {isSelected && <span className="check-mark">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="defense-actions">
                  <button className="cancel-btn" onClick={() => setEditingDefense(false)}>
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleSaveDefense}>
                    Save Defense
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Ranking Tab */}
        {activeTab === 'ranking' && (
          <div className="ranking-tab">
            <div className="your-rank">
              <h3>Your Ranking</h3>
              <div className="rank-card">
                <div className="rank-tier" style={{ background: tierInfo.color }}>
                  {tierInfo.icon}
                </div>
                <div className="rank-details">
                  <span className="rank-tier-name">{tierInfo.name}</span>
                  <span className="rank-points">{points} Points</span>
                </div>
              </div>
            </div>

            <div className="weekly-stats">
              <h3>This Week</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-value">{weeklyBattles}</span>
                  <span className="stat-label">Battles</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">{weeklyWins}</span>
                  <span className="stat-label">Wins</span>
                </div>
                <div className="stat-box">
                  <span className="stat-value">
                    {weeklyBattles > 0 ? Math.round((weeklyWins / weeklyBattles) * 100) : 0}%
                  </span>
                  <span className="stat-label">Win Rate</span>
                </div>
              </div>
            </div>

            <div className="battle-history">
              <h3>Recent Battles</h3>
              {battleLog.length > 0 ? (
                <div className="history-list">
                  {battleLog.slice(0, 10).map((log) => (
                    <div key={log.id} className={`history-item ${log.result}`}>
                      <span className="history-icon">
                        {log.result === 'victory' ? '🏆' : '💀'}
                      </span>
                      <div className="history-info">
                        <span className="history-opponent">{log.opponentName}</span>
                        <span className="history-time">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <span
                        className="history-points"
                        style={{ color: log.pointsChange > 0 ? '#4caf50' : '#f44336' }}
                      >
                        {log.pointsChange > 0 ? '+' : ''}{log.pointsChange}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-history">No battle history yet</p>
              )}
            </div>
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="rewards-tab">
            <h3>Weekly Rewards</h3>
            <p className="rewards-desc">
              Rewards are based on your highest tier reached this week.
              Claim resets every Monday.
            </p>

            <div className="tier-rewards-list">
              {ARENA_WEEKLY_REWARDS.map((reward) => {
                const rewardTierInfo = ARENA_TIER_INFO[reward.tier];
                const isCurrentTier = reward.tier === tier;

                return (
                  <div
                    key={reward.tier}
                    className={`tier-reward-card ${isCurrentTier ? 'current' : ''}`}
                  >
                    <div
                      className="tier-badge"
                      style={{ background: rewardTierInfo.color }}
                    >
                      {rewardTierInfo.icon} {rewardTierInfo.name}
                    </div>
                    <div className="reward-items">
                      <span>💎 {reward.crystals}</span>
                      <span>🪙 {reward.gold.toLocaleString()}</span>
                      {reward.bonusItems?.map((item, idx) => (
                        <span key={idx}>
                          {item.type === 'devilmon' ? '👿' : '📜'} x{item.quantity}
                        </span>
                      ))}
                    </div>
                    {isCurrentTier && <span className="current-badge">Your Tier</span>}
                  </div>
                );
              })}
            </div>

            <button
              className="claim-reward-btn"
              onClick={handleClaimReward}
              disabled={!canClaimWeeklyReward()}
            >
              {canClaimWeeklyReward() ? 'Claim Weekly Reward' : 'Already Claimed'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArenaScreen;
