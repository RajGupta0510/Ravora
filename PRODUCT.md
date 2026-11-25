# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences with equal weight:

- Beginners and busy professionals who have capital but little time or trading knowledge, and want opportunities without studying charts.
- Intermediate and active traders, and portfolio managers, who want the market scanned, scored and risk-limited for them.

Both want to understand why a trade is suggested before they act on it.

## Product Purpose

Ravora is an AI-powered wealth copilot and crypto trading terminal. Its decision engine, Araiven, scans markets, scores setups with fixed rules, and produces trade plans (entry, stop, target) with a plain-English reason. The user approves or rejects each plan. Success means a user can find, understand and size a trade without being a professional trader.

## Positioning

Araiven is a rules-based decision engine, not a chatbot. Every score comes from a calculation and every recommendation carries its reasoning, which a signal group or a general-purpose AI cannot truthfully offer. Setups below a 75% confidence score are never shown, and each user's drawdown cap (Conservative 1.5%, Balanced 3.5%, Aggressive 8.5%) acts as a veto.

## Operating Context

Users move from landing page to sign-up, a 7-step onboarding profile, then a dashboard with a trading terminal, portfolio, markets, opportunities, Araiven Copilot chat and settings. The intended path runs from a $100k paper-trading sandbox, to read-only exchange sync, to one-click live trading, to autopilot.

## Capabilities and Constraints

- Stack: React 18, Vite, TypeScript, Tailwind 3.4, Express with SQLite, Supabase Auth. Charts use a TradingView widget plus a native SVG engine.
- Terminology: Araiven (the engine), Confidence Score, Safety Score, paper trading, drawdown cap.
- Product status, stated by the owner: paper trading, exchange connection, live order execution and withdrawal-blocked exchange keys are not working properly yet. They will all be added or fixed in future.
- Owner decision: the landing page keeps presenting these capabilities as the product's direction. Do not remove them from it. Inside the app itself, do not show them as working until they are.
- Non-custodial intent: Ravora should never hold user funds.

## Brand Commitments

Name: Ravora. Engine: Araiven. Tagline: "Your Wealth, Intelligently Managed." Personality: intelligent, trustworthy, premium, professional, transparent. The existing palette (Gunmetal Night, Stone, Amber) is an established identity commitment.

## Evidence on Hand

No real testimonials, customer logos, performance results, user counts or press exist. Future work must not fabricate any. Figures shown in demos must be labelled as illustrative.

## Product Principles

1. Explainability is the product: no score, plan or alert appears without its reason.
2. Be honest about status: show only what works today, and label everything else as planned.
3. Risk limits come before opportunity: the user's drawdown cap can veto a setup.
4. The user decides: Araiven proposes, and nothing executes without approval.
5. Serve newcomers and experts together: plain language by default, full detail on demand.

## Accessibility & Inclusion

No product-specific standard has been set. Default to WCAG AA contrast and visible keyboard focus, and never rely on red and green alone to convey profit or loss.
