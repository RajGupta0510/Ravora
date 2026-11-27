import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageMeta } from '../utils/seo';
import { LegalLinks } from '../legal/LegalLinks';
import './not-found.css';

/** Shown for any URL that is not a route in the app. */
export const NotFound: React.FC = () => {
  const { token } = useAuth();
  usePageMeta({
    title: 'Page not found | Ravora',
    description: 'The page you were looking for does not exist or has moved.',
    noindex: true,
  });

  return (
    <div className="nf">
      <header className="nf-top">
        <Link to="/" className="nf-logo" aria-label="Ravora home">
          <span className="nf-logo-mark">R</span>
          Ravora
        </Link>
      </header>

      <main className="nf-main" id="main">
        <p className="nf-code" aria-hidden="true">
          404
        </p>
        <h1 className="nf-h1">This page is off the chart.</h1>
        <p className="nf-sub">The link may be broken, or the page may have moved. Nothing was traded and nothing was lost.</p>
        <div className="nf-actions">
          <Link to="/" className="nf-btn nf-btn-primary">
            Back to home
          </Link>
          {token ? (
            <Link to="/dashboard" className="nf-btn nf-btn-ghost">
              Open dashboard
            </Link>
          ) : (
            <Link to="/auth/login" className="nf-btn nf-btn-ghost">
              Sign in
            </Link>
          )}
        </div>
      </main>

      <footer className="nf-foot">
        <LegalLinks />
        <p>© {new Date().getFullYear()} Ravora</p>
      </footer>
    </div>
  );
};

export default NotFound;
