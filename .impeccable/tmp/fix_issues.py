p = 'src/components/dashboard/OpportunitiesPanel.tsx'
s = open(p, encoding='utf8').read()
s = s.replace("import { Sparkles, Play } from 'lucide-react';",
              "import { Sparkles, Play } from 'lucide-react';\nimport { parseReasoning } from '../../utils/reasoning';")
s = s.replace("                {opp.reasoningText}\n", "                {parseReasoning(opp.reasoningText).summary}\n")
old = """              }}>{selectedOpp.reasoningText}</p>
            </div>
"""
new = """              }}>{parseReasoning(selectedOpp.reasoningText).summary}</p>
              {parseReasoning(selectedOpp.reasoningText).sections.length > 0 && (
                <dl style={{ margin: '4px 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {parseReasoning(selectedOpp.reasoningText).sections.map((sec) => (
                    <div key={sec.label}>
                      <dt style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>{sec.label}</dt>
                      <dd style={{ margin: '4px 0 0', fontSize: '0.8rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                        {sec.items ? (
                          <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {sec.items.map((it) => (
                              <li key={it}>{it}</li>
                            ))}
                          </ul>
                        ) : (
                          sec.text
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
"""
assert old in s
s = s.replace(old, new, 1)
open(p, 'w', encoding='utf8').write(s)

p = 'src/components/dashboard/PortfolioPanel.tsx'
s = open(p, encoding='utf8').read()
old_start = s.index("          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0' }}>Global scan core</span>")
old_end = s.index("      </div>\n\n", old_start)
block = s[old_start:old_end]
new_block = """          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0' }}>Araiven scan</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                {opportunities.length} {opportunities.length === 1 ? 'market' : 'markets'} scanned
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Setups at or above the 75% confidence filter</span>
            </div>
            <div style={{
              background: passingCount > 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(203, 213, 225, 0.06)',
              border: passingCount > 0 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border)',
              color: passingCount > 0 ? '#10b981' : 'var(--text-secondary)',
              padding: '4px 8px',
              borderRadius: '7px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {passingCount} shown
            </div>
          </div>
        </div>
"""
s = s[:old_start] + new_block + s[old_end:]
s = s.replace("    closeAllPaperPositions\n  } = useApp();\n", "    closeAllPaperPositions,\n    opportunities\n  } = useApp();\n  const passingCount = opportunities.filter((o) => o.confidenceScore >= 75).length;\n", 1)
open(p, 'w', encoding='utf8').write(s)

p = 'src/services/recommendations/recommendationEngine.js'
s = open(p, encoding='utf8').read()
s = s.replace("""            ? `Araiven recommends allocating ${target.targetPct}% reserves to ${target.symbol} because: ` + scored.scores.reasoningText""",
"""            ? `Araiven recommends allocating ${target.targetPct}% reserves to ${target.symbol} because: ` + plainReasoning(scored.scores.reasoningText)""")
if 'const plainReasoning' not in s:
    idx = s.index('export class RecommendationEngine') if 'export class RecommendationEngine' in s else s.index('export const RecommendationEngine')
    helper = """// The scorer stores its reasoning as a JSON document; recommendations should carry readable text.
const plainReasoning = (raw) => {
  try {
    const parsed = JSON.parse(raw);
    return (parsed && parsed.summary) || String(raw);
  } catch {
    return String(raw);
  }
};

"""
    s = s[:idx] + helper + s[idx:]
open(p, 'w', encoding='utf8').write(s)
print('done')
