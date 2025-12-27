// Element types and their relationships
export type Element = 'fire' | 'water' | 'wind' | 'light' | 'dark';

export type Rarity = 'common' | 'rare' | 'sr' | 'ssr';

// Base stats structure
export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  critRate: number;      // Base 15%
  critDamage: number;    // Base 50%
  accuracy: number;      // Base 0%
  resistance: number;    // Base 15%
}

// Monster template (static data)
export interface MonsterTemplate {
  id: string;
  name: string;
  element: Element;
  naturalStars: 2 | 3 | 4 | 5;
  rarity: Rarity;
  baseStats: BaseStats;
  skills: SkillTemplate[];
  leaderSkill?: string;    // Passive ID for leader skill
  passiveSkill?: string;   // Passive ID for innate passive
  awakenedName?: string;
  awakenBonus?: Partial<BaseStats>;
  awakenPassive?: string;  // Passive unlocked on awakening
  spriteSheet: string;
  portrait: string;
  description: string;
}

// Player's owned monster instance
export interface PlayerMonster {
  id: string;
  templateId: string;
  ownerId: string;
  level: number;
  stars: number;
  experience: number;
  skillLevels: number[];
  awakened: boolean;
  equippedRunes: string[];
  locked: boolean;
  obtainedAt: Date;
}

// Skill template
export interface SkillTemplate {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  multiplier: number;
  scalingStat: ScalingStat;
  targetType: TargetType;
  effects: SkillEffect[];
  skillUpBonuses: SkillUpBonus[];
  icon: string;
}

export type ScalingStat = 'atk' | 'def' | 'hp' | 'spd' | 'enemyMaxHp';
export type TargetType = 'singleEnemy' | 'allEnemies' | 'self' | 'singleAlly' | 'allAllies';

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'atkBar';
  effectId?: string;
  chance: number;
  value?: number;
  duration?: number;
}

export interface SkillUpBonus {
  type: 'damage' | 'effect_rate' | 'cooldown';
  value: number;
}

// Element advantage lookup
export const ELEMENT_ADVANTAGES: Record<Element, Element> = {
  fire: 'wind',
  wind: 'water',
  water: 'fire',
  light: 'dark',
  dark: 'light',
};

// Check element advantage
export function getElementAdvantage(attacker: Element, defender: Element): 'strong' | 'weak' | 'neutral' {
  if (ELEMENT_ADVANTAGES[attacker] === defender) return 'strong';
  if (ELEMENT_ADVANTAGES[defender] === attacker) return 'weak';
  return 'neutral';
}

// Max level by stars
export const MAX_LEVEL_BY_STARS: Record<number, number> = {
  1: 15,
  2: 20,
  3: 25,
  4: 30,
  5: 35,
  6: 40,
};
