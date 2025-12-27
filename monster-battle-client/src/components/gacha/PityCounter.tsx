import React from 'react';
import type { PityState } from '../../types/gacha';
import { calculateEffectiveSSRRate } from '../../types/gacha';
import './PityCounter.css';

interface PityCounterProps {
  pityState: PityState;
  compact?: boolean;
}

export const PityCounter: React.FC<PityCounterProps> = ({
  pityState,
  compact = false,
}) => {
  const {
    currentPity,
    softPityStart,
    hardPity,
  } = pityState;

  const pullsUntilHardPity = hardPity - currentPity;
  const pullsUntilSoftPity = Math.max(0, softPityStart - currentPity);
  const isSoftPityActive = currentPity >= softPityStart;
  const isNearHardPity = pullsUntilHardPity <= 10;

  // Calculate progress percentage
  const progressPercent = (currentPity / hardPity) * 100;

  // Get effective SSR rate
  const effectiveRate = calculateEffectiveSSRRate(currentPity);
  const effectiveRatePercent = (effectiveRate * 100).toFixed(2);

  // Determine bar color based on pity state
  const getBarColor = () => {
    if (isNearHardPity) return 'red';
    if (isSoftPityActive) return 'yellow';
    return 'cyan';
  };

  const barColor = getBarColor();

  if (compact) {
    return (
      <div className="pity-counter pity-compact">
        <div className="pity-compact-display">
          <span className="pity-value">{currentPity}/{hardPity}</span>
          {isSoftPityActive && <span className="soft-pity-badge">SOFT PITY</span>}
        </div>
        <div className="pity-progress-mini">
          <div
            className={`pity-progress-bar pity-${barColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`pity-counter ${isSoftPityActive ? 'soft-pity-active' : ''} ${isNearHardPity ? 'near-hard-pity' : ''}`}>
      {/* Header */}
      <div className="pity-header">
        <div className="pity-title">
          <span className="pity-icon">🎯</span>
          <span>Pity Counter</span>
          {isSoftPityActive && <span className="soft-pity-indicator">Soft Pity Active!</span>}
        </div>
        <div className="pity-tooltip">
          <span className="tooltip-icon">ℹ</span>
          <div className="tooltip-content">
            <h4>Pity System Explained</h4>
            <p>• Soft Pity starts at <strong>{softPityStart}</strong> pulls (+2.5% per pull)</p>
            <p>• Hard Pity at <strong>{hardPity}</strong> pulls (guaranteed SSR)</p>
            <p>• Counter resets on SSR pull</p>
            <p>• Current SSR Rate: <strong className="rate-highlight">{effectiveRatePercent}%</strong></p>
          </div>
        </div>
      </div>

      {/* Main Display */}
      <div className="pity-main">
        <div className="pity-numbers">
          <div className="pity-current">
            <span className="number-large">{currentPity}</span>
            <span className="number-separator">/</span>
            <span className="number-max">{hardPity}</span>
          </div>
          <div className="pity-label">Pulls without SSR</div>
        </div>

        {/* Progress Bar */}
        <div className="pity-progress-container">
          <div className="pity-progress-bg">
            <div
              className={`pity-progress-bar pity-${barColor}`}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            >
              <div className="progress-shine" />
            </div>

            {/* Soft Pity Marker */}
            <div
              className="soft-pity-marker"
              style={{ left: `${(softPityStart / hardPity) * 100}%` }}
            >
              <div className="marker-line" />
              <div className="marker-label">Soft Pity</div>
            </div>
          </div>

          {/* Progress Labels */}
          <div className="progress-labels">
            <span>0</span>
            <span className="soft-pity-text">{softPityStart}</span>
            <span>{hardPity}</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="pity-stats">
          <div className="stat-item">
            <div className="stat-value">
              {pullsUntilHardPity}
            </div>
            <div className="stat-label">Pulls until guaranteed SSR</div>
          </div>

          {!isSoftPityActive && pullsUntilSoftPity > 0 && (
            <div className="stat-item">
              <div className="stat-value secondary">
                {pullsUntilSoftPity}
              </div>
              <div className="stat-label">Pulls until soft pity</div>
            </div>
          )}

          <div className="stat-item">
            <div className={`stat-value ${isSoftPityActive ? 'highlight' : 'secondary'}`}>
              {effectiveRatePercent}%
            </div>
            <div className="stat-label">Current SSR Rate</div>
          </div>
        </div>

        {/* Warning Messages */}
        {isNearHardPity && (
          <div className="pity-warning">
            <span className="warning-icon">⚠️</span>
            <span>Guaranteed SSR in {pullsUntilHardPity} pull{pullsUntilHardPity > 1 ? 's' : ''}!</span>
          </div>
        )}

        {isSoftPityActive && !isNearHardPity && (
          <div className="pity-info">
            <span className="info-icon">✨</span>
            <span>Increased SSR rate active! ({effectiveRatePercent}%)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PityCounter;
