import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountUp, usePrefersReducedMotion, useTyped } from './hooks';

type Stage = 0 | 1 | 2 | 3;

interface Setup {
  symbol: string;
  pair: string;
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
    confidence: 82,
    rr: '1 : 2.4',
    reasoning:
      'Price holds structural support and momentum is rising. Orderbook depth backs the entry, and the stop sits below the last swing low.',
    seed: 7,
    drift: 0.55,
    prices: { entry: '64,120', stop: '61,870', target: '69,480' },
  },
  {
    symbol: 'ETH',
    pair: 'ETH / USD',
    confidence: 79,
    rr: '1 : 2.1',
    reasoning:
      'Consolidation resolved above the 50 EMA on rising volume. The risk cushion fits a Balanced stance with room to spare.',
    seed: 19,
    drift: 0.4,
    prices: { entry: '3,462', stop: '3,318', target: '3,790' },
  },
  {
    symbol: 'SOL',
    pair: 'SOL / USD',
    confidence: 76,
    rr: '1 : 2.6',
    reasoning:
      'A higher low formed on rising volume. It clears the 75% confidence filter, so it is shown. Size is capped by your drawdown limit.',
    seed: 41,
    drift: 0.62,
    prices: { entry: '168.40', stop: '159.10', target: '192.70' },
  },
];

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

function buildCandles(seed: number, drift: number, count = 34): Candle[] {
  const rand = mulberry32(seed);
  const out: Candle[] = [];
  let price = 0.52;
  for (let i = 0; i < count; i++) {
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

/* ---- dial geometry: 270 degrees, 0 at the lower left, 100 at the lower right ---- */
const CX = 200;
const CY = 200;
const angleFor = (v: number) => -135 + 2.7 * v; // degrees clockwise from twelve o'clock
const pt = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
};

const TICKS = Array.from({ length: 51 }, (_, i) => {
  const v = i * 2;
  const major = i % 5 === 0;
  const a = angleFor(v);
  const p1 = pt(major ? 164 : 170, a);
  const p2 = pt(180, a);
  return { v, major, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
});
const LABELS = [0, 25, 50, 75, 100].map((v) => ({ v, ...pt(126, angleFor(v)) }));
const ARC_START = pt(150, -135);
const ARC_END = pt(150, 135);
const ARC_D = `M ${ARC_START.x.toFixed(2)} ${ARC_START.y.toFixed(2)} A 150 150 0 1 1 ${ARC_END.x.toFixed(2)} ${ARC_END.y.toFixed(2)}`;
const THRESH = pt(190, angleFor(75));
const THRESH_A = pt(176, angleFor(75));

const CW = 440;
const CH = 120;
const yFor = (v: number) => 8 + (1 - v) * (CH - 16);

export const HeroInstrument: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [stage, setStage] = useState<Stage>(reduced ? 3 : 0);
  const [needle, setNeedle] = useState(reduced ? SETUPS[0].confidence : 0);
  const [paused, setPaused] = useState(false);
  const navigate = useNavigate();

  const setup = SETUPS[idx];
  const { candles, levels } = useMemo(() => {
    const raw = buildCandles(setup.seed, setup.drift);
    const lo = Math.min(...raw.map((c) => c.l));
    const hi = Math.max(...raw.map((c) => c.h));
    const map = (v: number) => 0.1 + ((v - lo) / (hi - lo)) * 0.62;
    const norm = raw.map((c) => ({ o: map(c.o), h: map(c.h), l: map(c.l), c: map(c.c) }));
    const support = Math.min(...norm.map((c) => c.l)) + 0.02;
    const entry = norm[norm.length - 1].c;
    const stop = Math.max(0.04, support - 0.07);
    const target = Math.min(0.95, entry + (entry - stop) * parseFloat(setup.rr.split(':')[1]));
    return { candles: norm, levels: { entry, stop, target } };
  }, [setup]);

  useEffect(() => {
    if (reduced) {
      setStage(3);
      setNeedle(setup.confidence);
      return;
    }
    setStage(0);
    setNeedle(6);
    const timers = [
      window.setTimeout(() => setNeedle(46), 420),
      window.setTimeout(() => setNeedle(24), 900),
      window.setTimeout(() => setNeedle(61), 1350),
      window.setTimeout(() => setStage(1), 1500),
      window.setTimeout(() => setStage(2), 2300),
      window.setTimeout(() => {
        setStage(3);
        setNeedle(setup.confidence);
      }, 3100),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [idx, reduced, setup.confidence]);

  useEffect(() => {
    if (reduced || paused) return;
    const t = window.setTimeout(() => setIdx((i) => (i + 1) % SETUPS.length), 10500);
    return () => window.clearTimeout(t);
  }, [idx, reduced, paused]);

  const score = useCountUp(setup.confidence, stage >= 3, 1100);
  const typed = useTyped(setup.reasoning, stage >= 3, 15);
  const step = CW / (candles.length + 1);

  const status =
    stage === 0 ? 'Scanning 7 markets' : stage === 1 ? 'Reading market structure' : stage === 2 ? 'Drafting the plan' : 'Passed the 75% filter';

  return (
    <div
      className="rv-case rv-inst"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="rv-inst-top">
        <span className="rv-inst-title">Araiven instrument</span>
        <span className="rv-inst-status" aria-live="polite">
          {status}
        </span>
      </div>

      <div className="rv-dial-wrap">
        <svg viewBox="0 0 400 400" className="rv-dial" role="img" aria-label={`Confidence dial reading ${stage >= 3 ? setup.confidence : 'pending'} for ${setup.pair}`}>
          <circle cx={CX} cy={CY} r="196" className="rv-dial-bezel" />
          <circle cx={CX} cy={CY} r="188" className="rv-dial-face" />
          {TICKS.map((t) => (
            <line
              key={t.v}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              className={`rv-tick ${t.major ? 'is-major' : ''} ${t.v <= needle ? 'is-lit' : ''}`}
            />
          ))}
          <path d={ARC_D} className="rv-arc-track" pathLength={100} />
          <path
            d={ARC_D}
            className="rv-arc-fill"
            pathLength={100}
            style={{ strokeDasharray: `${Math.max(0.01, needle)} 100` }}
          />
          {LABELS.map((l) => (
            <text key={l.v} x={l.x} y={l.y + 4} textAnchor="middle" className="rv-dial-num">
              {l.v}
            </text>
          ))}
          {/* the 75 filter marker */}
          <polygon
            points={`${THRESH.x},${THRESH.y} ${THRESH_A.x - 5},${THRESH_A.y - 3} ${THRESH_A.x + 5},${THRESH_A.y + 3}`}
            className="rv-thresh"
            transform={`rotate(0 ${THRESH.x} ${THRESH.y})`}
          />
          <g className="rv-hand" style={{ transform: `rotate(${angleFor(needle)}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
            <line x1={CX} y1={CY + 26} x2={CX} y2={CY - 128} />
            <circle cx={CX} cy={CY + 30} r="5" />
          </g>
          <circle cx={CX} cy={CY} r="11" className="rv-jewel" />
          <circle cx={CX} cy={CY} r="4" className="rv-jewel-core" />
        </svg>

        <div className="rv-dial-read">
          <span className="rv-dial-score">{stage >= 3 ? score : '--'}</span>
          <span className="rv-dial-unit">confidence</span>
        </div>
      </div>

      <div className="rv-strip">
        <svg viewBox={`0 0 ${CW} ${CH}`} aria-label={`Illustrative ${setup.pair} candles with entry, stop and target`} role="img">
          <g key={setup.symbol}>
            {candles.map((c, i) => {
              const x = step * (i + 1);
              const up = c.c >= c.o;
              const top = yFor(Math.max(c.o, c.c));
              const bottom = yFor(Math.min(c.o, c.c));
              return (
                <g key={i} className={`rv-candle ${up ? 'is-up' : 'is-down'}`} style={{ animationDelay: reduced ? '0ms' : `${i * 36}ms` }}>
                  <line x1={x} x2={x} y1={yFor(c.h)} y2={yFor(c.l)} />
                  <rect x={x - 3} width="6" y={top} height={Math.max(1.5, bottom - top)} rx="0.8" />
                </g>
              );
            })}
          </g>
          {([
            ['target', levels.target, 'is-target'],
            ['entry', levels.entry, 'is-entry'],
            ['stop', levels.stop, 'is-stop'],
          ] as const).map(([k, v, cls], i) => (
            <line
              key={k}
              x1="0"
              x2={CW}
              y1={yFor(v)}
              y2={yFor(v)}
              className={`rv-lvl ${cls} ${stage >= 2 ? 'is-on' : ''}`}
              style={{ transitionDelay: stage >= 2 ? `${i * 140}ms` : '0ms' }}
            />
          ))}
        </svg>
      </div>

      <dl className="rv-plan-grid">
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

      <p className={`rv-inst-reason ${stage >= 3 && typed.length < setup.reasoning.length ? 'rv-caret' : ''}`}>{stage >= 3 ? typed : ''}</p>

      <div className="rv-inst-foot">
        <div className="rv-pairs" role="tablist" aria-label="Example setups">
          {SETUPS.map((s, i) => (
            <button key={s.symbol} role="tab" aria-selected={i === idx} className={`rv-pair ${i === idx ? 'is-active' : ''}`} onClick={() => setIdx(i)}>
              {s.symbol}
            </button>
          ))}
        </div>
        <button className="rv-approve" disabled={stage < 3} onClick={() => navigate('/auth/register')}>
          Try this in a paper account
        </button>
      </div>
      <p className="rv-inst-note">Illustrative simulation. Not live market data or financial advice.</p>
    </div>
  );
};

export default HeroInstrument;
