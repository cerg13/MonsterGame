import React from 'react';
import type { Element, Rarity } from '../../types/monster';
import { ElementIcon } from './ElementIcon';
import { Button } from './Button';
import './FilterPanel.css';

export interface MonsterFilters {
  elements: Element[];
  rarities: Rarity[];
  minLevel: number;
  maxLevel: number;
  minStars: number;
  maxStars: number;
  awakened: 'all' | 'yes' | 'no';
  locked: 'all' | 'yes' | 'no';
  hasRunes: 'all' | 'yes' | 'no';
  inStorage: 'all' | 'yes' | 'no';
}

export interface FilterPanelProps {
  filters: MonsterFilters;
  onFiltersChange: (filters: MonsterFilters) => void;
  onReset: () => void;
}

const ELEMENTS: Element[] = ['fire', 'water', 'wind', 'light', 'dark'];
const RARITIES: Rarity[] = ['common', 'rare', 'sr', 'ssr'];

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, onReset }) => {
  const updateFilters = (updates: Partial<MonsterFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleElement = (element: Element) => {
    const elements = filters.elements.includes(element)
      ? filters.elements.filter(e => e !== element)
      : [...filters.elements, element];
    updateFilters({ elements });
  };

  const toggleRarity = (rarity: Rarity) => {
    const rarities = filters.rarities.includes(rarity)
      ? filters.rarities.filter(r => r !== rarity)
      : [...filters.rarities, rarity];
    updateFilters({ rarities });
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="filter-section">
        <label className="filter-label">Elements</label>
        <div className="filter-elements">
          {ELEMENTS.map(element => (
            <button
              key={element}
              className={`element-filter ${filters.elements.includes(element) ? 'active' : ''}`}
              onClick={() => toggleElement(element)}
              title={element}
            >
              <ElementIcon element={element} size="md" />
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Rarity</label>
        <div className="filter-rarities">
          {RARITIES.map(rarity => (
            <button
              key={rarity}
              className={`rarity-filter ${rarity} ${filters.rarities.includes(rarity) ? 'active' : ''}`}
              onClick={() => toggleRarity(rarity)}
            >
              {rarity.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label className="filter-label">Level Range</label>
        <div className="filter-range">
          <input
            type="number"
            min={1}
            max={40}
            value={filters.minLevel}
            onChange={(e) => updateFilters({ minLevel: parseInt(e.target.value) || 1 })}
            className="range-input"
          />
          <span className="range-separator">-</span>
          <input
            type="number"
            min={1}
            max={40}
            value={filters.maxLevel}
            onChange={(e) => updateFilters({ maxLevel: parseInt(e.target.value) || 40 })}
            className="range-input"
          />
        </div>
      </div>

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

      <div className="filter-section">
        <label className="filter-label">Status</label>
        <div className="filter-toggles">
          <select
            value={filters.awakened}
            onChange={(e) => updateFilters({ awakened: e.target.value as typeof filters.awakened })}
            className="filter-select"
          >
            <option value="all">All Awakening</option>
            <option value="yes">Awakened Only</option>
            <option value="no">Unawakened Only</option>
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
          <select
            value={filters.hasRunes}
            onChange={(e) => updateFilters({ hasRunes: e.target.value as typeof filters.hasRunes })}
            className="filter-select"
          >
            <option value="all">All Rune Status</option>
            <option value="yes">With Runes</option>
            <option value="no">No Runes</option>
          </select>
          <select
            value={filters.inStorage}
            onChange={(e) => updateFilters({ inStorage: e.target.value as typeof filters.inStorage })}
            className="filter-select"
          >
            <option value="all">All Storage Status</option>
            <option value="yes">In Storage</option>
            <option value="no">Not in Storage</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
