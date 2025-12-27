import React, { useEffect, useState } from 'react';
import './DamageNumber.css';

export type DamageType = 'normal' | 'critical' | 'heal' | 'miss' | 'block';

interface DamageNumberProps {
  value: number;
  type: DamageType;
  x: number;
  y: number;
  onComplete?: () => void;
}

export const DamageNumber: React.FC<DamageNumberProps> = ({
  value,
  type,
  x,
  y,
  onComplete,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, type === 'critical' ? 1500 : 1000);

    return () => clearTimeout(timer);
  }, [type, onComplete]);

  if (!visible) return null;

  const renderText = () => {
    switch (type) {
      case 'miss':
        return 'MISS';
      case 'block':
        return 'BLOCKED';
      case 'heal':
        return `+${value.toLocaleString()}`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div
      className={`damage-number damage-${type}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="damage-text">
        {renderText()}
        {type === 'critical' && (
          <>
            <span className="critical-icon">⚡</span>
            <div className="critical-flash" />
          </>
        )}
      </div>
      {type === 'critical' && (
        <div className="critical-sparks">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="spark"
              style={{ transform: `rotate(${i * 45}deg)` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DamageNumber;
