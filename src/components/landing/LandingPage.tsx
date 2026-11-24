import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import HeroTerminal from './HeroTerminal';
import { useCountUp, useInView } from './hooks';
import './landing.css';

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'section';
}> = ({ children, delay = 0, className = '', as: Tag = 'div' }) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={`rv-reveal ${inView ? 'is-in rv-in' : ''} ${className}`}
      style={{ ['--rv-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};

const NAV = [
  { id: 'how', label: 'How it works' },
  { id: 'features', label: 'Platform' },
  { id: 'risk', label: 'Risk guard' },
  { id: 'security', label: 'Security' },
  { id: 'faq', label: 'FAQ' },
];

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

interface RiskProfile {
  label: string;
  cap: string;
  desc: string;
  balance: string;
  gain: string;
  line: string;
  area: string;
  tipY: number;
  safety: string;
  riskIndex: string;
  alloc: { label: string; pct: number }[];
}

const RISK: RiskProfile[] = [
  {
    label: 'Conservative',
    cap: '1.5',
    desc: 'Capital preservation first. Stablecoin yield and low-volatility pools. High-beta altcoin setups are filtered out.',
    balance: '$124,582.40',
    gain: '+7.2%',
    line: 'M 6 78 Q 60 74 120 58 T 234 40',
    area: 'M 6 78 Q 60 74 120 58 T 234 40 L 234 110 L 6 110 Z',
    tipY: 40,
    safety: '98',
    riskIndex: '18 / 100',
    alloc: [
      { label: 'ETH staking', pct: 25 },
      { label: 'Stable yield', pct: 55 },
      { label: 'BTC', pct: 10 },
      { label: 'Cash reserve', pct: 10 },
    ],
  },
  {
    label: 'Balanced',
    cap: '3.5',
    desc: 'Blue-chip exposure with stable lending income. Moves only when confidence, structure and risk all agree.',
    balance: '$132,194.10',
    gain: '+12.0%',
    line: 'M 6 84 Q 50 50 120 62 T 234 26',
    area: 'M 6 84 Q 50 50 120 62 T 234 26 L 234 110 L 6 110 Z',
    tipY: 26,
    safety: '96',
    riskIndex: '42 / 100',
    alloc: [
      { label: 'ETH staking', pct: 45 },
      { label: 'Stable yield', pct: 30 },
      { label: 'BTC', pct: 20 },
      { label: 'Cash reserve', pct: 5 },
    ],
  },
  {
    label: 'Aggressive',
    cap: '8.5',
    desc: 'Maximum growth. Momentum breakouts and liquidity pairs are in scope, still bounded by a hard drawdown cap.',
    balance: '$149,425.80',
    gain: '+26.7%',
    line: 'M 6 92 Q 40 20 112 70 T 234 12',
    area: 'M 6 92 Q 40 20 112 70 T 234 12 L 234 110 L 6 110 Z',
    tipY: 12,
    safety: '91',
    riskIndex: '78 / 100',
    alloc: [
      { label: 'ETH staking', pct: 55 },
      { label: 'Stable yield', pct: 10 },
      { label: 'BTC', pct: 30 },
      { label: 'Cash reserve', pct: 5 },
    ],
  },
];

const PIPELINE = [
  { t: 'Ingest', d: 'Prices, orderbook depth, volume and news sentiment from every supported market.' },
  { t: 'Read the structure', d: 'Trend, momentum, volatility and support and resistance, computed with fixed rules.' },
  { t: 'Score', d: 'Every setup gets a transparent confidence score. No score is shown without a calculation behind it.' },
  { t: 'Check the risk', d: 'Leverage limits and your drawdown cap can veto a setup before you ever see it.' },
  { t: 'Plan the trade', d: 'Entry, stop and target come from market structure, not round-number guesses.' },
  { t: 'Explain it', d: 'The plan arrives with a plain-English reason, and one click to approve or reject.' },
];

const FAQ = [
  {
    q: 'Can Ravora move or withdraw my money?',
    a: 'No. Ravora never takes custody of funds. When you connect an exchange, API keys that have withdrawal permission enabled are rejected. Araiven can only work with read and trade permissions.',
  },
  {
    q: 'What is Araiven?',
    a: 'Araiven is the decision engine behind Ravora. It is not a chatbot. It reads market data, applies fixed scoring and risk rules, and produces a trade plan with the reasoning attached. The Copilot chat lets you question those decisions.',
  },
  {
    q: 'Do I need trading experience?',
    a: 'No. Onboarding asks about your experience, goals and risk stance, then adjusts how much detail Araiven gives you. Beginners get plain language. Professionals get the full indicator breakdown.',
  },
  {
    q: 'How does paper trading work?',
    a: 'Every account starts with a $100,000 virtual balance that trades against real price feeds. You can test any recommendation, watch it play out, and review the result before connecting a live exchange.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Ravora provides analysis and trade planning tools. Trading crypto involves substantial risk of loss. Past or simulated results do not guarantee future performance, and every trade is your decision.',
  },
];

const MARKETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'USDC'];
const VENUES = ['Binance', 'Bybit', 'Coinbase', 'Kraken', 'OKX'];

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const PipelineSection: React.FC = () => {
  const [lit, setLit] = useState<boolean[]>(() => PIPELINE.map(() => false));
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setLit(PIPELINE.map(() => true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.i);
            setLit((prev) => (prev[i] ? prev : prev.map((v, k) => (k <= i ? true : v))));
          }
        });
      },
      { rootMargin: '0px 0px -38% 0px', threshold: 0.2 }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const litCount = lit.filter(Boolean).length;
  const fill = litCount <= 1 ? 0 : ((litCount - 1) / (PIPELINE.length - 1)) * 100;

  return (
    <section id="how" className="rv-section is-alt">
      <div className="rv-wrap rv-split">
        <div className="rv-sticky">
          <Reveal>
            <span className="rv-kicker">How Araiven decides</span>
            <h2 className="rv-h2">Six checks before any trade reaches you.</h2>
            <p className="rv-lead">
              Araiven is a rules-based engine, not a text generator. The same inputs always give the same score, and
              every step can be traced.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="rv-formula">
              <div className="rv-formula-label">Confidence score</div>
              <div className="rv-formula-eq">
                <b>C<sub>s</sub></b> = 0.4 · Macro + 0.4 · Liquidity + 0.2 · Sentiment
              </div>
              <p className="rv-formula-note">
                Setups scoring below 75% are filtered out and never shown. Weights adjust with market volatility.
              </p>
            </div>
          </Reveal>
        </div>

        <ol className="rv-steps" style={{ position: 'relative' }}>
          <span className="rv-steps-fill" style={{ height: `calc(${fill}% - 8px)` }} aria-hidden="true" />
          {PIPELINE.map((s, i) => (
            <li
              key={s.t}
              data-i={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`rv-step ${lit[i] ? 'is-lit' : ''}`}
            >
              <span className="rv-step-dot">{i + 1}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

const Bento: React.FC = () => {
  const safety = useInView<HTMLDivElement>(0.4);
  const safetyNum = useCountUp(96, safety.inView, 1200);
  const paper = useInView<HTMLDivElement>(0.4);
  const paperNum = useCountUp(100000, paper.inView, 1300);

  const asks = [
    ['64,168', '0.42', '34%'],
    ['64,152', '0.88', '58%'],
    ['64,131', '1.21', '82%'],
  ];
  const bids = [
    ['64,108', '1.64', '88%'],
    ['64,090', '0.97', '61%'],
    ['64,071', '0.51', '38%'],
  ];

  return (
    <section id="features" className="rv-section">
      <div className="rv-wrap">
        <Reveal>
          <span className="rv-kicker">The platform</span>
          <h2 className="rv-h2">One workspace, from signal to execution.</h2>
          <p className="rv-lead">
            Everything you need to find a trade, size it safely and understand it, without juggling six tabs.
          </p>
        </Reveal>

        <div className="rv-bento">
          <Reveal className="rv-tile s-4" delay={0}>
            <div>
              <h3>Trading terminal</h3>
              <p>
                Candlestick charts with Araiven's support, entry, stop and target drawn on top. Switch timeframes from
                1m to 1D and place a trade in one click.
              </p>
            </div>
            <div className="rv-tile-viz rv-book" aria-hidden="true">
              {asks.map(([p, s, w], i) => (
                <div key={p} className="rv-book-row ask" style={{ ['--w' as string]: w, ['--d' as string]: `${i * 90}ms` }}>
                  <i />
                  <span>{p}</span>
                  <span>{s}</span>
                </div>
              ))}
              <div className="rv-book-mid">64,120.00</div>
              {bids.map(([p, s, w], i) => (
                <div key={p} className="rv-book-row bid" style={{ ['--w' as string]: w, ['--d' as string]: `${(i + 3) * 90}ms` }}>
                  <i />
                  <span>{p}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="rv-tile s-2" delay={80}>
            <div>
              <h3>Opportunities</h3>
              <p>Ranked by confidence, filtered by your stance.</p>
            </div>
            <div className="rv-tile-viz rv-opps" aria-hidden="true">
              {[
                ['Bitcoin ETF inflow', 'Momentum', '94'],
                ['Stablecoin hedge', 'Yield spread', '91'],
                ['Ethereum staking', 'Yield premium', '89'],
              ].map(([n, t, s]) => (
                <div key={n} className="rv-opp">
                  <b>{n}</b>
                  <small>{t}</small>
                  <span className="rv-opp-score">{s}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal className="rv-tile s-2" delay={0}>
            <div>
              <h3>Safety score</h3>
              <p>A 0 to 100 read on how much room your portfolio has before your drawdown cap.</p>
            </div>
            <div className="rv-tile-viz" ref={safety.ref} aria-hidden="true">
              <div className="rv-gauge">
                <span className="rv-gauge-num">{safetyNum}</span>
                <span className="rv-gauge-meta">Safe</span>
              </div>
              <div className="rv-meter">
                <i style={{ ['--w' as string]: '96%' }} />
              </div>
            </div>
          </Reveal>

          <Reveal className="rv-tile s-2" delay={80}>
            <div>
              <h3>Araiven Copilot</h3>
              <p>Ask why. Get the evidence.</p>
            </div>
            <div className="rv-tile-viz rv-chat" aria-hidden="true">
              <div className="rv-bubble you">Why not buy SOL right now?</div>
              <div className="rv-bubble ai">
                Confidence is <b>71%</b>, below the 75% filter. Volume is not confirming the breakout yet.
              </div>
            </div>
          </Reveal>

          <Reveal className="rv-tile s-2" delay={160}>
            <div>
              <h3>Paper trading</h3>
              <p>Practise with real prices and no real money.</p>
            </div>
            <div className="rv-tile-viz" ref={paper.ref} aria-hidden="true">
              <div className="rv-paper-num">${paperNum.toLocaleString('en-US')}</div>
              <div className="rv-paper-row">
                <span>BTC long · 0.5</span>
                <span className="pos">+2.8%</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

const RiskSection: React.FC = () => {
  const [sel, setSel] = useState(1);
  const r = RISK[sel];
  return (
    <section id="risk" className="rv-section is-alt">
      <div className="rv-wrap">
        <Reveal>
          <span className="rv-kicker">Risk guard</span>
          <h2 className="rv-h2">Set your limit. Araiven works inside it.</h2>
          <p className="rv-lead">
            Pick a stance and see how the drawdown cap, allocation and projected curve change. These are illustrative
            figures.
          </p>
        </Reveal>

        <Reveal className="rv-risk" delay={80}>
          <div className="rv-panel">
            <div className="rv-seg" role="group" aria-label="Risk stance">
              {RISK.map((p, i) => (
                <button key={p.label} aria-pressed={sel === i} onClick={() => setSel(i)}>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="rv-cap">
              <div className="rv-cap-label">Max 24h drawdown</div>
              <div className="rv-cap-num">
                {r.cap}
                <span>%</span>
              </div>
              <p className="rv-cap-desc">{r.desc}</p>
            </div>
            <dl className="rv-rows">
              <div>
                <dt>Safety score</dt>
                <dd>{r.safety}%</dd>
              </div>
              <div>
                <dt>Risk index</dt>
                <dd>{r.riskIndex}</dd>
              </div>
            </dl>
          </div>

          <div className="rv-panel">
            <div className="rv-equity-head">
              <div>
                <div className="rv-cap-label">Illustrative portfolio</div>
                <div className="rv-equity-bal">{r.balance}</div>
              </div>
              <div className="rv-equity-gain">{r.gain}</div>
            </div>
            <svg className="rv-equity-svg" viewBox="0 0 240 110" preserveAspectRatio="none" aria-hidden="true">
              <path className="area" d={r.area} />
              <path className="line" d={r.line} vectorEffect="non-scaling-stroke" />
              <circle cx="234" cy={r.tipY} r="3.5" />
            </svg>
            <div className="rv-alloc">
              {r.alloc.map((a) => (
                <div key={a.label} className="rv-alloc-row">
                  <span>{a.label}</span>
                  <div className="rv-alloc-bar">
                    <i style={{ width: `${a.pct}%` }} />
                  </div>
                  <span>{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

const SIM_STEPS = [
  'Intercept the rate announcement',
  'Analyse DeFi liquidity depth',
  'Recalculate the drawdown cushion',
  'Optimise target yield swaps',
  'Push the rebalance recommendation',
];
const SIM_LOG = [
  'Standby. Run the scenario to watch Araiven respond to a macro event.',
  '[Macro] CPI prints +3.4% against +3.1% expected. Volatility is rising.',
  '[Liquidity] Depth check complete. Spreads are widening on Aave and Uniswap pools.',
  '[Risk] Volatility limit exceeded. Tightening the safety cushion target to 98%.',
  '[Yield] Hedge triggered. Moving volatile L1 exposure toward USDC yield.',
  '[Advisory] Rotate 15% of volatile assets into hedged stable pools. Ready for your review.',
];

const SimulatorSection: React.FC = () => {
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    []
  );

  const run = () => {
    if (timer.current) clearInterval(timer.current);
    setStep(1);
    let s = 1;
    timer.current = setInterval(() => {
      s += 1;
      setStep(s);
      if (s >= 5 && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    }, 1500);
  };

  const running = step > 0 && step < 5;
  const done = step === 5;

  return (
    <section className="rv-section">
      <div className="rv-wrap">
        <Reveal>
          <span className="rv-kicker">Try it</span>
          <h2 className="rv-h2">Watch Araiven react to a Fed surprise.</h2>
          <p className="rv-lead">
            A short simulation of how a macro event flows through the engine and ends in a recommendation you can
            approve or reject.
          </p>
        </Reveal>

        <Reveal className="rv-sim" delay={80}>
          <div className="rv-panel">
            <div className="rv-cap-label">Engine log</div>
            <div className={`rv-log ${done ? 'is-done' : step > 0 ? 'is-run' : ''}`} aria-live="polite">
              {SIM_LOG[step]}
            </div>
            <button
              className="rv-btn rv-btn-primary"
              style={{ marginTop: 18, width: '100%' }}
              onClick={run}
              disabled={running}
            >
              {running ? 'Analysing…' : done ? 'Run it again' : 'Simulate CPI announcement'}
            </button>
          </div>
          <div className="rv-panel">
            <ul className="rv-sim-list">
              {SIM_STEPS.map((label, i) => {
                const n = i + 1;
                const cls = step > n || (done && n === 5) ? 'is-done' : step === n ? 'is-now' : '';
                return (
                  <li key={label} className={cls}>
                    <span className="rv-sim-tick">{cls === 'is-done' ? '✓' : n}</span>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => window.innerWidth > 860 && setMenuOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Highlight the nav link for the section in view.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const marketGroup = (key: string) => (
    <div className="rv-marquee-group" key={key} aria-hidden={key !== 'a'}>
      {MARKETS.map((m) => (
        <span key={m} className="rv-marquee-item">
          {m}
          <small>scanned 24/7</small>
        </span>
      ))}
      {VENUES.map((v) => (
        <span key={v} className="rv-marquee-item">
          <small style={{ fontSize: '0.9rem', color: 'var(--rv-text-2)' }}>{v}</small>
        </span>
      ))}
    </div>
  );

  return (
    <div className="rv">
      {/* Navigation */}
      <header className={`rv-nav ${scrolled || menuOpen ? 'is-scrolled' : ''}`}>
        <div className="rv-wrap rv-nav-inner">
          <a href="#top" className="rv-logo" aria-label="Ravora home">
            <span className="rv-logo-mark">R</span>
            Ravora
          </a>
          <nav aria-label="Primary">
            <ul className="rv-nav-links">
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className={active === n.id ? 'is-active' : ''}>
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="rv-nav-cta">
            <button className="rv-nav-signin" onClick={() => navigate('/auth/login')}>
              Sign in
            </button>
            <button className="rv-btn rv-btn-primary rv-btn-sm" onClick={() => navigate('/auth/register')}>
              Start free
            </button>
            <button
              className="rv-burger"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="rv-drawer">
            {NAV.map((n) => (
              <a key={n.id} href={`#${n.id}`} onClick={() => setMenuOpen(false)}>
                {n.label}
              </a>
            ))}
            <div className="rv-drawer-actions">
              <button
                className="rv-btn rv-btn-ghost"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/auth/login');
                }}
              >
                Sign in
              </button>
              <button
                className="rv-btn rv-btn-primary"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/auth/register');
                }}
              >
                Start free
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="rv-hero">
          <div className="rv-wrap rv-hero-grid">
            <div className="rv-hero-in">
              <h1 className="rv-h1">
                Know what to trade, <em>and why.</em>
              </h1>
              <p className="rv-hero-sub">
                Ravora scans the market around the clock, scores every setup, and hands you a complete trade plan with
                the reasoning attached. You approve it in one click.
              </p>
              <div className="rv-hero-actions">
                <button className="rv-btn rv-btn-primary" onClick={() => navigate('/auth/register')}>
                  Start with $100k paper money <span className="rv-arrow">→</span>
                </button>
                <a href="#how" className="rv-btn rv-btn-ghost">
                  See how it decides
                </a>
              </div>
              <div className="rv-hero-facts">
                <div className="rv-fact">
                  <b>75%</b>
                  <span>minimum confidence to surface</span>
                </div>
                <div className="rv-fact">
                  <b>1.5–8.5%</b>
                  <span>hard drawdown caps</span>
                </div>
                <div className="rv-fact">
                  <b>0</b>
                  <span>withdrawal permissions</span>
                </div>
              </div>
            </div>
            <div className="rv-hero-term">
              <HeroTerminal />
            </div>
          </div>
        </section>

        {/* Markets marquee */}
        <div className="rv-marquee" aria-label="Markets and exchanges Araiven covers">
          <span className="rv-marquee-label">Coverage</span>
          <div className="rv-marquee-mask">
            <div className="rv-marquee-track">
              {marketGroup('a')}
              {marketGroup('b')}
            </div>
          </div>
        </div>

        {/* Problem */}
        <section className="rv-section">
          <div className="rv-wrap rv-split">
            <Reveal>
              <span className="rv-kicker">Why Ravora</span>
              <h2 className="rv-h2">Charts show data. Ravora gives a decision.</h2>
              <p className="rv-lead">
                Most traders lose to noise and emotion, not to a lack of charts. Ravora does the reading for you and
                shows its work, so you can accept or reject a plan with your eyes open.
              </p>
            </Reveal>
            <Reveal delay={100}>
              <div className="rv-compare">
                <div className="rv-compare-head">
                  <div>Typical tools</div>
                  <div>Ravora</div>
                </div>
                {[
                  ['You pick the asset and hope', 'Every market is scanned and ranked for you'],
                  ['Stops placed on a hunch', 'Stops derived from market structure'],
                  ['A signal with no explanation', 'A written reason for every recommendation'],
                  ['You decide how much risk', 'Your drawdown cap is enforced for you'],
                ].map(([a, b]) => (
                  <div key={a} className="rv-compare-row">
                    <div>{a}</div>
                    <div>{b}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <PipelineSection />
        <Bento />
        <RiskSection />
        <SimulatorSection />

        {/* Security */}
        <section id="security" className="rv-section is-alt">
          <div className="rv-wrap rv-split">
            <Reveal>
              <span className="rv-kicker">Security</span>
              <h2 className="rv-h2">Built so Ravora can never touch your funds.</h2>
              <div className="rv-facts">
                <div>
                  <h3>Non-custodial</h3>
                  <p>Your assets stay on your exchange. Ravora never holds them.</p>
                </div>
                <div>
                  <h3>Withdrawals rejected</h3>
                  <p>Exchange keys that allow withdrawals are refused when you connect.</p>
                </div>
                <div>
                  <h3>You approve every trade</h3>
                  <p>Araiven proposes. Nothing executes until you click approve.</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="rv-panel">
                <div className="rv-cap-label">Exchange key check</div>
                <div className="rv-perms" style={{ marginTop: 14 }}>
                  <div className="rv-perm">
                    Read balances <em className="ok">ALLOWED</em>
                  </div>
                  <div className="rv-perm">
                    Place orders <em className="ok">ALLOWED</em>
                  </div>
                  <div className="rv-perm">
                    Withdraw funds <em className="no">BLOCKED</em>
                  </div>
                </div>
                <p style={{ marginTop: 18, fontSize: '0.82rem', lineHeight: 1.55, color: 'var(--rv-text-3)' }}>
                  Live exchange connection is part of the next phase. Today you work in the paper account.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Roadmap */}
        <section className="rv-section">
          <div className="rv-wrap">
            <Reveal>
              <span className="rv-kicker">Roadmap</span>
              <h2 className="rv-h2">Paper first. Live when you are ready.</h2>
            </Reveal>
            <Reveal className="rv-road" delay={80}>
              {[
                { tag: 'Now', now: true, t: 'Simulated accounts', items: ['7-step onboarding', '$100k paper trading', 'Terminal and Copilot'] },
                { tag: 'Next', t: 'Read-only sync', items: ['Connect your exchange', 'Live balance sync', 'DeFi yield feed'] },
                { tag: 'Then', t: 'One-click live', items: ['Approve and execute', 'Trailing stop-losses', 'Slippage protection'] },
                { tag: 'Later', t: 'Autopilot', items: ['Drawdown rotation to stables', 'Stocks and ETFs', 'Specialised agents'] },
              ].map((p) => (
                <div key={p.t} className={`rv-phase ${p.now ? 'is-now' : ''}`}>
                  <span className="rv-phase-tag">{p.tag}</span>
                  <h3>{p.t}</h3>
                  <ul>
                    {p.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="rv-section is-alt">
          <div className="rv-wrap rv-split">
            <Reveal>
              <span className="rv-kicker">FAQ</span>
              <h2 className="rv-h2">Questions, answered plainly.</h2>
            </Reveal>
            <Reveal delay={100}>
              <div className="rv-faq">
                {FAQ.map((f, i) => (
                  <details key={f.q} open={i === 0}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="rv-cta">
          <div className="rv-wrap">
            <Reveal>
              <h2 className="rv-h2">Test your first plan with $100,000 of paper money.</h2>
              <p className="rv-lead">No card, no exchange connection, no real risk. Set your stance and see what Araiven finds.</p>
              <div className="rv-hero-actions">
                <button className="rv-btn rv-btn-primary" onClick={() => navigate('/auth/register')}>
                  Create free account <span className="rv-arrow">→</span>
                </button>
                <button className="rv-btn rv-btn-ghost" onClick={() => navigate('/auth/login')}>
                  Sign in
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="rv-foot">
        <div className="rv-wrap">
          <div className="rv-foot-grid">
            <a href="#top" className="rv-logo">
              <span className="rv-logo-mark">R</span>
              Ravora
            </a>
            <div className="rv-foot-links">
              {NAV.map((n) => (
                <a key={n.id} href={`#${n.id}`}>
                  {n.label}
                </a>
              ))}
            </div>
          </div>
          <p className="rv-risk-note">
            © 2026 Ravora. Ravora provides analysis and trade-planning tools, not financial advice. Trading
            cryptocurrency involves substantial risk of loss. Figures and charts on this page are illustrative
            simulations, not live data or a guarantee of future results.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
