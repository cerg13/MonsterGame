import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuildStore } from '../store/useGuildStore';
import {
  GUILD_RANK_INFO,
  GUILD_RANK_PERMISSIONS,
  GUILD_SHOP_ITEMS,
  GUILD_CHECKIN_REWARDS,
  GUILD_LEVEL_REQUIREMENTS,
  type GuildRank,
  type GuildMember,
  type Guild,
} from '../types/guild';
import './GuildScreen.css';

type GuildTab = 'home' | 'members' | 'war' | 'shop';

export const GuildScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GuildTab>('home');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const {
    guildId,
    guild,
    myRank,
    members,
    guildPoints,
    weeklyContribution,
    checkInStreak,
    purchasedItems,
    searchResults,
    isSearching,
    searchGuilds,
    joinGuild,
    leaveGuild,
    createGuild,
    promoteMember,
    demoteMember,
    kickMember,
    checkIn,
    canCheckIn,
    purchaseItem,
    canPurchaseItem,
  } = useGuildStore();

  // If not in a guild, show search/create options
  if (!guildId || !guild) {
    return (
      <div className="guild-screen">
        <div className="guild-header">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1>Guild</h1>
          <div className="header-spacer" />
        </div>

        <div className="no-guild-content">
          <div className="no-guild-icon">👥</div>
          <h2>No Guild</h2>
          <p>Join a guild to participate in guild wars, earn rewards, and play with friends!</p>

          <div className="no-guild-actions">
            <button className="primary-button" onClick={() => setShowSearchModal(true)}>
              🔍 Search Guilds
            </button>
            <button className="secondary-button" onClick={() => setShowCreateModal(true)}>
              ✨ Create Guild
            </button>
          </div>
        </div>

        {/* Search Modal */}
        {showSearchModal && (
          <GuildSearchModal
            searchResults={searchResults}
            isSearching={isSearching}
            onSearch={searchGuilds}
            onJoin={(id) => {
              const result = joinGuild(id);
              if (result.success) {
                setShowSearchModal(false);
              } else {
                alert(result.error);
              }
            }}
            onClose={() => setShowSearchModal(false)}
          />
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <GuildCreateModal
            onCreate={(name, tag, desc, icon) => {
              const result = createGuild(name, tag, desc, icon);
              if (result.success) {
                setShowCreateModal(false);
              } else {
                alert(result.error);
              }
            }}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </div>
    );
  }

  const permissions = myRank ? GUILD_RANK_PERMISSIONS[myRank] : null;
  const rankInfo = myRank ? GUILD_RANK_INFO[myRank] : null;
  const canCheckInToday = canCheckIn();
  const nextLevelReq = GUILD_LEVEL_REQUIREMENTS[guild.level + 1];

  return (
    <div className="guild-screen">
      <div className="guild-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>{guild.icon} [{guild.tag}] {guild.name}</h1>
        <div className="header-spacer" />
      </div>

      {/* Tab Navigation */}
      <div className="guild-tabs">
        <button
          className={`guild-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 Home
        </button>
        <button
          className={`guild-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          👥 Members
        </button>
        <button
          className={`guild-tab ${activeTab === 'war' ? 'active' : ''}`}
          onClick={() => setActiveTab('war')}
        >
          ⚔️ War
        </button>
        <button
          className={`guild-tab ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          🛒 Shop
        </button>
      </div>

      {/* Tab Content */}
      <div className="guild-content">
        {activeTab === 'home' && (
          <GuildHomeTab
            guild={guild}
            myRank={myRank}
            rankInfo={rankInfo}
            guildPoints={guildPoints}
            weeklyContribution={weeklyContribution}
            checkInStreak={checkInStreak}
            canCheckIn={canCheckInToday}
            nextLevelReq={nextLevelReq}
            onCheckIn={checkIn}
            onLeave={() => {
              const result = leaveGuild();
              if (!result.success) {
                alert(result.error);
              }
            }}
          />
        )}

        {activeTab === 'members' && (
          <GuildMembersTab
            members={members}
            myRank={myRank}
            permissions={permissions}
            onPromote={promoteMember}
            onDemote={demoteMember}
            onKick={kickMember}
          />
        )}

        {activeTab === 'war' && (
          <GuildWarTab guild={guild} />
        )}

        {activeTab === 'shop' && (
          <GuildShopTab
            guildPoints={guildPoints}
            purchasedItems={purchasedItems}
            canPurchaseItem={canPurchaseItem}
            onPurchase={purchaseItem}
          />
        )}
      </div>
    </div>
  );
};

// Home Tab Component
interface GuildHomeTabProps {
  guild: Guild;
  myRank: GuildRank | null;
  rankInfo: { name: string; color: string; icon: string } | null;
  guildPoints: number;
  weeklyContribution: number;
  checkInStreak: number;
  canCheckIn: boolean;
  nextLevelReq?: { exp: number; maxMembers: number };
  onCheckIn: () => { success: boolean; points: number; bonusReward?: { type: string; amount: number } };
  onLeave: () => void;
}

const GuildHomeTab: React.FC<GuildHomeTabProps> = ({
  guild,
  myRank,
  rankInfo,
  guildPoints,
  weeklyContribution,
  checkInStreak,
  canCheckIn,
  nextLevelReq,
  onCheckIn,
  onLeave,
}) => {
  const [checkInResult, setCheckInResult] = useState<{ points: number; bonus?: { type: string; amount: number } } | null>(null);

  const handleCheckIn = () => {
    const result = onCheckIn();
    if (result.success) {
      setCheckInResult({ points: result.points, bonus: result.bonusReward });
      setTimeout(() => setCheckInResult(null), 3000);
    }
  };

  return (
    <div className="guild-home">
      {/* Guild Info Card */}
      <div className="guild-info-card">
        <div className="guild-info-header">
          <span className="guild-icon-large">{guild.icon}</span>
          <div className="guild-info-main">
            <h2>[{guild.tag}] {guild.name}</h2>
            <p className="guild-description">{guild.description}</p>
          </div>
        </div>

        <div className="guild-stats-grid">
          <div className="guild-stat">
            <span className="stat-label">Level</span>
            <span className="stat-value">{guild.level}</span>
          </div>
          <div className="guild-stat">
            <span className="stat-label">Members</span>
            <span className="stat-value">{guild.memberCount}/{guild.maxMembers}</span>
          </div>
          <div className="guild-stat">
            <span className="stat-label">Ranking</span>
            <span className="stat-value">#{guild.weeklyRanking}</span>
          </div>
          <div className="guild-stat">
            <span className="stat-label">War Record</span>
            <span className="stat-value">{guild.warWins}W / {guild.warLosses}L</span>
          </div>
        </div>

        {nextLevelReq && (
          <div className="guild-exp-bar">
            <div className="exp-label">Guild EXP: {guild.experience.toLocaleString()} / {nextLevelReq.exp.toLocaleString()}</div>
            <div className="exp-bar-bg">
              <div
                className="exp-bar-fill"
                style={{ width: `${(guild.experience / nextLevelReq.exp) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* My Status Card */}
      <div className="my-status-card">
        <h3>My Status</h3>
        <div className="status-row">
          <span className="status-label">Rank</span>
          {rankInfo && (
            <span className="status-value" style={{ color: rankInfo.color }}>
              {rankInfo.icon} {rankInfo.name}
            </span>
          )}
        </div>
        <div className="status-row">
          <span className="status-label">Guild Points</span>
          <span className="status-value">🪙 {guildPoints}</span>
        </div>
        <div className="status-row">
          <span className="status-label">Weekly Contribution</span>
          <span className="status-value">📊 {weeklyContribution}</span>
        </div>
      </div>

      {/* Check-in Section */}
      <div className="checkin-card">
        <h3>Daily Check-in</h3>
        <div className="checkin-streak">
          {GUILD_CHECKIN_REWARDS.map((reward, index) => (
            <div
              key={reward.day}
              className={`checkin-day ${index < checkInStreak ? 'completed' : ''} ${index === checkInStreak ? 'current' : ''}`}
            >
              <span className="day-number">Day {reward.day}</span>
              <span className="day-reward">+{reward.guildPoints}</span>
              {reward.bonusReward && (
                <span className="day-bonus">🎁</span>
              )}
            </div>
          ))}
        </div>

        {checkInResult && (
          <div className="checkin-result">
            <span>+{checkInResult.points} Guild Points!</span>
            {checkInResult.bonus && (
              <span> +{checkInResult.bonus.amount} {checkInResult.bonus.type}!</span>
            )}
          </div>
        )}

        <button
          className={`checkin-button ${canCheckIn ? 'available' : 'disabled'}`}
          onClick={handleCheckIn}
          disabled={!canCheckIn}
        >
          {canCheckIn ? '📋 Check In' : '✅ Already Checked In'}
        </button>
      </div>

      {/* Leave Guild */}
      {myRank !== 'leader' && (
        <button className="leave-guild-button" onClick={onLeave}>
          Leave Guild
        </button>
      )}
    </div>
  );
};

// Members Tab Component
interface GuildMembersTabProps {
  members: GuildMember[];
  myRank: GuildRank | null;
  permissions: { canKick: boolean; canInvite: boolean; canPromote: boolean } | null;
  onPromote: (memberId: string) => { success: boolean; error?: string };
  onDemote: (memberId: string) => { success: boolean; error?: string };
  onKick: (memberId: string) => { success: boolean; error?: string };
}

const GuildMembersTab: React.FC<GuildMembersTabProps> = ({
  members,
  myRank,
  permissions,
  onPromote,
  onDemote,
  onKick,
}) => {
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const canManageMember = (member: GuildMember) => {
    if (!myRank || !permissions) return false;
    if (member.id === 'self') return false;
    if (member.rank === 'leader') return false;

    const rankPriority: Record<GuildRank, number> = {
      leader: 4,
      vice_leader: 3,
      senior: 2,
      member: 1,
    };

    return rankPriority[myRank] > rankPriority[member.rank];
  };

  return (
    <div className="guild-members">
      <div className="members-header">
        <h3>Guild Members ({members.length})</h3>
      </div>

      <div className="members-list">
        {members.map((member) => {
          const rankInfo = GUILD_RANK_INFO[member.rank];
          return (
            <div
              key={member.id}
              className={`member-row ${selectedMember?.id === member.id ? 'selected' : ''}`}
              onClick={() => setSelectedMember(member)}
            >
              <div className="member-main">
                <span className="member-rank" style={{ color: rankInfo.color }}>
                  {rankInfo.icon}
                </span>
                <span className="member-name">
                  {member.username}
                  {member.id === 'self' && <span className="you-tag">(You)</span>}
                </span>
                <span className="member-level">Lv.{member.level}</span>
              </div>
              <div className="member-stats">
                <span className="member-contribution">📊 {member.weeklyContribution}</span>
                <span className="member-active">{getTimeAgo(member.lastActive)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Detail Panel */}
      {selectedMember && (
        <div className="member-detail-panel">
          <div className="member-detail-header">
            <span
              className="detail-rank"
              style={{ color: GUILD_RANK_INFO[selectedMember.rank].color }}
            >
              {GUILD_RANK_INFO[selectedMember.rank].icon} {GUILD_RANK_INFO[selectedMember.rank].name}
            </span>
            <h4>{selectedMember.username}</h4>
          </div>

          <div className="member-detail-stats">
            <div className="detail-stat">
              <span className="label">Level</span>
              <span className="value">{selectedMember.level}</span>
            </div>
            <div className="detail-stat">
              <span className="label">Total Contribution</span>
              <span className="value">{selectedMember.contribution.toLocaleString()}</span>
            </div>
            <div className="detail-stat">
              <span className="label">Weekly Contribution</span>
              <span className="value">{selectedMember.weeklyContribution}</span>
            </div>
            <div className="detail-stat">
              <span className="label">Defense Power</span>
              <span className="value">{selectedMember.defenseTeamPower.toLocaleString()}</span>
            </div>
          </div>

          {canManageMember(selectedMember) && (
            <div className="member-actions">
              {permissions?.canPromote && selectedMember.rank !== 'vice_leader' && (
                <button
                  className="action-button promote"
                  onClick={() => {
                    const result = onPromote(selectedMember.id);
                    if (!result.success) alert(result.error);
                    else setSelectedMember(null);
                  }}
                >
                  ⬆️ Promote
                </button>
              )}
              {permissions?.canPromote && selectedMember.rank !== 'member' && (
                <button
                  className="action-button demote"
                  onClick={() => {
                    const result = onDemote(selectedMember.id);
                    if (!result.success) alert(result.error);
                    else setSelectedMember(null);
                  }}
                >
                  ⬇️ Demote
                </button>
              )}
              {permissions?.canKick && (
                <button
                  className="action-button kick"
                  onClick={() => {
                    if (confirm(`Kick ${selectedMember.username} from the guild?`)) {
                      const result = onKick(selectedMember.id);
                      if (!result.success) alert(result.error);
                      else setSelectedMember(null);
                    }
                  }}
                >
                  🚫 Kick
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// War Tab Component
interface GuildWarTabProps {
  guild: Guild;
}

const GuildWarTab: React.FC<GuildWarTabProps> = ({ guild }) => {
  return (
    <div className="guild-war">
      <div className="war-status-card">
        <div className="war-icon">⚔️</div>
        <h3>Guild War</h3>
        <p className="war-status">No active war</p>
        <p className="war-description">
          Guild wars happen every weekend. Compete against other guilds for rewards!
        </p>
      </div>

      <div className="war-stats-card">
        <h3>War Record</h3>
        <div className="war-record">
          <div className="record-stat wins">
            <span className="record-value">{guild.warWins}</span>
            <span className="record-label">Wins</span>
          </div>
          <div className="record-divider">-</div>
          <div className="record-stat losses">
            <span className="record-value">{guild.warLosses}</span>
            <span className="record-label">Losses</span>
          </div>
        </div>
        <div className="win-rate">
          Win Rate: {guild.warWins + guild.warLosses > 0
            ? Math.round((guild.warWins / (guild.warWins + guild.warLosses)) * 100)
            : 0}%
        </div>
      </div>

      <div className="war-rewards-preview">
        <h3>War Rewards</h3>
        <ul>
          <li>🪙 Guild Points based on performance</li>
          <li>📦 Exclusive war rewards</li>
          <li>🏆 Guild ranking points</li>
        </ul>
      </div>
    </div>
  );
};

// Shop Tab Component
interface GuildShopTabProps {
  guildPoints: number;
  purchasedItems: Record<string, number>;
  canPurchaseItem: (itemId: string) => { canPurchase: boolean; reason?: string };
  onPurchase: (itemId: string) => { success: boolean; error?: string };
}

const GuildShopTab: React.FC<GuildShopTabProps> = ({
  guildPoints,
  purchasedItems,
  canPurchaseItem,
  onPurchase,
}) => {
  return (
    <div className="guild-shop">
      <div className="shop-header">
        <h3>Guild Shop</h3>
        <span className="shop-points">🪙 {guildPoints} Guild Points</span>
      </div>

      <div className="shop-items">
        {GUILD_SHOP_ITEMS.map((item) => {
          const purchased = purchasedItems[item.id] || 0;
          const check = canPurchaseItem(item.id);

          return (
            <div key={item.id} className={`shop-item ${!check.canPurchase ? 'unavailable' : ''}`}>
              <span className="item-icon">{item.icon}</span>
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-desc">{item.description}</span>
                <span className="item-limit">
                  {purchased}/{item.weeklyLimit} this week
                </span>
              </div>
              <div className="item-purchase">
                <span className="item-cost">🪙 {item.cost}</span>
                <button
                  className="buy-button"
                  disabled={!check.canPurchase}
                  onClick={() => {
                    const result = onPurchase(item.id);
                    if (!result.success) {
                      alert(result.error);
                    }
                  }}
                >
                  Buy
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shop-reset-info">
        Weekly limits reset every Monday at 00:00 UTC
      </div>
    </div>
  );
};

// Search Modal Component
interface GuildSearchModalProps {
  searchResults: Guild[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onJoin: (guildId: string) => void;
  onClose: () => void;
}

const GuildSearchModal: React.FC<GuildSearchModalProps> = ({
  searchResults,
  isSearching,
  onSearch,
  onJoin,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Initial search with empty query
    onSearch('');
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content guild-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Search Guilds</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by name or tag..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
          />
        </div>

        <div className="search-results">
          {isSearching ? (
            <div className="searching">Searching...</div>
          ) : searchResults.length === 0 ? (
            <div className="no-results">No guilds found</div>
          ) : (
            searchResults.map((guild) => (
              <div key={guild.id} className="search-guild-row">
                <span className="search-guild-icon">{guild.icon}</span>
                <div className="search-guild-info">
                  <span className="search-guild-name">
                    [{guild.tag}] {guild.name}
                  </span>
                  <span className="search-guild-stats">
                    Lv.{guild.level} • {guild.memberCount}/{guild.maxMembers} members • Min Lv.{guild.minLevel}
                  </span>
                </div>
                <button
                  className="join-button"
                  disabled={guild.memberCount >= guild.maxMembers}
                  onClick={() => onJoin(guild.id)}
                >
                  {guild.memberCount >= guild.maxMembers ? 'Full' : 'Join'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Create Modal Component
interface GuildCreateModalProps {
  onCreate: (name: string, tag: string, description: string, icon: string) => void;
  onClose: () => void;
}

const GuildCreateModal: React.FC<GuildCreateModalProps> = ({ onCreate, onClose }) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚔️');

  const icons = ['⚔️', '🐉', '🦁', '🔥', '❄️', '⚡', '🌟', '💎', '🏆', '👑'];

  const handleCreate = () => {
    if (name.length < 3 || name.length > 20) {
      alert('Guild name must be 3-20 characters');
      return;
    }
    if (tag.length < 2 || tag.length > 4) {
      alert('Tag must be 2-4 characters');
      return;
    }
    onCreate(name, tag, description, icon);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content guild-create-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Guild</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="create-form">
          <div className="form-group">
            <label>Guild Name (3-20 characters)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter guild name"
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label>Tag (2-4 characters)</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              placeholder="ABC"
              maxLength={4}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your guild..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="icon-selector">
              {icons.map((i) => (
                <button
                  key={i}
                  className={`icon-option ${icon === i ? 'selected' : ''}`}
                  onClick={() => setIcon(i)}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="create-cost">
            <span>Creation Cost:</span>
            <span className="cost-value">💎 100 Crystals</span>
          </div>

          <button className="create-button" onClick={handleCreate}>
            Create Guild
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuildScreen;
