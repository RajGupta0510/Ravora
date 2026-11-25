import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCountUp, useInView, usePrefersReducedMotion } from './hooks';

interface Script {
  prompt: string;
  steps: string[];
  title: string;
  score: number;
  filtered?: boolean;
  rows: [string, string][];
  why: string;
}

const SCRIPTS: Script[] = [
  {
    prompt: 'Find a low-risk yield for my idle USDC',
    steps: ['Scanning 12 stablecoin pools', 'Checking your 1.5% drawdown cap', 'Scoring 4 candidates'],
    title: 'Stablecoin yield rotation',
    score: 91,
    rows: [
      ['Suggested size', '20% of cash reserve'],
      ['Expected yield', '6.5% to 9.2% APY'],
      ['Risk rating', 'Low'],
      ['Price exposure added', 'None'],
    ],
    why: 'Lending rates on Aave and Uniswap pools sit more than 1.5% APY above your baseline cash yield, and the move adds no price exposure.',
  },
  {
    prompt: 'Is SOL worth buying right now?',
    steps: ['Reading SOL market structure', 'Checking volume confirmation', 'Scoring the setup'],
    title: 'SOL / USD',
    score: 71,
    filtered: true,
    rows: [
      ['Confidence', '71%  (needs 75%)'],
      ['Structure', 'Range-bound'],
      ['Volume confirmation', 'Weak'],
      ['Shown as a trade', 'No'],
    ],
    why: 'Araiven will not suggest this trade yet. Volume is not confirming the breakout. You will be alerted if the score clears the 75% filter.',
  },
  {
    prompt: 'Am I safe if the Fed surprises the market?',
    steps: ['Stress-testing the portfolio', 'Modelling a rate shock', 'Comparing with your 3.5% cap'],
    title: 'Safety review',
    score: 96,
    rows: [
      ['Worst-case 24h move', '-2.1%'],
      ['Your drawdown cap', '3.5%'],
      ['Buffer remaining', '1.4%'],
      ['Action needed', 'None'],
    ],
    why: 'A rate shock would take about 2.1% off the portfolio, which is inside your 3.5% cap. No change is needed right now.',
  },
];

export const AskAraiven: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [sel, setSel] = useState(0);
  const [shown, setShown] = useState(0); // tape lines shown; > steps.length means the answer is visible
  const navigate = useNavigate();
  const timers = useRef<number[]>([]);

  const script = SCRIPTS[sel];
  const answered = shown > script.steps.length;
  const score = useCountUp(script.score, answered, 800);

  useEffect(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    if (!inView) {
      setShown(0);
      return;
    }
    if (reduced) {
      setShown(script.steps.length + 1);
      return;
    }
    setShown(0);
    for (let i = 1; i <= script.steps.length + 1; i++) {
      timers.current.push(window.setTimeout(() => setShown(i), 500 + i * 750));
    }
    return () => timers.current.forEach(window.clearTimeout);
  }, [sel, inView, reduced, script.steps.length]);

  return (
    <div className="rv-split" ref={ref}>
      <div>
        <h2 className="rv-h2">Ask in plain English. Get a plan with receipts.</h2>
        <p className="rv-lead">
          Araiven turns a question into a scored answer. If a setup does not clear the bar, it tells you so instead of
          guessing.
        </p>
        <div className="rv-prompts" role="tablist" aria-label="Example questions">
          {SCRIPTS.map((s, i) => (
            <button
              key={s.prompt}
              role="tab"
              aria-selected={sel === i}
              className={`rv-prompt ${sel === i ? 'is-active' : ''}`}
              onClick={() => setSel(i)}
            >
              <span>{s.prompt}</span>
              <span className="rv-arrow" aria-hidden="true">
                <ArrowRight size={18} strokeWidth={2} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rv-chat" aria-live="polite">
        <div className="rv-bubble-you">{script.prompt}</div>

        {shown > 0 && (
          <ul className="rv-tape">
            {script.steps.slice(0, Math.min(shown, script.steps.length)).map((s, i) => (
              <li key={s} className={shown > i + 1 ? 'is-ok' : ''}>
                <b>{shown > i + 1 ? 'done' : 'run '}</b>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        )}

        {answered && (
          <div className={`rv-plan-card ${script.filtered ? 'is-filtered' : ''}`}>
            <div className="rv-plan-head">
              <h3>{script.title}</h3>
              <div className="rv-score">
                <span className="rv-score-num">{score}</span>
                <span className="rv-score-unit">{script.filtered ? 'below filter' : 'confidence'}</span>
              </div>
            </div>
            <dl className="rv-plan-rows">
              {script.rows.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <p className="rv-plan-why">{script.why}</p>
            <div className="rv-plan-actions">
              <button className="rv-btn rv-btn-primary" onClick={() => navigate('/auth/register')}>
                {script.filtered ? 'Get an alert at 75%' : 'Try it in a paper account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskAraiven;
