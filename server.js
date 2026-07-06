
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase, dbQuery } from './src/database.js';
import { verifyToken } from './src/middleware/auth.js';
import { register, login, verifyOtp, resendOtp, requestPasswordRecovery, resetPassword, socialLogin } from './src/controllers/authController.js';
import { getProfile, onboard, updateSettings } from './src/controllers/userController.js';
import { getPortfolio, getPortfolioHistory, getTransactions, closePosition } from './src/controllers/portfolioController.js';
import { getOpportunities, getRecommendations, executeRecommendation, deployOpportunity, scanMarkets } from './src/controllers/opportunityController.js';
import { copilotMessage, getNotifications, markNotificationsRead, connectExchange } from './src/controllers/copilotController.js';
import { openPaperPosition, getActivePaperPositions, closePaperPosition, closeAllPaperPositions, getPaperTradeHistory } from './src/controllers/paperTradingController.js';
import { MarketDataService } from './src/services/marketDataService.js';
import { RecommendationEngine } from './src/services/recommendations/recommendationEngine.js';
import { PaperTradingService } from './src/services/paperTradingService.js';
import { getSupabaseConfig } from './src/utils/supabase.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS middleware to support external static servers (Live Server at 5500, etc.)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routers under /v1
const apiRouter = express.Router();

// Auth Endpoints
apiRouter.get('/auth/config', (req, res) => res.json(getSupabaseConfig()));
apiRouter.post('/auth/register', register);
apiRouter.post('/auth/login', login);
apiRouter.post('/auth/otp/verify', verifyOtp);
apiRouter.post('/auth/otp/resend', resendOtp);
apiRouter.post('/auth/forgot-password/request', requestPasswordRecovery);
apiRouter.post('/auth/forgot-password/reset', resetPassword);
apiRouter.post('/auth/social', socialLogin);

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
    return res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/market/overview', async (req, res) => {
  try {
    const overview = await MarketDataService.getOverview();
    return res.json(overview);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/market/assets/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;
    const details = await MarketDataService.getAssetDetails(symbol, timeframe || '1D');
    return res.json(details);
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
    return res.status(500).json({ error: error.message });
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
    return res.status(500).json({ error: error.message });
  }
});

// User Profile & Onboarding (Protected)
apiRouter.get('/user/profile', verifyToken, getProfile);
apiRouter.post('/user/onboard', verifyToken, onboard);
apiRouter.post('/user/settings', verifyToken, updateSettings);

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

// Copilot conversation (Protected)
apiRouter.post('/copilot/message', verifyToken, copilotMessage);

// Notifications (Protected)
apiRouter.get('/notifications', verifyToken, getNotifications);
apiRouter.post('/notifications/read', verifyToken, markNotificationsRead);

// Settings Exchanges (Protected)
apiRouter.post('/settings/exchanges', verifyToken, connectExchange);

// Bind API router
app.use('/v1', apiRouter);

// SPA routing setup:
// 1. Serve static files inside /app (e.g. css/js sub-assets, if any)
app.use('/app', express.static(path.join(__dirname, 'app')));

// 2. Serve index.html or other static files in the root (like styles.css, dashboard.js, favicon.svg)
app.use(express.static(__dirname));

// 3. Fallback to app/index.html for any client-side route under /app (History API)
app.get('/app*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app/index.html'));
});

// 4. Fallback for landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
