import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Panel, ProgressBar } from '../common';
import { useDungeonStore, usePlayerStore } from '../../store';
import { dungeonRewardService } from '../../services/DungeonRewardService';
import { DUNGEON_CONFIG } from '../../data/dungeons';
import type { DungeonRunResult, DroppedRune, SpecialDrop } from '../../types/dungeon';
import './DungeonRewardScreen.css';

interface DungeonRewardScreenProps {
  result: DungeonRunResult;
  onClose: () => void;
  onRepeat?: () => void;
}

export const DungeonRewardScreen: React.FC<DungeonRewardScreenProps> = ({
  result,
  onClose,
  onRepeat,
}) => {
  const navigate = useNavigate();
  const [showRuneDetails, setShowRuneDetails] = useState<DroppedRune | null>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  const { autoRepeat, autoRepeatCount, maxAutoRepeat } = useDungeonStore();
  const addGold = usePlayerStore((state) => state.addGold);
  const addCrystals = usePlayerStore((state) => state.addCrystals);

  const dungeonConfig = DUNGEON_CONFIG[result.floor.dungeonType];

  // Animation phases
  useEffect(() => {
    const timers = [
      setTimeout(() => setAnimationPhase(1), 300), // Show result
      setTimeout(() => setAnimationPhase(2), 800), // Show gold/exp
      setTimeout(() => setAnimationPhase(3), 1200), // Show runes
      setTimeout(() => setAnimationPhase(4), 1600), // Show special drops
      setTimeout(() => setAnimationPhase(5), 2000), // Show buttons
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  // Apply rewards to player store
  useEffect(() => {
    if (result.success && result.rewards) {
      addGold(result.rewards.gold);
      // Add crystals from special drops if any
      const crystalDrop = result.rewards.specialDrops.find(d => d.type === 'material' && d.id.includes('crystal'));
      if (crystalDrop) {
        addCrystals(10); // Fixed crystal amount
      }
    }
  }, [result, addGold, addCrystals]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'atk': 'ATK',
      'atk%': 'ATK%',
      'def': 'DEF',
      'def%': 'DEF%',
      'hp': 'HP',
      'hp%': 'HP%',
      'spd': 'SPD',
      'critRate': 'CRI Rate',
      'critDmg': 'CRI Dmg',
      'accuracy': 'ACC',
      'resistance': 'RES',
    };
    return labels[type] || type;
  };

  const renderRuneCard = (rune: DroppedRune, index: number) => (
    <div
      key={index}
      className={`rune-reward-card rune-${rune.stars}star`}
      onClick={() => setShowRuneDetails(rune)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="rune-stars">
        {'★'.repeat(rune.stars)}
      </div>
      <div className="rune-set-icon">{getSetIcon(rune.set)}</div>
      <div className="rune-info">
        <span className="rune-set">{rune.set}</span>
        <span className="rune-slot">Slot {rune.slot}</span>
      </div>
      <div className="rune-main-stat">
        {getStatLabel(rune.mainStat.type)}: +{rune.mainStat.value}
      </div>
    </div>
  );

  const renderSpecialDrop = (drop: SpecialDrop, index: number) => (
    <div
      key={index}
      className={`special-drop-card ${drop.type}`}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <div className="drop-icon">{getDropIcon(drop.type)}</div>
      <span className="drop-name">{drop.name}</span>
    </div>
  );

  return (
    <div className={`dungeon-reward-screen ${result.success ? 'victory' : 'defeat'}`}>
      <div className="reward-overlay" />

      <div className="reward-content">
        {/* Result Header */}
        <div className={`result-header ${animationPhase >= 1 ? 'visible' : ''}`}>
          <h1 className={result.success ? 'victory-text' : 'defeat-text'}>
            {result.success ? 'VICTORY!' : 'DEFEAT'}
          </h1>
          <div className="dungeon-info">
            <span className="dungeon-icon">{dungeonConfig.icon}</span>
            <span className="dungeon-name">{dungeonConfig.nameRu}</span>
            <span className="floor-number">B{result.floor.floor}</span>
          </div>
        </div>

        {/* Battle Stats */}
        <div className={`battle-stats ${animationPhase >= 2 ? 'visible' : ''}`}>
          <div className="stat-item">
            <span className="stat-label">Time</span>
            <span className="stat-value">{formatTime(result.timeElapsed)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Damage Dealt</span>
            <span className="stat-value">{result.totalDamageDealt.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Damage Taken</span>
            <span className="stat-value">{result.totalDamageTaken.toLocaleString()}</span>
          </div>
        </div>

        {/* Rewards Section */}
        {result.success && result.rewards && (
          <>
            {/* Gold & EXP */}
            <div className={`rewards-basic ${animationPhase >= 2 ? 'visible' : ''}`}>
              <div className="reward-item gold">
                <span className="reward-icon">💰</span>
                <span className="reward-value">+{result.rewards.gold.toLocaleString()}</span>
                <span className="reward-label">Gold</span>
              </div>
              <div className="reward-item exp">
                <span className="reward-icon">⭐</span>
                <span className="reward-value">+{result.rewards.experience.toLocaleString()}</span>
                <span className="reward-label">EXP</span>
              </div>
            </div>

            {/* Runes */}
            {result.rewards.runes.length > 0 && (
              <div className={`rewards-runes ${animationPhase >= 3 ? 'visible' : ''}`}>
                <h3>Runes Obtained</h3>
                <div className="runes-grid">
                  {result.rewards.runes.map((rune, i) => renderRuneCard(rune, i))}
                </div>
              </div>
            )}

            {/* Special Drops */}
            {result.rewards.specialDrops.length > 0 && (
              <div className={`rewards-special ${animationPhase >= 4 ? 'visible' : ''}`}>
                <h3>Special Items</h3>
                <div className="special-drops-grid">
                  {result.rewards.specialDrops.map((drop, i) => renderSpecialDrop(drop, i))}
                </div>
              </div>
            )}

            {/* No Runes Message */}
            {result.rewards.runes.length === 0 && (
              <div className={`no-runes-message ${animationPhase >= 3 ? 'visible' : ''}`}>
                <span>No runes dropped this time</span>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className={`reward-actions ${animationPhase >= 5 ? 'visible' : ''}`}>
          {autoRepeat && autoRepeatCount < maxAutoRepeat && result.success && (
            <div className="auto-repeat-progress">
              <ProgressBar
                value={autoRepeatCount}
                max={maxAutoRepeat}
                type="exp"
                size="sm"
              />
              <span>Auto-repeat: {autoRepeatCount}/{maxAutoRepeat}</span>
            </div>
          )}

          <div className="action-buttons">
            <Button variant="ghost" onClick={onClose}>
              Exit
            </Button>
            {onRepeat && result.success && (
              <Button variant="primary" onClick={onRepeat}>
                Repeat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Rune Detail Modal */}
      {showRuneDetails && (
        <div className="rune-detail-modal" onClick={() => setShowRuneDetails(null)}>
          <div className="rune-detail-content" onClick={e => e.stopPropagation()}>
            <div className="rune-detail-header">
              <span className="rune-stars">{'★'.repeat(showRuneDetails.stars)}</span>
              <span className="rune-set-name">{showRuneDetails.set}</span>
              <span className="rune-slot">Slot {showRuneDetails.slot}</span>
            </div>

            <div className="rune-detail-main">
              <span className="stat-type">{getStatLabel(showRuneDetails.mainStat.type)}</span>
              <span className="stat-value">+{showRuneDetails.mainStat.value}</span>
            </div>

            <div className="rune-detail-subs">
              <h4>Sub Stats</h4>
              {showRuneDetails.subStats.map((sub, i) => (
                <div key={i} className="sub-stat-row">
                  <span className="sub-type">{getStatLabel(sub.type)}</span>
                  <span className="sub-value">+{sub.value}</span>
                </div>
              ))}
              {showRuneDetails.subStats.length === 0 && (
                <span className="no-subs">No sub stats</span>
              )}
            </div>

            <div className="rune-detail-value">
              Sell Value: {dungeonRewardService.calculateRuneSellValue(showRuneDetails).toLocaleString()} gold
            </div>

            <Button variant="primary" onClick={() => setShowRuneDetails(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function getSetIcon(set: string): string {
  const icons: Record<string, string> = {
    energy: '💚',
    fatal: '⚔️',
    blade: '🗡️',
    swift: '💨',
    focus: '🎯',
    guard: '🛡️',
    endure: '💪',
    violent: '💥',
    will: '✨',
    despair: '😱',
    vampire: '🧛',
    rage: '😡',
    revenge: '⚡',
    nemesis: '🔄',
    destroy: '💀',
  };
  return icons[set] || '🔮';
}

function getDropIcon(type: string): string {
  const icons: Record<string, string> = {
    scroll: '📜',
    essence: '💎',
    material: '⚗️',
    monster: '🐉',
  };
  return icons[type] || '🎁';
}

export default DungeonRewardScreen;
