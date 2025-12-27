import React from 'react';
import type { PlayerRune } from '../../../types/player';
import {
  RUNE_SET_INFO,
  RUNE_RARITY_INFO,
  STAT_TYPE_INFO,
  formatStatValue,
  calculateRuneEfficiency,
} from '../../../utils/runeUtils';
import { getRuneSetIcon } from '../../../assets/icons/runes';
import './Rune.css';

interface RuneCardProps {
  rune: PlayerRune;
  onClick?: () => void;
  selected?: boolean;
  compact?: boolean;
  showEfficiency?: boolean;
}

export const RuneCard: React.FC<RuneCardProps> = ({
  rune,
  onClick,
  selected = false,
  compact = false,
  showEfficiency = false,
}) => {
  const setInfo = RUNE_SET_INFO[rune.setType];
  const rarityInfo = RUNE_RARITY_INFO[rune.rarity];
  const mainStatInfo = STAT_TYPE_INFO[rune.mainStat];
  const efficiency = showEfficiency ? calculateRuneEfficiency(rune) : null;
  const RuneSetIcon = getRuneSetIcon(rune.setType);

  return (
    <div
      className={`rune-card ${selected ? 'selected' : ''} ${rune.rarity} ${compact ? 'compact' : ''}`}
      onClick={onClick}
      style={{ '--rarity-color': rarityInfo.color, '--set-color': setInfo.color } as React.CSSProperties}
    >
      {/* Rarity glow effect */}
      <div className="rune-glow" />

      {/* Rune slot badge */}
      <div className="rune-slot-badge">{rune.slot}</div>

      {/* Set icon and stars */}
      <div className="rune-header">
        <div className="rune-set-icon">
          <RuneSetIcon size={compact ? 24 : 32} quality={rune.rarity === 'legend' ? 'legendary' : rune.rarity === 'hero' ? 'epic' : rune.rarity === 'rare' ? 'rare' : 'common'} />
        </div>
        <div className="rune-stars">
          {Array.from({ length: rune.stars }).map((_, i) => (
            <span key={i} className="star">★</span>
          ))}
        </div>
      </div>

      {/* Rune visual */}
      <div className="rune-visual">
        <div className="rune-shape" style={{ borderColor: setInfo.color }}>
          <span className="rune-level">+{rune.level}</span>
        </div>
      </div>

      {/* Set name */}
      <div className="rune-set-name" style={{ color: setInfo.color }}>
        {setInfo.name}
      </div>

      {/* Main stat */}
      <div className="rune-main-stat">
        <span className="stat-name">{mainStatInfo.shortName}</span>
        <span className="stat-value">{formatStatValue(rune.mainStat, rune.mainStatValue)}</span>
      </div>

      {/* Sub stats (if not compact) */}
      {!compact && rune.subStats.length > 0 && (
        <div className="rune-sub-stats">
          {rune.subStats.map((subStat, index) => {
            const subStatInfo = STAT_TYPE_INFO[subStat.type];
            return (
              <div key={index} className="sub-stat">
                <span className="sub-stat-name">{subStatInfo.shortName}</span>
                <span className="sub-stat-value">
                  {formatStatValue(subStat.type, subStat.value)}
                  {subStat.upgradeCount > 0 && (
                    <span className="upgrade-count">(+{subStat.upgradeCount})</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Efficiency badge */}
      {showEfficiency && efficiency !== null && (
        <div className={`efficiency-badge ${efficiency >= 80 ? 'excellent' : efficiency >= 60 ? 'good' : 'average'}`}>
          {efficiency}%
        </div>
      )}

      {/* Equipped indicator */}
      {rune.equippedTo && (
        <div className="equipped-indicator">Equipped</div>
      )}
    </div>
  );
};

export default RuneCard;
