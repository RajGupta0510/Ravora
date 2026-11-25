import React, { useEffect, useState } from 'react';
import { useInView, usePrefersReducedMotion } from './hooks';

/** A settled confidence dial for the closing panel. Same instrument as the hero, at rest. */

const CX = 200;
const CY = 200;
const angleFor = (v: number) => -135 + 2.7 * v;
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
const S = pt(150, -135);
const E = pt(150, 135);
const ARC = `M ${S.x.toFixed(2)} ${S.y.toFixed(2)} A 150 150 0 1 1 ${E.x.toFixed(2)} ${E.y.toFixed(2)}`;

export const Dial: React.FC<{ value?: number; className?: string }> = ({ value = 82, className = '' }) => {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [v, setV] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setV(value);
      return;
    }
    const t = window.setTimeout(() => setV(value), 250);
    return () => window.clearTimeout(t);
  }, [inView, reduced, value]);

  return (
    <div ref={ref} className={`rv-dial-static ${className}`}>
      <svg viewBox="0 0 400 400" role="img" aria-label={`Confidence dial settled at ${value}`}>
        <circle cx={CX} cy={CY} r="196" className="rv-dial-bezel" />
        <circle cx={CX} cy={CY} r="188" className="rv-dial-face" />
        {TICKS.map((t) => (
          <line key={t.v} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className={`rv-tick ${t.major ? 'is-major' : ''} ${t.v <= v ? 'is-lit' : ''}`} />
        ))}
        <path d={ARC} className="rv-arc-track" pathLength={100} />
        <path d={ARC} className="rv-arc-fill" pathLength={100} style={{ strokeDasharray: `${Math.max(0.01, v)} 100` }} />
        {LABELS.map((l) => (
          <text key={l.v} x={l.x} y={l.y + 4} textAnchor="middle" className="rv-dial-num">
            {l.v}
          </text>
        ))}
        <g className="rv-hand" style={{ transform: `rotate(${angleFor(v)}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
          <line x1={CX} y1={CY + 26} x2={CX} y2={CY - 128} />
          <circle cx={CX} cy={CY + 30} r="5" />
        </g>
        <circle cx={CX} cy={CY} r="11" className="rv-jewel" />
        <circle cx={CX} cy={CY} r="4" className="rv-jewel-core" />
        <text x={CX} y={CY + 78} textAnchor="middle" className="rv-dial-big">
          {value}
        </text>
      </svg>
    </div>
  );
};

export default Dial;
