import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAchievementStore, usePlayerStore, ACHIEVEMENTS, TITLES } from '../store';
import { useTranslations } from '../localization';
import type { Achievement, AchievementCategory, AchievementTier } from '../store';
import type { Translations } from '../localization';
import './AchievementScreen.css';

const getCategoryInfo = (t: Translations): Record<AchievementCategory, { name: string; icon: string; color: string }> => ({
  combat: { name: t.achievements.categories.combat, icon: '⚔️', color: '#ff6b6b' },
  collection: { name: t.achievements.categories.collection, icon: '📦', color: '#feca57' },
  progression: { name: t.achievements.categories.progression, icon: '📈', color: '#1dd1a1' },
  social: { name: t.achievements.categories.social, icon: '🤝', color: '#48dbfb' },
  special: { name: t.achievements.categories.special, icon: '🌟', color: '#a55eea' },
});

const TIER_COLORS: Record<AchievementTier, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
};

interface AchievementCardProps {
  achievement: Achievement;
  onClaim: () => void;
  t: Translations;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onClaim, t }) => {
  const progress = useAchievementStore((state) => state.getProgress(achievement.id));
  const currentValue = progress?.currentValue ?? 0;
  const isCompleted = progress?.completed ?? false;
  const isClaimed = progress?.claimed ?? false;
  const progressPercent = Math.min((currentValue / achievement.targetValue) * 100, 100);

  // Get localized name and description
  const achievementName = t.achievements.names[achievement.id as keyof typeof t.achievements.names] || achievement.name;
  const achievementDescription = t.achievements.descriptions[achievement.id as keyof typeof t.achievements.descriptions] || achievement.description;

  // Hide hidden achievements that aren't completed
  if (achievement.hidden && !isCompleted) {
    return (
      <div className="achievement-card hidden">
        <div className="achievement-icon">❓</div>
        <div className="achievement-info">
          <h3 className="achievement-name">{t.achievements.hidden}</h3>
          <p className="achievement-description">{t.achievements.hiddenDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`achievement-card ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}`}>
      {achievement.tier && (
        <div
          className="tier-badge"
          style={{ backgroundColor: TIER_COLORS[achievement.tier] }}
        >
          {t.achievements.tiers[achievement.tier].charAt(0).toUpperCase()}
        </div>
      )}

      <div className="achievement-icon">{achievement.icon}</div>

      <div className="achievement-info">
        <h3 className="achievement-name">{achievementName}</h3>
        <p className="achievement-description">{achievementDescription}</p>

        <div className="achievement-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="progress-text">
            {currentValue.toLocaleString()} / {achievement.targetValue.toLocaleString()}
          </span>
        </div>

        <div className="achievement-reward">
          <span className="reward-label">{t.achievements.reward}:</span>
          <span className="reward-value">
            {formatReward(achievement.reward, t)}
          </span>
        </div>
      </div>

      {isCompleted && !isClaimed && (
        <button className="claim-btn" onClick={onClaim}>
          {t.common.claim}
        </button>
      )}

      {isClaimed && (
        <div className="claimed-badge">
          <span>✓</span>
        </div>
      )}
    </div>
  );
};

function formatReward(reward: Achievement['reward'], t: Translations): string {
  if (reward.type === 'title' && reward.titleId) {
    const title = TITLES[reward.titleId];
    return `${title?.name ?? reward.titleId}`;
  }
  const icons: Record<string, string> = {
    crystals: '💎',
    gold: '🪙',
    energy: '⚡',
    summon_scroll: '📜',
  };
  const resourceNames: Record<string, string> = {
    crystals: t.resources.crystals,
    gold: t.resources.gold,
    energy: t.resources.energy,
    summon_scroll: t.resources.summonScrolls,
  };
  return `${icons[reward.type] || ''} ${reward.amount?.toLocaleString() ?? ''} ${resourceNames[reward.type] || reward.type}`;
}

export const AchievementScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const {
    claimReward,
    getCompletedCount,
    getTotalCount,
    getUnclaimedCount,
    getCategoryProgress,
  } = useAchievementStore();

  const { player, updateResources } = usePlayerStore();
  const CATEGORY_INFO = getCategoryInfo(t);

  const filteredAchievements = useMemo(() => {
    let achievements = ACHIEVEMENTS;

    if (selectedCategory !== 'all') {
      achievements = achievements.filter((a) => a.category === selectedCategory);
    }

    if (!showCompleted) {
      const completedIds = useAchievementStore.getState().progress
        .filter((p) => p.completed)
        .map((p) => p.achievementId);
      achievements = achievements.filter((a) => !completedIds.includes(a.id));
    }

    return achievements;
  }, [selectedCategory, showCompleted]);

  const handleClaim = (achievementId: string) => {
    const reward = claimReward(achievementId);
    if (!reward || !player) return;

    // Apply reward to player
    switch (reward.type) {
      case 'crystals':
        updateResources({ crystals: player.crystals + (reward.amount ?? 0) });
        break;
      case 'gold':
        updateResources({ gold: player.gold + (reward.amount ?? 0) });
        break;
      case 'energy':
        updateResources({ energy: Math.min(player.energy + (reward.amount ?? 0), player.maxEnergy * 2) });
        break;
      // summon_scroll and title rewards need inventory/profile system
      default:
        break;
    }
  };

  const completedCount = getCompletedCount();
  const totalCount = getTotalCount();
  const unclaimedCount = getUnclaimedCount();
  const overallProgress = (completedCount / totalCount) * 100;

  return (
    <div className="achievement-screen">
      {/* Background */}
      <div className="achievement-bg">
        <div className="bg-pattern" />
      </div>

      {/* Header */}
      <div className="achievement-header">
        <button className="back-button" onClick={() => navigate('/')}>
          &larr; {t.common.back}
        </button>
        <h1>{t.achievements.title}</h1>
        <div className="header-stats">
          <span className="completed-count">
            {completedCount}/{totalCount}
          </span>
          {unclaimedCount > 0 && (
            <span className="unclaimed-badge">{unclaimedCount} {t.achievements.toClaim}</span>
          )}
        </div>
      </div>

      {/* Overall progress */}
      <div className="overall-progress">
        <div className="progress-bar-large">
          <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>
        <span className="progress-percentage">{Math.round(overallProgress)}% {t.achievements.complete}</span>
      </div>

      {/* Category tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <span className="tab-icon">🏆</span>
          <span className="tab-name">{t.achievements.all}</span>
        </button>
        {(Object.keys(CATEGORY_INFO) as AchievementCategory[]).map((category) => {
          const info = CATEGORY_INFO[category];
          const categoryProgress = getCategoryProgress(category);
          return (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
              style={{ '--category-color': info.color } as React.CSSProperties}
            >
              <span className="tab-icon">{info.icon}</span>
              <span className="tab-name">{info.name}</span>
              <span className="tab-progress">
                {categoryProgress.completed}/{categoryProgress.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter toggle */}
      <div className="filter-bar">
        <label className="filter-toggle">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          <span className="toggle-label">{t.achievements.showCompleted}</span>
        </label>
      </div>

      {/* Achievement list */}
      <div className="achievement-list">
        {filteredAchievements.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎯</span>
            <p>{t.achievements.noAchievements}</p>
          </div>
        ) : (
          filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onClaim={() => handleClaim(achievement.id)}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementScreen;
