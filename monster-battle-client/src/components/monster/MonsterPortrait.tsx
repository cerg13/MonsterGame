import React, { useState, useEffect } from 'react';
import type { Element, Rarity } from '../../types/monster';
import { getElementGradient, getElementColor } from '../../utils/elementColors';
import './MonsterPortrait.css';

interface MonsterPortraitProps {
  monsterId: string;
  name: string;
  element: Element;
  rarity: Rarity;
  level?: number;
  awakened?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showAura?: boolean;
  animated?: boolean;
  onClick?: () => void;
}

export const MonsterPortrait: React.FC<MonsterPortraitProps> = ({
  monsterId,
  name,
  element,
  rarity,
  level = 1,
  awakened = false,
  size = 'md',
  showAura = true,
  animated = true,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate portrait loading
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [monsterId]);

  const elementGradient = getElementGradient(element);
  const elementColor = getElementColor(element);

  // Generate unique visual based on monster ID
  const generateVisual = () => {
    // Use monster name/id to generate consistent pattern
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pattern = hash % 5;

    return (
      <div className="portrait-visual">
        {/* Base shape */}
        <div className="portrait-shape" style={{ background: elementGradient }}>
          <div className="shape-layer-1" />
          <div className="shape-layer-2" />
          <div className="shape-layer-3" />
        </div>

        {/* Element symbol */}
        <div className="element-symbol" style={{ color: elementColor }}>
          {getElementSymbol(element)}
        </div>

        {/* Name initial */}
        <div className="name-initial">
          {name.charAt(0).toUpperCase()}
        </div>

        {/* Pattern overlay */}
        <div className={`pattern-overlay pattern-${pattern}`} />
      </div>
    );
  };

  return (
    <div
      className={`monster-portrait size-${size} rarity-${rarity} ${isLoaded ? 'loaded' : ''} ${animated ? 'animated' : ''} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      data-element={element}
    >
      {/* Aura effect */}
      {showAura && (
        <div className="portrait-aura" style={{ background: elementGradient }}>
          <div className="aura-pulse" />
          <div className="aura-ring" />
          {rarity === 'ssr' && <div className="aura-particles" />}
        </div>
      )}

      {/* Main portrait */}
      <div className="portrait-container">
        {generateVisual()}

        {/* Glow effects */}
        <div className="portrait-glow" style={{ boxShadow: `0 0 30px ${elementColor}` }} />

        {/* Awakened crown */}
        {awakened && (
          <div className="awakened-crown">
            <span className="crown-icon">👑</span>
            <div className="crown-shine" />
          </div>
        )}

        {/* Level indicator */}
        {level > 1 && (
          <div className="level-badge">
            <span className="level-text">Lv {level}</span>
          </div>
        )}
      </div>

      {/* Rarity effects */}
      {rarity === 'ssr' && (
        <div className="ssr-effects">
          <div className="ssr-ring-1" style={{ borderColor: elementColor }} />
          <div className="ssr-ring-2" style={{ borderColor: elementColor }} />
          <div className="ssr-sparkles">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="sparkle"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  background: elementColor,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {rarity === 'sr' && (
        <div className="sr-effects">
          <div className="sr-ring" style={{ borderColor: elementColor }} />
        </div>
      )}

      {/* Element particles */}
      {animated && showAura && (
        <div className="element-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                animationDelay: `${i * 0.3}s`,
                background: elementColor,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function getElementSymbol(element: Element): string {
  const symbols: Record<Element, string> = {
    fire: '🔥',
    water: '💧',
    wind: '🌪️',
    light: '✨',
    dark: '🌑',
  };
  return symbols[element];
}

export default MonsterPortrait;
