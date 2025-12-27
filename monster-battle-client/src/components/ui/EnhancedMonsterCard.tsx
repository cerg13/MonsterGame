import React, { useState, useRef } from 'react';
import type { MonsterTemplate } from '../../types/monster';
import type { PlayerMonster } from '../../types/player';
import { getElementGradient } from '../../utils/elementColors';
import './EnhancedMonsterCard.css';

interface EnhancedMonsterCardProps {
  template: MonsterTemplate;
  instance?: PlayerMonster;
  onClick?: () => void;
  selected?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const EnhancedMonsterCard: React.FC<EnhancedMonsterCardProps> = ({
  template,
  instance,
  onClick,
  selected = false,
  showDetails = true,
  size = 'md',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -10;
    const tiltY = ((x - centerX) / centerX) * 10;

    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const displayName = instance?.awakened && template.awakenedName
    ? template.awakenedName
    : template.name;

  const stars = instance?.stars || template.naturalStars;
  const level = instance?.level || 1;

  const elementGradient = getElementGradient(template.element);

  return (
    <div
      ref={cardRef}
      className={`enhanced-monster-card ${size} ${selected ? 'selected' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      data-element={template.element}
      data-rarity={template.rarity}
    >
      {/* Shine effect */}
      <div
        className="card-shine"
        style={{
          background: `linear-gradient(${tilt.y * 5 + 45}deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)`,
        }}
      />

      {/* Glow border */}
      <div className="card-glow-border" />

      {/* Card content */}
      <div className="card-content">
        {/* Header with element badge */}
        <div className="card-header">
          <div className="element-badge-3d" style={{ background: elementGradient }}>
            {getElementIcon(template.element)}
          </div>
          <div className="rarity-indicator">
            <span className={`rarity-star rarity-${template.rarity}`}>
              {'★'.repeat(stars)}
            </span>
          </div>
        </div>

        {/* Monster portrait */}
        <div className="monster-portrait">
          <div className="portrait-glow" style={{ background: elementGradient }} />
          <div className="portrait-inner">
            {/* Placeholder - replace with actual monster image */}
            <div className="monster-icon" style={{ background: elementGradient }}>
              {displayName.charAt(0)}
            </div>
          </div>
          {instance?.awakened && (
            <div className="awakened-badge">
              <span className="awakened-icon">✧</span>
            </div>
          )}
        </div>

        {/* Monster info */}
        <div className="monster-info">
          <h3 className="monster-name">{displayName}</h3>
          {showDetails && (
            <>
              <div className="monster-level">
                <span className="level-label">Lv</span>
                <span className="level-value">{level}</span>
              </div>
              <div className="monster-element">
                <span className={`element-name element-${template.element}`}>
                  {template.element.toUpperCase()}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Locked indicator */}
        {instance?.locked && (
          <div className="locked-indicator">
            <span className="lock-icon">🔒</span>
          </div>
        )}

        {/* Selection indicator */}
        {selected && (
          <div className="selection-indicator">
            <div className="selection-checkmark">✓</div>
          </div>
        )}

        {/* Rarity background effect */}
        {template.rarity === 'ssr' && (
          <div className="ssr-background-effect" />
        )}
      </div>
    </div>
  );
};

function getElementIcon(element: string): string {
  const icons: Record<string, string> = {
    fire: '🔥',
    water: '💧',
    wind: '🌪️',
    light: '✨',
    dark: '🌑',
  };
  return icons[element] || '⭐';
}

export default EnhancedMonsterCard;
