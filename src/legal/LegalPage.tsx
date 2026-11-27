import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { DOCS } from './docs';
import { LEGAL, LEGAL_LINKS, type LegalDocSlug } from './legalConfig';
import { LegalLinks } from './LegalLinks';
import { usePageMeta } from '../utils/seo';
import './legal.css';

export const LegalPage: React.FC = () => {
  const { doc } = useParams<{ doc: string }>();
  const slug = (doc ?? '') as LegalDocSlug;
  const data = DOCS[slug];

  usePageMeta({
    title: `${data?.title ?? 'Legal'} | Ravora`,
    description: data?.summary ?? 'Ravora legal documents.',
    path: data ? `/legal/${slug}` : '/legal/privacy',
  });

  useEffect(() => {
    if (data) window.scrollTo(0, 0);
  }, [data]);

  if (!data) return <Navigate to="/legal/privacy" replace />;

  const updated = new Date(LEGAL.lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="lg">
      <a className="lg-skip" href="#lg-main">
        Skip to content
      </a>

      <header className="lg-top">
        <div className="lg-wrap lg-top-in">
          <Link to="/" className="lg-logo" aria-label="Ravora home">
            <span className="lg-logo-mark">R</span>
            Ravora
          </Link>
          <nav aria-label="Legal documents" className="lg-tabs">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.slug} to={l.path} aria-current={l.slug === slug ? 'page' : undefined} className={l.slug === slug ? 'is-current' : ''}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main id="lg-main" className="lg-wrap lg-main">
        <article className="lg-article">
          <h1 className="lg-h1">{data.title}</h1>
          <p className="lg-lead">{data.summary}</p>
          <p className="lg-meta">Last updated {updated}</p>

          {!LEGAL.reviewed && (
            <div className="lg-draft" role="note">
              <strong>Draft pending legal review.</strong> This document has not yet been reviewed by a qualified lawyer. Items marked <mark className="lg-tbc">To be confirmed</mark> still need
              information or confirmation and must be completed before it is relied on.
            </div>
          )}

          <div className="lg-layout">
            <nav className="lg-toc" aria-label="On this page">
              <h2 className="lg-toc-title">On this page</h2>
              <ol>
                {data.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.title}</a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="lg-body">
              {data.sections.map((s, i) => (
                <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="lg-section">
                  <h2 id={`${s.id}-h`} className="lg-h2">
                    <span className="lg-num" aria-hidden="true">
                      {i + 1}.
                    </span>{' '}
                    {s.title}
                  </h2>
                  {s.body}
                </section>
              ))}
            </div>
          </div>
        </article>
      </main>

      <footer className="lg-foot">
        <div className="lg-wrap">
          <LegalLinks />
          <p className="lg-foot-note">
            © {new Date().getFullYear()} Ravora. Ravora provides analysis and trade-planning tools, not financial advice. Trading crypto-assets involves substantial risk of loss.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
