import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import PortfolioPanel from './PortfolioPanel';
import OpportunitiesPanel from './OpportunitiesPanel';
import CopilotChat from './CopilotChat';
import SettingsPanel from './SettingsPanel';
import { 
  Briefcase, 
  TrendingUp, 
  MessageSquareCode, 
  Settings, 
  Bell, 
  LogOut, 
  ShieldAlert, 
  Sparkles
} from 'lucide-react';

export const AppDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { 
    profile, 
    notifications, 
    recommendations, 
    executeRecommendation,
    markNotificationsAsRead 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'opportunities' | 'copilot' | 'settings'>('portfolio');
  const [showNotifications, setShowNotifications] = useState(false);
  const [executingRecId, setExecutingRecId] = useState<string | null>(null);

  const unreadNotifsCount = useMemo(() => notifications.filter(n => n.is_read === 0).length, [notifications]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications]);

  const handleExecuteRec = useCallback(async (id: string) => {
    try {
      setExecutingRecId(id);
      const success = await executeRecommendation(id);
      if (success) {
        alert('Portfolio successfully rebalanced!');
      } else {
        alert('Rebalancing order execution failed.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExecutingRecId(null);
    }
  }, [executeRecommendation]);

  const getRiskStanceLabel = useCallback(() => {
    if (!profile) return 'Balanced Shield';
    const stance = profile.risk_stance;
    return stance.charAt(0).toUpperCase() + stance.slice(1) + (stance === 'balanced' ? ' Shield' : ' Buffer');
  }, [profile]);

  const getRiskStanceColor = useCallback(() => {
    if (!profile) return '#10b981';
    const stance = profile.risk_stance;
    if (stance === 'conservative') return '#3b82f6';
    if (stance === 'aggressive') return '#f59e0b';
    return '#10b981';
  }, [profile]);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#060913',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      overflowX: 'hidden'
    }}>
      
      {/* Side Navigation */}
      <aside className="app-sidebar" style={{
        width: '240px',
        borderRight: 'var(--border-thickness) solid var(--color-border)',
        background: 'rgba(14, 19, 37, 0.6)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100
      }}>
        {/* Brand Logo */}
        <div className="logo" style={{ padding: 'var(--space-6)', borderBottom: 'var(--border-thickness) solid var(--color-border-divider)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2.5)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--gradient-interactive)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>R</div>
            <span className="sidebar-logo-text">Ravora OS</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-menu" style={{ flex: 1, padding: 'var(--space-5) var(--space-3.5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {[
            { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
            { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
            { id: 'copilot', label: 'Araiven Copilot', icon: MessageSquareCode },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`menu-tab-btn ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isActive ? 'var(--gradient-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all var(--motion-duration-fast) var(--motion-ease-in-out)'
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                <span className="sidebar-nav-label">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile details & Logout */}
        <div style={{ padding: 'var(--space-5)', borderTop: 'var(--border-thickness) solid var(--color-border-divider)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="user-meta" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{user?.fullName}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
          </div>
          <div id="btn-logout-wrapper">
            <button 
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                width: '100%',
                padding: 'var(--space-2.5)',
                borderRadius: 'var(--radius-sm)',
                border: 'var(--border-thickness) solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.01)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                justifyContent: 'center',
                transition: 'background var(--motion-duration-fast) var(--motion-ease-in-out)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
            >
              <LogOut size={14} style={{ flexShrink: 0 }} />
              <span className="sidebar-nav-label" style={{ marginLeft: '4px' }}>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-window" style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Bar */}
        <header className="app-header-bar" style={{
          minHeight: '60px',
          borderBottom: 'var(--border-thickness) solid var(--color-border)',
          padding: '0 clamp(12px, 3vw, 24px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(6, 9, 19, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 90,
          gap: '12px'
        }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.95rem, 3.5vw, 1.15rem)', fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>
              {activeTab === 'portfolio' && 'Wealth Workspace'}
              {activeTab === 'opportunities' && 'Araiven Scan Matrix'}
              {activeTab === 'copilot' && 'AI Portfolio Audit'}
              {activeTab === 'settings' && 'System Parameters'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 16px)' }}>
            {/* Active Risk Guard tag */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: 'var(--border-thickness) solid var(--color-border)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.68rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getRiskStanceColor(), flexShrink: 0 }}></span>
              <span>Guard: {getRiskStanceLabel()}</span>
            </div>

            {/* Notification trigger button */}
            <button 
              onClick={() => { setShowNotifications(!showNotifications); markNotificationsAsRead(); }}
              aria-label="Notifications Log Drawer"
              aria-expanded={showNotifications}
              style={{
                background: 'none',
                border: 'none',
                color: showNotifications ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px'
              }}
            >
              <Bell size={18} aria-hidden="true" />
              {unreadNotifsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '6px',
                  height: '6px',
                  background: 'var(--danger)',
                  borderRadius: '50%'
                }}></span>
              )}
            </button>

            {/* Mobile-only Logout button in header */}
            <button
              onClick={logout}
              className="mobile-header-logout"
              aria-label="Log Out"
              title="Log Out"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                padding: '6px'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Recommendation Directive Banner */}
        {recommendations.length > 0 && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
            borderBottom: 'var(--border-thickness) solid rgba(124, 58, 237, 0.2)',
            padding: '10px clamp(12px, 3vw, 24px)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            animation: 'fadeIn var(--motion-duration-slow) var(--motion-ease-out)',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}>
              <Sparkles size={14} style={{ color: 'var(--color-ai-accent)', flexShrink: 0 }} />
              <span style={{ lineHeight: 1.35 }}>
                <strong>Araiven Directive:</strong> Optimization plan drafted. Rebalance USDC reserves into market vectors.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={() => setActiveTab('opportunities')}
                style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
              >
                Inspect Plan
              </button>
              <button 
                onClick={() => handleExecuteRec(recommendations[0].id)}
                disabled={executingRecId !== null}
                className="btn btn-primary"
                style={{
                  height: '28px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}
              >
                {executingRecId === recommendations[0].id ? 'Deploying...' : '1-Click Execute'}
              </button>
            </div>
          </div>
        )}

        {/* Notifications Dropdown Drawer */}
        {showNotifications && (
          <div style={{
            position: 'fixed',
            top: '68px',
            right: '16px',
            left: '16px',
            maxWidth: '360px',
            marginLeft: 'auto',
            background: 'rgba(14, 19, 37, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: 'var(--border-thickness) solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-overlay)',
            zIndex: 999,
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '16px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: 'var(--border-thickness) solid var(--color-border-divider)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>NOTIFICATIONS LOG</span>
              <button 
                onClick={() => setShowNotifications(false)} 
                aria-label="Close Notifications Log"
                style={{ background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 6px' }}
              >
                Close
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  No notifications recorded.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} style={{ display: 'flex', gap: '10px', fontSize: '0.76rem' }}>
                    <ShieldAlert size={14} aria-hidden="true" style={{ color: notif.priority === 'high' ? 'var(--color-danger)' : 'var(--color-ai-accent)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{notif.title}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>{notif.body}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Content view routing router */}
        <main style={{ flex: 1, padding: 'clamp(12px, 3vw, 24px)' }}>
          {activeTab === 'portfolio' && <PortfolioPanel />}
          {activeTab === 'opportunities' && <OpportunitiesPanel />}
          {activeTab === 'copilot' && <CopilotChat />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>

      </div>

      {/* Mobile Bottom Navigation */}
      <div id="mobile-bottom-nav">
        {[
          { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
          { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
          { id: 'copilot', label: 'Copilot', icon: MessageSquareCode },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Header Logout Media Query Style */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-header-logout {
            display: flex !important;
          }
        }
      `}</style>

    </div>
  );
};

export default AppDashboard;
