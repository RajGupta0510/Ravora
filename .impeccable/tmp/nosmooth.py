p='src/components/landing/landing.css'
s=open(p,encoding='utf8').read()
a="""/* Anchor jumps must clear the fixed 74px header, and smooth-scroll unless the visitor asks for less motion. */
.rv section[id] { scroll-margin-top: 84px; }
@media (prefers-reduced-motion: no-preference) { html:has(.rv) { scroll-behavior: smooth; } }
"""
b="""/* Anchor jumps must clear the fixed 74px header. */
.rv section[id] { scroll-margin-top: 84px; }
"""
assert a in s
open(p,'w',encoding='utf8').write(s.replace(a,b))
p='src/components/landing/LandingPage.tsx'
s=open(p,encoding='utf8').read()
a="window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });"
assert a in s
s=s.replace(a,"window.scrollTo(0, 0);")
s=s.replace("""  // The logo is a real link to "/"; on the landing page it just scrolls back to the top instead of reloading.""","""  // The logo is a real link to "/"; on the landing page it scrolls back to the top instead of reloading.""")
open(p,'w',encoding='utf8').write(s)
