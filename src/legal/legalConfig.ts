/**
 * Single source of truth for the facts the legal documents state about Ravora.
 *
 * Anything the owner has not supplied is `null`. Documents render a visible
 * "To be confirmed" marker for every null value, so no entity name, address,
 * registration number or contact detail is ever invented. Fill these in, have a
 * qualified lawyer review the documents, then set `reviewed` to true to remove the
 * draft notice.
 */
export const LEGAL = {
  productName: 'Ravora',
  aiEngineName: 'Araiven',

  /** Flip to true only after a qualified legal professional has reviewed all documents. */
  reviewed: false,

  /** ISO date of the last substantive change to any legal document. */
  lastUpdated: '2026-11-27',
  /** Bump when the consent categories change so existing visitors are asked again. */
  consentVersion: 1,

  entity: {
    legalName: null as string | null, // e.g. the registered company, LLP or proprietorship
    entityType: null as string | null,
    registeredAddress: null as string | null,
    registrationNumber: null as string | null, // CIN / LLPIN / other, if any
    jurisdiction: null as string | null, // governing law and courts
  },

  contact: {
    privacyEmail: null as string | null,
    supportEmail: null as string | null,
    grievanceOfficer: {
      name: null as string | null,
      designation: null as string | null,
      email: null as string | null,
      address: null as string | null,
    },
  },

  /** Providers that act for Ravora today, taken from the codebase. Confirm each before launch. */
  processors: {
    auth: 'Supabase (sign-in, one-time codes and social sign-in)',
    email: 'Resend or SendGrid (one-time codes and notification emails)',
    sms: 'Twilio (one-time codes and SMS notifications)',
    hosting: 'Vercel (web app) and Render (API), per the project README',
    charts: 'TradingView (optional embedded charts, loaded only with your consent)',
    marketData: 'Binance, CoinGecko / CoinCap and CryptoPanic (market and news data, fetched by Ravora servers)',
    ai: null as string | null, // which AI model provider(s) are live: Google Gemini, OpenAI, Anthropic?
  },

  /** True only once paid plans exist. Controls whether a Refund and Cancellation page is required. */
  paidServices: false,
} as const;

/** Local storage keys the app writes, for the cookie and storage policy. Keep in sync with the code. */
export const STORAGE_KEYS = [
  { key: 'ravora_token', purpose: 'Keeps you signed in (your session token).', duration: 'Until you sign out or clear site data', type: 'Local storage', category: 'Strictly necessary' },
  { key: 'ravora_logged_in, ravora_login_time, ravora_remember_me, ravora_onboarding_completed', purpose: 'Remember whether you are signed in, when, your "keep me signed in" choice and whether onboarding is done.', duration: 'Until you sign out or clear site data', type: 'Local storage', category: 'Strictly necessary' },
  { key: 'ravora_email', purpose: 'Shows which account is signed in and pre-fills security prompts.', duration: 'Until you sign out or clear site data', type: 'Local storage', category: 'Strictly necessary' },
  { key: 'ravora_device_fingerprint', purpose: 'A random identifier for this browser, used to recognise trusted devices and protect your account.', duration: 'Until you clear site data', type: 'Local storage', category: 'Strictly necessary' },
  { key: 'ravora_session_active, initialRoute', purpose: 'Track the current browser tab session and return you to the page you were on.', duration: 'Until the tab is closed', type: 'Session storage', category: 'Strictly necessary' },
  { key: 'sb-*', purpose: 'Session data written by our sign-in provider (Supabase) while you are signed in.', duration: 'Until you sign out or clear site data', type: 'Local storage', category: 'Strictly necessary' },
  { key: 'ravora_consent_v1', purpose: 'Remembers your choices on this page so we do not ask on every visit.', duration: 'Until you clear site data or change your choice', type: 'Local storage', category: 'Strictly necessary' },
] as const;

export type LegalDocSlug = 'privacy' | 'terms' | 'risk' | 'cookies';

export const LEGAL_LINKS: { slug: LegalDocSlug; label: string; path: string }[] = [
  { slug: 'privacy', label: 'Privacy Policy', path: '/legal/privacy' },
  { slug: 'terms', label: 'Terms and Conditions', path: '/legal/terms' },
  { slug: 'risk', label: 'Risk Disclosure', path: '/legal/risk' },
  { slug: 'cookies', label: 'Cookie Policy', path: '/legal/cookies' },
];
