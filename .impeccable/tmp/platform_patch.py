p = 'src/components/landing/PlatformTabs.tsx'
s = open(p, encoding='utf8').read()
i = s.index('export const PlatformTabs')
head = s[:i]
head = head.replace("""/*
 * Tab strip adapted from Watermelon UI "Fluid Tabs": a single shared indicator
 * (motion layoutId) springs between tabs. Restyled flat in Amber, no gradient,
 * and the panel crossfades with AnimatePresence.
 */""", """/*
 * Index list with a sticky showcase. The shared marker (motion layoutId) springs between
 * entries, the pattern from Watermelon UI's Fluid Tabs, restyled as a flat paper row.
 */""")
body = """export const PlatformTabs: React.FC = () => {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<TabId>('terminal');
  const c = COPY[active];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const next = (i + (e.key === 'ArrowDown' ? 1 : TABS.length - 1)) % TABS.length;
    setActive(TABS[next].id);
    (e.currentTarget.parentElement?.parentElement?.children[next]?.firstElementChild as HTMLElement | undefined)?.focus();
  };

  return (
    <div className="rv-index">
      <ul className="rv-index-list" role="tablist" aria-orientation="vertical" aria-label="Platform areas">
        {TABS.map((t, i) => {
          const on = active === t.id;
          const item = COPY[t.id];
          return (
            <li key={t.id}>
              <button
                role="tab"
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                className={`rv-index-item ${on ? 'is-active' : ''}`}
                onClick={() => setActive(t.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                {on && (
                  <motion.span
                    layoutId="rv-index-mark"
                    className="rv-index-mark"
                    transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 32, mass: 0.9 }}
                  />
                )}
                <span className="rv-index-label">{t.label}</span>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span
                      className="rv-index-body"
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 0.61, 0.36, 1] }}
                    >
                      <span className="rv-index-h">{item.h}</span>
                      <span className="rv-index-p">{item.p}</span>
                      <span className="rv-index-ul">
                        {item.items.map((it) => (
                          <span key={it}>{it}</span>
                        ))}
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="rv-case rv-showcase">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            role="tabpanel"
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {c.mock}
            <p className="rv-pane-note">Illustrative data for demonstration. Not live market data.</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PlatformTabs;
"""
open(p, 'w', encoding='utf8').write(head + body)
print('ok')
