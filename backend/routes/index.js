/**
 * Ravora Backend V1 — Route Aggregator
 * Registers all route modules under /api/v1
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { RATE_LIMITS } from '../config/constants.js';

import userRoutes from './user.routes.js';
import portfolioRoutes from './portfolio.routes.js';
import watchlistRoutes from './watchlist.routes.js';
import notificationRoutes from './notification.routes.js';
import paperTradingRoutes from './paperTrading.routes.js';
import marketRoutes from './market.routes.js';
import opportunityRoutes from './opportunity.routes.js';
import exchangeRoutes from './exchange.routes.js';
import orderRoutes from './order.routes.js';
import aiRoutes from './ai.routes.js';
import strategyRoutes from './strategy.routes.js';
import newsRoutes from './news.routes.js';
import adminRoutes from './admin.routes.js';
import discoverRoutes from './discover.routes.js';
import workspaceRoutes from './workspace.routes.js';
import { AiController } from '../ai/controllers/AiController.js';
import env from '../config/environment.js';

const router = Router();

// Health check (no auth)
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'healthy', version: '1.0.0', timestamp: new Date().toISOString() } });
});

// Public Auth Config route for frontend client initialization
router.get('/auth/config', (req, res) => {
  res.json({
    supabaseUrl: env.SUPABASE_URL || 'http://localhost:3000/mock-supabase',
    supabaseAnonKey: env.SUPABASE_ANON_KEY || 'mock-anon-key'
  });
});

// Public routes (with market-specific rate limiting)
router.use('/market', rateLimiter(RATE_LIMITS.MARKET), marketRoutes);

// Authenticated routes (standard rate limiting)
const authRouter = Router();
authRouter.use(authenticate);
authRouter.use(rateLimiter(RATE_LIMITS.STANDARD));

authRouter.use('/user', userRoutes);
authRouter.use('/portfolio', portfolioRoutes);
authRouter.use('/watchlist', watchlistRoutes);
authRouter.use('/notifications', notificationRoutes);
authRouter.use('/paper', rateLimiter(RATE_LIMITS.TRADE), paperTradingRoutes);
authRouter.use('/opportunities', opportunityRoutes);
authRouter.use('/exchanges', rateLimiter(RATE_LIMITS.TRADE), exchangeRoutes);
authRouter.use('/orders', rateLimiter(RATE_LIMITS.TRADE), orderRoutes);
authRouter.use('/ai', rateLimiter(RATE_LIMITS.AI), aiRoutes);
authRouter.use('/strategy', strategyRoutes);
authRouter.use('/news', newsRoutes);
authRouter.use('/admin', adminRoutes);
authRouter.use('/discover', discoverRoutes);
authRouter.use('/workspace', workspaceRoutes);
authRouter.post('/copilot/message', rateLimiter(RATE_LIMITS.AI), AiController.copilotMessage);

router.use(authRouter);

export default router;
