import React from 'react';
import type { BattleMonster, BattleSkill } from '../../types/battle';
import { getElementAdvantage } from '../../types/monster';
import './DamagePrediction.css';

interface DamagePredictionProps {
  attacker: BattleMonster;
  defender: BattleMonster;
  skill: BattleSkill;
  compact?: boolean;
}

interface DamagePrediction {
  minDamage: number;
  maxDamage: number;
  avgDamage: number;
  critRate: number;
  elementAdvantage: 'strong' | 'weak' | 'neutral';
  crushingChance: number;
  glancingChance: number;
  canCrit: boolean;
}

/**
 * Calculate damage prediction
 * Based on DamageCalculator formulas without RNG
 */
const calculatePrediction = (
  attacker: BattleMonster,
  defender: BattleMonster,
  skill: BattleSkill
): DamagePrediction => {
  const template = skill.template;

  // Get scaling stat
  const getScalingStat = (monster: BattleMonster, stat: string): number => {
    switch (stat) {
      case 'atk': return monster.atk;
      case 'def': return monster.def;
      case 'hp': return monster.maxHp;
      case 'spd': return monster.spd;
      default: return monster.atk;
    }
  };

  const scalingStat = getScalingStat(attacker, template.scalingStat);

  // Calculate raw damage
  let rawDamage = scalingStat * template.multiplier;

  // Skill-up bonus
  const skillLevel = skill.skillLevel || 1;
  const bonuses = template.skillUpBonuses || [];
  let skillUpBonus = 0;
  for (let i = 0; i < Math.min(skillLevel - 1, bonuses.length); i++) {
    if (bonuses[i].type === 'damage') {
      skillUpBonus += bonuses[i].value;
    }
  }
  rawDamage *= (1 + skillUpBonus);

  // Defense reduction
  const defReduction = 1000 / (1140 + 3.5 * defender.def);
  let damage = rawDamage * defReduction;

  // Element advantage
  const elementAdvantage = getElementAdvantage(attacker.element, defender.element);

  // Critical rate calculation
  let effectiveCritRate = attacker.critRate;
  if (elementAdvantage === 'strong') {
    effectiveCritRate += 15;
  } else if (elementAdvantage === 'weak') {
    effectiveCritRate -= 15;
  }
  effectiveCritRate = Math.max(0, Math.min(100, effectiveCritRate));

  const critModifier = 1 + attacker.critDamage / 100;

  // Element modifiers
  const crushingChance = elementAdvantage === 'strong' ? 15 : 0;
  const glancingChance = elementAdvantage === 'weak' ? 50 : 0;

  // Buff/debuff modifiers
  let buffMultiplier = 1;
  const hasAtkUp = attacker.buffs.some(b => b.type === 'atkUp');
  const hasAtkDown = attacker.debuffs.some(d => d.type === 'atkDown');
  const hasDefDown = defender.debuffs.some(d => d.type === 'defDown');
  const hasDefUp = defender.buffs.some(b => b.type === 'defUp');
  const hasInvincibility = defender.buffs.some(b => b.type === 'invincibility');

  if (hasAtkUp) buffMultiplier *= 1.5;
  if (hasAtkDown) buffMultiplier *= 0.5;
  if (hasDefDown) buffMultiplier *= 1.7;
  if (hasDefUp) buffMultiplier *= 0.3;

  damage *= buffMultiplier;

  // Calculate damage ranges
  let minDamage = damage;
  let maxDamage = damage;

  if (hasInvincibility) {
    minDamage = 0;
    maxDamage = 0;
  } else {
    // Min: Glancing hit (if possible), no crit
    if (glancingChance > 0) {
      minDamage *= 0.7;
    }

    // Max: Crushing hit (if possible), with crit
    let maxWithModifiers = damage;
    if (crushingChance > 0) {
      maxWithModifiers *= 1.3;
    }
    if (effectiveCritRate > 0) {
      maxWithModifiers *= critModifier;
    }
    maxDamage = maxWithModifiers;
  }

  // Average damage: factor in crit rate and element modifiers
  let avgDamage = damage;
  if (crushingChance > 0) {
    avgDamage *= 1 + (0.3 * (crushingChance / 100));
  }
  if (glancingChance > 0) {
    avgDamage *= 1 - (0.3 * (glancingChance / 100));
  }
  if (effectiveCritRate > 0) {
    avgDamage *= 1 + ((critModifier - 1) * (effectiveCritRate / 100));
  }

  // Ensure minimum damage
  const minDamageFloor = rawDamage * 0.01;
  minDamage = Math.max(minDamage, minDamageFloor);
  avgDamage = Math.max(avgDamage, minDamageFloor);
  maxDamage = Math.max(maxDamage, minDamageFloor);

  return {
    minDamage: Math.floor(minDamage),
    maxDamage: Math.floor(maxDamage),
    avgDamage: Math.floor(avgDamage),
    critRate: effectiveCritRate,
    elementAdvantage,
    crushingChance,
    glancingChance,
    canCrit: effectiveCritRate > 0,
  };
};

export const DamagePrediction: React.FC<DamagePredictionProps> = ({
  attacker,
  defender,
  skill,
  compact = false,
}) => {
  const prediction = calculatePrediction(attacker, defender, skill);

  const getElementIcon = (advantage: 'strong' | 'weak' | 'neutral'): string => {
    if (advantage === 'strong') return '⬆️';
    if (advantage === 'weak') return '⬇️';
    return '➡️';
  };

  const getElementColor = (advantage: 'strong' | 'weak' | 'neutral'): string => {
    if (advantage === 'strong') return '#26de81';
    if (advantage === 'weak') return '#fc5c65';
    return '#a4b0be';
  };

  const getElementText = (advantage: 'strong' | 'weak' | 'neutral'): string => {
    if (advantage === 'strong') return 'Advantage';
    if (advantage === 'weak') return 'Disadvantage';
    return 'Neutral';
  };

  if (compact) {
    return (
      <div className="damage-prediction-compact">
        <span className="predicted-damage">{prediction.avgDamage.toLocaleString()}</span>
        {prediction.elementAdvantage !== 'neutral' && (
          <span
            className="element-indicator"
            style={{ color: getElementColor(prediction.elementAdvantage) }}
          >
            {getElementIcon(prediction.elementAdvantage)}
          </span>
        )}
        {prediction.canCrit && (
          <span className="crit-indicator">
            ⚡ {prediction.critRate.toFixed(0)}%
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="damage-prediction">
      {/* Main Damage Display */}
      <div className="damage-main">
        <div className="damage-label">Expected Damage</div>
        <div className="damage-value">{prediction.avgDamage.toLocaleString()}</div>
      </div>

      {/* Damage Range */}
      <div className="damage-range">
        <div className="range-bar">
          <div className="range-min">
            <span className="range-label">Min</span>
            <span className="range-value">{prediction.minDamage.toLocaleString()}</span>
          </div>
          <div className="range-separator" />
          <div className="range-max">
            <span className="range-label">Max</span>
            <span className="range-value">{prediction.maxDamage.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="prediction-details">
        {/* Element Advantage */}
        {prediction.elementAdvantage !== 'neutral' && (
          <div
            className="detail-item element-advantage"
            style={{ borderColor: getElementColor(prediction.elementAdvantage) }}
          >
            <span className="detail-icon">{getElementIcon(prediction.elementAdvantage)}</span>
            <span className="detail-label">Element</span>
            <span
              className="detail-value"
              style={{ color: getElementColor(prediction.elementAdvantage) }}
            >
              {getElementText(prediction.elementAdvantage)}
            </span>
          </div>
        )}

        {/* Critical Rate */}
        {prediction.canCrit && (
          <div className="detail-item crit-rate">
            <span className="detail-icon">⚡</span>
            <span className="detail-label">Crit Rate</span>
            <span className="detail-value">{prediction.critRate.toFixed(0)}%</span>
          </div>
        )}

        {/* Crushing Hit Chance */}
        {prediction.crushingChance > 0 && (
          <div className="detail-item crushing">
            <span className="detail-icon">💥</span>
            <span className="detail-label">Crushing</span>
            <span className="detail-value">{prediction.crushingChance}%</span>
          </div>
        )}

        {/* Glancing Hit Chance */}
        {prediction.glancingChance > 0 && (
          <div className="detail-item glancing">
            <span className="detail-icon">🌫️</span>
            <span className="detail-label">Glancing</span>
            <span className="detail-value">{prediction.glancingChance}%</span>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div className="prediction-helper">
        <span className="helper-icon">ℹ️</span>
        <span className="helper-text">
          {prediction.elementAdvantage === 'strong' &&
            'Element advantage increases damage and crit rate!'}
          {prediction.elementAdvantage === 'weak' &&
            'Element disadvantage reduces damage and crit rate!'}
          {prediction.elementAdvantage === 'neutral' &&
            'No element advantage or disadvantage.'}
        </span>
      </div>
    </div>
  );
};

export default DamagePrediction;
