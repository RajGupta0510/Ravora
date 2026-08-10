import { PortfolioIntelligenceService } from './PortfolioIntelligenceService.js';
import { MarketDataService } from './MarketDataService.js';
import { AiServiceFactory } from '../ai/AiServiceFactory.js';
import { logger } from '../utils/logger.js';

export const PortfolioOptimizationService = {
  /**
   * Generates a comprehensive portfolio health score breakdown with sub-metrics
   */
  async evaluateHealthBreakdown(userId) {
    const healthData = await PortfolioIntelligenceService.getPortfolioHealth(userId);
    const { performance, allocations, riskMetrics } = healthData;

    const assets = allocations.assetAllocation;
    const sectors = allocations.sectorAllocation;
    
    // 1. Diversification Score (based on asset count and sector splits)
    const assetCount = assets.length;
    let diversificationScore = Math.min(100, assetCount * 25); // 4+ assets gets 100
    if (sectors.length > 1) {
      diversificationScore = Math.min(100, diversificationScore + (sectors.length - 1) * 10);
    }

    // 2. Concentration Score (inverse of HHI concentration)
    // HHI range is 0 to 10000. Under 1500 is optimal.
    // Let's compute HHI
    let hhi = 0;
    assets.forEach(a => {
      hhi += Math.pow(a.weight, 2);
    });
    let concentrationScore = 100;
    if (hhi > 5000) concentrationScore = 30;
    else if (hhi > 3000) concentrationScore = 55;
    else if (hhi > 1500) concentrationScore = 80;

    // 3. Cash Buffer Score (10% - 30% stablecoin is optimal)
    const cashRatio = riskMetrics.cashRatio || 0;
    let cashBufferScore = 100;
    if (cashRatio < 5) cashBufferScore = 40;
    else if (cashRatio < 10) cashBufferScore = 75;
    else if (cashRatio > 50) cashBufferScore = 60;
    else if (cashRatio > 30) cashBufferScore = 85;

    // 4. Volatility Score (lower is higher score)
    const vol = riskMetrics.volatility || 0.03;
    let volatilityScore = 100;
    if (vol > 0.04) volatilityScore = 45;
    else if (vol > 0.03) volatilityScore = 70;
    else if (vol > 0.02) volatilityScore = 85;

    // 5. Leverage Score (penalize leveraged positions)
    let maxLev = 1.0;
    allocations.assetAllocation.forEach(aa => {
      const rawAsset = healthData.allocations.assetAllocation.find(a => a.symbol === aa.symbol);
      if (rawAsset && rawAsset.leverage > maxLev) {
        maxLev = rawAsset.leverage;
      }
    });
    let leverageScore = 100;
    if (maxLev > 5) leverageScore = 30;
    else if (maxLev > 2) leverageScore = 70;

    const overallScore = Math.round(
      (diversificationScore * 0.25) +
      (concentrationScore * 0.25) +
      (cashBufferScore * 0.20) +
      (volatilityScore * 0.15) +
      (leverageScore * 0.15)
    );

    // Call Gemini to get plain-English reasoning for the health score
    let aiExplanation = `Your portfolio health score is ${overallScore}/100. `;
    try {
      const provider = AiServiceFactory.create();
      const prompt = `You are Araiven's Portfolio Strategist. Analyze the following portfolio health metrics and explain the strengths, weaknesses, and a summary explanation of the health score in 2-3 sentences.
Overall Score: ${overallScore}/100
- Diversification Score: ${diversificationScore} (Asset count: ${assetCount})
- Concentration Score: ${concentrationScore} (HHI: ${Math.round(hhi)})
- Cash Buffer Score: ${cashBufferScore} (Cash ratio: ${cashRatio}%)
- Volatility Score: ${volatilityScore}
- Leverage Score: ${leverageScore}

Keep it professional, reference these actual metrics, and use plain language.`;
      
      aiExplanation = await provider.sendRequest([{ role: 'user', content: prompt }], {
        systemInstruction: "You are Araiven's Portfolio Strategist. Provide a concise, plain-language explanation of the portfolio's health."
      });
    } catch (err) {
      logger.warn('PortfolioOptimizationService', 'Gemini health explanation failed', err);
    }

    return {
      score: overallScore,
      explanation: aiExplanation.trim(),
      metrics: {
        diversification: diversificationScore,
        concentration: concentrationScore,
        cashRatio: cashBufferScore,
        volatility: volatilityScore,
        leverage: leverageScore
      },
      raw: {
        assetCount,
        hhi: Math.round(hhi),
        cashRatio,
        volatility: vol
      }
    };
  },

  /**
   * Generates actionable recommendations based on quantitative allocations
   */
  async getRecommendations(userId) {
    const healthData = await PortfolioIntelligenceService.getPortfolioHealth(userId);
    const { allocations, riskMetrics } = healthData;
    const assets = allocations.assetAllocation;

    const recommendations = [];

    // Rule 1: High Concentration
    let maxWeight = 0;
    let maxSymbol = '';
    assets.forEach(a => {
      if (!['USDC', 'USDS', 'USDT'].includes(a.symbol) && a.weight > maxWeight) {
        maxWeight = a.weight;
        maxSymbol = a.symbol;
      }
    });

    if (maxWeight > 50) {
      recommendations.push({
        type: 'trim_position',
        title: `Trim oversized position in ${maxSymbol}`,
        priority: 'high',
        reason: `${maxSymbol} allocation represents ${maxWeight.toFixed(1)}% of your portfolio, exceeding safe concentration thresholds.`,
        expectedBenefit: `Trimming lowers concentration risk and reduces vulnerability to ${maxSymbol}-specific drawdowns.`,
        potentialDownside: `Missed upside if ${maxSymbol} continues to outperform.`,
        confidenceScore: 90
      });
    }

    // Rule 2: Low Diversification
    const cryptoAssets = assets.filter(a => !['USDC', 'USDS', 'USDT'].includes(a.symbol));
    if (cryptoAssets.length < 3) {
      recommendations.push({
        type: 'diversify',
        title: 'Increase asset diversification',
        priority: 'medium',
        reason: `Your crypto exposure is limited to only ${cryptoAssets.length} asset(s), causing high vulnerability.`,
        expectedBenefit: `Spreads risk across independent blockchains, stabilizing volatile swings.`,
        potentialDownside: `Dilutes potential returns if a single asset rallies exponentially.`,
        confidenceScore: 85
      });
    }

    // Rule 3: Extreme Cash Buffer / Low Liquidity
    const cashRatio = riskMetrics.cashRatio || 0;
    if (cashRatio < 5) {
      recommendations.push({
        type: 'add_defensive',
        title: 'Increase defensive cash allocation',
        priority: 'high',
        reason: `Your cash buffer is only ${cashRatio.toFixed(1)}%, leaving insufficient liquidity to buy asset dips.`,
        expectedBenefit: `Provides capital reserves for dip-buying and stabilizes portfolio drawdowns.`,
        potentialDownside: `Slight drag on returns during strong bull markets.`,
        confidenceScore: 95
      });
    } else if (cashRatio > 45) {
      recommendations.push({
        type: 'allocate_cash',
        title: 'Allocate idle cash holdings',
        priority: 'low',
        reason: `Cash allocation is ${cashRatio.toFixed(1)}%, causing capital inefficiency and performance drag.`,
        expectedBenefit: `Puts idle capital to work to capture market yields.`,
        potentialDownside: `Increases market risk exposure.`,
        confidenceScore: 80
      });
    }

    // Call Gemini to personalize recommendations details
    try {
      const provider = AiServiceFactory.create();
      const prompt = `You are Araiven's Portfolio Strategist. Review these quantitatively triggered portfolio recommendations:
${JSON.stringify(recommendations, null, 2)}

Provide a plain-language summary of these recommendations and explain why prioritizing them is key. Keep it under 3 sentences.`;
      const aiSummary = await provider.sendRequest([{ role: 'user', content: prompt }], {
        systemInstruction: "Explain the importance of prioritizing the portfolio rebalancing tasks."
      });
      
      return {
        summary: aiSummary.trim(),
        actions: recommendations
      };
    } catch (err) {
      logger.warn('PortfolioOptimizationService', 'Gemini recommendation summary failed', err);
      return {
        summary: 'Review high-priority allocation tasks to improve risk-adjusted yields.',
        actions: recommendations
      };
    }
  },

  /**
   * Simulates portfolio valuations under macro stress conditions
   */
  async simulateScenarios(userId) {
    const healthData = await PortfolioIntelligenceService.getPortfolioHealth(userId);
    const { allocations } = healthData;
    const assets = allocations.assetAllocation;

    // Define asset Betas relative to BTC
    const assetBetas = {
      BTC: 1.0,
      ETH: 1.2,
      SOL: 1.5,
      SUI: 1.8,
      USDC: 0.0,
      USDS: 0.0,
      USDT: 0.0,
      default: 1.3
    };

    const scenarios = [
      {
        id: 'btc_up_10',
        name: 'BTC +10% Rally',
        description: 'Standard positive market shift led by Bitcoin.',
        btcReturn: 0.10,
        otherMultiplier: 1.0
      },
      {
        id: 'btc_down_20',
        name: 'BTC -20% Correction',
        description: 'Moderate market-wide price correction.',
        btcReturn: -0.20,
        otherMultiplier: 1.0
      },
      {
        id: 'market_crash',
        name: 'Market Crash (-50%)',
        description: 'Systemic liquidation event. High-beta assets face extreme sell-offs.',
        btcReturn: -0.50,
        otherMultiplier: 1.3 // amplifies losses for higher betas
      },
      {
        id: 'bull_market',
        name: 'Bull Market Expansion',
        description: 'Prolonged bull expansion. Layer-1 and DeFi assets outperform.',
        btcReturn: 0.35,
        otherMultiplier: 1.4 // amplifies gains for high-beta assets
      },
      {
        id: 'sector_rotation',
        name: 'Sector Rotation (Altcoin Season)',
        description: 'Capital rotates out of BTC and into smart-contract networks.',
        btcReturn: -0.05,
        otherMultiplier: 3.5, // Altcoins rally while BTC stays flat/drops
        customReturns: { SOL: 0.30, SUI: 0.40, ETH: 0.15 }
      }
    ];

    const results = scenarios.map(sc => {
      let totalSimulatedValue = 0;
      let totalCurrentValue = 0;
      
      const details = assets.map(a => {
        const isStable = ['USDC', 'USDS', 'USDT'].includes(a.symbol);
        const currentVal = a.value;
        totalCurrentValue += currentVal;

        let assetReturn = 0;
        if (isStable) {
          assetReturn = 0.0;
        } else if (sc.customReturns && sc.customReturns[a.symbol] !== undefined) {
          assetReturn = sc.customReturns[a.symbol];
        } else {
          const beta = assetBetas[a.symbol] || assetBetas.default;
          assetReturn = beta * sc.btcReturn * sc.otherMultiplier;
        }

        const simulatedVal = Math.max(0, currentVal * (1 + assetReturn));
        totalSimulatedValue += simulatedVal;

        return {
          symbol: a.symbol,
          currentValue: currentVal,
          simulatedValue: Math.round(simulatedVal * 100) / 100,
          percentageChange: Math.round(assetReturn * 10000) / 100
        };
      });

      const totalChangePct = totalCurrentValue > 0 
        ? ((totalSimulatedValue - totalCurrentValue) / totalCurrentValue) * 100
        : 0;

      return {
        id: sc.id,
        name: sc.name,
        description: sc.description,
        simulatedPortfolioValue: Math.round(totalSimulatedValue * 100) / 100,
        percentageChange: Math.round(totalChangePct * 100) / 100,
        assetDetails: details
      };
    });

    return results;
  },

  /**
   * Computes rebalancing target allocations and transactional steps
   */
  async calculateRebalancing(userId) {
    const healthData = await PortfolioIntelligenceService.getPortfolioHealth(userId);
    const { allocations, performance, riskMetrics } = healthData;
    const currentVal = performance.currentValue;

    // Define target allocations based on Risk Stance
    const riskProfileTargets = {
      conservative: { USDC: 50, BTC: 30, ETH: 20 },
      balanced: { USDC: 20, BTC: 40, ETH: 30, SOL: 10 },
      aggressive: { USDC: 10, BTC: 30, ETH: 30, SOL: 20, SUI: 10 }
    };

    const stance = riskMetrics.maxDrawdown > 5.0 ? 'aggressive' : (riskMetrics.maxDrawdown < 3.0 ? 'conservative' : 'balanced');
    const targets = riskProfileTargets[stance];

    // Compute rebalance actions
    const currentAssetsMap = {};
    allocations.assetAllocation.forEach(a => {
      currentAssetsMap[a.symbol] = a.weight;
    });

    const suggestions = [];
    const allSymbols = Array.from(new Set([...Object.keys(targets), ...Object.keys(currentAssetsMap)]));

    allSymbols.forEach(sym => {
      const targetPct = targets[sym] || 0;
      const currentPct = currentAssetsMap[sym] || 0;
      const diffPct = targetPct - currentPct;

      const diffUSD = (diffPct / 100) * currentVal;

      if (Math.abs(diffPct) > 1.5) { // Only suggest trades for moves > 1.5%
        suggestions.push({
          symbol: sym,
          currentAllocationPct: Math.round(currentPct * 100) / 100,
          targetAllocationPct: targetPct,
          differencePct: Math.round(diffPct * 100) / 100,
          action: diffPct > 0 ? 'BUY' : 'SELL',
          estimatedAmountUSD: Math.round(Math.abs(diffUSD) * 100) / 100
        });
      }
    });

    return {
      stance,
      totalPortfolioValue: currentVal,
      targetSplits: targets,
      tradesRequired: suggestions
    };
  },

  /**
   * Scans opportunities filter compatible with user allocations
   */
  async getOpportunities(userId) {
    const healthData = await PortfolioIntelligenceService.getPortfolioHealth(userId);
    const existingSymbols = healthData.allocations.assetAllocation.map(a => a.symbol);

    // High volume sentiment triggers from Market overview
    const overview = await MarketDataService.getOverview();
    const suggestions = [];

    overview.forEach(o => {
      // Find asset opportunities not heavily weighted already
      const isOwned = existingSymbols.includes(o.symbol);
      const isStable = ['USDC', 'USDS', 'USDT'].includes(o.symbol);
      
      if (!isStable && o.change24h > 2.0) {
        suggestions.push({
          symbol: o.symbol,
          price: o.price,
          change24h: o.change24h,
          sentiment: o.change24h > 5.0 ? 'strongly_bullish' : 'bullish',
          reason: `${o.symbol} displays positive 24h momentum of +${o.change24h.toFixed(1)}%. Suitable asset diversification idea for your profile.`,
          alreadyOwned: isOwned
        });
      }
    });

    return suggestions.slice(0, 3);
  }
};
