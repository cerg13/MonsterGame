/**
 * Skill Effect Icons - Visual representations of skill types and effects
 */

import React from 'react';

interface SkillIconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Attack skill icon (sword)
export const AttackSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#ff4444' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="attackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#880000" />
      </linearGradient>
    </defs>
    {/* Sword blade */}
    <path d="M6 26 L22 10 L24 6 L28 4 L26 8 L22 10" fill="none" stroke="#cccccc" strokeWidth="2" />
    <path d="M22 10 L26 6" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    {/* Sword handle */}
    <rect x="4" y="22" width="8" height="3" rx="1" fill="#8b4513" transform="rotate(-45 8 24)" />
    {/* Slash effect */}
    <path d="M10 18 Q16 12 22 6" stroke="url(#attackGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.8">
      <animate attributeName="stroke-dasharray" dur="0.5s" repeatCount="indefinite" values="0,50;25,25;50,0" />
    </path>
  </svg>
);

// Heal skill icon (heart/cross)
export const HealSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#44ff44' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <radialGradient id="healGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#88ff88" />
        <stop offset="100%" stopColor={color} />
      </radialGradient>
      <filter id="healGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#healGlow)">
      {/* Cross */}
      <rect x="13" y="6" width="6" height="20" rx="1" fill="url(#healGrad)" />
      <rect x="6" y="13" width="20" height="6" rx="1" fill="url(#healGrad)" />
      {/* Sparkles */}
      <circle cx="8" cy="8" r="2" fill="#fff" opacity="0.8">
        <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.4;1;0.4" />
      </circle>
      <circle cx="24" cy="24" r="1.5" fill="#fff" opacity="0.6">
        <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.6;1;0.6" begin="0.3s" />
      </circle>
    </g>
  </svg>
);

// Buff skill icon (up arrow)
export const BuffSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#4488ff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="buffGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#0044aa" />
        <stop offset="100%" stopColor={color} />
      </linearGradient>
    </defs>
    {/* Shield background */}
    <path d="M16 4 L26 8 L26 18 Q26 26 16 30 Q6 26 6 18 L6 8 Z" fill="url(#buffGrad)" stroke="#6699ff" strokeWidth="1" />
    {/* Up arrow */}
    <path d="M16 10 L22 18 L18 18 L18 24 L14 24 L14 18 L10 18 Z" fill="#fff">
      <animate attributeName="transform" attributeType="XML" type="translate" dur="0.8s" repeatCount="indefinite" values="0,0;0,-2;0,0" />
    </path>
  </svg>
);

// Debuff skill icon (down arrow)
export const DebuffSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#aa44ff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="debuffGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#440088" />
        <stop offset="100%" stopColor={color} />
      </linearGradient>
    </defs>
    {/* Skull-like background */}
    <circle cx="16" cy="16" r="12" fill="url(#debuffGrad)" stroke="#8844aa" strokeWidth="1" />
    {/* Down arrow */}
    <path d="M16 22 L22 14 L18 14 L18 8 L14 8 L14 14 L10 14 Z" fill="#fff">
      <animate attributeName="transform" attributeType="XML" type="translate" dur="0.8s" repeatCount="indefinite" values="0,0;0,2;0,0" />
    </path>
  </svg>
);

// AOE skill icon (explosion)
export const AOESkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#ff8844' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <radialGradient id="aoeGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffff88" />
        <stop offset="50%" stopColor={color} />
        <stop offset="100%" stopColor="#882200" />
      </radialGradient>
    </defs>
    {/* Explosion */}
    <path d="M16 2 L18 10 L26 8 L20 14 L28 18 L20 18 L24 26 L16 20 L8 26 L12 18 L4 18 L12 14 L6 8 L14 10 Z"
          fill="url(#aoeGrad)">
      <animate attributeName="transform" attributeType="XML" type="scale" dur="0.5s" repeatCount="indefinite"
               values="1;1.1;1" additive="sum" />
    </path>
  </svg>
);

// Shield skill icon
export const ShieldSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#88aaff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#4466aa" />
      </linearGradient>
    </defs>
    {/* Shield shape */}
    <path d="M16 4 L28 8 L28 16 Q28 26 16 30 Q4 26 4 16 L4 8 Z" fill="url(#shieldGrad)" stroke="#6688cc" strokeWidth="1" />
    {/* Inner decoration */}
    <path d="M16 8 L22 11 L22 16 Q22 22 16 25 Q10 22 10 16 L10 11 Z" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
    {/* Center emblem */}
    <circle cx="16" cy="16" r="4" fill="#fff" opacity="0.8" />
  </svg>
);

// Stun skill icon (stars)
export const StunSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#ffff44' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <filter id="stunGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#stunGlow)">
      {/* Stars rotating */}
      <g>
        <animateTransform attributeName="transform" type="rotate" dur="2s" repeatCount="indefinite" values="0 16 16;360 16 16" />
        <path d="M16 4 L17 7 L20 7 L18 9 L19 12 L16 10 L13 12 L14 9 L12 7 L15 7 Z" fill={color} />
        <path d="M26 14 L27 17 L30 17 L28 19 L29 22 L26 20 L23 22 L24 19 L22 17 L25 17 Z" fill={color} />
        <path d="M6 14 L7 17 L10 17 L8 19 L9 22 L6 20 L3 22 L4 19 L2 17 L5 17 Z" fill={color} />
      </g>
      {/* Center swirl */}
      <circle cx="16" cy="18" r="6" fill="none" stroke="#888" strokeWidth="2" strokeDasharray="4,4">
        <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 16 18;360 16 18" />
      </circle>
    </g>
  </svg>
);

// Poison skill icon (skull/droplet)
export const PoisonSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#88ff00' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="poisonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor={color} />
        <stop offset="100%" stopColor="#448800" />
      </linearGradient>
    </defs>
    {/* Droplet shape */}
    <path d="M16 4 Q8 14 8 20 Q8 28 16 28 Q24 28 24 20 Q24 14 16 4" fill="url(#poisonGrad)" />
    {/* Skull face */}
    <circle cx="12" cy="18" r="2" fill="#000" />
    <circle cx="20" cy="18" r="2" fill="#000" />
    <path d="M12 24 L14 22 L16 24 L18 22 L20 24" stroke="#000" strokeWidth="1.5" fill="none" />
    {/* Bubbles */}
    <circle cx="10" cy="14" r="1" fill="#aaffaa" opacity="0.8">
      <animate attributeName="cy" dur="1s" repeatCount="indefinite" values="14;10;14" />
    </circle>
    <circle cx="22" cy="16" r="0.8" fill="#aaffaa" opacity="0.6">
      <animate attributeName="cy" dur="1.2s" repeatCount="indefinite" values="16;12;16" />
    </circle>
  </svg>
);

// Passive skill icon (aura)
export const PassiveSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#aaaaff' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <radialGradient id="passiveGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={color} stopOpacity="0.8" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    {/* Outer aura rings */}
    <circle cx="16" cy="16" r="14" fill="url(#passiveGrad)">
      <animate attributeName="r" dur="2s" repeatCount="indefinite" values="10;14;10" />
      <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.3;0.6;0.3" />
    </circle>
    <circle cx="16" cy="16" r="10" fill="none" stroke={color} strokeWidth="1" opacity="0.5">
      <animate attributeName="r" dur="2s" repeatCount="indefinite" values="8;12;8" />
    </circle>
    {/* Center symbol */}
    <circle cx="16" cy="16" r="6" fill={color} />
    <text x="16" y="20" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">P</text>
  </svg>
);

// Leader skill icon (crown)
export const LeaderSkillIcon: React.FC<SkillIconProps> = ({ size = 32, className, color = '#ffd700' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="leaderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fff5cc" />
        <stop offset="50%" stopColor={color} />
        <stop offset="100%" stopColor="#cc9900" />
      </linearGradient>
      <filter id="leaderGlow">
        <feGaussianBlur stdDeviation="1" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#leaderGlow)">
      {/* Crown */}
      <path d="M6 22 L6 12 L10 16 L16 8 L22 16 L26 12 L26 22 Z" fill="url(#leaderGrad)" stroke="#cc9900" strokeWidth="1" />
      {/* Gems */}
      <circle cx="10" cy="14" r="2" fill="#ff4444" />
      <circle cx="16" cy="10" r="2.5" fill="#4444ff" />
      <circle cx="22" cy="14" r="2" fill="#44ff44" />
      {/* Base band */}
      <rect x="6" y="22" width="20" height="4" rx="1" fill="url(#leaderGrad)" stroke="#cc9900" strokeWidth="0.5" />
    </g>
  </svg>
);

// Skill icons map
export const SkillIcons: Record<string, React.FC<SkillIconProps>> = {
  attack: AttackSkillIcon,
  heal: HealSkillIcon,
  buff: BuffSkillIcon,
  debuff: DebuffSkillIcon,
  aoe: AOESkillIcon,
  shield: ShieldSkillIcon,
  stun: StunSkillIcon,
  poison: PoisonSkillIcon,
  passive: PassiveSkillIcon,
  leader: LeaderSkillIcon,
};

// Get skill icon by type
export const getSkillIcon = (skillType: string): React.FC<SkillIconProps> => {
  return SkillIcons[skillType.toLowerCase()] || AttackSkillIcon;
};

// Skill type colors
export const SkillTypeColors: Record<string, string> = {
  attack: '#ff4444',
  heal: '#44ff44',
  buff: '#4488ff',
  debuff: '#aa44ff',
  aoe: '#ff8844',
  shield: '#88aaff',
  stun: '#ffff44',
  poison: '#88ff00',
  passive: '#aaaaff',
  leader: '#ffd700',
};
