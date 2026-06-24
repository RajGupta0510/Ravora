document.addEventListener('DOMContentLoaded', () => {

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
      goal: 'preservation'
    },
    currentScreen: 'dashboard',
    notifications: [
      {
        id: 1,
        title: 'Drawdown Protection Shield Configured',
        desc: 'Araiven calculated correlation matrices and established drawdown cushion at 3.50%.',
        time: 'Just now',
        unread: true
      },
      {
        id: 2,
        title: 'Ethereum Staking Alpha Opportunity Ingested',
        desc: 'New opportunity detected on decentralized staking pools yielding 9.6% APY.',
        time: '15 mins ago',
        unread: true
      },
      {
        id: 3,
        title: 'Exchange API Credentials Checked',
        desc: 'Connected to Binance and Coinbase APIs successfully. Read/write trade enabled, withdrawals disabled.',
        time: '1 hour ago',
        unread: false
      }
    ],
    trades: [
      {
        timestamp: '2026-06-23 18:22:15',
        type: 'Hedge Swap',
        asset: 'USDC / USDS Stable Basket',
        amount: '$8,240.00',
        price: '$1.0002',
        fee: '$4.12',
        status: 'Completed'
      },
      {
        timestamp: '2026-06-22 10:14:02',
        type: 'Staking Rebalance',
        asset: 'Ethereum (ETH)',
        amount: '2.500 ETH',
        price: '$3,482.40',
        fee: '$8.70',
        status: 'Completed'
      },
      {
        timestamp: '2026-06-21 14:45:50',
        type: 'Compounding Rebalance',
        asset: 'Bitcoin (BTC)',
        amount: '0.125 BTC',
        price: '$64,120.10',
        fee: '$16.03',
        status: 'Completed'
      },
      {
        timestamp: '2026-06-19 09:30:11',
        type: 'API Drawdown Shield',
        asset: 'Solana (SOL) to USDC',
        amount: '120.50 SOL',
        price: '$134.20',
        fee: '$8.09',
        status: 'Hedged'
      }
    ],
    opportunities: [
      {
        id: 'eth-staking',
        type: 'yield',
        name: 'Ethereum Staking Alpha',
        symbol: 'ETH / USD',
        icon: 'Ξ',
        desc: 'Validator queue consolidation patterns reveal a post-upgrade yields premium on decentralized pools. Backed by institutional accumulation support lines.',
        confidence: '94%',
        risk: 'Low Drawdown',
        riskClass: 'low',
        estReturn: '8.0% - 12.0%',
        allocation: '8.00% swap',
        stance: 'Balanced Shield'
      },
      {
        id: 'btc-halving',
        type: 'momentum',
        name: 'Bitcoin ETF Momentum Stacking',
        symbol: 'BTC / USD',
        icon: '₿',
        desc: 'Spot ETF net inflows show consecutive daily acceleration, coinciding with hodler lockup peaks. Momentum targets a breakout to structural range highs.',
        confidence: '89%',
        risk: 'Medium Volatility',
        riskClass: 'medium',
        estReturn: '15.0% - 22.0%',
        allocation: '12.00% swap',
        stance: 'Hedged Swing'
      },
      {
        id: 'usdc-arbitrage',
        type: 'yield',
        name: 'Stablecoin Lending Arbitrage',
        symbol: 'USDC / USDT / DAI',
        icon: '$',
        desc: 'Federal Reserve rate volatility spiked arbitrage yields across Aave and Uniswap lending pools. Rotates cash reserves into peak yield efficiency.',
        confidence: '91%',
        risk: 'Minimal Risk',
        riskClass: 'low',
        estReturn: '6.5% - 9.2%',
        allocation: '15.00% swap',
        stance: 'Capital Guard'
      },
      {
        id: 'solana-liquidity',
        type: 'momentum',
        name: 'Solana Liquidity Staking Accumulation',
        symbol: 'SOL / USD',
        icon: 'S',
        desc: 'DEX trading volume indices indicate structural demand trends for Jup/Sol liquidity pairs. High variance yield with automated trailing drawdown trigger.',
        confidence: '78%',
        risk: 'High Volatility',
        riskClass: 'high',
        estReturn: '22.0% - 32.0%',
        allocation: '6.00% swap',
        stance: 'Aggressive Capture'
      }
    ]
  };

  // Sync risk statistics configurations
  const riskConfigurations = {
    0: { // Conservative
      badgeText: 'CONSERVATIVE SHIELD',
      badgeClass: 'cons',
      balance: '$124,582.40',
      change: '+$8,340.20 (+7.2% 24h)',
      changeClass: 'positive',
      apy: '7.18%',
      risk: '18 / 100',
      riskSub: 'Max Protective Guard Active',
      health: '98%',
      healthSub: 'drawdown capped at 1.50%'
    },
    1: { // Balanced
      badgeText: 'BALANCED MODEL',
      badgeClass: '',
      balance: '$132,194.10',
      change: '+$14,210.60 (+12.0% 24h)',
      changeClass: 'positive',
      apy: '12.42%',
      risk: '42 / 100',
      riskSub: 'Balanced Protection Shield',
      health: '96%',
      healthSub: 'drawdown capped at 3.50%'
    },
    2: { // Aggressive
      badgeText: 'AGGRESSIVE CAPTURE',
      badgeClass: 'agg',
      balance: '$149,425.80',
      change: '+$31,520.10 (+26.7% 24h)',
      changeClass: 'positive',
      apy: '26.74%',
      risk: '78 / 100',
      riskSub: 'High Volatility Trailing Capture',
      health: '91%',
      healthSub: 'drawdown capped at 8.50%'
    }
  };

  // SVG Chart points datasets
  const chartDatasets = {
    0: { // Conservative
      '24h': [123500, 123800, 123900, 124200, 124100, 124300, 124582],
      '7d': [121000, 121800, 122400, 122900, 123600, 124000, 124582],
      '30d': [118000, 119500, 120200, 121900, 122800, 123400, 124582],
      '1y': [105000, 108000, 111000, 113000, 117000, 120000, 124582]
    },
    1: { // Balanced
      '24h': [128000, 127200, 129500, 128400, 130800, 131500, 132194],
      '7d': [122000, 124500, 126000, 125100, 129000, 130200, 132194],
      '30d': [115000, 118000, 122000, 121500, 127000, 129000, 132194],
      '1y': [98000, 104000, 109000, 112000, 122000, 127000, 132194]
    },
    2: { // Aggressive
      '24h': [141000, 138000, 146000, 142000, 148500, 145000, 149425],
      '7d': [130000, 138000, 134000, 142000, 145000, 141000, 149425],
      '30d': [120000, 132000, 127000, 139000, 142000, 136000, 149425],
      '1y': [88000, 102000, 95000, 118000, 134000, 126000, 149425]
    }
  };

  // Copilot preset responses
  const copilotPresetResponses = {
    'yield-audit': {
      userText: 'Analyze my current yield spread',
      aiText: 'Under your active model, Araiven is capturing compounding spreads across two major channels: **Ethereum validator staking** (45% allocation, yielding 9.6% APY) and **Stablecoin Lending pool spreads** (30% allocation, yielding 8.2% APY). Both allocations are secured via non-custodial broker channels with 24/7 liquidity availability.',
      stats: 'Overall Portfolio APY: 12.42% | Safety Index: Fully Compliant'
    },
    'hedge-stance': {
      userText: 'Review macro hedging parameters',
      aiText: 'Araiven Drawdown Protection is currently active. The safety guard monitors correlation shifts across monitored tokens. If portfolio variance triggers a trailing draw-down threat exceeding **3.50%** in a 24-hour window, active volatile exposures automatically swap into USDC/USDS stable yielding baskets until orderbooks stabilize.',
      stats: 'Volatility Index: Low Variance | Automatic Drawdown Cushion: 3.50%'
    },
    'btc-alloc': {
      userText: 'Evaluate Bitcoin halving momentum impact',
      aiText: 'Araiven ETF inflow models show institutional accumulation velocity increasing by **14%** over the last 48 hours. Bitcoin is demonstrating strong support at $64,000. Under your active profile, a momentum target allocation of **12%** ($15,840) is currently deployed to capture price appreciation with an exit target zone of $72,500.',
      stats: 'Bitcoin Allocation: 20% | Momentum Confidence Index: 89%'
    }
  };

  // ==========================================================================
  // Element Selectors
  // ==========================================================================
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
  const appRiskCons = document.getElementById('app-risk-cons');
  const appRiskMod = document.getElementById('app-risk-mod');
  const appRiskAgg = document.getElementById('app-risk-agg');

  // Core metrics fields
  const dashBalance = document.getElementById('dash-balance');
  const dashChange = document.getElementById('dash-change');
  const dashApy = document.getElementById('dash-apy');
  const dashRisk = document.getElementById('dash-risk');
  const dashHealth = document.getElementById('dash-health');
  const dashRiskSub = document.getElementById('dash-change'); // Wait, let's verify if IDs are correct
  const dashHealthSub = document.getElementById('dash-health-sub');
  
  // Charts
  const chartPeriodButtons = document.querySelectorAll('.chart-toggles button');
  const largeChartLine = document.getElementById('large-chart-line');
  const largeChartArea = document.getElementById('large-chart-area');

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

  // Utility reset onboarding
  const btnTriggerOnboardingReset = document.getElementById('btn-trigger-onboarding-reset');
  const btnHeaderManualScan = document.getElementById('btn-header-manual-scan');
  const btnDashExecuteDirective = document.getElementById('btn-dash-execute-directive');

  let activePeriod = '24h';
  let activeOpportunity = null;

  // ==========================================================================
  // Onboarding Logic
  // ==========================================================================
  function updateOnboardingStepsVisibility() {
    onboardingSteps.forEach(step => step.classList.remove('active'));
    
    if (state.currentStep <= 4) {
      const stepEl = document.getElementById(`onboarding-step-${state.currentStep}`);
      if (stepEl) stepEl.classList.add('active');
    }
    
    // Update step dots
    stepDots.forEach((dot, idx) => {
      if (idx + 1 === state.currentStep) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Toggle Back button
    if (state.currentStep === 1) {
      btnOnboardingBack.style.display = 'none';
    } else {
      btnOnboardingBack.style.display = 'block';
    }

    // Toggle Next Step button text
    if (state.currentStep === 4) {
      btnOnboardingNext.textContent = 'Generate My Portfolio Copilot';
    } else {
      btnOnboardingNext.textContent = 'Next Step';
    }
  }

  // Handle option card selection in onboarding
  const optionCards = document.querySelectorAll('.option-card');
  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      const parentStep = card.closest('.onboarding-step');
      parentStep.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const stepId = parentStep.id;
      const value = card.getAttribute('data-value');

      if (stepId.includes('1')) {
        state.profile.experience = value;
      } else if (stepId.includes('3')) {
        state.profile.riskLevel = parseInt(value);
      } else if (stepId.includes('4')) {
        state.profile.goal = value;
      }
    });
  });

  // Slider interaction
  if (capitalSlider) {
    capitalSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      state.profile.capital = val;
      if (capitalDisplayVal) {
        capitalDisplayVal.textContent = `$${val.toLocaleString()}`;
      }
      
      // Deactivate presets if value doesn't match
      presetBtns.forEach(btn => {
        if (parseInt(btn.getAttribute('data-value')) === val) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });
  }

  // Preset Capital Buttons
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

  // Navigation handlers
  if (btnOnboardingNext) {
    btnOnboardingNext.addEventListener('click', () => {
      if (state.currentStep < 4) {
        state.currentStep++;
        updateOnboardingStepsVisibility();
      } else {
        // Start Araiven Scan Simulation
        state.currentStep = 5; // Simulation Loader state
        onboardingSteps.forEach(step => step.classList.remove('active'));
        if (onboardingLoader) onboardingLoader.classList.add('active');
        if (btnOnboardingBack) btnOnboardingBack.style.display = 'none';
        if (btnOnboardingNext) btnOnboardingNext.style.display = 'none';
        
        runOnboardingScanningSimulation();
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

  // Scanning simulation progress
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
          // Fade out onboarding card and container
          onboardingOverlay.classList.add('fade-out-onboarding');
          state.onboardingCompleted = true;
          
          // Sync main dashboard states
          syncMainAppRiskState(state.profile.riskLevel);
          initializeDashboardUI();
        }, 800);
      } else {
        onboardingProgressBar.style.width = `${progress}%`;
        
        // Update logs based on progress percentage
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

  // Reset Onboarding Guide utility
  if (btnTriggerOnboardingReset) {
    btnTriggerOnboardingReset.addEventListener('click', () => {
      state.onboardingCompleted = false;
      state.currentStep = 1;
      
      // Reset DOM elements
      onboardingOverlay.classList.remove('fade-out-onboarding');
      onboardingOverlay.style.display = 'flex';
      onboardingLoader.classList.remove('active');
      
      // Activate step 1
      updateOnboardingStepsVisibility();
      if (btnOnboardingBack) btnOnboardingBack.style.display = 'none';
      if (btnOnboardingNext) {
        btnOnboardingNext.style.display = 'block';
        btnOnboardingNext.textContent = 'Next Step';
      }
    });
  }

  // ==========================================================================
  // SPA Screen Router Navigation (History API SaaS Routing)
  // ==========================================================================
  const validScreens = ['dashboard', 'watchlist', 'copilot', 'opportunities', 'portfolio', 'history', 'notifications', 'settings'];

  function navigateTo(screenId, pushState = true) {
    if (!validScreens.includes(screenId)) {
      screenId = 'dashboard';
    }

    // Toggle Active Link states on both sidebar menu buttons and notifications bell button
    const allNavBtns = [...menuTabBtns, btnTriggerNotif];
    allNavBtns.forEach(btn => {
      const btnScreen = btn.getAttribute('data-screen') || (btn.id === 'btn-trigger-notif' ? 'notifications' : '');
      if (btnScreen === screenId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle Panels
    appViewPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === `view-${screenId}`) {
        panel.classList.add('active');
      }
    });

    state.currentScreen = screenId;
    updateHeaderTitle(screenId);

    // Handle custom canvas redraws or renders if needed
    if (screenId === 'dashboard') {
      drawPortfolioChart(activePeriod, state.profile.riskLevel);
    } else if (screenId === 'portfolio') {
      const pRiskMeter = document.getElementById('portfolio-risk-meter-fill');
      if (pRiskMeter) {
        pRiskMeter.style.width = state.profile.riskLevel === 0 ? '18%' : (state.profile.riskLevel === 1 ? '42%' : '78%');
      }
    } else if (screenId === 'notifications') {
      renderPageNotificationsFeed();
      // Mark all as read when entering notifications view
      state.notifications.forEach(n => n.unread = false);
      renderNotificationsFeed();
    }

    // Push history state if requested
    if (pushState) {
      history.pushState({ screen: screenId }, '', '/app/' + screenId);
    }
  }

  // Bind Sidebar Tab Clicks to navigateTo
  menuTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetScreen = btn.getAttribute('data-screen');
      if (targetScreen) {
        navigateTo(targetScreen, true);
      }
    });
  });

  // Bind Notifications bell button click to navigate to /app/notifications route
  if (btnTriggerNotif) {
    // Replace the legacy click drawer toggle with routing navigation
    const newBtnTriggerNotif = btnTriggerNotif.cloneNode(true);
    btnTriggerNotif.parentNode.replaceChild(newBtnTriggerNotif, btnTriggerNotif);
    
    // re-assign selector variable to the new cloned node
    const updatedBtnTriggerNotif = document.getElementById('btn-trigger-notif');
    updatedBtnTriggerNotif.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('notifications', true);
    });
  }

  // Bind browser history back/forward buttons
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
      dashboard: { main: 'Portfolio Dashboard', sub: 'Welcome back, Raja. Araiven engine is actively guarding your wealth.' },
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

  // Render notifications on dedicated view page
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
      
      if (n.unread) {
        item.style.borderColor = 'rgba(124, 58, 237, 0.25)';
        item.style.background = 'rgba(124, 58, 237, 0.03)';
      }

      item.innerHTML = `
        <div style="flex-grow: 1; margin-right: 16px;">
          <h5 style="margin: 0 0 4px 0; color: #fff; font-size: 0.95rem;">${n.title}</h5>
          <p style="margin: 0 0 6px 0; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4;">${n.desc}</p>
          <span style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">${n.time}</span>
        </div>
        <button class="notif-dismiss" data-id="${n.id}" style="background: none; border: none; color: var(--text-muted); font-size: 1.2rem; cursor: pointer; padding: 4px; line-height: 1;">×</button>
      `;

      const dismissBtn = item.querySelector('.notif-dismiss');
      dismissBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissNotification(n.id);
        renderPageNotificationsFeed();
      });

      pageNotifList.appendChild(item);
    });
  }

  // Bind Page Clear All button
  const btnPageClearAllNotifs = document.getElementById('btn-page-clear-all-notifs');
  if (btnPageClearAllNotifs) {
    btnPageClearAllNotifs.addEventListener('click', () => {
      state.notifications = [];
      renderNotificationsFeed();
      renderPageNotificationsFeed();
    });
  }

  // Initial routing resolution
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

  // ==========================================================================
  // Risk Synchronization Stance (Conservative, Balanced, Aggressive)
  // ==========================================================================
  function syncMainAppRiskState(val) {
    state.profile.riskLevel = val;
    const config = riskConfigurations[val];
    if (!config) return;

    // Update active segmented button toggles in top nav bar
    const riskBtns = appRiskSegmented.querySelectorAll('.segmented-btn');
    riskBtns.forEach((btn, idx) => {
      if (idx === val) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update sidebar risk badge
    if (sidebarBadge) {
      sidebarBadge.textContent = config.badgeText;
      sidebarBadge.className = 'sidebar-badge';
      if (config.badgeClass) sidebarBadge.classList.add(config.badgeClass);
    }

    // Sync stats inside dashboard
    if (dashBalance) dashBalance.textContent = config.balance;
    if (dashChange) {
      dashChange.textContent = config.change;
      dashChange.className = `metric-change ${config.changeClass}`;
    }
    if (dashApy) dashApy.textContent = config.apy;
    if (dashRisk) dashRisk.textContent = config.risk;
    if (dashHealth) dashHealth.textContent = config.health;
    if (dashHealthSub) dashHealthSub.textContent = config.healthSub;

    // Sync Portfolio tab risk meter details
    if (portfolioActiveRisk) {
      const stanceLabel = val === 0 ? 'Conservative (18)' : (val === 1 ? 'Balanced (42)' : 'Aggressive (78)');
      portfolioActiveRisk.textContent = stanceLabel;
    }
    if (portfolioRiskMeterFill) {
      portfolioRiskMeterFill.style.width = val === 0 ? '18%' : (val === 1 ? '42%' : '78%');
    }

    // Sync Donut chart weights based on profile
    syncDonutAllocationWeights(val);

    // Sync holdings table rows
    renderPortfolioHoldingsRows(val);

    // Redraw Growth Chart
    drawPortfolioChart(activePeriod, val);
  }

  // Bind topbar risk selector buttons
  const topRiskBtns = appRiskSegmented.querySelectorAll('.segmented-btn');
  topRiskBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-value'));
      syncMainAppRiskState(val);
      
      // Log notification of rebalance stance alteration
      const label = val === 0 ? 'Conservative' : (val === 1 ? 'Balanced' : 'Aggressive');
      addSystemNotification(
        'Risk Guard Model Stance Swapped',
        `Capital allocation adjusted to enforce the ${label} threshold limits.`
      );
    });
  });

  // Dynamic Donut chart weights
  function syncDonutAllocationWeights(riskLevel) {
    const donutSegs = {
      0: { eth: '109.9 439.8', usdc: '241.9 439.8', btc: '44 439.8', cash: '44 439.8', ethOff: '109.9', usdcOff: '-109.9', btcOff: '-351.8', cashOff: '-395.8', legend: ['ETH (25%)', 'USDC (55%)', 'BTC (10%)', 'Cash (10%)'] },
      1: { eth: '197.9 439.8', usdc: '131.9 439.8', btc: '87.9 439.8', cash: '22 439.8', ethOff: '109.9', usdcOff: '-88', btcOff: '-219.9', cashOff: '-307.8', legend: ['ETH (45%)', 'USDC (30%)', 'BTC (20%)', 'Cash (5%)'] },
      2: { eth: '241.9 439.8', usdc: '44 439.8', btc: '131.9 439.8', cash: '22 439.8', ethOff: '109.9', usdcOff: '-131.9', btcOff: '-175.9', cashOff: '-307.8', legend: ['ETH (55%)', 'USDC (10%)', 'BTC (30%)', 'Cash (5%)'] }
    };

    const dSet = donutSegs[riskLevel];
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

    // Legend text updates
    const legendItems = document.querySelectorAll('.donut-legend .legend-item span:last-child');
    if (legendItems.length >= 4) {
      legendItems[0].textContent = dSet.legend[0];
      legendItems[1].textContent = dSet.legend[1];
      legendItems[2].textContent = dSet.legend[2];
      legendItems[3].textContent = dSet.legend[3];
    }

    // Inner center metric display balance
    const donutValDisplay = document.querySelector('.donut-inner-metrics strong');
    if (donutValDisplay) {
      donutValDisplay.textContent = riskConfigurations[riskLevel].balance;
    }
  }

  // ==========================================================================
  // Dynamic Bezier SVG Area Chart Drawing
  // ==========================================================================
  function drawPortfolioChart(period, riskLevel) {
    if (!largeChartLine || !largeChartArea) return;
    
    activePeriod = period;
    const dataset = chartDatasets[riskLevel][period];
    if (!dataset) return;

    const width = 800;
    const height = 280;
    const padding = 20;

    const minVal = Math.min(...dataset) * 0.998;
    const maxVal = Math.max(...dataset) * 1.002;
    const valRange = maxVal - minVal;

    const stepX = (width - padding * 2) / (dataset.length - 1);
    const coords = dataset.map((val, idx) => {
      const x = padding + idx * stepX;
      // y is inverted in SVG coordinate space
      const y = height - padding - ((val - minVal) / valRange) * (height - padding * 2);
      return { x, y };
    });

    // Generate Bezier path string
    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const cpX1 = coords[i].x + stepX / 2;
      const cpY1 = coords[i].y;
      const cpX2 = coords[i].x + stepX / 2;
      const cpY2 = coords[i + 1].y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i + 1].x} ${coords[i + 1].y}`;
    }

    // Generate closed Area path string
    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    // Apply attributes to SVG paths
    largeChartLine.setAttribute('d', linePath);
    largeChartArea.setAttribute('d', areaPath);
    
    // Update pointer dot at the final point coordinates
    const pointer = document.getElementById('large-chart-pointer');
    if (pointer) {
      pointer.setAttribute('cx', coords[coords.length - 1].x);
      pointer.setAttribute('cy', coords[coords.length - 1].y);
      pointer.style.display = 'block';
    }
  }

  // Chart duration tab button binds
  chartPeriodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chartPeriodButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const period = btn.getAttribute('data-period');
      drawPortfolioChart(period, state.profile.riskLevel);
    });
  });

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

  function simulateCopilotTypingResponse(userText, aiText, stats = '', actionHtml = '') {
    // 1. Append User message
    appendChatMessage('user', userText);

    // 2. Append Typing indicator bubble
    const typingBubble = document.createElement('div');
    typingBubble.className = 'msg-bubble system typing-bubble';
    typingBubble.innerHTML = '<p>Araiven is analyzing correlation matrices...</p>';
    copilotMessagesLog.appendChild(typingBubble);
    copilotMessagesLog.scrollTop = copilotMessagesLog.scrollHeight;

    // 3. Remove typing bubble and append actual response
    setTimeout(() => {
      typingBubble.remove();
      appendChatMessage('copilot', aiText, stats, actionHtml);
    }, 1200);
  }

  // Preset Buttons
  chatPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const qKey = btn.getAttribute('data-query');
      const response = copilotPresetResponses[qKey];
      if (!response) return;

      // Temporarily disable buttons
      chatPresetBtns.forEach(b => b.disabled = true);

      simulateCopilotTypingResponse(response.userText, response.aiText, response.stats);

      setTimeout(() => {
        chatPresetBtns.forEach(b => b.disabled = false);
      }, 1300);
    });
  });

  // Text Send button
  if (btnCopilotSend && copilotChatInput) {
    btnCopilotSend.addEventListener('click', () => {
      const text = copilotChatInput.value.trim();
      if (!text) return;

      copilotChatInput.value = '';
      
      // Determine response mapping based on keywords
      let aiText = 'I scanned global sentiment feeds, macro indices, and your capital exposure model. Stance parameters remain locked and protected. Please specify another audit query.';
      let stats = 'Model Sync Index: 100% | Safety Stance: Compliant';
      
      if (text.toLowerCase().includes('staking') || text.toLowerCase().includes('ethereum') || text.toLowerCase().includes('eth')) {
        aiText = 'Ethereum staking validation spreads continue to yield an alpha spread at **9.62% APY**. Your active profile currently holds 45% allocation. No rebalances required.';
        stats = 'ETH Allocation: 45% | Staking Safety Index: Excellent';
      } else if (text.toLowerCase().includes('bitcoin') || text.toLowerCase().includes('btc')) {
        aiText = 'Bitcoin spot ETF net volumes remain accelerated, establishing support bounds at $64,000. Trailing momentum model targets compound execution triggers at $72,500.';
        stats = 'BTC Allocation: 20% | Momentum Index: 89%';
      } else if (text.toLowerCase().includes('risk') || text.toLowerCase().includes('drawdown') || text.toLowerCase().includes('protect')) {
        aiText = 'Your active protective drawdown index limit is set to **3.50%**. Under this model, if daily drawdowns exceed this margin, volatile assets rotate automatically into USDC stable yielding lending pools.';
        stats = 'Drawdown Buffer: 3.50% | Trailing Shield: Enabled';
      }

      simulateCopilotTypingResponse(text, aiText, stats);
    });

    copilotChatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        btnCopilotSend.click();
      }
    });
  }

  // Execute swap rebalance button in Copilot Side Panel
  if (btnCopilotRebalanceExecute) {
    btnCopilotRebalanceExecute.addEventListener('click', () => {
      btnCopilotRebalanceExecute.disabled = true;
      btnCopilotRebalanceExecute.textContent = 'Clearing Swap...';

      setTimeout(() => {
        // Log transaction in history
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        state.trades.unshift({
          timestamp,
          type: 'Copilot Swap',
          asset: 'USDC to ETH Staking',
          amount: '$10,560.00',
          price: '$3,485.10',
          cleared: '$3,485.10',
          fee: '$10.56',
          status: 'Completed'
        });

        // Add System notification
        addSystemNotification(
          'Rebalance Swap Directive Executed',
          'Successfully swapped $10,560 USDC reserves to ETH Staking Alpha.'
        );

        // Append Copilot execution complete message
        appendChatMessage(
          'system',
          'Swap execution confirmed. Clear receipt: 8% USDC reserves successfully deployed into ETH Staking. Stance exposure updated.',
          'Cleared Swap Value: $10,560.00 | Fee: $10.56'
        );

        // Update balances inside stats
        const activeRisk = state.profile.riskLevel;
        if (activeRisk === 1) {
          // modify allocation metrics
          const donutEth = document.querySelector('.donut-seg.donut-eth');
          const donutUsdc = document.querySelector('.donut-seg.donut-usdc');
          if (donutEth && donutUsdc) {
            // ETH goes from 45% to 53%, USDC goes from 30% to 22%
            donutEth.setAttribute('stroke-dasharray', '233.1 439.8');
            donutEth.setAttribute('stroke-dashoffset', '109.9');
            donutUsdc.setAttribute('stroke-dasharray', '96.7 439.8');
            donutUsdc.setAttribute('stroke-dashoffset', '-123.2');
          }
          
          const legendItems = document.querySelectorAll('.donut-legend .legend-item span:last-child');
          if (legendItems.length >= 4) {
            legendItems[0].textContent = 'ETH (53%)';
            legendItems[1].textContent = 'USDC (22%)';
          }
        }

        renderTradeHistoryRows();
        renderPortfolioHoldingsRows(activeRisk);

        btnCopilotRebalanceExecute.textContent = 'Swap Executed';
        btnCopilotRebalanceExecute.className = 'btn btn-secondary block-btn';
      }, 1500);
    });
  }

  // ==========================================================================
  // Opportunity Explorer Section
  // ==========================================================================
  function renderOpportunitiesCards(filter = 'all', searchQuery = '') {
    if (!opportunitiesCardsContainer) return;
    opportunitiesCardsContainer.innerHTML = '';

    const cards = state.opportunities.filter(opp => {
      // Filter by tab type
      if (filter !== 'all') {
        if (filter === 'alpha' && opp.type !== 'yield') return false; // wait, let's look at icons/types
        if (filter === 'yield' && opp.id !== 'eth-staking' && opp.id !== 'usdc-arbitrage') return false;
        if (filter === 'momentum' && opp.type !== 'momentum') return false;
      }
      
      // Filter by search query
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
      card.setAttribute('data-id', opp.id);
      
      card.innerHTML = `
        <div class="opp-badge-row">
          <span class="opp-type-tag">${opp.type === 'yield' ? 'Yield Premium' : 'Momentum Flow'}</span>
          <span class="opp-risk-badge ${opp.riskClass}">${opp.risk}</span>
        </div>
        <div class="opp-main-info">
          <h4>${opp.name}</h4>
          <span>${opp.symbol}</span>
        </div>
        <p class="opp-reasoning-snippet">${opp.desc.substring(0, 115)}...</p>
        <div class="opp-metrics-bar">
          <div class="opp-metric-col">
            <span>Est. Return</span>
            <strong class="text-green">${opp.estReturn}</strong>
          </div>
          <div class="opp-metric-col">
            <span>Confidence</span>
            <strong class="text-gradient">${opp.confidence}</strong>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openOpportunityDetailDrawer(opp);
      });

      opportunitiesCardsContainer.appendChild(card);
    });
  }

  // Filter Tab Switching
  explorerFilterTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      explorerFilterTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      const searchQuery = explorerSearchInput ? explorerSearchInput.value : '';
      renderOpportunitiesCards(filter, searchQuery);
    });
  });

  // Search input bind
  if (explorerSearchInput) {
    explorerSearchInput.addEventListener('input', (e) => {
      const activeFilterBtn = document.querySelector('#explorer-filter-tabs button.active');
      const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
      renderOpportunitiesCards(filter, e.target.value);
    });
  }

  // Detail drawer opening
  function openOpportunityDetailDrawer(opp) {
    activeOpportunity = opp;
    if (!opportunityDetailDrawer) return;

    if (drawerTitle) drawerTitle.textContent = 'Opportunity Reasoning';
    if (drawerAssetName) drawerAssetName.textContent = opp.name;
    if (drawerAssetSymbol) drawerAssetSymbol.textContent = opp.symbol;
    if (drawerAssetIcon) drawerAssetIcon.textContent = opp.icon;
    if (drawerBadgeConf) drawerBadgeConf.textContent = `${opp.confidence} Confidence`;
    if (drawerReasoningText) drawerReasoningText.textContent = opp.desc;
    if (drawerStatReturn) drawerStatReturn.textContent = opp.estReturn;
    if (drawerStatRisk) drawerStatRisk.textContent = opp.risk;
    if (drawerStatAllocation) drawerStatAllocation.textContent = opp.allocation;
    if (drawerStatStance) drawerStatStance.textContent = opp.stance;

    // Reset button states
    if (btnDrawerDeploy) {
      btnDrawerDeploy.textContent = 'Confirm & Deploy Allocation';
      btnDrawerDeploy.disabled = false;
      btnDrawerDeploy.className = 'btn btn-primary btn-lg block-btn';
    }

    opportunityDetailDrawer.classList.add('open');
  }

  // Close drawer
  if (btnCloseDrawer) {
    btnCloseDrawer.addEventListener('click', () => {
      opportunityDetailDrawer.classList.remove('open');
    });
  }

  // Confirm Deploy button
  if (btnDrawerDeploy) {
    btnDrawerDeploy.addEventListener('click', () => {
      if (!activeOpportunity) return;

      const allocationPct = drawerAmountInput ? parseInt(drawerAmountInput.value) : 8;

      btnDrawerDeploy.disabled = true;
      btnDrawerDeploy.textContent = 'Deploying capital...';

      setTimeout(() => {
        // Log transaction in history
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const valueDeployed = (state.profile.capital * (allocationPct / 100)).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        
        state.trades.unshift({
          timestamp,
          type: 'Capital Deploy',
          asset: activeOpportunity.name,
          amount: `${allocationPct}% Allocation`,
          price: 'Market Clear',
          fee: '$12.40',
          status: 'Completed'
        });

        // Add System notification
        addSystemNotification(
          'Capital Deployment Active',
          `Deployed ${allocationPct}% capital reserves into ${activeOpportunity.name} strategy.`
        );

        renderTradeHistoryRows();
        
        btnDrawerDeploy.textContent = 'Allocation Deployed';
        btnDrawerDeploy.className = 'btn btn-secondary btn-lg block-btn';
        
        setTimeout(() => {
          opportunityDetailDrawer.classList.remove('open');
        }, 800);
      }, 1500);
    });
  }

  // ==========================================================================
  // Portfolio Holdings Rows Renderer
  // ==========================================================================
  function renderPortfolioHoldingsRows(riskLevel) {
    if (!portfolioHoldingsRows) return;
    portfolioHoldingsRows.innerHTML = '';

    const holdingsData = {
      0: [
        { name: 'Ethereum Staking Alpha', allocation: '25%', balance: '$31,145.60', entry: '$3,410.20', change: '+3.42%', positive: true },
        { name: 'Stablecoin Yield Basket', allocation: '55%', balance: '$68,520.32', entry: '$1.0001', change: '+0.12%', positive: true },
        { name: 'Bitcoin ETF Index', allocation: '10%', balance: '$12,458.24', entry: '$64,250.00', change: '-1.10%', positive: false },
        { name: 'USDC Cash Reserves', allocation: '10%', balance: '$12,458.24', entry: '$1.0000', change: '0.00%', positive: true }
      ],
      1: [
        { name: 'Ethereum Staking Alpha', allocation: '45%', balance: '$59,487.34', entry: '$3,450.40', change: '+2.15%', positive: true },
        { name: 'Stablecoin Yield Basket', allocation: '30%', balance: '$39,658.23', entry: '$1.0002', change: '+0.15%', positive: true },
        { name: 'Bitcoin ETF Index', allocation: '20%', balance: '$26,438.82', entry: '$64,120.10', change: '+1.40%', positive: true },
        { name: 'USDC Cash Reserves', allocation: '5%', balance: '$6,609.71', entry: '$1.0000', change: '0.00%', positive: true }
      ],
      2: [
        { name: 'Ethereum Staking Alpha', allocation: '55%', balance: '$82,184.19', entry: '$3,485.10', change: '+1.02%', positive: true },
        { name: 'Stablecoin Yield Basket', allocation: '10%', balance: '$14,942.58', entry: '$1.0000', change: '+0.05%', positive: true },
        { name: 'Bitcoin ETF Index', allocation: '30%', balance: '$44,827.74', entry: '$63,980.50', change: '+2.50%', positive: true },
        { name: 'USDC Cash Reserves', allocation: '5%', balance: '$7,471.29', entry: '$1.0000', change: '0.00%', positive: true }
      ]
    };

    const rows = holdingsData[riskLevel];
    rows.forEach(hold => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600; color:#fff;">${hold.name}</td>
        <td><strong>${hold.allocation}</strong></td>
        <td>${hold.balance}</td>
        <td>${hold.entry}</td>
        <td class="${hold.positive ? 'text-green' : 'text-error'}">${hold.change}</td>
      `;
      portfolioHoldingsRows.appendChild(tr);
    });
  }

  // ==========================================================================
  // Trade History Rows Renderer
  // ==========================================================================
  function renderTradeHistoryRows(searchQuery = '') {
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
      
      const badgeClass = t.status.toLowerCase(); // completed, hedged, active
      
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

  // History search input bind
  if (historySearchInput) {
    historySearchInput.addEventListener('input', (e) => {
      renderTradeHistoryRows(e.target.value);
    });
  }

  // ==========================================================================
  // Notifications Center Drawer System
  // ==========================================================================
  function renderNotificationsFeed() {
    if (!notifAlertsList) return;
    notifAlertsList.innerHTML = '';

    const unreads = state.notifications.filter(n => n.unread).length;
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
      if (n.unread) {
        item.style.borderColor = 'rgba(124,58,237,0.3)';
        item.style.background = 'rgba(124,58,237,0.02)';
      }

      item.innerHTML = `
        <h5>${n.title}</h5>
        <p>${n.desc}</p>
        <span class="notif-time">${n.time}</span>
        <button class="notif-dismiss" data-id="${n.id}">×</button>
      `;

      // Mark as read when hover or open
      if (n.unread) {
        item.addEventListener('mouseenter', () => {
          n.unread = false;
          renderNotificationsFeed();
        });
      }

      // Dismiss listener
      const dismissBtn = item.querySelector('.notif-dismiss');
      dismissBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissNotification(n.id);
      });

      notifAlertsList.appendChild(item);
    });

    // Sync with the dedicated Notifications view page
    renderPageNotificationsFeed();
  }

  function dismissNotification(id) {
    state.notifications = state.notifications.filter(n => n.id !== id);
    renderNotificationsFeed();
  }

  function addSystemNotification(title, desc) {
    state.notifications.unshift({
      id: Date.now(),
      title,
      desc,
      time: 'Just now',
      unread: true
    });
    renderNotificationsFeed();
  }

  // Toggle drawer listeners
  if (btnTriggerNotif) {
    btnTriggerNotif.addEventListener('click', () => {
      notifDrawer.classList.add('active');
      notifOverlay.classList.add('active');
      
      // Mark all as read when opening drawer
      state.notifications.forEach(n => n.unread = false);
      renderNotificationsFeed();
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

  // Clear all alerts
  if (btnClearAllNotifs) {
    btnClearAllNotifs.addEventListener('click', () => {
      state.notifications = [];
      renderNotificationsFeed();
    });
  }

  // ==========================================================================
  // Header Actions Binds
  // ==========================================================================
  // Manual scan button simulation
  if (btnHeaderManualScan) {
    btnHeaderManualScan.addEventListener('click', () => {
      btnHeaderManualScan.disabled = true;
      btnHeaderManualScan.textContent = 'Scanning...';
      
      const statusTxt = document.querySelector('.scanner-status-badge .status-txt');
      const dot = document.querySelector('.scanner-status-badge .status-pulse-dot');
      
      if (statusTxt) {
        statusTxt.textContent = 'COMPILING CORRELATION MATRICES';
        statusTxt.style.color = 'var(--accent-secondary)';
      }
      if (dot) dot.style.background = 'var(--accent-secondary)';

      setTimeout(() => {
        btnHeaderManualScan.disabled = false;
        btnHeaderManualScan.textContent = 'Scan Markets';
        
        if (statusTxt) {
          statusTxt.textContent = 'ARAIVEN SCANNING ACTIVE';
          statusTxt.style.color = 'var(--success)';
        }
        if (dot) dot.style.background = 'var(--success)';

        addSystemNotification(
          'Manual Ingest Scan Complete',
          'Araiven checked 150+ news streams, orderbooks, and liquidity arbitrage spreads. No exposure rebalances needed.'
        );
      }, 2000);
    });
  }

  // Execute directive in Dashboard
  if (btnDashExecuteDirective) {
    btnDashExecuteDirective.addEventListener('click', () => {
      btnDashExecuteDirective.disabled = true;
      btnDashExecuteDirective.textContent = 'Deploying Swap...';

      setTimeout(() => {
        // Log transaction in history
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        state.trades.unshift({
          timestamp,
          type: 'Dashboard Swap',
          asset: 'USDC to ETH Staking',
          amount: '8% reserves ($10,560)',
          price: 'Market Swap',
          fee: '$10.56',
          status: 'Completed'
        });

        // Add System notification
        addSystemNotification(
          'Swap Directive Executed',
          'Swapped 8% USDC reserves to ETH Staking Alpha opportunity successfully.'
        );

        // Update stats
        const activeRisk = state.profile.riskLevel;
        if (activeRisk === 1) {
          // Adjust allocation donut segs
          const donutEth = document.querySelector('.donut-seg.donut-eth');
          const donutUsdc = document.querySelector('.donut-seg.donut-usdc');
          if (donutEth && donutUsdc) {
            donutEth.setAttribute('stroke-dasharray', '233.1 439.8');
            donutEth.setAttribute('stroke-dashoffset', '109.9');
            donutUsdc.setAttribute('stroke-dasharray', '96.7 439.8');
            donutUsdc.setAttribute('stroke-dashoffset', '-123.2');
          }
          const legendItems = document.querySelectorAll('.donut-legend .legend-item span:last-child');
          if (legendItems.length >= 4) {
            legendItems[0].textContent = 'ETH (53%)';
            legendItems[1].textContent = 'USDC (22%)';
          }
        }

        renderTradeHistoryRows();
        renderPortfolioHoldingsRows(activeRisk);

        btnDashExecuteDirective.textContent = 'Directive Deployed';
        btnDashExecuteDirective.className = 'btn btn-secondary';
        
        // Hide recommended tag
        const recTag = document.querySelector('.active-directive-card .tag-alert-green');
        if (recTag) recTag.style.display = 'none';
      }, 1500);
    });
  }

  // ==========================================================================
  // Dashboard UI Initializer
  // ==========================================================================
  function initializeDashboardUI() {
    // Sync active metrics
    syncMainAppRiskState(state.profile.riskLevel);
    
    // Draw chart initially
    drawPortfolioChart('24h', state.profile.riskLevel);

    // Render Explorer cards
    renderOpportunitiesCards('all', '');

    // Render holdings rows
    renderPortfolioHoldingsRows(state.profile.riskLevel);

    // Render Trade ledger
    renderTradeHistoryRows();

    // Render notification list
    renderNotificationsFeed();
  }

  // Initialize Onboarding step views on load
  updateOnboardingStepsVisibility();

  // Resolve initial SaaS path routing
  resolveInitialRoute();

});
