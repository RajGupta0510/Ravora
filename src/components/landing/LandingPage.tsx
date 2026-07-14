import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

interface RiskConfig {
  label: string;
  balance: string;
  growth: string;
  chartD: string;
  chartGradD: string;
  chartPointerY: number;
  goalOffset: string;
  goalText: string;
  healthText: string;
  healthOffset: string;
  riskText: string;
  riskBarPct: string;
  divETH: string;
  divUSDC: string;
  divBTC: string;
  divCash: string;
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // UI states
  const [activeNav, setActiveNav] = useState('problem-section');
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<0 | 1 | 2>(1); // 0=Cons, 1=Mod, 2=Agg

  // 3D Parallax Mouse States
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered3D, setIsHovered3D] = useState(false);
  const [tilt3D, setTilt3D] = useState({ x: 15, y: -10 });

  // Looping Simulation States
  const [simState, setSimState] = useState<'scanning' | 'scanner-active' | 'chart-drawn' | 'plan-active' | 'deployed'>('scanning');
  const [pipelineStep, setPipelineStep] = useState(1);
  const [simInteractiveStep, setSimInteractiveStep] = useState(0); // 0=idle, 1-5=running
  const [simStatusText, setSimStatusText] = useState('Standby. Inject Fed event to start analysis.');

  // Opportunity asset preview state
  const [selectedAssetTab, setSelectedAssetTab] = useState<'eth' | 'btc' | 'yield'>('eth');

  // References
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Navbar Scroll Trigger
  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3D scene continuous lerp tilt
  useEffect(() => {
    if (!isHovered3D) {
      setTilt3D(prev => ({
        x: prev.x + (15 - prev.x) * 0.08,
        y: prev.y + (-10 - prev.y) * 0.08
      }));
      return;
    }
    const targetX = 15 - mousePos.y * 25;
    const targetY = -10 + mousePos.x * 25;
    setTilt3D(prev => ({
      x: prev.x + (targetX - prev.x) * 0.08,
      y: prev.y + (targetY - prev.y) * 0.08
    }));
  }, [mousePos, isHovered3D]);

  // Loop through Simulator States (Scanning to Deployed)
  useEffect(() => {
    const states: ('scanning' | 'scanner-active' | 'chart-drawn' | 'plan-active' | 'deployed')[] = [
      'scanning', 'scanner-active', 'chart-drawn', 'plan-active', 'deployed'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % states.length;
      setSimState(states[idx]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Loop through AI pipeline step highlights
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelineStep(prev => (prev < 6 ? prev + 1 : 1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const runInteractiveSimulation = () => {
    if (simulationTimerRef.current) {
      clearInterval(simulationTimerRef.current);
    }
    setSimInteractiveStep(1);
    setSimStatusText('[Fed Alert] Intercepting CPI inflation print (+3.4% vs +3.1% expected)...');

    let currentStep = 1;
    const interval = setInterval(() => {
      currentStep += 1;
      setSimInteractiveStep(currentStep);

      if (currentStep === 2) {
        setSimStatusText('[DeFi Analyzer] Volume depth checking completed. Spreads widening on Aave/Uniswap pools...');
      } else if (currentStep === 3) {
        setSimStatusText('[Risk Guardian] Volatility limits exceeded. Tightening safety cushion targets to 98%...');
      } else if (currentStep === 4) {
        setSimStatusText('[Yield Optimizer] Safety hedge triggered. Re-allocating L1 risk layers to USDC stable yield...');
      } else if (currentStep === 5) {
        setSimStatusText('[Dispatcher] Advisory generated: Rotate 15% volatile assets into Hedged Stable Pools. Ready for review.');
        clearInterval(interval);
        simulationTimerRef.current = null;
      }
    }, 1500);

    simulationTimerRef.current = interval;
  };

  useEffect(() => {
    return () => {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
      }
    };
  }, []);

  const riskProfiles: Record<0 | 1 | 2, RiskConfig> = {
    0: {
      label: 'Conservative',
      balance: '$124,582.40',
      growth: '+$8,340.20 (+7.2%)',
      chartD: 'M 10 35 Q 55 32 105 25 T 190 20',
      chartGradD: 'M 10 35 Q 55 32 105 25 T 190 20 L 190 50 L 10 50 Z',
      chartPointerY: 20,
      goalOffset: '75',
      goalText: '50%',
      healthText: '98%',
      healthOffset: '2.5',
      riskText: '18/100',
      riskBarPct: '18%',
      divETH: '25%',
      divUSDC: '55%',
      divBTC: '10%',
      divCash: '10%'
    },
    1: {
      label: 'Moderate',
      balance: '$132,194.10',
      growth: '+$14,210.60 (+12.0%)',
      chartD: 'M 10 40 Q 45 20 105 30 T 190 12',
      chartGradD: 'M 10 40 Q 45 20 105 30 T 190 12 L 190 50 L 10 50 Z',
      chartPointerY: 12,
      goalOffset: '45',
      goalText: '70%',
      healthText: '96%',
      healthOffset: '5',
      riskText: '42/100',
      riskBarPct: '42%',
      divETH: '45%',
      divUSDC: '30%',
      divBTC: '20%',
      divCash: '5%'
    },
    2: {
      label: 'Aggressive',
      balance: '$149,425.80',
      growth: '+$31,520.10 (+26.7%)',
      chartD: 'M 10 45 Q 35 5 100 38 T 190 7',
      chartGradD: 'M 10 45 Q 35 5 100 38 T 190 7 L 190 50 L 10 50 Z',
      chartPointerY: 7,
      goalOffset: '15',
      goalText: '90%',
      healthText: '91%',
      healthOffset: '11',
      riskText: '78/100',
      riskBarPct: '78%',
      divETH: '55%',
      divUSDC: '10%',
      divBTC: '30%',
      divCash: '5%'
    }
  };

  const currentRisk = riskProfiles[selectedRisk];

  const opportunityData = {
    eth: {
      name: 'Ethereum Staking Alpha',
      symbol: 'ETH / USD',
      icon: 'Ξ',
      reasoning: 'Validator queue consolidation and post-upgrade staking patterns show major support. Accumulation layers at $3,450 indicate institutional backing with minimal downside risk.',
      confidence: '89%',
      strokeOffset: '27.6',
      strokeColor: '#10b981',
      return: '8.0% - 12.0%',
      risk: 'Low',
      riskClass: 'text-green',
      strategy: 'Staking / Delta Neutral'
    },
    btc: {
      name: 'Bitcoin Halving Inflow',
      symbol: 'BTC / USD',
      icon: '₿',
      reasoning: 'Araiven detected high institutional inflows via spot ETFs coinciding with long-term hodler lockups. Strong orderbook support at $64,000 indicates dynamic momentum.',
      confidence: '94%',
      strokeOffset: '15.0',
      strokeColor: '#7c3aed',
      return: '15.0% - 22.0%',
      risk: 'Medium',
      riskClass: 'text-purple',
      strategy: 'Spot Inflow Accumulation'
    },
    yield: {
      name: 'Stablecoin Volatility Hedge',
      symbol: 'USDC / USDT / DAI',
      icon: '$',
      reasoning: 'Following Fed volatility, lending pool rates on Aave and Uniswap spiked. Araiven recommends capturing arbitrage spreads by rotating low-yield reserves into our optimized Stablecoin Basket.',
      confidence: '91%',
      strokeOffset: '22.5',
      strokeColor: '#3b82f6',
      return: '6.5% - 9.2%',
      risk: 'Low',
      riskClass: 'text-green',
      strategy: 'Lending Arbitrage Spreads'
    }
  };

  const currentOpp = opportunityData[selectedAssetTab];

  return (
    <div style={{ background: 'var(--background)', color: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Background Glow Overlay */}
      <div className="ambient-glows">
        <div className="ambient-grid"></div>
        <div className="glow-blob glow-1"></div>
        <div className="glow-blob glow-2"></div>
      </div>

      {/* Navbar */}
      <nav className={`navbar ${navbarScrolled ? 'scrolled' : ''}`} style={{
        borderBottom: '1px solid var(--border)',
        background: navbarScrolled ? 'rgba(6, 9, 19, 0.85)' : 'rgba(6, 9, 19, 0.7)',
        backdropFilter: 'blur(12px)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: 100 + '%',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        <div className="container" style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '0 var(--margin-outer)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '76px'
        }}>
          <a href="#" className="logo" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontFamily: 'var(--font-display)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none'
          }}>
            <div className="logo-icon" style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'var(--gradient-interactive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.1rem'
            }}>R</div>
            Ravora
          </a>

          <ul className="nav-links" style={{ listStyle: 'none', display: 'flex', gap: '24px', margin: 0, padding: 0 }}>
            {['problem-section', 'workflow-section', 'showcase-section', 'features-section', 'faq-section'].map((sect) => (
              <li key={sect}>
                <a
                  href={`#${sect}`}
                  className={activeNav === sect ? 'active-nav' : ''}
                  onClick={() => setActiveNav(sect)}
                  style={{
                    color: activeNav === sect ? '#fff' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'color var(--transition-hover)'
                  }}
                >
                  {sect === 'problem-section' && 'The Problem'}
                  {sect === 'workflow-section' && 'How It Works'}
                  {sect === 'showcase-section' && 'Showcase'}
                  {sect === 'features-section' && 'AI Features'}
                  {sect === 'faq-section' && 'FAQ'}
                </a>
              </li>
            ))}
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/auth?mode=login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color var(--transition-hover)'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth?mode=register')}
              className="btn btn-primary"
              style={{ fontSize: '0.82rem', padding: '8px 16px', height: '36px', borderRadius: '6px' }}
            >
              Start Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="hero-section" style={{ paddingTop: '160px', paddingBottom: '100px' }}>
        <div className="container" style={{
          maxWidth: 'var(--max-content-width)',
          margin: '0 auto',
          padding: '0 var(--margin-outer)',
          display: 'grid',
          gridTemplateColumns: '0.94fr 1.06fr',
          gap: '60px',
          alignItems: 'center'
        }}>
          {/* Left Text */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
            <div className="hero-badge" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border)',
              padding: '6px 14px',
              borderRadius: '99px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ai-accent)', display: 'inline-block' }}></span>
              Ravora AI-Powered Wealth Operations
            </div>

            <h1 className="display-title" style={{ fontSize: '3.1rem', lineHeight: 1.15, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 10px 0' }}>
              Trade with <span className="text-accent-gradient">AI</span>, not emotions.
            </h1>

            <p className="body-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 16px 0', maxWidth: '500px' }}>
              Araiven scans global orderbooks, drafts structured execution plan ladders, explains recommendation logic, and handles simulated drawdown limits automatically.
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={() => navigate('/auth?mode=register')}
                className="btn btn-primary"
                style={{ height: '44px', padding: '0 24px', fontSize: '0.9rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}
              >
                Start Free
              </button>
              <a href="#showcase-section" className="btn btn-secondary" style={{ height: '44px', padding: '0 24px', fontSize: '0.9rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, textDecoration: 'none', color: '#fff' }}>
                Explore Showcase
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
                <span>24/7 Autonomous Ingestion & Opportunity Detection</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>✓</span>
                <span>Standardized Execution Target Levels & Stop Losses</span>
              </div>
            </div>
          </div>

          {/* Right Product 3D Showcase (Mouse Parallax) */}
          <div
            id="hero-3d-container"
            style={{ width: '100%', perspective: '1000px' }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = (e.clientX - rect.left) / rect.width - 0.5;
              const y = (e.clientY - rect.top) / rect.height - 0.5;
              setMousePos({ x, y });
            }}
            onMouseEnter={() => setIsHovered3D(true)}
            onMouseLeave={() => setIsHovered3D(false)}
          >
            <div
              className={`card-glass mini-workspace-mock state-${simState}`}
              style={{
                width: '100%',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                background: 'rgba(14, 19, 37, 0.92)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 50px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                position: 'relative',
                transform: `rotateX(${tilt3D.x}deg) rotateY(${tilt3D.y}deg)`,
                transition: 'transform 0.1s ease',
                boxSizing: 'border-box'
              }}
            >
              {/* Scan Overlay Bar */}
              <div className="state-scanning-indicator" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'var(--gradient-primary)',
                opacity: simState === 'scanning' ? 1 : 0,
                animation: simState === 'scanning' ? 'scan-anim 1.5s linear infinite' : 'none'
              }}></div>

              {/* Mock Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    ARAIVEN OS SIMULATOR
                  </span>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  ACTIVE MULTI-FEED INPUT
                </span>
              </div>

              {/* Three column mock dashboard */}
              <div style={{ display: 'grid', gridTemplateColumns: '0.95fr 1.3fr 0.75fr', gap: '14px', height: '240px', position: 'relative' }}>
                {/* Col 1: Scanner */}
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>MARKET SCANNER</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* BTC */}
                    <div style={{ padding: '6px', borderRadius: '4px', border: simState === 'scanner-active' ? '1px solid var(--ai-accent)' : '1px solid transparent', background: simState === 'scanner-active' ? 'rgba(124, 58, 237, 0.08)' : 'transparent', transition: 'all 0.3s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>BTC/USD</span>
                        <span className="badge-ds badge-long" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>LONG</span>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700 }}>Opportunity: 94.2%</span>
                    </div>
                    {/* ETH */}
                    <div style={{ padding: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ETH/USD</span>
                        <span className="badge-ds badge-hold" style={{ fontSize: '0.55rem', padding: '1px 4px' }}>HOLD</span>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Consolidating</span>
                    </div>
                  </div>
                </div>

                {/* Col 2: Chart & Detail */}
                <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE CHART</span>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                    <svg viewBox="0 0 200 100" style={{ width: '100%', height: '100%' }}>
                      <path
                        d="M10 80 Q 40 40 90 60 T 190 20"
                        fill="none"
                        stroke={simState === 'chart-drawn' ? 'var(--ai-accent)' : 'rgba(255,255,255,0.1)'}
                        strokeWidth="2"
                        style={{ transition: 'stroke 0.3s' }}
                      />
                    </svg>
                    {simState === 'chart-drawn' && (
                      <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: '0.6rem', color: 'var(--ai-accent)', fontWeight: 700 }}>
                        +14.2% Growth Plan
                      </span>
                    )}
                  </div>
                </div>

                {/* Col 3: Execute Target */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>EXECUTION</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, justifyContent: 'center' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Entry Target:</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>$64,120.00</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Stop Loss:</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--danger)' }}>$61,870.00</div>
                  </div>

                  <button
                    disabled={simState !== 'plan-active'}
                    style={{
                      width: '100%',
                      background: simState === 'deployed' ? 'rgba(16, 185, 129, 0.15)' : (simState === 'plan-active' ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.03)'),
                      border: simState === 'deployed' ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '4px',
                      padding: '6px 0',
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      color: simState === 'deployed' ? '#10b981' : '#fff',
                      cursor: simState === 'plan-active' ? 'pointer' : 'default',
                      transition: 'all 0.3s'
                    }}
                  >
                    {simState === 'deployed' ? 'DEPLOYED ✓' : 'APPROVE & DEPLOY'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem-section" style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '16px' }}>Traditional trading terminals are designed for active stress.</h2>
          <p className="body-text" style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto' }}>
            Watching candle charts, managing order grids, and setting alarms wastes time. Ravora changes the paradigm: you define your capital, horizon, and drawdown limits, and our AI (Araiven) constructs structured execution plans for you to approve in one click.
          </p>
        </div>
      </section>

      {/* Interactive Risk Profile & Showcase Section */}
      <section id="showcase-section" style={{ padding: '80px 0', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="section-title">Interactive Risk Sync & Diversification Matrix</h2>
            <p className="body-text" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
              Choose a guard profile to preview the allocation adjustments drafted automatically by Araiven.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '40px', alignItems: 'stretch' }}>
            {/* Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
              <div className="filter-segmented" style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '4px' }}>
                {([0, 1, 2] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setSelectedRisk(v)}
                    className={`segmented-tab ${selectedRisk === v ? 'active' : ''}`}
                    style={{
                      flex: 1,
                      padding: '10px 0',
                      border: 'none',
                      background: selectedRisk === v ? 'var(--gradient-primary)' : 'transparent',
                      color: selectedRisk === v ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      transition: 'all 0.2s'
                    }}
                  >
                    {v === 0 && 'Conservative'}
                    {v === 1 && 'Balanced Shield'}
                    {v === 2 && 'Aggressive Swing'}
                  </button>
                ))}
              </div>

              <div className="card-glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(14, 19, 37, 0.4)' }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '12px', fontWeight: 600 }}>Guard parameters</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Stance Profile:</span>
                    <span style={{ fontWeight: 600, color: 'var(--ai-accent)' }}>{currentRisk.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Cushion Safety Score:</span>
                    <span style={{ fontWeight: 600, color: '#10b981' }}>{currentRisk.healthText}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>24h Max Drawdown Cap:</span>
                    <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{selectedRisk === 0 ? '1.5%' : (selectedRisk === 1 ? '3.5%' : '8.5%')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Mock */}
            <div className="card-glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '24px' }}>
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>PORTFOLIO BALANCE</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', margin: '4px 0' }}>{currentRisk.balance}</div>
                <div style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>{currentRisk.growth}</div>

                <div style={{ marginTop: '20px', height: '120px', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
                  <svg viewBox="0 0 200 50" style={{ width: '100%', height: '100%' }}>
                    <path d={currentRisk.chartD} fill="none" stroke="var(--primary)" strokeWidth="2" style={{ transition: 'd 0.3s' }} />
                    <path d={currentRisk.chartGradD} fill="rgba(37,99,235,0.03)" style={{ transition: 'd 0.3s' }} />
                    <circle cx="190" cy={currentRisk.chartPointerY} r="3" fill="var(--primary)" style={{ transition: 'cy 0.3s' }} />
                  </svg>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>DIVERSIFICATION SCALING</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'ETH Staking', pct: currentRisk.divETH, color: 'var(--color-primary)' },
                    { label: 'Stable Yield', pct: currentRisk.divUSDC, color: 'var(--color-success)' },
                    { label: 'BTC Inflow', pct: currentRisk.divBTC, color: 'var(--color-warning)' },
                    { label: 'Cash Reserves', pct: currentRisk.divCash, color: 'var(--color-text-muted)' }
                  ].map((bar) => (
                    <div key={bar.label} style={{ fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{bar.label}</span>
                        <span style={{ fontWeight: 600 }}>{bar.pct}</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ width: bar.pct, height: '100%', background: bar.color, transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works: Sequential AI reasoning pipeline */}
      <section id="workflow-section" style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 className="section-title">How Araiven Evaluates Market Feeds</h2>
            <p className="body-text" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0' }}>
              Araiven processes continuous feeds sequentially to arrive at execution-ready target rebalances.
            </p>
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
            {/* Pipeline progress bar background */}
            <div style={{ position: 'absolute', left: '16px', top: '16px', bottom: '16px', width: '2px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ height: `${(pipelineStep - 1) * 20}%`, width: '100%', background: 'var(--gradient-primary)', transition: 'height 0.3s' }}></div>
            </div>

            {[
              { id: 1, title: 'Multi-Channel Ingestion', desc: 'Consolidates tickers, indicators, support targets, and volume metrics from 14 source pools.' },
              { id: 2, title: 'Indicator Vector Core', desc: 'Computes trends (EMA Crossings), volatility boundaries (ATR), and support indices.' },
              { id: 3, title: 'Scoring Optimization Engine', desc: 'Generates raw scores and ranks assets based on active return possibilities.' },
              { id: 4, title: 'Safety & Risk Guardian checks', desc: 'Checks leverage restrictions, hard drawdown boundaries, and applies veto matrices.' },
              { id: 5, title: 'Drafting Allocation rebalance', desc: 'Calcules target adjustments and forms stop-loss/take-profit exit parameters.' },
              { id: 6, title: 'Advisory Dispatch', desc: 'Pushes the complete structured plan with detailed plain-English explanations to your copilot.' }
            ].map((step) => (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  position: 'relative',
                  opacity: pipelineStep === step.id ? 1 : 0.4,
                  transition: 'opacity 0.3s'
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: pipelineStep === step.id ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.82rem',
                  zIndex: 2,
                  color: '#fff'
                }}>{step.id}</div>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: pipelineStep === step.id ? 'var(--ai-accent)' : '#fff' }}>{step.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fed Interest Rate Scenario Simulator Section */}
      <section style={{ padding: '80px 0', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="section-title">Macro Event Ingestion Simulator</h2>
            <p className="body-text" style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
              Simulate how Araiven intercepts major global announcements and protects asset allocations dynamically.
            </p>
          </div>

          <div className="card-glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: simInteractiveStep === 5 ? '#10b981' : '#f59e0b' }}></span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  SIMULATOR STATUS LOG
                </span>
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                minHeight: '80px',
                color: simInteractiveStep === 5 ? '#10b981' : (simInteractiveStep > 0 ? '#3b82f6' : '#94a3b8')
              }}>{simStatusText}</div>

              <button
                onClick={runInteractiveSimulation}
                className="btn btn-primary"
                disabled={simInteractiveStep > 0 && simInteractiveStep < 5}
                style={{
                  height: '42px',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {simInteractiveStep > 0 && simInteractiveStep < 5 ? 'Analyzing...' : 'Simulate Fed CPI Announcement'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
              {[
                'Intercept rate announcement',
                'Analyze DeFi liquidity depth',
                'Recalculate drawdown cushioning',
                'Optimize target yield swaps',
                'Push rebalance recommendation'
              ].map((label, idx) => (
                <div key={label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.78rem',
                  opacity: simInteractiveStep >= idx + 1 ? 1 : 0.3,
                  transition: 'opacity 0.2s'
                }}>
                  <span style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: simInteractiveStep >= idx + 1 ? '#10b981' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    fontSize: '0.6rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>{simInteractiveStep >= idx + 1 ? '✓' : idx + 1}</span>
                  <span style={{ color: simInteractiveStep === idx + 1 ? 'var(--ai-accent)' : '#fff' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Opportunity Scans Demo */}
      <section id="features-section" style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 'var(--max-content-width)', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 className="section-title">Active AI Opportunity Signals</h2>
            <p className="body-text" style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '8px auto 0' }}>
              Araiven generates confidence gauges and risk metrics for each scanned market.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '40px', alignItems: 'stretch' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
              {(['eth', 'btc', 'yield'] as const).map((asset) => (
                <button
                  key={asset}
                  onClick={() => setSelectedAssetTab(asset)}
                  className={`card-glass ${selectedAssetTab === asset ? 'active' : ''}`}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: selectedAssetTab === asset ? 'rgba(124, 58, 237, 0.08)' : 'rgba(14, 19, 37, 0.3)',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {asset === 'eth' && 'Ethereum Staking'}
                      {asset === 'btc' && 'Bitcoin Inflows'}
                      {asset === 'yield' && 'Hedged stable pools'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {opportunityData[asset].symbol}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Info display */}
            <div className="card-glass" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {currentOpp.icon}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{currentOpp.name}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Strategy: {currentOpp.strategy}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {currentOpp.reasoning}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>EXPECTED RETURN</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px' }}>{currentOpp.return}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>RISK RATING</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px', color: selectedAssetTab === 'btc' ? 'var(--ai-accent)' : '#10b981' }}>{currentOpp.risk}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '14px' }}>AI CONFIDENCE</span>
                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={currentOpp.strokeColor}
                      strokeWidth="8"
                      strokeDasharray="251"
                      strokeDashoffset={251 * (1 - parseFloat(currentOpp.confidence) / 100)}
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 0.5s' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.25rem', fontWeight: 700 }}>
                    {currentOpp.confidence}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq-section" style={{ padding: '80px 0', borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.005)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '32px' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { q: 'Is my capital safe?', a: 'Ravora has withdrawal permissions locked out. We connect to your exchange via read-only and trade-execution API keys. Ravora cannot withdraw your funds.' },
              { q: 'What is Araiven?', a: 'Araiven is the underlying intelligence framework. It operates as a strict math model calculating index values, volatility thresholds, and rebalancing parameters autonomously.' },
              { q: 'How does paper trading work?', a: 'Paper trading uses our live price streams to let you deploy virtual balances ($100k) into proposed opportunities without risk.' }
            ].map((item, idx) => (
              <div key={idx} className="card-glass" style={{ padding: '20px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(14, 19, 37, 0.2)' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <HelpCircle size={15} style={{ color: 'var(--ai-accent)' }} />
                  {item.q}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.45 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ padding: '40px 0', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <p>© 2026 Ravora Intelligence Operating System. Managed in Sandbox Developer Mode.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
