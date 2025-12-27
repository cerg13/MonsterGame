import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestStore, usePlayerStore, WEEKLY_QUESTS, STORY_QUESTS } from '../store';
import { useTranslations } from '../localization';
import type { Quest, QuestType, QuestReward } from '../store';
import type { Translations } from '../localization';
import './QuestScreen.css';

const getTabInfo = (t: Translations): Record<QuestType, { name: string; icon: string }> => ({
  daily: { name: t.quests.daily, icon: '📅' },
  weekly: { name: t.quests.weekly, icon: '📆' },
  story: { name: t.quests.story, icon: '📖' },
  event: { name: t.quests.event, icon: '🎉' },
});

interface QuestCardProps {
  quest: Quest;
  onClaim: () => void;
  t: Translations;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onClaim, t }) => {
  const progress = useQuestStore((state) => state.getQuestProgress(quest.id));
  const currentValue = progress?.currentValue ?? 0;
  const isCompleted = progress?.completed ?? false;
  const isClaimed = progress?.claimed ?? false;
  const progressPercent = Math.min((currentValue / quest.targetValue) * 100, 100);

  // Get localized name and description
  const questName = t.quests.questNames[quest.id as keyof typeof t.quests.questNames] || quest.name;
  const questDescription = t.quests.questDescriptions[quest.id as keyof typeof t.quests.questDescriptions] || quest.description;

  return (
    <div className={`quest-card ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}`}>
      <div className="quest-icon">{quest.icon}</div>

      <div className="quest-info">
        <div className="quest-header">
          <h3 className="quest-name">{questName}</h3>
          {quest.chapter && (
            <span className="quest-chapter">{t.quests.chapter} {quest.chapter}</span>
          )}
        </div>
        <p className="quest-description">{questDescription}</p>

        <div className="quest-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="progress-text">
            {currentValue} / {quest.targetValue}
          </span>
        </div>

        <div className="quest-rewards">
          {quest.rewards.map((reward, index) => (
            <span key={index} className={`reward-badge ${reward.type}`}>
              {getRewardIcon(reward.type)} {reward.amount.toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      <div className="quest-action">
        {isCompleted && !isClaimed ? (
          <button className="claim-btn" onClick={onClaim}>
            {t.common.claim}
          </button>
        ) : isClaimed ? (
          <div className="claimed-badge">
            <span>✓</span>
          </div>
        ) : (
          <div className="progress-indicator">
            <span>{Math.round(progressPercent)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

function getRewardIcon(type: QuestReward['type']): string {
  const icons: Record<string, string> = {
    crystals: '💎',
    gold: '🪙',
    energy: '⚡',
    summon_scroll: '📜',
    exp: '⭐',
  };
  return icons[type] || '🎁';
}

export const QuestScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const [selectedTab, setSelectedTab] = useState<QuestType>('daily');

  const {
    getDailyQuests,
    getWeeklyQuests,
    getAvailableStoryQuests,
    claimQuestReward,
    getCompletedQuestsCount,
    getUnclaimedCount,
    refreshDailyQuests,
    refreshWeeklyQuests,
  } = useQuestStore();

  const { player, updateResources } = usePlayerStore();
  const TAB_INFO = getTabInfo(t);

  // Refresh quests on mount
  useEffect(() => {
    refreshDailyQuests();
    refreshWeeklyQuests();
  }, [refreshDailyQuests, refreshWeeklyQuests]);

  const dailyQuests = getDailyQuests();
  const weeklyQuests = getWeeklyQuests();
  const storyQuests = getAvailableStoryQuests();

  const currentQuests = useMemo(() => {
    switch (selectedTab) {
      case 'daily':
        return dailyQuests;
      case 'weekly':
        return weeklyQuests;
      case 'story':
        return storyQuests;
      default:
        return [];
    }
  }, [selectedTab, dailyQuests, weeklyQuests, storyQuests]);

  const handleClaim = (questId: string) => {
    const rewards = claimQuestReward(questId);
    if (!rewards || !player) return;

    // Apply rewards to player
    let crystalsToAdd = 0;
    let goldToAdd = 0;
    let energyToAdd = 0;

    rewards.forEach((reward) => {
      switch (reward.type) {
        case 'crystals':
          crystalsToAdd += reward.amount;
          break;
        case 'gold':
          goldToAdd += reward.amount;
          break;
        case 'energy':
          energyToAdd += reward.amount;
          break;
        // summon_scroll and exp need inventory/exp systems
        default:
          break;
      }
    });

    if (crystalsToAdd > 0 || goldToAdd > 0 || energyToAdd > 0) {
      updateResources({
        crystals: player.crystals + crystalsToAdd,
        gold: player.gold + goldToAdd,
        energy: Math.min(player.energy + energyToAdd, player.maxEnergy * 2),
      });
    }
  };

  const unclaimedCount = getUnclaimedCount();
  const dailyCompleted = getCompletedQuestsCount('daily');
  const weeklyCompleted = getCompletedQuestsCount('weekly');
  const storyCompleted = getCompletedQuestsCount('story');

  return (
    <div className="quest-screen">
      {/* Background */}
      <div className="quest-bg">
        <div className="bg-scroll" />
      </div>

      {/* Header */}
      <div className="quest-header">
        <button className="back-button" onClick={() => navigate('/')}>
          &larr; {t.common.back}
        </button>
        <h1>{t.quests.title}</h1>
        {unclaimedCount > 0 && (
          <span className="unclaimed-badge">{unclaimedCount} {t.common.rewards.toLowerCase()}</span>
        )}
      </div>

      {/* Tab bar */}
      <div className="quest-tabs">
        {(['daily', 'weekly', 'story'] as QuestType[]).map((tab) => {
          const info = TAB_INFO[tab];
          const completedCount =
            tab === 'daily' ? dailyCompleted :
            tab === 'weekly' ? weeklyCompleted :
            storyCompleted;
          const totalCount =
            tab === 'daily' ? dailyQuests.length :
            tab === 'weekly' ? WEEKLY_QUESTS.length :
            STORY_QUESTS.length;

          return (
            <button
              key={tab}
              className={`quest-tab ${selectedTab === tab ? 'active' : ''}`}
              onClick={() => setSelectedTab(tab)}
            >
              <span className="tab-icon">{info.icon}</span>
              <span className="tab-name">{info.name}</span>
              <span className="tab-progress">
                {completedCount}/{totalCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quest list */}
      <div className="quest-content">
        {selectedTab === 'daily' && (
          <div className="quest-section-header">
            <h2>{t.quests.dailyQuests}</h2>
            <p className="reset-timer">{t.quests.resetsAtMidnight}</p>
          </div>
        )}

        {selectedTab === 'weekly' && (
          <div className="quest-section-header">
            <h2>{t.quests.weeklyQuests}</h2>
            <p className="reset-timer">{t.quests.resetsMonday}</p>
          </div>
        )}

        {selectedTab === 'story' && (
          <div className="quest-section-header">
            <h2>{t.quests.storyQuests}</h2>
            <p className="reset-timer">{t.quests.completeToUnlock}</p>
          </div>
        )}

        <div className="quest-list">
          {currentQuests.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <p>{t.quests.noQuests}</p>
            </div>
          ) : (
            currentQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onClaim={() => handleClaim(quest.id)}
                t={t}
              />
            ))
          )}
        </div>

        {/* Overall progress for story */}
        {selectedTab === 'story' && (
          <div className="story-progress">
            <div className="chapter-indicators">
              {[1, 2, 3].map((chapter) => {
                const chapterQuests = STORY_QUESTS.filter(q => q.chapter === chapter);
                const chapterProgress = useQuestStore.getState().progress;
                const completedInChapter = chapterQuests.filter(q =>
                  chapterProgress.some(p => p.questId === q.id && p.completed)
                ).length;
                const isChapterComplete = completedInChapter === chapterQuests.length;

                return (
                  <div
                    key={chapter}
                    className={`chapter-badge ${isChapterComplete ? 'complete' : ''}`}
                  >
                    <span className="chapter-number">{t.quests.chapter} {chapter}</span>
                    <span className="chapter-status">
                      {completedInChapter}/{chapterQuests.length}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestScreen;
