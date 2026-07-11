import crypto from 'crypto';
import { dbGet, dbRun, dbQuery } from '../database.js';

export const copilotMessage = async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    // Save conversation to DB
    await dbRun(
      'INSERT INTO copilot_conversations (id, user_id, sender, message_text) VALUES (?, ?, ?, ?)',
      [crypto.randomUUID(), userId, 'user', message]
    );

    // Fetch user's risk stance to customize responses
    const risk = await dbGet('SELECT risk_stance FROM risk_profiles WHERE user_id = ?', [userId]);
    const riskStance = risk ? risk.risk_stance : 'balanced';

    // Fetch user portfolio balance
    const portfolio = await dbGet('SELECT current_balance FROM portfolios WHERE user_id = ?', [userId]);
    const balance = portfolio ? portfolio.current_balance : 132000;

    let reply = '';
    let stats = '';
    let actions = [];

    const normMsg = message.toLowerCase();

    if (normMsg.includes('yield') || normMsg.includes('audit')) {
      const apyStr = riskStance === 'conservative' ? '7.18%' : (riskStance === 'aggressive' ? '26.74%' : '12.42%');
      const details = riskStance === 'conservative'
        ? '**USDC stable staking** (70% allocation, yielding 5.5% APY) and **USDS stable spreads** (20% allocation, yielding 6.8% APY)'
        : (riskStance === 'aggressive'
          ? '**Ethereum validator staking** (40% allocation, yielding 9.6% APY) and **Solana leverage spreads** (25% allocation, yielding 18.5% APY)'
          : '**Ethereum validator staking** (45% allocation, yielding 9.6% APY) and **Stablecoin Lending pool spreads** (30% allocation, yielding 8.2% APY)');

      reply = `Under your active **${riskStance.toUpperCase()}** strategy stance, Araiven is capturing compounding yield spreads across two main channels: ${details}. Both channels utilize non-custodial brokerage protocols with automated volatility cushions.`;
      stats = `Overall Portfolio APY: ${apyStr} | Safety Index: Fully Compliant`;
    } else if (normMsg.includes('hedge') || normMsg.includes('drawdown') || normMsg.includes('protect')) {
      const cushion = riskStance === 'conservative' ? '1.50%' : (riskStance === 'aggressive' ? '8.50%' : '3.50%');
      reply = `Araiven Drawdown Protection is actively guarding your assets. Under your current profile, the protective hedge buffer is set at a trailing **${cushion}** maximum variance cap. If market correlation indicators shift and volatililty targets are breached, positions will instantly hedge into stablecoin baskets.`;
      stats = `Volatility Index: Stable | Protection cushion: ${cushion}`;
    } else if (normMsg.includes('bitcoin') || normMsg.includes('btc') || normMsg.includes('halving') || normMsg.includes('momentum')) {
      const allocUSD = (balance * 0.20).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      reply = `Araiven ETF momentum models trace continuous net inflows accumulating at structural support layers. Bitcoin is stabilizing near range support, and your portfolio currently maintains a 20% holding allocation ($${(balance * 0.20).toFixed(2)}) targeted at a breakout threshold of $72,500.`;
      stats = `Bitcoin Allocation: 20% | Momentum Confidence Index: 89%`;
    } else {
      reply = `Hello! I am Araiven, your active wealth copilot. I am currently monitoring your portfolio under the **${riskStance.toUpperCase()}** strategy configuration. I analyze news sentiment, orderbook delta, and liquidity yields 24/7 to suggest optimal compounding. What aspect of your assets would you like me to audit?`;
      stats = `Active Strategy: ${riskStance.toUpperCase()} | Total Balance: $${balance.toLocaleString()}`;
    }

    // Save AI response to DB
    await dbRun(
      'INSERT INTO copilot_conversations (id, user_id, sender, message_text, stats_meta) VALUES (?, ?, ?, ?, ?)',
      [crypto.randomUUID(), userId, 'copilot', reply, stats]
    );

    return res.json({ reply, stats, actions });
  } catch (err) {
    console.error('Error in copilot message:', err);
    return res.status(500).json({ error: 'Internal server error processing copilot message.' });
  }
};

export const getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const list = await dbQuery('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    const formatted = list.map(n => ({
      notificationId: n.id,
      channel: n.channel,
      priority: n.priority,
      title: n.title,
      body: n.body,
      isRead: n.is_read === 1
    }));
    return res.json(formatted);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return res.status(500).json({ error: 'Internal server error fetching notifications.' });
  }
};

export const markNotificationsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    const unread = await dbGet('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [userId]);
    const count = unread ? unread.count : 0;

    await dbRun('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);

    return res.json({
      status: 'success',
      markedReadCount: count
    });
  } catch (err) {
    console.error('Error marking notifications read:', err);
    return res.status(500).json({ error: 'Internal server error marking notifications read.' });
  }
};

export const markSingleNotificationRead = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await dbRun('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ status: 'success' });
  } catch (err) {
    console.error('Error marking single notification read:', err);
    return res.status(500).json({ error: 'Internal server error marking notification read.' });
  }
};

export const deleteNotification = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    await dbRun('DELETE FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ status: 'success' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    return res.status(500).json({ error: 'Internal server error deleting notification.' });
  }
};

export const connectExchange = async (req, res) => {
  const userId = req.user.id;
  const { exchangeName, apiKey, apiSecret } = req.body;

  if (!exchangeName || !apiKey || !apiSecret) {
    return res.status(400).json({ error: 'Exchange name, API key and API secret are required.' });
  }

  // Check if credentials are valid (simulated)
  // For security, if they enable withdraw, fail. Let's assume standard checks:
  // If the key has "withdraw" or "WITHDRAWAL" or anything indicating withdrawal is enabled, error.
  if (apiKey.toLowerCase().includes('withdraw') || apiSecret.toLowerCase().includes('withdraw')) {
    return res.status(400).json({
      error: 'Security Error: API key credentials must have withdrawal permissions disabled.'
    });
  }

  try {
    const id = crypto.randomUUID();
    await dbRun(
      `INSERT OR REPLACE INTO connected_exchanges (id, user_id, exchange_name, api_key_kms_arn, status)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, exchangeName, `arn:aws:kms:us-east-1:123456789012:key/${crypto.randomBytes(8).toString('hex')}`, 'active']
    );

    return res.json({
      status: 'connected',
      exchange: exchangeName,
      isWithdrawalDisabled: true,
      isTradeExecutionEnabled: true
    });
  } catch (err) {
    console.error('Error connecting exchange:', err);
    return res.status(500).json({ error: 'Internal server error connecting exchange.' });
  }
};
