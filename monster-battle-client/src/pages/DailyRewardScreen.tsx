import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDailyRewardStore, usePlayerStore, DAILY_REWARDS, MILESTONE_REWARDS } from '../store';
import { useAchievementTracker } from '../hooks/useAchievementTracker';
import { useTranslations } from '../localization';
import type { DailyReward } from '../store';
import './DailyRewardScreen.css';

export const DailyRewardScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const [claimedReward, setClaimedReward] = useState<DailyReward | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const {
    currentStreak,
    totalDaysLoggedIn,
    hasClaimedToday,
    claimDailyReward,
    checkAndResetStreak,
    canClaimToday,
    getTodayReward,
    getNextMilestone,
  } = useDailyRewardStore();

  const { player, updateResources } = usePlayerStore();
  const { trackDailyStreak } = useAchievementTracker();

  // Check streak on mount
  useEffect(() => {
    checkAndResetStreak();
  }, [checkAndResetStreak]);

  const handleClaim = () => {
    if (!canClaimToday() || !player) return;

    const reward = claimDailyReward();
    if (!reward) return;

    // Apply reward to player
    switch (reward.type) {
      case 'crystals':
        updateResources({ crystals: player.crystals + reward.amount });
        break;
      case 'gold':
        updateResources({ gold: player.gold + reward.amount });
        break;
      case 'energy':
        updateResources({ energy: Math.min(player.energy + reward.amount, player.maxEnergy * 2) });
        break;
      // summon_scroll, mystical_scroll, devilmon would need inventory system
      default:
        break;
    }

    setClaimedReward(reward);
    setShowCelebration(true);

    // Track daily achievements and quests
    const newStreak = useDailyRewardStore.getState().currentStreak;
    trackDailyStreak(newStreak);

    // Hide celebration after animation
    setTimeout(() => {
      setShowCelebration(false);
    }, 2000);
  };

  const todayReward = getTodayReward();
  const nextMilestone = getNextMilestone();
  const dayInCycle = (currentStreak % 7) + 1;

  return (
    <div className="daily-reward-screen">
      {/* Background effects */}
      <div className="daily-reward-bg">
        <div className="bg-stars" />
        <div className="bg-glow" />
      </div>

      {/* Header */}
      <div className="daily-reward-header">
        <button className="back-button" onClick={() => navigate('/')}>
          &larr; {t.common.back}
        </button>
        <h1>{t.dailyRewards.title}</h1>
        <div className="streak-info">
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{currentStreak}</span>
          <span className="streak-label">{t.dailyRewards.dayStreak}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="daily-reward-content">
        {/* Weekly calendar */}
        <div className="reward-calendar">
          <h2>{t.dailyRewards.weeklyRewards}</h2>
          <div className="calendar-grid">
            {DAILY_REWARDS.map((reward, index) => {
              const dayNum = index + 1;
              const isClaimed = hasClaimedToday
                ? dayNum <= dayInCycle
                : dayNum < dayInCycle;
              const isToday = dayNum === dayInCycle;
              const isLocked = dayNum > dayInCycle;

              return (
                <div
                  key={reward.day}
                  className={`calendar-day ${isClaimed ? 'claimed' : ''} ${isToday ? 'today' : ''} ${isLocked ? 'locked' : ''}`}
                >
                  <div className="day-number">{t.common.day} {dayNum}</div>
                  <div className="day-icon">{reward.icon}</div>
                  <div className="day-reward">{reward.label}</div>
                  {isClaimed && <div className="claimed-check">✓</div>}
                  {isToday && !hasClaimedToday && (
                    <div className="today-indicator">{t.common.today.toUpperCase()}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's reward card */}
        <div className="today-reward-section">
          <div className={`today-reward-card ${showCelebration ? 'celebrating' : ''}`}>
            <h3>{t.dailyRewards.todayReward}</h3>
            <div className="reward-display">
              <span className="reward-icon-large">{todayReward.icon}</span>
              <span className="reward-label-large">{todayReward.label}</span>
            </div>

            <button
              className={`claim-button ${hasClaimedToday ? 'claimed' : ''}`}
              onClick={handleClaim}
              disabled={hasClaimedToday}
            >
              {hasClaimedToday ? t.common.claimed + '!' : t.dailyRewards.claimReward}
            </button>

            {/* Celebration effects */}
            {showCelebration && (
              <div className="celebration-effects">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="celebration-particle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      backgroundColor: ['#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1'][Math.floor(Math.random() * 4)],
                    }}
                  />
                ))}
                <div className="celebration-text">+{claimedReward?.label}</div>
              </div>
            )}
          </div>
        </div>

        {/* Milestone progress */}
        <div className="milestone-section">
          <h2>{t.dailyRewards.monthlyMilestones}</h2>
          <div className="milestone-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(totalDaysLoggedIn % 28) / 28 * 100}%` }}
              />
            </div>
            <div className="progress-label">
              {totalDaysLoggedIn % 28} / 28 {t.common.days.toLowerCase()}
            </div>
          </div>

          <div className="milestone-grid">
            {MILESTONE_REWARDS.map((reward, index) => {
              const milestoneDay = (index + 1) * 7;
              const isClaimed = (totalDaysLoggedIn % 28) >= milestoneDay;
              const isNext = nextMilestone?.day === milestoneDay;

              return (
                <div
                  key={index}
                  className={`milestone-item ${isClaimed ? 'claimed' : ''} ${isNext ? 'next' : ''}`}
                >
                  <div className="milestone-day">{t.common.day} {milestoneDay}</div>
                  <div className="milestone-icon">{reward.icon}</div>
                  <div className="milestone-reward">{reward.label}</div>
                  {isClaimed && <div className="milestone-check">✓</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-value">{totalDaysLoggedIn}</span>
            <span className="stat-label">{t.dailyRewards.totalDays}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{currentStreak}</span>
            <span className="stat-label">{t.dailyRewards.currentStreak}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{Math.floor(totalDaysLoggedIn / 7)}</span>
            <span className="stat-label">{t.dailyRewards.weeksActive}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRewardScreen;
