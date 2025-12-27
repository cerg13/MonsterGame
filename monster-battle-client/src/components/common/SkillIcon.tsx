import React from 'react';
import { Tooltip } from './Tooltip';

interface SkillIconProps {
  name: string;
  icon?: string;
  cooldown?: number;
  maxCooldown?: number;
  isReady?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  description?: string;
  className?: string;
}

export const SkillIcon: React.FC<SkillIconProps> = ({
  name,
  icon,
  cooldown = 0,
  maxCooldown = 0,
  isReady = true,
  onClick,
  size = 'md',
  disabled = false,
  description,
  className = '',
}) => {
  const sizes = {
    sm: { width: 40, height: 40, fontSize: 20 },
    md: { width: 56, height: 56, fontSize: 28 },
    lg: { width: 72, height: 72, fontSize: 36 },
  };

  const sizeStyle = sizes[size];
  const onCooldown = cooldown > 0;
  const isDisabled = disabled || onCooldown;

  const content = (
    <div
      className={`skill-icon ${isDisabled ? 'disabled' : ''} ${className}`}
      style={{
        width: sizeStyle.width,
        height: sizeStyle.height,
        borderRadius: '12px',
        background: isDisabled
          ? 'linear-gradient(135deg, #333 0%, #222 100%)'
          : 'linear-gradient(135deg, #4a4a6a 0%, #2a2a4a 100%)',
        border: `2px solid ${isReady && !isDisabled ? '#667eea' : '#444'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s',
        opacity: isDisabled ? 0.6 : 1,
      }}
      onClick={!isDisabled ? onClick : undefined}
    >
      {/* Skill icon or first letter */}
      <span style={{ fontSize: sizeStyle.fontSize, color: 'white' }}>
        {icon || name.charAt(0)}
      </span>

      {/* Cooldown overlay */}
      {onCooldown && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ff9800',
            fontSize: sizeStyle.fontSize * 0.7,
            fontWeight: 'bold',
          }}
        >
          {cooldown}
        </div>
      )}

      {/* Ready indicator */}
      {isReady && !onCooldown && !disabled && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#4caf50',
            boxShadow: '0 0 6px #4caf50',
          }}
        />
      )}
    </div>
  );

  if (description) {
    return (
      <Tooltip content={<div><strong>{name}</strong><br/>{description}</div>}>
        {content}
      </Tooltip>
    );
  }

  return content;
};

export default SkillIcon;
