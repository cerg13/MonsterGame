import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { guildService } from '../services/GuildService';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// Get player guild state
router.get('/state', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const state = guildService.getPlayerState(userId);

    res.json({
      guildId: state.guildId,
      guild: state.guild,
      myRank: state.myRank,
      guildPoints: state.guildPoints,
      weeklyContribution: state.weeklyContribution,
      checkInStreak: state.checkInStreak,
      lastCheckIn: state.lastCheckIn,
      purchasedItems: state.purchasedItems,
    });
  } catch (error) {
    console.error('Get guild state error:', error);
    res.status(500).json({ error: 'Failed to get guild state' });
  }
});

// Search guilds
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const guilds = guildService.searchGuilds(query);
    res.json({ guilds });
  } catch (error) {
    console.error('Search guilds error:', error);
    res.status(500).json({ error: 'Failed to search guilds' });
  }
});

// Get guild by ID
router.get('/:guildId', async (req: Request, res: Response) => {
  try {
    const { guildId } = req.params;
    const guilds = guildService.searchGuilds('');
    const guild = guilds.find(g => g.id === guildId);

    if (!guild) {
      return res.status(404).json({ error: 'Guild not found' });
    }

    res.json({ guild });
  } catch (error) {
    console.error('Get guild error:', error);
    res.status(500).json({ error: 'Failed to get guild' });
  }
});

// Get guild members
router.get('/:guildId/members', async (req: Request, res: Response) => {
  try {
    const { guildId } = req.params;
    const members = guildService.getMembers(guildId);
    res.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

// Join guild
router.post('/join', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const { guildId } = req.body;

    if (!guildId) {
      return res.status(400).json({ error: 'Guild ID required' });
    }

    const result = guildService.joinGuild(userId, guildId, user.username || 'Player', user.level || 1);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    const state = guildService.getPlayerState(userId);
    res.json({ success: true, guild: state.guild });
  } catch (error) {
    console.error('Join guild error:', error);
    res.status(500).json({ error: 'Failed to join guild' });
  }
});

// Leave guild
router.post('/leave', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const result = guildService.leaveGuild(userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Leave guild error:', error);
    res.status(500).json({ error: 'Failed to leave guild' });
  }
});

// Create guild
router.post('/create', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const { name, tag, description, icon } = req.body;

    if (!name || !tag) {
      return res.status(400).json({ error: 'Name and tag required' });
    }

    const result = guildService.createGuild(
      userId,
      user.username || 'Player',
      user.level || 1,
      name,
      tag,
      description || '',
      icon || '⚔️'
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, guild: result.guild });
  } catch (error) {
    console.error('Create guild error:', error);
    res.status(500).json({ error: 'Failed to create guild' });
  }
});

// Daily check-in
router.post('/checkin', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const result = guildService.checkIn(userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      points: result.points,
      bonus: result.bonus,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Get shop items
router.get('/shop/items', async (req: Request, res: Response) => {
  try {
    const items = guildService.getShopItems();
    res.json({ items });
  } catch (error) {
    console.error('Get shop items error:', error);
    res.status(500).json({ error: 'Failed to get shop items' });
  }
});

// Purchase from shop
router.post('/shop/purchase', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID required' });
    }

    const result = guildService.purchaseItem(userId, itemId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, item: result.item });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase item' });
  }
});

export default router;
