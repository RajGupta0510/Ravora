import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useConsent } from './ConsentContext';
import './consent.css';

/**
 * The consent banner and the preferences dialog.
 *
 * Accept and Reject have identical size, weight and styling, so neither is nudged.
 * The banner is a non-modal region and never blocks the page; the dialog is modal with a
 * focus trap, Escape to close, and focus returned to whatever opened it.
 */
export const ConsentBanner: React.FC = () => {
  const { consent, save, preferencesOpen, openPreferences, closePreferences } = useConsent();

  return (
    <>
      {!consent.decided && !preferencesOpen && (
        <section className="cs-banner" role="region" aria-label="Storage and third-party content choices">
          <h2 className="cs-title">Your choices on optional content</h2>
          <p className="cs-text">
            Ravora keeps you signed in with essential storage, which needs no consent. Optional third-party content, such as TradingView
            charts, loads only if you allow it. We use no analytics and no advertising trackers.{' '}
            <Link to="/legal/cookies" className="cs-link">
              Cookie Policy
            </Link>
          </p>
          <div className="cs-actions">
            <button type="button" className="cs-btn" onClick={() => save({ thirdParty: true })}>
              Allow optional
            </button>
            <button type="button" className="cs-btn" onClick={() => save({ thirdParty: false })}>
              Reject optional
            </button>
            <button type="button" className="cs-btn cs-btn--text" onClick={openPreferences}>
              Choose
            </button>
          </div>
        </section>
      )}
      {preferencesOpen && <PreferencesDialog onClose={closePreferences} />}
    </>
  );
};

const PreferencesDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { consent, save } = useConsent();
  const [thirdParty, setThirdParty] = useState(consent.thirdParty);
  const ref = useRef<HTMLDivElement | null>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    const first = ref.current?.querySelector<HTMLElement>('button, input, a');
    first?.focus();
    return () => {
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !ref.current) return;
    const items = Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]'));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="cs-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="cs-dialog" role="dialog" aria-modal="true" aria-labelledby="cs-dialog-title" onKeyDown={onKey}>
        <h2 id="cs-dialog-title" className="cs-title cs-title--lg">
          Storage and third-party content
        </h2>
        <p className="cs-text">Choose what Ravora may use beyond what is strictly needed to run your account. You can change this at any time from the footer or from Settings.</p>

        <div className="cs-row">
          <div>
            <h3 className="cs-row-title">Strictly necessary</h3>
            <p className="cs-row-text">Sign-in session, device recognition for security, and this choice itself. The app cannot work without these, so they are always on.</p>
          </div>
          <span className="cs-fixed">Always on</span>
        </div>

        <div className="cs-row">
          <div>
            <h3 className="cs-row-title" id="cs-tp-label">
              Third-party content
            </h3>
            <p className="cs-row-text" id="cs-tp-desc">
              Loads TradingView charts in the trading terminal. When allowed, your browser connects to TradingView, which receives your IP address and browser details and may set its own cookies. Without it, Ravora shows its native chart.
            </p>
          </div>
          <label className="cs-switch">
            <input type="checkbox" role="switch" checked={thirdParty} onChange={(e) => setThirdParty(e.target.checked)} aria-labelledby="cs-tp-label" aria-describedby="cs-tp-desc" />
            <span className="cs-switch-ui" aria-hidden="true" />
          </label>
        </div>

        <p className="cs-text cs-fine">
          Ravora uses no analytics or advertising trackers.{' '}
          {consent.recordedAt && <>Your last choice was recorded on {new Date(consent.recordedAt).toLocaleDateString()}. </>}
          <Link to="/legal/cookies" className="cs-link" onClick={onClose}>
            Cookie Policy
          </Link>
        </p>

        <div className="cs-actions">
          <button type="button" className="cs-btn" onClick={() => save({ thirdParty })}>
            Save choices
          </button>
          <button type="button" className="cs-btn" onClick={() => save({ thirdParty: true })}>
            Allow optional
          </button>
          <button type="button" className="cs-btn" onClick={() => save({ thirdParty: false })}>
            Reject optional
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
