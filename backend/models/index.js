/**
 * Ravora Backend V1 — Entity Shape Definitions
 * Lightweight type documentation and default factories for all database entities.
 * These serve as the "contract" between repositories, services, and controllers.
 */

// ═══════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} Profile
 * @property {string} id - UUID (matches Supabase Auth user ID)
 * @property {string} full_name
 * @property {string|null} email
 * @property {string|null} phone
 * @property {string|null} avatar_url
 * @property {string} experience_level - 'beginner' | 'intermediate' | 'advanced'
 * @property {string} primary_goal
 * @property {string} risk_stance - 'conservative' | 'balanced' | 'aggressive'
 * @property {number} max_drawdown_cap
 * @property {number} capital
 * @property {string} created_at
 * @property {string} updated_at
 */

// ═══════════════════════════════════════════════════════════
// USER SETTINGS
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} UserSettings
 * @property {string} id
 * @property {string} user_id
 * @property {boolean} auto_hedge_enabled
 * @property {boolean} notifications_enabled
 * @property {string} execution_mode - 'advisory' | 'semi_auto' | 'auto'
 * @property {string} theme - 'dark' | 'light'
 * @property {string} created_at
 * @property {string} updated_at
 */

// ═══════════════════════════════════════════════════════════
// PORTFOLIO
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} Portfolio
 * @property {string} id
 * @property {string} user_id
 * @property {number} current_balance
 * @property {string} currency - default 'USD'
 * @property {number} safety_score - 0-100
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} PortfolioAsset
 * @property {string} id
 * @property {string} portfolio_id
 * @property {string} asset_symbol
 * @property {number} allocation_pct
 * @property {number} balance_amount
 * @property {number} average_entry_price
 * @property {string} position_type - 'long' | 'short'
 * @property {number} leverage
 */

// ═══════════════════════════════════════════════════════════
// POSITIONS & ORDERS
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} Position
 * @property {string} id
 * @property {string} user_id
 * @property {string} exchange
 * @property {string} symbol
 * @property {string} side - 'long' | 'short'
 * @property {number} entry_price
 * @property {number} current_price
 * @property {number} quantity
 * @property {number} leverage
 * @property {number} margin_used
 * @property {number} unrealized_pnl
 * @property {number|null} stop_loss
 * @property {number|null} take_profit
 * @property {string} status - 'open' | 'closed' | 'liquidated'
 * @property {string} created_at
 * @property {string|null} closed_at
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} user_id
 * @property {string} exchange
 * @property {string} symbol
 * @property {string} type - 'market' | 'limit' | 'stop_loss' | 'take_profit'
 * @property {string} side - 'buy' | 'sell'
 * @property {number} quantity
 * @property {number|null} price
 * @property {string} status - 'pending' | 'filled' | 'cancelled' | 'rejected'
 * @property {string} created_at
 * @property {string|null} filled_at
 */

/**
 * @typedef {Object} TradeHistory
 * @property {string} id
 * @property {string} user_id
 * @property {string} symbol
 * @property {string} side
 * @property {number} entry_price
 * @property {number} exit_price
 * @property {number} quantity
 * @property {number} leverage
 * @property {number} pnl
 * @property {number} fee
 * @property {string} opened_at
 * @property {string} closed_at
 */

// ═══════════════════════════════════════════════════════════
// WATCHLIST
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} WatchlistItem
 * @property {string} id
 * @property {string} user_id
 * @property {string} symbol
 * @property {string|null} notes
 * @property {string} created_at
 */

// ═══════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} user_id
 * @property {string} channel - 'system' | 'trade' | 'ai' | 'alert' | 'security'
 * @property {string} priority - 'low' | 'medium' | 'high' | 'critical'
 * @property {string} title
 * @property {string} body
 * @property {boolean} is_read
 * @property {object|null} payload
 * @property {string} created_at
 */

// ═══════════════════════════════════════════════════════════
// PRICE ALERTS
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} PriceAlert
 * @property {string} id
 * @property {string} user_id
 * @property {string} symbol
 * @property {string} condition - 'above' | 'below' | 'crosses'
 * @property {number} target_price
 * @property {boolean} is_triggered
 * @property {boolean} is_active
 * @property {string} created_at
 * @property {string|null} triggered_at
 */

// ═══════════════════════════════════════════════════════════
// PAPER TRADING
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} PaperAccount
 * @property {string} id
 * @property {string} user_id
 * @property {number} balance
 * @property {number} initial_balance
 * @property {string} currency
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} PaperPosition
 * @property {string} id
 * @property {string} paper_account_id
 * @property {string} symbol
 * @property {string} side - 'long' | 'short'
 * @property {number} entry_price
 * @property {number} quantity
 * @property {number} leverage
 * @property {number|null} stop_loss
 * @property {number|null} take_profit
 * @property {string} status - 'open' | 'closed'
 * @property {string} created_at
 * @property {string|null} closed_at
 * @property {number|null} exit_price
 * @property {number|null} pnl
 */

// ═══════════════════════════════════════════════════════════
// MARKET CACHE
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} MarketCache
 * @property {string} symbol
 * @property {string} name
 * @property {number} price
 * @property {number} change_24h
 * @property {number} volume_24h
 * @property {number} market_cap
 * @property {string} updated_at
 */

// ═══════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} AuditLog
 * @property {string} id
 * @property {string|null} user_id
 * @property {string} action
 * @property {string} resource
 * @property {string|null} resource_id
 * @property {object|null} metadata
 * @property {string} ip_address
 * @property {string} created_at
 */

export const ModelVersion = '1.0.0';
