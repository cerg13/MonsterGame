import React from 'react';
import { GoldIcon, CrystalIcon, EnergyIcon as EnergyItemIcon, ArenaWingsIcon } from '../../assets/icons/items';

export type ResourceType = 'gold' | 'crystal' | 'energy' | 'arena_wings';

interface ResourceDisplayProps {
  type: ResourceType;
  value: number;
  max?: number;
  showIcon?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const ResourceIcons: Record<ResourceType, React.FC<{ size?: number; className?: string }>> = {
  gold: GoldIcon,
  crystal: CrystalIcon,
  energy: EnergyItemIcon,
  arena_wings: ArenaWingsIcon,
};

const resourceColors: Record<ResourceType, string> = {
  gold: '#ffd700',
  crystal: '#9090ff',
  energy: '#00ff88',
  arena_wings: '#ff8844',
};

export const ResourceDisplay: React.FC<ResourceDisplayProps> = ({
  type,
  value,
  max,
  showIcon = true,
  className = '',
  size = 'medium',
}) => {
  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toString();
  };

  const IconComponent = ResourceIcons[type];
  const iconSize = size === 'small' ? 16 : size === 'large' ? 28 : 22;
  const fontSize = size === 'small' ? '12px' : size === 'large' ? '18px' : '14px';

  return (
    <div
      className={`resource-display resource-${type} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 10px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '20px',
        border: `1px solid ${resourceColors[type]}33`,
      }}
    >
      {showIcon && <IconComponent size={iconSize} />}
      <span
        className="resource-value"
        style={{
          color: resourceColors[type],
          fontWeight: 'bold',
          fontSize,
          textShadow: `0 0 5px ${resourceColors[type]}44`,
        }}
      >
        {formatValue(value)}
        {max !== undefined && (
          <span style={{ color: '#888', fontWeight: 'normal' }}>/{formatValue(max)}</span>
        )}
      </span>
    </div>
  );
};

// Compound resource bar
interface ResourceBarProps {
  gold?: number;
  crystals?: number;
  energy?: number;
  maxEnergy?: number;
  arenaWings?: number;
  maxArenaWings?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ResourceBar: React.FC<ResourceBarProps> = ({
  gold = 0,
  crystals = 0,
  energy = 0,
  maxEnergy,
  arenaWings,
  maxArenaWings,
  className = '',
  size = 'medium',
}) => {
  return (
    <div
      className={`resource-bar-container ${className}`}
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <ResourceDisplay type="gold" value={gold} size={size} />
      <ResourceDisplay type="crystal" value={crystals} size={size} />
      <ResourceDisplay type="energy" value={energy} max={maxEnergy} size={size} />
      {arenaWings !== undefined && (
        <ResourceDisplay type="arena_wings" value={arenaWings} max={maxArenaWings} size={size} />
      )}
    </div>
  );
};

export default ResourceDisplay;
