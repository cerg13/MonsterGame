import React, { useMemo } from 'react';
import { useLoyaltyStore } from '../../store/useLoyaltyStore';
import { useNotification } from '../../contexts/NotificationContext';
import './DailyCheckInCalendar.css';

interface DailyCheckInCalendarProps {
  onClaim?: () => void;
}

interface DayReward {
  day: number;
  lp: number;
  bonus?: {
    type: 'energy' | 'crystals' | 'gold' | 'devilmon' | 'scroll';
    amount: number;
    name: string;
  };
  isMilestone?: boolean;
}

// Define 30-day reward structure
const getDayReward = (day: number): DayReward => {
  const baseLp = 50;

  // Milestone bonuses
  if (day === 7) {
    return {
      day,
      lp: baseLp * 2,
      bonus: { type: 'energy', amount: 50, name: '50 Energy' },
      isMilestone: true,
    };
  }
  if (day === 14) {
    return {
      day,
      lp: baseLp * 2,
      bonus: { type: 'crystals', amount: 100, name: '100 Crystals' },
      isMilestone: true,
    };
  }
  if (day === 21) {
    return {
      day,
      lp: baseLp * 3,
      bonus: { type: 'gold', amount: 50000, name: '50K Gold' },
      isMilestone: true,
    };
  }
  if (day === 30) {
    return {
      day,
      lp: baseLp * 5,
      bonus: { type: 'scroll', amount: 1, name: 'Mystical Scroll' },
      isMilestone: true,
    };
  }

  // Regular days
  return { day, lp: baseLp };
};

export const DailyCheckInCalendar: React.FC<DailyCheckInCalendarProps> = ({
  onClaim,
}) => {
  const { success, achievement } = useNotification();
  const visitStreak = useLoyaltyStore((state) => state.visitStreak);
  const lastVisitDate = useLoyaltyStore((state) => state.lastVisitDate);
  const recordVisit = useLoyaltyStore((state) => state.recordVisit);

  // Check if today's check-in is available
  const today = new Date().toISOString().split('T')[0];
  const isCheckedInToday = lastVisitDate === today;
  const currentDay = visitStreak > 0 && isCheckedInToday ? visitStreak : visitStreak + 1;

  // Generate 30 days
  const days = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => getDayReward(i + 1));
  }, []);

  const handleCheckIn = () => {
    if (isCheckedInToday) {
      return;
    }

    const result = recordVisit();

    if (result.lpEarned > 0) {
      const reward = getDayReward(result.newStreak);

      // Show appropriate notification
      if (reward.isMilestone) {
        achievement(
          `Day ${result.newStreak} Milestone! Earned ${result.lpEarned} LP + ${reward.bonus?.name}`,
          {
            title: '🎉 Daily Check-In Milestone',
            duration: 6000,
            priority: 'high',
          }
        );
      } else {
        success(`Day ${result.newStreak} Check-In! Earned ${result.lpEarned} LP`, {
          title: '✓ Daily Check-In',
          duration: 4000,
        });
      }

      onClaim?.();
    }
  };

  const getDayStatus = (day: number): 'claimed' | 'current' | 'upcoming' | 'locked' => {
    if (day < currentDay) return 'claimed';
    if (day === currentDay && !isCheckedInToday) return 'current';
    if (day === currentDay && isCheckedInToday) return 'claimed';
    if (day === currentDay + 1) return 'upcoming';
    return 'locked';
  };

  return (
    <div className="daily-checkin-calendar">
      {/* Header */}
      <div className="calendar-header">
        <div className="header-title">
          <span className="title-icon">📅</span>
          <h3>Daily Check-In</h3>
        </div>
        <div className="streak-display">
          <span className="streak-label">Current Streak:</span>
          <span className="streak-value">{visitStreak} {visitStreak === 1 ? 'day' : 'days'}</span>
          {visitStreak >= 7 && <span className="streak-fire">🔥</span>}
        </div>
      </div>

      {/* Today's Reward Preview */}
      {!isCheckedInToday && (
        <div className="today-reward-preview">
          <div className="preview-content">
            <span className="preview-label">Today's Reward:</span>
            <div className="preview-rewards">
              <div className="reward-item">
                <span className="reward-icon">⭐</span>
                <span className="reward-value">{getDayReward(currentDay).lp} LP</span>
              </div>
              {getDayReward(currentDay).bonus && (
                <div className="reward-item bonus">
                  <span className="reward-icon">
                    {getDayReward(currentDay).bonus?.type === 'energy' && '⚡'}
                    {getDayReward(currentDay).bonus?.type === 'crystals' && '💎'}
                    {getDayReward(currentDay).bonus?.type === 'gold' && '💰'}
                    {getDayReward(currentDay).bonus?.type === 'scroll' && '📜'}
                  </span>
                  <span className="reward-value">{getDayReward(currentDay).bonus?.name}</span>
                </div>
              )}
            </div>
          </div>
          <button
            className="checkin-button"
            onClick={handleCheckIn}
            disabled={isCheckedInToday}
          >
            {isCheckedInToday ? '✓ Checked In' : 'Check In Now'}
          </button>
        </div>
      )}

      {isCheckedInToday && (
        <div className="checkin-complete">
          <span className="complete-icon">✓</span>
          <span>Checked in today! Come back tomorrow for Day {currentDay + 1}</span>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {days.map((reward) => {
          const status = getDayStatus(reward.day);
          const isActive = status === 'current';

          return (
            <div
              key={reward.day}
              className={`calendar-day ${status} ${reward.isMilestone ? 'milestone' : ''}`}
              data-active={isActive}
            >
              {/* Day Number */}
              <div className="day-number">
                <span>Day {reward.day}</span>
                {reward.isMilestone && <span className="milestone-badge">⭐</span>}
              </div>

              {/* Rewards */}
              <div className="day-rewards">
                <div className="reward-lp">{reward.lp} LP</div>
                {reward.bonus && (
                  <div className="reward-bonus">
                    {reward.bonus.type === 'energy' && '⚡'}
                    {reward.bonus.type === 'crystals' && '💎'}
                    {reward.bonus.type === 'gold' && '💰'}
                    {reward.bonus.type === 'scroll' && '📜'}
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              {status === 'claimed' && (
                <div className="day-claimed-overlay">
                  <span className="claimed-check">✓</span>
                </div>
              )}

              {status === 'current' && !isCheckedInToday && (
                <div className="day-current-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Milestone Info */}
      <div className="milestone-info">
        <h4>Milestone Rewards</h4>
        <div className="milestone-list">
          <div className="milestone-item">
            <span className="milestone-day">Day 7:</span>
            <span className="milestone-reward">100 LP + 50 Energy</span>
          </div>
          <div className="milestone-item">
            <span className="milestone-day">Day 14:</span>
            <span className="milestone-reward">100 LP + 100 Crystals</span>
          </div>
          <div className="milestone-item">
            <span className="milestone-day">Day 21:</span>
            <span className="milestone-reward">150 LP + 50K Gold</span>
          </div>
          <div className="milestone-item">
            <span className="milestone-day">Day 30:</span>
            <span className="milestone-reward">250 LP + Mystical Scroll</span>
          </div>
        </div>
      </div>

      {/* Streak Protection Info */}
      {visitStreak >= 7 && (
        <div className="streak-protection-info">
          <span className="info-icon">ℹ️</span>
          <span>Missing a day will reset your streak. Check in daily to maintain your progress!</span>
        </div>
      )}
    </div>
  );
};

export default DailyCheckInCalendar;
