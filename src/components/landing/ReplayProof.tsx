import React, { useMemo, useState } from 'react';

/**
 * "Proof" for the claim that Araiven's score can be read and repeated: a small, honest calculator.
 * It uses the same three inputs and weights as the BTC receipt in the gates section above, so the
 * sample case lands on the same 82. Everything here is illustrative; nothing is live data.
 */

type Inputs = [number, number, number];

const FACTORS: { key: string; label: string; weight: number }[] = [
  { key: 'macro', label: 'Macro confluence', weight: 0.4 },
  { key: 'liquidity', label: 'Liquidity depth', weight: 0.4 },
  { key: 'sentiment', label: 'Sentiment inflow', weight: 0.2 },
];

const CASES: { label: string; values: Inputs }[] = [
  { label: 'The BTC plan', values: [0.88, 0.8, 0.74] },
  { label: 'Thin liquidity', values: [0.88, 0.35, 0.74] },
  { label: 'Sentiment flips', values: [0.88, 0.8, 0.12] },
];

const FILTER = 75;
const fmt = (n: number) => n.toFixed(2);

export const ReplayProof: React.FC<{ Reveal: React.ComponentType<{ children: React.ReactNode; delay?: number; kind?: 'rise' | 'wipe' | 'pop' }> }> = ({ Reveal }) => {
  const [values, setValues] = useState<Inputs>(CASES[0].values);
  const [runs, setRuns] = useState(1);

  const { score, working, weakest } = useMemo(() => {
    const sum = values.reduce((acc, v, i) => acc + v * FACTORS[i].weight, 0);
    const lowest = values.reduce((li, v, i) => (v < values[li] ? i : li), 0);
    return {
      score: Math.round(sum * 100),
      working: values.map((v, i) => `${fmt(v)} × ${FACTORS[i].weight}`).join(' + ') + ` = ${fmt(sum)}`,
      weakest: FACTORS[lowest].label,
    };
  }, [values]);

  const passes = score >= FILTER;
  const set = (i: number, v: number) => {
    setValues((prev) => prev.map((p, k) => (k === i ? v : p)) as Inputs);
    setRuns(1);
  };
  const pick = (v: Inputs) => {
    setValues(v);
    setRuns(1);
  };

  return (
    <section id="replay" className="rv-section rv-section--tight">
      <div className="rv-wrap">
        <Reveal kind="wipe">
          <h2 className="rv-h2">Change an input. Watch the score move.</h2>
          <p className="rv-lead">
            The same inputs give the same score every time. Drag a slider or pick a case to see which input pushes a plan over, or under,
            the 75% filter.
          </p>
        </Reveal>

        <div className="rv-replay">
          <Reveal delay={60}>
            <div className="rv-replay-controls">
              <div className="rv-replay-cases" role="group" aria-label="Sample cases">
                {CASES.map((c) => {
                  const active = c.values.every((v, i) => v === values[i]);
                  return (
                    <button key={c.label} type="button" aria-pressed={active} onClick={() => pick(c.values)}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {FACTORS.map((f, i) => (
                <div className="rv-replay-field" key={f.key}>
                  <label htmlFor={`rv-in-${f.key}`}>
                    <span>{f.label}</span>
                    <span className="rv-data">
                      {fmt(values[i])} <i>× {f.weight}</i>
                    </span>
                  </label>
                  <input
                    id={`rv-in-${f.key}`}
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={values[i]}
                    onChange={(e) => set(i, Number(e.target.value))}
                    aria-valuetext={`${fmt(values[i])} out of 1`}
                  />
                </div>
              ))}
              <p className="rv-replay-note">
                Sample inputs and the weights from the BTC receipt above. Illustrative only: not live data, and no score predicts a return.
              </p>
            </div>
          </Reveal>

          <Reveal kind="pop" delay={140}>
            <div className="rv-case rv-replay-out">
              <div className="rv-replay-top">
                <span>Confidence score</span>
                <b className={`rv-data ${passes ? 'is-pass' : 'is-fail'}`} aria-live="polite" aria-atomic="true">
                  {score}%
                </b>
              </div>
              <div className="rv-replay-bar" aria-hidden="true">
                <i style={{ width: `${score}%` }} className={passes ? 'is-pass' : 'is-fail'} />
                <em style={{ left: `${FILTER}%` }}>
                  <span>75% filter</span>
                </em>
              </div>
              <p className={`rv-replay-verdict ${passes ? 'is-pass' : 'is-fail'}`}>
                {passes ? 'Passes the 75% filter. Shown to you with its reason.' : `Below the 75% filter. Never shown to you. Weakest input: ${weakest}.`}
              </p>
              <div className="rv-replay-work">
                <span>The working</span>
                <code className="rv-data">{working}</code>
              </div>
              <div className="rv-replay-again">
                <button type="button" className="rv-btn rv-btn-ghost rv-btn-sm" onClick={() => setRuns((n) => n + 1)}>
                  Run it again
                </button>
                <p aria-live="polite">
                  {runs === 1 ? 'Run 1.' : `Run ${runs}: ${score}%. Identical to run ${runs - 1}.`}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ReplayProof;
