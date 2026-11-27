import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useConsent } from '../../consent/ConsentContext';
import { Shield, Key, ToggleLeft, ToggleRight, Radio, Server, CheckCircle2, Trash2 } from 'lucide-react';
import { LEGAL_LINKS } from '../../legal/legalConfig';

export const SettingsPanel: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    connectExchangeKey 
  } = useApp();
  const { token, logout } = useAuth();
  const { openPreferences, consent } = useConsent();

  // Account deletion
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const handleDeleteAccount = async () => {
    setDeleteBusy(true);
    setDeleteError('');
    try {
      const res = await fetch('/v1/user/profile/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Deletion failed. Please try again or contact us.');
      }
      await logout();
    } catch (err: any) {
      setDeleteError(err?.message || 'Deletion failed. Please try again or contact us.');
      setDeleteBusy(false);
    }
  };

  // Exchange connection form
  const [exchangeName, setExchangeName] = useState('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);
  const [exchangeError, setExchangeError] = useState('');

  // Local settings toggles (synced with db)
  const handleToggleAutoHedge = async () => {
    if (!settings) return;
    await updateSettings(
      settings.execution_mode,
      settings.auto_hedge_enabled === 0, // toggle
      settings.notifications_enabled === 1
    );
  };

  const handleToggleNotifications = async () => {
    if (!settings) return;
    await updateSettings(
      settings.execution_mode,
      settings.auto_hedge_enabled === 1,
      settings.notifications_enabled === 0 // toggle
    );
  };

  const handleChangeExecutionMode = async (mode: string) => {
    if (!settings) return;
    await updateSettings(
      mode,
      settings.auto_hedge_enabled === 1,
      settings.notifications_enabled === 1
    );
  };

  const handleConnectExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    setExchangeError('');
    setExchangeSuccess(false);
    setExchangeLoading(true);

    try {
      const res = await connectExchangeKey(exchangeName, apiKey, apiSecret);
      if (res.success) {
        setExchangeSuccess(true);
        setApiKey('');
        setApiSecret('');
      } else {
        setExchangeError(res.error || 'Failed to connect exchange.');
      }
    } catch (err: any) {
      setExchangeError(err.message || 'An error occurred.');
    } finally {
      setExchangeLoading(false);
    }
  };

  return (
    <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
      
      {/* Col 1: System settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Execution Mode */}
        <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)', background: '#151a26' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
            <Radio size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
            System execution mode
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { key: 'advisory', label: '1-Click Advisory Approval (Default V1)', desc: 'Araiven scans markets and drafts recommended rebalances. You must manually review and confirm each order.' },
              { key: 'autopilot_guard', label: 'Autopilot Guard Protective Shield', desc: 'Allows Araiven to execute protective swaps to stablecoins automatically when drawdown limits are breached.' },
              { key: 'autopilot_full', label: 'Full Autonomous Auto Trading', desc: 'Allows Araiven to rotate, scale, and adjust assets fully autonomously according to your risk stance.' }
            ].map((mode) => (
              <div 
                key={mode.key}
                onClick={() => handleChangeExecutionMode(mode.key)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: settings?.execution_mode === mode.key ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border)',
                  background: settings?.execution_mode === mode.key ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: settings?.execution_mode === mode.key ? '#fbbf24' : 'var(--text-secondary)' }}>{mode.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.35 }}>{mode.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Alerts config */}
        <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)', background: '#151a26', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
            <Shield size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
            Safety and notification context
          </h3>

          {/* Auto Hedge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>Automated Portfolio Hedging</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>Rotate to USDC pools during high-drawdown macro spikes</span>
            </div>
            <button onClick={handleToggleAutoHedge} style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings?.auto_hedge_enabled === 1 ? 'var(--success)' : 'var(--text-muted)', padding: 0, flexShrink: 0 }}>
              {settings?.auto_hedge_enabled === 1 ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>

          {/* Notifications */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '14px', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>Email / SMS Safety Reports</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.3, display: 'block', marginTop: '2px' }}>Receive summaries when opportunities are found</span>
            </div>
            <button onClick={handleToggleNotifications} style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings?.notifications_enabled === 1 ? 'var(--success)' : 'var(--text-muted)', padding: 0, flexShrink: 0 }}>
              {settings?.notifications_enabled === 1 ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
            </button>
          </div>
        </div>

      </div>

      {/* Col 2: Connections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Connect Exchange */}
        <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)', background: '#151a26' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
            <Key size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
            Connect exchange API
          </h3>

          <form onSubmit={handleConnectExchange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Exchange provider</label>
              <select 
                value={exchangeName} 
                onChange={(e) => setExchangeName(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: '#0e121b', color: '#f8fafc', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="binance" style={{ background: '#151a26' }}>Binance Connection (Standard V1)</option>
                <option value="kraken" style={{ background: '#151a26' }}>Kraken Exchange</option>
                <option value="coinbase" style={{ background: '#151a26' }}>Coinbase Pro</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>API key</label>
              <input 
                type="text" 
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste API Key (Withdrawal Disabled)"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: '#0e121b', color: '#f8fafc', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>API secret</label>
              <input 
                type="password" 
                required
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Paste Secret Key Credentials"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: '#0e121b', color: '#f8fafc', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {exchangeError && (
              <div style={{ color: '#f87171', fontSize: '0.72rem', background: 'rgba(248, 113, 113, 0.08)', padding: '10px', borderRadius: '7px', border: '1px solid rgba(248, 113, 113, 0.15)' }}>
                {exchangeError}
              </div>
            )}

            {exchangeSuccess && (
              <div style={{ color: '#10b981', fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.08)', padding: '10px', borderRadius: '7px', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} />
                Preview only: this connection was simulated. Nothing was stored and no exchange was contacted.
              </div>
            )}

            <button 
              type="submit" 
              disabled={exchangeLoading}
              className="btn btn-primary"
              style={{ height: '40px', fontWeight: 600, fontSize: '0.8rem' }}
            >
              {exchangeLoading ? 'Submitting...' : 'Try connection preview'}
            </button>
          </form>
        </div>

        {/* Honest status of the exchange connection */}
        <div role="note" style={{ padding: '14px 16px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.35)', background: 'rgba(245, 158, 11, 0.06)', display: 'flex', gap: '10px', fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <Server size={22} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#f8fafc' }}>Exchange connection is a preview.</strong> Live trading is not available yet, and this form does not
            store or use your credentials. Do not enter real exchange API keys. Orders in Ravora are simulated.
          </span>
        </div>

        {/* Privacy and data */}
        <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)', background: '#151a26' }}>
          <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
            <Shield size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
            Privacy and data
          </h3>

          <ul style={{ listStyle: 'none', margin: '0 0 14px', padding: 0, display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
            {LEGAL_LINKS.map((l) => (
              <li key={l.slug}>
                <a href={l.path} target="_blank" rel="noopener noreferrer" style={{ color: '#fbbf24', textUnderlineOffset: 3 }}>{l.label}</a>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 0', borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span>
              Third-party content (TradingView charts): <strong style={{ color: '#f8fafc' }}>{consent.decided ? (consent.thirdParty ? 'allowed' : 'not allowed') : 'not chosen yet'}</strong>
            </span>
            <button type="button" className="btn" onClick={openPreferences} style={{ height: '34px', fontSize: '0.78rem', flexShrink: 0 }}>
              Cookie settings
            </button>
          </div>

          <div style={{ padding: '12px 0 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#f8fafc' }}>Delete my Ravora data</div>
            <p style={{ margin: '6px 0 10px', fontSize: '0.74rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
              Permanently removes your profile, portfolio, trade history and settings from Ravora. Your sign-in record is deleted too, and you will be signed out.
              This cannot be undone.
            </p>
            {!deleteOpen ? (
              <button type="button" className="btn" onClick={() => setDeleteOpen(true)} style={{ height: '36px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
                <Trash2 size={14} /> Delete my data
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label htmlFor="delete-confirm" style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                  Type <strong style={{ color: '#f8fafc' }}>DELETE</strong> to confirm
                </label>
                <input
                  id="delete-confirm"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  autoComplete="off"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: '#0e121b', color: '#f8fafc', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
                />
                {deleteError && <div role="alert" style={{ color: '#f87171', fontSize: '0.74rem' }}>{deleteError}</div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn" disabled={deleteBusy} onClick={() => { setDeleteOpen(false); setDeleteText(''); setDeleteError(''); }} style={{ height: '36px', fontSize: '0.78rem' }}>
                    Cancel
                  </button>
                  <button type="button" className="btn" disabled={deleteBusy || deleteText !== 'DELETE'} onClick={handleDeleteAccount} style={{ height: '36px', fontSize: '0.78rem', color: '#f87171' }}>
                    {deleteBusy ? 'Deleting...' : 'Delete permanently'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default SettingsPanel;
