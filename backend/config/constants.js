/**
 * Ravora Backend V1 — Application Constants
 */

export const APP_NAME = 'Ravora';
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;
export const MAX_LIMIT = 100;

// Rate limiting tiers
export const RATE_LIMITS = {
  STANDARD: { windowMs: 60_000, max: 100 },
  AUTH: { windowMs: 60_000, max: 10 },
  MARKET: { windowMs: 10_000, max: 50 },
};

// Supported exchanges
export const SUPPORTED_EXCHANGES = ['binance', 'bybit', 'okx', 'coinbase', 'kraken'];

// Supported market data providers
export const MARKET_PROVIDERS = ['binance', 'coingecko', 'coinmarketcap'];

// Paper trading defaults
export const PAPER_TRADING = {
  DEFAULT_BALANCE: 100_000,
  MAX_LEVERAGE: 100,
  MIN_POSITION_SIZE: 1,
  CURRENCY: 'USD',
};

// WebSocket event types
export const WS_EVENTS = {
  PRICE_UPDATE: 'price:update',
  PORTFOLIO_UPDATE: 'portfolio:update',
  NOTIFICATION: 'notification:new',
  TRADE_UPDATE: 'trade:update',
  AI_STREAM: 'ai:stream',
  ERROR: 'error',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
};

// Job schedules (cron expressions)
export const JOB_SCHEDULES = {
  MARKET_SYNC: '*/30 * * * * *',    // Every 30 seconds
  PORTFOLIO_SYNC: '*/60 * * * * *',  // Every 60 seconds
  PRICE_ALERTS: '*/30 * * * * *',    // Every 30 seconds
  NOTIFICATIONS: '*/10 * * * * *',   // Every 10 seconds
};

// Notification channels
export const NOTIFICATION_CHANNELS = {
  SYSTEM: 'system',
  TRADE: 'trade',
  AI: 'ai',
  ALERT: 'alert',
  SECURITY: 'security',
};

// Notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Order types
export const ORDER_TYPES = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP_LOSS: 'stop_loss',
  TAKE_PROFIT: 'take_profit',
};

// Order sides
export const ORDER_SIDES = {
  BUY: 'buy',
  SELL: 'sell',
};

// Position sides
export const POSITION_SIDES = {
  LONG: 'long',
  SHORT: 'short',
};
