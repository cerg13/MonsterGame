import React from 'react';
import type { MonsterTemplate, PlayerMonster } from '../../../types';
import { getElementIcon, ElementColors } from '../../../assets/icons/elements';
import { getMonsterSprite } from '../../../assets/sprites/MonsterSprites';
import { RarityColors, RarityStars } from '../../../assets/styles/RarityFrames';
import './MonsterCard.css';

interface MonsterCardProps {
  template: MonsterTemplate;
  instance?: PlayerMonster;
  onClick?: () => void;
  selected?: boolean;
  showStats?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const MonsterCard: React.FC<MonsterCardProps> = ({
  template,
  instance,
  onClick,
  selected = false,
  showStats = false,
  size = 'medium',
}) => {
  const level = instance?.level ?? 1;
  const isAwakened = instance?.awakened ?? false;
  const rarity = template.rarity.toLowerCase();
  const element = template.element.toLowerCase();

  // Get element icon component
  const ElementIcon = getElementIcon(element);
  const elementColors = ElementColors[element] || ElementColors.fire;
  const rarityColor = RarityColors[rarity as keyof typeof RarityColors] || RarityColors.common;

  // Get monster sprite component
  const MonsterSprite = getMonsterSprite(template.id);

  // Size configurations
  const sizes = {
    small: { card: 100, sprite: 50, portrait: 60 },
    medium: { card: 120, sprite: 65, portrait: 80 },
    large: { card: 150, sprite: 85, portrait: 100 },
  };
  const sizeConfig = sizes[size];

  return (
    <div
      className={`monster-card ${selected ? 'selected' : ''} ${rarity} size-${size}`}
      onClick={onClick}
      style={{
        '--rarity-color': rarityColor.border,
        '--rarity-glow': rarityColor.glow,
        '--element-color': elementColors.primary,
        width: sizeConfig.card,
      } as React.CSSProperties}
    >
      {/* Animated rarity border glow */}
      <div className="rarity-glow" />

      {/* Corner decorations for SR/SSR */}
      {(rarity === 'sr' || rarity === 'ssr') && (
        <svg className="corner-decorations" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={`cornerGrad${template.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={rarityColor.accent} />
              <stop offset="100%" stopColor={rarityColor.border} />
            </linearGradient>
          </defs>
          <path d="M0 15 L0 0 L15 0" stroke={`url(#cornerGrad${template.id})`} strokeWidth="2" fill="none" />
          <path d="M85 0 L100 0 L100 15" stroke={`url(#cornerGrad${template.id})`} strokeWidth="2" fill="none" />
          <path d="M100 85 L100 100 L85 100" stroke={`url(#cornerGrad${template.id})`} strokeWidth="2" fill="none" />
          <path d="M15 100 L0 100 L0 85" stroke={`url(#cornerGrad${template.id})`} strokeWidth="2" fill="none" />
          {rarity === 'ssr' && (
            <>
              <circle cx="5" cy="5" r="2" fill={rarityColor.accent}>
                <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.5;1;0.5" />
              </circle>
              <circle cx="95" cy="5" r="2" fill={rarityColor.accent}>
                <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.5;1;0.5" begin="0.5s" />
              </circle>
              <circle cx="95" cy="95" r="2" fill={rarityColor.accent}>
                <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.5;1;0.5" begin="1s" />
              </circle>
              <circle cx="5" cy="95" r="2" fill={rarityColor.accent}>
                <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.5;1;0.5" begin="1.5s" />
              </circle>
            </>
          )}
        </svg>
      )}

      {/* Monster portrait */}
      <div className="monster-portrait" style={{ width: sizeConfig.portrait, height: sizeConfig.portrait }}>
        {/* Element icon */}
        <div className="element-icon-container">
          <ElementIcon size={size === 'small' ? 18 : size === 'large' ? 26 : 22} />
        </div>

        {/* Monster sprite */}
        <div className="monster-sprite-container">
          <MonsterSprite size={sizeConfig.sprite} animated element={element} />
        </div>

        {/* Awakened glow effect */}
        {isAwakened && (
          <div className="awakened-glow" style={{ backgroundColor: elementColors.glow }} />
        )}
      </div>

      {/* Stars */}
      <div className="monster-stars">
        <RarityStars rarity={rarity} size={size === 'small' ? 10 : size === 'large' ? 14 : 12} />
      </div>

      {/* Name and Level */}
      <div className="monster-info">
        <span className="monster-name">
          {isAwakened && template.awakenedName ? template.awakenedName : template.name}
        </span>
        <span className="monster-level">Lv. {level}</span>
      </div>

      {/* Stats (optional) */}
      {showStats && (
        <div className="monster-stats">
          <div className="stat">
            <span className="stat-label">HP</span>
            <span className="stat-value">{template.baseStats.hp}</span>
          </div>
          <div className="stat">
            <span className="stat-label">ATK</span>
            <span className="stat-value">{template.baseStats.atk}</span>
          </div>
          <div className="stat">
            <span className="stat-label">DEF</span>
            <span className="stat-value">{template.baseStats.def}</span>
          </div>
          <div className="stat">
            <span className="stat-label">SPD</span>
            <span className="stat-value">{template.baseStats.spd}</span>
          </div>
        </div>
      )}

      {/* Locked indicator */}
      {instance?.locked && (
        <div className="locked-indicator">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M18 10V8C18 4.7 15.3 2 12 2S6 4.7 6 8v2H4v12h16V10h-2zm-8 0V8c0-1.7 1.3-3 3-3s3 1.3 3 3v2h-6z"
                  fill="#ffd700" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default MonsterCard;
