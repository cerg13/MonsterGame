import React from 'react';
import type { PlayerRune } from '../../../types/player';
import type { PlayerMonster, MonsterTemplate } from '../../../types/monster';
import { RUNE_SET_INFO } from '../../../utils/runeUtils';
import './Rune.css';

interface RuneEquipModalProps {
  rune: PlayerRune;
  monsters: PlayerMonster[];
  templates: MonsterTemplate[];
  equippedRunes: PlayerRune[];
  onEquip: (runeId: string, monsterId: string) => void;
  onClose: () => void;
}

const elementEmojis: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  wind: '🌪️',
  light: '✨',
  dark: '🌑',
};

export const RuneEquipModal: React.FC<RuneEquipModalProps> = ({
  rune,
  monsters,
  templates,
  equippedRunes,
  onEquip,
  onClose,
}) => {
  const setInfo = RUNE_SET_INFO[rune.setType];

  // Get current rune in same slot for each monster
  const getMonsterSlotRune = (monsterId: string): PlayerRune | undefined => {
    return equippedRunes.find(
      (r) => r.equippedTo === monsterId && r.slot === rune.slot
    );
  };

  // Get template for monster
  const getTemplate = (templateId: string): MonsterTemplate | undefined => {
    return templates.find((t) => t.id === templateId);
  };

  return (
    <div className="rune-equip-modal">
      <div className="rune-equip-header">
        <h3>
          {setInfo.icon} Equip {setInfo.name} Rune (Slot {rune.slot})
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>
          ×
        </button>
      </div>

      <p style={{ color: '#888', marginBottom: '16px', fontSize: '0.9rem' }}>
        Select a monster to equip this rune. Orange border indicates a rune already in this slot.
      </p>

      <div className="monster-select-grid">
        {monsters.map((monster) => {
          const template = getTemplate(monster.templateId);
          if (!template) return null;

          const currentSlotRune = getMonsterSlotRune(monster.id);
          const hasRuneInSlot = !!currentSlotRune;

          return (
            <div
              key={monster.id}
              className={`monster-select-item ${hasRuneInSlot ? 'has-rune' : ''}`}
              onClick={() => {
                onEquip(rune.id, monster.id);
                onClose();
              }}
            >
              <div className="monster-icon">
                {elementEmojis[template.element] || template.name.charAt(0)}
              </div>
              <div className="monster-name">
                {monster.awakened && template.awakenedName ? template.awakenedName : template.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#888' }}>
                Lv. {monster.level} {'★'.repeat(monster.stars)}
              </div>
              {hasRuneInSlot && currentSlotRune && (
                <div className="current-rune">
                  {RUNE_SET_INFO[currentSlotRune.setType].icon} +{currentSlotRune.level}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {monsters.length === 0 && (
        <div className="no-runes">
          <p>No monsters available</p>
        </div>
      )}
    </div>
  );
};

export default RuneEquipModal;
