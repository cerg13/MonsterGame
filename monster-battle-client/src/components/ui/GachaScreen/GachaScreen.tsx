import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGachaStore, usePlayerStore } from '../../../store';
import { getMonsterTemplate } from '../../../data/monsters';
import { MonsterCard } from '../MonsterCard';
import { useAudio } from '../../../hooks/useAudio';
import { PityCounter } from '../../gacha';
import type { GachaPullItem } from '../../../types/gacha';
import './GachaScreen.css';

export const GachaScreen: React.FC = () => {
  const navigate = useNavigate();
  const player = usePlayerStore((state) => state.player);
  const updateResources = usePlayerStore((state) => state.updateResources);
  const addMonsters = usePlayerStore((state) => state.addMonsters);
  const {
    playClick,
    playMusic,
    stopMusic,
    playSummonStart,
    playSummonReveal,
    playSummonByRarity,
    playError
  } = useAudio();

  const {
    currentBanner,
    banners,
    selectBanner,
    executePull,
    lastPullResult,
    isAnimating,
    setPullAnimating,
    getPityState,
  } = useGachaStore();

  const [showResults, setShowResults] = useState(false);
  const [animatingPulls, setAnimatingPulls] = useState<GachaPullItem[]>([]);
  const [currentPullIndex, setCurrentPullIndex] = useState(0);

  // Play gacha music
  useEffect(() => {
    playMusic('gacha');
    return () => stopMusic();
  }, [playMusic, stopMusic]);

  const pityState = currentBanner ? getPityState(currentBanner.type) : null;

  const handlePull = (count: 1 | 10) => {
    if (!currentBanner || !player) return;

    const cost = currentBanner.costPerPull.amount * count;
    if (player.crystals < cost) {
      playError();
      alert('Not enough crystals!');
      return;
    }

    // Play summon start sound
    playSummonStart();

    // Execute pull
    const result = executePull(count);

    // Deduct crystals
    updateResources({ crystals: player.crystals - cost });

    // Start animation
    setPullAnimating(true);
    setAnimatingPulls(result.pulls);
    setCurrentPullIndex(0);
    setShowResults(false);

    // Animate reveals
    if (count === 1) {
      setTimeout(() => {
        // Play reveal sound
        playSummonReveal();
        // Play rarity-specific sound
        setTimeout(() => {
          playSummonByRarity(result.pulls[0].rarity);
        }, 200);

        setShowResults(true);
        setPullAnimating(false);

        // Add monster to inventory
        const template = getMonsterTemplate(result.pulls[0].templateId);
        if (template) {
          addMonsters([{
            id: crypto.randomUUID(),
            templateId: template.id,
            ownerId: player.id,
            level: 1,
            stars: template.naturalStars,
            experience: 0,
            skillLevels: [1, 1, 1],
            awakened: false,
            equippedRunes: [],
            locked: false,
            obtainedAt: new Date(),
          }]);
        }
      }, 2000);
    } else {
      // Multi-pull animation
      const revealInterval = setInterval(() => {
        setCurrentPullIndex((prev) => {
          if (prev >= result.pulls.length - 1) {
            clearInterval(revealInterval);
            setTimeout(() => {
              // Find best rarity and play its sound
              const bestRarity = result.pulls.reduce((best, pull) => {
                const rarityOrder = { common: 0, rare: 1, sr: 2, ssr: 3 };
                return rarityOrder[pull.rarity] > rarityOrder[best] ? pull.rarity : best;
              }, 'common' as 'common' | 'rare' | 'sr' | 'ssr');
              playSummonByRarity(bestRarity);

              setShowResults(true);
              setPullAnimating(false);

              // Add all monsters to inventory
              const newMonsters = result.pulls.map(pull => {
                const template = getMonsterTemplate(pull.templateId)!;
                return {
                  id: crypto.randomUUID(),
                  templateId: template.id,
                  ownerId: player!.id,
                  level: 1,
                  stars: template.naturalStars,
                  experience: 0,
                  skillLevels: [1, 1, 1],
                  awakened: false,
                  equippedRunes: [],
                  locked: false,
                  obtainedAt: new Date(),
                };
              });
              addMonsters(newMonsters);
            }, 500);
            return prev;
          }
          // Play reveal sound for each card
          playSummonReveal();
          return prev + 1;
        });
      }, 300);
    }
  };

  const closeResults = () => {
    playClick();
    setShowResults(false);
    setAnimatingPulls([]);
    setCurrentPullIndex(0);
  };

  const costSingle = currentBanner?.costPerPull.amount ?? 100;
  const costMulti = costSingle * 10;
  const canPullSingle = player && player.crystals >= costSingle;
  const canPullMulti = player && player.crystals >= costMulti;

  return (
    <div className="gacha-screen">
      {/* Header */}
      <div className="gacha-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Summon</h1>
        <div className="crystal-display">
          💎 {player?.crystals ?? 0}
        </div>
      </div>

      {/* Banner Selection */}
      <div className="banner-tabs">
        {banners.map((banner) => (
          <button
            key={banner.id}
            className={`banner-tab ${currentBanner?.id === banner.id ? 'active' : ''}`}
            onClick={() => selectBanner(banner.id)}
          >
            {banner.name}
          </button>
        ))}
      </div>

      {/* Current Banner */}
      {currentBanner && (
        <div className="banner-display">
          <div className="banner-image">
            <div className="banner-title">{currentBanner.name}</div>
            {currentBanner.featuredMonsters.length > 0 && (
              <div className="featured-monsters">
                <h4>Featured:</h4>
                <div className="featured-list">
                  {currentBanner.featuredMonsters.map(id => {
                    const template = getMonsterTemplate(id);
                    return template ? (
                      <span key={id} className="featured-name">{template.name}</span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Rates Info */}
          <div className="rates-info">
            <h4>Rates</h4>
            <div className="rate-row"><span>SSR (5★)</span><span>0.8%</span></div>
            <div className="rate-row"><span>SR (4★)</span><span>8%</span></div>
            <div className="rate-row"><span>Rare (3★)</span><span>60%</span></div>
            <div className="rate-row"><span>Common (2★)</span><span>31.2%</span></div>
          </div>

          {/* Pity Counter */}
          {pityState && <PityCounter pityState={pityState} />}

          {/* Pull Buttons */}
          <div className="pull-buttons">
            <button
              className={`pull-button single ${!canPullSingle ? 'disabled' : ''}`}
              onClick={() => handlePull(1)}
              disabled={!canPullSingle || isAnimating}
            >
              <span className="pull-label">Summon x1</span>
              <span className="pull-cost">💎 {costSingle}</span>
            </button>
            <button
              className={`pull-button multi ${!canPullMulti ? 'disabled' : ''}`}
              onClick={() => handlePull(10)}
              disabled={!canPullMulti || isAnimating}
            >
              <span className="pull-label">Summon x10</span>
              <span className="pull-cost">💎 {costMulti}</span>
            </button>
          </div>
        </div>
      )}

      {/* Pull Animation Overlay */}
      {isAnimating && (
        <div className="pull-animation-overlay">
          <div className="summon-rays" />
          <div className="summon-circle">
            <div className="summon-glow" />
            <span className="summon-text">Summoning...</span>
          </div>
        </div>
      )}

      {/* Results Overlay */}
      {showResults && animatingPulls.length > 0 && (
        <div className="results-overlay" onClick={closeResults}>
          <div className="results-container" onClick={(e) => e.stopPropagation()}>
            <h2>Summon Results</h2>
            <div className="results-grid">
              {animatingPulls.map((pull, i) => {
                const template = getMonsterTemplate(pull.templateId);
                if (!template) return null;
                return (
                  <div
                    key={i}
                    className={`result-card ${pull.rarity} ${i <= currentPullIndex ? 'revealed' : ''}`}
                  >
                    <MonsterCard template={template} showStats={false} />
                    {lastPullResult?.isNewMonster[i] && (
                      <span className="new-badge">NEW!</span>
                    )}
                  </div>
                );
              })}
            </div>
            <button className="close-results" onClick={closeResults}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GachaScreen;
