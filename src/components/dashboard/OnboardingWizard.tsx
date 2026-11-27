import React, { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  CheckCircle2
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { onboardUser } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // V2 Selections State
  const [experience, setExperience] = useState<'beginner' | 'active' | 'professional'>('active');
  const [markets, setMarkets] = useState<string[]>(['Crypto']);
  const [goal, setGoal] = useState<string>('growth');
  const [workspace, setWorkspace] = useState<'simple' | 'balanced' | 'professional'>('balanced');
  const [araiven, setAraiven] = useState<string[]>(['opportunities', 'trends', 'plans']);

  // Handle Multi-Select Toggles
  const toggleMarket = (m: string) => {
    if (markets.includes(m)) {
      if (markets.length > 1) {
        setMarkets(markets.filter(x => x !== m));
      }
    } else {
      setMarkets([...markets, m]);
    }
  };

  const toggleAraiven = (a: string) => {
    if (araiven.includes(a)) {
      if (araiven.length > 1) {
        setAraiven(araiven.filter(x => x !== a));
      }
    } else {
      setAraiven([...araiven, a]);
    }
  };

  const handleNext = () => {
    if (step < 7) {
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

  const handleSkip = () => {
    // Submit with default settings
    handleSubmit(true);
  };

  const handleSubmit = async (isSkipped = false) => {
    // Map V2 selections to backend variables
    const expValue = isSkipped ? 'active' : experience;
    const goalValue = isSkipped ? 'growth' : goal;
    const marketsValue = isSkipped ? ['Crypto'] : markets;
    const workspaceValue = isSkipped ? 'balanced' : workspace;
    const araivenValue = isSkipped ? ['opportunities', 'trends', 'plans'] : araiven;

    // Derived risk level and capital
    let riskLevel: 0 | 1 | 2 = 1; // 0=Cons, 1=Bal, 2=Agg
    let capital = 100000;

    if (expValue === 'beginner' || goalValue === 'preservation') {
      riskLevel = 0;
      capital = 50000;
    } else if (expValue === 'professional' || goalValue === 'day' || goalValue === 'swing') {
      riskLevel = 2;
      capital = 250000;
    }

    try {
      setLoading(true);
      const res = await onboardUser(
        expValue,
        capital,
        riskLevel,
        goalValue,
        marketsValue,
        workspaceValue,
        araivenValue
      );
      if (!res.success) {
        toast.error('Setup could not be completed', { description: res.error || 'Please try again.' });
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Setup could not be completed', { description: err.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#eef1f5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
      color: '#0b0e14',
      fontFamily: 'var(--font-body)',
      padding: 'clamp(12px, 3vw, 24px)',
      boxSizing: 'border-box',
      overflowY: 'auto'
    }}>
      
      <div className="auth-form-card" style={{
        width: '100%',
        maxWidth: step === 1 ? '480px' : (step === 7 ? '640px' : '580px'),
        padding: 'clamp(20px, 4vw, 36px)',
        background: '#10141d',
        border: '0',
        borderRadius: '32px',
        boxShadow: '0 40px 80px -30px rgba(11, 14, 20, 0.5)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        transition: 'max-width var(--motion-duration-slow) var(--motion-ease-in-out)'
      }}>
        
        {/* Progress Tracker (Only shown after Step 1) */}
        {step > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: 'var(--color-ai-accent)' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0', color: 'var(--text-secondary)' }}>
                  Tailoring Araiven Workspace
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Step {step} of 7
              </span>
            </div>
            {/* Progress Bar */}
            <div style={{ height: '3px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${(step / 7) * 100}%`, height: '100%', background: '#f59e0b', transition: 'width var(--motion-duration-slow) var(--motion-ease-in-out)' }}></div>
            </div>
          </div>
        )}

        {/* STEP 1: WELCOME SCREEN */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '18px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0b0e14',
              fontWeight: 800,
              fontSize: '1.6rem',
              fontFamily: 'var(--font-display)',
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.25)'
            }}>
              R
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 700, margin: 0 }}>
              Welcome to Ravora
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Let's personalize your AI trading workspace.
            </p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <button 
                onClick={handleNext}
                className="btn btn-primary"
                style={{ width: '100%', height: '46px', fontWeight: 600, fontSize: '0.88rem' }}
              >
                Get Started
              </button>
              <button 
                onClick={handleSkip}
                className="btn btn-secondary"
                disabled={loading}
                style={{ width: '100%', height: '46px', fontWeight: 600, fontSize: '0.88rem', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                Skip Setup
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EXPERIENCE */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', fontWeight: 700, margin: 0 }}>
              What best describes your trading experience?
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              {[
                { key: 'beginner', label: 'Beginner', desc: 'I am just getting started.' },
                { key: 'active', label: 'Intermediate', desc: 'I already trade occasionally.' },
                { key: 'professional', label: 'Advanced', desc: 'I actively trade and manage risk.' }
              ].map((opt) => (
                <div 
                  key={opt.key}
                  onClick={() => setExperience(opt.key as any)}
                  role="radio"
                  aria-checked={experience === opt.key}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExperience(opt.key as any); } }}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: experience === opt.key ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(255,255,255,0.06)',
                    background: experience === opt.key ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                  {experience === opt.key && <CheckCircle2 size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: MARKETS */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', fontWeight: 700, margin: 0 }}>
              What markets are you interested in?
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '6px' }}>
              {['Crypto', 'Stocks', 'Forex', 'Futures', 'Commodities', 'ETFs'].map((m) => {
                const isSelected = markets.includes(m);
                return (
                  <div 
                    key={m}
                    onClick={() => toggleMarket(m)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMarket(m); } }}
                    style={{
                      padding: '14px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.01)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>{m}</span>
                    {isSelected && <CheckCircle2 size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: GOALS */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', fontWeight: 700, margin: 0 }}>
              What is your primary objective?
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '6px' }}>
              {[
                { key: 'long_term', label: 'Long-term' },
                { key: 'swing', label: 'Swing trading' },
                { key: 'day', label: 'Day trading' },
                { key: 'growth', label: 'Growth' },
                { key: 'preservation', label: 'Preservation' },
                { key: 'learning', label: 'Learning' }
              ].map((opt) => (
                <div 
                  key={opt.key}
                  onClick={() => setGoal(opt.key)}
                  role="radio"
                  aria-checked={goal === opt.key}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGoal(opt.key); } }}
                  style={{
                    padding: '14px 14px',
                    borderRadius: '12px',
                    border: goal === opt.key ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(255,255,255,0.06)',
                    background: goal === opt.key ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: goal === opt.key ? '#fff' : 'var(--text-secondary)' }}>{opt.label}</span>
                  {goal === opt.key && <CheckCircle2 size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: WORKSPACE PREFERENCES */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', fontWeight: 700, margin: 0 }}>
              How would you like your dashboard configured?
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              {[
                { key: 'simple', label: 'Simple', desc: 'Minimal information' },
                { key: 'balanced', label: 'Balanced (Recommended)', desc: 'Optimal information layout' },
                { key: 'professional', label: 'Professional', desc: 'Maximum market intelligence' }
              ].map((opt) => (
                <div 
                  key={opt.key}
                  onClick={() => setWorkspace(opt.key as any)}
                  role="radio"
                  aria-checked={workspace === opt.key}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setWorkspace(opt.key as any); } }}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: workspace === opt.key ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(255,255,255,0.06)',
                    background: workspace === opt.key ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.01)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                  {workspace === opt.key && <CheckCircle2 size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: ARAIVEN CONFIGURATION */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', fontWeight: 700, margin: 0 }}>
              How should Araiven assist you?
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginTop: '6px' }}>
              {[
                { key: 'opportunities', label: 'Find opportunities' },
                { key: 'trends', label: 'Explain trends' },
                { key: 'plans', label: 'Build trade plans' },
                { key: 'insights', label: 'Portfolio insights' },
                { key: 'risk', label: 'Risk management' },
                { key: 'alerts', label: 'Market alerts' }
              ].map((opt) => {
                const isSelected = araiven.includes(opt.key);
                return (
                  <div 
                    key={opt.key}
                    onClick={() => toggleAraiven(opt.key)}
                    role="checkbox"
                    aria-checked={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAraiven(opt.key); } }}
                    style={{
                      padding: '14px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '1px solid rgba(245, 158, 11, 0.45)' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.01)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>{opt.label}</span>
                    {isSelected && <CheckCircle2 size={14} style={{ color: '#f59e0b', flexShrink: 0 }} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: REVIEW */}
        {step === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)', fontWeight: 700, margin: 0 }}>
              Confirm your workspace profile
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
              Araiven is ready to build your personalized trading terminal. Confirm or edit your choices below.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: '12px',
              padding: '16px',
              marginTop: '6px'
            }}>
              
              <div onClick={() => setStep(2)} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, letterSpacing: '0' }}>Trading experience</span>
                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                  {experience === 'beginner' ? 'Beginner' : (experience === 'active' ? 'Intermediate' : 'Advanced')}
                </span>
              </div>

              <div onClick={() => setStep(3)} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, letterSpacing: '0' }}>Interested markets</span>
                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                  {markets.join(', ')}
                </span>
              </div>

              <div onClick={() => setStep(4)} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, letterSpacing: '0' }}>Primary objective</span>
                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                  {{
                    long_term: 'Long-term investing',
                    swing: 'Swing trading',
                    day: 'Day trading',
                    growth: 'Portfolio growth',
                    preservation: 'Capital preservation',
                    learning: 'Learning'
                  }[goal] || goal}
                </span>
              </div>

              <div onClick={() => setStep(5)} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, letterSpacing: '0' }}>Dashboard config</span>
                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                  {workspace === 'simple' ? 'Simple' : (workspace === 'balanced' ? 'Balanced' : 'Professional')}
                </span>
              </div>

              <div onClick={() => setStep(6)} style={{ cursor: 'pointer', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 700, letterSpacing: '0' }}>Araiven assistance model</span>
                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                  {araiven.map(a => ({
                    opportunities: 'Find opportunities',
                    trends: 'Explain market trends',
                    plans: 'Build trade plans',
                    insights: 'Portfolio insights',
                    risk: 'Risk management',
                    alerts: 'Market alerts'
                  }[a] || a)).join(', ')}
                </span>
              </div>

            </div>
          </div>
        )}

        {/* STEP CONTROLS (Only shown after Step 1) */}
        {step > 1 && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button 
              onClick={handleBack}
              className="btn btn-secondary"
              style={{ flex: 1, height: '44px', fontWeight: 600, fontSize: '0.88rem', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Back
            </button>
            <button 
              onClick={handleNext}
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 2, height: '44px', fontWeight: 600, fontSize: '0.88rem' }}
            >
              {loading ? 'Configuring Guard...' : (step === 7 ? 'Complete Setup' : 'Continue')}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default OnboardingWizard;
