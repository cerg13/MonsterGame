import React, { useState } from 'react';
import type { PlayerMonster } from '../../types/player';
import { getMonsterTemplate } from '../../data/monsters';
import './MonsterQuickActions.css';

interface MonsterQuickActionsProps {
  selectedMonsters: string[];
  allMonsters: PlayerMonster[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSelectByFilter: (filterFn: (monster: PlayerMonster) => boolean) => void;
  onBulkLock: () => void;
  onBulkUnlock: () => void;
  onBulkDelete: () => void;
  onBulkFeed?: (targetId: string, fodderIds: string[]) => void;
}

export const MonsterQuickActions: React.FC<MonsterQuickActionsProps> = ({
  selectedMonsters,
  allMonsters,
  onSelectAll,
  onDeselectAll,
  onSelectByFilter,
  onBulkLock,
  onBulkUnlock,
  onBulkDelete,
  onBulkFeed,
}) => {
  const [activeMode, setActiveMode] = useState<'select' | 'action' | null>(null);
  const [feedTargetId, setFeedTargetId] = useState<string | null>(null);

  const selectedCount = selectedMonsters.length;
  const totalCount = allMonsters.length;

  // Count selected by type
  const selectedStats = {
    locked: selectedMonsters.filter(id => {
      const m = allMonsters.find(monster => monster.id === id);
      return m?.locked;
    }).length,
    unlocked: selectedMonsters.filter(id => {
      const m = allMonsters.find(monster => monster.id === id);
      return !m?.locked;
    }).length,
    common: selectedMonsters.filter(id => {
      const m = allMonsters.find(monster => monster.id === id);
      const template = m ? getMonsterTemplate(m.templateId) : null;
      return template?.rarity === 'common';
    }).length,
    rare: selectedMonsters.filter(id => {
      const m = allMonsters.find(monster => monster.id === id);
      const template = m ? getMonsterTemplate(m.templateId) : null;
      return template?.rarity === 'rare';
    }).length,
  };

  // Quick select filters
  const quickFilters = [
    {
      id: 'common',
      label: 'All Common',
      icon: '⚪',
      filter: (m: PlayerMonster) => {
        const template = getMonsterTemplate(m.templateId);
        return template?.rarity === 'common';
      },
    },
    {
      id: 'rare',
      label: 'All Rare',
      icon: '🟢',
      filter: (m: PlayerMonster) => {
        const template = getMonsterTemplate(m.templateId);
        return template?.rarity === 'rare';
      },
    },
    {
      id: 'level1',
      label: 'Level 1',
      icon: '1️⃣',
      filter: (m: PlayerMonster) => m.level === 1,
    },
    {
      id: 'maxlevel',
      label: 'Max Level',
      icon: '⬆️',
      filter: (m: PlayerMonster) => m.level === (m.stars === 6 ? 40 : m.stars * 5),
    },
    {
      id: 'unlocked',
      label: 'Unlocked',
      icon: '🔓',
      filter: (m: PlayerMonster) => !m.locked,
    },
    {
      id: 'locked',
      label: 'Locked',
      icon: '🔒',
      filter: (m: PlayerMonster) => m.locked === true,
    },
    {
      id: '3star',
      label: '3★ or less',
      icon: '⭐',
      filter: (m: PlayerMonster) => m.stars <= 3,
    },
  ];

  const handleQuickFilter = (filterFn: (monster: PlayerMonster) => boolean) => {
    onSelectByFilter(filterFn);
    setActiveMode(null);
  };

  const handleBulkFeedConfirm = () => {
    if (!feedTargetId || !onBulkFeed) return;

    const fodderIds = selectedMonsters.filter(id => id !== feedTargetId);
    if (fodderIds.length === 0) {
      alert('Please select monsters to use as fodder');
      return;
    }

    const target = allMonsters.find(m => m.id === feedTargetId);
    const targetTemplate = target ? getMonsterTemplate(target.templateId) : null;

    if (confirm(`Feed ${fodderIds.length} monsters to ${targetTemplate?.name}?`)) {
      onBulkFeed(feedTargetId, fodderIds);
      setFeedTargetId(null);
      setActiveMode(null);
    }
  };

  if (selectedCount === 0) {
    return (
      <div className="quick-actions-empty">
        <div className="empty-icon">👆</div>
        <p className="empty-text">Select monsters to use quick actions</p>
        <button className="quick-action-btn select-all" onClick={onSelectAll}>
          <span className="btn-icon">☑️</span>
          Select All ({totalCount})
        </button>
      </div>
    );
  }

  return (
    <div className="monster-quick-actions">
      {/* Header */}
      <div className="actions-header">
        <div className="selection-info">
          <span className="selected-count">{selectedCount}</span>
          <span className="count-separator">/</span>
          <span className="total-count">{totalCount}</span>
          <span className="selection-label">selected</span>
        </div>
        <button className="deselect-btn" onClick={onDeselectAll}>
          <span className="btn-icon">✖️</span>
          Clear
        </button>
      </div>

      {/* Selection Stats */}
      <div className="selection-stats">
        <div className="stat-badge">
          <span className="stat-icon">🔒</span>
          <span className="stat-value">{selectedStats.locked}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-icon">🔓</span>
          <span className="stat-value">{selectedStats.unlocked}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-icon">⚪</span>
          <span className="stat-value">{selectedStats.common}</span>
        </div>
        <div className="stat-badge">
          <span className="stat-icon">🟢</span>
          <span className="stat-value">{selectedStats.rare}</span>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="action-modes">
        <button
          className={`mode-btn ${activeMode === 'select' ? 'active' : ''}`}
          onClick={() => setActiveMode(activeMode === 'select' ? null : 'select')}
        >
          <span className="mode-icon">🎯</span>
          Quick Select
        </button>
        <button
          className={`mode-btn ${activeMode === 'action' ? 'active' : ''}`}
          onClick={() => setActiveMode(activeMode === 'action' ? null : 'action')}
        >
          <span className="mode-icon">⚡</span>
          Bulk Actions
        </button>
      </div>

      {/* Quick Select Panel */}
      {activeMode === 'select' && (
        <div className="quick-select-panel">
          <h4 className="panel-title">🎯 Quick Select Filters</h4>
          <div className="filter-grid">
            {quickFilters.map(filter => (
              <button
                key={filter.id}
                className="filter-btn"
                onClick={() => handleQuickFilter(filter.filter)}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
              </button>
            ))}
          </div>
          <div className="panel-actions">
            <button className="select-all-btn" onClick={onSelectAll}>
              ☑️ Select All
            </button>
            <button className="deselect-all-btn" onClick={onDeselectAll}>
              ✖️ Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions Panel */}
      {activeMode === 'action' && (
        <div className="bulk-actions-panel">
          <h4 className="panel-title">⚡ Bulk Operations</h4>

          <div className="action-buttons">
            {/* Lock/Unlock */}
            {selectedStats.unlocked > 0 && (
              <button className="action-btn lock-btn" onClick={onBulkLock}>
                <span className="btn-icon">🔒</span>
                <div className="btn-content">
                  <span className="btn-label">Lock</span>
                  <span className="btn-count">{selectedStats.unlocked} monsters</span>
                </div>
              </button>
            )}

            {selectedStats.locked > 0 && (
              <button className="action-btn unlock-btn" onClick={onBulkUnlock}>
                <span className="btn-icon">🔓</span>
                <div className="btn-content">
                  <span className="btn-label">Unlock</span>
                  <span className="btn-count">{selectedStats.locked} monsters</span>
                </div>
              </button>
            )}

            {/* Feed */}
            {onBulkFeed && selectedCount >= 2 && (
              <div className="feed-action">
                {!feedTargetId ? (
                  <button
                    className="action-btn feed-btn"
                    onClick={() => {
                      const firstSelected = selectedMonsters[0];
                      setFeedTargetId(firstSelected);
                    }}
                  >
                    <span className="btn-icon">🍖</span>
                    <div className="btn-content">
                      <span className="btn-label">Bulk Feed</span>
                      <span className="btn-count">Power up with {selectedCount - 1} fodder</span>
                    </div>
                  </button>
                ) : (
                  <div className="feed-target-selector">
                    <p className="feed-instruction">Select target monster to power up:</p>
                    <select
                      className="target-select"
                      value={feedTargetId}
                      onChange={(e) => setFeedTargetId(e.target.value)}
                    >
                      {selectedMonsters.map(id => {
                        const monster = allMonsters.find(m => m.id === id);
                        const template = monster ? getMonsterTemplate(monster.templateId) : null;
                        return (
                          <option key={id} value={id}>
                            {template?.name} (Lv.{monster?.level} ⭐{monster?.stars})
                          </option>
                        );
                      })}
                    </select>
                    <div className="feed-actions">
                      <button className="confirm-feed-btn" onClick={handleBulkFeedConfirm}>
                        ✓ Confirm Feed
                      </button>
                      <button className="cancel-feed-btn" onClick={() => setFeedTargetId(null)}>
                        ✖ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delete */}
            {selectedStats.unlocked > 0 && (
              <button className="action-btn delete-btn" onClick={onBulkDelete}>
                <span className="btn-icon">🗑️</span>
                <div className="btn-content">
                  <span className="btn-label">Delete</span>
                  <span className="btn-count">{selectedStats.unlocked} unlocked monsters</span>
                </div>
              </button>
            )}
          </div>

          {selectedStats.locked > 0 && selectedStats.locked === selectedCount && (
            <div className="warning-message">
              ⚠️ All selected monsters are locked. Unlock them first to delete.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MonsterQuickActions;
