import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { campaignService } from '../services/CampaignService';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// Get all regions
router.get('/regions', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const regions = campaignService.getRegions(userId, user.level || 1);
    res.json({ regions });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({ error: 'Failed to get regions' });
  }
});

// Get specific region
router.get('/regions/:regionId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const { regionId } = req.params;

    const region = campaignService.getRegion(userId, regionId, user.level || 1);

    if (!region) {
      return res.status(404).json({ error: 'Region not found' });
    }

    res.json({ region });
  } catch (error) {
    console.error('Get region error:', error);
    res.status(500).json({ error: 'Failed to get region' });
  }
});

// Get region stars
router.get('/regions/:regionId/stars', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { regionId } = req.params;

    const stars = campaignService.getRegionStars(userId, regionId);
    res.json(stars);
  } catch (error) {
    console.error('Get region stars error:', error);
    res.status(500).json({ error: 'Failed to get region stars' });
  }
});

// Get stage
router.get('/stages/:stageId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { stageId } = req.params;

    const stage = campaignService.getStage(userId, stageId);

    if (!stage) {
      return res.status(404).json({ error: 'Stage not found' });
    }

    res.json({ stage });
  } catch (error) {
    console.error('Get stage error:', error);
    res.status(500).json({ error: 'Failed to get stage' });
  }
});

// Start stage
router.post('/stages/:stageId/start', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = (req as any).user;
    const { stageId } = req.params;

    const result = campaignService.startStage(userId, stageId, user.energy || 0);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, stage: result.stage });
  } catch (error) {
    console.error('Start stage error:', error);
    res.status(500).json({ error: 'Failed to start stage' });
  }
});

// Complete stage
router.post('/stages/:stageId/complete', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { stageId } = req.params;
    const { won, stars } = req.body;

    if (typeof won !== 'boolean' || typeof stars !== 'number') {
      return res.status(400).json({ error: 'Invalid completion data' });
    }

    const result = campaignService.completeStage(userId, stageId, won, stars);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      success: true,
      rewards: result.rewards,
      firstClear: result.firstClear,
    });
  } catch (error) {
    console.error('Complete stage error:', error);
    res.status(500).json({ error: 'Failed to complete stage' });
  }
});

// Get player progress
router.get('/progress', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const progress = campaignService.getProgress(userId);
    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

export default router;
