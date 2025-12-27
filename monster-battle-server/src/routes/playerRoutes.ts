import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get player profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    res.json({
      player: {
        id: user.id,
        username: user.username,
        email: user.email,
        crystals: user.crystals,
        gold: user.gold,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        level: user.level,
        experience: 0,
        arenaRank: 1000,
        arenaPoints: 0,
        arenaTier: 'bronze',
        loyaltyPoints: 0,
        loyaltyTier: 'bronze',
        createdAt: user.createdAt,
        lastLoginAt: new Date(),
        loginStreak: 1,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Get player resources
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    res.json({
      crystals: user.crystals,
      gold: user.gold,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyRegenAt: new Date(),
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Failed to get resources' });
  }
});

// Get player inventory
router.get('/inventory', async (req: Request, res: Response) => {
  try {
    // Return empty inventory for now (would fetch from database)
    res.json({
      monsters: [],
      runes: [],
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ error: 'Failed to get inventory' });
  }
});

export default router;
