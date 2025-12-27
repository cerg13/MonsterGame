/**
 * Monster Sprites - SVG sprites for each monster
 * Detailed visual representations with element-based styling
 */

import React from 'react';
import { ElementColors } from '../icons/elements';

interface SpriteProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

// Phoenix - Fire SSR
export const PhoenixSprite: React.FC<SpriteProps> = ({ size = 80, className, animated }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="phoenixBody" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#ff4500" />
        <stop offset="50%" stopColor="#ff6347" />
        <stop offset="100%" stopColor="#ffd700" />
      </linearGradient>
      <linearGradient id="phoenixWing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff8c00" />
        <stop offset="100%" stopColor="#ff4500" />
      </linearGradient>
      <filter id="phoenixGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#phoenixGlow)">
      {/* Tail flames */}
      <path d="M30 75 Q20 60 25 45 Q30 55 35 50 Q32 65 30 75" fill="#ffd700" opacity="0.8">
        {animated && <animate attributeName="d" dur="0.5s" repeatCount="indefinite"
          values="M30 75 Q20 60 25 45 Q30 55 35 50 Q32 65 30 75;M30 75 Q18 58 23 43 Q28 53 33 48 Q30 63 30 75;M30 75 Q20 60 25 45 Q30 55 35 50 Q32 65 30 75"/>}
      </path>
      {/* Left wing */}
      <path d="M25 50 Q5 35 15 20 Q25 30 35 25 Q30 40 25 50" fill="url(#phoenixWing)">
        {animated && <animateTransform attributeName="transform" type="rotate" dur="0.3s" repeatCount="indefinite"
          values="0 35 50;-5 35 50;0 35 50"/>}
      </path>
      {/* Right wing */}
      <path d="M75 50 Q95 35 85 20 Q75 30 65 25 Q70 40 75 50" fill="url(#phoenixWing)">
        {animated && <animateTransform attributeName="transform" type="rotate" dur="0.3s" repeatCount="indefinite"
          values="0 65 50;5 65 50;0 65 50"/>}
      </path>
      {/* Body */}
      <ellipse cx="50" cy="55" rx="18" ry="22" fill="url(#phoenixBody)"/>
      {/* Head */}
      <circle cx="50" cy="30" r="12" fill="url(#phoenixBody)"/>
      {/* Beak */}
      <path d="M50 35 L45 42 L55 42 Z" fill="#ff8c00"/>
      {/* Eyes */}
      <ellipse cx="45" cy="28" rx="3" ry="4" fill="#fff"/>
      <ellipse cx="55" cy="28" rx="3" ry="4" fill="#fff"/>
      <circle cx="45" cy="29" r="1.5" fill="#000"/>
      <circle cx="55" cy="29" r="1.5" fill="#000"/>
      {/* Crown feathers */}
      <path d="M40 20 Q42 10 50 15 Q58 10 60 20" stroke="#ffd700" strokeWidth="3" fill="none"/>
      <circle cx="50" cy="12" r="3" fill="#ffd700"/>
    </g>
  </svg>
);

// Dragon - Fire/Water SSR
export const DragonSprite: React.FC<SpriteProps & { element?: string }> = ({
  size = 80, className, animated, element = 'fire'
}) => {
  const colors = ElementColors[element] || ElementColors.fire;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={`dragonBody${element}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>
        <filter id="dragonGlow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#dragonGlow)">
        {/* Tail */}
        <path d="M20 70 Q10 80 15 90 Q25 85 20 70" fill={colors.primary}>
          {animated && <animate attributeName="d" dur="0.8s" repeatCount="indefinite"
            values="M20 70 Q10 80 15 90 Q25 85 20 70;M20 70 Q8 82 13 92 Q23 87 20 70;M20 70 Q10 80 15 90 Q25 85 20 70"/>}
        </path>
        {/* Wings */}
        <path d="M25 45 Q10 25 20 15 Q30 25 40 20 Q35 35 25 45" fill={colors.secondary} opacity="0.9"/>
        <path d="M75 45 Q90 25 80 15 Q70 25 60 20 Q65 35 75 45" fill={colors.secondary} opacity="0.9"/>
        {/* Body */}
        <ellipse cx="50" cy="55" rx="22" ry="25" fill={`url(#dragonBody${element})`}/>
        {/* Belly scales */}
        <ellipse cx="50" cy="60" rx="12" ry="15" fill={colors.secondary} opacity="0.5"/>
        {/* Head */}
        <ellipse cx="50" cy="28" rx="15" ry="12" fill={`url(#dragonBody${element})`}/>
        {/* Snout */}
        <ellipse cx="50" cy="38" rx="8" ry="5" fill={colors.primary}/>
        {/* Nostrils */}
        <circle cx="46" cy="38" r="1.5" fill="#333"/>
        <circle cx="54" cy="38" r="1.5" fill="#333"/>
        {/* Eyes */}
        <ellipse cx="42" cy="26" rx="4" ry="5" fill="#fff"/>
        <ellipse cx="58" cy="26" rx="4" ry="5" fill="#fff"/>
        <ellipse cx="43" cy="27" rx="2" ry="3" fill="#ff0"/>
        <ellipse cx="59" cy="27" rx="2" ry="3" fill="#ff0"/>
        <circle cx="43" cy="27" r="1" fill="#000"/>
        <circle cx="59" cy="27" r="1" fill="#000"/>
        {/* Horns */}
        <path d="M35 18 Q30 8 35 5" stroke={colors.primary} strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M65 18 Q70 8 65 5" stroke={colors.primary} strokeWidth="4" fill="none" strokeLinecap="round"/>
        {/* Legs */}
        <ellipse cx="35" cy="78" rx="8" ry="6" fill={colors.primary}/>
        <ellipse cx="65" cy="78" rx="8" ry="6" fill={colors.primary}/>
      </g>
    </svg>
  );
};

// Knight - Fire/Dark SR
export const KnightSprite: React.FC<SpriteProps & { element?: string }> = ({
  size = 80, className, element = 'fire'
}) => {
  const colors = ElementColors[element] || ElementColors.fire;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={`armor${element}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#666" />
          <stop offset="50%" stopColor="#444" />
          <stop offset="100%" stopColor="#333" />
        </linearGradient>
      </defs>
      {/* Body armor */}
      <path d="M35 45 L35 75 L65 75 L65 45 Q50 35 35 45" fill={`url(#armor${element})`}/>
      {/* Shoulders */}
      <ellipse cx="30" cy="48" rx="10" ry="8" fill="#555"/>
      <ellipse cx="70" cy="48" rx="10" ry="8" fill="#555"/>
      {/* Helmet */}
      <path d="M35 40 Q35 20 50 18 Q65 20 65 40 L35 40" fill="#555"/>
      {/* Visor */}
      <rect x="38" y="28" width="24" height="8" fill="#222"/>
      {/* Eye glow */}
      <ellipse cx="44" cy="32" rx="3" ry="2" fill={colors.primary}/>
      <ellipse cx="56" cy="32" rx="3" ry="2" fill={colors.primary}/>
      {/* Plume */}
      <path d="M50 18 Q45 5 50 2 Q55 5 50 18" fill={colors.primary}/>
      {/* Sword */}
      <rect x="72" y="35" width="4" height="40" fill="#888"/>
      <rect x="70" y="32" width="8" height="6" fill="#666"/>
      <path d="M74 35 L74 20 L72 15 L76 15 L74 20" fill="#aaa"/>
      {/* Shield */}
      <ellipse cx="25" cy="55" rx="8" ry="12" fill={colors.primary}/>
      <ellipse cx="25" cy="55" rx="5" ry="8" fill={colors.secondary}/>
      {/* Legs */}
      <rect x="38" y="75" width="10" height="15" fill="#444"/>
      <rect x="52" y="75" width="10" height="15" fill="#444"/>
      <ellipse cx="43" cy="92" rx="7" ry="4" fill="#333"/>
      <ellipse cx="57" cy="92" rx="7" ry="4" fill="#333"/>
    </svg>
  );
};

// Imp - Fire/Water Rare
export const ImpSprite: React.FC<SpriteProps & { element?: string }> = ({
  size = 80, className, animated, element = 'fire'
}) => {
  const colors = ElementColors[element] || ElementColors.fire;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <radialGradient id={`impBody${element}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={colors.secondary} />
          <stop offset="100%" stopColor={colors.primary} />
        </radialGradient>
      </defs>
      {/* Tail */}
      <path d="M25 65 Q15 75 20 85 Q25 80 30 82" fill={colors.primary} stroke={colors.primary} strokeWidth="3">
        {animated && <animate attributeName="d" dur="0.6s" repeatCount="indefinite"
          values="M25 65 Q15 75 20 85 Q25 80 30 82;M25 65 Q12 78 18 88 Q23 83 28 85;M25 65 Q15 75 20 85 Q25 80 30 82"/>}
      </path>
      {/* Body */}
      <ellipse cx="50" cy="60" rx="25" ry="22" fill={`url(#impBody${element})`}/>
      {/* Belly */}
      <ellipse cx="50" cy="65" rx="15" ry="12" fill={colors.secondary} opacity="0.6"/>
      {/* Head */}
      <circle cx="50" cy="35" r="18" fill={`url(#impBody${element})`}/>
      {/* Horns */}
      <path d="M35 25 Q30 15 35 10" stroke={colors.primary} strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M65 25 Q70 15 65 10" stroke={colors.primary} strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Eyes - big and mischievous */}
      <ellipse cx="42" cy="33" rx="7" ry="8" fill="#fff"/>
      <ellipse cx="58" cy="33" rx="7" ry="8" fill="#fff"/>
      <circle cx="44" cy="35" r="4" fill="#000"/>
      <circle cx="60" cy="35" r="4" fill="#000"/>
      <circle cx="45" cy="33" r="1.5" fill="#fff"/>
      <circle cx="61" cy="33" r="1.5" fill="#fff"/>
      {/* Mouth - grinning */}
      <path d="M42 45 Q50 52 58 45" stroke="#000" strokeWidth="2" fill="none"/>
      <path d="M44 46 L46 44 M54 44 L56 46" stroke="#fff" strokeWidth="1"/>
      {/* Arms */}
      <ellipse cx="25" cy="55" rx="6" ry="10" fill={colors.primary}/>
      <ellipse cx="75" cy="55" rx="6" ry="10" fill={colors.primary}/>
      {/* Legs */}
      <ellipse cx="40" cy="82" rx="8" ry="6" fill={colors.primary}/>
      <ellipse cx="60" cy="82" rx="8" ry="6" fill={colors.primary}/>
    </svg>
  );
};

// Mage - Water/Light SR
export const MageSprite: React.FC<SpriteProps & { element?: string }> = ({
  size = 80, className, element = 'water'
}) => {
  const colors = ElementColors[element] || ElementColors.water;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={`robe${element}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>
      </defs>
      {/* Robe */}
      <path d="M30 40 L25 90 L75 90 L70 40 Q50 30 30 40" fill={`url(#robe${element})`}/>
      {/* Robe details */}
      <path d="M40 50 L40 85" stroke={colors.secondary} strokeWidth="2" opacity="0.5"/>
      <path d="M60 50 L60 85" stroke={colors.secondary} strokeWidth="2" opacity="0.5"/>
      {/* Hood */}
      <path d="M30 40 Q30 20 50 15 Q70 20 70 40" fill={colors.primary}/>
      {/* Face (shadowed) */}
      <ellipse cx="50" cy="35" rx="12" ry="10" fill="#ffd8b8"/>
      {/* Eyes (glowing) */}
      <ellipse cx="45" cy="34" rx="3" ry="2" fill={colors.secondary}/>
      <ellipse cx="55" cy="34" rx="3" ry="2" fill={colors.secondary}/>
      {/* Staff */}
      <rect x="78" y="25" width="4" height="60" fill="#8b4513"/>
      {/* Staff orb */}
      <circle cx="80" cy="20" r="8" fill={colors.primary}>
        <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.8;1;0.8"/>
      </circle>
      <circle cx="80" cy="20" r="5" fill={colors.secondary}>
        <animate attributeName="r" dur="1.5s" repeatCount="indefinite" values="5;6;5"/>
      </circle>
      {/* Hands */}
      <circle cx="25" cy="55" r="5" fill="#ffd8b8"/>
      <circle cx="75" cy="45" r="5" fill="#ffd8b8"/>
    </svg>
  );
};

// Angel - Light SSR
export const AngelSprite: React.FC<SpriteProps> = ({ size = 80, className, animated }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="angelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fffacd" />
        <stop offset="100%" stopColor="#ffd700" />
      </linearGradient>
      <filter id="angelGlow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#angelGlow)">
      {/* Wings */}
      <path d="M20 50 Q5 30 15 15 Q25 25 35 20 Q30 35 20 50" fill="#fff" opacity="0.9">
        {animated && <animateTransform attributeName="transform" type="rotate" dur="0.5s" repeatCount="indefinite"
          values="0 35 50;-3 35 50;0 35 50"/>}
      </path>
      <path d="M80 50 Q95 30 85 15 Q75 25 65 20 Q70 35 80 50" fill="#fff" opacity="0.9">
        {animated && <animateTransform attributeName="transform" type="rotate" dur="0.5s" repeatCount="indefinite"
          values="0 65 50;3 65 50;0 65 50"/>}
      </path>
      {/* Halo */}
      <ellipse cx="50" cy="15" rx="12" ry="4" fill="none" stroke="#ffd700" strokeWidth="3">
        <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.7;1;0.7"/>
      </ellipse>
      {/* Body/Dress */}
      <path d="M35 45 L30 85 L70 85 L65 45 Q50 38 35 45" fill="url(#angelGrad)"/>
      {/* Head */}
      <circle cx="50" cy="32" r="12" fill="#ffd8b8"/>
      {/* Hair */}
      <path d="M38 30 Q38 20 50 18 Q62 20 62 30" fill="#ffd700"/>
      {/* Eyes */}
      <ellipse cx="45" cy="32" rx="2" ry="3" fill="#4169e1"/>
      <ellipse cx="55" cy="32" rx="2" ry="3" fill="#4169e1"/>
      {/* Smile */}
      <path d="M46 38 Q50 41 54 38" stroke="#333" strokeWidth="1" fill="none"/>
      {/* Hands */}
      <circle cx="30" cy="55" r="4" fill="#ffd8b8"/>
      <circle cx="70" cy="55" r="4" fill="#ffd8b8"/>
    </g>
  </svg>
);

// Garuda - Wind SSR
export const GarudaSprite: React.FC<SpriteProps> = ({ size = 80, className, animated }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="garudaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#98fb98" />
        <stop offset="100%" stopColor="#32cd32" />
      </linearGradient>
    </defs>
    {/* Large wings */}
    <path d="M15 55 Q0 30 10 10 Q25 25 40 15 Q30 40 15 55" fill="url(#garudaGrad)">
      {animated && <animateTransform attributeName="transform" type="rotate" dur="0.4s" repeatCount="indefinite"
        values="0 40 55;-8 40 55;0 40 55"/>}
    </path>
    <path d="M85 55 Q100 30 90 10 Q75 25 60 15 Q70 40 85 55" fill="url(#garudaGrad)">
      {animated && <animateTransform attributeName="transform" type="rotate" dur="0.4s" repeatCount="indefinite"
        values="0 60 55;8 60 55;0 60 55"/>}
    </path>
    {/* Body */}
    <ellipse cx="50" cy="55" rx="18" ry="20" fill="#32cd32"/>
    {/* Chest */}
    <ellipse cx="50" cy="58" rx="10" ry="12" fill="#98fb98"/>
    {/* Head */}
    <circle cx="50" cy="32" r="14" fill="#32cd32"/>
    {/* Beak */}
    <path d="M50 38 L44 48 L56 48 Z" fill="#ffa500"/>
    {/* Eyes */}
    <ellipse cx="43" cy="30" rx="4" ry="5" fill="#fff"/>
    <ellipse cx="57" cy="30" rx="4" ry="5" fill="#fff"/>
    <circle cx="44" cy="31" r="2" fill="#000"/>
    <circle cx="58" cy="31" r="2" fill="#000"/>
    {/* Crown feathers */}
    <path d="M42 20 L40 8 M50 18 L50 5 M58 20 L60 8" stroke="#32cd32" strokeWidth="3" strokeLinecap="round"/>
    {/* Tail feathers */}
    <path d="M40 75 L35 95 M50 78 L50 98 M60 75 L65 95" stroke="#32cd32" strokeWidth="4" strokeLinecap="round"/>
    {/* Talons */}
    <path d="M38 75 L35 85 L30 88 M38 75 L38 88 M38 75 L42 88" stroke="#ffa500" strokeWidth="2"/>
    <path d="M62 75 L65 85 L70 88 M62 75 L62 88 M62 75 L58 88" stroke="#ffa500" strokeWidth="2"/>
  </svg>
);

// Shadow Bat - Dark Rare
export const BatSprite: React.FC<SpriteProps> = ({ size = 80, className, animated }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="batGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a0080" />
        <stop offset="100%" stopColor="#1a0033" />
      </linearGradient>
    </defs>
    {/* Wings */}
    <path d="M10 50 Q5 30 15 20 Q25 25 30 20 Q28 35 25 45 L10 50" fill="url(#batGrad)">
      {animated && <animateTransform attributeName="transform" type="rotate" dur="0.2s" repeatCount="indefinite"
        values="0 30 50;-10 30 50;0 30 50"/>}
    </path>
    <path d="M90 50 Q95 30 85 20 Q75 25 70 20 Q72 35 75 45 L90 50" fill="url(#batGrad)">
      {animated && <animateTransform attributeName="transform" type="rotate" dur="0.2s" repeatCount="indefinite"
        values="0 70 50;10 70 50;0 70 50"/>}
    </path>
    {/* Body */}
    <ellipse cx="50" cy="55" rx="20" ry="18" fill="url(#batGrad)"/>
    {/* Head */}
    <circle cx="50" cy="35" r="15" fill="url(#batGrad)"/>
    {/* Ears */}
    <path d="M35 30 L30 15 L40 25" fill="#4a0080"/>
    <path d="M65 30 L70 15 L60 25" fill="#4a0080"/>
    {/* Eyes (glowing) */}
    <ellipse cx="43" cy="35" rx="5" ry="6" fill="#ff0000">
      <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.8;1;0.8"/>
    </ellipse>
    <ellipse cx="57" cy="35" rx="5" ry="6" fill="#ff0000">
      <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.8;1;0.8"/>
    </ellipse>
    <ellipse cx="43" cy="35" rx="2" ry="3" fill="#000"/>
    <ellipse cx="57" cy="35" rx="2" ry="3" fill="#000"/>
    {/* Fangs */}
    <path d="M45 45 L47 52" stroke="#fff" strokeWidth="2"/>
    <path d="M55 45 L53 52" stroke="#fff" strokeWidth="2"/>
    {/* Feet */}
    <path d="M40 73 L38 80 L35 78 M40 73 L42 80" stroke="#4a0080" strokeWidth="2"/>
    <path d="M60 73 L62 80 L65 78 M60 73 L58 80" stroke="#4a0080" strokeWidth="2"/>
  </svg>
);

// Griffin - Wind SSR
export const GriffinSprite: React.FC<SpriteProps> = ({ size = 80, className, animated }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="griffinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#90ee90" />
        <stop offset="100%" stopColor="#228b22" />
      </linearGradient>
      <filter id="griffinGlow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#griffinGlow)">
      {/* Large wings */}
      <path d="M15 45 Q0 20 15 5 Q25 15 35 10 Q40 20 45 15 Q35 35 15 45" fill="url(#griffinGrad)">
        {animated && <animateTransform attributeName="transform" type="rotate" dur="0.4s" repeatCount="indefinite"
          values="0 40 45;-10 40 45;0 40 45"/>}
      </path>
      <path d="M85 45 Q100 20 85 5 Q75 15 65 10 Q60 20 55 15 Q65 35 85 45" fill="url(#griffinGrad)">
        {animated && <animateTransform attributeName="transform" type="rotate" dur="0.4s" repeatCount="indefinite"
          values="0 60 45;10 60 45;0 60 45"/>}
      </path>
      {/* Lion body */}
      <ellipse cx="50" cy="60" rx="22" ry="18" fill="#daa520"/>
      {/* Chest feathers */}
      <ellipse cx="50" cy="55" rx="14" ry="10" fill="#f4a460"/>
      {/* Eagle head */}
      <circle cx="50" cy="32" r="14" fill="#daa520"/>
      {/* Beak */}
      <path d="M50 38 L43 48 L57 48 Z" fill="#ff8c00"/>
      <path d="M50 38 L50 46" stroke="#cc7000" strokeWidth="1"/>
      {/* Eyes */}
      <ellipse cx="42" cy="30" rx="4" ry="5" fill="#fff"/>
      <ellipse cx="58" cy="30" rx="4" ry="5" fill="#fff"/>
      <circle cx="43" cy="31" r="2" fill="#000"/>
      <circle cx="59" cy="31" r="2" fill="#000"/>
      {/* Ear tufts */}
      <path d="M36 22 L32 12 L38 18" fill="#daa520"/>
      <path d="M64 22 L68 12 L62 18" fill="#daa520"/>
      {/* Front legs (lion paws) */}
      <ellipse cx="38" cy="78" rx="6" ry="8" fill="#daa520"/>
      <ellipse cx="62" cy="78" rx="6" ry="8" fill="#daa520"/>
      {/* Tail */}
      <path d="M72 65 Q85 70 88 80 Q82 78 80 82" fill="#daa520" stroke="#daa520" strokeWidth="3">
        {animated && <animate attributeName="d" dur="0.8s" repeatCount="indefinite"
          values="M72 65 Q85 70 88 80 Q82 78 80 82;M72 65 Q88 68 92 78 Q86 76 84 80;M72 65 Q85 70 88 80 Q82 78 80 82"/>}
      </path>
    </g>
  </svg>
);

// Assassin - Wind SR
export const AssassinSprite: React.FC<SpriteProps & { element?: string }> = ({
  size = 80, className, element = 'wind'
}) => {
  const colors = ElementColors[element] || ElementColors.wind;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={`cloak${element}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2f2f2f" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      {/* Cloak */}
      <path d="M25 35 L20 90 L80 90 L75 35 Q50 25 25 35" fill={`url(#cloak${element})`}/>
      {/* Cloak hood shadow */}
      <path d="M30 35 Q30 20 50 15 Q70 20 70 35" fill="#1a1a1a"/>
      {/* Face (mostly hidden) */}
      <ellipse cx="50" cy="32" rx="10" ry="8" fill="#3a3a3a"/>
      {/* Glowing eyes */}
      <ellipse cx="45" cy="31" rx="3" ry="2" fill={colors.primary}>
        <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.7;1;0.7"/>
      </ellipse>
      <ellipse cx="55" cy="31" rx="3" ry="2" fill={colors.primary}>
        <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.7;1;0.7"/>
      </ellipse>
      {/* Left dagger */}
      <g transform="rotate(-20, 25, 55)">
        <rect x="18" y="40" width="3" height="25" fill="#c0c0c0"/>
        <rect x="15" y="38" width="9" height="5" fill="#8b4513"/>
        <path d="M19.5 65 L17 72 L22 72 Z" fill="#c0c0c0"/>
      </g>
      {/* Right dagger */}
      <g transform="rotate(20, 75, 55)">
        <rect x="79" y="40" width="3" height="25" fill="#c0c0c0"/>
        <rect x="76" y="38" width="9" height="5" fill="#8b4513"/>
        <path d="M80.5 65 L78 72 L83 72 Z" fill="#c0c0c0"/>
      </g>
      {/* Element glow trail */}
      <circle cx="30" cy="70" r="3" fill={colors.primary} opacity="0.4">
        <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.2;0.5;0.2"/>
      </circle>
      <circle cx="70" cy="70" r="3" fill={colors.primary} opacity="0.4">
        <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.2;0.5;0.2"/>
      </circle>
    </svg>
  );
};

// Archer - Wind SR
export const ArcherSprite: React.FC<SpriteProps & { element?: string }> = ({
  size = 80, className, element = 'wind'
}) => {
  const colors = ElementColors[element] || ElementColors.wind;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <linearGradient id={`archerTunic${element}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor={colors.secondary} />
        </linearGradient>
      </defs>
      {/* Body/Tunic */}
      <path d="M35 40 L30 85 L70 85 L65 40 Q50 32 35 40" fill={`url(#archerTunic${element})`}/>
      {/* Belt */}
      <rect x="32" y="55" width="36" height="5" fill="#8b4513"/>
      {/* Head */}
      <circle cx="50" cy="28" r="12" fill="#ffd8b8"/>
      {/* Hair */}
      <path d="M38 25 Q38 15 50 12 Q62 15 62 25 L60 28 Q50 22 40 28 Z" fill="#654321"/>
      {/* Eyes */}
      <ellipse cx="45" cy="28" rx="2" ry="3" fill="#228b22"/>
      <ellipse cx="55" cy="28" rx="2" ry="3" fill="#228b22"/>
      {/* Bow */}
      <path d="M75 25 Q90 50 75 75" stroke="#8b4513" strokeWidth="3" fill="none"/>
      <line x1="75" y1="25" x2="75" y2="75" stroke={colors.primary} strokeWidth="1"/>
      {/* Arrow */}
      <line x1="50" y1="50" x2="73" y2="50" stroke="#8b4513" strokeWidth="2"/>
      <path d="M73 50 L78 47 L78 53 Z" fill="#c0c0c0"/>
      <path d="M50 50 L45 47 M50 50 L45 53" stroke={colors.primary} strokeWidth="1"/>
      {/* Quiver on back */}
      <rect x="22" y="35" width="8" height="30" fill="#8b4513" rx="2"/>
      <line x1="24" y1="35" x2="24" y2="30" stroke="#654321" strokeWidth="2"/>
      <line x1="26" y1="35" x2="26" y2="28" stroke="#654321" strokeWidth="2"/>
      <line x1="28" y1="35" x2="28" y2="32" stroke="#654321" strokeWidth="2"/>
      {/* Arms */}
      <ellipse cx="35" cy="50" rx="4" ry="8" fill="#ffd8b8"/>
      <ellipse cx="70" cy="50" rx="4" ry="6" fill="#ffd8b8"/>
      {/* Legs */}
      <rect x="38" y="85" width="10" height="10" fill="#654321"/>
      <rect x="52" y="85" width="10" height="10" fill="#654321"/>
    </svg>
  );
};

// Fairy/Pixie - Wind/Light Rare
export const FairySprite: React.FC<SpriteProps & { element?: string }> = ({
  size = 80, className, animated, element = 'wind'
}) => {
  const colors = ElementColors[element] || ElementColors.wind;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <radialGradient id={`fairyGlow${element}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.8" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.3" />
        </radialGradient>
        <filter id="fairyBlur">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#fairyBlur)">
        {/* Glow aura */}
        <circle cx="50" cy="50" r="35" fill={`url(#fairyGlow${element})`} opacity="0.5">
          {animated && <animate attributeName="r" dur="2s" repeatCount="indefinite" values="35;38;35"/>}
        </circle>
        {/* Wings */}
        <ellipse cx="30" cy="45" rx="15" ry="20" fill={colors.secondary} opacity="0.6">
          {animated && <animateTransform attributeName="transform" type="rotate" dur="0.1s" repeatCount="indefinite"
            values="0 40 50;-5 40 50;0 40 50"/>}
        </ellipse>
        <ellipse cx="70" cy="45" rx="15" ry="20" fill={colors.secondary} opacity="0.6">
          {animated && <animateTransform attributeName="transform" type="rotate" dur="0.1s" repeatCount="indefinite"
            values="0 60 50;5 60 50;0 60 50"/>}
        </ellipse>
        {/* Small body */}
        <ellipse cx="50" cy="55" rx="10" ry="12" fill="#ffd8b8"/>
        {/* Dress */}
        <path d="M40 52 L35 70 L65 70 L60 52" fill={colors.primary}/>
        {/* Head */}
        <circle cx="50" cy="38" r="10" fill="#ffd8b8"/>
        {/* Hair */}
        <path d="M40 35 Q40 28 50 25 Q60 28 60 35" fill={colors.primary}/>
        {/* Eyes - big and cute */}
        <ellipse cx="46" cy="38" rx="3" ry="4" fill="#000"/>
        <ellipse cx="54" cy="38" rx="3" ry="4" fill="#000"/>
        <circle cx="47" cy="37" r="1" fill="#fff"/>
        <circle cx="55" cy="37" r="1" fill="#fff"/>
        {/* Smile */}
        <path d="M47 43 Q50 46 53 43" stroke="#ff69b4" strokeWidth="1" fill="none"/>
        {/* Sparkles */}
        <circle cx="30" cy="30" r="2" fill={colors.secondary}>
          <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.3;1;0.3"/>
        </circle>
        <circle cx="70" cy="35" r="1.5" fill={colors.secondary}>
          <animate attributeName="opacity" dur="1.2s" repeatCount="indefinite" values="0.5;1;0.5"/>
        </circle>
        <circle cx="50" cy="20" r="2" fill={colors.secondary}>
          <animate attributeName="opacity" dur="0.8s" repeatCount="indefinite" values="0.4;1;0.4"/>
        </circle>
      </g>
    </svg>
  );
};

// Demon - Dark SSR
export const DemonSprite: React.FC<SpriteProps> = ({ size = 80, className, animated }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="demonBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a0080" />
        <stop offset="100%" stopColor="#1a0033" />
      </linearGradient>
      <filter id="demonGlow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#demonGlow)">
      {/* Wings */}
      <path d="M15 50 Q5 25 20 10 Q30 20 35 15 Q25 35 15 50" fill="#2d0047">
        {animated && <animateTransform attributeName="transform" type="rotate" dur="0.5s" repeatCount="indefinite"
          values="0 35 50;-5 35 50;0 35 50"/>}
      </path>
      <path d="M85 50 Q95 25 80 10 Q70 20 65 15 Q75 35 85 50" fill="#2d0047">
        {animated && <animateTransform attributeName="transform" type="rotate" dur="0.5s" repeatCount="indefinite"
          values="0 65 50;5 65 50;0 65 50"/>}
      </path>
      {/* Muscular body */}
      <ellipse cx="50" cy="58" rx="20" ry="22" fill="url(#demonBody)"/>
      {/* Chest */}
      <path d="M38 50 Q50 45 62 50 Q55 60 50 58 Q45 60 38 50" fill="#3d0066"/>
      {/* Head */}
      <circle cx="50" cy="32" r="14" fill="url(#demonBody)"/>
      {/* Horns - large and curved */}
      <path d="M36 28 Q25 20 20 8 Q30 15 36 28" fill="#1a0033" stroke="#ff4500" strokeWidth="1"/>
      <path d="M64 28 Q75 20 80 8 Q70 15 64 28" fill="#1a0033" stroke="#ff4500" strokeWidth="1"/>
      {/* Eyes - glowing red */}
      <ellipse cx="43" cy="30" rx="5" ry="6" fill="#ff0000">
        <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.8;1;0.8"/>
      </ellipse>
      <ellipse cx="57" cy="30" rx="5" ry="6" fill="#ff0000">
        <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.8;1;0.8"/>
      </ellipse>
      <ellipse cx="43" cy="30" rx="2" ry="3" fill="#000"/>
      <ellipse cx="57" cy="30" rx="2" ry="3" fill="#000"/>
      {/* Fanged mouth */}
      <path d="M42 42 Q50 48 58 42" stroke="#1a0033" strokeWidth="2" fill="none"/>
      <path d="M44 42 L46 47" stroke="#fff" strokeWidth="2"/>
      <path d="M56 42 L54 47" stroke="#fff" strokeWidth="2"/>
      {/* Claws */}
      <path d="M25 55 L18 60 L22 62 L25 58" fill="#1a0033"/>
      <path d="M75 55 L82 60 L78 62 L75 58" fill="#1a0033"/>
      {/* Tail */}
      <path d="M50 80 Q35 90 30 95 L35 92 Q40 88 50 80" fill="url(#demonBody)">
        {animated && <animate attributeName="d" dur="0.8s" repeatCount="indefinite"
          values="M50 80 Q35 90 30 95 L35 92 Q40 88 50 80;M50 80 Q32 92 27 97 L32 94 Q37 90 50 80;M50 80 Q35 90 30 95 L35 92 Q40 88 50 80"/>}
      </path>
      {/* Legs */}
      <ellipse cx="40" cy="82" rx="8" ry="6" fill="url(#demonBody)"/>
      <ellipse cx="60" cy="82" rx="8" ry="6" fill="url(#demonBody)"/>
    </g>
  </svg>
);

// Witch - Dark SR
export const WitchSprite: React.FC<SpriteProps> = ({ size = 80, className, animated }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="witchRobe" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#4a0080" />
        <stop offset="100%" stopColor="#2d0047" />
      </linearGradient>
    </defs>
    {/* Robe */}
    <path d="M30 45 L20 95 L80 95 L70 45 Q50 35 30 45" fill="url(#witchRobe)"/>
    {/* Robe details */}
    <path d="M35 60 Q50 55 65 60" stroke="#6a0dad" strokeWidth="2" fill="none"/>
    <path d="M30 75 Q50 70 70 75" stroke="#6a0dad" strokeWidth="2" fill="none"/>
    {/* Head */}
    <circle cx="50" cy="35" r="12" fill="#90ee90"/>
    {/* Witch hat */}
    <path d="M30 35 L50 5 L70 35 Z" fill="#1a0033"/>
    <ellipse cx="50" cy="35" rx="22" ry="6" fill="#1a0033"/>
    {/* Hat buckle */}
    <rect x="45" y="30" width="10" height="8" fill="#ffd700"/>
    {/* Hair */}
    <path d="M35 40 Q30 55 25 60" stroke="#1a1a1a" strokeWidth="3"/>
    <path d="M65 40 Q70 55 75 60" stroke="#1a1a1a" strokeWidth="3"/>
    {/* Eyes - glowing */}
    <ellipse cx="45" cy="35" rx="3" ry="4" fill="#ff00ff">
      <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.7;1;0.7"/>
    </ellipse>
    <ellipse cx="55" cy="35" rx="3" ry="4" fill="#ff00ff">
      <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.7;1;0.7"/>
    </ellipse>
    {/* Crooked nose */}
    <path d="M50 37 Q52 42 50 44" stroke="#7cfc00" strokeWidth="2" fill="none"/>
    {/* Smirk */}
    <path d="M45 47 Q50 50 55 46" stroke="#228b22" strokeWidth="1.5" fill="none"/>
    {/* Staff */}
    <line x1="78" y1="30" x2="85" y2="90" stroke="#8b4513" strokeWidth="4"/>
    {/* Staff crystal */}
    <polygon points="78,30 72,20 78,10 84,20" fill="#9400d3">
      <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.7;1;0.7"/>
    </polygon>
    {/* Magic particles */}
    <circle cx="75" cy="15" r="2" fill="#ff00ff" opacity="0.6">
      {animated && <animate attributeName="cy" dur="2s" repeatCount="indefinite" values="15;10;15"/>}
    </circle>
    <circle cx="82" cy="18" r="1.5" fill="#9400d3" opacity="0.5">
      {animated && <animate attributeName="cy" dur="1.5s" repeatCount="indefinite" values="18;13;18"/>}
    </circle>
    {/* Hand with magic */}
    <circle cx="25" cy="55" r="4" fill="#90ee90"/>
    <circle cx="25" cy="55" r="8" fill="#9400d3" opacity="0.3">
      <animate attributeName="r" dur="1s" repeatCount="indefinite" values="8;12;8"/>
    </circle>
  </svg>
);

// Paladin - Light SR
export const PaladinSprite: React.FC<SpriteProps> = ({ size = 80, className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="paladinArmor" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="50%" stopColor="#daa520" />
        <stop offset="100%" stopColor="#b8860b" />
      </linearGradient>
      <filter id="paladinGlow">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#paladinGlow)">
      {/* Halo */}
      <ellipse cx="50" cy="15" rx="10" ry="3" fill="none" stroke="#ffd700" strokeWidth="2">
        <animate attributeName="opacity" dur="1.5s" repeatCount="indefinite" values="0.6;1;0.6"/>
      </ellipse>
      {/* Body armor */}
      <path d="M35 45 L35 75 L65 75 L65 45 Q50 35 35 45" fill="url(#paladinArmor)"/>
      {/* Cross emblem */}
      <rect x="47" y="50" width="6" height="20" fill="#fff"/>
      <rect x="42" y="55" width="16" height="6" fill="#fff"/>
      {/* Shoulders */}
      <ellipse cx="30" cy="48" rx="10" ry="8" fill="url(#paladinArmor)"/>
      <ellipse cx="70" cy="48" rx="10" ry="8" fill="url(#paladinArmor)"/>
      {/* Helmet */}
      <path d="M35 40 Q35 20 50 18 Q65 20 65 40 L35 40" fill="url(#paladinArmor)"/>
      {/* Visor */}
      <rect x="38" y="28" width="24" height="8" fill="#333"/>
      {/* Eye glow */}
      <ellipse cx="44" cy="32" rx="3" ry="2" fill="#87ceeb"/>
      <ellipse cx="56" cy="32" rx="3" ry="2" fill="#87ceeb"/>
      {/* Holy sword */}
      <rect x="72" y="30" width="4" height="45" fill="#ffd700"/>
      <rect x="70" y="27" width="8" height="6" fill="#daa520"/>
      <path d="M74 30 L74 15 L72 10 L76 10 L74 15" fill="#fff">
        <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="0.8;1;0.8"/>
      </path>
      {/* Shield */}
      <path d="M18 45 L18 65 L28 72 L28 45 Z" fill="url(#paladinArmor)"/>
      <path d="M20 50 L20 62 L26 67 L26 50 Z" fill="#fff"/>
      <rect x="21" y="52" width="4" height="12" fill="#ffd700"/>
      <rect x="19" y="56" width="8" height="4" fill="#ffd700"/>
      {/* Legs */}
      <rect x="38" y="75" width="10" height="15" fill="url(#paladinArmor)"/>
      <rect x="52" y="75" width="10" height="15" fill="url(#paladinArmor)"/>
    </g>
  </svg>
);

// Water Spirit - Water SR
export const SpiritSprite: React.FC<SpriteProps & { element?: string }> = ({
  size = 80, className, animated, element = 'water'
}) => {
  const colors = ElementColors[element] || ElementColors.water;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
      <defs>
        <radialGradient id={`spirit${element}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity="0.9" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0.7" />
        </radialGradient>
      </defs>
      {/* Ethereal body */}
      <ellipse cx="50" cy="50" rx="25" ry="30" fill={`url(#spirit${element})`}>
        {animated && <animate attributeName="ry" dur="2s" repeatCount="indefinite" values="30;32;30"/>}
      </ellipse>
      {/* Inner glow */}
      <ellipse cx="50" cy="45" rx="15" ry="18" fill={colors.secondary} opacity="0.5"/>
      {/* Face */}
      <ellipse cx="45" cy="40" rx="4" ry="5" fill="#fff" opacity="0.8"/>
      <ellipse cx="55" cy="40" rx="4" ry="5" fill="#fff" opacity="0.8"/>
      <circle cx="45" cy="41" r="2" fill={colors.primary}/>
      <circle cx="55" cy="41" r="2" fill={colors.primary}/>
      {/* Floating particles */}
      <circle cx="30" cy="35" r="3" fill={colors.secondary} opacity="0.6">
        <animate attributeName="cy" dur="3s" repeatCount="indefinite" values="35;30;35"/>
      </circle>
      <circle cx="70" cy="40" r="2" fill={colors.secondary} opacity="0.5">
        <animate attributeName="cy" dur="2.5s" repeatCount="indefinite" values="40;35;40"/>
      </circle>
      <circle cx="50" cy="20" r="2.5" fill={colors.secondary} opacity="0.7">
        <animate attributeName="cy" dur="2s" repeatCount="indefinite" values="20;15;20"/>
      </circle>
      {/* Wispy tail */}
      <path d="M50 80 Q45 90 40 95 Q50 92 55 98 Q50 90 50 80" fill={colors.primary} opacity="0.5">
        {animated && <animate attributeName="d" dur="1.5s" repeatCount="indefinite"
          values="M50 80 Q45 90 40 95 Q50 92 55 98 Q50 90 50 80;M50 80 Q42 92 38 97 Q48 94 53 100 Q48 92 50 80;M50 80 Q45 90 40 95 Q50 92 55 98 Q50 90 50 80"/>}
      </path>
    </svg>
  );
};

// Monster sprite map by template ID
export const MonsterSpriteMap: Record<string, React.FC<SpriteProps & { element?: string }>> = {
  // Fire monsters
  'fire_phoenix': PhoenixSprite,
  'fire_dragon': (props) => <DragonSprite {...props} element="fire" />,
  'fire_knight': (props) => <KnightSprite {...props} element="fire" />,
  'flame_knight': (props) => <KnightSprite {...props} element="fire" />,
  'fire_imp': (props) => <ImpSprite {...props} element="fire" />,

  // Water monsters
  'water_dragon': (props) => <DragonSprite {...props} element="water" />,
  'water_mage': (props) => <MageSprite {...props} element="water" />,
  'water_knight': (props) => <KnightSprite {...props} element="water" />,
  'water_spirit': (props) => <SpiritSprite {...props} element="water" />,
  'water_imp': (props) => <ImpSprite {...props} element="water" />,

  // Wind monsters
  'wind_griffin': GriffinSprite,
  'wind_assassin': (props) => <AssassinSprite {...props} element="wind" />,
  'wind_archer': (props) => <ArcherSprite {...props} element="wind" />,
  'wind_fairy': (props) => <FairySprite {...props} element="wind" />,
  'wind_pixie': (props) => <FairySprite {...props} element="wind" />,
  'wind_garuda': GarudaSprite,
  'wind_spirit': (props) => <SpiritSprite {...props} element="wind" />,

  // Light monsters
  'light_archangel': AngelSprite,
  'light_angel': AngelSprite,
  'light_paladin': PaladinSprite,
  'light_pixie': (props) => <FairySprite {...props} element="light" />,
  'light_mage': (props) => <MageSprite {...props} element="light" />,

  // Dark monsters
  'dark_demon': DemonSprite,
  'dark_knight': (props) => <KnightSprite {...props} element="dark" />,
  'dark_witch': WitchSprite,
  'dark_bat': BatSprite,
  'shadow_bat': BatSprite,
};

// Get sprite component by template ID or name
export const getMonsterSprite = (templateId: string): React.FC<SpriteProps & { element?: string }> => {
  const normalizedId = templateId.toLowerCase().replace(/\s+/g, '_');
  return MonsterSpriteMap[normalizedId] || ImpSprite;
};
