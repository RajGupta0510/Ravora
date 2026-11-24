import React, { useEffect, useMemo, useState } from 'react';
import { useCountUp, usePrefersReducedMotion } from './hooks';

type Stage = 0 | 1 | 2 | 3;

interface Setup {
  symbol: string;
  pair: string;
  side: 'LONG';
  confidence: number;
  rr: string;
  reasoning: string;
  seed: number;
  drift: number;
  prices: { entry: string; stop: string; target: string };
}

const SETUPS: Setup[] = [
  {
    symbol: 'BTC',
    pair: 'BTC / USD',
    side: 'LONG',
    confidence: 82,
    rr: '1 : 2.4',
    reasoning:
      'Price holds structural support. Momentum is rising and orderbook depth backs the entry. Stop sits below the last swing low.',
    seed: 7,
    drift: 0.55,
    prices: { entry: '64,120', stop: '61,870', target: '69,480' },
  },
  {
    symbol: 'ETH',
    pair: 'ETH / USD',
    side: 'LONG',
    confidence: 79,
    rr: '1 : 2.1',
    reasoning:
      'Consolidation resolved above the 50 EMA. Volume confirms the break and the risk cushion fits a Balanced stance.',
    seed: 19,
    drift: 0.4,
    prices: { entry: '3,462', stop: '3,318', target: '3,790' },
  },
  {
    symbol: 'SOL',
    pair: 'SOL / USD',
    side: 'LONG',
    confidence: 76,
    rr: '1 : 2.6',
    reasoning:
      'Higher low formed on rising volume. Passes the 75% confidence filter, so it is shown. Sizing is capped by your drawdown limit.',
    seed: 41,
    drift: 0.62,
    prices: { entry: '168.40', stop: '159.10', target: '192.70' },
  },
];

// Small deterministic PRNG so the chart is stable between renders.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
}

function buildCandles(seed: number, drift: number, count = 30): Candle[] {
  const rand = mulberry32(seed);
  const out: Candle[] = [];
  let price = 0.52;
  for (let i = 0; i < count; i++) {
    // Pullback in the middle, recovery at the end: reads as a support test.
    const phase = i / count;
    const bias = phase < 0.45 ? -0.018 : phase < 0.7 ? 0.004 : 0.02 * drift + 0.006;
    const o = price;
    const c = Math.min(0.96, Math.max(0.1, o + bias + (rand() - 0.5) * 0.07));
    const h = Math.min(0.98, Math.max(o, c) + rand() * 0.035);
    const l = Math.max(0.06, Math.min(o, c) - rand() * 0.035);
    out.push({ o, h, l, c });
    price = c;
  }
  return out;
}

const W = 420;
const H = 330;
const PAD_R = 62;
const PAD_T = 12;
const PAD_B = 12;

const yFor = (v: number) => PAD_T + (1 - v) * (H - PAD_T - PAD_B);

export const HeroTerminal: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<Stage>(reduced ? 3 : 0);
  const [paused, setPaused] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const setup = SETUPS[idx];
  const { candles, levels } = useMemo(() => {
    const raw = buildCandles(setup.seed, setup.drift);
    // Stretch the series to fill the plot, leaving headroom above for the target.
    const lo = Math.min(...raw.map((c) => c.l));
    const hi = Math.max(...raw.map((c) => c.h));
    const map = (v: number) => 0.1 + ((v - lo) / (hi - lo)) * 0.62;
    const norm = raw.map((c) => ({ o: map(c.o), h: map(c.h), l: map(c.l), c: map(c.c) }));
    const support = Math.min(...norm.map((c) => c.l)) + 0.02;
    const entry = norm[norm.length - 1].c;
    const stop = Math.max(0.04, support - 0.07);
    const target = Math.min(0.95, entry + (entry - stop) * parseFloat(setup.rr.split(':')[1]));
    return { candles: norm, levels: { support, entry, stop, target } };
  }, [setup]);

  // Stage machine: scan -> structure -> plan -> decision, then next asset.
  useEffect(() => {
    if (reduced) {
      setStage(3);
      return;
    }
    setStage(0);
    setDeployed(false);
    const t1 = window.setTimeout(() => setStage(1), 1700);
    const t2 = window.setTimeout(() => setStage(2), 2600);
    const t3 = window.setTimeout(() => setStage(3), 3600);
    return () => [t1, t2, t3].forEach(window.clearTimeout);
  }, [idx, reduced]);

  useEffect(() => {
    if (reduced || paused) return;
    const t = window.setTimeout(() => setIdx((i) => (i + 1) % SETUPS.length), 9500);
    return () => window.clearTimeout(t);
  }, [idx, reduced, paused]);

  const score = useCountUp(setup.confidence, stage >= 3, 900);
  const plotW = W - PAD_R;
  const step = plotW / (candles.length + 1);

  const lines = [
    { key: 'target', at: levels.target, label: 'TP', value: setup.prices.target, cls: 'is-target' },
    { key: 'entry', at: levels.entry, label: 'ENTRY', value: setup.prices.entry, cls: 'is-entry' },
    { key: 'stop', at: levels.stop, label: 'SL', value: setup.prices.stop, cls: 'is-stop' },
  ];

  const statusText =
    stage === 0
      ? 'Scanning 7 markets'
      : stage === 1
      ? 'Mapping market structure'
      : stage === 2
      ? 'Building the trade plan'
      : 'Passed the 75% confidence filter';

  return (
    <div
      className="rv-term"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="rv-term-bar">
        <div className="rv-term-tabs" role="tablist" aria-label="Example setups">
          {SETUPS.map((s, i) => (
            <button
              key={s.symbol}
              role="tab"
              aria-selected={i === idx}
              className={`rv-term-tab ${i === idx ? 'is-active' : ''}`}
              onClick={() => setIdx(i)}
            >
              {s.symbol}
            </button>
          ))}
        </div>
        <span className="rv-term-status" aria-live="polite">
          {statusText}
        </span>
      </div>

      <div className="rv-term-body">
        <div className="rv-term-chart">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Illustrative ${setup.pair} chart with entry, stop and target levels`}>
            {[0.2, 0.4, 0.6, 0.8].map((g) => (
              <line key={g} x1="0" x2={plotW} y1={yFor(g)} y2={yFor(g)} className="rv-grid-line" />
            ))}

            <g key={setup.symbol}>
              {candles.map((c, i) => {
                const x = step * (i + 1);
                const up = c.c >= c.o;
                const top = yFor(Math.max(c.o, c.c));
                const bottom = yFor(Math.min(c.o, c.c));
                return (
                  <g
                    key={i}
                    className={`rv-candle ${up ? 'is-up' : 'is-down'}`}
                    style={{ animationDelay: reduced ? '0ms' : `${i * 42}ms` }}
                  >
                    <line x1={x} x2={x} y1={yFor(c.h)} y2={yFor(c.l)} />
                    <rect x={x - 3.2} width="6.4" y={top} height={Math.max(1.5, bottom - top)} rx="0.8" />
                  </g>
                );
              })}
            </g>

            {/* Structure: support zone */}
            <g className={`rv-layer ${stage >= 1 ? 'is-on' : ''}`}>
              <rect
                x="0"
                y={yFor(levels.support) - 7}
                width={plotW}
                height="14"
                className="rv-support-zone"
              />
              <line x1="0" x2={plotW} y1={yFor(levels.support)} y2={yFor(levels.support)} className="rv-support-line" />
              <text x="6" y={yFor(levels.support) + 24} className="rv-chart-note">
                Support
              </text>
            </g>

            {/* Plan: entry, stop, target */}
            {lines.map((l, i) => (
              <g
                key={l.key}
                className={`rv-layer rv-plan ${l.cls} ${stage >= 2 ? 'is-on' : ''}`}
                style={{ transitionDelay: stage >= 2 ? `${i * 140}ms` : '0ms' }}
              >
                <line x1="0" x2={plotW} y1={yFor(l.at)} y2={yFor(l.at)} />
                <rect x={plotW + 4} y={yFor(l.at) - 9} width={PAD_R - 6} height="18" rx="3" />
                <text x={plotW + 4 + (PAD_R - 6) / 2} y={yFor(l.at) + 3.6} textAnchor="middle">
                  {l.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="rv-term-panel">
          <div className="rv-term-panel-head">
            <span className="rv-term-pair">{setup.pair}</span>
            <span className={`rv-side ${stage >= 3 ? 'is-on' : ''}`}>{setup.side}</span>
          </div>

          <div className="rv-score">
            <span className="rv-score-num">{stage >= 3 ? score : '--'}</span>
            <span className="rv-score-unit">% confidence</span>
          </div>

          <dl className="rv-levels">
            <div>
              <dt>Entry</dt>
              <dd>{stage >= 2 ? setup.prices.entry : '--'}</dd>
            </div>
            <div>
              <dt>Stop</dt>
              <dd className="is-neg">{stage >= 2 ? setup.prices.stop : '--'}</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd className="is-pos">{stage >= 2 ? setup.prices.target : '--'}</dd>
            </div>
            <div>
              <dt>Risk : reward</dt>
              <dd>{stage >= 2 ? setup.rr : '--'}</dd>
            </div>
          </dl>

          <p className={`rv-reason ${stage >= 3 ? 'is-on' : ''}`}>{setup.reasoning}</p>

          <button
            className={`rv-approve ${deployed ? 'is-done' : ''}`}
            disabled={stage < 3 || deployed}
            onClick={() => setDeployed(true)}
          >
            {deployed ? 'Placed in paper account' : 'Approve in paper mode'}
          </button>
        </div>
      </div>

      <div className="rv-term-foot">Illustrative simulation. Not live market data or financial advice.</div>
    </div>
  );
};

export default HeroTerminal;
