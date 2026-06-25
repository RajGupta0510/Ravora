document.addEventListener('DOMContentLoaded', () => {

  // Initialize Chart Intelligence Engine
  if (typeof window.initChartIntelligence === 'function') {
    window.initChartIntelligence('terminal-candlestick-chart');
  }

  // ==========================================================================
  // Core State & Realistic Data Sets
  // ==========================================================================
  const state = {
    onboardingCompleted: false,
    currentStep: 1,
    profile: {
      experience: 'beginner',
      capital: 132000,
      riskLevel: 1, // 0 = Conservative, 1 = Balanced, 2 = Aggressive
      goal: 'preservation',
      horizon: 'short'
    },
    currentScreen: 'dashboard',
    notifications: [],
    trades: [],
    opportunities: [],
    previousBalance: 0
  };

  function animateValue(obj, start, end, duration, prefix = '', suffix = '', decimals = 2) {
    if (!obj) return;
    const startVal = parseFloat(start) || 0;
    const endVal = parseFloat(end) || 0;
    if (startVal === endVal) {
      obj.textContent = prefix + endVal.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      return;
    }
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = startVal + progress * (endVal - startVal);
      obj.textContent = prefix + currentVal.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  const riskConfigurations = {
    0: { // Conservative
      badgeText: 'CONSERVATIVE SHIELD',
      badgeClass: 'cons',
      change: '+$8,340.20 (+7.2% 24h)',
      changeClass: 'positive',
      riskSub: 'Max Protective Guard Active',
      health: '98%',
      healthSub: 'drawdown capped at 1.50%'
    },
    1: { // Balanced
      badgeText: 'BALANCED MODEL',
      badgeClass: '',
      change: '+$14,210.60 (+12.0% 24h)',
      changeClass: 'positive',
      riskSub: 'Balanced Protection Shield',
      health: '96%',
      healthSub: 'drawdown capped at 3.50%'
    },
    2: { // Aggressive
      badgeText: 'AGGRESSIVE CAPTURE',
      badgeClass: 'agg',
      change: '+$31,520.10 (+26.7% 24h)',
      changeClass: 'positive',
      riskSub: 'High Volatility Trailing Capture',
      health: '91%',
      healthSub: 'drawdown capped at 8.50%'
    }
  };

  let activePeriod = '24h';
  let activeOpportunity = null;
  let activeRecommendationId = null;

  // Dynamic API Base URL detection (redirects to port 3000 if served via static servers on other ports)
  const API_BASE = window.location.port !== '3000' ? 'http://localhost:3000/v1' : '/v1';

  // ==========================================================================
  // API Call Helper
  // ==========================================================================
  async function apiCall(endpoint, options = {}) {
    // Simulate slight network delay for realism
    await new Promise(resolve => setTimeout(resolve, 150));

    const urlPath = endpoint.split('?')[0];
    const token = localStorage.getItem('ravora_token');
    
    // Attempt real API call if logged in or hitting auth routes
    const useRealAPI = token || urlPath === '/auth/login' || urlPath === '/auth/register';

    if (useRealAPI) {
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers
        });

        if (response.ok) {
          return await response.json();
        } else if (response.status === 401) {
          localStorage.removeItem('ravora_token');
        } else {
          console.warn(`Real API returned status ${response.status} for ${endpoint}. Falling back to mock...`);
        }
      } catch (err) {
        console.warn(`Real API fetch failed for ${endpoint}. Falling back to mock...`, err.message);
      }
    }

    // Handle GET /user/profile
    if (urlPath === '/user/profile') {
      const onboardingCompleted = localStorage.getItem('ravora_onboarding_completed') === 'true';
      return {
        onboardingCompleted,
        profile: {
          experience_level: localStorage.getItem('ravora_profile_experience') || 'beginner',
          capital: parseInt(localStorage.getItem('ravora_profile_capital') || '132000'),
          risk_stance: localStorage.getItem('ravora_profile_risk') || 'balanced',
          primary_goal: localStorage.getItem('ravora_profile_goal') || 'preservation'
        }
      };
    }

    // Handle POST /user/onboard
    if (urlPath === '/user/onboard' && options.method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const riskLevels = { 0: 'conservative', 1: 'balanced', 2: 'aggressive' };
      const riskStance = riskLevels[body.riskLevel] || 'balanced';

      localStorage.setItem('ravora_profile_experience', body.experience || 'beginner');
      localStorage.setItem('ravora_profile_capital', (body.capital || 132000).toString());
      localStorage.setItem('ravora_profile_risk', riskStance);
      localStorage.setItem('ravora_profile_goal', body.goal || 'preservation');
      localStorage.setItem('ravora_profile_horizon', body.horizon || 'short');
      localStorage.setItem('ravora_onboarding_completed', 'true');

      // Initialize holdings as 100% USDC (user starts with cash reserves and rebalances to targets)
      const capital = body.capital || 132000;
      const initialHoldings = [
        { asset: 'USDC Stablecoin', symbol: 'USDC', allocationPct: 100.0, amount: capital, entryPrice: 1.0, currentPrice: 1.0, change24h: 0.0 }
      ];
      localStorage.setItem('ravora_holdings', JSON.stringify(initialHoldings));

      // Reset notifications & add default onboarding alerts
      const initialNotifications = [
        {
          notificationId: 'notif-' + Math.random().toString(36).substring(2, 10),
          channel: 'risk',
          priority: 'medium',
          title: 'Drawdown Protection Shield Configured',
          body: `Araiven calculated correlation matrices and established drawdown cushion at ${body.riskLevel === 0 ? '1.50' : (body.riskLevel === 2 ? '8.50' : '3.50')}%.`,
          isRead: false
        },
        {
          notificationId: 'notif-' + Math.random().toString(36).substring(2, 10),
          channel: 'opportunities',
          priority: 'medium',
          title: 'Ethereum Staking Alpha Opportunity Ingested',
          body: 'New opportunity detected on decentralized staking pools yielding 9.6% APY.',
          isRead: false
        }
      ];
      localStorage.setItem('ravora_notifications', JSON.stringify(initialNotifications));

      // Reset recommendations dynamically using engine v1
      const initialRecommendations = generateMockRecommendations(body.riskLevel, body.goal, body.horizon || 'short', capital);
      localStorage.setItem('ravora_recommendations', JSON.stringify(initialRecommendations));
      localStorage.setItem('ravora_transactions', JSON.stringify([]));

      return { success: true, message: 'Onboarding completed successfully.' };
    }

    // Handle POST /user/settings
    if (urlPath === '/user/settings') {
      return { success: true };
    }

    // Handle GET /portfolio
    if (urlPath === '/portfolio') {
      const capital = parseInt(localStorage.getItem('ravora_profile_capital') || '132000');
      const riskStance = localStorage.getItem('ravora_profile_risk') || 'balanced';
      const holdings = JSON.parse(localStorage.getItem('ravora_holdings') || '[]');
      const apys = { conservative: '7.18%', balanced: '12.42%', aggressive: '26.74%' };

      try {
        const pRes = await fetch(`${API_BASE}/market/overview`);
        if (pRes.ok) {
          const overview = await pRes.json();
          // Update holdings currentPrice and change24h dynamically
          holdings.forEach(h => {
            const assetInfo = overview.find(o => o.symbol === h.symbol);
            if (assetInfo) {
              h.currentPrice = assetInfo.price;
              h.change24h = assetInfo.change24h;
            }
          });
          // Save updated holdings back to localStorage to maintain consistency
          localStorage.setItem('ravora_holdings', JSON.stringify(holdings));
        }
      } catch (err) {
        console.error('Error updating holdings with live prices:', err);
      }

      return {
        currentBalance: capital,
        currency: 'USD',
        safetyScore: riskStance === 'conservative' ? 98 : (riskStance === 'balanced' ? 96 : 91),
        annualizedYield: apys[riskStance] || '12.42%',
        holdings
      };
    }

    // Handle GET /portfolio/history
    if (urlPath === '/portfolio/history') {
      const urlParams = new URLSearchParams(endpoint.split('?')[1] || '');
      const period = urlParams.get('period') || '24h';
      const riskStance = localStorage.getItem('ravora_profile_risk') || 'balanced';

      let symbol = 'ETH';
      if (riskStance === 'conservative') symbol = 'BTC';
      else if (riskStance === 'aggressive') symbol = 'SOL';

      try {
        const response = await fetch(`${API_BASE}/market/assets/${symbol}`);
        if (!response.ok) throw new Error('Failed to fetch asset history');
        const assetData = await response.json();
        const historyPoints = assetData.history || [];

        // Grab the price values
        let prices = historyPoints.map(pt => pt.price);

        // If history is empty, fall back to mock
        if (prices.length === 0) {
          prices = [100, 101, 102, 103, 104, 105, 106];
        }

        // Slice based on period if necessary (since CoinCap history has 30 points)
        // E.g. '24h': last 7 points, '7d': last 7 points, '30d': all 30 points, '1y': all 30 points (scaled)
        if (period === '24h' || period === '7d') {
          prices = prices.slice(-7);
        } else {
          prices = prices.slice(-30);
        }

        const capital = parseInt(localStorage.getItem('ravora_profile_capital') || '132000');
        const lastBaseVal = prices[prices.length - 1];
        const scaleFactor = lastBaseVal > 0 ? capital / lastBaseVal : 1;
        const scaledPoints = prices.map(val => Math.round(val * scaleFactor * 100) / 100);

        return {
          period,
          points: scaledPoints
        };
      } catch (err) {
        console.error('Error fetching real chart history, falling back to mock:', err);
        // Fallback to the original mock dataset logic
        const baseDatasets = {
          conservative: {
            '24h': [123500, 123800, 123900, 124200, 124100, 124300, 124582],
            '7d': [121000, 121800, 122400, 122900, 123600, 124000, 124582],
            '30d': [118000, 119500, 120200, 121900, 122800, 123400, 124582],
            '1y': [105000, 108000, 111000, 113000, 117000, 120000, 124582]
          },
          balanced: {
            '24h': [128000, 127200, 129500, 128400, 130800, 131500, 132194],
            '7d': [122000, 124500, 126000, 125100, 129000, 130200, 132194],
            '30d': [115000, 118000, 122000, 121500, 127000, 129000, 132194],
            '1y': [98000, 104000, 109000, 112000, 122000, 127000, 132194]
          },
          aggressive: {
            '24h': [141000, 138000, 146000, 142000, 148500, 145000, 149425],
            '7d': [130000, 138000, 134000, 142000, 145000, 141000, 149425],
            '30d': [120000, 132000, 127000, 139000, 142000, 136000, 149425],
            '1y': [88000, 102000, 95000, 118000, 134000, 126000, 149425]
          }
        };
        const stanceData = baseDatasets[riskStance] || baseDatasets.balanced;
        const basePoints = stanceData[period] || stanceData['24h'];
        const capital = parseInt(localStorage.getItem('ravora_profile_capital') || '132000');
        const lastBaseVal = basePoints[basePoints.length - 1];
        const scaleFactor = lastBaseVal > 0 ? capital / lastBaseVal : 1;
        const scaledPoints = basePoints.map(val => Math.round(val * scaleFactor * 100) / 100);
        return {
          period,
          points: scaledPoints
        };
      }
    }

    // Handle GET /portfolio/transactions
    if (urlPath === '/portfolio/transactions') {
      return JSON.parse(localStorage.getItem('ravora_transactions') || '[]');
    }

    // Handle GET /opportunities — always attempt real backend first
    if (urlPath === '/opportunities') {
      // This block is only reached if the real API fetch at the top of apiCall failed.
      // Provide a minimum-viable static fallback with all required scoring fields.
      return [
        {
          opportunityId: 'btc-halving',
          type: 'momentum',
          name: 'Bitcoin ETF Momentum Stacking',
          symbol: 'BTC / USD',
          icon: '₿',
          opportunityScore: 72,
          confidenceScore: 70,
          riskScore: 38,
          riskLevel: 'medium',
          expectedReturn: '15.0% - 22.0%',
          reasoningText: 'Spot ETF net inflows show consecutive daily acceleration, coinciding with hodler lockup peaks. Momentum targets a breakout to structural range highs.',
          suggestedEntry: 0,
          suggestedStopLoss: 0,
          suggestedTakeProfit: 0,
          riskRewardRatio: 'N/A',
          expectedDuration: 'N/A',
          trendDirection: 'Bullish',
          supportLevels: [],
          resistanceLevels: []
        },
        {
          opportunityId: 'eth-staking',
          type: 'yield',
          name: 'Ethereum Staking Alpha',
          symbol: 'ETH / USD',
          icon: 'Ξ',
          opportunityScore: 80,
          confidenceScore: 78,
          riskScore: 28,
          riskLevel: 'low',
          expectedReturn: '8.0% - 12.0%',
          reasoningText: 'Validator queue consolidation patterns reveal a post-upgrade yields premium on decentralized pools. Backed by institutional accumulation support lines.',
          suggestedEntry: 0,
          suggestedStopLoss: 0,
          suggestedTakeProfit: 0,
          riskRewardRatio: 'N/A',
          expectedDuration: 'N/A',
          trendDirection: 'Bullish',
          supportLevels: [],
          resistanceLevels: []
        },
        {
          opportunityId: 'solana-liquidity',
          type: 'momentum',
          name: 'Solana Liquidity Staking Accumulation',
          symbol: 'SOL / USD',
          icon: 'S',
          opportunityScore: 65,
          confidenceScore: 60,
          riskScore: 62,
          riskLevel: 'high',
          expectedReturn: '22.0% - 32.0%',
          reasoningText: 'DEX trading volume indices indicate structural demand trends for Jup/Sol liquidity pairs. High variance yield with automated trailing drawdown trigger.',
          suggestedEntry: 0,
          suggestedStopLoss: 0,
          suggestedTakeProfit: 0,
          riskRewardRatio: 'N/A',
          expectedDuration: 'N/A',
          trendDirection: 'Range',
          supportLevels: [],
          resistanceLevels: []
        },
        {
          opportunityId: 'bnb-breakout',
          type: 'momentum',
          name: 'Binance Coin Ecosystem Breakout',
          symbol: 'BNB / USD',
          icon: 'B',
          opportunityScore: 68,
          confidenceScore: 63,
          riskScore: 45,
          riskLevel: 'medium',
          expectedReturn: '10.0% - 18.0%',
          reasoningText: 'Binance Coin transaction velocity indicates structural breakout momentum above local range resistance. BNB burns and ecosystem expansion provide bullish tailwind.',
          suggestedEntry: 0,
          suggestedStopLoss: 0,
          suggestedTakeProfit: 0,
          riskRewardRatio: 'N/A',
          expectedDuration: 'N/A',
          trendDirection: 'Bullish',
          supportLevels: [],
          resistanceLevels: []
        },
        {
          opportunityId: 'sui-alpha',
          type: 'momentum',
          name: 'Sui Network Velocity Expansion',
          symbol: 'SUI / USD',
          icon: 'U',
          opportunityScore: 58,
          confidenceScore: 52,
          riskScore: 70,
          riskLevel: 'high',
          expectedReturn: '18.0% - 28.0%',
          reasoningText: 'Sui blockchain transaction velocity translates to volatile momentum changes. High variance capture with dynamic correlation monitoring is recommended.',
          suggestedEntry: 0,
          suggestedStopLoss: 0,
          suggestedTakeProfit: 0,
          riskRewardRatio: 'N/A',
          expectedDuration: 'N/A',
          trendDirection: 'Range',
          supportLevels: [],
          resistanceLevels: []
        }
      ];
    }

    // Handle GET /opportunities/recommendations
    if (urlPath === '/opportunities/recommendations') {
      const recs = JSON.parse(localStorage.getItem('ravora_recommendations') || '[]');
      return recs.filter(r => r.status === 'pending');
    }

    // Handle POST /opportunities/recommendations/:id/execute
    if (urlPath.startsWith('/opportunities/recommendations/') && urlPath.endsWith('/execute')) {
      const parts = urlPath.split('/');
      const recommendationId = parts[3];

      const recs = JSON.parse(localStorage.getItem('ravora_recommendations') || '[]');
      const rec = recs.find(r => r.recommendationId === recommendationId);
      if (!rec) {
        throw new Error('Recommendation not found.');
      }
      if (rec.status !== 'pending') {
        throw new Error('Recommendation has already been processed.');
      }

      const capital = parseInt(localStorage.getItem('ravora_profile_capital') || '132000');
      const allocationPct = rec.suggestedAllocationPct;
      const swapValueUSD = capital * (allocationPct / 100);

      // Special handling for dynamic alignment recommendations
      if (rec.opportunity.opportunityId && rec.opportunity.opportunityId.endsWith('-align')) {
        let holdings = [];
        let prices = { BTC: 64120.10, ETH: 3485.10, SOL: 134.20, BNB: 580.10, SUI: 1.15, USDC: 1.00, EMERG: 50.0 };
        let changes = { BTC: 1.25, ETH: 1.25, SOL: 1.25, BNB: 1.25, SUI: 1.25, USDC: 0.0, EMERG: 1.25 };

        try {
          const pRes = await fetch(`${API_BASE}/market/overview`);
          if (pRes.ok) {
            const overview = await pRes.json();
            overview.forEach(asset => {
              prices[asset.symbol] = asset.price;
              changes[asset.symbol] = asset.change24h;
            });
          }
        } catch (err) {
          console.error('Error fetching live overview for stance rebalance:', err);
        }

        if (rec.opportunity.opportunityId === 'conservative-align') {
          holdings = [
            { asset: 'Bitcoin', symbol: 'BTC', allocationPct: 40.0, amount: (capital * 0.40) / prices.BTC, entryPrice: prices.BTC, currentPrice: prices.BTC, change24h: changes.BTC },
            { asset: 'Ethereum', symbol: 'ETH', allocationPct: 30.0, amount: (capital * 0.30) / prices.ETH, entryPrice: prices.ETH, currentPrice: prices.ETH, change24h: changes.ETH },
            { asset: 'USDC Stablecoin', symbol: 'USDC', allocationPct: 30.0, amount: (capital * 0.30) / prices.USDC, entryPrice: prices.USDC, currentPrice: prices.USDC, change24h: 0.0 }
          ];
        } else if (rec.opportunity.opportunityId === 'aggressive-align') {
          holdings = [
            { asset: 'Bitcoin', symbol: 'BTC', allocationPct: 25.0, amount: (capital * 0.25) / prices.BTC, entryPrice: prices.BTC, currentPrice: prices.BTC, change24h: changes.BTC },
            { asset: 'Ethereum', symbol: 'ETH', allocationPct: 25.0, amount: (capital * 0.25) / prices.ETH, entryPrice: prices.ETH, currentPrice: prices.ETH, change24h: changes.ETH },
            { asset: 'Solana', symbol: 'SOL', allocationPct: 20.0, amount: (capital * 0.20) / prices.SOL, entryPrice: prices.SOL, currentPrice: prices.SOL, change24h: changes.SOL },
            { asset: 'Binance Coin', symbol: 'BNB', allocationPct: 15.0, amount: (capital * 0.15) / prices.BNB, entryPrice: prices.BNB, currentPrice: prices.BNB, change24h: changes.BNB },
            { asset: 'Sui', symbol: 'SUI', allocationPct: 15.0, amount: (capital * 0.15) / prices.SUI, entryPrice: prices.SUI, currentPrice: prices.SUI, change24h: changes.SUI }
          ];
        } else { // moderate-align
          holdings = [
            { asset: 'Bitcoin', symbol: 'BTC', allocationPct: 35.0, amount: (capital * 0.35) / prices.BTC, entryPrice: prices.BTC, currentPrice: prices.BTC, change24h: changes.BTC },
            { asset: 'Ethereum', symbol: 'ETH', allocationPct: 35.0, amount: (capital * 0.35) / prices.ETH, entryPrice: prices.ETH, currentPrice: prices.ETH, change24h: changes.ETH },
            { asset: 'Solana', symbol: 'SOL', allocationPct: 15.0, amount: (capital * 0.15) / prices.SOL, entryPrice: prices.SOL, currentPrice: prices.SOL, change24h: changes.SOL },
            { asset: 'USDC Stablecoin', symbol: 'USDC', allocationPct: 15.0, amount: (capital * 0.15) / prices.USDC, entryPrice: prices.USDC, currentPrice: prices.USDC, change24h: 0.0 }
          ];
        }

        localStorage.setItem('ravora_holdings', JSON.stringify(holdings));

        rec.status = 'approved';
        localStorage.setItem('ravora_recommendations', JSON.stringify(recs));

        const transactions = JSON.parse(localStorage.getItem('ravora_transactions') || '[]');
        const fee = swapValueUSD * 0.001;
        const txId = 'tx-' + Math.random().toString(36).substring(2, 10);
        transactions.unshift({
          id: txId,
          timestamp: new Date().toISOString(),
          type: 'portfolio_rebalance',
          asset: `USDC / Target Alignment Stance`,
          amount: `Rebalanced portfolio`,
          price: `N/A`,
          fee: `$${fee.toFixed(2)}`,
          status: 'completed'
        });
        localStorage.setItem('ravora_transactions', JSON.stringify(transactions));

        const notifications = JSON.parse(localStorage.getItem('ravora_notifications') || '[]');
        notifications.unshift({
          notificationId: 'notif-' + Math.random().toString(36).substring(2, 10),
          channel: 'portfolio',
          priority: 'medium',
          title: 'Target Alignment Complete',
          body: `Successfully aligned your portfolio holdings to the active ${rec.opportunity.riskLevel} Ravora model.`,
          isRead: false
        });
        localStorage.setItem('ravora_notifications', JSON.stringify(notifications));

        return {
          status: 'cleared',
          transactionId: txId,
          clearedPrice: 1.0,
          executionFee: fee,
          timestamp: new Date().toISOString()
        };
      }

      let targetSymbol = 'ETH';
      if (rec.opportunity.symbol.includes('BTC')) targetSymbol = 'BTC';
      else if (rec.opportunity.symbol.includes('SOL')) targetSymbol = 'SOL';
      else if (rec.opportunity.symbol.includes('BNB')) targetSymbol = 'BNB';
      else if (rec.opportunity.symbol.includes('SUI')) targetSymbol = 'SUI';
      else if (rec.opportunity.symbol.includes('USDC')) targetSymbol = 'USDC';

      let targetPrice = 100.00;
      try {
        const pRes = await fetch(`${API_BASE}/market/prices`);
        if (pRes.ok) {
          const pData = await pRes.json();
          const pItem = pData.prices.find(p => p.symbol === targetSymbol);
          if (pItem) {
            targetPrice = pItem.price;
          }
        }
      } catch (err) {
        console.error('Error fetching live targetPrice, using mock fallback:', err);
        const fallbackPrices = { ETH: 3485.10, BTC: 64120.10, SOL: 134.20, BNB: 580.10, SUI: 1.15, USDC: 1.00, USDS: 1.00 };
        targetPrice = fallbackPrices[targetSymbol] || 100.00;
      }

      let holdings = JSON.parse(localStorage.getItem('ravora_holdings') || '[]');

      // Deduct from USDC or largest holding
      let sourceAsset = holdings.find(h => h.symbol === 'USDC');
      if (!sourceAsset || sourceAsset.amount * sourceAsset.entryPrice < swapValueUSD) {
        let maxVal = 0;
        holdings.forEach(h => {
          const val = h.amount * h.entryPrice;
          if (val > maxVal) {
            maxVal = val;
            sourceAsset = h;
          }
        });
      }

      if (!sourceAsset || (sourceAsset.amount * sourceAsset.entryPrice) < swapValueUSD) {
        throw new Error('Insufficient funds in portfolio holdings to perform this rebalance.');
      }

      sourceAsset.amount -= swapValueUSD / sourceAsset.entryPrice;
      sourceAsset.allocationPct = ((sourceAsset.amount * sourceAsset.entryPrice) / capital) * 100;

      if (sourceAsset.amount <= 0.0001) {
        holdings = holdings.filter(h => h.symbol !== sourceAsset.symbol);
      }

      // Add to target asset
      const targetAsset = holdings.find(h => h.symbol === targetSymbol);
      const targetAddAmount = swapValueUSD / targetPrice;
      if (targetAsset) {
        targetAsset.amount += targetAddAmount;
        targetAsset.allocationPct = ((targetAsset.amount * targetPrice) / capital) * 100;
      } else {
        const targetAllocation = (swapValueUSD / capital) * 100;
        holdings.push({
          asset: rec.opportunity.name,
          symbol: targetSymbol,
          allocationPct: targetAllocation,
          amount: targetAddAmount,
          entryPrice: targetPrice,
          currentPrice: targetPrice,
          change24h: 1.25
        });
      }

      // Save updated holdings
      localStorage.setItem('ravora_holdings', JSON.stringify(holdings));

      // Mark recommendation approved
      rec.status = 'approved';
      localStorage.setItem('ravora_recommendations', JSON.stringify(recs));

      // Add transaction
      const transactions = JSON.parse(localStorage.getItem('ravora_transactions') || '[]');
      const fee = swapValueUSD * 0.001;
      const txId = 'tx-' + Math.random().toString(36).substring(2, 10);
      transactions.unshift({
        id: txId,
        timestamp: new Date().toISOString(),
        type: 'staking_deposit',
        asset: `${sourceAsset.symbol} / ${targetSymbol}`,
        amount: `${targetAddAmount.toFixed(4)} ${targetSymbol}`,
        price: `$${targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        fee: `$${fee.toFixed(2)}`,
        status: 'completed'
      });
      localStorage.setItem('ravora_transactions', JSON.stringify(transactions));

      // Add notification
      const notifications = JSON.parse(localStorage.getItem('ravora_notifications') || '[]');
      notifications.unshift({
        notificationId: 'notif-' + Math.random().toString(36).substring(2, 10),
        channel: 'portfolio',
        priority: 'medium',
        title: 'Rebalance Directive Executed',
        body: `Successfully swapped $${swapValueUSD.toLocaleString()} into ${rec.opportunity.name}.`,
        isRead: false
      });
      localStorage.setItem('ravora_notifications', JSON.stringify(notifications));

      return {
        status: 'cleared',
        transactionId: txId,
        clearedPrice: targetPrice,
        executionFee: fee,
        timestamp: new Date().toISOString()
      };
    }

    // Handle POST /opportunities/deploy
    if (urlPath === '/opportunities/deploy' && options.method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const { opportunityId, amount } = body;

      let opp = null;
      if (opportunityId.endsWith('-opportunity')) {
        const symbol = opportunityId.replace('-opportunity', '').toUpperCase();
        let name = symbol === 'BTC' ? 'Bitcoin' : (symbol === 'ETH' ? 'Ethereum' : (symbol === 'SOL' ? 'Solana' : (symbol === 'BNB' ? 'Binance Coin' : 'Sui')));
        opp = {
          opportunityId,
          name: name,
          symbol: `${symbol} / USD`,
          icon: symbol === 'BTC' ? '₿' : (symbol === 'ETH' ? 'Ξ' : (symbol === 'SOL' ? 'S' : (symbol === 'BNB' ? 'B' : 'U'))),
          riskLevel: symbol === 'BTC' ? 'medium' : (symbol === 'ETH' ? 'low' : (symbol === 'SOL' ? 'high' : (symbol === 'BNB' ? 'medium' : 'high')))
        };
      } else {
        const opps = [
          { opportunityId: 'eth-staking', name: 'Ethereum Staking Alpha', symbol: 'ETH / USD', icon: 'Ξ', confidenceScore: 94, riskLevel: 'low' },
          { opportunityId: 'btc-halving', name: 'Bitcoin ETF Momentum Stacking', symbol: 'BTC / USD', icon: '₿', confidenceScore: 89, riskLevel: 'medium' },
          { opportunityId: 'usdc-arbitrage', name: 'Stablecoin Lending Arbitrage', symbol: 'USDC / USDT / DAI', icon: '$', confidenceScore: 91, riskLevel: 'low' },
          { opportunityId: 'solana-liquidity', name: 'Solana Liquidity Staking Accumulation', symbol: 'SOL / USD', icon: 'S', confidenceScore: 78, riskLevel: 'high' }
        ];
        opp = opps.find(o => o.opportunityId === opportunityId);
      }

      if (!opp) {
        throw new Error('Opportunity not found.');
      }

      const capital = parseInt(localStorage.getItem('ravora_profile_capital') || '132000');
      const swapValueUSD = parseFloat(amount);

      if (swapValueUSD > capital) {
        throw new Error('Investment amount exceeds total portfolio balance.');
      }

      let targetSymbol = 'ETH';
      if (opp.symbol.includes('BTC')) targetSymbol = 'BTC';
      else if (opp.symbol.includes('SOL')) targetSymbol = 'SOL';
      else if (opp.symbol.includes('BNB')) targetSymbol = 'BNB';
      else if (opp.symbol.includes('SUI')) targetSymbol = 'SUI';
      else if (opp.symbol.includes('USDC')) targetSymbol = 'USDC';

      let targetPrice = 100.00;
      try {
        const pRes = await fetch(`${API_BASE}/market/prices`);
        if (pRes.ok) {
          const pData = await pRes.json();
          const pItem = pData.prices.find(p => p.symbol === targetSymbol);
          if (pItem) {
            targetPrice = pItem.price;
          }
        }
      } catch (err) {
        console.error('Error fetching live targetPrice, using mock fallback:', err);
        const fallbackPrices = { ETH: 3485.10, BTC: 64120.10, SOL: 134.20, BNB: 580.10, SUI: 1.15, USDC: 1.00, USDS: 1.00 };
        targetPrice = fallbackPrices[targetSymbol] || 100.00;
      }

      let holdings = JSON.parse(localStorage.getItem('ravora_holdings') || '[]');

      // Deduct from USDC or largest holding
      let sourceAsset = holdings.find(h => h.symbol === 'USDC');
      if (!sourceAsset || sourceAsset.amount * sourceAsset.entryPrice < swapValueUSD) {
        let maxVal = 0;
        holdings.forEach(h => {
          const val = h.amount * h.entryPrice;
          if (val > maxVal) {
            maxVal = val;
            sourceAsset = h;
          }
        });
      }

      if (!sourceAsset || (sourceAsset.amount * sourceAsset.entryPrice) < swapValueUSD) {
        throw new Error('Insufficient funds in holdings to deploy this opportunity.');
      }

      sourceAsset.amount -= swapValueUSD / sourceAsset.entryPrice;
      sourceAsset.allocationPct = ((sourceAsset.amount * sourceAsset.entryPrice) / capital) * 100;

      if (sourceAsset.amount <= 0.0001) {
        holdings = holdings.filter(h => h.symbol !== sourceAsset.symbol);
      }

      // Add to target asset
      const targetAsset = holdings.find(h => h.symbol === targetSymbol);
      const targetAddAmount = swapValueUSD / targetPrice;
      if (targetAsset) {
        targetAsset.amount += targetAddAmount;
        targetAsset.allocationPct = ((targetAsset.amount * targetPrice) / capital) * 100;
      } else {
        const targetAllocation = (swapValueUSD / capital) * 100;
        holdings.push({
          asset: opp.name,
          symbol: targetSymbol,
          allocationPct: targetAllocation,
          amount: targetAddAmount,
          entryPrice: targetPrice,
          currentPrice: targetPrice,
          change24h: 1.25
        });
      }

      // Save updated holdings
      localStorage.setItem('ravora_holdings', JSON.stringify(holdings));

      // Add transaction
      const transactions = JSON.parse(localStorage.getItem('ravora_transactions') || '[]');
      const fee = swapValueUSD * 0.001;
      const txId = 'tx-' + Math.random().toString(36).substring(2, 10);
      transactions.unshift({
        id: txId,
        timestamp: new Date().toISOString(),
        type: 'staking_deposit',
        asset: `${sourceAsset.symbol} / ${targetSymbol}`,
        amount: `${targetAddAmount.toFixed(4)} ${targetSymbol}`,
        price: `$${targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        fee: `$${fee.toFixed(2)}`,
        status: 'completed'
      });
      localStorage.setItem('ravora_transactions', JSON.stringify(transactions));

      // Add notification
      const notifications = JSON.parse(localStorage.getItem('ravora_notifications') || '[]');
      notifications.unshift({
        notificationId: 'notif-' + Math.random().toString(36).substring(2, 10),
        channel: 'portfolio',
        priority: 'medium',
        title: 'Rebalance Directive Executed',
        body: `Successfully swapped $${swapValueUSD.toLocaleString()} into ${opp.name}.`,
        isRead: false
      });
      localStorage.setItem('ravora_notifications', JSON.stringify(notifications));

      return {
        status: 'cleared',
        transactionId: txId,
        clearedPrice: targetPrice,
        executionFee: fee,
        timestamp: new Date().toISOString()
      };
    }

    // Handle GET /notifications
    if (urlPath === '/notifications') {
      const notifications = JSON.parse(localStorage.getItem('ravora_notifications') || '[]');
      return notifications;
    }

    // Handle POST /notifications/read
    if (urlPath === '/notifications/read' && options.method === 'POST') {
      const notifications = JSON.parse(localStorage.getItem('ravora_notifications') || '[]');
      const unreadCount = notifications.filter(n => !n.isRead).length;
      notifications.forEach(n => n.isRead = true);
      localStorage.setItem('ravora_notifications', JSON.stringify(notifications));
      return { status: 'success', markedReadCount: unreadCount };
    }

    // Handle POST /copilot/message
    if (urlPath === '/copilot/message' && options.method === 'POST') {
      const body = JSON.parse(options.body || '{}');
      const message = body.message;
      const normMsg = message.toLowerCase();

      const riskStance = localStorage.getItem('ravora_profile_risk') || 'balanced';
      const goal = localStorage.getItem('ravora_profile_goal') || 'preservation';
      const horizon = localStorage.getItem('ravora_profile_horizon') || 'short';
      const capital = parseInt(localStorage.getItem('ravora_profile_capital') || '132000');

      let livePrices = { BTC: 64120.10, ETH: 3485.10, SOL: 134.20, BNB: 580.10, SUI: 1.15 };
      try {
        const pRes = await fetch(`${API_BASE}/market/prices`);
        if (pRes.ok) {
          const pData = await pRes.json();
          pData.prices.forEach(p => {
            livePrices[p.symbol] = p.price;
          });
        }
      } catch (err) {
        console.error('Error fetching live prices for copilot chat:', err);
      }

      let reply = '';
      let stats = '';
      let actions = [];

      if (normMsg.includes('recommend') || normMsg.includes('align') || normMsg.includes('rebalance') || normMsg.includes('portfolio') || normMsg.includes('stance')) {
        let allocDetails = '';
        let confidence = '92%';
        if (riskStance === 'conservative') {
          allocDetails = `- **Bitcoin (BTC):** 40%\n- **Ethereum (ETH):** 30%\n- **Stablecoins (USDC):** 30%`;
          confidence = '96%';
        } else if (riskStance === 'aggressive') {
          allocDetails = `- **Bitcoin (BTC):** 25%\n- **Ethereum (ETH):** 25%\n- **Solana (SOL):** 25%\n- **Sui (SUI):** 25%`;
          confidence = '88%';
        } else { // balanced / moderate
          allocDetails = `- **Bitcoin (BTC):** 35%\n- **Ethereum (ETH):** 35%\n- **Solana (SOL):** 15%\n- **Stablecoins (USDC):** 15%`;
          confidence = '92%';
        }

        reply = `Based on your **${goal.toUpperCase()}** milestone goal, **${riskStance.toUpperCase()}** risk profile, and **${horizon.toUpperCase()}-TERM** investment horizon, Araiven recommends the following target stance allocation:\n\n${allocDetails}\n\nThis target maximizes capital efficiency and staking yield. You can execute this rebalance directive with a single click from your main Dashboard.`;
        stats = `Confidence Score: ${confidence} | Active Risk Score: ${riskStance.toUpperCase()}`;
      } else if (normMsg.includes('yield') || normMsg.includes('audit')) {
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
        reply = `Araiven ETF momentum models trace continuous net inflows accumulating at structural support layers. Bitcoin is stabilizing near range support, currently trading at $${livePrices.BTC.toLocaleString(undefined, { minimumFractionDigits: 2 })}. Your portfolio maintains an active interest aligned with your ${riskStance} profile.`;
        stats = `Bitcoin Price: $${livePrices.BTC.toLocaleString()} | Momentum Index: Active`;
      } else {
        reply = `Hello! I am Araiven, your active wealth copilot. I am currently monitoring your portfolio under the **${riskStance.toUpperCase()}** strategy configuration. I analyze news sentiment, orderbook delta, and liquidity yields 24/7 to suggest optimal compounding. What aspect of your assets would you like me to audit?`;
        stats = `Active Strategy: ${riskStance.toUpperCase()} | Total Balance: $${capital.toLocaleString()}`;
      }

      return { reply, stats, actions };
    }

    // Catch-all mock error or empty response
    console.warn(`Unhandled API route: ${urlPath}`);
    return {};
  }

  // ==========================================================================
  // Element Selectors
  // ==========================================================================
  // Auth Overlay
  const authContainer = document.getElementById('auth-container');
  const loginForm = document.getElementById('auth-login-form');
  const registerForm = document.getElementById('auth-register-form');
  const goToRegister = document.getElementById('go-to-register');
  const goToLogin = document.getElementById('go-to-login');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const appLayoutContainer = document.querySelector('.app-layout-container');

  // Onboarding
  const onboardingOverlay = document.getElementById('onboarding-container');
  const onboardingSteps = document.querySelectorAll('.onboarding-step');
  const stepDots = document.querySelectorAll('.step-dot');
  const btnOnboardingBack = document.getElementById('btn-onboarding-back');
  const btnOnboardingNext = document.getElementById('btn-onboarding-next');
  const capitalSlider = document.getElementById('capital-slider');
  const capitalDisplayVal = document.getElementById('capital-display-val');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const onboardingStatusLogs = document.getElementById('onboarding-status-logs');
  const onboardingProgressBar = document.getElementById('onboarding-progress-bar');
  const onboardingLoader = document.getElementById('onboarding-loader');

  // SPA navigation
  const menuTabBtns = document.querySelectorAll('.menu-tab-btn');
  const appViewPanels = document.querySelectorAll('.app-view-panel');
  const appHeaderTitle = document.getElementById('app-header-title');
  const appHeaderSubtitle = document.getElementById('app-header-subtitle');
  const sidebarBadge = document.getElementById('active-profile-badge');

  // Global Risk segment control sync
  const appRiskSegmented = document.getElementById('app-risk-segmented');

  // Core metrics fields
  const dashBalance = document.getElementById('dash-balance');
  const dashChange = document.getElementById('dash-change');
  const dashApy = document.getElementById('dash-apy');
  const dashRisk = document.getElementById('dash-risk');
  const dashHealth = document.getElementById('dash-health');
  const dashHealthSub = document.getElementById('dash-health-sub');
  
  // Charts
  const chartPeriodButtons = document.querySelectorAll('.chart-toggles button');
  const largeChartLine = document.getElementById('large-chart-line');
  const largeChartArea = document.getElementById('large-chart-area');
  const largeChartSvg = document.getElementById('portfolio-large-chart');

  // Copilot Chat
  const copilotMessagesLog = document.getElementById('copilot-messages-log');
  const copilotChatInput = document.getElementById('copilot-chat-input');
  const btnCopilotSend = document.getElementById('btn-copilot-send');
  const chatPresetBtns = document.querySelectorAll('.chat-preset-btn');
  const btnCopilotRebalanceExecute = document.getElementById('btn-copilot-rebalance-execute');

  // Opportunity Explorer
  const opportunitiesCardsContainer = document.getElementById('opportunities-cards-container');
  const explorerFilterTabs = document.querySelectorAll('#explorer-filter-tabs button');
  const explorerSearchInput = document.getElementById('explorer-search');
  const opportunityDetailDrawer = document.getElementById('opportunity-detail-drawer');
  const btnCloseDrawer = document.getElementById('btn-close-drawer');
  const btnDrawerDeploy = document.getElementById('btn-drawer-deploy');
  const drawerTitle = document.getElementById('drawer-title');
  const drawerAssetName = document.getElementById('drawer-asset-name');
  const drawerAssetSymbol = document.getElementById('drawer-asset-symbol');
  const drawerAssetIcon = document.getElementById('drawer-asset-icon');
  const drawerBadgeConf = document.getElementById('drawer-badge-conf');
  const drawerReasoningText = document.getElementById('drawer-reasoning-text');
  const drawerStatReturn = document.getElementById('drawer-stat-return');
  const drawerStatRisk = document.getElementById('drawer-stat-risk');
  const drawerStatAllocation = document.getElementById('drawer-stat-allocation');
  const drawerStatStance = document.getElementById('drawer-stat-stance');
  const drawerAmountInput = document.getElementById('drawer-amount-input');

  // Portfolio
  const portfolioHoldingsRows = document.getElementById('portfolio-holdings-rows');
  const portfolioRiskMeterFill = document.getElementById('portfolio-risk-meter-fill');
  const portfolioActiveRisk = document.getElementById('portfolio-active-risk');

  // Trade History
  const historyRowsContainer = document.getElementById('history-rows-container');
  const historySearchInput = document.getElementById('history-search');

  // Notifications
  const btnTriggerNotif = document.getElementById('btn-trigger-notif');
  const btnCloseNotif = document.getElementById('btn-close-notif');
  const notifDrawer = document.getElementById('notif-drawer');
  const notifOverlay = document.getElementById('notif-overlay');
  const notifAlertsList = document.getElementById('notif-alerts-list');
  const notifBadgeCount = document.getElementById('notif-badge-count');
  const btnClearAllNotifs = document.getElementById('btn-clear-all-notifs');

  // Reset Onboarding Guide utility
  const btnTriggerOnboardingReset = document.getElementById('btn-trigger-onboarding-reset');
  const btnHeaderManualScan = document.getElementById('btn-header-manual-scan');

  // ==========================================================================
  // Auth Form Toggling & Listeners
  // ==========================================================================
  if (goToRegister) {
    goToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      registerError.style.display = 'none';
    });
  }

  if (goToLogin) {
    goToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerForm.style.display = 'none';
      loginForm.style.display = 'block';
      loginError.style.display = 'none';
    });
  }

  function showAuthOverlay() {
    if (authContainer) authContainer.style.display = 'flex';
    if (onboardingOverlay) onboardingOverlay.style.display = 'none';
    if (appLayoutContainer) appLayoutContainer.style.display = 'none';
  }

  function showOnboardingOverlay() {
    if (authContainer) authContainer.style.display = 'none';
    if (onboardingOverlay) onboardingOverlay.style.display = 'flex';
    if (appLayoutContainer) appLayoutContainer.style.display = 'none';
    state.currentStep = 1;
    updateOnboardingStepsVisibility();
  }

  function showDashboard() {
    if (authContainer) authContainer.style.display = 'none';
    if (onboardingOverlay) onboardingOverlay.style.display = 'none';
    if (appLayoutContainer) appLayoutContainer.style.display = 'grid';
  }

  function updateUserWidget(email) {
    const initials = email.substring(0, 2).toUpperCase();
    const displayName = email.split('@')[0];
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    const headerGreeting = document.getElementById('app-header-subtitle');
    if (userAvatar) userAvatar.textContent = initials;
    if (userName) userName.textContent = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    if (headerGreeting) {
      headerGreeting.textContent = `Welcome back, ${displayName.charAt(0).toUpperCase() + displayName.slice(1)}. Araiven engine is monitoring your wealth.`;
    }
  }

  function generateMockRecommendations(riskLevel, goal, horizon, capital) {
    let opportunityId, opportunityName, opportunitySymbol, opportunityIcon, confidence, riskName, suggestedAllocationPct, reasoningText;

    if (riskLevel === 0) { // Conservative
      opportunityId = 'conservative-align';
      opportunityName = 'Conservative Target Alignment Stance';
      opportunitySymbol = 'BTC (40%) / ETH (30%) / USDC (30%)';
      opportunityIcon = '🛡️';
      confidence = 96;
      riskName = 'conservative';
      suggestedAllocationPct = 70.0;
      reasoningText = `Araiven recommends allocating 40% to BTC and 30% to ETH while retaining 30% in stablecoins. This matches your ${goal} milestone targets and ${horizon}-term horizon, maximizing safety score while defending against inflation.`;
    } else if (riskLevel === 2) { // Aggressive
      opportunityId = 'aggressive-align';
      opportunityName = 'Aggressive Target Alignment Stance';
      opportunitySymbol = 'BTC (25%) / ETH (25%) / SOL (25%) / EMERG (25%)';
      opportunityIcon = '🔥';
      confidence = 88;
      riskName = 'aggressive';
      suggestedAllocationPct = 100.0;
      reasoningText = `Araiven suggests fully deploying reserves into high-beta assets: 25% BTC, 25% ETH, 25% SOL, and 25% Emerging Assets (e.g. NEAR/AVAX). This aggressive configuration aligns with your ${goal} milestone and ${horizon}-term horizon to capture maximum staking yield and growth spreads.`;
    } else { // Moderate / Balanced (1)
      opportunityId = 'moderate-align';
      opportunityName = 'Moderate Target Alignment Stance';
      opportunitySymbol = 'BTC (35%) / ETH (35%) / SOL (15%) / USDC (15%)';
      opportunityIcon = '⚖️';
      confidence = 92;
      riskName = 'moderate';
      suggestedAllocationPct = 85.0;
      reasoningText = `Araiven recommends a balanced capture strategy: 35% BTC, 35% ETH, and 15% SOL, holding 15% stablecoins. This allocation optimizes steady yield premiums matching your ${goal} goals and ${horizon}-term horizon.`;
    }

    return [
      {
        recommendationId: 'rec-' + Math.random().toString(36).substring(2, 10),
        opportunity: {
          opportunityId,
          name: opportunityName,
          symbol: opportunitySymbol,
          icon: opportunityIcon,
          confidenceScore: confidence,
          expectedReturn: riskLevel === 0 ? '8.0% - 11.5%' : (riskLevel === 2 ? '22.0% - 32.0%' : '12.0% - 18.5%'),
          riskLevel: riskName
        },
        suggestedAllocationPct,
        reasoningText,
        status: 'pending'
      }
    ];
  }

  function initDefaultMockData(email) {
    if (!localStorage.getItem('ravora_profile_experience')) {
      localStorage.setItem('ravora_profile_experience', 'balanced');
      localStorage.setItem('ravora_profile_capital', '132000');
      localStorage.setItem('ravora_profile_risk', 'balanced');
      localStorage.setItem('ravora_profile_goal', 'preservation');
      localStorage.setItem('ravora_profile_horizon', 'medium');
    }
    
    if (!localStorage.getItem('ravora_holdings')) {
      const capital = 132000;
      const initialHoldings = [
        { asset: 'USDC Stablecoin', symbol: 'USDC', allocationPct: 100.0, amount: capital, entryPrice: 1.0, currentPrice: 1.0, change24h: 0.0 }
      ];
      localStorage.setItem('ravora_holdings', JSON.stringify(initialHoldings));
    }

    if (!localStorage.getItem('ravora_notifications')) {
      const initialNotifications = [
        { notificationId: 'notif-1', channel: 'risk', priority: 'medium', title: 'Drawdown Protection Shield Configured', body: 'Araiven calculated correlation matrices and established drawdown cushion at 3.50%.', isRead: false },
        { notificationId: 'notif-2', channel: 'opportunities', priority: 'medium', title: 'Ethereum Staking Alpha Opportunity Ingested', body: 'New opportunity detected on decentralized staking pools yielding 9.6% APY.', isRead: false }
      ];
      localStorage.setItem('ravora_notifications', JSON.stringify(initialNotifications));
    }

    if (!localStorage.getItem('ravora_recommendations')) {
      const initialRecommendations = generateMockRecommendations(1, 'preservation', 'medium', 132000);
      localStorage.setItem('ravora_recommendations', JSON.stringify(initialRecommendations));
    }

    if (!localStorage.getItem('ravora_transactions')) {
      localStorage.setItem('ravora_transactions', JSON.stringify([]));
    }
  }

  async function checkAuthState() {
    const loggedIn = localStorage.getItem('ravora_logged_in') === 'true';
    if (!loggedIn) {
      showAuthOverlay();
      return;
    }
    try {
      const email = localStorage.getItem('ravora_email') || 'User';
      updateUserWidget(email);

      const onboardingCompleted = localStorage.getItem('ravora_onboarding_completed') === 'true';
      if (onboardingCompleted) {
        state.onboardingCompleted = true;
        state.profile.experience = localStorage.getItem('ravora_profile_experience') || 'beginner';
        state.profile.capital = parseInt(localStorage.getItem('ravora_profile_capital') || '132000');
        const riskLevels = { conservative: 0, balanced: 1, aggressive: 2 };
        const riskStance = localStorage.getItem('ravora_profile_risk') || 'balanced';
        state.profile.riskLevel = riskLevels[riskStance] ?? 1;
        state.profile.goal = localStorage.getItem('ravora_profile_goal') || 'preservation';
        state.profile.horizon = localStorage.getItem('ravora_profile_horizon') || 'short';

        showDashboard();
        initializeDashboardUI();
      } else {
        state.onboardingCompleted = false;
        showOnboardingOverlay();
      }
    } catch (e) {
      console.error('Auth check error:', e);
      showAuthOverlay();
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.style.display = 'none';
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('ravora_token', data.token);
            localStorage.setItem('ravora_logged_in', 'true');
            localStorage.setItem('ravora_email', email);
            localStorage.setItem('ravora_onboarding_completed', data.onboardingCompleted ? 'true' : 'false');
            await checkAuthState();
            navigateTo('dashboard', true);
            return;
          } else {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Authentication failed.');
          }
        } catch (apiErr) {
          console.warn('Backend login failed, using local fallback:', apiErr.message);
          localStorage.setItem('ravora_logged_in', 'true');
          localStorage.setItem('ravora_email', email);
          localStorage.setItem('ravora_onboarding_completed', 'true');
          initDefaultMockData(email);
          await checkAuthState();
          navigateTo('dashboard', true);
        }
      } catch (err) {
        loginError.textContent = err.message;
        loginError.style.display = 'block';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      registerError.style.display = 'none';
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;

      try {
        try {
          const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('ravora_token', data.token);
            localStorage.setItem('ravora_logged_in', 'true');
            localStorage.setItem('ravora_email', email);
            localStorage.setItem('ravora_onboarding_completed', 'false');
            await checkAuthState();
            return;
          } else {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || 'Registration failed.');
          }
        } catch (apiErr) {
          console.warn('Backend registration failed, using local fallback:', apiErr.message);
          localStorage.setItem('ravora_logged_in', 'true');
          localStorage.setItem('ravora_email', email);
          localStorage.setItem('ravora_onboarding_completed', 'false');
          await checkAuthState();
        }
      } catch (err) {
        registerError.textContent = err.message;
        registerError.style.display = 'block';
      }
    });
  }

  // ==========================================================================
  // Onboarding Logic
  // ==========================================================================
  function updateOnboardingStepsVisibility() {
    onboardingSteps.forEach(step => step.classList.remove('active'));
    
    if (state.currentStep <= 4) {
      const stepEl = document.getElementById(`onboarding-step-${state.currentStep}`);
      if (stepEl) stepEl.classList.add('active');
    }
    
    stepDots.forEach((dot, idx) => {
      if (idx + 1 === state.currentStep) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    if (state.currentStep === 1) {
      btnOnboardingBack.style.display = 'none';
    } else {
      btnOnboardingBack.style.display = 'block';
    }

    if (state.currentStep === 4) {
      btnOnboardingNext.textContent = 'Generate My Portfolio Copilot';
    } else {
      btnOnboardingNext.textContent = 'Next Step';
    }
  }

  const optionCards = document.querySelectorAll('.option-card');
  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      const parentStep = card.closest('.onboarding-step');
      const stepId = parentStep.id;
      const value = card.getAttribute('data-value');

      if (card.classList.contains('horizon-card')) {
        parentStep.querySelectorAll('.horizon-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        state.profile.horizon = value;
      } else {
        parentStep.querySelectorAll('.option-card:not(.horizon-card)').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        if (stepId.includes('1')) {
          state.profile.experience = value;
        } else if (stepId.includes('3')) {
          state.profile.riskLevel = parseInt(value);
        } else if (stepId.includes('4')) {
          state.profile.goal = value;
        }
      }
    });
  });

  if (capitalSlider) {
    capitalSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.profile.capital = val;
      if (capitalDisplayVal) {
        capitalDisplayVal.textContent = `$${val.toLocaleString()}`;
      }
      
      presetBtns.forEach(btn => {
        if (parseInt(btn.getAttribute('data-value')) === val) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const val = parseInt(btn.getAttribute('data-value'));
      state.profile.capital = val;
      if (capitalSlider) capitalSlider.value = val;
      if (capitalDisplayVal) {
        capitalDisplayVal.textContent = `$${val.toLocaleString()}`;
      }
    });
  });

  if (btnOnboardingNext) {
    btnOnboardingNext.addEventListener('click', async () => {
      if (state.currentStep < 4) {
        state.currentStep++;
        updateOnboardingStepsVisibility();
      } else {
        btnOnboardingNext.disabled = true;
        btnOnboardingNext.textContent = 'Saving Profile...';

        try {
          await apiCall('/user/onboard', {
            method: 'POST',
            body: JSON.stringify({
              experience: state.profile.experience,
              capital: state.profile.capital,
              riskLevel: state.profile.riskLevel,
              goal: state.profile.goal,
              horizon: state.profile.horizon || 'short'
            })
          });

          // Start Simulation loader
          state.currentStep = 5;
          onboardingSteps.forEach(step => step.classList.remove('active'));
          if (onboardingLoader) onboardingLoader.classList.add('active');
          if (btnOnboardingBack) btnOnboardingBack.style.display = 'none';
          if (btnOnboardingNext) btnOnboardingNext.style.display = 'none';
          
          runOnboardingScanningSimulation();
        } catch (err) {
          alert('Failed to save profile: ' + err.message);
        } finally {
          btnOnboardingNext.disabled = false;
        }
      }
    });
  }

  if (btnOnboardingBack) {
    btnOnboardingBack.addEventListener('click', () => {
      if (state.currentStep > 1) {
        state.currentStep--;
        updateOnboardingStepsVisibility();
      }
    });
  }

  function runOnboardingScanningSimulation() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        onboardingProgressBar.style.width = '100%';
        onboardingStatusLogs.textContent = 'Copilot Workspace Ready!';
        
        setTimeout(() => {
          onboardingOverlay.classList.add('fade-out-onboarding');
          state.onboardingCompleted = true;
          
          showDashboard();
          initializeDashboardUI();
        }, 800);
      } else {
        onboardingProgressBar.style.width = `${progress}%`;
        if (progress < 25) {
          onboardingStatusLogs.textContent = 'Injecting user risk profile parameters...';
        } else if (progress < 55) {
          onboardingStatusLogs.textContent = 'Ingesting orderbooks & news sentiment feeds...';
        } else if (progress < 85) {
          onboardingStatusLogs.textContent = 'Synthesizing trailing protective drawdown limit buffers...';
        } else {
          onboardingStatusLogs.textContent = 'Establishing secure brokerage API tunnels...';
        }
      }
    }, 250);
  }

  if (btnTriggerOnboardingReset) {
    btnTriggerOnboardingReset.addEventListener('click', () => {
      state.onboardingCompleted = false;
      state.currentStep = 1;
      
      onboardingOverlay.classList.remove('fade-out-onboarding');
      showOnboardingOverlay();
      onboardingLoader.classList.remove('active');
      
      updateOnboardingStepsVisibility();
      if (btnOnboardingBack) btnOnboardingBack.style.display = 'none';
      if (btnOnboardingNext) {
        btnOnboardingNext.style.display = 'block';
        btnOnboardingNext.textContent = 'Next Step';
      }
    });
  }

  // ==========================================================================
  // SPA Screen Router Navigation
  // ==========================================================================
  const validScreens = ['dashboard', 'watchlist', 'copilot', 'opportunities', 'portfolio', 'history', 'notifications', 'settings'];

  function navigateTo(screenId, pushState = true) {
    if (!validScreens.includes(screenId)) {
      screenId = 'dashboard';
    }

    const allNavBtns = [...menuTabBtns, btnTriggerNotif];
    allNavBtns.forEach(btn => {
      const btnScreen = btn.getAttribute('data-screen') || (btn.id === 'btn-trigger-notif' ? 'notifications' : '');
      if (btnScreen === screenId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    appViewPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === `view-${screenId}`) {
        panel.classList.add('active');
      }
    });

    state.currentScreen = screenId;
    updateHeaderTitle(screenId);

    if (screenId === 'dashboard') {
      updateTerminalView(state.selectedAsset || 'BTC');
      loadTerminalPositions();
      loadTerminalHistory();
    } else if (screenId === 'portfolio') {
      const pRiskMeter = document.getElementById('portfolio-risk-meter-fill');
      if (pRiskMeter) {
        pRiskMeter.style.width = state.profile.riskLevel === 0 ? '18%' : (state.profile.riskLevel === 1 ? '42%' : '78%');
      }
    } else if (screenId === 'notifications') {
      // Mark notifications read on the backend
      apiCall('/notifications/read', { method: 'POST' }).then(() => {
        loadNotifications();
      });
    }

    if (pushState) {
      history.pushState({ screen: screenId }, '', '/app/' + screenId);
    }
  }

  menuTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetScreen = btn.getAttribute('data-screen');
      if (targetScreen) {
        navigateTo(targetScreen, true);
      }
    });
  });

  if (btnTriggerNotif) {
    const newBtnTriggerNotif = btnTriggerNotif.cloneNode(true);
    btnTriggerNotif.parentNode.replaceChild(newBtnTriggerNotif, btnTriggerNotif);
    const updatedBtnTriggerNotif = document.getElementById('btn-trigger-notif');
    updatedBtnTriggerNotif.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('notifications', true);
    });
  }

  window.addEventListener('popstate', (e) => {
    const pathSegments = window.location.pathname.split('/');
    let screenId = pathSegments[pathSegments.length - 1] || 'dashboard';
    if (screenId === 'app' || screenId === '') {
      screenId = 'dashboard';
    }
    navigateTo(screenId, false);
  });

  function updateHeaderTitle(screen) {
    const titles = {
      dashboard: { main: 'Portfolio Dashboard', sub: 'Welcome back. Araiven engine is actively guarding your wealth.' },
      watchlist: { main: 'Market Watchlist', sub: 'High-priority asset tickers flagged by Araiven intelligence.' },
      copilot: { main: 'Araiven Wealth Copilot', sub: 'Ask questions, review strategy logs, and run active rebalance audits.' },
      opportunities: { main: 'Opportunity Explorer', sub: 'Real-time high-probability alpha allocation strategies compiled by Araiven.' },
      portfolio: { main: 'Portfolio Intelligence', sub: 'Explore structural diversification weights, safety levels, and risk buffers.' },
      history: { main: 'Trade History Ledger', sub: 'Cryptographically verified clearing records for swap executions.' },
      notifications: { main: 'Notifications & Alerts', sub: 'Araiven safety alerts and background portfolio event logs.' },
      settings: { main: 'SaaS Settings & Configuration', sub: 'Manage integrated brokerage API keys, active thresholds, and security parameters.' }
    };

    const config = titles[screen] || titles.dashboard;
    if (appHeaderTitle) appHeaderTitle.textContent = config.main;
    if (appHeaderSubtitle) appHeaderSubtitle.textContent = config.sub;
  }

  // ==========================================================================
  // Risk Synchronization Stance (DOM Only Sync Helper)
  // ==========================================================================
  function syncMainAppRiskStateDOMOnly(val) {
    state.profile.riskLevel = val;
    const config = riskConfigurations[val];
    if (!config) return;

    const riskBtns = appRiskSegmented.querySelectorAll('.segmented-btn');
    riskBtns.forEach((btn, idx) => {
      if (idx === val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (appRiskSegmented) {
      appRiskSegmented.classList.remove('state-conservative', 'state-balanced', 'state-aggressive');
      if (val === 0) appRiskSegmented.classList.add('state-conservative');
      else if (val === 1) appRiskSegmented.classList.add('state-balanced');
      else if (val === 2) appRiskSegmented.classList.add('state-aggressive');
    }

    if (sidebarBadge) {
      sidebarBadge.textContent = config.badgeText;
      sidebarBadge.className = 'sidebar-badge';
      if (config.badgeClass) sidebarBadge.classList.add(config.badgeClass);
    }

    if (dashChange) {
      dashChange.textContent = config.change;
      dashChange.className = `metric-change ${config.changeClass}`;
    }
    if (dashHealth) dashHealth.textContent = config.health;
    if (dashHealthSub) dashHealthSub.textContent = config.healthSub;

    if (portfolioActiveRisk) {
      const stanceLabel = val === 0 ? 'Conservative (18)' : (val === 1 ? 'Balanced (42)' : 'Aggressive (78)');
      portfolioActiveRisk.textContent = stanceLabel;
    }
    if (portfolioRiskMeterFill) {
      portfolioRiskMeterFill.style.width = val === 0 ? '18%' : (val === 1 ? '42%' : '78%');
    }

    syncDonutAllocationWeights(val);
  }

  // Bind topbar risk selector buttons to Backend Re-Onboard Swap
  const topRiskBtns = appRiskSegmented.querySelectorAll('.segmented-btn');
  topRiskBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = parseInt(btn.getAttribute('data-value'));
      if (state.profile.riskLevel === val) return;

      try {
        await apiCall('/user/onboard', {
          method: 'POST',
          body: JSON.stringify({
            experience: state.profile.experience,
            capital: state.profile.capital,
            riskLevel: val,
            goal: state.profile.goal
          })
        });

        state.profile.riskLevel = val;
        await initializeDashboardUI();
      } catch (err) {
        console.error('Error changing risk stance:', err);
      }
    });
  });

  function syncDonutAllocationWeights(riskLevel) {
    const donutSegs = {
      0: { eth: '109.9 439.8', usdc: '241.9 439.8', btc: '44 439.8', cash: '44 439.8', ethOff: '109.9', usdcOff: '-109.9', btcOff: '-351.8', cashOff: '-395.8', legend: ['ETH (25%)', 'USDC (55%)', 'BTC (10%)', 'Cash (10%)'] },
      1: { eth: '197.9 439.8', usdc: '131.9 439.8', btc: '87.9 439.8', cash: '22 439.8', ethOff: '109.9', usdcOff: '-88', btcOff: '-219.9', cashOff: '-307.8', legend: ['ETH (45%)', 'USDC (30%)', 'BTC (20%)', 'Cash (5%)'] },
      2: { eth: '241.9 439.8', usdc: '44 439.8', btc: '131.9 439.8', cash: '22 439.8', ethOff: '109.9', usdcOff: '-131.9', btcOff: '-175.9', cashOff: '-307.8', legend: ['ETH (55%)', 'USDC (10%)', 'BTC (30%)', 'Cash (5%)'] }
    };

    const dSet = donutSegs[riskLevel];
    if (!dSet) return;
    const donutEth = document.querySelector('.donut-seg.donut-eth');
    const donutUsdc = document.querySelector('.donut-seg.donut-usdc');
    const donutBtc = document.querySelector('.donut-seg.donut-btc');
    const donutCash = document.querySelector('.donut-seg.donut-cash');

    if (donutEth) {
      donutEth.setAttribute('stroke-dasharray', dSet.eth);
      donutEth.setAttribute('stroke-dashoffset', dSet.ethOff);
    }
    if (donutUsdc) {
      donutUsdc.setAttribute('stroke-dasharray', dSet.usdc);
      donutUsdc.setAttribute('stroke-dashoffset', dSet.usdcOff);
    }
    if (donutBtc) {
      donutBtc.setAttribute('stroke-dasharray', dSet.btc);
      donutBtc.setAttribute('stroke-dashoffset', dSet.btcOff);
    }
    if (donutCash) {
      donutCash.setAttribute('stroke-dasharray', dSet.cash);
      donutCash.setAttribute('stroke-dashoffset', dSet.cashOff);
    }

    const legendItems = document.querySelectorAll('.donut-legend .legend-item span:last-child');
    if (legendItems.length >= 4) {
      legendItems[0].textContent = dSet.legend[0];
      legendItems[1].textContent = dSet.legend[1];
      legendItems[2].textContent = dSet.legend[2];
      legendItems[3].textContent = dSet.legend[3];
    }

    const donutValDisplay = document.querySelector('.donut-inner-metrics strong');
    if (donutValDisplay) {
      donutValDisplay.textContent = `$${state.profile.capital.toLocaleString()}`;
    }
  }

  function renderTerminalChart(details, opp) {
    const chartSvg = document.getElementById('terminal-candlestick-chart');
    if (!chartSvg) return;

    chartSvg.innerHTML = ''; // clear previous elements

    const history = details.history || [];
    if (history.length === 0) return;

    const width = 800;
    const height = 320;
    const paddingLeft = 40;
    const paddingRight = 95;
    const paddingTop = 40;
    const paddingBottom = 40;

    const prices = history.map(pt => pt.close);
    const highs = history.map(pt => pt.high);
    const lows = history.map(pt => pt.low);

    // Dynamic scale limits
    let minPrice = Math.min(...lows);
    let maxPrice = Math.max(...highs);
    
    // Add extra padding to the price boundaries for line visibility
    const paddingVal = (maxPrice - minPrice) * 0.08 || 1;
    minPrice -= paddingVal;
    maxPrice += paddingVal;

    const priceRange = maxPrice - minPrice;

    // Helper coordinates scaler
    const scaleX = (idx) => {
      const activeWidth = width - paddingLeft - paddingRight;
      const stepX = activeWidth / (history.length - 1 || 1);
      return paddingLeft + idx * stepX;
    };

    const scaleY = (val) => {
      const activeHeight = height - paddingTop - paddingBottom;
      return paddingTop + (1 - (val - minPrice) / priceRange) * activeHeight;
    };

    // 1. Draw SVG Background Grid Lines
    const gridLines = 5;
    for (let i = 0; i < gridLines; i++) {
      const gridPrice = minPrice + (priceRange / (gridLines - 1)) * i;
      const y = scaleY(gridPrice);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', paddingLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - paddingRight);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(255,255,255,0.03)');
      line.setAttribute('stroke-width', '1');
      chartSvg.appendChild(line);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', width - paddingRight + 6);
      text.setAttribute('y', y + 3);
      text.setAttribute('fill', 'rgba(255,255,255,0.3)');
      text.setAttribute('font-size', '9');
      text.textContent = `$${gridPrice.toLocaleString(undefined, { maximumFractionDigits: gridPrice >= 100 ? 1 : 3 })}`;
      chartSvg.appendChild(text);
    }

    // 2. Draw Candlesticks (Wicks + Bodies)
    const candleWidth = (width - paddingLeft - paddingRight) / history.length;
    const barSpacing = candleWidth * 0.25;

    history.forEach((pt, idx) => {
      const cx = scaleX(idx);
      const isBullish = pt.close >= pt.open;
      const color = isBullish ? '#10b981' : '#f87171'; // emerald green or soft red

      // Wick
      const wick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      wick.setAttribute('x1', cx);
      wick.setAttribute('y1', scaleY(pt.high));
      wick.setAttribute('x2', cx);
      wick.setAttribute('y2', scaleY(pt.low));
      wick.setAttribute('stroke', color);
      wick.setAttribute('stroke-width', '1.2');
      chartSvg.appendChild(wick);

      // Body
      const yOpen = scaleY(pt.open);
      const yClose = scaleY(pt.close);
      const yTop = Math.min(yOpen, yClose);
      const yBottom = Math.max(yOpen, yClose);
      const bodyHeight = Math.max(2, yBottom - yTop);
      const bodyWidth = Math.max(3, candleWidth - barSpacing);

      const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      body.setAttribute('x', cx - bodyWidth / 2);
      body.setAttribute('y', yTop);
      body.setAttribute('width', bodyWidth);
      body.setAttribute('height', bodyHeight);
      body.setAttribute('fill', isBullish ? 'rgba(16, 185, 129, 0.25)' : 'rgba(248, 113, 113, 0.25)');
      body.setAttribute('stroke', color);
      body.setAttribute('stroke-width', '1.2');
      chartSvg.appendChild(body);
    });

    // 3. Draw S&R Levels
    const supports = opp.supportLevels || [];
    const resistances = opp.resistanceLevels || [];

    supports.forEach((sVal, sIdx) => {
      if (sVal < minPrice || sVal > maxPrice) return;
      const y = scaleY(sVal);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', paddingLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - paddingRight);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(165, 180, 252, 0.2)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '3,3');
      chartSvg.appendChild(line);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', paddingLeft + 5);
      txt.setAttribute('y', y - 4);
      txt.setAttribute('fill', 'rgba(165, 180, 252, 0.5)');
      txt.setAttribute('font-size', '8');
      txt.textContent = `Support S${sIdx+1}: $${sVal.toLocaleString(undefined, { maximumFractionDigits: sVal >= 100 ? 2 : 4 })}`;
      chartSvg.appendChild(txt);
    });

    resistances.forEach((rVal, rIdx) => {
      if (rVal < minPrice || rVal > maxPrice) return;
      const y = scaleY(rVal);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', paddingLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - paddingRight);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(244, 63, 94, 0.2)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '3,3');
      chartSvg.appendChild(line);

      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', paddingLeft + 5);
      txt.setAttribute('y', y - 4);
      txt.setAttribute('fill', 'rgba(244, 63, 94, 0.5)');
      txt.setAttribute('font-size', '8');
      txt.textContent = `Resistance R${rIdx+1}: $${rVal.toLocaleString(undefined, { maximumFractionDigits: rVal >= 100 ? 2 : 4 })}`;
      chartSvg.appendChild(txt);
    });

    // 4. Draw Suggested Targets (Entry, TP, SL)
    if (opp.suggestedEntry && opp.suggestedEntry >= minPrice && opp.suggestedEntry <= maxPrice) {
      const y = scaleY(opp.suggestedEntry);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', paddingLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - paddingRight);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#3b82f6');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4,4');
      chartSvg.appendChild(line);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', width - paddingRight + 6);
      label.setAttribute('y', y + 3);
      label.setAttribute('fill', '#3b82f6');
      label.setAttribute('font-size', '9');
      label.setAttribute('font-weight', '600');
      label.textContent = `ENTRY: $${opp.suggestedEntry.toLocaleString(undefined, { maximumFractionDigits: opp.suggestedEntry >= 100 ? 2 : 4 })}`;
      chartSvg.appendChild(label);
    }

    if (opp.suggestedTakeProfit && opp.suggestedTakeProfit >= minPrice && opp.suggestedTakeProfit <= maxPrice) {
      const y = scaleY(opp.suggestedTakeProfit);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', paddingLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - paddingRight);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#10b981');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4,4');
      chartSvg.appendChild(line);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', width - paddingRight + 6);
      label.setAttribute('y', y + 3);
      label.setAttribute('fill', '#10b981');
      label.setAttribute('font-size', '9');
      label.setAttribute('font-weight', '600');
      label.textContent = `TP: $${opp.suggestedTakeProfit.toLocaleString(undefined, { maximumFractionDigits: opp.suggestedTakeProfit >= 100 ? 2 : 4 })}`;
      chartSvg.appendChild(label);
    }

    if (opp.suggestedStopLoss && opp.suggestedStopLoss >= minPrice && opp.suggestedStopLoss <= maxPrice) {
      const y = scaleY(opp.suggestedStopLoss);
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', paddingLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - paddingRight);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#f87171');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4,4');
      chartSvg.appendChild(line);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', width - paddingRight + 6);
      label.setAttribute('y', y + 3);
      label.setAttribute('fill', '#f87171');
      label.setAttribute('font-size', '9');
      label.setAttribute('font-weight', '600');
      label.textContent = `SL: $${opp.suggestedStopLoss.toLocaleString(undefined, { maximumFractionDigits: opp.suggestedStopLoss >= 100 ? 2 : 4 })}`;
      chartSvg.appendChild(label);
    }

    // 5. Draw Visual AI Annotation Trigger
    const lowestPt = history.slice(-15).reduce((min, p) => p.close < min.close ? p : min, history[history.length - 1]);
    if (lowestPt) {
      const minIdx = history.indexOf(lowestPt);
      const cx = scaleX(minIdx);
      const cy = scaleY(lowestPt.low);

      const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      ring.setAttribute('cx', cx);
      ring.setAttribute('cy', cy);
      ring.setAttribute('r', '12');
      ring.setAttribute('fill', 'none');
      ring.setAttribute('stroke', '#a5b4fc');
      ring.setAttribute('stroke-width', '1.2');
      ring.setAttribute('stroke-dasharray', '2,2');
      chartSvg.appendChild(ring);

      const tag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tag.setAttribute('x', cx + 16);
      tag.setAttribute('y', cy + 3);
      tag.setAttribute('fill', '#a5b4fc');
      tag.setAttribute('font-size', '8');
      tag.setAttribute('font-weight', '500');
      tag.textContent = 'Araiven Accumulation Rebound Zone';
      chartSvg.appendChild(tag);
    }
  }

  async function loadScannerAssets() {
    const scannerRows = document.getElementById('terminal-scanner-rows');
    if (!scannerRows) return;

    try {
      const overview = await apiCall('/market/overview');
      const opps = await apiCall('/opportunities');
      scannerRows.innerHTML = '';
      
      const supported = ['BTC', 'ETH', 'SOL', 'BNB', 'SUI'];
      const assetsData = supported.map(sym => {
        const live = overview.find(o => o.symbol === sym) || { price: 0, change24h: 0 };
        const opp = opps.find(o => o.symbol.startsWith(sym)) || { opportunityScore: 70, confidenceScore: 70 };
        return {
          symbol: sym,
          price: live.price,
          change24h: live.change24h,
          oppScore: opp.opportunityScore !== undefined ? opp.opportunityScore : opp.confidenceScore
        };
      });

      assetsData.forEach(ad => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.className = state.selectedAsset === ad.symbol ? 'scanner-row active' : 'scanner-row';
        tr.dataset.symbol = ad.symbol;

        const changeClass = ad.change24h >= 0 ? 'text-green' : 'text-error';
        const changeSign = ad.change24h >= 0 ? '+' : '';
        const priceFormatted = ad.price >= 100 
          ? ad.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : ad.price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

        tr.innerHTML = `
          <td><strong>${ad.symbol}</strong></td>
          <td>$${priceFormatted}</td>
          <td class="${changeClass}">${changeSign}${ad.change24h.toFixed(2)}%</td>
          <td><span class="badge-opp-score" style="display:inline-block; padding: 2px 6px; border-radius:4px; font-weight:600; background:rgba(99,102,241,0.15); color:#a5b4fc; font-size:0.75rem;">${ad.oppScore}</span></td>
        `;

        tr.addEventListener('click', () => {
          document.querySelectorAll('.scanner-row').forEach(row => row.classList.remove('active'));
          tr.classList.add('active');
          state.selectedAsset = ad.symbol;
          updateTerminalView(ad.symbol);
        });

        scannerRows.appendChild(tr);
      });
    } catch (e) {
      console.error('Error loading scanner assets:', e);
    }
  }

  async function updateTerminalView(symbol) {
    if (!symbol) return;
    
    try {
      const details = await apiCall(`/market/assets/${symbol}`);
      const opps = await apiCall('/opportunities');
      const opp = opps.find(o => o.symbol.startsWith(symbol));

      if (!opp) return;

      const activeIcon = document.getElementById('terminal-active-icon');
      const activeName = document.getElementById('terminal-active-name');
      const activeSymbol = document.getElementById('terminal-active-symbol');
      const chartPrice = document.getElementById('terminal-chart-price');
      const chartChange = document.getElementById('terminal-chart-change');
      const confidenceBadge = document.getElementById('terminal-confidence-badge');
      const oppScore = document.getElementById('terminal-opp-score');
      const riskScore = document.getElementById('terminal-risk-score');
      const trendVal = document.getElementById('terminal-trend-val');
      const suggestedEntry = document.getElementById('terminal-suggested-entry');
      const suggestedTp = document.getElementById('terminal-suggested-tp');
      const suggestedSl = document.getElementById('terminal-suggested-sl');
      const rrRatio = document.getElementById('terminal-rr-ratio');
      const duration = document.getElementById('terminal-duration');
      const reasoningText = document.getElementById('terminal-reasoning-text');

      const livePrice = details.price;
      const liveChange = details.change24h;
      
      const priceFormatted = livePrice >= 100
        ? livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : livePrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

      if (activeIcon) activeIcon.textContent = opp.icon || '₿';
      if (activeName) activeName.textContent = details.name;
      if (activeSymbol) activeSymbol.textContent = `${symbol} / USD`;
      if (chartPrice) chartPrice.textContent = `$${priceFormatted}`;
      if (chartChange) {
        chartChange.textContent = `${liveChange >= 0 ? '+' : ''}${liveChange.toFixed(2)}%`;
        chartChange.className = liveChange >= 0 ? 'text-green' : 'text-error';
      }
      if (confidenceBadge) confidenceBadge.textContent = `${opp.confidenceScore}% Confidence`;
      if (oppScore) oppScore.textContent = opp.opportunityScore !== undefined ? opp.opportunityScore : opp.confidenceScore;
      if (riskScore) riskScore.textContent = opp.riskScore !== undefined ? opp.riskScore : (opp.riskLevel === 'low' ? 20 : (opp.riskLevel === 'high' ? 75 : 35));

      if (trendVal) {
        const trend = opp.trendDirection || 'Bullish';
        trendVal.textContent = trend;
        trendVal.className = trend === 'Bearish' ? 'text-error' : 'text-green';
      }

      const isHold = !opp.suggestedEntry || opp.suggestedEntry === 0;
      if (suggestedEntry) {
        suggestedEntry.textContent = isHold ? 'HOLD' : `$${opp.suggestedEntry.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (suggestedTp) {
        suggestedTp.textContent = (!opp.suggestedTakeProfit || opp.suggestedTakeProfit === 0) ? '—' : `$${opp.suggestedTakeProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (suggestedSl) {
        suggestedSl.textContent = (!opp.suggestedStopLoss || opp.suggestedStopLoss === 0) ? '—' : `$${opp.suggestedStopLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (rrRatio) rrRatio.textContent = isHold ? 'N/A' : (opp.riskRewardRatio || '2.0:1');
      if (duration) duration.textContent = isHold ? 'N/A' : (opp.expectedDuration || '3-5 days');
      if (reasoningText) reasoningText.textContent = opp.reasoningText;

      const marginInput = document.getElementById('terminal-margin-input');
      if (marginInput) {
        const defaultMargin = Math.round(state.profile.capital * 0.1);
        marginInput.value = Math.max(10, Math.min(50000, defaultMargin));
      }

      const tradeTypeBtns = document.querySelectorAll('#terminal-trade-type-select button');
      tradeTypeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-type').toLowerCase() === (opp.type || 'long').toLowerCase()) {
          btn.classList.add('active');
        }
      });

      if (window.activeChartComponent) {
        window.activeChartComponent.updateData(details, opp);
        window.realtimeDataService.setActiveAsset(symbol);
      } else {
        renderTerminalChart(details, opp);
      }
    } catch (e) {
      console.error('Error updating terminal view:', e);
    }
  }

  async function loadTerminalPositions() {
    const positionsRows = document.getElementById('terminal-positions-rows');
    if (!positionsRows) return;

    try {
      const data = await apiCall('/portfolio');
      const holdings = data.holdings || [];
      positionsRows.innerHTML = '';

      const openPositions = holdings.filter(h => h.symbol !== 'USDC' && h.symbol !== 'USDT' && h.symbol !== 'USDS');

      if (openPositions.length === 0) {
        positionsRows.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 24px;">No active trade positions. Deploy a trade using the panel above.</td>
          </tr>
        `;
        return;
      }

      openPositions.forEach(pos => {
        const tr = document.createElement('tr');
        
        const marginUSD = pos.amount * pos.entryPrice;
        const totalSizeUSD = marginUSD * pos.leverage;

        const priceRatio = pos.currentPrice / pos.entryPrice;
        let pnlUSD = 0;
        if (pos.positionType.toLowerCase() === 'short') {
          pnlUSD = marginUSD * pos.leverage * (1 - priceRatio);
        } else {
          pnlUSD = marginUSD * pos.leverage * (priceRatio - 1);
        }

        const pnlPct = marginUSD > 0 ? (pnlUSD / marginUSD) * 100 : 0;
        const pnlClass = pnlUSD >= 0 ? 'text-green' : 'text-error';
        const pnlSign = pnlUSD >= 0 ? '+' : '';

        const entryFormatted = pos.entryPrice >= 100
          ? pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
        
        const currentFormatted = pos.currentPrice >= 100
          ? pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

        tr.innerHTML = `
          <td><strong>${pos.symbol} / USD</strong></td>
          <td><span class="tag-alert-green" style="background: ${pos.positionType.toLowerCase() === 'short' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; color: ${pos.positionType.toLowerCase() === 'short' ? '#f87171' : '#10b981'}; border-color: ${pos.positionType.toLowerCase() === 'short' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'};">${pos.positionType.toUpperCase()}</span></td>
          <td>$${totalSizeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td>${pos.leverage.toFixed(1)}x</td>
          <td>$${entryFormatted}</td>
          <td>$${currentFormatted}</td>
          <td class="${pnlClass}" style="font-weight: 700;">${pnlSign}$${pnlUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pnlSign}${pnlPct.toFixed(2)}%)</td>
          <td><button class="btn btn-secondary btn-sm btn-close-pos" data-symbol="${pos.symbol}">Close</button></td>
        `;

        tr.querySelector('.btn-close-pos').addEventListener('click', async (e) => {
          e.stopPropagation();
          const btn = e.target;
          btn.disabled = true;
          btn.textContent = 'Closing...';
          try {
            const res = await apiCall(`/portfolio/positions/${pos.symbol}/close`, { method: 'POST' });
            alert(`Position closed successfully. Realized PnL: $${res.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
            await initializeDashboardUI();
          } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Close';
            alert(err.message);
          }
        });

        positionsRows.appendChild(tr);
      });
    } catch (e) {
      console.error('Error loading terminal positions:', e);
    }
  }

  async function loadTerminalHistory() {
    const historyRows = document.getElementById('terminal-history-rows');
    if (!historyRows) return;

    try {
      const trades = await apiCall('/portfolio/transactions');
      historyRows.innerHTML = '';

      if (trades.length === 0) {
        historyRows.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 24px;">No trade transaction history.</td>
          </tr>
        `;
        return;
      }

      trades.forEach(t => {
        const tr = document.createElement('tr');
        const date = new Date(t.timestamp);
        const timeStr = date.toLocaleString();

        tr.innerHTML = `
          <td>${timeStr}</td>
          <td><strong>${t.asset}</strong></td>
          <td>${t.amount}</td>
          <td>${t.price}</td>
          <td>${t.fee}</td>
          <td><span class="status-badge active" style="margin: 0; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2);">${t.type.toUpperCase().replace('_', ' ')}</span></td>
        `;
        historyRows.appendChild(tr);
      });
    } catch (e) {
      console.error('Error loading terminal history:', e);
    }
  }

  function initializeTerminalEvents() {
    const levSlider = document.getElementById('terminal-leverage-slider');
    const levDisplay = document.getElementById('terminal-leverage-display');
    if (levSlider && levDisplay) {
      levSlider.addEventListener('input', (e) => {
        levDisplay.textContent = `${e.target.value}x`;
      });
    }

    const typeBtns = document.querySelectorAll('#terminal-trade-type-select button');
    typeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const tradeForm = document.getElementById('terminal-trade-form');
    if (tradeForm) {
      tradeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const deployBtn = document.getElementById('btn-terminal-deploy');
        if (!deployBtn) return;
        
        deployBtn.disabled = true;
        deployBtn.textContent = 'Deploying...';

        const amount = document.getElementById('terminal-margin-input').value;
        const leverage = document.getElementById('terminal-leverage-slider').value;
        const activeTypeBtn = document.querySelector('#terminal-trade-type-select button.active');
        const type = activeTypeBtn ? activeTypeBtn.getAttribute('data-type') : 'Long';

        const opportunityMapping = {
          BTC: 'btc-halving',
          ETH: 'eth-staking',
          SOL: 'solana-liquidity',
          BNB: 'bnb-breakout',
          SUI: 'sui-alpha'
        };
        const opportunityId = opportunityMapping[state.selectedAsset];

        try {
          const res = await apiCall('/opportunities/deploy', {
            method: 'POST',
            body: JSON.stringify({
              opportunityId,
              amount,
              type,
              leverage
            })
          });

          alert(`Simulated trade successfully executed!\nTransaction ID: ${res.transactionId}\nCleared Price: $${res.clearedPrice.toLocaleString()}`);
          await initializeDashboardUI();
        } catch (err) {
          alert(err.message);
        } finally {
          deployBtn.disabled = false;
          deployBtn.textContent = 'Deploy Opportunity Trade';
        }
      });
    }

    const tabBtns = document.querySelectorAll('.panel-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.getAttribute('data-tab');
        const activeTabContent = document.getElementById('tab-active-positions');
        const historyTabContent = document.getElementById('tab-closed-history');

        if (tab === 'active-positions') {
          if (activeTabContent) activeTabContent.style.display = 'block';
          if (historyTabContent) historyTabContent.style.display = 'none';
        } else {
          if (activeTabContent) activeTabContent.style.display = 'none';
          if (historyTabContent) historyTabContent.style.display = 'block';
        }
      });
    });
  }

  // Legacy chart period buttons event listeners disabled

  if (largeChartSvg) {
    // Create or locate vertical tracking line inside chart SVG
    let trackingLine = document.getElementById('large-chart-tracking-line');
    if (!trackingLine) {
      trackingLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      trackingLine.setAttribute('id', 'large-chart-tracking-line');
      trackingLine.setAttribute('y1', '20');
      trackingLine.setAttribute('y2', '260');
      trackingLine.setAttribute('stroke', 'rgba(255, 255, 255, 0.15)');
      trackingLine.setAttribute('stroke-width', '1');
      trackingLine.setAttribute('stroke-dasharray', '4 4');
      trackingLine.style.display = 'none';
      largeChartSvg.appendChild(trackingLine);
    }

    largeChartSvg.addEventListener('mousemove', (e) => {
      if (!largeChartSvg.chartCoords || !largeChartSvg.chartCoords.length || !largeChartSvg.chartPoints) return;
      
      const rect = largeChartSvg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 800;
      
      let closestIdx = 0;
      let minDiff = Infinity;
      largeChartSvg.chartCoords.forEach((coord, idx) => {
        const diff = Math.abs(coord.x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      
      const closestCoord = largeChartSvg.chartCoords[closestIdx];
      const closestValue = largeChartSvg.chartPoints[closestIdx];
      
      const pointer = document.getElementById('large-chart-pointer');
      if (pointer) {
        pointer.setAttribute('cx', closestCoord.x);
        pointer.setAttribute('cy', closestCoord.y);
        pointer.style.display = 'block';
      }
      
      if (trackingLine) {
        trackingLine.setAttribute('x1', closestCoord.x);
        trackingLine.setAttribute('x2', closestCoord.x);
        trackingLine.style.display = 'block';
      }
      
      if (dashBalance) {
        dashBalance.textContent = `$${closestValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    });
    
    largeChartSvg.addEventListener('mouseleave', () => {
      const pointer = document.getElementById('large-chart-pointer');
      if (pointer) {
        if (largeChartSvg.chartCoords && largeChartSvg.chartCoords.length > 0) {
          const lastCoord = largeChartSvg.chartCoords[largeChartSvg.chartCoords.length - 1];
          pointer.setAttribute('cx', lastCoord.x);
          pointer.setAttribute('cy', lastCoord.y);
        } else {
          pointer.style.display = 'none';
        }
      }
      
      if (trackingLine) {
        trackingLine.style.display = 'none';
      }
      
      if (dashBalance) {
        // Restore actual dynamic capital balance
        dashBalance.textContent = `$${state.profile.capital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    });
  }

  // ==========================================================================
  // Araiven Copilot Chat System
  // ==========================================================================
  function appendChatMessage(sender, text, stats = '', actionHtml = '') {
    if (!copilotMessagesLog) return;

    const bubble = document.createElement('div');
    bubble.className = `msg-bubble ${sender}`;

    let content = `<p>${text}</p>`;
    if (stats) {
      content += `<div style="font-family: monospace; font-size: 0.725rem; color: var(--accent-secondary); margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 8px;">${stats}</div>`;
    }
    if (actionHtml) {
      content += actionHtml;
    }

    bubble.innerHTML = content;
    copilotMessagesLog.appendChild(bubble);
    copilotMessagesLog.scrollTop = copilotMessagesLog.scrollHeight;
  }

  // Presets inside copilot panel click
  chatPresetBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const qKey = btn.getAttribute('data-preset');
      const queries = {
        'yield-audit': 'Analyze my current yield spread',
        'hedge-stance': 'Review macro hedging parameters',
        'btc-alloc': 'Evaluate Bitcoin halving momentum impact'
      };
      const text = queries[qKey] || btn.textContent;

      appendChatMessage('user', text);
      chatPresetBtns.forEach(b => b.disabled = true);

      // Typing animation
      const typingBubble = document.createElement('div');
      typingBubble.className = 'msg-bubble system typing-bubble';
      typingBubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
      copilotMessagesLog.appendChild(typingBubble);
      copilotMessagesLog.scrollTop = copilotMessagesLog.scrollHeight;

      try {
        const res = await apiCall('/copilot/message', {
          method: 'POST',
          body: JSON.stringify({ message: text })
        });
        typingBubble.remove();
        appendChatMessage('system', res.reply, res.stats);
      } catch (e) {
        typingBubble.remove();
        appendChatMessage('system', 'Copilot encountered an error auditing strategy parameters.');
      } finally {
        chatPresetBtns.forEach(b => b.disabled = false);
      }
    });
  });

  // Text send button custom trigger
  if (btnCopilotSend && copilotChatInput) {
    btnCopilotSend.addEventListener('click', async () => {
      const text = copilotChatInput.value.trim();
      if (!text) return;

      copilotChatInput.value = '';
      appendChatMessage('user', text);

      const typingBubble = document.createElement('div');
      typingBubble.className = 'msg-bubble system typing-bubble';
      typingBubble.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
      copilotMessagesLog.appendChild(typingBubble);
      copilotMessagesLog.scrollTop = copilotMessagesLog.scrollHeight;

      try {
        const res = await apiCall('/copilot/message', {
          method: 'POST',
          body: JSON.stringify({ message: text })
        });
        typingBubble.remove();
        appendChatMessage('system', res.reply, res.stats);
      } catch (e) {
        typingBubble.remove();
        appendChatMessage('system', 'Audit engine offline.');
      }
    });

    copilotChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnCopilotSend.click();
      }
    });
  }

  // Execute swap rebalance button in Copilot Side Panel
  if (btnCopilotRebalanceExecute) {
    btnCopilotRebalanceExecute.addEventListener('click', async () => {
      if (!activeRecommendationId) {
        alert('No pending directive rebalance is active to execute.');
        return;
      }

      btnCopilotRebalanceExecute.disabled = true;
      btnCopilotRebalanceExecute.textContent = 'Clearing Swap...';

      try {
        const res = await apiCall(`/opportunities/recommendations/${activeRecommendationId}/execute`, {
          method: 'POST'
        });

        btnCopilotRebalanceExecute.textContent = 'Swap Executed';
        btnCopilotRebalanceExecute.className = 'btn btn-secondary block-btn';

        appendChatMessage(
          'system',
          `Swap execution confirmed. Clear receipt: ${res.transactionId} successfully cleared.`,
          `Cleared Swap Value: Fee: $${res.executionFee.toFixed(2)}`
        );

        await initializeDashboardUI();
      } catch (err) {
        btnCopilotRebalanceExecute.disabled = false;
        btnCopilotRebalanceExecute.textContent = 'Execute Rebalance';
        alert(err.message);
      }
    });
  }

  // ==========================================================================
  // Opportunity Explorer Section
  // ==========================================================================
  function renderOpportunitiesCardsLocal(filter = 'all', searchQuery = '') {
    if (!opportunitiesCardsContainer) return;
    opportunitiesCardsContainer.innerHTML = '';

    const cards = state.opportunities.filter(opp => {
      if (filter !== 'all') {
        if (filter === 'alpha' && opp.type !== 'yield') return false;
        if (filter === 'yield' && opp.opportunityId !== 'eth-staking' && opp.opportunityId !== 'usdc-arbitrage') return false;
        if (filter === 'momentum' && opp.type !== 'momentum') return false;
      }
      if (searchQuery) {
        return opp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               opp.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

    if (cards.length === 0) {
      opportunitiesCardsContainer.innerHTML = '<div class="card-glass" style="grid-column: 1/-1; padding: 40px; text-align: center; color: var(--text-secondary);">No opportunities match current criteria.</div>';
      return;
    }

    cards.forEach(opp => {
      const card = document.createElement('div');
      card.className = 'card-glass opportunity-card';
      card.setAttribute('data-id', opp.opportunityId);
      
      card.innerHTML = `
        <div class="opp-badge-row">
          <span class="opp-type-tag">${opp.type === 'yield' ? 'Yield Premium' : 'Momentum Flow'}</span>
          <span class="opp-risk-badge ${opp.riskLevel}">${opp.riskLevel}</span>
        </div>
        <div class="opp-main-info">
          <h4>${opp.name}</h4>
          <span>${opp.symbol}</span>
        </div>
        <p class="opp-reasoning-snippet">${opp.reasoningText.substring(0, 115)}...</p>
        <div class="opp-metrics-bar">
          <div class="opp-metric-col">
            <span>Est. Return</span>
            <strong class="text-green">${opp.expectedReturn}</strong>
          </div>
          <div class="opp-metric-col">
            <span>Confidence</span>
            <strong class="text-gradient">${opp.confidenceScore}%</strong>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openOpportunityDetailDrawer(opp);
      });

      opportunitiesCardsContainer.appendChild(card);
    });
  }

  explorerFilterTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      explorerFilterTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const searchQuery = explorerSearchInput ? explorerSearchInput.value : '';
      renderOpportunitiesCardsLocal(filter, searchQuery);
    });
  });

  if (explorerSearchInput) {
    explorerSearchInput.addEventListener('input', (e) => {
      const activeFilterBtn = document.querySelector('#explorer-filter-tabs button.active');
      const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
      renderOpportunitiesCardsLocal(filter, e.target.value);
    });
  }

  function openOpportunityDetailDrawer(opp) {
    activeOpportunity = opp;
    if (!opportunityDetailDrawer) return;

    if (drawerTitle) drawerTitle.textContent = 'Opportunity Reasoning';
    if (drawerAssetName) drawerAssetName.textContent = opp.name;
    if (drawerAssetSymbol) drawerAssetSymbol.textContent = opp.symbol;
    if (drawerAssetIcon) drawerAssetIcon.textContent = opp.icon;
    if (drawerBadgeConf) drawerBadgeConf.textContent = `${opp.confidenceScore}% Confidence`;
    if (drawerReasoningText) drawerReasoningText.textContent = opp.reasoningText;
    if (drawerStatReturn) drawerStatReturn.textContent = opp.expectedReturn;
    if (drawerStatRisk) drawerStatRisk.textContent = opp.riskLevel;
    if (drawerStatAllocation) drawerStatAllocation.textContent = 'Flexible reserves';
    if (drawerStatStance) drawerStatStance.textContent = 'Direct compound';

    if (btnDrawerDeploy) {
      btnDrawerDeploy.textContent = 'Confirm & Deploy Allocation';
      btnDrawerDeploy.disabled = false;
      btnDrawerDeploy.className = 'btn btn-primary btn-lg block-btn';
    }

    opportunityDetailDrawer.classList.add('open');
  }

  if (btnCloseDrawer) {
    btnCloseDrawer.addEventListener('click', () => {
      opportunityDetailDrawer.classList.remove('open');
    });
  }

  if (btnDrawerDeploy) {
    btnDrawerDeploy.addEventListener('click', async () => {
      if (!activeOpportunity) return;

      const allocationPct = drawerAmountInput ? parseInt(drawerAmountInput.value) : 8;
      const amountUSD = state.profile.capital * (allocationPct / 100);

      btnDrawerDeploy.disabled = true;
      btnDrawerDeploy.textContent = 'Deploying capital...';

      try {
        await apiCall('/opportunities/deploy', {
          method: 'POST',
          body: JSON.stringify({
            opportunityId: activeOpportunity.opportunityId,
            amount: amountUSD
          })
        });

        btnDrawerDeploy.textContent = 'Allocation Deployed';
        btnDrawerDeploy.className = 'btn btn-secondary btn-lg block-btn';

        await initializeDashboardUI();

        setTimeout(() => {
          opportunityDetailDrawer.classList.remove('open');
        }, 800);
      } catch (err) {
        btnDrawerDeploy.disabled = false;
        btnDrawerDeploy.textContent = 'Confirm & Deploy Allocation';
        alert(err.message);
      }
    });
  }

  // ==========================================================================
  // Trade History Rows Renderer
  // ==========================================================================
  function renderTradeHistoryRowsLocal(searchQuery = '') {
    if (!historyRowsContainer) return;
    historyRowsContainer.innerHTML = '';

    const filteredTrades = state.trades.filter(t => {
      if (searchQuery) {
        return t.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
               t.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
               t.status.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

    if (filteredTrades.length === 0) {
      historyRowsContainer.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--text-secondary);">No transactions matches the query.</td></tr>';
      return;
    }

    filteredTrades.forEach(t => {
      const tr = document.createElement('tr');
      const badgeClass = t.status.toLowerCase();
      
      tr.innerHTML = `
        <td style="font-family:monospace; font-size:0.75rem;">${t.timestamp}</td>
        <td style="font-weight:600; color:#fff;">${t.type}</td>
        <td>${t.asset}</td>
        <td>${t.amount}</td>
        <td>${t.price}</td>
        <td style="font-family:monospace;">${t.fee}</td>
        <td><span class="status-badge ${badgeClass}">${t.status}</span></td>
      `;
      historyRowsContainer.appendChild(tr);
    });
  }

  if (historySearchInput) {
    historySearchInput.addEventListener('input', (e) => {
      renderTradeHistoryRowsLocal(e.target.value);
    });
  }

  // ==========================================================================
  // Notifications Center Drawer System
  // ==========================================================================
  function renderNotificationsFeedLocal() {
    if (!notifAlertsList) return;
    notifAlertsList.innerHTML = '';

    const unreads = state.notifications.filter(n => !n.isRead).length;
    if (notifBadgeCount) {
      if (unreads > 0) {
        notifBadgeCount.textContent = unreads;
        notifBadgeCount.style.display = 'flex';
      } else {
        notifBadgeCount.style.display = 'none';
      }
    }

    if (state.notifications.length === 0) {
      notifAlertsList.innerHTML = '<div style="text-align:center; padding:40px 0; color:var(--text-muted); font-size:0.85rem;">No active security alerts or notifications.</div>';
      return;
    }

    state.notifications.forEach(n => {
      const item = document.createElement('div');
      item.className = 'notif-alert-item';
      if (!n.isRead) {
        item.style.borderColor = 'rgba(124,58,237,0.3)';
        item.style.background = 'rgba(124,58,237,0.02)';
      }

      item.innerHTML = `
        <h5>${n.title}</h5>
        <p>${n.body}</p>
        <span class="notif-time">Alert</span>
        <button class="notif-dismiss" data-id="${n.notificationId}">×</button>
      `;

      notifAlertsList.appendChild(item);
    });

    renderPageNotificationsFeed();
  }

  function renderPageNotificationsFeed() {
    const pageNotifList = document.getElementById('page-notif-alerts-list');
    if (!pageNotifList) return;
    pageNotifList.innerHTML = '';

    if (state.notifications.length === 0) {
      pageNotifList.innerHTML = '<div class="card-glass" style="padding: 40px; text-align: center; color: var(--text-secondary);">No active security alerts or notifications.</div>';
      return;
    }

    state.notifications.forEach(n => {
      const item = document.createElement('div');
      item.className = 'notif-alert-item';
      item.style.display = 'flex';
      item.style.justifyContent = 'space-between';
      item.style.alignItems = 'center';
      item.style.padding = '16px';
      item.style.marginBottom = '12px';
      item.style.border = '1px solid rgba(255,255,255,0.06)';
      item.style.borderRadius = '8px';
      item.style.background = 'rgba(255, 255, 255, 0.02)';
      
      if (!n.isRead) {
        item.style.borderColor = 'rgba(124, 58, 237, 0.25)';
        item.style.background = 'rgba(124, 58, 237, 0.03)';
      }

      item.innerHTML = `
        <div style="flex-grow: 1; margin-right: 16px;">
          <h5 style="margin: 0 0 4px 0; color: #fff; font-size: 0.95rem;">${n.title}</h5>
          <p style="margin: 0 0 6px 0; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${n.body}</p>
          <span style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">Alert</span>
        </div>
        <button class="notif-dismiss" data-id="${n.notificationId}" style="background: none; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer; padding: 4px; line-height: 1;">×</button>
      `;

      pageNotifList.appendChild(item);
    });
  }

  if (btnTriggerNotif) {
    btnTriggerNotif.addEventListener('click', () => {
      notifDrawer.classList.add('active');
      notifOverlay.classList.add('active');
    });
  }

  if (btnCloseNotif) {
    btnCloseNotif.addEventListener('click', () => {
      notifDrawer.classList.remove('active');
      notifOverlay.classList.remove('active');
    });
  }

  if (notifOverlay) {
    notifOverlay.addEventListener('click', () => {
      notifDrawer.classList.remove('active');
      notifOverlay.classList.remove('active');
    });
  }

  if (btnClearAllNotifs) {
    btnClearAllNotifs.addEventListener('click', async () => {
      try {
        await apiCall('/notifications/read', { method: 'POST' });
        await loadNotifications();
      } catch (e) {
        console.error(e);
      }
    });
  }

  const btnPageClearAllNotifs = document.getElementById('btn-page-clear-all-notifs');
  if (btnPageClearAllNotifs) {
    btnPageClearAllNotifs.addEventListener('click', async () => {
      try {
        await apiCall('/notifications/read', { method: 'POST' });
        await loadNotifications();
      } catch (e) {
        console.error(e);
      }
    });
  }

  // ==========================================================================
  // Header Actions Binds
  // ==========================================================================
  if (btnHeaderManualScan) {
    btnHeaderManualScan.addEventListener('click', async () => {
      btnHeaderManualScan.disabled = true;
      btnHeaderManualScan.textContent = 'Scanning...';
      
      const statusTxt = document.querySelector('.scanner-status-badge .status-txt');
      const dot = document.querySelector('.scanner-status-badge .status-pulse-dot');
      
      if (statusTxt) {
        statusTxt.textContent = 'RUNNING QUANT ANALYSIS ENGINE';
        statusTxt.style.color = 'var(--accent-secondary)';
      }
      if (dot) dot.style.background = 'var(--accent-secondary)';

      try {
        await apiCall('/market/scan', { method: 'POST' });
        await initializeDashboardUI();
      } catch (err) {
        console.error('Error during manual scan:', err);
        alert('Scanner Error: ' + err.message);
      } finally {
        btnHeaderManualScan.disabled = false;
        btnHeaderManualScan.textContent = 'Scan Markets';
        
        if (statusTxt) {
          statusTxt.textContent = 'ARAIVEN SCANNING ACTIVE';
          statusTxt.style.color = 'var(--success)';
        }
        if (dot) dot.style.background = 'var(--success)';
      }
    });
  }

  // ==========================================================================
  // Load UI Sub-Routines
  // ==========================================================================
  async function loadPortfolioData() {
    try {
      const data = await apiCall('/portfolio');
      state.profile.capital = data.currentBalance;
      
      if (dashBalance) {
        const start = state.previousBalance || (data.currentBalance * 0.95);
        animateValue(dashBalance, start, data.currentBalance, 800, '$', '', 2);
        state.previousBalance = data.currentBalance;
      }
      if (dashApy) dashApy.textContent = data.annualizedYield;
      if (dashRisk) {
        dashRisk.textContent = `${100 - data.safetyScore} / 100`;
      }
      
      if (portfolioHoldingsRows) {
        portfolioHoldingsRows.innerHTML = '';
        data.holdings.forEach(h => {
          const tr = document.createElement('tr');
          const valUSD = h.amount * h.currentPrice;
          tr.innerHTML = `
            <td style="font-weight:600; color:#fff;">${h.asset}</td>
            <td><strong>${h.allocationPct.toFixed(1)}%</strong></td>
            <td>$${valUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>$${h.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="${h.change24h >= 0 ? 'text-green' : 'text-error'}">${h.change24h >= 0 ? '+' : ''}${h.change24h.toFixed(2)}%</td>
          `;
          portfolioHoldingsRows.appendChild(tr);
        });
      }

      // Sync inner donut center
      const donutValDisplay = document.querySelector('.donut-inner-metrics strong');
      if (donutValDisplay) {
        donutValDisplay.textContent = `$${data.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
      }
    } catch (e) {
      console.error('Error loading portfolio:', e);
    }
  }

  async function loadRecommendations() {
    const card = document.querySelector('.active-directive-card');
    if (!card) return;

    try {
      const data = await apiCall('/opportunities/recommendations');
      if (data.length === 0) {
        card.innerHTML = `
          <div class="card-header-row">
            <h4 class="text-accent-gradient">Active Araiven Directive</h4>
            <span class="tag-alert-green" style="background: rgba(255,255,255,0.05); color: var(--text-secondary); border-color: rgba(255,255,255,0.1);">IDLE</span>
          </div>
          <div class="directive-content" style="padding: 20px 0; text-align: center; color: var(--text-secondary);">
            <p>Araiven Engine is scanning markets. No active directives or swap recommendations at this time.</p>
          </div>
        `;
        activeRecommendationId = null;
        if (btnCopilotRebalanceExecute) {
          btnCopilotRebalanceExecute.disabled = true;
          btnCopilotRebalanceExecute.textContent = 'No Rebalance Active';
        }
        return;
      }

      const rec = data[0];
      activeRecommendationId = rec.recommendationId;

      card.innerHTML = `
        <div class="card-header-row">
          <h4 class="text-accent-gradient">Active Araiven Directive</h4>
          <span class="tag-alert-green">RECOMMENDED</span>
        </div>
        <div class="directive-content">
          <h5>Allocate ${rec.suggestedAllocationPct}% reserves to ${rec.opportunity.name}</h5>
          <p>${rec.reasoningText}</p>
          <div class="directive-action-box">
            <div class="directive-stats">
              <div>
                <span>Confidence</span>
                <strong class="text-green">${rec.opportunity.confidenceScore}%</strong>
              </div>
              <div>
                <span>Risk Level</span>
                <strong class="text-blue" style="text-transform: capitalize;">${rec.opportunity.riskLevel}</strong>
              </div>
            </div>
            <button class="btn btn-primary" id="btn-dash-execute-directive" data-id="${rec.recommendationId}">Approve & Execute</button>
          </div>
        </div>
      `;

      const btn = document.getElementById('btn-dash-execute-directive');
      if (btn) {
        btn.addEventListener('click', () => executeActiveRecommendation(rec.recommendationId));
      }

      if (btnCopilotRebalanceExecute) {
        btnCopilotRebalanceExecute.disabled = false;
        btnCopilotRebalanceExecute.textContent = 'Execute Stance Rebalance';
        btnCopilotRebalanceExecute.className = 'btn btn-primary block-btn';
      }
    } catch (e) {
      console.error('Error loading recommendations:', e);
    }
  }

  async function executeActiveRecommendation(id) {
    const btn = document.getElementById('btn-dash-execute-directive');
    if (!btn) return;

    btn.disabled = true;
    btn.textContent = 'Deploying Swap...';

    try {
      const res = await apiCall(`/opportunities/recommendations/${id}/execute`, {
        method: 'POST'
      });

      btn.textContent = 'Directive Deployed';
      btn.className = 'btn btn-secondary';

      appendChatMessage(
        'system',
        `Rebalance Swap Directive Executed. Clear receipt: ${res.transactionId} successfully cleared.`,
        `Cleared Swap Value: Fee: $${res.executionFee.toFixed(2)}`
      );

      await initializeDashboardUI();
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Approve & Execute';
      alert(err.message);
    }
  }

  async function loadOpportunities() {
    try {
      const data = await apiCall('/opportunities');
      state.opportunities = data;
      const activeFilterBtn = document.querySelector('#explorer-filter-tabs button.active');
      const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
      const searchVal = explorerSearchInput ? explorerSearchInput.value : '';
      renderOpportunitiesCardsLocal(filter, searchVal);
    } catch (e) {
      console.error('Error loading opportunities:', e);
    }
  }

  async function loadTradeHistory() {
    try {
      const data = await apiCall('/portfolio/transactions');
      state.trades = data;
      renderTradeHistoryRowsLocal();
    } catch (e) {
      console.error('Error loading trade history:', e);
    }
  }

  async function loadNotifications() {
    try {
      const data = await apiCall('/notifications');
      state.notifications = data;
      renderNotificationsFeedLocal();
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  }

  // ==========================================================================
  // Dashboard UI Initializer
  // ==========================================================================
  async function initializeDashboardUI() {
    syncMainAppRiskStateDOMOnly(state.profile.riskLevel);
    await loadPortfolioData();
    
    if (!state.selectedAsset) {
      state.selectedAsset = 'BTC';
    }

    await loadScannerAssets();
    await updateTerminalView(state.selectedAsset);
    await loadTerminalPositions();
    await loadTerminalHistory();

    await loadOpportunities();
    await loadRecommendations();
    await loadNotifications();

    if (!state.terminalEventsInitialized) {
      initializeTerminalEvents();
      state.terminalEventsInitialized = true;
    }
  }

  async function updateDashboardTopOpportunity() {
    const card = document.getElementById('dash-top-opportunity-card');
    if (!card) return;

    try {
      const opps = await apiCall('/opportunities');
      if (opps && opps.length > 0) {
        // Sort by confidenceScore descending
        const sorted = [...opps].sort((a, b) => b.confidenceScore - a.confidenceScore);
        const topOpp = sorted[0];

        const nameEl = document.getElementById('dash-top-opp-name');
        const symbolEl = document.getElementById('dash-top-opp-symbol');
        const returnEl = document.getElementById('dash-top-opp-return');
        const reasoningEl = document.getElementById('dash-top-opp-reasoning');
        const confidenceEl = document.getElementById('dash-top-opp-confidence');
        const btnExplore = document.getElementById('btn-dash-view-top-opp');

        if (nameEl) nameEl.textContent = topOpp.name;
        if (symbolEl) symbolEl.textContent = topOpp.symbol;
        if (returnEl) {
          returnEl.textContent = topOpp.expectedReturn;
          returnEl.className = (topOpp.expectedReturn.includes('-') && !topOpp.expectedReturn.includes('%')) ? 'text-error' : 'text-green';
        }
        if (reasoningEl) reasoningEl.textContent = topOpp.reasoningText;
        if (confidenceEl) confidenceEl.textContent = `${topOpp.confidenceScore}%`;

        if (btnExplore) {
          const newBtn = btnExplore.cloneNode(true);
          btnExplore.parentNode.replaceChild(newBtn, btnExplore);
          newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('opportunities', true);
            setTimeout(() => {
              openOpportunityDetailDrawer(topOpp);
            }, 100);
          });
        }
      }
    } catch (err) {
      console.error('Error updating dashboard top opportunity:', err);
    }
  }

  async function backgroundScanRefresh() {
    const statusTxt = document.querySelector('.scanner-status-badge .status-txt');
    const dot = document.querySelector('.scanner-status-badge .status-pulse-dot');
    
    // Show active scan status in scanner badge
    if (statusTxt) {
      statusTxt.textContent = 'ARAIVEN STREAMING ACTIVE';
      statusTxt.style.color = 'var(--accent-primary)';
    }
    if (dot) {
      dot.style.background = 'var(--accent-primary)';
    }

    // Apply skeletons
    const elementsToSkeleton = [
      dashBalance,
      dashApy,
      dashRisk,
      dashHealth,
      document.getElementById('dash-top-opp-content'),
      document.querySelector('.directive-content')
    ].filter(el => el !== null);

    elementsToSkeleton.forEach(el => el.classList.add('skeleton-pulse'));

    try {
      await loadPortfolioData();
      await loadOpportunities();
      await loadRecommendations();
      await updateDashboardTopOpportunity();
    } catch (e) {
      console.error('Error in background scan refresh:', e);
    } finally {
      // Small timeout for visual confirmation of "active scanning"
      setTimeout(() => {
        elementsToSkeleton.forEach(el => el.classList.remove('skeleton-pulse'));
        
        if (statusTxt) {
          statusTxt.textContent = 'ARAIVEN SCANNING ACTIVE';
          statusTxt.style.color = 'var(--success)';
        }
        if (dot) {
          dot.style.background = 'var(--success)';
        }
      }, 500);
    }
  }

  // Set up 15-second background streaming interval
  setInterval(() => {
    if (state.onboardingCompleted && state.currentScreen === 'dashboard') {
      backgroundScanRefresh();
    }
  }, 15000);

  function resolveInitialRoute() {
    const initRoute = sessionStorage.getItem('initialRoute');
    if (initRoute) {
      sessionStorage.removeItem('initialRoute');
      navigateTo(initRoute, false);
      history.replaceState({ screen: initRoute }, '', '/app/' + initRoute);
    } else {
      const pathSegments = window.location.pathname.split('/');
      let screenId = pathSegments[pathSegments.length - 1] || 'dashboard';
      if (screenId === 'app' || screenId === '') {
        screenId = 'dashboard';
      }
      navigateTo(screenId, false);
      history.replaceState({ screen: screenId }, '', '/app/' + screenId);
    }
  }

  // Check auth state immediately on load
  checkAuthState();
  resolveInitialRoute();

});
