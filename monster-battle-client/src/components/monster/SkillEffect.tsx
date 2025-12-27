import React, { useEffect, useState } from 'react';
import type { Element } from '../../types/monster';
import { getElementColor } from '../../utils/elementColors';
import './SkillEffect.css';

export type SkillEffectType =
  | 'attack'
  | 'heal'
  | 'buff'
  | 'debuff'
  | 'aoe'
  | 'critical'
  | 'ultimate';

interface SkillEffectProps {
  type: SkillEffectType;
  element: Element;
  targetX: number;
  targetY: number;
  sourceX?: number;
  sourceY?: number;
  onComplete?: () => void;
  duration?: number;
}

export const SkillEffect: React.FC<SkillEffectProps> = ({
  type,
  element,
  targetX,
  targetY,
  sourceX = 0,
  sourceY = 0,
  onComplete,
  duration = 1000,
}) => {
  const [phase, setPhase] = useState<'charging' | 'casting' | 'impact' | 'done'>('charging');
  const elementColor = getElementColor(element);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Phase progression
    timers.push(setTimeout(() => setPhase('casting'), duration * 0.2));
    timers.push(setTimeout(() => setPhase('impact'), duration * 0.6));
    timers.push(setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, duration));

    return () => timers.forEach(clearTimeout);
  }, [duration, onComplete]);

  const renderEffect = () => {
    switch (type) {
      case 'attack':
        return <AttackEffect element={element} color={elementColor} phase={phase} />;
      case 'aoe':
        return <AOEEffect element={element} color={elementColor} phase={phase} />;
      case 'heal':
        return <HealEffect color="#26de81" phase={phase} />;
      case 'buff':
        return <BuffEffect color="#48dbfb" phase={phase} />;
      case 'debuff':
        return <DebuffEffect color="#fc5c65" phase={phase} />;
      case 'critical':
        return <CriticalEffect color="#fed330" phase={phase} />;
      case 'ultimate':
        return <UltimateEffect element={element} color={elementColor} phase={phase} />;
      default:
        return null;
    }
  };

  if (phase === 'done') return null;

  return (
    <div
      className={`skill-effect skill-effect-${type}`}
      style={{
        left: `${targetX}px`,
        top: `${targetY}px`,
      }}
    >
      {renderEffect()}
    </div>
  );
};

// Attack Effect - Projectile
const AttackEffect: React.FC<{ element: Element; color: string; phase: string }> = ({
  element,
  color,
  phase,
}) => (
  <div className={`attack-effect phase-${phase}`}>
    <div className="projectile" style={{ background: color, boxShadow: `0 0 20px ${color}` }}>
      <div className="projectile-trail" style={{ background: color }} />
      {getElementIcon(element)}
    </div>
    {phase === 'impact' && (
      <div className="impact-burst">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="impact-particle"
            style={{
              transform: `rotate(${i * 45}deg)`,
              background: color,
            }}
          />
        ))}
      </div>
    )}
  </div>
);

// AOE Effect - Expanding Circle
const AOEEffect: React.FC<{ element: Element; color: string; phase: string }> = ({
  element,
  color,
  phase,
}) => (
  <div className={`aoe-effect phase-${phase}`}>
    <div className="aoe-ring-1" style={{ borderColor: color, boxShadow: `0 0 30px ${color}` }} />
    <div className="aoe-ring-2" style={{ borderColor: color, boxShadow: `0 0 20px ${color}` }} />
    <div className="aoe-ring-3" style={{ borderColor: color, boxShadow: `0 0 10px ${color}` }} />
    <div className="aoe-center" style={{ background: color }}>
      {getElementIcon(element)}
    </div>
    {phase === 'impact' && (
      <div className="aoe-shockwave" style={{ borderColor: color }} />
    )}
  </div>
);

// Heal Effect - Rising Particles
const HealEffect: React.FC<{ color: string; phase: string }> = ({ color, phase }) => (
  <div className={`heal-effect phase-${phase}`}>
    <div className="heal-core" style={{ background: color, boxShadow: `0 0 30px ${color}` }}>
      ❤️
    </div>
    <div className="heal-particles">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="heal-particle"
          style={{
            animationDelay: `${i * 0.1}s`,
            background: color,
          }}
        />
      ))}
    </div>
    {phase === 'impact' && (
      <div className="heal-wave" style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
    )}
  </div>
);

// Buff Effect - Ascending Glow
const BuffEffect: React.FC<{ color: string; phase: string }> = ({ color, phase }) => (
  <div className={`buff-effect phase-${phase}`}>
    <div className="buff-aura" style={{ background: color, boxShadow: `0 0 40px ${color}` }} />
    <div className="buff-sparkles">
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="buff-sparkle"
          style={{
            animationDelay: `${i * 0.1}s`,
            left: `${Math.cos((i / 16) * Math.PI * 2) * 50 + 50}%`,
            top: `${Math.sin((i / 16) * Math.PI * 2) * 50 + 50}%`,
            background: color,
          }}
        />
      ))}
    </div>
    <div className="buff-icon">⬆️</div>
  </div>
);

// Debuff Effect - Descending Dark
const DebuffEffect: React.FC<{ color: string; phase: string }> = ({ color, phase }) => (
  <div className={`debuff-effect phase-${phase}`}>
    <div className="debuff-cloud" style={{ background: color, boxShadow: `0 0 40px ${color}` }} />
    <div className="debuff-drops">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="debuff-drop"
          style={{
            animationDelay: `${i * 0.15}s`,
            left: `${(i / 8) * 100}%`,
            background: color,
          }}
        />
      ))}
    </div>
    <div className="debuff-icon">⬇️</div>
  </div>
);

// Critical Effect - Lightning Flash
const CriticalEffect: React.FC<{ color: string; phase: string }> = ({ color, phase }) => (
  <div className={`critical-effect phase-${phase}`}>
    <div className="critical-flash" style={{ background: color }} />
    <div className="critical-lightning">
      <div className="lightning-bolt" style={{ background: color, boxShadow: `0 0 30px ${color}` }} />
      <div className="lightning-bolt bolt-2" style={{ background: color, boxShadow: `0 0 30px ${color}` }} />
    </div>
    <div className="critical-text">CRITICAL!</div>
    <div className="critical-stars">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="critical-star"
          style={{
            animationDelay: `${i * 0.1}s`,
            color: color,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  </div>
);

// Ultimate Effect - Epic Explosion
const UltimateEffect: React.FC<{ element: Element; color: string; phase: string }> = ({
  element,
  color,
  phase,
}) => (
  <div className={`ultimate-effect phase-${phase}`}>
    <div className="ultimate-core" style={{ background: color, boxShadow: `0 0 60px ${color}` }}>
      {getElementIcon(element)}
    </div>
    <div className="ultimate-rings">
      <div className="ultimate-ring ring-1" style={{ borderColor: color }} />
      <div className="ultimate-ring ring-2" style={{ borderColor: color }} />
      <div className="ultimate-ring ring-3" style={{ borderColor: color }} />
    </div>
    {phase === 'impact' && (
      <>
        <div className="ultimate-explosion" style={{ background: `radial-gradient(circle, ${color}, transparent)` }} />
        <div className="ultimate-shockwave" style={{ borderColor: color }} />
      </>
    )}
    <div className="ultimate-particles">
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className="ultimate-particle"
          style={{
            transform: `rotate(${i * 15}deg)`,
            background: color,
          }}
        />
      ))}
    </div>
  </div>
);

function getElementIcon(element: Element): string {
  const icons: Record<Element, string> = {
    fire: '🔥',
    water: '💧',
    wind: '🌪️',
    light: '✨',
    dark: '🌑',
  };
  return icons[element];
}

export default SkillEffect;
