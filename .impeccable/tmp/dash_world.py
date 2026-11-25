import re

# ---- fonts ----
p = 'src/theme/typography.css'
s = open(p, encoding='utf8').read()
s = re.sub(r"--font-display: [^;]+;", "--font-display: 'Familjen Grotesk', 'Albert Sans', system-ui, sans-serif;", s)
s = re.sub(r"--font-body: [^;]+;", "--font-body: 'Albert Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;", s)
s = re.sub(r"--font-mono: [^;]+;", "--font-mono: 'Martian Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace;", s)
open(p, 'w', encoding='utf8').write(s)

# ---- app.css: the dashboard in the chronometer world ----
p = 'src/theme/app.css'
s = open(p, encoding='utf8').read()
s += """

/* ==========================================================================
   Dashboard in the chronometer world: Stone paper ground, a floating Gunmetal rail,
   and Gunmetal case panels holding the work. Paper-side text variables are dark;
   inside a case they flip back to the light values the panels were written for.
   ========================================================================== */
body:has(.app-main-window) { background-color: #eef1f5; }

.app-main-window {
  --text-primary: #0b0e14;
  --text-secondary: #394456;
  --text-muted: #5a6578;
  --border: rgba(11, 14, 20, 0.15);
  --border-default: rgba(11, 14, 20, 0.15);
  --color-border: rgba(11, 14, 20, 0.15);
  color: #0b0e14;
}
.app-main-window .card-glass,
.app-main-window .rd-case,
.app-main-window [role='dialog'] {
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --border: rgba(203, 213, 225, 0.14);
  --border-default: rgba(203, 213, 225, 0.14);
  --color-border: rgba(203, 213, 225, 0.14);
  color: #f8fafc;
}
.app-main-window main .card-glass {
  background: #10141d !important;
  border-color: rgba(203, 213, 225, 0.1) !important;
  border-radius: 28px !important;
}

/* floating rail */
.app-sidebar {
  left: 12px !important;
  top: 12px !important;
  bottom: 12px !important;
  border-radius: 28px !important;
  background: #10141d !important;
  border: 0 !important;
  overflow: hidden !important;
}
.app-sidebar .menu-tab-btn { border-left: 0 !important; border-radius: 14px !important; }
.app-sidebar .menu-tab-btn.active {
  background: #1b2232 !important;
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.5) !important;
  color: #f8fafc !important;
}
.app-sidebar .menu-tab-btn:hover { background: rgba(203, 213, 225, 0.07) !important; }
@media (min-width: 769px) {
  .app-main-window { margin-left: 100px !important; width: calc(100% - 100px) !important; }
}
#mobile-bottom-nav {
  background: #10141d !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-top: 0 !important;
  border-radius: 24px 24px 0 0;
}

/* themed scrollbar on paper */
html:has(.app-main-window) { scrollbar-color: #5a6578 #eef1f5; scrollbar-width: thin; }
html:has(.app-main-window)::-webkit-scrollbar { width: 11px; }
html:has(.app-main-window)::-webkit-scrollbar-track { background: #eef1f5; }
html:has(.app-main-window)::-webkit-scrollbar-thumb { background: rgba(11, 14, 20, 0.32); border-radius: 8px; border: 2px solid #eef1f5; }
html:has(.app-main-window)::-webkit-scrollbar-thumb:hover { background: #b45309; }
"""
open(p, 'w', encoding='utf8').write(s)

# ---- AppDashboard shell ----
p = 'src/components/dashboard/AppDashboard.tsx'
s = open(p, encoding='utf8').read()
s = s.replace("      background: '#0b0e14',\n      color: '#f8fafc',\n      fontFamily: 'var(--font-body)',\n      overflowX: 'hidden'",
              "      background: '#eef1f5',\n      color: '#0b0e14',\n      fontFamily: 'var(--font-body)',\n      overflowX: 'hidden'")
# header
s = s.replace("          background: '#10141d',\n          position: 'sticky',", "          background: 'rgba(238, 241, 245, 0.94)',\n          position: 'sticky',")
s = s.replace("          borderBottom: 'var(--border-thickness) solid var(--color-border)',\n          padding: '0 clamp(12px, 3vw, 24px)',", "          borderBottom: '1px solid rgba(11, 14, 20, 0.12)',\n          padding: '0 clamp(12px, 3vw, 24px)',")
s = s.replace("fontSize: 'clamp(0.95rem, 3.5vw, 1.15rem)', fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}", "fontSize: 'clamp(1.05rem, 3.5vw, 1.4rem)', fontWeight: 650, letterSpacing: '-0.025em', color: '#0b0e14', margin: 0, whiteSpace: 'nowrap' }}")
s = s.replace("              background: 'rgba(255,255,255,0.02)',\n              border: 'var(--border-thickness) solid var(--color-border)',\n              padding: '4px 10px',", "              background: '#f8fafc',\n              color: '#0b0e14',\n              border: '1px solid rgba(11, 14, 20, 0.2)',\n              padding: '5px 12px',")
s = s.replace("color: showNotifications ? '#fff' : 'var(--text-secondary)',", "color: showNotifications ? '#0b0e14' : '#394456',")
s = s.replace("if (!profile) return '#10b981';", "if (!profile) return '#047857';")
s = s.replace("if (stance === 'conservative') return '#cbd5e1';\n    if (stance === 'aggressive') return '#f59e0b';\n    return '#10b981';", "if (stance === 'conservative') return '#5a6578';\n    if (stance === 'aggressive') return '#b45309';\n    return '#047857';")
s = s.replace("color: 'var(--text-muted)',\n                cursor: 'pointer',\n                display: 'none',", "color: '#5a6578',\n                cursor: 'pointer',\n                display: 'none',")
# directive banner -> an inset amber strip with ink text
old_start = s.index("        {/* Recommendation Directive Banner */}")
old_end = s.index("        {/* Notifications Dropdown Drawer */}")
banner = """        {/* Recommendation Directive Banner */}
        {recommendations.length > 0 && (
          <div style={{
            background: '#f59e0b',
            color: '#0b0e14',
            margin: '14px clamp(12px, 3vw, 24px) 0',
            borderRadius: '20px',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem',
            animation: 'fadeIn var(--motion-duration-slow) var(--motion-ease-out)',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}>
              <Sparkles size={15} style={{ color: '#0b0e14', flexShrink: 0 }} />
              <span style={{ lineHeight: 1.35 }}>
                <strong>Araiven directive:</strong> Optimization plan drafted. Rebalance USDC reserves into market vectors.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setActiveTab('opportunities')}
                style={{ background: 'none', border: 'none', color: '#0b0e14', textDecoration: 'underline', cursor: 'pointer', fontWeight: 650, fontSize: '0.88rem' }}
              >
                Inspect plan
              </button>
              <button
                onClick={() => handleExecuteRec(recommendations[0].id)}
                disabled={executingRecId !== null}
                className="btn"
                style={{
                  height: '34px',
                  padding: '0 14px',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  background: '#0b0e14',
                  color: '#fbbf24',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {executingRecId === recommendations[0].id ? 'Deploying...' : '1-Click execute'}
              </button>
            </div>
          </div>
        )}

"""
s = s[:old_start] + banner + s[old_end:]
open(p, 'w', encoding='utf8').write(s)
print('ok')
