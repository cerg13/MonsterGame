import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store';
import { Button, Badge } from '../components/common';
import { SearchBar } from '../components/common/SearchBar';
import { RuneFilterPanel, type RuneFilters } from '../components/common/RuneFilterPanel';
import type { PlayerRune } from '../types/player';
import { RUNE_SET_INFO } from '../utils/runeUtils';
import './ImprovedRuneScreen.css';

type SortField = 'level' | 'stars' | 'set' | 'slot' | 'mainStat';
type SortDirection = 'asc' | 'desc';

const DEFAULT_FILTERS: RuneFilters = {
  sets: [],
  slots: [],
  minStars: 1,
  maxStars: 6,
  minLevel: 0,
  maxLevel: 15,
  equipped: 'all',
  locked: 'all',
  mainStats: [],
};

export const ImprovedRuneScreen: React.FC = () => {
  const navigate = useNavigate();
  const { player, runes, monsters, sellRune, toggleRuneLock } = usePlayerStore();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RuneFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('stars');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRunes, setSelectedRunes] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filter runes
  const filteredRunes = useMemo(() => {
    let result = runes;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) =>
        r.setType.toLowerCase().includes(query) ||
        r.mainStat.toLowerCase().includes(query) ||
        r.subStats.some(s => s.stat.toLowerCase().includes(query))
      );
    }

    // Set filter
    if (filters.sets.length > 0) {
      result = result.filter(r => (filters.sets as string[]).includes(r.setType));
    }

    // Slot filter
    if (filters.slots.length > 0) {
      result = result.filter(r => filters.slots.includes(r.slot));
    }

    // Stars filter
    result = result.filter(r => r.stars >= filters.minStars && r.stars <= filters.maxStars);

    // Level filter
    result = result.filter(r => r.level >= filters.minLevel && r.level <= filters.maxLevel);

    // Equipped filter
    if (filters.equipped !== 'all') {
      const isEquipped = (r: PlayerRune) => r.equippedTo !== null;
      result = result.filter(r => filters.equipped === 'yes' ? isEquipped(r) : !isEquipped(r));
    }

    // Locked filter
    if (filters.locked !== 'all') {
      result = result.filter(r => filters.locked === 'yes' ? r.locked : !r.locked);
    }

    // Main stat filter
    if (filters.mainStats.length > 0) {
      result = result.filter(r => filters.mainStats.includes(r.mainStat));
    }

    return result;
  }, [runes, searchQuery, filters]);

  // Sort runes
  const sortedRunes = useMemo(() => {
    const sorted = [...filteredRunes];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'stars':
          comparison = a.stars - b.stars;
          break;
        case 'set':
          comparison = a.setType.localeCompare(b.setType);
          break;
        case 'slot':
          comparison = a.slot - b.slot;
          break;
        case 'mainStat':
          comparison = a.mainStat.localeCompare(b.mainStat);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredRunes, sortField, sortDirection]);

  const toggleRuneSelection = (runeId: string) => {
    setSelectedRunes((prev) =>
      prev.includes(runeId)
        ? prev.filter(id => id !== runeId)
        : [...prev, runeId]
    );
  };

  const selectAll = () => {
    setSelectedRunes(sortedRunes.map(r => r.id));
  };

  const deselectAll = () => {
    setSelectedRunes([]);
  };

  const handleBatchLock = () => {
    selectedRunes.forEach(id => toggleRuneLock(id));
    deselectAll();
  };

  const handleBatchSell = () => {
    if (confirm(`Sell ${selectedRunes.length} runes? This cannot be undone.`)) {
      let totalGold = 0;
      selectedRunes.forEach(id => {
        const rune = runes.find(r => r.id === id);
        if (rune && !rune.locked && !rune.equippedTo) {
          totalGold += sellRune(id);
        }
      });
      alert(`Sold runes for ${totalGold.toLocaleString()} gold!`);
      deselectAll();
    }
  };

  const getRuneValue = (rune: PlayerRune): number => {
    const baseValue = 100 * rune.stars;
    const levelBonus = rune.level * 50;
    return baseValue + levelBonus;
  };

  const getEquippedMonsterName = (runeId: string): string => {
    const rune = runes.find(r => r.id === runeId);
    if (!rune?.equippedTo) return '';
    const monster = monsters.find(m => m.id === rune.equippedTo);
    return monster ? `Equipped` : '';
  };

  return (
    <div className="improved-rune-screen">
      {/* Header */}
      <div className="rune-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Rune Management</h1>
        <div className="rune-count">
          <span>{sortedRunes.length}</span>
          <span className="count-separator">/</span>
          <span>{runes.length}</span>
        </div>
      </div>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search runes by set, main stat, sub stats..."
      />

      {/* Toolbar */}
      <div className="rune-toolbar">
        <div className="toolbar-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters {(filters.sets.length > 0 || filters.slots.length > 0 || filters.mainStats.length > 0) && '(Active)'}
          </Button>
          {selectedRunes.length > 0 && (
            <>
              <Button variant="primary" size="sm" onClick={handleBatchLock}>
                🔒 Lock ({selectedRunes.length})
              </Button>
              <Button variant="danger" size="sm" onClick={handleBatchSell}>
                💰 Sell ({selectedRunes.length})
              </Button>
            </>
          )}
        </div>
        <div className="toolbar-right">
          <select
            className="sort-select"
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
              setSortField(field);
              setSortDirection(direction);
            }}
          >
            <option value="stars-desc">Stars (High → Low)</option>
            <option value="stars-asc">Stars (Low → High)</option>
            <option value="level-desc">Level (High → Low)</option>
            <option value="level-asc">Level (Low → High)</option>
            <option value="set-asc">Set (A → Z)</option>
            <option value="slot-asc">Slot (1 → 6)</option>
            <option value="mainStat-asc">Main Stat (A → Z)</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <RuneFilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      )}

      {/* Batch Action Bar */}
      {selectedRunes.length > 0 && (
        <div className="batch-action-bar">
          <div className="batch-info">
            {selectedRunes.length} selected • {selectedRunes.reduce((sum, id) => {
              const rune = runes.find(r => r.id === id);
              return sum + (rune ? getRuneValue(rune) : 0);
            }, 0).toLocaleString()} gold value
          </div>
          <div className="batch-buttons">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* Rune Grid */}
      <div className="runes-grid">
        {sortedRunes.length === 0 ? (
          <div className="no-runes">
            <span className="no-runes-icon">📦</span>
            <p>No runes found</p>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          sortedRunes.map((rune) => {
            const setInfo = RUNE_SET_INFO[rune.setType] || { name: rune.setType, color: '#888' };
            const isSelected = selectedRunes.includes(rune.id);
            const equippedTo = getEquippedMonsterName(rune.id);

            return (
              <div
                key={rune.id}
                className={`rune-card ${isSelected ? 'selected' : ''} ${rune.locked ? 'locked' : ''}`}
                onClick={(e) => {
                  if (e.shiftKey || selectedRunes.length > 0) {
                    toggleRuneSelection(rune.id);
                  } else {
                    // Navigate to rune detail
                    navigate(`/rune/${rune.id}`);
                  }
                }}
                style={{ '--set-color': setInfo.color } as React.CSSProperties}
              >
                <div className="rune-card-header">
                  <span className="rune-slot">Slot {rune.slot}</span>
                  <div className="rune-stars">
                    {'★'.repeat(rune.stars)}
                  </div>
                  {rune.locked && <span className="lock-icon">🔒</span>}
                </div>

                <div className="rune-set-badge" style={{ background: setInfo.color }}>
                  {setInfo.name}
                </div>

                <div className="rune-level">+{rune.level}</div>

                <div className="rune-main-stat">
                  <span className="stat-label">Main</span>
                  <span className="stat-value">{rune.mainStat} +{rune.mainStatValue}</span>
                </div>

                <div className="rune-sub-stats">
                  {rune.subStats.map((sub, idx) => (
                    <div key={idx} className="sub-stat">
                      <span className="sub-stat-name">{sub.stat}</span>
                      <span className="sub-stat-value">+{sub.value}</span>
                    </div>
                  ))}
                </div>

                {equippedTo && (
                  <Badge variant="success" className="equipped-badge">
                    {equippedTo}
                  </Badge>
                )}

                <div className="rune-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRuneLock(rune.id);
                    }}
                    title={rune.locked ? 'Unlock' : 'Lock'}
                  >
                    {rune.locked ? '🔓' : '🔒'}
                  </button>
                  <button
                    className="action-btn sell"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!rune.locked && !rune.equippedTo) {
                        setConfirmDelete(rune.id);
                      }
                    }}
                    title="Sell"
                    disabled={rune.locked || !!rune.equippedTo}
                  >
                    💰
                  </button>
                </div>

                <div className="rune-value">
                  {getRuneValue(rune).toLocaleString()} 🪙
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Sell Rune?</h3>
            <p>You will receive {getRuneValue(runes.find(r => r.id === confirmDelete)!).toLocaleString()} gold</p>
            <div className="modal-buttons">
              <Button
                variant="danger"
                onClick={() => {
                  sellRune(confirmDelete);
                  setConfirmDelete(null);
                }}
              >
                Sell
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedRuneScreen;
