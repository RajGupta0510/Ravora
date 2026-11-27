# Ravora legal and compliance review checklist

Status: **draft, not reviewed by a lawyer.** The policies in `src/legal/docs.tsx` describe what the code does today. They are not legal advice and make no claim of regulatory approval, registration or certification. While `LEGAL.reviewed` in `src/legal/legalConfig.ts` is `false`, every policy page shows a "Draft pending legal review" notice. Set it to `true` only after counsel signs off.

## 1. What the audit found (facts taken from the code)

| Area | Finding |
| --- | --- |
| Product | AI-assisted analysis and trade planning. Orders are simulated against sandbox capital. Ravora is not an exchange, broker or custodian. |
| Exchange connection | Simulated in `src/controllers/copilotController.js`: credentials are discarded, the "KMS ARN" is a placeholder, the "withdraw" check is a string match. The Settings screen previously claimed AWS KMS storage and an active withdrawal lock. Both claims were removed and replaced with a preview notice. |
| Payments | None. No billing code, no paid plans. `LEGAL.paidServices` is `false`, so no Refund and Cancellation Policy was written. |
| Personal data stored | Name, email, phone (optional), Supabase auth identifiers, device fingerprint, IP address, user agent, portfolio, trade and copilot conversation history, settings. |
| Processors named | Supabase (auth), Resend or SendGrid (email), Twilio (SMS), Vercel and Render (hosting, per README), market data feeds (Binance, CoinGecko, CoinCap, CryptoPanic), TradingView (chart widget). The AI model provider is not identified in the code (`LEGAL.processors.ai` is `null`). |
| Analytics and ads | None found. No analytics SDK, no advertising cookies. |
| Third-party loads before consent | Google Fonts, the jsDelivr Supabase script and TradingView `tv.js` loaded on every page view. Fonts are now self-hosted, the CDN script was dropped, and TradingView loads only after the visitor allows it. |
| Account deletion | There was no UI. `DELETE /v1/user/profile/account` originally removed only the local `users` row. It now also turns foreign keys on and deletes the Supabase auth user. |
| Data export or correction | No self-service export or edit-profile flow found. Handled through the contact address in the policy. |

## 2. What was implemented

- Policy pages at `/legal/privacy`, `/legal/terms`, `/legal/risk`, `/legal/cookies`, with a table of contents, skip link and print styles.
- Consent: banner and preferences dialog with equal-weight Allow and Reject, stored in `localStorage` (`ravora_consent_v1`, versioned). Only one optional category exists (third-party content, TradingView). Strictly necessary storage is documented in the Cookie Policy.
- Links from the landing footer, sign-in and registration (new-tab Terms, Privacy and Risk links, collection notice, 18+ statement), the dashboard footer, Terminal and Opportunities execution notices, and Settings (Privacy and data card).
- Settings: Cookie settings control, typed-confirmation delete flow, accurate exchange-preview warning.
- Draft markers: every unknown is rendered as a highlighted "To be confirmed" item, never a made-up value.

## 3. Information only the owner can supply

Fill these in `src/legal/legalConfig.ts`:

- [ ] Legal entity name, entity type, registration number, registered address, governing jurisdiction.
- [ ] Privacy contact email and support email.
- [ ] Grievance Officer name, designation, email and address.
- [ ] AI model provider and where it processes data (`processors.ai`).
- [ ] Actual hosting regions (README says Vercel and Render; confirm).
- [ ] Which email provider is live (Resend or SendGrid) and whether SMS (Twilio) is in use.

## 4. Questions for a qualified lawyer

India (DPDP Act 2023)
- [ ] Which provisions and DPDP Rules are in force today, and the notice wording they require.
- [ ] Whether Ravora is a Significant Data Fiduciary.
- [ ] Verifiable parental consent: the product currently says 18+ only. Confirm that is acceptable and how age is to be verified.
- [ ] Retention periods (currently To be confirmed), breach-notification process, Data Protection Board escalation text.
- [ ] Cross-border transfer position given the processors above.
- [ ] Whether the delete flow plus a manual request for the auth record meets erasure obligations.

Financial regulation
- [ ] Whether AI trade ideas, "opportunities" and the copilot could be treated as investment advice or research under SEBI rules, or as a regulated activity elsewhere.
- [ ] Rules on virtual digital assets in India (tax, reporting, platform obligations) and in every other market you will serve.
- [ ] Marketing claims review: the landing page presents paper trading, exchange connection, live execution and withdrawal-blocked keys as product direction. Confirm the wording is not misleading while they are not live.
- [ ] Any licensing needed before live execution through user-linked exchange accounts.

Contract and consumer
- [ ] Terms: limitation of liability, indemnity, governing law and dispute forum, termination, changes to terms.
- [ ] Copyright and trademark notices; the footer currently reads "© 2026 Ravora" without an entity name.
- [ ] Third-party content terms (TradingView embed licence and attribution requirements, exchange and market data licences).
- [ ] If other jurisdictions are targeted: GDPR/UK GDPR, CCPA, MiCA and local crypto promotion rules.

## 5. Before paid plans launch

- [ ] Add a Refund and Cancellation Policy and a billing section in the Terms (not written now because nothing is sold).
- [ ] Update the Privacy Policy with the payment processor and invoice records.
- [ ] Review consumer-protection and tax invoicing rules, set `LEGAL.paidServices = true`.

## 6. Before real exchange connection goes live

- [ ] Replace the simulated `connectExchange` with real, encrypted credential storage, then update the Settings notice, Risk Disclosure and Privacy Policy to match what actually happens.
- [ ] Enforce withdrawal-disabled permissions server-side by reading the exchange's key permissions, not by string match.
- [ ] Security review of key storage and a documented incident process.

## 7. Engineering follow-ups noticed but not changed

- [x] Delete flow now removes the local rows (foreign keys enforced) and then the Supabase auth user. Needs `SUPABASE_SERVICE_ROLE_KEY` on the server, and it has not been run against a real account. Backups and logs are not covered; confirm retention with counsel.
- [ ] `vite.config.ts` proxies `/v1` to port 3001 `/api/v1`, which does not match `server.js`; check before relying on the dev proxy.
- [ ] Add a data export endpoint if access requests become frequent.
- [ ] Re-run an accessibility pass (keyboard, screen reader, contrast) on the consent dialog and legal pages with real assistive tech; only a browser check was done.
- [ ] If analytics or any non-essential storage is added later, add a category to the consent model and bump `LEGAL.consentVersion` so visitors are asked again.
