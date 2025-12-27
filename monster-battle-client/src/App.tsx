import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MainMenu } from './components/ui/MainMenu';
import { BattleScreen } from './pages/BattleScreen';
import { CampaignScreen } from './pages/CampaignScreen';
import { RuneScreen } from './pages/RuneScreen';
import { MonsterDetailScreen } from './pages/MonsterDetailScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { ArenaScreen } from './pages/ArenaScreen';
import { GuildScreen } from './pages/GuildScreen';
import { DailyRewardScreen } from './pages/DailyRewardScreen';
import { AchievementScreen } from './pages/AchievementScreen';
import { QuestScreen } from './pages/QuestScreen';
import { DungeonScreen } from './pages/DungeonScreen';
import { LoyaltyScreen } from './pages/LoyaltyScreen';
import { MonstersScreen } from './pages/MonstersScreen';
import { MonsterList } from './components/ui/Inventory/MonsterList';
import { GachaScreen } from './components/ui/GachaScreen';
import { TutorialOverlay } from './components/tutorial';
import { usePlayerStore, useTutorialStore } from './store';
import { MONSTER_TEMPLATES } from './data/monsters';
import './App.css';

// Page wrapper component for transitions
interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, className = '' }) => {
  const location = useLocation();
  const isBattle = location.pathname === '/battle';

  return (
    <div
      key={location.pathname}
      className={`page-wrapper ${isBattle ? 'battle' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

function App() {
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const addMonsters = usePlayerStore((state) => state.addMonsters);
  const monsters = usePlayerStore((state) => state.monsters);

  const hasCompletedTutorial = useTutorialStore((state) => state.hasCompletedTutorial);
  const startTutorial = useTutorialStore((state) => state.startTutorial);

  // Initialize player on first visit
  useEffect(() => {
    if (!player) {
      // Create default player
      setPlayer({
        id: 'player-1',
        username: 'Player',
        level: 1,
        experience: 0,
        crystals: 500,
        gold: 10000,
        energy: 80,
        maxEnergy: 120,
        arenaWings: 10,
        maxArenaWings: 10,
        lastEnergyRefresh: new Date(),
        createdAt: new Date(),
      });
    }
  }, [player, setPlayer]);

  // Initialize starter monsters
  useEffect(() => {
    if (player && monsters.length === 0) {
      // Give player starter monsters
      const starterTemplateIds = ['fire_imp', 'water_spirit', 'wind_pixie', 'light_fairy'];
      const starterMonsters = starterTemplateIds.map((templateId, index) => {
        const template = MONSTER_TEMPLATES.find(t => t.id === templateId);
        if (!template) return null;
        return {
          id: `starter-${index}`,
          templateId: template.id,
          ownerId: player.id,
          level: 20,
          stars: template.naturalStars,
          experience: 0,
          skillLevels: [1, 1, 1],
          awakened: false,
          equippedRunes: [],
          locked: false,
          obtainedAt: new Date(),
        };
      }).filter(Boolean);

      if (starterMonsters.length > 0) {
        addMonsters(starterMonsters as any);
      }
    }
  }, [player, monsters.length, addMonsters]);

  // Start tutorial for new users
  useEffect(() => {
    if (player && !hasCompletedTutorial) {
      // Small delay to ensure UI is rendered
      const timer = setTimeout(() => {
        startTutorial();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [player, hasCompletedTutorial, startTutorial]);
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<PageWrapper><MainMenu /></PageWrapper>} />
          <Route path="/campaign" element={<PageWrapper><CampaignScreen /></PageWrapper>} />
          <Route path="/battle" element={<PageWrapper><BattleScreen /></PageWrapper>} />
          <Route path="/monsters" element={<PageWrapper><MonstersScreen /></PageWrapper>} />
          <Route path="/monsters-old" element={<PageWrapper><MonsterList /></PageWrapper>} />
          <Route path="/monster/:id" element={<PageWrapper><MonsterDetailScreen /></PageWrapper>} />
          <Route path="/runes" element={<PageWrapper><RuneScreen /></PageWrapper>} />
          <Route path="/summon" element={<PageWrapper><GachaScreen /></PageWrapper>} />
          <Route path="/arena" element={<PageWrapper><ArenaScreen /></PageWrapper>} />
          <Route path="/guild" element={<PageWrapper><GuildScreen /></PageWrapper>} />
          <Route path="/settings" element={<PageWrapper><SettingsScreen /></PageWrapper>} />
          <Route path="/daily-rewards" element={<PageWrapper><DailyRewardScreen /></PageWrapper>} />
          <Route path="/achievements" element={<PageWrapper><AchievementScreen /></PageWrapper>} />
          <Route path="/quests" element={<PageWrapper><QuestScreen /></PageWrapper>} />
          <Route path="/dungeons" element={<PageWrapper><DungeonScreen /></PageWrapper>} />
          <Route path="/loyalty" element={<PageWrapper><LoyaltyScreen /></PageWrapper>} />
        </Routes>
        <TutorialOverlay />
      </div>
    </BrowserRouter>
  );
}

export default App;
