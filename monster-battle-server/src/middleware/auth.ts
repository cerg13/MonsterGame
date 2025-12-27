import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// In-memory users store (same as in authRoutes - would be replaced with database)
// This is a simplified version - in production, use a shared database
const users: Map<string, any> = new Map();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

      // In production, fetch user from database
      // For now, create a mock user if not exists
      let user = users.get(decoded.userId);

      if (!user) {
        // Create mock user for development
        user = {
          id: decoded.userId,
          username: 'Player',
          crystals: 300,
          gold: 10000,
          energy: 120,
          maxEnergy: 120,
          level: 1,
          createdAt: new Date(),
        };
        users.set(decoded.userId, user);
      }

      (req as any).user = user;
      (req as any).userId = decoded.userId;

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Export users for sharing with routes (temporary solution)
export { users };
