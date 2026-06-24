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
  await dbRun(`
    CREATE TABLE IF NOT EXISTS portfolio_assets (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      allocation_pct REAL NOT NULL,
      balance_amount REAL NOT NULL,
      average_entry_price REAL NOT NULL,
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
        reasoning: 'Validator queue consolidation patterns reveal a post-upgrade yields premium on decentralized pools. Backed by institutional accumulation support lines.'
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
        reasoning: 'Spot ETF net inflows show consecutive daily acceleration, coinciding with hodler lockup peaks. Momentum targets a breakout to structural range highs.'
      },
      {
        id: 'usdc-arbitrage',
        type: 'yield',
        name: 'Stablecoin Lending Arbitrage',
        symbol: 'USDC / USDT / DAI',
        icon: '$',
        confidence: 91,
        risk: 'low',
        estReturn: '6.5% - 9.2%',
        reasoning: 'Federal Reserve rate volatility spiked arbitrage yields across Aave and Uniswap lending pools. Rotates cash reserves into peak yield efficiency.'
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
        reasoning: 'DEX trading volume indices indicate structural demand trends for Jup/Sol liquidity pairs. High variance yield with automated trailing drawdown trigger.'
      }
    ];

    for (const opp of opportunitiesToSeed) {
      await dbRun(
        `INSERT INTO opportunities (id, opportunity_type, name, symbol, icon_symbol, confidence_score, expected_return, risk_level, reasoning_text)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [opp.id, opp.type, opp.name, opp.symbol, opp.icon, opp.confidence, opp.estReturn, opp.risk, opp.reasoning]
      );
    }
  }
};

export default db;
