import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path inside workspace
const dbPath = path.resolve(__dirname, '../ravora.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database connected at', dbPath);
  }
});

// Helper functions to wrap sqlite3 operations in Promises
export const dbQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Database initialization
export const initializeDatabase = async () => {
  // Enable foreign keys
  await dbRun('PRAGMA foreign_keys = ON;');

  // 1. users table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      is_mfa_enabled INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. user_profiles table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      experience_level TEXT NOT NULL,
      primary_goal TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. risk_profiles table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS risk_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      risk_stance TEXT NOT NULL,
      max_drawdown_cap REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. user_settings table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      auto_hedge_enabled INTEGER DEFAULT 1,
      notifications_enabled INTEGER DEFAULT 1,
      execution_mode TEXT DEFAULT 'advisory',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. connected_exchanges table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS connected_exchanges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exchange_name TEXT NOT NULL,
      api_key_kms_arn TEXT,
      api_secret_encrypted TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, exchange_name),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 6. portfolios table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      current_balance REAL DEFAULT 0.00,
      currency TEXT DEFAULT 'USD',
      safety_score INTEGER DEFAULT 100,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 7. portfolio_assets table
  await dbRun(`DROP TABLE IF EXISTS portfolio_assets;`);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS portfolio_assets (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      allocation_pct REAL NOT NULL,
      balance_amount REAL NOT NULL,
      average_entry_price REAL NOT NULL,
      position_type TEXT DEFAULT 'Long',
      leverage REAL DEFAULT 1.0,
      UNIQUE (portfolio_id, asset_symbol),
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    );
  `);

  // 8. transactions table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      asset_pair TEXT NOT NULL,
      amount TEXT NOT NULL,
      cleared_price REAL NOT NULL,
      execution_fee REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 9. opportunities table
  await dbRun(`DROP TABLE IF EXISTS opportunities;`);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      opportunity_type TEXT NOT NULL,
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      icon_symbol TEXT NOT NULL,
      confidence_score INTEGER NOT NULL,
      expected_return TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      reasoning_text TEXT NOT NULL,
      suggested_entry REAL,
      suggested_stop_loss REAL,
      suggested_take_profit REAL,
      expected_duration TEXT,
      risk_reward_ratio TEXT,
      trend_direction TEXT,
      support_levels TEXT,
      resistance_levels TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 10. araiven_recommendations table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS araiven_recommendations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      suggested_allocation_pct REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
  `);

  // 11. notifications table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      priority TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      payload TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 12. watchlists table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS watchlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, asset_symbol),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 13. copilot_conversations table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS copilot_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      message_text TEXT NOT NULL,
      stats_meta TEXT,
      actions_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 14. market_tickers table (Market Data Layer v1 Cache)
  await dbRun(`DROP TABLE IF EXISTS market_tickers;`);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS market_tickers (
      symbol TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      change_24h REAL NOT NULL,
      volume_24h REAL NOT NULL,
      market_cap REAL NOT NULL,
      last_updated INTEGER NOT NULL
    );
  `);

  // 15. market_history table (Historical Data Cache)
  await dbRun(`DROP TABLE IF EXISTS market_history;`);
  await dbRun(`
    CREATE TABLE IF NOT EXISTS market_history (
      symbol TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      open REAL NOT NULL,
      high REAL NOT NULL,
      low REAL NOT NULL,
      close REAL NOT NULL,
      volume REAL NOT NULL,
      PRIMARY KEY (symbol, timestamp)
    );
  `);

  // Seed opportunities if empty
  const opps = await dbQuery('SELECT COUNT(*) as count FROM opportunities');
  if (opps[0].count === 0) {
    console.log('Seeding initial opportunities...');
    const opportunitiesToSeed = [
      {
        id: 'eth-staking',
        type: 'yield',
        name: 'Ethereum Staking Alpha',
        symbol: 'ETH / USD',
        icon: 'Ξ',
        confidence: 94,
        risk: 'low',
        estReturn: '8.0% - 12.0%',
        reasoning: 'Validator queue consolidation patterns reveal a post-upgrade yields premium on decentralized pools. Backed by institutional accumulation support lines.',
        entry: 3450.00,
        stop_loss: 3350.00,
        take_profit: 3750.00,
        duration: '3-5 days',
        risk_reward: '3.0:1',
        trend: 'Bullish',
        support: '[3400, 3300]',
        resistance: '[3600, 3800]'
      },
      {
        id: 'btc-halving',
        type: 'momentum',
        name: 'Bitcoin ETF Momentum Stacking',
        symbol: 'BTC / USD',
        icon: '₿',
        confidence: 89,
        risk: 'medium',
        estReturn: '15.0% - 22.0%',
        reasoning: 'Spot ETF net inflows show consecutive daily acceleration, coinciding with hodler lockup peaks. Momentum targets a breakout to structural range highs.',
        entry: 63800.00,
        stop_loss: 62000.00,
        take_profit: 68000.00,
        duration: '5-7 days',
        risk_reward: '2.3:1',
        trend: 'Bullish',
        support: '[63000, 61500]',
        resistance: '[66000, 69000]'
      },
      {
        id: 'link-momentum',
        type: 'momentum',
        name: 'Chainlink Oracle Integration Breakout',
        symbol: 'LINK / USD',
        icon: 'L',
        confidence: 85,
        risk: 'medium',
        estReturn: '12.0% - 18.0%',
        reasoning: 'Oracle utility volumes indicate structural breakout momentum above local range resistance.',
        entry: 15.20,
        stop_loss: 14.50,
        take_profit: 17.50,
        duration: '3-5 days',
        risk_reward: '3.3:1',
        trend: 'Bullish',
        support: '[14.80, 14.00]',
        resistance: '[16.00, 18.00]'
      },
      {
        id: 'solana-liquidity',
        type: 'momentum',
        name: 'Solana Liquidity Staking Accumulation',
        symbol: 'SOL / USD',
        icon: 'S',
        confidence: 78,
        risk: 'high',
        estReturn: '22.0% - 32.0%',
        reasoning: 'DEX trading volume indices indicate structural demand trends for Jup/Sol liquidity pairs. High variance yield with automated trailing drawdown trigger.',
        entry: 132.50,
        stop_loss: 124.00,
        take_profit: 155.00,
        duration: '3-5 days',
        risk_reward: '2.6:1',
        trend: 'Bullish',
        support: '[128.00, 120.00]',
        resistance: '[142.00, 160.00]'
      },
      {
        id: 'sui-alpha',
        type: 'momentum',
        name: 'Sui Network Velocity Expansion',
        symbol: 'SUI / USD',
        icon: 'U',
        confidence: 79,
        risk: 'high',
        estReturn: '20.0% - 30.0%',
        reasoning: 'Transaction metrics point to rapid ecosystem growth, breaking out above minor resistance levels.',
        entry: 1.12,
        stop_loss: 0.98,
        take_profit: 1.45,
        duration: '2-4 days',
        risk_reward: '2.4:1',
        trend: 'Bullish',
        support: '[1.05, 0.95]',
        resistance: '[1.25, 1.50]'
      }
    ];
 
    for (const opp of opportunitiesToSeed) {
      await dbRun(
        `INSERT INTO opportunities (
          id, opportunity_type, name, symbol, icon_symbol, confidence_score, expected_return, risk_level, reasoning_text,
          suggested_entry, suggested_stop_loss, suggested_take_profit, expected_duration, risk_reward_ratio, trend_direction, support_levels, resistance_levels
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          opp.id, opp.type, opp.name, opp.symbol, opp.icon, opp.confidence, opp.estReturn, opp.risk, opp.reasoning,
          opp.entry, opp.stop_loss, opp.take_profit, opp.duration, opp.risk_reward, opp.trend, opp.support, opp.resistance
        ]
      );
    }
  }  }
};

export default db;
