/**
 * Rune Icons - SVG icons for rune types and sets
 */

import React from 'react';

interface RuneIconProps {
  size?: number;
  className?: string;
  slot?: number;
  quality?: 'common' | 'rare' | 'epic' | 'legendary';
}

// Quality colors
const QualityColors = {
  common: { primary: '#808080', secondary: '#666666', glow: 'rgba(128, 128, 128, 0.3)' },
  rare: { primary: '#4169e1', secondary: '#6495ed', glow: 'rgba(65, 105, 225, 0.4)' },
  epic: { primary: '#9932cc', secondary: '#ba55d3', glow: 'rgba(153, 50, 204, 0.5)' },
  legendary: { primary: '#ffd700', secondary: '#ffec8b', glow: 'rgba(255, 215, 0, 0.6)' },
};

// Base Rune Shape
export const RuneBase: React.FC<RuneIconProps> = ({ size = 48, className, slot = 1, quality = 'common' }) => {
  const colors = QualityColors[quality];
  const slotShapes: Record<number, string> = {
    1: 'M24 5 L40 15 L40 35 L24 45 L8 35 L8 15 Z', // Hexagon - ATK
    2: 'M24 5 L43 24 L24 43 L5 24 Z', // Diamond - HP
    3: 'M12 8 L36 8 L42 24 L36 40 L12 40 L6 24 Z', // Shield - DEF
    4: 'M24 5 L35 18 L35 35 L24 45 L13 35 L13 18 Z', // Elongated hex - SPD
    5: 'M24 8 L38 16 L38 32 L24 40 L10 32 L10 16 Z', // Regular hex - CR
    6: 'M20 5 L28 5 L40 20 L40 30 L28 45 L20 45 L8 30 L8 20 Z', // Octagon - CD
  };

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`runeGrad${slot}${quality}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="50%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>
        <filter id={`runeGlow${quality}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#runeGlow${quality})`}>
        {/* Outer shape */}
        <path
          d={slotShapes[slot] || slotShapes[1]}
          fill={`url(#runeGrad${slot}${quality})`}
          stroke={colors.secondary}
          strokeWidth="2"
        />
        {/* Inner pattern */}
        <path
          d={slotShapes[slot] || slotShapes[1]}
          fill="none"
          stroke={colors.secondary}
          strokeWidth="1"
          transform="translate(24, 24) scale(0.6) translate(-24, -24)"
          opacity="0.5"
        />
        {/* Center symbol */}
        <circle cx="24" cy="24" r="6" fill={colors.secondary} opacity="0.8" />
        <text x="24" y="28" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
          {slot}
        </text>
      </g>
    </svg>
  );
};

// Energy Set Rune
export const EnergyRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`energyRune${quality}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ff00" />
          <stop offset="100%" stopColor="#008800" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Lightning bolt */}
      <path d="M28 10 L20 24 L26 24 L18 38 L30 22 L24 22 Z" fill="url(#energyRune${quality})" />
    </svg>
  );
};

// Fatal Set Rune (ATK)
export const FatalRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`fatalRune${quality}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff4444" />
          <stop offset="100%" stopColor="#880000" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Crossed swords */}
      <path d="M14 34 L24 14 L34 34 M18 28 L30 28" stroke="url(#fatalRune${quality})" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// Swift Set Rune (SPD)
export const SwiftRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`swiftRune${quality}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="100%" stopColor="#0088ff" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Speed lines */}
      <path d="M12 20 L36 20 M14 24 L38 24 M12 28 L36 28" stroke="url(#swiftRune${quality})" strokeWidth="2" strokeLinecap="round" />
      <path d="M32 16 L38 24 L32 32" stroke="url(#swiftRune${quality})" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// Blade Set Rune (Crit)
export const BladeRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`bladeRune${quality}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff8800" />
          <stop offset="100%" stopColor="#ff4400" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Blade symbol */}
      <path d="M24 10 L28 30 L24 38 L20 30 Z" fill="url(#bladeRune${quality})" />
      <path d="M18 22 L30 22" stroke="url(#bladeRune${quality})" strokeWidth="2" />
    </svg>
  );
};

// Rage Set Rune (Crit DMG)
export const RageRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <radialGradient id={`rageRune${quality}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff0000" />
          <stop offset="100%" stopColor="#660000" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Explosion symbol */}
      <path d="M24 12 L26 20 L34 18 L28 24 L36 28 L28 28 L30 36 L24 30 L18 36 L20 28 L12 28 L20 24 L14 18 L22 20 Z"
            fill="url(#rageRune${quality})" />
    </svg>
  );
};

// Focus Set Rune (Accuracy)
export const FocusRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`focusRune${quality}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffff00" />
          <stop offset="100%" stopColor="#888800" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Target symbol */}
      <circle cx="24" cy="24" r="12" stroke="url(#focusRune${quality})" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="6" stroke="url(#focusRune${quality})" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="2" fill="url(#focusRune${quality})" />
    </svg>
  );
};

// Guard Set Rune (DEF)
export const GuardRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`guardRune${quality}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#888888" />
          <stop offset="100%" stopColor="#444444" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Shield symbol */}
      <path d="M24 12 L34 16 L34 26 Q34 34 24 38 Q14 34 14 26 L14 16 Z"
            fill="url(#guardRune${quality})" stroke={colors.secondary} strokeWidth="1" />
    </svg>
  );
};

// Endure Set Rune (Resistance)
export const EndureRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`endureRune${quality}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" />
          <stop offset="100%" stopColor="#008844" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Heart/fortress symbol */}
      <path d="M24 34 Q16 28 16 22 Q16 16 20 16 Q24 16 24 20 Q24 16 28 16 Q32 16 32 22 Q32 28 24 34"
            fill="url(#endureRune${quality})" />
    </svg>
  );
};

// Violent Set Rune (Extra turn)
export const ViolentRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`violentRune${quality}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#880088" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Double arrow symbol */}
      <path d="M18 28 L24 16 L30 28 M18 34 L24 22 L30 34" stroke="url(#violentRune${quality})" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
};

// Vampire Set Rune (Lifesteal)
export const VampireRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`vampireRune${quality}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8b0000" />
          <stop offset="100%" stopColor="#400000" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Bat wings / fangs symbol */}
      <path d="M24 14 L20 20 L12 18 L18 24 L12 30 L20 28 L24 34 L28 28 L36 30 L30 24 L36 18 L28 20 Z"
            fill={`url(#vampireRune${quality})`} />
      <circle cx="20" cy="22" r="2" fill="#ff0000" />
      <circle cx="28" cy="22" r="2" fill="#ff0000" />
    </svg>
  );
};

// Will Set Rune (Immunity)
export const WillRuneIcon: React.FC<RuneIconProps> = ({ size = 48, className, quality = 'common' }) => {
  const colors = QualityColors[quality];
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className}>
      <defs>
        <linearGradient id={`willRune${quality}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#aaaaff" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill={colors.primary} stroke={colors.secondary} strokeWidth="2" />
      {/* Wing/halo symbol */}
      <ellipse cx="24" cy="16" rx="10" ry="4" stroke="url(#willRune${quality})" strokeWidth="2" fill="none" />
      <path d="M16 22 Q10 30 16 38 M32 22 Q38 30 32 38" stroke="url(#willRune${quality})" strokeWidth="2" fill="none" />
    </svg>
  );
};

// Rune set icons map
export const RuneSetIcons: Record<string, React.FC<RuneIconProps>> = {
  energy: EnergyRuneIcon,
  fatal: FatalRuneIcon,
  swift: SwiftRuneIcon,
  blade: BladeRuneIcon,
  rage: RageRuneIcon,
  focus: FocusRuneIcon,
  guard: GuardRuneIcon,
  endure: EndureRuneIcon,
  violent: ViolentRuneIcon,
  vampire: VampireRuneIcon,
  will: WillRuneIcon,
};

// Get rune icon by set name
export const getRuneSetIcon = (setName: string): React.FC<RuneIconProps> => {
  return RuneSetIcons[setName.toLowerCase()] || EnergyRuneIcon;
};

// Rune slot stat labels
export const RuneSlotStats: Record<number, string> = {
  1: 'ATK',
  2: 'HP/DEF/SPD',
  3: 'DEF',
  4: 'HP/ATK/DEF/CR/CD',
  5: 'HP',
  6: 'HP/ATK/DEF/ACC/RES',
};
