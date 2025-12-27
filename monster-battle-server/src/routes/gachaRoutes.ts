import { Router, Request, Response } from 'express';
import { authMiddleware, users } from '../middleware/auth';
import { gachaService } from '../services/GachaService';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Monster pool for gacha
const monsterPool = [
  { templateId: 'fire_phoenix', rarity: 'ssr' as const, weight: 1, isFeatured: false },
  { templateId: 'water_dragon', rarity: 'ssr' as const, weight: 1, isFeatured: false },
  { templateId: 'wind_griffin', rarity: 'ssr' as const, weight: 1, isFeatured: false },
  { templateId: 'light_archangel', rarity: 'ssr' as const, weight: 1, isFeatured: false },
  { templateId: 'dark_demon', rarity: 'ssr' as const, weight: 1, isFeatured: false },
  { templateId: 'fire_dragon', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'fire_knight', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'water_mage', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'water_knight', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'wind_assassin', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'wind_archer', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'light_paladin', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'dark_knight', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'dark_witch', rarity: 'sr' as const, weight: 5, isFeatured: false },
  { templateId: 'fire_imp', rarity: 'rare' as const, weight: 20, isFeatured: false },
  { templateId: 'water_spirit', rarity: 'rare' as const, weight: 20, isFeatured: false },
  { templateId: 'wind_fairy', rarity: 'rare' as const, weight: 20, isFeatured: false },
  { templateId: 'light_pixie', rarity: 'rare' as const, weight: 20, isFeatured: false },
  { templateId: 'dark_bat', rarity: 'rare' as const, weight: 20, isFeatured: false },
];

// Banners
const banners = [
  {
    id: 'standard',
    name: 'Standard Summon',
    type: 'standard' as const,
    featuredMonsters: [],
    pool: monsterPool,
    costCurrency: 'crystal' as const,
    costAmount: 100,
    isActive: true,
  },
  {
    id: 'limited_fire',
    name: 'Fire Festival',
    type: 'limited' as const,
    featuredMonsters: ['fire_phoenix'],
    pool: monsterPool,
    costCurrency: 'crystal' as const,
    costAmount: 100,
    isActive: true,
  },
];

// In-memory pity states (would be in database)
const pityStates: Map<string, Map<string, any>> = new Map();

// In-memory pull history (would be in database)
const pullHistory: Map<string, any[]> = new Map();

// Get available banners
router.get('/banners', (req: Request, res: Response) => {
  res.json({
    banners: banners.filter(b => b.isActive).map(b => ({
      id: b.id,
      name: b.name,
      type: b.type,
      featuredMonsters: b.featuredMonsters,
      costPerPull: { currency: b.costCurrency, amount: b.costAmount },
    })),
  });
});

// Get banner details with rates
router.get('/banners/:id', (req: Request, res: Response) => {
  const banner = banners.find(b => b.id === req.params.id);

  if (!banner) {
    return res.status(404).json({ error: 'Banner not found' });
  }

  res.json({
    banner: {
      id: banner.id,
      name: banner.name,
      type: banner.type,
      featuredMonsters: banner.featuredMonsters,
      costPerPull: { currency: banner.costCurrency, amount: banner.costAmount },
    },
    rates: {
      ssr: '0.8%',
      sr: '8%',
      rare: '60%',
      common: '31.2%',
      softPity: 'Starts at 60 pulls (+2.5% per pull)',
      hardPity: 'Guaranteed SSR at 70 pulls',
    },
  });
});

// Protected routes
router.use(authMiddleware);

// Get current pity state
router.get('/pity', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const bannerType = (req.query.bannerType as string) || 'standard';

    const userPity = pityStates.get(userId) || new Map();
    const pity = userPity.get(bannerType) || {
      bannerId: '',
      bannerType,
      currentPity: 0,
      guaranteedFeatured: false,
    };

    const pityInfo = gachaService.getPityInfo(pity);

    res.json({ pityState: pity, info: pityInfo });
  } catch (error) {
    console.error('Get pity error:', error);
    res.status(500).json({ error: 'Failed to get pity state' });
  }
});

// Execute pull (CRITICAL: Server-side RNG)
router.post('/pull', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const { bannerId, pullCount } = req.body;

    // Validate pull count
    if (pullCount !== 1 && pullCount !== 10) {
      return res.status(400).json({ error: 'Pull count must be 1 or 10' });
    }

    // Find banner
    const banner = banners.find(b => b.id === bannerId);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    // Get current pity state
    const userPity = pityStates.get(userId) || new Map();
    const pityState = userPity.get(banner.type) || {
      bannerId: banner.id,
      bannerType: banner.type,
      currentPity: 0,
      guaranteedFeatured: false,
    };

    // Get user's existing monsters (simplified)
    const existingTemplates: string[] = [];

    // Execute pull
    const result = await gachaService.pull(
      userId,
      banner,
      pullCount,
      pityState,
      user.crystals,
      existingTemplates
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Deduct crystals
    const totalCost = banner.costAmount * pullCount;
    user.crystals -= totalCost;
    users.set(userId, user);

    // Save pity state
    userPity.set(banner.type, result.result!.newPityState);
    pityStates.set(userId, userPity);

    // Save to history
    const history = pullHistory.get(userId) || [];
    history.push(...result.result!.pulls.map(p => ({
      ...p,
      bannerId: banner.id,
      bannerName: banner.name,
      pulledAt: new Date(),
    })));
    pullHistory.set(userId, history);

    res.json({
      result: result.result,
      newCrystals: user.crystals,
    });
  } catch (error) {
    console.error('Pull error:', error);
    res.status(500).json({ error: 'Pull failed' });
  }
});

// Get pull history
router.get('/history', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = pullHistory.get(userId) || [];
    const start = (page - 1) * limit;
    const end = start + limit;

    res.json({
      history: history.slice(start, end).reverse(),
      total: history.length,
      page,
      totalPages: Math.ceil(history.length / limit),
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
