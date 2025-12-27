/**
 * Item Icons - SVG icons for resources and items
 * Gold, Crystal, Energy, Scrolls, Essences, etc.
 */

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// Gold Coin
export const GoldIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#ffec8b" />
        <stop offset="100%" stopColor="#daa520" />
      </linearGradient>
      <linearGradient id="goldShine" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff5cc" />
        <stop offset="100%" stopColor="#ffd700" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#goldGrad)" stroke="#b8860b" strokeWidth="1" />
    <ellipse cx="12" cy="12" rx="7" ry="7" fill="none" stroke="#b8860b" strokeWidth="0.5" />
    <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#8b6914">G</text>
    <ellipse cx="8" cy="8" rx="3" ry="2" fill="url(#goldShine)" opacity="0.6" />
  </svg>
);

// Crystal (Premium Currency)
export const CrystalIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e0e0ff" />
        <stop offset="30%" stopColor="#9090ff" />
        <stop offset="70%" stopColor="#6060cc" />
        <stop offset="100%" stopColor="#4040aa" />
      </linearGradient>
      <filter id="crystalGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#crystalGlow)">
      <path d="M12 2 L18 8 L18 16 L12 22 L6 16 L6 8 Z" fill="url(#crystalGrad)" stroke="#4040aa" strokeWidth="0.5" />
      <path d="M12 2 L12 22 M6 8 L18 8 M6 16 L18 16" stroke="#8080cc" strokeWidth="0.5" opacity="0.5" />
      <path d="M8 5 L10 10 L8 12" fill="#e0e0ff" opacity="0.6" />
    </g>
  </svg>
);

// Energy (Stamina)
export const EnergyIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="energyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00ff88" />
        <stop offset="100%" stopColor="#00aa44" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="#1a3a1a" stroke="#00aa44" strokeWidth="1" />
    <path d="M14 4 L10 12 L14 12 L10 20 L16 10 L12 10 Z" fill="url(#energyGrad)">
      <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.8;1;0.8" />
    </path>
  </svg>
);

// Arena Wings
export const ArenaWingsIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="wingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff8844" />
        <stop offset="100%" stopColor="#cc4400" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="#3a2a1a" stroke="#cc4400" strokeWidth="1" />
    {/* Left wing */}
    <path d="M12 12 Q6 8 4 6 Q6 12 8 16 Q10 14 12 12" fill="url(#wingsGrad)" />
    {/* Right wing */}
    <path d="M12 12 Q18 8 20 6 Q18 12 16 16 Q14 14 12 12" fill="url(#wingsGrad)" />
  </svg>
);

// Mystical Scroll
export const MysticalScrollIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffeecc" />
        <stop offset="100%" stopColor="#ddbb88" />
      </linearGradient>
      <radialGradient id="scrollMagic" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ff88ff" />
        <stop offset="100%" stopColor="#8800ff" />
      </radialGradient>
    </defs>
    {/* Scroll body */}
    <rect x="6" y="4" width="12" height="16" rx="1" fill="url(#scrollGrad)" />
    {/* Top roll */}
    <ellipse cx="12" cy="4" rx="6" ry="2" fill="#ddbb88" />
    <ellipse cx="12" cy="4" rx="5" ry="1.5" fill="#ffeecc" />
    {/* Bottom roll */}
    <ellipse cx="12" cy="20" rx="6" ry="2" fill="#ddbb88" />
    <ellipse cx="12" cy="20" rx="5" ry="1.5" fill="#ffeecc" />
    {/* Magic symbol */}
    <circle cx="12" cy="12" r="4" fill="url(#scrollMagic)">
      <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.6;1;0.6" />
    </circle>
    <path d="M12 9 L13 11 L15 12 L13 13 L12 15 L11 13 L9 12 L11 11 Z" fill="#fff" opacity="0.8" />
  </svg>
);

// Legendary Scroll
export const LegendaryScrollIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="legScrollGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff5cc" />
        <stop offset="50%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#cc9900" />
      </linearGradient>
      <filter id="legGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#legGlow)">
      <rect x="6" y="4" width="12" height="16" rx="1" fill="url(#legScrollGrad)" />
      <ellipse cx="12" cy="4" rx="6" ry="2" fill="#cc9900" />
      <ellipse cx="12" cy="4" rx="5" ry="1.5" fill="#ffd700" />
      <ellipse cx="12" cy="20" rx="6" ry="2" fill="#cc9900" />
      <ellipse cx="12" cy="20" rx="5" ry="1.5" fill="#ffd700" />
      {/* Star symbol */}
      <path d="M12 8 L13 11 L16 11 L14 13 L15 16 L12 14 L9 16 L10 13 L8 11 L11 11 Z" fill="#fff">
        <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.7;1;0.7" />
      </path>
    </g>
  </svg>
);

// Fire Essence
export const FireEssenceIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <radialGradient id="fireEss" cx="50%" cy="70%" r="50%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#ff6600" />
        <stop offset="100%" stopColor="#cc0000" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="#2a1a1a" stroke="#cc0000" strokeWidth="1" />
    <path d="M12 6 Q16 10 14 14 Q16 16 12 20 Q8 16 10 14 Q8 10 12 6" fill="url(#fireEss)">
      <animate attributeName="d" dur="0.5s" repeatCount="indefinite"
        values="M12 6 Q16 10 14 14 Q16 16 12 20 Q8 16 10 14 Q8 10 12 6;M12 5 Q17 9 15 13 Q17 17 12 21 Q7 17 9 13 Q7 9 12 5;M12 6 Q16 10 14 14 Q16 16 12 20 Q8 16 10 14 Q8 10 12 6" />
    </path>
  </svg>
);

// Water Essence
export const WaterEssenceIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <radialGradient id="waterEss" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#88ddff" />
        <stop offset="100%" stopColor="#0066cc" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="#1a1a2a" stroke="#0066cc" strokeWidth="1" />
    <path d="M12 5 Q6 12 12 19 Q18 12 12 5" fill="url(#waterEss)" />
    <ellipse cx="10" cy="11" rx="2" ry="3" fill="#fff" opacity="0.4" />
  </svg>
);

// Wind Essence
export const WindEssenceIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="windEss" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#98fb98" />
        <stop offset="100%" stopColor="#32cd32" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="#1a2a1a" stroke="#32cd32" strokeWidth="1" />
    <path d="M6 10 Q12 8 16 10 Q20 12 16 14" stroke="url(#windEss)" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M8 14 Q14 12 18 16" stroke="url(#windEss)" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

// Light Essence
export const LightEssenceIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <radialGradient id="lightEss" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fffacd" />
        <stop offset="100%" stopColor="#ffd700" />
      </radialGradient>
      <filter id="lightEssGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <circle cx="12" cy="12" r="10" fill="#2a2a1a" stroke="#ffd700" strokeWidth="1" />
    <g filter="url(#lightEssGlow)">
      <circle cx="12" cy="12" r="5" fill="url(#lightEss)" />
      <g stroke="#ffd700" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="4" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="20" />
        <line x1="4" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="20" y2="12" />
      </g>
    </g>
  </svg>
);

// Dark Essence
export const DarkEssenceIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <radialGradient id="darkEss" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#8b00ff" />
        <stop offset="100%" stopColor="#2a0040" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="#1a1a2a" stroke="#8b00ff" strokeWidth="1" />
    <path d="M16 6 Q6 8 6 12 Q6 20 16 18 Q10 16 10 12 Q10 8 16 6" fill="url(#darkEss)" />
    <circle cx="8" cy="10" r="1" fill="#fff" opacity="0.5" />
    <circle cx="6" cy="14" r="0.5" fill="#fff" opacity="0.3" />
  </svg>
);

// Experience Bottle
export const ExpIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="expGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#00cc66" />
        <stop offset="100%" stopColor="#88ff88" />
      </linearGradient>
    </defs>
    {/* Bottle */}
    <path d="M9 4 L9 7 L7 10 L7 20 L17 20 L17 10 L15 7 L15 4 Z" fill="#333" stroke="#666" strokeWidth="0.5" />
    {/* Liquid */}
    <path d="M8 12 L8 19 L16 19 L16 12 Q12 15 8 12" fill="url(#expGrad)">
      <animate attributeName="d" dur="2s" repeatCount="indefinite"
        values="M8 12 L8 19 L16 19 L16 12 Q12 15 8 12;M8 11 L8 19 L16 19 L16 11 Q12 14 8 11;M8 12 L8 19 L16 19 L16 12 Q12 15 8 12" />
    </path>
    {/* Cork */}
    <rect x="10" y="2" width="4" height="3" fill="#8b4513" rx="0.5" />
    {/* Label */}
    <text x="12" y="17" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">EXP</text>
  </svg>
);

// Mana Stone
export const ManaIcon: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="manaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#66ffff" />
        <stop offset="50%" stopColor="#0088ff" />
        <stop offset="100%" stopColor="#0044aa" />
      </linearGradient>
    </defs>
    <path d="M12 2 L20 8 L20 16 L12 22 L4 16 L4 8 Z" fill="url(#manaGrad)" stroke="#0044aa" strokeWidth="0.5" />
    <path d="M12 6 L16 10 L16 14 L12 18 L8 14 L8 10 Z" fill="#88ddff" opacity="0.5" />
    <circle cx="12" cy="12" r="2" fill="#fff" opacity="0.8">
      <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.5;1;0.5" />
    </circle>
  </svg>
);

// Item icons map
export const ItemIcons: Record<string, React.FC<IconProps>> = {
  gold: GoldIcon,
  crystal: CrystalIcon,
  energy: EnergyIcon,
  arena_wings: ArenaWingsIcon,
  mystical_scroll: MysticalScrollIcon,
  legendary_scroll: LegendaryScrollIcon,
  fire_essence: FireEssenceIcon,
  water_essence: WaterEssenceIcon,
  wind_essence: WindEssenceIcon,
  light_essence: LightEssenceIcon,
  dark_essence: DarkEssenceIcon,
  exp: ExpIcon,
  mana: ManaIcon,
};

// Get item icon by name
export const getItemIcon = (itemName: string): React.FC<IconProps> => {
  return ItemIcons[itemName.toLowerCase().replace(/\s+/g, '_')] || GoldIcon;
};
