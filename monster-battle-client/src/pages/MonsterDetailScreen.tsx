import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../store';
import { MONSTER_TEMPLATES, getMonsterTemplate } from '../data/monsters';
import { calculateMonsterStats, getStatBreakdown } from '../utils/statCalculator';
import { MAX_LEVEL_BY_STARS } from '../types/monster';
import { EVOLUTION_REQUIREMENTS, AWAKENING_REQUIREMENTS, ESSENCE_INFO, SKILL_UPGRADE_COSTS, MAX_SKILL_LEVEL } from '../types/evolution';
import type { PlayerMonster, MonsterTemplate, Element } from '../types/monster';
import type { PlayerRune } from '../types/player';
import { RuneOptimizer } from '../components/runes';
import './MonsterDetailScreen.css';

const elementEmojis: Record<Element, string> = {
  fire: '🔥',
  water: '💧',
  wind: '🌪️',
  light: '✨',
  dark: '🌑',
};

const rarityColors: Record<string, string> = {
  common: '#888888',
  rare: '#4a90d9',
  sr: '#9b59b6',
  ssr: '#f1c40f',
};

type TabType = 'info' | 'skills' | 'evolution' | 'awakening' | 'runes';

export const MonsterDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Store state
  const player = usePlayerStore((s) => s.player);
  const monsters = usePlayerStore((s) => s.monsters);
  const runes = usePlayerStore((s) => s.runes);
  const essences = usePlayerStore((s) => s.essences);
  const devilmons = usePlayerStore((s) => s.devilmons);
  const evolveMonster = usePlayerStore((s) => s.evolveMonster);
  const awakenMonster = usePlayerStore((s) => s.awakenMonster);
  const upgradeSkill = usePlayerStore((s) => s.upgradeSkill);
  const addEssence = usePlayerStore((s) => s.addEssence);
  const addDevilmons = usePlayerStore((s) => s.addDevilmons);
  const equipRune = usePlayerStore((s) => s.equipRune);
  const unequipRune = usePlayerStore((s) => s.unequipRune);

  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [selectedFodder, setSelectedFodder] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);

  // Get monster data
  const monster = useMemo(() => monsters.find((m) => m.id === id), [monsters, id]);
  const template = useMemo(() => (monster ? getMonsterTemplate(monster.templateId) : null), [monster]);

  // Get equipped runes
  const equippedRunes = useMemo(
    () => runes.filter((r) => r.equippedTo === id),
    [runes, id]
  );

  // Calculate stats
  const calculatedStats = useMemo(() => {
    if (!template || !monster) return null;
    return calculateMonsterStats(template, monster, equippedRunes);
  }, [template, monster, equippedRunes]);

  // Evolution requirements
  const evolutionReqs = useMemo(() => {
    if (!monster) return null;
    return EVOLUTION_REQUIREMENTS[monster.stars] || null;
  }, [monster]);

  // Awakening requirements
  const awakeningReqs = useMemo(() => {
    if (!template) return null;
    return AWAKENING_REQUIREMENTS[template.naturalStars] || AWAKENING_REQUIREMENTS[3];
  }, [template]);

  // Available fodder monsters
  const availableFodder = useMemo(() => {
    if (!monster || !evolutionReqs) return [];
    return monsters.filter(
      (m) => m.id !== monster.id && m.stars === evolutionReqs.fodderStars && !m.locked
    );
  }, [monsters, monster, evolutionReqs]);

  // Check if can evolve
  const canEvolve = useMemo(() => {
    if (!monster || !evolutionReqs) return false;
    const maxLevel = MAX_LEVEL_BY_STARS[monster.stars];
    return (
      monster.level >= maxLevel &&
      selectedFodder.length === evolutionReqs.fodderCount &&
      (player?.gold || 0) >= evolutionReqs.goldCost
    );
  }, [monster, evolutionReqs, selectedFodder, player]);

  // Check if can awaken
  const canAwaken = useMemo(() => {
    if (!monster || !template || !awakeningReqs || monster.awakened) return false;
    const element = template.element;

    // Check gold
    if ((player?.gold || 0) < awakeningReqs.goldCost) return false;

    // Check essences
    for (const mat of awakeningReqs.materials) {
      if (essences[element][mat.essenceType] < mat.quantity) return false;
    }

    return true;
  }, [monster, template, awakeningReqs, player, essences]);

  if (!monster || !template) {
    return (
      <div className="monster-detail-screen">
        <div className="detail-header">
          <button className="back-button" onClick={() => navigate('/monsters')}>
            ← Back
          </button>
          <h1>Monster Not Found</h1>
        </div>
      </div>
    );
  }

  const maxLevel = MAX_LEVEL_BY_STARS[monster.stars];
  const displayName = monster.awakened && template.awakenedName ? template.awakenedName : template.name;

  // Handlers
  const handleEvolve = () => {
    if (!canEvolve) return;
    const result = evolveMonster(monster.id, selectedFodder);
    if (result.success) {
      setMessage({ type: 'success', text: 'Evolution successful!' });
      setSelectedFodder([]);
    } else {
      setMessage({ type: 'error', text: result.error || 'Evolution failed' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAwaken = () => {
    if (!canAwaken) return;
    const result = awakenMonster(monster.id);
    if (result.success) {
      setMessage({ type: 'success', text: 'Awakening successful!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Awakening failed' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSkillUpgrade = (skillIndex: number) => {
    const result = upgradeSkill(monster.id, skillIndex);
    if (result.success) {
      setMessage({ type: 'success', text: 'Skill upgraded!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Upgrade failed' });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleFodder = (monsterId: string) => {
    if (!evolutionReqs) return;
    if (selectedFodder.includes(monsterId)) {
      setSelectedFodder(selectedFodder.filter((id) => id !== monsterId));
    } else if (selectedFodder.length < evolutionReqs.fodderCount) {
      setSelectedFodder([...selectedFodder, monsterId]);
    }
  };

  // Debug: Add materials
  const handleAddDebugMaterials = () => {
    addEssence(template.element, 'low', 20);
    addEssence(template.element, 'mid', 15);
    addEssence(template.element, 'high', 10);
    addDevilmons(5);
    setMessage({ type: 'success', text: 'Debug materials added!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleEquipRunes = (runeIds: string[]) => {
    if (!monster) return;

    // First, unequip all current runes
    equippedRunes.forEach(rune => {
      unequipRune(rune.id);
    });

    // Then equip the new runes
    runeIds.forEach(runeId => {
      equipRune(runeId, monster.id);
    });

    setMessage({ type: 'success', text: 'Runes optimized and equipped!' });
    setTimeout(() => setMessage(null), 2000);
    setShowOptimizer(false);
  };

  return (
    <div className="monster-detail-screen">
      {/* Header */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate('/monsters')}>
          ← Back
        </button>
        <div className="header-info">
          <h1>{displayName}</h1>
          <div className="header-badges">
            <span className="element-badge">{elementEmojis[template.element]}</span>
            <span className="rarity-badge" style={{ color: rarityColors[template.rarity] }}>
              {template.rarity.toUpperCase()}
            </span>
            <span className="stars">{'★'.repeat(monster.stars)}</span>
            {monster.awakened && <span className="awakened-badge">Awakened</span>}
          </div>
        </div>
        <div className="header-resources">
          <span>🪙 {player?.gold?.toLocaleString() || 0}</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Monster Portrait and Level */}
      <div className="monster-portrait-section">
        <div className="portrait-frame" style={{ borderColor: rarityColors[template.rarity] }}>
          <span className="portrait-element">{elementEmojis[template.element]}</span>
          <span className="portrait-initial">{displayName.charAt(0)}</span>
        </div>
        <div className="level-info">
          <span className="level">Lv. {monster.level} / {maxLevel}</span>
          <div className="exp-bar">
            <div
              className="exp-fill"
              style={{ width: `${(monster.experience / (100 * monster.level)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        {(['info', 'skills', 'evolution', 'awakening', 'runes'] as TabType[]).map((tab) => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Info Tab */}
        {activeTab === 'info' && calculatedStats && (
          <div className="info-tab">
            <p className="description">{template.description}</p>

            <div className="stats-section">
              <h3>Stats</h3>
              <div className="stats-grid">
                {(['hp', 'atk', 'def', 'spd'] as const).map((stat) => (
                  <div key={stat} className="stat-row">
                    <span className="stat-name">{stat.toUpperCase()}</span>
                    <span className="stat-value">{calculatedStats[stat]}</span>
                  </div>
                ))}
                <div className="stat-row">
                  <span className="stat-name">Crit Rate</span>
                  <span className="stat-value">{calculatedStats.critRate}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Crit DMG</span>
                  <span className="stat-value">{calculatedStats.critDamage}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Accuracy</span>
                  <span className="stat-value">{calculatedStats.accuracy}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-name">Resistance</span>
                  <span className="stat-value">{calculatedStats.resistance}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="skills-tab">
            <div className="devilmon-info">
              <span>👿 Devilmons: {devilmons}</span>
              <button className="debug-btn" onClick={handleAddDebugMaterials}>
                + Debug Materials
              </button>
            </div>

            {template.skills.map((skill, index) => {
              const currentLevel = monster.skillLevels?.[index] || 1;
              const isMaxed = currentLevel >= MAX_SKILL_LEVEL;
              const cost = !isMaxed ? SKILL_UPGRADE_COSTS[currentLevel - 1] : null;
              const canUpgrade = cost && devilmons >= cost.devilmonRequired && (player?.gold || 0) >= cost.goldCost;

              return (
                <div key={skill.id} className="skill-card">
                  <div className="skill-header">
                    <span className="skill-number">{index + 1}</span>
                    <div className="skill-title">
                      <h4>{skill.name}</h4>
                      <span className="skill-level">
                        Lv. {currentLevel}/{MAX_SKILL_LEVEL}
                      </span>
                    </div>
                  </div>
                  <p className="skill-desc">{skill.description}</p>
                  {skill.cooldown > 0 && (
                    <span className="skill-cooldown">Cooldown: {skill.cooldown} turns</span>
                  )}
                  <div className="skill-multiplier">
                    Multiplier: {skill.multiplier}x ({skill.scalingStat.toUpperCase()})
                  </div>

                  {!isMaxed && cost && (
                    <div className="skill-upgrade">
                      <span className="upgrade-cost">
                        👿 {cost.devilmonRequired} + 🪙 {cost.goldCost.toLocaleString()}
                      </span>
                      <button
                        className="upgrade-btn"
                        onClick={() => handleSkillUpgrade(index)}
                        disabled={!canUpgrade}
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                  {isMaxed && <span className="maxed-badge">MAX</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Evolution Tab */}
        {activeTab === 'evolution' && (
          <div className="evolution-tab">
            {monster.stars >= 6 ? (
              <div className="max-evolution">
                <span className="max-icon">⭐</span>
                <h3>Maximum Evolution Reached</h3>
                <p>This monster is at 6★ - the highest grade!</p>
              </div>
            ) : evolutionReqs ? (
              <>
                <div className="evolution-info">
                  <h3>
                    Evolve to {evolutionReqs.targetStars}★
                  </h3>
                  <div className="evolution-requirements">
                    <div className={`requirement ${monster.level >= maxLevel ? 'met' : ''}`}>
                      <span>Level {maxLevel}</span>
                      <span>{monster.level >= maxLevel ? '✓' : `${monster.level}/${maxLevel}`}</span>
                    </div>
                    <div className={`requirement ${selectedFodder.length >= evolutionReqs.fodderCount ? 'met' : ''}`}>
                      <span>{evolutionReqs.fodderCount}x {evolutionReqs.fodderStars}★ Monsters</span>
                      <span>{selectedFodder.length}/{evolutionReqs.fodderCount}</span>
                    </div>
                    <div className={`requirement ${(player?.gold || 0) >= evolutionReqs.goldCost ? 'met' : ''}`}>
                      <span>🪙 {evolutionReqs.goldCost.toLocaleString()}</span>
                      <span>{(player?.gold || 0) >= evolutionReqs.goldCost ? '✓' : 'Need more gold'}</span>
                    </div>
                  </div>
                </div>

                {monster.level >= maxLevel && (
                  <>
                    <h4>Select Fodder Monsters</h4>
                    <div className="fodder-grid">
                      {availableFodder.map((fodder) => {
                        const fodderTemplate = getMonsterTemplate(fodder.templateId);
                        const isSelected = selectedFodder.includes(fodder.id);
                        return (
                          <div
                            key={fodder.id}
                            className={`fodder-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleFodder(fodder.id)}
                          >
                            <span className="fodder-icon">
                              {elementEmojis[fodderTemplate?.element || 'fire']}
                            </span>
                            <span className="fodder-name">
                              {fodderTemplate?.name || 'Unknown'}
                            </span>
                            <span className="fodder-level">Lv. {fodder.level}</span>
                            {isSelected && <span className="selected-check">✓</span>}
                          </div>
                        );
                      })}
                      {availableFodder.length === 0 && (
                        <p className="no-fodder">No suitable fodder monsters available</p>
                      )}
                    </div>

                    <button
                      className="evolve-button"
                      onClick={handleEvolve}
                      disabled={!canEvolve}
                    >
                      Evolve to {evolutionReqs.targetStars}★
                    </button>
                  </>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Awakening Tab */}
        {activeTab === 'awakening' && (
          <div className="awakening-tab">
            {monster.awakened ? (
              <div className="already-awakened">
                <span className="awakened-icon">✨</span>
                <h3>Already Awakened</h3>
                <p>
                  This monster has been awakened as <strong>{template.awakenedName}</strong>
                </p>
                {template.awakenBonus && (
                  <div className="awaken-bonus-display">
                    <h4>Awakening Bonuses</h4>
                    {Object.entries(template.awakenBonus).map(([stat, value]) => (
                      <div key={stat} className="bonus-row">
                        <span>{stat.toUpperCase()}</span>
                        <span>+{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : awakeningReqs ? (
              <>
                <div className="awakening-info">
                  <h3>Awaken to {template.awakenedName || 'Awakened Form'}</h3>

                  {template.awakenBonus && (
                    <div className="awaken-preview">
                      <h4>Bonuses</h4>
                      {Object.entries(template.awakenBonus).map(([stat, value]) => (
                        <div key={stat} className="bonus-preview">
                          <span>{stat.toUpperCase()}</span>
                          <span className="bonus-value">+{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="awakening-requirements">
                    <h4>Materials Required</h4>
                    {awakeningReqs.materials.map((mat) => {
                      const essenceInfo = ESSENCE_INFO[template.element][mat.essenceType];
                      const owned = essences[template.element][mat.essenceType];
                      const hasEnough = owned >= mat.quantity;
                      return (
                        <div key={mat.essenceType} className={`mat-row ${hasEnough ? 'met' : ''}`}>
                          <span className="mat-icon">{essenceInfo.icon}</span>
                          <span className="mat-name">{essenceInfo.name}</span>
                          <span className="mat-count">
                            {owned}/{mat.quantity}
                          </span>
                        </div>
                      );
                    })}
                    <div className={`mat-row ${(player?.gold || 0) >= awakeningReqs.goldCost ? 'met' : ''}`}>
                      <span className="mat-icon">🪙</span>
                      <span className="mat-name">Gold</span>
                      <span className="mat-count">
                        {(player?.gold || 0).toLocaleString()}/{awakeningReqs.goldCost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    className="awaken-button"
                    onClick={handleAwaken}
                    disabled={!canAwaken}
                  >
                    Awaken Monster
                  </button>

                  <button className="debug-btn" onClick={handleAddDebugMaterials}>
                    + Add Debug Materials
                  </button>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Runes Tab */}
        {activeTab === 'runes' && (
          <div className="runes-tab">
            <div className="rune-slots-grid">
              {([1, 2, 3, 4] as const).map((slot) => {
                const rune = equippedRunes.find((r) => r.slot === slot);
                return (
                  <div key={slot} className={`rune-slot ${rune ? 'filled' : 'empty'}`}>
                    {rune ? (
                      <>
                        <span className="rune-set">{rune.setType}</span>
                        <span className="rune-level">+{rune.level}</span>
                        <span className="rune-stars">{'★'.repeat(rune.stars)}</span>
                      </>
                    ) : (
                      <>
                        <span className="slot-number">{slot}</span>
                        <span className="empty-text">Empty</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="rune-actions">
              <button
                className="optimize-runes-btn"
                onClick={() => setShowOptimizer(true)}
              >
                🔮 Optimize Runes
              </button>
              <button
                className="manage-runes-btn"
                onClick={() => navigate('/runes')}
              >
                Manage Runes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rune Optimizer Modal */}
      {showOptimizer && monster && (
        <div className="optimizer-overlay" onClick={() => setShowOptimizer(false)}>
          <div className="optimizer-modal" onClick={(e) => e.stopPropagation()}>
            <RuneOptimizer
              monster={monster}
              allRunes={runes}
              onEquipRunes={handleEquipRunes}
              onClose={() => setShowOptimizer(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MonsterDetailScreen;
