import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Menu, X } from 'lucide-react';
import HeroInstrument from './HeroInstrument';
import AskAraiven from './AskAraiven';
import PlatformTabs from './PlatformTabs';
import Movement from './Movement';
import Dial from './Dial';
import { useCountUp, useInView, usePrefersReducedMotion } from './hooks';
import { LegalLinks } from '../../legal/LegalLinks';
import './landing.css';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; as?: 'div' | 'li'; kind?: 'rise' | 'wipe' | 'pop' }> = ({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
  kind = 'rise',
}) => {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={`rv-reveal k-${kind} ${inView ? 'is-in' : ''} ${className}`}
      style={{ ['--rv-delay' as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
};

const NAV = [
  { id: 'ask', label: 'Ask Araiven' },
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
    riskIndex: '18',
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
    desc: 'Blue-chip exposure with stable lending income. Araiven moves only when confidence, structure and risk all agree.',
    balance: '$132,194.10',
    gain: '+12.0%',
    line: 'M 6 84 Q 50 50 120 62 T 234 26',
    area: 'M 6 84 Q 50 50 120 62 T 234 26 L 234 110 L 6 110 Z',
    tipY: 26,
    safety: '96',
    riskIndex: '42',
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
    riskIndex: '78',
    alloc: [
      { label: 'ETH staking', pct: 55 },
      { label: 'Stable yield', pct: 10 },
      { label: 'BTC', pct: 30 },
      { label: 'Cash reserve', pct: 5 },
    ],
  },
];

const GATES = [
  { t: 'Ingest', d: 'Prices, orderbook depth, volume and news sentiment from every supported market.' },
  { t: 'Read the structure', d: 'Trend, momentum, volatility and support and resistance, computed with fixed rules.' },
  { t: 'Score', d: 'Every setup gets a transparent confidence score. No score is shown without a calculation behind it.' },
  { t: 'Check the risk', d: 'Leverage limits and your drawdown cap can veto a setup before you ever see it.' },
  { t: 'Plan the trade', d: 'Entry, stop and target come from market structure, not round-number guesses.' },
  { t: 'Explain it', d: 'The plan arrives with a plain-English reason, and one click to approve or reject.' },
];

const VERDICT = [
  'Waiting for market data…',
  'Reading the market structure…',
  'Scoring the setup…',
  'Within your 3.5% drawdown cap. No veto.',
  'Trade plan drafted: entry, stop, target.',
  'Passed the 75% filter. Shown to you with its reason.',
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
    a: 'No. Ravora provides analysis and trade-planning tools. Trading crypto involves substantial risk of loss. Past or simulated results do not guarantee future performance, and every trade is your decision.',
  },
];

const MARKETS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'USDC'];
const VENUES = ['Binance', 'Bybit', 'Coinbase', 'Kraken', 'OKX'];

const SIM = [
  { label: 'Intercept the announcement', detail: 'CPI prints +3.4% against +3.1% expected. Volatility is rising.' },
  { label: 'Read DeFi liquidity', detail: 'Depth check complete. Spreads are widening on Aave and Uniswap pools.' },
  { label: 'Recalculate the cushion', detail: 'Volatility limit exceeded. Safety cushion target tightened to 98%.' },
  { label: 'Optimise the hedge', detail: 'Hedge triggered. Volatile L1 exposure moved toward USDC yield.' },
  { label: 'Push the recommendation', detail: 'Rotate 15% of volatile assets into hedged stable pools. Ready for your review.' },
];

const ROAD = [
  { now: true, t: 'Simulated accounts', items: ['7-step onboarding', 'Paper trading with a virtual balance', 'Terminal and Copilot'] },
  { t: 'Read-only sync', items: ['Connect your exchange', 'Live balance sync', 'DeFi yield feed'] },
  { t: 'One-click live', items: ['Approve and execute', 'Trailing stop-losses', 'Slippage protection'] },
  { t: 'Autopilot', items: ['Drawdown rotation to stables', 'Stocks and ETFs', 'Specialised agents'] },
];

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const GatesSection: React.FC = () => {
  const [lit, setLit] = useState<boolean[]>(() => GATES.map(() => false));
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLOListElement | null>(null);

  // Scroll-linked gear rotation: --p runs 0 to 1 as the gate list passes through the viewport.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = listRef.current;
      const sec = sectionRef.current;
      if (!el || !sec) return;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / (r.height + window.innerHeight * 0.2)));
      sec.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setLit(GATES.map(() => true));
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
      { rootMargin: '0px 0px -40% 0px', threshold: 0.2 }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const count = lit.filter(Boolean).length;
  const total = useCountUp(82, count >= 3, 1000);
  const rows: [string, string, string][] = [
    ['Macro confluence', '0.88', 'x 0.4'],
    ['Liquidity depth', '0.80', 'x 0.4'],
    ['Sentiment inflow', '0.74', 'x 0.2'],
  ];

  return (
    <section id="how" className="rv-section" ref={sectionRef}>
      <div className="rv-wrap">
        <Reveal kind="wipe">
          <h2 className="rv-h2">Six gates engage before any trade reaches you.</h2>
          <p className="rv-lead">
            Araiven is a rules-based engine, not a text generator. The same inputs always give the same score, and you can read the
            working.
          </p>
        </Reveal>
      </div>
      <div className="rv-wrap rv-split rv-split--gates" style={{ marginTop: 'clamp(40px, 5vw, 72px)' }}>
        <div className="rv-sticky">
          <Reveal kind="pop" delay={60}>
            <Movement count={count} />
          </Reveal>
          <Reveal kind="pop" delay={140}>
            <div className="rv-cert rv-receipt" aria-label="Example confidence score receipt for the BTC plan">
              <div className="rv-receipt-title">Receipt for the BTC plan</div>
              {rows.map(([l, v, w], i) => (
                <div key={l} className={`rv-receipt-row ${count >= i + 1 ? 'is-on' : ''}`}>
                  <span>{l}</span>
                  <span className="w">{w}</span>
                  <span className="rv-data">{v}</span>
                </div>
              ))}
              <div className="rv-receipt-total">
                <span>Confidence score</span>
                <b className={`rv-data ${count >= 3 ? 'is-pass' : ''}`}>{count >= 3 ? total : '--'}%</b>
              </div>
              <p className={`rv-receipt-verdict ${count >= 6 ? 'is-pass' : ''}`}>{VERDICT[Math.min(count, 5)]}</p>
            </div>
          </Reveal>
        </div>

        <ol className="rv-gates" ref={listRef}>
          {GATES.map((g, i) => (
            <li
              key={g.t}
              data-i={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className={`rv-gate ${lit[i] ? 'is-lit' : ''}`}
            >
              <span className="rv-gate-n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{g.t}</h3>
                <p>{g.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

const GAUGE_C = { x: 150, y: 150 };
const gp = (r: number, d: number) => {
  const a = (d * Math.PI) / 180;
  return { x: GAUGE_C.x + r * Math.sin(a), y: GAUGE_C.y - r * Math.cos(a) };
};
const CapGauge: React.FC<{ cap: number }> = ({ cap }) => {
  const a = (cap / 10) * 180 - 90;
  const s0 = gp(120, -90);
  const e0 = gp(120, 90);
  const arc = `M ${s0.x} ${s0.y} A 120 120 0 0 1 ${e0.x} ${e0.y}`;
  const ticks = Array.from({ length: 21 }, (_, i) => {
    const v = i * 0.5;
    const deg = (v / 10) * 180 - 90;
    const major = i % 5 === 0;
    const p1 = gp(major ? 100 : 106, deg);
    const p2 = gp(114, deg);
    return { i, major, v, p1, p2 };
  });
  return (
    <div className="rv-gauge" aria-hidden="true">
      <svg viewBox="0 0 300 176">
        <path d={arc} className="rv-gauge-track" pathLength={100} />
        <path d={arc} className="rv-gauge-fill" pathLength={100} style={{ strokeDasharray: `${cap * 10} 100` }} />
        {ticks.map((t) => (
          <line key={t.i} x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y} className={`rv-gauge-tick ${t.major ? 'is-major' : ''}`} />
        ))}
        {[1.5, 3.5, 8.5].map((v) => {
          const q = gp(132, (v / 10) * 180 - 90);
          return <circle key={v} cx={q.x} cy={q.y} r={Math.abs(v - cap) < 0.01 ? 6 : 3.5} className="rv-gauge-stance" />;
        })}
        {[0, 5, 10].map((v) => {
          const q = gp(142, (v / 10) * 180 - 90);
          return (
            <text key={v} x={q.x + (v === 0 ? -6 : v === 10 ? 6 : 0)} y={q.y + (v === 5 ? -2 : 14)} textAnchor="middle" className="rv-gauge-num">
              {v}%
            </text>
          );
        })}
        <g className="rv-gauge-hand" style={{ transform: `rotate(${a}deg)`, transformOrigin: `${GAUGE_C.x}px ${GAUGE_C.y}px` }}>
          <line x1={GAUGE_C.x} y1={GAUGE_C.y} x2={GAUGE_C.x} y2={GAUGE_C.y - 98} />
        </g>
        <circle cx={GAUGE_C.x} cy={GAUGE_C.y} r="8" className="rv-gauge-hub" />
      </svg>
    </div>
  );
};

const RiskSection: React.FC = () => {
  const [sel, setSel] = useState(1);
  const r = RISK[sel];
  return (
    <section id="risk" className="rv-frame">
      <div className="rv-amber rv-panel">
        <div className="rv-wrap">
          <div className="rv-risk-head">
            <Reveal kind="wipe">
              <h2 className="rv-h2">Set your limit. Araiven works inside it.</h2>
              <p className="rv-lead">
                Pick a stance and watch the drawdown cap, allocation and projected curve change. Figures are illustrative.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="rv-seg" role="group" aria-label="Risk stance">
                {RISK.map((p, i) => (
                  <button key={p.label} aria-pressed={sel === i} onClick={() => setSel(i)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="rv-risk-grid">
            <Reveal>
              <div className="rv-cap-num" aria-live="polite">
                {r.cap}
                <span>%</span>
              </div>
              <div className="rv-cap-label">Maximum 24h drawdown</div>
              <p className="rv-cap-desc">{r.desc}</p>
              <CapGauge cap={parseFloat(r.cap)} />
            </Reveal>

            <Reveal kind="pop" delay={120}>
              <div className="rv-equity">
                <div className="rv-equity-head">
                  <div className="rv-equity-bal">{r.balance}</div>
                  <div className="rv-equity-gain">{r.gain} illustrative</div>
                </div>
                <div className="rv-equity-plot">
                  <svg className="rv-equity-svg" viewBox="0 0 234 110" preserveAspectRatio="none" aria-hidden="true">
                    <path className="area" d={r.area} />
                    <path className="line" d={r.line} vectorEffect="non-scaling-stroke" />
                  </svg>
                  <span className="rv-equity-dot" style={{ transform: `translateY(${(r.tipY / 110) * 150}px)` }} aria-hidden="true" />
                </div>
                <div className="rv-alloc">
                  {r.alloc.map((a) => (
                    <div key={a.label} className="rv-alloc-row">
                      <span>{a.label}</span>
                      <div className="rv-alloc-bar">
                        <i style={{ transform: `scaleX(${a.pct / 100})` }} />
                      </div>
                      <span>{a.pct}%</span>
                    </div>
                  ))}
                </div>
                <dl className="rv-risk-rows">
                  <div>
                    <dt>Safety score</dt>
                    <dd>{r.safety}</dd>
                  </div>
                  <div>
                    <dt>Risk index</dt>
                    <dd>{r.riskIndex}</dd>
                  </div>
                </dl>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

const EventTape: React.FC = () => {
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(false);
  const sec = useInView<HTMLElement>(0.35);

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
    }, 1400);
  };

  const running = step > 0 && step < 5;
  const done = step === 5;

  // Play the scenario once when the section scrolls into view; the button replays it.
  useEffect(() => {
    if (sec.inView && !started.current) {
      started.current = true;
      const t = window.setTimeout(run, 500);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sec.inView]);

  return (
    <section className="rv-section" ref={sec.ref as React.RefObject<HTMLElement>}>
      <div className="rv-wrap">
        <div className="rv-sim-head">
          <Reveal kind="wipe">
            <h2 className="rv-h2">Watch Araiven react to a Fed surprise.</h2>
            <p className="rv-lead">A macro event enters the engine and leaves as a recommendation you can approve or reject.</p>
          </Reveal>
          <Reveal delay={100}>
            <button className="rv-btn rv-btn-primary" onClick={run} disabled={running}>
              {running ? 'Analysing…' : done ? 'Replay the scenario' : 'Simulate CPI announcement'}
            </button>
          </Reveal>
        </div>

        <div className="rv-events-rail" aria-hidden="true">
          <i style={{ transform: `scaleX(${step / 5})` }} />
        </div>
        <ol className="rv-events" aria-live="polite">
          {SIM.map((s, i) => {
            const n = i + 1;
            const state = step > n || (done && n === 5) ? 'is-done' : step === n ? 'is-now' : '';
            return (
              <li key={s.label} className={`rv-event ${state}`}>
                <span className="t">T+{(i * 1.4).toFixed(1)}s</span>
                <span className="label">{s.label}</span>
                <span className="detail">{step >= n ? <span key={`${step >= n}`}>{s.detail}</span> : ''}</span>
                <span className="tick">{state === 'is-done' ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : null}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

const FaqItem: React.FC<{ q: string; a: string; open: boolean; onToggle: () => void; reduced: boolean }> = ({ q, a, open, onToggle, reduced }) => (
  <div className="rv-faq-item">
    <button className="rv-faq-q" aria-expanded={open} onClick={onToggle}>
      <span>{q}</span>
      <span className="plus" aria-hidden="true" />
    </button>
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className="rv-faq-a"
          initial={reduced ? false : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <p>{a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const road = useInView<HTMLDivElement>(0.3);
  const factsView = useInView<HTMLDivElement>(0.2);
  const faqView = useInView<HTMLDivElement>(0.2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => window.innerWidth > 960 && setMenuOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  const row = (items: string[], key: string, venue = false) => (
    <div className="rv-marq-group" key={key} aria-hidden={key.endsWith('b')}>
      {items.map((m) => (
        <span key={m} className={`rv-marq-item ${venue ? 'is-venue' : ''}`}>
          {m}
        </span>
      ))}
    </div>
  );

  return (
    <div className="rv">
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
            <button className="rv-burger" aria-label="Toggle navigation menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
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
            <div className="rv-hero-copy">
              <h1 className="rv-h1">
                Every trade, <span className="rv-mark">with proof attached.</span>
              </h1>
              <p className="rv-hero-sub">
                Ravora scans the market around the clock, scores every setup, and hands you a complete trade plan with the reasoning
                attached. You approve it in one click.
              </p>
              <div className="rv-hero-actions">
                <button className="rv-btn rv-btn-primary" onClick={() => navigate('/auth/register')}>
                  Start with $100k paper money
                </button>
                <a href="#how" className="rv-btn rv-btn-ghost">
                  See how it decides
                </a>
              </div>
              <p className="rv-hero-note">No card. No exchange connection. Simulated capital only.</p>
            </div>
            <div className="rv-hero-inst">
              <HeroInstrument />
            </div>
          </div>
        </section>

        {/* Coverage: two counter-scrolling rows */}
        <div className="rv-marq" aria-label="Markets and exchanges Araiven covers">
          <div className="rv-marq-mask">
            <div className="rv-marq-track">
              {row(MARKETS, 'a')}
              {row(MARKETS, 'ab')}
            </div>
          </div>
          <div className="rv-marq-mask is-reverse">
            <div className="rv-marq-track">
              {row(VENUES, 'c', true)}
              {row(VENUES, 'cb', true)}
              {row(VENUES, 'd', true)}
              {row(VENUES, 'db', true)}
            </div>
          </div>
        </div>

        {/* Ask Araiven, inside a case */}
        <section id="ask" className="rv-frame">
          <div className="rv-case rv-panel">
            <div className="rv-wrap">
              <AskAraiven />
            </div>
          </div>
        </section>

        <GatesSection />

        <section id="features" className="rv-section rv-section--tight">
          <div className="rv-wrap">
            <Reveal kind="wipe">
              <h2 className="rv-h2">One workspace, from signal to execution.</h2>
              <p className="rv-lead">Find a setup, size it against your drawdown cap and read its reasoning in one workspace.</p>
            </Reveal>
            <Reveal kind="pop" delay={80}>
              <PlatformTabs />
            </Reveal>
          </div>
        </section>

        <RiskSection />
        <EventTape />

        {/* Security */}
        <section id="security" className="rv-section rv-section--tight">
          <div className="rv-wrap rv-split">
            <Reveal kind="wipe">
              <h2 className="rv-h2">Built so Ravora can never touch your funds.</h2>
              <div className={`rv-facts ${factsView.inView ? 'is-in' : ''}`} ref={factsView.ref}>
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
            <Reveal kind="pop" delay={120}>
              <div className="rv-cert rv-keycheck">
                <h3>Exchange key check</h3>
                <div className="rv-perms">
                  <div className="rv-perm">
                    Read balances <em className="ok">Allowed</em>
                  </div>
                  <div className="rv-perm">
                    Place orders <em className="ok">Allowed</em>
                  </div>
                  <div className="rv-perm">
                    Withdraw funds <em className="no">Blocked</em>
                  </div>
                </div>
                <p>Live exchange connection is part of the next phase. Today you work in the paper account.</p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Roadmap: a calibration track that draws itself */}
        <section className="rv-frame">
          <div className="rv-case rv-panel">
            <div className="rv-wrap">
              <Reveal kind="wipe">
                <h2 className="rv-h2">Paper first. Live when you are ready.</h2>
              </Reveal>
              <div ref={road.ref} className={`rv-road ${road.inView ? 'is-drawn' : ''}`}>
                {ROAD.map((p, i) => (
                  <div key={p.t} className={`rv-phase ${p.now ? 'is-now' : ''}`} style={{ ['--i' as string]: i }}>
                    <span className="rv-phase-n" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3>
                      {p.t}
                      {p.now && <span className="rv-sr"> (available now)</span>}
                    </h3>
                    <ul>
                      {p.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="rv-section">
          <div className="rv-wrap rv-split rv-split--faq">
            <Reveal kind="wipe">
              <h2 className="rv-h2">Questions, answered plainly.</h2>
              <p className="rv-lead">Anything else, ask Araiven in the Copilot once you have an account. It shows its working.</p>
            </Reveal>
            <Reveal delay={100}>
              <div className={`rv-faq ${faqView.inView ? 'is-in' : ''}`} ref={faqView.ref}>
                {FAQ.map((f, i) => (
                  <FaqItem key={f.q} q={f.q} a={f.a} open={openFaq === i} reduced={reduced} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Close */}
        <section className="rv-frame rv-frame--last">
          <div className="rv-case rv-panel rv-cta">
            <Dial className="rv-cta-dial" value={82} />
            <div className="rv-wrap">
              <Reveal kind="wipe">
                <h2 className="rv-h2">Test your first plan with paper money.</h2>
                <p className="rv-lead">No card, no exchange connection, no real risk. Set your stance and see what Araiven finds.</p>
                <div className="rv-hero-actions">
                  <button className="rv-btn rv-btn-primary" onClick={() => navigate('/auth/register')}>
                    Create free account
                  </button>
                  <button className="rv-btn rv-btn-ghost" onClick={() => navigate('/auth/login')}>
                    Sign in
                  </button>
                </div>
              </Reveal>
            </div>
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
          <LegalLinks className="rv-foot-legal" />
          <p className="rv-risk-note">
            © 2026 Ravora. Ravora provides analysis and trade-planning tools, not financial advice. Trading cryptocurrency involves
            substantial risk of loss. Figures and charts on this page are illustrative simulations, not live data or a guarantee of future
            results.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
