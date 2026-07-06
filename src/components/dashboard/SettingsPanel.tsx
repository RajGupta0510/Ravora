import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Key, ToggleLeft, ToggleRight, Radio, Server, CheckCircle2 } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    connectExchangeKey 
  } = useApp();

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
    <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '32px', alignItems: 'start' }}>
      
      {/* Col 1: System settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Execution Mode */}
        <div className="card-glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} style={{ color: 'var(--ai-accent)' }} />
            SYSTEM EXECUTION MODE
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { key: 'advisory', label: '1-Click Advisory Approval (Default V1)', desc: 'Araiven scans markets and drafts recommended rebalances. You must manually review and confirm each order.' },
              { key: 'autopilot_guard', label: 'Autopilot Guard Protective Shield', desc: 'Allows Araiven to execute protective swaps to stablecoins automatically when drawdown limits are breached.' },
              { key: 'autopilot_full', label: 'Full Autonomous Auto Trading', desc: 'Allows Araiven to rotate, scale, and adjust assets fully autonomously according to your risk stance.' }
            ].map((mode) => (
              <div 
                key={mode.key}
                onClick={() => handleChangeExecutionMode(mode.key)}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: settings?.execution_mode === mode.key ? '1px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.03)',
                  background: settings?.execution_mode === mode.key ? 'rgba(124, 58, 237, 0.05)' : 'rgba(255,255,255,0.005)',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: settings?.execution_mode === mode.key ? '#fff' : 'var(--text-secondary)' }}>{mode.label}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.35 }}>{mode.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Alerts config */}
        <div className="card-glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} style={{ color: 'var(--ai-accent)' }} />
            SAFETY & NOTIFICATION CONTEXT
          </h3>

          {/* Auto Hedge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>Automated Portfolio Hedging</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rotate to USDC pools during high-drawdown macro spikes</span>
            </div>
            <button onClick={handleToggleAutoHedge} style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings?.auto_hedge_enabled === 1 ? 'var(--success)' : 'var(--text-muted)' }}>
              {settings?.auto_hedge_enabled === 1 ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
            </button>
          </div>

          {/* Notifications */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>Email / SMS Safety Reports</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Receive summaries when opportunities are found or rebalances trigger</span>
            </div>
            <button onClick={handleToggleNotifications} style={{ background: 'none', border: 'none', cursor: 'pointer', color: settings?.notifications_enabled === 1 ? 'var(--success)' : 'var(--text-muted)' }}>
              {settings?.notifications_enabled === 1 ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
            </button>
          </div>
        </div>

      </div>

      {/* Col 2: Connections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Connect Exchange */}
        <div className="card-glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={16} style={{ color: 'var(--ai-accent)' }} />
            CONNECT EXCHANGE API
          </h3>

          <form onSubmit={handleConnectExchange} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px' }}>EXCHANGE PROVIDER</label>
              <select 
                value={exchangeName} 
                onChange={(e) => setExchangeName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '0.8rem', outline: 'none' }}
              >
                <option value="binance" style={{ background: '#0e1325' }}>Binance Connection (Standard V1)</option>
                <option value="kraken" style={{ background: '#0e1325' }}>Kraken Exchange</option>
                <option value="coinbase" style={{ background: '#0e1325' }}>Coinbase Pro</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px' }}>API KEY</label>
              <input 
                type="text" 
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste API Key (Withdrawal Disabled)"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px' }}>API SECRET</label>
              <input 
                type="password" 
                required
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Paste Secret Key Credentials"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {exchangeError && (
              <div style={{ color: '#f87171', fontSize: '0.76rem', background: 'rgba(248, 113, 113, 0.08)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(248, 113, 113, 0.15)' }}>
                {exchangeError}
              </div>
            )}

            {exchangeSuccess && (
              <div style={{ color: '#10b981', fontSize: '0.76rem', background: 'rgba(16, 185, 129, 0.08)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} />
                Connection established. Withdrawal lock active.
              </div>
            )}

            <button 
              type="submit" 
              disabled={exchangeLoading}
              className="btn btn-primary"
              style={{ height: '40px', fontWeight: 600, fontSize: '0.8rem' }}
            >
              {exchangeLoading ? 'Connecting...' : 'Secure Connection'}
            </button>
          </form>
        </div>

        {/* KMS encryption banner */}
        <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)', background: 'rgba(255,255,255,0.003)', display: 'flex', gap: '10px', fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          <Server size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>
            API credentials are encrypted in transmission and sealed dynamically within AWS KMS key vaults. Ravora does not cache secret keys in plain text.
          </span>
        </div>

      </div>

    </div>
  );
};

export default SettingsPanel;
