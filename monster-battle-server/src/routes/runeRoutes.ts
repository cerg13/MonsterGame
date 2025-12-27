import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { runeService } from '../services/RuneService';

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// Get all runes
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const runes = runeService.getPlayerRunes(userId);
    res.json({ runes });
  } catch (error) {
    console.error('Get runes error:', error);
    res.status(500).json({ error: 'Failed to get runes' });
  }
});

// Get runes for specific monster
router.get('/monster/:monsterId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { monsterId } = req.params;
    const runes = runeService.getPlayerRunes(userId);
    const monsterRunes = runes.filter(r => r.monsterId === monsterId);
    res.json({ runes: monsterRunes });
  } catch (error) {
    console.error('Get monster runes error:', error);
    res.status(500).json({ error: 'Failed to get monster runes' });
  }
});

// Upgrade rune
router.post('/:runeId/upgrade', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { runeId } = req.params;

    const result = runeService.upgradeRune(userId, runeId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Upgrade rune error:', error);
    res.status(500).json({ error: 'Failed to upgrade rune' });
  }
});

// Equip rune
router.post('/:runeId/equip', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { runeId } = req.params;
    const { monsterId } = req.body;

    if (!monsterId) {
      return res.status(400).json({ error: 'Monster ID required' });
    }

    const result = runeService.equipRune(userId, runeId, monsterId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Equip rune error:', error);
    res.status(500).json({ error: 'Failed to equip rune' });
  }
});

// Unequip rune
router.post('/:runeId/unequip', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { runeId } = req.params;

    const result = runeService.unequipRune(userId, runeId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Unequip rune error:', error);
    res.status(500).json({ error: 'Failed to unequip rune' });
  }
});

// Sell rune
router.delete('/:runeId', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { runeId } = req.params;

    const result = runeService.sellRune(userId, runeId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, gold: result.gold });
  } catch (error) {
    console.error('Sell rune error:', error);
    res.status(500).json({ error: 'Failed to sell rune' });
  }
});

export default router;
