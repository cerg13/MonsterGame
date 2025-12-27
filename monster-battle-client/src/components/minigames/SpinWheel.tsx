import React, { useState, useRef } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import './SpinWheel.css';

interface Prize {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'crystals' | 'gold' | 'energy' | 'scroll';
  amount: number;
  weight: number; // Probability weight
}

interface SpinWheelProps {
  onWin?: (prize: Prize) => void;
  canSpin?: boolean;
  lastSpinDate?: Date | null;
}

const PRIZES: Prize[] = [
  { id: '1', name: '50 Crystals', icon: '💎', color: '#48dbfb', type: 'crystals', amount: 50, weight: 10 },
  { id: '2', name: '10K Gold', icon: '💰', color: '#fed330', type: 'gold', amount: 10000, weight: 20 },
  { id: '3', name: '20 Energy', icon: '⚡', color: '#26de81', type: 'energy', amount: 20, weight: 25 },
  { id: '4', name: '100 Crystals', icon: '💎', color: '#45aaf2', type: 'crystals', amount: 100, weight: 5 },
  { id: '5', name: '25K Gold', icon: '💰', color: '#f7b731', type: 'gold', amount: 25000, weight: 15 },
  { id: '6', name: 'Mystical Scroll', icon: '📜', color: '#a55eea', type: 'scroll', amount: 1, weight: 3 },
  { id: '7', name: '50 Energy', icon: '⚡', color: '#20bf6b', type: 'energy', amount: 50, weight: 12 },
  { id: '8', name: '200 Crystals', icon: '💎', color: '#3498db', type: 'crystals', amount: 200, weight: 2 },
];

export const SpinWheel: React.FC<SpinWheelProps> = ({
  onWin,
  canSpin: canSpinProp = true,
  lastSpinDate = null,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { success, achievement } = useNotification();

  // Check if can spin (once per day)
  const canSpinToday = (): boolean => {
    if (!canSpinProp) return false;
    if (!lastSpinDate) return true;

    const now = new Date();
    const lastSpin = new Date(lastSpinDate);
    const hoursSinceLastSpin = (now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60);

    return hoursSinceLastSpin >= 24;
  };

  const canSpin = canSpinToday();

  // Select random prize based on weights
  const selectPrize = (): Prize => {
    const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;

    for (const prize of PRIZES) {
      random -= prize.weight;
      if (random <= 0) {
        return prize;
      }
    }

    return PRIZES[0]; // Fallback
  };

  const handleSpin = () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);

    // Select prize
    const prize = selectPrize();
    const prizeIndex = PRIZES.findIndex(p => p.id === prize.id);

    // Calculate rotation
    const degreesPerPrize = 360 / PRIZES.length;
    const prizeRotation = prizeIndex * degreesPerPrize;
    const extraSpins = 5; // Number of full rotations
    const randomOffset = Math.random() * (degreesPerPrize * 0.8) - (degreesPerPrize * 0.4); // Random within sector
    const finalRotation = rotation + (360 * extraSpins) + (360 - prizeRotation) + randomOffset;

    setRotation(finalRotation);

    // Wait for animation to complete
    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize);

      // Show notification
      if (prize.weight <= 5) {
        achievement(`🎉 JACKPOT! Won ${prize.name}!`, {
          title: '🎰 Spin Wheel Winner!',
          duration: 6000,
          priority: 'high',
        });
      } else {
        success(`Won ${prize.name}!`, {
          title: '🎰 Spin Wheel',
          duration: 4000,
        });
      }

      // Callback
      if (onWin) {
        onWin(prize);
      }
    }, 5000); // 5 seconds spin duration
  };

  const getTimeUntilNextSpin = (): string => {
    if (!lastSpinDate) return 'Ready to spin!';

    const now = new Date();
    const lastSpin = new Date(lastSpinDate);
    const hoursUntilNext = 24 - ((now.getTime() - lastSpin.getTime()) / (1000 * 60 * 60));

    if (hoursUntilNext <= 0) return 'Ready to spin!';

    const hours = Math.floor(hoursUntilNext);
    const minutes = Math.floor((hoursUntilNext - hours) * 60);

    return `${hours}h ${minutes}m until next spin`;
  };

  return (
    <div className="spin-wheel-container">
      {/* Header */}
      <div className="spin-wheel-header">
        <h3 className="wheel-title">
          <span className="title-icon">🎰</span>
          Daily Spin Wheel
        </h3>
        <div className="spin-status">
          {canSpin ? (
            <span className="status-ready">✨ Ready to spin!</span>
          ) : (
            <span className="status-cooldown">⏳ {getTimeUntilNextSpin()}</span>
          )}
        </div>
      </div>

      {/* Wheel */}
      <div className="wheel-wrapper">
        {/* Pointer */}
        <div className="wheel-pointer">
          <div className="pointer-triangle" />
        </div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          className={`wheel ${isSpinning ? 'spinning' : ''}`}
          style={{
            transform: `rotate(${rotation}deg)`,
          }}
        >
          {PRIZES.map((prize, index) => {
            const degreesPerPrize = 360 / PRIZES.length;
            const rotation = index * degreesPerPrize;

            return (
              <div
                key={prize.id}
                className="prize-sector"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: prize.color,
                }}
              >
                <div className="prize-content">
                  <span className="prize-icon">{prize.icon}</span>
                  <span className="prize-name">{prize.name}</span>
                </div>
              </div>
            );
          })}

          {/* Center button */}
          <button
            className={`spin-button ${!canSpin || isSpinning ? 'disabled' : ''}`}
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
          >
            {isSpinning ? '🌀' : '🎰'}
            <span className="spin-text">
              {isSpinning ? 'SPINNING...' : canSpin ? 'SPIN!' : 'LOCKED'}
            </span>
          </button>
        </div>

        {/* Outer ring decoration */}
        <div className="wheel-outer-ring" />
      </div>

      {/* Won Prize Display */}
      {wonPrize && (
        <div className="prize-won">
          <div className="prize-won-content">
            <div className="won-icon">{wonPrize.icon}</div>
            <div className="won-text">
              <span className="won-label">YOU WON!</span>
              <span className="won-prize">{wonPrize.name}</span>
            </div>
          </div>
          <div className="confetti">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  background: PRIZES[i % PRIZES.length].color,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prize List */}
      <div className="prize-list">
        <h4 className="prize-list-title">Available Prizes</h4>
        <div className="prize-grid">
          {PRIZES.map((prize) => {
            const probability = (prize.weight / PRIZES.reduce((sum, p) => sum + p.weight, 0)) * 100;
            return (
              <div
                key={prize.id}
                className="prize-item"
                style={{ borderColor: prize.color }}
              >
                <span className="prize-item-icon">{prize.icon}</span>
                <span className="prize-item-name">{prize.name}</span>
                <span className="prize-item-chance">{probability.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpinWheel;
