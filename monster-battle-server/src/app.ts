import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import database
import { initializeDatabase } from './config/database';
import { setupAssociations } from './models';

// Import routes
import authRoutes from './routes/authRoutes';
import playerRoutes from './routes/playerRoutes';
import gachaRoutes from './routes/gachaRoutes';
import monsterRoutes from './routes/monsterRoutes';
import arenaRoutes from './routes/arenaRoutes';
import guildRoutes from './routes/guildRoutes';
import runeRoutes from './routes/runeRoutes';
import campaignRoutes from './routes/campaignRoutes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/player', playerRoutes);
app.use('/api/v1/gacha', gachaRoutes);
app.use('/api/v1/monsters', monsterRoutes);
app.use('/api/v1/arena', arenaRoutes);
app.use('/api/v1/guild', guildRoutes);
app.use('/api/v1/runes', runeRoutes);
app.use('/api/v1/campaign', campaignRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    // Setup model associations
    setupAssociations();

    // Initialize database connection
    await initializeDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🎮 Monster Battle Server running on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
