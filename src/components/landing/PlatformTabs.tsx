import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { usePrefersReducedMotion } from './hooks';

/*
 * Tab strip adapted from Watermelon UI "Fluid Tabs": a single shared indicator
 * (motion layoutId) springs between tabs. Restyled flat in Amber, no gradient,
 * and the panel crossfades with AnimatePresence.
 */

const TABS = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'paper', label: 'Paper trading' },
] as const;
type TabId = (typeof TABS)[number]['id'];

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

const TerminalMock = () => (
  <div className="rv-mock rv-ticket-grid" aria-hidden="true">
    <div className="rv-book">
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
    <div className="rv-ticket">
      <div className="rv-seg-mini">
        <span className="on">Long</span>
        <span>Short</span>
      </div>
      <div className="rv-field">
        Size <b>0.50 BTC</b>
      </div>
      <div className="rv-field">
        Leverage <b>3x</b>
      </div>
      <div className="rv-field">
        Stop <b>61,870</b>
      </div>
      <div className="rv-field">
        Target <b>69,480</b>
      </div>
      <span className="rv-btn rv-btn-primary" style={{ height: 44 }}>
        Place paper order
      </span>
    </div>
  </div>
);

const OpportunitiesMock = () => (
  <div className="rv-mock rv-mock-scroll" aria-hidden="true">
    <table className="rv-table">
      <thead>
        <tr>
          <th>Opportunity</th>
          <th>Type</th>
          <th className="r">Confidence</th>
          <th className="r">Expected</th>
          <th className="r">Risk</th>
        </tr>
      </thead>
      <tbody className="rv-data">
        <tr>
          <td>Bitcoin ETF inflow</td>
          <td>Momentum</td>
          <td className="r amb">94</td>
          <td className="r">15 to 22%</td>
          <td className="r">Medium</td>
        </tr>
        <tr>
          <td>Stablecoin hedge</td>
          <td>Yield spread</td>
          <td className="r amb">91</td>
          <td className="r">6.5 to 9.2%</td>
          <td className="r pos">Low</td>
        </tr>
        <tr>
          <td>Ethereum staking</td>
          <td>Yield premium</td>
          <td className="r amb">89</td>
          <td className="r">8 to 12%</td>
          <td className="r pos">Low</td>
        </tr>
        <tr>
          <td>SOL breakout</td>
          <td>Momentum</td>
          <td className="r" style={{ color: 'var(--rv-text-3)' }}>
            71
          </td>
          <td className="r" style={{ color: 'var(--rv-text-3)' }}>
            Hidden
          </td>
          <td className="r" style={{ color: 'var(--rv-text-3)' }}>
            Below 75
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const PortfolioMock = () => (
  <div className="rv-mock" aria-hidden="true">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--rv-text-3)' }}>Safety score</div>
        <div className="rv-big">96</div>
      </div>
      <div className="rv-data" style={{ color: 'var(--rv-pos)', fontSize: '0.9rem' }}>
        Safe · 1.4% buffer to cap
      </div>
    </div>
    <div className="rv-bars">
      {[
        ['ETH staking', 45],
        ['Stable yield', 30],
        ['BTC', 20],
        ['Cash reserve', 5],
      ].map(([l, p], i) => (
        <div key={l as string} className="rv-bar-row">
          <span>{l}</span>
          <div className="rv-bar-track">
            <i style={{ width: `${p}%`, animationDelay: `${i * 90}ms` }} />
          </div>
          <span>{p}%</span>
        </div>
      ))}
    </div>
  </div>
);

const PaperMock = () => (
  <div className="rv-mock rv-mock-scroll" aria-hidden="true">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, gap: 12 }}>
      <div className="rv-big">$100,000</div>
      <span style={{ fontSize: '0.8rem', color: 'var(--rv-text-3)' }}>Simulated balance</span>
    </div>
    <table className="rv-table">
      <thead>
        <tr>
          <th>Position</th>
          <th className="r">Size</th>
          <th className="r">Entry</th>
          <th className="r">P&amp;L</th>
        </tr>
      </thead>
      <tbody className="rv-data">
        <tr>
          <td>BTC long · 3x</td>
          <td className="r">0.50</td>
          <td className="r">64,120</td>
          <td className="r pos">+2.8%</td>
        </tr>
        <tr>
          <td>ETH long · 2x</td>
          <td className="r">4.00</td>
          <td className="r">3,462</td>
          <td className="r pos">+1.1%</td>
        </tr>
        <tr>
          <td>SOL long · 2x</td>
          <td className="r">60.0</td>
          <td className="r">168.40</td>
          <td className="r neg">-0.6%</td>
        </tr>
      </tbody>
    </table>
  </div>
);

const COPY: Record<TabId, { h: string; p: string; items: string[]; mock: React.ReactNode }> = {
  terminal: {
    h: 'Chart, depth and order ticket in one view.',
    p: "Araiven's levels sit right on the chart. Switch timeframes from 1m to 1D and size the order against your drawdown cap.",
    items: ['TradingView and a native SVG chart engine', 'Support, entry, stop and target overlays', 'Level 2 orderbook with live spread'],
    mock: <TerminalMock />,
  },
  opportunities: {
    h: 'Ranked by confidence. Filtered by your stance.',
    p: 'Every opportunity carries a score and a written reason. Anything below 75% never reaches the list.',
    items: ['Yield spreads, momentum breakouts and hedges', 'Matched to Conservative, Balanced or Aggressive', 'One click from reason to paper trade'],
    mock: <OpportunitiesMock />,
  },
  portfolio: {
    h: 'How much room you have, at a glance.',
    p: 'The safety score shows how far the portfolio sits from your drawdown cap, with allocation underneath.',
    items: ['0 to 100 safety score', 'Allocation across staking, stable yield and spot', 'Equity curve and unrealised P&L'],
    mock: <PortfolioMock />,
  },
  paper: {
    h: 'Practise with $100,000 of simulated capital.',
    p: 'Trade against real price feeds with no real money. Review the result before you ever connect an exchange.',
    items: ['Simulated one-click execution', 'Live position and P&L tracking', 'A ledger of every paper trade'],
    mock: <PaperMock />,
  },
};

export const PlatformTabs: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<TabId>('terminal');
  const c = COPY[active];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length;
    setActive(TABS[next].id);
    (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <>
      <div className="rv-tabs" role="tablist" aria-label="Platform areas">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            tabIndex={active === t.id ? 0 : -1}
            className="rv-tab"
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {active === t.id && (
              <motion.span
                layoutId="rv-tab-pill"
                className="rv-tab-pill"
                transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
              />
            )}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          role="tabpanel"
          className="rv-pane"
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduced ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <h3>{c.h}</h3>
            <p>{c.p}</p>
            <ul>
              {c.items.map((it) => (
                <li key={it}>{it}</li>
              ))}
            </ul>
          </div>
          {c.mock}
          <p className="rv-pane-note">Illustrative data for demonstration. Not live market data.</p>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PlatformTabs;
