import React, { useState, useMemo } from 'react';
import type { PlayerMonster, PlayerRune, StatType } from '../../types/player';
import { getMonsterTemplate } from '../../data/monsters';
import { calculateMonsterStats } from '../../utils/statCalculator';
import './RuneOptimizer.css';

interface RuneOptimizerProps {
  monster: PlayerMonster;
  allRunes: PlayerRune[];
  onEquipRunes: (runeIds: string[]) => void;
  onClose: () => void;
}

type BuildType = 'damage' | 'tank' | 'speed' | 'balanced';

interface BuildPreset {
  name: string;
  icon: string;
  description: string;
  priorities: { stat: StatType; weight: number }[];
  recommendedSets: string[];
}

interface RuneRecommendation {
  runes: PlayerRune[];
  score: number;
  stats: {
    hp: number;
    atk: number;
    def: number;
    spd: number;
    critRate: number;
    critDamage: number;
  };
  setBonuses: string[];
}

const BUILD_PRESETS: Record<BuildType, BuildPreset> = {
  damage: {
    name: 'Damage Build',
    icon: '⚔️',
    description: 'Maximize attack power and critical damage',
    priorities: [
      { stat: 'atkPercent', weight: 10 },
      { stat: 'atk', weight: 8 },
      { stat: 'critRate', weight: 9 },
      { stat: 'critDamage', weight: 9 },
      { stat: 'spd', weight: 6 },
    ],
    recommendedSets: ['fatal', 'rage', 'blade'],
  },
  tank: {
    name: 'Tank Build',
    icon: '🛡️',
    description: 'Maximize survivability and defense',
    priorities: [
      { stat: 'hpPercent', weight: 10 },
      { stat: 'hp', weight: 8 },
      { stat: 'defPercent', weight: 9 },
      { stat: 'def', weight: 7 },
      { stat: 'resistance', weight: 5 },
    ],
    recommendedSets: ['energy', 'guard'],
  },
  speed: {
    name: 'Speed Build',
    icon: '⚡',
    description: 'Maximize speed and turn advantage',
    priorities: [
      { stat: 'spd', weight: 10 },
      { stat: 'accuracy', weight: 7 },
      { stat: 'atkPercent', weight: 6 },
      { stat: 'hpPercent', weight: 5 },
    ],
    recommendedSets: ['swift', 'energy'],
  },
  balanced: {
    name: 'Balanced Build',
    icon: '⚖️',
    description: 'Well-rounded stats for versatility',
    priorities: [
      { stat: 'hpPercent', weight: 7 },
      { stat: 'atkPercent', weight: 7 },
      { stat: 'defPercent', weight: 6 },
      { stat: 'spd', weight: 8 },
      { stat: 'critRate', weight: 5 },
    ],
    recommendedSets: ['swift', 'energy', 'fatal'],
  },
};

export const RuneOptimizer: React.FC<RuneOptimizerProps> = ({
  monster,
  allRunes,
  onEquipRunes,
  onClose,
}) => {
  const [selectedBuild, setSelectedBuild] = useState<BuildType>('damage');
  const [showOnlyUnequipped, setShowOnlyUnequipped] = useState(true);

  const template = getMonsterTemplate(monster.templateId);

  // Get current stats
  const currentRunes = allRunes.filter(r => r.equippedTo === monster.id);
  const currentStats = useMemo(() => {
    return calculateMonsterStats(template!, monster, currentRunes);
  }, [template, monster, currentRunes]);

  // Filter available runes
  const availableRunes = useMemo(() => {
    if (showOnlyUnequipped) {
      return allRunes.filter(r => !r.equippedTo || r.equippedTo === monster.id);
    }
    return allRunes;
  }, [allRunes, showOnlyUnequipped, monster.id]);

  // Calculate rune score based on build priorities
  const calculateRuneScore = (rune: PlayerRune, preset: BuildPreset): number => {
    let score = 0;

    // Main stat score
    const mainPriority = preset.priorities.find(p => p.stat === rune.mainStat);
    if (mainPriority) {
      score += mainPriority.weight * 10 * (rune.level / 15);
    }

    // Sub stats score
    rune.subStats.forEach(subStat => {
      const subPriority = preset.priorities.find(p => p.stat === subStat.type);
      if (subPriority) {
        score += subPriority.weight * subStat.value * 0.1;
      }
    });

    // Set bonus score
    if (preset.recommendedSets.includes(rune.setType)) {
      score += 15;
    }

    // Rarity bonus
    const rarityBonus = {
      common: 1,
      magic: 1.2,
      rare: 1.4,
      hero: 1.6,
      legend: 2,
    };
    score *= rarityBonus[rune.rarity];

    // Star rating bonus
    score *= (rune.stars / 6);

    return score;
  };

  // Generate best build recommendation
  const bestBuild = useMemo((): RuneRecommendation => {
    const preset = BUILD_PRESETS[selectedBuild];
    const runesBySlot: Record<number, PlayerRune[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
    };

    // Group runes by slot
    availableRunes.forEach(rune => {
      runesBySlot[rune.slot].push(rune);
    });

    // Score and sort runes for each slot
    Object.keys(runesBySlot).forEach(slotKey => {
      const slot = parseInt(slotKey);
      runesBySlot[slot].sort((a, b) => {
        const scoreA = calculateRuneScore(a, preset);
        const scoreB = calculateRuneScore(b, preset);
        return scoreB - scoreA;
      });
    });

    // Select best rune for each slot
    const selectedRunes: PlayerRune[] = [];
    [1, 2, 3, 4].forEach(slot => {
      if (runesBySlot[slot].length > 0) {
        selectedRunes.push(runesBySlot[slot][0]);
      }
    });

    // Calculate total score
    const totalScore = selectedRunes.reduce((sum, rune) => {
      return sum + calculateRuneScore(rune, preset);
    }, 0);

    // Calculate projected stats
    const projectedStats = calculateMonsterStats(template!, monster, selectedRunes);

    // Detect set bonuses
    const setCounts: Record<string, number> = {};
    selectedRunes.forEach(rune => {
      setCounts[rune.setType] = (setCounts[rune.setType] || 0) + 1;
    });
    const setBonuses = Object.entries(setCounts)
      .filter(([_, count]) => count >= 2)
      .map(([set, _]) => set);

    return {
      runes: selectedRunes,
      score: Math.round(totalScore),
      stats: projectedStats,
      setBonuses,
    };
  }, [selectedBuild, availableRunes, template, monster]);

  // Calculate stat improvements
  const statImprovements = useMemo(() => {
    return {
      hp: bestBuild.stats.hp - currentStats.hp,
      atk: bestBuild.stats.atk - currentStats.atk,
      def: bestBuild.stats.def - currentStats.def,
      spd: bestBuild.stats.spd - currentStats.spd,
      critRate: bestBuild.stats.critRate - currentStats.critRate,
      critDamage: bestBuild.stats.critDamage - currentStats.critDamage,
    };
  }, [bestBuild.stats, currentStats]);

  const handleEquipRecommended = () => {
    const runeIds = bestBuild.runes.map(r => r.id);
    onEquipRunes(runeIds);
  };

  const formatStatValue = (stat: string, value: number): string => {
    if (stat === 'critRate' || stat === 'critDamage') {
      return `${Math.round(value)}%`;
    }
    return Math.round(value).toString();
  };

  const getImprovementColor = (value: number): string => {
    if (value > 0) return '#26de81';
    if (value < 0) return '#fc5c65';
    return 'rgba(255, 255, 255, 0.5)';
  };

  return (
    <div className="rune-optimizer">
      <div className="optimizer-header">
        <div className="header-content">
          <h2 className="optimizer-title">
            <span className="title-icon">🔮</span>
            Rune Optimizer
          </h2>
          <p className="monster-name">{template?.name} (Lv.{monster.level} ⭐{monster.stars})</p>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      {/* Build Selection */}
      <div className="build-selection">
        <h3 className="section-title">Select Build Type</h3>
        <div className="build-grid">
          {(Object.keys(BUILD_PRESETS) as BuildType[]).map(buildKey => {
            const preset = BUILD_PRESETS[buildKey];
            return (
              <button
                key={buildKey}
                className={`build-card ${selectedBuild === buildKey ? 'active' : ''}`}
                onClick={() => setSelectedBuild(buildKey)}
              >
                <span className="build-icon">{preset.icon}</span>
                <span className="build-name">{preset.name}</span>
                <span className="build-desc">{preset.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Options */}
      <div className="optimizer-options">
        <label className="option-toggle">
          <input
            type="checkbox"
            checked={showOnlyUnequipped}
            onChange={(e) => setShowOnlyUnequipped(e.target.checked)}
          />
          <span className="toggle-label">Only show unequipped runes</span>
        </label>
      </div>

      {/* Recommendation */}
      <div className="recommendation-section">
        <div className="section-header">
          <h3 className="section-title">Recommended Build</h3>
          <div className="build-score">
            <span className="score-label">Score:</span>
            <span className="score-value">{bestBuild.score}</span>
          </div>
        </div>

        {/* Recommended Runes */}
        <div className="recommended-runes">
          {bestBuild.runes.length === 0 ? (
            <div className="no-runes">
              <span className="no-runes-icon">📦</span>
              <p>No suitable runes available</p>
            </div>
          ) : (
            <div className="rune-slots">
              {[1, 2, 3, 4].map(slot => {
                const rune = bestBuild.runes.find(r => r.slot === slot);
                return (
                  <div key={slot} className={`rune-slot ${rune ? 'filled' : 'empty'}`}>
                    <div className="slot-number">Slot {slot}</div>
                    {rune ? (
                      <div className="rune-info">
                        <div className="rune-header">
                          <span className="rune-set">{rune.setType}</span>
                          <span className="rune-stars">{'⭐'.repeat(rune.stars)}</span>
                        </div>
                        <div className="rune-main-stat">
                          {rune.mainStat} +{Math.round(rune.mainStatValue)}
                        </div>
                        {rune.equippedTo && rune.equippedTo !== monster.id && (
                          <div className="equipped-warning">⚠️ Equipped</div>
                        )}
                      </div>
                    ) : (
                      <div className="empty-slot">Empty</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Set Bonuses */}
        {bestBuild.setBonuses.length > 0 && (
          <div className="set-bonuses">
            <h4 className="bonuses-title">✨ Set Bonuses Active:</h4>
            <div className="bonus-tags">
              {bestBuild.setBonuses.map(set => (
                <span key={set} className="bonus-tag">
                  {set}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stat Comparison */}
        <div className="stat-comparison">
          <h4 className="comparison-title">📊 Stat Changes</h4>
          <div className="stats-grid">
            {Object.entries(statImprovements).map(([stat, improvement]) => (
              <div key={stat} className="stat-row">
                <span className="stat-name">{stat.toUpperCase()}</span>
                <span className="stat-current">{formatStatValue(stat, currentStats[stat as keyof typeof currentStats])}</span>
                <span className="stat-arrow">→</span>
                <span className="stat-new">{formatStatValue(stat, bestBuild.stats[stat as keyof typeof bestBuild.stats])}</span>
                <span
                  className="stat-change"
                  style={{ color: getImprovementColor(improvement) }}
                >
                  {improvement > 0 ? '+' : ''}{formatStatValue(stat, improvement)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="optimizer-actions">
          <button
            className="equip-btn"
            onClick={handleEquipRecommended}
            disabled={bestBuild.runes.length === 0}
          >
            <span className="btn-icon">⚡</span>
            Auto-Equip Recommended Build
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuneOptimizer;
