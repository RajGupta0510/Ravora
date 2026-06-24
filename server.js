
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './src/database.js';
import { verifyToken } from './src/middleware/auth.js';
import { register, login } from './src/controllers/authController.js';
import { getProfile, onboard, updateSettings } from './src/controllers/userController.js';
import { getPortfolio, getPortfolioHistory, getTransactions } from './src/controllers/portfolioController.js';
import { getOpportunities, getRecommendations, executeRecommendation, deployOpportunity } from './src/controllers/opportunityController.js';
import { copilotMessage, getNotifications, markNotificationsRead, connectExchange } from './src/controllers/copilotController.js';

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
apiRouter.post('/auth/register', register);
apiRouter.post('/auth/login', login);

// User Profile & Onboarding (Protected)
apiRouter.get('/user/profile', verifyToken, getProfile);
apiRouter.post('/user/onboard', verifyToken, onboard);
apiRouter.post('/user/settings', verifyToken, updateSettings);

// Portfolio Endpoints (Protected)
apiRouter.get('/portfolio', verifyToken, getPortfolio);
apiRouter.get('/portfolio/history', verifyToken, getPortfolioHistory);
apiRouter.get('/portfolio/transactions', verifyToken, getTransactions);

// Opportunities Endpoints (Protected)
apiRouter.get('/opportunities', verifyToken, getOpportunities);
apiRouter.get('/opportunities/recommendations', verifyToken, getRecommendations);
apiRouter.post('/opportunities/recommendations/:id/execute', verifyToken, executeRecommendation);
apiRouter.post('/opportunities/deploy', verifyToken, deployOpportunity);

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

// Bootstrapping function
const startServer = async () => {
  try {
    console.log('Initializing local database...');
    await initializeDatabase();
    console.log('Database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`Ravora MVP Foundation listening at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
