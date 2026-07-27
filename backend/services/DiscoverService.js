import { getSupabaseAdmin } from '../config/database.js';
import { MarketDataService } from './MarketDataService.js';
import { PortfolioIntelligenceService } from './PortfolioIntelligenceService.js';
import { PortfolioOptimizationService } from './PortfolioOptimizationService.js';
import { DiscoverInteractionRepository } from '../repositories/DiscoverInteractionRepository.js';
import { NotificationService } from './NotificationService.js';
import { AiServiceFactory } from './AiServiceFactory.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

const interactRepo = new DiscoverInteractionRepository();

export const DiscoverService = {
  /**
   * Generates mock and real-time backend compiled insights dynamically
   */
  async generateInsights(userId) {
    const db = getSupabaseAdmin();

    // 1. Fetch user stance and assets context
    const { data: watchItems } = await db.from('watchlists').select('asset_symbol').eq('user_id', userId);
    const watchlistSymbols = (watchItems || []).map(w => w.asset_symbol.toUpperCase());

    let holdingsSymbols = [];
    let portfolioValue = 100000;
    let cashRatio = 30;
    let largestWeight = 0;
    let largestSymbol = '';

    try {
      const healthData = await PortfolioIntelligenceService.getPortfolioHealth(userId);
      portfolioValue = healthData.performance.currentValue || 100000;
      cashRatio = healthData.riskMetrics.cashRatio || 30;
      
      const assets = healthData.allocations.assetAllocation || [];
      holdingsSymbols = assets.map(a => a.symbol.toUpperCase());
      
      assets.forEach(a => {
        if (!['USDC', 'USDS', 'USDT'].includes(a.symbol) && a.weight > largestWeight) {
          largestWeight = a.weight;
          largestSymbol = a.symbol;
        }
      });
    } catch (err) {
      logger.warn('DiscoverService', 'Failed to retrieve user portfolio stats, using fallbacks', err);
    }

    const overview = await MarketDataService.getOverview();
    const btcMarket = overview.find(o => o.symbol === 'BTC') || { price: 65000, change24h: 1.5 };
    const ethMarket = overview.find(o => o.symbol === 'ETH') || { price: 3500, change24h: 2.2 };
    const solMarket = overview.find(o => o.symbol === 'SOL') || { price: 150, change24h: -1.2 };

    const rawInsights = [];

    // Category 1: Portfolio Risk Alerts
    if (largestWeight > 50) {
      rawInsights.push({
        id: `ins-risk-concentration-${largestSymbol.toLowerCase()}`,
        symbol: largestSymbol,
        category: 'risk',
        title: `High Portfolio Concentration in ${largestSymbol}`,
        description: `Your ${largestSymbol} allocation represents ${largestWeight.toFixed(1)}% of total equity. This exceeds diversification thresholds.`,
        confidenceScore: 95,
        priority: 'high',
        impactLevel: 'high',
        urgency: 'medium',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5m ago
        supportingFactors: [`${largestSymbol} weight: ${largestWeight.toFixed(1)}%`, 'Recommended maximum: 40%']
      });
    }

    if (cashRatio < 10) {
      rawInsights.push({
        id: 'ins-risk-low-cash',
        symbol: 'USDC',
        category: 'risk',
        title: 'Low Cash Allocation Defenses',
        description: `Idle stablecoin cash balance is only ${cashRatio.toFixed(1)}%. Portfolio exposure is highly leveraged.`,
        confidenceScore: 90,
        priority: 'high',
        impactLevel: 'medium',
        urgency: 'high',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30m ago
        supportingFactors: [`Stablecoins weight: ${cashRatio.toFixed(1)}%`, 'Required safety threshold: 10%']
      });
    }

    // Category 2: Market Opportunities
    if (ethMarket.change24h > 2.0) {
      rawInsights.push({
        id: 'ins-opp-eth-breakout',
        symbol: 'ETH',
        category: 'opportunity',
        title: 'Ethereum Technical Support Breakout',
        description: `ETH has broken above short-term resistance at $${(ethMarket.price * 0.98).toFixed(0)} with strong relative volume.`,
        confidenceScore: 84,
        priority: 'medium',
        impactLevel: 'medium',
        urgency: 'medium',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15m ago
        supportingFactors: [`RSI: 62`, `24h Change: +${ethMarket.change24h}%`, 'EMA Golden Crossover active']
      });
    }

    // Category 3: Market Events
    if (Math.abs(btcMarket.change24h) > 1.0) {
      rawInsights.push({
        id: 'ins-event-btc-volatility',
        symbol: 'BTC',
        category: 'event',
        title: 'Bitcoin Market Volume Surge',
        description: `BTC price shifted by ${btcMarket.change24h > 0 ? '+' : ''}${btcMarket.change24h}% overnight with trading volume up 85%.`,
        confidenceScore: 88,
        priority: 'medium',
        impactLevel: 'low',
        urgency: 'low',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
        supportingFactors: [`Price: $${btcMarket.price}`, `Volume Spike: 1.8x average`]
      });
    }

    // Category 4: News Insights
    rawInsights.push({
      id: 'ins-news-staking-yields',
      symbol: 'ETH',
      category: 'news',
      title: 'Decentralized Staking Yield Expansion',
      description: 'Lido and RocketPool staking pools report increased net capital inflows matching a post-upgrade yields premium.',
      confidenceScore: 80,
      priority: 'low',
      impactLevel: 'low',
      urgency: 'low',
      timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), // 4h ago
      supportingFactors: ['Ethereum staking yields: 9.6% APY', 'ETF inflows: +$140M']
    });

    // Category 5: Hidden Opportunities
    const hasSol = holdingsSymbols.includes('SOL');
    if (!hasSol) {
      rawInsights.push({
        id: 'ins-hidden-sol-growth',
        symbol: 'SOL',
        category: 'hidden',
        title: 'Solana Liquidity Growth Vector',
        description: 'Solana TVL expanded by 14% over the past week, suggesting capital inflows that are currently under-represented in your holdings.',
        confidenceScore: 78,
        priority: 'low',
        impactLevel: 'medium',
        urgency: 'low',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Yesterday
        supportingFactors: ['SOL current price: $' + solMarket.price, 'Portfolio allocation: 0%']
      });
    }

    // Category 6: Watchlist Alerts
    const watchSol = watchlistSymbols.includes('SOL');
    if (watchSol) {
      rawInsights.push({
        id: 'ins-alert-sol-support',
        symbol: 'SOL',
        category: 'alert',
        title: 'SOL Watchlist Target Approaching',
        description: `SOL is trading near support range support levels of $${(solMarket.price * 0.99).toFixed(2)}.`,
        confidenceScore: 82,
        priority: 'medium',
        impactLevel: 'medium',
        urgency: 'medium',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8m ago
        supportingFactors: [`Watchlist target: $${(solMarket.price * 0.99).toFixed(2)}`, `Current price: $${solMarket.price}`]
      });
    }

    return rawInsights;
  },

  /**
   * Groups, ranks, personalizes, and filters discovery insights
   */
  async getPersonalizedFeed(userId, queryParams = {}) {
    const db = getSupabaseAdmin();
    const rawInsights = await this.generateInsights(userId);

    // 1. Fetch user watchlist & holdings
    const { data: watchItems } = await db.from('watchlists').select('asset_symbol').eq('user_id', userId);
    const watchlistSymbols = (watchItems || []).map(w => w.asset_symbol.toUpperCase());

    const { data: portfolio } = await db.from('portfolios').select('id').eq('user_id', userId).maybeSingle();
    let holdingsSymbols = [];
    if (portfolio) {
      const { data: assets } = await db.from('portfolio_assets').select('asset_symbol').eq('portfolio_id', portfolio.id);
      holdingsSymbols = (assets || []).map(a => a.asset_symbol.toUpperCase());
    }

    // 2. Fetch user interactions (Filter out dismissed ones)
    const interactions = await interactRepo.findByUserId(userId);
    const dismissedIds = interactions.filter(i => i.status === 'dismissed').map(i => i.insight_id);
    const savedIds = interactions.filter(i => i.status === 'saved').map(i => i.insight_id);

    let filtered = rawInsights
      .filter(ins => !dismissedIds.includes(ins.id))
      .map(ins => {
        let score = ins.confidenceScore;
        const symClean = ins.symbol.toUpperCase();

        // Personalization Boosts
        if (watchlistSymbols.includes(symClean)) score += 20;
        if (holdingsSymbols.includes(symClean)) score += 15;
        if (ins.priority === 'high' || ins.priority === 'critical') score += 10;

        return {
          ...ins,
          discoveryScore: Math.min(100, score),
          isSaved: savedIds.includes(ins.id)
        };
      });

    // 3. Apply Filters and Search query
    if (queryParams.category) {
      filtered = filtered.filter(ins => ins.category === queryParams.category);
    }
    if (queryParams.priority) {
      filtered = filtered.filter(ins => ins.priority === queryParams.priority);
    }
    if (queryParams.symbol) {
      filtered = filtered.filter(ins => ins.symbol.toUpperCase() === queryParams.symbol.toUpperCase());
    }
    if (queryParams.search) {
      const q = queryParams.search.toLowerCase();
      filtered = filtered.filter(ins => 
        ins.title.toLowerCase().includes(q) || 
        ins.description.toLowerCase().includes(q) || 
        ins.symbol.toLowerCase().includes(q)
      );
    }

    // Sort by discovery score descending
    filtered.sort((a, b) => b.discoveryScore - a.discoveryScore);

    // 4. Smart Grouping by Asset Symbol
    const groupsMap = {};
    filtered.forEach(ins => {
      const sym = ins.symbol.toUpperCase();
      if (!groupsMap[sym]) {
        groupsMap[sym] = {
          asset: sym === 'BTC' ? 'Bitcoin' : (sym === 'ETH' ? 'Ethereum' : (sym === 'SOL' ? 'Solana' : `${sym} Asset`)),
          symbol: sym,
          primaryScore: ins.discoveryScore,
          insights: []
        };
      }
      groupsMap[sym].insights.push(ins);
      // Keep primary group score equal to highest child score
      if (ins.discoveryScore > groupsMap[sym].primaryScore) {
        groupsMap[sym].primaryScore = ins.discoveryScore;
      }
    });

    const groupedFeed = Object.values(groupsMap);
    groupedFeed.sort((a, b) => b.primaryScore - a.primaryScore);

    return groupedFeed;
  },

  /**
   * Generates a daily natural-language summary briefing from active insights
   */
  async getDailyBriefing(userId) {
    const rawInsights = await this.generateInsights(userId);
    
    // Group categories
    const countMap = { opportunity: 0, risk: 0, event: 0, news: 0, hidden: 0, alert: 0 };
    rawInsights.forEach(i => {
      countMap[i.category] = (countMap[i.category] || 0) + 1;
    });

    let briefingText = `Good morning. Overnight I analyzed the market and your portfolio. I identified ${countMap.opportunity} opportunities, detected ${countMap.risk} portfolio risks, and triggered ${countMap.alert} watchlist alerts.`;

    try {
      const provider = AiServiceFactory.create();
      const prompt = `You are Araiven, the flagship AI Analyst. Write a personalized plain-language daily briefing for the user summarizing overnight market conditions, portfolio risk factors, and watchlist alerts.
Active Insights:
${JSON.stringify(rawInsights.map(i => ({ category: i.category, title: i.title, priority: i.priority })), null, 2)}

Format this as a friendly morning message. Start with "Good morning." and keep the total text under 4 sentences. Summarize the key action items.`;

      briefingText = await provider.sendRequest([{ role: 'user', content: prompt }], {
        systemInstruction: "You are Araiven, Ravora's morning strategist. Provide a brief morning market update."
      });
    } catch (err) {
      logger.warn('DiscoverService', 'Failed to generate AI morning briefing', err);
    }

    return {
      timestamp: new Date().toISOString(),
      briefing: briefingText.trim(),
      counts: countMap
    };
  },

  /**
   * Retrieves high-priority alerts
   */
  async getHighPriorityAlerts(userId) {
    const rawInsights = await this.generateInsights(userId);
    return rawInsights.filter(i => i.priority === 'high' || i.priority === 'critical');
  },

  /**
   * Calls Gemini for a deep-dive explanation of a specific insight
   */
  async explainInsightDetail(userId, insightId) {
    const rawInsights = await this.generateInsights(userId);
    const insight = rawInsights.find(i => i.id === insightId);

    if (!insight) {
      throw ApiError.notFound('Insight not found');
    }

    let explanation = `This insight appeared because of indicators on ${insight.symbol}.`;

    try {
      const provider = AiServiceFactory.create();
      const prompt = `You are Araiven's Lead Investment Analyst. Explain this surfaced alert in detail.
Insight Type: ${insight.category.toUpperCase()} | Asset: ${insight.symbol}
Title: ${insight.title}
Details: ${insight.description}
Supporting Factors: ${JSON.stringify(insight.supportingFactors)}

Write a professional explanation answering:
1. Why this appeared and why it matters.
2. What are the immediate risks.
3. What scenarios could unfold and what investors should monitor next.

Keep the text under 5 sentences, structured and professional.`;

      explanation = await provider.sendRequest([{ role: 'user', content: prompt }], {
        systemInstruction: "Provide detailed scenarios and risks for the surfaced alert."
      });
    } catch (err) {
      logger.warn('DiscoverService', `Failed to explain detail for insight ${insightId}`, err);
    }

    return {
      insightId,
      explanation: explanation.trim()
    };
  },

  /**
   * Saves/bookmarks an insight
   */
  async saveInsight(userId, insightId) {
    const result = await interactRepo.recordInteraction(userId, insightId, 'saved');
    
    await NotificationService.send(userId, {
      channel: 'araiven',
      priority: 'low',
      title: 'Insight Saved',
      body: 'Successfully bookmarked discover insight to history.'
    });

    return result;
  },

  /**
   * Dismisses/ignores an insight
   */
  async dismissInsight(userId, insightId) {
    const result = await interactRepo.recordInteraction(userId, insightId, 'dismissed');

    await NotificationService.send(userId, {
      channel: 'araiven',
      priority: 'low',
      title: 'Insight Dismissed',
      body: 'Muted discovery insight from active feed.'
    });

    return result;
  }
};
