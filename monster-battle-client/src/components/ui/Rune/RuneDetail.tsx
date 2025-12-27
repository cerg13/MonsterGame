import React, { useState } from 'react';
import type { PlayerRune } from '../../../types/player';
import {
  RUNE_SET_INFO,
  RUNE_RARITY_INFO,
  STAT_TYPE_INFO,
  formatStatValue,
  calculateUpgradeCost,
  calculateUpgradeSuccessRate,
  getMaxRuneLevel,
  calculateRuneEfficiency,
  upgradeRune,
  calculateMainStatValue,
} from '../../../utils/runeUtils';
import './Rune.css';

interface RuneDetailProps {
  rune: PlayerRune;
  onUpgrade?: (runeId: string, newRune: PlayerRune) => void;
  onEquip?: (runeId: string) => void;
  onUnequip?: (runeId: string) => void;
  onSell?: (runeId: string) => void;
  onClose?: () => void;
  playerGold?: number;
}

export const RuneDetail: React.FC<RuneDetailProps> = ({
  rune,
  onUpgrade,
  onEquip,
  onUnequip,
  onSell,
  onClose,
  playerGold = 0,
}) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<{ success: boolean; message: string } | null>(null);

  const setInfo = RUNE_SET_INFO[rune.setType];
  const rarityInfo = RUNE_RARITY_INFO[rune.rarity];
  const mainStatInfo = STAT_TYPE_INFO[rune.mainStat];

  const maxLevel = getMaxRuneLevel(rune.stars);
  const canUpgrade = rune.level < maxLevel;
  const upgradeCost = calculateUpgradeCost(rune);
  const successRate = calculateUpgradeSuccessRate(rune.level);
  const efficiency = calculateRuneEfficiency(rune);

  const nextLevelMainStat = canUpgrade
    ? calculateMainStatValue(rune.stars, rune.mainStat, rune.level + 1)
    : rune.mainStatValue;

  const handleUpgrade = () => {
    if (!canUpgrade || playerGold < upgradeCost) return;

    setIsUpgrading(true);
    setUpgradeResult(null);

    // Simulate upgrade animation delay
    setTimeout(() => {
      const result = upgradeRune(rune);

      if (result.success) {
        setUpgradeResult({
          success: true,
          message: result.addedSubStat
            ? `Success! New substat: ${STAT_TYPE_INFO[result.addedSubStat.type].name}`
            : 'Upgrade successful!',
        });
        onUpgrade?.(rune.id, result.newRune);
      } else {
        setUpgradeResult({
          success: false,
          message: 'Upgrade failed...',
        });
      }

      setIsUpgrading(false);
    }, 1000);
  };

  return (
    <div
      className="rune-detail"
      style={{
        '--set-color': setInfo.color,
        '--rarity-color': rarityInfo.color,
      } as React.CSSProperties}
    >
      {/* Header */}
      <div className="rune-detail-header">
        <div className="rune-detail-icon">
          {setInfo.icon}
        </div>
        <div className="rune-detail-title">
          <h3>{setInfo.name} Rune (Slot {rune.slot})</h3>
          <div className="rune-stars">
            {Array.from({ length: rune.stars }).map((_, i) => (
              <span key={i} className="star" style={{ color: '#ffd700' }}>★</span>
            ))}
          </div>
          <div className="rune-rarity">{rarityInfo.name}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="rune-detail-stats">
        <div className="detail-main-stat">
          <span className="stat-label">{mainStatInfo.name}</span>
          <span className="stat-value">
            {formatStatValue(rune.mainStat, rune.mainStatValue)}
            {canUpgrade && (
              <span style={{ color: '#4caf50', fontSize: '0.8em', marginLeft: '8px' }}>
                → {formatStatValue(rune.mainStat, nextLevelMainStat)}
              </span>
            )}
          </span>
        </div>

        {rune.subStats.length > 0 && (
          <div className="detail-sub-stats">
            {rune.subStats.map((subStat, index) => {
              const subStatInfo = STAT_TYPE_INFO[subStat.type];
              return (
                <div key={index} className="detail-sub-stat">
                  <span className="stat-label">{subStatInfo.name}</span>
                  <span className="stat-value">
                    {formatStatValue(subStat.type, subStat.value)}
                    {subStat.upgradeCount > 0 && (
                      <span className="grind-info">(+{subStat.upgradeCount})</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Set Bonus Info */}
      <div className="rune-set-bonus">
        <h4>{setInfo.icon} {setInfo.name} Set (2)</h4>
        <p>{setInfo.description}</p>
      </div>

      {/* Efficiency */}
      {rune.subStats.length > 0 && (
        <div style={{ textAlign: 'center', marginBottom: '16px', color: '#888', fontSize: '0.9rem' }}>
          Substat Efficiency: <span style={{ color: efficiency >= 80 ? '#ffd700' : efficiency >= 60 ? '#4caf50' : '#fff' }}>{efficiency}%</span>
        </div>
      )}

      {/* Upgrade Section */}
      {canUpgrade && (
        <div className="rune-upgrade-section" style={{ marginBottom: '16px' }}>
          <div className="upgrade-cost">
            <span className="gold-icon">🪙</span>
            <span className="cost-value">{upgradeCost.toLocaleString()}</span>
          </div>
          <div className="success-rate">
            Success Rate: <span>{successRate}%</span>
          </div>
        </div>
      )}

      {/* Upgrade Result */}
      {upgradeResult && (
        <div className={`upgrade-result ${upgradeResult.success ? 'success' : 'failed'}`}>
          <h4>{upgradeResult.success ? '✓' : '✗'} {upgradeResult.message}</h4>
        </div>
      )}

      {/* Actions */}
      <div className="rune-detail-actions">
        {canUpgrade && (
          <button
            className="rune-action-btn upgrade"
            onClick={handleUpgrade}
            disabled={isUpgrading || playerGold < upgradeCost}
          >
            {isUpgrading ? 'Upgrading...' : `Upgrade +${rune.level + 1}`}
          </button>
        )}

        {rune.equippedTo ? (
          <button
            className="rune-action-btn unequip"
            onClick={() => onUnequip?.(rune.id)}
          >
            Unequip
          </button>
        ) : (
          <button
            className="rune-action-btn equip"
            onClick={() => onEquip?.(rune.id)}
          >
            Equip
          </button>
        )}

        <button
          className="rune-action-btn sell"
          onClick={() => onSell?.(rune.id)}
          disabled={!!rune.equippedTo}
        >
          Sell
        </button>
      </div>
    </div>
  );
};

export default RuneDetail;
