import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Monster templates (static data)
const monsterTemplates = [
  { id: 'fire_phoenix', name: 'Phoenix', element: 'fire', rarity: 'ssr', naturalStars: 5 },
  { id: 'fire_dragon', name: 'Fire Dragon', element: 'fire', rarity: 'sr', naturalStars: 4 },
  { id: 'fire_knight', name: 'Flame Knight', element: 'fire', rarity: 'sr', naturalStars: 4 },
  { id: 'fire_imp', name: 'Fire Imp', element: 'fire', rarity: 'rare', naturalStars: 3 },
  { id: 'water_dragon', name: 'Water Dragon', element: 'water', rarity: 'ssr', naturalStars: 5 },
  { id: 'water_mage', name: 'Water Mage', element: 'water', rarity: 'sr', naturalStars: 4 },
  { id: 'water_knight', name: 'Aqua Knight', element: 'water', rarity: 'sr', naturalStars: 4 },
  { id: 'water_spirit', name: 'Water Spirit', element: 'water', rarity: 'rare', naturalStars: 3 },
  { id: 'wind_griffin', name: 'Wind Griffin', element: 'wind', rarity: 'ssr', naturalStars: 5 },
  { id: 'wind_assassin', name: 'Wind Assassin', element: 'wind', rarity: 'sr', naturalStars: 4 },
  { id: 'wind_archer', name: 'Wind Archer', element: 'wind', rarity: 'sr', naturalStars: 4 },
  { id: 'wind_fairy', name: 'Wind Fairy', element: 'wind', rarity: 'rare', naturalStars: 3 },
  { id: 'light_archangel', name: 'Archangel', element: 'light', rarity: 'ssr', naturalStars: 5 },
  { id: 'light_paladin', name: 'Light Paladin', element: 'light', rarity: 'sr', naturalStars: 4 },
  { id: 'light_pixie', name: 'Light Pixie', element: 'light', rarity: 'rare', naturalStars: 3 },
  { id: 'dark_demon', name: 'Shadow Demon', element: 'dark', rarity: 'ssr', naturalStars: 5 },
  { id: 'dark_knight', name: 'Dark Knight', element: 'dark', rarity: 'sr', naturalStars: 4 },
  { id: 'dark_witch', name: 'Dark Witch', element: 'dark', rarity: 'sr', naturalStars: 4 },
  { id: 'dark_bat', name: 'Shadow Bat', element: 'dark', rarity: 'rare', naturalStars: 3 },
];

// Get all monster templates (public)
router.get('/templates', (req: Request, res: Response) => {
  res.json({ templates: monsterTemplates });
});

// Get monster template by ID (public)
router.get('/templates/:id', (req: Request, res: Response) => {
  const template = monsterTemplates.find(m => m.id === req.params.id);

  if (!template) {
    return res.status(404).json({ error: 'Monster template not found' });
  }

  res.json({ template });
});

// Protected routes below
router.use(authMiddleware);

// Get player's monsters
router.get('/', async (req: Request, res: Response) => {
  try {
    // Would fetch from database
    res.json({
      monsters: [],
      total: 0,
    });
  } catch (error) {
    console.error('Get monsters error:', error);
    res.status(500).json({ error: 'Failed to get monsters' });
  }
});

// Get specific monster
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // Would fetch from database
    res.status(404).json({ error: 'Monster not found' });
  } catch (error) {
    console.error('Get monster error:', error);
    res.status(500).json({ error: 'Failed to get monster' });
  }
});

// Level up monster
router.post('/:id/level-up', async (req: Request, res: Response) => {
  try {
    // Would update in database
    res.json({
      success: true,
      message: 'Monster leveled up',
    });
  } catch (error) {
    console.error('Level up error:', error);
    res.status(500).json({ error: 'Failed to level up monster' });
  }
});

// Evolve monster
router.post('/:id/evolve', async (req: Request, res: Response) => {
  try {
    const { fodderIds } = req.body;

    if (!fodderIds || !Array.isArray(fodderIds)) {
      return res.status(400).json({ error: 'Fodder IDs required' });
    }

    // Would update in database
    res.json({
      success: true,
      message: 'Monster evolved',
    });
  } catch (error) {
    console.error('Evolve error:', error);
    res.status(500).json({ error: 'Failed to evolve monster' });
  }
});

export default router;
