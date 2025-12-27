import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore, useTutorialStore } from '../store';
import { useSound } from '../hooks';
import { useTranslations, useLanguage } from '../localization';
import type { Language } from '../localization';
import './SettingsScreen.css';

type SettingsTab = 'sound' | 'account' | 'game' | 'about';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();
  const player = usePlayerStore((s) => s.player);
  const logout = usePlayerStore((s) => s.logout);
  const { resetTutorial, startTutorial } = useTutorialStore();

  const {
    masterVolume,
    musicVolume,
    sfxVolume,
    uiVolume,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    setUiVolume,
    isMuted,
    isMusicMuted,
    isSfxMuted,
    toggleMute,
    toggleMusicMute,
    toggleSfxMute,
    playUI,
  } = useSound();

  const [activeTab, setActiveTab] = useState<SettingsTab>('sound');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [battleSpeed, setBattleSpeed] = useState<1 | 2 | 3>(1);
  const [autoSkill, setAutoSkill] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleVolumeChange = (
    setter: (v: number) => void,
    value: number
  ) => {
    setter(value);
    playUI('button_click');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRestartTutorial = () => {
    resetTutorial();
    startTutorial();
    navigate('/');
  };

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang as Language);
  };

  const tabLabels: Record<SettingsTab, string> = {
    sound: t.settingsScreen.sound,
    account: t.settingsScreen.account,
    game: t.settingsScreen.title,
    about: t.settingsScreen.about,
  };

  return (
    <div className="settings-screen">
      {/* Header */}
      <div className="settings-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← {t.common.back}
        </button>
        <h1>{t.settingsScreen.title}</h1>
        <div style={{ width: 60 }} />
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {(['sound', 'account', 'game', 'about'] as SettingsTab[]).map((tab) => (
          <button
            key={tab}
            className={`settings-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'sound' && '🔊'}
            {tab === 'account' && '👤'}
            {tab === 'game' && '⚙️'}
            {tab === 'about' && 'ℹ️'}
            <span>{tabLabels[tab]}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="settings-content">
        {/* Sound Tab */}
        {activeTab === 'sound' && (
          <div className="sound-settings">
            {/* Master Volume */}
            <div className="setting-group">
              <div className="setting-header">
                <span className="setting-label">Master Volume</span>
                <button
                  className={`mute-toggle ${isMuted ? 'muted' : ''}`}
                  onClick={toggleMute}
                >
                  {isMuted ? '🔇' : '🔊'}
                </button>
              </div>
              <div className="volume-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVolume * 100}
                  onChange={(e) => handleVolumeChange(setMasterVolume, parseInt(e.target.value) / 100)}
                  disabled={isMuted}
                />
                <span className="volume-value">{Math.round(masterVolume * 100)}%</span>
              </div>
            </div>

            {/* Music Volume */}
            <div className="setting-group">
              <div className="setting-header">
                <span className="setting-label">Music Volume</span>
                <button
                  className={`mute-toggle ${isMusicMuted ? 'muted' : ''}`}
                  onClick={toggleMusicMute}
                >
                  {isMusicMuted ? '🔇' : '🎵'}
                </button>
              </div>
              <div className="volume-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume * 100}
                  onChange={(e) => handleVolumeChange(setMusicVolume, parseInt(e.target.value) / 100)}
                  disabled={isMuted || isMusicMuted}
                />
                <span className="volume-value">{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>

            {/* SFX Volume */}
            <div className="setting-group">
              <div className="setting-header">
                <span className="setting-label">Sound Effects</span>
                <button
                  className={`mute-toggle ${isSfxMuted ? 'muted' : ''}`}
                  onClick={toggleSfxMute}
                >
                  {isSfxMuted ? '🔇' : '🔔'}
                </button>
              </div>
              <div className="volume-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVolume * 100}
                  onChange={(e) => handleVolumeChange(setSfxVolume, parseInt(e.target.value) / 100)}
                  disabled={isMuted || isSfxMuted}
                />
                <span className="volume-value">{Math.round(sfxVolume * 100)}%</span>
              </div>
            </div>

            {/* UI Volume */}
            <div className="setting-group">
              <div className="setting-header">
                <span className="setting-label">UI Sounds</span>
              </div>
              <div className="volume-slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={uiVolume * 100}
                  onChange={(e) => handleVolumeChange(setUiVolume, parseInt(e.target.value) / 100)}
                  disabled={isMuted || isSfxMuted}
                />
                <span className="volume-value">{Math.round(uiVolume * 100)}%</span>
              </div>
            </div>

            <div className="setting-note">
              Sound settings are automatically saved
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="account-settings">
            {player ? (
              <>
                <div className="account-info">
                  <div className="avatar">
                    <span>{player.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="account-details">
                    <h3>{player.username}</h3>
                    <span className="account-level">Level {player.level}</span>
                    {player.email && (
                      <span className="account-email">{player.email}</span>
                    )}
                  </div>
                </div>

                <div className="account-stats">
                  <div className="stat-item">
                    <span className="stat-label">Arena Rank</span>
                    <span className="stat-value">#{player.arenaRank || 'N/A'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Arena Tier</span>
                    <span className="stat-value tier">{player.arenaTier || 'Bronze'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Login Streak</span>
                    <span className="stat-value">{player.loginStreak || 0} days</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Member Since</span>
                    <span className="stat-value">
                      {player.createdAt ? new Date(player.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="account-actions">
                  <button className="action-button">
                    Change Password
                  </button>
                  <button className="action-button">
                    Link Account
                  </button>
                  <button
                    className="action-button danger"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="not-logged-in">
                <p>You are not logged in</p>
                <button className="login-button" onClick={() => navigate('/login')}>
                  Login / Register
                </button>
              </div>
            )}
          </div>
        )}

        {/* Game Tab */}
        {activeTab === 'game' && (
          <div className="game-settings">
            {/* Battle Speed */}
            <div className="setting-group">
              <span className="setting-label">{t.battle.speed}</span>
              <div className="speed-options">
                {([1, 2, 3] as const).map((speed) => (
                  <button
                    key={speed}
                    className={`speed-option ${battleSpeed === speed ? 'active' : ''}`}
                    onClick={() => setBattleSpeed(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Skill */}
            <div className="setting-group">
              <span className="setting-label">{t.battle.auto}</span>
              <button
                className={`toggle-button ${autoSkill ? 'active' : ''}`}
                onClick={() => setAutoSkill(!autoSkill)}
              >
                <span className="toggle-slider" />
              </button>
            </div>

            {/* Notifications */}
            <div className="setting-group">
              <span className="setting-label">{t.settingsScreen.notifications}</span>
              <button
                className={`toggle-button ${notifications ? 'active' : ''}`}
                onClick={() => setNotifications(!notifications)}
              >
                <span className="toggle-slider" />
              </button>
            </div>

            {/* Language */}
            <div className="setting-group">
              <span className="setting-label">{t.settingsScreen.language}</span>
              <select
                className="language-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Tutorial */}
            <div className="setting-group">
              <span className="setting-label">{t.tutorial.welcome}</span>
              <button className="restart-tutorial-btn" onClick={handleRestartTutorial}>
                {t.tutorial.next}
              </button>
            </div>

            {/* Cache */}
            <div className="setting-group">
              <span className="setting-label">Clear Cache</span>
              <button className="clear-cache-btn">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="about-settings">
            <div className="game-logo">
              <span className="logo-icon">🐉</span>
              <h2>Monster Battle</h2>
              <span className="version">Version 0.1.0 MVP</span>
            </div>

            <div className="about-links">
              <button className="about-link">
                <span>📜</span> Terms of Service
              </button>
              <button className="about-link">
                <span>🔒</span> Privacy Policy
              </button>
              <button className="about-link">
                <span>📧</span> Contact Support
              </button>
              <button className="about-link">
                <span>⭐</span> Rate Us
              </button>
              <button className="about-link">
                <span>📱</span> Follow Us
              </button>
            </div>

            <div className="credits">
              <h4>Credits</h4>
              <p>Developed with React + TypeScript</p>
              <p>Battle Engine: Custom ATB System</p>
              <p>© 2024 Monster Battle Team</p>
            </div>

            <div className="debug-section">
              <h4>Debug Info</h4>
              <p>Build: Development</p>
              <p>Platform: Web</p>
              <p>Session ID: {Math.random().toString(36).substr(2, 9)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
