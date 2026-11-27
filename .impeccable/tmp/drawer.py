p='src/components/landing/LandingPage.tsx'
s=open(p,encoding='utf8').read()
a="""  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;"""
b="""  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;"""
assert a in s
open(p,'w',encoding='utf8').write(s.replace(a,b,1))
p='src/components/landing/landing.css'
s=open(p,encoding='utf8').read()
a=".rv-drawer { display: block; border-top: 1px solid var(--r); background: var(--paper); padding: 12px 28px 24px; }"
assert a in s
s=s.replace(a,".rv-drawer { display: block; border-top: 1px solid var(--r); background: var(--paper); padding: 12px 28px 24px; max-height: calc(100dvh - 74px); overflow-y: auto; }")
open(p,'w',encoding='utf8').write(s)
