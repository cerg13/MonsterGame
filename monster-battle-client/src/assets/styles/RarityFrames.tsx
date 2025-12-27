/**
 * Rarity Frame Styles - Visual frames for different monster rarities
 * Common (gray), Rare (blue), SR (purple), SSR (gold)
 */

import React from 'react';

interface FrameProps {
  size?: number;
  className?: string;
  children?: React.ReactNode;
}

// Frame colors by rarity
export const RarityColors = {
  common: {
    border: '#808080',
    background: 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%)',
    glow: 'rgba(128, 128, 128, 0.3)',
    accent: '#666666',
  },
  rare: {
    border: '#4169e1',
    background: 'linear-gradient(135deg, #1a3a6e 0%, #0d1f3c 100%)',
    glow: 'rgba(65, 105, 225, 0.4)',
    accent: '#6495ed',
  },
  sr: {
    border: '#9932cc',
    background: 'linear-gradient(135deg, #4a1a6e 0%, #2a0d3c 100%)',
    glow: 'rgba(153, 50, 204, 0.5)',
    accent: '#ba55d3',
  },
  ssr: {
    border: '#ffd700',
    background: 'linear-gradient(135deg, #6e5a1a 0%, #3c310d 100%)',
    glow: 'rgba(255, 215, 0, 0.6)',
    accent: '#ffec8b',
  },
};

// Common Frame - Simple gray border
export const CommonFrame: React.FC<FrameProps> = ({ size = 100, className, children }) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      position: 'relative',
      borderRadius: 8,
      background: RarityColors.common.background,
      border: `3px solid ${RarityColors.common.border}`,
      boxShadow: `0 0 10px ${RarityColors.common.glow}`,
      overflow: 'hidden',
    }}
  >
    {children}
  </div>
);

// Rare Frame - Blue border with corner accents
export const RareFrame: React.FC<FrameProps> = ({ size = 100, className, children }) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      position: 'relative',
      borderRadius: 10,
      background: RarityColors.rare.background,
      border: `3px solid ${RarityColors.rare.border}`,
      boxShadow: `0 0 15px ${RarityColors.rare.glow}, inset 0 0 20px rgba(65, 105, 225, 0.2)`,
      overflow: 'hidden',
    }}
  >
    {/* Corner decorations */}
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 100"
    >
      <path d="M0 15 L0 0 L15 0" stroke={RarityColors.rare.accent} strokeWidth="2" fill="none" />
      <path d="M85 0 L100 0 L100 15" stroke={RarityColors.rare.accent} strokeWidth="2" fill="none" />
      <path d="M100 85 L100 100 L85 100" stroke={RarityColors.rare.accent} strokeWidth="2" fill="none" />
      <path d="M15 100 L0 100 L0 85" stroke={RarityColors.rare.accent} strokeWidth="2" fill="none" />
    </svg>
    {children}
  </div>
);

// SR Frame - Purple with animated glow
export const SRFrame: React.FC<FrameProps> = ({ size = 100, className, children }) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      position: 'relative',
      borderRadius: 12,
      background: RarityColors.sr.background,
      border: `3px solid ${RarityColors.sr.border}`,
      boxShadow: `0 0 20px ${RarityColors.sr.glow}, inset 0 0 25px rgba(153, 50, 204, 0.3)`,
      overflow: 'hidden',
    }}
  >
    {/* Decorative frame */}
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id="srFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={RarityColors.sr.accent} />
          <stop offset="50%" stopColor={RarityColors.sr.border} />
          <stop offset="100%" stopColor={RarityColors.sr.accent} />
        </linearGradient>
      </defs>
      {/* Corner ornaments */}
      <path d="M0 20 L0 0 L20 0 M0 10 L10 0" stroke="url(#srFrameGrad)" strokeWidth="2" fill="none" />
      <path d="M80 0 L100 0 L100 20 M90 0 L100 10" stroke="url(#srFrameGrad)" strokeWidth="2" fill="none" />
      <path d="M100 80 L100 100 L80 100 M100 90 L90 100" stroke="url(#srFrameGrad)" strokeWidth="2" fill="none" />
      <path d="M20 100 L0 100 L0 80 M10 100 L0 90" stroke="url(#srFrameGrad)" strokeWidth="2" fill="none" />
      {/* Center gems */}
      <circle cx="50" cy="2" r="3" fill={RarityColors.sr.accent}>
        <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.6;1;0.6" />
      </circle>
      <circle cx="50" cy="98" r="3" fill={RarityColors.sr.accent}>
        <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.6;1;0.6" />
      </circle>
    </svg>
    {children}
  </div>
);

// SSR Frame - Gold with sparkles and animated effects
export const SSRFrame: React.FC<FrameProps> = ({ size = 100, className, children }) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      position: 'relative',
      borderRadius: 14,
      background: RarityColors.ssr.background,
      border: `4px solid ${RarityColors.ssr.border}`,
      boxShadow: `0 0 25px ${RarityColors.ssr.glow}, 0 0 50px rgba(255, 215, 0, 0.3), inset 0 0 30px rgba(255, 215, 0, 0.2)`,
      overflow: 'hidden',
    }}
  >
    {/* Elaborate decorative frame */}
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id="ssrFrameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff5cc" />
          <stop offset="50%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ff8c00" />
        </linearGradient>
        <filter id="ssrGlow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#ssrGlow)">
        {/* Ornate corners */}
        <path d="M0 25 L0 0 L25 0" stroke="url(#ssrFrameGrad)" strokeWidth="3" fill="none" />
        <path d="M0 12 L12 0" stroke="url(#ssrFrameGrad)" strokeWidth="2" fill="none" />
        <circle cx="5" cy="5" r="3" fill="#ffd700" />

        <path d="M75 0 L100 0 L100 25" stroke="url(#ssrFrameGrad)" strokeWidth="3" fill="none" />
        <path d="M88 0 L100 12" stroke="url(#ssrFrameGrad)" strokeWidth="2" fill="none" />
        <circle cx="95" cy="5" r="3" fill="#ffd700" />

        <path d="M100 75 L100 100 L75 100" stroke="url(#ssrFrameGrad)" strokeWidth="3" fill="none" />
        <path d="M100 88 L88 100" stroke="url(#ssrFrameGrad)" strokeWidth="2" fill="none" />
        <circle cx="95" cy="95" r="3" fill="#ffd700" />

        <path d="M25 100 L0 100 L0 75" stroke="url(#ssrFrameGrad)" strokeWidth="3" fill="none" />
        <path d="M12 100 L0 88" stroke="url(#ssrFrameGrad)" strokeWidth="2" fill="none" />
        <circle cx="5" cy="95" r="3" fill="#ffd700" />

        {/* Top/bottom gems */}
        <polygon points="50,0 54,6 50,4 46,6" fill="#ffd700">
          <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.7;1;0.7" />
        </polygon>
        <polygon points="50,100 54,94 50,96 46,94" fill="#ffd700">
          <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.7;1;0.7" />
        </polygon>

        {/* Sparkles */}
        <circle cx="20" cy="20" r="1.5" fill="#fff">
          <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0;1;0" begin="0s" />
        </circle>
        <circle cx="80" cy="30" r="1" fill="#fff">
          <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0;1;0" begin="0.5s" />
        </circle>
        <circle cx="70" cy="80" r="1.5" fill="#fff">
          <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0;1;0" begin="1s" />
        </circle>
        <circle cx="25" cy="70" r="1" fill="#fff">
          <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0;1;0" begin="1.5s" />
        </circle>
      </g>
    </svg>
    {children}
  </div>
);

// Frame map by rarity
export const RarityFrames: Record<string, React.FC<FrameProps>> = {
  common: CommonFrame,
  rare: RareFrame,
  sr: SRFrame,
  ssr: SSRFrame,
};

// Get frame component by rarity
export const getRarityFrame = (rarity: string): React.FC<FrameProps> => {
  return RarityFrames[rarity.toLowerCase()] || CommonFrame;
};

// CSS styles for rarity backgrounds (for non-React usage)
export const rarityCSS = {
  common: `
    background: linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 100%);
    border: 3px solid #808080;
    box-shadow: 0 0 10px rgba(128, 128, 128, 0.3);
  `,
  rare: `
    background: linear-gradient(135deg, #1a3a6e 0%, #0d1f3c 100%);
    border: 3px solid #4169e1;
    box-shadow: 0 0 15px rgba(65, 105, 225, 0.4);
  `,
  sr: `
    background: linear-gradient(135deg, #4a1a6e 0%, #2a0d3c 100%);
    border: 3px solid #9932cc;
    box-shadow: 0 0 20px rgba(153, 50, 204, 0.5);
  `,
  ssr: `
    background: linear-gradient(135deg, #6e5a1a 0%, #3c310d 100%);
    border: 4px solid #ffd700;
    box-shadow: 0 0 25px rgba(255, 215, 0, 0.6), 0 0 50px rgba(255, 215, 0, 0.3);
  `,
};

// Rarity star component
export const RarityStars: React.FC<{ rarity: string; size?: number }> = ({ rarity, size = 12 }) => {
  const starCount = { common: 1, rare: 2, sr: 3, ssr: 5 }[rarity.toLowerCase()] || 1;
  const color = RarityColors[rarity.toLowerCase() as keyof typeof RarityColors]?.border || '#808080';

  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: starCount }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24">
          <path
            d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z"
            fill={color}
            stroke={color}
            strokeWidth="1"
          />
        </svg>
      ))}
    </div>
  );
};
