
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, dbQuery } from './src/database.js';
import { verifyToken } from './src/middleware/auth.js';
import { register, login, verifyOtp, resendOtp, requestPasswordRecovery, resetPassword, socialLogin, checkAccount, changePassword } from './src/controllers/authController.js';
import { getProfile, onboard, updateSettings, getWatchlist, addToWatchlist, removeFromWatchlist, updateUserProfile, getActiveDevices, signOutOtherDevices, deleteUserAccount } from './src/controllers/userController.js';
import { getPortfolio, getPortfolioHistory, getTransactions, closePosition } from './src/controllers/portfolioController.js';
import { getOpportunities, getRecommendations, executeRecommendation, deployOpportunity, scanMarkets } from './src/controllers/opportunityController.js';
import { copilotMessage, getNotifications, markNotificationsRead, connectExchange, markSingleNotificationRead, deleteNotification } from './src/controllers/copilotController.js';
import { openPaperPosition, getActivePaperPositions, closePaperPosition, closeAllPaperPositions, getPaperTradeHistory, updatePaperTradeNotes } from './src/controllers/paperTradingController.js';
import { MarketDataService } from './src/services/marketDataService.js';
import { RecommendationEngine } from './src/services/recommendations/recommendationEngine.js';
import { PaperTradingService } from './src/services/paperTradingService.js';
import { getSupabaseConfig, isSupabaseConfigured } from './src/utils/supabase.js';
import { securityHeaders, corsAllowlist, requireHttps, rateLimit, identifierKey, assertProductionConfig, securityLog, clientIp } from './src/middleware/security.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import zlib from 'zlib';

const app = express();
const PORT = process.env.PORT || 3000;

// Behind Render/Vercel the real client address comes from X-Forwarded-For; needed for correct rate limiting.
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(requireHttps);
app.use(securityHeaders());
app.use(express.json({ limit: '100kb' }));

// Gzip compression middleware for all text-based responses
app.use((req, res, next) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (!acceptEncoding.includes('gzip')) return next();

  const originalSend = res.send.bind(res);
  res.send = function (body) {
    const contentType = res.getHeader('content-type') || '';
    const isCompressible = typeof body === 'string' || Buffer.isBuffer(body);
    const isTextType = /text|json|javascript|css|svg|xml/.test(String(contentType));

    if (isCompressible && isTextType && body.length > 1024) {
      const buf = typeof body === 'string' ? Buffer.from(body) : body;
      zlib.gzip(buf, (err, compressed) => {
        if (err) return originalSend(body);
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Vary', 'Accept-Encoding');
        res.removeHeader('Content-Length');
        originalSend(compressed);
      });
    } else {
      originalSend(body);
    }
  };
  next();
});

// CORS: only the origins in CORS_ORIGINS (or the Ravora frontend and local dev origins) may call the API from a browser.
app.use(corsAllowlist());

// API Routers under /v1
const apiRouter = express.Router();

// Rate limits: generous overall, strict on credential and OTP endpoints (also keyed by the targeted account).
apiRouter.use(rateLimit({ name: 'api', windowMs: 60_000, max: 300 }));
const authIpLimit = rateLimit({ name: 'auth-ip', windowMs: 60_000, max: 20 });
const authAccountLimit = rateLimit({ name: 'auth-acct', windowMs: 15 * 60_000, max: 10, keyFn: identifierKey });
const checkAccountLimit = rateLimit({ name: 'check-account', windowMs: 60_000, max: 10 });

// Auth Endpoints
apiRouter.get('/auth/config', (req, res) => res.json(getSupabaseConfig()));
apiRouter.post('/auth/check-account', checkAccountLimit, checkAccount);
apiRouter.post('/auth/register', authIpLimit, authAccountLimit, register);
apiRouter.post('/auth/login', authIpLimit, authAccountLimit, login);
apiRouter.post('/auth/otp/verify', authIpLimit, authAccountLimit, verifyOtp);
apiRouter.post('/auth/otp/resend', authIpLimit, authAccountLimit, resendOtp);
apiRouter.post('/auth/forgot-password/request', authIpLimit, authAccountLimit, requestPasswordRecovery);
apiRouter.post('/auth/forgot-password/reset', authIpLimit, authAccountLimit, resetPassword);
apiRouter.post('/auth/social', authIpLimit, verifyToken, socialLogin);
apiRouter.post('/auth/change-password', authIpLimit, verifyToken, changePassword);

// Market Data Layer v1 Endpoints (Public)
apiRouter.get('/market/prices', async (req, res) => {
  try {
    const overview = await MarketDataService.getOverview();
    const prices = overview.map(o => ({
      symbol: o.symbol,
      name: o.name,
      price: o.price,
      change24h: o.change24h
    }));
    return res.json({ prices });
  } catch (error) {
    console.error('[market route]', error);
    return res.status(500).json({ error: 'Market data is temporarily unavailable.' });
  }
});

apiRouter.get('/market/overview', async (req, res) => {
  try {
    const overview = await MarketDataService.getOverview();
    return res.json(overview);
  } catch (error) {
    console.error('[market route]', error);
    return res.status(500).json({ error: 'Market data is temporarily unavailable.' });
  }
});

apiRouter.get('/market/assets/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;
    const details = await MarketDataService.getAssetDetails(symbol, timeframe || '1D');
    return res.json(details);
  } catch (error) {
    console.error('[market route]', error);
    return res.status(500).json({ error: 'Market data is temporarily unavailable.' });
  }
});

apiRouter.get('/market/summary', async (req, res) => {
  try {
    const overview = await MarketDataService.getOverview();
    const totalMarketCap = overview.reduce((acc, curr) => acc + curr.marketCap, 0);
    const totalVolume24h = overview.reduce((acc, curr) => acc + curr.volume24h, 0);
    const averageChange24h = overview.length > 0 ? (overview.reduce((acc, curr) => acc + curr.change24h, 0) / overview.length) : 0;

    const btcTicker = overview.find(o => o.symbol === 'BTC');
    const btcDominance = (btcTicker && totalMarketCap > 0) ? (btcTicker.marketCap / totalMarketCap) * 100 : 0;

    return res.json({
      totalMarketCap,
      totalVolume24h,
      averageChange24h,
      btcDominance,
      lastUpdated: overview.length > 0 ? Math.max(...overview.map(o => o.lastUpdated)) : Date.now()
    });
  } catch (error) {
    console.error('[market route]', error);
    return res.status(500).json({ error: 'Market data is temporarily unavailable.' });
  }
});

apiRouter.get('/market/opportunities/top', async (req, res) => {
  try {
    const opps = await dbQuery('SELECT * FROM opportunities ORDER BY confidence_score DESC LIMIT 3');
    const formatted = opps.map(o => ({
      opportunityId: o.id,
      type: o.opportunity_type,
      name: o.name,
      symbol: o.symbol,
      icon: o.icon_symbol,
      confidenceScore: o.confidence_score,
      riskLevel: o.risk_level,
      expectedReturn: o.expected_return,
      reasoningText: o.reasoning_text
    }));
    return res.json(formatted);
  } catch (error) {
    console.error('[market route]', error);
    return res.status(500).json({ error: 'Market data is temporarily unavailable.' });
  }
});

// User Profile & Onboarding (Protected)
apiRouter.get('/user/profile', verifyToken, getProfile);
apiRouter.put('/user/profile', verifyToken, updateUserProfile);
apiRouter.get('/user/profile/devices', verifyToken, getActiveDevices);
apiRouter.delete('/user/profile/devices/all-others', verifyToken, signOutOtherDevices);
apiRouter.delete('/user/profile/account', verifyToken, deleteUserAccount);
apiRouter.post('/user/onboard', verifyToken, onboard);
apiRouter.post('/user/settings', verifyToken, updateSettings);
apiRouter.get('/watchlist', verifyToken, getWatchlist);
apiRouter.post('/watchlist', verifyToken, addToWatchlist);
apiRouter.delete('/watchlist/:symbol', verifyToken, removeFromWatchlist);

// Portfolio Endpoints (Protected)
apiRouter.get('/portfolio', verifyToken, getPortfolio);
apiRouter.get('/portfolio/history', verifyToken, getPortfolioHistory);
apiRouter.get('/portfolio/transactions', verifyToken, getTransactions);
apiRouter.post('/portfolio/positions/:symbol/close', verifyToken, closePosition);

// Opportunities Endpoints (Protected)
apiRouter.get('/opportunities', verifyToken, getOpportunities);
apiRouter.get('/opportunities/recommendations', verifyToken, getRecommendations);
apiRouter.post('/opportunities/recommendations/:id/execute', verifyToken, executeRecommendation);
apiRouter.post('/opportunities/deploy', verifyToken, openPaperPosition); // Paper Trading
apiRouter.post('/market/scan', verifyToken, scanMarkets);

// Paper Trading Endpoints (Protected)
apiRouter.get('/paper/positions', verifyToken, getActivePaperPositions);
apiRouter.delete('/paper/positions', verifyToken, closeAllPaperPositions);
apiRouter.delete('/paper/positions/:id', verifyToken, closePaperPosition);
apiRouter.get('/paper/history', verifyToken, getPaperTradeHistory);
apiRouter.put('/paper/history/:id/notes', verifyToken, updatePaperTradeNotes);

// Copilot conversation (Protected)
apiRouter.post('/copilot/message', verifyToken, copilotMessage);

// Notifications (Protected)
apiRouter.get('/notifications', verifyToken, getNotifications);
apiRouter.post('/notifications/read', verifyToken, markNotificationsRead);
apiRouter.put('/notifications/:id/read', verifyToken, markSingleNotificationRead);
apiRouter.delete('/notifications/:id', verifyToken, deleteNotification);

// Settings Exchanges (Protected)
apiRouter.post('/settings/exchanges', verifyToken, connectExchange);

// Bind API router
app.use('/v1', apiRouter);

// SPA routing setup:
const distPath = path.join(__dirname, 'dist');

// Always serve app directory assets (e.g. oauth-consent.html popups)
app.use('/app', express.static(path.join(__dirname, 'app')));

// Explicitly serve legacy dashboard assets from root to bypass React dist folder fallback
app.get('/dashboard.js', (req, res) => res.sendFile(path.join(__dirname, 'dashboard.js')));
app.get('/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'styles.css')));
app.get('/favicon.svg', (req, res) => res.sendFile(path.join(__dirname, 'public', 'favicon.svg')));

if (fs.existsSync(distPath)) {
  console.log('[SPA Server] Serving production React Vite assets from /dist');
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/v1')) return next();
    // Known client routes answer 200; anything else still gets the app (it renders the 404 page) but with a real 404 status.
    const known = /^\/(auth(\/[\w-]+)?|legal\/[\w-]+|onboarding|dashboard)?\/?$/.test(req.path);
    res.status(known ? 200 : 404).sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('[SPA Server] dist/ not found: serving the legacy pages only. Run `npm run build` for the React app.');
  app.get('/app*', (req, res) => {
    res.sendFile(path.join(__dirname, 'app/index.html'));
  });
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// Unknown API routes and error handling: never return stack traces or internal messages.
app.use('/v1', (req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, req, res, _next) => {
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON in request body.' });
  if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large.' });
  console.error('[Unhandled error]', req.method, req.path, err);
  securityLog('unhandled_error', { path: req.path, ip: clientIp(req) });
  return res.status(500).json({ error: 'An unexpected error occurred.' });
});

// Start background rebalancing / scoring engine
const startEngineScheduler = () => {
  // Run immediately on boot
  setTimeout(async () => {
    try {
      console.log('[Scheduler] Executing global market analysis & recommendations update...');
      // Always run the global scan first to populate the opportunities table
      await RecommendationEngine.generateRecommendations();

      const users = await dbQuery('SELECT id FROM users');
      for (const u of users) {
        await RecommendationEngine.generateRecommendations(u.id);
      }
      console.log('[Scheduler] Global update completed.');
    } catch (err) {
      console.error('[Scheduler] Error in startup update:', err);
    }
  }, 5000);

  // Run every 10 minutes
  setInterval(async () => {
    try {
      console.log('[Scheduler] Running periodic recommendations update...');
      // Always run the global scan first
      await RecommendationEngine.generateRecommendations();

      const users = await dbQuery('SELECT id FROM users');
      for (const u of users) {
        await RecommendationEngine.generateRecommendations(u.id);
      }
    } catch (err) {
      console.error('[Scheduler] Error in periodic recommendations update:', err);
    }
  }, 10 * 60 * 1000);
};

// Bootstrapping function
const startServer = async () => {
  try {
    assertProductionConfig({ supabaseConfigured: isSupabaseConfigured(), secrets: [] });

    console.log('Initializing local database...');
    await initializeDatabase();
    console.log('Database initialized successfully.');

    // Start scheduler
    startEngineScheduler();

    // Start Paper Trading background monitoring loop
    PaperTradingService.startMonitoringLoop(5000);

    app.listen(PORT, () => {
      console.log(`Ravora MVP Foundation listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.stack || error);
    process.exit(1);
  }
};

startServer();
