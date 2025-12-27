import React from 'react';
import type { Element } from '../../types/monster';

export type BadgeVariant =
  | 'fire' | 'water' | 'wind' | 'light' | 'dark'
  | 'success' | 'warning' | 'danger' | 'info'
  | 'buff' | 'debuff';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  icon,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};

// Element badge helper
interface ElementBadgeProps {
  element: Element;
  showLabel?: boolean;
}

const elementLabels: Record<Element, string> = {
  fire: 'Fire',
  water: 'Water',
  wind: 'Wind',
  light: 'Light',
  dark: 'Dark',
};

const elementEmojis: Record<Element, string> = {
  fire: '🔥',
  water: '💧',
  wind: '🌪️',
  light: '✨',
  dark: '🌑',
};

export const ElementBadge: React.FC<ElementBadgeProps> = ({
  element,
  showLabel = true,
}) => {
  return (
    <Badge variant={element} icon={elementEmojis[element]}>
      {showLabel && elementLabels[element]}
    </Badge>
  );
};

export default Badge;
