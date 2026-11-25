import React from 'react';

/**
 * The Araiven "movement": three gears that really mesh, and a train of six jewels, one per gate.
 * Gear rotation is scroll-linked through the --p custom property set on an ancestor (0 to 1);
 * `count` (0 to 6) is how many gates have engaged and lights the jewels.
 *
 * Meshing is computed, not eyeballed: centre distance = sum of pitch radii (mid-tooth radii),
 * and each gear's tooth phase is set so a tooth of one sits in a gap of the other on the
 * line of centres.
 */

type GearSpec = { teeth: number; ro: number; ri: number };

function gearPath(cx: number, cy: number, g: GearSpec, phase: number): string {
  const step = (Math.PI * 2) / g.teeth;
  const pts: string[] = [];
  for (let i = 0; i < g.teeth; i++) {
    const a = phase + i * step;
    const p = (r: number, off: number) => {
      const t = a + off * step;
      return `${(cx + r * Math.cos(t)).toFixed(2)},${(cy + r * Math.sin(t)).toFixed(2)}`;
    };
    pts.push(p(g.ri, 0), p(g.ro, 0.12), p(g.ro, 0.38), p(g.ri, 0.5));
  }
  return `M ${pts.join(' L ')} Z`;
}

const pitch = (g: GearSpec) => (g.ro + g.ri) / 2;
const deg = (d: number) => (d * Math.PI) / 180;

const G1: GearSpec = { teeth: 18, ro: 100, ri: 86 };
const G2: GearSpec = { teeth: 12, ro: 66, ri: 53 };
const G3: GearSpec = { teeth: 14, ro: 80, ri: 66 };

// Gear 1 sits at the origin of the train. Gear 2 is up-right (screen angle -35 degrees);
// gear 3 is down-right at -35 + 3 teeth of gear 1 (3 * 20 = 60) = +25 degrees, so a gear-1
// tooth is on the line of centres for both neighbours.
const A12 = deg(-35);
const A13 = deg(25);
const C1 = { x: 130, y: 172 };
const C2 = { x: C1.x + (pitch(G1) + pitch(G2)) * Math.cos(A12), y: C1.y + (pitch(G1) + pitch(G2)) * Math.sin(A12) };
const C3 = { x: C1.x + (pitch(G1) + pitch(G3)) * Math.cos(A13), y: C1.y + (pitch(G1) + pitch(G3)) * Math.sin(A13) };

const step1 = (Math.PI * 2) / G1.teeth;
const step2 = (Math.PI * 2) / G2.teeth;
const step3 = (Math.PI * 2) / G3.teeth;
// tooth centre sits at phase + 0.25 * step; gap centre at phase + 0.75 * step
const P1 = A12 - 0.25 * step1;
const P2 = A12 + Math.PI - 0.75 * step2;
const P3 = A13 + Math.PI - 0.75 * step3;

const GEARS = [
  { c: C1, g: G1, phase: P1, k: 1 },
  { c: C2, g: G2, phase: P2, k: -(G1.teeth / G2.teeth) },
  { c: C3, g: G3, phase: P3, k: -(G1.teeth / G3.teeth) },
];

const JEWELS = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 52 + i * 62, y: 352 }));

export const Movement: React.FC<{ count: number }> = ({ count }) => (
  <svg viewBox="0 0 420 372" className="rv-movement-svg" role="img" aria-label={`Araiven movement with ${count} of 6 gates engaged`}>
    {GEARS.map(({ c, g, phase, k }, gi) => (
      <g key={gi} className="rv-gear" style={{ ['--k' as string]: k, transformOrigin: `${c.x}px ${c.y}px` }}>
        <path d={gearPath(c.x, c.y, g, phase)} className="rv-gear-body" />
        <circle cx={c.x} cy={c.y} r={g.ri * 0.62} className="rv-gear-hole" />
        {[0, 1, 2, 3].map((s) => {
          const a = (s * Math.PI) / 2 + 0.4;
          return (
            <line
              key={s}
              x1={c.x + g.ri * 0.18 * Math.cos(a)}
              y1={c.y + g.ri * 0.18 * Math.sin(a)}
              x2={c.x + g.ri * 0.62 * Math.cos(a)}
              y2={c.y + g.ri * 0.62 * Math.sin(a)}
              className="rv-gear-spoke"
            />
          );
        })}
        <circle cx={c.x} cy={c.y} r={g.ri * 0.16} className="rv-gear-hub" />
      </g>
    ))}
    <line x1="30" y1="352" x2="390" y2="352" className="rv-train" />
    {JEWELS.map((j, i) => (
      <g key={i}>
        <circle cx={j.x} cy={j.y} r="11" className="rv-jewel-seat" />
        <circle cx={j.x} cy={j.y} r="6.5" className={`rv-jewel-stone ${count > i ? 'is-lit' : ''}`} />
      </g>
    ))}
  </svg>
);

export default Movement;
