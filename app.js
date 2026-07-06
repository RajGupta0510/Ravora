document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Navbar Scroll Transition
  // ==========================================================================
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ==========================================================================
  // 2. Mobile Menu Toggle
  // ==========================================================================
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const spans = mobileToggle.querySelectorAll('span');
      if (navLinks.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  // Close mobile nav when link is clicked
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks) navLinks.classList.remove('active');
      if (mobileToggle) {
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  });

  // ==========================================================================
  // 3. Pricing Toggle Logic
  // ==========================================================================
  const pricingSwitch = document.querySelector('.pricing-switch');
  const toggleLabels = document.querySelectorAll('.toggle-label');
  const prices = {
    free: { monthly: '$0', yearly: '$0' },
    pro: { monthly: '$29', yearly: '$19' },
    premium: { monthly: '$99', yearly: '$69' }
  };
  
  const pricingCards = {
    free: document.querySelector('.pricing-card:nth-child(1) .pricing-price-val'),
    pro: document.querySelector('.pricing-card:nth-child(2) .pricing-price-val'),
    premium: document.querySelector('.pricing-card:nth-child(3) .pricing-price-val')
  };

  const periodLabels = document.querySelectorAll('.pricing-period');

  if (pricingSwitch) {
    pricingSwitch.addEventListener('click', () => {
      pricingSwitch.classList.toggle('yearly');
      const isYearly = pricingSwitch.classList.contains('yearly');
      
      if (isYearly) {
        if (toggleLabels[0]) toggleLabels[0].classList.remove('active');
        if (toggleLabels[1]) toggleLabels[1].classList.add('active');
      } else {
        if (toggleLabels[0]) toggleLabels[0].classList.add('active');
        if (toggleLabels[1]) toggleLabels[1].classList.remove('active');
      }

      Object.keys(pricingCards).forEach(tier => {
        if (pricingCards[tier]) {
          pricingCards[tier].style.opacity = '0';
          setTimeout(() => {
            pricingCards[tier].textContent = isYearly ? prices[tier].yearly : prices[tier].monthly;
            pricingCards[tier].style.opacity = '1';
          }, 150);
        }
      });

      periodLabels.forEach(label => {
        label.style.opacity = '0';
        setTimeout(() => {
          label.textContent = isYearly ? '/mo (billed annually)' : '/mo';
          label.style.opacity = '1';
        }, 150);
      });
    });
  }

  // ==========================================================================
  // 4. Watch Demo Modal Logic
  // ==========================================================================
  const watchDemoBtns = document.querySelectorAll('.btn-watch-demo');
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose = document.querySelector('.modal-close');

  if (watchDemoBtns && modalOverlay) {
    watchDemoBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.classList.add('active');
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
      });
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 5. Interactive Risk Profile Sync (Hero Controls & Portfolio Intelligence)
  // ==========================================================================
  const heroSection = document.getElementById('hero-section');
  const segmentedControl = document.getElementById('risk-segmented-control');
  const segmentedBtns = document.querySelectorAll('.segmented-btn');
  const riskValueText = document.getElementById('risk-value-text');
  
  // 3D Scene components that will update
  const dashboardBalance = document.getElementById('dashboard-balance-val');
  const dashboardGrowth = document.getElementById('dashboard-growth-val');
  const chartPath = document.getElementById('chart-path');
  const chartGradPath = document.getElementById('chart-grad-path');
  const chartPointerDot = document.getElementById('chart-pointer-dot');
  const goalCircle = document.getElementById('goal-circle-fill');
  const goalText = document.getElementById('goal-percentage-val');
  
  // Portfolio Intelligence Elements
  const portHealthVal = document.getElementById('dashboard-health-val');
  const portHealthGauge = document.getElementById('health-gauge-fill');
  const portRiskVal = document.getElementById('dashboard-risk-index');
  const portRiskBar = document.getElementById('risk-bar-indicator');

  const riskProfiles = {
    0: {
      label: 'Conservative',
      balance: '$124,582.40',
      growth: '+$8,340.20 (+7.2%)',
      chartD: 'M 10 35 Q 55 32 105 25 T 190 20',
      chartGradD: 'M 10 35 Q 55 32 105 25 T 190 20 L 190 50 L 10 50 Z',
      chartPointerY: 20,
      goalOffset: '75', // 50%
      goalText: '50%',
      healthText: '98%',
      healthOffset: '2.5', // high compatibility stroke offset
      riskText: '18/100',
      riskBarPct: '18%',
      divETH: '25%',
      divUSDC: '55%',
      divBTC: '10%',
      divCash: '10%'
    },
    1: {
      label: 'Moderate',
      balance: '$132,194.10',
      growth: '+$14,210.60 (+12.0%)',
      chartD: 'M 10 40 Q 45 20 105 30 T 190 12',
      chartGradD: 'M 10 40 Q 45 20 105 30 T 190 12 L 190 50 L 10 50 Z',
      chartPointerY: 12,
      goalOffset: '45', // 70%
      goalText: '70%',
      healthText: '96%',
      healthOffset: '5',
      riskText: '42/100',
      riskBarPct: '42%',
      divETH: '45%',
      divUSDC: '30%',
      divBTC: '20%',
      divCash: '5%'
    },
    2: {
      label: 'Aggressive',
      balance: '$149,425.80',
      growth: '+$31,520.10 (+26.7%)',
      chartD: 'M 10 45 Q 35 5 100 38 T 190 7',
      chartGradD: 'M 10 45 Q 35 5 100 38 T 190 7 L 190 50 L 10 50 Z',
      chartPointerY: 7,
      goalOffset: '15', // 90%
      goalText: '90%',
      healthText: '91%',
      healthOffset: '11',
      riskText: '78/100',
      riskBarPct: '78%',
      divETH: '55%',
      divUSDC: '10%',
      divBTC: '30%',
      divCash: '5%'
    }
  };

  function updateRiskState(val) {
    const profile = riskProfiles[val];
    if (!profile) return;

    // 1. Text displays
    if (riskValueText) riskValueText.textContent = profile.label;
    if (dashboardBalance) dashboardBalance.textContent = profile.balance;
    if (dashboardGrowth) dashboardGrowth.textContent = profile.growth;

    // Update Foreground Risk Guard Panel
    const riskGuardVal = document.getElementById('dashboard-risk-guard-val');
    if (riskGuardVal) {
      if (val === 0) {
        riskGuardVal.textContent = 'Conservative Shield';
        riskGuardVal.style.color = '#3b82f6';
      } else if (val === 1) {
        riskGuardVal.textContent = 'Balanced Shield';
        riskGuardVal.style.color = '#10b981';
      } else if (val === 2) {
        riskGuardVal.textContent = 'Aggressive Buffer';
        riskGuardVal.style.color = '#f59e0b';
      }
    }

    // 2. Mini chart path mutations
    if (chartPath) chartPath.setAttribute('d', profile.chartD);
    if (chartGradPath) chartGradPath.setAttribute('d', profile.chartGradD);
    if (chartPointerDot) chartPointerDot.setAttribute('cy', profile.chartPointerY);

    // 3. Goal Ring updates
    if (goalCircle) goalCircle.style.strokeDashoffset = profile.goalOffset;
    if (goalText) goalText.textContent = profile.goalText;

    // 4. Portfolio intelligence dashboard updates
    if (portHealthVal) portHealthVal.textContent = profile.healthText;
    if (portHealthGauge) portHealthGauge.style.strokeDashoffset = profile.healthOffset;
    if (portRiskVal) portRiskVal.textContent = profile.riskText;
    if (portRiskBar) portRiskBar.style.width = profile.riskBarPct;

    // 5. Update diversification bar widths
    const divBars = document.querySelectorAll('.diversification-bars .div-row');
    if (divBars.length >= 4) {
      divBars[0].querySelector('.div-bar-fill').style.width = profile.divETH;
      divBars[0].querySelector('.div-pct').textContent = profile.divETH;

      divBars[1].querySelector('.div-bar-fill').style.width = profile.divUSDC;
      divBars[1].querySelector('.div-pct').textContent = profile.divUSDC;

      divBars[2].querySelector('.div-bar-fill').style.width = profile.divBTC;
      divBars[2].querySelector('.div-pct').textContent = profile.divBTC;

      divBars[3].querySelector('.div-bar-fill').style.width = profile.divCash;
      divBars[3].querySelector('.div-pct').textContent = profile.divCash;
    }
  }

  if (segmentedControl) {
    segmentedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-value'));
        segmentedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (heroSection) {
          heroSection.classList.remove('state-conservative', 'state-balanced', 'state-aggressive');
          if (val === 0) heroSection.classList.add('state-conservative');
          else if (val === 1) heroSection.classList.add('state-balanced');
          else if (val === 2) heroSection.classList.add('state-aggressive');
        }
        updateRiskState(val);
      });
    });
  }

  // ==========================================================================
  // 6. 3D Mouse Parallax & Smooth Lerp Tilt Effect
  // ==========================================================================
  const container3D = document.getElementById('hero-3d-container');
  const scene3D = document.querySelector('.scene-3d');
  
  if (container3D && scene3D) {
    let targetRotX = 15;
    let targetRotY = -10;
    let currentRotX = 15;
    let currentRotY = -10;
    
    container3D.addEventListener('mousemove', (e) => {
      const rect = container3D.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      targetRotX = 15 - y * 25;
      targetRotY = -10 + x * 25;
      
      container3D.style.setProperty('--mouse-x', x * 2);
      container3D.style.setProperty('--mouse-y', y * 2);
    });

    container3D.addEventListener('mouseleave', () => {
      targetRotX = 15;
      targetRotY = -10;
      container3D.style.setProperty('--mouse-x', 0);
      container3D.style.setProperty('--mouse-y', 0);
    });

    function smoothParallax() {
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      scene3D.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
      requestAnimationFrame(smoothParallax);
    }
    smoothParallax();
  }

  // ==========================================================================
  // 7. How Araiven Thinks — Sequential Pipeline Loop
  // ==========================================================================
  const pipelineSteps = document.querySelectorAll('.pipeline-steps .pipeline-step');
  const pipelineProgress = document.getElementById('pipeline-progress');
  let currentThinkStep = 1;

  if (pipelineSteps.length > 0 && pipelineProgress) {
    setInterval(() => {
      // Deactivate all steps
      pipelineSteps.forEach(step => step.classList.remove('active'));
      
      // Update step index
      currentThinkStep = currentThinkStep < 6 ? currentThinkStep + 1 : 1;
      
      // Activate next step
      const activeStep = document.getElementById(`think-step-${currentThinkStep}`);
      if (activeStep) activeStep.classList.add('active');

      // Update line progress (100% width is mapped across 6 stages)
      const progressWidths = [0, 0, 20, 40, 60, 80, 100];
      pipelineProgress.style.width = `${progressWidths[currentThinkStep]}%`;
    }, 4000);
  }

  // ==========================================================================
  // 8. Fed Announcement Scenario Simulator
  // ==========================================================================
  const triggerSimBtn = document.getElementById('btn-trigger-simulation');
  const simStatus = document.getElementById('sim-status-text');
  const timelineItems = document.querySelectorAll('.timeline-wrapper .timeline-item');
  const timelineProgressBar = document.getElementById('timeline-progress-bar');
  let simTimeoutIds = [];

  if (triggerSimBtn) {
    triggerSimBtn.addEventListener('click', () => {
      // Clear any running simulations
      simTimeoutIds.forEach(id => clearTimeout(id));
      simTimeoutIds = [];
      timelineItems.forEach(item => item.classList.remove('active'));
      if (timelineProgressBar) timelineProgressBar.style.height = '0%';

      triggerSimBtn.disabled = true;
      triggerSimBtn.textContent = 'Simulating event...';
      if (simStatus) {
        simStatus.textContent = 'Event injected. Analyzing CPI volatility...';
        simStatus.style.color = 'var(--accent-secondary)';
      }

      // Step 1: Detect Event (0.5s)
      let id1 = setTimeout(() => {
        const step = document.getElementById('time-step-1');
        if (step) step.classList.add('active');
        if (timelineProgressBar) timelineProgressBar.style.height = '0%';
        if (simStatus) simStatus.textContent = 'Federal Reserve interest rate announcement intercepted.';
      }, 500);
      simTimeoutIds.push(id1);

      // Step 2: Correlate Impact (2s)
      let id2 = setTimeout(() => {
        const step = document.getElementById('time-step-2');
        if (step) step.classList.add('active');
        if (timelineProgressBar) timelineProgressBar.style.height = '25%';
        if (simStatus) simStatus.textContent = 'Liquidity shifts analyzed. Stablecoin inflows increasing.';
      }, 2000);
      simTimeoutIds.push(id2);

      // Step 3: Recalculate Risk (3.5s)
      let id3 = setTimeout(() => {
        const step = document.getElementById('time-step-3');
        if (step) step.classList.add('active');
        if (timelineProgressBar) timelineProgressBar.style.height = '50%';
        if (simStatus) simStatus.textContent = 'Hedge parameters updated. Exposure limits buffered.';
      }, 3500);
      simTimeoutIds.push(id3);

      // Step 4: Find Opportunity (5s)
      let id4 = setTimeout(() => {
        const step = document.getElementById('time-step-4');
        if (step) step.classList.add('active');
        if (timelineProgressBar) timelineProgressBar.style.height = '75%';
        if (simStatus) simStatus.textContent = 'Opportunity detected on Ethereum pools.';
      }, 5000);
      simTimeoutIds.push(id4);

      // Step 5: Pushed Recommendation (6.5s)
      let id5 = setTimeout(() => {
        const step = document.getElementById('time-step-5');
        if (step) step.classList.add('active');
        if (timelineProgressBar) timelineProgressBar.style.height = '100%';
        if (simStatus) {
          simStatus.textContent = 'Araiven pushed recommendation to the active copilot layer.';
          simStatus.style.color = 'var(--success)';
        }
        triggerSimBtn.disabled = false;
        triggerSimBtn.textContent = 'Re-run Simulation';
      }, 6500);
      simTimeoutIds.push(id5);
    });
  }

  // ==========================================================================
  // 9. Opportunity Engine Asset Tab Controls
  // ==========================================================================
  const assetTabs = document.querySelectorAll('.asset-tabs .asset-tab');
  
  const oppName = document.getElementById('opp-display-name');
  const oppSymbol = document.getElementById('opp-display-symbol');
  const oppIcon = document.getElementById('opp-display-icon');
  const oppReasoning = document.getElementById('opp-display-reasoning');
  const oppConfidence = document.getElementById('opp-display-confidence');
  const oppCircleFill = document.getElementById('opp-circle-fill');
  const oppReturn = document.getElementById('opp-display-return');
  const oppRisk = document.getElementById('opp-display-risk');
  const oppStrategy = document.getElementById('opp-display-strategy');
  const oppBtnExecute = document.getElementById('opp-btn-execute');

  const opportunityData = {
    eth: {
      name: 'Ethereum Staking Alpha',
      symbol: 'ETH / USD',
      icon: 'Ξ',
      reasoning: 'Validator queue consolidation and post-upgrade staking patterns show major support. Accumulation layers at $3,450 indicate institutional backing with minimal downside risk.',
      confidence: '89%',
      strokeOffset: '27.6', // 251 * (1 - 0.89)
      strokeColor: '#10b981',
      return: '8.0% - 12.0%',
      risk: 'Low',
      riskClass: 'text-green',
      strategy: 'Staking / Delta Neutral',
      btnText: 'Deploy ETH Allocation'
    },
    btc: {
      name: 'Bitcoin Halving Inflow',
      symbol: 'BTC / USD',
      icon: '₿',
      reasoning: 'Araiven detected high institutional inflows via spot ETFs coinciding with long-term hodler lockups. Strong orderbook support at $64,000 indicates dynamic momentum.',
      confidence: '94%',
      strokeOffset: '15.0', // 251 * (1 - 0.94)
      strokeColor: '#7c3aed',
      return: '15.0% - 22.0%',
      risk: 'Medium',
      riskClass: 'text-purple',
      strategy: 'Spot Inflow Accumulation',
      btnText: 'Accumulate BTC Alpha'
    },
    yield: {
      name: 'Stablecoin Volatility Hedge',
      symbol: 'USDC / USDT / DAI',
      icon: '$',
      reasoning: 'Following Fed volatility, lending pool rates on Aave and Uniswap spiked. Araiven recommends capturing arbitrage spreads by rotating low-yield reserves into our optimized Stablecoin Basket.',
      confidence: '91%',
      strokeOffset: '22.5', // 251 * (1 - 0.91)
      strokeColor: '#3b82f6',
      return: '6.5% - 9.2%',
      risk: 'Low',
      riskClass: 'text-green',
      strategy: 'Lending Arbitrage Spreads',
      btnText: 'Deploy Hedged Capital'
    }
  };

  assetTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const assetKey = tab.getAttribute('data-asset');
      const data = opportunityData[assetKey];
      if (!data) return;

      assetTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update Card Info
      if (oppName) oppName.textContent = data.name;
      if (oppSymbol) oppSymbol.textContent = data.symbol;
      if (oppIcon) oppIcon.textContent = data.icon;
      if (oppReasoning) oppReasoning.textContent = data.reasoning;
      if (oppConfidence) oppConfidence.textContent = data.confidence;
      if (oppReturn) oppReturn.textContent = data.return;
      
      if (oppRisk) {
        oppRisk.textContent = data.risk;
        oppRisk.className = `stat-value ${data.riskClass}`;
      }
      if (oppStrategy) oppStrategy.textContent = data.strategy;
      if (oppBtnExecute) oppBtnExecute.textContent = data.btnText;

      // Update Gauge SVG Circle
      if (oppCircleFill) {
        oppCircleFill.style.strokeDashoffset = data.strokeOffset;
        oppCircleFill.style.stroke = data.strokeColor;
      }
    });
  });

  // ==========================================================================
  // 10. AI Wealth Copilot — Preset Conversations
  // ==========================================================================
  const chatMessages = document.getElementById('chat-messages-container');
  const chatSuggestBtns = document.querySelectorAll('.chat-suggest-btn');

  const chatAnswers = {
    'eth-exposure': {
      userText: 'Should I increase exposure to Ethereum?',
      copilotText: 'Based on current validator staking metrics and macro correlation matrices, Araiven suggests increasing ETH exposure by **4.0%**. Inflows have stabilized at support lines, offering an asymmetric risk-adjusted staking yield yield.',
      stats: 'Confidence: 89% | Risk Profile: Low Exposure Boost',
      actionHtml: '<div class="copilot-action-row"><button class="copilot-btn-action">Approve 4% Swap</button><button class="copilot-btn-secondary">View Strategy Audit</button></div>'
    },
    'risk-model': {
      userText: 'What is my current risk model setting?',
      copilotText: 'You are currently running the **Balanced** copilot profile. Under this model, Araiven caps total volatile asset allocation at 65% and implements automated stablecoin lending hedges when daily drawdowns exceed 3.5%.',
      stats: 'Health: 96% | Risk Exposure: 42/100',
      actionHtml: '<div class="copilot-action-row"><button class="copilot-btn-action">Modify Risk Limits</button><button class="copilot-btn-secondary">Show Risk Formulas</button></div>'
    },
    'macro-scans': {
      userText: 'What global events is Araiven monitoring?',
      copilotText: 'Araiven is tracking **3 primary inputs**: 1. US FOMC Meeting interest rate statements (18 hours), 2. Dex liquidity shifts on decentralized stable pools, and 3. Dollar Index (DXY) momentum cycles. Exposure limits remain dynamically buffered.',
      stats: 'Global Feeds Active: 14 | Safety Index: Buffered',
      actionHtml: '<div class="copilot-action-row"><button class="copilot-btn-action">Expand Event Feed</button></div>'
    }
  };

  chatSuggestBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const qKey = btn.getAttribute('data-question');
      const data = chatAnswers[qKey];
      if (!data || !chatMessages) return;

      // Disable buttons temporarily
      chatSuggestBtns.forEach(b => b.disabled = true);

      // Append User message
      const userBubble = document.createElement('div');
      userBubble.className = 'msg-bubble user';
      userBubble.innerHTML = `<p>${data.userText}</p>`;
      chatMessages.appendChild(userBubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Typing simulation
      const typingBubble = document.createElement('div');
      typingBubble.className = 'msg-bubble copilot typing';
      typingBubble.innerHTML = `<p>Araiven is computing...</p>`;
      setTimeout(() => {
        chatMessages.appendChild(typingBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 500);

      // Append Araiven Answer (after 2s)
      setTimeout(() => {
        typingBubble.remove();
        
        const copilotBubble = document.createElement('div');
        copilotBubble.className = 'msg-bubble copilot';
        copilotBubble.innerHTML = `
          <p>${data.copilotText}</p>
          <div style="font-family: monospace; font-size: 0.7rem; color: var(--accent-secondary); margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.06); padding-top: 8px;">
            ${data.stats}
          </div>
          ${data.actionHtml}
        `;
        chatMessages.appendChild(copilotBubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Re-enable suggestions
        chatSuggestBtns.forEach(b => b.disabled = false);
      }, 2000);
    });
  });

  // ==========================================================================
  // 11. Headline Variation Rotation & Manual Pagination
  // ==========================================================================
  const headlines = [
    "Grow Wealth Without Learning Trading.",
    "Stop Learning Charts. Start Building Wealth.",
    "Trading Is Hard. Araiven Makes It Simple.",
    "Let Intelligence Trade. Not Emotions.",
    "The Future Of Trading Doesn't Require Traders."
  ];

  const headlineEl = document.getElementById('hero-headline');
  const pagDots = document.querySelectorAll('#headline-pagination .pag-dot');
  let currentHeadlineIndex = 0;
  let headlineTimer = null;

  function switchHeadline(index) {
    if (!headlineEl || index === currentHeadlineIndex) return;

    // 1. Fade out current text
    headlineEl.classList.add('fade-out');

    setTimeout(() => {
      // 2. Change text content
      headlineEl.textContent = headlines[index];
      
      // 3. Update pagination dots active state
      pagDots.forEach((dot, idx) => {
        if (idx === index) dot.classList.add('active');
        else dot.classList.remove('active');
      });

      // 4. Fade in new text
      headlineEl.classList.remove('fade-out');
      headlineEl.classList.add('fade-in');

      // Clear fade-in class after animation finishes
      setTimeout(() => {
        headlineEl.classList.remove('fade-in');
      }, 300);

      currentHeadlineIndex = index;
    }, 300);
  }

  function startHeadlineRotation() {
    headlineTimer = setInterval(() => {
      const nextIndex = (currentHeadlineIndex + 1) % headlines.length;
      switchHeadline(nextIndex);
    }, 5000);
  }

  function resetHeadlineRotation() {
    if (headlineTimer) {
      clearInterval(headlineTimer);
      startHeadlineRotation();
    }
  }

  // Bind pagination dots to manual switcher
  if (pagDots.length > 0) {
    pagDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        switchHeadline(index);
        resetHeadlineRotation(); // Reset rotation timer on manual click
      });
    });
  }

  // Start the automatic rotation
  startHeadlineRotation();

  // ==========================================================================
  // 12. Section 3 Console Parallax & Graph Hover Micro-interactions
  // ==========================================================================
  const visualConsole = document.getElementById('visual-console-widget');
  
  if (visualConsole) {
    let targetX = 5;
    let targetY = -8;
    let currX = 5;
    let currY = -8;

    visualConsole.addEventListener('mousemove', (e) => {
      const rect = visualConsole.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      // Dynamic tilt offsets
      targetX = 5 - y * 20;
      targetY = -8 + x * 20;
    });

    visualConsole.addEventListener('mouseleave', () => {
      targetX = 5;
      targetY = -8;
    });

    function smoothConsoleParallax() {
      currX += (targetX - currX) * 0.1;
      currY += (targetY - currY) * 0.1;
      visualConsole.style.transform = `rotateX(${currX}deg) rotateY(${currY}deg)`;
      requestAnimationFrame(smoothConsoleParallax);
    }
    smoothConsoleParallax();
  }

  // Graph cols hover details update
  const barCols = document.querySelectorAll('.console-graph .bar-col');
  const metricIngest = document.getElementById('console-metric-ingest');
  const metricCorrelation = document.getElementById('console-metric-correlation');

  if (barCols.length > 0 && metricIngest && metricCorrelation) {
    barCols.forEach(col => {
      col.addEventListener('mouseenter', () => {
        const metric = col.getAttribute('data-metric');
        const val = col.getAttribute('data-val');
        
        if (metric === 'ingest') {
          metricIngest.textContent = val;
          metricIngest.classList.remove('text-gradient');
          metricIngest.style.color = 'var(--accent-secondary)';
        } else if (metric === 'correlation') {
          metricCorrelation.textContent = val;
          metricCorrelation.classList.remove('text-gradient');
          metricCorrelation.style.color = 'var(--accent-secondary)';
        }
      });

      col.addEventListener('mouseleave', () => {
        // Restore default metrics
        metricIngest.textContent = '24,410 feeds/sec';
        metricIngest.classList.add('text-gradient');
        metricIngest.style.color = '';
        metricCorrelation.textContent = '99.8% Active';
        metricCorrelation.classList.add('text-gradient');
        metricCorrelation.style.color = '';
      });
    });
  }

  // ==========================================================================
  // 6. Looping Product Workspace Simulation (Hero Showcase Animation)
  // ==========================================================================
  const workspaceContainer = document.getElementById('hero-workspace-animation');
  if (workspaceContainer) {
    const states = [
      'state-scanning',
      'state-scanner-active',
      'state-chart-drawn',
      'state-plan-active',
      'state-deployed'
    ];
    let currentStateIndex = 0;

    function nextState() {
      if (!workspaceContainer) return;
      states.forEach(state => workspaceContainer.classList.remove(state));
      currentStateIndex = (currentStateIndex + 1) % states.length;
      workspaceContainer.classList.add(states[currentStateIndex]);
      
      let delay = 3000;
      if (states[currentStateIndex] === 'state-scanning') {
        delay = 2500;
      } else if (states[currentStateIndex] === 'state-scanner-active') {
        delay = 2000;
      } else if (states[currentStateIndex] === 'state-chart-drawn') {
        delay = 3000;
      } else if (states[currentStateIndex] === 'state-plan-active') {
        delay = 3500;
      } else if (states[currentStateIndex] === 'state-deployed') {
        delay = 2500;
      }
      
      setTimeout(nextState, delay);
    }
    
    workspaceContainer.classList.add(states[0]);
    setTimeout(nextState, 2500);
  }

});
