/**
 * Passive Abilities System
 *
 * Passives trigger automatically based on conditions and provide
 * various effects to the monster or allies.
 */

// When the passive activates
export type PassiveTrigger =
  | 'always'           // Always active (stat bonus)
  | 'battle_start'     // At the start of battle
  | 'turn_start'       // At the start of owner's turn
  | 'turn_end'         // At the end of owner's turn
  | 'on_attack'        // When attacking
  | 'on_hit'           // When taking damage
  | 'on_crit'          // When landing a critical hit
  | 'on_kill'          // When defeating an enemy
  | 'ally_attacked'    // When an ally is attacked
  | 'ally_killed'      // When an ally dies
  | 'enemy_turn_end'   // At the end of any enemy turn
  | 'hp_threshold'     // When HP crosses a threshold
  | 'buff_applied'     // When a buff is applied
  | 'debuff_applied'   // When a debuff is applied to self
  | 'on_revive';       // When revived

// Target of the passive effect
export type PassiveTarget =
  | 'self'
  | 'attacker'         // The monster that attacked (for on_hit)
  | 'target'           // The target of the action
  | 'allies'           // All allies
  | 'allies_except_self'
  | 'enemies'
  | 'random_ally'
  | 'random_enemy'
  | 'lowest_hp_ally'
  | 'lowest_hp_enemy';

// Type of effect the passive provides
export type PassiveEffectType =
  // Stat modifications
  | 'stat_boost'       // Increase a stat (flat or %)
  | 'stat_reduction'   // Reduce enemy stat
  // Combat effects
  | 'damage_boost'     // Increase damage dealt
  | 'damage_reduction' // Reduce damage taken
  | 'lifesteal'        // Heal based on damage dealt
  | 'reflect'          // Reflect damage back
  | 'counter_attack'   // Chance to counter attack
  // ATB effects
  | 'atb_boost'        // Increase ATB
  | 'atb_reduction'    // Reduce enemy ATB
  // Healing effects
  | 'heal'             // Heal HP
  | 'hot'              // Heal over time
  // Status effects
  | 'apply_buff'       // Apply a buff
  | 'apply_debuff'     // Apply a debuff
  | 'cleanse'          // Remove debuffs
  | 'strip'            // Remove enemy buffs
  | 'immunity'         // Grant immunity to debuffs
  // Special effects
  | 'revive'           // Revive with HP
  | 'shield'           // Create damage shield
  | 'extra_turn'       // Grant extra turn
  | 'cooldown_reset';  // Reset skill cooldowns

// Condition for passive activation
export interface PassiveCondition {
  type: 'hp_above' | 'hp_below' | 'buff_count' | 'debuff_count' | 'ally_count' | 'enemy_count' | 'element_match';
  value: number;
  element?: string; // For element_match condition
}

// Passive effect definition
export interface PassiveEffect {
  type: PassiveEffectType;
  target: PassiveTarget;
  value: number;        // Effect value (%, flat, duration, etc.)
  stat?: string;        // For stat modifications
  buffId?: string;      // For apply_buff/debuff
  duration?: number;    // For buffs/debuffs/shields
  chance?: number;      // Activation chance (0-100, default 100)
  maxStacks?: number;   // Maximum stack count
}

// Complete passive ability definition
export interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  trigger: PassiveTrigger;
  conditions?: PassiveCondition[];  // All must be met
  effects: PassiveEffect[];
  cooldown?: number;    // Turns between activations (0 = no cooldown)
  maxActivations?: number; // Max times per battle (0 = unlimited)
  icon: string;
}

// Runtime state of a passive during battle
export interface PassiveState {
  passiveId: string;
  currentCooldown: number;
  activationCount: number;
  stackCount: number;
  isActive: boolean;
}

// Pre-defined passive abilities
export const PASSIVE_ABILITIES: Record<string, PassiveAbility> = {
  // Leader Skills (always active)
  leader_hp_boost: {
    id: 'leader_hp_boost',
    name: 'HP Leader',
    description: 'Increases the HP of all allies by 33%.',
    trigger: 'always',
    effects: [{
      type: 'stat_boost',
      target: 'allies',
      stat: 'hp',
      value: 33,
    }],
    icon: 'leader_hp.png',
  },

  leader_atk_boost: {
    id: 'leader_atk_boost',
    name: 'ATK Leader',
    description: 'Increases the ATK of all allies by 33%.',
    trigger: 'always',
    effects: [{
      type: 'stat_boost',
      target: 'allies',
      stat: 'atk',
      value: 33,
    }],
    icon: 'leader_atk.png',
  },

  leader_spd_boost: {
    id: 'leader_spd_boost',
    name: 'SPD Leader',
    description: 'Increases the SPD of all allies by 24%.',
    trigger: 'always',
    effects: [{
      type: 'stat_boost',
      target: 'allies',
      stat: 'spd',
      value: 24,
    }],
    icon: 'leader_spd.png',
  },

  // Combat passives
  elemental_king: {
    id: 'elemental_king',
    name: 'Elemental King',
    description: 'Increases damage dealt to enemies with elemental disadvantage by 50%.',
    trigger: 'on_attack',
    effects: [{
      type: 'damage_boost',
      target: 'self',
      value: 50,
    }],
    icon: 'elemental_king.png',
  },

  iron_will: {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Reduces damage taken by 15%.',
    trigger: 'always',
    effects: [{
      type: 'damage_reduction',
      target: 'self',
      value: 15,
    }],
    icon: 'iron_will.png',
  },

  vampiric_touch: {
    id: 'vampiric_touch',
    name: 'Vampiric Touch',
    description: 'Heals for 20% of damage dealt.',
    trigger: 'on_attack',
    effects: [{
      type: 'lifesteal',
      target: 'self',
      value: 20,
    }],
    icon: 'vampiric_touch.png',
  },

  counter_strike: {
    id: 'counter_strike',
    name: 'Counter Strike',
    description: '25% chance to counter when attacked.',
    trigger: 'on_hit',
    effects: [{
      type: 'counter_attack',
      target: 'attacker',
      value: 100, // damage %
      chance: 25,
    }],
    icon: 'counter_strike.png',
  },

  revenge: {
    id: 'revenge',
    name: 'Revenge',
    description: 'Increases ATK by 10% for each dead ally (max 30%).',
    trigger: 'ally_killed',
    effects: [{
      type: 'stat_boost',
      target: 'self',
      stat: 'atk',
      value: 10,
      maxStacks: 3,
    }],
    icon: 'revenge.png',
  },

  regeneration: {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Heals 10% of max HP at the start of each turn.',
    trigger: 'turn_start',
    effects: [{
      type: 'heal',
      target: 'self',
      value: 10, // % of max HP
    }],
    icon: 'regeneration.png',
  },

  berserk: {
    id: 'berserk',
    name: 'Berserk',
    description: 'Increases ATK by 30% when HP drops below 30%.',
    trigger: 'hp_threshold',
    conditions: [{
      type: 'hp_below',
      value: 30,
    }],
    effects: [{
      type: 'stat_boost',
      target: 'self',
      stat: 'atk',
      value: 30,
    }],
    icon: 'berserk.png',
  },

  guardian_angel: {
    id: 'guardian_angel',
    name: 'Guardian Angel',
    description: 'Revives once with 30% HP when killed.',
    trigger: 'on_revive',
    effects: [{
      type: 'revive',
      target: 'self',
      value: 30, // % HP
    }],
    maxActivations: 1,
    icon: 'guardian_angel.png',
  },

  team_shield: {
    id: 'team_shield',
    name: 'Team Shield',
    description: 'Grants all allies a shield equal to 10% of max HP at battle start.',
    trigger: 'battle_start',
    effects: [{
      type: 'shield',
      target: 'allies',
      value: 10, // % of max HP
      duration: 3,
    }],
    icon: 'team_shield.png',
  },

  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Gains 20% ATB when an enemy ends their turn.',
    trigger: 'enemy_turn_end',
    effects: [{
      type: 'atb_boost',
      target: 'self',
      value: 20,
    }],
    icon: 'speed_demon.png',
  },

  cleansing_aura: {
    id: 'cleansing_aura',
    name: 'Cleansing Aura',
    description: 'Removes 1 harmful effect from all allies at the start of turn.',
    trigger: 'turn_start',
    effects: [{
      type: 'cleanse',
      target: 'allies',
      value: 1, // Number of effects to cleanse
    }],
    cooldown: 2,
    icon: 'cleansing_aura.png',
  },

  intimidate: {
    id: 'intimidate',
    name: 'Intimidate',
    description: 'Reduces enemy ATK by 10% at battle start.',
    trigger: 'battle_start',
    effects: [{
      type: 'stat_reduction',
      target: 'enemies',
      stat: 'atk',
      value: 10,
    }],
    icon: 'intimidate.png',
  },

  thorns: {
    id: 'thorns',
    name: 'Thorns',
    description: 'Reflects 15% of damage taken back to attacker.',
    trigger: 'on_hit',
    effects: [{
      type: 'reflect',
      target: 'attacker',
      value: 15,
    }],
    icon: 'thorns.png',
  },

  executioner: {
    id: 'executioner',
    name: 'Executioner',
    description: 'Deals 50% increased damage to enemies below 30% HP.',
    trigger: 'on_attack',
    conditions: [{
      type: 'hp_below',
      value: 30,
    }],
    effects: [{
      type: 'damage_boost',
      target: 'self',
      value: 50,
    }],
    icon: 'executioner.png',
  },
};

// Get passive by ID
export function getPassiveAbility(id: string): PassiveAbility | undefined {
  return PASSIVE_ABILITIES[id];
}
