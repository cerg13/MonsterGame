import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useLoyaltyStore,
  VIP_LEVELS,
  LP_SHOP_ITEMS,
  LP_CONFIG,
  selectLoyaltyPoints,
  selectVipLevel,
  selectVisitStreak,
  selectTotalSpending,
  selectVisitHistory,
  selectTotalVisits,
} from '../store/useLoyaltyStore';
import type { VipLevel, LpShopItem } from '../store/useLoyaltyStore';
import { usePlayerStore } from '../store';
import { DailyCheckInCalendar } from '../components/loyalty';
import { SpinWheel, ScratchCard, Bingo } from '../components/minigames';
import './LoyaltyScreen.css';

type TabType = 'overview' | 'checkin' | 'shop' | 'history' | 'minigames';

export const LoyaltyScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSpinDate, setLastSpinDate] = useState<Date | null>(null);
  const [lastScratchDate, setLastScratchDate] = useState<Date | null>(null);
  const [lastBingoDate, setLastBingoDate] = useState<Date | null>(null);

  // Loyalty store
  const loyaltyPoints = useLoyaltyStore(selectLoyaltyPoints);
  const vipLevel = useLoyaltyStore(selectVipLevel);
  const visitStreak = useLoyaltyStore(selectVisitStreak);
  const totalSpending = useLoyaltyStore(selectTotalSpending);
  const visitHistory = useLoyaltyStore(selectVisitHistory);
  const totalVisits = useLoyaltyStore(selectTotalVisits);

  const {
    recordVisit,
    recordReceipt,
    purchaseItem,
    canPurchaseItem,
    getNextVipLevel,
    getProgressToNextVip,
    claimStreakBonus,
    streakBonusesClaimed,
  } = useLoyaltyStore();

  // Player store for applying rewards
  const { player, updateResources, addDevilmons } = usePlayerStore();

  const vipConfig = VIP_LEVELS[vipLevel];
  const nextVipLevel = getNextVipLevel();
  const vipProgress = getProgressToNextVip();

  // Calculate discounted price
  const getDiscountedPrice = (item: LpShopItem): number => {
    const discount = VIP_LEVELS[vipLevel].shopDiscount;
    return Math.floor(item.lpCost * (1 - discount));
  };

  // Handle shop purchase
  const handlePurchase = (item: LpShopItem) => {
    const { canPurchase, reason } = canPurchaseItem(item.id);
    if (!canPurchase) {
      setPurchaseMessage({ type: 'error', text: reason || 'Cannot purchase' });
      setTimeout(() => setPurchaseMessage(null), 3000);
      return;
    }

    const result = purchaseItem(item.id);
    if (!result.success) {
      setPurchaseMessage({ type: 'error', text: result.error || 'Purchase failed' });
      setTimeout(() => setPurchaseMessage(null), 3000);
      return;
    }

    // Apply reward to player
    if (player) {
      switch (item.type) {
        case 'energy':
          updateResources({ energy: Math.min(player.energy + item.amount, player.maxEnergy * 2) });
          break;
        case 'crystals':
          updateResources({ crystals: player.crystals + item.amount });
          break;
        case 'gold':
          updateResources({ gold: player.gold + item.amount });
          break;
        case 'devilmon':
          addDevilmons(item.amount);
          break;
        // summonScroll, mysticalScroll, monster would need inventory system
      }
    }

    setPurchaseMessage({ type: 'success', text: `Purchased ${item.name}!` });
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  // Simulate visit (for testing)
  const handleSimulateVisit = () => {
    const result = recordVisit();
    if (result.lpEarned > 0) {
      setPurchaseMessage({ type: 'success', text: `+${result.lpEarned} LP! Streak: ${result.newStreak} days` });
    } else {
      setPurchaseMessage({ type: 'error', text: 'Already visited today!' });
    }
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  // Simulate receipt
  const handleSimulateReceipt = (amount: number) => {
    const result = recordReceipt(amount);
    setPurchaseMessage({ type: 'success', text: `+${result.lpEarned} LP from receipt!` });
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  // VIP badge color
  const getVipColor = (level: VipLevel): string => {
    const colors: Record<VipLevel, string> = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
      diamond: '#b9f2ff',
    };
    return colors[level];
  };

  // Get item icon
  const getItemIcon = (type: string): string => {
    const icons: Record<string, string> = {
      energy: '\u26A1',
      crystals: '\uD83D\uDC8E',
      gold: '\uD83D\uDCB0',
      summonScroll: '\uD83D\uDCDC',
      mysticalScroll: '\u2728',
      devilmon: '\uD83D\uDE08',
      monster: '\uD83D\uDC32',
    };
    return icons[type] || '\uD83C\uDF81';
  };

  return (
    <div className="loyalty-screen">
      {/* Background effects */}
      <div className="loyalty-bg">
        <div className="bg-gradient" />
        <div className="bg-particles" />
      </div>

      {/* Header */}
      <div className="loyalty-header">
        <button className="back-button" onClick={() => navigate('/')}>
          &larr; Back
        </button>
        <h1>Loyalty Program</h1>
        <div className="lp-display">
          <span className="lp-icon">LP</span>
          <span className="lp-amount">{loyaltyPoints.toLocaleString()}</span>
        </div>
      </div>

      {/* VIP Badge */}
      <div className="vip-badge-container">
        <div className="vip-badge" style={{ borderColor: getVipColor(vipLevel) }}>
          <span className="vip-icon" style={{ color: getVipColor(vipLevel) }}>
            {vipLevel === 'diamond' ? '\uD83D\uDC8E' : '\u2B50'}
          </span>
          <span className="vip-level">{vipConfig.name}</span>
          <span className="vip-member">VIP Member</span>
        </div>
        {nextVipLevel && (
          <div className="vip-progress">
            <div className="vip-progress-bar">
              <div
                className="vip-progress-fill"
                style={{
                  width: `${vipProgress.progress}%`,
                  background: `linear-gradient(90deg, ${getVipColor(vipLevel)}, ${getVipColor(nextVipLevel)})`
                }}
              />
            </div>
            <div className="vip-progress-text">
              {totalSpending.toLocaleString()}\u20BD / {vipProgress.required.toLocaleString()}\u20BD to {VIP_LEVELS[nextVipLevel].name}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="loyalty-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkin')}
        >
          📅 Daily Check-In
        </button>
        <button
          className={`tab-button ${activeTab === 'shop' ? 'active' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          LP Shop
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`tab-button ${activeTab === 'minigames' ? 'active' : ''}`}
          onClick={() => setActiveTab('minigames')}
        >
          🎮 Mini-Games
        </button>
      </div>

      {/* Purchase message */}
      {purchaseMessage && (
        <div className={`purchase-message ${purchaseMessage.type}`}>
          {purchaseMessage.text}
        </div>
      )}

      {/* Content */}
      <div className="loyalty-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">\uD83D\uDD25</span>
                <span className="stat-value">{visitStreak}</span>
                <span className="stat-label">Visit Streak</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">\uD83C\uDFE0</span>
                <span className="stat-value">{totalVisits}</span>
                <span className="stat-label">Total Visits</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">\uD83D\uDCB3</span>
                <span className="stat-value">{totalSpending.toLocaleString()}\u20BD</span>
                <span className="stat-label">Total Spending</span>
              </div>
              <div className="stat-card">
                <span className="stat-icon">\u2B06\uFE0F</span>
                <span className="stat-value">x{vipConfig.lpMultiplier}</span>
                <span className="stat-label">LP Multiplier</span>
              </div>
            </div>

            {/* VIP Benefits */}
            <div className="benefits-section">
              <h2>Your VIP Benefits</h2>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <span className="benefit-icon">\u26A1</span>
                  <span className="benefit-text">+{vipConfig.maxEnergyBonus} Max Energy</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">\uD83C\uDFF7\uFE0F</span>
                  <span className="benefit-text">{Math.round(vipConfig.shopDiscount * 100)}% Shop Discount</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">\u2B50</span>
                  <span className="benefit-text">x{vipConfig.lpMultiplier} LP Earnings</span>
                </div>
              </div>
            </div>

            {/* Streak Bonuses */}
            <div className="streak-section">
              <h2>Visit Streak Bonuses</h2>
              <div className="streak-grid">
                {[2, 3, 5, 7].map((days) => {
                  const bonus = LP_CONFIG.streakBonuses[days];
                  const multiplier = LP_CONFIG.streakMultipliers[days];
                  const canClaim = visitStreak >= days && !streakBonusesClaimed[days] && bonus;
                  const claimed = streakBonusesClaimed[days];
                  const locked = visitStreak < days;

                  return (
                    <div
                      key={days}
                      className={`streak-item ${claimed ? 'claimed' : ''} ${canClaim ? 'can-claim' : ''} ${locked ? 'locked' : ''}`}
                    >
                      <div className="streak-day">{days} Days</div>
                      <div className="streak-bonus">
                        <span>+{Math.round((multiplier - 1) * 100)}% LP</span>
                        {bonus?.energy && <span>+{bonus.energy} Energy</span>}
                        {bonus?.summonScrolls && <span>+{bonus.summonScrolls} Scroll</span>}
                        {bonus?.mysticalScrolls && <span>+{bonus.mysticalScrolls} Mystical</span>}
                      </div>
                      {claimed && <span className="streak-check">\u2713</span>}
                      {canClaim && (
                        <button
                          className="claim-streak-btn"
                          onClick={() => claimStreakBonus(days)}
                        >
                          Claim
                        </button>
                      )}
                      {locked && <span className="streak-lock">\uD83D\uDD12</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test buttons (for development) */}
            <div className="test-section">
              <h2>Restaurant Visit (Test)</h2>
              <div className="test-buttons">
                <button className="test-btn visit" onClick={handleSimulateVisit}>
                  \uD83C\uDFE0 Record Visit
                </button>
                <button className="test-btn receipt" onClick={() => handleSimulateReceipt(500)}>
                  \uD83E\uDDFE Receipt 500\u20BD
                </button>
                <button className="test-btn receipt" onClick={() => handleSimulateReceipt(1000)}>
                  \uD83E\uDDFE Receipt 1000\u20BD
                </button>
                <button className="test-btn receipt" onClick={() => handleSimulateReceipt(2000)}>
                  \uD83E\uDDFE Receipt 2000\u20BD
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Check-In Tab */}
        {activeTab === 'checkin' && (
          <div className="checkin-tab">
            <DailyCheckInCalendar />
          </div>
        )}

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div className="shop-tab">
            <div className="shop-header">
              <h2>LP Shop</h2>
              {vipConfig.shopDiscount > 0 && (
                <span className="discount-badge">
                  {Math.round(vipConfig.shopDiscount * 100)}% VIP Discount Active!
                </span>
              )}
            </div>

            <div className="shop-grid">
              {LP_SHOP_ITEMS.map((item) => {
                const discountedPrice = getDiscountedPrice(item);
                const hasDiscount = discountedPrice < item.lpCost;
                const { canPurchase, reason } = canPurchaseItem(item.id);

                return (
                  <div
                    key={item.id}
                    className={`shop-item ${!canPurchase ? 'disabled' : ''}`}
                  >
                    <div className="item-icon">{getItemIcon(item.type)}</div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-description">{item.description}</div>
                    <div className="item-price">
                      {hasDiscount && (
                        <span className="original-price">{item.lpCost} LP</span>
                      )}
                      <span className="current-price">{discountedPrice} LP</span>
                    </div>
                    {item.weeklyLimit && (
                      <div className="item-limit">Weekly limit: {item.weeklyLimit}</div>
                    )}
                    {item.monthlyLimit && (
                      <div className="item-limit">Monthly limit: {item.monthlyLimit}</div>
                    )}
                    <button
                      className="buy-button"
                      onClick={() => handlePurchase(item)}
                      disabled={!canPurchase}
                      title={reason}
                    >
                      {canPurchase ? 'Buy' : reason}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="history-tab">
            <h2>LP History</h2>
            {visitHistory.length === 0 ? (
              <div className="no-history">
                <span className="no-history-icon">\uD83D\uDCDD</span>
                <p>No loyalty activity yet</p>
                <p>Visit the restaurant to start earning LP!</p>
              </div>
            ) : (
              <div className="history-list">
                {visitHistory.map((entry) => (
                  <div key={entry.id} className={`history-item ${entry.type}`}>
                    <div className="history-icon">
                      {entry.type === 'visit' && '\uD83C\uDFE0'}
                      {entry.type === 'receipt' && '\uD83E\uDDFE'}
                      {entry.type === 'referral' && '\uD83D\uDC65'}
                      {entry.type === 'review' && '\u2B50'}
                      {entry.type === 'social' && '\uD83D\uDCF1'}
                      {entry.type === 'birthday' && '\uD83C\uDF82'}
                    </div>
                    <div className="history-details">
                      <span className="history-description">{entry.description}</span>
                      <span className="history-date">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="history-lp">+{entry.lpEarned} LP</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mini-Games Tab */}
        {activeTab === 'minigames' && (
          <div className="minigames-tab">
            <h2 className="tab-title">🎮 Loyalty Mini-Games</h2>
            <p className="tab-description">
              Play daily mini-games to earn bonus rewards and LP!
            </p>

            <div className="minigames-grid">
              <SpinWheel
                lastSpinDate={lastSpinDate}
                onWin={(prize) => {
                  setLastSpinDate(new Date());

                  // Apply rewards based on prize type
                  if (player) {
                    switch (prize.type) {
                      case 'crystals':
                        updateResources({ crystals: player.crystals + prize.amount });
                        break;
                      case 'gold':
                        updateResources({ gold: player.gold + prize.amount });
                        break;
                      case 'energy':
                        updateResources({ energy: Math.min(player.energy + prize.amount, player.maxEnergy * 2) });
                        break;
                      case 'scroll':
                        // Add scroll to inventory when system is implemented
                        break;
                    }
                  }
                }}
              />

              <ScratchCard
                lastPlayDate={lastScratchDate}
                onWin={(prize) => {
                  setLastScratchDate(new Date());

                  // Apply rewards based on prize type
                  if (player) {
                    switch (prize.type) {
                      case 'crystals':
                        updateResources({ crystals: player.crystals + prize.amount });
                        break;
                      case 'gold':
                        updateResources({ gold: player.gold + prize.amount });
                        break;
                      case 'energy':
                        updateResources({ energy: Math.min(player.energy + prize.amount, player.maxEnergy * 2) });
                        break;
                      case 'scroll':
                        // Add scroll to inventory when system is implemented
                        break;
                    }
                  }
                }}
              />

              <Bingo
                lastPlayDate={lastBingoDate}
                onWin={(prize) => {
                  setLastBingoDate(new Date());

                  // Apply rewards based on prize type
                  if (player) {
                    switch (prize.type) {
                      case 'crystals':
                        updateResources({ crystals: player.crystals + prize.amount });
                        break;
                      case 'gold':
                        updateResources({ gold: player.gold + prize.amount });
                        break;
                      case 'energy':
                        updateResources({ energy: Math.min(player.energy + prize.amount, player.maxEnergy * 2) });
                        break;
                      case 'scroll':
                        // Add scroll to inventory when system is implemented
                        break;
                    }

                    // Four corners and full card have bonus gold
                    if (prize.name.includes('Gold')) {
                      updateResources({ gold: player.gold + 25000 });
                    }
                    if (prize.name.includes('Scroll')) {
                      // Add mystical scroll when implemented
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoyaltyScreen;
