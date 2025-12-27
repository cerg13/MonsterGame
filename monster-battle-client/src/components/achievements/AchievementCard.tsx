import React from 'react';
import type { Achievement, AchievementProgress, AchievementTier } from '../../store/useAchievementStore';
import './AchievementCard.css';

interface AchievementCardProps {
  achievement: Achievement;
  progress?: AchievementProgress;
  onClaim?: () => void;
  compact?: boolean;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  progress,
  onClaim,
  compact = false,
}) => {
  const isCompleted = progress?.completed ?? false;
  const isClaimed = progress?.claimed ?? false;
  const currentValue = progress?.currentValue ?? 0;
  const progressPercent = Math.min((currentValue / achievement.targetValue) * 100, 100);

  // For hidden achievements that aren't unlocked yet
  const isHidden = achievement.hidden && !isCompleted;

  const getTierColor = (tier?: AchievementTier): string => {
    if (!tier) return '#48dbfb';
    const colors: Record<AchievementTier, string> = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
    };
    return colors[tier];
  };

  const getTierName = (tier?: AchievementTier): string => {
    if (!tier) return '';
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      combat: '#fc5c65',
      collection: '#45aaf2',
      progression: '#26de81',
      social: '#fed330',
      special: '#a55eea',
    };
    return colors[category] || '#ffffff';
  };

  const getRewardDisplay = () => {
    const { type, amount, titleId } = achievement.reward;
    if (type === 'title' && titleId) {
      return `Title: ${titleId.replace(/_/g, ' ')}`;
    }
    if (type === 'crystals') return `${amount} 💎`;
    if (type === 'gold') return `${amount?.toLocaleString()} 💰`;
    if (type === 'energy') return `${amount} ⚡`;
    if (type === 'summon_scroll') return `${amount} 📜`;
    return 'Reward';
  };

  if (compact) {
    return (
      <div className={`achievement-card-compact ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}`}>
        <div className="compact-icon">{achievement.icon}</div>
        <div className="compact-content">
          <div className="compact-name">{isHidden ? '???' : achievement.name}</div>
          <div className="compact-progress">
            {currentValue} / {achievement.targetValue}
          </div>
        </div>
        {isCompleted && !isClaimed && (
          <button className="compact-claim" onClick={onClaim}>
            Claim
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`achievement-card ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''} ${isHidden ? 'hidden' : ''}`}
      data-category={achievement.category}
      data-tier={achievement.tier}
    >
      {/* Background Glow */}
      <div className="card-glow" style={{ background: getCategoryColor(achievement.category) }} />

      {/* Tier Badge */}
      {achievement.tier && !isHidden && (
        <div className="tier-badge" style={{ background: getTierColor(achievement.tier) }}>
          {getTierName(achievement.tier)}
        </div>
      )}

      {/* Main Content */}
      <div className="card-header">
        <div className="achievement-icon" style={{ borderColor: getCategoryColor(achievement.category) }}>
          <span>{isHidden ? '🔒' : achievement.icon}</span>
          {isCompleted && !isClaimed && <div className="icon-pulse" />}
        </div>
        <div className="achievement-info">
          <h3 className="achievement-name">{isHidden ? '???' : achievement.name}</h3>
          <p className="achievement-description">
            {isHidden ? 'Hidden achievement. Complete to reveal!' : achievement.description}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {!isHidden && (
        <div className="progress-section">
          <div className="progress-info">
            <span className="progress-label">Progress</span>
            <span className="progress-value">
              {currentValue.toLocaleString()} / {achievement.targetValue.toLocaleString()}
            </span>
          </div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progressPercent}%`,
                background: isCompleted
                  ? `linear-gradient(90deg, #26de81, #20bf6b)`
                  : `linear-gradient(90deg, ${getCategoryColor(achievement.category)}, ${getCategoryColor(achievement.category)}dd)`,
              }}
            >
              {isCompleted && <div className="progress-shimmer" />}
            </div>
          </div>
          <div className="progress-percentage">{progressPercent.toFixed(0)}%</div>
        </div>
      )}

      {/* Reward */}
      {!isHidden && (
        <div className="reward-section">
          <span className="reward-label">Reward:</span>
          <span className="reward-value">{getRewardDisplay()}</span>
        </div>
      )}

      {/* Claim Button */}
      {isCompleted && !isClaimed && !isHidden && (
        <button className="claim-button" onClick={onClaim}>
          <span className="claim-icon">🎁</span>
          <span>Claim Reward</span>
        </button>
      )}

      {/* Claimed Badge */}
      {isClaimed && (
        <div className="claimed-badge">
          <span className="claimed-icon">✓</span>
          <span>Claimed</span>
        </div>
      )}

      {/* Completed But Not Claimed Badge */}
      {isCompleted && !isClaimed && (
        <div className="unclaimed-indicator">
          <span className="unclaimed-pulse" />
        </div>
      )}

      {/* Category Badge */}
      <div
        className="category-badge"
        style={{
          background: getCategoryColor(achievement.category),
        }}
      >
        {achievement.category}
      </div>
    </div>
  );
};

export default AchievementCard;
