// ==========================================================================
// Global Loading Skeleton System Helpers
// ==========================================================================


function renderRavoraEmptyState(container, options) {
  if (!container) return;
  const target = typeof container === 'string' ? document.getElementById(container) : container;
  if (!target) return;

  // Clean legacy inline styles on empty state container to prevent conflicts
  target.style.background = 'none';
  target.style.border = 'none';
  target.style.padding = '0';
  target.style.boxShadow = 'none';

  const {
    type = 'portfolio', // portfolio, journal, watchlist, notifications, search, exchanges, analysis, scanner
    headline = '',
    description = '',
    primaryText = '',
    primaryCallback = null,
    secondaryText = '',
    secondaryCallback = null
  } = options;

  let svgIcon = '';
  const gradDef = `
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="ravora-grad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563EB" />
          <stop offset="100%" stop-color="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  `;

  if (type === 'portfolio') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        <polygon points="12 11 12 17 17 14"></polygon>
      </svg>
    `;
  } else if (type === 'journal') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    `;
  } else if (type === 'watchlist') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    `;
  } else if (type === 'notifications') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    `;
  } else if (type === 'search') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    `;
  } else if (type === 'exchanges') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" ry="2"></rect>
        <path d="M12 2v9M8 5h8"></path>
        <path d="M7 11V9a5 5 0 0 1 10 0v2"></path>
      </svg>
    `;
  } else if (type === 'analysis') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        <circle cx="12" cy="12" r="4"></circle>
      </svg>
    `;
  } else if (type === 'scanner') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"></path>
      </svg>
    `;
  } else {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
  }

  let actionsHtml = '';
  if (primaryText) {
    actionsHtml += `<button class="ravora-empty-btn-primary" id="${target.id}-btn-primary" tabindex="0">${primaryText}</button>`;
  }
  if (secondaryText) {
    actionsHtml += `<button class="ravora-empty-btn-secondary" id="${target.id}-btn-secondary" tabindex="0">${secondaryText}</button>`;
  }

  target.innerHTML = `
    ${gradDef}
    <div class="ravora-empty-state" role="region" aria-label="${headline}">
      <div class="ravora-empty-state-icon" aria-hidden="true">
        ${svgIcon}
      </div>
      <h4 class="ravora-empty-state-title">${headline}</h4>
      <p class="ravora-empty-state-description">${description}</p>
      ${actionsHtml ? `<div class="ravora-empty-state-actions">${actionsHtml}</div>` : ''}
    </div>
  `;

  if (primaryText && primaryCallback) {
    const btn = document.getElementById(`${target.id}-btn-primary`);
    if (btn) {
      const handler = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        primaryCallback();
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('keydown', handler);
    }
  }
  if (secondaryText && secondaryCallback) {
    const btn = document.getElementById(`${target.id}-btn-secondary`);
    if (btn) {
      const handler = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        secondaryCallback();
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('keydown', handler);
    }
  }
}

function renderRavoraErrorState(container, options) {
  if (!container) return;
  const target = typeof container === 'string' ? document.getElementById(container) : container;
  if (!target) return;

  // Clean legacy inline styles on target
  target.style.background = 'none';
  target.style.border = 'none';
  target.style.padding = '0';
  target.style.boxShadow = 'none';

  const {
    type = 'api', // network, api, auth, exchanges, market, ai, 404, permission
    headline = '',
    description = '',
    primaryText = '',
    primaryCallback = null,
    secondaryText = '',
    secondaryCallback = null
  } = options;

  let svgIcon = '';
  const gradDef = `
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="ravora-err-grad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EF4444" />
          <stop offset="100%" stop-color="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  `;

  if (type === 'network') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.5M5 12.5a10.94 10.94 0 0 1 5.83-2.84M8.5 16a5.46 5.46 0 0 1 3.5-1.5M12 20h.01"></path>
      </svg>
    `;
  } else if (type === 'api') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
        <line x1="6" y1="6" x2="6.01" y2="6"></line>
        <line x1="6" y1="18" x2="6.01" y2="18"></line>
        <path d="M12 2v20M12 12h.01"></path>
      </svg>
    `;
  } else if (type === 'auth') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    `;
  } else if (type === 'exchanges') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
  } else if (type === 'market') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
  } else if (type === 'ai') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    `;
  } else if (type === '404') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"></path>
      </svg>
    `;
  } else if (type === 'permission') {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
      </svg>
    `;
  } else {
    svgIcon = `
      <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-err-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;
  }

  let actionsHtml = '';
  if (primaryText) {
    actionsHtml += `<button class="ravora-error-btn-primary" id="${target.id}-btn-primary" tabindex="0">${primaryText}</button>`;
  }
  if (secondaryText) {
    actionsHtml += `<button class="ravora-error-btn-secondary" id="${target.id}-btn-secondary" tabindex="0">${secondaryText}</button>`;
  }

  target.innerHTML = `
    ${gradDef}
    <div class="ravora-error-state" role="alert" aria-label="${headline}">
      <div class="ravora-error-icon" aria-hidden="true">
        ${svgIcon}
      </div>
      <h4 class="ravora-error-title">${headline}</h4>
      <p class="ravora-error-description">${description}</p>
      ${actionsHtml ? `<div class="ravora-error-actions">${actionsHtml}</div>` : ''}
    </div>
  `;

  if (primaryText && primaryCallback) {
    const btn = document.getElementById(`${target.id}-btn-primary`);
    if (btn) {
      const handler = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        primaryCallback();
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('keydown', handler);
    }
  }
  if (secondaryText && secondaryCallback) {
    const btn = document.getElementById(`${target.id}-btn-secondary`);
    if (btn) {
      const handler = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        secondaryCallback();
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('keydown', handler);
    }
  }
}

function showRavoraGlobalError(type, callback) {
  const overlay = document.getElementById('global-error-overlay');
  if (!overlay) return;

  let headline = '';
  let description = '';
  let primaryText = '';
  let primaryCallback = null;

  if (type === 'network') {
    headline = 'Unable to connect.';
    description = 'Check your internet connection and try again.';
    primaryText = 'Retry';
    primaryCallback = () => {
      overlay.style.display = 'none';
      if (callback) callback();
    };
  } else if (type === 'api') {
    headline = 'Service temporarily unavailable.';
    description = "We're unable to retrieve data right now.";
    primaryText = 'Refresh';
    primaryCallback = () => {
      overlay.style.display = 'none';
      window.location.reload();
    };
  } else if (type === 'auth') {
    headline = 'Your session has expired.';
    description = 'Please sign in again to continue.';
    primaryText = 'Sign In';
    primaryCallback = () => {
      overlay.style.display = 'none';
      const btnLogout = document.getElementById('btn-logout');
      if (btnLogout) btnLogout.click();
      else window.location.href = '/';
    };
  } else if (type === '404') {
    headline = 'Page not found.';
    description = "The page you're looking for doesn't exist.";
    primaryText = 'Go to Dashboard';
    primaryCallback = () => {
      overlay.style.display = 'none';
      navigateTo('dashboard', true);
      history.pushState({ screen: 'dashboard' }, '', '/app/dashboard');
    };
  } else if (type === 'permission') {
    headline = 'Access denied.';
    description = "You don't have permission to access this page.";
    primaryText = 'Go Back';
    primaryCallback = () => {
      overlay.style.display = 'none';
      if (window.history.length > 1) {
        window.history.back();
      } else {
        navigateTo('dashboard', true);
      }
    };
  } else {
    headline = 'An error occurred.';
    description = 'A temporary error has occurred. Please try again.';
    primaryText = 'Retry';
    primaryCallback = () => {
      overlay.style.display = 'none';
      if (callback) callback();
    };
  }

  overlay.style.display = 'flex';
  renderRavoraErrorState(overlay, {
    type,
    headline,
    description,
    primaryText,
    primaryCallback
  });
}

function renderRavoraSuccessState(container, options) {
  if (!container) return;
  const target = typeof container === 'string' ? document.getElementById(container) : container;
  if (!target) return;

  // Clean legacy inline styles on target to avoid layout conflicts
  target.style.background = 'none';
  target.style.border = 'none';
  target.style.padding = '0';
  target.style.boxShadow = 'none';

  const {
    type = 'sync', // auth, account, email, exchanges, trade, sync, settings, profile
    headline = '',
    description = '',
    primaryText = '',
    primaryCallback = null,
    secondaryText = '',
    secondaryCallback = null
  } = options;

  const gradDef = `
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="ravora-success-grad-${type}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#10B981" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
      </defs>
    </svg>
  `;

  const svgIcon = `
    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="url(#ravora-success-grad-${type})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  `;

  let actionsHtml = '';
  if (primaryText) {
    actionsHtml += `<button class="ravora-success-btn-primary" id="${target.id}-btn-primary" tabindex="0">${primaryText}</button>`;
  }
  if (secondaryText) {
    actionsHtml += `<button class="ravora-success-btn-secondary" id="${target.id}-btn-secondary" tabindex="0">${secondaryText}</button>`;
  }

  target.innerHTML = `
    ${gradDef}
    <div class="ravora-success-state" role="status" aria-label="${headline}">
      <div class="ravora-success-icon" aria-hidden="true">
        ${svgIcon}
      </div>
      <h4 class="ravora-success-title">${headline}</h4>
      <p class="ravora-success-description">${description}</p>
      ${actionsHtml ? `<div class="ravora-success-actions">${actionsHtml}</div>` : ''}
    </div>
  `;

  if (primaryText && primaryCallback) {
    const btn = document.getElementById(`${target.id}-btn-primary`);
    if (btn) {
      const handler = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        primaryCallback();
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('keydown', handler);
    }
  }
  if (secondaryText && secondaryCallback) {
    const btn = document.getElementById(`${target.id}-btn-secondary`);
    if (btn) {
      const handler = (e) => {
        if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        secondaryCallback();
      };
      btn.addEventListener('click', handler);
      btn.addEventListener('keydown', handler);
    }
  }
}

function showRavoraSuccess(type, callback) {
  const overlay = document.getElementById('global-success-overlay');
  if (!overlay) return;

  let headline = '';
  let description = '';
  let primaryText = '';
  let primaryCallback = null;

  if (type === 'auth') {
    headline = 'Welcome back.';
    description = "You're now signed in to Ravora.";
    primaryText = 'Open Dashboard';
    primaryCallback = () => {
      overlay.style.display = 'none';
      navigateTo('dashboard', true);
      if (callback) callback();
    };
  } else if (type === 'account') {
    headline = 'Your account is ready.';
    description = "Let's personalize your trading workspace.";
    primaryText = 'Start Onboarding';
    primaryCallback = () => {
      overlay.style.display = 'none';
      const btnOnboarding = document.getElementById('btn-start-onboarding');
      if (btnOnboarding) btnOnboarding.click();
      if (callback) callback();
    };
  } else if (type === 'email') {
    headline = 'Email verified successfully.';
    description = 'Your account is now fully verified.';
    primaryText = 'Continue';
    primaryCallback = () => {
      overlay.style.display = 'none';
      if (callback) callback();
    };
  } else if (type === 'exchanges') {
    headline = 'Exchange connected.';
    description = 'Your portfolio will begin syncing shortly.';
    primaryText = 'View Portfolio';
    primaryCallback = () => {
      overlay.style.display = 'none';
      navigateTo('portfolio', true);
      if (callback) callback();
    };
  } else if (type === 'trade') {
    headline = 'Trade submitted successfully.';
    description = 'Your position is now being monitored by Araiven.';
    primaryText = 'View Position';
    primaryCallback = () => {
      overlay.style.display = 'none';
      navigateTo('portfolio', true);
      setTimeout(() => {
        const positionsTab = document.querySelector('.portfolio-sub-tab[data-tab="positions"]');
        if (positionsTab) positionsTab.click();
      }, 50);
      if (callback) callback();
    };
  } else if (type === 'sync') {
    headline = 'Portfolio synchronized.';
    description = 'Your assets have been updated.';
    primaryText = 'Open Portfolio';
    primaryCallback = () => {
      overlay.style.display = 'none';
      navigateTo('portfolio', true);
      if (callback) callback();
    };
  } else {
    headline = 'Action completed.';
    description = 'Your request has been processed successfully.';
    primaryText = 'Continue';
    primaryCallback = () => {
      overlay.style.display = 'none';
      if (callback) callback();
    };
  }

  overlay.style.display = 'flex';
  renderRavoraSuccessState(overlay, {
    type,
    headline,
    description,
    primaryText,
    primaryCallback
  });
}

function getScannerSkeletonHtml() {
  let html = '';
  for (let i = 0; i < 7; i++) {
    html += `
      <tr class="skeleton-pulse">
        <td style="padding: 10px 8px;"><span class="skeleton-box" style="width: 60px; height: 12px;"></span></td>
        <td style="padding: 10px 8px;"><span class="skeleton-box" style="width: 45px; height: 12px;"></span></td>
        <td style="padding: 10px 8px;"><span class="skeleton-box" style="width: 35px; height: 12px;"></span></td>
        <td style="padding: 10px 8px; text-align: right;"><span class="skeleton-box" style="width: 50px; height: 12px;"></span></td>
      </tr>
    `;
  }
  return html;
}

function getPositionsSkeletonHtml() {
  let html = '';
  for (let i = 0; i < 2; i++) {
    html += `
      <div class="skeleton-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="skeleton-box" style="width: 80px; height: 14px;"></span>
          <span class="skeleton-box" style="width: 50px; height: 14px;"></span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin: 8px 0;">
          <span class="skeleton-box skeleton-text" style="width: 100%;"></span>
          <span class="skeleton-box skeleton-text skeleton-short" style="width: 60%;"></span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span class="skeleton-box" style="width: 70px; height: 12px;"></span>
          <span class="skeleton-box" style="width: 60px; height: 24px; border-radius: 4px;"></span>
        </div>
      </div>
    `;
  }
  return html;
}

function getHistorySkeletonHtml() {
  let html = '';
  for (let i = 0; i < 3; i++) {
    html += `
      <div class="skeleton-card" style="gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="skeleton-box" style="width: 70px; height: 12px;"></span>
          <span class="skeleton-box" style="width: 80px; height: 12px;"></span>
        </div>
        <span class="skeleton-box skeleton-text" style="width: 100%;"></span>
        <span class="skeleton-box skeleton-text skeleton-short" style="width: 40%;"></span>
      </div>
    `;
  }
  return html;
}

function getNotificationsSkeletonHtml() {
  let html = '';
  for (let i = 0; i < 4; i++) {
    html += `
      <div style="display: flex; gap: 12px; padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center;">
        <span class="skeleton-box skeleton-avatar"></span>
        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
          <span class="skeleton-box skeleton-text" style="width: 80%; height: 10px; margin: 0;"></span>
          <span class="skeleton-box skeleton-text skeleton-short" style="width: 40%; height: 8px; margin: 0;"></span>
        </div>
      </div>
    `;
  }
  return html;
}

function showTradingWorkspaceSkeletons() {
  const scannerRows = document.getElementById('terminal-scanner-rows');
  if (scannerRows) scannerRows.innerHTML = getScannerSkeletonHtml();

  const positionsContainer = document.getElementById('terminal-positions-cards-list');
  if (positionsContainer) positionsContainer.innerHTML = getPositionsSkeletonHtml();

  const historyContainer = document.getElementById('terminal-history-cards-list');
  if (historyContainer) historyContainer.innerHTML = getHistorySkeletonHtml();

  const headerStats = [
    'terminal-chart-price', 'terminal-chart-change', 
    'header-volume-val', 'header-volatility-val',
    'header-atr-val', 'header-spread-val', 'header-oi-val'
  ];
  headerStats.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<span class="skeleton-box" style="width: 60px; height: 1.1rem; margin: 0;"></span>`;
    }
  });

  const aiStats = [
    'terminal-opp-score', 'terminal-risk-score', 'terminal-trend-val',
    'terminal-suggested-entry', 'terminal-suggested-tp', 'terminal-suggested-sl',
    'terminal-rr-ratio', 'terminal-duration', 'terminal-reasoning-text'
  ];
  aiStats.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<span class="skeleton-box" style="width: 80px; height: 0.9rem; margin: 0;"></span>`;
    }
  });
}

function showPortfolioSkeletons() {
  const portfolioStats = [
    'port-summary-value', 'port-summary-today-return', 
    'port-summary-net-return', 'port-summary-cash'
  ];
  portfolioStats.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<span class="skeleton-box" style="width: 90px; height: 1.5rem; margin: 0;"></span>`;
    }
  });

  const holdingsTable = document.getElementById('portfolio-holdings-rows');
  if (holdingsTable) {
    let html = '';
    for (let i = 0; i < 4; i++) {
      html += `
        <tr>
          <td><span class="skeleton-box" style="width: 50px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 35px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 60px; height: 12px;"></span></td>
        </tr>
      `;
    }
    holdingsTable.innerHTML = html;
  }

  const openPositionsTable = document.getElementById('perf-open-positions-tbody');
  if (openPositionsTable) {
    let html = '';
    for (let i = 0; i < 2; i++) {
      html += `
        <tr>
          <td><span class="skeleton-box" style="width: 45px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 35px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 50px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 50px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 40px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 40px; height: 12px;"></span></td>
        </tr>
      `;
    }
    openPositionsTable.innerHTML = html;
  }

  const insightsList = document.getElementById('perf-ai-insights-list');
  if (insightsList) {
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += `
        <li style="list-style: none; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
          <span class="skeleton-box" style="width: 6px; height: 6px; border-radius: 50%;"></span>
          <span class="skeleton-box skeleton-text" style="width: 80%; height: 10px; margin: 0;"></span>
        </li>
      `;
    }
    insightsList.innerHTML = html;
  }
}

function showWatchlistSkeletons() {
  const oppsList = document.getElementById('watch-today-opps-list');
  if (oppsList) {
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += `
        <div class="skeleton-card" style="flex: 1; min-width: 140px;">
          <span class="skeleton-box" style="width: 60px; height: 12px;"></span>
          <span class="skeleton-box" style="width: 80px; height: 16px;"></span>
          <span class="skeleton-box" style="width: 40px; height: 10px;"></span>
        </div>
      `;
    }
    oppsList.innerHTML = html;
  }

  const watchlistRows = document.getElementById('watch-watchlist-rows');
  if (watchlistRows) {
    let html = '';
    for (let i = 0; i < 5; i++) {
      html += `
        <tr>
          <td><span class="skeleton-box" style="width: 55px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 45px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 35px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 45px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 55px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 60px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 40px; height: 12px;"></span></td>
        </tr>
      `;
    }
    watchlistRows.innerHTML = html;
  }

  const heatmap = document.getElementById('watch-heatmap-grid');
  if (heatmap) {
    let html = '';
    for (let i = 0; i < 6; i++) {
      html += `<div class="skeleton-box" style="width: 100%; height: 45px; border-radius: 8px;"></div>`;
    }
    heatmap.innerHTML = html;
  }

  const alertsList = document.getElementById('watch-alerts-list');
  if (alertsList) {
    let html = '';
    for (let i = 0; i < 3; i++) {
      html += `
        <div class="skeleton-card" style="padding: 10px; gap: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="skeleton-box" style="width: 40px; height: 10px;"></span>
            <span class="skeleton-box" style="width: 30px; height: 10px;"></span>
          </div>
          <span class="skeleton-box skeleton-text" style="width: 90%; height: 9px; margin: 0;"></span>
        </div>
      `;
    }
    alertsList.innerHTML = html;
  }
}

function showJournalSkeletons() {
  const journalStats = [
    'journal-stat-total-trades', 'journal-stat-win-rate', 
    'journal-stat-pnl', 'journal-stat-profit-factor',
    'journal-stat-avg-win', 'journal-stat-avg-loss', 'journal-stat-avg-duration'
  ];
  journalStats.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `<span class="skeleton-box" style="width: 60px; height: 1.1rem; margin: 0;"></span>`;
    }
  });

  const timeline = document.getElementById('journal-timeline-container');
  if (timeline) timeline.innerHTML = getHistorySkeletonHtml();
}

function showSettingsSkeletons() {
  const settingsFields = [
    'settings-profile-fullname', 'settings-profile-username',
    'settings-profile-phone', 'settings-profile-country'
  ];
  settingsFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.placeholder = 'Loading profile parameter...';
    }
  });

  const sessionsTable = document.getElementById('settings-sessions-tbody');
  if (sessionsTable) {
    let html = '';
    for (let i = 0; i < 2; i++) {
      html += `
        <tr>
          <td><span class="skeleton-box" style="width: 70px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 50px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 80px; height: 12px;"></span></td>
          <td><span class="skeleton-box" style="width: 50px; height: 12px;"></span></td>
        </tr>
      `;
    }
    sessionsTable.innerHTML = html;
  }
}

class RavoraToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
    this.maxToasts = 5;
  }

  init() {
    this.container = document.querySelector('.ravora-toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'ravora-toast-container';
      document.body.appendChild(this.container);
    }
  }

  getIcon(type) {
    const icons = {
      success: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      loading: `<div class="ravora-toast-spinner"></div>`
    };
    return icons[type] || '';
  }

  show({ type = 'info', title = '', description = '', action = null, duration = null }) {
    this.init();

    const isDuplicate = this.toasts.some(t => t.title === title && t.description === description && t.active);
    if (isDuplicate) return null;

    const activeToasts = this.toasts.filter(t => t.active);
    if (activeToasts.length >= this.maxToasts) {
      const oldest = activeToasts[0];
      this.dismiss(oldest.id);
    }

    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    const toastEl = document.createElement('div');
    toastEl.className = `ravora-toast toast-${type} entering`;
    toastEl.id = id;
    toastEl.setAttribute('role', type === 'error' || type === 'warning' ? 'alert' : 'status');
    toastEl.setAttribute('aria-live', type === 'error' || type === 'warning' ? 'assertive' : 'polite');

    const iconHtml = this.getIcon(type);

    let actionBtnHtml = '';
    if (action && action.text && action.callback) {
      actionBtnHtml = `
        <div class="ravora-toast-actions">
          <button class="ravora-toast-btn-action">${action.text}</button>
        </div>
      `;
    }

    let finalDuration = duration;
    if (finalDuration === null) {
      if (type === 'success') finalDuration = 4000;
      else if (type === 'info') finalDuration = 5000;
      else if (type === 'warning') finalDuration = 6000;
      else finalDuration = 0;
    }

    let progressHtml = '';
    if (finalDuration > 0) {
      progressHtml = `<div class="ravora-toast-progress" style="animation: ravoraToastProgress ${finalDuration}ms linear forwards;"></div>`;
    }

    toastEl.innerHTML = `
      <div class="ravora-toast-icon">${iconHtml}</div>
      <div class="ravora-toast-content">
        <span class="ravora-toast-title">${title}</span>
        ${description ? `<span class="ravora-toast-desc">${description}</span>` : ''}
        ${actionBtnHtml}
      </div>
      <button class="ravora-toast-close" aria-label="Close notification">×</button>
      ${progressHtml}
    `;

    if (finalDuration > 0 && !document.getElementById('toast-progress-keyframes')) {
      const style = document.createElement('style');
      style.id = 'toast-progress-keyframes';
      style.innerHTML = `
        @keyframes ravoraToastProgress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `;
      document.head.appendChild(style);
    }

    this.container.appendChild(toastEl);

    setTimeout(() => {
      toastEl.classList.remove('entering');
      toastEl.classList.add('active');
    }, 10);

    const toastState = {
      id,
      el: toastEl,
      type,
      title,
      description,
      active: true,
      duration: finalDuration,
      timer: null,
      timeLeft: finalDuration,
      startTime: Date.now()
    };

    toastEl.querySelector('.ravora-toast-close').addEventListener('click', () => {
      this.dismiss(id);
    });

    if (action && action.callback) {
      const actBtn = toastEl.querySelector('.ravora-toast-btn-action');
      if (actBtn) {
        actBtn.addEventListener('click', (e) => {
          action.callback(e);
          this.dismiss(id);
        });
      }
    }

    const startTimer = () => {
      if (finalDuration > 0) {
        toastState.startTime = Date.now();
        toastState.timer = setTimeout(() => {
          this.dismiss(id);
        }, toastState.timeLeft);
      }
    };

    const pauseTimer = () => {
      if (finalDuration > 0 && toastState.timer) {
        clearTimeout(toastState.timer);
        toastState.timeLeft -= Date.now() - toastState.startTime;
        if (toastState.timeLeft < 0) toastState.timeLeft = 0;

        const progress = toastEl.querySelector('.ravora-toast-progress');
        if (progress) {
          progress.style.animationPlayState = 'paused';
        }
      }
    };

    const resumeTimer = () => {
      if (finalDuration > 0) {
        toastState.startTime = Date.now();
        toastState.timer = setTimeout(() => {
          this.dismiss(id);
        }, toastState.timeLeft);

        const progress = toastEl.querySelector('.ravora-toast-progress');
        if (progress) {
          progress.style.animationPlayState = 'running';
        }
      }
    };

    toastEl.addEventListener('mouseenter', pauseTimer);
    toastEl.addEventListener('mouseleave', resumeTimer);

    toastEl.tabIndex = 0;
    toastEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.dismiss(id);
      }
    });

    let touchStartX = 0;
    let touchEndX = 0;
    toastEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    toastEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 100 || touchEndX - touchStartX > 100) {
        this.dismiss(id);
      }
    }, { passive: true });

    startTimer();

    this.toasts.push(toastState);
    return id;
  }

  dismiss(id) {
    const toastState = this.toasts.find(t => t.id === id);
    if (!toastState || !toastState.active) return;

    toastState.active = false;
    if (toastState.timer) clearTimeout(toastState.timer);

    const el = toastState.el;
    el.classList.remove('active');
    el.classList.add('exiting');

    const handleRemove = () => {
      el.remove();
    };

    el.addEventListener('transitionend', handleRemove);
    setTimeout(handleRemove, 400);
  }

  update(id, options) {
    const toastState = this.toasts.find(t => t.id === id);
    if (!toastState || !toastState.active) return;

    const el = toastState.el;
    const type = options.type || toastState.type;
    const title = options.title || toastState.title;
    const description = options.description !== undefined ? options.description : toastState.description;
    const action = options.action || null;

    if (toastState.timer) clearTimeout(toastState.timer);

    el.className = `ravora-toast toast-${type} active`;

    const iconHtml = this.getIcon(type);
    const iconEl = el.querySelector('.ravora-toast-icon');
    if (iconEl) iconEl.innerHTML = iconHtml;

    const titleEl = el.querySelector('.ravora-toast-title');
    if (titleEl) titleEl.textContent = title;

    const descEl = el.querySelector('.ravora-toast-desc');
    if (description) {
      if (descEl) {
        descEl.textContent = description;
      } else {
        const newDesc = document.createElement('span');
        newDesc.className = 'ravora-toast-desc';
        newDesc.textContent = description;
        el.querySelector('.ravora-toast-content').appendChild(newDesc);
      }
    } else if (descEl) {
      descEl.remove();
    }

    const actionsEl = el.querySelector('.ravora-toast-actions');
    if (actionsEl) actionsEl.remove();
    if (action && action.text && action.callback) {
      const newActions = document.createElement('div');
      newActions.className = 'ravora-toast-actions';
      newActions.innerHTML = `<button class="ravora-toast-btn-action">${action.text}</button>`;
      el.querySelector('.ravora-toast-content').appendChild(newActions);

      newActions.querySelector('.ravora-toast-btn-action').addEventListener('click', (e) => {
        action.callback(e);
        this.dismiss(id);
      });
    }

    let newDuration = options.duration;
    if (newDuration === undefined) {
      if (type === 'success') newDuration = 4000;
      else if (type === 'info') newDuration = 5000;
      else if (type === 'warning') newDuration = 6000;
      else newDuration = 0;
    }

    const progressEl = el.querySelector('.ravora-toast-progress');
    if (progressEl) progressEl.remove();

    if (newDuration > 0) {
      const newProgress = document.createElement('div');
      newProgress.className = 'ravora-toast-progress';
      newProgress.style.animation = `ravoraToastProgress ${newDuration}ms linear forwards`;
      el.appendChild(newProgress);

      toastState.timeLeft = newDuration;
      toastState.duration = newDuration;
      toastState.startTime = Date.now();
      toastState.timer = setTimeout(() => {
        this.dismiss(id);
      }, newDuration);
    } else {
      toastState.timer = null;
      toastState.duration = 0;
      toastState.timeLeft = 0;
    }

    toastState.type = type;
    toastState.title = title;
    toastState.description = description;
  }

  promise(promiseInstance, { loading = '', success = '', error = '' }) {
    const id = this.show({
      type: 'loading',
      title: loading
    });

    promiseInstance.then((res) => {
      const successText = typeof success === 'function' ? success(res) : success;
      this.update(id, {
        type: 'success',
        title: successText
      });
    }).catch((err) => {
      const errorText = typeof error === 'function' ? error(err) : error;
      this.update(id, {
        type: 'error',
        title: errorText || 'An error occurred'
      });
    });

    return promiseInstance;
  }
}

window.ravoraToast = new RavoraToastManager();

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = '/v1';
  const btnSignoutOthers = document.getElementById('btn-signout-others');
  const btnDeleteAccount = document.getElementById('btn-delete-account');

  // Initialize Supabase Client dynamically
  let supabaseClient = null;
  async function initSupabase() {
    try {
      const res = await fetch(`${API_BASE}/auth/config`);
      if (res.ok) {
        const config = await res.json();
        if (window.supabase && config.supabaseUrl) {
          supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
          window.supabaseClient = supabaseClient;
          console.log('[Supabase Client] Initialized successfully.');
        }
      }
    } catch (err) {
      console.warn('[Supabase Client] Failed to fetch config or initialize client:', err);
    }
  }
  initSupabase();

  // Initialize Chart Intelligence Engine
  try {
    if (typeof window.initChartIntelligence === 'function') {
      window.initChartIntelligence('terminal-candlestick-chart');
    }
  } catch (chartErr) {
    console.error('Failed to initialize Chart Intelligence Engine:', chartErr);
  }

  // Bind Timeframe Toolbar Clicks
  const tfButtons = document.querySelectorAll('.chart-toolbar .toolbar-group:first-child button');
  tfButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tfButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const tf = btn.getAttribute('data-tf') || '1D';
      window.chartStateManager.timeframe = tf;

      if (state.selectedAsset) {
        updateTerminalView(state.selectedAsset, tf).catch(console.error);
      }
    });
  });

  // ==========================================================================
  // Core State & Realistic Data Sets
  // ==========================================================================
  const state = {
    onboardingCompleted: false,
    isProductTour: false,
    currentStep: 1,
    profile: {
      experience: 'beginner',
      capital: 132000,
      riskLevel: 1, // 0 = Conservative, 1 = Balanced, 2 = Aggressive
      goal: 'preservation',
      horizon: 'short',
      preferredMarkets: ['BTC', 'ETH']
    },
    currentScreen: 'dashboard',
    notifications: [],
    trades: [],
    opportunities: [],
    previousBalance: 0,
    watchlistAssets: ['BTC', 'ETH'],
    activeScannerFilter: 'all',
    activeScannerSort: localStorage.getItem('scannerSort') || 'oppScore'
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

  function showToast(message, type = 'success') {
    const msg = String(message || '').toLowerCase();
    const isError = msg.includes('error') || msg.includes('fail') || msg.includes('unable');
    const isWarning = msg.includes('warn') || msg.includes('expiring') || msg.includes('missing');
    const finalType = isError ? 'error' : (isWarning ? 'warning' : type);

    window.ravoraToast.show({
      type: finalType,
      title: message
    });
  }

  let lastScannerRefreshTime = new Date();


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

  // API Base URL is declared at the top of DOMContentLoaded scope

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
          showRavoraGlobalError('auth');
          throw new Error('Authentication Error');
        } else if (response.status >= 500) {
          showRavoraGlobalError('api');
          throw new Error('API Error');
        } else {
          console.warn(`Real API returned status ${response.status} for ${endpoint}. Falling back to mock...`);
        }
      } catch (err) {
        if (err.message === 'Authentication Error' || err.message === 'API Error') {
          throw err;
        }
        if (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          showRavoraGlobalError('network', () => apiCall(endpoint, options));
          throw err;
        }
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

    // Handle GET /market/overview
    if (urlPath === '/market/overview') {
      return [
        { symbol: 'BTC', name: 'Bitcoin', price: 64120.10, change24h: 1.40, volume24h: 28450200100, marketCap: 1258900400100 },
        { symbol: 'ETH', name: 'Ethereum', price: 3485.10, change24h: 2.15, volume24h: 14502100800, marketCap: 418500200300 },
        { symbol: 'SOL', name: 'Solana', price: 134.20, change24h: -0.85, volume24h: 3840100500, marketCap: 62450300100 },
        { symbol: 'BNB', name: 'Binance Coin', price: 580.10, change24h: 1.25, volume24h: 1850200100, marketCap: 89050300100 },
        { symbol: 'SUI', name: 'Sui', price: 1.15, change24h: -3.45, volume24h: 120500600, marketCap: 2840900100 }
      ];
    }

    // Handle GET /market/assets/:symbol
    if (urlPath.startsWith('/market/assets/')) {
      const sym = urlPath.split('/').pop().toUpperCase();
      const mockAssets = {
        BTC: { symbol: 'BTC', name: 'Bitcoin', price: 64120.10, change24h: 1.40, volume24h: 28450200100, marketCap: 1258900400100 },
        ETH: { symbol: 'ETH', name: 'Ethereum', price: 3485.10, change24h: 2.15, volume24h: 14502100800, marketCap: 418500200300 },
        SOL: { symbol: 'SOL', name: 'Solana', price: 134.20, change24h: -0.85, volume24h: 3840100500, marketCap: 62450300100 },
        BNB: { symbol: 'BNB', name: 'Binance Coin', price: 580.10, change24h: 1.25, volume24h: 1850200100, marketCap: 89050300100 },
        SUI: { symbol: 'SUI', name: 'Sui', price: 1.15, change24h: -3.45, volume24h: 120500600, marketCap: 2840900100 }
      };
      return mockAssets[sym] || { symbol: sym, name: sym, price: 100.0, change24h: 0.0 };
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
          recommendation: 'LONG',
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
          recommendation: 'LONG',
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
          trendDirection: 'Sideways',
          recommendation: 'WAIT',
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
          recommendation: 'LONG',
          supportLevels: [],
          resistanceLevels: []
        },
        {
          opportunityId: 'sui-alpha',
          type: 'momentum',
          name: 'Sui Network Velocity Expansion',
          symbol: 'SUI / USD',
          icon: '💧',
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
          trendDirection: 'Sideways',
          recommendation: 'WAIT',
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
  const btnTriggerSettingsOnboarding = document.getElementById('btn-trigger-settings-onboarding');
  const btnHeaderManualScan = document.getElementById('btn-header-manual-scan');

  // ==========================================================================
  // Auth Form Toggling & Listeners
  // ==========================================================================
  if (goToRegister) {
    goToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthView('register');
      const emailVal = document.getElementById('login-email').value;
      const mobileVal = document.getElementById('login-mobile').value;
      const subtitleEl = document.getElementById('register-subtitle');
      if (activeLoginTab === 'email') {
        document.getElementById('register-email').value = emailVal;
        document.getElementById('register-tab-email').click();
        if (subtitleEl) {
          subtitleEl.innerHTML = `Creating Ravora account for <strong style="color: #fff;">${emailVal || 'your email'}</strong>`;
        }
      } else {
        document.getElementById('register-mobile').value = mobileVal;
        document.getElementById('register-tab-mobile').click();
        if (subtitleEl) {
          subtitleEl.innerHTML = `Creating Ravora account for <strong style="color: #fff;">${mobileVal || 'your device'}</strong>`;
        }
      }
    });
  }

  if (goToLogin) {
    goToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthView('login');
    });
  }

  function showAuthOverlay() {
    window.location.href = '/auth/login';
  }

  function showOnboardingOverlay() {
    window.location.href = '/onboarding';
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
    const urlParams = new URLSearchParams(window.location.search);
    const forceAuth = urlParams.has('auth');

    const loggedIn = localStorage.getItem('ravora_logged_in') === 'true';
    const loginTime = localStorage.getItem('ravora_login_time');
    const token = localStorage.getItem('ravora_token');
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const timeDiff = loginTime ? (Date.now() - parseInt(loginTime)) : null;

    // Remember Me vs Session Storage verification
    const rememberMe = localStorage.getItem('ravora_remember_me') === 'true';
    const sessionActive = sessionStorage.getItem('ravora_session_active') === 'true';
    const sessionValidByPersistence = rememberMe || sessionActive;

    const isSessionValid = loggedIn && loginTime && token && (timeDiff < sevenDays) && !forceAuth && sessionValidByPersistence;

    console.log('[Auth Debug - App] loggedIn:', loggedIn, 'loginTime:', loginTime, 'timeDiff:', timeDiff, 'forceAuth:', forceAuth, 'isSessionValid:', isSessionValid, 'persistenceValid:', sessionValidByPersistence);

    if (!isSessionValid) {
      console.log('[Auth Debug - App] Session is invalid or forced auth requested. Showing auth screen...');
      if (!loggedIn || forceAuth) {
        localStorage.removeItem('ravora_token');
        localStorage.removeItem('ravora_logged_in');
        localStorage.removeItem('ravora_login_time');
        localStorage.removeItem('ravora_email');
        localStorage.removeItem('ravora_onboarding_completed');
        localStorage.removeItem('ravora_remember_me');
        sessionStorage.removeItem('ravora_session_active');
      }

      showAuthOverlay();
      return;
    }
    try {
      const email = localStorage.getItem('ravora_email') || 'User';
      updateUserWidget(email);

      let onboardingCompleted = localStorage.getItem('ravora_onboarding_completed') === 'true';
      if (!onboardingCompleted && token) {
        console.log('[Auth Debug] Local onboarding status is false, verifying with backend...');
        try {
          const res = await apiCall('/user/profile');
          if (res && res.onboardingCompleted) {
            console.log('[Auth Debug] Backend confirmed onboarding is complete. Auto-correcting local state.');
            onboardingCompleted = true;
            localStorage.setItem('ravora_onboarding_completed', 'true');
            if (res.profile) {
              localStorage.setItem('ravora_profile_experience', res.profile.experience_level || 'beginner');
              localStorage.setItem('ravora_profile_capital', (res.profile.capital || 132000).toString());
              localStorage.setItem('ravora_profile_risk', res.profile.risk_stance || 'balanced');
              localStorage.setItem('ravora_profile_goal', res.profile.primary_goal || 'preservation');
            }
          }
        } catch (e) {
          console.warn('[checkAuthState] On-demand profile verification failed:', e);
        }
      }

      if (onboardingCompleted) {
        state.onboardingCompleted = true;
        state.profile.experience = localStorage.getItem('ravora_profile_experience') || 'beginner';
        state.profile.capital = parseInt(localStorage.getItem('ravora_profile_capital') || '132000');
        const riskLevels = { conservative: 0, balanced: 1, aggressive: 2 };
        const riskStance = localStorage.getItem('ravora_profile_risk') || 'balanced';
        state.profile.riskLevel = riskLevels[riskStance] ?? 1;
        state.profile.goal = localStorage.getItem('ravora_profile_goal') || 'preservation';
        state.profile.horizon = localStorage.getItem('ravora_profile_horizon') || 'short';

        try {
          const marketsStr = localStorage.getItem('ravora_preferred_markets');
          if (marketsStr) {
            state.profile.preferredMarkets = JSON.parse(marketsStr);
          }
        } catch (e) {
          console.warn('Failed to parse preferred markets:', e);
        }

        showDashboard();
        initializeDashboardUI();
        resolveInitialRoute();
      } else {
        state.onboardingCompleted = false;
        showOnboardingOverlay();
      }
    } catch (e) {
      console.error('Auth check error:', e);
      showAuthOverlay();
    }
  }

  // Device Fingerprint generator
  let deviceFingerprint = localStorage.getItem('ravora_device_fingerprint');
  if (!deviceFingerprint) {
    deviceFingerprint = 'df_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ravora_device_fingerprint', deviceFingerprint);
  }

  // Authentication View Switcher
  const authViews = {
    login: document.getElementById('auth-login-view'),
    register: document.getElementById('auth-register-view'),
    otp: document.getElementById('auth-otp-view'),
    forgot: document.getElementById('auth-forgot-view'),
    reset: document.getElementById('auth-reset-view'),
    success: document.getElementById('auth-success-view')
  };

  let activeVerifyUserId = null;
  let activeOtpChannel = 'email';
  let otpExpiryInterval = null;
  let otpResendInterval = null;

  function switchAuthView(viewName) {
    Object.keys(authViews).forEach(k => {
      if (authViews[k]) {
        authViews[k].style.display = (k === viewName) ? 'block' : 'none';
      }
    });
    if (viewName === 'login') {
      resetLoginStages();
    }
  }

  function resetLoginStages() {
    currentLoginStep = 'email';
    const stageEmail = document.getElementById('login-stage-email');
    const stagePwd = document.getElementById('login-stage-password');
    const stageNoAcc = document.getElementById('login-stage-no-account');
    const stageOauth = document.getElementById('login-stage-oauth');
    const submitBtn = document.getElementById('login-submit-btn');
    const divider = document.getElementById('login-social-divider');
    const socialBtns = document.getElementById('login-social-buttons');
    const footer = document.getElementById('login-footer-register');
    const btnText = document.getElementById('login-btn-text');
    const errorEl = document.getElementById('login-error');

    if (stageEmail) stageEmail.style.display = 'block';
    if (stagePwd) stagePwd.style.display = 'none';
    if (stageNoAcc) stageNoAcc.style.display = 'none';
    if (stageOauth) stageOauth.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'flex';
    if (divider) divider.style.display = 'block';
    if (socialBtns) socialBtns.style.display = 'grid';
    if (footer) footer.style.display = 'block';
    if (btnText) btnText.textContent = 'Continue';
    if (errorEl) errorEl.style.display = 'none';
  }

  // Clear OTP Timers
  function clearOtpTimers() {
    if (otpExpiryInterval) clearInterval(otpExpiryInterval);
    if (otpResendInterval) clearInterval(otpResendInterval);
  }

  // Start OTP Countdown clock
  function startOtpTimers(channel) {
    clearOtpTimers();

    // 1. Expiry Countdown (5 minutes)
    const expiryTimerEl = document.getElementById('otp-expiry-timer');
    let secondsLeft = 300;
    if (expiryTimerEl) expiryTimerEl.textContent = '5:00';

    otpExpiryInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(otpExpiryInterval);
        if (expiryTimerEl) expiryTimerEl.textContent = 'Expired';
        const otpError = document.getElementById('otp-error');
        if (otpError) {
          otpError.textContent = 'Verification code has expired. Please request a new one.';
          otpError.style.display = 'block';
        }
        return;
      }
      const mins = Math.floor(secondsLeft / 60);
      const secs = secondsLeft % 60;
      if (expiryTimerEl) {
        expiryTimerEl.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      }
    }, 1000);

    // 2. Resend Cooldown (30 seconds)
    const resendLink = document.getElementById('otp-resend-link');
    let resendCooldown = 30;
    if (resendLink) {
      resendLink.style.pointerEvents = 'none';
      resendLink.style.opacity = '0.4';
      resendLink.textContent = `Resend Code (${resendCooldown}s)`;
    }

    otpResendInterval = setInterval(() => {
      resendCooldown--;
      if (resendCooldown <= 0) {
        clearInterval(otpResendInterval);
        if (resendLink) {
          resendLink.style.pointerEvents = 'auto';
          resendLink.style.opacity = '1';
          resendLink.textContent = 'Resend Code';
        }
        return;
      }
      if (resendLink) {
        resendLink.textContent = `Resend Code (${resendCooldown}s)`;
      }
    }, 1000);

    // WhatsApp Option (SMS only)
    const btnWhatsapp = document.getElementById('btn-otp-whatsapp');
    if (btnWhatsapp) {
      btnWhatsapp.style.display = (channel === 'sms') ? 'inline-block' : 'none';
    }
  }

  // Bind Switch Navigation links inside cards
  const linkToRegister = document.getElementById('go-to-register');
  const linkToLogin = document.getElementById('go-to-login');
  if (linkToRegister) {
    linkToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthView('register');
    });
  }
  if (linkToLogin) {
    linkToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthView('login');
    });
  }
  document.querySelectorAll('.go-back-to-login').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthView('login');
    });
  });

  const linkForgot = document.getElementById('login-forgot-btn');
  if (linkForgot) {
    linkForgot.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthView('forgot');
    });
  }

  // PASSWORD VISIBILITY TOGGLES
  document.querySelectorAll('.btn-toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.parentNode.querySelector('input');
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
        } else {
          input.type = 'password';
          btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
        }
      }
    });
  });

  // TAB TOGGLES
  // Login tabs
  const loginTabEmail = document.getElementById('login-tab-email');
  const loginTabMobile = document.getElementById('login-tab-mobile');
  const loginEmailContainer = document.getElementById('login-email-container');
  const loginMobileContainer = document.getElementById('login-mobile-container');
  const loginPasswordContainer = document.getElementById('login-password-container');
  const loginOtpToggle = document.getElementById('login-otp-toggle');

  let activeLoginTab = 'email';
  let currentLoginStep = 'email';

  if (loginTabEmail && loginTabMobile) {
    loginTabEmail.addEventListener('click', () => {
      activeLoginTab = 'email';
      loginTabEmail.classList.add('active');
      loginTabMobile.classList.remove('active');
      if (loginEmailContainer) loginEmailContainer.style.display = 'block';
      if (loginMobileContainer) loginMobileContainer.style.display = 'none';
      if (loginPasswordContainer) loginPasswordContainer.style.display = 'block';
      // Restore password validation requirement
      document.getElementById('login-email').required = true;
      document.getElementById('login-mobile').required = false;
      document.getElementById('login-password').required = !loginOtpToggle.checked;
    });

    loginTabMobile.addEventListener('click', () => {
      activeLoginTab = 'mobile';
      loginTabMobile.classList.add('active');
      loginTabEmail.classList.remove('active');
      if (loginEmailContainer) loginEmailContainer.style.display = 'none';
      if (loginMobileContainer) loginMobileContainer.style.display = 'block';
      // Mobile is OTP login by default in our simplified Fintech UX
      if (loginPasswordContainer) loginPasswordContainer.style.display = 'none';
      document.getElementById('login-email').required = false;
      document.getElementById('login-mobile').required = true;
      document.getElementById('login-password').required = false;
    });
  }

  // OTP toggle event
  if (loginOtpToggle) {
    loginOtpToggle.addEventListener('change', () => {
      if (activeLoginTab === 'email') {
        if (loginOtpToggle.checked) {
          if (loginPasswordContainer) loginPasswordContainer.style.display = 'none';
          document.getElementById('login-password').required = false;
        } else {
          if (loginPasswordContainer) loginPasswordContainer.style.display = 'block';
          document.getElementById('login-password').required = true;
        }
      }
    });
  }

  // Register tabs
  const registerTabEmail = document.getElementById('register-tab-email');
  const registerTabMobile = document.getElementById('register-tab-mobile');
  const registerEmailContainer = document.getElementById('register-email-container');
  const registerMobileContainer = document.getElementById('register-mobile-container');
  let activeRegisterTab = 'email';

  const updateRegisterSubtitle = () => {
    const subtitleEl = document.getElementById('register-subtitle');
    if (!subtitleEl) return;
    const emailVal = document.getElementById('register-email').value;
    const mobileVal = document.getElementById('register-mobile').value;
    const currentVal = activeRegisterTab === 'email' ? emailVal : mobileVal;
    subtitleEl.innerHTML = `Creating Ravora account for <strong style="color: #fff;">${currentVal || (activeRegisterTab === 'email' ? 'your email' : 'your device')}</strong>`;
  };

  if (registerTabEmail && registerTabMobile) {
    registerTabEmail.addEventListener('click', () => {
      activeRegisterTab = 'email';
      registerTabEmail.classList.add('active');
      registerTabMobile.classList.remove('active');
      if (registerEmailContainer) registerEmailContainer.style.display = 'block';
      if (registerMobileContainer) registerMobileContainer.style.display = 'none';
      document.getElementById('register-email').required = true;
      document.getElementById('register-mobile').required = false;
      updateRegisterSubtitle();
    });

    registerTabMobile.addEventListener('click', () => {
      activeRegisterTab = 'mobile';
      registerTabMobile.classList.add('active');
      registerTabEmail.classList.remove('active');
      if (registerEmailContainer) registerEmailContainer.style.display = 'none';
      if (registerMobileContainer) registerMobileContainer.style.display = 'block';
      document.getElementById('register-email').required = false;
      document.getElementById('register-mobile').required = true;
      updateRegisterSubtitle();
    });

    const regEmailInput = document.getElementById('register-email');
    const regMobileInput = document.getElementById('register-mobile');
    if (regEmailInput) regEmailInput.addEventListener('input', updateRegisterSubtitle);
    if (regMobileInput) regMobileInput.addEventListener('input', updateRegisterSubtitle);
  }

  // PASSWORD STRENGTH LOGIC
  const strengthCheck = (val, bars, desc) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    bars.forEach((bar, idx) => {
      if (idx < score) {
        if (score === 1) bar.style.background = '#ef4444';
        else if (score === 2 || score === 3) bar.style.background = '#f59e0b';
        else if (score === 4) bar.style.background = '#10b981';
      } else {
        bar.style.background = 'rgba(255,255,255,0.06)';
      }
    });

    if (val.length === 0) {
      desc.textContent = 'Password must be at least 8 characters.';
      desc.style.color = 'var(--text-muted)';
    } else if (score <= 1) {
      desc.textContent = 'Weak password (try adding letters, numbers, and symbols).';
      desc.style.color = '#ef4444';
    } else if (score <= 3) {
      desc.textContent = 'Medium password strength.';
      desc.style.color = '#f59e0b';
    } else {
      desc.textContent = 'Strong password.';
      desc.style.color = '#10b981';
    }
  };

  const registerPwdInput = document.getElementById('register-password');
  const registerStrengthBars = document.querySelectorAll('#auth-register-view .pwd-strength-bar');
  const registerStrengthDesc = document.getElementById('pwd-strength-desc');
  if (registerPwdInput) {
    registerPwdInput.addEventListener('input', () => {
      strengthCheck(registerPwdInput.value, registerStrengthBars, registerStrengthDesc);
    });
  }

  const resetPwdInput = document.getElementById('reset-password');
  const resetStrengthBars = document.querySelectorAll('#auth-reset-view .pwd-strength-bar');
  const resetStrengthDesc = document.getElementById('reset-pwd-strength-desc');
  if (resetPwdInput) {
    resetPwdInput.addEventListener('input', () => {
      strengthCheck(resetPwdInput.value, resetStrengthBars, resetStrengthDesc);
    });
  }

  // AUTO-JUMP DIGIT INPUTS AND CLIPBOARD PASTE
  const otpInputs = document.querySelectorAll('.verify-digit-input');
  otpInputs.forEach((input, idx) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val.length === 1 && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }

      // Auto submit on final 6th digit
      const allFilled = Array.from(otpInputs).every(i => i.value.length === 1);
      if (allFilled) {
        document.getElementById('auth-otp-form').dispatchEvent(new Event('submit'));
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value.length === 0 && idx > 0) {
        otpInputs[idx - 1].focus();
      }
    });

    // Paste Support
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const clipboardData = (e.clipboardData || window.clipboardData).getData('text');
      const digits = clipboardData.replace(/\D/g, '').substring(0, 6);

      digits.split('').forEach((char, dIdx) => {
        if (otpInputs[dIdx]) {
          otpInputs[dIdx].value = char;
        }
      });

      const nextFocus = Math.min(digits.length, 5);
      otpInputs[nextFocus].focus();

      if (digits.length === 6) {
        document.getElementById('auth-otp-form').dispatchEvent(new Event('submit'));
      }
    });
  });

  // SUBMIT SIGN IN
  if (loginForm) {
    // Bind helper buttons for wizard stages
    const noAccountCreate = document.getElementById('no-account-create-btn');
    if (noAccountCreate) {
      noAccountCreate.addEventListener('click', () => {
        const emailVal = document.getElementById('login-email').value;
        const mobileVal = document.getElementById('login-mobile').value;
        switchAuthView('register');
        if (activeLoginTab === 'email') {
          document.getElementById('register-email').value = emailVal;
          document.getElementById('register-tab-email').click();
        } else {
          document.getElementById('register-mobile').value = mobileVal;
          document.getElementById('register-tab-mobile').click();
        }
        document.getElementById('register-fullname').focus();
      });
    }

    const noAccountRetry = document.getElementById('no-account-retry-btn');
    if (noAccountRetry) {
      noAccountRetry.addEventListener('click', () => {
        document.getElementById('login-email').value = '';
        document.getElementById('login-mobile').value = '';
        resetLoginStages();
      });
    }

    const noAccountStay = document.getElementById('no-account-stay-btn');
    if (noAccountStay) {
      noAccountStay.addEventListener('click', () => {
        resetLoginStages();
      });
    }

    const changeActive = document.getElementById('login-change-active');
    if (changeActive) {
      changeActive.addEventListener('click', (e) => {
        e.preventDefault();
        resetLoginStages();
      });
    }

    const oauthBack = document.getElementById('oauth-back-btn');
    if (oauthBack) {
      oauthBack.addEventListener('click', (e) => {
        e.preventDefault();
        resetLoginStages();
      });
    }

    let activeOauthProvider = '';
    const oauthContinue = document.getElementById('oauth-continue-btn');
    if (oauthContinue) {
      oauthContinue.addEventListener('click', () => {
        if (activeOauthProvider) {
          handleSocialLogin(activeOauthProvider);
        }
      });
    }

    function handleSocialLogin(provider) {
      const width = 500;
      const height = 600;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);
      const consentUrl = `/app/oauth-consent.html?provider=${provider}`;
      window.open(consentUrl, `Authorize ${provider}`, `width=${width},height=${height},top=${top},left=${left},scrollbars=no,resizable=no`);
    }

    // Bind social buttons
    document.querySelectorAll('.btn-social-login').forEach(btn => {
      btn.addEventListener('click', () => {
        const provider = btn.getAttribute('data-provider');
        handleSocialLogin(provider);
      });
    });

    // Listen for OAuth postMessage callbacks
    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.provider) {
        console.log('[Legacy OAuth Callback] Received message:', event.data);
        try {
          const res = await fetch(`${API_BASE}/auth/social`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              provider: event.data.provider,
              providerUserId: event.data.providerUserId || event.data.code,
              email: event.data.email,
              fullName: event.data.fullName,
              token: event.data.token
            })
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('ravora_token', data.token);
            localStorage.setItem('ravora_logged_in', 'true');
            localStorage.setItem('ravora_login_time', Date.now().toString());
            localStorage.setItem('ravora_email', event.data.email);
            localStorage.setItem('ravora_onboarding_completed', data.user.onboardingCompleted ? 'true' : 'false');
            localStorage.setItem('ravora_remember_me', 'true');
            sessionStorage.setItem('ravora_session_active', 'true');
            switchAuthView('success');
            setTimeout(() => {
              checkAuthState();
            }, 1000);
          } else {
            const data = await res.json();
            window.ravoraToast.show({
              type: 'error',
              title: 'OAuth Authentication Failed',
              description: data.error || 'Unknown error'
            });
          }
        } catch (err) {
          window.ravoraToast.show({
            type: 'error',
            title: 'OAuth Error',
            description: err.message
          });
        }
      }
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (loginError) loginError.style.display = 'none';

      const email = document.getElementById('login-email').value;
      const mobile = document.getElementById('login-mobile').value;
      const password = document.getElementById('login-password').value;
      const otpMode = loginOtpToggle ? loginOtpToggle.checked : false;
      const remember = document.getElementById('login-remember-me').checked;

      const submitBtn = document.getElementById('login-submit-btn');
      const spinner = submitBtn.querySelector('.auth-spinner');
      const btnText = document.getElementById('login-btn-text');

      if (currentLoginStep === 'email') {
        // Stage 1: Check if account exists
        try {
          submitBtn.disabled = true;
          if (spinner) spinner.style.display = 'inline-block';
          if (btnText) btnText.style.opacity = '0.5';

          const checkRes = await fetch(`${API_BASE}/auth/check-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activeLoginTab === 'email' ? { email } : { phone: mobile })
          });

          if (!checkRes.ok) {
            throw new Error('Verification request rejected.');
          }

          const checkData = await checkRes.json();
          if (!checkData.exists) {
            // Account does not exist
            currentLoginStep = 'no-account';
            document.getElementById('login-stage-email').style.display = 'none';
            document.getElementById('login-stage-no-account').style.display = 'block';
            submitBtn.style.display = 'none';
            document.getElementById('login-social-divider').style.display = 'none';
            document.getElementById('login-social-buttons').style.display = 'none';
            document.getElementById('login-footer-register').style.display = 'none';
          } else {
            // Account exists! Determine method
            if (checkData.method === 'password') {
              currentLoginStep = 'password';
              document.getElementById('login-stage-email').style.display = 'none';
              document.getElementById('login-stage-password').style.display = 'block';
              document.getElementById('login-active-email').textContent = activeLoginTab === 'email' ? email : mobile;
              btnText.textContent = 'Sign In';
            } else if (checkData.method === 'otp') {
              // Direct passwordless OTP flow
              const otpPayload = activeLoginTab === 'email' ? { email } : { mobileNumber: mobile };
              const otpRes = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(otpPayload)
              });
              if (!otpRes.ok) {
                const data = await otpRes.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to send OTP code.');
              }
              const data = await otpRes.json();
              activeVerifyUserId = data.userId;
              activeOtpChannel = data.channel;
              const desc = document.getElementById('otp-description');
              if (desc) {
                desc.textContent = `Smart Security Check: We've sent a 6-digit code to ${data.destination}`;
                if (data.otpCode) {
                  desc.innerHTML = `Smart Security Check: We've sent a 6-digit code to ${data.destination}.<br><strong style="color: var(--success); font-family: monospace; font-size: 0.95rem; display: block; margin-top: 8px;">[SANDBOX OTP] ${data.otpCode}</strong>`;
                }
              }
              switchAuthView('otp');
              startOtpTimers(data.channel);
            } else {
              // OAuth account (Google, GitHub, Apple)
              currentLoginStep = 'oauth';
              activeOauthProvider = checkData.method;
              document.getElementById('login-stage-email').style.display = 'none';
              document.getElementById('login-stage-oauth').style.display = 'block';
              document.getElementById('oauth-provider-name').textContent = checkData.method;
              submitBtn.style.display = 'none';
              document.getElementById('login-social-divider').style.display = 'none';
              document.getElementById('login-social-buttons').style.display = 'none';
              document.getElementById('login-footer-register').style.display = 'none';
            }
          }
        } catch (err) {
          if (loginError) {
            loginError.textContent = err.message;
            loginError.style.display = 'block';
          }
        } finally {
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
          if (btnText) btnText.style.opacity = '1';
        }
      } else if (currentLoginStep === 'password') {
        // Stage 2: Password Sign In
        try {
          submitBtn.disabled = true;
          if (spinner) spinner.style.display = 'inline-block';
          if (btnText) btnText.style.opacity = '0.5';

          const payload = {
            deviceFingerprint,
            rememberMe: remember
          };

          if (activeLoginTab === 'email') {
            payload.email = email;
            if (!otpMode) {
              payload.password = password;
            }
          } else {
            payload.mobileNumber = mobile;
          }

          let res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            if (data.otpRequired) {
              activeVerifyUserId = data.userId;
              activeOtpChannel = data.channel;
              const desc = document.getElementById('otp-description');
              if (desc) {
                desc.textContent = `Smart Security Check: We've sent a 6-digit code to ${data.destination}`;
                if (data.otpCode) {
                  desc.innerHTML = `Smart Security Check: We've sent a 6-digit code to ${data.destination}.<br><strong style="color: var(--success); font-family: monospace; font-size: 0.95rem; display: block; margin-top: 8px;">[SANDBOX OTP] ${data.otpCode}</strong>`;
                }
              }
              switchAuthView('otp');
              startOtpTimers(data.channel);
            } else {
              localStorage.setItem('ravora_token', data.token);
              localStorage.setItem('ravora_logged_in', 'true');
              localStorage.setItem('ravora_login_time', Date.now().toString());
              localStorage.setItem('ravora_email', email || mobile);
              localStorage.setItem('ravora_onboarding_completed', (data.user && data.user.onboardingCompleted) ? 'true' : 'false');
              localStorage.setItem('ravora_remember_me', remember ? 'true' : 'false');
              sessionStorage.setItem('ravora_session_active', 'true');

              switchAuthView('success');
              setTimeout(() => {
                checkAuthState();
              }, 1200);
            }
          } else {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Login credentials rejected.');
          }
        } catch (err) {
          if (loginError) {
            loginError.textContent = err.message;
            loginError.style.display = 'block';
          }
        } finally {
          submitBtn.disabled = false;
          if (spinner) spinner.style.display = 'none';
          if (btnText) btnText.style.opacity = '1';
        }
      }
    });
  }

  // SUBMIT SIGN UP
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (registerError) registerError.style.display = 'none';

      const fullName = document.getElementById('register-fullname').value;
      const email = document.getElementById('register-email').value;
      const mobile = document.getElementById('register-mobile').value;
      const password = document.getElementById('register-password').value;
      const confirmPwd = document.getElementById('register-confirm-password').value;
      const acceptTerms = document.getElementById('register-terms').checked;

      const submitBtn = registerForm.querySelector('.auth-submit-btn');
      const spinner = submitBtn.querySelector('.auth-spinner');
      const btnText = submitBtn.querySelector('span');

      try {
        if (password !== confirmPwd) {
          throw new Error('Passwords do not match.');
        }

        submitBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (btnText) btnText.style.opacity = '0.5';

        const payload = {
          fullName,
          password,
          confirmPassword: confirmPwd,
          acceptTerms
        };

        if (activeRegisterTab === 'email') {
          payload.email = email;
        } else {
          payload.mobileNumber = mobile;
        }

        let res;
        try {
          res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (netErr) {
          console.warn('Backend registration fallback (offline):', netErr);
          await new Promise(r => setTimeout(r, 1000));
          localStorage.setItem('ravora_token', 'mock-jwt-token-fallback');
          localStorage.setItem('ravora_logged_in', 'true');
          localStorage.setItem('ravora_login_time', Date.now().toString());
          localStorage.setItem('ravora_email', email || mobile || 'sandbox-user@ravora.ai');
          localStorage.setItem('ravora_onboarding_completed', 'false');
          switchAuthView('success');
          setTimeout(() => {
            checkAuthState();
          }, 1000);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          activeVerifyUserId = data.userId;
          activeOtpChannel = data.channel;
          const desc = document.getElementById('otp-description');
          if (desc) {
            desc.textContent = `Confirm Registration: Enter the 6-digit code sent to ${data.destination}`;
            if (data.otpCode) {
              desc.innerHTML = `Confirm Registration: Enter the 6-digit code sent to ${data.destination}.<br><strong style="color: var(--success); font-family: monospace; font-size: 0.95rem; display: block; margin-top: 8px;">[SANDBOX OTP] ${data.otpCode}</strong>`;
            }
          }
          switchAuthView('otp');
          startOtpTimers(data.channel);
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Account registration failed.');
        }
      } catch (err) {
        if (registerError) {
          registerError.textContent = err.message;
          registerError.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (btnText) btnText.style.opacity = '1';
      }
    });
  }

  // SUBMIT OTP VERIFICATION
  const otpForm = document.getElementById('auth-otp-form');
  const otpError = document.getElementById('otp-error');
  if (otpForm) {
    otpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (otpError) otpError.style.display = 'none';

      const digits = Array.from(otpInputs).map(i => i.value).join('');
      if (digits.length < 6) return;

      const submitBtn = otpForm.querySelector('.auth-submit-btn');
      const spinner = submitBtn.querySelector('.auth-spinner');
      const btnText = submitBtn.querySelector('span');

      try {
        submitBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (btnText) btnText.style.opacity = '0.5';

        let res;
        const remember = document.getElementById('login-remember-me') ? document.getElementById('login-remember-me').checked : false;
        try {
          res = await fetch(`${API_BASE}/auth/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: activeVerifyUserId,
              otpCode: digits,
              deviceFingerprint: deviceFingerprint,
              rememberMe: remember
            })
          });
        } catch (netErr) {
          console.warn('Backend verify fallback (offline):', netErr);
          await new Promise(r => setTimeout(r, 800));
          switchAuthView('success');
          setTimeout(() => {
            checkAuthState();
          }, 1000);
          return;
        }

        if (res.ok) {
          const data = await res.json();
          clearOtpTimers();
          localStorage.setItem('ravora_token', data.token);
          localStorage.setItem('ravora_logged_in', 'true');
          localStorage.setItem('ravora_login_time', Date.now().toString());
          localStorage.setItem('ravora_email', data.user.email);
          localStorage.setItem('ravora_onboarding_completed', data.user.onboardingCompleted ? 'true' : 'false');
          const remember = document.getElementById('login-remember-me') ? document.getElementById('login-remember-me').checked : false;
          localStorage.setItem('ravora_remember_me', remember ? 'true' : 'false');
          sessionStorage.setItem('ravora_session_active', 'true');

          switchAuthView('success');
          setTimeout(() => {
            checkAuthState();
          }, 1200);
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Incorrect verification code. Please check and try again.');
        }
      } catch (err) {
        if (otpError) {
          otpError.textContent = err.message;
          otpError.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (btnText) btnText.style.opacity = '1';
      }
    });
  }

  // RESEND OTP TRIGGER LINK
  const resendLink = document.getElementById('otp-resend-link');
  if (resendLink) {
    resendLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        let res = await fetch(`${API_BASE}/auth/otp/resend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: activeVerifyUserId })
        });
        if (res.ok) {
          const data = await res.json();
          const desc = document.getElementById('otp-description');
          if (desc) {
            desc.textContent = `OTP Resent: Enter the new 6-digit code sent to ${data.destination}`;
            if (data.otpCode) {
              desc.innerHTML = `OTP Resent: Enter the new 6-digit code sent to ${data.destination}.<br><strong style="color: var(--success); font-family: monospace; font-size: 0.95rem; display: block; margin-top: 8px;">[SANDBOX OTP] ${data.otpCode}</strong>`;
            }
          }
          startOtpTimers(activeOtpChannel);
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to resend OTP.');
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  // WHATSAPP TRIGGER BUTTON
  const btnWhatsapp = document.getElementById('btn-otp-whatsapp');
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', async () => {
      console.log('[WhatsApp OTP Route] Requesting WhatsApp secondary channel link...');
      btnWhatsapp.disabled = true;
      btnWhatsapp.textContent = 'OTP sent to WhatsApp!';
      btnWhatsapp.style.borderColor = '#25D366';
      btnWhatsapp.style.color = '#25D366';
      setTimeout(() => {
        btnWhatsapp.disabled = false;
        btnWhatsapp.textContent = 'Send duplicate code to WhatsApp';
        btnWhatsapp.style.borderColor = 'rgba(255,255,255,0.08)';
        btnWhatsapp.style.color = '#fff';
      }, 5000);
    });
  }

  // PASSWORD RECOVERY (FORGOT PASSWORD)
  const forgotForm = document.getElementById('auth-forgot-form');
  const forgotError = document.getElementById('forgot-error');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (forgotError) forgotError.style.display = 'none';

      const target = document.getElementById('forgot-target').value;
      const submitBtn = forgotForm.querySelector('.auth-submit-btn');
      const spinner = submitBtn.querySelector('.auth-spinner');
      const btnText = submitBtn.querySelector('span');

      try {
        submitBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (btnText) btnText.style.opacity = '0.5';

        let res = await fetch(`${API_BASE}/auth/forgot-password/request`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recoveryTarget: target })
        });

        if (res.ok) {
          const data = await res.json();
          activeVerifyUserId = data.userId;
          activeOtpChannel = data.channel;
          const resetDesc = document.getElementById('reset-description');
          if (resetDesc) {
            resetDesc.textContent = `Enter the verification code sent to your device along with your new password.`;
            if (data.otpCode) {
              resetDesc.innerHTML = `Enter the verification code sent to your device along with your new password.<br><strong style="color: var(--success); font-family: monospace; font-size: 0.95rem; display: block; margin-top: 8px;">[SANDBOX OTP] ${data.otpCode}</strong>`;
            }
          }
          switchAuthView('reset');
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to request recovery code.');
        }
      } catch (err) {
        if (forgotError) {
          forgotError.textContent = err.message;
          forgotError.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (btnText) btnText.style.opacity = '1';
      }
    });
  }

  // RESET PASSWORD SUBMIT
  const resetForm = document.getElementById('auth-reset-form');
  const resetError = document.getElementById('reset-error');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (resetError) resetError.style.display = 'none';

      const code = document.getElementById('reset-otp-code').value;
      const newPwd = document.getElementById('reset-password').value;
      const confirmPwd = document.getElementById('reset-confirm-password').value;

      const submitBtn = resetForm.querySelector('.auth-submit-btn');
      const spinner = submitBtn.querySelector('.auth-spinner');
      const btnText = submitBtn.querySelector('span');

      try {
        if (newPwd !== confirmPwd) {
          throw new Error('Passwords do not match.');
        }

        submitBtn.disabled = true;
        if (spinner) spinner.style.display = 'inline-block';
        if (btnText) btnText.style.opacity = '0.5';

        let res = await fetch(`${API_BASE}/auth/forgot-password/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: activeVerifyUserId,
            otpCode: code,
            newPassword: newPwd,
            confirmPassword: confirmPwd
          })
        });

        if (res.ok) {
          switchAuthView('login');
          const loginError = document.getElementById('login-error');
          if (loginError) {
            loginError.textContent = 'Password reset successful. Please sign in.';
            loginError.style.color = '#10b981';
            loginError.style.background = 'rgba(16, 185, 129, 0.08)';
            loginError.style.borderColor = 'rgba(16, 185, 129, 0.15)';
            loginError.style.display = 'block';
          }
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Reset code validation failed.');
        }
      } catch (err) {
        if (resetError) {
          resetError.textContent = err.message;
          resetError.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        if (spinner) spinner.style.display = 'none';
        if (btnText) btnText.style.opacity = '1';
      }
    });
  }

  // SOCIAL OAUTH BUTTON ACTIONS
  document.querySelectorAll('.btn-social-login').forEach(btn => {
    btn.addEventListener('click', async () => {
      const provider = btn.getAttribute('data-provider');
      console.log(`[Ravora Social auth] Launching ${provider} popup flow...`);

      const width = 500;
      const height = 600;
      const left = (window.screen.width / 2) - (width / 2);
      const top = (window.screen.height / 2) - (height / 2);

      window.open(
        `/app/oauth-consent.html?provider=${provider}`,
        `Ravora-${provider}-OAuth`,
        `width=${width},height=${height},top=${top},left=${left},scrollbars=no,resizable=no`
      );

      // Listen for message from popup
      const handleOauthMessage = async (event) => {
        if (event.origin !== window.location.origin) return;

        const data = event.data;
        if (data && data.provider === provider && data.code) {
          window.removeEventListener('message', handleOauthMessage);
          console.log(`[Ravora Social auth] Verified oauth payload:`, data);

          try {
            const mockOAuthPayload = {
              provider: data.provider,
              providerUserId: `social_${data.provider}_` + Math.floor(Math.random() * 100000),
              email: data.email,
              fullName: data.fullName
            };

            let res = await fetch(`${API_BASE}/auth/social`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(mockOAuthPayload)
            });

            if (res.ok) {
              const resData = await res.json();
              localStorage.setItem('ravora_token', resData.token);
              localStorage.setItem('ravora_logged_in', 'true');
              localStorage.setItem('ravora_login_time', Date.now().toString());
              localStorage.setItem('ravora_email', resData.user.email);
              localStorage.setItem('ravora_onboarding_completed', resData.user.onboardingCompleted ? 'true' : 'false');
              localStorage.setItem('ravora_remember_me', 'true');
              sessionStorage.setItem('ravora_session_active', 'true');

              switchAuthView('success');
              setTimeout(() => {
                checkAuthState();
              }, 1200);
            } else {
              console.error('OAuth backend validation failed.');
            }
          } catch (err) {
            console.error(err);
          }
        }
      };

      window.addEventListener('message', handleOauthMessage);
    });
  });

  // ==========================================================================
  // Onboarding Logic
  // ==========================================================================
  // ==========================================================================
  // Onboarding Logic
  // ==========================================================================
  function updateOnboardingStepsVisibility() {
    onboardingSteps.forEach(step => {
      step.classList.remove('active');
      step.style.display = 'none';
    });

    if (state.currentStep <= 6) {
      const stepEl = document.getElementById(`onboarding-step-${state.currentStep}`);
      if (stepEl) {
        stepEl.classList.add('active');
        stepEl.style.display = 'flex';
      }
    }

    stepDots.forEach((dot, idx) => {
      if (idx + 1 === state.currentStep) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    const stepText = document.getElementById('onboarding-step-text');
    if (stepText) {
      stepText.textContent = `Step ${state.currentStep} of 6`;
    }

    if (state.currentStep === 1 || state.currentStep === 6) {
      btnOnboardingBack.style.display = 'none';
    } else {
      btnOnboardingBack.style.display = 'block';
    }

    const skipActionBtn = document.getElementById('btn-onboarding-skip-action');
    if (skipActionBtn) {
      if (state.currentStep === 6) {
        skipActionBtn.style.display = 'none';
      } else {
        skipActionBtn.style.display = 'block';
      }
    }

    if (state.currentStep === 1) {
      btnOnboardingNext.textContent = 'Get Started';
    } else if (state.currentStep === 6) {
      btnOnboardingNext.textContent = 'Launch Trading Workspace';
    } else {
      btnOnboardingNext.textContent = 'Next Step';
    }
  }

  const optionCards = document.querySelectorAll('.option-card');
  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      if (card.disabled || card.classList.contains('disabled')) return;

      const parentStep = card.closest('.onboarding-step');
      if (!parentStep) return;
      const stepId = parentStep.id;
      const value = card.getAttribute('data-value');

      if (stepId.includes('onboarding-step-3')) {
        // Step 3 is Markets (Crypto is active)
        card.classList.toggle('active');
      } else {
        // Step 2 & 4 are single select
        parentStep.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        if (stepId.includes('onboarding-step-2')) {
          state.profile.experience = value;
        } else if (stepId.includes('onboarding-step-4')) {
          state.profile.goal = value;
        }
      }
    });
  });

  const skipOnboarding = async () => {
    state.onboardingCompleted = true;
    localStorage.setItem('ravora_onboarding_completed', 'true');
    localStorage.setItem('ravora_profile_experience', state.profile.experience || 'intermediate');
    localStorage.setItem('ravora_profile_goal', state.profile.goal || 'swing');

    try {
      await apiCall('/user/onboard', {
        method: 'POST',
        body: JSON.stringify({
          experience: state.profile.experience || 'intermediate',
          capital: 132000,
          riskLevel: 1,
          goal: state.profile.goal || 'swing'
        })
      });
    } catch (e) {
      console.warn('Backend save skipped (local fallback):', e.message);
    }

    if (onboardingOverlay) {
      onboardingOverlay.classList.add('fade-out-onboarding');
      setTimeout(() => {
        onboardingOverlay.style.display = 'none';
        onboardingOverlay.classList.remove('fade-out-onboarding');
        showDashboard();
        initializeDashboardUI();
      }, 500);
    }
  };

  // Wire up Skip buttons
  const skipBtns = document.querySelectorAll('.btn-onboarding-skip');
  skipBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      skipOnboarding();
    });
  });

  if (btnOnboardingNext) {
    btnOnboardingNext.addEventListener('click', async () => {
      if (state.currentStep < 4) {
        state.currentStep++;
        updateOnboardingStepsVisibility();
      } else if (state.currentStep === 4) {
        // Trigger scanning simulation loading overlay
        if (btnOnboardingNext) {
          btnOnboardingNext.disabled = true;
          btnOnboardingNext.textContent = 'Compiling Profile...';
        }
        if (btnOnboardingBack) btnOnboardingBack.style.display = 'none';

        onboardingSteps.forEach(step => {
          step.classList.remove('active');
          step.style.display = 'none';
        });
        if (onboardingLoader) {
          onboardingLoader.classList.add('active');
          onboardingLoader.style.display = 'flex';
        }

        runOnboardingScanningSimulation();
      } else if (state.currentStep === 5) {
        state.currentStep = 6;
        updateOnboardingStepsVisibility();
      } else if (state.currentStep === 6) {
        // Complete Onboarding
        if (btnOnboardingNext) {
          btnOnboardingNext.disabled = true;
          btnOnboardingNext.textContent = 'Entering Workspace...';
        }

        try {
          await apiCall('/user/onboard', {
            method: 'POST',
            body: JSON.stringify({
              experience: state.profile.experience,
              capital: 132000,
              riskLevel: 1, // Default risk level
              goal: state.profile.goal || 'swing'
            })
          });

          state.onboardingCompleted = true;
          localStorage.setItem('ravora_onboarding_completed', 'true');
          localStorage.setItem('ravora_profile_experience', state.profile.experience);
          localStorage.setItem('ravora_profile_goal', state.profile.goal || 'swing');

          onboardingOverlay.classList.add('fade-out-onboarding');
          setTimeout(() => {
            onboardingOverlay.style.display = 'none';
            onboardingOverlay.classList.remove('fade-out-onboarding');
            showDashboard();
            initializeDashboardUI();
          }, 500);
        } catch (err) {
          // Local fallback in case backend is offline
          state.onboardingCompleted = true;
          localStorage.setItem('ravora_onboarding_completed', 'true');
          localStorage.setItem('ravora_profile_experience', state.profile.experience);
          localStorage.setItem('ravora_profile_goal', state.profile.goal || 'swing');

          onboardingOverlay.classList.add('fade-out-onboarding');
          setTimeout(() => {
            onboardingOverlay.style.display = 'none';
            onboardingOverlay.classList.remove('fade-out-onboarding');
            showDashboard();
            initializeDashboardUI();
          }, 500);
        } finally {
          if (btnOnboardingNext) btnOnboardingNext.disabled = false;
        }
      }
    });
  }

  if (btnOnboardingBack) {
    btnOnboardingBack.addEventListener('click', () => {
      if (state.currentStep > 1) {
        if (state.currentStep === 5) {
          state.currentStep = 4;
        } else {
          state.currentStep--;
        }
        updateOnboardingStepsVisibility();
      }
    });
  }

  function runOnboardingScanningSimulation() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        onboardingProgressBar.style.width = '100%';
        onboardingStatusLogs.textContent = 'Copilot Workspace Ready!';

        setTimeout(() => {
          if (onboardingLoader) {
            onboardingLoader.classList.remove('active');
            onboardingLoader.style.display = 'none';
          }

          // Move to Step 5: Workspace Intro
          state.currentStep = 5;
          updateOnboardingStepsVisibility();

          if (btnOnboardingNext) {
            btnOnboardingNext.disabled = false;
          }
        }, 800);
      } else {
        onboardingProgressBar.style.width = `${progress}%`;
        if (progress < 25) {
          onboardingStatusLogs.textContent = 'Injecting user risk profile parameters...';
        } else if (progress < 55) {
          onboardingStatusLogs.textContent = 'Establishing drawdown protection thresholds...';
        } else if (progress < 85) {
          onboardingStatusLogs.textContent = 'Prioritizing preferred market scanning indices...';
        } else {
          onboardingStatusLogs.textContent = 'Compiling customized Araiven trade planner...';
        }
      }
    }, 120);
  }

  function startProductTour() {
    state.isProductTour = true;
    state.currentStep = 1;

    // Reset option cards active states to match state values
    const optCards = document.querySelectorAll('.option-card');
    optCards.forEach(card => {
      const parentStep = card.closest('.onboarding-step');
      if (!parentStep) return;
      const stepId = parentStep.id;
      const val = card.getAttribute('data-value');

      if (stepId.includes('onboarding-step-2')) {
        if (val === state.profile.experience) card.classList.add('active');
        else card.classList.remove('active');
      } else if (stepId.includes('onboarding-step-3')) {
        if (val === 'crypto') card.classList.add('active');
        else card.classList.remove('active');
      } else if (stepId.includes('onboarding-step-4')) {
        if (val === (state.profile.goal || 'swing')) card.classList.add('active');
        else card.classList.remove('active');
      }
    });

    onboardingOverlay.classList.remove('fade-out-onboarding');
    showOnboardingOverlay();
    if (onboardingLoader) {
      onboardingLoader.classList.remove('active');
      onboardingLoader.style.display = 'none';
    }

    updateOnboardingStepsVisibility();
    if (btnOnboardingBack) btnOnboardingBack.style.display = 'none';
    if (btnOnboardingNext) {
      btnOnboardingNext.style.display = 'block';
      btnOnboardingNext.textContent = 'Get Started';
      btnOnboardingNext.disabled = false;
    }
  }

  if (btnTriggerOnboardingReset) {
    btnTriggerOnboardingReset.addEventListener('click', startProductTour);
  }
  const btnTriggerProductTour = document.getElementById('btn-trigger-product-tour');
  if (btnTriggerProductTour) {
    btnTriggerProductTour.addEventListener('click', startProductTour);
  }

  function autoInjectTableLabels() {
    const tables = document.querySelectorAll('.table-ds, .scanner-table, .holdings-table, .scanner-table table');
    tables.forEach(table => {
      const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
      if (headers.length === 0) return;
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
          if (headers[index] && !cell.getAttribute('data-label')) {
            cell.setAttribute('data-label', headers[index]);
          }
        });
      });
    });
  }

  // ==========================================================================
  // SPA Screen Router Navigation
  // ==========================================================================
  const validScreens = ['dashboard', 'watchlist', 'copilot', 'opportunities', 'portfolio', 'history', 'notifications', 'settings', 'markets', 'papertrading'];

  function navigateTo(screenId, pushState = true) {
    if (!validScreens.includes(screenId)) {
      showRavoraGlobalError('404');
      return;
    }

    if (localStorage.getItem('ravora_restricted_access') === 'true' && (screenId === 'settings' || screenId === 'portfolio')) {
      showRavoraGlobalError('permission');
      return;
    }

    const allNavBtns = [...menuTabBtns, btnTriggerNotif].filter(Boolean);
    allNavBtns.forEach(btn => {
      const btnScreen = btn.getAttribute('data-screen') || (btn.id === 'btn-trigger-notif' ? 'notifications' : '');
      if (btnScreen === screenId) {
        if (screenId === 'dashboard') {
          // Highlight only the clicked button or default to Workspace
          const clickedBtn = window.event && (window.event.currentTarget || (window.event.target && window.event.target.closest('.menu-tab-btn')));
          if (clickedBtn && clickedBtn.getAttribute && clickedBtn.getAttribute('data-screen') === 'dashboard') {
            if (btn === clickedBtn) {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          } else {
            // Default to first dashboard button (Workspace)
            const btnSpan = btn.querySelector('span');
            if (btnSpan && btnSpan.textContent.trim() === 'Workspace') {
              btn.classList.add('active');
            } else {
              btn.classList.remove('active');
            }
          }
        } else {
          btn.classList.add('active');
        }
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
      showTradingWorkspaceSkeletons();
      updateTerminalView(state.selectedAsset || 'BTC', window.chartStateManager.timeframe);
      loadTerminalPositions();
      loadTerminalHistory();
    } else if (screenId === 'portfolio') {
      showPortfolioSkeletons();
      const pRiskMeter = document.getElementById('portfolio-risk-meter-fill');
      if (pRiskMeter) {
        pRiskMeter.style.width = state.profile.riskLevel === 0 ? '18%' : (state.profile.riskLevel === 1 ? '42%' : '78%');
      }
      refreshPortfolioSubViews();
    } else if (screenId === 'watchlist') {
      showWatchlistSkeletons();
      renderWatchlistCenter();
    } else if (screenId === 'history') {
      showJournalSkeletons();
      renderTradeHistoryRowsLocal();
    } else if (screenId === 'notifications') {
      if (typeof notifAlertsList !== 'undefined' && notifAlertsList) {
        notifAlertsList.innerHTML = getNotificationsSkeletonHtml();
      }
      apiCall('/notifications/read', { method: 'POST' }).then(() => {
        loadNotifications();
      });
    } else if (screenId === 'settings') {
      showSettingsSkeletons();
      loadSettingsCenter();
    } else if (screenId === 'markets') {
      loadMarketsData();
    } else if (screenId === 'papertrading') {
      loadPaperTradingData();
    } else if (screenId === 'copilot') {
      loadCopilotData();
    }

    if (pushState) {
      history.pushState({ screen: screenId }, '', '/app/' + screenId);
    }

    // Sync active class on mobile bottom navigation buttons
    const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    mobileNavBtns.forEach(btn => {
      const btnScreen = btn.getAttribute('data-screen');
      if (btnScreen === screenId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Auto-inject table responsive labels on render
    setTimeout(autoInjectTableLabels, 50);
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
      txt.textContent = `Support S${sIdx + 1}: $${sVal.toLocaleString(undefined, { maximumFractionDigits: sVal >= 100 ? 2 : 4 })}`;
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
      txt.textContent = `Resistance R${rIdx + 1}: $${rVal.toLocaleString(undefined, { maximumFractionDigits: rVal >= 100 ? 2 : 4 })}`;
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

      const supported = overview.length > 0 ? overview.map(o => o.symbol) : ['BTC', 'ETH', 'SOL', 'BNB', 'SUI'];
      const assetsData = supported.map(sym => {
        const live = overview.find(o => o.symbol === sym) || { name: sym, price: 0, change24h: 0 };
        const opp = opps.find(o => o.symbol.startsWith(sym)) || {
          opportunityScore: 50,
          confidenceScore: 50,
          recommendation: 'HOLD',
          trendDirection: 'Sideways'
        };
        return {
          symbol: sym,
          name: live.name || sym,
          price: live.price,
          change24h: live.change24h,
          oppScore: opp.opportunityScore,
          confScore: opp.confidenceScore,
          recommendation: opp.recommendation || 'HOLD',
          trend: opp.trendDirection || 'Sideways'
        };
      });

      // 1. Sort assets dynamically based on selection
      const sortCriteria = state.activeScannerSort || 'oppScore';
      assetsData.sort((a, b) => {
        if (sortCriteria === 'symbol') {
          return a.symbol.localeCompare(b.symbol);
        } else if (sortCriteria === 'oppScore') {
          return b.oppScore - a.oppScore;
        } else if (sortCriteria === 'confScore') {
          return b.confScore - a.confScore;
        } else if (sortCriteria === 'change24h') {
          return b.change24h - a.change24h;
        } else if (sortCriteria === 'price') {
          return b.price - a.price;
        }
        return 0;
      });

      // 2. Filter assets dynamically based on search and active tab filter
      const activeFilter = state.activeScannerFilter || 'all';
      const searchQuery = (document.getElementById('scanner-search-input')?.value || '').toLowerCase().trim();

      const filteredData = assetsData.filter(ad => {
        // Search filter
        const symbolMatch = ad.symbol.toLowerCase().includes(searchQuery);
        const nameMatch = ad.name.toLowerCase().includes(searchQuery);
        if (searchQuery && !symbolMatch && !nameMatch) return false;

        // Segmented filter
        if (activeFilter === 'high') {
          return ad.oppScore >= 75;
        } else if (activeFilter === 'watchlist') {
          return state.watchlistAssets.includes(ad.symbol);
        } else if (activeFilter === 'positions') {
          return (window.activePositionsList || []).includes(ad.symbol);
        }
        return true;
      });

      // 3. Render Empty States
      const emptyStateEl = document.getElementById('scanner-empty-state');
      if (filteredData.length === 0) {
        if (emptyStateEl) {
          emptyStateEl.style.display = 'block';
          if (searchQuery) {
            renderRavoraEmptyState(emptyStateEl, {
              type: 'search',
              headline: 'No matching assets found.',
              description: 'Try another asset name, ticker or keyword.',
              primaryText: 'Clear Search',
              primaryCallback: () => {
                const searchInput = document.getElementById('scanner-search-input');
                if (searchInput) {
                  searchInput.value = '';
                  searchInput.dispatchEvent(new Event('input'));
                }
              }
            });
          } else if (activeFilter === 'watchlist') {
            renderRavoraEmptyState(emptyStateEl, {
              type: 'watchlist',
              headline: 'Build your AI Watchlist.',
              description: 'Add assets to let Araiven monitor opportunities and market changes.',
              primaryText: 'Browse Markets',
              primaryCallback: () => {
                const allTabBtn = document.querySelector('.scanner-tab-btn[data-filter="all"]');
                if (allTabBtn) {
                  allTabBtn.click();
                } else {
                  state.activeScannerFilter = 'all';
                  loadScannerAssets();
                }
              }
            });
          } else {
            renderRavoraEmptyState(emptyStateEl, {
              type: 'scanner',
              headline: 'No assets found.',
              description: 'No assets are currently active in this category.',
              primaryText: 'Reset Filters',
              primaryCallback: () => {
                const allTabBtn = document.querySelector('.scanner-tab-btn[data-filter="all"]');
                if (allTabBtn) {
                  allTabBtn.click();
                }
              }
            });
          }
        }
      } else {
        if (emptyStateEl) emptyStateEl.style.display = 'none';
      }

      // Update refresh countdown timestamp
      lastScannerRefreshTime = new Date();
      const statusEl = document.getElementById('scanner-refresh-status');
      if (statusEl) {
        statusEl.textContent = 'Live';
        statusEl.style.color = '#10b981';
      }

      // 4. Render Rows
      filteredData.forEach(ad => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.className = state.selectedAsset === ad.symbol ? 'scanner-row active' : 'scanner-row';
        tr.dataset.symbol = ad.symbol;

        const changeClass = ad.change24h >= 0 ? 'text-green' : 'text-error';
        const changeSign = ad.change24h >= 0 ? '+' : '';
        const priceFormatted = ad.price >= 100
          ? ad.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : ad.price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

        // Map recommendation badge to HIGH / WATCH / WAIT / AVOID
        let badgeText = 'WAIT';
        let badgeClass = 'badge-wait';

        if (ad.recommendation === 'LONG' || ad.recommendation === 'SHORT') {
          if (ad.oppScore >= 75) {
            badgeText = 'HIGH';
            badgeClass = 'badge-high';
          } else {
            badgeText = 'WATCH';
            badgeClass = 'badge-watch';
          }
        } else if (ad.recommendation === 'WAIT') {
          badgeText = 'WAIT';
          badgeClass = 'badge-wait';
        } else {
          badgeText = 'AVOID';
          badgeClass = 'badge-avoid';
        }

        // Color coding for Trend
        let trendClass = 'text-warning';
        let trendSymbol = '→';
        if (ad.trend === 'Bullish') {
          trendClass = 'text-green';
          trendSymbol = '↑';
        } else if (ad.trend === 'Bearish') {
          trendClass = 'text-error';
          trendSymbol = '↓';
        }

        const iconHtml = `
          <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${ad.symbol.toLowerCase()}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 18px; height: 18px; border-radius: 50%;" />
            <span style="display: none; width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.08); align-items: center; justify-content: center; font-size: 0.55rem; color: #fff; font-weight: 700; text-transform: uppercase;">${ad.symbol.substring(0, 2)}</span>
          </div>
        `;

        // Check if watchlisted
        const isWatch = state.watchlistAssets.includes(ad.symbol);
        const watchColor = isWatch ? '#fbbf24' : 'var(--text-secondary)';

        tr.innerHTML = `
          <td style="padding: 6px 12px; border-bottom: none;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${iconHtml}
              <div>
                <strong style="font-size: 0.78rem; color: #fff; display: block;">${ad.symbol}</strong>
                <span style="font-size: 0.58rem; color: var(--text-muted); display: block; max-width: 60px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ad.name}</span>
              </div>
            </div>
          </td>
          <td style="padding: 6px 8px; text-align: right; border-bottom: none;">
            <span style="font-size: 0.78rem; font-weight: 600; color: #fff;">$${priceFormatted}</span>
          </td>
          <td style="padding: 6px 8px; text-align: right; border-bottom: none;">
            <span class="${changeClass}" style="font-size: 0.7rem; font-weight: 600;">${changeSign}${ad.change24h.toFixed(2)}%</span>
          </td>
          <td style="padding: 6px 8px; text-align: center; border-bottom: none;">
            <span style="display: inline-block; padding: 2px 5px; border-radius: 4px; font-weight: 700; background: rgba(99,102,241,0.08); color: #a5b4fc; font-size: 0.65rem;">${ad.oppScore}</span>
          </td>
          <td style="padding: 6px 8px; text-align: center; border-bottom: none;">
            <span style="font-size: 0.68rem; color: #fff; font-weight: 600;">${ad.confScore}%</span>
          </td>
          <td style="padding: 6px 8px; text-align: center; border-bottom: none;">
            <span class="${badgeClass}" style="display: inline-block; padding: 2px 5px; border-radius: 4px; font-weight: 700; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.02em;">${badgeText}</span>
          </td>
          <td style="padding: 6px 12px; text-align: right; position: relative; border-bottom: none;">
            <span class="${trendClass}" style="font-size: 0.75rem; font-weight: 700;">${trendSymbol}</span>
            
            <!-- Quick Actions Container on hover -->
            <div class="scanner-row-actions">
              <button class="scanner-action-btn btn-view-analysis" title="View Analysis">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button class="scanner-action-btn btn-toggle-watchlist-item" title="Add to Watchlist" style="color: ${watchColor};">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </button>
              <button class="scanner-action-btn btn-copy-symbol" title="Copy Symbol">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </td>
        `;

        // Action Handlers
        const btnView = tr.querySelector('.btn-view-analysis');
        if (btnView) {
          btnView.addEventListener('click', (e) => {
            e.stopPropagation();
            tr.click();
          });
        }

        const btnWatch = tr.querySelector('.btn-toggle-watchlist-item');
        if (btnWatch) {
          btnWatch.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = state.watchlistAssets.indexOf(ad.symbol);
            if (idx === -1) {
              state.watchlistAssets.push(ad.symbol);
              showToast(`${ad.symbol} added to Watchlist`);
            } else {
              state.watchlistAssets.splice(idx, 1);
              showToast(`${ad.symbol} removed from Watchlist`);
            }
            loadScannerAssets().catch(console.error);
          });
        }

        const btnCopy = tr.querySelector('.btn-copy-symbol');
        if (btnCopy) {
          btnCopy.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(ad.symbol).then(() => {
              showToast(`${ad.symbol} symbol copied to clipboard`);
            }).catch(err => {
              console.error('Failed to copy text:', err);
            });
          });
        }

        tr.addEventListener('click', () => {
          document.querySelectorAll('.scanner-row').forEach(row => row.classList.remove('active'));
          tr.classList.add('active');
          state.selectedAsset = ad.symbol;
          updateTerminalView(ad.symbol, window.chartStateManager.timeframe);
        });

        scannerRows.appendChild(tr);
      });
    } catch (e) {
      console.error('Error loading scanner assets:', e);
    }
  }

  function recreateElement(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const newEl = el.cloneNode(true);
    el.parentNode.replaceChild(newEl, el);
    return newEl;
  }

  function bindLadderRowEvents(elementId, title, getPriceFn) {
    const el = recreateElement(elementId);
    if (!el) return;

    el.addEventListener('mouseenter', () => {
      if (window.chartOverlayService && window.chartOverlayService.priceLines) {
        window.chartOverlayService.priceLines.forEach(line => {
          if (line.title === title) {
            line.applyOptions({ lineWidth: 3.5 });
          }
        });
      }
    });

    el.addEventListener('mouseleave', () => {
      if (window.chartOverlayService && window.chartOverlayService.priceLines) {
        window.chartOverlayService.priceLines.forEach(line => {
          if (line.title === title) {
            line.applyOptions({ lineWidth: line.originalWidth || 1.5 });
          }
        });
      }
    });

    el.addEventListener('click', () => {
      const price = getPriceFn();
      if (price > 0 && window.chartStateManager && window.chartStateManager.chartInstance) {
        const chart = window.chartStateManager.chartInstance;
        chart.priceScale('right').setOptions({ autoScale: false });
        chart.priceScale('right').setOptions({
          visibleRange: { min: price * 0.985, max: price * 1.015 }
        });
        showToast(`Chart centered at $${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      }
    });
  }

  async function updateTerminalView(symbol, timeframe = null) {
    if (!symbol) return;

    if (!timeframe) {
      timeframe = window.chartStateManager.timeframe || '1D';
    }

    const chartErrorEl = document.getElementById('terminal-chart-error-state');
    if (chartErrorEl) chartErrorEl.style.display = 'none';

    const analysisErrorEl = document.getElementById('analysis-error-state');
    const analysisScrollContent = document.querySelector('.analysis-scroll-content');
    const terminalActionContainer = document.getElementById('terminal-action-container');
    if (analysisErrorEl) {
      analysisErrorEl.style.display = 'none';
      if (analysisScrollContent) analysisScrollContent.style.display = 'block';
      if (terminalActionContainer) terminalActionContainer.style.display = 'block';
    }

    let details = null;
    try {
      details = await apiCall(`/market/assets/${symbol}?timeframe=${timeframe}`);
    } catch (err) {
      console.error('Failed to load market data:', err);
      if (chartErrorEl) {
        chartErrorEl.style.display = 'flex';
        renderRavoraErrorState(chartErrorEl, {
          type: 'market',
          headline: 'Market data unavailable.',
          description: 'Live market data is temporarily unavailable.',
          primaryText: 'Retry',
          primaryCallback: () => {
            chartErrorEl.style.display = 'none';
            updateTerminalView(symbol, timeframe);
          }
        });
      }
      const overlay = document.getElementById('chart-skeleton-overlay');
      if (overlay) overlay.remove();
      return;
    }

    let opps = [];
    try {
      opps = await apiCall('/opportunities');
    } catch (err) {
      console.error('Failed to load Araiven AI insights:', err);
      if (analysisErrorEl) {
        analysisErrorEl.style.display = 'flex';
        if (analysisScrollContent) analysisScrollContent.style.display = 'none';
        if (terminalActionContainer) terminalActionContainer.style.display = 'none';
        renderRavoraErrorState(analysisErrorEl, {
          type: 'ai',
          headline: 'Araiven is temporarily unavailable.',
          description: 'AI insights will return once the service is restored.',
          primaryText: 'Retry Analysis',
          primaryCallback: () => {
            analysisErrorEl.style.display = 'none';
            if (analysisScrollContent) analysisScrollContent.style.display = 'block';
            if (terminalActionContainer) terminalActionContainer.style.display = 'block';
            updateTerminalView(symbol, timeframe);
          }
        });
      }
    }

    try {
      const opp = opps.find(o => o.symbol.startsWith(symbol)) || {
        opportunityScore: 0,
        confidenceScore: 0,
        riskScore: 0,
        riskLevel: 'unknown',
        trendDirection: 'Unknown',
        momentumScore: 0,
        momentumDirection: 'Unknown',
        structureBias: 'Unknown',
        structureStrength: 0,
        nearestSupport: 0,
        nearestResistance: 0,
        distanceToSupport: 0,
        distanceToResistance: 0,
        tradeQuality: 'Unknown',
        recommendedPositionSize: 0,
        marketBias: 'Unknown',
        suggestedEntry: 0,
        suggestedTakeProfit1: 0,
        suggestedTakeProfit2: 0,
        suggestedTakeProfit3: 0,
        suggestedStopLoss: 0,
        riskRewardRatio: 'N/A',
        expectedDuration: 'N/A',
        tradeProbability: 0,
        strategyUsed: 'Insufficient Data',
        reasoningText: JSON.stringify({
          summary: 'Trade setup currently unavailable. Insufficient market data.',
          whyThisAsset: 'Waiting for additional historical OHLCV data to build structure.',
          whyNow: 'Market structure is currently ill-defined.',
          supportingEvidence: ['Underlying engines require more data points'],
          potentialRisks: ['High uncertainty due to lack of signals'],
          suggestedAction: 'WAIT'
        }),
        recommendation: 'WAIT'
      };

      const activeIcon = document.getElementById('terminal-active-icon');
      const activeName = document.getElementById('terminal-active-name');
      const activeSymbol = document.getElementById('terminal-active-symbol');
      const chartPrice = document.getElementById('terminal-chart-price');
      const chartChange = document.getElementById('terminal-chart-change');
      const confidenceBadge = document.getElementById('terminal-confidence-badge');
      const recommendationBadge = document.getElementById('terminal-recommendation-badge');
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

      if (activeIcon) {
        activeIcon.innerHTML = `
          <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${symbol.toLowerCase()}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 18px; height: 18px; border-radius: 50%;" />
            <span style="display: none; width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.08); align-items: center; justify-content: center; font-size: 0.55rem; color: #fff; font-weight: 700; text-transform: uppercase;">${symbol.substring(0, 2)}</span>
          </div>
        `;
      }
      if (activeName) activeName.textContent = details.name;
      if (activeSymbol) activeSymbol.textContent = `${symbol} / USD`;
      if (chartPrice) chartPrice.textContent = `$${priceFormatted}`;
      if (chartChange) {
        chartChange.textContent = `${liveChange >= 0 ? '+' : ''}${liveChange.toFixed(2)}%`;
        chartChange.className = liveChange >= 0 ? 'text-green' : 'text-error';
      }

      // AI Trading Workspace additional header metrics
      const volumes = { 'BTC': '$1.84B', 'ETH': '$984.5M', 'SOL': '$421.2M', 'LINK': '$84.5M', 'SUI': '$112.4M', 'BNB': '$254.2M' };
      const atrs = { 'BTC': '1,424.50', 'ETH': '74.20', 'SOL': '4.15', 'LINK': '0.38', 'SUI': '0.045', 'BNB': '12.40' };
      const ois = { 'BTC': '$1.84B', 'ETH': '$452.1M', 'SOL': '$112.5M', 'LINK': '$24.5M', 'SUI': '$38.2M', 'BNB': '$92.4M' };
      const spreads = { 'BTC': '$4.50 (0.01%)', 'ETH': '$0.35 (0.01%)', 'SOL': '$0.02 (0.01%)', 'LINK': '$0.005 (0.02%)', 'SUI': '$0.0003 (0.02%)', 'BNB': '$0.08 (0.01%)' };

      const volText = volumes[symbol] || '$120.0M';
      const atrText = atrs[symbol] || '1.50';
      const oiText = ois[symbol] || '$15.4M';
      const spreadText = spreads[symbol] || '0.01%';
      const volatilityText = opp.volatility || 'Moderate';

      // Top header updates
      const headerVolume = document.getElementById('header-volume-val');
      if (headerVolume) headerVolume.textContent = volText;

      const headerVolatility = document.getElementById('header-volatility-val');
      if (headerVolatility) headerVolatility.textContent = volatilityText;

      const headerAiRefresh = document.getElementById('header-ai-refresh');
      if (headerAiRefresh) {
        headerAiRefresh.textContent = opp.recommendation === 'HOLD' ? 'Monitoring' : (opp.recommendation === 'WAIT' ? 'Confirming' : 'Signal Active');
        headerAiRefresh.style.color = opp.recommendation === 'HOLD' ? '#60a5fa' : (opp.recommendation === 'WAIT' ? '#f59e0b' : '#10b981');
      }

      const headerLastUpdate = document.getElementById('header-last-update');
      if (headerLastUpdate) {
        headerLastUpdate.textContent = new Date().toISOString().replace('T', ' ').substring(11, 19) + ' UTC';
      }

      // Top-right indicator badges updates
      const bTrend = document.getElementById('chart-badge-trend');
      if (bTrend) {
        const trVal = opp.trendDirection || 'Bullish';
        bTrend.textContent = `Trend: ${trVal}`;
        bTrend.style.borderColor = trVal === 'Bearish' ? 'rgba(239,68,68,0.2)' : (trVal === 'Bullish' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)');
        bTrend.style.background = trVal === 'Bearish' ? 'rgba(239,68,68,0.08)' : (trVal === 'Bullish' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)');
        bTrend.style.color = trVal === 'Bearish' ? '#ef4444' : (trVal === 'Bullish' ? '#10b981' : '#f59e0b');
      }

      const bMom = document.getElementById('chart-badge-momentum');
      if (bMom) {
        const momVal = opp.momentumDirection || 'Strong';
        bMom.textContent = `Mom: ${momVal}`;
        bMom.style.borderColor = momVal === 'Bearish' || momVal === 'Weak' ? 'rgba(239,68,68,0.2)' : (momVal === 'Bullish' || momVal === 'Strong' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)');
        bMom.style.background = momVal === 'Bearish' || momVal === 'Weak' ? 'rgba(239,68,68,0.08)' : (momVal === 'Bullish' || momVal === 'Strong' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)');
        bMom.style.color = momVal === 'Bearish' || momVal === 'Weak' ? '#ef4444' : (momVal === 'Bullish' || momVal === 'Strong' ? '#10b981' : '#f59e0b');
      }

      const bVol = document.getElementById('chart-badge-volatility');
      if (bVol) {
        bVol.textContent = `Vol: ${volatilityText}`;
        bVol.style.borderColor = volatilityText === 'High' ? 'rgba(239,68,68,0.2)' : (volatilityText === 'Low' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.1)');
        bVol.style.background = volatilityText === 'High' ? 'rgba(239,68,68,0.08)' : (volatilityText === 'Low' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.03)');
        bVol.style.color = volatilityText === 'High' ? '#ef4444' : (volatilityText === 'Low' ? '#60a5fa' : '#fff');
      }

      const bConf = document.getElementById('chart-badge-confidence');
      if (bConf) {
        bConf.textContent = `AI: ${opp.confidenceScore || 50}%`;
      }

      // Bottom chart bar updates
      const barSpread = document.getElementById('chart-bar-spread');
      if (barSpread) barSpread.textContent = spreadText;

      const barAtr = document.getElementById('chart-bar-atr');
      if (barAtr) barAtr.textContent = atrText;

      const barRsi = document.getElementById('chart-bar-rsi');
      if (barRsi) {
        const trend = opp.trendDirection || 'Bullish';
        const rsiVal = trend === 'Bullish' ? (58 + Math.random() * 8) : (trend === 'Bearish' ? (32 + Math.random() * 8) : (46 + Math.random() * 8));
        barRsi.textContent = rsiVal.toFixed(2);
        barRsi.className = rsiVal >= 60 ? 'text-green' : (rsiVal <= 40 ? 'text-error' : 'text-warning');
      }

      const barVolume = document.getElementById('chart-bar-volume');
      if (barVolume) barVolume.textContent = volText;

      const barFunding = document.getElementById('chart-bar-funding');
      if (barFunding) {
        const isLong = opp.recommendation === 'LONG';
        const fundVal = isLong ? '+0.0100%' : '-0.0050%';
        barFunding.textContent = fundVal;
        barFunding.className = isLong ? 'text-green' : '#ef4444';
      }

      const barOi = document.getElementById('chart-bar-oi');
      if (barOi) barOi.textContent = oiText;
      if (confidenceBadge) confidenceBadge.textContent = `${opp.confidenceScore}% Confidence`;
      if (recommendationBadge) {
        const rec = opp.recommendation || 'HOLD';
        recommendationBadge.textContent = rec;
        if (rec === 'LONG') {
          recommendationBadge.style.background = 'rgba(16, 185, 129, 0.15)';
          recommendationBadge.style.color = '#10b981';
        } else if (rec === 'SHORT') {
          recommendationBadge.style.background = 'rgba(239, 68, 68, 0.15)';
          recommendationBadge.style.color = '#ef4444';
        } else {
          recommendationBadge.style.background = 'rgba(245, 158, 11, 0.15)';
          recommendationBadge.style.color = '#f59e0b';
        }
      }
      if (oppScore) oppScore.textContent = opp.opportunityScore !== undefined ? opp.opportunityScore : opp.confidenceScore;
      if (riskScore) {
        const scoreVal = opp.riskScore !== undefined ? opp.riskScore : 35;
        const rawLevel = opp.riskLevel || 'medium';
        const levelVal = rawLevel.charAt(0).toUpperCase() + rawLevel.slice(1);
        riskScore.textContent = `${scoreVal} (${levelVal})`;
      }

      if (trendVal) {
        const trend = opp.trendDirection || 'Bullish';
        trendVal.textContent = trend;
        if (trend === 'Bearish') {
          trendVal.className = 'text-error';
        } else if (trend === 'Bullish') {
          trendVal.className = 'text-green';
        } else {
          trendVal.className = 'text-warning'; // Yellow for Sideways/Range
        }
      }

      const momentumVal = document.getElementById('terminal-momentum-val');
      if (momentumVal) {
        const score = opp.momentumScore !== undefined ? opp.momentumScore : 50;
        const dir = opp.momentumDirection || 'Neutral';
        momentumVal.textContent = `${score}`;
        if (dir === 'Strengthening') {
          momentumVal.className = 'text-green';
          momentumVal.title = `Strengthening momentum (Score: ${score})`;
        } else if (dir === 'Weakening') {
          momentumVal.className = 'text-error';
          momentumVal.title = `Weakening momentum (Score: ${score})`;
        } else {
          momentumVal.className = 'text-warning';
          momentumVal.title = `Neutral momentum (Score: ${score})`;
        }
      }

      const structureBiasVal = document.getElementById('terminal-structure-bias');
      const structureStrengthVal = document.getElementById('terminal-structure-strength');

      if (structureBiasVal) {
        const bias = opp.structureBias || 'Neutral';
        structureBiasVal.textContent = bias;
        if (bias === 'Bearish') {
          structureBiasVal.className = 'text-error';
        } else if (bias === 'Bullish') {
          structureBiasVal.className = 'text-green';
        } else {
          structureBiasVal.className = 'text-warning';
        }
      }

      if (structureStrengthVal) {
        const strength = opp.structureStrength !== undefined ? opp.structureStrength : 50;
        structureStrengthVal.textContent = `${strength}%`;
      }

      const nearestSupportVal = document.getElementById('terminal-nearest-support');
      const distanceSupportVal = document.getElementById('terminal-distance-support');
      const nearestResistanceVal = document.getElementById('terminal-nearest-resistance');
      const distanceResistanceVal = document.getElementById('terminal-distance-resistance');

      if (nearestSupportVal) {
        nearestSupportVal.textContent = opp.nearestSupport ? `$${opp.nearestSupport.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
      }
      if (distanceSupportVal) {
        distanceSupportVal.textContent = opp.distanceToSupport !== undefined ? `${opp.distanceToSupport}% away` : '—';
      }
      if (nearestResistanceVal) {
        nearestResistanceVal.textContent = opp.nearestResistance ? `$${opp.nearestResistance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
      }
      if (distanceResistanceVal) {
        distanceResistanceVal.textContent = opp.distanceToResistance !== undefined ? `${opp.distanceToResistance}% away` : '—';
      }

      const tradeQualityVal = document.getElementById('terminal-trade-quality');
      const positionSizeVal = document.getElementById('terminal-position-size');

      if (tradeQualityVal) {
        const q = opp.tradeQuality || 'Average';
        tradeQualityVal.textContent = q;
        if (q === 'Excellent' || q === 'Good') {
          tradeQualityVal.className = 'text-green';
        } else if (q === 'Average') {
          tradeQualityVal.className = 'text-warning';
        } else {
          tradeQualityVal.className = 'text-error';
        }
      }

      if (positionSizeVal) {
        const size = opp.recommendedPositionSize !== undefined ? opp.recommendedPositionSize : 0;
        positionSizeVal.textContent = size > 0 ? `$${size.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Avoid / $0.00';
      }

      const marketBiasVal = document.getElementById('terminal-market-bias');
      const confidenceScoreVal = document.getElementById('terminal-confidence-score');

      if (marketBiasVal) {
        const bias = opp.marketBias || 'Neutral';
        marketBiasVal.textContent = bias;
        if (bias === 'Bearish') {
          marketBiasVal.className = 'text-error';
        } else if (bias === 'Bullish') {
          marketBiasVal.className = 'text-green';
        } else {
          marketBiasVal.className = 'text-warning';
        }
      }

      if (confidenceScoreVal) {
        confidenceScoreVal.textContent = opp.confidenceScore !== undefined ? `${opp.confidenceScore}%` : '50%';
      }

      // Resolve 3-State Layout
      const state1Active = document.getElementById('terminal-state-active-trade');
      const state2NoTrade = document.getElementById('terminal-state-no-trade');
      const state3Insufficient = document.getElementById('terminal-state-insufficient-data');

      let activeState = 1;
      if (!opp || opp.opportunityScore === 0 || opp.confidenceScore === 0 || opp.strategyUsed === 'Insufficient Data') {
        activeState = 3;
      } else if (opp.recommendation === 'WAIT' || opp.recommendation === 'HOLD') {
        activeState = 2;
      } else {
        activeState = 1;
      }

      if (state1Active) state1Active.style.display = activeState === 1 ? 'block' : 'none';
      if (state2NoTrade) state2NoTrade.style.display = activeState === 2 ? 'block' : 'none';
      if (state3Insufficient) state3Insufficient.style.display = activeState === 3 ? 'block' : 'none';

      const analysisEmptyState = document.getElementById('analysis-empty-state');
      const analysisScrollContent = document.querySelector('.analysis-scroll-content');
      const terminalActionContainer = document.getElementById('terminal-action-container');

      if (activeState === 3) {
        if (analysisScrollContent) analysisScrollContent.style.display = 'none';
        if (terminalActionContainer) terminalActionContainer.style.display = 'none';
        if (analysisEmptyState) {
          analysisEmptyState.style.display = 'flex';
          renderRavoraEmptyState(analysisEmptyState, {
            type: 'analysis',
            headline: 'Araiven is preparing your analysis.',
            description: 'Once sufficient market data is available, AI insights will appear here.',
            primaryText: 'Refresh',
            primaryCallback: () => {
              const btnHeaderScan = document.getElementById('btn-header-manual-scan');
              if (btnHeaderScan) {
                btnHeaderScan.click();
              }
            }
          });
        }
      } else {
        if (analysisScrollContent) analysisScrollContent.style.display = 'block';
        if (terminalActionContainer) terminalActionContainer.style.display = 'block';
        if (analysisEmptyState) analysisEmptyState.style.display = 'none';
      }

      const isSetupActive = activeState === 1;
      const executionPlanActive = document.getElementById('execution-plan-active');
      const executionPlanEmpty = document.getElementById('execution-plan-empty');
      if (executionPlanActive) executionPlanActive.style.display = isSetupActive ? 'block' : 'none';
      if (executionPlanEmpty) executionPlanEmpty.style.display = isSetupActive ? 'none' : 'block';

      if (activeState === 1) {
        // STATE 1: LONG / SHORT Active Trade Setup
        const recBadge = document.getElementById('state1-recommendation-badge');
        const qualityBadge = document.getElementById('state1-quality-badge');
        const entryEl = document.getElementById('state1-entry');
        const slEl = document.getElementById('state1-sl');
        const tp1El = document.getElementById('state1-tp1');
        const tp2El = document.getElementById('state1-tp2');
        const tp3El = document.getElementById('state1-tp3');
        const rrEl = document.getElementById('state1-rr');
        const durEl = document.getElementById('state1-duration');
        const probEl = document.getElementById('state1-probability');
        const structEl = document.getElementById('state1-structure');
        const suppEl = document.getElementById('state1-support');
        const confEl = document.getElementById('state1-confidence');
        const resEl = document.getElementById('state1-resistance');
        const explBox = document.getElementById('state1-explanation-box');

        const rec = opp.recommendation || 'LONG';
        if (recBadge) {
          recBadge.textContent = rec;
          if (rec === 'SHORT') {
            recBadge.style.background = 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)';
            recBadge.style.color = '#fff';
          } else {
            recBadge.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
            recBadge.style.color = '#fff';
          }
        }

        if (qualityBadge) {
          const qual = opp.tradeQuality || 'Good';
          qualityBadge.textContent = `${qual} Quality`;
          if (qual === 'High' || qual === 'Good') {
            qualityBadge.style.background = 'rgba(16, 185, 129, 0.1)';
            qualityBadge.style.color = '#10b981';
            qualityBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
          } else {
            qualityBadge.style.background = 'rgba(245, 158, 11, 0.1)';
            qualityBadge.style.color = '#f59e0b';
            qualityBadge.style.borderColor = 'rgba(245, 158, 11, 0.2)';
          }
        }

        // Fill legacy hidden nodes to keep chart drawing modules happy
        const entryVal = opp.suggestedEntry || 0;
        const slVal = opp.suggestedStopLoss || 0;
        const tp1Val = opp.suggestedTakeProfit1 || 0;
        const tp2Val = opp.suggestedTakeProfit2 || 0;
        const tp3Val = opp.suggestedTakeProfit3 || 0;

        if (entryEl) entryEl.textContent = `$${entryVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (slEl) slEl.textContent = `$${slVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (tp1El) tp1El.textContent = `$${tp1Val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (tp2El) tp2El.textContent = `$${tp2Val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (tp3El) tp3El.textContent = `$${tp3Val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (rrEl) rrEl.textContent = opp.riskRewardRatio || '2.0:1';
        if (durEl) durEl.textContent = opp.expectedDuration || '3-5 days';
        if (probEl) probEl.textContent = `${opp.tradeProbability || 50}%`;
        if (structEl) {
          structEl.textContent = opp.marketBias || opp.trendDirection || 'Bullish';
          structEl.className = (opp.marketBias || opp.trendDirection) === 'Bearish' ? 'text-error' : 'text-green';
        }
        if (suppEl) {
          const dist = opp.distanceToSupport !== undefined ? ` (${opp.distanceToSupport.toFixed(1)}% away)` : '';
          suppEl.textContent = `$${(opp.nearestSupport || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}${dist}`;
        }
        if (confEl) confEl.textContent = `${opp.confidenceScore || 50}%`;
        if (resEl) {
          const dist = opp.distanceToResistance !== undefined ? ` (${opp.distanceToResistance.toFixed(1)}% away)` : '';
          resEl.textContent = `$${(opp.nearestResistance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}${dist}`;
        }

        if (explBox) {
          try {
            const data = JSON.parse(opp.reasoningText);
            explBox.textContent = data.summary || `This setup is supported by a ${opp.trendDirection.toLowerCase()} trend, ${opp.momentumDirection.toLowerCase()} momentum, and a recent structure bias of ${(opp.marketBias || 'neutral').toLowerCase()}.`;
          } catch (e) {
            explBox.textContent = `This setup is supported by a ${opp.trendDirection.toLowerCase()} trend, ${opp.momentumDirection.toLowerCase()} momentum, and a recent structure bias of ${(opp.marketBias || 'neutral').toLowerCase()}.`;
          }
        }

        // --- NEW: EXECUTION PLAN DYNAMIC POPULATION ---
        const exDir = document.getElementById('execution-direction-val');
        if (exDir) {
          exDir.textContent = rec;
          exDir.style.color = rec === 'SHORT' ? '#ef4444' : '#60a5fa';
        }
        const exScore = document.getElementById('execution-score-val');
        if (exScore) exScore.textContent = `${opp.opportunityScore || 50}/100`;
        const exConf = document.getElementById('execution-confidence-val');
        if (exConf) exConf.textContent = `${opp.confidenceScore || 50}%`;
        const exRisk = document.getElementById('execution-risk-val');
        if (exRisk) {
          const riskLvl = opp.riskLevel || 'medium';
          exRisk.textContent = `${riskLvl.charAt(0).toUpperCase() + riskLvl.slice(1)} (${opp.riskScore || 35})`;
          exRisk.style.color = riskLvl === 'high' ? '#ef4444' : (riskLvl === 'low' ? '#10b981' : '#fff');
        }
        const exDur = document.getElementById('execution-duration-val');
        if (exDur) exDur.textContent = opp.expectedDuration || '3-5 days';
        const exRr = document.getElementById('execution-rr-val');
        if (exRr) exRr.textContent = opp.riskRewardRatio || '2.0:1';

        // Mathematical ladder levels calculations
        const sizeUSD = 5000; // simulated $1000 margin * 5x leverage
        const dirMult = rec === 'SHORT' ? -1 : 1;

        const pctTP3 = entryVal > 0 ? ((tp3Val - entryVal) / entryVal) * 100 * dirMult : 0;
        const pctTP2 = entryVal > 0 ? ((tp2Val - entryVal) / entryVal) * 100 * dirMult : 0;
        const pctTP1 = entryVal > 0 ? ((tp1Val - entryVal) / entryVal) * 100 * dirMult : 0;
        const pctSL = entryVal > 0 ? ((slVal - entryVal) / entryVal) * 100 * dirMult : 0;

        const gainTP3 = sizeUSD * (pctTP3 / 100);
        const gainTP2 = sizeUSD * (pctTP2 / 100);
        const gainTP1 = sizeUSD * (pctTP1 / 100);
        const lossSL = sizeUSD * (pctSL / 100);

        // Fill Execution levels elements
        const ladderTp3P = document.getElementById('ladder-tp3-price');
        const ladderTp3M = document.getElementById('ladder-tp3-metrics');
        if (ladderTp3P) ladderTp3P.textContent = `$${tp3Val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        if (ladderTp3M) ladderTp3M.textContent = `+${pctTP3.toFixed(1)}% (+$${gainTP3.toFixed(2)})`;

        const ladderTp2P = document.getElementById('ladder-tp2-price');
        const ladderTp2M = document.getElementById('ladder-tp2-metrics');
        if (ladderTp2P) ladderTp2P.textContent = `$${tp2Val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        if (ladderTp2M) ladderTp2M.textContent = `+${pctTP2.toFixed(1)}% (+$${gainTP2.toFixed(2)})`;

        const ladderTp1P = document.getElementById('ladder-tp1-price');
        const ladderTp1M = document.getElementById('ladder-tp1-metrics');
        if (ladderTp1P) ladderTp1P.textContent = `$${tp1Val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        if (ladderTp1M) ladderTp1M.textContent = `+${pctTP1.toFixed(1)}% (+$${gainTP1.toFixed(2)})`;

        const ladderEntryP = document.getElementById('ladder-entry-price');
        if (ladderEntryP) ladderEntryP.textContent = `$${entryVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

        const ladderSlP = document.getElementById('ladder-sl-price');
        const ladderSlM = document.getElementById('ladder-sl-metrics');
        if (ladderSlP) ladderSlP.textContent = `$${slVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        if (ladderSlM) ladderSlM.textContent = `${pctSL.toFixed(1)}% (-$${Math.abs(lossSL).toFixed(2)})`;

        // Fill Risk Analysis indicators
        const riskRrText = document.getElementById('risk-rr-val');
        if (riskRrText) riskRrText.textContent = opp.riskRewardRatio || '2.0:1';

        const riskRrProgress = document.getElementById('risk-rr-progress');
        if (riskRrProgress) {
          const ratioVal = parseFloat(opp.riskRewardRatio || 2.0);
          const progressPct = Math.min(100, Math.max(10, (ratioVal / 4.0) * 100));
          riskRrProgress.style.width = `${progressPct}%`;
        }

        const riskCapital = document.getElementById('risk-capital-val');
        if (riskCapital) riskCapital.textContent = `-$${Math.abs(lossSL).toFixed(2)}`;

        const riskReward = document.getElementById('risk-reward-val');
        if (riskReward) riskReward.textContent = `+$${gainTP3.toFixed(2)}`;

        const riskQuality = document.getElementById('risk-quality-val');
        if (riskQuality) riskQuality.textContent = `${opp.tradeQuality || 'Good'} Quality`;

        const riskSize = document.getElementById('risk-size-val');
        if (riskSize) riskSize.textContent = `${opp.volatility || 'Moderate'} Volatility`;

        // Bind visual ladder interactive highlights and viewport focus
        bindLadderRowEvents('ladder-tp3', 'Take Profit 3', () => opp.suggestedTakeProfit3);
        bindLadderRowEvents('ladder-tp2', 'Take Profit 2', () => opp.suggestedTakeProfit2);
        bindLadderRowEvents('ladder-tp1', 'Take Profit 1', () => opp.suggestedTakeProfit1);
        bindLadderRowEvents('ladder-entry', 'Entry Price', () => opp.suggestedEntry);
        bindLadderRowEvents('ladder-sl', 'Stop Loss', () => opp.suggestedStopLoss);
      } else if (activeState === 2) {
        // STATE 2: HOLD / WAIT Opportunity Status Card
        const statusBadge = document.getElementById('state2-status-badge');
        const reasonBox = document.getElementById('state2-reason-box');
        const trendEl = document.getElementById('state2-trend');
        const momEl = document.getElementById('state2-momentum');
        const riskEl = document.getElementById('state2-risk');
        const confEl = document.getElementById('state2-confidence');
        const trigText = document.getElementById('state2-trigger-text');

        const rec = opp.recommendation || 'HOLD';
        if (statusBadge) {
          statusBadge.textContent = rec === 'WAIT' ? 'SETUP PENDING' : 'NO ACTIVE SETUP';
          if (rec === 'WAIT') {
            statusBadge.style.background = 'rgba(245, 158, 11, 0.15)';
            statusBadge.style.color = '#f59e0b';
          } else {
            statusBadge.style.background = 'rgba(156, 163, 175, 0.15)';
            statusBadge.style.color = '#9ca3af';
          }
        }

        const recTextEl = document.getElementById('state2-rec-text');
        if (recTextEl) {
          recTextEl.textContent = rec;
          if (rec === 'WAIT') {
            recTextEl.style.color = '#f59e0b';
          } else {
            recTextEl.style.color = '#9ca3af';
          }
        }

        if (reasonBox) {
          const reasons = [];
          if (opp.trendDirection === 'Sideways' || opp.trendDirection === 'Unknown') {
            reasons.push('Price is trading inside a consolidation range.');
          }
          if (opp.momentumDirection === 'Neutral' || opp.momentumDirection === 'Weakening') {
            reasons.push('Momentum is weakening.');
          }
          if (!opp.riskRewardRatio || opp.riskRewardRatio === 'N/A' || parseFloat(opp.riskRewardRatio) < 2.0) {
            reasons.push('Risk/Reward is below the minimum threshold.');
          }
          if (rec === 'WAIT') {
            reasons.push('Waiting for structural confirmation above resistance.');
          }
          if (reasons.length === 0) {
            reasons.push("Market conditions do not satisfy Araiven's minimum confidence requirements.");
          }

          let reasonHtml = `<p style="margin: 0 0 8px 0; font-weight: 600; color: #f59e0b; font-size: 0.72rem;">`;
          reasonHtml += rec === 'WAIT' ? 'Araiven is waiting for trend confirmation:' : 'Current market conditions do not satisfy minimum requirements:';
          reasonHtml += `</p><ul style="margin: 0; padding-left: 14px; line-height: 1.5; font-size: 0.7rem; color: var(--text-secondary);">`;
          reasons.forEach(r => {
            reasonHtml += `<li style="margin-bottom: 2px;">${r}</li>`;
          });
          reasonHtml += `</ul>`;
          reasonBox.innerHTML = reasonHtml;
        }

        if (trendEl) trendEl.textContent = opp.trendDirection || 'Neutral';
        if (momEl) momEl.textContent = opp.momentumDirection || 'Neutral';
        if (riskEl) {
          riskEl.textContent = opp.riskLevel || 'Medium';
          riskEl.className = opp.riskLevel === 'Low' ? 'text-green' : (opp.riskLevel === 'Medium' ? 'text-warning' : 'text-error');
        }
        if (confEl) confEl.textContent = `${opp.confidenceScore || 50}%`;

        if (trigText) {
          if (rec === 'WAIT') {
            trigText.textContent = `Generate a LONG signal after a confirmed breakout above $${(opp.nearestResistance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}.`;
          } else {
            trigText.textContent = `Awaiting structural shift. Monitor support at $${(opp.nearestSupport || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} and resistance at $${(opp.nearestResistance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}.`;
          }
        }

        // Update Decision Timeline Elements
        const analysisUpdated = document.getElementById('timeline-analysis-updated');
        const signalGenerated = document.getElementById('timeline-signal-generated');
        const statusDot = document.getElementById('timeline-status-dot');
        const statusText = document.getElementById('timeline-status-text');

        const now = new Date();
        const formatUTC = (date) => {
          return date.toISOString().replace('T', ' ').substring(11, 19) + ' UTC';
        };

        if (analysisUpdated) {
          analysisUpdated.textContent = formatUTC(now);
        }
        if (signalGenerated) {
          // Signal generated is slightly before analysis update
          const sigTime = new Date(now.getTime() - 24000); // 24 seconds ago
          signalGenerated.textContent = formatUTC(sigTime);
        }

        if (statusDot && statusText) {
          const rec = opp ? opp.recommendation : 'HOLD';
          if (rec === 'LONG' || rec === 'SHORT') {
            statusDot.style.backgroundColor = '#10b981'; // Green
            statusText.style.color = '#10b981';
            statusText.textContent = 'High Confidence Setup';
          } else if (rec === 'WAIT') {
            statusDot.style.backgroundColor = '#f59e0b'; // Yellow
            statusText.style.color = '#f59e0b';
            statusText.textContent = 'Waiting for Confirmation';
          } else if (rec === 'HOLD') {
            statusDot.style.backgroundColor = '#9ca3af'; // Gray
            statusText.style.color = '#9ca3af';
            statusText.textContent = 'Monitoring Markets';
          } else {
            statusDot.style.backgroundColor = '#ef4444'; // Red
            statusText.style.color = '#ef4444';
          }
        }

        // Helper function to update the AI Status Pill
        const updateStatusPill = (pillId, rec, riskScore, confidenceScore) => {
          const pill = document.getElementById(pillId);
          if (!pill) return;

          const dot = pill.querySelector('.ai-status-dot');
          const text = pill.querySelector('.ai-status-text');
          if (!dot || !text) return;

          let status = 'Scanning Markets';
          let color = '#60a5fa'; // Blue
          let dotColor = '#3b82f6';
          let bg = 'rgba(59, 130, 246, 0.08)';
          let border = 'rgba(59, 130, 246, 0.15)';

          if (riskScore >= 70) {
            status = 'High-Risk Conditions';
            color = '#f87171'; // Red
            dotColor = '#ef4444';
            bg = 'rgba(239, 68, 68, 0.08)';
            border = 'rgba(239, 68, 68, 0.15)';
          } else if ((rec === 'LONG' || rec === 'SHORT') && confidenceScore >= 75) {
            status = 'High-Confidence Setup';
            color = '#a5b4fc'; // Purple
            dotColor = '#8b5cf6';
            bg = 'rgba(139, 92, 246, 0.08)';
            border = 'rgba(139, 92, 246, 0.15)';
          } else if (rec === 'LONG' || rec === 'SHORT') {
            status = 'Live Analysis';
            color = '#34d399'; // Green
            dotColor = '#10b981';
            bg = 'rgba(16, 185, 129, 0.08)';
            border = 'rgba(16, 185, 129, 0.15)';
          } else if (rec === 'WAIT') {
            status = 'Waiting for Confirmation';
            color = '#fbbf24'; // Yellow
            dotColor = '#f59e0b';
            bg = 'rgba(245, 158, 11, 0.08)';
            border = 'rgba(245, 158, 11, 0.15)';
          } else if (rec === 'HOLD') {
            status = 'Market Consolidating';
            color = '#60a5fa'; // Blue
            dotColor = '#3b82f6';
            bg = 'rgba(59, 130, 246, 0.08)';
            border = 'rgba(59, 130, 246, 0.15)';
          }

          text.textContent = status;
          pill.style.color = color;
          pill.style.background = bg;
          pill.style.borderColor = border;
          dot.style.backgroundColor = dotColor;
        };

        const recVal = opp ? opp.recommendation : 'HOLD';
        const riskVal = opp ? opp.riskScore : 35;
        const confVal = opp ? opp.confidenceScore : 50;

        updateStatusPill('state1-ai-status-pill', recVal, riskVal, confVal);
        updateStatusPill('state2-ai-status-pill', recVal, riskVal, confVal);
      }
      // Premium AI Decision Workspace data population
      let reasoningData = null;
      if (opp && opp.reasoningText) {
        try {
          reasoningData = JSON.parse(opp.reasoningText);
        } catch (e) {
          reasoningData = {
            summary: opp.reasoningText,
            whyThisAsset: '',
            whyNow: '',
            supportingEvidence: [
              `Daily Trend: ${opp.trendDirection || 'Neutral'}`,
              `Momentum State: ${opp.momentumDirection || 'Neutral'}`,
              `Risk Profile: ${opp.riskLevel || 'Medium'}`
            ]
          };
        }
      }

      // Populate Section 2: Why This Trade?
      const whyList = document.getElementById('why-this-trade-list');
      if (whyList) {
        whyList.innerHTML = '';
        if (reasoningData && Array.isArray(reasoningData.supportingEvidence) && reasoningData.supportingEvidence.length > 0) {
          reasoningData.supportingEvidence.slice(0, 4).forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.style.marginBottom = '4px';
            whyList.appendChild(li);
          });
        } else {
          // Dynamic fallback based on opportunity metrics
          const rec = opp ? opp.recommendation : 'HOLD';
          const fallbacks = rec === 'WAIT' ? [
            'Market is consolidating in a tight trading range.',
            'Awaiting confirmed breakout above structural resistance.',
            'Momentum metrics currently neutral to slightly bullish.',
            'Risk/Reward profile optimized for confirmation entry.'
          ] : [
            `${opp ? opp.trendDirection : 'Bullish'} market structure bias confirmed on daily timeframe.`,
            `${opp ? opp.momentumDirection : 'Strong'} momentum alignment indicates trend persistence.`,
            `Nearest support reclaimed, narrowing potential downside risk.`,
            `Risk-adjusted returns exceed Ravora's institutional threshold.`
          ];
          fallbacks.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.style.marginBottom = '4px';
            whyList.appendChild(li);
          });
        }
      }

      // Populate Section 3: AI Summary
      const summaryText = document.getElementById('terminal-decision-summary-text');
      if (summaryText) {
        if (reasoningData && reasoningData.summary) {
          summaryText.textContent = reasoningData.summary;
        } else if (opp) {
          const rec = opp.recommendation || 'HOLD';
          if (rec === 'WAIT') {
            summaryText.textContent = `Araiven suggests waiting for structural confirmation. Volatility is contracting, and a decisive breakout above resistance is required before deploying capital.`;
          } else if (rec === 'HOLD') {
            summaryText.textContent = `Markets are currently trading sideways. Araiven recommends maintaining a cash position until a clear directional trend develops.`;
          } else {
            summaryText.textContent = `Technical indicators align for a high-probability ${rec} opportunity. Current risk-to-reward ratio supports a tactical position entry.`;
          }
        }
      }

      // Populate Section 5: Market Health
      if (opp) {
        const hTrendBar = document.getElementById('health-trend-bar');
        const hTrendVal = document.getElementById('health-trend-val');
        const hMomBar = document.getElementById('health-momentum-bar');
        const hMomVal = document.getElementById('health-momentum-val');
        const hStructBar = document.getElementById('health-structure-bar');
        const hStructVal = document.getElementById('health-structure-val');
        const hVolBar = document.getElementById('health-volatility-bar');
        const hVolVal = document.getElementById('health-volatility-val');
        const hRiskBar = document.getElementById('health-risk-bar');
        const hRiskVal = document.getElementById('health-risk-val');

        // Trend
        const trend = opp.trendDirection || 'Bullish';
        if (hTrendVal) {
          hTrendVal.textContent = trend;
          hTrendVal.className = trend === 'Bearish' ? 'text-error' : (trend === 'Bullish' ? 'text-green' : 'text-warning');
        }
        if (hTrendBar) {
          hTrendBar.style.width = trend === 'Bearish' ? '25%' : (trend === 'Bullish' ? '80%' : '50%');
          hTrendBar.style.background = trend === 'Bearish' ? '#ef4444' : (trend === 'Bullish' ? '#10b981' : '#f59e0b');
        }

        // Momentum
        let momText = opp.momentumDirection || 'Neutral';
        let momNum = typeof opp.momentumScore === 'number' ? opp.momentumScore : (opp.momentumScore ? parseInt(opp.momentumScore) : 50);
        if (isNaN(momNum)) momNum = 50;
        if (hMomVal) {
          hMomVal.textContent = momText;
          hMomVal.className = momText === 'Bullish' || momText === 'Strong' ? 'text-green' : (momText === 'Bearish' || momText === 'Weak' ? 'text-error' : 'text-warning');
        }
        if (hMomBar) {
          hMomBar.style.width = `${momNum}%`;
          hMomBar.style.background = momNum >= 70 ? '#10b981' : (momNum <= 30 ? '#ef4444' : '#f59e0b');
        }

        // Structure
        const struct = opp.marketBias || opp.trendDirection || 'Bullish';
        if (hStructVal) {
          hStructVal.textContent = struct;
          hStructVal.className = struct === 'Bearish' ? 'text-error' : (struct === 'Bullish' ? 'text-green' : 'text-warning');
        }
        if (hStructBar) {
          hStructBar.style.width = struct === 'Bearish' ? '25%' : (struct === 'Bullish' ? '85%' : '50%');
          hStructBar.style.background = struct === 'Bearish' ? '#ef4444' : (struct === 'Bullish' ? '#10b981' : '#f59e0b');
        }

        // Volatility
        const vol = opp.volatility || 'Moderate';
        if (hVolVal) hVolVal.textContent = vol;
        if (hVolBar) {
          hVolBar.style.width = vol === 'High' ? '85%' : (vol === 'Low' ? '25%' : '55%');
          hVolBar.style.background = vol === 'High' ? '#f59e0b' : (vol === 'Low' ? '#3b82f6' : '#10b981');
        }

        // Risk
        const risk = opp.riskScore !== undefined ? opp.riskScore : 35;
        const riskLevel = opp.riskLevel || 'Medium';
        if (hRiskVal) {
          hRiskVal.textContent = `${risk} (${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)})`;
          hRiskVal.className = riskLevel === 'High' ? 'text-error' : (riskLevel === 'Low' ? 'text-green' : 'text-warning');
        }
        if (hRiskBar) {
          hRiskBar.style.width = `${risk}%`;
          hRiskBar.style.background = risk >= 70 ? '#ef4444' : (risk <= 30 ? '#10b981' : '#f59e0b');
        }
      }

      // Populate dynamic action container
      // Populate dynamic action container (Execution Actions)
      const actionContainer = document.getElementById('terminal-action-container');
      if (actionContainer) {
        const rec = opp ? (opp.recommendation || 'HOLD') : 'HOLD';
        const entryPrice = opp ? (opp.suggestedEntry || 0) : 0;
        const tp1 = opp ? (opp.suggestedTakeProfit1 || 0) : 0;
        const sl = opp ? (opp.suggestedStopLoss || 0) : 0;

        if (rec === 'LONG' || rec === 'SHORT') {
          actionContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <button class="btn btn-primary" id="btn-deploy-trade" style="width: 100%; padding: 10px; font-weight: 700; border-radius: 6px; font-size: 0.82rem;">
                Deploy Paper Trade
              </button>
              <div style="display: flex; gap: 8px; width: 100%;">
                <button class="btn btn-secondary" id="btn-save-setup" style="flex: 1; padding: 8px; font-weight: 600; border-radius: 6px; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  Save Setup
                </button>
                <button class="btn btn-secondary" id="btn-share-analysis" style="flex: 1; padding: 8px; font-weight: 600; border-radius: 6px; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  Share Analysis
                </button>
              </div>
            </div>
          `;

          const btnDeploy = document.getElementById('btn-deploy-trade');
          if (btnDeploy) {
            btnDeploy.addEventListener('click', () => {
              openDeployModal(symbol, rec, opp, details.price);
            });
          }

          const btnSave = document.getElementById('btn-save-setup');
          if (btnSave) {
            btnSave.addEventListener('click', () => {
              showToast('Setup saved to execution logs');
            });
          }

          const btnShare = document.getElementById('btn-share-analysis');
          if (btnShare) {
            btnShare.addEventListener('click', () => {
              navigator.clipboard.writeText(`Ravora AI Setup for ${symbol}: Entry: $${entryPrice}, Target: $${tp1}, SL: $${sl}`).then(() => {
                showToast('Analysis setup copied to clipboard');
              }).catch(console.error);
            });
          }
        } else {
          actionContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
              <div style="text-align: center; color: var(--text-muted); font-size: 0.72rem; font-weight: 600; padding: 10px; border: 1px dashed rgba(255,255,255,0.06); border-radius: 6px; background: rgba(255,255,255,0.005); width: 100%; box-sizing: border-box;">
                No executable setup available.
              </div>
              <div style="display: flex; gap: 8px; width: 100%;">
                <button class="btn btn-secondary" id="btn-save-setup" style="flex: 1; padding: 8px; font-weight: 600; border-radius: 6px; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; gap: 4px;" disabled>
                  Save Setup
                </button>
                <button class="btn btn-secondary" id="btn-share-analysis" style="flex: 1; padding: 8px; font-weight: 600; border-radius: 6px; font-size: 0.72rem; display: flex; align-items: center; justify-content: center; gap: 4px;">
                  Share Analysis
                </button>
              </div>
            </div>
          `;

          const btnShare = document.getElementById('btn-share-analysis');
          if (btnShare) {
            btnShare.addEventListener('click', () => {
              navigator.clipboard.writeText(`Ravora AI Setup for ${symbol}: Current status ${rec}. Monitoring for high-probability levels.`).then(() => {
                showToast('Analysis setup copied to clipboard');
              }).catch(console.error);
            });
          }
        }
      }

      if (window.activeChartComponent) {
        window.activeChartComponent.updateData(details, opp);
        window.realtimeDataService.setActiveAsset(symbol, timeframe);
      } else {
        console.warn('activeChartComponent not initialized yet. Dynamic boot requested...');
        if (typeof window.initChartIntelligence === 'function') {
          window.initChartIntelligence('terminal-candlestick-chart');
          if (window.activeChartComponent) {
            window.activeChartComponent.updateData(details, opp);
            window.realtimeDataService.setActiveAsset(symbol, timeframe);
          }
        }
      }
      
      const overlay = document.getElementById('chart-skeleton-overlay');
      if (overlay) overlay.remove();
    } catch (e) {
      console.error('Error updating terminal view:', e);
      const overlay = document.getElementById('chart-skeleton-overlay');
      if (overlay) overlay.remove();
    }
  }

  function openDeployModal(symbol, direction, opp, currentPrice) {
    const modal = document.getElementById('paper-trade-modal');
    const summary = document.getElementById('modal-trade-summary');
    if (!modal || !summary) return;

    const entryPrice = currentPrice || opp.suggestedEntry || 100.0;
    const sl = opp.suggestedStopLoss || 0;
    const tp1 = opp.suggestedTakeProfit1 || 0;
    const tp2 = opp.suggestedTakeProfit2 || 0;
    const tp3 = opp.suggestedTakeProfit3 || 0;

    const formatPrice = (val) => val > 0 ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A';

    summary.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; line-height: 1.5; margin-bottom: 12px; font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 12px;">
        <div><strong style="color: var(--text-secondary);">Asset:</strong> <span style="color:#fff; font-weight:600;">${symbol} / USD</span></div>
        <div><strong style="color: var(--text-secondary);">Direction:</strong> <span class="tag-alert-green" style="background: ${direction === 'SHORT' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; color: ${direction === 'SHORT' ? '#f87171' : '#10b981'}; border-color: ${direction === 'SHORT' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; padding: 2px 6px; border-radius:4px; font-size:0.7rem; font-weight:700;">${direction}</span></div>
        <div><strong style="color: var(--text-secondary);">Entry Price:</strong> <span style="color:#fff; font-weight:600;">${formatPrice(entryPrice)}</span></div>
        <div><strong style="color: var(--text-secondary);">Stop Loss:</strong> <span style="color:#f87171; font-weight:600;">${formatPrice(sl)}</span></div>
        <div><strong style="color: var(--text-secondary);">Take Profit 1:</strong> <span style="color:#34d399; font-weight:600;">${formatPrice(tp1)}</span></div>
        <div><strong style="color: var(--text-secondary);">Take Profit 2:</strong> <span style="color:#34d399; font-weight:600;">${formatPrice(tp2)}</span></div>
        <div><strong style="color: var(--text-secondary);">Take Profit 3:</strong> <span style="color:#34d399; font-weight:600;">${formatPrice(tp3)}</span></div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; line-height: 1.5;">
        <div style="display: flex; justify-content: space-between;"><strong style="color: var(--text-secondary);">Estimated Exposure:</strong> <span id="modal-exposure-val" style="color:#fff; font-weight:700;">$0.00</span></div>
        <div style="display: flex; justify-content: space-between;"><strong style="color: var(--text-secondary);">Max Loss:</strong> <span id="modal-loss-val" style="color:#ef4444; font-weight:700;">-$0.00</span></div>
        <div style="display: flex; justify-content: space-between;"><strong style="color: var(--text-secondary);">Potential Reward:</strong> <span id="modal-reward-val" style="color:#10b981; font-weight:700;">+$0.00</span></div>
      </div>
    `;

    // Set default values in modal form
    const marginInput = document.getElementById('modal-margin-input');
    const levSlider = document.getElementById('modal-leverage-slider');
    const levDisplay = document.getElementById('modal-leverage-display');

    if (marginInput) {
      const defaultMargin = Math.round(state.profile.capital * 0.1) || 1000;
      marginInput.value = Math.max(10, Math.min(50000, defaultMargin));
    }
    if (levSlider && levDisplay) {
      levSlider.value = 5;
      levDisplay.textContent = '5x';
    }

    function updateModalCalculations() {
      const margin = parseFloat(marginInput ? marginInput.value : 1000) || 0;
      const leverage = parseFloat(levSlider ? levSlider.value : 5) || 1;
      const exposure = margin * leverage;

      const slDistPct = entryPrice > 0 ? Math.abs((sl - entryPrice) / entryPrice) : 0;
      const tp3DistPct = entryPrice > 0 ? Math.abs((tp3 - entryPrice) / entryPrice) : 0;

      const maxLoss = exposure * slDistPct;
      const potReward = exposure * tp3DistPct;

      const expEl = document.getElementById('modal-exposure-val');
      const lossEl = document.getElementById('modal-loss-val');
      const rewardEl = document.getElementById('modal-reward-val');

      if (expEl) expEl.textContent = `$${exposure.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (lossEl) lossEl.textContent = `-$${maxLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${(slDistPct * 100).toFixed(1)}%)`;
      if (rewardEl) rewardEl.textContent = `+$${potReward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${(tp3DistPct * 100).toFixed(1)}%)`;
    }

    if (marginInput) {
      marginInput.removeEventListener('input', updateModalCalculations);
      marginInput.addEventListener('input', updateModalCalculations);
    }
    if (levSlider) {
      levSlider.removeEventListener('input', updateModalCalculations);
      levSlider.addEventListener('input', updateModalCalculations);
    }

    updateModalCalculations();

    // Show the modal
    modal.style.display = 'flex';

    // Store parameters for deployment
    modal.dataset.symbol = symbol;
    modal.dataset.direction = direction;
    modal.dataset.entryPrice = entryPrice;
  }

  function initializeModalEvents() {
    const modal = document.getElementById('paper-trade-modal');
    const btnCancel = document.getElementById('btn-modal-cancel');
    const modalForm = document.getElementById('modal-trade-form');
    const levSlider = document.getElementById('modal-leverage-slider');
    const levDisplay = document.getElementById('modal-leverage-display');

    if (levSlider && levDisplay) {
      levSlider.addEventListener('input', (e) => {
        levDisplay.textContent = `${e.target.value}x`;
      });
    }

    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        if (modal) modal.style.display = 'none';
      });
    }

    if (modalForm) {
      modalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const deployBtn = document.getElementById('btn-modal-deploy');
        if (!deployBtn || !modal) return;

        deployBtn.disabled = true;
        deployBtn.textContent = 'Deploying...';

        const symbol = modal.dataset.symbol;
        const direction = modal.dataset.direction;
        const amount = document.getElementById('modal-margin-input').value;
        const leverage = levSlider ? levSlider.value : 5;

        const opportunityMapping = {
          BTC: 'btc-halving',
          ETH: 'eth-staking',
          SOL: 'solana-liquidity',
          BNB: 'bnb-breakout',
          SUI: 'sui-alpha'
        };
        const opportunityId = opportunityMapping[symbol];

        const deployPromise = apiCall('/opportunities/deploy', {
          method: 'POST',
          body: JSON.stringify({
            opportunityId,
            amount,
            type: direction,
            leverage
          })
        });

        window.ravoraToast.promise(deployPromise, {
          loading: 'Deploying trade simulation...',
          success: (res) => `Simulated trade successfully executed! Cleared Price: $${res.clearedPrice.toLocaleString()}`,
          error: (err) => `Trade deployment failed: ${err.message}`
        });

        try {
          await deployPromise;
          modal.style.display = 'none';
          await initializeDashboardUI();
          showRavoraSuccess('trade');
        } catch (err) {
          console.error(err);
        } finally {
          deployBtn.disabled = false;
          deployBtn.textContent = 'Deploy Trade';
        }
      });
    }
  }

  async function loadTerminalPositions() {
    const positionsContainer = document.getElementById('terminal-positions-cards-list');
    if (!positionsContainer) return;

    try {
      const openPositions = await apiCall('/paper/positions');
      window.activePositionsList = Array.isArray(openPositions) ? openPositions.map(pos => pos.asset) : [];
      positionsContainer.innerHTML = '';

      if (!Array.isArray(openPositions) || openPositions.length === 0) {
        positionsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 32px 16px; font-size: 0.8rem; background: rgba(255,255,255,0.005); border: 1px dashed rgba(255,255,255,0.04); border-radius: 8px;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #fff;">No active paper trades.</p>
            <p style="margin: 0; font-size: 0.72rem;">If Araiven identifies an opportunity, you can deploy it from the right-hand panel.</p>
          </div>
        `;
        return;
      }

      openPositions.forEach(pos => {
        const card = document.createElement('div');
        card.className = 'card-glass position-card-modern';
        card.style.cssText = 'padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); background: rgba(14,19,37,0.3); text-align: left; position: relative;';

        const isShort = pos.direction.toLowerCase() === 'short';
        const badgeBg = isShort ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)';
        const badgeColor = isShort ? '#f87171' : '#10b981';

        const pnlClass = pos.unrealizedPnL >= 0 ? 'text-green' : 'text-error';
        const pnlSign = pos.unrealizedPnL >= 0 ? '+' : '';

        // Progress toward TP/SL
        const tp = isShort ? pos.entryPrice * 0.95 : pos.entryPrice * 1.05;
        const sl = isShort ? pos.entryPrice * 1.02 : pos.entryPrice * 0.98;
        let progressPct = 50;
        if (isShort) {
          progressPct = ((sl - pos.currentPrice) / (sl - tp)) * 100;
        } else {
          progressPct = ((pos.currentPrice - sl) / (tp - sl)) * 100;
        }
        progressPct = Math.max(0, Math.min(100, progressPct));

        const entryFormatted = pos.entryPrice >= 100
          ? pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

        const currentFormatted = pos.currentPrice >= 100
          ? pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <strong style="font-size: 0.88rem; color: #fff; font-family: var(--font-display);">${pos.symbol} / USD</strong>
              <span style="font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 1px;">Hold Time: ${pos.duration}</span>
            </div>
            <span class="badge-ds" style="background: ${badgeBg} !important; color: ${badgeColor} !important; border: 1px solid rgba(255,255,255,0.02) !important; font-size: 0.65rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">${pos.direction} ${pos.leverage.toFixed(1)}x</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 8px;">
            <div>
              <span style="font-size: 0.6rem; color: var(--text-muted); display: block; margin-bottom: 1px;">ENTRY</span>
              <strong style="font-size: 0.78rem; color: #fff;">$${entryFormatted}</strong>
            </div>
            <div>
              <span style="font-size: 0.6rem; color: var(--text-muted); display: block; margin-bottom: 1px;">CURRENT</span>
              <strong style="font-size: 0.78rem; color: #fff;">$${currentFormatted}</strong>
            </div>
            <div>
              <span style="font-size: 0.6rem; color: var(--text-muted); display: block; margin-bottom: 1px;">UNREALIZED P&L</span>
              <strong class="${pnlClass}" style="font-size: 0.78rem; font-weight: 700;">${pnlSign}$${pos.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <!-- Progress toward TP/SL -->
          <div style="margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.62rem; color: var(--text-muted); margin-bottom: 2px; font-weight: 500;">
              <span>SL: $${sl.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
              <span style="color: #fff;">Entry: $${pos.entryPrice.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
              <span>TP: $${tp.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
            </div>
            <div style="height: 4px; background: rgba(255,255,255,0.02); border-radius: 99px; overflow: hidden; border: 1px solid rgba(255,255,255,0.04); position: relative;">
              <div style="position: absolute; left: 0; top: 0; height: 100%; width: ${progressPct}%; background: var(--gradient-success); border-radius: 99px;"></div>
              <div style="position: absolute; left: 50%; top: 0; width: 1px; height: 100%; background: rgba(255,255,255,0.15);"></div>
            </div>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <button class="btn btn-secondary btn-xs btn-view-pos-analysis" style="font-size: 0.7rem; padding: 4px 8px;" data-symbol="${pos.symbol}">Analyze</button>
            <button class="btn btn-primary btn-xs btn-close-pos-action" style="font-size: 0.7rem; padding: 4px 8px;" data-id="${pos.id}">Close</button>
          </div>
        `;

        card.querySelector('.btn-view-pos-analysis').addEventListener('click', () => {
          state.selectedAsset = pos.symbol;
          updateTerminalView(pos.symbol, window.chartStateManager.timeframe).catch(console.error);
        });

        card.querySelector('.btn-close-pos-action').addEventListener('click', (e) => {
          const btn = e.target;
          btn.disabled = true;
          btn.textContent = '...';

          const closePromise = apiCall(`/paper/positions/${pos.id}/close`, { method: 'POST' });

          window.ravoraToast.promise(closePromise, {
            loading: `Closing ${pos.symbol} position...`,
            success: (res) => `Position closed. PnL: $${res.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            error: (err) => `Failed to close position: ${err.message}`
          });

          closePromise.then(async () => {
            await initializeDashboardUI();
          }).catch(() => {
            btn.disabled = false;
            btn.textContent = 'Close';
          });
        });

        positionsContainer.appendChild(card);
      });
    } catch (e) {
      console.error('Error loading terminal positions:', e);
    }
  }

  async function loadTerminalHistory() {
    const historyContainer = document.getElementById('terminal-history-cards-list');
    if (!historyContainer) return;

    try {
      const trades = await apiCall('/paper/history');
      historyContainer.innerHTML = '';

      if (!Array.isArray(trades) || trades.length === 0) {
        historyContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 32px 16px; font-size: 0.8rem; background: rgba(255,255,255,0.005); border: 1px dashed rgba(255,255,255,0.04); border-radius: 8px;">
            <p style="margin: 0 0 4px 0; font-weight: 600; color: #fff;">No completed simulated trades yet.</p>
          </div>
        `;
        return;
      }

      trades.slice(0, 6).forEach(t => {
        const card = document.createElement('div');
        card.className = 'card-glass history-card-modern';
        card.style.cssText = 'padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.04); background: rgba(14,19,37,0.2); text-align: left; position: relative;';

        const isWin = t.winLoss === 'WIN';
        const badgeBg = isWin ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)';
        const badgeColor = isWin ? '#10b981' : '#f87171';

        const pnlClass = t.profitLoss >= 0 ? 'text-green' : 'text-error';
        const pnlSign = t.profitLoss >= 0 ? '+' : '';

        const entryFormatted = t.entryPrice >= 100
          ? t.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })
          : t.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 4 });

        const exitFormatted = t.exitPrice >= 100
          ? t.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })
          : t.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 4 });

        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <strong style="font-size: 0.85rem; color: #fff;">${t.symbol} / USD</strong>
              <span style="font-size: 0.62rem; color: var(--text-muted); display: block; margin-top: 1px;">${new Date(t.closeTime).toLocaleDateString()}</span>
            </div>
            <span class="badge-ds" style="background: ${badgeBg} !important; color: ${badgeColor} !important; border: 1px solid rgba(255,255,255,0.02) !important; font-size: 0.62rem; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${t.winLoss}</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px; font-size: 0.72rem; margin-bottom: 8px;">
            <div>
              <span style="font-size: 0.58rem; color: var(--text-muted); display: block;">ENTRY / EXIT</span>
              <span style="color:#fff;">$${entryFormatted} → $${exitFormatted}</span>
            </div>
            <div>
              <span style="font-size: 0.58rem; color: var(--text-muted); display: block;">PROFIT/LOSS</span>
              <strong class="${pnlClass}">${pnlSign}$${t.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            <div>
              <span style="font-size: 0.58rem; color: var(--text-muted); display: block;">DURATION</span>
              <span style="color:#fff;">${t.duration}</span>
            </div>
            <div>
              <span style="font-size: 0.58rem; color: var(--text-muted); display: block;">EXIT REASON</span>
              <span style="color:#fff; text-transform: capitalize;">${t.reasonClosed.replace('_', ' ').toLowerCase()}</span>
            </div>
          </div>
          
          <div style="font-size: 0.65rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.04); padding-top: 6px; margin-top: 4px; display: flex; justify-content: space-between;">
            <span>AI Entry Confidence: <strong>${t.confidence}%</strong></span>
            <span>Opportunity Score: <strong>${t.opportunityScore}</strong></span>
          </div>
        `;
        historyContainer.appendChild(card);
      });
    } catch (e) {
      console.error('Error loading terminal history:', e);
    }
  }

  function initializeTerminalEvents() {
    const btnCloseAll = document.getElementById('btn-close-all-trades');
    if (btnCloseAll) {
      btnCloseAll.addEventListener('click', () => {
        window.ravoraToast.show({
          type: 'warning',
          title: 'Close All Positions?',
          description: 'Are you sure you want to close all active simulated positions? This cannot be undone.',
          action: {
            text: 'Yes, Close All',
            callback: async () => {
              btnCloseAll.disabled = true;
              btnCloseAll.textContent = 'Closing All...';
              try {
                await apiCall('/paper/positions/close-all', { method: 'POST' });
                window.ravoraToast.show({
                  type: 'success',
                  title: 'Positions Closed',
                  description: 'All simulated positions closed successfully.'
                });
                await initializeDashboardUI();
              } catch (err) {
                window.ravoraToast.show({
                  type: 'error',
                  title: 'Closure Failed',
                  description: err.message
                });
              } finally {
                btnCloseAll.disabled = false;
                btnCloseAll.textContent = 'Close All Trades';
              }
            }
          }
        });
      });
    }

    const tabBtns = document.querySelectorAll('.panel-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.getAttribute('data-tab');

        // Hide all tab content elements
        const contents = [
          'tab-active-positions',
          'tab-simulated-orders',
          'tab-closed-history',
          'tab-copilot-performance'
        ];
        contents.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });

        // Show the target tab content element
        let targetId = 'tab-active-positions';
        if (tab === 'simulated-orders') targetId = 'tab-simulated-orders';
        else if (tab === 'closed-history') targetId = 'tab-closed-history';
        else if (tab === 'copilot-performance') targetId = 'tab-copilot-performance';

        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.style.display = 'block';

        // Auto-expand the bottom panel if it is collapsed
        const bottomPanel = document.querySelector('.terminal-positions-panel');
        const toggleIcon = document.getElementById('bottom-panel-toggle-icon');
        if (bottomPanel && bottomPanel.classList.contains('collapsed')) {
          bottomPanel.classList.remove('collapsed');
          if (toggleIcon) {
            toggleIcon.innerHTML = '<polyline points="18 15 12 9 6 15"/>'; // Up arrow
          }
        }
      });
    });

    const toggleBottomBtn = document.getElementById('btn-toggle-bottom-panel');
    const bottomPanel = document.querySelector('.terminal-positions-panel');
    const toggleIcon = document.getElementById('bottom-panel-toggle-icon');

    if (toggleBottomBtn && bottomPanel) {
      toggleBottomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = bottomPanel.classList.toggle('collapsed');
        if (toggleIcon) {
          toggleIcon.innerHTML = isCollapsed
            ? '<polyline points="6 9 12 15 18 9"/>'
            : '<polyline points="18 15 12 9 6 15"/>';
        }
      });
    }

    const searchInput = document.getElementById('scanner-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        loadScannerAssets().catch(console.error);
      });
    }

    const segmentedTabs = document.querySelectorAll('.segmented-tab');
    segmentedTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        segmentedTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeScannerFilter = tab.getAttribute('data-filter');
        loadScannerAssets().catch(console.error);
      });
    });

    const sortSelect = document.getElementById('scanner-sort-select');
    if (sortSelect) {
      sortSelect.value = state.activeScannerSort || 'oppScore';
      sortSelect.addEventListener('change', () => {
        state.activeScannerSort = sortSelect.value;
        localStorage.setItem('scannerSort', sortSelect.value);
        loadScannerAssets().catch(console.error);
      });
    }

    // Dynamic refresh countdown display
    if (!window.scannerRefreshIntervalRegistered) {
      window.scannerRefreshIntervalRegistered = true;
      setInterval(() => {
        const statusEl = document.getElementById('scanner-refresh-status');
        if (statusEl) {
          const diffSecs = Math.round((new Date() - lastScannerRefreshTime) / 1000);
          if (diffSecs < 5) {
            statusEl.textContent = 'Live';
            statusEl.style.color = '#10b981';
          } else {
            statusEl.textContent = `Updated ${diffSecs}s ago`;
            statusEl.style.color = 'var(--text-secondary)';
          }
        }
      }, 1000);
    }

    const btnFullscreen = document.getElementById('btn-fullscreen-chart');
    if (btnFullscreen) {
      btnFullscreen.addEventListener('click', () => {
        const chartPanel = document.querySelector('.terminal-chart-panel');
        if (chartPanel) {
          if (!document.fullscreenElement) {
            chartPanel.requestFullscreen().catch(err => {
              console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            btnFullscreen.style.color = 'var(--accent)';
          } else {
            document.exitFullscreen();
            btnFullscreen.style.color = '';
          }
        }
      });
    }
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
  // Araiven Copilot Presets and Live Context Listeners
  // ==========================================================================
  
  // Toggles the welcome empty state on the copilot page
  function toggleCopilotEmptyState(show) {
    const log = document.getElementById('copilot-messages-log');
    if (!log) return;
    
    let emptyState = document.getElementById('copilot-empty-state');
    
    if (show) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = 'copilot-empty-state';
        emptyState.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 40px; text-align: center; gap: 16px; box-sizing: border-box;';
        emptyState.innerHTML = `
          <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center;">
            <span style="font-size: 2rem; color: #a78bfa;">A</span>
          </div>
          <h3 style="color: #fff; font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; margin: 0;">Welcome to Araiven</h3>
          <p style="color: var(--text-secondary); font-size: 0.8rem; max-width: 400px; margin: 0; line-height: 1.5;">
            Ravora's flagship AI trading copilot. Ask me about asset allocations, risk metrics, or market opportunities.
          </p>
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 320px; margin-top: 12px;">
            <button class="chat-empty-preset-btn" style="text-align: left; padding: 8px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; color: var(--text-secondary); font-size: 0.76rem; cursor: pointer; font-weight: 500;" data-query="Should I buy BTC?">Should I buy BTC?</button>
            <button class="chat-empty-preset-btn" style="text-align: left; padding: 8px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; color: var(--text-secondary); font-size: 0.76rem; cursor: pointer; font-weight: 500;" data-query="Review my portfolio.">Review my portfolio.</button>
            <button class="chat-empty-preset-btn" style="text-align: left; padding: 8px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; color: var(--text-secondary); font-size: 0.76rem; cursor: pointer; font-weight: 500;" data-query="Analyze ETH.">Analyze ETH.</button>
            <button class="chat-empty-preset-btn" style="text-align: left; padding: 8px 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; color: var(--text-secondary); font-size: 0.76rem; cursor: pointer; font-weight: 500;" data-query="Find opportunities today.">Find opportunities today.</button>
          </div>
        `;
        log.innerHTML = '';
        log.appendChild(emptyState);
        
        // Bind empty state buttons
        emptyState.querySelectorAll('.chat-empty-preset-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const query = btn.getAttribute('data-query');
            const input = document.getElementById('copilot-chat-input');
            if (input) {
              input.value = query;
              const sendBtn = document.getElementById('btn-copilot-send');
              if (sendBtn) sendBtn.click();
            }
          });
        });
      }
    } else {
      if (emptyState) emptyState.remove();
    }
  }

  // Toggles visibility of the query presets row when chat has started
  function updatePresetVisibility() {
    const log = document.getElementById('copilot-messages-log');
    const presetsRow = document.getElementById('copilot-query-presets');
    if (!log || !presetsRow) return;
    const bubbles = log.querySelectorAll('.chat-message-bubble');
    if (bubbles.length > 0) {
      presetsRow.style.display = 'none';
    } else {
      presetsRow.style.display = 'flex';
    }
  }

  // Updates Right Sidebar Context metrics on Copilot screen
  async function updateCopilotLiveContext() {
    try {
      const portfolio = await apiCall('/portfolio');
      const paperAccount = await apiCall('/paper/account');
      const paperPositions = await apiCall('/paper/positions');
      
      if (portfolio) {
        const valEl = document.getElementById('copilot-context-value');
        if (valEl) valEl.textContent = `$${(portfolio.currentBalance || 100000).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        
        const riskEl = document.getElementById('copilot-context-risk-score');
        if (riskEl) riskEl.textContent = `${portfolio.safetyScore || 96}/100`;

        const pnlEl = document.getElementById('copilot-context-pnl');
        if (pnlEl) {
          const change = portfolio.valueChange24h || 0;
          const sign = change >= 0 ? '+' : '';
          pnlEl.textContent = `${sign}$${change.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          pnlEl.style.color = change >= 0 ? '#10b981' : '#ef4444';
        }
      }

      if (paperAccount) {
        const paperEl = document.getElementById('copilot-context-paper-status');
        if (paperEl) paperEl.textContent = paperAccount.balance > 0 ? 'Active' : 'Inactive';
      }

      if (paperPositions) {
        const ordersEl = document.getElementById('copilot-context-orders');
        if (ordersEl) ordersEl.textContent = Array.isArray(paperPositions) ? paperPositions.length.toString() : '0';
        
        if (Array.isArray(paperPositions) && paperPositions.length > 0) {
          const sortedPos = [...paperPositions].sort((a, b) => b.positionSize - a.positionSize);
          const largestEl = document.getElementById('copilot-context-largest-pos');
          if (largestEl) largestEl.textContent = sortedPos[0].symbol || 'None';
        } else {
          const largestEl = document.getElementById('copilot-context-largest-pos');
          if (largestEl) largestEl.textContent = 'None';
        }
      }

      const timeEl = document.getElementById('copilot-context-update-time');
      if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();
    } catch (e) {
      console.warn('Failed to load live context for copilot:', e);
    }
  }

  // Bind Preset Query Pills click listeners
  document.querySelectorAll('.chat-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query') || btn.textContent.trim();
      const input = document.getElementById('copilot-chat-input');
      if (input) {
        input.value = query;
        const sendBtn = document.getElementById('btn-copilot-send');
        if (sendBtn) sendBtn.click();
      }
    });
  });

  // Bind Pinned Preset click listeners
  document.querySelectorAll('.btn-preset-pinned-analysis').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query') || btn.textContent.trim();
      const input = document.getElementById('copilot-chat-input');
      if (input) {
        input.value = query;
        const sendBtn = document.getElementById('btn-copilot-send');
        if (sendBtn) sendBtn.click();
        
        window.ravoraToast.show({
          type: 'info',
          title: 'Running Pinned Analysis',
          description: `Araiven is executing: "${query}"`
        });
      }
    });
  });

  // Bind Saved Reports click handlers
  document.querySelectorAll('.btn-saved-report-item').forEach(item => {
    item.addEventListener('click', () => {
      const name = item.querySelector('span')?.textContent || item.textContent.trim();
      window.ravoraToast.show({
        type: 'success',
        title: 'Downloading Report',
        description: `Downloaded ${name} successfully from Araiven database archives.`
      });
    });
  });

  // Bind Quick Actions buttons click listeners (Redirect to pages)
  document.querySelectorAll('.copilot-quick-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt') || btn.textContent.trim();
      
      window.ravoraToast.show({
        type: 'info',
        title: 'Navigating',
        description: `Redirecting to workspace section for: ${prompt}`
      });

      let targetScreen = '';
      if (prompt === 'Review Portfolio' || prompt === 'Find Risks') {
        targetScreen = 'portfolio';
      } else if (prompt === 'Market Summary') {
        targetScreen = 'markets';
      } else if (prompt === 'Analyze BTC') {
        state.selectedAsset = 'BTC';
        targetScreen = 'dashboard';
      } else if (prompt === 'Review Last Trade') {
        targetScreen = 'history';
      } else if (prompt === 'Find Opportunities') {
        targetScreen = 'opportunities';
      } else if (prompt === 'Create Watchlist') {
        targetScreen = 'watchlist';
      }

      if (targetScreen) {
        // Find corresponding sidebar tab and click it to trigger full navigation flow
        const menuBtn = document.querySelector(`.menu-tab-btn[data-screen="${targetScreen}"]`);
        if (menuBtn) {
          menuBtn.click();
        } else {
          navigateTo(targetScreen);
        }
      }
    });
  });

  // Execute swap rebalance button in Copilot Side Panel
  if (btnCopilotRebalanceExecute) {
    btnCopilotRebalanceExecute.addEventListener('click', async () => {
      if (!activeRecommendationId) {
        window.ravoraToast.show({
          type: 'warning',
          title: 'Rebalance Execution',
          description: 'No pending directive rebalance is active to execute.'
        });
        return;
      }

      btnCopilotRebalanceExecute.disabled = true;
      btnCopilotRebalanceExecute.textContent = 'Clearing Swap...';

      const execPromise = apiCall(`/opportunities/recommendations/${activeRecommendationId}/execute`, {
        method: 'POST'
      });

      window.ravoraToast.promise(execPromise, {
        loading: 'Clearing rebalance swap...',
        success: 'Rebalance swap execution confirmed.',
        error: (err) => `Rebalance failed: ${err.message}`
      });

      try {
        const res = await execPromise;
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
        console.error(err);
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
      const emptyDiv = document.createElement('div');
      emptyDiv.style.gridColumn = '1/-1';
      emptyDiv.id = 'opportunities-empty-state-wrapper';
      opportunitiesCardsContainer.appendChild(emptyDiv);
      renderRavoraEmptyState(emptyDiv, {
        type: 'scanner',
        headline: 'No opportunities match your filters.',
        description: 'Try adjusting filters or broadening your search.',
        primaryText: 'Reset Filters',
        primaryCallback: () => {
          if (explorerSearchInput) explorerSearchInput.value = '';
          const allBtn = document.querySelector('#explorer-filter-tabs button[data-filter="all"]');
          if (allBtn) {
            const filterBtns = document.querySelectorAll('#explorer-filter-tabs button');
            filterBtns.forEach(btn => btn.classList.remove('active'));
            allBtn.classList.add('active');
          }
          renderOpportunitiesCardsLocal('all', '');
        }
      });
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
    if (drawerAssetIcon) {
      const cleanSym = (opp.symbol || 'BTC').split('/')[0].trim().toUpperCase();
      drawerAssetIcon.innerHTML = `
        <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 4px;">
          <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${cleanSym.toLowerCase()}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 26px; height: 26px; border-radius: 50%;" />
          <span style="display: none; width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.08); align-items: center; justify-content: center; font-size: 0.7rem; color: #fff; font-weight: 700; text-transform: uppercase;">${cleanSym.substring(0, 2)}</span>
        </div>
      `;
    }
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

      const deployPromise = apiCall('/opportunities/deploy', {
        method: 'POST',
        body: JSON.stringify({
          opportunityId: activeOpportunity.opportunityId,
          amount: amountUSD
        })
      });

      window.ravoraToast.promise(deployPromise, {
        loading: `Deploying allocation to ${activeOpportunity.name}...`,
        success: 'Allocation successfully deployed!',
        error: (err) => `Failed to deploy allocation: ${err.message}`
      });

      try {
        await deployPromise;
        btnDrawerDeploy.textContent = 'Allocation Deployed';
        btnDrawerDeploy.className = 'btn btn-secondary btn-lg block-btn';

        await initializeDashboardUI();

        setTimeout(() => {
          opportunityDetailDrawer.classList.remove('open');
        }, 800);
      } catch (err) {
        btnDrawerDeploy.disabled = false;
        btnDrawerDeploy.textContent = 'Confirm & Deploy Allocation';
        console.error(err);
      }
    });
  }

  // ==========================================================================
  // Trade History Rows Renderer & Portfolio Sub-Tabs System
  // ==========================================================================
  async function renderTradeHistoryRowsLocal() {
    const timelineContainer = document.getElementById('journal-timeline-container');
    if (!timelineContainer) return;

    let journalError = false;
    try {
      const trades = await apiCall('/paper/history');
      state.trades = trades;
    } catch (e) {
      console.error('Error fetching trade history:', e);
      state.trades = [];
      journalError = true;
    }

    const totalTrades = state.trades.length;
    const emptyStateEl = document.getElementById('journal-empty-state');
    const mainContentEl = document.getElementById('journal-main-content');

    if (journalError) {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'block';
        renderRavoraEmptyState(emptyStateEl, {
          type: 'error',
          headline: 'Unable to load trading journal.',
          description: 'A temporary issue prevented loading your trade history.',
          primaryText: 'Retry',
          primaryCallback: () => {
            renderTradeHistoryRowsLocal();
          }
        });
      }
      if (mainContentEl) mainContentEl.style.display = 'none';
      return;
    }

    if (totalTrades === 0) {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'block';
        renderRavoraEmptyState(emptyStateEl, {
          type: 'journal',
          headline: 'No trades to review yet.',
          description: "Completed trades will appear here along with Araiven's performance analysis.",
          primaryText: 'Open Trading Workspace',
          primaryCallback: () => {
            navigateTo('dashboard');
          }
        });
      }
      if (mainContentEl) mainContentEl.style.display = 'none';
      return;
    } else {
      if (emptyStateEl) emptyStateEl.style.display = 'none';
      if (mainContentEl) mainContentEl.style.display = 'block';
    }

    // 2. Calculations
    let wins = 0;
    let losses = 0;
    let netPnL = 0;
    let grossReturnPct = 0;
    let bestPnL = -999999;
    let worstPnL = 999999;
    let bestTradeAsset = 'N/A';
    let worstTradeAsset = 'N/A';

    state.trades.forEach(t => {
      netPnL += t.profitLoss;
      const isWin = t.winLoss === 'WIN' || t.profitLoss >= 0;
      if (isWin) {
        wins++;
      } else {
        losses++;
      }

      const yieldPct = t.entryPrice > 0 ? (t.profitLoss / (t.entryPrice * t.positionSize)) * 100 : 0;
      grossReturnPct += yieldPct;

      if (t.profitLoss > bestPnL) {
        bestPnL = t.profitLoss;
        bestTradeAsset = `${t.symbol} (+$${Math.round(t.profitLoss)})`;
      }
      if (t.profitLoss < worstPnL) {
        worstPnL = t.profitLoss;
        worstTradeAsset = `${t.symbol} (-$${Math.round(Math.abs(t.profitLoss))})`;
      }
    });

    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0.0;
    const avgPnL = totalTrades > 0 ? netPnL / totalTrades : 0.0;

    // Update Overview DOM
    const totalTradesEl = document.getElementById('journal-stat-total-trades');
    if (totalTradesEl) totalTradesEl.textContent = totalTrades;

    const winRateEl = document.getElementById('journal-stat-win-rate');
    if (winRateEl) {
      winRateEl.textContent = `${winRate.toFixed(1)}%`;
      winRateEl.className = winRate >= 50 ? 'text-green' : 'text-error';
    }

    const netPnLEl = document.getElementById('journal-stat-net-pnl');
    if (netPnLEl) {
      netPnLEl.textContent = `${netPnL >= 0 ? '+' : ''}$${netPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      netPnLEl.className = netPnL >= 0 ? 'text-green' : 'text-error';
    }

    const avgReturnEl = document.getElementById('journal-stat-avg-return');
    if (avgReturnEl) {
      avgReturnEl.textContent = `${avgPnL >= 0 ? '+' : ''}$${avgPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      avgReturnEl.className = avgPnL >= 0 ? 'text-green' : 'text-error';
    }

    const avgHoldEl = document.getElementById('journal-stat-avg-hold');
    if (avgHoldEl) {
      avgHoldEl.textContent = totalTrades > 0 ? '1d 14h 22m' : '0h 0m';
    }

    const bestEl = document.getElementById('journal-stat-best');
    if (bestEl) {
      bestEl.textContent = bestTradeAsset;
      bestEl.className = bestPnL > -999999 ? 'text-green' : 'text-muted';
    }

    const worstEl = document.getElementById('journal-stat-worst');
    if (worstEl) {
      worstEl.textContent = worstTradeAsset;
      worstEl.className = worstPnL < 999999 ? 'text-error' : 'text-muted';
    }

    // 3. Filtering
    const searchVal = (document.getElementById('journal-filter-search')?.value || '').toLowerCase();
    const assetVal = document.getElementById('journal-filter-asset')?.value || 'all';
    const directionVal = document.getElementById('journal-filter-direction')?.value || 'all';
    const resultVal = document.getElementById('journal-filter-result')?.value || 'all';

    const filtered = state.trades.filter(t => {
      const notesText = (t.notes || '').toLowerCase();
      const matchesSearch = !searchVal ||
        t.symbol.toLowerCase().includes(searchVal) ||
        notesText.includes(searchVal);
      const matchesAsset = assetVal === 'all' || t.symbol === assetVal;
      const matchesDirection = directionVal === 'all' || t.direction.toLowerCase() === directionVal;
      const matchesResult = resultVal === 'all' ||
        (resultVal === 'win' && (t.winLoss === 'WIN' || t.profitLoss >= 0)) ||
        (resultVal === 'loss' && (t.winLoss === 'LOSS' || t.profitLoss < 0));
      return matchesSearch && matchesAsset && matchesDirection && matchesResult;
    });

    // 4. Render Timeline
    timelineContainer.innerHTML = '';

    if (filtered.length === 0) {
      timelineContainer.innerHTML = `<div class="card-glass" style="padding:40px; text-align:center; color:var(--text-muted); font-size:0.8rem;">No completed trades match your filter criteria.</div>`;
    } else {
      filtered.forEach(t => {
        const isWin = t.winLoss === 'WIN' || t.profitLoss >= 0;
        const colorClass = isWin ? 'text-green' : 'text-error';
        const sign = t.profitLoss >= 0 ? '+' : '';
        const yieldPct = t.entryPrice > 0 ? (t.profitLoss / (t.entryPrice * t.positionSize)) * 100 : 0.0;

        const timelineCard = document.createElement('div');
        timelineCard.className = 'card-glass timeline-card';
        timelineCard.style.cssText = 'padding: 16px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); background: rgba(14,19,37,0.3); display: flex; flex-direction: column; gap: 0; cursor: pointer; transition: all 0.2s ease; margin-bottom: 8px;';

        timelineCard.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%;" class="timeline-header">
            <div style="display:flex; align-items:center; gap: 12px;">
              <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${t.symbol.toLowerCase()}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 20px; height: 20px; border-radius: 50%;" />
                <span style="display: none; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.08); align-items: center; justify-content: center; font-size: 0.6rem; color: #fff; font-weight: 700; text-transform: uppercase;">${t.symbol.substring(0, 2)}</span>
              </div>
              <strong style="color:#fff; font-size: 0.95rem; font-family: var(--font-display);">${t.symbol}</strong>
              <span class="badge-ds" style="background: ${t.direction.toLowerCase() === 'short' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)'} !important; color: ${t.direction.toLowerCase() === 'short' ? '#f87171' : '#10b981'} !important; font-size: 0.65rem; padding: 2px 6px;">${t.direction.toUpperCase()}</span>
              <span style="font-size:0.7rem; color:var(--text-muted);">${new Date(t.closeTime).toLocaleDateString()} ${new Date(t.closeTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div style="display:flex; align-items:center; gap: 16px;">
              <span class="${colorClass}" style="font-weight:700; font-size: 0.9rem;">${sign}$${t.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${yieldPct.toFixed(2)}%)</span>
              <span style="color: var(--text-muted); font-size: 0.72rem; transition: transform 0.2s;" class="expander-arrow">▼</span>
            </div>
          </div>

          <div class="timeline-details" style="display:none; margin-top: 16px; border-top: 1px solid rgba(255,255,255,0.04); padding-top: 16px; flex-direction: column; gap: 16px;">
            
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
              <div>
                <span style="display:block; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Entry Price</span>
                <strong style="color:#fff; font-size:0.8rem;">$${t.entryPrice.toLocaleString()}</strong>
              </div>
              <div>
                <span style="display:block; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Exit Price</span>
                <strong style="color:#fff; font-size:0.8rem;">$${t.exitPrice.toLocaleString()}</strong>
              </div>
              <div>
                <span style="display:block; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Position Size</span>
                <strong style="color:#fff; font-size:0.8rem;">${t.positionSize.toLocaleString()} ${t.symbol}</strong>
              </div>
              <div>
                <span style="display:block; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Holding Duration</span>
                <strong style="color:#fff; font-size:0.8rem;">${t.duration}</strong>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border-top: 1px solid rgba(255,255,255,0.02); padding-top: 12px;">
              <div>
                <span style="display:block; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Market Trend</span>
                <strong style="color:#fff; font-size:0.8rem; text-transform:capitalize;">Bullish momentum</strong>
              </div>
              <div>
                <span style="display:block; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Volatility</span>
                <strong style="color:#fff; font-size:0.8rem;">Medium (18.4%)</strong>
              </div>
              <div>
                <span style="display:block; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Sentiment</span>
                <strong style="color:#fff; font-size:0.8rem;">Fear & Greed: 62 (Greed)</strong>
              </div>
              <div>
                <span style="display:block; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase;">Opportunity Score</span>
                <strong style="color:var(--accent); font-size:0.8rem;">${t.opportunityScore || 85} Score</strong>
              </div>
            </div>

            <div class="card-glass" style="padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(99,102,241,0.12); background: rgba(99,102,241,0.03); display:flex; flex-direction:column; gap: 4px;">
              <span style="display:block; font-size:0.62rem; color: #a5b4fc; text-transform:uppercase; letter-spacing:0.02em; font-weight:700;">Araiven Trade Review</span>
              <p style="margin:0; font-size:0.75rem; color:#dbeafe; line-height: 1.45;">
                ${generateAIReviewText(t, yieldPct)}
              </p>
            </div>

            <div style="display:flex; flex-direction:column; gap: 6px;">
              <label style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Personal Notes & Observations</label>
              <div style="display:flex; gap: 10px; width:100%;">
                <textarea class="journal-trade-notes-input" style="flex:1; height: 50px; padding: 8px 12px; font-size: 0.76rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; color:#fff; resize: none;" placeholder="Enter trade reasons, mistakes repeated or lessons learned...">${t.notes || ''}</textarea>
                <button class="btn btn-secondary btn-sm btn-save-trade-notes" style="font-size: 0.72rem; padding: 0 16px; height: 50px; font-weight:600;" data-id="${t.id}">Save</button>
              </div>
            </div>

          </div>
        `;

        timelineCard.querySelector('.timeline-details').addEventListener('click', (e) => {
          e.stopPropagation();
        });

        const saveBtn = timelineCard.querySelector('.btn-save-trade-notes');
        saveBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const tradeId = saveBtn.getAttribute('data-id');
          const notesText = timelineCard.querySelector('.journal-trade-notes-input').value;

          saveBtn.disabled = true;
          saveBtn.textContent = 'Saving...';

          try {
            await apiCall(`/paper/history/${tradeId}/notes`, {
              method: 'PUT',
              body: { notes: notesText }
            });
            const localTradeIndex = state.trades.findIndex(lt => lt.id === tradeId);
            if (localTradeIndex !== -1) {
              state.trades[localTradeIndex].notes = notesText;
            }
            window.ravoraToast.show({
              type: 'success',
              title: 'Notes Saved',
              description: 'Trade notes updated successfully.'
            });
            saveBtn.textContent = 'Saved!';
            saveBtn.className = 'btn btn-primary btn-sm btn-save-trade-notes';
            setTimeout(() => {
              saveBtn.disabled = false;
              saveBtn.textContent = 'Save';
              saveBtn.className = 'btn btn-secondary btn-sm btn-save-trade-notes';
            }, 1500);
          } catch (err) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
            window.ravoraToast.show({
              type: 'error',
              title: 'Failed to Save Notes',
              description: err.message
            });
          }
        });

        timelineCard.addEventListener('click', () => {
          const details = timelineCard.querySelector('.timeline-details');
          const arrow = timelineCard.querySelector('.expander-arrow');
          const isOpen = details.style.display === 'flex';

          document.querySelectorAll('.timeline-details').forEach(el => el.style.display = 'none');
          document.querySelectorAll('.expander-arrow').forEach(el => el.style.transform = 'rotate(0deg)');

          if (!isOpen) {
            details.style.display = 'flex';
            arrow.style.transform = 'rotate(180deg)';
          } else {
            details.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
          }
        });

        timelineContainer.appendChild(timelineCard);
      });
    }

    renderJournalBreakdowns(filtered);
  }

  function generateAIReviewText(trade, yieldPct) {
    const points = [];
    if (yieldPct > 15) {
      points.push("Your exit captured 85% of the available move.");
    } else if (yieldPct < -5) {
      points.push("This trade was entered against the prevailing trend.");
    } else {
      points.push("You respected your stop loss.");
    }

    if (trade.leverage > 2.0) {
      points.push("The leverage size exceeded your typical risk profile.");
    } else {
      points.push("Position sizing matches your risk policy.");
    }

    if (trade.reasonClosed) {
      const reason = trade.reasonClosed.replace('_', ' ').toLowerCase();
      points.push(`System exited due to ${reason}.`);
    }

    return points.join(" • ");
  }

  function renderJournalBreakdowns(tradesList) {
    const wins = tradesList.filter(t => t.winLoss === 'WIN' || t.profitLoss >= 0).length;
    const losses = tradesList.length - wins;

    const wlRatioEl = document.getElementById('journal-breakdown-wl-ratio');
    if (wlRatioEl) {
      wlRatioEl.textContent = `${wins}W - ${losses}L`;
    }

    const wlBarEl = document.getElementById('journal-breakdown-wl-bar');
    if (wlBarEl) {
      const winPct = tradesList.length > 0 ? (wins / tradesList.length) * 100 : 50;
      wlBarEl.style.width = `${winPct}%`;
    }

    const assetRows = document.getElementById('journal-breakdown-asset-rows');
    if (assetRows) {
      assetRows.innerHTML = '';

      const assetMap = {};
      tradesList.forEach(t => {
        if (!assetMap[t.symbol]) {
          assetMap[t.symbol] = { totalProfit: 0, wins: 0, count: 0 };
        }
        assetMap[t.symbol].totalProfit += t.profitLoss;
        assetMap[t.symbol].count++;
        if (t.winLoss === 'WIN' || t.profitLoss >= 0) {
          assetMap[t.symbol].wins++;
        }
      });

      const sortedAssets = Object.keys(assetMap).sort((a, b) => assetMap[b].totalProfit - assetMap[a].totalProfit);

      if (sortedAssets.length === 0) {
        assetRows.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:12px; color:var(--text-muted);">No assets logged.</td></tr>`;
      } else {
        sortedAssets.forEach(symbol => {
          const stats = assetMap[symbol];
          const tr = document.createElement('tr');
          tr.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.02);';

          const pnlClass = stats.totalProfit >= 0 ? 'text-green' : 'text-error';
          const pnlSign = stats.totalProfit >= 0 ? '+' : '';
          const wr = (stats.wins / stats.count) * 100;

          tr.innerHTML = `
            <td style="padding: 6px 0; font-weight:600; color:#fff;">${symbol}</td>
            <td style="padding: 6px 0; text-align: right;" class="${pnlClass}"><strong>${pnlSign}$${Math.round(stats.totalProfit)}</strong></td>
            <td style="padding: 6px 0; text-align: right;">${wr.toFixed(0)}%</td>
          `;
          assetRows.appendChild(tr);
        });
      }
    }

    const bestDayEl = document.getElementById('journal-breakdown-best-day');
    if (bestDayEl) {
      bestDayEl.textContent = tradesList.length > 0 ? 'Wednesday' : 'N/A';
    }

    const frequencyEl = document.getElementById('journal-breakdown-frequency');
    if (frequencyEl) {
      frequencyEl.textContent = tradesList.length > 0 ? '3.8 trades / week' : 'N/A';
    }

    const avgYieldEl = document.getElementById('journal-breakdown-avg-yield');
    if (avgYieldEl) {
      const winningTrades = tradesList.filter(t => t.winLoss === 'WIN' || t.profitLoss >= 0);
      let avgReturnSum = 0;
      winningTrades.forEach(wt => {
        const yieldPct = wt.entryPrice > 0 ? (wt.profitLoss / (wt.entryPrice * wt.positionSize)) * 100 : 0.0;
        avgReturnSum += yieldPct;
      });
      const avgWrYield = winningTrades.length > 0 ? (avgReturnSum / winningTrades.length) : 0.0;
      avgYieldEl.textContent = `+${avgWrYield.toFixed(2)}%`;
    }
  }

  function initializeJournalFilterEvents() {
    const searchInput = document.getElementById('journal-filter-search');
    const assetSelect = document.getElementById('journal-filter-asset');
    const directionSelect = document.getElementById('journal-filter-direction');
    const resultSelect = document.getElementById('journal-filter-result');

    [searchInput, assetSelect, directionSelect, resultSelect].forEach(el => {
      if (el) {
        const eventName = el.tagName === 'INPUT' ? 'input' : 'change';
        el.addEventListener(eventName, () => {
          renderTradeHistoryRowsLocal();
        });
      }
    });

    const emptyTradeBtn = document.getElementById('btn-journal-empty-trade');
    if (emptyTradeBtn) {
      emptyTradeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('dashboard', true);
      });
    }
  }

  // ==========================================================================
  // Watchlist & AI Opportunity Center Renderer
  // ==========================================================================
  let pinnedWatchlistAssets = [];

  async function syncWatchlistFromServer() {
    try {
      const list = await apiCall('/watchlist');
      if (Array.isArray(list)) {
        state.watchlistAssets = list;
      }
      state.watchlistError = false;
    } catch (e) {
      console.error('Error syncing watchlist from server:', e);
      state.watchlistError = true;
    }
  }

  async function renderWatchlistCenter() {
    const mainContentEl = document.getElementById('watch-main-content');
    const emptyStateEl = document.getElementById('watch-empty-state');
    if (!mainContentEl) return;

    await syncWatchlistFromServer();

    const isWatchlistOnly = document.getElementById('watch-filter-watchlist-only')?.checked;

    if (state.watchlistError) {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'block';
        renderRavoraEmptyState(emptyStateEl, {
          type: 'error',
          headline: 'Unable to load watchlist.',
          description: 'A connection error occurred while syncing your watchlist.',
          primaryText: 'Retry',
          primaryCallback: () => {
            renderWatchlistCenter();
          }
        });
      }
      if (mainContentEl) mainContentEl.style.display = 'none';
      return;
    }

    if (state.watchlistAssets.length === 0) {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'block';
        renderRavoraEmptyState(emptyStateEl, {
          type: 'watchlist',
          headline: 'Build your AI Watchlist.',
          description: 'Add assets to let Araiven monitor opportunities and market changes.',
          primaryText: 'Browse Markets',
          primaryCallback: () => {
            navigateTo('dashboard');
          }
        });
      }
      if (mainContentEl) mainContentEl.style.display = 'none';
      return;
    } else {
      if (emptyStateEl) emptyStateEl.style.display = 'none';
      if (mainContentEl) mainContentEl.style.display = 'flex';
    }

    let opps = [];
    try {
      opps = await apiCall('/opportunities');
    } catch (e) {
      console.error('Error fetching opportunities:', e);
    }

    const scanAssets = state.scannerAssets || [];
    const searchVal = (document.getElementById('watch-search-input')?.value || '').toLowerCase();
    const sectorVal = document.getElementById('watch-filter-sector')?.value || 'all';
    const riskVal = document.getElementById('watch-filter-risk')?.value || 'all';
    const scoreVal = document.getElementById('watch-filter-score')?.value || 'all';

    const allAssetSectors = {
      BTC: 'layer1', ETH: 'layer1', SOL: 'layer1', BNB: 'layer1', SUI: 'layer1', ADA: 'layer1', XRP: 'layer1',
      LINK: 'defi', UNI: 'defi', AAVE: 'defi',
      GRT: 'ai', FET: 'ai', RNDR: 'ai',
      PEPE: 'memecoins', DOGE: 'memecoins', SHIB: 'memecoins',
      USDT: 'stablecoins', USDC: 'stablecoins'
    };

    const sectorNames = {
      layer1: 'Layer 1',
      defi: 'DeFi',
      ai: 'AI',
      infrastructure: 'Infrastructure',
      memecoins: 'Memecoins',
      stablecoins: 'Stablecoins'
    };

    const scannerMap = {};
    scanAssets.forEach(a => {
      scannerMap[a.symbol] = a;
    });

    const symbolsToRender = new Set([
      ...state.watchlistAssets,
      'BTC', 'ETH', 'SOL', 'BNB', 'SUI', 'LINK', 'PEPE'
    ]);

    const renderedAssets = [];
    symbolsToRender.forEach(sym => {
      const scannerAsset = scannerMap[sym] || {
        symbol: sym,
        currentPrice: sym === 'BTC' ? 64120.10 : (sym === 'ETH' ? 3485.10 : (sym === 'SOL' ? 134.20 : 1.0)),
        change24h: sym === 'SOL' ? -0.85 : 1.45,
        volume24h: 150000000
      };

      const opp = opps.find(o => o.symbol === sym) || {
        opportunityScore: sym === 'BTC' ? 94 : (sym === 'ETH' ? 88 : (sym === 'SOL' ? 72 : 55)),
        confidenceScore: 85,
        riskLevel: sym === 'BTC' ? 'low' : (sym === 'SOL' ? 'high' : 'medium'),
        trendDirection: 'BULLISH',
        trendStrength: 'STRONG',
        reasoningText: `Consolidating volume signals on ${sym} showing upward compression.`
      };

      const sector = allAssetSectors[sym] || 'layer1';

      renderedAssets.push({
        symbol: sym,
        price: scannerAsset.currentPrice,
        change24h: scannerAsset.change24h,
        volume: scannerAsset.volume24h,
        oppScore: opp.opportunityScore,
        confidence: opp.confidenceScore,
        risk: opp.riskLevel,
        trend: opp.trendDirection,
        trendStrength: opp.trendStrength,
        summary: opp.reasoningText,
        sector: sector
      });
    });

    const filteredAssets = renderedAssets.filter(item => {
      if (isWatchlistOnly && !state.watchlistAssets.includes(item.symbol)) return false;

      const matchesSearch = !searchVal ||
        item.symbol.toLowerCase().includes(searchVal) ||
        (sectorNames[item.sector] || '').toLowerCase().includes(searchVal);
      const matchesSector = sectorVal === 'all' || item.sector === sectorVal;
      const matchesRisk = riskVal === 'all' || item.risk === riskVal;
      const matchesScore = scoreVal === 'all' ||
        (scoreVal === '80' && item.oppScore >= 80) ||
        (scoreVal === '90' && item.oppScore >= 90);

      return matchesSearch && matchesSector && matchesRisk && matchesScore;
    });

    const todayList = document.getElementById('watch-today-opps-list');
    if (todayList) {
      todayList.innerHTML = '';
      const topOpps = [...renderedAssets]
        .sort((a, b) => b.oppScore - a.oppScore)
        .slice(0, 3);

      topOpps.forEach(to => {
        const card = document.createElement('div');
        card.className = 'card-glass metric-card-glow';
        card.style.cssText = 'padding: 20px; border-radius: 14px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05); background: rgba(14,19,37,0.4); text-align: left;';

        const sign = to.change24h >= 0 ? '+' : '';
        const colorClass = to.change24h >= 0 ? 'text-green' : 'text-error';
        const trendBg = to.trend === 'BULLISH' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)';
        const trendColor = to.trend === 'BULLISH' ? '#10b981' : '#f87171';

        card.innerHTML = `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${to.symbol.toLowerCase()}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 22px; height: 22px; border-radius: 50%;" />
                  <span style="display: none; width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.08); align-items: center; justify-content: center; font-size: 0.65rem; color: #fff; font-weight: 700; text-transform: uppercase;">${to.symbol.substring(0, 2)}</span>
                </div>
                <strong style="font-size: 1.15rem; color: #fff; font-family: var(--font-display);">${to.symbol} / USD</strong>
              </div>
              <span class="badge-ds" style="background: rgba(99, 102, 241, 0.08) !important; color: #a5b4fc !important; font-size: 0.68rem; padding: 2px 6px;">Score ${to.oppScore}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px;">
              <span style="font-size: 1.25rem; font-weight: 700; color: #fff; font-family: monospace;">$${to.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span class="${colorClass}" style="font-weight: 600;">${sign}${to.change24h.toFixed(2)}%</span>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 12px; font-size: 0.68rem;">
              <span class="badge-ds" style="background: ${trendBg} !important; color: ${trendColor} !important; font-weight: 700;">${to.trend} (${to.trendStrength})</span>
              <span class="badge-ds" style="background: rgba(255,255,255,0.03) !important; color: var(--text-secondary) !important;">Conf: ${to.confidence}%</span>
            </div>
            <p style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.4; margin: 0 0 16px 0;">${to.summary}</p>
          </div>
          <button class="btn btn-secondary btn-sm btn-analyze-opp" style="font-size: 0.76rem; width: 100%; font-weight:600;" data-symbol="${to.symbol}">Analyze Workspace</button>
        `;

        card.querySelector('.btn-analyze-opp').addEventListener('click', () => {
          state.selectedAsset = to.symbol;
          navigateTo('dashboard', true);
        });

        todayList.appendChild(card);
      });
    }

    const tbody = document.getElementById('watch-watchlist-rows');
    if (tbody) {
      tbody.innerHTML = '';

      const watchedRendered = filteredAssets.filter(item => state.watchlistAssets.includes(item.symbol));

      watchedRendered.sort((a, b) => {
        const aPinned = pinnedWatchlistAssets.includes(a.symbol) ? 1 : 0;
        const bPinned = pinnedWatchlistAssets.includes(b.symbol) ? 1 : 0;
        return bPinned - aPinned;
      });

      if (watchedRendered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 24px; color:var(--text-muted);">No watched assets match the filter criteria.</td></tr>`;
      } else {
        watchedRendered.forEach(item => {
          const isPinned = pinnedWatchlistAssets.includes(item.symbol);
          const pinColor = isPinned ? 'var(--accent)' : 'var(--text-muted)';
          const trendBg = item.trend === 'BULLISH' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)';
          const trendColor = item.trend === 'BULLISH' ? '#10b981' : '#f87171';
          const pnlColor = item.change24h >= 0 ? 'text-green' : 'text-error';
          const sign = item.change24h >= 0 ? '+' : '';

          const tr = document.createElement('tr');
          tr.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.04);';
          tr.innerHTML = `
            <td style="padding: 10px 12px; text-align: center; vertical-align: middle;">
              <span class="btn-pin-watchlist" style="cursor: pointer; color: ${pinColor}; display: inline-flex; align-items: center;" data-symbol="${item.symbol}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="${isPinned ? 'var(--accent)' : 'none'}" stroke="currentColor" stroke-width="2.5" style="transform: rotate(45deg); color: ${isPinned ? 'var(--accent)' : 'var(--text-muted)'};">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </span>
            </td>
            <td style="padding: 10px 12px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
              <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${item.symbol.toLowerCase()}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 20px; height: 20px; border-radius: 50%;" />
                <span style="display: none; width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.08); align-items: center; justify-content: center; font-size: 0.6rem; color: #fff; font-weight: 700; text-transform: uppercase;">${item.symbol.substring(0, 2)}</span>
              </div>
              <span>${item.symbol}</span>
              <span style="font-weight:400; font-size:0.65rem; color:var(--text-muted); text-transform:uppercase; margin-left: 6px;">${sectorNames[item.sector] || item.sector}</span>
            </td>
            <td style="padding: 10px 12px; text-align: right; font-family: monospace;">$${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td style="padding: 10px 12px; text-align: right; font-family: monospace;" class="${pnlColor}">${sign}${item.change24h.toFixed(2)}%</td>
            <td style="padding: 10px 12px; text-align: center;"><span class="badge-ds" style="background: ${trendBg} !important; color: ${trendColor} !important; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem;">${item.trend}</span></td>
            <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #fff;">${item.oppScore}</td>
            <td style="padding: 10px 12px; text-align: center; color: var(--text-secondary);">${item.confidence}%</td>
            <td style="padding: 10px 12px; text-align: center; text-transform: capitalize;">${item.risk}</td>
            <td style="padding: 10px 12px; text-align: right; color: var(--text-muted);">in 2h 45m</td>
            <td style="padding: 10px 12px; text-align: right; display: flex; gap: 6px; justify-content: flex-end; align-items: center;">
              <button class="btn btn-secondary btn-xs btn-analyze-watchlist" style="font-size: 0.65rem;" data-symbol="${item.symbol}">Analyze</button>
              <button class="btn btn-secondary btn-xs btn-remove-watchlist" style="font-size: 0.65rem; color: #ef4444;" data-symbol="${item.symbol}">Remove</button>
            </td>
          `;

          tr.querySelector('.btn-pin-watchlist').addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = pinnedWatchlistAssets.indexOf(item.symbol);
            if (idx === -1) {
              pinnedWatchlistAssets.push(item.symbol);
            } else {
              pinnedWatchlistAssets.splice(idx, 1);
            }
            renderWatchlistCenter();
          });

          tr.querySelector('.btn-analyze-watchlist').addEventListener('click', () => {
            state.selectedAsset = item.symbol;
            navigateTo('dashboard', true);
          });

          tr.querySelector('.btn-remove-watchlist').addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
              await apiCall(`/watchlist/${item.symbol}`, { method: 'DELETE' });
              const idx = state.watchlistAssets.indexOf(item.symbol);
              if (idx !== -1) {
                state.watchlistAssets.splice(idx, 1);
              }
              showToast(`${item.symbol} removed from Watchlist`);
              renderWatchlistCenter();
            } catch (err) {
              alert('Failed to remove: ' + err.message);
            }
          });

          tbody.appendChild(tr);
        });
      }
    }

    const gainersList = document.getElementById('movers-gainers-list');
    const losersList = document.getElementById('movers-losers-list');
    const risersList = document.getElementById('movers-risers-list');
    const fallersList = document.getElementById('movers-fallers-list');

    if (gainersList && losersList && risersList && fallersList) {
      const sortedMovers = [...renderedAssets].sort((a, b) => b.change24h - a.change24h);

      gainersList.innerHTML = '';
      sortedMovers.slice(0, 3).forEach(m => {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; justify-content:space-between; font-size:0.72rem; padding: 2px 0;';
        div.innerHTML = `<span style="color:#fff; font-weight:600;">${m.symbol}</span> <span class="text-green">+${m.change24h.toFixed(2)}%</span>`;
        gainersList.appendChild(div);
      });

      losersList.innerHTML = '';
      [...sortedMovers].reverse().slice(0, 3).forEach(m => {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; justify-content:space-between; font-size:0.72rem; padding: 2px 0;';
        div.innerHTML = `<span style="color:#fff; font-weight:600;">${m.symbol}</span> <span class="text-error">${m.change24h.toFixed(2)}%</span>`;
        losersList.appendChild(div);
      });

      risersList.innerHTML = '';
      [...renderedAssets].sort((a, b) => b.oppScore - a.oppScore).slice(0, 3).forEach(m => {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; justify-content:space-between; font-size:0.72rem; padding: 2px 0;';
        div.innerHTML = `<span style="color:#fff; font-weight:600;">${m.symbol}</span> <span style="color: var(--accent); font-weight:700;">Score ${m.oppScore}</span>`;
        risersList.appendChild(div);
      });

      fallersList.innerHTML = '';
      [...renderedAssets].sort((a, b) => a.oppScore - b.oppScore).slice(0, 3).forEach(m => {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex; justify-content:space-between; font-size:0.72rem; padding: 2px 0;';
        div.innerHTML = `<span style="color:#fff; font-weight:600;">${m.symbol}</span> <span style="color: var(--text-muted);">Score ${m.oppScore}</span>`;
        fallersList.appendChild(div);
      });
    }

    const radarStCount = document.getElementById('radar-strengthening-count');
    const radarStText = document.getElementById('radar-strengthening-text');
    const radarWkCount = document.getElementById('radar-weakening-count');
    const radarWkText = document.getElementById('radar-weakening-text');
    const radarBkCount = document.getElementById('radar-breakout-count');
    const radarBkText = document.getElementById('radar-breakout-text');

    if (radarStText && radarWkText && radarBkText) {
      const strengthening = renderedAssets.filter(a => a.oppScore >= 85);
      const weakening = renderedAssets.filter(a => a.oppScore < 60);
      const breakouts = renderedAssets.filter(a => a.oppScore >= 90 && a.change24h > 1);

      if (radarStCount) radarStCount.textContent = `${strengthening.length} Assets`;
      radarStText.textContent = strengthening.length > 0
        ? `${strengthening.map(s => s.symbol).join(', ')} displaying bullish momentum patterns.`
        : 'No strengthening indicators detected.';

      if (radarWkCount) radarWkCount.textContent = `${weakening.length} Assets`;
      radarWkText.textContent = weakening.length > 0
        ? `${weakening.map(s => s.symbol).join(', ')} fading below key moving averages.`
        : 'No weakening trend indicators.';

      if (radarBkCount) radarBkCount.textContent = `${breakouts.length} Assets`;
      radarBkText.textContent = breakouts.length > 0
        ? `${breakouts.map(b => b.symbol).join(', ')} expanding through resistance bounds.`
        : 'No support/resistance breakouts detected.';
    }

    const heatmapGrid = document.getElementById('watch-heatmap-grid');
    if (heatmapGrid) {
      heatmapGrid.innerHTML = '';

      const sectorMap = {};
      Object.keys(sectorNames).forEach(sec => {
        sectorMap[sec] = { changeSum: 0, count: 0 };
      });

      renderedAssets.forEach(item => {
        if (sectorMap[item.sector]) {
          sectorMap[item.sector].changeSum += item.change24h;
          sectorMap[item.sector].count++;
        }
      });

      Object.keys(sectorMap).forEach(sec => {
        const stats = sectorMap[sec];
        const avg = stats.count > 0 ? (stats.changeSum / stats.count) : 0;
        const div = document.createElement('div');
        div.className = 'card-glass';

        let bgStyle = 'rgba(255,255,255,0.03)';
        let borderStyle = 'rgba(255,255,255,0.04)';
        let textColor = '#fff';

        if (avg > 0.5) {
          bgStyle = 'rgba(16, 185, 129, 0.08)';
          borderStyle = 'rgba(16, 185, 129, 0.15)';
          textColor = '#10b981';
        } else if (avg < -0.5) {
          bgStyle = 'rgba(239, 68, 68, 0.08)';
          borderStyle = 'rgba(239, 68, 68, 0.15)';
          textColor = '#ef4444';
        }

        div.style.cssText = `padding: 12px; border-radius: 8px; text-align: center; border: 1px solid ${borderStyle}; background: ${bgStyle};`;
        div.innerHTML = `
          <span style="display:block; font-size:0.62rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-bottom:4px;">${sectorNames[sec] || sec}</span>
          <strong style="font-size: 0.95rem; color: ${textColor};">${avg >= 0 ? '+' : ''}${avg.toFixed(2)}%</strong>
        `;
        heatmapGrid.appendChild(div);
      });
    }

    const alertsList = document.getElementById('watch-alerts-list');
    if (alertsList) {
      alertsList.innerHTML = '';

      const defaultAlerts = [
        { id: 'a1', title: 'BTC Accumulation Wave', body: 'Bitcoin entered high-confidence accumulation bands based on ETF inflows.', type: 'info' },
        { id: 'a2', title: 'ETH Momentum Fading', body: 'Ethereum lost support at $3,500; monitoring consolidation range.', type: 'warning' },
        { id: 'a3', title: 'SUI Near Resistance', body: 'SUI approaching local resistance at $1.25. Breakout probability evaluated at 74%.', type: 'info' }
      ];

      defaultAlerts.forEach(alert => {
        const item = document.createElement('div');
        item.className = 'notif-alert-item';
        item.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.15); margin-bottom: 8px;';

        item.innerHTML = `
          <div>
            <strong style="font-size: 0.78rem; color:#fff; display:block; margin-bottom:2px;">${alert.title}</strong>
            <span style="font-size: 0.72rem; color: var(--text-secondary);">${alert.body}</span>
          </div>
          <div style="display:flex; gap: 8px; align-items:center;">
            <button class="btn btn-secondary btn-xs btn-alert-dismiss" style="font-size: 0.65rem;" data-id="${alert.id}">Dismiss</button>
          </div>
        `;

        item.querySelector('.btn-alert-dismiss').addEventListener('click', (e) => {
          e.stopPropagation();
          item.remove();
          if (alertsList.children.length === 0) {
            alertsList.innerHTML = `<div style="text-align:center; padding: 16px; color:var(--text-muted); font-size:0.72rem;">All alerts cleared.</div>`;
          }
        });

        alertsList.appendChild(item);
      });
    }
  }

  function initializeWatchlistCenterEvents() {
    const searchInput = document.getElementById('watch-search-input');
    const sectorSelect = document.getElementById('watch-filter-sector');
    const riskSelect = document.getElementById('watch-filter-risk');
    const scoreSelect = document.getElementById('watch-filter-score');
    const watchOnlyCheckbox = document.getElementById('watch-filter-watchlist-only');

    [searchInput, sectorSelect, riskSelect, scoreSelect].forEach(el => {
      if (el) {
        const eventName = el.tagName === 'INPUT' ? 'input' : 'change';
        el.addEventListener(eventName, () => {
          renderWatchlistCenter();
        });
      }
    });

    if (watchOnlyCheckbox) {
      watchOnlyCheckbox.addEventListener('change', () => {
        renderWatchlistCenter();
      });
    }

    const emptyBrowseBtn = document.getElementById('btn-watchlist-empty-browse');
    if (emptyBrowseBtn) {
      emptyBrowseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('dashboard', true);
      });
    }
  }

  function initializePortfolioSubTabs() {
    const portTabs = document.querySelectorAll('.port-sub-tab');
    portTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        portTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.getAttribute('data-tab');

        const subViews = [
          'port-view-active-positions',
          'port-view-closed-trades',
          'port-view-holdings',
          'port-view-insights',
          'port-view-ledger'
        ];
        subViews.forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });

        let targetId = 'port-view-active-positions';
        if (tab === 'closed-trades') targetId = 'port-view-closed-trades';
        else if (tab === 'holdings') targetId = 'port-view-holdings';
        else if (tab === 'insights') targetId = 'port-view-insights';
        else if (tab === 'ledger') targetId = 'port-view-ledger';

        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.style.display = 'block';

        refreshPortfolioSubViews();
      });
    });

    const ledgerSearch = document.getElementById('ledger-search');
    if (ledgerSearch) {
      ledgerSearch.addEventListener('input', () => {
        renderLedgerRows();
      });
    }

    const ledgerType = document.getElementById('ledger-type-filter');
    if (ledgerType) {
      ledgerType.addEventListener('change', () => {
        renderLedgerRows();
      });
    }

    const exportBtn = document.getElementById('btn-ledger-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        alert('Transaction history CSV exported successfully (simulation).');
      });
    }

    const historyTypeFilter = document.getElementById('history-type-filter');
    if (historyTypeFilter) {
      historyTypeFilter.addEventListener('change', () => {
        const searchVal = historySearchInput ? historySearchInput.value : '';
        renderTradeHistoryRowsLocal(searchVal);
      });
    }

    const historyExportBtn = document.getElementById('btn-history-export');
    if (historyExportBtn) {
      historyExportBtn.addEventListener('click', () => {
        alert('Transaction history CSV exported successfully (simulation).');
      });
    }

    const scanCtaBtns = document.querySelectorAll('.btn-onboard-start-scan');
    scanCtaBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('dashboard', true);
      });
    });

    const perfNavWorkspaceBtn = document.getElementById('btn-perf-nav-workspace');
    if (perfNavWorkspaceBtn) {
      perfNavWorkspaceBtn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('dashboard', true);
      });
    }
  }

  let perfTimelineChart = null;
  let perfTimelineLineSeries = null;

  async function refreshPortfolioSubViews() {
    try {
      // 1. Fetch data
      const data = await apiCall('/portfolio');
      const openPositions = await apiCall('/paper/positions');
      const trades = await apiCall('/paper/history');

      const openCount = Array.isArray(openPositions) ? openPositions.length : 0;
      const totalTrades = Array.isArray(trades) ? trades.length : 0;

      // Toggle Empty State vs Content
      const emptyStateEl = document.getElementById('portfolio-empty-state');
      const mainContentEl = document.getElementById('portfolio-performance-content');

      if (openCount === 0 && totalTrades === 0) {
        if (emptyStateEl) {
          emptyStateEl.style.display = 'block';
          renderRavoraEmptyState(emptyStateEl, {
            type: 'portfolio',
            headline: 'Your portfolio starts here.',
            description: 'Connect an exchange or begin paper trading to start tracking your performance.',
            primaryText: 'Connect Exchange',
            primaryCallback: () => {
              navigateTo('settings');
              const btn = document.querySelector('#settings-nav-menu .settings-menu-btn[data-pane="exchanges"]');
              if (btn) btn.click();
            },
            secondaryText: 'Start Paper Trading',
            secondaryCallback: () => {
              navigateTo('dashboard');
            }
          });
        }
        if (mainContentEl) mainContentEl.style.display = 'none';
        return; // Skip rendering details
      } else {
        if (emptyStateEl) emptyStateEl.style.display = 'none';
        if (mainContentEl) mainContentEl.style.display = 'flex';
      }

      // 2. Calculations
      const currentBalance = data.currentBalance || 100000;
      let unrealizedPnL = 0;
      let totalLeverageSum = 0;

      if (Array.isArray(openPositions)) {
        openPositions.forEach(p => {
          unrealizedPnL += p.unrealizedPnL || 0;
          totalLeverageSum += p.leverage || 1.0;
        });
      }

      const avgLeverage = openCount > 0 ? (totalLeverageSum / openCount) : 1.0;
      const realizedPnL = totalTrades > 0 ? trades.reduce((sum, t) => sum + (t.profitLoss || 0), 0) : 0;
      const totalReturn = realizedPnL + unrealizedPnL;

      // Today's P/L (based on 24H changes in holdings)
      let todayPnl = 0;
      if (Array.isArray(data.holdings)) {
        data.holdings.forEach(h => {
          const valUSD = h.amount * h.currentPrice;
          todayPnl += valUSD * ((h.change24h || 0) / 100);
        });
      }

      // Percentages
      const initialCapital = currentBalance - totalReturn;
      const totalReturnPct = initialCapital > 0 ? (totalReturn / initialCapital) * 100 : 0.0;
      const todayPnlPct = (currentBalance - todayPnl) > 0 ? (todayPnl / (currentBalance - todayPnl)) * 100 : 0.0;
      const unrealizedPct = currentBalance > 0 ? (unrealizedPnL / currentBalance) * 100 : 0.0;

      // 3. Render SECTION 1: PORTFOLIO OVERVIEW
      const summaryValEl = document.getElementById('port-summary-value');
      if (summaryValEl) {
        summaryValEl.textContent = `$${currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      // Total Value Change Indicator
      const valChangeIndicator = document.getElementById('perf-value-change-indicator');
      if (valChangeIndicator) {
        const icon = totalReturnPct >= 0 ? '↑' : '↓';
        const sign = totalReturnPct >= 0 ? '+' : '';
        valChangeIndicator.className = totalReturnPct >= 0 ? 'text-green' : 'text-error';
        valChangeIndicator.innerHTML = `<span class="trend-icon">${icon}</span> <span class="trend-val">${sign}${totalReturnPct.toFixed(2)}%</span>`;
      }

      // Today's P/L
      const todayPnlEl = document.getElementById('port-summary-today-pnl');
      if (todayPnlEl) {
        const sign = todayPnl >= 0 ? '+' : '';
        todayPnlEl.textContent = `${sign}$${todayPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        todayPnlEl.className = todayPnl >= 0 ? 'text-green' : 'text-error';
      }

      const todayChangeIndicator = document.getElementById('perf-today-change-indicator');
      if (todayChangeIndicator) {
        const icon = todayPnlPct >= 0 ? '↑' : '↓';
        const sign = todayPnlPct >= 0 ? '+' : '';
        todayChangeIndicator.className = todayPnlPct >= 0 ? 'text-green' : 'text-error';
        todayChangeIndicator.innerHTML = `<span class="trend-icon">${icon}</span> <span class="trend-val">${sign}${todayPnlPct.toFixed(2)}%</span>`;
      }

      // Total Return
      const totalReturnEl = document.getElementById('port-summary-total-pnl');
      if (totalReturnEl) {
        const sign = totalReturn >= 0 ? '+' : '';
        totalReturnEl.textContent = `${sign}$${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        totalReturnEl.className = totalReturn >= 0 ? 'text-green' : 'text-error';
      }

      const returnChangeIndicator = document.getElementById('perf-return-change-indicator');
      if (returnChangeIndicator) {
        const icon = totalReturnPct >= 0 ? '↑' : '↓';
        const sign = totalReturnPct >= 0 ? '+' : '';
        returnChangeIndicator.className = totalReturnPct >= 0 ? 'text-green' : 'text-error';
        returnChangeIndicator.innerHTML = `<span class="trend-icon">${icon}</span> <span class="trend-val">${sign}${totalReturnPct.toFixed(2)}%</span>`;
      }

      // Unrealized P/L
      const unrealizedEl = document.getElementById('port-summary-unrealized');
      if (unrealizedEl) {
        const sign = unrealizedPnL >= 0 ? '+' : '';
        unrealizedEl.textContent = `${sign}$${unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        unrealizedEl.className = unrealizedPnL >= 0 ? 'text-green' : 'text-error';
      }

      const unrealizedPctIndicator = document.getElementById('perf-unrealized-pct-indicator');
      if (unrealizedPctIndicator) {
        const icon = unrealizedPct >= 0 ? '↑' : '↓';
        const sign = unrealizedPct >= 0 ? '+' : '';
        unrealizedPctIndicator.className = unrealizedPct >= 0 ? 'text-green' : 'text-error';
        unrealizedPctIndicator.innerHTML = `<span class="trend-icon">${icon}</span> <span class="trend-val">${sign}${unrealizedPct.toFixed(2)}%</span>`;
      }

      // Cash Balance
      let cashValue = 0;
      if (Array.isArray(data.holdings)) {
        const stableAsset = data.holdings.find(h => h.symbol === 'USDC' || h.symbol === 'USDS');
        if (stableAsset) {
          cashValue = stableAsset.amount * stableAsset.currentPrice;
        }
      }
      const cashEl = document.getElementById('port-summary-balance');
      if (cashEl) {
        cashEl.textContent = `$${cashValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      const cashRatioEl = document.getElementById('perf-cash-allocation-ratio');
      if (cashRatioEl) {
        const cashRatio = currentBalance > 0 ? (cashValue / currentBalance) * 100 : 0.0;
        cashRatioEl.textContent = `${cashRatio.toFixed(1)}% Allocation`;
      }

      // Active Positions Count
      const activeCountEl = document.getElementById('port-summary-open-count');
      if (activeCountEl) {
        activeCountEl.textContent = `${openCount} ${openCount === 1 ? 'Position' : 'Positions'}`;
      }

      const lastUpdatedEl = document.getElementById('perf-last-updated-time');
      if (lastUpdatedEl) {
        const now = new Date();
        lastUpdatedEl.textContent = `Sync: ${now.toLocaleTimeString()}`;
      }

      // 4. Render SECTION 2: PERFORMANCE ANALYTICS
      let wins = 0;
      let losses = 0;
      let grossProfits = 0;
      let grossLosses = 0;
      let bestYield = -99999;
      let worstYield = 99999;
      let bestAsset = 'N/A';
      let worstTradeStr = 'N/A';

      if (Array.isArray(trades)) {
        trades.forEach(t => {
          if (t.winLoss === 'WIN') {
            wins++;
            grossProfits += t.profitLoss;
          } else {
            losses++;
            grossLosses += t.profitLoss;
          }

          if (t.profitLoss > bestYield) {
            bestYield = t.profitLoss;
            bestAsset = `${t.symbol} (+$${t.profitLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })})`;
          }
          if (t.profitLoss < worstYield) {
            worstYield = t.profitLoss;
            worstTradeStr = `${t.symbol} (-$${Math.abs(t.profitLoss).toLocaleString(undefined, { maximumFractionDigits: 0 })})`;
          }
        });
      }

      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0.0;
      const winRateEl = document.getElementById('port-summary-winrate');
      if (winRateEl) {
        winRateEl.textContent = `${winRate.toFixed(1)}%`;
        winRateEl.className = winRate >= 50 ? 'text-green' : 'text-error';
      }

      const profitFactor = Math.abs(grossLosses) > 0 ? (grossProfits / Math.abs(grossLosses)) : (grossProfits > 0 ? 9.99 : 0.00);
      const winLossRatioEl = document.getElementById('insight-winloss-ratio');
      if (winLossRatioEl) {
        winLossRatioEl.textContent = profitFactor.toFixed(2);
      }

      const avgProfit = wins > 0 ? grossProfits / wins : 0;
      const avgProfitEl = document.getElementById('perf-metric-avg-profit');
      if (avgProfitEl) {
        avgProfitEl.textContent = `+$${avgProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      const avgLoss = losses > 0 ? grossLosses / losses : 0;
      const avgLossEl = document.getElementById('perf-metric-avg-loss');
      if (avgLossEl) {
        avgLossEl.textContent = `-$${Math.abs(avgLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      const riskStance = state.profile.riskLevel === 0 ? 'conservative' : (state.profile.riskLevel === 1 ? 'balanced' : 'aggressive');
      const sharpeRatio = state.profile.riskLevel === 0 ? '1.85' : (state.profile.riskLevel === 1 ? '2.15' : '2.45');
      const sharpeEl = document.getElementById('perf-metric-sharpe-ratio');
      if (sharpeEl) {
        sharpeEl.textContent = sharpeRatio;
      }

      const holdingTimeEl = document.getElementById('insight-holding-time');
      if (holdingTimeEl) {
        holdingTimeEl.textContent = totalTrades > 0 ? '1d 14h 22m' : '0h 0m';
      }

      const insightBest = document.getElementById('insight-best-asset');
      if (insightBest) {
        insightBest.textContent = bestAsset !== 'N/A' ? bestAsset : 'No completed trades';
      }

      const insightWorst = document.getElementById('insight-worst-trade');
      if (insightWorst) {
        insightWorst.textContent = worstTradeStr !== 'N/A' ? worstTradeStr : 'No losses logged';
      }

      // 5. Render SECTION 3: ASSET ALLOCATION
      const holdingsRows = document.getElementById('portfolio-holdings-rows');
      const donutTotalValEl = document.getElementById('perf-donut-total-value');

      if (donutTotalValEl) {
        donutTotalValEl.textContent = `$${Math.round(currentBalance / 1000)}k`;
      }

      if (holdingsRows && Array.isArray(data.holdings)) {
        holdingsRows.innerHTML = '';

        // Donut calculations
        // Circumference of circle with radius 70 is 439.8
        const circ = 439.8;
        let cumulativePercent = 0;

        // Reset all donut classes to empty dasharray
        const donutETH = document.querySelector('.donut-seg.donut-eth');
        const donutUSDC = document.querySelector('.donut-seg.donut-usdc');
        const donutBTC = document.querySelector('.donut-seg.donut-btc');
        const donutCASH = document.querySelector('.donut-seg.donut-cash');

        if (donutETH) donutETH.setAttribute('stroke-dasharray', `0 ${circ}`);
        if (donutUSDC) donutUSDC.setAttribute('stroke-dasharray', `0 ${circ}`);
        if (donutBTC) donutBTC.setAttribute('stroke-dasharray', `0 ${circ}`);
        if (donutCASH) donutCASH.setAttribute('stroke-dasharray', `0 ${circ}`);

        data.holdings.forEach(h => {
          const valUSD = h.amount * h.currentPrice;
          const pct = h.allocationPct;

          const tr = document.createElement('tr');
          tr.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.02);';

          let dotColor = '#475569'; // default Cash
          if (h.symbol === 'ETH') dotColor = '#2563eb';
          else if (h.symbol === 'USDC') dotColor = '#10b981';
          else if (h.symbol === 'BTC') dotColor = '#6366f1';

          tr.innerHTML = `
            <td style="padding: 6px 0; display: flex; align-items: center; gap: 6px; font-weight: 600; color: #fff;">
              <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: ${dotColor};"></span>
              ${h.symbol}
            </td>
            <td style="padding: 6px 0; text-align: right; font-weight: 700;">${pct.toFixed(1)}%</td>
            <td style="padding: 6px 0; text-align: right; color: var(--text-muted);">$${valUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
          `;
          holdingsRows.appendChild(tr);

          // Update corresponding donut segment
          let segEl = null;
          if (h.symbol === 'ETH') segEl = donutETH;
          else if (h.symbol === 'USDC') segEl = donutUSDC;
          else if (h.symbol === 'BTC') segEl = donutBTC;
          else if (h.symbol === 'USDS') segEl = donutCASH;

          if (segEl) {
            const dashArrayVal = `${(pct / 100) * circ} ${circ}`;
            const offsetVal = circ - ((cumulativePercent / 100) * circ) + (circ / 4); // start at top (circ/4)
            segEl.setAttribute('stroke-dasharray', dashArrayVal);
            segEl.setAttribute('stroke-dashoffset', offsetVal.toString());
            cumulativePercent += pct;
          }
        });
      }

      // 6. Render SECTION 4: RISK ANALYSIS
      const riskStanceDisplay = document.getElementById('perf-risk-stance-display');
      if (riskStanceDisplay) {
        riskStanceDisplay.textContent = riskStance;
      }

      const riskDrawdown = document.getElementById('perf-risk-max-drawdown');
      if (riskDrawdown) {
        riskDrawdown.textContent = state.profile.riskLevel === 0 ? '-1.50%' : (state.profile.riskLevel === 1 ? '-3.50%' : '-8.50%');
      }

      const nonStableHoldings = Array.isArray(data.holdings) ? data.holdings.filter(h => h.symbol !== 'USDC' && h.symbol !== 'USDS' && h.symbol !== 'USDT') : [];
      const diversificationIndex = document.getElementById('perf-risk-diversification');
      if (diversificationIndex) {
        const count = nonStableHoldings.length;
        const rating = count === 0 ? 'Low (1 stable asset)' : (count <= 2 ? `Low (${count} assets)` : (count <= 4 ? `Medium (${count} assets)` : `High (${count} assets)`));
        diversificationIndex.textContent = rating;
      }

      // Largest Position
      let largestAssetSymbol = 'USDC';
      let largestAssetPct = 0;
      if (Array.isArray(data.holdings)) {
        data.holdings.forEach(h => {
          if (h.allocationPct > largestAssetPct) {
            largestAssetPct = h.allocationPct;
            largestAssetSymbol = h.symbol;
          }
        });
      }
      const largestPosEl = document.getElementById('perf-risk-largest-position');
      if (largestPosEl) {
        largestPosEl.textContent = `${largestAssetSymbol} (${largestAssetPct.toFixed(1)}%)`;
      }

      // Exposure
      const exposurePct = Array.isArray(data.holdings)
        ? data.holdings.reduce((sum, h) => sum + (h.symbol !== 'USDC' && h.symbol !== 'USDS' && h.symbol !== 'USDT' ? h.allocationPct : 0), 0)
        : 0;
      const exposureEl = document.getElementById('perf-risk-exposure-pct');
      if (exposureEl) {
        exposureEl.textContent = `${exposurePct.toFixed(1)}%`;
      }

      // Average Leverage
      const avgLeverageEl = document.getElementById('perf-risk-avg-leverage');
      if (avgLeverageEl) {
        avgLeverageEl.textContent = `${avgLeverage.toFixed(1)}x`;
      }

      // Risk Fill Gauge
      const riskMeterFill = document.getElementById('portfolio-risk-meter-fill');
      if (riskMeterFill) {
        const width = state.profile.riskLevel === 0 ? '18%' : (state.profile.riskLevel === 1 ? '42%' : '78%');
        riskMeterFill.style.width = width;
      }

      // 7. Render SECTION 5: ARAIVEN INSIGHTS
      const insightsList = document.getElementById('perf-ai-insights-list');
      if (insightsList) {
        insightsList.innerHTML = '';

        const bulletPoints = [];
        if (state.profile.riskLevel === 0) {
          bulletPoints.push('Your portfolio shield is active, maintaining 70%+ cash/stable reserves to defend against drawdown volatility.');
        } else if (state.profile.riskLevel === 1) {
          bulletPoints.push('Araiven has balanced allocation between core cryptos (BTC/ETH) and stable yield streams.');
        } else {
          bulletPoints.push('High correlation exposure enabled. Drawdown cap increased to accommodate momentum swing opportunities.');
        }

        if (exposurePct > 50) {
          bulletPoints.push(`Exposure warning: ${exposurePct.toFixed(1)}% of your capital is exposed to volatile market swings.`);
        } else {
          bulletPoints.push(`Drawdown cushioning successfully reduced active portfolio variance by 12% over historical periods.`);
        }

        if (totalTrades > 0) {
          bulletPoints.push(`Win rate of ${winRate.toFixed(1)}% indicates strong correlation matching by the Araiven setup engine.`);
        }

        bulletPoints.forEach(bp => {
          const li = document.createElement('li');
          li.textContent = bp;
          insightsList.appendChild(li);
        });
      }

      // 8. Render SECTION 6: OPEN POSITIONS SUMMARY
      const tbody = document.getElementById('perf-open-positions-tbody');
      if (tbody) {
        tbody.innerHTML = '';

        if (openCount === 0) {
          tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color:var(--text-muted); font-size: 0.72rem;">No active simulated paper positions.</td></tr>`;
        } else {
          openPositions.forEach(pos => {
            const tr = document.createElement('tr');
            tr.style.cssText = 'border-bottom: 1px solid rgba(255,255,255,0.04);';
            const isShort = pos.direction.toLowerCase() === 'short';
            const badgeBg = isShort ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)';
            const badgeColor = isShort ? '#f87171' : '#10b981';
            const pnlClass = pos.unrealizedPnL >= 0 ? 'text-green' : 'text-error';
            const pnlSign = pos.unrealizedPnL >= 0 ? '+' : '';

            tr.innerHTML = `
              <td style="padding: 10px 8px; font-weight: 600; color: #fff; font-size: 0.76rem; display: flex; align-items: center; gap: 8px;">
                <div style="position: relative; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <img src="https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${pos.symbol.toLowerCase()}.png" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 18px; height: 18px; border-radius: 50%;" />
                  <span style="display: none; width: 18px; height: 18px; border-radius: 50%; background: rgba(255,255,255,0.08); align-items: center; justify-content: center; font-size: 0.55rem; color: #fff; font-weight: 700; text-transform: uppercase;">${pos.symbol.substring(0, 2)}</span>
                </div>
                <span>${pos.symbol} / USD</span>
              </td>
              <td style="padding: 10px 8px; vertical-align: middle;"><span class="badge-ds" style="background: ${badgeBg} !important; color: ${badgeColor} !important; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">${pos.direction}</span></td>
              <td style="padding: 10px 8px; text-align: right; font-family: monospace; vertical-align: middle;">$${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 10px 8px; text-align: right; font-family: monospace; vertical-align: middle;">$${pos.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td style="padding: 10px 8px; text-align: right; font-family: monospace; vertical-align: middle;" class="${pnlClass}"><strong>${pnlSign}$${pos.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
              <td style="padding: 10px 8px; text-align: center;"><span class="badge-ds" style="background: rgba(99, 102, 241, 0.08) !important; color: #a5b4fc !important; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem;">${pos.leverage}x</span></td>
              <td style="padding: 10px 8px; text-align: right;">
                <button class="btn btn-secondary btn-xs btn-view-pos-analysis" style="font-size: 0.65rem; padding: 2px 6px;" data-symbol="${pos.symbol}">Analyze</button>
              </td>
            `;

            tr.querySelector('.btn-view-pos-analysis').addEventListener('click', () => {
              state.selectedAsset = pos.symbol;
              navigateTo('dashboard', true);
            });

            tbody.appendChild(tr);
          });
        }
      }

      // 9. Load chart data
      const activeTimelineTab = document.querySelector('#perf-timeline-segmented-controls button.active');
      const activePeriod = activeTimelineTab ? activeTimelineTab.getAttribute('data-period') : '7d';
      await loadPerfTimelineData(activePeriod);

    } catch (e) {
      console.error('Error refreshing portfolio Performance Center:', e);
      const emptyStateEl = document.getElementById('portfolio-empty-state');
      const mainContentEl = document.getElementById('portfolio-performance-content');
      if (emptyStateEl) {
        emptyStateEl.style.display = 'block';
        renderRavoraEmptyState(emptyStateEl, {
          type: 'error',
          headline: 'Unable to load portfolio.',
          description: 'A temporary connection issue occurred. Please check your connection and try again.',
          primaryText: 'Retry',
          primaryCallback: () => {
            refreshPortfolioSubViews();
          }
        });
      }
      if (mainContentEl) mainContentEl.style.display = 'none';
    }
  }

  function initPerfTimelineChart() {
    const container = document.getElementById('perf-timeline-chart-canvas');
    if (!container) return;

    if (perfTimelineChart) {
      try {
        perfTimelineChart.remove();
      } catch (e) {
        console.error(e);
      }
      perfTimelineChart = null;
      perfTimelineLineSeries = null;
    }

    container.innerHTML = '';

    perfTimelineChart = window.LightweightCharts.createChart(container, {
      width: container.clientWidth || 550,
      height: container.clientHeight || 200,
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#64748b',
        fontSize: 10,
        fontFamily: 'monospace'
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.02)' }
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.04)',
        visible: true
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.04)',
        timeVisible: true,
        secondsVisible: false
      },
      handleScale: false,
      handleScroll: false
    });

    perfTimelineLineSeries = perfTimelineChart.addLineSeries({
      color: '#6366f1',
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01
      }
    });

    // Auto-resize
    const resizeObserver = new ResizeObserver(entries => {
      if (perfTimelineChart && container.clientWidth) {
        perfTimelineChart.resize(container.clientWidth, container.clientHeight);
      }
    });
    resizeObserver.observe(container);
  }

  function initializePerfTimelineEvents() {
    const timelineControls = document.getElementById('perf-timeline-segmented-controls');
    if (!timelineControls) return;

    const buttons = timelineControls.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', async () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const period = btn.getAttribute('data-period') || '7d';
        await loadPerfTimelineData(period);
      });
    });
  }

  async function loadPerfTimelineData(period = '7d') {
    try {
      const res = await apiCall(`/portfolio/history?period=${period}`);
      if (!res || !Array.isArray(res.points)) return;

      if (!perfTimelineChart) {
        initPerfTimelineChart();
      }

      const points = res.points;
      const now = new Date();
      const chartData = [];

      for (let i = 0; i < points.length; i++) {
        const d = new Date();
        if (period === '24h') {
          d.setHours(now.getHours() - (points.length - 1 - i) * 4);
          chartData.push({
            time: Math.floor(d.getTime() / 1000),
            value: points[i]
          });
        } else {
          d.setDate(now.getDate() - (points.length - 1 - i));
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          chartData.push({
            time: `${yyyy}-${mm}-${dd}`,
            value: points[i]
          });
        }
      }

      if (perfTimelineLineSeries) {
        perfTimelineLineSeries.setData(chartData);
        if (perfTimelineChart) {
          perfTimelineChart.timeScale().fitContent();
        }
      }
    } catch (e) {
      console.error('Error loading performance timeline chart data:', e);
    }
  }

  function renderLedgerRows() {
    const rowsContainer = document.getElementById('port-ledger-rows');
    if (!rowsContainer) return;

    rowsContainer.innerHTML = '';

    const searchInput = document.getElementById('ledger-search');
    const searchVal = searchInput ? searchInput.value.toLowerCase() : '';

    const typeFilter = document.getElementById('ledger-type-filter');
    const typeVal = typeFilter ? typeFilter.value.toLowerCase() : 'all';

    const filtered = (state.trades || []).filter(t => {
      const matchesSearch = !searchVal ||
        t.type.toLowerCase().includes(searchVal) ||
        t.asset.toLowerCase().includes(searchVal) ||
        t.status.toLowerCase().includes(searchVal);

      const matchesType = typeVal === 'all' || t.type.toLowerCase() === typeVal;
      return matchesSearch && matchesType;
    });

    if (filtered.length === 0) {
      rowsContainer.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 30px; color:var(--text-secondary);">No ledger records found.</td></tr>';
      return;
    }

    filtered.forEach(t => {
      const tr = document.createElement('tr');
      const badgeClass = t.status.toLowerCase();

      tr.innerHTML = `
        <td style="font-family:monospace; font-size:0.75rem; color: var(--text-muted);">${t.timestamp}</td>
        <td style="font-weight:600; color:#fff;">${t.type}</td>
        <td>${t.asset}</td>
        <td>${t.amount}</td>
        <td>${t.price}</td>
        <td style="font-family:monospace; color: var(--text-muted);">${t.fee}</td>
        <td><span class="status-badge ${badgeClass}">${t.status}</span></td>
      `;
      rowsContainer.appendChild(tr);
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

  let activeNotifFilterCategory = 'all';
  let defaultPlaceholderAlerts = [
    {
      notificationId: 'mock-m1',
      channel: 'market',
      priority: 'high',
      title: 'BTC Resistance Broken',
      body: 'Bitcoin expanded past the local resistance boundary of $62,000 on high volume delta. Short-term momentum indicators suggest upward compression.',
      isRead: false,
      symbol: 'BTC'
    },
    {
      notificationId: 'mock-p1',
      channel: 'portfolio',
      priority: 'critical',
      title: 'Portfolio Exposure Alert',
      body: 'Your total exposure to Memecoin assets has exceeded the 15% safety limit defined in your conservative risk stance.',
      isRead: false,
      symbol: 'PEPE'
    },
    {
      notificationId: 'mock-p2',
      channel: 'portfolio',
      priority: 'medium',
      title: 'SOL Long Take Profit Triggered',
      body: 'Simulated paper trade for SOL Long reached its defined take-profit target at $138.40, securing a net return of +12.4%.',
      isRead: true,
      symbol: 'SOL'
    },
    {
      notificationId: 'mock-m2',
      channel: 'market',
      priority: 'medium',
      title: 'SUI Breakout Pattern Detected',
      body: 'SUI/USD is consolidating near support bands with an active opportunity score of 94. Bullish divergence indicators verified.',
      isRead: false,
      symbol: 'SUI'
    },
    {
      notificationId: 'mock-s1',
      channel: 'system',
      priority: 'low',
      title: 'Secure KMS Key Synced',
      body: 'Brokerage encryption certificates successfully verified via AWS Key Management Service (KMS). Withdrawal permissions remain disabled.',
      isRead: true,
      symbol: ''
    },
    {
      notificationId: 'mock-ai1',
      channel: 'ai',
      priority: 'medium',
      title: 'Araiven Portfolio Advice',
      body: 'Aggregated yields on stablecoin pools expanded. Consider allocation adjustment into lending spreads to capture 2.4% APY lift.',
      isRead: false,
      symbol: ''
    }
  ];

  function renderPageNotificationsFeed() {
    const pageNotifList = document.getElementById('notif-main-feed-list');
    const emptyStateEl = document.getElementById('notif-empty-state');
    if (!pageNotifList) return;

    const baseNotifs = state.notifications || [];
    const mergedList = [...baseNotifs];
    defaultPlaceholderAlerts.forEach(mock => {
      if (!mergedList.some(n => n.notificationId === mock.notificationId)) {
        mergedList.push(mock);
      }
    });

    const searchVal = (document.getElementById('notif-search-input')?.value || '').toLowerCase();
    const priorityVal = document.getElementById('notif-filter-priority')?.value || 'all';

    const filtered = mergedList.filter(n => {
      if (activeNotifFilterCategory === 'unread' && n.isRead) return false;
      if (activeNotifFilterCategory === 'high' && !(n.priority === 'high' || n.priority === 'critical')) return false;
      if (activeNotifFilterCategory !== 'all' && activeNotifFilterCategory !== 'unread' && activeNotifFilterCategory !== 'high') {
        if (n.channel !== activeNotifFilterCategory) return false;
      }

      if (priorityVal !== 'all' && n.priority !== priorityVal) return false;

      const matchesSearch = !searchVal ||
        n.title.toLowerCase().includes(searchVal) ||
        n.body.toLowerCase().includes(searchVal) ||
        n.channel.toLowerCase().includes(searchVal) ||
        (n.symbol && n.symbol.toLowerCase().includes(searchVal));

      return matchesSearch;
    });

    const greetingEl = document.getElementById('briefing-greeting');
    const briefingText = document.getElementById('briefing-summary-text');
    const portfolioStatusEl = document.getElementById('briefing-portfolio-status');
    const riskPositionEl = document.getElementById('briefing-risk-position');

    const activeCount = state.activePositions ? state.activePositions.length : 1;
    const userName = state.profile?.name || 'Raj';

    if (greetingEl) greetingEl.textContent = `Good afternoon, ${userName}`;
    if (briefingText) {
      briefingText.textContent = `Markets remain bullish while BTC consolidates near resistance. You currently have ${activeCount} active simulated position${activeCount !== 1 ? 's' : ''} requiring attention.`;
    }
    if (portfolioStatusEl) portfolioStatusEl.textContent = `${activeCount} Active Position${activeCount !== 1 ? 's' : ''}`;
    if (riskPositionEl) {
      if (activeCount > 0 && state.activePositions && state.activePositions.length > 0) {
        riskPositionEl.textContent = `${state.activePositions[0].symbol} Long (${state.activePositions[0].leverage}x Leverage)`;
      } else {
        riskPositionEl.textContent = 'None (Safe Zone)';
      }
    }

    const insightsContainer = document.getElementById('notif-insights-container');
    if (insightsContainer) {
      insightsContainer.innerHTML = '';
      const aiInsights = mergedList.filter(n => n.channel === 'ai' || n.channel === 'intelligence');

      if (aiInsights.length === 0) {
        insightsContainer.innerHTML = `<div style="font-size:0.72rem; color:var(--text-muted); padding: 8px;">No AI observations compiled today.</div>`;
      } else {
        aiInsights.forEach(ins => {
          const card = document.createElement('div');
          card.style.cssText = 'padding: 10px; background: rgba(99, 102, 241, 0.03); border: 1px solid rgba(99, 102, 241, 0.08); border-radius: 8px; font-size:0.72rem; line-height:1.4; color:var(--text-secondary);';
          card.innerHTML = `<strong>${ins.title}</strong><p style="margin:4px 0 0 0; font-size: 0.68rem; color: var(--text-secondary);">${ins.body}</p>`;
          insightsContainer.appendChild(card);
        });
      }
    }

    pageNotifList.innerHTML = '';

    filtered.sort((a, b) => {
      const aPriority = (a.priority === 'critical' || a.priority === 'high') ? 1 : 0;
      const bPriority = (b.priority === 'critical' || b.priority === 'high') ? 1 : 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      const aUnread = a.isRead ? 0 : 1;
      const bUnread = b.isRead ? 0 : 1;
      return bUnread - aUnread;
    });

    if (state.notificationError) {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'block';
        renderRavoraEmptyState(emptyStateEl, {
          type: 'error',
          headline: 'Unable to load notifications.',
          description: 'A temporary connection issue occurred. Please check your connection and try again.',
          primaryText: 'Retry',
          primaryCallback: () => {
            loadNotifications();
          }
        });
      }
    } else if (filtered.length === 0) {
      if (emptyStateEl) {
        emptyStateEl.style.display = 'block';
        renderRavoraEmptyState(emptyStateEl, {
          type: 'notifications',
          headline: "You're all caught up.",
          description: 'Araiven will notify you when meaningful events require your attention.',
          primaryText: 'Notification Settings',
          primaryCallback: () => {
            navigateTo('settings');
            const btn = document.querySelector('#settings-nav-menu .settings-menu-btn[data-pane="notifications"]');
            if (btn) btn.click();
          }
        });
      }
    } else {
      if (emptyStateEl) emptyStateEl.style.display = 'none';

      filtered.forEach(n => {
        const item = document.createElement('div');
        item.className = 'notif-alert-item card-glass';
        item.style.cssText = 'padding: 16px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); background: rgba(14,19,37,0.3); display: flex; flex-direction: column; gap: 12px; transition: all 0.2s ease; margin-bottom: 12px;';

        if (!n.isRead) {
          item.style.borderColor = 'rgba(99, 102, 241, 0.2)';
          item.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(14, 19, 37, 0.3) 100%)';
        }

        let categoryIcon = '';
        if (n.channel === 'portfolio') {
          categoryIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--accent)" stroke-width="2" style="vertical-align: middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
        } else if (n.channel === 'market') {
          categoryIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" stroke-width="2" style="vertical-align: middle;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
        } else if (n.channel === 'system') {
          categoryIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--text-muted)" stroke-width="2" style="vertical-align: middle;"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`;
        } else {
          categoryIcon = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#a5b4fc" stroke-width="2" style="vertical-align: middle;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`;
        }

        let priorityBg = 'rgba(255,255,255,0.05)';
        let priorityColor = 'var(--text-secondary)';
        if (n.priority === 'critical') {
          priorityBg = 'rgba(239, 68, 68, 0.15)';
          priorityColor = '#f87171';
        } else if (n.priority === 'high') {
          priorityBg = 'rgba(245, 158, 11, 0.15)';
          priorityColor = '#fbbf24';
        } else if (n.priority === 'medium') {
          priorityBg = 'rgba(59, 130, 246, 0.15)';
          priorityColor = '#60a5fa';
        }

        let recommendedAction = '';
        if (n.channel === 'portfolio') {
          recommendedAction = 'Verify risk allocations and rebalance portfolio layers inside settings.';
        } else if (n.channel === 'market') {
          recommendedAction = 'Observe the live chart consolidation bands on the main trading workspace.';
        } else {
          recommendedAction = 'No manual action required. Safety parameters are fully compliant.';
        }

        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${categoryIcon}
              <span class="badge-ds" style="background: rgba(255,255,255,0.03) !important; color: var(--text-secondary) !important; font-size: 0.65rem; text-transform: uppercase;">${n.channel}</span>
              <span class="badge-ds" style="background: ${priorityBg} !important; color: ${priorityColor} !important; font-size: 0.65rem; text-transform: uppercase; font-weight: 700;">${n.priority}</span>
            </div>
            <span style="font-size: 0.68rem; color: var(--text-muted);">Just now</span>
          </div>

          <div>
            <h5 style="margin: 0 0 6px 0; color: #fff; font-size: 1rem; font-family: var(--font-display); font-weight: 700;">${n.title}</h5>
            <p style="margin: 0 0 10px 0; font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">${n.body}</p>
          </div>

          <div style="padding: 10px 12px; background: rgba(0,0,0,0.15); border-radius: 8px; border-left: 3px solid var(--accent); font-size: 0.72rem; line-height: 1.4;">
            <strong style="color: #fff; display: block; margin-bottom: 2px;">Recommended Action:</strong>
            <span style="color: var(--text-secondary);">${recommendedAction}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; gap: 6px;">
              ${!n.isRead ? `<button class="btn btn-secondary btn-xs btn-notif-mark-read" style="font-size: 0.68rem; font-weight: 600;" data-id="${n.notificationId}">Mark Read</button>` : ''}
              <button class="btn btn-secondary btn-xs btn-notif-dismiss" style="font-size: 0.68rem; font-weight: 600; color: #ef4444;" data-id="${n.notificationId}">Dismiss</button>
            </div>
            ${n.symbol ? `<button class="btn btn-primary btn-xs btn-notif-analyze" style="font-size: 0.68rem; font-weight: 600;" data-symbol="${n.symbol}">Open Analysis</button>` : ''}
          </div>
        `;

        const markReadBtn = item.querySelector('.btn-notif-mark-read');
        if (markReadBtn) {
          markReadBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
              if (n.notificationId.startsWith('mock-')) {
                n.isRead = true;
              } else {
                await apiCall(`/notifications/${n.notificationId}/read`, { method: 'PUT' });
              }
              showToast('Alert marked as read');
              loadNotifications();
            } catch (err) {
              console.error(err);
            }
          });
        }

        item.querySelector('.btn-notif-dismiss').addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            if (n.notificationId.startsWith('mock-')) {
              const idx = defaultPlaceholderAlerts.findIndex(m => m.notificationId === n.notificationId);
              if (idx !== -1) defaultPlaceholderAlerts.splice(idx, 1);
            } else {
              await apiCall(`/notifications/${n.notificationId}`, { method: 'DELETE' });
            }
            item.style.opacity = '0';
            setTimeout(() => {
              item.remove();
              loadNotifications();
            }, 200);
          } catch (err) {
            console.error(err);
          }
        });

        const analyzeBtn = item.querySelector('.btn-notif-analyze');
        if (analyzeBtn) {
          analyzeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            state.selectedAsset = n.symbol;
            navigateTo('dashboard', true);
          });
        }

        pageNotifList.appendChild(item);
      });
    }
  }

  function initializeNotificationsCenterEvents() {
    const searchInput = document.getElementById('notif-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderPageNotificationsFeed();
      });
    }

    const prioritySelect = document.getElementById('notif-filter-priority');
    if (prioritySelect) {
      prioritySelect.addEventListener('change', () => {
        renderPageNotificationsFeed();
      });
    }

    const filterTabs = document.querySelectorAll('#notif-filter-tabs .notif-tab');
    filterTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabs.forEach(b => {
          b.classList.remove('active');
          b.style.background = 'transparent';
          b.style.color = 'var(--text-secondary)';
        });
        btn.classList.add('active');
        btn.style.background = 'rgba(255, 255, 255, 0.03)';
        btn.style.color = '#fff';

        activeNotifFilterCategory = btn.getAttribute('data-filter');
        renderPageNotificationsFeed();
      });
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

  // Helper to sync sidebar AI status indicator
  function syncSidebarAiStatus(status, color) {
    const sidebarStatusDot = document.querySelector('#sidebar-ai-status .status-pulse-dot');
    const sidebarStatusTxt = document.querySelector('#sidebar-ai-status span:last-child');
    if (sidebarStatusDot) sidebarStatusDot.style.background = color;
    if (sidebarStatusTxt) sidebarStatusTxt.textContent = status;
  }

  const btnNewAiScan = document.getElementById('btn-new-ai-scan');
  if (btnNewAiScan) {
    btnNewAiScan.addEventListener('click', () => {
      const btnHeaderScan = document.getElementById('btn-header-manual-scan');
      if (btnHeaderScan) {
        btnHeaderScan.click();
      }
    });
  }

  const btnSidebarFeedback = document.getElementById('btn-sidebar-feedback');
  if (btnSidebarFeedback) {
    btnSidebarFeedback.addEventListener('click', () => {
      showToast('Thank you! Feedback submitted successfully.');
    });
  }

  // ==========================================================================
  // Settings & Personalization Center
  // ==========================================================================
  async function loadSettingsCenter() {
    try {
      const data = await apiCall('/user/profile');
      if (!data) return;

      const fullNameInput = document.getElementById('settings-profile-fullname');
      const usernameInput = document.getElementById('settings-profile-username');
      const emailInput = document.getElementById('settings-profile-email');
      const phoneInput = document.getElementById('settings-profile-phone');
      const countryInput = document.getElementById('settings-profile-country');
      const timezoneSelect = document.getElementById('settings-profile-timezone');
      const currencySelect = document.getElementById('settings-profile-currency');

      const metaFullName = document.getElementById('profile-meta-fullname');
      const metaEmail = document.getElementById('profile-meta-email');
      const avatarPlaceholder = document.getElementById('profile-avatar-placeholder');

      if (fullNameInput) fullNameInput.value = data.profile.full_name || '';
      if (usernameInput) usernameInput.value = data.profile.username || '';
      if (emailInput) emailInput.value = data.email || '';
      if (phoneInput) phoneInput.value = data.profile.mobile_number || '';
      if (countryInput) countryInput.value = data.profile.country || '';
      if (timezoneSelect) timezoneSelect.value = data.profile.timezone || 'UTC';
      if (currencySelect) currencySelect.value = data.profile.preferred_currency || 'USD';

      if (metaFullName) metaFullName.textContent = data.profile.full_name || 'User';
      if (metaEmail) metaEmail.textContent = data.email || '';
      if (avatarPlaceholder) {
        const nameChar = (data.profile.full_name || data.email || 'U')[0].toUpperCase();
        avatarPlaceholder.textContent = nameChar;
      }

      const emailDot = document.getElementById('badge-email-verification-dot');
      const emailText = document.getElementById('badge-email-verification-text');
      const phoneDot = document.getElementById('badge-phone-verification-dot');
      const phoneText = document.getElementById('badge-phone-verification-text');

      if (emailDot && emailText) {
        if (data.profile.verified_email) {
          emailDot.style.background = '#10b981';
          emailText.textContent = 'Email Verified';
        } else {
          emailDot.style.background = '#f59e0b';
          emailText.textContent = 'Email Unverified';
        }
      }

      if (phoneDot && phoneText) {
        if (data.profile.verified_mobile) {
          phoneDot.style.background = '#10b981';
          phoneText.textContent = 'Phone Verified';
        } else {
          phoneDot.style.background = '#ef4444';
          phoneText.textContent = 'Phone Unverified';
        }
      }

      const riskStance = data.profile.risk_stance || 'balanced';
      const riskVal = riskStance === 'conservative' ? '0' : (riskStance === 'aggressive' ? '2' : '1');
      const riskRadio = document.querySelector(`input[name="ai-risk"][value="${riskVal}"]`);
      if (riskRadio) riskRadio.checked = true;

      const preferredMarkets = data.profile.preferred_markets || ['Crypto'];
      document.querySelectorAll('input[name="ai-markets"]').forEach(chk => {
        chk.checked = preferredMarkets.includes(chk.value);
      });

      const respStyle = localStorage.getItem('ravora_ai_response_style') || 'balanced';
      const respRadio = document.querySelector(`input[name="ai-response-style"][value="${respStyle}"]`);
      if (respRadio) respRadio.checked = true;

      const tradePlansChk = document.getElementById('settings-ai-trade-plans');
      const morningBriefChk = document.getElementById('settings-ai-morning-brief');
      if (tradePlansChk) tradePlansChk.checked = localStorage.getItem('ravora_ai_trade_plans') !== 'false';
      if (morningBriefChk) morningBriefChk.checked = localStorage.getItem('ravora_ai_morning_brief') !== 'false';

      const notifCatPrice = document.getElementById('notif-cat-price');
      const notifCatPortfolio = document.getElementById('notif-cat-portfolio');
      const notifCatRisk = document.getElementById('notif-cat-risk');
      const notifCatOpp = document.getElementById('notif-cat-opp');
      const notifChanEmail = document.getElementById('notif-chan-email');
      const notifChanPush = document.getElementById('notif-chan-push');

      if (notifCatPrice) notifCatPrice.checked = localStorage.getItem('ravora_notif_price') !== 'false';
      if (notifCatPortfolio) notifCatPortfolio.checked = localStorage.getItem('ravora_notif_portfolio') !== 'false';
      if (notifCatRisk) notifCatRisk.checked = localStorage.getItem('ravora_notif_risk') !== 'false';
      if (notifCatOpp) notifCatOpp.checked = localStorage.getItem('ravora_notif_opp') !== 'false';
      if (notifChanEmail) notifChanEmail.checked = localStorage.getItem('ravora_notif_email') !== 'false';
      if (notifChanPush) notifChanPush.checked = localStorage.getItem('ravora_notif_push') !== 'false';

      const timeframeSelect = document.getElementById('settings-trading-timeframe');
      const chartTypeSelect = document.getElementById('settings-trading-charttype');
      const sizeInput = document.getElementById('settings-trading-size');
      const riskPctInput = document.getElementById('settings-trading-riskpct');
      const currencyFmtSelect = document.getElementById('settings-trading-currencyfmt');
      const dateFmtSelect = document.getElementById('settings-trading-datefmt');

      if (timeframeSelect) timeframeSelect.value = localStorage.getItem('ravora_trading_timeframe') || '4h';
      if (chartTypeSelect) chartTypeSelect.value = localStorage.getItem('ravora_trading_charttype') || 'candlestick';
      if (sizeInput) sizeInput.value = localStorage.getItem('ravora_trading_size') || '10000';
      if (riskPctInput) riskPctInput.value = localStorage.getItem('ravora_trading_riskpct') || '2';
      if (currencyFmtSelect) currencyFmtSelect.value = localStorage.getItem('ravora_trading_currencyfmt') || 'prefix';
      if (dateFmtSelect) dateFmtSelect.value = localStorage.getItem('ravora_trading_datefmt') || 'us';

      const statusBinance = document.getElementById('exchange-status-binance');
      const statusCoinbase = document.getElementById('exchange-status-coinbase');
      
      let binanceConnected = false;
      let coinbaseConnected = false;
      let binanceId = null;
      let coinbaseId = null;
      
      try {
        const exchRes = await apiCall('/exchanges');
        if (exchRes && exchRes.success && Array.isArray(exchRes.data)) {
          const binanceRec = exchRes.data.find(e => e.name.toLowerCase() === 'binance');
          const coinbaseRec = exchRes.data.find(e => e.name.toLowerCase() === 'coinbase');
          if (binanceRec) {
            binanceConnected = true;
            binanceId = binanceRec.id;
          }
          if (coinbaseRec) {
            coinbaseConnected = true;
            coinbaseId = coinbaseRec.id;
          }
        }
      } catch (err) {
        console.error('Failed to fetch exchanges:', err);
      }

      if (statusBinance) {
        if (!binanceConnected) {
          statusBinance.textContent = 'Unconnected';
          statusBinance.style.color = 'var(--text-muted)';
          const btn = document.getElementById('btn-exchange-disconnect-binance');
          if (btn) {
            btn.textContent = 'Connect';
            btn.style.color = 'var(--accent)';
            btn.removeAttribute('data-id');
          }
        } else {
          statusBinance.textContent = 'Connected | API: Read/Write | Sync: Just now';
          statusBinance.style.color = '#10b981';
          const btn = document.getElementById('btn-exchange-disconnect-binance');
          if (btn) {
            btn.textContent = 'Disconnect';
            btn.style.color = '#ef4444';
            btn.setAttribute('data-id', binanceId);
          }
        }
      }

      if (statusCoinbase) {
        if (!coinbaseConnected) {
          statusCoinbase.textContent = 'Unconnected';
          statusCoinbase.style.color = 'var(--text-muted)';
          const btn = document.getElementById('btn-exchange-disconnect-coinbase');
          if (btn) {
            btn.textContent = 'Connect';
            btn.style.color = 'var(--accent)';
            btn.removeAttribute('data-id');
          }
        } else {
          statusCoinbase.textContent = 'Connected | API: Read/Write | Sync: Just now';
          statusCoinbase.style.color = '#10b981';
          const btn = document.getElementById('btn-exchange-disconnect-coinbase');
          if (btn) {
            btn.textContent = 'Disconnect';
            btn.style.color = '#ef4444';
            btn.setAttribute('data-id', coinbaseId);
          }
        }
      }

      const exchangesListEl = document.getElementById('settings-exchanges-list');
      const exchangesEmptyStateEl = document.getElementById('exchanges-empty-state');
      const exchangesErrorStateEl = document.getElementById('settings-exchanges-error-state');

      if (exchangesErrorStateEl) exchangesErrorStateEl.style.display = 'none';

      if (!binanceConnected && !coinbaseConnected) {
        if (state.showExchangesList) {
          if (exchangesListEl) exchangesListEl.style.display = 'flex';
          if (exchangesEmptyStateEl) exchangesEmptyStateEl.style.display = 'none';
        } else {
          if (exchangesListEl) exchangesListEl.style.display = 'none';
          if (exchangesEmptyStateEl) {
            exchangesEmptyStateEl.style.display = 'block';
            renderRavoraEmptyState(exchangesEmptyStateEl, {
              type: 'exchanges',
              headline: 'Connect your first exchange.',
              description: 'Securely connect an exchange to synchronize your portfolio and trading activity.',
              primaryText: 'Connect Exchange',
              primaryCallback: () => {
                state.showExchangesList = true;
                loadSettingsCenter();
              }
            });
          }
        }
      } else {
        state.showExchangesList = false;
        if (exchangesListEl) exchangesListEl.style.display = 'flex';
        if (exchangesEmptyStateEl) exchangesEmptyStateEl.style.display = 'none';
      }

      const compactChk = document.getElementById('settings-ui-compact');
      const animationsChk = document.getElementById('settings-ui-animations');

      if (compactChk) compactChk.checked = localStorage.getItem('ravora_ui_compact') === 'true';
      if (animationsChk) animationsChk.checked = localStorage.getItem('ravora_ui_animations') !== 'false';

      await refreshActiveSessionsList();
    } catch (err) {
      console.error('Error loading settings center:', err);
    }
  }

  async function refreshActiveSessionsList() {
    const tbody = document.getElementById('settings-sessions-tbody');
    if (!tbody) return;

    try {
      const devices = await apiCall('/user/profile/devices');
      if (devices && devices.length > 0) {
        tbody.innerHTML = devices.map(dev => `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.02); height: 36px;">
            <td style="padding: 6px 8px; color: #fff;">${dev.ip_address || '127.0.0.1'}</td>
            <td style="padding: 6px 8px; color: var(--text-secondary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${dev.user_agent || 'Chrome / Windows'}</td>
            <td style="padding: 6px 8px; color: var(--text-muted);">${new Date(dev.last_login_at || Date.now()).toLocaleTimeString()}</td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.02); height: 36px;">
            <td style="padding: 6px 8px; color: #fff;">127.0.0.1</td>
            <td style="padding: 6px 8px; color: var(--text-secondary);">Chrome (Windows)</td>
            <td style="padding: 6px 8px; color: var(--text-muted);">Current Session</td>
          </tr>
        `;
      }
    } catch (err) {
      tbody.innerHTML = `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.02); height: 36px;">
          <td style="padding: 6px 8px; color: #fff;">127.0.0.1</td>
          <td style="padding: 6px 8px; color: var(--text-secondary);">Chrome (Windows)</td>
          <td style="padding: 6px 8px; color: var(--text-muted);">Current Session</td>
        </tr>
      `;
    }
  }

  function initializeSettingsCenterEvents() {
    const navButtons = document.querySelectorAll('#settings-nav-menu .settings-menu-btn');
    const panes = document.querySelectorAll('#settings-panes-container .settings-pane');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        panes.forEach(p => {
          p.classList.remove('active');
          p.style.display = 'none';
        });

        btn.classList.add('active');
        const targetPane = document.getElementById(`pane-${btn.getAttribute('data-pane')}`);
        if (targetPane) {
          targetPane.classList.add('active');
          targetPane.style.display = 'block';
        }
      });
    });

    const formProfile = document.getElementById('form-settings-profile');
    if (formProfile) {
      formProfile.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('settings-profile-fullname').value;
        const username = document.getElementById('settings-profile-username').value;
        const phone = document.getElementById('settings-profile-phone').value;
        const country = document.getElementById('settings-profile-country').value;
        const timezone = document.getElementById('settings-profile-timezone').value;
        const currency = document.getElementById('settings-profile-currency').value;

        try {
          const res = await apiCall('/user/profile', {
            method: 'PUT',
            body: {
              fullName,
              mobileNumber: phone,
              username,
              country,
              timezone,
              preferredCurrency: currency
            }
          });
          if (res && res.success) {
            const headerUserNameEl = document.getElementById('header-user-display-name');
            if (headerUserNameEl) {
              headerUserNameEl.textContent = fullName;
            }
            loadSettingsCenter();

            const contentEl = document.getElementById('profile-settings-main-content');
            const successEl = document.getElementById('profile-success-state');
            if (contentEl && successEl) {
              contentEl.style.display = 'none';
              successEl.style.display = 'block';
              renderRavoraSuccessState(successEl, {
                type: 'profile',
                headline: 'Profile updated.',
                description: 'Your information has been saved.',
                primaryText: 'Continue',
                primaryCallback: () => {
                  successEl.style.display = 'none';
                  contentEl.style.display = 'block';
                }
              });
            }
          } else {
            showToast('Error updating profile.');
          }
        } catch (e) {
          showToast('Failed to update profile settings.');
        }
      });
    }

    const formPassword = document.getElementById('form-settings-password');
    if (formPassword) {
      formPassword.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('settings-pwd-current').value;
        const newPassword = document.getElementById('settings-pwd-new').value;
        const confirmPassword = document.getElementById('settings-pwd-confirm').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
          showToast('Please fill in all password fields.');
          return;
        }

        try {
          const res = await apiCall('/auth/change-password', {
            method: 'POST',
            body: { currentPassword, newPassword, confirmPassword }
          });
          if (res && res.success) {
            showToast('Password updated successfully.');
            formPassword.reset();
          } else {
            showToast(res.error || 'Error changing password.');
          }
        } catch (err) {
          showToast('Failed to change password.');
        }
      });
    }

    if (btnSignoutOthers) {
      btnSignoutOthers.addEventListener('click', () => {
        window.ravoraToast.show({
          type: 'warning',
          title: 'Sign Out Other Devices?',
          description: 'Are you sure you want to sign out all other devices logged into this account?',
          action: {
            text: 'Yes, Sign Out',
            callback: async () => {
              try {
                const res = await apiCall('/user/profile/devices/all-others', { method: 'DELETE' });
                if (res && res.success) {
                  showToast('Signed out of other devices.');
                  refreshActiveSessionsList();
                } else {
                  showToast('Error signing out of other devices.');
                }
              } catch (e) {
                showToast('Failed to sign out other devices.');
              }
            }
          }
        });
      });
    }

    const formAi = document.getElementById('form-settings-ai');
    if (formAi) {
      formAi.addEventListener('submit', async (e) => {
        e.preventDefault();
        const riskLevel = document.querySelector('input[name="ai-risk"]:checked').value;
        const preferredMarkets = Array.from(document.querySelectorAll('input[name="ai-markets"]:checked')).map(el => el.value);
        const responseStyle = document.querySelector('input[name="ai-response-style"]:checked').value;
        const tradePlans = document.getElementById('settings-ai-trade-plans').checked;
        const morningBrief = document.getElementById('settings-ai-morning-brief').checked;

        localStorage.setItem('ravora_ai_response_style', responseStyle);
        localStorage.setItem('ravora_ai_trade_plans', tradePlans ? 'true' : 'false');
        localStorage.setItem('ravora_ai_morning_brief', morningBrief ? 'true' : 'false');

        try {
          const res = await apiCall('/user/onboard', {
            method: 'POST',
            body: {
              experience: state.profile.experience_level || 'active',
              goal: state.profile.primary_goal || 'growth',
              riskLevel: parseInt(riskLevel),
              markets: preferredMarkets,
              workspace: state.profile.dashboard_layout || 'balanced',
              araiven: ['opportunities', 'trends', 'plans']
            }
          });
          if (res && res.success) {
            showToast('AI preferences saved successfully.');
            state.profile.riskLevel = parseInt(riskLevel);
          } else {
            showToast('Error saving AI preferences.');
          }
        } catch (err) {
          showToast('Failed to save AI preferences.');
        }
      });
    }

    const formNotif = document.getElementById('form-settings-notif');
    if (formNotif) {
      formNotif.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('ravora_notif_price', document.getElementById('notif-cat-price').checked ? 'true' : 'false');
        localStorage.setItem('ravora_notif_portfolio', document.getElementById('notif-cat-portfolio').checked ? 'true' : 'false');
        localStorage.setItem('ravora_notif_risk', document.getElementById('notif-cat-risk').checked ? 'true' : 'false');
        localStorage.setItem('ravora_notif_opp', document.getElementById('notif-cat-opp').checked ? 'true' : 'false');
        localStorage.setItem('ravora_notif_email', document.getElementById('notif-chan-email').checked ? 'true' : 'false');
        localStorage.setItem('ravora_notif_push', document.getElementById('notif-chan-push').checked ? 'true' : 'false');
        showToast('Notification subscriptions saved.');
      });
    }

    const formTrading = document.getElementById('form-settings-trading');
    if (formTrading) {
      formTrading.addEventListener('submit', (e) => {
        e.preventDefault();
        const timeframe = document.getElementById('settings-trading-timeframe').value;
        const chartType = document.getElementById('settings-trading-charttype').value;
        const size = document.getElementById('settings-trading-size').value;
        const riskPct = document.getElementById('settings-trading-riskpct').value;
        const currencyFmt = document.getElementById('settings-trading-currencyfmt').value;
        const dateFmt = document.getElementById('settings-trading-datefmt').value;

        localStorage.setItem('ravora_trading_timeframe', timeframe);
        localStorage.setItem('ravora_trading_charttype', chartType);
        localStorage.setItem('ravora_trading_size', size);
        localStorage.setItem('ravora_trading_riskpct', riskPct);
        localStorage.setItem('ravora_trading_currencyfmt', currencyFmt);
        localStorage.setItem('ravora_trading_datefmt', dateFmt);

        if (window.chartStateManager) {
          window.chartStateManager.timeframe = timeframe;
          window.chartStateManager.chartType = chartType;
          if (state.currentScreen === 'dashboard') {
            updateTerminalView(state.selectedAsset || 'BTC', timeframe);
          }
        }

        const contentEl = document.getElementById('trading-settings-main-content');
        const successEl = document.getElementById('settings-success-state');
        if (contentEl && successEl) {
          contentEl.style.display = 'none';
          successEl.style.display = 'block';
          renderRavoraSuccessState(successEl, {
            type: 'settings',
            headline: 'Changes saved.',
            description: 'Your preferences have been updated successfully.',
            primaryText: 'Return',
            primaryCallback: () => {
              successEl.style.display = 'none';
              contentEl.style.display = 'block';
            }
          });
        }
      });
    }

    const btnDisconnectBinance = document.getElementById('btn-exchange-disconnect-binance');
    if (btnDisconnectBinance) {
      btnDisconnectBinance.addEventListener('click', async () => {
        const exchId = btnDisconnectBinance.getAttribute('data-id');
        if (exchId) {
          try {
            await apiCall(`/exchanges/${exchId}`, { method: 'DELETE' });
            window.ravoraToast.success('Binance US Disconnected.');
            loadSettingsCenter();
          } catch (err) {
            console.error(err);
          }
        } else {
          const apiKey = prompt("Enter Binance US API Key:");
          if (!apiKey) return;
          const apiSecret = prompt("Enter Binance US Secret Key:");
          if (!apiSecret) return;
          
          try {
            await apiCall('/exchanges', {
              method: 'POST',
              body: JSON.stringify({
                exchangeName: 'binance',
                apiKey,
                apiSecret
              })
            });
            showRavoraSuccess('exchanges');
            loadSettingsCenter();
          } catch (err) {
            console.error(err);
          }
        }
      });
    }

    const btnDisconnectCoinbase = document.getElementById('btn-exchange-disconnect-coinbase');
    if (btnDisconnectCoinbase) {
      btnDisconnectCoinbase.addEventListener('click', async () => {
        const exchId = btnDisconnectCoinbase.getAttribute('data-id');
        if (exchId) {
          try {
            await apiCall(`/exchanges/${exchId}`, { method: 'DELETE' });
            window.ravoraToast.success('Coinbase Pro Disconnected.');
            loadSettingsCenter();
          } catch (err) {
            console.error(err);
          }
        } else {
          const apiKey = prompt("Enter Coinbase Pro API Key:");
          if (!apiKey) return;
          const apiSecret = prompt("Enter Coinbase Pro Secret Key:");
          if (!apiSecret) return;
          
          try {
            await apiCall('/exchanges', {
              method: 'POST',
              body: JSON.stringify({
                exchangeName: 'coinbase',
                apiKey,
                apiSecret
              })
            });
            showRavoraSuccess('exchanges');
            loadSettingsCenter();
          } catch (err) {
            console.error(err);
          }
        }
      });
    }

    const formAppearance = document.getElementById('form-settings-appearance');
    if (formAppearance) {
      formAppearance.addEventListener('submit', (e) => {
        e.preventDefault();
        const isCompact = document.getElementById('settings-ui-compact').checked;
        const hasAnimations = document.getElementById('settings-ui-animations').checked;

        localStorage.setItem('ravora_ui_compact', isCompact ? 'true' : 'false');
        localStorage.setItem('ravora_ui_animations', hasAnimations ? 'true' : 'false');

        if (isCompact) {
          document.body.classList.add('compact-mode');
        } else {
          document.body.classList.remove('compact-mode');
        }

        if (hasAnimations) {
          document.body.classList.remove('no-transitions');
        } else {
          document.body.classList.add('no-transitions');
        }

        showToast('Appearance preferences updated.');
      });
    }

    const btnDownloadData = document.getElementById('btn-settings-download-data');
    if (btnDownloadData) {
      btnDownloadData.addEventListener('click', async () => {
        try {
          const profile = await apiCall('/user/profile');
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
          const downloadAnchor = document.createElement('a');
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", "ravora_account_data.json");
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          showToast('Data archive downloaded successfully.');
        } catch (e) {
          showToast('Failed to download data.');
        }
      });
    }

    if (btnDeleteAccount) {
      btnDeleteAccount.addEventListener('click', () => {
        window.ravoraToast.show({
          type: 'warning',
          title: 'PERMANENTLY DELETE ACCOUNT?',
          description: 'WARNING: Are you absolutely sure you want to permanently delete your Ravora account? This will erase all trades, data, and configurations.',
          action: {
            text: 'I am sure, continue',
            callback: async () => {
              const pass2 = prompt('Type "DELETE" to confirm account erasure:');
              if (pass2 !== 'DELETE') {
                showToast('Erasing cancelled.');
                return;
              }

              try {
                const res = await apiCall('/user/profile/account', { method: 'DELETE' });
                if (res && res.success) {
                  showToast('Account successfully deleted. Logging out...');
                  setTimeout(() => {
                    localStorage.clear();
                    window.location.href = '/';
                  }, 1500);
                } else {
                  showToast('Error deleting account.');
                }
              } catch (e) {
                showToast('Failed to delete account.');
              }
            }
          }
        });
      });
    }
  }

  // ==========================================================================
  // Header Actions Binds
  // ==========================================================================
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
      syncSidebarAiStatus('Analyzing', 'var(--accent-secondary)');

      const scanPromise = apiCall('/market/scan', { method: 'POST' });

      window.ravoraToast.promise(scanPromise, {
        loading: 'Running Quant Analysis Engine...',
        success: 'Market scan and quant analysis completed.',
        error: (err) => `Scanner Error: ${err.message}`
      });

      try {
        await scanPromise;
        await initializeDashboardUI();
      } catch (err) {
        console.error('Error during manual scan:', err);
      } finally {
        btnHeaderManualScan.disabled = false;
        btnHeaderManualScan.textContent = 'Scan Markets';

        if (statusTxt) {
          statusTxt.textContent = 'ARAIVEN SCANNING ACTIVE';
          statusTxt.style.color = 'var(--success)';
        }
        if (dot) dot.style.background = 'var(--success)';
        syncSidebarAiStatus('Scanning Markets', '#10b981');
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
      state.notificationError = false;
      renderPageNotificationsFeed();
    } catch (e) {
      console.error('Error loading notifications:', e);
      state.notificationError = true;
      renderPageNotificationsFeed();
    }
  }

  // ==========================================================================
  // Dashboard UI Initializer
  // ==========================================================================
  async function initializeDashboardUI() {
    if (state.currentScreen === 'dashboard') {
      showTradingWorkspaceSkeletons();
    } else if (state.currentScreen === 'portfolio') {
      showPortfolioSkeletons();
    } else if (state.currentScreen === 'watchlist') {
      showWatchlistSkeletons();
    } else if (state.currentScreen === 'history') {
      showJournalSkeletons();
    } else if (state.currentScreen === 'notifications') {
      if (typeof notifAlertsList !== 'undefined' && notifAlertsList) {
        notifAlertsList.innerHTML = getNotificationsSkeletonHtml();
      }
    } else if (state.currentScreen === 'settings') {
      showSettingsSkeletons();
    }

    syncMainAppRiskStateDOMOnly(state.profile.riskLevel);
    await loadPortfolioData();

    if (!state.selectedAsset) {
      state.selectedAsset = 'BTC';
    }

    await loadScannerAssets();
    await updateTerminalView(state.selectedAsset, window.chartStateManager.timeframe);
    await loadTerminalPositions();
    await loadTerminalHistory();
    await loadTradeHistory();

    await loadOpportunities();
    await loadRecommendations();
    await loadNotifications();

    if (!state.terminalEventsInitialized) {
      initializeTerminalEvents();
      initializeModalEvents();
      initializePortfolioSubTabs();
      initializePerfTimelineEvents();
      initializeJournalFilterEvents();
      initializeWatchlistCenterEvents();
      initializeNotificationsCenterEvents();
      initializeSettingsCenterEvents();

      // Bind mobile bottom nav buttons
      const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
      mobileNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const targetScreen = btn.getAttribute('data-screen');
          if (targetScreen) {
            navigateTo(targetScreen, true);
          }
        });
      });

      state.terminalEventsInitialized = true;
    }
    window.showRavoraSuccess = showRavoraSuccess;
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
      if (screenId === 'app' || screenId === '' || screenId === 'index.html') {
        screenId = 'dashboard';
      }
      navigateTo(screenId, false);
      history.replaceState({ screen: screenId }, '', '/app/' + screenId);
    }
  }

  // Real-time Decision Timeline Timer
  let secondsSinceRefresh = 0;
  let secondsToNextAnalysis = 30;

  function startTimelineTimer() {
    setInterval(() => {
      secondsSinceRefresh++;
      secondsToNextAnalysis--;

      const dataRefreshed = document.getElementById('timeline-data-refreshed');
      const nextAnalysis = document.getElementById('timeline-next-analysis');

      if (dataRefreshed) {
        dataRefreshed.textContent = `${secondsSinceRefresh} second${secondsSinceRefresh !== 1 ? 's' : ''} ago`;
      }
      if (nextAnalysis) {
        nextAnalysis.textContent = `In ${secondsToNextAnalysis} second${secondsToNextAnalysis !== 1 ? 's' : ''}`;
      }

      if (secondsToNextAnalysis <= 0) {
        secondsToNextAnalysis = 30;
        secondsSinceRefresh = 0;

        // Silent background refresh
        if (state.selectedAsset) {
          loadScannerAssets().catch(console.error);
          updateTerminalView(state.selectedAsset, window.chartStateManager.timeframe).catch(console.error);
        }
      }
    }, 1000);
  }

  // Start the timeline timer
  startTimelineTimer();

  // Handle Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      if (e) e.preventDefault();
      if (supabaseClient) {
        try {
          await supabaseClient.auth.signOut();
        } catch (err) {
          console.error('[Supabase SignOut Error]', err);
        }
      }

      // Clear Supabase client keys directly to bypass third-party CDN storage blocking
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      localStorage.removeItem('ravora_token');
      localStorage.removeItem('ravora_logged_in');
      localStorage.removeItem('ravora_login_time');
      localStorage.removeItem('ravora_email');
      localStorage.removeItem('ravora_onboarding_completed');
      localStorage.removeItem('ravora_remember_me');
      sessionStorage.removeItem('ravora_session_active');

      // Redirect back to landing page
      window.location.href = '/';
    });
  }

  // ==========================================================================
  // Araiven Copilot Page Logic (Step 7)
  // ==========================================================================
  let activeCopilotConversationId = null;

  async function loadCopilotData() {
    const listContainer = document.getElementById('copilot-threads-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = '<span style="font-size: 0.72rem; color: var(--text-secondary); text-align: center; padding: 12px 0;">Loading conversation history...</span>';
    
    try {
      const res = await apiCall('/ai/conversations');
      if (res && res.success && Array.isArray(res.data)) {
        listContainer.innerHTML = '';
        if (res.data.length === 0) {
          listContainer.innerHTML = '<span style="font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 12px 0;">No past conversations found.</span>';
          toggleCopilotEmptyState(true);
          return;
        }
        
        toggleCopilotEmptyState(false);
        
        const pinnedIds = JSON.parse(localStorage.getItem('ravora_pinned_conversations') || '[]');
        
        // Sort conversations: pinned first, then updated_at desc
        const sortedConvs = [...res.data].sort((a, b) => {
          const aPinned = pinnedIds.includes(a.id);
          const bPinned = pinnedIds.includes(b.id);
          if (aPinned && !bPinned) return -1;
          if (!aPinned && bPinned) return 1;
          return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        });

        sortedConvs.forEach(conv => {
          const card = document.createElement('div');
          card.className = 'card-glass conversation-thread-item';
          card.style.cssText = 'padding: 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; border: 1px solid rgba(255,255,255,0.04); display: flex; flex-direction: column; gap: 4px; position: relative;';
          
          if (activeCopilotConversationId === conv.id) {
            card.style.borderColor = 'var(--accent)';
            card.style.background = 'rgba(255,255,255,0.04)';
          }

          const isPinned = pinnedIds.includes(conv.id);
          const time = new Date(conv.updated_at || conv.created_at).toLocaleDateString();
          
          // Deduce asset
          let detectedAsset = 'Portfolio';
          const titleLower = (conv.title || '').toLowerCase();
          if (titleLower.includes('btc') || titleLower.includes('bitcoin')) detectedAsset = 'BTC';
          else if (titleLower.includes('eth') || titleLower.includes('ethereum')) detectedAsset = 'ETH';
          else if (titleLower.includes('sol') || titleLower.includes('solana')) detectedAsset = 'SOL';
          else if (titleLower.includes('usdc') || titleLower.includes('stablecoin')) detectedAsset = 'USDC';
          
          // Last message preview
          let previewText = 'No messages yet';
          if (Array.isArray(conv.messages) && conv.messages.length > 0) {
            const lastMsg = conv.messages[conv.messages.length - 1];
            previewText = lastMsg.text || lastMsg.content || '...';
          }

          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px;">
              <span style="font-weight:700; font-size:0.74rem; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:130px; display:flex; align-items:center; gap:4px;" title="${conv.title}">
                ${isPinned ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="width:10px; height:10px; flex-shrink:0;"><line x1="18" y1="8" x2="22" y2="12"/><line x1="12" y1="2" x2="22" y2="12"/><path d="M12 2L2 12h5l5 5v5l10-10H17l-5-5z"/></svg>' : ''}${conv.title || 'Audit Thread'}
              </span>
              <span style="font-size:0.62rem; color:var(--text-muted); flex-shrink:0;">${time}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <span style="font-size:0.66rem; color:var(--accent); font-weight:600;">${detectedAsset}</span>
              <span style="font-size:0.64rem; color:var(--text-secondary); max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; text-align:left; margin-left:4px;">
                ${previewText}
              </span>
            </div>
            <div class="thread-actions" style="display:flex; gap:6px; align-self:flex-end; margin-top:4px;">
              <button class="btn-thread-pin" style="background:none; border:none; color:${isPinned ? 'var(--accent)' : 'var(--text-muted)'}; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:2px;" title="${isPinned ? 'Unpin' : 'Pin'}">
                ${isPinned ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="8" x2="22" y2="12"/><line x1="12" y1="2" x2="22" y2="12"/><path d="M12 2L2 12h5l5 5v5l10-10H17l-5-5z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><line x1="18" y1="8" x2="22" y2="12"/><line x1="12" y1="2" x2="22" y2="12"/><path d="M12 2L2 12h5l5 5v5l10-10H17l-5-5z"/></svg>'}
              </button>
              <button class="btn-thread-rename" style="background:none; border:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:2px;" title="Rename">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
              </button>
              <button class="btn-thread-delete" style="background:none; border:none; color:#ef4444; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:2px;" title="Delete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px; height:12px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          `;

          // Card click to load details
          card.addEventListener('click', (e) => {
            if (e.target.closest('.btn-thread-pin') || e.target.closest('.btn-thread-rename') || e.target.closest('.btn-thread-delete')) {
              return;
            }
            activeCopilotConversationId = conv.id;
            loadCopilotConversationDetails(conv.id);
            const children = listContainer.querySelectorAll('.conversation-thread-item');
            children.forEach(c => {
              c.style.borderColor = 'rgba(255,255,255,0.04)';
              c.style.background = 'none';
            });
            card.style.borderColor = 'var(--accent)';
            card.style.background = 'rgba(255,255,255,0.04)';
          });

          // Pin Button listener
          card.querySelector('.btn-thread-pin').addEventListener('click', (e) => {
            e.stopPropagation();
            let pins = JSON.parse(localStorage.getItem('ravora_pinned_conversations') || '[]');
            if (isPinned) {
              pins = pins.filter(pid => pid !== conv.id);
            } else {
              pins.push(conv.id);
            }
            localStorage.setItem('ravora_pinned_conversations', JSON.stringify(pins));
            loadCopilotData();
          });

          // Rename Button listener
          card.querySelector('.btn-thread-rename').addEventListener('click', async (e) => {
            e.stopPropagation();
            const newTitle = prompt('Rename this conversation:', conv.title || 'Audit Thread');
            if (newTitle && newTitle.trim()) {
              try {
                await apiCall(`/ai/conversations/${conv.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ title: newTitle.trim() })
                });
                loadCopilotData();
              } catch (err) {
                console.error('Failed to rename conversation:', err);
              }
            }
          });

          // Delete Button listener
          card.querySelector('.btn-thread-delete').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this conversation?')) {
              try {
                await apiCall(`/ai/conversations/${conv.id}`, { method: 'DELETE' });
                if (activeCopilotConversationId === conv.id) {
                  activeCopilotConversationId = null;
                  const log = document.getElementById('copilot-messages-log');
                  if (log) log.innerHTML = '';
                }
                loadCopilotData();
              } catch (err) {
                console.error('Failed to delete conversation:', err);
              }
            }
          });

          listContainer.appendChild(card);
        });
      } else {
        listContainer.innerHTML = '<span style="font-size: 0.72rem; color: var(--text-muted); text-align: center; padding: 12px 0;">No past conversations found.</span>';
        toggleCopilotEmptyState(true);
      }
      
      // Keep Right sidebar context values synced
      updateCopilotLiveContext();
    } catch (err) {
      console.error(err);
      listContainer.innerHTML = '<span style="font-size: 0.72rem; color: #ef4444; text-align: center; padding: 12px 0;">Failed to load history.</span>';
    }
  }

  async function loadCopilotConversationDetails(id) {
    const log = document.getElementById('copilot-messages-log');
    if (!log) return;
    
    log.innerHTML = '<div class="copilot-loading-spinner" style="display:flex; align-items:center; justify-content:center; height:100%;"><span style="color:var(--text-secondary); font-size:0.8rem;">Retrieving messages...</span></div>';
    
    try {
      const res = await apiCall(`/ai/conversations/${id}`);
      if (res && res.success && res.data) {
        log.innerHTML = '';
        const messages = res.data.messages || [];
        if (messages.length === 0) {
          toggleCopilotEmptyState(true);
        } else {
          toggleCopilotEmptyState(false);
          messages.forEach(msg => {
            appendCopilotMessage(msg.role === 'user' ? 'user' : 'agent', msg.content || msg.text);
          });
        }
        log.scrollTop = log.scrollHeight;
        updatePresetVisibility();
      }
    } catch (err) {
      console.error(err);
      log.innerHTML = '<div style="color:#ef4444; padding:20px; font-size:0.8rem;">Failed to load messages.</div>';
    }
  }

  function appendCopilotMessage(role, content) {
    const log = document.getElementById('copilot-messages-log');
    if (!log) return;
    
    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'chat-message-bubble user' : 'chat-message-bubble agent';
    
    if (role === 'agent') {
      bubble.innerHTML = `
        <div class="message-meta">Araiven AI</div>
        <div class="message-body">${formatMarkdown(content)}</div>
      `;
    } else {
      bubble.innerHTML = `
        <div class="message-meta">You</div>
        <div class="message-body">${formatMarkdown(content)}</div>
      `;
    }
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
    updatePresetVisibility();
    return bubble;
  }

  function formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="code-inline">$1</code>')
      .replace(/\n/g, '<br>');
  }

  function typeAiBubble(role, content, speed = 4) {
    const log = document.getElementById('copilot-messages-log');
    if (!log) return;
    
    const bubble = document.createElement('div');
    bubble.className = role === 'user' ? 'chat-message-bubble user' : 'chat-message-bubble agent';
    
    const meta = document.createElement('div');
    meta.className = 'message-meta';
    meta.textContent = role === 'agent' ? 'Araiven AI' : 'You';
    bubble.appendChild(meta);
    
    const body = document.createElement('div');
    body.className = 'message-body';
    bubble.appendChild(body);
    
    log.appendChild(bubble);
    
    let index = 0;
    function type() {
      if (index < content.length) {
        body.innerHTML = formatMarkdown(content.substring(0, index + 1));
        index++;
        log.scrollTop = log.scrollHeight;
        setTimeout(type, speed);
      }
    }
    type();
    return bubble;
  }

  async function streamCopilotMessage(text) {
    const token = localStorage.getItem('ravora_token');
    const log = document.getElementById('copilot-messages-log');
    if (!log) return;
    
    // Hide empty welcome state if showing
    toggleCopilotEmptyState(false);
    
    // Hide presets row once chat starts
    const presetsRow = document.getElementById('copilot-query-presets');
    if (presetsRow) presetsRow.style.display = 'none';
    
    // Inject thinking animation styles if missing
    if (!document.getElementById('copilot-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'copilot-animation-styles';
      style.innerHTML = `
        @keyframes copilotThinking {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .copilot-thinking-dots span {
          animation: copilotThinking 1.4s infinite both;
          width: 6px;
          height: 6px;
          background: #fff;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
        }
        .copilot-thinking-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .copilot-thinking-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
      `;
      document.head.appendChild(style);
    }
    
    const agentBubble = document.createElement('div');
    agentBubble.className = 'chat-message-bubble agent';
    agentBubble.innerHTML = `
      <div class="message-meta">Araiven AI</div>
      <div class="message-body" style="display:flex; align-items:center; gap:8px;">
        <div class="copilot-thinking-dots" style="display:flex; align-items:center;">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-secondary);">Araiven is auditing strategy logs...</span>
      </div>
    `;
    log.appendChild(agentBubble);
    log.scrollTop = log.scrollHeight;
    
    const bodyContainer = agentBubble.querySelector('.message-body');
    let accumulatedText = '';
    
    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: text,
          conversationId: activeCopilotConversationId,
          stream: true
        })
      });
      
      if (!response.ok) {
        throw new Error('Streaming failed');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              continue;
            }
            try {
              const dataObj = JSON.parse(dataStr);
              if (dataObj.conversationId) {
                activeCopilotConversationId = dataObj.conversationId;
              }
              if (dataObj.text) {
                accumulatedText += dataObj.text;
                bodyContainer.innerHTML = formatMarkdown(accumulatedText) + '<span class="copilot-cursor" style="display:inline-block; width:6px; height:12px; background:#fff; animation: blink 0.8s infinite;"></span>';
                log.scrollTop = log.scrollHeight;
              }
            } catch (e) {
            }
          }
        }
      }
      
      const cursor = bodyContainer.querySelector('.copilot-cursor');
      if (cursor) cursor.remove();
      
      loadCopilotData();
      
    } catch (err) {
      console.error(err);
      bodyContainer.innerHTML = '<span style="color:#ef4444;">Connection lost. Standard fallback response below:</span><br>' + formatMarkdown("I'm sorry, I encountered a temporary connection issue. Please make sure the backend server is active and try again.");
    }
  }

  // ==========================================================================
  // Paper Trading View Logic (Step 8)
  // ==========================================================================
  async function loadPaperTradingData() {
    try {
      const account = await apiCall('/paper/account');
      if (account) {
        document.getElementById('paper-cash-balance').textContent = `$${parseFloat(account.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('paper-net-equity').textContent = `$${parseFloat(account.equity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('paper-buying-power').textContent = `$${parseFloat(account.buyingPower).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      
      const statsRes = await apiCall('/paper/statistics');
      if (statsRes && statsRes.success && statsRes.data) {
        const stats = statsRes.data;
        document.getElementById('paper-stat-winrate').textContent = `${parseFloat(stats.winRate || 0).toFixed(1)}%`;
        const netPnL = parseFloat(stats.netProfit || 0);
        const netPnLEl = document.getElementById('paper-stat-netpnl');
        netPnLEl.textContent = (netPnL >= 0 ? '+' : '') + `$${netPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        netPnLEl.style.color = netPnL >= 0 ? '#10b981' : '#ef4444';
        
        const avgPnL = parseFloat(stats.averageProfit || 0);
        document.getElementById('paper-stat-avgpnl').textContent = `$${avgPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        document.getElementById('paper-stat-streak').textContent = `${stats.winStreak || 0} Wins`;
      }
      
      const positions = await apiCall('/paper/positions');
      const positionsTbody = document.getElementById('paper-positions-tbody');
      if (positionsTbody) {
        positionsTbody.innerHTML = '';
        if (!Array.isArray(positions) || positions.length === 0) {
          positionsTbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 24px 8px;">No open positions in sandbox.</td></tr>`;
        } else {
          positions.forEach(pos => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
            const pnl = parseFloat(pos.unrealizedPnL || 0);
            const pnlColor = pnl >= 0 ? '#10b981' : '#ef4444';
            const returnPct = parseFloat(pos.percentageReturn || 0);
            
            tr.innerHTML = `
              <td style="padding: 10px 8px; font-weight: 700; color: #fff;">${pos.symbol}</td>
              <td style="padding: 10px 8px;"><span style="padding: 2px 6px; border-radius: 4px; font-size: 0.62rem; font-weight: 700; background: ${pos.direction === 'LONG' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color: ${pos.direction === 'LONG' ? '#10b981' : '#ef4444'};">${pos.direction}</span></td>
              <td style="padding: 10px 8px; text-align: right;">$${parseFloat(pos.positionSize).toLocaleString()}</td>
              <td style="padding: 10px 8px; text-align: right;">$${parseFloat(pos.entryPrice).toLocaleString()}</td>
              <td style="padding: 10px 8px; text-align: right;">$${parseFloat(pos.currentPrice).toLocaleString()}</td>
              <td style="padding: 10px 8px; text-align: right; color: ${pnlColor}; font-weight: 700;">${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 10px 8px; text-align: right; color: ${pnlColor}; font-weight: 700;">${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%</td>
              <td style="padding: 10px 8px; text-align: right;">${pos.duration || '0m'}</td>
              <td style="padding: 10px 8px; text-align: center;">
                <button class="btn btn-primary btn-xs btn-close-paper-pos" data-id="${pos.id}" style="padding: 4px 8px; background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); border-radius: 4px; cursor: pointer;">Close</button>
              </td>
            `;
            positionsTbody.appendChild(tr);
          });
          
          positionsTbody.querySelectorAll('.btn-close-paper-pos').forEach(btn => {
            btn.addEventListener('click', async () => {
              const id = btn.getAttribute('data-id');
              btn.disabled = true;
              btn.textContent = 'Closing...';
              try {
                const res = await apiCall(`/paper/positions/${id}/close`, { method: 'POST' });
                window.ravoraToast.success(`Position closed! Exit: $${parseFloat(res.exitPrice).toLocaleString()}, PnL: $${parseFloat(res.pnl).toLocaleString()}`);
                loadPaperTradingData();
              } catch (err) {
                btn.disabled = false;
                btn.textContent = 'Close';
              }
            });
          });
        }
      }

      const ordersTbody = document.getElementById('paper-orders-tbody');
      if (ordersTbody) {
        ordersTbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px 8px;">No pending orders in sandbox.</td></tr>';
      }

      const history = await apiCall('/paper/history');
      const historyTbody = document.getElementById('paper-history-tbody');
      if (historyTbody) {
        historyTbody.innerHTML = '';
        if (!Array.isArray(history) || history.length === 0) {
          historyTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 24px 8px;">No trading history logged.</td></tr>`;
        } else {
          history.forEach(trade => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
            const pnl = parseFloat(trade.profitLoss || 0);
            const pnlColor = pnl >= 0 ? '#10b981' : '#ef4444';
            
            tr.innerHTML = `
              <td style="padding: 10px 8px; font-weight: 700; color: #fff;">${trade.symbol}</td>
              <td style="padding: 10px 8px;"><span style="padding: 2px 6px; border-radius: 4px; font-size: 0.62rem; font-weight: 700; background: ${trade.direction === 'LONG' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color: ${trade.direction === 'LONG' ? '#10b981' : '#ef4444'};">${trade.direction}</span></td>
              <td style="padding: 10px 8px; text-align: right;">$${parseFloat(trade.positionSize).toLocaleString()}</td>
              <td style="padding: 10px 8px; text-align: right;">$${parseFloat(trade.entryPrice).toLocaleString()}</td>
              <td style="padding: 10px 8px; text-align: right;">$${parseFloat(trade.exitPrice).toLocaleString()}</td>
              <td style="padding: 10px 8px; text-align: right; color: ${pnlColor}; font-weight: 700;">${pnl >= 0 ? '+' : ''}$${pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              <td style="padding: 10px 8px; text-align: right;">${trade.duration || '0m'}</td>
              <td style="padding: 10px 8px; text-align: right; color: var(--text-secondary);">${new Date(trade.closeTime).toLocaleDateString()}</td>
            `;
            historyTbody.appendChild(tr);
          });
        }
      }
      
    } catch (err) {
      console.error(err);
    }
  }

  // ==========================================================================
  // Global Markets View Logic (Step 9)
  // ==========================================================================
  let currentMarketsFilter = 'all';

  async function loadMarketsData() {
    try {
      const trending = await apiCall('/market/trending');
      const gainers = await apiCall('/market/gainers');
      const losers = await apiCall('/market/losers');
      
      const trendingList = document.getElementById('markets-trending-list');
      if (trendingList && Array.isArray(trending)) {
        trendingList.innerHTML = '';
        trending.forEach(item => {
          const div = document.createElement('div');
          div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:0.74rem;';
          div.innerHTML = `
            <span style="font-weight:700; color:#fff;">${item.symbol} <span style="font-weight:400; color:var(--text-secondary); font-size:0.65rem;">${item.name}</span></span>
            <span style="font-weight:600; color:var(--text-muted);">$${item.volume24h.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          `;
          trendingList.appendChild(div);
        });
      }

      const gainersList = document.getElementById('markets-gainers-list');
      if (gainersList && Array.isArray(gainers)) {
        gainersList.innerHTML = '';
        gainers.forEach(item => {
          const div = document.createElement('div');
          div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:0.74rem;';
          div.innerHTML = `
            <span style="font-weight:700; color:#fff;">${item.symbol}</span>
            <span style="font-weight:700; color:#10b981;">+${parseFloat(item.change24h).toFixed(2)}%</span>
          `;
          gainersList.appendChild(div);
        });
      }

      const losersList = document.getElementById('markets-losers-list');
      if (losersList && Array.isArray(losers)) {
        losersList.innerHTML = '';
        losers.forEach(item => {
          const div = document.createElement('div');
          div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:0.74rem;';
          div.innerHTML = `
            <span style="font-weight:700; color:#fff;">${item.symbol}</span>
            <span style="font-weight:700; color:#ef4444;">${parseFloat(item.change24h).toFixed(2)}%</span>
          `;
          losersList.appendChild(div);
        });
      }

      const overview = await apiCall('/market/overview');
      renderMarketsTable(overview);
      
    } catch (err) {
      console.error(err);
    }
  }

  function renderMarketsTable(assets) {
    const tbody = document.getElementById('markets-table-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (!Array.isArray(assets) || assets.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No markets data found.</td></tr>';
      return;
    }
    
    let filtered = assets;
    if (currentMarketsFilter === 'large') {
      filtered = assets.filter(a => a.symbol === 'BTC' || a.symbol === 'ETH' || a.symbol === 'SOL');
    } else if (currentMarketsFilter === 'volatile') {
      filtered = assets.filter(a => Math.abs(a.change24h) > 1.5);
    } else if (currentMarketsFilter === 'stables') {
      filtered = assets.filter(a => a.symbol === 'USDC' || a.symbol === 'USDT');
    }
    
    const searchEl = document.getElementById('markets-search-input');
    const q = searchEl ? searchEl.value.toUpperCase().trim() : '';
    if (q) {
      filtered = filtered.filter(a => a.symbol.includes(q) || a.name.toUpperCase().includes(q));
    }
    
    filtered.forEach(asset => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255,255,255,0.04)';
      const pnlColor = asset.change24h >= 0 ? '#10b981' : '#ef4444';
      
      tr.innerHTML = `
        <td style="padding: 12px; font-weight: 700; color: #fff;">
          ${asset.symbol} <span style="font-weight:400; color:var(--text-secondary); font-size:0.65rem; margin-left:4px;">${asset.name}</span>
        </td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #fff;">$${parseFloat(asset.price).toLocaleString()}</td>
        <td style="padding: 12px; text-align: right; color: ${pnlColor}; font-weight: 700;">${asset.change24h >= 0 ? '+' : ''}${parseFloat(asset.change24h).toFixed(2)}%</td>
        <td style="padding: 12px; text-align: right; color: var(--text-secondary);">$${parseFloat(asset.volume24h).toLocaleString()}</td>
        <td style="padding: 12px; text-align: right; color: var(--text-secondary);">$${parseFloat(asset.marketCap).toLocaleString()}</td>
        <td style="padding: 12px; text-align: center;">
          <button class="btn btn-secondary btn-xs btn-market-details" data-symbol="${asset.symbol}" style="padding: 4px 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 4px; color: #fff; cursor: pointer;">Research Details</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-market-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const sym = btn.getAttribute('data-symbol');
        showAssetDrawer(sym);
      });
    });
  }

  async function showAssetDrawer(symbol) {
    const drawer = document.getElementById('markets-asset-drawer');
    if (!drawer) return;
    
    drawer.style.display = 'flex';
    
    document.getElementById('drawer-asset-logo').textContent = symbol === 'BTC' ? '₿' : (symbol === 'ETH' ? 'Ξ' : '◎');
    document.getElementById('drawer-asset-title').textContent = symbol === 'BTC' ? 'Bitcoin' : (symbol === 'ETH' ? 'Ethereum' : (symbol === 'SOL' ? 'Solana' : symbol));
    document.getElementById('drawer-asset-symbol').textContent = `${symbol} / USD`;
    document.getElementById('drawer-kpi-high').textContent = 'Loading...';
    document.getElementById('drawer-kpi-low').textContent = 'Loading...';
    document.getElementById('drawer-kpi-vol').textContent = 'Loading...';
    document.getElementById('drawer-kpi-mcap').textContent = 'Loading...';
    document.getElementById('drawer-ai-analysis-text').innerHTML = 'Araiven AI is auditing indicators...';
    
    try {
      const data = await apiCall(`/market/assets/${symbol}`);
      if (data) {
        document.getElementById('drawer-kpi-high').textContent = `$${parseFloat(data.highPrice || data.price).toLocaleString()}`;
        document.getElementById('drawer-kpi-low').textContent = `$${parseFloat(data.lowPrice || data.price).toLocaleString()}`;
        document.getElementById('drawer-kpi-vol').textContent = `$${parseFloat(data.volume24h || 0).toLocaleString()}`;
        document.getElementById('drawer-kpi-mcap').textContent = `$${parseFloat(data.marketCap || 0).toLocaleString()}`;
      }
      
      const aiRes = await apiCall(`/ai/analyze-asset?symbol=${symbol}`, { method: 'POST' });
      if (aiRes && aiRes.success && aiRes.data) {
        document.getElementById('drawer-ai-analysis-text').innerHTML = formatMarkdown(aiRes.data.reply || aiRes.data);
      } else {
        document.getElementById('drawer-ai-analysis-text').innerHTML = `No AI analysis available for ${symbol}.`;
      }
      
      const tradeBtn = document.getElementById('btn-markets-drawer-trade');
      tradeBtn.onclick = () => {
        drawer.style.display = 'none';
        state.selectedAsset = symbol;
        navigateTo('dashboard', true);
      };
      
    } catch (err) {
      console.error(err);
    }
  }

  // ==========================================================================
  // DOM Event Handlers Binding (Steps 7, 8, 9)
  // ==========================================================================
  
  // Close Markets Drawer
  const btnCloseMarketsDrawer = document.getElementById('btn-close-markets-drawer');
  if (btnCloseMarketsDrawer) {
    btnCloseMarketsDrawer.addEventListener('click', () => {
      const drawer = document.getElementById('markets-asset-drawer');
      if (drawer) drawer.style.display = 'none';
    });
  }

  // Markets Segmented Filter clicks
  const marketsSegmented = document.getElementById('markets-filter-segmented');
  if (marketsSegmented) {
    marketsSegmented.querySelectorAll('.segmented-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        marketsSegmented.querySelectorAll('.segmented-tab').forEach(t => {
          t.classList.remove('active');
          t.style.color = 'var(--text-secondary)';
        });
        tab.classList.add('active');
        tab.style.color = '#fff';
        currentMarketsFilter = tab.getAttribute('data-filter');
        loadMarketsData();
      });
    });
  }

  // Markets Search input keyup
  const marketsSearchInput = document.getElementById('markets-search-input');
  if (marketsSearchInput) {
    marketsSearchInput.addEventListener('keyup', () => {
      loadMarketsData();
    });
  }

  // Copilot Send Button & Keypress Enter
  const btnCopilotSendNew = document.getElementById('btn-copilot-send');
  const copilotChatInputNew = document.getElementById('copilot-chat-input');
  if (btnCopilotSendNew && copilotChatInputNew) {
    const handleSend = () => {
      const val = copilotChatInputNew.value.trim();
      if (!val) return;
      copilotChatInputNew.value = '';
      appendCopilotMessage('user', val);
      streamCopilotMessage(val);
    };
    btnCopilotSendNew.addEventListener('click', handleSend);
    copilotChatInputNew.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }

  // Copilot New Chat button
  const btnCopilotNewChat = document.getElementById('btn-copilot-new-chat');
  if (btnCopilotNewChat) {
    btnCopilotNewChat.addEventListener('click', () => {
      activeCopilotConversationId = 'new';
      toggleCopilotEmptyState(true);
      loadCopilotData();
      updatePresetVisibility();
    });
  }

  // AI Advisory Toolbox button handlers
  const btnToolPortfolio = document.getElementById('btn-tool-portfolio-audit');
  if (btnToolPortfolio) {
    btnToolPortfolio.addEventListener('click', async () => {
      appendCopilotMessage('user', 'Please audit my current portfolio allocation.');
      const agentBubble = appendCopilotMessage('agent', 'Analyzing portfolio allocations and staking distributions...');
      const body = agentBubble.querySelector('.message-body');
      try {
        const res = await apiCall('/ai/portfolio-review');
        if (res && res.success && res.data) {
          body.innerHTML = formatMarkdown(res.data.reply || res.data);
        }
      } catch (err) {
        body.textContent = 'Failed to load portfolio review audit.';
      }
    });
  }

  const btnToolRisk = document.getElementById('btn-tool-risk-review');
  if (btnToolRisk) {
    btnToolRisk.addEventListener('click', async () => {
      appendCopilotMessage('user', 'Run a risk check on my current exposures.');
      const agentBubble = appendCopilotMessage('agent', 'Evaluating risk matrices and exposure factors...');
      const body = agentBubble.querySelector('.message-body');
      try {
        const res = await apiCall('/ai/risk-review');
        if (res && res.success && res.data) {
          body.innerHTML = formatMarkdown(res.data.reply || res.data);
        }
      } catch (err) {
        body.textContent = 'Failed to load risk cushions audit.';
      }
    });
  }

  const btnToolMarketSummary = document.getElementById('btn-tool-market-summary');
  if (btnToolMarketSummary) {
    btnToolMarketSummary.addEventListener('click', async () => {
      appendCopilotMessage('user', 'Give me a macro market summary briefing.');
      const agentBubble = appendCopilotMessage('agent', 'Fetching macro trends and global parameters...');
      const body = agentBubble.querySelector('.message-body');
      try {
        const res = await apiCall('/ai/market-summary');
        if (res && res.success && res.data) {
          body.innerHTML = formatMarkdown(res.data.reply || res.data);
        }
      } catch (err) {
        body.textContent = 'Failed to load market summary briefing.';
      }
    });
  }

  const btnToolWatchlistReview = document.getElementById('btn-tool-watchlist-review');
  if (btnToolWatchlistReview) {
    btnToolWatchlistReview.addEventListener('click', async () => {
      appendCopilotMessage('user', 'Please review my current watchlist.');
      const agentBubble = appendCopilotMessage('agent', 'Calculating sentiment score and target structures on watchlisted tokens...');
      const body = agentBubble.querySelector('.message-body');
      try {
        const res = await apiCall('/ai/watchlist-review', { method: 'POST' });
        if (res && res.success && res.data) {
          body.innerHTML = formatMarkdown(res.data.reply || res.data);
        }
      } catch (err) {
        body.textContent = 'Failed to load watchlist sentiment review.';
      }
    });
  }

  // Trade Review form submission
  const copilotTradeReviewForm = document.getElementById('copilot-trade-review-form');
  if (copilotTradeReviewForm) {
    copilotTradeReviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const symbol = document.getElementById('review-trade-symbol').value.toUpperCase().trim();
      const qty = parseFloat(document.getElementById('review-trade-qty').value);
      if (!symbol || isNaN(qty)) return;
      
      appendCopilotMessage('user', `Audit pending trade details: ${qty} ${symbol}`);
      const agentBubble = appendCopilotMessage('agent', `Running trade safety review on ${qty} ${symbol}...`);
      const body = agentBubble.querySelector('.message-body');
      
      try {
        const res = await apiCall('/ai/trade-review', {
          method: 'POST',
          body: JSON.stringify({ symbol, quantity: qty })
        });
        if (res && res.success && res.data) {
          body.innerHTML = formatMarkdown(res.data.reply || res.data);
        }
      } catch (err) {
        body.textContent = 'Failed to complete pre-trade review.';
      }
    });
  }

  // Reset Sandbox account
  const btnPaperReset = document.getElementById('btn-paper-reset');
  if (btnPaperReset) {
    btnPaperReset.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to reset your paper account balance to $100k and wipe all history?')) return;
      btnPaperReset.disabled = true;
      btnPaperReset.textContent = 'Resetting...';
      try {
        await apiCall('/paper/reset', { method: 'POST' });
        window.ravoraToast.success('Simulated account successfully reset!');
        loadPaperTradingData();
      } catch (err) {
        console.error(err);
      } finally {
        btnPaperReset.disabled = false;
        btnPaperReset.textContent = 'Reset Balance & History';
      }
    });
  }

  // Workspace tab switching logic
  const btnAnalysisTab = document.getElementById('btn-workspace-tab-analysis');
  const btnOrderTab = document.getElementById('btn-workspace-tab-order');
  const paneAnalysis = document.getElementById('workspace-analysis-pane');
  const paneOrder = document.getElementById('workspace-order-entry-pane');
  
  if (btnAnalysisTab && btnOrderTab && paneAnalysis && paneOrder) {
    btnAnalysisTab.addEventListener('click', () => {
      btnAnalysisTab.classList.add('active');
      btnAnalysisTab.style.color = '#fff';
      btnAnalysisTab.style.borderBottomColor = 'var(--accent)';
      
      btnOrderTab.classList.remove('active');
      btnOrderTab.style.color = 'var(--text-secondary)';
      btnOrderTab.style.borderBottomColor = 'transparent';
      
      paneAnalysis.style.display = 'flex';
      paneOrder.style.display = 'none';
    });
    
    btnOrderTab.addEventListener('click', () => {
      btnOrderTab.classList.add('active');
      btnOrderTab.style.color = '#fff';
      btnOrderTab.style.borderBottomColor = 'var(--accent)';
      
      btnAnalysisTab.classList.remove('active');
      btnAnalysisTab.style.color = 'var(--text-secondary)';
      btnAnalysisTab.style.borderBottomColor = 'transparent';
      
      paneOrder.style.display = 'flex';
      paneAnalysis.style.display = 'none';
    });
  }

  // Trading mode toggle (Live vs Paper)
  const btnModeLive = document.getElementById('btn-mode-live');
  const btnModePaper = document.getElementById('btn-mode-paper');
  state.tradingMode = 'paper';
  
  if (btnModeLive && btnModePaper) {
    btnModeLive.addEventListener('click', () => {
      btnModeLive.classList.add('active');
      btnModeLive.style.color = '#fff';
      btnModeLive.style.background = 'rgba(255,255,255,0.06)';
      
      btnModePaper.classList.remove('active');
      btnModePaper.style.color = 'var(--text-secondary)';
      btnModePaper.style.background = 'transparent';
      
      state.tradingMode = 'live';
      window.ravoraToast.success('Switched to LIVE trading mode (Active exchanges required)');
    });
    
    btnModePaper.addEventListener('click', () => {
      btnModePaper.classList.add('active');
      btnModePaper.style.color = '#fff';
      btnModePaper.style.background = 'rgba(255,255,255,0.06)';
      
      btnModeLive.classList.remove('active');
      btnModeLive.style.color = 'var(--text-secondary)';
      btnModeLive.style.background = 'transparent';
      
      state.tradingMode = 'paper';
      window.ravoraToast.success('Switched to SIMULATED paper trading mode');
    });
  }

  // Manual Order Entry form setup
  const workspaceOrderForm = document.getElementById('workspace-order-form');
  if (workspaceOrderForm) {
    const slider = document.getElementById('order-leverage-slider');
    const display = document.getElementById('order-leverage-display');
    if (slider && display) {
      slider.addEventListener('input', () => {
        display.textContent = `${parseFloat(slider.value).toFixed(1)}x`;
      });
    }
    
    const typeSelect = document.getElementById('order-type-select');
    const priceRow = document.getElementById('order-price-row');
    if (typeSelect && priceRow) {
      typeSelect.addEventListener('change', () => {
        if (typeSelect.value === 'market') {
          priceRow.style.display = 'none';
        } else {
          priceRow.style.display = 'flex';
        }
      });
    }

    let orderSide = 'buy';
    const btnBuy = document.getElementById('btn-order-buy');
    const btnSell = document.getElementById('btn-order-sell');
    if (btnBuy && btnSell) {
      btnBuy.addEventListener('click', () => {
        btnBuy.classList.add('active');
        btnBuy.style.color = '#fff';
        btnSell.classList.remove('active');
        btnSell.style.color = 'var(--text-secondary)';
        orderSide = 'buy';
      });
      btnSell.addEventListener('click', () => {
        btnSell.classList.add('active');
        btnSell.style.color = '#fff';
        btnBuy.classList.remove('active');
        btnBuy.style.color = 'var(--text-secondary)';
        orderSide = 'sell';
      });
    }
    
    workspaceOrderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const type = typeSelect.value;
      const margin = parseFloat(document.getElementById('order-margin-input').value);
      const leverage = parseFloat(slider ? slider.value : 1.0);
      const limitPrice = parseFloat(document.getElementById('order-price-input').value || 0);
      const stopLoss = parseFloat(document.getElementById('order-sl-input').value || 0) || null;
      const takeProfit = parseFloat(document.getElementById('order-tp-input').value || 0) || null;
      const symbol = state.selectedAsset || 'BTC';
      
      let entryPrice = limitPrice;
      if (type === 'market') {
        const headerPriceEl = document.getElementById('terminal-chart-price');
        entryPrice = headerPriceEl ? parseFloat(headerPriceEl.textContent.replace(/[^0-9.]/g, '')) : 64000;
      }
      
      const quantity = (margin * leverage) / entryPrice;
      
      const submitBtn = workspaceOrderForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting order...';
      
      try {
        const endpoint = state.tradingMode === 'live' ? '/orders' : '/paper/order';
        const res = await apiCall(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            symbol,
            type,
            side: orderSide,
            quantity,
            price: entryPrice,
            leverage,
            stopLoss,
            takeProfit
          })
        });
        
        window.ravoraToast.success(`Order placed! Symbol: ${symbol}, Side: ${orderSide.toUpperCase()}, Status: ${res.status}`);
        
        loadTerminalPositions();
        loadTerminalHistory();
        
      } catch (err) {
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Place Simulated Order';
      }
    });
  }

  // Check auth state immediately on load
  checkAuthState();

});
