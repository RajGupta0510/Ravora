import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, TrendingUp, Activity, FileText, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const PortfolioPanel: React.FC = () => {
  const { 
    portfolioBalance, 
    safetyScore, 
    portfolioAssets, 
    portfolioHistory,
    paperPositions,
    paperHistory,
    closePaperPosition,
    closeAllPaperPositions
  } = useApp();

  const [closingAll, setClosingAll] = useState(false);
  const [closingPosId, setClosingPosId] = useState<string | null>(null);

  const handleClosePos = useCallback(async (id: string) => {
    try {
      setClosingPosId(id);
      await closePaperPosition(id);
    } catch (err) {
      console.error(err);
    } finally {
      setClosingPosId(null);
    }
  }, [closePaperPosition]);

  const handleCloseAll = useCallback(async () => {
    if (!window.confirm('Are you sure you want to close all open paper positions?')) return;
    try {
      setClosingAll(true);
      await closeAllPaperPositions();
    } catch (err) {
      console.error(err);
    } finally {
      setClosingAll(false);
    }
  }, [closeAllPaperPositions]);

  // Get color for PnL values
  const getPnlStyle = (pnl: number) => {
    if (pnl > 0) return { color: '#10b981', fontWeight: 600 };
    if (pnl < 0) return { color: '#ef4444', fontWeight: 600 };
    return { color: 'var(--text-secondary)' };
  };

  // Simple formatter for cash values
  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Safe safety index color mapping
  const getSafetyScoreColor = (score: number) => {
    if (score >= 95) return '#10b981'; // Green
    if (score >= 80) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  // Memoized SVG path coordinate strings — only recalculated when portfolioHistory changes
  const chartPaths = useMemo(() => {
    if (portfolioHistory.length < 2) return { line: 'M 10 25 L 190 25', grad: 'M 10 25 L 190 25 L 190 50 L 10 50 Z' };
    
    const maxVal = Math.max(...portfolioHistory.map(h => h.balance));
    const minVal = Math.min(...portfolioHistory.map(h => h.balance));
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const width = 200;
    const height = 50;
    const paddingLeft = 10;
    const paddingRight = 10;
    const chartWidth = width - paddingLeft - paddingRight;

    const points = portfolioHistory.map((h, idx) => {
      const x = paddingLeft + (idx / (portfolioHistory.length - 1)) * chartWidth;
      const y = height - 10 - ((h.balance - minVal) / range) * (height - 20);
      return { x, y };
    });

    const linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const gradPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { line: linePath, grad: gradPath };
  }, [portfolioHistory]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Overview Cards Row */}
      <div className="terminal-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Balance & SVG Trend */}
        <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(14, 19, 37, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PORTFOLIO NET BALANCE</span>
              <div style={{ fontSize: 'clamp(1.5rem, 4vw, 1.9rem)', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
                {formatCurrency(portfolioBalance)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                <TrendingUp size={14} />
                <span>+4.2% Growth Index</span>
              </div>
            </div>

            <div style={{ width: '100px', height: '46px', position: 'relative', marginTop: '6px' }}>
              <svg viewBox="0 0 200 50" style={{ width: '100%', height: '100%' }}>
                <path d={chartPaths.line} fill="none" stroke="var(--primary)" strokeWidth="1.5" />
                <path d={chartPaths.grad} fill="rgba(37,99,235,0.02)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: AI Safety Index */}
        <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(14, 19, 37, 0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>ACTIVE SAFETY SHIELD</span>
            <div style={{ fontSize: 'clamp(1.5rem, 4vw, 1.9rem)', fontWeight: 700, color: getSafetyScoreColor(safetyScore), margin: '4px 0' }}>
              {safetyScore}%
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Cushioned drawdown risk
            </span>
          </div>

          <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
            <svg width="52" height="52" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
              <circle 
                cx="28" 
                cy="28" 
                r="24" 
                fill="none" 
                stroke={getSafetyScoreColor(safetyScore)} 
                strokeWidth="4" 
                strokeDasharray="150" 
                strokeDashoffset={150 * (1 - safetyScore / 100)}
                transform="rotate(-90 28 28)"
                style={{ transition: 'stroke-dashoffset 0.5s' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} style={{ color: getSafetyScoreColor(safetyScore) }} />
            </div>
          </div>
        </div>

        {/* Card 3: Market Volatility Index */}
        <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(14, 19, 37, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>GLOBAL SCAN CORE</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>24,410 feeds</div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ingested events / sec</span>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
              99.8% Active
            </div>
          </div>
        </div>

      </div>

      {/* Asset Allocations Breakdown & Diversification */}
      <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.03em', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={15} style={{ color: 'var(--ai-accent)' }} />
          ASSET DIVERSIFICATION TARGETS
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {portfolioAssets.map((asset) => (
            <div key={asset.id} style={{
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{asset.asset_symbol}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>{asset.allocation_pct.toFixed(1)}%</span>
              </div>

              <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${asset.allocation_pct}%`, height: '100%', background: 'var(--gradient-primary)' }}></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                <span>Balance:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{asset.balance_amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {asset.asset_symbol}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                <span>Entry cost:</span>
                <span style={{ fontWeight: 600, color: '#fff' }}>{formatCurrency(asset.average_entry_price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Paper Trading Positions */}
      <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.03em', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={15} style={{ color: 'var(--ai-accent)' }} />
            SANDBOX ACTIVE PAPER POSITIONS
          </h2>
          {paperPositions.length > 0 && (
            <button 
              onClick={handleCloseAll}
              disabled={closingAll}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                color: 'var(--danger)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={13} />
              Close All
            </button>
          )}
        </div>

        {paperPositions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No active paper positions. You can deploy capital using opportunity signals.
          </div>
        ) : (
          <div className="responsive-table-container">
            <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px' }}>SYMBOL</th>
                  <th style={{ padding: '8px 10px' }}>SIDE</th>
                  <th style={{ padding: '8px 10px' }}>SIZE</th>
                  <th style={{ padding: '8px 10px' }}>ENTRY</th>
                  <th style={{ padding: '8px 10px' }}>CURRENT</th>
                  <th style={{ padding: '8px 10px' }}>UNREALIZED PNL</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paperPositions.map((pos) => (
                  <tr key={pos.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{pos.symbol}</td>
                    <td style={{ padding: '10px' }}>
                      <span className={`badge-ds ${pos.side === 'LONG' ? 'badge-long' : 'badge-short'}`} style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                        {pos.side}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      {pos.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td style={{ padding: '10px' }}>{formatCurrency(pos.entryPrice)}</td>
                    <td style={{ padding: '10px' }}>{formatCurrency(pos.currentPrice)}</td>
                    <td style={{ padding: '10px', ...getPnlStyle(pos.unrealizedPnl) }}>
                      {pos.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(pos.unrealizedPnl)}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleClosePos(pos.id)}
                        disabled={closingPosId === pos.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '4px',
                          color: '#fff',
                          padding: '4px 10px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {closingPosId === pos.id ? 'Closing...' : 'Close'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction History Log */}
      <div className="card-glass" style={{ padding: 'clamp(16px, 2.5vw, 24px)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.03em', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={15} style={{ color: 'var(--ai-accent)' }} />
          SANDBOX TRANSACTION HISTORY
        </h2>

        {paperHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No transaction records found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {paperHistory.slice(0, 10).map((hist) => (
              <div key={hist.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.005)',
                border: '1px solid rgba(255,255,255,0.03)',
                fontSize: '0.78rem',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {hist.realizedPnl >= 0 ? (
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ArrowUpRight size={13} />
                    </div>
                  ) : (
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ArrowDownRight size={13} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>Closed {hist.symbol} {hist.side}</div>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>{new Date(hist.closedAt || hist.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...getPnlStyle(hist.realizedPnl), fontSize: '0.8rem' }}>
                    {hist.realizedPnl >= 0 ? '+' : ''}{formatCurrency(hist.realizedPnl)} Net
                  </div>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Size: {hist.quantity.toFixed(3)} units</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default PortfolioPanel;
