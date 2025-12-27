import React, { useState } from 'react';
import { usePlayerStore } from '../../store';
import { getMonsterTemplate } from '../../data/monsters';
import type { TeamPreset } from '../../types/player';
import './TeamPresetManager.css';

interface TeamPresetManagerProps {
  onLoadTeam?: (monsterIds: string[]) => void;
  currentTeam?: string[];
}

export const TeamPresetManager: React.FC<TeamPresetManagerProps> = ({
  onLoadTeam,
  currentTeam = [],
}) => {
  const { teamPresets, monsters, saveTeamPreset, deleteTeamPreset } = usePlayerStore();
  const [isCreating, setIsCreating] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleSaveCurrentTeam = () => {
    if (!newPresetName.trim()) {
      alert('Please enter a team name');
      return;
    }

    if (currentTeam.length === 0) {
      alert('Current team is empty. Add monsters first.');
      return;
    }

    const newPreset: TeamPreset = {
      id: `preset_${Date.now()}`,
      name: newPresetName.trim(),
      monsterIds: currentTeam,
      createdAt: new Date(),
    };

    saveTeamPreset(newPreset);
    setNewPresetName('');
    setIsCreating(false);
  };

  const handleLoadPreset = (preset: TeamPreset) => {
    if (onLoadTeam) {
      onLoadTeam(preset.monsterIds);
    }
  };

  const handleDeletePreset = (id: string, name: string) => {
    if (confirm(`Delete team preset "${name}"?`)) {
      deleteTeamPreset(id);
    }
  };

  const handleEditPreset = (preset: TeamPreset) => {
    setEditingPreset(preset.id);
    setEditName(preset.name);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) {
      alert('Please enter a team name');
      return;
    }

    const preset = teamPresets.find(p => p.id === id);
    if (preset) {
      saveTeamPreset({
        ...preset,
        name: editName.trim(),
      });
    }

    setEditingPreset(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingPreset(null);
    setEditName('');
  };

  const getMonsterName = (monsterId: string): string => {
    const monster = monsters.find(m => m.id === monsterId);
    if (!monster) return '???';

    const template = getMonsterTemplate(monster.templateId);
    return template ? template.name : '???';
  };

  const getMonsterElement = (monsterId: string): string => {
    const monster = monsters.find(m => m.id === monsterId);
    if (!monster) return '';

    const template = getMonsterTemplate(monster.templateId);
    return template ? template.element : '';
  };

  const getElementIcon = (element: string): string => {
    const icons: Record<string, string> = {
      fire: '🔥',
      water: '💧',
      wind: '🌪️',
      light: '✨',
      dark: '🌙',
    };
    return icons[element] || '';
  };

  const getPresetTypeIcon = (preset: TeamPreset): string => {
    const name = preset.name.toLowerCase();
    if (name.includes('arena') || name.includes('pvp')) return '⚔️';
    if (name.includes('dungeon') || name.includes('pve')) return '🏰';
    if (name.includes('campaign') || name.includes('story')) return '📖';
    if (name.includes('farm')) return '🌾';
    if (name.includes('boss')) return '👹';
    return '👾';
  };

  return (
    <div className="team-preset-manager">
      {/* Header */}
      <div className="preset-header">
        <div className="header-title">
          <span className="title-icon">📋</span>
          <h3>Team Presets</h3>
        </div>
        <button
          className="create-preset-btn"
          onClick={() => setIsCreating(!isCreating)}
        >
          {isCreating ? '✕ Cancel' : '+ Save Current Team'}
        </button>
      </div>

      {/* Create New Preset */}
      {isCreating && (
        <div className="create-preset-form">
          <div className="form-content">
            <div className="current-team-preview">
              <span className="preview-label">Current Team:</span>
              <div className="preview-monsters">
                {currentTeam.length > 0 ? (
                  currentTeam.map((monsterId, index) => (
                    <div key={index} className="preview-monster">
                      <span className="monster-element">
                        {getElementIcon(getMonsterElement(monsterId))}
                      </span>
                      <span className="monster-name">{getMonsterName(monsterId)}</span>
                    </div>
                  ))
                ) : (
                  <span className="empty-team">No monsters selected</span>
                )}
              </div>
            </div>
            <input
              type="text"
              className="preset-name-input"
              placeholder="Enter team name (e.g., Arena Team, Dungeon Team)"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveCurrentTeam()}
              autoFocus
            />
            <button className="save-preset-btn" onClick={handleSaveCurrentTeam}>
              💾 Save Preset
            </button>
          </div>
        </div>
      )}

      {/* Preset List */}
      <div className="preset-list">
        {teamPresets.length === 0 ? (
          <div className="empty-presets">
            <span className="empty-icon">📋</span>
            <p>No team presets saved yet</p>
            <p className="empty-hint">Save your current team to create a preset!</p>
          </div>
        ) : (
          teamPresets.map((preset) => (
            <div key={preset.id} className="preset-card">
              <div className="preset-type-icon">{getPresetTypeIcon(preset)}</div>

              <div className="preset-content">
                {editingPreset === preset.id ? (
                  <div className="edit-form">
                    <input
                      type="text"
                      className="edit-name-input"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(preset.id)}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button
                        className="save-edit-btn"
                        onClick={() => handleSaveEdit(preset.id)}
                      >
                        ✓
                      </button>
                      <button
                        className="cancel-edit-btn"
                        onClick={handleCancelEdit}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="preset-info">
                      <h4 className="preset-name">{preset.name}</h4>
                      <span className="preset-date">
                        Created {new Date(preset.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="preset-monsters">
                      {preset.monsterIds.map((monsterId, index) => (
                        <div key={index} className="preset-monster">
                          <span className="monster-element">
                            {getElementIcon(getMonsterElement(monsterId))}
                          </span>
                          <span className="monster-name">
                            {getMonsterName(monsterId)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="preset-actions">
                <button
                  className="load-btn"
                  onClick={() => handleLoadPreset(preset)}
                  title="Load this team"
                >
                  📥 Load
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEditPreset(preset)}
                  title="Edit preset name"
                >
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeletePreset(preset.id, preset.name)}
                  title="Delete preset"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {teamPresets.length > 0 && (
        <div className="preset-stats">
          <div className="stat-item">
            <span className="stat-icon">📋</span>
            <span className="stat-value">{teamPresets.length}</span>
            <span className="stat-label">Saved Teams</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👾</span>
            <span className="stat-value">{currentTeam.length}</span>
            <span className="stat-label">Current Team</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPresetManager;
