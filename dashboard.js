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
    notifications: [],
    trades: [],
    opportunities: []
  };

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
    const token = localStorage.getItem('ravora_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(API_BASE + endpoint, {
      ...options,
      headers
    });
    if (response.status === 401) {
      localStorage.removeItem('ravora_token');
      showAuthOverlay();
      throw new Error('Session expired or unauthorized.');
    }
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
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
    if (appLayoutContainer) appLayoutContainer.style.display = 'flex';
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

  async function checkAuthState() {
    const token = localStorage.getItem('ravora_token');
    if (!token) {
      showAuthOverlay();
      return;
    }
    try {
      // Decode JWT for username greeting
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);
      updateUserWidget(payload.email || 'User');

      const data = await apiCall('/user/profile');
      if (data.onboardingCompleted) {
        state.onboardingCompleted = true;
        state.profile.experience = data.profile.experience_level;
        state.profile.capital = data.profile.capital;
        const riskLevels = { conservative: 0, balanced: 1, aggressive: 2 };
        state.profile.riskLevel = riskLevels[data.profile.risk_stance] ?? 1;
        state.profile.goal = data.profile.primary_goal;

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
        const response = await fetch(API_BASE + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Login failed.');
        }
        localStorage.setItem('ravora_token', data.token);
        await checkAuthState();
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
        const response = await fetch(API_BASE + '/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Registration failed.');
        }
        localStorage.setItem('ravora_token', data.token);
        await checkAuthState();
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
              goal: state.profile.goal
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
      drawPortfolioChart(activePeriod, state.profile.riskLevel);
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

  // ==========================================================================
  // Dynamic Bezier SVG Area Chart Drawing
  // ==========================================================================
  async function drawPortfolioChart(period, riskLevel) {
    if (!largeChartLine || !largeChartArea) return;
    
    activePeriod = period;
    let points = [];
    try {
      const data = await apiCall(`/portfolio/history?period=${period}`);
      points = data.points;
    } catch (e) {
      console.error('Error drawing chart:', e);
      return;
    }

    if (points.length === 0) return;

    const width = 800;
    const height = 280;
    const padding = 20;

    const minVal = Math.min(...points) * 0.998;
    const maxVal = Math.max(...points) * 1.002;
    const valRange = maxVal - minVal || 1;

    const stepX = (width - padding * 2) / (points.length - 1);
    const coords = points.map((val, idx) => {
      const x = padding + idx * stepX;
      const y = height - padding - ((val - minVal) / valRange) * (height - padding * 2);
      return { x, y };
    });

    let linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const cpX1 = coords[i].x + stepX / 2;
      const cpY1 = coords[i].y;
      const cpX2 = coords[i].x + stepX / 2;
      const cpY2 = coords[i + 1].y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${coords[i + 1].x} ${coords[i + 1].y}`;
    }

    const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;

    largeChartLine.setAttribute('d', linePath);
    largeChartArea.setAttribute('d', areaPath);
    
    const pointer = document.getElementById('large-chart-pointer');
    if (pointer) {
      pointer.setAttribute('cx', coords[coords.length - 1].x);
      pointer.setAttribute('cy', coords[coords.length - 1].y);
      pointer.style.display = 'block';
    }
  }

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

        apiCall('/notifications', {
          method: 'GET'
        }).then(() => {
          loadNotifications();
        });
      }, 2000);
    });
  }

  // ==========================================================================
  // Load UI Sub-Routines
  // ==========================================================================
  async function loadPortfolioData() {
    try {
      const data = await apiCall('/portfolio');
      state.profile.capital = data.currentBalance;
      
      if (dashBalance) dashBalance.textContent = `$${data.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    await drawPortfolioChart('24h', state.profile.riskLevel);
    await loadOpportunities();
    await loadRecommendations();
    await loadTradeHistory();
    await loadNotifications();
  }

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
