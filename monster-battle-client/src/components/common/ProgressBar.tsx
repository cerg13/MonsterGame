import React from 'react';

export type ProgressBarType = 'hp' | 'exp' | 'atb' | 'mana' | 'default';
export type ProgressBarSize = 'sm' | 'md' | 'lg';

interface ProgressBarProps {
  value: number;
  max: number;
  type?: ProgressBarType;
  size?: ProgressBarSize;
  showText?: boolean;
  textFormat?: 'value' | 'percent' | 'both';
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  type = 'default',
  size = 'md',
  showText = false,
  textFormat = 'both',
  className = '',
  animated = true,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // HP bar color states
  const hpState = type === 'hp'
    ? percentage <= 20
      ? 'critical'
      : percentage <= 50
        ? 'low'
        : ''
    : '';

  const sizeClass = size !== 'md' ? `progress-bar-${size}` : '';

  const getText = () => {
    switch (textFormat) {
      case 'value':
        return `${Math.floor(value)} / ${max}`;
      case 'percent':
        return `${Math.floor(percentage)}%`;
      case 'both':
      default:
        return `${Math.floor(value)} / ${max}`;
    }
  };

  return (
    <div className={`progress-bar progress-bar-${type} ${hpState} ${sizeClass} ${className}`}>
      <div
        className="progress-bar-fill"
        style={{
          width: `${percentage}%`,
          transition: animated ? 'width 0.3s ease' : 'none',
        }}
      />
      {showText && <span className="progress-bar-text">{getText()}</span>}
    </div>
  );
};

export default ProgressBar;
