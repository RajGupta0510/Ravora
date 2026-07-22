import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path inside workspace
const dbPath = path.resolve(__dirname, '../ravora.db');

let db = new sqlite3.Database(dbPath, (err) => {
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
  try {
    // Check if any existing table schema in sqlite_master references 'users_old'
    const corruptTables = await dbQuery("SELECT name FROM sqlite_master WHERE sql LIKE '%users_old%';");
    if (corruptTables && corruptTables.length > 0) {
      const names = corruptTables.map(t => t.name).join(', ');
      console.warn(`[Database Self-Heal] Found dangling 'users_old' references in schemas of: ${names}`);
      throw new Error('Database contains dangling users_old references');
    }
  } catch (err) {
    console.log('[DEBUG] initializeDatabase catch block. err:', err, 'message:', err?.message, 'stack:', err?.stack);
    if (err.message && err.message.includes('users_old')) {
      console.warn('[Database Self-Heal] Schema corruption detected (dangling users_old reference). Recreating database file...');
      
      // Close active handle
      await new Promise((resolve) => db.close(() => resolve(null)));
      
      // Delete corrupt SQLite file
      try {
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
          console.log('[Database Self-Heal] Corrupted database file successfully deleted.');
        }
      } catch (delErr) {
        console.error('[Database Self-Heal] Failed to delete database file:', delErr);
      }

      // Re-establish fresh connection
      db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Error reopening database:', err);
      });
      
      // Mini buffer to ensure handle is ready
      await new Promise((resolve) => setTimeout(resolve, 200));
    } else {
      throw err;
    }
  }

  // Disable foreign keys temporarily during DDL migration checks to prevent SQLite schema corruptions
  await dbRun('PRAGMA foreign_keys = OFF;');

  // Check and migrate users table schema if needed
  try {
    const columns = await dbQuery("PRAGMA table_info(users);");
    if (columns && columns.length > 0) {
      const hasMobile = columns.some(c => c.name === 'mobile_number');
      if (!hasMobile) {
        console.log('[Migration] Upgrading users table to support optional email and mobile signup...');
        await dbRun('DROP TABLE IF EXISTS users_old;');
        await dbRun('ALTER TABLE users RENAME TO users_old;');
        
        await dbRun(`
          CREATE TABLE users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            mobile_number TEXT UNIQUE,
            full_name TEXT,
            password_hash TEXT,
            is_mfa_enabled INTEGER DEFAULT 0,
            verified_email INTEGER DEFAULT 0,
            verified_mobile INTEGER DEFAULT 0,
            always_require_otp INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await dbRun(`
          INSERT INTO users (id, email, password_hash, is_mfa_enabled, created_at, updated_at)
          SELECT id, email, password_hash, is_mfa_enabled, created_at, updated_at FROM users_old;
        `);

        await dbRun('DROP TABLE users_old;');
        console.log('[Migration] users table upgraded successfully!');
      }
    } else {
      // Table doesn't exist, create it fresh
      await dbRun(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          mobile_number TEXT UNIQUE,
          full_name TEXT,
          password_hash TEXT,
          is_mfa_enabled INTEGER DEFAULT 0,
          verified_email INTEGER DEFAULT 0,
          verified_mobile INTEGER DEFAULT 0,
          always_require_otp INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
  } catch (err) {
    console.error('[Migration] Error during users table check/migration:', err);
    // Fresh creation fallback
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        mobile_number TEXT UNIQUE,
        full_name TEXT,
        password_hash TEXT,
        is_mfa_enabled INTEGER DEFAULT 0,
        verified_email INTEGER DEFAULT 0,
        verified_mobile INTEGER DEFAULT 0,
        always_require_otp INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  // Re-enable foreign key constraints after all schema alterations are completed
  await dbRun('PRAGMA foreign_keys = ON;');

  // 1b. user_otps table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_otps (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      otp_code TEXT NOT NULL,
      channel TEXT NOT NULL,
      attempts INTEGER DEFAULT 0,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 1c. user_devices table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      device_fingerprint TEXT NOT NULL,
      is_trusted INTEGER DEFAULT 0,
      ip_address TEXT,
      user_agent TEXT,
      last_login_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 1d. social_identities table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS social_identities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_user_id TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, provider_user_id)
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
      opportunity_type TEXT NOT NULL, -- Storing 'LONG' | 'SHORT' | 'HOLD'
      name TEXT NOT NULL,
      symbol TEXT NOT NULL,
      icon_symbol TEXT NOT NULL,
      opportunity_score INTEGER DEFAULT 0,
      confidence_score INTEGER NOT NULL,
      risk_score INTEGER DEFAULT 0,
      risk_level TEXT NOT NULL,
      expected_return TEXT,
      reasoning_text TEXT NOT NULL,
      suggested_entry REAL,
      suggested_stop_loss REAL,
      suggested_take_profit REAL,
      suggested_take_profit_1 REAL,
      suggested_take_profit_2 REAL,
      suggested_take_profit_3 REAL,
      expected_duration TEXT,
      risk_reward_ratio TEXT,
      trend_direction TEXT,
      trend_strength INTEGER,
      support_levels TEXT,
      resistance_levels TEXT,
      trade_probability INTEGER,
      strategy_used TEXT,
      trade_quality TEXT,
      nearest_support REAL,
      nearest_resistance REAL,
      distance_to_support REAL,
      distance_to_resistance REAL,
      market_bias TEXT,
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

  // 13a. paper_positions table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS paper_positions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      direction TEXT NOT NULL,
      entry_price REAL NOT NULL,
      position_size REAL NOT NULL,
      leverage REAL DEFAULT 1.0,
      stop_loss REAL,
      take_profit_1 REAL,
      take_profit_2 REAL,
      take_profit_3 REAL,
      open_time TEXT DEFAULT CURRENT_TIMESTAMP,
      recommendation_confidence INTEGER,
      opportunity_score INTEGER,
      status TEXT DEFAULT 'OPEN',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 13b. paper_trade_history table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS paper_trade_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      direction TEXT NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL NOT NULL,
      position_size REAL NOT NULL,
      leverage REAL DEFAULT 1.0,
      profit_loss REAL NOT NULL,
      open_time TEXT NOT NULL,
      close_time TEXT DEFAULT CURRENT_TIMESTAMP,
      reason_closed TEXT NOT NULL,
      win_loss TEXT NOT NULL,
      recommendation_confidence INTEGER,
      opportunity_score INTEGER,
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

  // 16. orders table (Trade Execution V1)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      exchange TEXT NOT NULL,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL,
      side TEXT NOT NULL,
      quantity REAL NOT NULL,
      price REAL,
      filled_price REAL,
      fee REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      exchange_order_id TEXT,
      client_order_id TEXT,
      stop_price REAL,
      leverage REAL DEFAULT 1.0,
      error_message TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      filled_at TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 17. executions table (Trade Execution V1 Fills)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS executions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      exchange_account_id TEXT NOT NULL,
      exchange_execution_id TEXT,
      symbol TEXT NOT NULL,
      side TEXT NOT NULL,
      price REAL NOT NULL,
      quantity REAL NOT NULL,
      fee REAL DEFAULT 0,
      fee_asset TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // 18. order_events table (Trade Execution V1 Status Transitions)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS order_events (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      message TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // 19. exchange_responses table (Trade Execution V1 Raw Request/Response Logs)
  await dbRun(`
    CREATE TABLE IF NOT EXISTS exchange_responses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT,
      exchange TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      request_payload TEXT NOT NULL,
      response_payload TEXT NOT NULL,
      status_code INTEGER,
      latency_ms INTEGER,
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
        type: 'LONG',
        name: 'Ethereum Staking Alpha',
        symbol: 'ETH / USD',
        icon: 'Ξ',
        oppScore: 92,
        confidence: 94,
        riskScore: 24,
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
        type: 'LONG',
        name: 'Bitcoin ETF Momentum Stacking',
        symbol: 'BTC / USD',
        icon: '₿',
        oppScore: 88,
        confidence: 89,
        riskScore: 42,
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
        id: 'bnb-breakout',
        type: 'LONG',
        name: 'Binance Coin Ecosystem Breakout',
        symbol: 'BNB / USD',
        icon: 'B',
        oppScore: 85,
        confidence: 80,
        riskScore: 45,
        risk: 'medium',
        estReturn: '12.0% - 18.0%',
        reasoning: 'BNB Chain transaction velocity indicates structural breakout momentum above local range resistance.',
        entry: 580.00,
        stop_loss: 560.00,
        take_profit: 630.00,
        duration: '3-5 days',
        risk_reward: '2.5:1',
        trend: 'Bullish',
        support: '[570.00, 550.00]',
        resistance: '[600.00, 620.00]'
      },
      {
        id: 'solana-liquidity',
        type: 'LONG',
        name: 'Solana Liquidity Staking Accumulation',
        symbol: 'SOL / USD',
        icon: 'S',
        oppScore: 76,
        confidence: 78,
        riskScore: 68,
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
        type: 'LONG',
        name: 'Sui Network Velocity Expansion',
        symbol: 'SUI / USD',
        icon: 'U',
        oppScore: 78,
        confidence: 79,
        riskScore: 65,
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
          id, opportunity_type, name, symbol, icon_symbol, opportunity_score, confidence_score, risk_score, risk_level, expected_return, reasoning_text,
          suggested_entry, suggested_stop_loss, suggested_take_profit, suggested_take_profit_1, suggested_take_profit_2, suggested_take_profit_3,
          expected_duration, risk_reward_ratio, trend_direction, trend_strength, support_levels, resistance_levels,
          trade_probability, strategy_used, trade_quality, nearest_support, nearest_resistance, distance_to_support, distance_to_resistance, market_bias
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          opp.id,
          opp.type,
          opp.name,
          opp.symbol,
          opp.icon,
          opp.oppScore,
          opp.confidence,
          opp.riskScore,
          opp.risk,
          opp.estReturn,
          JSON.stringify({
            summary: opp.reasoning,
            whyThisAsset: `Strong structural support and high opportunity score of ${opp.oppScore}.`,
            whyNow: `Ecosystem indicators and trend strength confirm a high-probability entry point.`,
            supportingEvidence: [`Volume expansion confirmed`, `Trend bias: ${opp.trend}`],
            potentialRisks: [`General market volatility drawdown`],
            suggestedAction: opp.type
          }),
          opp.entry,
          opp.stop_loss,
          opp.take_profit,
          opp.entry > 0 ? Math.round(opp.entry * 1.02 * 100) / 100 : 0,
          opp.entry > 0 ? Math.round(opp.entry * 1.05 * 100) / 100 : 0,
          opp.entry > 0 ? Math.round(opp.entry * 1.08 * 100) / 100 : 0,
          opp.duration,
          opp.risk_reward,
          opp.trend,
          80,
          opp.support,
          opp.resistance,
          75,
          'Pullback',
          'Good',
          opp.entry > 0 ? Math.round(opp.entry * 0.98 * 100) / 100 : 0,
          opp.entry > 0 ? Math.round(opp.entry * 1.05 * 100) / 100 : 0,
          1.5,
          2.5,
          opp.trend
        ]
      );
    }
  }

  // Migrations for Onboarding V2: preferred_markets, dashboard_layout, ai_preferences
  try {
    await dbRun('ALTER TABLE user_profiles ADD COLUMN preferred_markets TEXT;');
    console.log('[Migration] Added preferred_markets column to user_profiles');
  } catch (e) {
    // Ignore error if column already exists
  }
  try {
    await dbRun('ALTER TABLE user_profiles ADD COLUMN dashboard_layout TEXT;');
    console.log('[Migration] Added dashboard_layout column to user_profiles');
  } catch (e) {
    // Ignore error if column already exists
  }
  try {
    await dbRun('ALTER TABLE user_profiles ADD COLUMN ai_preferences TEXT;');
    console.log('[Migration] Added ai_preferences column to user_profiles');
  } catch (e) {
    // Ignore error if column already exists
  }
  try {
    await dbRun('ALTER TABLE paper_trade_history ADD COLUMN notes TEXT;');
    console.log('[Migration] Added notes column to paper_trade_history');
  } catch (e) {
    // Ignore error if column already exists
  }
  try {
    await dbRun('ALTER TABLE user_profiles ADD COLUMN username TEXT;');
    console.log('[Migration] Added username column to user_profiles');
  } catch (e) {}
  try {
    await dbRun('ALTER TABLE user_profiles ADD COLUMN country TEXT;');
    console.log('[Migration] Added country column to user_profiles');
  } catch (e) {}
  try {
    await dbRun('ALTER TABLE user_profiles ADD COLUMN timezone TEXT;');
    console.log('[Migration] Added timezone column to user_profiles');
  } catch (e) {}
  try {
    await dbRun('ALTER TABLE user_profiles ADD COLUMN preferred_currency TEXT;');
    console.log('[Migration] Added preferred_currency column to user_profiles');
  } catch (e) {}
};

export default db;
