import React from 'react';
import { Link } from 'react-router-dom';
import { LEGAL, STORAGE_KEYS, type LegalDocSlug } from './legalConfig';
import { useConsent } from '../consent/ConsentContext';

/* ------------------------------------------------------------------ */
/* Small helpers: never invent a fact, always show what is missing     */
/* ------------------------------------------------------------------ */

/** A visible marker for something the owner or a lawyer must supply or confirm. */
export const Tbc: React.FC<{ what: string }> = ({ what }) => (
  <mark className="lg-tbc" title="Needs confirmation before this document is relied on">
    To be confirmed: {what}
  </mark>
);

const V: React.FC<{ value: string | null; what: string }> = ({ value, what }) => (value ? <>{value}</> : <Tbc what={what} />);

const Entity: React.FC = () => <V value={LEGAL.entity.legalName} what="the legal name of the entity that operates Ravora" />;

const MailTo: React.FC<{ email: string | null; what: string }> = ({ email, what }) =>
  email ? <a href={`mailto:${email}`}>{email}</a> : <Tbc what={what} />;

const OpenCookieChoices: React.FC = () => {
  const { openPreferences } = useConsent();
  return (
    <button type="button" className="lg-inline-btn" onClick={openPreferences}>
      open your storage and third-party content choices
    </button>
  );
};

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}
export interface LegalDoc {
  slug: LegalDocSlug;
  title: string;
  summary: string;
  sections: LegalSection[];
}

const Grievance: React.FC = () => {
  const g = LEGAL.contact.grievanceOfficer;
  return (
    <dl className="lg-dl">
      <div>
        <dt>Operated by</dt>
        <dd><Entity /></dd>
      </div>
      <div>
        <dt>Registered address</dt>
        <dd><V value={LEGAL.entity.registeredAddress} what="registered address" /></dd>
      </div>
      <div>
        <dt>Grievance contact</dt>
        <dd>
          <V value={g.name} what="name of the person who handles privacy grievances" />
          {g.designation ? `, ${g.designation}` : null}
        </dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd><MailTo email={g.email ?? LEGAL.contact.privacyEmail} what="privacy and grievance email address" /></dd>
      </div>
    </dl>
  );
};

/* ------------------------------------------------------------------ */
/* Privacy Policy                                                      */
/* ------------------------------------------------------------------ */

const privacy: LegalDoc = {
  slug: 'privacy',
  title: 'Privacy Policy',
  summary: 'What personal data Ravora collects, why, who handles it, how long it is kept, and how you can exercise your rights under India’s Digital Personal Data Protection Act, 2023.',
  sections: [
    {
      id: 'who',
      title: 'Who we are',
      body: (
        <>
          <p>
            This policy explains how <Entity /> (“Ravora”, “we”, “us”) handles personal data when you use the Ravora website and app. For the purposes of India’s Digital Personal
            Data Protection Act, 2023 (the “DPDP Act”), Ravora decides why and how your personal data is processed and is the Data Fiduciary.
          </p>
          <p>
            Ravora is an AI-assisted market analysis and trade-planning tool. It is not an exchange, a broker or a custodian, and it does not hold your funds. See the{' '}
            <Link to="/legal/terms">Terms and Conditions</Link> and the <Link to="/legal/risk">Risk Disclosure</Link>.
          </p>
          <Grievance />
        </>
      ),
    },
    {
      id: 'collect',
      title: 'What personal data we collect',
      body: (
        <>
          <p>We collect only what the product needs. This list reflects what the current version of Ravora actually collects:</p>
          <ul>
            <li><strong>Account details:</strong> your full name, and your email address and/or mobile number. Your password is handled by our sign-in system and kept in hashed form, not as plain text.</li>
            <li><strong>One-time codes:</strong> short-lived verification codes sent to your email or phone so we can confirm it is you.</li>
            <li><strong>Social sign-in:</strong> if you choose Google, GitHub or X, we receive the identifier and, where the provider shares it, the email address and name that provider confirms.</li>
            <li><strong>Profile and preferences:</strong> your trading experience, goals, risk stance (conservative, balanced or aggressive), markets of interest, assistant and dashboard preferences, and notification settings.</li>
            <li><strong>Your activity in Ravora:</strong> watchlists, paper-trading positions and trade history, opportunities you open or deploy, notifications, and your conversations with the Araiven Copilot.</li>
            <li><strong>Device and security data:</strong> a random identifier generated in your browser, your IP address, browser and device type (user agent), and sign-in times. We use these to recognise trusted devices, show you where you are signed in, limit abuse and secure your account.</li>
            <li><strong>Exchange connection details:</strong> the name of an exchange you connect. In the current version the exchange connection is a preview: credentials you type are not validated against the exchange and are not stored. Please do not enter real exchange credentials until live connection launches and this policy says so.</li>
            <li><strong>Messages we send you:</strong> verification codes and, if you leave them on, safety and opportunity notifications by email or SMS.</li>
          </ul>
          <p>
            Ravora does <strong>not</strong> currently collect payment card or bank details (there are no paid plans), government identity documents, or precise location, and it does not use analytics or advertising trackers.
            <Tbc what="confirmation that no other personal data is collected, for example by customer support tools" />
          </p>
        </>
      ),
    },
    {
      id: 'use',
      title: 'Why we use it',
      body: (
        <>
          <ul>
            <li>To create and secure your account, verify you, and keep you signed in.</li>
            <li>To provide the features you ask for: the trading terminal, paper-trading simulator, portfolio views, opportunities, notifications and the Araiven Copilot.</li>
            <li>To tailor explanations and risk limits to the profile and risk stance you give us.</li>
            <li>To send verification codes and the notifications you have switched on.</li>
            <li>To detect and prevent fraud, abuse and security incidents, and to keep logs needed to run the service.</li>
            <li>To meet legal obligations and respond to lawful requests.</li>
          </ul>
          <p>
            Where the DPDP Act requires your consent, we ask for it clearly and separately from other matters, and you can withdraw it as easily as you gave it. The DPDP Act also permits certain
            uses without consent, for example to comply with law. <Tbc what="counsel’s confirmation of which purposes rely on consent and which on other permitted uses" />
          </p>
          <p>We do not sell your personal data. We do not use it for advertising.</p>
        </>
      ),
    },
    {
      id: 'storage',
      title: 'Cookies and browser storage',
      body: (
        <p>
          Ravora stores a small amount of data in your browser to keep you signed in and secure. Optional third-party content, such as TradingView charts, loads only with your consent. Details,
          including each item stored, are in the <Link to="/legal/cookies">Cookie Policy</Link>. You can <OpenCookieChoices /> at any time.
        </p>
      ),
    },
    {
      id: 'share',
      title: 'Who handles your data for us',
      body: (
        <>
          <p>We share personal data only with service providers that help us run Ravora, and only as needed. Based on the current codebase these are:</p>
          <ul>
            <li><strong>Authentication:</strong> {LEGAL.processors.auth}.</li>
            <li><strong>Email delivery:</strong> {LEGAL.processors.email}.</li>
            <li><strong>SMS delivery:</strong> {LEGAL.processors.sms}.</li>
            <li><strong>Hosting:</strong> {LEGAL.processors.hosting}.</li>
            <li>
              <strong>AI model providers:</strong> messages you send to the Araiven Copilot, and portfolio context used to answer them, may be processed by a third-party AI model provider.{' '}
              <V value={LEGAL.processors.ai} what="which AI model provider(s) are live, and what data is sent to them" />
            </li>
            <li><strong>Market and news data:</strong> {LEGAL.processors.marketData}. These requests are made by Ravora’s servers and do not include your personal data.</li>
            <li><strong>Embedded charts (optional):</strong> {LEGAL.processors.charts}. If you allow it, TradingView receives your IP address and browser details directly from your browser.</li>
            <li><strong>Exchanges (when live connection launches):</strong> an exchange you connect will receive the instructions you approve, under its own terms and privacy policy.</li>
          </ul>
          <p>
            We may also disclose data to courts, regulators or law enforcement where the law requires it. <Tbc what="a signed data-processing agreement or equivalent terms with each provider" />
          </p>
        </>
      ),
    },
    {
      id: 'transfers',
      title: 'Where your data is processed',
      body: (
        <p>
          Some of our providers may process data outside India. The DPDP Act allows transfers outside India except to countries the Government of India restricts by notification. We will keep transfers within what the law allows.{' '}
          <Tbc what="the locations where our providers store and process data, and counsel’s view on any transfer restrictions" />
        </p>
      ),
    },
    {
      id: 'retention',
      title: 'How long we keep it',
      body: (
        <>
          <p>We keep personal data while your account is active and delete it when it is no longer needed for the purposes above or when you delete your account, unless the law requires us to keep some of it.</p>
          <p>
            <Tbc what="specific retention periods, for example for security logs, one-time codes and backups" />
          </p>
        </>
      ),
    },
    {
      id: 'rights',
      title: 'Your rights under the DPDP Act',
      body: (
        <>
          <p>As a Data Principal you have the right to:</p>
          <ul>
            <li>get a summary of the personal data we process about you and the processing we carry out;</li>
            <li>ask us to correct, complete or update your personal data;</li>
            <li>ask us to erase your personal data, unless we must keep it by law;</li>
            <li>withdraw your consent at any time (the consequences of withdrawing are explained when you do);</li>
            <li>have your grievance addressed, and escalate to the Data Protection Board of India if you are not satisfied with our response;</li>
            <li>nominate another person to exercise your rights if you die or become unable to.</li>
          </ul>
          <p>
            <strong>How to use them:</strong> sign in and open <strong>Settings, Privacy and data</strong> to change your consent choices or delete your account. For access, correction, nomination or any other request, contact us using the details in
            the “Who we are” section. <Tbc what="the time within which we will respond to requests" />
          </p>
          <p>
            Self-service download of your data is not yet available. Until it is, we handle access requests by email. Deleting your account in Settings removes the data Ravora holds in its own database and asks our authentication provider to
            delete your sign-in record. If that second step fails you will see a message, and you can try again or contact us. <Tbc what="whether backups or logs kept by us or our providers retain any data after deletion, and for how long" />
          </p>
        </>
      ),
    },
    {
      id: 'children',
      title: 'Children',
      body: (
        <p>
          Ravora is for adults only. You must be at least 18 years old to create an account. We do not knowingly collect personal data from anyone under 18, and the DPDP Act requires verifiable parental consent before a child’s data is processed, which Ravora does not offer. If we learn we
          hold such data, we will delete it.
        </p>
      ),
    },
    {
      id: 'security',
      title: 'How we protect it',
      body: (
        <>
          <p>
            We use access controls, hashed passwords and time-limited one-time codes, and we limit who can reach personal data. No system is completely secure. If a personal data breach occurs, we will notify the Data Protection Board of India and affected users as the DPDP Act and its rules require.
          </p>
          <p>
            <Tbc what="a description of the technical and organisational safeguards actually in place, such as encryption in transit and at rest, after a security review" />
          </p>
        </>
      ),
    },
    {
      id: 'other-laws',
      title: 'Other laws',
      body: (
        <p>
          This policy is written for users in India. If Ravora is offered to people elsewhere, such as the European Union or the United Kingdom, additional notices and legal bases may be required.{' '}
          <Tbc what="whether Ravora is offered outside India, and counsel’s advice on any additional notices" />
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      body: <p>If we change this policy in a way that matters, we will update the date at the top and, where the law requires, ask for your consent again. Earlier versions are available on request.</p>,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Terms and Conditions                                                */
/* ------------------------------------------------------------------ */

const terms: LegalDoc = {
  slug: 'terms',
  title: 'Terms and Conditions',
  summary: 'The rules for using Ravora, what Ravora does and does not do, and how AI outputs, paper trading and exchange integrations are treated.',
  sections: [
    {
      id: 'accept',
      title: 'Agreeing to these terms',
      body: (
        <>
          <p>
            These terms are an agreement between you and <Entity />. By creating an account or using Ravora you agree to them, to the <Link to="/legal/privacy">Privacy Policy</Link> and to the{' '}
            <Link to="/legal/risk">Risk Disclosure</Link>. If you do not agree, do not use Ravora.
          </p>
          <p>
            You must be at least 18 and able to enter a binding contract. You are responsible for making sure that using crypto-asset tools is lawful where you live. Rules for virtual digital assets differ by country and change often.{' '}
            <Tbc what="any countries or regions where Ravora is not offered" />
          </p>
        </>
      ),
    },
    {
      id: 'service',
      title: 'What Ravora is',
      body: (
        <>
          <p>
            Ravora is software for analysing crypto markets and planning trades. Its decision engine, Araiven, scores market setups using fixed rules, drafts a trade plan with a plain-language explanation, and tests it in a simulated
            (“paper”) account. The Araiven Copilot lets you ask questions about those results.
          </p>
          <p>
            Ravora is <strong>not</strong> an exchange, broker, dealer, custodian, wallet or payment service. It does not hold, receive or send your funds or crypto-assets. Trades happen, if at all, on an exchange you choose, under that exchange’s terms.
          </p>
          <p>
            <Tbc what="counsel’s view of Ravora’s regulatory position in India, including whether any registration, for example as a virtual digital asset service provider, or any investment-advice rules apply" />
          </p>
        </>
      ),
    },
    {
      id: 'advice',
      title: 'Not financial advice, and no guaranteed results',
      body: (
        <>
          <p>
            Everything Ravora shows, including scores, confidence figures, trade plans, risk ratings, alerts and Copilot answers, is general information produced by software. It is <strong>not</strong> investment, financial, legal or tax advice, and it is not a recommendation that you buy, sell or hold anything. It does not take your full circumstances into account.
          </p>
          <p>
            AI and model outputs can be wrong, incomplete or out of date. A confidence score is a model estimate, not a probability that a trade will make money, and nothing Ravora produces is a guarantee of profit, protection from loss or any particular return. Risk limits and stop levels may not hold in fast or illiquid markets.
          </p>
          <p>You make your own decisions and are solely responsible for them. Consider speaking to a qualified, independent adviser.</p>
        </>
      ),
    },
    {
      id: 'paper',
      title: 'Paper trading',
      body: (
        <p>
          Paper trading is a simulation using virtual money. It ignores or approximates fees, slippage, liquidity, latency and emotions, so simulated results are not a reliable indicator of real results. Figures and charts shown on our website are illustrations, not live data or promises.
        </p>
      ),
    },
    {
      id: 'accounts',
      title: 'Your account',
      body: (
        <ul>
          <li>Give accurate information and keep it up to date.</li>
          <li>Keep your password and one-time codes private. You are responsible for activity under your account.</li>
          <li>Tell us promptly if you think your account has been accessed without permission.</li>
          <li>One person per account. Do not share or sell accounts.</li>
        </ul>
      ),
    },
    {
      id: 'exchanges',
      title: 'Exchange integrations and execution',
      body: (
        <>
          <p>
            <strong>Current version:</strong> the exchange connection screen is a preview. It does not validate credentials with an exchange, does not store them, and Ravora does not place live orders. Please do not enter real exchange API credentials.
          </p>
          <p>When live connection and execution are introduced and these terms are updated, the following will apply:</p>
          <ul>
            <li>You connect an exchange account you own, using an API key with withdrawal permission switched off. Ravora is designed to work with read and trade permissions only.</li>
            <li>An order is placed only after you approve it, unless you later switch on an automation feature and accept its terms.</li>
            <li>The exchange, not Ravora, executes orders, holds your assets and sets its own fees, limits and downtime. Ravora is not responsible for exchange errors, outages, rejections, price differences or losses at the exchange.</li>
            <li>You must follow the exchange’s terms and keep your API credentials secure.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'fees',
      title: 'Fees',
      body: (
        <>
          <p>
            Ravora does not currently charge for use of the paper-trading service. <Tbc what="confirmation that no fees apply today" />
          </p>
          <p>If paid plans are introduced, we will publish prices, billing, cancellation and refund terms before you pay and ask for your agreement to them. A Refund and Cancellation Policy will be added at that point.</p>
        </>
      ),
    },
    {
      id: 'conduct',
      title: 'Acceptable use',
      body: (
        <>
          <p>You agree not to:</p>
          <ul>
            <li>break the law or use Ravora to launder money, evade sanctions or manipulate markets;</li>
            <li>try to access other users’ data, probe or attack the service, or bypass its limits;</li>
            <li>scrape, copy or resell Ravora’s outputs or data at scale, or reverse-engineer the service where the law allows us to forbid it;</li>
            <li>upload malicious code or misuse the Copilot to produce harmful content.</li>
          </ul>
        </>
      ),
    },
    {
      id: 'ip',
      title: 'Ownership and copyright',
      body: (
        <>
          <p>
            Ravora, Araiven, the site design, software and content are owned by <Entity /> or its licensors and protected by copyright and other laws. © {new Date(LEGAL.lastUpdated).getFullYear()} <Entity />. All rights reserved.
          </p>
          <p>We give you a limited, personal, non-transferable licence to use Ravora under these terms. Third-party names and marks, such as exchange and TradingView names, belong to their owners and do not imply endorsement.</p>
        </>
      ),
    },
    {
      id: 'third',
      title: 'Third-party services',
      body: <p>Ravora relies on third-party services for sign-in, messaging, hosting, market data, AI models and optional charts. They are listed in the <Link to="/legal/privacy">Privacy Policy</Link>. We are not responsible for their availability or accuracy.</p>,
    },
    {
      id: 'liability',
      title: 'Disclaimers and limits on liability',
      body: (
        <>
          <p>
            Ravora is provided “as is” and “as available”. To the extent the law allows, we do not promise that it will be uninterrupted, error-free or fit for a particular purpose, and we are not liable for trading or investment losses, lost profits, or indirect or consequential loss arising from your use of Ravora or reliance on its outputs.
          </p>
          <p>Nothing in these terms limits liability that cannot be limited by law.</p>
          <p>
            <Tbc what="counsel’s review of these limits, any liability cap, and their enforceability under Indian law" />
          </p>
        </>
      ),
    },
    {
      id: 'end',
      title: 'Suspension, ending and deleting your account',
      body: <p>You can stop using Ravora and delete your account in Settings at any time. We may suspend or end access if you break these terms, if required by law, or to protect users or the service. Sections that by their nature should continue, such as ownership, disclaimers and liability, will continue.</p>,
    },
    {
      id: 'law',
      title: 'Governing law and disputes',
      body: (
        <p>
          These terms are governed by the laws of <V value={LEGAL.entity.jurisdiction} what="governing law and the courts that will hear disputes" />. Please contact us first so we can try to resolve any complaint informally.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changes and contact',
      body: (
        <>
          <p>We may update these terms. If a change matters, we will tell you in the app or by email and update the date above. Continued use after the change means you accept it.</p>
          <Grievance />
        </>
      ),
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Risk Disclosure                                                     */
/* ------------------------------------------------------------------ */

const risk: LegalDoc = {
  slug: 'risk',
  title: 'Crypto Trading Risk Disclosure',
  summary: 'Plain-language warnings about trading crypto-assets, using AI tools and relying on simulated results. Read this before you act on anything Ravora shows.',
  sections: [
    {
      id: 'summary',
      title: 'The short version',
      body: (
        <ul>
          <li><strong>You can lose all the money you put into crypto-assets.</strong> Only trade what you can afford to lose entirely.</li>
          <li><strong>Ravora does not guarantee profit.</strong> AI scores, confidence figures and trade plans can be wrong.</li>
          <li><strong>Ravora is not financial advice</strong> and is not an exchange, broker or custodian.</li>
          <li><strong>Simulated results are not real results.</strong></li>
        </ul>
      ),
    },
    {
      id: 'market',
      title: 'Market risk',
      body: (
        <ul>
          <li>Crypto-asset prices are highly volatile and can fall sharply and quickly, at any hour, with no trading halts.</li>
          <li>Markets can gap through stop-loss levels, so a stop may fill far from the price you set or not at all.</li>
          <li>Thin liquidity can make it hard to enter or exit at the price you expect (slippage).</li>
          <li>Leverage, including the 1x to 10x settings shown in the paper-trading simulator, magnifies losses as well as gains and can wipe out your position quickly.</li>
        </ul>
      ),
    },
    {
      id: 'ai',
      title: 'Risks of AI and model outputs',
      body: (
        <ul>
          <li>Araiven’s scores and the Copilot’s answers come from software that uses rules, historical and live data, and possibly third-party AI models. They can be wrong, outdated, incomplete or biased.</li>
          <li>A <strong>confidence score</strong> is a model estimate. It is not a probability of profit, a forecast, or a promise.</li>
          <li>Models can fail in unusual markets, and past patterns may not repeat.</li>
          <li>Data feeds can be delayed, wrong or interrupted, and alerts can arrive late or not at all.</li>
          <li>Risk caps such as the 1.5%, 3.5% and 8.5% drawdown targets are goals the software works toward. They are not guarantees that your losses will stay within them.</li>
        </ul>
      ),
    },
    {
      id: 'simulated',
      title: 'Simulated and illustrative results',
      body: (
        <p>
          Paper-trading results, charts, balances and examples on Ravora and its website are simulations or illustrations. They do not reflect real fees, slippage, liquidity or the pressure of real money, and they do not indicate what you would have earned or will earn. Hypothetical performance has inherent limits.
        </p>
      ),
    },
    {
      id: 'exchange',
      title: 'Exchange, custody and technology risk',
      body: (
        <ul>
          <li>An exchange can be hacked, go offline, freeze withdrawals, suffer insolvency or change its rules. Your assets there are held by the exchange, not by Ravora.</li>
          <li>API keys can be stolen or misused. Never enable withdrawal permission on a key you give any third party, and use the narrowest permissions possible.</li>
          <li>Software can contain bugs. Automation, where offered in future, can place unwanted orders if something goes wrong.</li>
          <li>The exchange connection in the current version of Ravora is a preview and does not place live orders.</li>
        </ul>
      ),
    },
    {
      id: 'regulatory',
      title: 'Legal, regulatory and tax risk',
      body: (
        <>
          <ul>
            <li>Rules for virtual digital assets differ between countries and change. In India, crypto-assets are not legal tender and are subject to specific tax treatment and reporting. Check the current rules with a qualified tax adviser.</li>
            <li>It is your responsibility to know and follow the laws that apply to you.</li>
          </ul>
          <p>
            <Tbc what="counsel’s review of the regulatory and tax statements in this section" />
          </p>
        </>
      ),
    },
    {
      id: 'decide',
      title: 'Making your own decisions',
      body: (
        <p>
          Ravora gives you information and tools. You decide whether to act, and you carry the result. Consider your goals, finances and experience, and seek independent advice from a suitably qualified professional where appropriate. See also the{' '}
          <Link to="/legal/terms">Terms and Conditions</Link>.
        </p>
      ),
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Cookie and storage policy                                           */
/* ------------------------------------------------------------------ */

const cookies: LegalDoc = {
  slug: 'cookies',
  title: 'Cookie and Browser Storage Policy',
  summary: 'What Ravora stores in your browser, what loads from other companies, and how to control it.',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      body: (
        <>
          <p>
            Ravora does not set advertising or analytics cookies and does not use analytics or advertising trackers. It stores a small amount of data in your browser’s local and session storage to keep you signed in and secure. Optional third-party content loads only if you allow it. You can{' '}
            <OpenCookieChoices /> at any time.
          </p>
          <p>Fonts on Ravora are served from our own domain, not from Google or another font host.</p>
        </>
      ),
    },
    {
      id: 'necessary',
      title: 'Strictly necessary storage (no consent needed)',
      body: (
        <>
          <p>These items are needed to run your account securely. Without them you cannot stay signed in. They are not used for tracking.</p>
          <div className="lg-table-wrap" tabIndex={0} role="region" aria-label="Storage items table, scrollable">
            <table className="lg-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">What it is for</th>
                  <th scope="col">Type</th>
                  <th scope="col">How long</th>
                </tr>
              </thead>
              <tbody>
                {STORAGE_KEYS.map((k) => (
                  <tr key={k.key}>
                    <th scope="row"><code>{k.key}</code></th>
                    <td>{k.purpose}</td>
                    <td>{k.type}</td>
                    <td>{k.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: 'optional',
      title: 'Optional third-party content (needs your consent)',
      body: (
        <>
          <div className="lg-table-wrap" tabIndex={0} role="region" aria-label="Optional content table, scrollable">
            <table className="lg-table">
              <thead>
                <tr>
                  <th scope="col">Service</th>
                  <th scope="col">What it does</th>
                  <th scope="col">What it receives</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">TradingView</th>
                  <td>Shows interactive price charts in the trading terminal.</td>
                  <td>Your IP address and browser details. TradingView may set its own cookies, under its own policy.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>The script is requested from TradingView only after you allow it. If you do not, the terminal uses Ravora’s native chart. If you change your mind, withdrawing consent stops further loading of TradingView content on your next page view, and you can also clear TradingView’s cookies in your browser.</p>
        </>
      ),
    },
    {
      id: 'manage',
      title: 'Managing your choices',
      body: (
        <ul>
          <li>Use the “Cookie settings” link in the footer, or Settings, Privacy and data, in the app, to change your choice at any time. Withdrawing is as easy as giving consent.</li>
          <li>You can also clear site data in your browser settings. This signs you out and removes your saved choice.</li>
        </ul>
      ),
    },
    {
      id: 'changes',
      title: 'Changes',
      body: (
        <p>
          If we add a new optional category, such as analytics, we will update this page and ask for your choice again before it is used. See also the <Link to="/legal/privacy">Privacy Policy</Link>.
        </p>
      ),
    },
  ],
};

export const DOCS: Record<LegalDocSlug, LegalDoc> = { privacy, terms, risk, cookies };
