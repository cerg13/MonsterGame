import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store';
import { RuneInventory, RuneDetail, RuneEquipModal, RuneCard } from '../components/ui/Rune';
import { MONSTER_TEMPLATES } from '../data/monsters';
import type { PlayerRune } from '../types/player';
import type { PlayerMonster } from '../types/monster';
import { RUNE_SET_INFO, generateRandomRune } from '../utils/runeUtils';
import '../components/ui/Rune/Rune.css';

type TabType = 'inventory' | 'manage';

export const RuneScreen: React.FC = () => {
  const navigate = useNavigate();

  // Store state
  const player = usePlayerStore((state) => state.player);
  const monsters = usePlayerStore((state) => state.monsters);
  const runes = usePlayerStore((state) => state.runes);
  const equipRune = usePlayerStore((state) => state.equipRune);
  const unequipRune = usePlayerStore((state) => state.unequipRune);
  const updateRune = usePlayerStore((state) => state.updateRune);
  const sellRune = usePlayerStore((state) => state.sellRune);
  const addRune = usePlayerStore((state) => state.addRune);

  // Local state
  const [activeTab, setActiveTab] = useState<TabType>('inventory');
  const [selectedRune, setSelectedRune] = useState<PlayerRune | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(
    monsters.length > 0 ? monsters[0].id : null
  );

  // Get runes for selected monster
  const selectedMonster = useMemo(() => {
    return monsters.find((m) => m.id === selectedMonsterId);
  }, [monsters, selectedMonsterId]);

  const selectedMonsterTemplate = useMemo(() => {
    if (!selectedMonster) return null;
    return MONSTER_TEMPLATES.find((t) => t.id === selectedMonster.templateId);
  }, [selectedMonster]);

  const monsterRunes = useMemo(() => {
    if (!selectedMonsterId) return [];
    return runes.filter((r) => r.equippedTo === selectedMonsterId);
  }, [runes, selectedMonsterId]);

  // Calculate active set bonuses for selected monster
  const activeSetBonuses = useMemo(() => {
    const setCounts: Record<string, number> = {};
    for (const rune of monsterRunes) {
      setCounts[rune.setType] = (setCounts[rune.setType] || 0) + 1;
    }

    const bonuses: { setType: string; count: number; active: boolean }[] = [];
    for (const [setType, count] of Object.entries(setCounts)) {
      bonuses.push({
        setType,
        count,
        active: count >= 2,
      });
    }

    return bonuses;
  }, [monsterRunes]);

  // Handlers
  const handleRuneClick = (rune: PlayerRune) => {
    setSelectedRune(rune);
    setShowDetailModal(true);
  };

  const handleUpgrade = (runeId: string, newRune: PlayerRune) => {
    updateRune(runeId, {
      level: newRune.level,
      mainStatValue: newRune.mainStatValue,
      subStats: newRune.subStats,
    });
    setSelectedRune(newRune);
  };

  const handleEquipStart = (runeId: string) => {
    const rune = runes.find((r) => r.id === runeId);
    if (rune) {
      setSelectedRune(rune);
      setShowDetailModal(false);
      setShowEquipModal(true);
    }
  };

  const handleEquip = (runeId: string, monsterId: string) => {
    equipRune(runeId, monsterId);
    setShowEquipModal(false);
  };

  const handleUnequip = (runeId: string) => {
    unequipRune(runeId);
    setShowDetailModal(false);
  };

  const handleSell = (runeId: string) => {
    const goldGained = sellRune(runeId);
    setShowDetailModal(false);
    setSelectedRune(null);
    // Could show notification here
    console.log(`Sold rune for ${goldGained} gold`);
  };

  const handleSlotClick = (slot: 1 | 2 | 3 | 4) => {
    const runeInSlot = monsterRunes.find((r) => r.slot === slot);
    if (runeInSlot) {
      setSelectedRune(runeInSlot);
      setShowDetailModal(true);
    } else {
      // Show available runes for this slot
      // For now, just open equip modal with filtered runes
      // This would need more implementation
    }
  };

  // Debug: Add random runes button
  const handleAddRandomRunes = () => {
    for (let i = 0; i < 5; i++) {
      const stars = (Math.floor(Math.random() * 4) + 3) as 3 | 4 | 5 | 6;
      const rune = generateRandomRune(stars);
      addRune(rune);
    }
  };

  return (
    <div className="rune-screen">
      {/* Header */}
      <div className="rune-screen-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Runes</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#ffd700' }}>🪙 {player?.gold?.toLocaleString() || 0}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="rune-screen-tabs">
        <button
          className={`rune-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory ({runes.length})
        </button>
        <button
          className={`rune-tab ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Runes
        </button>
      </div>

      {/* Content */}
      <div className="rune-screen-content">
        {activeTab === 'inventory' && (
          <>
            {/* Debug button - remove in production */}
            {runes.length === 0 && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                  onClick={handleAddRandomRunes}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #4a90d9, #1565c0)',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  + Add Random Runes (Debug)
                </button>
              </div>
            )}

            <RuneInventory
              runes={runes}
              onRuneClick={handleRuneClick}
              selectedRuneId={selectedRune?.id}
              showEfficiency
            />
          </>
        )}

        {activeTab === 'manage' && (
          <div className="monster-rune-view">
            {/* Monster selector */}
            <div className="monster-selector">
              {monsters.map((monster) => {
                const template = MONSTER_TEMPLATES.find((t) => t.id === monster.templateId);
                if (!template) return null;

                const isSelected = selectedMonsterId === monster.id;
                return (
                  <div
                    key={monster.id}
                    className={`monster-select-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedMonsterId(monster.id)}
                    style={{
                      minWidth: '100px',
                      border: isSelected ? '2px solid #4a90d9' : '2px solid #3a3a5e',
                    }}
                  >
                    <div className="monster-icon">
                      {template.name.charAt(0)}
                    </div>
                    <div className="monster-name" style={{ fontSize: '0.75rem' }}>
                      {monster.awakened && template.awakenedName ? template.awakenedName : template.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedMonster && selectedMonsterTemplate ? (
              <>
                {/* Monster info */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <h2 style={{ margin: '0 0 4px', color: '#fff' }}>
                    {selectedMonster.awakened && selectedMonsterTemplate.awakenedName
                      ? selectedMonsterTemplate.awakenedName
                      : selectedMonsterTemplate.name}
                  </h2>
                  <span style={{ color: '#888' }}>
                    Lv. {selectedMonster.level} {'★'.repeat(selectedMonster.stars)}
                  </span>
                </div>

                {/* Rune slots */}
                <div className="monster-rune-slots">
                  {([1, 2, 3, 4] as const).map((slot) => {
                    const runeInSlot = monsterRunes.find((r) => r.slot === slot);

                    return (
                      <div
                        key={slot}
                        className={`rune-slot ${runeInSlot ? 'filled' : ''}`}
                        onClick={() => handleSlotClick(slot)}
                      >
                        {runeInSlot ? (
                          <RuneCard rune={runeInSlot} compact />
                        ) : (
                          <>
                            <span className="slot-number">{slot}</span>
                            <span className="empty-text">Empty</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Set bonuses */}
                <div className="active-set-bonuses">
                  <h3>Set Bonuses</h3>
                  {activeSetBonuses.length > 0 ? (
                    <div className="set-bonus-list">
                      {activeSetBonuses.map((bonus) => {
                        const setInfo = RUNE_SET_INFO[bonus.setType as keyof typeof RUNE_SET_INFO];
                        return (
                          <div
                            key={bonus.setType}
                            className={`set-bonus-tag ${bonus.active ? '' : 'inactive'}`}
                            style={{ borderColor: setInfo.color }}
                          >
                            <span>{setInfo.icon}</span>
                            <span>{setInfo.name}</span>
                            <span>({bonus.count}/2)</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>No runes equipped</p>
                  )}
                </div>
              </>
            ) : (
              <div className="no-runes">
                <p>No monsters available</p>
                <p style={{ fontSize: '0.85rem' }}>Summon some monsters first!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRune && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '16px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <RuneDetail
              rune={selectedRune}
              playerGold={player?.gold || 0}
              onUpgrade={handleUpgrade}
              onEquip={handleEquipStart}
              onUnequip={handleUnequip}
              onSell={handleSell}
              onClose={() => setShowDetailModal(false)}
            />
          </div>
        </div>
      )}

      {/* Equip Modal */}
      {showEquipModal && selectedRune && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowEquipModal(false)}
        >
          <div
            style={{
              background: '#1a1a2e',
              borderRadius: '16px',
              padding: '20px',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <RuneEquipModal
              rune={selectedRune}
              monsters={monsters}
              templates={MONSTER_TEMPLATES}
              equippedRunes={runes}
              onEquip={handleEquip}
              onClose={() => setShowEquipModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RuneScreen;
