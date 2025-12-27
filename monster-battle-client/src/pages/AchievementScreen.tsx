import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAchievementStore, usePlayerStore, ACHIEVEMENTS, TITLES } from '../store';
import { useTranslations } from '../localization';
import { useNotification } from '../contexts/NotificationContext';
import { AchievementCard } from '../components/achievements';
import type { AchievementCategory } from '../store';
import type { Translations } from '../localization';
import './AchievementScreen.css';

const getCategoryInfo = (t: Translations): Record<AchievementCategory, { name: string; icon: string; color: string }> => ({
  combat: { name: t.achievements.categories.combat, icon: '⚔️', color: '#ff6b6b' },
  collection: { name: t.achievements.categories.collection, icon: '📦', color: '#feca57' },
  progression: { name: t.achievements.categories.progression, icon: '📈', color: '#1dd1a1' },
  social: { name: t.achievements.categories.social, icon: '🤝', color: '#48dbfb' },
  special: { name: t.achievements.categories.special, icon: '🌟', color: '#a55eea' },
});


export const AchievementScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const { achievement: achievementNotif } = useNotification();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const {
    claimReward,
    getCompletedCount,
    getTotalCount,
    getUnclaimedCount,
    getCategoryProgress,
    getProgress,
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

    // Get achievement for notification
    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
    const achievementName = achievement?.name || 'Achievement';

    // Apply reward to player
    let rewardText = '';
    switch (reward.type) {
      case 'crystals':
        updateResources({ crystals: player.crystals + (reward.amount ?? 0) });
        rewardText = `${reward.amount} 💎 Crystals`;
        break;
      case 'gold':
        updateResources({ gold: player.gold + (reward.amount ?? 0) });
        rewardText = `${reward.amount?.toLocaleString()} 💰 Gold`;
        break;
      case 'energy':
        updateResources({ energy: Math.min(player.energy + (reward.amount ?? 0), player.maxEnergy * 2) });
        rewardText = `${reward.amount} ⚡ Energy`;
        break;
      case 'summon_scroll':
        rewardText = `${reward.amount} 📜 Summon Scroll`;
        break;
      case 'title':
        const title = reward.titleId ? TITLES[reward.titleId] : null;
        rewardText = `Title: ${title?.name || reward.titleId}`;
        break;
      default:
        rewardText = 'Reward';
        break;
    }

    // Show achievement notification
    achievementNotif(`Claimed: ${achievementName} - ${rewardText}`, {
      title: '🎁 Achievement Claimed!',
      duration: 5000,
      priority: 'high',
    });
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
              progress={getProgress(achievement.id)}
              onClaim={() => handleClaim(achievement.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementScreen;
