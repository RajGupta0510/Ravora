def edit(p, pairs):
    s=open(p,encoding='utf8').read()
    for a,b,*n in pairs:
        cnt = n[0] if n else 1
        assert a in s,(p,a[:50])
        s=s.replace(a,b,cnt)
    open(p,'w',encoding='utf8').write(s)

edit('src/legal/LegalPage.tsx',[
("import { LegalLinks } from './LegalLinks';","import { LegalLinks } from './LegalLinks';\nimport { usePageMeta } from '../utils/seo';"),
("""  useEffect(() => {
    if (!data) return;
    const prev = document.title;
    document.title = `${data.title} | Ravora`;
    window.scrollTo(0, 0);
    return () => {
      document.title = prev;
    };
  }, [data]);
""","""  usePageMeta({
    title: `${data?.title ?? 'Legal'} | Ravora`,
    description: data?.summary ?? 'Ravora legal documents.',
    path: data ? `/legal/${slug}` : '/legal/privacy',
  });

  useEffect(() => {
    if (data) window.scrollTo(0, 0);
  }, [data]);
"""),
("© {new Date(LEGAL.lastUpdated).getFullYear()} Ravora.","© {new Date().getFullYear()} Ravora."),
])
edit('src/components/landing/LandingPage.tsx',[
("© 2026 Ravora.","© {new Date().getFullYear()} Ravora."),
("""          <a href="#top" className="rv-logo" aria-label="Ravora home">""","""          <a href="/" className="rv-logo" aria-label="Ravora home" onClick={goTop}>"""),
("""            <a href="#top" className="rv-logo">""","""            <a href="/" className="rv-logo" aria-label="Ravora home" onClick={goTop}>"""),
("""  const row = (items: string[], key: string, venue = false) => (""","""  // The logo is a real link to "/"; on the landing page it just scrolls back to the top instead of reloading.
  const goTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  const row = (items: string[], key: string, venue = false) => ("""),
])
edit('components/ui/auth-card.tsx',[("© 2026 Ravora","© {new Date().getFullYear()} Ravora")])
edit('src/components/dashboard/AppDashboard.tsx',[
("""          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2.5)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>""","""          <Link to="/" aria-label="Ravora home" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2.5)', fontFamily: 'var(--font-display)', fontWeight: 700, textDecoration: 'none' }}>"""),
("""fontSize: '1.15rem' }}>Ravora</span>
          </div>""","""fontSize: '1.15rem' }}>Ravora</span>
          </Link>"""),
("import { useAuth } from '../../context/AuthContext';","import { Link } from 'react-router-dom';\nimport { useAuth } from '../../context/AuthContext';"),
])
