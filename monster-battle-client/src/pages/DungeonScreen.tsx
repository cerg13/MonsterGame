import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDungeonStore, usePlayerStore, useBattleStore } from '../store';
import type { DungeonContext } from '../store/useBattleStore';
import { DUNGEON_CONFIG, getDungeonFloors, RIFT_BOSSES, BOSS_MECHANICS } from '../data/dungeons';
import { getMonsterTemplate, monsterTemplates } from '../data/monsters';
import { calculateMonsterStats } from '../utils/statCalculator';
import {
  Button,
  Panel,
  ProgressBar,
  Badge,
  Modal,
  Tabs,
  ElementIcon,
} from '../components/common';
import type { DungeonType } from '../types/dungeon';
import type { BattleMonster, BattleConfig } from '../types/battle';
import type { Element } from '../types/monster';
import './DungeonScreen.css';

const DUNGEON_TABS = [
  { id: 'cairos', label: 'Cairos Dungeon' },
  { id: 'toa', label: 'Trial of Ascension' },
  { id: 'rift', label: 'Rift of Worlds' },
];

export const DungeonScreen: React.FC = () => {
  const navigate = useNavigate();

  // Stores
  const player = usePlayerStore((state) => state.player);
  const monsters = usePlayerStore((state) => state.monsters);
  const runes = usePlayerStore((state) => state.runes);

  const {
    dungeonProgress,
    toaProgress,
    riftProgress,
    selectedDungeon,
    selectedFloor,
    autoRepeat,
    maxAutoRepeat,
    selectDungeon,
    selectFloor,
    canEnterFloor,
    setAutoRepeat,
    setMaxAutoRepeat,
  } = useDungeonStore();

  const { startDungeonBattle } = useBattleStore();

  // Local state
  const [activeTab, setActiveTab] = useState('cairos');
  const [showFloorSelect, setShowFloorSelect] = useState(false);
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [, setSelectedRiftElement] = useState<Element>('fire');
  const [toaDifficulty, setToaDifficulty] = useState<'normal' | 'hard'>('normal');

  // Get current dungeon floors
  const currentFloors = useMemo(() => {
    if (!selectedDungeon) return [];
    return getDungeonFloors(selectedDungeon);
  }, [selectedDungeon]);

  // Get available monsters
  const availableMonsters = useMemo(() => {
    if (monsters.length > 0) {
      return monsters.map(m => ({
        instance: m,
        template: getMonsterTemplate(m.templateId)!,
      })).filter(m => m.template);
    }

    // Demo monsters
    return monsterTemplates.slice(0, 8).map(t => ({
      template: t,
      instance: {
        id: `demo_${t.id}`,
        templateId: t.id,
        ownerId: 'demo',
        level: 40,
        stars: t.naturalStars,
        experience: 0,
        skillLevels: [1, 1, 1],
        awakened: false,
        equippedRunes: [] as string[],
        locked: false,
        obtainedAt: new Date(),
      },
    }));
  }, [monsters]);

  const handleDungeonSelect = (type: DungeonType) => {
    selectDungeon(type);
    if (type !== 'toa' && type !== 'rift') {
      setShowFloorSelect(true);
    }
  };

  const handleFloorSelect = (floor: number) => {
    if (canEnterFloor(selectedDungeon!, floor)) {
      selectFloor(floor);
      setShowFloorSelect(false);
      setShowTeamSelect(true);
    }
  };

  const handleToAStart = () => {
    selectDungeon('toa');
    setShowTeamSelect(true);
  };

  const handleRiftStart = (element: Element) => {
    setSelectedRiftElement(element);
    selectDungeon('rift');
    setShowTeamSelect(true);
  };

  const toggleMonsterSelection = (monsterId: string) => {
    setSelectedTeam((prev) => {
      if (prev.includes(monsterId)) {
        return prev.filter(id => id !== monsterId);
      }
      if (prev.length >= 5) return prev; // Dungeons allow 5 monsters
      return [...prev, monsterId];
    });
  };

  const handleStartBattle = () => {
    if (selectedTeam.length === 0 || !selectedDungeon) return;

    const floor = currentFloors.find(f => f.floor === selectedFloor);
    if (!floor && selectedDungeon !== 'rift') return;

    // Create player team
    const playerTeam: BattleMonster[] = selectedTeam.map(id => {
      const monsterData = availableMonsters.find(m => m.instance?.id === id);
      if (!monsterData) throw new Error('Monster not found');

      const { template, instance } = monsterData;
      const equippedRunes = runes.filter(r => r.equippedTo === instance!.id);
      const stats = calculateMonsterStats(template, instance!, equippedRunes);

      const passiveIds: string[] = [];
      if (template.leaderSkill) passiveIds.push(template.leaderSkill);
      if (template.passiveSkill) passiveIds.push(template.passiveSkill);
      if (instance!.awakened && template.awakenPassive) passiveIds.push(template.awakenPassive);

      return {
        id: instance!.id,
        templateId: template.id,
        name: instance!.awakened && template.awakenedName ? template.awakenedName : template.name,
        element: template.element,
        team: 'player' as const,
        currentHp: stats.hp,
        maxHp: stats.hp,
        atk: stats.atk,
        def: stats.def,
        spd: stats.spd,
        critRate: stats.critRate,
        critDamage: stats.critDamage,
        accuracy: stats.accuracy,
        resistance: stats.resistance,
        attackBar: 0,
        skills: template.skills.map((skill, index) => ({
          skillId: skill.id,
          name: skill.name,
          currentCooldown: 0,
          maxCooldown: skill.cooldown,
          isReady: true,
          template: skill,
          skillLevel: instance!.skillLevels[index] || 1,
        })),
        passiveIds,
        buffs: [],
        debuffs: [],
        isAlive: true,
        canAct: true,
        spriteSheet: template.spriteSheet,
        portrait: template.portrait,
      };
    });

    // Create enemy team (simplified - using last wave)
    const enemyTeam: BattleMonster[] = [];

    if (floor) {
      const lastWave = floor.waves[floor.waves.length - 1];
      lastWave.enemies.forEach((enemy, i) => {
        // Create mock enemy based on dungeon enemy config
        const mockTemplate = monsterTemplates[0]; // Use placeholder for now
        enemyTeam.push({
          id: `dungeon_enemy_${i}`,
          templateId: enemy.monsterId,
          name: enemy.isBoss ? `[BOSS] ${DUNGEON_CONFIG[selectedDungeon!].nameRu}` : `Enemy ${i + 1}`,
          element: DUNGEON_CONFIG[selectedDungeon!].element,
          team: 'enemy' as const,
          currentHp: 10000 * enemy.level,
          maxHp: 10000 * enemy.level,
          atk: 500 * enemy.level,
          def: 300 * enemy.level,
          spd: 100 + enemy.level,
          critRate: 15,
          critDamage: 50,
          accuracy: 25,
          resistance: 25,
          attackBar: 0,
          skills: mockTemplate.skills.map(skill => ({
            skillId: skill.id,
            name: skill.name,
            currentCooldown: 0,
            maxCooldown: skill.cooldown,
            isReady: true,
            template: skill,
            skillLevel: 1,
          })),
          passiveIds: [],
          buffs: [],
          debuffs: [],
          isAlive: true,
          canAct: true,
          spriteSheet: mockTemplate.spriteSheet,
          portrait: mockTemplate.portrait,
        });
      });
    }

    // Start battle
    const config: BattleConfig = {
      stageId: `${selectedDungeon}_b${selectedFloor}`,
      playerTeamIds: selectedTeam,
      enemyTeam,
    };

    // Create dungeon context for rewards and boss mechanics
    const dungeonContext: DungeonContext = {
      floor: floor!,
      bossMechanics: BOSS_MECHANICS[selectedDungeon!] || [],
    };

    startDungeonBattle(config, dungeonContext);

    const { battleEngine } = useBattleStore.getState();
    if (battleEngine) {
      battleEngine.setPlayerTeam(playerTeam);
      battleEngine.setEnemyTeam(enemyTeam);
      battleEngine.start();
    }

    navigate('/battle');
  };

  const renderCairosDungeons = () => (
    <div className="dungeon-grid">
      {(['giants', 'dragons', 'necropolis'] as DungeonType[]).map((type) => {
        const config = DUNGEON_CONFIG[type];
        const progress = dungeonProgress[type];
        const highestFloor = progress?.highestFloor || 1;

        return (
          <div
            key={type}
            className={`dungeon-card ${selectedDungeon === type ? 'selected' : ''}`}
            onClick={() => handleDungeonSelect(type)}
            style={{ '--dungeon-color': config.color } as React.CSSProperties}
          >
            <div className="dungeon-icon">{config.icon}</div>
            <div className="dungeon-info">
              <h3>{config.nameRu}</h3>
              <p>{config.descriptionRu}</p>
              <div className="dungeon-stats">
                <span className="floor-badge">B{highestFloor}/{config.maxFloor}</span>
                <span className="clears-badge">{progress?.totalClears || 0} clears</span>
              </div>
              <div className="rune-sets">
                {config.runeSets.slice(0, 2).map(set => (
                  <Badge key={set} variant="info">{set}</Badge>
                ))}
                {config.runeSets.length > 2 && (
                  <Badge variant="info">+{config.runeSets.length - 2}</Badge>
                )}
              </div>
            </div>
            <ElementIcon element={config.element} size="lg" />
          </div>
        );
      })}
    </div>
  );

  const renderToA = () => {
    const normalProgress = toaProgress.normal;
    const hardProgress = toaProgress.hard;
    const currentProgress = toaDifficulty === 'normal' ? normalProgress : hardProgress;

    return (
      <div className="toa-container">
        <div className="toa-difficulty-toggle">
          <button
            className={`toa-diff-btn ${toaDifficulty === 'normal' ? 'active' : ''}`}
            onClick={() => setToaDifficulty('normal')}
          >
            Normal
          </button>
          <button
            className={`toa-diff-btn hard ${toaDifficulty === 'hard' ? 'active' : ''}`}
            onClick={() => setToaDifficulty('hard')}
          >
            Hard
          </button>
        </div>

        <Panel title={`Trial of Ascension - ${toaDifficulty === 'normal' ? 'Нормальный' : 'Сложный'}`}>
          <div className="toa-progress">
            <div className="toa-floor-display">
              <span className="current-floor">{currentProgress.currentFloor}</span>
              <span className="floor-divider">/</span>
              <span className="max-floor">100</span>
            </div>
            <ProgressBar
              value={currentProgress.currentFloor}
              max={100}
              type="exp"
              size="lg"
              showText
            />
            <p className="toa-highest">Highest: Floor {currentProgress.highestFloor}</p>
          </div>

          <div className="toa-milestones">
            {[10, 30, 50, 70, 90, 100].map(floor => (
              <div
                key={floor}
                className={`milestone ${currentProgress.highestFloor >= floor ? 'completed' : ''}`}
              >
                <span className="milestone-floor">{floor}F</span>
                {floor === 100 && <span className="milestone-reward">Devilmon</span>}
                {floor === 50 && <span className="milestone-reward">L&D Scroll</span>}
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            className="toa-start-btn"
            onClick={handleToAStart}
            disabled={currentProgress.currentFloor >= 100}
          >
            {currentProgress.currentFloor >= 100 ? 'Completed!' : `Enter Floor ${currentProgress.currentFloor}`}
          </Button>
        </Panel>
      </div>
    );
  };

  const renderRift = () => (
    <div className="rift-container">
      <Panel title="Rift of Worlds">
        <p className="rift-description">
          Raid elemental beasts for special materials and grindstones.
        </p>
        <div className="rift-grid">
          {(['fire', 'water', 'wind', 'light', 'dark'] as Element[]).map(element => {
            const boss = RIFT_BOSSES[element];
            const progress = riftProgress[element];

            return (
              <div
                key={element}
                className={`rift-card ${element}`}
                onClick={() => handleRiftStart(element)}
              >
                <ElementIcon element={element} size="lg" />
                <div className="rift-info">
                  <h4>{boss.nameRu}</h4>
                  <div className="rift-grade">
                    <span className={`grade ${progress?.highestGrade || 'F'}`}>
                      {progress?.highestGrade || 'F'}
                    </span>
                  </div>
                  <span className="rift-damage">
                    Best: {(progress?.bestDamage || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );

  const currentDungeonConfig = selectedDungeon ? DUNGEON_CONFIG[selectedDungeon] : null;

  return (
    <div className="dungeon-screen">
      {/* Header */}
      <div className="dungeon-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Dungeons</h1>
        <div className="energy-display">
          <span>⚡</span>
          <span>{player?.energy || 80}/80</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs
        tabs={DUNGEON_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <div className="dungeon-content">
        {activeTab === 'cairos' && renderCairosDungeons()}
        {activeTab === 'toa' && renderToA()}
        {activeTab === 'rift' && renderRift()}
      </div>

      {/* Floor Selection Modal */}
      <Modal
        isOpen={showFloorSelect}
        onClose={() => setShowFloorSelect(false)}
        title={currentDungeonConfig ? `${currentDungeonConfig.nameRu} - Select Floor` : 'Select Floor'}
      >
        <div className="floor-grid">
          {currentFloors.map((floor) => {
            const unlocked = canEnterFloor(selectedDungeon!, floor.floor);
            const isCurrentFloor = floor.floor === selectedFloor;
            const progress = dungeonProgress[selectedDungeon!];
            const isCleared = floor.floor <= (progress?.highestFloor || 0);

            return (
              <div
                key={floor.id}
                className={`floor-card ${!unlocked ? 'locked' : ''} ${isCurrentFloor ? 'selected' : ''} ${isCleared ? 'cleared' : ''}`}
                onClick={() => handleFloorSelect(floor.floor)}
              >
                <span className="floor-number">B{floor.floor}</span>
                <span className="floor-energy">⚡{floor.energyCost}</span>
                <span className="floor-power">
                  {Math.floor(floor.recommendedPower / 1000)}K
                </span>
                {isCleared && <span className="clear-badge">✓</span>}
                {!unlocked && <div className="lock-icon">🔒</div>}
              </div>
            );
          })}
        </div>

        {currentDungeonConfig && (
          <div className="floor-rewards-preview">
            <h4>Possible Rewards</h4>
            <div className="reward-sets">
              {currentDungeonConfig.runeSets.map(set => (
                <Badge key={set} variant="info">{set}</Badge>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Team Selection Modal */}
      <Modal
        isOpen={showTeamSelect}
        onClose={() => {
          setShowTeamSelect(false);
          setSelectedTeam([]);
        }}
        title={currentDungeonConfig ? `${currentDungeonConfig.nameRu} B${selectedFloor}` : 'Select Team'}
        footer={
          <>
            <div className="auto-repeat-toggle">
              <label>
                <input
                  type="checkbox"
                  checked={autoRepeat}
                  onChange={(e) => setAutoRepeat(e.target.checked)}
                />
                Auto-Repeat
              </label>
              {autoRepeat && (
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxAutoRepeat}
                  onChange={(e) => setMaxAutoRepeat(parseInt(e.target.value) || 10)}
                  className="repeat-count"
                />
              )}
            </div>
            <div className="modal-buttons">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTeamSelect(false);
                  setSelectedTeam([]);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStartBattle}
                disabled={selectedTeam.length === 0}
              >
                Start Battle ({selectedTeam.length}/5)
              </Button>
            </div>
          </>
        }
      >
        <div className="dungeon-info-panel">
          {currentDungeonConfig && (
            <>
              <div className="info-row">
                <span>Energy Cost:</span>
                <span>⚡{currentFloors[selectedFloor - 1]?.energyCost || 8}</span>
              </div>
              <div className="info-row">
                <span>Recommended Power:</span>
                <span>{(currentFloors[selectedFloor - 1]?.recommendedPower || 50000).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span>Element:</span>
                <ElementIcon element={currentDungeonConfig.element} size="sm" />
              </div>
            </>
          )}
        </div>

        <div className="team-select-grid">
          {availableMonsters.map(({ template, instance }) => (
            <div
              key={instance?.id}
              className={`team-monster ${selectedTeam.includes(instance?.id ?? '') ? 'selected' : ''}`}
              onClick={() => toggleMonsterSelection(instance?.id ?? '')}
            >
              <div className="monster-avatar" style={{ background: getElementGradient(template.element) }}>
                {template.name.charAt(0)}
              </div>
              <div className="monster-name">{template.name}</div>
              <div className="monster-level">Lv.{instance?.level || 1}</div>
              <ElementIcon element={template.element} size="sm" />
              {selectedTeam.includes(instance?.id ?? '') && (
                <Badge variant="success">
                  {selectedTeam.indexOf(instance?.id ?? '') + 1}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </Modal>
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

export default DungeonScreen;
