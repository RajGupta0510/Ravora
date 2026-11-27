import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { LEGAL } from '../legal/legalConfig';

/**
 * Consent for optional storage and third-party content.
 *
 * Ravora uses no analytics and no advertising storage. The only optional category today is
 * third-party content (TradingView charts). Strictly necessary storage (sign-in, security) is
 * not subject to consent and is described in the Cookie Policy.
 *
 * Nothing optional is loaded before an explicit "allow". Withdrawing is as easy as giving:
 * the footer and Settings both reopen the preferences.
 */

const STORAGE_KEY = 'ravora_consent_v1';

export interface ConsentState {
  /** Has the visitor made a choice for the current consent version? */
  decided: boolean;
  /** TradingView charts and any other optional third-party content. */
  thirdParty: boolean;
  /** ISO timestamp of the choice, so it can be shown and audited. */
  recordedAt: string | null;
  version: number;
}

const EMPTY: ConsentState = { decided: false, thirdParty: false, recordedAt: null, version: LEGAL.consentVersion };

function read(): ConsentState {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== LEGAL.consentVersion) return EMPTY; // categories changed: ask again
    return { decided: !!parsed.decided, thirdParty: !!parsed.thirdParty, recordedAt: parsed.recordedAt ?? null, version: LEGAL.consentVersion };
  } catch {
    return EMPTY;
  }
}

interface ConsentApi {
  consent: ConsentState;
  /** Save a choice. */
  save: (choice: { thirdParty: boolean }) => void;
  /** Is the preferences dialog open? */
  preferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
}

const Ctx = createContext<ConsentApi | null>(null);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentState>(read);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const save = useCallback((choice: { thirdParty: boolean }) => {
    const next: ConsentState = {
      decided: true,
      thirdParty: choice.thirdParty,
      recordedAt: new Date().toISOString(),
      version: LEGAL.consentVersion,
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked: the choice still applies for this page view */
    }
    setConsent(next);
    setPreferencesOpen(false);
  }, []);

  const value = useMemo<ConsentApi>(
    () => ({
      consent,
      save,
      preferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      closePreferences: () => setPreferencesOpen(false),
    }),
    [consent, save, preferencesOpen]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useConsent(): ConsentApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useConsent must be used inside ConsentProvider');
  return v;
}
