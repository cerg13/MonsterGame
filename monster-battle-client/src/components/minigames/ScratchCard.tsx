import React, { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './ScratchCard.css';

interface Prize {
  id: string;
  symbol: string;
  name: string;
  type: 'crystals' | 'gold' | 'energy' | 'scroll';
  amount: number;
  color: string;
  rarity: number; // 1-5, higher = rarer
}

interface ScratchCardProps {
  onWin?: (prize: Prize) => void;
  canPlay?: boolean;
  lastPlayDate?: Date | null;
}

const SYMBOLS: Prize[] = [
  { id: '1', symbol: '💎', name: '200 Crystals', type: 'crystals', amount: 200, color: '#48dbfb', rarity: 5 },
  { id: '2', symbol: '⭐', name: '100 Crystals', type: 'crystals', amount: 100, color: '#fed330', rarity: 4 },
  { id: '3', symbol: '💰', name: '50K Gold', type: 'gold', amount: 50000, color: '#f7b731', rarity: 3 },
  { id: '4', symbol: '⚡', name: '50 Energy', type: 'energy', amount: 50, color: '#26de81', rarity: 3 },
  { id: '5', symbol: '🎁', name: '25K Gold', type: 'gold', amount: 25000, color: '#45aaf2', rarity: 2 },
  { id: '6', symbol: '📜', name: 'Mystical Scroll', type: 'scroll', amount: 1, color: '#a55eea', rarity: 5 },
];

export const ScratchCard: React.FC<ScratchCardProps> = ({
  onWin,
  canPlay: canPlayProp = true,
  lastPlayDate = null,
}) => {
  const { achievement } = useNotification();
  const [panels, setPanels] = useState<Prize[]>([]);
  const [scratched, setScratched] = useState<boolean[]>(Array(9).fill(false));
  const [isRevealed, setIsRevealed] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

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

  // Generate scratch card with guaranteed win logic
  const generateCard = () => {
    // 70% chance to win
    const willWin = Math.random() < 0.7;

    if (willWin) {
      // Select winning symbol based on rarity
      const rarityRoll = Math.random() * 15; // Total rarity sum
      let winSymbol = SYMBOLS[4]; // Default to common

      let cumulativeRarity = 0;
      for (const symbol of SYMBOLS) {
        cumulativeRarity += symbol.rarity;
        if (rarityRoll <= cumulativeRarity) {
          winSymbol = symbol;
          break;
        }
      }

      // Place 3 winning symbols + 6 random
      const newPanels: Prize[] = Array(9).fill(null).map((_, i) => {
        if (i < 3) return winSymbol;
        // Random non-winning symbol
        const otherSymbols = SYMBOLS.filter(s => s.id !== winSymbol.id);
        return otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
      });

      // Shuffle
      for (let i = newPanels.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newPanels[i], newPanels[j]] = [newPanels[j], newPanels[i]];
      }

      setPanels(newPanels);
    } else {
      // Losing card - no 3 matches
      const newPanels: Prize[] = [];
      const symbolCounts = new Map<string, number>();

      for (let i = 0; i < 9; i++) {
        let symbol;
        let attempts = 0;

        do {
          symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          attempts++;
        } while (
          (symbolCounts.get(symbol.id) || 0) >= 2 &&
          attempts < 20
        );

        newPanels.push(symbol);
        symbolCounts.set(symbol.id, (symbolCounts.get(symbol.id) || 0) + 1);
      }

      setPanels(newPanels);
    }

    setScratched(Array(9).fill(false));
    setIsRevealed(false);
    setWonPrize(null);
  };

  // Initialize canvas scratch effect
  useEffect(() => {
    canvasRefs.current.forEach((canvas, index) => {
      if (!canvas || scratched[index]) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw scratch-off layer
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add texture
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#999999';
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 20,
          Math.random() * 20
        );
      }
      ctx.globalAlpha = 1;

      // Add "SCRATCH HERE" text
      ctx.fillStyle = '#666666';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SCRATCH', canvas.width / 2, canvas.height / 2 - 5);
      ctx.fillText('HERE', canvas.width / 2, canvas.height / 2 + 10);
    });
  }, [panels, scratched]);

  const scratch = (index: number, x: number, y: number) => {
    if (scratched[index] || !canPlay) return;

    const canvas = canvasRefs.current[index];
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = x - rect.left;
    const canvasY = y - rect.top;

    // Erase at position
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Check if scratched enough (> 60% revealed)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) transparent++;
    }

    const percentScratched = (transparent / (pixels.length / 4)) * 100;

    if (percentScratched > 60) {
      const newScratched = [...scratched];
      newScratched[index] = true;
      setScratched(newScratched);

      // Check for win when 5+ panels scratched
      if (newScratched.filter(s => s).length >= 5) {
        checkWin(newScratched);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent, index: number) => {
    if (!isScratching) return;
    scratch(index, e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    scratch(index, touch.clientX, touch.clientY);
  };

  const checkWin = (scratchedState: boolean[]) => {
    // Count symbol occurrences
    const symbolCounts = new Map<string, number>();

    panels.forEach((panel, index) => {
      if (scratchedState[index]) {
        symbolCounts.set(panel.id, (symbolCounts.get(panel.id) || 0) + 1);
      }
    });

    // Check for 3 matches
    for (const [symbolId, count] of symbolCounts.entries()) {
      if (count >= 3) {
        const prize = SYMBOLS.find(s => s.id === symbolId);
        if (prize) {
          setWonPrize(prize);

          if (prize.rarity >= 4) {
            achievement(`🎉 LUCKY! Won ${prize.name}!`, {
              title: '🎰 Scratch Card Winner!',
              duration: 6000,
              priority: 'high'
            });
          }

          if (onWin) {
            onWin(prize);
          }

          // Auto-reveal rest
          setTimeout(() => revealAll(), 1000);
        }
        return;
      }
    }
  };

  const revealAll = () => {
    setScratched(Array(9).fill(true));
    setIsRevealed(true);

    // Clear all canvases
    canvasRefs.current.forEach(canvas => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    });

    // Check final result
    if (!wonPrize) {
      checkWin(Array(9).fill(true));
    }
  };

  const handleNewCard = () => {
    if (!canPlay) return;
    generateCard();
  };

  // Generate initial card
  useEffect(() => {
    if (panels.length === 0 && canPlay) {
      generateCard();
    }
  }, [canPlay]);

  return (
    <div className="scratch-card-game">
      <div className="scratch-header">
        <div className="header-title">
          <span className="title-icon">🎫</span>
          <h3>Scratch Card</h3>
        </div>
        <div className="scratch-info">
          {canPlay ? (
            <span className="info-text">Scratch to reveal prizes!</span>
          ) : (
            <span className="cooldown-text">Next card in: {formatTime(timeUntilNext)}</span>
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
          <div className="won-icon" style={{ textShadow: `0 0 20px ${wonPrize.color}` }}>
            {wonPrize.symbol}
          </div>
          <div className="won-text">
            <div className="won-title">🎉 You Won!</div>
            <div className="won-prize" style={{ color: wonPrize.color }}>
              {wonPrize.name}
            </div>
          </div>
        </div>
      )}

      {/* Scratch panels */}
      <div className="scratch-panels">
        {panels.map((panel, index) => (
          <div
            key={index}
            className={`scratch-panel ${scratched[index] ? 'scratched' : ''}`}
          >
            <div className="panel-content" style={{ color: panel.color }}>
              <span className="panel-symbol">{panel.symbol}</span>
            </div>
            {!scratched[index] && (
              <canvas
                ref={el => { canvasRefs.current[index] = el; }}
                className="scratch-canvas"
                width={100}
                height={100}
                onMouseDown={() => setIsScratching(true)}
                onMouseUp={() => setIsScratching(false)}
                onMouseLeave={() => setIsScratching(false)}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onTouchStart={() => setIsScratching(true)}
                onTouchEnd={() => setIsScratching(false)}
                onTouchMove={(e) => handleTouchMove(e, index)}
              />
            )}
          </div>
        ))}
      </div>

      {/* How to win */}
      <div className="scratch-rules">
        <h4>🎯 How to Win</h4>
        <p>Scratch off the panels to reveal symbols. Match 3 identical symbols to win the prize!</p>
        <div className="symbol-guide">
          {SYMBOLS.map(symbol => (
            <div key={symbol.id} className="symbol-item">
              <span className="symbol-icon">{symbol.symbol}</span>
              <span className="symbol-name">{symbol.name}</span>
              <span className="symbol-rarity">
                {'⭐'.repeat(symbol.rarity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="scratch-actions">
        {!isRevealed && scratched.some(s => s) && (
          <button className="reveal-btn" onClick={revealAll}>
            👁️ Reveal All
          </button>
        )}

        {(isRevealed || panels.length === 0) && (
          <button
            className="new-card-btn"
            onClick={handleNewCard}
            disabled={!canPlay}
          >
            {canPlay ? '🎫 New Card' : `⏰ ${formatTime(timeUntilNext)}`}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="scratch-stats">
        <div className="stat-item">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">70%</span>
          <span className="stat-label">Win Rate</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">🎁</span>
          <span className="stat-value">{scratched.filter(s => s).length}/9</span>
          <span className="stat-label">Scratched</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏰</span>
          <span className="stat-value">Daily</span>
          <span className="stat-label">Frequency</span>
        </div>
      </div>
    </div>
  );
};

export default ScratchCard;
