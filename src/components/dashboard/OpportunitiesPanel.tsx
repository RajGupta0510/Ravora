import React, { useState } from 'react';
import { useApp, Opportunity } from '../../context/AppContext';
import { Sparkles, Play } from 'lucide-react';

export const OpportunitiesPanel: React.FC = () => {
  const { 
    opportunities, 
    deployOpportunity, 
    scanMarkets, 
    profile,
    loading 
  } = useApp();

  const [scanning, setScanning] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  
  // Deployment Form state
  const [deployAmount, setDeployAmount] = useState(5000);
  const [deployLeverage, setDeployLeverage] = useState(1);
  const [deploying, setDeploying] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState<'ALL' | 'LONG' | 'SHORT' | 'HOLD'>('ALL');

  const handleScan = async () => {
    try {
      setScanning(true);
      await scanMarkets();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;
    try {
      setDeploying(true);
      const success = await deployOpportunity(
        selectedOpp.symbol.split(' / ')[0], // Get base symbol like BTC, ETH
        selectedOpp.type as any, // 'LONG' or 'SHORT'
        deployAmount,
        deployLeverage,
        selectedOpp.suggestedStopLoss || null,
        selectedOpp.suggestedTakeProfit || null
      );

      if (success) {
        alert(`Successfully deployed sandbox trade for ${selectedOpp.symbol}!`);
        setSelectedOpp(null);
      } else {
        alert('Failed to deploy sandbox trade.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeploying(false);
    }
  };

  const filteredOpps = opportunities.filter(opp => {
    if (filterType === 'ALL') return true;
    return opp.type === filterType;
  });

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Top Controls: Scan & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="filter-segmented" style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
          {(['ALL', 'LONG', 'SHORT'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`segmented-tab ${filterType === t ? 'active' : ''}`}
              style={{
                padding: '6px 14px',
                fontSize: '0.72rem',
                border: 'none',
                background: filterType === t ? 'var(--gradient-primary)' : 'transparent',
                color: filterType === t ? '#fff' : 'var(--text-secondary)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <button 
          onClick={handleScan}
          disabled={loading || scanning}
          className="btn btn-secondary"
          style={{
            height: '36px',
            fontSize: '0.8rem',
            padding: '0 16px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--ai-accent)' }} />
          {scanning ? 'Ingesting Feeds...' : 'Force Market Scan'}
        </button>
      </div>

      {/* Grid List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredOpps.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No opportunities matching that criteria were ingested in this epoch.
          </div>
        ) : (
          filteredOpps.map((opp) => (
            <div 
              key={opp.opportunityId}
              onClick={() => {
                setSelectedOpp(opp);
                // Set default amount based on recommended sizing or capital
                if (profile) {
                  setDeployAmount(Math.round(profile.capital * 0.05)); // 5% allocation default
                }
              }}
              className="card-glass"
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: 'rgba(14, 19, 37, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {opp.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0 }}>{opp.symbol}</h3>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{opp.name}</span>
                  </div>
                </div>
                
                <span className={`badge-ds ${opp.type === 'LONG' ? 'badge-long' : (opp.type === 'SHORT' ? 'badge-short' : 'badge-hold')}`} style={{ fontSize: '0.62rem' }}>
                  {opp.type}
                </span>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, height: '42px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', margin: 0 }}>
                {opp.reasoningText}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.04)', paddingTop: '12px', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Confidence:</span>
                  <span style={{ fontWeight: 700, marginLeft: '4px', color: 'var(--success)' }}>{opp.confidenceScore}%</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Est. Return:</span>
                  <span style={{ fontWeight: 700, marginLeft: '4px' }}>{opp.expectedReturn}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-out Detail Drawer overlay modal */}
      {selectedOpp && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '460px',
          background: 'rgba(8, 12, 28, 0.96)',
          backdropFilter: 'blur(16px)',
          borderLeft: '1px solid var(--border)',
          zIndex: 999,
          padding: '32px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '-20px 0 40px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{selectedOpp.symbol} Plan Details</h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Scanned by Araiven Core</span>
            </div>
            <button 
              onClick={() => setSelectedOpp(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '4px' }}>
            
            {/* Confidence & Risk Level row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="card-glass" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>CONFIDENCE INDEX</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--success)', marginTop: '2px' }}>{selectedOpp.confidenceScore}%</div>
              </div>
              <div className="card-glass" style={{ padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>RISK LEVEL</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: selectedOpp.riskLevel === 'low' ? '#10b981' : 'var(--danger)', marginTop: '2px', textTransform: 'capitalize' }}>
                  {selectedOpp.riskLevel}
                </div>
              </div>
            </div>

            {/* Exit parameters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PROPOSED ORDER LADDER</span>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.03)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '0.78rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Suggested Entry Limit:</span>
                  <span style={{ fontWeight: 700 }}>{selectedOpp.suggestedEntry ? formatCurrency(selectedOpp.suggestedEntry) : 'Market'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Trailing Stop Loss:</span>
                  <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{selectedOpp.suggestedStopLoss ? formatCurrency(selectedOpp.suggestedStopLoss) : 'None'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Target Exit (TP1):</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>{selectedOpp.suggestedTakeProfit ? formatCurrency(selectedOpp.suggestedTakeProfit) : 'None'}</span>
                </div>
              </div>
            </div>

            {/* AI Text explanation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>QUANT REASONING STATEMENT</span>
              <p style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                background: 'rgba(255,255,255,0.005)',
                border: '1px solid rgba(255,255,255,0.01)',
                padding: '14px',
                borderRadius: '8px',
                margin: 0
              }}>{selectedOpp.reasoningText}</p>
            </div>

            {/* Order execution form */}
            <form onSubmit={handleDeploy} style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>Deploy Sandbox Capital</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '6px' }}>ALLOCATE CAPITAL ($)</label>
                  <input 
                    type="number"
                    value={deployAmount}
                    onChange={(e) => setDeployAmount(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '6px' }}>LEVERAGE</label>
                  <select 
                    value={deployLeverage}
                    onChange={(e) => setDeployLeverage(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }}
                  >
                    {[1, 2, 3, 5, 10].map(lev => (
                      <option key={lev} value={lev} style={{ background: '#0e1325' }}>{lev}x</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={deploying}
                className="btn btn-primary"
                style={{ width: '100%', height: '42px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Play size={14} fill="#fff" />
                <span>{deploying ? 'Deploying...' : 'Deploy to Sandbox'}</span>
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Injection Styles for slide animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>

    </div>
  );
};

export default OpportunitiesPanel;
