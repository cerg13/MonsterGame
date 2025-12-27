import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonsterCard } from '../MonsterCard';
import { monsterTemplates, getMonsterTemplate } from '../../../data/monsters';
import { usePlayerStore } from '../../../store';
import type { Element, Rarity } from '../../../types';
import './MonsterList.css';

type SortOption = 'rarity' | 'level' | 'element' | 'name';
type FilterElement = Element | 'all';
type FilterRarity = Rarity | 'all';

export const MonsterList: React.FC = () => {
  const navigate = useNavigate();
  const monsters = usePlayerStore((state) => state.monsters);
  const [selectedMonsterId, setSelectedMonsterId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rarity');
  const [filterElement, setFilterElement] = useState<FilterElement>('all');
  const [filterRarity, setFilterRarity] = useState<FilterRarity>('all');
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);

  // Get all templates or only owned monsters
  const displayMonsters = useMemo(() => {
    let list = showOwnedOnly
      ? monsters.map(m => ({
          instance: m,
          template: getMonsterTemplate(m.templateId)!,
        })).filter(m => m.template)
      : monsterTemplates.map(t => ({
          template: t,
          instance: monsters.find(m => m.templateId === t.id),
        }));

    // Filter by element
    if (filterElement !== 'all') {
      list = list.filter(m => m.template.element === filterElement);
    }

    // Filter by rarity
    if (filterRarity !== 'all') {
      list = list.filter(m => m.template.rarity === filterRarity);
    }

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder = { ssr: 0, sr: 1, rare: 2, common: 3 };
          return rarityOrder[a.template.rarity] - rarityOrder[b.template.rarity];
        case 'level':
          return (b.instance?.level ?? 0) - (a.instance?.level ?? 0);
        case 'element':
          return a.template.element.localeCompare(b.template.element);
        case 'name':
          return a.template.name.localeCompare(b.template.name);
        default:
          return 0;
      }
    });

    return list;
  }, [monsters, showOwnedOnly, filterElement, filterRarity, sortBy]);

  const selectedMonster = displayMonsters.find(m =>
    m.instance?.id === selectedMonsterId || m.template.id === selectedMonsterId
  );

  return (
    <div className="monster-list-page">
      <div className="monster-list-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h2>Monsters</h2>
        <div className="monster-count">
          {monsters.length} / {monsterTemplates.length} Collected
        </div>
      </div>

      {/* Filters */}
      <div className="monster-filters">
        <div className="filter-group">
          <label>Sort:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
            <option value="rarity">Rarity</option>
            <option value="level">Level</option>
            <option value="element">Element</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Element:</label>
          <select value={filterElement} onChange={(e) => setFilterElement(e.target.value as FilterElement)}>
            <option value="all">All</option>
            <option value="fire">🔥 Fire</option>
            <option value="water">💧 Water</option>
            <option value="wind">🌪️ Wind</option>
            <option value="light">✨ Light</option>
            <option value="dark">🌑 Dark</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Rarity:</label>
          <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value as FilterRarity)}>
            <option value="all">All</option>
            <option value="ssr">SSR (5★)</option>
            <option value="sr">SR (4★)</option>
            <option value="rare">Rare (3★)</option>
            <option value="common">Common (2★)</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              checked={showOwnedOnly}
              onChange={(e) => setShowOwnedOnly(e.target.checked)}
            />
            Owned Only
          </label>
        </div>
      </div>

      <div className="monster-list-content">
        {/* Monster Grid */}
        <div className="monster-grid">
          {displayMonsters.map(({ template, instance }) => (
            <MonsterCard
              key={instance?.id ?? template.id}
              template={template}
              instance={instance}
              selected={(instance?.id ?? template.id) === selectedMonsterId}
              onClick={() => {
                if (instance) {
                  navigate(`/monster/${instance.id}`);
                } else {
                  setSelectedMonsterId(template.id);
                }
              }}
            />
          ))}

          {displayMonsters.length === 0 && (
            <div className="no-monsters">
              No monsters found with current filters.
            </div>
          )}
        </div>

        {/* Monster Detail Panel */}
        {selectedMonster && (
          <div className="monster-detail-panel">
            <div className="detail-header">
              <h3>{selectedMonster.template.name}</h3>
              <span className={`rarity-badge ${selectedMonster.template.rarity}`}>
                {selectedMonster.template.rarity.toUpperCase()}
              </span>
            </div>

            <p className="monster-description">{selectedMonster.template.description}</p>

            <div className="detail-stats">
              <h4>Base Stats</h4>
              <div className="stats-grid">
                <div className="stat-row">
                  <span>HP</span>
                  <span>{selectedMonster.template.baseStats.hp}</span>
                </div>
                <div className="stat-row">
                  <span>ATK</span>
                  <span>{selectedMonster.template.baseStats.atk}</span>
                </div>
                <div className="stat-row">
                  <span>DEF</span>
                  <span>{selectedMonster.template.baseStats.def}</span>
                </div>
                <div className="stat-row">
                  <span>SPD</span>
                  <span>{selectedMonster.template.baseStats.spd}</span>
                </div>
                <div className="stat-row">
                  <span>Crit Rate</span>
                  <span>{selectedMonster.template.baseStats.critRate}%</span>
                </div>
                <div className="stat-row">
                  <span>Crit DMG</span>
                  <span>{selectedMonster.template.baseStats.critDamage}%</span>
                </div>
              </div>
            </div>

            <div className="detail-skills">
              <h4>Skills</h4>
              {selectedMonster.template.skills.map((skill, i) => (
                <div key={skill.id} className="skill-info">
                  <span className="skill-number">{i + 1}</span>
                  <div className="skill-details">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-desc">{skill.description}</span>
                    {skill.cooldown > 0 && (
                      <span className="skill-cd">Cooldown: {skill.cooldown} turns</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!selectedMonster.instance && (
              <div className="not-owned-badge">Not Owned</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonsterList;
