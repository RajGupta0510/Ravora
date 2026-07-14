import React, { useState } from 'react';
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

  const unreadNotifsCount = notifications.filter(n => n.is_read === 0).length;

  const handleExecuteRec = async (id: string) => {
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
  };

  const getRiskStanceLabel = () => {
    if (!profile) return 'Balanced Shield';
    const stance = profile.risk_stance;
    return stance.charAt(0).toUpperCase() + stance.slice(1) + (stance === 'balanced' ? ' Shield' : ' Buffer');
  };

  const getRiskStanceColor = () => {
    if (!profile) return '#10b981';
    const stance = profile.risk_stance;
    if (stance === 'conservative') return '#3b82f6';
    if (stance === 'aggressive') return '#f59e0b';
    return '#10b981';
  };

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
      <aside style={{
        width: '240px',
        borderRight: '1px solid var(--border)',
        background: 'rgba(8, 12, 28, 0.6)',
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
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--gradient-interactive)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>R</div>
            <span>Ravora OS</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ flex: 1, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? 'var(--gradient-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* User profile details & Logout */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{user?.fullName}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
          </div>
          <button 
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.01)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, paddingLeft: '240px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Bar */}
        <header style={{
          height: '76px',
          borderBottom: '1px solid var(--border)',
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(6, 9, 19, 0.7)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {activeTab === 'portfolio' && 'Wealth Workspace'}
              {activeTab === 'opportunities' && 'Araiven Scan Matrix'}
              {activeTab === 'copilot' && 'AI Portfolio Audit'}
              {activeTab === 'settings' && 'System Parameters'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Active Risk Guard tag */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border)',
              padding: '6px 12px',
              borderRadius: '99px',
              fontSize: '0.7rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getRiskStanceColor() }}></span>
              <span>Guard: {getRiskStanceLabel()}</span>
            </div>

            {/* Notification trigger button */}
            <button 
              onClick={() => { setShowNotifications(!showNotifications); markNotificationsAsRead(); }}
              style={{
                background: 'none',
                border: 'none',
                color: showNotifications ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                padding: '4px'
              }}
            >
              <Bell size={20} />
              {unreadNotifsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  width: '7px',
                  height: '7px',
                  background: 'var(--danger)',
                  borderRadius: '50%'
                }}></span>
              )}
            </button>
          </div>
        </header>

        {/* Recommendation Directive Banner */}
        {recommendations.length > 0 && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
            borderBottom: '1px solid rgba(124, 58, 237, 0.2)',
            padding: '12px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={14} style={{ color: 'var(--ai-accent)' }} />
              <span>
                <strong>Araiven Directive Alert:</strong> Optimization plan drafted. Rebalance USDC reserves into confident market opportunity vectors.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setActiveTab('opportunities')}
                style={{ background: 'none', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
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
                  borderRadius: '4px',
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
            position: 'absolute',
            top: '76px',
            right: '32px',
            width: '340px',
            background: 'rgba(14, 19, 37, 0.95)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            zIndex: 999,
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>NOTIFICATIONS LOG</span>
              <span onClick={() => setShowNotifications(false)} style={{ fontSize: '0.72rem', cursor: 'pointer', color: 'var(--text-muted)' }}>Close</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                  No notifications recorded.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} style={{ display: 'flex', gap: '8px', fontSize: '0.76rem' }}>
                    <ShieldAlert size={14} style={{ color: notif.priority === 'high' ? 'var(--danger)' : 'var(--ai-accent)', flexShrink: 0, marginTop: '2px' }} />
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
        <main style={{ flex: 1, padding: '32px' }}>
          {activeTab === 'portfolio' && <PortfolioPanel />}
          {activeTab === 'opportunities' && <OpportunitiesPanel />}
          {activeTab === 'copilot' && <CopilotChat />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>

      </div>
    </div>
  );
};

export default AppDashboard;
