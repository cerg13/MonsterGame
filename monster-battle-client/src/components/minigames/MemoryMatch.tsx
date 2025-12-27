import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './MemoryMatch.css';

interface Card {
  id: number;
  symbol: string;
  color: string;
  matched: boolean;
  flipped: boolean;
}

interface Prize {
  name: string;
  icon: string;
  type: 'crystals' | 'gold' | 'energy' | 'scroll';
  amount: number;
  color: string;
}

interface MemoryMatchProps {
  onWin?: (prize: Prize) => void;
  canPlay?: boolean;
  lastPlayDate?: Date | null;
}

const SYMBOLS = [
  { symbol: '🔥', color: '#fc5c65', name: 'Fire' },
  { symbol: '💧', color: '#45aaf2', name: 'Water' },
  { symbol: '🌪️', color: '#26de81', name: 'Wind' },
  { symbol: '✨', color: '#fed330', name: 'Light' },
  { symbol: '🌙', color: '#a55eea', name: 'Dark' },
  { symbol: '⚡', color: '#f7b731', name: 'Thunder' },
  { symbol: '🌿', color: '#20bf6b', name: 'Nature' },
  { symbol: '❄️', color: '#48dbfb', name: 'Ice' },
];

export const MemoryMatch: React.FC<MemoryMatchProps> = ({
  onWin,
  canPlay: canPlayProp = true,
  lastPlayDate = null,
}) => {
  const { achievement } = useNotification();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [timer, setTimer] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const timerRef = useRef<number | null>(null);

  // Check if can play (24 hour cooldown)
  const canPlay = canPlayProp && (!lastPlayDate ||
    new Date().getTime() - new Date(lastPlayDate).getTime() > 24 * 60 * 60 * 1000
  );

  const timeUntilNext = lastPlayDate
    ? Math.max(0, 24 * 60 * 60 * 1000 - (new Date().getTime() - new Date(lastPlayDate).getTime()))
    : 0;

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  const formatGameTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate cards
  const generateCards = (): Card[] => {
    const selectedSymbols = SYMBOLS.slice(0, 8);
    const pairs = [...selectedSymbols, ...selectedSymbols];

    // Shuffle
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }

    return pairs.map((item, index) => ({
      id: index,
      symbol: item.symbol,
      color: item.color,
      matched: false,
      flipped: false,
    }));
  };

  // Start timer
  useEffect(() => {
    if (gameStarted && !gameWon) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, gameWon]);

  // Handle card flip
  const handleCardClick = (index: number) => {
    if (!gameStarted || gameWon || !canPlay) return;
    if (flippedIndices.length >= 2) return;
    if (cards[index].matched || cards[index].flipped) return;
    if (flippedIndices.includes(index)) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      checkMatch(newFlipped[0], newFlipped[1]);
    }
  };

  // Check for match
  const checkMatch = (index1: number, index2: number) => {
    const card1 = cards[index1];
    const card2 = cards[index2];

    if (card1.symbol === card2.symbol) {
      // Match!
      setTimeout(() => {
        const newCards = [...cards];
        newCards[index1].matched = true;
        newCards[index2].matched = true;
        setCards(newCards);
        setFlippedIndices([]);

        const newMatches = matches + 1;
        setMatches(newMatches);

        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > bestCombo) {
          setBestCombo(newCombo);
        }

        // Check if game won
        if (newMatches === 8) {
          handleWin();
        }
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        const newCards = [...cards];
        newCards[index1].flipped = false;
        newCards[index2].flipped = false;
        setCards(newCards);
        setFlippedIndices([]);
        setCombo(0);
      }, 1000);
    }
  };

  // Calculate prize based on performance
  const calculatePrize = (): Prize => {
    const timeBonus = timer < 60 ? 2 : timer < 90 ? 1.5 : 1;
    const movesBonus = moves <= 16 ? 2 : moves <= 24 ? 1.5 : 1;
    const comboBonus = bestCombo >= 5 ? 1.5 : bestCombo >= 3 ? 1.25 : 1;

    const multiplier = timeBonus * movesBonus * comboBonus;

    if (multiplier >= 4) {
      return { name: '200 Crystals + Scroll', icon: '🏆', type: 'crystals', amount: 200, color: '#a55eea' };
    } else if (multiplier >= 3) {
      return { name: '150 Crystals', icon: '💎', type: 'crystals', amount: 150, color: '#48dbfb' };
    } else if (multiplier >= 2) {
      return { name: '100 Crystals', icon: '💎', type: 'crystals', amount: 100, color: '#45aaf2' };
    } else if (multiplier >= 1.5) {
      return { name: '75 Crystals + 25K Gold', icon: '🎁', type: 'crystals', amount: 75, color: '#fed330' };
    } else {
      return { name: '50 Crystals', icon: '💎', type: 'crystals', amount: 50, color: '#3498db' };
    }
  };

  const handleWin = () => {
    setGameWon(true);
    const prize = calculatePrize();
    setWonPrize(prize);

    // Performance rating
    let rating = '⭐';
    if (timer < 60 && moves <= 16) rating = '⭐⭐⭐';
    else if (timer < 90 && moves <= 24) rating = '⭐⭐';

    achievement(`${rating} Memory Master! Completed in ${formatGameTime(timer)}!`, {
      title: '🧠 Memory Match Complete!',
      duration: 6000,
      priority: rating === '⭐⭐⭐' ? 'high' : 'medium',
    });

    if (onWin) {
      onWin(prize);
    }
  };

  // Start new game
  const handleNewGame = () => {
    if (!canPlay) return;

    const newCards = generateCards();
    setCards(newCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setCombo(0);
    setBestCombo(0);
    setTimer(0);
    setGameStarted(true);
    setGameWon(false);
    setWonPrize(null);
  };

  // Initialize on mount
  useEffect(() => {
    if (cards.length === 0 && canPlay) {
      handleNewGame();
    }
  }, [canPlay]);

  const getPerformanceRating = (): string => {
    if (!gameWon) return '';
    if (timer < 60 && moves <= 16) return '⭐⭐⭐ Perfect!';
    if (timer < 90 && moves <= 24) return '⭐⭐ Great!';
    return '⭐ Good!';
  };

  return (
    <div className="memory-match-game">
      <div className="memory-header">
        <div className="header-title">
          <span className="title-icon">🧠</span>
          <h3>Memory Match</h3>
        </div>
        <div className="memory-info">
          {canPlay ? (
            <span className="info-text">Match all pairs!</span>
          ) : (
            <span className="cooldown-text">Next game in: {formatTime(timeUntilNext)}</span>
          )}
        </div>
      </div>

      {/* Prize won banner */}
      {wonPrize && (
        <div className="prize-won-banner" style={{ borderColor: wonPrize.color }}>
          <div className="confetti-burst">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="confetti-piece" />
            ))}
          </div>
          <div className="won-content">
            <div className="won-icon" style={{ textShadow: `0 0 20px ${wonPrize.color}` }}>
              {wonPrize.icon}
            </div>
            <div className="won-text">
              <div className="won-title">🎉 Complete!</div>
              <div className="won-rating">{getPerformanceRating()}</div>
              <div className="won-prize" style={{ color: wonPrize.color }}>
                {wonPrize.name}
              </div>
              <div className="won-stats">
                {formatGameTime(timer)} • {moves} moves • {bestCombo}x combo
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game stats */}
      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-icon">⏱️</span>
          <span className="stat-value">{formatGameTime(timer)}</span>
          <span className="stat-label">Time</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{moves}</span>
          <span className="stat-label">Moves</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎪</span>
          <span className="stat-value">{matches}/8</span>
          <span className="stat-label">Matches</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{combo}x</span>
          <span className="stat-label">Combo</span>
        </div>
      </div>

      {/* Memory card grid */}
      <div className="memory-grid">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`memory-card ${card.flipped || card.matched ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
            onClick={() => handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">
                <div className="card-pattern">
                  <span>?</span>
                </div>
              </div>
              <div className="card-back" style={{ borderColor: card.color }}>
                <span className="card-symbol" style={{ color: card.color }}>
                  {card.symbol}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="memory-actions">
        <button
          className="new-game-btn"
          onClick={handleNewGame}
          disabled={!canPlay}
        >
          {canPlay ? '🧠 New Game' : `⏰ ${formatTime(timeUntilNext)}`}
        </button>
      </div>

      {/* Tips */}
      <div className="memory-tips">
        <h4>💡 Performance Bonuses</h4>
        <div className="tips-grid">
          <div className="tip-item">
            <span className="tip-icon">⏱️</span>
            <span className="tip-text">Complete under 60s for time bonus</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <span className="tip-text">Perfect game: 16 moves or less</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🔥</span>
            <span className="tip-text">Build combos for multiplier bonus</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">⭐</span>
            <span className="tip-text">3-star rating = maximum rewards!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryMatch;
