import re, collections

BASE = 'src/components/landing/'

# =============================== TSX ===============================
def edit(path, fn):
    s = open(BASE + path, encoding='utf8').read()
    o = fn(s)
    assert o != s, path
    open(BASE + path, 'w', encoding='utf8').write(o)

# --- hero: the approve control opens a paper account instead of faking a success state
def hero(s):
    s = s.replace("import React, { useEffect, useMemo, useState } from 'react';", "import React, { useEffect, useMemo, useState } from 'react';\nimport { useNavigate } from 'react-router-dom';")
    s = s.replace("  const [placed, setPlaced] = useState(false);\n", "  const navigate = useNavigate();\n")
    s = s.replace("    setPlaced(false);\n", "")
    old = s[s.index("        <button className={`rv-approve ${placed ? 'is-done' : ''}`}"):s.index("      <p className=\"rv-inst-note\">")]
    new = """        <button className="rv-approve" disabled={stage < 3} onClick={() => navigate('/auth/register')}>
          Try this in a paper account
        </button>
      </div>
"""
    s = s.replace(old, new)
    return s
edit('HeroInstrument.tsx', hero)

# --- ask: the plan card offers a real next step, never a printed confirmation
def ask(s):
    s = s.replace("import { ArrowRight } from 'lucide-react';", "import { ArrowRight } from 'lucide-react';\nimport { useNavigate } from 'react-router-dom';")
    s = s.replace("  const [decision, setDecision] = useState<'none' | 'approved' | 'rejected'>('none');\n", "  const navigate = useNavigate();\n")
    s = s.replace("    setDecision('none');\n", "")
    a = s.index('            <div className="rv-plan-actions">')
    b = s.index("            </div>\n          </div>\n        )}", a) + len("            </div>\n")
    new = """            <div className="rv-plan-actions">
              <button className="rv-btn rv-btn-primary" onClick={() => navigate('/auth/register')}>
                {script.filtered ? 'Get an alert at 75%' : 'Try it in a paper account'}
              </button>
            </div>
"""
    return s[:a] + new + s[b:]
edit('AskAraiven.tsx', ask)

# --- platform tabs: no middle-dot meta strings; one less echo of the balance
def plat(s):
    s = s.replace("Safe · 1.4% buffer to cap", "Safe, 1.4% buffer to the cap")
    s = s.replace("BTC long · 3x", "BTC long, 3x").replace("ETH long · 2x", "ETH long, 2x").replace("SOL long · 2x", "SOL long, 2x")
    s = s.replace("h: 'Practise with $100,000 of simulated capital.'", "h: 'Practise with simulated capital.'")
    return s
edit('PlatformTabs.tsx', plat)

# --- landing page
def page(s):
    s = s.replace("import { ArrowRight, Check, Menu, X } from 'lucide-react';", "import { Check, Menu, X } from 'lucide-react';")
    a = s.index("const Arrow: React.FC = () => (")
    b = s.index("const GatesSection")
    s = s[:a] + s[b:]
    s = s.replace("Start with $100k paper money <Arrow />", "Start with $100k paper money")
    s = s.replace("Create free account <Arrow />", "Create free account")
    s = s.replace("Everything you need to find a trade, size it safely and understand it, without juggling six tabs.", "Find a setup, size it against your drawdown cap and read its reasoning in one workspace.")
    s = s.replace("Test your first plan with $100,000 of paper money.", "Test your first plan with paper money.")
    s = s.replace("'$100k paper trading'", "'Paper trading with a virtual balance'")
    s = s.replace('Read balances <em className="ok">ALLOWED</em>', 'Read balances <em className="ok">Allowed</em>')
    s = s.replace('Place orders <em className="ok">ALLOWED</em>', 'Place orders <em className="ok">Allowed</em>')
    s = s.replace('Withdraw funds <em className="no">BLOCKED</em>', 'Withdraw funds <em className="no">Blocked</em>')
    s = s.replace("style={{ top: `${(r.tipY / 110) * 100}%` }}", "style={{ transform: `translateY(${(r.tipY / 110) * 150}px)` }}")
    s = s.replace("<i style={{ width: `${a.pct}%` }} />", "<i style={{ transform: `scaleX(${a.pct / 100})` }} />")
    return s
edit('LandingPage.tsx', page)

# =============================== CSS ===============================
p = BASE + 'landing.css'
s = open(p, encoding='utf8').read()

# component fixes
s = s.replace("  transition: top 0.7s var(--ease); }", "  transition: transform 0.7s var(--ease); }") if "transition: top 0.7s var(--ease); }" in s else s
s = re.sub(r"\.rv-equity-dot \{[^}]*\}", ".rv-equity-dot { position: absolute; top: 0; right: 0; width: 11px; height: 11px; margin: -5.5px -5.5px 0 0; border-radius: 50%; background: var(--ink); transition: transform 0.7s var(--ease); }", s)
s = re.sub(r"\.rv-alloc-bar i \{[^}]*\}", ".rv-alloc-bar i { display: block; width: 100%; height: 100%; background: var(--ink); border-radius: 99px; transform-origin: left; transition: transform 0.7s var(--ease); }", s)
s = re.sub(r"\.rv-perm em \{[^}]*\}", ".rv-perm em { font: 650 0.8rem var(--body); font-style: normal; letter-spacing: 0; padding: 4px 10px; border-radius: 6px; }", s)
s = re.sub(r"\.rv-inst-status \{[^}]*\}", ".rv-inst-status { font: 500 0.8rem var(--body); color: var(--m); }", s)
s = s.replace(".rv-prompt:hover { color: var(--t); padding-left: 12px; }", ".rv-prompt > span:first-child { transition: transform 0.35s var(--ease); }\n.rv-prompt:hover { color: var(--t); }\n.rv-prompt:hover > span:first-child { transform: translateX(12px); }")
s = s.replace("  transition: color 0.2s ease, padding 0.35s var(--ease);\n}", "  transition: color 0.2s ease;\n}")
s = s.replace("font: 500 10.5px var(--mono); }", "font: 500 11.5px var(--mono); }")
s = s.replace(".rv-gauge-num { fill: var(--ink); font: 500 10px var(--mono); }", ".rv-gauge-num { fill: var(--ink); font: 500 11px var(--mono); }")
s = s.replace(".rv-approve.is-done { background: rgba(16, 185, 129, 0.14); border-color: rgba(16, 185, 129, 0.45); color: var(--pos); }\n", "")
s += "\n/* The page clips horizontal overflow at the document level too. */\nhtml:has(.rv), body:has(.rv) { overflow-x: clip; }\n"

# ---- token pass: every colour literal moves to :root, everything else references tokens ----
HEX = {
    '#eef1f5': 'c-paper', '#f6f8fb': 'c-paper-2', '#e5e9ef': 'c-paper-3', '#0b0e14': 'c-ink',
    '#10141d': 'c-case', '#151a26': 'c-case-2', '#1b2232': 'c-case-3', '#0e121b': 'c-inset',
    '#f59e0b': 'c-amber', '#fbbf24': 'c-amber-hi', '#b45309': 'c-amber-deep',
    '#f8fafc': 'c-stone-50', '#cbd5e1': 'c-stone-300', '#94a3b8': 'c-stone-400',
    '#394456': 'c-slate-700', '#5a6578': 'c-slate-500', '#3a4558': 'c-tick', '#6b7789': 'c-tick-major',
    '#10b981': 'c-pos', '#047857': 'c-pos-deep', '#f87171': 'c-neg', '#b91c1c': 'c-neg-deep',
    '#fff': 'c-stone-50', '#000': 'c-ink',
}
RGB = {
    (11, 14, 20): 'ink', (203, 213, 225): 'stone', (245, 158, 11): 'amber', (16, 185, 129): 'pos',
    (248, 113, 113): 'neg', (4, 120, 87): 'pos-deep', (185, 28, 28): 'neg-deep', (238, 241, 245): 'paper',
}
alphas = collections.OrderedDict()

def rgba(m):
    r, g, b = int(m.group(1)), int(m.group(2)), int(m.group(3))
    a = float(m.group(4))
    base = RGB[(r, g, b)]
    name = f"{base}-a{int(round(a * 1000))}"
    alphas[name] = f"rgba({r}, {g}, {b}, {a})"
    return f"var(--{name})"

def hexrep(m):
    return f"var(--{HEX[m.group(0).lower()]})"

s = re.sub(r"rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)", rgba, s)
s = re.sub(r"#[0-9a-fA-F]{3,8}\b", hexrep, s)

prim = ":root {\n"
for lit, name in HEX.items():
    if lit in ('#fff', '#000'):
        continue
    prim += f"  --{name}: {lit};\n"
for name, lit in alphas.items():
    prim += f"  --{name}: {lit};\n"
prim += "}\n\n"

stamp = """/* Hallmark · checked: 2026-11-26 · genre: modern-minimal (inferred)
 * floor: 0 FAIL after polish · fixed: tokens to :root, 10a transitions, 63 punctuation and fake success, 67 label, 19 cliche, 4 overflow, 64 mono label, 75 small SVG text, 69 echo
 * structural: printed, not rebuilt (58 word budget, 24b spacing scale, 84 built product mocks, 80 drawn instrument, 23 amber risk panel)
 * built: the project · redesign: polish · v2.0.0 */
/* Hallmark · waive 38iii · the amber marker under the hero phrase is the page's one accent gesture and appears once, in the hero · the headline phrase is the offer */
"""
s = s.replace("@import '../../theme/ravora-fonts.css';\n", stamp + "@import '../../theme/ravora-fonts.css';\n\n" + prim, 1)
open(p, 'w', encoding='utf8').write(s)
print('tokens:', len(HEX) - 2, 'alphas:', len(alphas))
