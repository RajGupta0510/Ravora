import { getSupabaseAdmin } from '../config/database.js';
import { OpportunityRepository } from '../repositories/OpportunityRepository.js';
import { OpportunityInteractionRepository } from '../repositories/OpportunityInteractionRepository.js';
import { QuantitativeScannerService } from './QuantitativeScannerService.js';
import { NotificationService } from './NotificationService.js';
import { AiServiceFactory } from '../ai/AiServiceFactory.js';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

const oppRepo = new OpportunityRepository();
const interactRepo = new OpportunityInteractionRepository();

export const OpportunityDiscoveryService = {
  /**
   * Main Personalized opportunities scanning and ranking loop
   */
  async getPersonalizedOpportunities(userId, filters = {}) {
    const db = getSupabaseAdmin();

    // 1. Fetch user watchlist & holdings context
    const { data: watchItems } = await db.from('watchlists').select('asset_symbol').eq('user_id', userId);
    const watchlistSymbols = (watchItems || []).map(w => w.asset_symbol.toUpperCase());

    const { data: portfolio } = await db.from('portfolios').select('id').eq('user_id', userId).maybeSingle();
    let holdingsSymbols = [];
    if (portfolio) {
      const { data: assets } = await db.from('portfolio_assets').select('asset_symbol').eq('portfolio_id', portfolio.id);
      holdingsSymbols = (assets || []).map(a => a.asset_symbol.toUpperCase());
    }

    // 2. Fetch user preferences risk stance
    const { data: profile } = await db.from('profiles').select('risk_stance').eq('id', userId).maybeSingle();
    const userRiskStance = profile?.risk_stance || 'balanced';

    // 3. Fetch all scanned opportunities and user interactions
    let opportunities = await oppRepo.findAllOpportunities();
    if (opportunities.length === 0) {
      // Seed default if empty
      const defaultOpps = [
        {
          id: 'opp-btc-long',
          name: 'Bitcoin Spot Bullish Breakout',
          symbol: 'BTC/USDT',
          icon_symbol: 'BTC',
          opportunity_type: 'breakout',
          opportunity_score: 94,
          confidence_score: 89,
          risk_score: 28,
          risk_level: 'low',
          expected_return: 14.5,
          reasoning_text: 'Bitcoin has stabilized at range support. High spot ETF inflows suggest structural breakout momentum.',
          suggested_entry: 64120.00,
          suggested_stop_loss: 61500.00,
          suggested_take_profit: 72500.00,
          expected_duration: '3D - 7D',
          risk_reward_ratio: 3.2,
          trend_direction: 'bullish'
        },
        {
          id: 'opp-eth-staking',
          name: 'Ethereum Liquidity Yield Compounding',
          symbol: 'ETH/USDT',
          icon_symbol: 'ETH',
          opportunity_type: 'yield_staking',
          opportunity_score: 86,
          confidence_score: 82,
          risk_score: 15,
          risk_level: 'low',
          expected_return: 9.6,
          reasoning_text: 'Stake pool yields are stabilizing at 9.6% APY with minimal smart contract exposure.',
          suggested_entry: 3485.00,
          suggested_stop_loss: 3200.00,
          suggested_take_profit: 4200.00,
          expected_duration: '30D+',
          risk_reward_ratio: 4.5,
          trend_direction: 'stable'
        }
      ];
      await db.from('opportunities').upsert(defaultOpps);
      opportunities = await oppRepo.findAllOpportunities();
    }

    const interactions = await interactRepo.findByUserId(userId);
    const dismissedIds = interactions.filter(i => i.status === 'dismissed').map(i => i.opportunity_id);
    const savedIds = interactions.filter(i => i.status === 'saved').map(i => i.opportunity_id);

    // 4. Rank by personalized scores and filter out dismissed ones
    let ranked = opportunities
      .filter(o => !dismissedIds.includes(o.id))
      .map(o => {
        const baseScore = parseFloat(o.opportunity_score || 50);
        let personalizedScore = baseScore;

        const symClean = o.symbol.split('/')[0].toUpperCase();

        // Watchlist Bonus (+20)
        if (watchlistSymbols.includes(symClean)) {
          personalizedScore += 20;
        }

        // Holdings Bonus (+15)
        if (holdingsSymbols.includes(symClean)) {
          personalizedScore += 15;
        }

        // Risk Tolerance Alignment (+15)
        const matchRisk = (userRiskStance === 'conservative' && o.risk_level === 'low') ||
                          (userRiskStance === 'balanced' && o.risk_level === 'medium') ||
                          (userRiskStance === 'aggressive' && o.risk_level === 'high');
        if (matchRisk) {
          personalizedScore += 15;
        }

        return {
          ...o,
          personalizedScore: Math.min(100, Math.round(personalizedScore)),
          isSaved: savedIds.includes(o.id)
        };
      });

    // Sort by personalized score descending
    ranked.sort((a, b) => b.personalizedScore - a.personalizedScore);

    // 5. Apply query filters
    if (filters.opportunity_type) {
      ranked = ranked.filter(o => o.opportunity_type?.toLowerCase() === filters.opportunity_type.toLowerCase());
    }
    if (filters.risk_level) {
      ranked = ranked.filter(o => o.risk_level?.toLowerCase() === filters.risk_level.toLowerCase());
    }
    if (filters.trend_direction) {
      ranked = ranked.filter(o => o.trend_direction?.toLowerCase() === filters.trend_direction.toLowerCase());
    }
    if (filters.min_confidence_score) {
      ranked = ranked.filter(o => parseFloat(o.confidence_score || 0) >= parseFloat(filters.min_confidence_score));
    }

    return ranked;
  },

  /**
   * Fetches single opportunity and calls Gemini to write advanced strengths/risks analysis
   */
  async getOpportunityDetails(userId, id) {
    const db = getSupabaseAdmin();
    const opportunity = await db.from('opportunities').select('*').eq('id', id).maybeSingle();
    
    if (!opportunity.data) {
      throw ApiError.notFound('Opportunity not found');
    }

    const opp = opportunity.data;
    
    // Generate AI Reasoning Analysis from Gemini using real backend metrics
    let aiStrengths = 'Asset is resting on key support lines.';
    let aiRisks = 'High volatility swing risk.';
    let aiMonitor = 'Watch nearest support bounds.';

    try {
      const provider = AiServiceFactory.create();
      const prompt = `You are Araiven's Lead Portfolio Strategist. Write a detailed analysis for the surfaced asset opportunity.
Asset: ${opp.name} (${opp.symbol})
Score: ${opp.opportunity_score}/100 (Confidence: ${opp.confidence_score}%)
Risk Profile: ${opp.risk_level.toUpperCase()} (Volatility Score: ${opp.risk_score})
Expected Return: ${opp.expected_return}% | Duration: ${opp.expected_duration}
Technical Reason: ${opp.reasoning_text}

You MUST output a valid JSON object matching this schema exactly:
{
  "strengths": "Detailed plain language list of key technical strengths of this setup.",
  "risks": "Detailed potential risk vectors and downside scenario factors.",
  "whatToMonitor": "Key target indicator triggers or price levels investors should monitor."
}

Do NOT invent new metrics or return formatting other than JSON.`;

      const response = await provider.sendRequest([{ role: 'user', content: prompt }], {
        jsonMode: true,
        systemInstruction: "You are Araiven's Lead Portfolio Strategist. Analyze the opportunity and return valid JSON."
      });

      const parsed = JSON.parse(response);
      aiStrengths = parsed.strengths || aiStrengths;
      aiRisks = parsed.risks || aiRisks;
      aiMonitor = parsed.whatToMonitor || aiMonitor;
    } catch (err) {
      logger.warn('OpportunityDiscoveryService', 'Gemini opportunity explanation failed', err);
    }

    return {
      opportunity: opp,
      aiAnalysis: {
        strengths: aiStrengths,
        risks: aiRisks,
        whatToMonitor: aiMonitor
      }
    };
  },

  /**
   * Returns trending opportunities based on absolute score
   */
  async getTrendingOpportunities(userId) {
    const opps = await this.getPersonalizedOpportunities(userId);
    // Sort by original opportunity_score descending
    const trending = [...opps].sort((a, b) => parseFloat(b.opportunity_score || 0) - parseFloat(a.opportunity_score || 0));
    return trending.slice(0, 3);
  },

  /**
   * Returns user's saved and dismissed interactions list
   */
  async getInteractionHistory(userId) {
    const db = getSupabaseAdmin();
    const interactions = await interactRepo.findByUserId(userId);
    
    const oppIds = interactions.map(i => i.opportunity_id);
    if (oppIds.length === 0) return [];

    const { data: opportunities } = await db.from('opportunities').select('*').in('id', oppIds);
    
    return interactions.map(i => {
      const opp = (opportunities || []).find(o => o.id === i.opportunity_id);
      return {
        interactionId: i.id,
        opportunityId: i.opportunity_id,
        status: i.status,
        updatedAt: i.updated_at,
        opportunity: opp ? {
          name: opp.name,
          symbol: opp.symbol,
          score: opp.opportunity_score
        } : null
      };
    });
  },

  /**
   * Saves/bookmarks an opportunity
   */
  async saveOpportunity(userId, opportunityId) {
    const result = await interactRepo.recordInteraction(userId, opportunityId, 'saved');
    
    // Notify
    await NotificationService.send(userId, {
      channel: 'opportunities',
      priority: 'low',
      title: 'Opportunity Bookmarked',
      body: `Successfully saved opportunity for future reference.`
    });

    return result;
  },

  /**
   * Dismisses/ignores an opportunity
   */
  async dismissOpportunity(userId, opportunityId) {
    const result = await interactRepo.recordInteraction(userId, opportunityId, 'dismissed');

    // Notify
    await NotificationService.send(userId, {
      channel: 'opportunities',
      priority: 'low',
      title: 'Opportunity Dismissed',
      body: `Opportunity has been muted from your active dashboard feed.`
    });

    return result;
  }
};
