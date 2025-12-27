import React from 'react';
import { Button } from './Button';
import './RuneFilterPanel.css';

export type RuneSet = 'energy' | 'fatal' | 'blade' | 'swift' | 'focus' | 'guard' | 'endure' | 'violent' | 'will' | 'despair' | 'vampire' | 'rage' | 'nemesis' | 'destroy' | 'revenge';

export interface RuneFilters {
  sets: RuneSet[];
  slots: number[];
  minStars: number;
  maxStars: number;
  minLevel: number;
  maxLevel: number;
  equipped: 'all' | 'yes' | 'no';
  locked: 'all' | 'yes' | 'no';
  mainStats: string[];
}

export interface RuneFilterPanelProps {
  filters: RuneFilters;
  onFiltersChange: (filters: RuneFilters) => void;
  onReset: () => void;
}

const RUNE_SETS: { id: RuneSet; name: string; color: string }[] = [
  { id: 'energy', name: 'Energy', color: '#3498db' },
  { id: 'fatal', name: 'Fatal', color: '#e74c3c' },
  { id: 'blade', name: 'Blade', color: '#95a5a6' },
  { id: 'swift', name: 'Swift', color: '#2ecc71' },
  { id: 'focus', name: 'Focus', color: '#9b59b6' },
  { id: 'guard', name: 'Guard', color: '#f39c12' },
  { id: 'endure', name: 'Endure', color: '#1abc9c' },
  { id: 'violent', name: 'Violent', color: '#c0392b' },
  { id: 'will', name: 'Will', color: '#f1c40f' },
  { id: 'despair', name: 'Despair', color: '#34495e' },
  { id: 'vampire', name: 'Vampire', color: '#8e44ad' },
  { id: 'rage', name: 'Rage', color: '#d35400' },
  { id: 'nemesis', name: 'Nemesis', color: '#16a085' },
  { id: 'destroy', name: 'Destroy', color: '#c0392b' },
  { id: 'revenge', name: 'Revenge', color: '#7f8c8d' },
];

const MAIN_STATS = [
  'HP',
  'HP%',
  'ATK',
  'ATK%',
  'DEF',
  'DEF%',
  'SPD',
  'CRIT Rate',
  'CRIT Dmg',
  'Accuracy',
  'Resistance',
];

export const RuneFilterPanel: React.FC<RuneFilterPanelProps> = ({ filters, onFiltersChange, onReset }) => {
  const updateFilters = (updates: Partial<RuneFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleSet = (set: RuneSet) => {
    const sets = filters.sets.includes(set)
      ? filters.sets.filter(s => s !== set)
      : [...filters.sets, set];
    updateFilters({ sets });
  };

  const toggleSlot = (slot: number) => {
    const slots = filters.slots.includes(slot)
      ? filters.slots.filter(s => s !== slot)
      : [...filters.slots, slot];
    updateFilters({ slots });
  };

  const toggleMainStat = (stat: string) => {
    const mainStats = filters.mainStats.includes(stat)
      ? filters.mainStats.filter(s => s !== stat)
      : [...filters.mainStats, stat];
    updateFilters({ mainStats });
  };

  return (
    <div className="rune-filter-panel">
      <div className="filter-header">
        <h3>Rune Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      {/* Rune Sets */}
      <div className="filter-section">
        <label className="filter-label">Rune Sets</label>
        <div className="rune-sets-grid">
          {RUNE_SETS.map(set => (
            <button
              key={set.id}
              className={`rune-set-btn ${filters.sets.includes(set.id) ? 'active' : ''}`}
              onClick={() => toggleSet(set.id)}
              style={{ '--set-color': set.color } as React.CSSProperties}
            >
              {set.name}
            </button>
          ))}
        </div>
      </div>

      {/* Slots */}
      <div className="filter-section">
        <label className="filter-label">Slots</label>
        <div className="slots-grid">
          {[1, 2, 3, 4, 5, 6].map(slot => (
            <button
              key={slot}
              className={`slot-btn ${filters.slots.includes(slot) ? 'active' : ''}`}
              onClick={() => toggleSlot(slot)}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {/* Stars Range */}
      <div className="filter-section">
        <label className="filter-label">Stars Range</label>
        <div className="filter-range">
          <input
            type="number"
            min={1}
            max={6}
            value={filters.minStars}
            onChange={(e) => updateFilters({ minStars: parseInt(e.target.value) || 1 })}
            className="range-input"
          />
          <span className="range-separator">-</span>
          <input
            type="number"
            min={1}
            max={6}
            value={filters.maxStars}
            onChange={(e) => updateFilters({ maxStars: parseInt(e.target.value) || 6 })}
            className="range-input"
          />
        </div>
      </div>

      {/* Level Range */}
      <div className="filter-section">
        <label className="filter-label">Level Range</label>
        <div className="filter-range">
          <input
            type="number"
            min={0}
            max={15}
            value={filters.minLevel}
            onChange={(e) => updateFilters({ minLevel: parseInt(e.target.value) || 0 })}
            className="range-input"
          />
          <span className="range-separator">-</span>
          <input
            type="number"
            min={0}
            max={15}
            value={filters.maxLevel}
            onChange={(e) => updateFilters({ maxLevel: parseInt(e.target.value) || 15 })}
            className="range-input"
          />
        </div>
      </div>

      {/* Main Stats */}
      <div className="filter-section">
        <label className="filter-label">Main Stats</label>
        <div className="main-stats-grid">
          {MAIN_STATS.map(stat => (
            <button
              key={stat}
              className={`main-stat-btn ${filters.mainStats.includes(stat) ? 'active' : ''}`}
              onClick={() => toggleMainStat(stat)}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div className="filter-section">
        <label className="filter-label">Status</label>
        <div className="filter-toggles">
          <select
            value={filters.equipped}
            onChange={(e) => updateFilters({ equipped: e.target.value as typeof filters.equipped })}
            className="filter-select"
          >
            <option value="all">All Equipment Status</option>
            <option value="yes">Equipped Only</option>
            <option value="no">Unequipped Only</option>
          </select>
          <select
            value={filters.locked}
            onChange={(e) => updateFilters({ locked: e.target.value as typeof filters.locked })}
            className="filter-select"
          >
            <option value="all">All Lock Status</option>
            <option value="yes">Locked Only</option>
            <option value="no">Unlocked Only</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RuneFilterPanel;
