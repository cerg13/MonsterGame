import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore, useDailyRewardStore, useAchievementStore, useQuestStore } from '../../../store';
import { GoldIcon, CrystalIcon, EnergyIcon } from '../../../assets/icons/items';
import { useAudio } from '../../../hooks/useAudio';
import { useTranslations } from '../../../localization';
import './MainMenu.css';

interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  playClick: () => void;
  playHover: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ icon, label, onClick, disabled, playClick, playHover }) => (
  <button
    className={`menu-button ${disabled ? 'disabled' : ''}`}
    onClick={() => {
      playClick();
      onClick();
    }}
    onMouseEnter={playHover}
    disabled={disabled}
  >
    <span className="menu-button-icon">{icon}</span>
    <span className="menu-button-label">{label}</span>
  </button>
);

// Menu icons as SVG components
const CampaignIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <rect x="8" y="8" width="32" height="32" rx="4" fill="#4a90d9" />
    <path d="M12 16 L24 12 L36 16 L36 32 L24 36 L12 32 Z" fill="#2d5a87" />
    <circle cx="20" cy="22" r="3" fill="#1dd1a1" />
    <circle cx="28" cy="26" r="2" fill="#ff6b6b" />
    <path d="M16 28 L22 24 L28 28 L34 22" stroke="#feca57" strokeWidth="2" fill="none" />
  </svg>
);

const BattleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <path d="M12 36 L24 8 L36 36" stroke="#a55eea" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M36 36 L24 8 L12 36" stroke="#48dbfb" strokeWidth="4" fill="none" strokeLinecap="round" transform="rotate(90 24 24)" />
  </svg>
);

const MonstersIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <ellipse cx="24" cy="28" rx="16" ry="14" fill="#1dd1a1" />
    <ellipse cx="24" cy="26" rx="12" ry="10" fill="#10b981" opacity="0.5" />
    <circle cx="18" cy="24" r="4" fill="#fff" />
    <circle cx="30" cy="24" r="4" fill="#fff" />
    <circle cx="19" cy="25" r="2" fill="#000" />
    <circle cx="31" cy="25" r="2" fill="#000" />
    <path d="M18 34 Q24 38 30 34" stroke="#000" strokeWidth="2" fill="none" />
    <path d="M16 14 Q14 8 18 10 Q20 6 24 10 Q28 6 30 10 Q34 8 32 14" fill="#ff6b6b" />
  </svg>
);

const RunesIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="runeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#48dbfb" />
        <stop offset="100%" stopColor="#0066cc" />
      </linearGradient>
    </defs>
    <path d="M24 6 L40 16 L40 32 L24 42 L8 32 L8 16 Z" fill="url(#runeGrad)" />
    <path d="M24 12 L34 18 L34 30 L24 36 L14 30 L14 18 Z" fill="#1a1a2e" />
    <circle cx="24" cy="24" r="6" fill="#48dbfb" opacity="0.8" />
  </svg>
);

const SummonIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <radialGradient id="summonGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#ff8c00" />
      </radialGradient>
    </defs>
    <circle cx="24" cy="24" r="16" fill="#1a1a2e" />
    <path d="M24 8 L26 20 L38 20 L28 28 L32 40 L24 32 L16 40 L20 28 L10 20 L22 20 Z" fill="url(#summonGrad)" />
  </svg>
);

const ArenaIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <path d="M24 6 L30 18 L18 18 Z" fill="#ffd700" />
    <rect x="16" y="18" width="16" height="20" fill="#ffd700" />
    <rect x="12" y="38" width="24" height="6" rx="2" fill="#cc9900" />
    <ellipse cx="24" cy="28" rx="6" ry="4" fill="#cc9900" />
  </svg>
);

const GuildIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="16" r="8" fill="#a55eea" />
    <ellipse cx="24" cy="36" rx="14" ry="8" fill="#a55eea" />
    <circle cx="12" cy="20" r="6" fill="#8b5cf6" />
    <ellipse cx="12" cy="36" rx="8" ry="6" fill="#8b5cf6" />
    <circle cx="36" cy="20" r="6" fill="#8b5cf6" />
    <ellipse cx="36" cy="36" rx="8" ry="6" fill="#8b5cf6" />
  </svg>
);

const DungeonIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="dungeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4a90d9" />
        <stop offset="100%" stopColor="#2d5a87" />
      </linearGradient>
    </defs>
    {/* Stone archway */}
    <path d="M8 40 L8 16 Q8 8 16 8 L32 8 Q40 8 40 16 L40 40" fill="url(#dungeonGrad)" />
    {/* Inner dark opening */}
    <path d="M14 40 L14 18 Q14 14 20 14 L28 14 Q34 14 34 18 L34 40" fill="#1a1a2e" />
    {/* Skull decoration */}
    <circle cx="24" cy="28" r="6" fill="#ddd" />
    <circle cx="21" cy="27" r="1.5" fill="#1a1a2e" />
    <circle cx="27" cy="27" r="1.5" fill="#1a1a2e" />
    <path d="M21 32 L23 31 L25 32 L27 31" stroke="#1a1a2e" strokeWidth="1" fill="none" />
    {/* Flames on sides */}
    <ellipse cx="11" cy="30" rx="2" ry="4" fill="#ff6b6b" />
    <ellipse cx="37" cy="30" rx="2" ry="4" fill="#ff6b6b" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="8" fill="#666" />
    <circle cx="24" cy="24" r="4" fill="#888" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
      <rect
        key={i}
        x="22"
        y="4"
        width="4"
        height="8"
        rx="2"
        fill="#666"
        transform={`rotate(${angle} 24 24)`}
      />
    ))}
  </svg>
);

const LoyaltyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="loyaltyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#ff8c00" />
      </linearGradient>
    </defs>
    {/* Crown base */}
    <path d="M8 32 L12 16 L18 24 L24 12 L30 24 L36 16 L40 32 Z" fill="url(#loyaltyGrad)" />
    {/* Crown band */}
    <rect x="8" y="32" width="32" height="6" rx="2" fill="#cc9900" />
    {/* Gems */}
    <circle cx="12" cy="18" r="2" fill="#e74c3c" />
    <circle cx="24" cy="14" r="3" fill="#3498db" />
    <circle cx="36" cy="18" r="2" fill="#2ecc71" />
    {/* Star highlight */}
    <path d="M24 20 L25 23 L28 23 L26 25 L27 28 L24 26 L21 28 L22 25 L20 23 L23 23 Z" fill="#fff" opacity="0.8" />
  </svg>
);

const DailyRewardIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="giftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff6b6b" />
        <stop offset="100%" stopColor="#ee5a5a" />
      </linearGradient>
    </defs>
    <rect x="8" y="20" width="32" height="22" rx="3" fill="url(#giftGrad)" />
    <rect x="8" y="14" width="32" height="10" rx="2" fill="#feca57" />
    <rect x="22" y="14" width="4" height="28" fill="#feca57" />
    <path d="M24 14 Q18 8 14 12 Q10 16 16 20 L24 14 Z" fill="#ff6b6b" />
    <path d="M24 14 Q30 8 34 12 Q38 16 32 20 L24 14 Z" fill="#ff6b6b" />
    <circle cx="24" cy="14" r="3" fill="#feca57" />
  </svg>
);

const AchievementIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#ffaa00" />
      </linearGradient>
    </defs>
    {/* Trophy cup */}
    <path d="M16 12 L32 12 L30 28 L18 28 Z" fill="url(#trophyGrad)" />
    {/* Handles */}
    <path d="M16 14 Q8 14 8 22 Q8 26 14 26" stroke="#ffd700" strokeWidth="3" fill="none" />
    <path d="M32 14 Q40 14 40 22 Q40 26 34 26" stroke="#ffd700" strokeWidth="3" fill="none" />
    {/* Base */}
    <rect x="20" y="28" width="8" height="6" fill="#cc9900" />
    <rect x="14" y="34" width="20" height="6" rx="2" fill="#cc9900" />
    {/* Star */}
    <path d="M24 16 L25.5 20 L30 20.5 L27 23.5 L28 28 L24 26 L20 28 L21 23.5 L18 20.5 L22.5 20 Z" fill="#fff" opacity="0.9" />
  </svg>
);

const QuestIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <defs>
      <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f5deb3" />
        <stop offset="100%" stopColor="#deb887" />
      </linearGradient>
    </defs>
    {/* Scroll body */}
    <rect x="12" y="10" width="24" height="28" rx="2" fill="url(#scrollGrad)" />
    {/* Scroll rolls */}
    <ellipse cx="12" cy="14" rx="4" ry="4" fill="#d2b48c" />
    <ellipse cx="12" cy="34" rx="4" ry="4" fill="#d2b48c" />
    <ellipse cx="36" cy="14" rx="4" ry="4" fill="#d2b48c" />
    <ellipse cx="36" cy="34" rx="4" ry="4" fill="#d2b48c" />
    {/* Lines */}
    <rect x="16" y="18" width="16" height="2" rx="1" fill="#8b7355" />
    <rect x="16" y="23" width="12" height="2" rx="1" fill="#8b7355" />
    <rect x="16" y="28" width="14" height="2" rx="1" fill="#8b7355" />
    {/* Checkmark */}
    <circle cx="34" cy="34" r="8" fill="#1dd1a1" />
    <path d="M30 34 L33 37 L38 31" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const player = usePlayerStore((state) => state.player);
  const canClaimReward = useDailyRewardStore((state) => state.canClaimToday);
  const unclaimedAchievements = useAchievementStore((state) => state.getUnclaimedCount());
  const unclaimedQuests = useQuestStore((state) => state.getUnclaimedCount());
  const { playClick, playHover, playMusic, stopMusic } = useAudio();

  // Start menu music on mount
  useEffect(() => {
    playMusic('menu');
    return () => stopMusic();
  }, [playMusic, stopMusic]);

  return (
    <div className="main-menu">
      <div className="main-menu-header">
        <h1 className="game-title">{t.mainMenu.title}</h1>
      </div>

      <div className="resource-bar">
        <div className="resource">
          <CrystalIcon size={24} />
          <span className="resource-value crystal">{player?.crystals ?? 0}</span>
        </div>
        <div className="resource">
          <GoldIcon size={24} />
          <span className="resource-value gold">{player?.gold ?? 0}</span>
        </div>
        <div className="resource">
          <EnergyIcon size={24} />
          <span className="resource-value energy">
            {player?.energy ?? 0}/{player?.maxEnergy ?? 120}
          </span>
        </div>
      </div>

      <div className="menu-grid">
        <MenuButton
          icon={<CampaignIcon />}
          label={t.mainMenu.campaign}
          onClick={() => navigate('/campaign')}
          playClick={playClick}
          playHover={playHover}
        />
        <MenuButton
          icon={<BattleIcon />}
          label={t.mainMenu.quickBattle}
          onClick={() => navigate('/battle')}
          playClick={playClick}
          playHover={playHover}
        />
        <MenuButton
          icon={<MonstersIcon />}
          label={t.mainMenu.monsters}
          onClick={() => navigate('/monsters')}
          playClick={playClick}
          playHover={playHover}
        />
        <MenuButton
          icon={<RunesIcon />}
          label={t.mainMenu.runes}
          onClick={() => navigate('/runes')}
          playClick={playClick}
          playHover={playHover}
        />
        <MenuButton
          icon={<SummonIcon />}
          label={t.mainMenu.summon}
          onClick={() => navigate('/summon')}
          playClick={playClick}
          playHover={playHover}
        />
        <MenuButton
          icon={<ArenaIcon />}
          label={t.mainMenu.arena}
          onClick={() => navigate('/arena')}
          playClick={playClick}
          playHover={playHover}
        />
        <MenuButton
          icon={<GuildIcon />}
          label={t.mainMenu.guild}
          onClick={() => navigate('/guild')}
          playClick={playClick}
          playHover={playHover}
        />
        <MenuButton
          icon={<DungeonIcon />}
          label={t.mainMenu.dungeons || 'Dungeons'}
          onClick={() => navigate('/dungeons')}
          playClick={playClick}
          playHover={playHover}
        />
        <MenuButton
          icon={<LoyaltyIcon />}
          label={t.mainMenu.loyalty || 'Loyalty'}
          onClick={() => navigate('/loyalty')}
          playClick={playClick}
          playHover={playHover}
        />
        <div className="menu-button-wrapper">
          <MenuButton
            icon={<DailyRewardIcon />}
            label={t.mainMenu.dailyRewards}
            onClick={() => navigate('/daily-rewards')}
            playClick={playClick}
            playHover={playHover}
          />
          {canClaimReward() && <span className="notification-badge">!</span>}
        </div>
        <div className="menu-button-wrapper">
          <MenuButton
            icon={<AchievementIcon />}
            label={t.mainMenu.achievements}
            onClick={() => navigate('/achievements')}
            playClick={playClick}
            playHover={playHover}
          />
          {unclaimedAchievements > 0 && (
            <span className="notification-badge">{unclaimedAchievements}</span>
          )}
        </div>
        <div className="menu-button-wrapper">
          <MenuButton
            icon={<QuestIcon />}
            label={t.mainMenu.quests}
            onClick={() => navigate('/quests')}
            playClick={playClick}
            playHover={playHover}
          />
          {unclaimedQuests > 0 && (
            <span className="notification-badge">{unclaimedQuests}</span>
          )}
        </div>
        <MenuButton
          icon={<SettingsIcon />}
          label={t.mainMenu.settings}
          onClick={() => navigate('/settings')}
          playClick={playClick}
          playHover={playHover}
        />
      </div>

      <div className="main-menu-footer">
        <p className="version">{t.mainMenu.version} 0.1.0 - MVP</p>
      </div>
    </div>
  );
};

export default MainMenu;
