import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store';
import { getMonsterTemplate } from '../data/monsters';
import { calculateMonsterStats } from '../utils/statCalculator';
import {
  Button,
  Panel,
  Badge,
  Modal,
  ElementIcon,
  StarRating,
} from '../components/common';
import { FilterPanel, type MonsterFilters } from '../components/common/FilterPanel';
import { SearchBar } from '../components/common/SearchBar';
import { MonsterCodex } from '../components/collection';
import type { PlayerMonster } from '../types/player';
import type { Element } from '../types/monster';
import './MonstersScreen.css';

type SortField = 'level' | 'stars' | 'element' | 'name' | 'power' | 'obtained';
type SortDirection = 'asc' | 'desc';

const DEFAULT_FILTERS: MonsterFilters = {
  elements: [],
  rarities: [],
  minLevel: 1,
  maxLevel: 40,
  minStars: 1,
  maxStars: 6,
  awakened: 'all',
  locked: 'all',
  hasRunes: 'all',
  inStorage: 'all',
};

type TabType = 'monsters' | 'codex';

export const MonstersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { monsters, runes, toggleMonsterLock, removeMonster } = usePlayerStore();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('monsters');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<MonsterFilters>(DEFAULT_FILTERS);
  const [sortField, setSortField] = useState<SortField>('stars');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMonsters, setSelectedMonsters] = useState<string[]>([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Filter and sort monsters
  const filteredMonsters = useMemo(() => {
    let result = monsters;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((m) => {
        const template = getMonsterTemplate(m.templateId);
        if (!template) return false;
        return (
          template.name.toLowerCase().includes(query) ||
          (m.awakened && template.awakenedName?.toLowerCase().includes(query)) ||
          template.element.includes(query)
        );
      });
    }

    // Element filter
    if (filters.elements.length > 0) {
      result = result.filter((m) => {
        const template = getMonsterTemplate(m.templateId);
        return template && filters.elements.includes(template.element);
      });
    }

    // Rarity filter
    if (filters.rarities.length > 0) {
      result = result.filter((m) => {
        const template = getMonsterTemplate(m.templateId);
        return template && filters.rarities.includes(template.rarity);
      });
    }

    // Level filter
    result = result.filter(
      (m) => m.level >= filters.minLevel && m.level <= filters.maxLevel
    );

    // Stars filter
    result = result.filter(
      (m) => m.stars >= filters.minStars && m.stars <= filters.maxStars
    );

    // Awakened filter
    if (filters.awakened !== 'all') {
      result = result.filter((m) =>
        filters.awakened === 'yes' ? m.awakened : !m.awakened
      );
    }

    // Locked filter
    if (filters.locked !== 'all') {
      result = result.filter((m) =>
        filters.locked === 'yes' ? m.locked : !m.locked
      );
    }

    // Runes filter
    if (filters.hasRunes !== 'all') {
      result = result.filter((m) => {
        const hasRunes = runes.some((r) => r.equippedTo === m.id);
        return filters.hasRunes === 'yes' ? hasRunes : !hasRunes;
      });
    }

    // Storage filter (if implemented)
    if (filters.inStorage !== 'all') {
      // Assuming inStorage is a property on PlayerMonster
      // result = result.filter((m) =>
      //   filters.inStorage === 'yes' ? m.inStorage : !m.inStorage
      // );
    }

    return result;
  }, [monsters, runes, searchQuery, filters]);

  // Sort monsters
  const sortedMonsters = useMemo(() => {
    const sorted = [...filteredMonsters];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'stars':
          comparison = a.stars - b.stars;
          break;
        case 'element': {
          const templateA = getMonsterTemplate(a.templateId);
          const templateB = getMonsterTemplate(b.templateId);
          comparison = (templateA?.element || '').localeCompare(templateB?.element || '');
          break;
        }
        case 'name': {
          const templateA = getMonsterTemplate(a.templateId);
          const templateB = getMonsterTemplate(b.templateId);
          const nameA = a.awakened && templateA?.awakenedName ? templateA.awakenedName : templateA?.name || '';
          const nameB = b.awakened && templateB?.awakenedName ? templateB.awakenedName : templateB?.name || '';
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'power': {
          const templateA = getMonsterTemplate(a.templateId);
          const templateB = getMonsterTemplate(b.templateId);
          if (!templateA || !templateB) break;
          const runesA = runes.filter((r) => r.equippedTo === a.id);
          const runesB = runes.filter((r) => r.equippedTo === b.id);
          const statsA = calculateMonsterStats(templateA, a, runesA);
          const statsB = calculateMonsterStats(templateB, b, runesB);
          const powerA = statsA.hp + statsA.atk * 5 + statsA.def * 3 + statsA.spd * 10;
          const powerB = statsB.hp + statsB.atk * 5 + statsB.def * 3 + statsB.spd * 10;
          comparison = powerA - powerB;
          break;
        }
        case 'obtained':
          comparison = a.obtainedAt.getTime() - b.obtainedAt.getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredMonsters, sortField, sortDirection, runes]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const toggleMonsterSelection = (monsterId: string) => {
    setSelectedMonsters((prev) =>
      prev.includes(monsterId)
        ? prev.filter((id) => id !== monsterId)
        : [...prev, monsterId]
    );
  };

  const selectAll = () => {
    setSelectedMonsters(sortedMonsters.map((m) => m.id));
  };

  const deselectAll = () => {
    setSelectedMonsters([]);
  };

  const handleBatchLock = () => {
    selectedMonsters.forEach((id) => toggleMonsterLock(id));
    setShowBatchActions(false);
    deselectAll();
  };

  const handleBatchDelete = () => {
    if (confirm(`Delete ${selectedMonsters.length} monsters? This cannot be undone.`)) {
      selectedMonsters.forEach((id) => {
        const monster = monsters.find((m) => m.id === id);
        if (monster && !monster.locked) {
          removeMonster(id);
        }
      });
      setShowBatchActions(false);
      deselectAll();
    }
  };

  const handleDeleteMonster = (monsterId: string) => {
    const monster = monsters.find((m) => m.id === monsterId);
    if (monster?.locked) {
      alert('Cannot delete locked monster. Unlock it first.');
      return;
    }
    removeMonster(monsterId);
    setConfirmDelete(null);
  };

  return (
    <div className="monsters-screen">
      {/* Header */}
      <div className="monsters-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Monster Box</h1>
        <div className="monster-count">
          <span>{sortedMonsters.length}</span>
          <span className="count-separator">/</span>
          <span>{monsters.length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="monster-tabs">
        <button
          className={`tab-button ${activeTab === 'monsters' ? 'active' : ''}`}
          onClick={() => setActiveTab('monsters')}
        >
          <span className="tab-icon">👾</span>
          <span>My Monsters</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'codex' ? 'active' : ''}`}
          onClick={() => setActiveTab('codex')}
        >
          <span className="tab-icon">📖</span>
          <span>Collection Book</span>
        </button>
      </div>

      {/* Monsters Tab Content */}
      {activeTab === 'monsters' && (
        <>
          {/* Search */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search monsters by name, element..."
          />

      {/* Toolbar */}
      <div className="monsters-toolbar">
        <div className="toolbar-left">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            🔍 Filters {Object.values(filters).some((v) => Array.isArray(v) ? v.length > 0 : v !== DEFAULT_FILTERS[v as keyof MonsterFilters]) && '(Active)'}
          </Button>
          {selectedMonsters.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowBatchActions(true)}
            >
              Batch ({selectedMonsters.length})
            </Button>
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
            <option value="power-desc">Power (High → Low)</option>
            <option value="power-asc">Power (Low → High)</option>
            <option value="name-asc">Name (A → Z)</option>
            <option value="name-desc">Name (Z → A)</option>
            <option value="element-asc">Element (A → Z)</option>
            <option value="obtained-desc">Recently Obtained</option>
            <option value="obtained-asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onReset={() => setFilters(DEFAULT_FILTERS)}
        />
      )}

      {/* Batch Actions Bar */}
      {selectedMonsters.length > 0 && (
        <div className="batch-action-bar">
          <div className="batch-info">
            {selectedMonsters.length} selected
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

      {/* Monster Grid */}
      <div className="monsters-grid">
        {sortedMonsters.length === 0 ? (
          <div className="no-monsters">
            <span className="no-monsters-icon">📦</span>
            <p>No monsters found</p>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          sortedMonsters.map((monster) => {
            const template = getMonsterTemplate(monster.templateId);
            if (!template) return null;

            const monsterRunes = runes.filter((r) => r.equippedTo === monster.id);
            const stats = calculateMonsterStats(template, monster, monsterRunes);
            const power = Math.floor(stats.hp / 10 + stats.atk * 5 + stats.def * 3 + stats.spd * 10);
            const isSelected = selectedMonsters.includes(monster.id);
            const name = monster.awakened && template.awakenedName ? template.awakenedName : template.name;

            return (
              <div
                key={monster.id}
                className={`monster-card ${isSelected ? 'selected' : ''} ${monster.locked ? 'locked' : ''}`}
                onClick={(e) => {
                  if (e.shiftKey || selectedMonsters.length > 0) {
                    toggleMonsterSelection(monster.id);
                  } else {
                    navigate(`/monster/${monster.id}`);
                  }
                }}
              >
                <div className="monster-card-header">
                  <ElementIcon element={template.element} size="sm" />
                  <StarRating stars={monster.stars} size="sm" />
                  {monster.locked && <span className="lock-icon">🔒</span>}
                  {monster.awakened && <span className="awaken-badge">⭐</span>}
                </div>

                <div className="monster-avatar-container">
                  <div
                    className="monster-avatar"
                    style={{ background: getElementGradient(template.element) }}
                  >
                    {name.charAt(0)}
                  </div>
                  <div className="monster-level-badge">Lv.{monster.level}</div>
                </div>

                <div className="monster-name">{name}</div>

                <div className="monster-stats-preview">
                  <div className="stat-mini">
                    <span className="stat-label">HP</span>
                    <span className="stat-value">{Math.floor(stats.hp).toLocaleString()}</span>
                  </div>
                  <div className="stat-mini">
                    <span className="stat-label">ATK</span>
                    <span className="stat-value">{Math.floor(stats.atk).toLocaleString()}</span>
                  </div>
                  <div className="stat-mini">
                    <span className="stat-label">SPD</span>
                    <span className="stat-value">{Math.floor(stats.spd)}</span>
                  </div>
                </div>

                <div className="monster-footer">
                  <Badge variant="info">Power: {power.toLocaleString()}</Badge>
                  {monsterRunes.length > 0 && (
                    <Badge variant="success">{monsterRunes.length} Runes</Badge>
                  )}
                </div>

                <div className="monster-actions">
                  <button
                    className="action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMonsterLock(monster.id);
                    }}
                    title={monster.locked ? 'Unlock' : 'Lock'}
                  >
                    {monster.locked ? '🔓' : '🔒'}
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(monster.id);
                    }}
                    title="Delete"
                    disabled={monster.locked}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Batch Actions Modal */}
      <Modal
        isOpen={showBatchActions}
        onClose={() => setShowBatchActions(false)}
        title={`Batch Actions (${selectedMonsters.length} selected)`}
      >
        <div className="batch-actions-modal">
          <Button variant="primary" onClick={handleBatchLock}>
            🔒 Toggle Lock
          </Button>
          <Button variant="danger" onClick={handleBatchDelete}>
            🗑️ Delete Selected (Unlocked only)
          </Button>
          <Button variant="ghost" onClick={() => setShowBatchActions(false)}>
            Cancel
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmDelete(null)}
          title="Confirm Delete"
        >
          <div className="confirm-delete-modal">
            <p>Are you sure you want to delete this monster?</p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-buttons">
              <Button variant="danger" onClick={() => handleDeleteMonster(confirmDelete)}>
                Delete
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
        </>
      )}

      {/* Collection Book Tab Content */}
      {activeTab === 'codex' && (
        <MonsterCodex />
      )}
    </div>
  );
};

function getElementGradient(element: Element): string {
  const gradients: Record<Element, string> = {
    fire: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
    water: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
    wind: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
    light: 'linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)',
    dark: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
  };
  return gradients[element];
}

export default MonstersScreen;
