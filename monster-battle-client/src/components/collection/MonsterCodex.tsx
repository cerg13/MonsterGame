import React, { useMemo, useState } from 'react';
import { usePlayerStore } from '../../store';
import { MONSTER_TEMPLATES } from '../../data/monsters';
import type { Element, MonsterTemplate, PlayerMonster } from '../../types/monster';
import './MonsterCodex.css';

interface CodexReward {
  percentage: number;
  crystals: number;
  gold: number;
  scrolls: number;
  claimed: boolean;
}

interface ElementCategory {
  element: Element;
  total: number;
  collected: number;
  monsters: MonsterTemplate[];
}

export const MonsterCodex: React.FC = () => {
  const { monsters: ownedMonsters } = usePlayerStore();
  const [selectedElement, setSelectedElement] = useState<Element | 'all'>('all');

  // Calculate collection statistics
  const collectionStats = useMemo(() => {
    const totalMonsters = MONSTER_TEMPLATES.length;

    // Get unique template IDs owned by player
    const ownedTemplateIds = new Set(
      ownedMonsters.map((m: PlayerMonster) => m.templateId)
    );

    const collectedCount = ownedTemplateIds.size;
    const completionPercent = (collectedCount / totalMonsters) * 100;

    // Group by element
    const elementCategories: Record<Element, ElementCategory> = {
      fire: { element: 'fire', total: 0, collected: 0, monsters: [] },
      water: { element: 'water', total: 0, collected: 0, monsters: [] },
      wind: { element: 'wind', total: 0, collected: 0, monsters: [] },
      light: { element: 'light', total: 0, collected: 0, monsters: [] },
      dark: { element: 'dark', total: 0, collected: 0, monsters: [] },
    };

    MONSTER_TEMPLATES.forEach(template => {
      const element = template.element;
      elementCategories[element].total++;
      elementCategories[element].monsters.push(template);

      if (ownedTemplateIds.has(template.id)) {
        elementCategories[element].collected++;
      }
    });

    return {
      totalMonsters,
      collectedCount,
      completionPercent,
      elementCategories,
      ownedTemplateIds,
    };
  }, [ownedMonsters]);

  // Completion rewards
  const rewards: CodexReward[] = [
    { percentage: 50, crystals: 100, gold: 50000, scrolls: 1, claimed: false },
    { percentage: 75, crystals: 200, gold: 100000, scrolls: 2, claimed: false },
    { percentage: 100, crystals: 500, gold: 250000, scrolls: 5, claimed: false },
  ];

  const getElementIcon = (element: Element): string => {
    const icons: Record<Element, string> = {
      fire: '🔥',
      water: '💧',
      wind: '🌪️',
      light: '✨',
      dark: '🌙',
    };
    return icons[element];
  };

  const getElementColor = (element: Element): string => {
    const colors: Record<Element, string> = {
      fire: '#fc5c65',
      water: '#45aaf2',
      wind: '#26de81',
      light: '#fed330',
      dark: '#a55eea',
    };
    return colors[element];
  };

  const getRarityStars = (rarity: string): string => {
    const stars: Record<string, string> = {
      common: '⭐',
      rare: '⭐⭐',
      sr: '⭐⭐⭐',
      ssr: '⭐⭐⭐⭐',
    };
    return stars[rarity] || '⭐';
  };

  // Check if monster was obtained recently (within 24 hours)
  const isNewMonster = (templateId: string): boolean => {
    const monster = ownedMonsters.find((m: PlayerMonster) => m.templateId === templateId);
    if (!monster) return false;

    const obtainedAt = monster.obtainedAt instanceof Date
      ? monster.obtainedAt
      : new Date(monster.obtainedAt);
    const now = new Date();
    const hoursSinceObtained = (now.getTime() - obtainedAt.getTime()) / (1000 * 60 * 60);

    return hoursSinceObtained < 24;
  };

  const filteredMonsters = useMemo(() => {
    if (selectedElement === 'all') {
      return MONSTER_TEMPLATES;
    }
    return collectionStats.elementCategories[selectedElement].monsters;
  }, [selectedElement, collectionStats]);

  return (
    <div className="monster-codex">
      {/* Header */}
      <div className="codex-header">
        <div className="header-title">
          <span className="title-icon">📖</span>
          <h2>Monster Collection Book</h2>
        </div>
        <div className="collection-stats">
          <div className="stat-item">
            <span className="stat-value">{collectionStats.collectedCount}/{collectionStats.totalMonsters}</span>
            <span className="stat-label">Collected</span>
          </div>
          <div className="stat-item">
            <span className="stat-value highlight">{collectionStats.completionPercent.toFixed(1)}%</span>
            <span className="stat-label">Complete</span>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="overall-progress">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${collectionStats.completionPercent}%` }}
          >
            <div className="progress-shimmer" />
          </div>
          {rewards.map((reward) => (
            <div
              key={reward.percentage}
              className={`progress-milestone ${collectionStats.completionPercent >= reward.percentage ? 'reached' : ''}`}
              style={{ left: `${reward.percentage}%` }}
            >
              <div className="milestone-marker">
                {collectionStats.completionPercent >= reward.percentage ? '✓' : reward.percentage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Rewards */}
      <div className="completion-rewards">
        <h4>Completion Rewards</h4>
        <div className="rewards-grid">
          {rewards.map((reward) => {
            const canClaim = collectionStats.completionPercent >= reward.percentage && !reward.claimed;
            const isReached = collectionStats.completionPercent >= reward.percentage;

            return (
              <div
                key={reward.percentage}
                className={`reward-card ${isReached ? 'reached' : ''} ${canClaim ? 'claimable' : ''}`}
              >
                <div className="reward-header">
                  <span className="reward-percentage">{reward.percentage}%</span>
                  {isReached && <span className="reward-check">✓</span>}
                </div>
                <div className="reward-items">
                  <div className="reward-item">💎 {reward.crystals}</div>
                  <div className="reward-item">💰 {reward.gold.toLocaleString()}</div>
                  <div className="reward-item">📜 {reward.scrolls}</div>
                </div>
                {canClaim && (
                  <button className="claim-reward-btn">Claim</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Element Filter */}
      <div className="element-filter">
        <button
          className={`element-tab ${selectedElement === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedElement('all')}
        >
          <span className="tab-icon">🌐</span>
          <span className="tab-name">All</span>
          <span className="tab-count">
            {collectionStats.collectedCount}/{collectionStats.totalMonsters}
          </span>
        </button>
        {(Object.keys(collectionStats.elementCategories) as Element[]).map((element) => {
          const category = collectionStats.elementCategories[element];
          return (
            <button
              key={element}
              className={`element-tab ${selectedElement === element ? 'active' : ''}`}
              onClick={() => setSelectedElement(element)}
              style={{ '--element-color': getElementColor(element) } as React.CSSProperties}
            >
              <span className="tab-icon">{getElementIcon(element)}</span>
              <span className="tab-name">{element.charAt(0).toUpperCase() + element.slice(1)}</span>
              <span className="tab-count">
                {category.collected}/{category.total}
              </span>
            </button>
          );
        })}
      </div>

      {/* Monster Grid */}
      <div className="monster-grid">
        {filteredMonsters.map((template) => {
          const isCollected = collectionStats.ownedTemplateIds.has(template.id);
          const isNew = isNewMonster(template.id);

          return (
            <div
              key={template.id}
              className={`monster-card ${isCollected ? 'collected' : 'uncollected'}`}
              style={{ '--element-color': getElementColor(template.element) } as React.CSSProperties}
            >
              {isNew && (
                <div className="new-badge">NEW!</div>
              )}

              <div className="monster-portrait">
                {isCollected ? (
                  <>
                    <img src={template.portrait} alt={template.name} />
                    <div className="element-badge" style={{ background: getElementColor(template.element) }}>
                      {getElementIcon(template.element)}
                    </div>
                  </>
                ) : (
                  <div className="silhouette">
                    <span className="silhouette-icon">❓</span>
                  </div>
                )}
              </div>

              <div className="monster-info">
                <div className="monster-name">
                  {isCollected ? template.name : '???'}
                </div>
                <div className="monster-rarity">
                  {getRarityStars(template.rarity)}
                </div>
              </div>

              {!isCollected && (
                <div className="locked-overlay">
                  <span className="lock-icon">🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonsterCodex;
