import React from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_LINKS } from './legalConfig';
import { useConsent } from '../consent/ConsentContext';
import './legal-links.css';

/** Shared footer links, reused by the landing page, sign-in, dashboard and the legal pages. */
export const LegalLinks: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { openPreferences } = useConsent();
  return (
    <nav className={`lg-links ${className}`} aria-label="Legal">
      {LEGAL_LINKS.map((l) => (
        <Link key={l.slug} to={l.path}>
          {l.label}
        </Link>
      ))}
      <button type="button" onClick={openPreferences}>
        Cookie settings
      </button>
    </nav>
  );
};

export default LegalLinks;
