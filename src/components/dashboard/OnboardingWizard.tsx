import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, HelpCircle, Compass, Target, TrendingUp, Sparkles, BookOpen } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { onboardUser } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Selections
  const [experience, setExperience] = useState('active'); // beginner, active, professional
  const [capital, setCapital] = useState(132000);
  const [riskLevel, setRiskLevel] = useState<0 | 1 | 2>(1); // 0=Cons, 1=Bal, 2=Agg
  const [goal, setGoal] = useState('growth'); // preservation, income, growth

  const handleNext = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await onboardUser(experience, capital, riskLevel, goal);
      if (!res.success) {
        alert(res.error || 'Failed to complete onboarding. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Preview weight calculations based on selections (matches userController.js)
  const getPreviewAllocations = () => {
    if (riskLevel === 0) { // Conservative
      return [
        { symbol: 'USDC', name: 'USDC Stablecoin', pct: '70%', color: '#3b82f6' },
        { symbol: 'USDS', name: 'USDS Yield Core', pct: '20%', color: '#10b981' },
        { symbol: 'ETH', name: 'Ethereum Blue-chip', pct: '10%', color: '#7c3aed' }
      ];
    } else if (riskLevel === 2) { // Aggressive
      return [
        { symbol: 'ETH', name: 'Ethereum Blue-chip', pct: '40%', color: '#7c3aed' },
        { symbol: 'BTC', name: 'Bitcoin Digital Gold', pct: '35%', color: '#f59e0b' },
        { symbol: 'SOL', name: 'Solana High Velocity', pct: '25%', color: '#06b6d4' }
      ];
    } else { // Balanced (1)
      return [
        { symbol: 'ETH', name: 'Ethereum Blue-chip', pct: '45%', color: '#7c3aed' },
        { symbol: 'USDC', name: 'USDC Stablecoin', pct: '30%', color: '#3b82f6' },
        { symbol: 'BTC', name: 'Bitcoin Digital Gold', pct: '25%', color: '#f59e0b' }
      ];
    }
  };

  const allocations = getPreviewAllocations();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.08) 0%, transparent 60%), #060913',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      color: '#fff',
      fontFamily: 'var(--font-body)',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      
      {/* Background glow blobs */}
      <div className="ambient-glows" style={{ pointerEvents: 'none' }}>
        <div className="glow-blob glow-1" style={{ top: '20%', left: '20%' }}></div>
        <div className="glow-blob glow-2" style={{ bottom: '20%', right: '20%' }}></div>
      </div>

      <div className="auth-form-card" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '36px',
        background: 'rgba(14, 19, 37, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '16px',
        boxShadow: '0 24px 50px rgba(0, 0, 0, 0.5)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Step Indicator Headers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} style={{ color: 'var(--ai-accent)' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              ARAIVEN OS SYSTEM ONBOARDING
            </span>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            STEP {step} OF 4
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ height: '3px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ width: `${(step / 4) * 100}%`, height: '100%', background: 'var(--gradient-primary)', transition: 'width 0.3s ease' }}></div>
        </div>

        {/* STEP 1: EXPERIENCE */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, margin: 0 }}>
              What is your financial market experience?
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Araiven tailors explanation terminology, reasoning descriptions, and strategy reports to match your investment history.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {[
                { key: 'beginner', label: 'Beginner', desc: 'Focus on clear metrics, plain-English strategies, and delta-neutral safety.' },
                { key: 'active', label: 'Active Investor', desc: 'Balanced detail on technical indicators, support vectors, and correlation matrices.' },
                { key: 'professional', label: 'Professional / Quant', desc: 'Deep-dive calculations, volatility scores, funding rates, and detailed order logs.' }
              ].map((opt) => (
                <div 
                  key={opt.key}
                  onClick={() => setExperience(opt.key)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: experience === opt.key ? '1px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.06)',
                    background: experience === opt.key ? 'rgba(124, 58, 237, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: experience === opt.key ? 'var(--ai-accent)' : '#fff' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: CAPITAL AMOUNT */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, margin: 0 }}>
              Define your allocation capital limit.
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              This defines your virtual sandbox starting balance ($100k defaults) or real-time connected limits.
            </p>

            <div style={{ margin: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                ${capital.toLocaleString()}
              </div>

              <input 
                type="range" 
                min={5000} 
                max={500000} 
                step={5000}
                value={capital}
                onChange={(e) => setCapital(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary)',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)',
                  height: '6px',
                  borderRadius: '99px'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span>$5,000 MIN</span>
                <span>$500,000+ MAX</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: RISK LIMITS */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, margin: 0 }}>
              Establish your drawdown risk cushion.
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Araiven applies strict stop-loss limits and hedging vectors based on your daily drawdown ceiling.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px' }}>
              {([0, 1, 2] as const).map((r) => (
                <div 
                  key={r}
                  onClick={() => setRiskLevel(r)}
                  style={{
                    padding: '16px 10px',
                    borderRadius: '10px',
                    border: riskLevel === r ? '1px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.06)',
                    background: riskLevel === r ? 'rgba(124, 58, 237, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <Shield size={20} style={{
                    margin: '0 auto 8px',
                    color: riskLevel === r ? 'var(--ai-accent)' : 'var(--text-secondary)'
                  }} />
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: riskLevel === r ? '#fff' : 'var(--text-secondary)' }}>
                    {r === 0 ? 'Conservative' : (r === 1 ? 'Balanced' : 'Aggressive')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {r === 0 ? 'Max 1.5% dd' : (r === 1 ? 'Max 3.5% dd' : 'Max 8.5% dd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic Allocation Preview panel */}
            <div className="card-glass" style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>ARAIVEN TARGET REBALANCE ESTIMATE</span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600 }}>Cushion Safety: {riskLevel === 0 ? '98%' : (riskLevel === 1 ? '96%' : '91%')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {allocations.map((a) => (
                  <div key={a.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{a.name} ({a.symbol})</span>
                    <span style={{ fontWeight: 700, color: a.color }}>{a.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FINANCIAL GOALS */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 700, margin: 0 }}>
              Align Araiven with your goal stance.
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              This weights opportunities based on compound interest, stability, or yield-matching.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {[
                { key: 'preservation', label: 'Capital Preservation', icon: Compass, desc: 'Avoid volatility indexes entirely. Focus on stable coin interest yield arbitrage.' },
                { key: 'income', label: 'Steady Staking Income', icon: Target, desc: 'Accumulate validator rewards via delta-neutral ETH & L1 staking plans.' },
                { key: 'growth', label: 'Maximum Compound Growth', icon: TrendingUp, desc: 'Identify breakouts, momentum indexes, and volatile asset swing opportunities.' }
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <div 
                    key={opt.key}
                    onClick={() => setGoal(opt.key)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '10px',
                      border: goal === opt.key ? '1px solid var(--ai-accent)' : '1px solid rgba(255,255,255,0.06)',
                      background: goal === opt.key ? 'rgba(124, 58, 237, 0.06)' : 'rgba(255, 255, 255, 0.01)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={20} style={{ color: goal === opt.key ? 'var(--ai-accent)' : 'var(--text-secondary)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: goal === opt.key ? '#fff' : 'var(--text-secondary)' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>{opt.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Buttons Controls */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          {step > 1 && (
            <button 
              onClick={handleBack}
              className="btn btn-secondary"
              style={{ flex: 1, height: '44px', fontWeight: 600, fontSize: '0.85rem' }}
            >
              Back
            </button>
          )}
          <button 
            onClick={handleNext}
            className="btn btn-primary"
            disabled={loading}
            style={{ flex: 2, height: '44px', fontWeight: 600, fontSize: '0.85rem' }}
          >
            {loading ? 'Initializing Guard...' : (step === 4 ? 'Deploy Araiven Engine' : 'Continue')}
          </button>
        </div>

      </div>

    </div>
  );
};

export default OnboardingWizard;
