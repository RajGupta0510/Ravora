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

const router = Router();

// Health check (no auth)
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'healthy', version: '1.0.0', timestamp: new Date().toISOString() } });
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
authRouter.use('/paper', paperTradingRoutes);
authRouter.use('/opportunities', opportunityRoutes);

router.use(authRouter);

export default router;
