import React, { useState, useMemo } from 'react';
import type { PlayerRune, RuneSet, RuneRarity } from '../../../types/player';
import { RuneCard } from './RuneCard';
import {
  sortRunes,
  filterRunes,
  type RuneSortCriteria,
  type RuneFilterOptions,
  RUNE_SET_INFO,
} from '../../../utils/runeUtils';
import './Rune.css';

interface RuneInventoryProps {
  runes: PlayerRune[];
  onRuneClick?: (rune: PlayerRune) => void;
  selectedRuneId?: string;
  compact?: boolean;
  showFilters?: boolean;
  showEfficiency?: boolean;
  filterOptions?: RuneFilterOptions;
}

export const RuneInventory: React.FC<RuneInventoryProps> = ({
  runes,
  onRuneClick,
  selectedRuneId,
  compact = false,
  showFilters = true,
  showEfficiency = false,
  filterOptions: externalFilters,
}) => {
  // Filter state
  const [setFilter, setSetFilter] = useState<RuneSet | 'all'>('all');
  const [slotFilter, setSlotFilter] = useState<1 | 2 | 3 | 4 | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<RuneRarity | 'all'>('all');
  const [equippedFilter, setEquippedFilter] = useState<'all' | 'equipped' | 'unequipped'>('all');
  const [sortCriteria, setSortCriteria] = useState<RuneSortCriteria>('power');

  // Build filter options
  const filterOpts: RuneFilterOptions = useMemo(() => {
    const opts: RuneFilterOptions = { ...externalFilters };

    if (setFilter !== 'all') {
      opts.sets = [setFilter];
    }
    if (slotFilter !== 'all') {
      opts.slots = [slotFilter];
    }
    if (rarityFilter !== 'all') {
      opts.rarities = [rarityFilter];
    }
    if (equippedFilter !== 'all') {
      opts.equipped = equippedFilter === 'equipped';
    }

    return opts;
  }, [setFilter, slotFilter, rarityFilter, equippedFilter, externalFilters]);

  // Filter and sort runes
  const displayedRunes = useMemo(() => {
    const filtered = filterRunes(runes, filterOpts);
    return sortRunes(filtered, sortCriteria);
  }, [runes, filterOpts, sortCriteria]);

  const setOptions: (RuneSet | 'all')[] = ['all', 'fatal', 'swift', 'blade', 'rage', 'energy', 'guard', 'vampire', 'will'];
  const slotOptions: (1 | 2 | 3 | 4 | 'all')[] = ['all', 1, 2, 3, 4];
  const rarityOptions: (RuneRarity | 'all')[] = ['all', 'legend', 'hero', 'rare', 'magic', 'common'];

  return (
    <div className="rune-inventory">
      <div className="rune-inventory-header">
        <span className="rune-count">
          {displayedRunes.length} / {runes.length} Runes
        </span>

        {showFilters && (
          <div className="rune-filters">
            <div className="filter-group">
              <label>Set:</label>
              <select
                value={setFilter}
                onChange={(e) => setSetFilter(e.target.value as RuneSet | 'all')}
              >
                {setOptions.map((set) => (
                  <option key={set} value={set}>
                    {set === 'all' ? 'All Sets' : `${RUNE_SET_INFO[set].icon} ${RUNE_SET_INFO[set].name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Slot:</label>
              <select
                value={slotFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSlotFilter(val === 'all' ? 'all' : parseInt(val) as 1 | 2 | 3 | 4);
                }}
              >
                {slotOptions.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot === 'all' ? 'All Slots' : `Slot ${slot}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Rarity:</label>
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value as RuneRarity | 'all')}
              >
                {rarityOptions.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity === 'all' ? 'All Rarities' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select
                value={equippedFilter}
                onChange={(e) => setEquippedFilter(e.target.value as 'all' | 'equipped' | 'unequipped')}
              >
                <option value="all">All</option>
                <option value="equipped">Equipped</option>
                <option value="unequipped">Unequipped</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort:</label>
              <select
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value as RuneSortCriteria)}
              >
                <option value="power">Power</option>
                <option value="stars">Stars</option>
                <option value="level">Level</option>
                <option value="set">Set</option>
                <option value="slot">Slot</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {displayedRunes.length > 0 ? (
        <div className={`rune-grid ${compact ? 'compact' : ''}`}>
          {displayedRunes.map((rune) => (
            <RuneCard
              key={rune.id}
              rune={rune}
              onClick={() => onRuneClick?.(rune)}
              selected={selectedRuneId === rune.id}
              compact={compact}
              showEfficiency={showEfficiency}
            />
          ))}
        </div>
      ) : (
        <div className="no-runes">
          <p>No runes found</p>
          {runes.length > 0 && <p>Try adjusting your filters</p>}
        </div>
      )}
    </div>
  );
};

export default RuneInventory;
