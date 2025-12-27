import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuildStore, useGuildWarStore, usePlayerStore } from '../store';
import { Button, Panel, Badge, Tabs, ProgressBar } from '../components/common';
import { getMonsterTemplate } from '../data/monsters';
import './GuildWarScreen.css';

type TabType = 'overview' | 'attack' | 'defense' | 'history';

export const GuildWarScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Stores
  const { guild, guildPoints } = useGuildStore();
  const { monsters } = usePlayerStore();
  const {
    currentWar,
    stats,
    myDefenses,
    enemyDefenses,
    myAttacks,
    canAttack,
    getRemainingDefenses,
    getWarProgress,
  } = useGuildWarStore();

  const warProgress = getWarProgress();
  const remainingDefenses = getRemainingDefenses();
  const hasActiveWar = currentWar && currentWar.status !== 'idle';

  // Sample defense setup
  const [selectedDefenseMonsters, setSelectedDefenseMonsters] = useState<string[]>([]);

  const toggleDefenseMonster = (monsterId: string) => {
    setSelectedDefenseMonsters(prev => {
      if (prev.includes(monsterId)) {
        return prev.filter(id => id !== monsterId);
      }
      if (prev.length >= 3) return prev; // Max 3 monsters per defense
      return [...prev, monsterId];
    });
  };

  const renderOverview = () => {
    if (!hasActiveWar) {
      return (
        <div className="no-war">
          <span className="no-war-icon">⚔️</span>
          <h2>No Active Guild War</h2>
          <p>Guild War starts every Wednesday and Friday</p>
          <p>Prepare your defenses and wait for matchmaking!</p>
        </div>
      );
    }

    return (
      <div className="war-overview">
        {/* War Header */}
        <div className="war-header">
          <div className="guild-card our-guild">
            <h3>{guild?.name || 'Our Guild'}</h3>
            <span className="guild-tag">[{guild?.tag || 'TAG'}]</span>
            <div className="guild-score">{warProgress.guild1}</div>
          </div>

          <div className="vs-indicator">VS</div>

          <div className="guild-card enemy-guild">
            <h3>{currentWar.enemyGuild.name}</h3>
            <span className="guild-tag">[{currentWar.enemyGuild.tag}]</span>
            <div className="guild-score">{warProgress.guild2}</div>
          </div>
        </div>

        {/* War Progress */}
        <Panel title="War Progress">
          <div className="war-stats">
            <div className="stat-row">
              <span className="stat-label">Status</span>
              <Badge variant={currentWar.status === 'battle' ? 'success' : 'warning'}>
                {currentWar.status}
              </Badge>
            </div>
            <div className="stat-row">
              <span className="stat-label">Attacks Remaining</span>
              <span className="stat-value">{stats.maxSwords - stats.swordsUsed} / {stats.maxSwords}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Your Victories</span>
              <span className="stat-value success">{stats.victories}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Your Defeats</span>
              <span className="stat-value danger">{stats.defeats}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Points Earned</span>
              <span className="stat-value">{stats.totalPoints}</span>
            </div>
          </div>

          <ProgressBar
            value={warProgress.guild1}
            max={warProgress.guild1 + warProgress.guild2}
            type="arena"
            size="lg"
            showText
          />

          {currentWar.endTime && (
            <p className="war-timer">
              Time Remaining: {new Date(currentWar.endTime).toLocaleString()}
            </p>
          )}
        </Panel>

        {/* Quick Stats */}
        <div className="quick-stats-grid">
          <div className="quick-stat">
            <span className="quick-stat-icon">🗡️</span>
            <span className="quick-stat-value">{stats.swordsUsed}/{stats.maxSwords}</span>
            <span className="quick-stat-label">Swords Used</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-icon">🏆</span>
            <span className="quick-stat-value">{stats.victories}</span>
            <span className="quick-stat-label">Victories</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-icon">⭐</span>
            <span className="quick-stat-value">{stats.totalPoints}</span>
            <span className="quick-stat-label">Points</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-icon">🎯</span>
            <span className="quick-stat-value">{remainingDefenses.length}</span>
            <span className="quick-stat-label">Available Defenses</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAttack = () => {
    if (!hasActiveWar || !canAttack()) {
      return (
        <div className="no-attacks">
          <span className="no-attacks-icon">⚔️</span>
          <h3>No Attacks Available</h3>
          <p>{!canAttack() ? 'All swords used!' : 'War not active'}</p>
        </div>
      );
    }

    return (
      <div className="attack-tab">
        <div className="attack-header">
          <h3>Enemy Defenses</h3>
          <Badge variant="info">{remainingDefenses.length} available</Badge>
        </div>

        <div className="defenses-grid">
          {enemyDefenses.map((defense, idx) => (
            <div
              key={idx}
              className={`defense-card ${defense.attackCount >= 2 ? 'defeated' : ''}`}
            >
              <div className="defense-header">
                <span className="defense-position">Position {defense.position}</span>
                <span className="defense-attacks">{defense.attackCount}/2</span>
              </div>

              <div className="defense-monsters">
                {defense.monsters.map((monsterId, i) => {
                  const template = getMonsterTemplate(monsterId);
                  return (
                    <div key={i} className="defense-monster-preview">
                      {template ? template.name : 'Unknown'}
                    </div>
                  );
                })}
              </div>

              {defense.attackCount < 2 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    // Navigate to battle with this defense
                    alert('Attack feature coming soon!');
                  }}
                  disabled={!canAttack()}
                >
                  Attack
                </Button>
              ) : (
                <Badge variant="danger">Defeated</Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDefense = () => {
    return (
      <div className="defense-tab">
        <Panel title="Set Your Defense">
          <p className="defense-instruction">
            Select 3 monsters to defend your guild. Choose wisely - each defense can be attacked twice!
          </p>

          <div className="selected-defense">
            <h4>Selected Monsters ({selectedDefenseMonsters.length}/3)</h4>
            <div className="selected-monsters-grid">
              {[0, 1, 2].map(slot => {
                const monsterId = selectedDefenseMonsters[slot];
                if (!monsterId) {
                  return (
                    <div key={slot} className="empty-slot">
                      <span>Empty</span>
                    </div>
                  );
                }
                const monster = monsters.find(m => m.id === monsterId);
                const template = monster ? getMonsterTemplate(monster.templateId) : null;
                return (
                  <div key={slot} className="selected-monster">
                    <span>{template?.name || 'Unknown'}</span>
                    <button onClick={() => toggleDefenseMonster(monsterId)}>×</button>
                  </div>
                );
              })}
            </div>

            {selectedDefenseMonsters.length === 3 && (
              <Button
                variant="success"
                onClick={() => {
                  alert('Defense saved! (Feature coming soon)');
                  setSelectedDefenseMonsters([]);
                }}
              >
                Save Defense
              </Button>
            )}
          </div>

          <h4>Available Monsters</h4>
          <div className="available-monsters-grid">
            {monsters.slice(0, 12).map(monster => {
              const template = getMonsterTemplate(monster.templateId);
              const isSelected = selectedDefenseMonsters.includes(monster.id);
              return (
                <div
                  key={monster.id}
                  className={`available-monster ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleDefenseMonster(monster.id)}
                >
                  <span className="monster-name">{template?.name || 'Unknown'}</span>
                  <span className="monster-level">Lv.{monster.level}</span>
                  {isSelected && <span className="selected-check">✓</span>}
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Current Defenses">
          {myDefenses.length === 0 ? (
            <p className="no-defenses">No defenses set yet. Set up your defense above!</p>
          ) : (
            <div className="my-defenses-list">
              {myDefenses.map((defense, idx) => (
                <div key={idx} className="my-defense-card">
                  <span className="defense-position">Position {defense.position}</span>
                  <div className="defense-monsters">
                    {defense.monsters.map((monsterId, i) => {
                      const template = getMonsterTemplate(monsterId);
                      return <Badge key={i} variant="info">{template?.name || 'Unknown'}</Badge>;
                    })}
                  </div>
                  <span className="defense-status">
                    {defense.defeatedBy ? 'Defeated' : 'Active'} ({defense.attackCount} attacks)
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    );
  };

  const renderHistory = () => {
    return (
      <div className="history-tab">
        <Panel title="Attack History">
          {myAttacks.length === 0 ? (
            <p className="no-history">No attacks yet. Start attacking to build your history!</p>
          ) : (
            <div className="attacks-list">
              {myAttacks.map((attack, idx) => (
                <div key={idx} className={`attack-entry ${attack.result}`}>
                  <div className="attack-info">
                    <span className="attack-time">
                      {new Date(attack.timestamp).toLocaleString()}
                    </span>
                    <span className="attack-defender">vs {attack.defenderName || 'Enemy'}</span>
                  </div>
                  <div className="attack-result">
                    <Badge variant={attack.result === 'victory' ? 'success' : 'danger'}>
                      {attack.result}
                    </Badge>
                    <span className="attack-points">+{attack.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    );
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'attack', label: 'Attack' },
    { id: 'defense', label: 'Defense' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="guild-war-screen">
      {/* Header */}
      <div className="guild-war-header">
        <button className="back-button" onClick={() => navigate('/guild')}>
          ← Back to Guild
        </button>
        <h1>Guild War</h1>
        <div className="gp-display">
          <span className="gp-label">GP</span>
          <span className="gp-amount">{guildPoints}</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
      />

      {/* Content */}
      <div className="guild-war-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'attack' && renderAttack()}
        {activeTab === 'defense' && renderDefense()}
        {activeTab === 'history' && renderHistory()}
      </div>
    </div>
  );
};

export default GuildWarScreen;
