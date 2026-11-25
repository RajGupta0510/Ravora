import re

# ---------------- CSS ----------------
p = 'components/ui/auth-card.css'
s = open(p, encoding='utf8').read()

# 8. focus: no !important / radius override on the generic ring; inputs get one soft ring only
s = s.replace(""".ra :focus-visible {
  outline: 2px solid var(--rv-amber) !important;
  outline-offset: 3px !important;
  border-radius: 7px;
}""", """.ra :focus-visible {
  outline: 2px solid var(--rv-amber);
  outline-offset: 3px;
}""")
s = s.replace(""".ra-input:focus {
  outline: 2px solid rgba(245, 158, 11, 0.4);
  outline-offset: 0;
  border-color: var(--rv-amber);
}""", """.ra-input:focus,
.ra-input:focus-visible {
  outline: 2px solid rgba(245, 158, 11, 0.4) !important;
  outline-offset: 0 !important;
  border-color: var(--rv-amber);
}""")

# 6. control edge contrast
s = s.replace("border: 1px solid rgba(203, 213, 225, 0.2);\n  border-radius: 8px;\n  color: var(--rv-text);\n  font: 400 1rem",
              "border: 1px solid rgba(203, 213, 225, 0.46);\n  border-radius: 8px;\n  color: var(--rv-text);\n  font: 400 1rem")
s = s.replace(".ra-input:hover { border-color: rgba(203, 213, 225, 0.36); }", ".ra-input:hover { border-color: rgba(203, 213, 225, 0.62); }")
s = s.replace("  border: 1px solid var(--rv-line-strong);\n  border-radius: 8px;\n  color: var(--rv-text);\n  font: 600 0.88rem var(--rv-body);",
              "  border: 1px solid rgba(203, 213, 225, 0.46);\n  border-radius: 8px;\n  color: var(--rv-text);\n  font: 600 0.88rem var(--rv-body);")
s = s.replace(".ra-social button:hover:not(:disabled) { border-color: var(--rv-amber); background: rgba(245, 158, 11, 0.06); }",
              ".ra-social button:hover:not(:disabled) { border-color: var(--rv-amber); color: var(--rv-amber-hi); background: rgba(245, 158, 11, 0.06); }")

# 4 + 7. tonal pill, aria-pressed selectors
s = s.replace(".ra-switch button[aria-selected='true'] { color: var(--rv-ink); }", ".ra-switch button[aria-pressed='true'] { color: var(--rv-text); }")
s = s.replace(""".ra-switch .pill {
  position: absolute;
  inset: 0;
  border-radius: 7px;
  background: var(--rv-amber);
}""", """.ra-switch .pill {
  position: absolute;
  inset: 0;
  border-radius: 7px;
  background: #1b2232;
  border: 1px solid rgba(245, 158, 11, 0.5);
}""")

# 2. anchor the column near the top so the switch never moves between modes
s = s.replace("""  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  min-width: 0;
}""", """  align-items: center;
  justify-content: flex-start;
  padding: clamp(40px, 11vh, 112px) 24px 48px;
  min-width: 0;
}""")
s = s.replace("""@media (min-width: 601px) and (max-width: 1000px) {
  .ra-main { justify-content: center; }
}
""", "")
s = s.replace("  .ra-main { justify-content: flex-start; padding-top: 36px; }", "  .ra-main { padding-top: 36px; }")

# links hit area
s = s.replace("""  font: 600 0.9rem var(--rv-body);
  cursor: pointer;
}
.ra-check a:hover""", """  font: 600 0.9rem var(--rv-body);
  cursor: pointer;
}
.ra-check a:hover""")
s = s.replace(".ra-link {\n  background: none;\n  border: 0;\n  padding: 0;", ".ra-link {\n  background: none;\n  border: 0;\n  padding: 3px 0;\n  min-height: 26px;")

# 3. tape cadence + note
s = s.replace("animation-delay: calc(var(--i) * 380ms + 250ms);", "animation-delay: calc(var(--i) * 600ms + 250ms);")
s = s.replace(".ra-story-foot {", ".ra-tape-note {\n  margin-top: 14px;\n  font-size: 0.84rem;\n  color: var(--rv-text-3);\n}\n.ra-story-foot {")
open(p, 'w', encoding='utf8').write(s)

# ---------------- auth-switch ----------------
p = 'components/ui/auth-switch.tsx'
s = open(p, encoding='utf8').read()
s = s.replace('<div className="ra-switch" role="tablist" aria-label="Sign in or create an account">', '<div className="ra-switch" role="group" aria-label="Sign in or create an account">')
s = s.replace("          role=\"tab\"\n          aria-selected={mode === o.id}\n", "          aria-pressed={mode === o.id}\n")
open(p, 'w', encoding='utf8').write(s)

# ---------------- auth-card.tsx ----------------
p = 'components/ui/auth-card.tsx'
s = open(p, encoding='utf8').read()

# story: tape outside the keyed node, visible note, readable aside
old_start = s.index('      {/* Story panel (desktop) */}')
old_end = s.index('      {/* Form column */}')
story = """      {/* Story panel (desktop) */}
      <aside className="ra-story">
        <a className="ra-logo" href="/">
          <span className="ra-logo-mark">R</span>
          Ravora
        </a>

        <div className="ra-story-body">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode === 'register' ? 'register' : 'login'}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.35, ease }}
            >
              <h2 className="ra-story-h">
                {mode === 'register' ? 'Open your account in a minute.' : 'Pick up where Araiven left off.'}
              </h2>
              <p className="ra-story-p">
                {mode === 'register'
                  ? 'Start with a $100,000 paper portfolio. No card, no exchange connection.'
                  : 'Your watchlist, paper account and trade plans are waiting.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* The tape is rendered once per visit, outside the keyed block, so mode switches do not replay it. */}
          <ol className="ra-tape">
            {TAPE.map((row, i) => (
              <li key={row.l} className={i === TAPE.length - 1 ? 'is-final' : ''} style={{ ['--i' as string]: i }}>
                <span className="t">{row.t}</span>
                <span className="l">{row.l}</span>
                <span className="v">{row.v}</span>
              </li>
            ))}
          </ol>
          <p className="ra-tape-note">Illustrative sequence, not live data.</p>
        </div>

        <p className="ra-story-foot">© 2026 Ravora</p>
      </aside>

"""
s = s[:old_start] + story + s[old_end:]

# 5. remove duplicate "ra-alt" navigation lines
s = re.sub(r"\n\s*<p className=\"ra-alt\">.*?</p>\n", "\n", s, flags=re.S)
open(p, 'w', encoding='utf8').write(s)
print('ok', s.count('ra-alt'))
