import re

# ===================== hero dial labels inside the track =====================
p = 'src/components/landing/HeroInstrument.tsx'
s = open(p, encoding='utf8').read()
s = s.replace("const LABELS = [0, 25, 50, 75, 100].map((v) => ({ v, ...pt(140, angleFor(v)) }));",
              "const LABELS = [0, 25, 50, 75, 100].map((v) => ({ v, ...pt(126, angleFor(v)) }));")
open(p, 'w', encoding='utf8').write(s)

# ===================== CSS =====================
p = 'src/components/landing/landing.css'
s = open(p, encoding='utf8').read()

# a) reveal: visible by default; each kind has its own authored entrance
old = s[s.index('/* ---------- Reveal'):s.index('/* ---------- Buttons ---------- */')]
new = """/* ---------- Reveal: content is visible by default; script only adds .is-in, and each kind
   has its own entrance (headline line-wipe, panel rise-and-scale, plain rise). ---------- */
.rv-reveal.is-in {
  animation: rv-up 0.85s var(--ease) var(--rv-delay, 0ms) backwards;
}
.rv-reveal.k-wipe.is-in { animation-name: rv-wipe; animation-duration: 1s; }
.rv-reveal.k-pop.is-in { animation-name: rv-pop; animation-duration: 1s; }
@keyframes rv-up { from { opacity: 0; transform: translateY(24px); } }
@keyframes rv-wipe {
  from { opacity: 0; clip-path: inset(0 0 100% 0); transform: translateY(22px); }
  to { opacity: 1; clip-path: inset(0 0 0 0); transform: none; }
}
@keyframes rv-pop { from { opacity: 0; transform: translateY(28px) scale(0.965); } }
.rv-facts.is-in > div,
.rv-faq.is-in > .rv-faq-item { animation: rv-up 0.8s var(--ease) backwards; }
.rv-facts.is-in > div:nth-child(2), .rv-faq.is-in > .rv-faq-item:nth-child(2) { animation-delay: 0.1s; }
.rv-facts.is-in > div:nth-child(3), .rv-faq.is-in > .rv-faq-item:nth-child(3) { animation-delay: 0.2s; }
.rv-faq.is-in > .rv-faq-item:nth-child(4) { animation-delay: 0.3s; }
.rv-faq.is-in > .rv-faq-item:nth-child(5) { animation-delay: 0.4s; }

"""
s = s.replace(old, new)

# b) scroll-linked gears
s = s.replace(".rv-gear { transition: transform 1.3s var(--ease); }",
              ".rv-gear { transform: rotate(calc(var(--p, 0) * var(--k, 1) * 300deg)); transition: transform 0.35s linear; }")

# d) roadmap: staggered phases, big numerals, per-phase rule that draws on
old = s[s.index('/* ---------- Roadmap: calibration track ---------- */'):s.index('/* ---------- FAQ ---------- */')]
new = """/* ---------- Roadmap: staggered calibration steps ---------- */
.rv-road { margin-top: 72px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 32px; align-items: start; padding-bottom: 8px; }
.rv-phase { margin-top: calc(var(--i) * 38px); }
.rv-phase::before {
  content: '';
  display: block;
  height: 2px;
  background: var(--rs);
  transform-origin: left;
}
.rv-phase.is-now::before { background: var(--amber); height: 3px; }
.rv-road.is-drawn .rv-phase::before { animation: rv-draw 1.1s var(--ease) calc(var(--i) * 0.28s) backwards; }
@keyframes rv-draw { from { transform: scaleX(0); } }
.rv-road.is-drawn .rv-phase > * { animation: rv-up 0.8s var(--ease) calc(var(--i) * 0.28s + 0.25s) backwards; }
.rv-phase-n { display: block; margin-top: 14px; font: 650 clamp(3rem, 5vw, 4.4rem) / 0.95 var(--display); letter-spacing: -0.05em; color: var(--r); }
.rv-phase.is-now .rv-phase-n { color: var(--amber); }
.rv-phase h3 { margin-top: 12px; font-size: 1.4rem; letter-spacing: -0.025em; }
.rv-phase ul { margin: 14px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.rv-phase li { font-size: 0.98rem; color: var(--m); padding-left: 18px; position: relative; }
.rv-phase li::before { content: ''; position: absolute; left: 0; top: 0.72em; width: 8px; height: 2px; background: var(--m); }

"""
s = s.replace(old, new)

# f) CTA: the settled dial replaces the empty rings
old = s[s.index('.rv-rings i {'):s.index('.rv-cta .rv-wrap { position: relative; }')]
new = """.rv-cta-dial {
  position: absolute;
  right: clamp(24px, 6vw, 110px);
  top: 50%;
  width: min(40vw, 460px);
  transform: translateY(-50%);
  pointer-events: none;
}
.rv-cta-dial svg { display: block; width: 100%; height: auto; }
.rv-dial-big { fill: #f8fafc; font: 600 64px var(--mono); letter-spacing: -0.06em; }
"""
s = s.replace(old, new)
s = s.replace("  .rv-rings i { right: -40%; }\n", "  .rv-cta-dial { display: none; }\n")
s = s.replace(".rv-marq-track, .rv-rings i { animation: none; }\n  .rv-rings i { opacity: 0.4; transform: scale(0.8); }\n", ".rv-marq-track { animation: none; }\n")
s = s.replace("  .rv-road::before { transform: scaleX(1); transition: none; }\n", "")
s = s.replace("  .rv-reveal, .rv-hero-copy > *, .rv-hero-inst, .rv-phase { opacity: 1; transform: none; animation: none; transition: none; }",
              "  .rv-reveal.is-in, .rv-hero-copy > *, .rv-hero-inst, .rv-facts.is-in > div, .rv-faq.is-in > .rv-faq-item { animation: none; }\n  .rv-road.is-drawn .rv-phase::before, .rv-road.is-drawn .rv-phase > * { animation: none; }")
s = s.replace("  .rv-gear, .rv-hand, .rv-arc-fill { transition: none; }", "  .rv-gear, .rv-hand, .rv-arc-fill { transition: none; }\n  .rv-gear { transform: none; }")
# the old per-phase hidden state
s = s.replace("opacity: 0; transform: translateY(14px); transition: opacity 0.8s var(--ease), transform 0.8s var(--ease); transition-delay: calc(var(--i) * 0.38s + 0.3s);", "")

# e) risk head + gauge, event rail, FAQ sticky, scrollbar
s += """

/* ---------- Risk head + cap gauge ---------- */
.rv-risk-head { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 32px 72px; align-items: end; }
.rv-risk-head .rv-seg { justify-self: end; }
.rv-gauge { margin-top: 28px; max-width: 360px; }
.rv-gauge svg { display: block; width: 100%; height: auto; overflow: visible; }
.rv-gauge-track { fill: none; stroke: rgba(11, 14, 20, 0.2); stroke-width: 6; stroke-linecap: round; }
.rv-gauge-fill { fill: none; stroke: var(--ink); stroke-width: 6; stroke-linecap: round; transition: stroke-dasharray 0.9s var(--ease); }
.rv-gauge-tick { stroke: var(--ink); stroke-width: 1.5; opacity: 0.55; }
.rv-gauge-tick.is-major { stroke-width: 2.4; opacity: 1; }
.rv-gauge-num { fill: var(--ink); font: 500 10px var(--mono); }
.rv-gauge-hand { transition: transform 0.9s var(--ease); }
.rv-gauge-hand line { stroke: var(--ink); stroke-width: 3; stroke-linecap: round; }
.rv-gauge-hub { fill: var(--ink); }
.rv-gauge-stance { fill: var(--amber); stroke: var(--ink); stroke-width: 2; transition: r 0.4s var(--ease); }

/* ---------- Event tape progress rail ---------- */
.rv-events-rail { margin-top: 40px; height: 3px; background: var(--r); overflow: hidden; border-radius: 3px; }
.rv-events-rail i { display: block; height: 100%; background: var(--amber); transform-origin: left; transition: transform 1.2s var(--ease); }
.rv-events { margin-top: 20px; }

/* ---------- FAQ: sticky help column ---------- */
.rv-split--faq > :first-child { position: sticky; top: 120px; align-self: start; }
.rv-split--faq .rv-lead { margin-top: 18px; }

/* ---------- Themed scrollbar (the page scrolls on paper and ink) ---------- */
html:has(.rv) { scrollbar-color: #5a6578 #eef1f5; scrollbar-width: thin; }
html:has(.rv)::-webkit-scrollbar { width: 11px; }
html:has(.rv)::-webkit-scrollbar-track { background: #eef1f5; }
html:has(.rv)::-webkit-scrollbar-thumb { background: rgba(11, 14, 20, 0.32); border-radius: 8px; border: 2px solid #eef1f5; }
html:has(.rv)::-webkit-scrollbar-thumb:hover { background: #b45309; }
@media (max-width: 1040px) {
  .rv-risk-head { grid-template-columns: minmax(0, 1fr); }
  .rv-risk-head .rv-seg { justify-self: start; }
  .rv-split--faq > :first-child { position: static; }
}
"""
open(p, 'w', encoding='utf8').write(s)

# ===================== LandingPage.tsx =====================
p = 'src/components/landing/LandingPage.tsx'
s = open(p, encoding='utf8').read()

s = s.replace("import Movement from './Movement';", "import Movement from './Movement';\nimport Dial from './Dial';")

# Reveal kinds
s = s.replace("const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; as?: 'div' | 'li' }> = ({\n  children,\n  delay = 0,\n  className = '',\n  as: Tag = 'div',\n}) => {",
              "const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; as?: 'div' | 'li'; kind?: 'rise' | 'wipe' | 'pop' }> = ({\n  children,\n  delay = 0,\n  className = '',\n  as: Tag = 'div',\n  kind = 'rise',\n}) => {")
s = s.replace("className={`rv-reveal ${inView ? 'is-in' : ''} ${className}`}", "className={`rv-reveal k-${kind} ${inView ? 'is-in' : ''} ${className}`}")
# headlines wipe
s = re.sub(r"<Reveal( delay=\{\d+\})?>(\s*\n\s*<h2)", lambda m: "<Reveal kind=\"wipe\"" + (m.group(1) or "") + ">" + m.group(2), s)
# panels pop
for needle in ["<Reveal delay={60}>\n            <Movement", "<Reveal delay={140}>\n            <div className=\"rv-cert rv-receipt\"", "<Reveal delay={80}>\n              <PlatformTabs />", "<Reveal delay={120}>\n              <div className=\"rv-equity\">", "<Reveal delay={120}>\n              <div className=\"rv-cert rv-keycheck\">"]:
    if needle in s:
        s = s.replace(needle, needle.replace("<Reveal", "<Reveal kind=\"pop\"", 1))

# facts / faq containers get the in-view class for stagger
s = s.replace('<div className="rv-facts">', '<div className={`rv-facts ${factsView.inView ? \'is-in\' : \'\'}`} ref={factsView.ref}>')
s = s.replace('<div className="rv-faq">', '<div className={`rv-faq ${faqView.inView ? \'is-in\' : \'\'}`} ref={faqView.ref}>')
s = s.replace("  const road = useInView<HTMLDivElement>(0.3);", "  const road = useInView<HTMLDivElement>(0.3);\n  const factsView = useInView<HTMLDivElement>(0.2);\n  const faqView = useInView<HTMLDivElement>(0.2);")

# gates: scroll-linked rotation
s = s.replace("  const refs = useRef<(HTMLLIElement | null)[]>([]);\n\n  useEffect(() => {\n    if (typeof IntersectionObserver === 'undefined') {\n      setLit(GATES.map(() => true));",
              "  const refs = useRef<(HTMLLIElement | null)[]>([]);\n  const sectionRef = useRef<HTMLElement | null>(null);\n  const listRef = useRef<HTMLOListElement | null>(null);\n\n  // Scroll-linked gear rotation: --p runs 0 to 1 as the gate list passes through the viewport.\n  useEffect(() => {\n    let raf = 0;\n    const update = () => {\n      raf = 0;\n      const el = listRef.current;\n      const sec = sectionRef.current;\n      if (!el || !sec) return;\n      const r = el.getBoundingClientRect();\n      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / (r.height + window.innerHeight * 0.2)));\n      sec.style.setProperty('--p', p.toFixed(4));\n    };\n    const onScroll = () => {\n      if (!raf) raf = requestAnimationFrame(update);\n    };\n    update();\n    window.addEventListener('scroll', onScroll, { passive: true });\n    window.addEventListener('resize', onScroll);\n    return () => {\n      window.removeEventListener('scroll', onScroll);\n      window.removeEventListener('resize', onScroll);\n      if (raf) cancelAnimationFrame(raf);\n    };\n  }, []);\n\n  useEffect(() => {\n    if (typeof IntersectionObserver === 'undefined') {\n      setLit(GATES.map(() => true));")
s = s.replace('<section id="how" className="rv-section">', '<section id="how" className="rv-section" ref={sectionRef}>')
s = s.replace('<ol className="rv-gates">', '<ol className="rv-gates" ref={listRef}>')

# risk: head with stance control on the right, plus a cap gauge
old = s[s.index('          <Reveal kind="wipe">\n            <h2 className="rv-h2">Set your limit.'):s.index('            <Reveal delay={120}>\n              <div className="rv-equity">') if '            <Reveal delay={120}>\n              <div className="rv-equity">' in s else s.index('            <Reveal kind="pop" delay={120}>\n              <div className="rv-equity">')]
new = """          <div className="rv-risk-head">
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

"""
s = s.replace(old, new)
s = s.replace('<div className="rv-risk-grid">\n            <Reveal>\n              <div className="rv-seg"', '<div className="rv-risk-grid">\n            <Reveal>\n              <div className="rv-seg"')

# CapGauge component (before RiskSection)
gauge = """const GAUGE_C = { x: 150, y: 150 };
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

"""
s = s.replace("const RiskSection: React.FC = () => {", gauge + "const RiskSection: React.FC = () => {", 1)

# event tape: auto-run once when it scrolls into view, with a progress rail
s = s.replace("const EventTape: React.FC = () => {\n  const [step, setStep] = useState(0);\n  const timer = useRef<ReturnType<typeof setInterval> | null>(null);",
              "const EventTape: React.FC = () => {\n  const [step, setStep] = useState(0);\n  const timer = useRef<ReturnType<typeof setInterval> | null>(null);\n  const started = useRef(false);\n  const sec = useInView<HTMLElement>(0.35);")
s = s.replace("  const running = step > 0 && step < 5;\n  const done = step === 5;\n\n  return (\n    <section className=\"rv-section\">",
              "  const running = step > 0 && step < 5;\n  const done = step === 5;\n\n  // Play the scenario once when the section scrolls into view; the button replays it.\n  useEffect(() => {\n    if (sec.inView && !started.current) {\n      started.current = true;\n      const t = window.setTimeout(run, 500);\n      return () => window.clearTimeout(t);\n    }\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [sec.inView]);\n\n  return (\n    <section className=\"rv-section\" ref={sec.ref as React.RefObject<HTMLElement>}>")
s = s.replace("{running ? 'Analysing…' : done ? 'Run it again' : 'Simulate CPI announcement'}", "{running ? 'Analysing…' : done ? 'Replay the scenario' : 'Simulate CPI announcement'}")
s = s.replace('        <ol className="rv-events" aria-live="polite">', '        <div className="rv-events-rail" aria-hidden="true">\n          <i style={{ transform: `scaleX(${step / 5})` }} />\n        </div>\n        <ol className="rv-events" aria-live="polite">')

# roadmap markup: big numerals, no dots
s = s.replace("""                    <h3>
                      {p.t}
                      {p.now && <span className="rv-sr"> (available now)</span>}
                    </h3>""", """                    <span className="rv-phase-n" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3>
                      {p.t}
                      {p.now && <span className="rv-sr"> (available now)</span>}
                    </h3>""")

# faq: a line under the heading so the sticky column has a purpose
s = s.replace("""              <h2 className="rv-h2">Questions, answered plainly.</h2>""", """              <h2 className="rv-h2">Questions, answered plainly.</h2>
              <p className="rv-lead">Anything else, ask Araiven in the Copilot once you have an account. It shows its working.</p>""")

# close: the settled dial replaces the rings
s = s.replace("""            <div className="rv-rings" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
""", """            <Dial className="rv-cta-dial" value={82} />
""")
open(p, 'w', encoding='utf8').write(s)
print('applied')
