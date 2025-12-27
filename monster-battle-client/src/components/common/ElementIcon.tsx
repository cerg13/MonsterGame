import React from 'react';
import type { Element } from '../../types/monster';

interface ElementIconProps {
  element: Element;
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
  className?: string;
}

const elementEmojis: Record<Element, string> = {
  fire: '🔥',
  water: '💧',
  wind: '🌪️',
  light: '✨',
  dark: '🌑',
};

export const ElementIcon: React.FC<ElementIconProps> = ({
  element,
  size = 'md',
  showBackground = true,
  className = '',
}) => {
  const sizeStyles = {
    sm: { width: 20, height: 20, fontSize: 12 },
    md: { width: 28, height: 28, fontSize: 16 },
    lg: { width: 40, height: 40, fontSize: 24 },
  };

  if (!showBackground) {
    return (
      <span className={className} style={{ fontSize: sizeStyles[size].fontSize }}>
        {elementEmojis[element]}
      </span>
    );
  }

  return (
    <div
      className={`element-icon-wrapper element-${element} ${className}`}
      style={sizeStyles[size]}
    >
      {elementEmojis[element]}
    </div>
  );
};

export default ElementIcon;
