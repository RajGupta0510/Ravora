document.addEventListener('DOMContentLoaded', () => {

  // 1. Navbar Scroll Transition
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      // Simple toggle animation of hamburger lines
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
      navLinks.classList.remove('active');
      const spans = mobileToggle.querySelectorAll('span');
      spans[0].style.transform = 'none';
      spans[1].style.opacity = '1';
      spans[2].style.transform = 'none';
    });
  });

  // 3. Pricing Toggle Logic
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
      
      // Update label highlight
      if (isYearly) {
        toggleLabels[0].classList.remove('active');
        toggleLabels[1].classList.add('active');
      } else {
        toggleLabels[0].classList.add('active');
        toggleLabels[1].classList.remove('active');
      }

      // Update pricing card text with smooth transition
      Object.keys(pricingCards).forEach(tier => {
        if (pricingCards[tier]) {
          // Fade out price
          pricingCards[tier].style.opacity = '0';
          setTimeout(() => {
            pricingCards[tier].textContent = isYearly ? prices[tier].yearly : prices[tier].monthly;
            pricingCards[tier].style.opacity = '1';
          }, 150);
        }
      });

      // Update period indicator labels
      periodLabels.forEach(label => {
        label.style.opacity = '0';
        setTimeout(() => {
          label.textContent = isYearly ? '/mo (billed annually)' : '/mo';
          label.style.opacity = '1';
        }, 150);
      });
    });
  }

  // 4. FAQ Accordion Logic
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(el => el.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 5. Watch Demo Modal Logic
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

    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });
  }

  // 6. Interactive Hero 3D Scene Simulation (Segmented Control)
  const heroSection = document.getElementById('hero-section');
  const segmentedControl = document.getElementById('risk-segmented-control');
  const segmentedBtns = document.querySelectorAll('.segmented-btn');
  const riskValueText = document.getElementById('risk-value-text');
  
  // 3D Scene components that will update
  const dashboardBalance = document.getElementById('dashboard-balance-val');
  const dashboardGrowth = document.getElementById('dashboard-growth-val');
  const chartPath = document.getElementById('chart-path');
  const chartGradPath = document.getElementById('chart-grad-path');
  const goalCircle = document.getElementById('goal-circle-fill');
  const goalText = document.getElementById('goal-percentage-val');
  
  const oppTitle = document.getElementById('opp-title-val');
  const oppDesc = document.getElementById('opp-desc-val');
  const oppConfidence = document.getElementById('opp-conf-val');
  const oppBtn = document.getElementById('opp-btn-action');

  // Simulated configurations for different risk profiles
  const riskProfiles = {
    0: {
      label: 'Conservative',
      balance: '$124,582.40',
      growth: '+$8,340.20 (+7.2%)',
      chartD: 'M 10 35 Q 55 32 105 25 T 190 20',
      chartGradD: 'M 10 35 Q 55 32 105 25 T 190 20 L 190 50 L 10 50 Z',
      goalOffset: '75', // 50%
      goalText: '50%',
      oppTitle: 'Treasury Yield Basket',
      oppDesc: 'Yield curve optimization identifying peak rates. Low risk smart contract staking.',
      oppConfidence: '99%',
      oppActionText: 'Allocate Yield'
    },
    1: {
      label: 'Moderate',
      balance: '$132,194.10',
      growth: '+$14,210.60 (+12.0%)',
      chartD: 'M 10 40 Q 45 20 105 30 T 190 12',
      chartGradD: 'M 10 40 Q 45 20 105 30 T 190 12 L 190 50 L 10 50 Z',
      goalOffset: '45', // 70%
      goalText: '70%',
      oppTitle: 'ETH Staking & Bluechip Allocation',
      oppDesc: 'Layer 1 accumulation signals detected. AI reallocation triggered for peak efficiency.',
      oppConfidence: '94%',
      oppActionText: 'Rebalance Portfolio'
    },
    2: {
      label: 'Aggressive',
      balance: '$149,425.80',
      growth: '+$31,520.10 (+26.7%)',
      chartD: 'M 10 45 Q 35 5 100 38 T 190 7',
      chartGradD: 'M 10 45 Q 35 5 100 38 T 190 7 L 190 50 L 10 50 Z',
      goalOffset: '15', // 90%
      goalText: '90%',
      oppTitle: 'AI Sentiment Basket Alpha',
      oppDesc: 'Social momentum & micro-cap institutional interest detected in top 15 utility tokens.',
      oppConfidence: '88%',
      oppActionText: 'Deploy Alpha Capital'
    }
  };

  function updateProfile(val) {
    const profile = riskProfiles[val];
    if (!profile) return;

    // 1. Update text label
    if (riskValueText) {
      riskValueText.textContent = profile.label;
    }
    
    // 2. Update dashboard/panel numbers
    if (dashboardBalance) dashboardBalance.textContent = profile.balance;
    if (dashboardGrowth) dashboardGrowth.textContent = profile.growth;

    // 3. Update Chart path & gradient path
    if (chartPath) chartPath.setAttribute('d', profile.chartD);
    if (chartGradPath) chartGradPath.setAttribute('d', profile.chartGradD);

    // 4. Update Goal Ring
    if (goalCircle) goalCircle.style.strokeDashoffset = profile.goalOffset;
    if (goalText) goalText.textContent = profile.goalText;

    // 5. Update Opportunity card
    if (oppTitle) oppTitle.textContent = profile.oppTitle;
    if (oppDesc) oppDesc.textContent = profile.oppDesc;
    if (oppConfidence) oppConfidence.textContent = profile.oppConfidence;
    if (oppBtn) oppBtn.textContent = profile.oppActionText;
  }

  if (segmentedControl) {
    segmentedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-value'));
        
        // Remove active class from all buttons
        segmentedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update hero section state class
        if (heroSection) {
          heroSection.classList.remove('state-conservative', 'state-balanced', 'state-aggressive');
          if (val === 0) {
            heroSection.classList.add('state-conservative');
          } else if (val === 1) {
            heroSection.classList.add('state-balanced');
          } else if (val === 2) {
            heroSection.classList.add('state-aggressive');
          }
        }
        
        // Trigger update with profile
        updateProfile(val);
      });
    });
  }

});
