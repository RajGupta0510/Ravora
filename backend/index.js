/**
 * Ravora Backend V1 — Main Entry Point
 */

import express from 'express';
import http from 'http';
import cors from 'cors';
import { validateEnvironment } from './config/environment.js';
import { initializeDatabase } from './config/database.js';
import { initializeWebSocket } from './websocket/WebSocketServer.js';
import { JobScheduler } from './jobs/JobScheduler.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import aiRoutes from './routes/ai.routes.js';
import portfolioRoutes from './routes/portfolio.routes.js';
import opportunityRoutes from './routes/opportunity.routes.js';
import { authenticate } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { RATE_LIMITS } from './config/constants.js';
import env from './config/environment.js';
import { logger } from './utils/logger.js';

// 1. Workers
import { marketSyncWorker } from './jobs/workers/MarketSyncWorker.js';
import { portfolioSyncWorker } from './jobs/workers/PortfolioSyncWorker.js';
import { priceAlertWorker } from './jobs/workers/PriceAlertWorker.js';
import { notificationWorker } from './jobs/workers/NotificationWorker.js';
import { newsSyncWorker } from './jobs/workers/NewsSyncWorker.js';

async function bootstrap() {
  try {
    logger.info('Bootstrap', 'Starting Ravora Backend V1...');

    // 1. Validate Environment
    validateEnvironment();

    // 2. Initialize Database Connection (Supabase)
    initializeDatabase();

    // 3. Setup Express
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(requestLogger);

    // 4. Register REST API Routes
    app.use('/api/v1', routes);
    app.use('/api/ai', authenticate, rateLimiter(RATE_LIMITS.STANDARD), aiRoutes);
    app.use('/api/portfolio', authenticate, rateLimiter(RATE_LIMITS.STANDARD), portfolioRoutes);
    app.use('/api/opportunities', authenticate, rateLimiter(RATE_LIMITS.STANDARD), opportunityRoutes);

    // 5. Catch-all for API 404
    app.use((req, res, next) => {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Route not found: ${req.method} ${req.path}` }
      });
    });

    // 6. Global Error Handler
    app.use(errorHandler);

    // 7. Initialize HTTP Server
    const server = http.createServer(app);

    // 8. Initialize WebSockets (if enabled)
    if (env.ENABLE_WEBSOCKETS) {
      initializeWebSocket(server);
    }

    // 9. Register & Start Background Jobs (if enabled)
    if (env.ENABLE_JOBS) {
      // Market sync every 30 seconds
      JobScheduler.register('market-sync', 30_000, marketSyncWorker);
      // Portfolio sync every 60 seconds
      JobScheduler.register('portfolio-sync', 60_000, portfolioSyncWorker);
      // Price alerts every 30 seconds
      JobScheduler.register('price-alerts', 30_000, priceAlertWorker);
      // Process notification queue every 10 seconds
      JobScheduler.register('notifications', 10_000, notificationWorker);
      // News & Sentiment sync every 5 minutes
      JobScheduler.register('news-sync', 300_000, newsSyncWorker);

      // Start all scheduled jobs
      JobScheduler.startAll();
    }

    // 10. Start Listening
    const port = env.PORT;
    server.listen(port, () => {
      logger.info('Bootstrap', `✓ Ravora Backend V1 running on http://localhost:${port}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('Bootstrap', 'SIGTERM received. Cleaning up and shutting down...');
      JobScheduler.stopAll();
      server.close(() => {
        logger.info('Bootstrap', 'Server closed. Exiting process.');
        process.exit(0);
      });
    });

  } catch (err) {
    logger.error('Bootstrap', 'Fatal startup error', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

bootstrap();
