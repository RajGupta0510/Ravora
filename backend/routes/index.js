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
import { getSupabaseAdmin, isConfigured } from '../config/database.js';
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

// Admin Helper to confirm test users in local development
router.get('/auth/confirm-user', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email query parameter is required.' });
    }
    if (!isConfigured) {
      return res.json({ success: true, message: 'Running in sandbox mode, no confirmation needed.' });
    }
    const admin = getSupabaseAdmin();
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
    if (listError) throw listError;
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(404).json({ error: `User with email ${email} not found.` });
    }
    
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });
    if (updateError) throw updateError;
    
    return res.json({ success: true, message: `User ${email} has been successfully confirmed!` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
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
