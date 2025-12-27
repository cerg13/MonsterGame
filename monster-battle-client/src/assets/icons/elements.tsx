/**
 * Element Icons - SVG icons for each element type
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

export const FireIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#ff4500" />
        <stop offset="50%" stopColor="#ff6b35" />
        <stop offset="100%" stopColor="#ffd700" />
      </linearGradient>
    </defs>
    <path
      d="M12 2C12 2 8 6 8 10C8 12 9 13 9 13C9 13 8 11 10 9C10 9 10 12 12 14C14 12 14 9 14 9C16 11 15 13 15 13C15 13 16 12 16 10C16 6 12 2 12 2ZM12 20C8.7 20 6 17.3 6 14C6 11.5 7.5 9.5 9 8C9 10 10 12 12 12C14 12 15 10 15 8C16.5 9.5 18 11.5 18 14C18 17.3 15.3 20 12 20Z"
      fill="url(#fireGrad)"
    />
    <ellipse cx="12" cy="16" rx="3" ry="2" fill="#fff" opacity="0.3" />
  </svg>
);

export const WaterIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00d4ff" />
        <stop offset="100%" stopColor="#0066cc" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L5 12C5 17 8 20 12 20C16 20 19 17 19 12L12 2Z"
      fill="url(#waterGrad)"
    />
    <ellipse cx="10" cy="12" rx="2" ry="3" fill="#fff" opacity="0.4" />
    <circle cx="9" cy="10" r="1" fill="#fff" opacity="0.6" />
  </svg>
);

export const WindIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="windGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#98fb98" />
        <stop offset="100%" stopColor="#32cd32" />
      </linearGradient>
    </defs>
    <path
      d="M4 8H14C16 8 18 6 18 4C18 2 16 1 14 2"
      stroke="url(#windGrad)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M4 12H18C20 12 22 14 22 16C22 18 20 19 18 18"
      stroke="url(#windGrad)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M4 16H10C12 16 14 18 14 20C14 22 12 23 10 22"
      stroke="url(#windGrad)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

export const LightIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <radialGradient id="lightGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fffacd" />
        <stop offset="100%" stopColor="#ffd700" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="5" fill="url(#lightGrad)" />
    <g stroke="#ffd700" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
      <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
    </g>
  </svg>
);

export const DarkIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="darkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4a0080" />
        <stop offset="100%" stopColor="#1a0033" />
      </linearGradient>
    </defs>
    <path
      d="M12 3C7 3 3 7 3 12C3 17 7 21 12 21C12 21 9 18 9 12C9 6 12 3 12 3Z"
      fill="url(#darkGrad)"
    />
    <circle cx="7" cy="9" r="1" fill="#fff" opacity="0.6" />
    <circle cx="5" cy="14" r="0.5" fill="#fff" opacity="0.4" />
    <circle cx="8" cy="16" r="0.7" fill="#fff" opacity="0.5" />
  </svg>
);

// Element icon map
export const ElementIcons: Record<string, React.FC<IconProps>> = {
  fire: FireIcon,
  water: WaterIcon,
  wind: WindIcon,
  light: LightIcon,
  dark: DarkIcon,
};

// Get element icon component
export const getElementIcon = (element: string): React.FC<IconProps> => {
  return ElementIcons[element.toLowerCase()] || FireIcon;
};

// Element colors for styling
export const ElementColors: Record<string, { primary: string; secondary: string; glow: string }> = {
  fire: { primary: '#ff4500', secondary: '#ffd700', glow: 'rgba(255, 69, 0, 0.5)' },
  water: { primary: '#00bfff', secondary: '#0066cc', glow: 'rgba(0, 191, 255, 0.5)' },
  wind: { primary: '#32cd32', secondary: '#98fb98', glow: 'rgba(50, 205, 50, 0.5)' },
  light: { primary: '#ffd700', secondary: '#fffacd', glow: 'rgba(255, 215, 0, 0.5)' },
  dark: { primary: '#8b00ff', secondary: '#4a0080', glow: 'rgba(139, 0, 255, 0.5)' },
};
