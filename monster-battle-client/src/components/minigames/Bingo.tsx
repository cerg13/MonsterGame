import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './Bingo.css';

interface Prize {
  name: string;
  icon: string;
  type: 'crystals' | 'gold' | 'energy' | 'scroll';
  amount: number;
  color: string;
}

interface BingoProps {
  onWin?: (prize: Prize) => void;
  canPlay?: boolean;
  lastPlayDate?: Date | null;
}

type WinPattern = 'row' | 'column' | 'diagonal' | 'four-corners' | 'full-card';

interface WinResult {
  pattern: WinPattern;
  prize: Prize;
  numbersDrawn: number;
}

const PRIZES: Record<WinPattern, Prize> = {
  'row': { name: '50 Crystals', icon: '💎', type: 'crystals', amount: 50, color: '#48dbfb' },
  'column': { name: '50 Crystals', icon: '💎', type: 'crystals', amount: 50, color: '#45aaf2' },
  'diagonal': { name: '75 Crystals', icon: '💎', type: 'crystals', amount: 75, color: '#3498db' },
  'four-corners': { name: '100 Crystals + 25K Gold', icon: '🎁', type: 'crystals', amount: 100, color: '#fed330' },
  'full-card': { name: '200 Crystals + Scroll', icon: '🏆', type: 'crystals', amount: 200, color: '#a55eea' },
};

export const Bingo: React.FC<BingoProps> = ({
  onWin,
  canPlay: canPlayProp = true,
  lastPlayDate = null,
}) => {
  const { achievement } = useNotification();
  const [card, setCard] = useState<number[][]>([]);
  const [marked, setMarked] = useState<boolean[][]>(Array(5).fill(null).map(() => Array(5).fill(false)));
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [wonPrize, setWonPrize] = useState<WinResult | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);

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

  // Generate bingo card
  const generateCard = (): number[][] => {
    const newCard: number[][] = [];

    // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
    const ranges = [
      [1, 15],
      [16, 30],
      [31, 45],
      [46, 60],
      [61, 75],
    ];

    for (let col = 0; col < 5; col++) {
      const column: number[] = [];
      const [min, max] = ranges[col];
      const available = Array.from({ length: max - min + 1 }, (_, i) => min + i);

      for (let row = 0; row < 5; row++) {
        // Center is FREE space
        if (col === 2 && row === 2) {
          column.push(0); // 0 represents FREE
        } else {
          const randomIndex = Math.floor(Math.random() * available.length);
          const number = available.splice(randomIndex, 1)[0];
          column.push(number);
        }
      }

      newCard.push(column);
    }

    return newCard;
  };

  // Draw next number
  const drawNumber = () => {
    if (wonPrize || drawnNumbers.length >= 75) return;

    // Generate pool of numbers not yet drawn
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const available = allNumbers.filter(n => !drawnNumbers.includes(n));

    if (available.length === 0) return;

    const randomIndex = Math.floor(Math.random() * available.length);
    const number = available[randomIndex];

    setCurrentNumber(number);
    setIsDrawing(true);

    // Animate number reveal
    setTimeout(() => {
      setDrawnNumbers(prev => [...prev, number]);
      setIsDrawing(false);
      setCurrentNumber(null);

      // Auto-mark on card
      markNumber(number);
    }, 1000);
  };

  // Mark number on card
  const markNumber = (number: number) => {
    const newMarked = marked.map(col => [...col]);

    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 5; row++) {
        if (card[col][row] === number && !newMarked[col][row]) {
          newMarked[col][row] = true;
        }
      }
    }

    setMarked(newMarked);

    // Check for win after marking
    setTimeout(() => checkWin(newMarked), 300);
  };

  // Check for winning patterns
  const checkWin = (currentMarked: boolean[][]): void => {
    if (wonPrize) return;

    // Mark center as always marked (FREE)
    currentMarked[2][2] = true;

    // Check rows
    for (let row = 0; row < 5; row++) {
      let complete = true;
      for (let col = 0; col < 5; col++) {
        if (!currentMarked[col][row]) {
          complete = false;
          break;
        }
      }
      if (complete) {
        handleWin('row', drawnNumbers.length);
        return;
      }
    }

    // Check columns
    for (let col = 0; col < 5; col++) {
      let complete = true;
      for (let row = 0; row < 5; row++) {
        if (!currentMarked[col][row]) {
          complete = false;
          break;
        }
      }
      if (complete) {
        handleWin('column', drawnNumbers.length);
        return;
      }
    }

    // Check diagonals
    let diagonal1 = true;
    let diagonal2 = true;
    for (let i = 0; i < 5; i++) {
      if (!currentMarked[i][i]) diagonal1 = false;
      if (!currentMarked[i][4 - i]) diagonal2 = false;
    }
    if (diagonal1 || diagonal2) {
      handleWin('diagonal', drawnNumbers.length);
      return;
    }

    // Check four corners
    if (
      currentMarked[0][0] &&
      currentMarked[4][0] &&
      currentMarked[0][4] &&
      currentMarked[4][4]
    ) {
      handleWin('four-corners', drawnNumbers.length);
      return;
    }

    // Check full card
    let allMarked = true;
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 5; row++) {
        if (!currentMarked[col][row]) {
          allMarked = false;
          break;
        }
      }
      if (!allMarked) break;
    }
    if (allMarked) {
      handleWin('full-card', drawnNumbers.length);
      return;
    }
  };

  const handleWin = (pattern: WinPattern, numbersDrawn: number) => {
    const prize = PRIZES[pattern];
    const result: WinResult = { pattern, prize, numbersDrawn };

    setWonPrize(result);
    setAutoPlay(false);

    // Notification
    const patternNames: Record<WinPattern, string> = {
      'row': 'Row',
      'column': 'Column',
      'diagonal': 'Diagonal',
      'four-corners': 'Four Corners',
      'full-card': 'Full Card (Blackout)',
    };

    achievement(`🎉 BINGO! ${patternNames[pattern]} in ${numbersDrawn} draws!`, {
      title: '🎰 Bingo Winner!',
      duration: 6000,
      priority: pattern === 'full-card' || pattern === 'four-corners' ? 'high' : 'medium',
    });

    if (onWin) {
      onWin(prize);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || wonPrize || !canPlay || isDrawing) return;

    const timer = setTimeout(() => {
      drawNumber();
    }, 1500);

    return () => clearTimeout(timer);
  }, [autoPlay, wonPrize, drawnNumbers, isDrawing, canPlay]);

  // Initialize new game
  const handleNewGame = () => {
    if (!canPlay) return;

    const newCard = generateCard();
    setCard(newCard);
    setMarked(Array(5).fill(null).map((_, col) =>
      Array(5).fill(null).map((_, row) => col === 2 && row === 2)
    ));
    setDrawnNumbers([]);
    setCurrentNumber(null);
    setWonPrize(null);
    setAutoPlay(false);
  };

  // Initialize on mount
  useEffect(() => {
    if (card.length === 0 && canPlay) {
      handleNewGame();
    }
  }, [canPlay]);

  const getColumnLetter = (col: number): string => {
    return ['B', 'I', 'N', 'G', 'O'][col];
  };

  const getPatternIcon = (pattern: WinPattern): string => {
    const icons: Record<WinPattern, string> = {
      'row': '➡️',
      'column': '⬇️',
      'diagonal': '↘️',
      'four-corners': '📐',
      'full-card': '🏆',
    };
    return icons[pattern];
  };

  return (
    <div className="bingo-game">
      <div className="bingo-header">
        <div className="header-title">
          <span className="title-icon">🎱</span>
          <h3>Bingo</h3>
        </div>
        <div className="bingo-info">
          {canPlay ? (
            <span className="info-text">Match patterns to win!</span>
          ) : (
            <span className="cooldown-text">Next game in: {formatTime(timeUntilNext)}</span>
          )}
        </div>
      </div>

      {/* Prize won banner */}
      {wonPrize && (
        <div className="prize-won-banner" style={{ borderColor: wonPrize.prize.color }}>
          <div className="confetti-burst">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="confetti-piece" />
            ))}
          </div>
          <div className="won-content">
            <div className="won-icon" style={{ textShadow: `0 0 20px ${wonPrize.prize.color}` }}>
              {wonPrize.prize.icon}
            </div>
            <div className="won-text">
              <div className="won-title">🎉 BINGO!</div>
              <div className="won-pattern">
                {getPatternIcon(wonPrize.pattern)}{' '}
                {wonPrize.pattern.replace(/-/g, ' ').toUpperCase()}
              </div>
              <div className="won-prize" style={{ color: wonPrize.prize.color }}>
                {wonPrize.prize.name}
              </div>
              <div className="won-stats">
                Completed in {wonPrize.numbersDrawn} draws!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current number display */}
      {currentNumber && (
        <div className="current-number-display">
          <div className="number-ball">
            <span className="ball-letter">{getColumnLetter(Math.floor((currentNumber - 1) / 15))}</span>
            <span className="ball-number">{currentNumber}</span>
          </div>
        </div>
      )}

      {/* Bingo card */}
      <div className="bingo-card">
        <div className="card-header">
          {['B', 'I', 'N', 'G', 'O'].map(letter => (
            <div key={letter} className="column-header">
              {letter}
            </div>
          ))}
        </div>
        <div className="card-grid">
          {Array.from({ length: 5 }).map((_, row) => (
            <div key={row} className="card-row">
              {Array.from({ length: 5 }).map((_, col) => {
                const number = card[col]?.[row];
                const isMarked = marked[col]?.[row];
                const isFree = col === 2 && row === 2;

                return (
                  <div
                    key={`${col}-${row}`}
                    className={`bingo-cell ${isMarked ? 'marked' : ''} ${isFree ? 'free' : ''}`}
                  >
                    {isFree ? 'FREE' : number || ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Drawn numbers */}
      <div className="drawn-numbers-section">
        <h4>🎲 Drawn Numbers ({drawnNumbers.length}/75)</h4>
        <div className="drawn-numbers">
          {drawnNumbers.length === 0 ? (
            <span className="no-numbers">No numbers drawn yet</span>
          ) : (
            drawnNumbers.slice(-10).reverse().map((num, index) => (
              <div
                key={index}
                className={`drawn-number ${index === 0 ? 'latest' : ''}`}
              >
                <span className="num-letter">{getColumnLetter(Math.floor((num - 1) / 15))}</span>
                {num}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bingo-actions">
        {!wonPrize && drawnNumbers.length < 75 && (
          <>
            <button
              className="draw-btn"
              onClick={drawNumber}
              disabled={!canPlay || isDrawing || autoPlay}
            >
              {isDrawing ? '🎲 Drawing...' : '🎲 Draw Number'}
            </button>
            <button
              className={`auto-btn ${autoPlay ? 'active' : ''}`}
              onClick={() => setAutoPlay(!autoPlay)}
              disabled={!canPlay || isDrawing}
            >
              {autoPlay ? '⏸️ Pause' : '▶️ Auto Play'}
            </button>
          </>
        )}

        <button
          className="new-game-btn"
          onClick={handleNewGame}
          disabled={!canPlay}
        >
          {canPlay ? '🎱 New Game' : `⏰ ${formatTime(timeUntilNext)}`}
        </button>
      </div>

      {/* Patterns guide */}
      <div className="patterns-guide">
        <h4>🎯 Winning Patterns</h4>
        <div className="patterns-grid">
          {(Object.keys(PRIZES) as WinPattern[]).map(pattern => (
            <div key={pattern} className="pattern-item">
              <span className="pattern-icon">{getPatternIcon(pattern)}</span>
              <span className="pattern-name">{pattern.replace(/-/g, ' ')}</span>
              <span className="pattern-prize">{PRIZES[pattern].icon} {PRIZES[pattern].name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bingo;
