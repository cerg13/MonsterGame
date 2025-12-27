import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BattleStage } from '../components/battle';
import { MonsterCard } from '../components/ui/MonsterCard';
import { useBattleStore, usePlayerStore } from '../store';
import { monsterTemplates, getMonsterTemplate } from '../data/monsters';
import { calculateMonsterStats } from '../utils/statCalculator';
import { useTranslations } from '../localization';
import type { BattleMonster, BattleConfig } from '../types/battle';
import './BattleScreen.css';

export const BattleScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const { battleState, startBattle, endBattle } = useBattleStore();
  const monsters = usePlayerStore((state) => state.monsters);

  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [showTeamSelect, setShowTeamSelect] = useState(!battleState);

  // Use owned monsters or provide demo monsters
  const availableMonsters = useMemo(() => {
    if (monsters.length > 0) {
      return monsters.map(m => ({
        instance: m,
        template: getMonsterTemplate(m.templateId)!,
      })).filter(m => m.template);
    }

    // Demo monsters if none owned
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
        equippedRunes: [],
        locked: false,
        obtainedAt: new Date(),
      },
    }));
  }, [monsters]);

  const toggleMonsterSelection = (monsterId: string) => {
    setSelectedTeam((prev) => {
      if (prev.includes(monsterId)) {
        return prev.filter((id) => id !== monsterId);
      }
      if (prev.length >= 4) {
        return prev; // Max 4 monsters
      }
      return [...prev, monsterId];
    });
  };

  // Get runes from player store
  const runes = usePlayerStore((state) => state.runes);

  const createBattleMonster = (monsterId: string, team: 'player' | 'enemy'): BattleMonster => {
    const monsterData = availableMonsters.find(m => m.instance?.id === monsterId);
    if (!monsterData) throw new Error('Monster not found');

    const { template, instance } = monsterData;

    // Get equipped runes for this monster
    const equippedRunes = runes.filter(r => r.equippedTo === instance!.id);

    // Calculate stats using the proper calculator
    const stats = calculateMonsterStats(template, instance!, equippedRunes);

    // Determine name (use awakened name if awakened)
    const displayName = instance!.awakened && template.awakenedName
      ? template.awakenedName
      : template.name;

    // Collect passive IDs
    const passiveIds: string[] = [];
    if (template.leaderSkill) passiveIds.push(template.leaderSkill);
    if (template.passiveSkill) passiveIds.push(template.passiveSkill);
    if (instance!.awakened && template.awakenPassive) passiveIds.push(template.awakenPassive);

    return {
      id: instance!.id,
      templateId: template.id,
      name: displayName,
      element: template.element,
      team,
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
        // Apply skill level from instance
        skillLevel: instance!.skillLevels[index] || 1,
      })),
      passiveIds,
      buffs: stats.startingImmunity > 0
        ? [{ id: 'will_immunity', type: 'immunity' as const, duration: stats.startingImmunity, value: 0, sourceId: instance!.id, icon: 'immunity.png' }]
        : [],
      debuffs: [],
      isAlive: true,
      canAct: true,
      spriteSheet: template.spriteSheet,
      portrait: template.portrait,
    };
  };

  const handleStartBattle = () => {
    if (selectedTeam.length === 0) {
      alert('Please select at least 1 monster!');
      return;
    }

    // Create player team
    const playerTeam = selectedTeam.map((id) => createBattleMonster(id, 'player'));

    // Create enemy team (random monsters)
    const enemyTemplates = monsterTemplates
      .filter(t => t.rarity === 'rare' || t.rarity === 'sr')
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(selectedTeam.length, 3));

    const enemyTeam: BattleMonster[] = enemyTemplates.map((template, i) => {
      const level = 15 + Math.floor(Math.random() * 10);

      // Create a mock instance for enemy
      const enemyInstance = {
        id: `enemy_${i}`,
        templateId: template.id,
        ownerId: 'enemy',
        level,
        stars: template.naturalStars,
        experience: 0,
        skillLevels: [1, 1, 1],
        awakened: false,
        equippedRunes: [] as string[],
        locked: false,
        obtainedAt: new Date(),
      };

      // Calculate stats using the proper calculator (no runes for enemies)
      const stats = calculateMonsterStats(template, enemyInstance, []);

      // Collect enemy passive IDs (no awakened passives for non-awakened enemies)
      const enemyPassiveIds: string[] = [];
      if (template.passiveSkill) enemyPassiveIds.push(template.passiveSkill);

      return {
        id: `enemy_${i}`,
        templateId: template.id,
        name: template.name,
        element: template.element,
        team: 'enemy' as const,
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
        skills: template.skills.map((skill) => ({
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
      playerTeamIds: selectedTeam,
      enemyTeam,
    };

    startBattle(config);

    // Set player team after engine is created
    const { battleEngine } = useBattleStore.getState();
    if (battleEngine) {
      battleEngine.setPlayerTeam(playerTeam);
      battleEngine.setEnemyTeam(enemyTeam);
      battleEngine.start();
    }

    setShowTeamSelect(false);
  };

  const handleExitBattle = () => {
    endBattle();
    setShowTeamSelect(true);
    setSelectedTeam([]);
  };

  return (
    <div className="battle-screen">
      <div className="battle-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← {t.common.back}
        </button>
        <h1>{t.battle.title}</h1>
      </div>

      {showTeamSelect ? (
        <div className="team-select-container">
          <h2>{t.battle.yourTeam} (Max 4)</h2>
          <div className="selected-count">
            {selectedTeam.length} / 4
          </div>

          <div className="monster-select-grid">
            {availableMonsters.map(({ template, instance }) => (
              <div
                key={instance?.id}
                className={`selectable-monster ${selectedTeam.includes(instance?.id ?? '') ? 'selected' : ''}`}
                onClick={() => toggleMonsterSelection(instance?.id ?? '')}
              >
                <MonsterCard
                  template={template}
                  instance={instance}
                  selected={selectedTeam.includes(instance?.id ?? '')}
                />
                {selectedTeam.includes(instance?.id ?? '') && (
                  <div className="selection-order">
                    {selectedTeam.indexOf(instance?.id ?? '') + 1}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className="start-battle-button"
            onClick={handleStartBattle}
            disabled={selectedTeam.length === 0}
          >
            {t.battle.title} ({selectedTeam.length} vs {Math.min(selectedTeam.length, 3)})
          </button>
        </div>
      ) : (
        <div className="battle-container">
          <BattleStage width={800} height={500} />

          {battleState?.winner && (
            <div className="battle-end-actions">
              <button className="exit-button" onClick={handleExitBattle}>
                {t.common.back}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BattleScreen;
