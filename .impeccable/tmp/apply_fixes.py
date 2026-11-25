import re

def rw(path, fn):
    s = open(path, encoding='utf8').read()
    s2 = fn(s)
    open(path, 'w', encoding='utf8').write(s2)

# ---------------- CSS ----------------
def css(s):
    s = s.replace("  --rv-amber-lo: #d97706;\n", "")
    s = s.replace(""".rv-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.75s var(--rv-ease), transform 0.75s var(--rv-ease);
  transition-delay: var(--rv-delay, 0ms);
}
.rv-reveal.is-in {
  opacity: 1;
  transform: none;
}""", """.rv-reveal {
  opacity: 0;
  transition: opacity 0.7s ease;
  transition-delay: var(--rv-delay, 0ms);
}
.rv-reveal.is-in { opacity: 1; }
/* Panels and product windows rise; headings only fade. */
.rv-reveal.is-rise {
  transform: translateY(26px);
  transition: opacity 0.8s var(--rv-ease), transform 0.9s var(--rv-ease);
  transition-delay: var(--rv-delay, 0ms);
}
.rv-reveal.is-rise.is-in { transform: none; }""")
    s = s.replace("  .rv-reveal, .rv-hero-copy > *, .rv-hero-win { opacity: 1; transform: none; animation: none; transition: none; }",
                  "  .rv-reveal, .rv-reveal.is-rise, .rv-hero-copy > *, .rv-hero-win { opacity: 1; transform: none; animation: none; transition: none; }")
    s = s.replace("  opacity: 0.42;\n  transition: opacity 0.6s ease;", "  opacity: 0.62;\n  transition: opacity 0.6s ease;")
    s = s.replace("font: 800 clamp(5rem, 13vw, 9rem) var(--rv-display);\n  letter-spacing: -0.06em;\n  line-height: 0.9;",
                  "font: 800 clamp(4.2rem, 10vw, 6rem) var(--rv-display);\n  letter-spacing: -0.03em;\n  line-height: 0.95;")
    s = s.replace("letter-spacing: -0.05em", "letter-spacing: -0.04em")
    s = s.replace("gap: 72px;\n  align-items: end;", "gap: 72px;\n  align-items: start;")
    s = s.replace(".rv-equity-svg { width: 100%; height: 150px; margin-top: 14px; display: block; }",
                  ".rv-equity-plot { position: relative; margin-top: 14px; }\n.rv-equity-svg { width: 100%; height: 150px; display: block; }\n.rv-equity-dot { position: absolute; right: 0; width: 11px; height: 11px; margin: -5.5px -5.5px 0 0; border-radius: 50%; background: var(--rv-ink); transition: top 0.6s var(--rv-ease); }")
    s = s.replace(".rv-equity-svg circle { fill: var(--rv-ink); transition: cy 0.6s var(--rv-ease); }\n", "")
    s = re.sub(r"\.rv-risk-meta \{[^}]*\}\n\.rv-risk-meta b \{[^}]*\}\n",
               ".rv-risk-rows { margin: 22px 0 0; border-top: 1.5px solid var(--rv-ink); }\n.rv-risk-rows div { display: flex; justify-content: space-between; padding: 11px 0; border-bottom: 1px solid rgba(11, 14, 20, 0.22); font-size: 0.92rem; color: var(--rv-ink); }\n.rv-risk-rows dd { margin: 0; font: 700 0.92rem var(--rv-mono); }\n", s)
    s = re.sub(r"\.rv-phase-tag \{[^}]*\}\n\.rv-phase\.is-now \.rv-phase-tag \{[^}]*\}\n", "", s)
    s = s.replace(".rv-phase h3 { margin-top: 10px;", ".rv-phase h3 { margin-top: 0;")
    s = s.replace(".rv-btn .rv-arrow {\n  display: inline-block;", ".rv-btn .rv-arrow {\n  display: inline-flex;")
    s = s.replace(".rv-prompt .rv-arrow { transition", ".rv-prompt .rv-arrow { display: inline-flex; transition")
    s += "\n.rv-pane-note { grid-column: 1 / -1; margin: 0; padding-top: 18px; border-top: 1px solid var(--rv-line-soft); font-size: 0.8rem; color: var(--rv-text-3); }\n.rv-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }\n.rv-receipt-title { padding: 14px 0 6px; font: 600 0.95rem var(--rv-display); color: var(--rv-text); }\n"
    return s
rw('src/components/landing/landing.css', css)

# ---------------- LandingPage.tsx ----------------
def page(s):
    s = s.replace("import { Menu, X } from 'lucide-react';", "import { ArrowRight, Check, Menu, X } from 'lucide-react';")
    s = s.replace("""const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children,
  delay = 0,
  className = '',
}) => {""", """const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string; rise?: boolean }> = ({
  children,
  delay = 0,
  className = '',
  rise = false,
}) => {""")
    s = s.replace("className={`rv-reveal ${inView ? 'is-in' : ''} ${className}`}",
                  "className={`rv-reveal ${rise ? 'is-rise' : ''} ${inView ? 'is-in' : ''} ${className}`}")
    s = s.replace("const total = useCountUp(78, count >= 3, 1000);", "const total = useCountUp(82, count >= 3, 1000);")
    s = s.replace("['Macro confluence', '0.82', 'x 0.4'],", "['Macro confluence', '0.88', 'x 0.4'],")
    s = s.replace("['Liquidity depth', '0.77', 'x 0.4'],", "['Liquidity depth', '0.80', 'x 0.4'],")
    s = s.replace("['Sentiment inflow', '0.70', 'x 0.2'],", "['Sentiment inflow', '0.74', 'x 0.2'],")
    s = s.replace("""          <Reveal delay={100}>
            <div className="rv-receipt" aria-label="Example confidence score receipt">
              {rows.map""", """          <Reveal delay={100} rise>
            <div className="rv-receipt" aria-label="Example confidence score receipt for the BTC plan">
              <div className="rv-receipt-title">Receipt for the BTC plan</div>
              {rows.map""")
    s = s.replace("<Reveal delay={80}>\n              <PlatformTabs />", "<Reveal delay={80} rise>\n              <PlatformTabs />")
    s = s.replace("""          <Reveal>
            <div className="rv-seg" role="group" aria-label="Risk stance">""", """          <Reveal rise>
            <div className="rv-seg" role="group" aria-label="Risk stance">""")
    s = s.replace("""          <Reveal delay={100}>
            <div className="rv-equity">""", """          <Reveal delay={100} rise>
            <div className="rv-equity">""")
    s = s.replace("""            <Reveal delay={100}>
              <div className="rv-keycheck">""", """            <Reveal delay={100} rise>
              <div className="rv-keycheck">""")
    s = s.replace('<Reveal className="rv-road" delay={80}>', '<Reveal className="rv-road" delay={80} rise>')
    s = s.replace("""              <svg className="rv-equity-svg" viewBox="0 0 240 110" preserveAspectRatio="none" aria-hidden="true">
                <path className="area" d={r.area} />
                <path className="line" d={r.line} vectorEffect="non-scaling-stroke" />
                <circle cx="234" cy={r.tipY} r="3.5" />
              </svg>""", """              <div className="rv-equity-plot">
                <svg className="rv-equity-svg" viewBox="0 0 234 110" preserveAspectRatio="none" aria-hidden="true">
                  <path className="area" d={r.area} />
                  <path className="line" d={r.line} vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="rv-equity-dot" style={{ top: `${(r.tipY / 110) * 100}%` }} aria-hidden="true" />
              </div>""")
    s = re.sub(r"""              <div className="rv-risk-meta">.*?</div>\n              </div>\n""", """              <dl className="rv-risk-rows">
                <div>
                  <dt>Safety score</dt>
                  <dd>{r.safety}</dd>
                </div>
                <div>
                  <dt>Risk index</dt>
                  <dd>{r.riskIndex}</dd>
                </div>
              </dl>
""", s, flags=re.S)
    s = s.replace("""                  <span className="rv-phase-tag">{p.tag}</span>
                  <h3>{p.t}</h3>""", """                  <h3>
                    {p.t}
                    {p.now && <span className="rv-sr"> (available now)</span>}
                  </h3>""")
    s = s.replace('<span className="rv-arrow">→</span>', '<span className="rv-arrow"><ArrowRight size={18} strokeWidth={2} aria-hidden="true" /></span>')
    s = s.replace("{state === 'is-done' ? '✓' : ''}", "{state === 'is-done' ? <Check size={14} strokeWidth={2.5} aria-hidden=\"true\" /> : null}")
    return s
rw('src/components/landing/LandingPage.tsx', page)

# ---------------- AskAraiven ----------------
def ask(s):
    s = s.replace("import React, { useEffect, useRef, useState } from 'react';",
                  "import React, { useEffect, useRef, useState } from 'react';\nimport { ArrowRight } from 'lucide-react';")
    s = s.replace("""              <span className="rv-arrow" aria-hidden="true">
                →
              </span>""", """              <span className="rv-arrow" aria-hidden="true">
                <ArrowRight size={18} strokeWidth={2} />
              </span>""")
    return s
rw('src/components/landing/AskAraiven.tsx', ask)

# ---------------- PlatformTabs ----------------
def tabs(s):
    return s.replace("""          {c.mock}
        </motion.div>""", """          {c.mock}
          <p className="rv-pane-note">Illustrative data for demonstration. Not live market data.</p>
        </motion.div>""")
rw('src/components/landing/PlatformTabs.tsx', tabs)
print('applied')
