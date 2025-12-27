import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampaignStore, usePlayerStore, useBattleStore } from '../store';
import { campaignRegions, getCampaignStage, getTotalStarsInRegion } from '../data/campaign';
import { getMonsterTemplate, monsterTemplates } from '../data/monsters';
import { calculateMonsterStats } from '../utils/statCalculator';
import {
  Button,
  Panel,
  ProgressBar,
  StarRating,
  Badge,
  Modal,
} from '../components/common';
import type { BattleMonster, BattleConfig } from '../types/battle';
import type { CampaignStage } from '../types/campaign';
import './CampaignScreen.css';

export const CampaignScreen: React.FC = () => {
  const navigate = useNavigate();

  // Stores
  const player = usePlayerStore((state) => state.player);
  const monsters = usePlayerStore((state) => state.monsters);
  const runes = usePlayerStore((state) => state.runes);

  const {
    progress,
    selectedRegion,
    selectedStage,
    selectRegion,
    selectStage,
    isStageUnlocked,
    isRegionUnlocked,
    getStageProgress,
    getRegionStars,
  } = useCampaignStore();

  const { startBattle } = useBattleStore();

  // Local state
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);

  // Get current region
  const currentRegion = useMemo(() => {
    return campaignRegions.find(r => r.id === selectedRegion) || campaignRegions[0];
  }, [selectedRegion]);

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
        level: 20,
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

  const handleRegionSelect = (regionId: string) => {
    if (isRegionUnlocked(regionId)) {
      selectRegion(regionId);
    }
  };

  const handleStageSelect = (stage: CampaignStage) => {
    if (isStageUnlocked(stage.id)) {
      selectStage(stage.id);
      setShowTeamSelect(true);
    }
  };

  const toggleMonsterSelection = (monsterId: string) => {
    setSelectedTeam((prev) => {
      if (prev.includes(monsterId)) {
        return prev.filter(id => id !== monsterId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, monsterId];
    });
  };

  const handleStartBattle = () => {
    if (!selectedStage || selectedTeam.length === 0) return;

    const stage = getCampaignStage(selectedStage);
    if (!stage) return;

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

    // Create enemy team from stage waves (simplified: use last wave)
    const lastWave = stage.waves[stage.waves.length - 1];
    const enemyTeam: BattleMonster[] = lastWave.enemies.map((enemy, i) => {
      const template = getMonsterTemplate(enemy.templateId);
      if (!template) throw new Error(`Enemy template not found: ${enemy.templateId}`);

      const mockInstance = {
        id: `enemy_${i}`,
        templateId: enemy.templateId,
        ownerId: 'enemy',
        level: enemy.level,
        stars: template.naturalStars,
        experience: 0,
        skillLevels: [1, 1, 1],
        awakened: false,
        equippedRunes: [] as string[],
        locked: false,
        obtainedAt: new Date(),
      };

      const stats = calculateMonsterStats(template, mockInstance, []);

      // Apply stat modifiers
      const hpMod = enemy.hpMod || 1;
      const atkMod = enemy.atkMod || 1;
      const defMod = enemy.defMod || 1;

      const enemyPassiveIds: string[] = [];
      if (template.passiveSkill) enemyPassiveIds.push(template.passiveSkill);

      return {
        id: `enemy_${i}`,
        templateId: template.id,
        name: enemy.isBoss ? `[BOSS] ${template.name}` : template.name,
        element: template.element,
        team: 'enemy' as const,
        currentHp: Math.floor(stats.hp * hpMod),
        maxHp: Math.floor(stats.hp * hpMod),
        atk: Math.floor(stats.atk * atkMod),
        def: Math.floor(stats.def * defMod),
        spd: stats.spd,
        critRate: stats.critRate,
        critDamage: stats.critDamage,
        accuracy: stats.accuracy,
        resistance: stats.resistance,
        attackBar: 0,
        skills: template.skills.map(skill => ({
          skillId: skill.id,
          name: skill.name,
          currentCooldown: 0,
          maxCooldown: skill.cooldown,
          isReady: true,
          template: skill,
          skillLevel: 1,
        })),
        passiveIds: enemyPassiveIds,
        buffs: [],
        debuffs: [],
        isAlive: true,
        canAct: true,
        spriteSheet: template.spriteSheet,
        portrait: template.portrait,
      };
    });

    // Start battle
    const config: BattleConfig = {
      stageId: selectedStage,
      playerTeamIds: selectedTeam,
      enemyTeam,
    };

    startBattle(config);

    const { battleEngine } = useBattleStore.getState();
    if (battleEngine) {
      battleEngine.setPlayerTeam(playerTeam);
      battleEngine.setEnemyTeam(enemyTeam);
      battleEngine.start();
    }

    // Navigate to battle
    navigate('/battle');
  };

  const currentStage = selectedStage ? getCampaignStage(selectedStage) : null;

  return (
    <div className="campaign-screen">
      {/* Header */}
      <div className="campaign-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Campaign</h1>
        <div className="total-stars">
          <StarRating stars={Math.min(progress.totalStars, 6)} maxStars={6} />
          <span>{progress.totalStars} Stars</span>
        </div>
      </div>

      {/* Region Selection */}
      <div className="region-list">
        {campaignRegions.map((region) => {
          const unlocked = isRegionUnlocked(region.id);
          const stars = getRegionStars(region.id);
          const maxStars = getTotalStarsInRegion(region.id);

          return (
            <div
              key={region.id}
              className={`region-card ${selectedRegion === region.id ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
              onClick={() => handleRegionSelect(region.id)}
            >
              <div className="region-icon">
                {unlocked ? '🏰' : '🔒'}
              </div>
              <div className="region-info">
                <h3>{region.name}</h3>
                {unlocked && (
                  <div className="region-progress">
                    <ProgressBar
                      value={stars}
                      max={maxStars}
                      type="exp"
                      size="sm"
                    />
                    <span>{stars}/{maxStars}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage List */}
      {currentRegion && (
        <Panel title={currentRegion.name} className="stage-panel">
          <p className="region-description">{currentRegion.description}</p>

          <div className="stage-grid">
            {currentRegion.stages.map((stage) => {
              const unlocked = isStageUnlocked(stage.id);
              const stageProgress = getStageProgress(stage.id);

              return (
                <div
                  key={stage.id}
                  className={`stage-card ${!unlocked ? 'locked' : ''} ${stage.bossStage ? 'boss' : ''}`}
                  onClick={() => handleStageSelect(stage)}
                >
                  <div className="stage-number">
                    {stage.bossStage ? '👑' : stage.stageNumber}
                  </div>
                  <div className="stage-info">
                    <span className="stage-name">{stage.name}</span>
                    <span className="stage-level">Lv.{stage.recommendedLevel}</span>
                  </div>
                  {stageProgress?.completed && (
                    <div className="stage-stars">
                      <StarRating stars={stageProgress.bestRating} maxStars={3} size="sm" />
                    </div>
                  )}
                  {!unlocked && <div className="lock-overlay">🔒</div>}
                  <div className="stage-energy">⚡{stage.energyCost}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Team Selection Modal */}
      <Modal
        isOpen={showTeamSelect}
        onClose={() => {
          setShowTeamSelect(false);
          setSelectedTeam([]);
        }}
        title={currentStage ? `${currentStage.name} - Select Team` : 'Select Team'}
        footer={
          <>
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
              Start Battle ({selectedTeam.length}/4)
            </Button>
          </>
        }
      >
        {currentStage && (
          <div className="stage-details">
            <div className="stage-detail-row">
              <span>Recommended Level:</span>
              <span>Lv.{currentStage.recommendedLevel}</span>
            </div>
            <div className="stage-detail-row">
              <span>Energy Cost:</span>
              <span>⚡{currentStage.energyCost}</span>
            </div>
            <div className="stage-detail-row">
              <span>Waves:</span>
              <span>{currentStage.waves.length}</span>
            </div>
          </div>
        )}

        <div className="team-select-grid">
          {availableMonsters.map(({ template, instance }) => (
            <div
              key={instance?.id}
              className={`team-monster ${selectedTeam.includes(instance?.id ?? '') ? 'selected' : ''}`}
              onClick={() => toggleMonsterSelection(instance?.id ?? '')}
            >
              <div className="monster-avatar">{template.name.charAt(0)}</div>
              <div className="monster-name">{template.name}</div>
              <div className="monster-level">Lv.{instance?.level || 1}</div>
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

export default CampaignScreen;
