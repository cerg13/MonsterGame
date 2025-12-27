import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { arenaService } from '../services/ArenaService';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// Get arena state
router.get('/state', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const state = arenaService.getPlayerState(userId);

    res.json({
      points: state.points,
      tier: state.tier,
      wings: state.wings,
      maxWings: state.maxWings,
      defenseTeam: state.defenseTeam,
      weeklyBattles: state.weeklyBattles,
      weeklyWins: state.weeklyWins,
    });
  } catch (error) {
    console.error('Get arena state error:', error);
    res.status(500).json({ error: 'Failed to get arena state' });
  }
});

// Get opponents list
router.get('/opponents', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const count = parseInt(req.query.count as string) || 5;

    const opponents = arenaService.generateOpponents(userId, count);
    res.json({ opponents });
  } catch (error) {
    console.error('Get opponents error:', error);
    res.status(500).json({ error: 'Failed to get opponents' });
  }
});

// Refresh opponents
router.post('/opponents/refresh', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const opponents = arenaService.generateOpponents(userId, 5);
    res.json({ opponents });
  } catch (error) {
    console.error('Refresh opponents error:', error);
    res.status(500).json({ error: 'Failed to refresh opponents' });
  }
});

// Start battle
router.post('/battle/start', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { opponentId } = req.body;

    if (!opponentId) {
      return res.status(400).json({ error: 'Opponent ID required' });
    }

    const result = arenaService.startBattle(userId, opponentId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Battle started' });
  } catch (error) {
    console.error('Start battle error:', error);
    res.status(500).json({ error: 'Failed to start battle' });
  }
});

// Record battle result
router.post('/battle/result', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { opponentPoints, won } = req.body;

    if (typeof opponentPoints !== 'number' || typeof won !== 'boolean') {
      return res.status(400).json({ error: 'Invalid battle result data' });
    }

    const result = arenaService.recordBattleResult(userId, opponentPoints, won);
    res.json(result);
  } catch (error) {
    console.error('Record battle result error:', error);
    res.status(500).json({ error: 'Failed to record battle result' });
  }
});

// Set defense team
router.post('/defense', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { monsterIds } = req.body;

    if (!Array.isArray(monsterIds)) {
      return res.status(400).json({ error: 'Monster IDs array required' });
    }

    const result = arenaService.setDefenseTeam(userId, monsterIds);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, message: 'Defense team updated' });
  } catch (error) {
    console.error('Set defense team error:', error);
    res.status(500).json({ error: 'Failed to set defense team' });
  }
});

// Get weekly rewards info
router.get('/rewards/weekly', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const state = arenaService.getPlayerState(userId);
    const rewards = arenaService.getWeeklyRewards(state.tier);

    res.json({
      tier: state.tier,
      rewards,
      weeklyBattles: state.weeklyBattles,
      weeklyWins: state.weeklyWins,
    });
  } catch (error) {
    console.error('Get weekly rewards error:', error);
    res.status(500).json({ error: 'Failed to get weekly rewards' });
  }
});

// Claim weekly rewards
router.post('/rewards/claim', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const result = arenaService.claimWeeklyRewards(userId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, rewards: result.rewards });
  } catch (error) {
    console.error('Claim rewards error:', error);
    res.status(500).json({ error: 'Failed to claim rewards' });
  }
});

export default router;
