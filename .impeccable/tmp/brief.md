# Surface brief: landing page (src/components/landing/LandingPage.tsx)

Mode: Persuade. Audience: beginners/busy professionals and active traders, equal weight. Action: start free (register) or sign in. Proof: none real; all figures labelled illustrative. Constraints: Gunmetal Night / Stone / Amber palette binding; keep every existing claim (paper trading, exchange keys, roadmap) as product direction; routes /auth/login, /auth/register unchanged; no new heavy deps (motion is installed).

## Direction contract

THESIS: A trading copilot is only trusted if it shows its receipts. The page is one continuous decision ledger: the same Araiven trade plan appears at every layer (ask, score, risk veto, approval), set as rows, rules and tabular figures rather than a grid of cards. Refuses the category default of hero + three icon cards + stat row + centered gradient CTA.

OWN-WORLD: Gunmetal Night ground (#0b0e14/#10141d), Stone hairlines and text, Amber as a committed field (one full-bleed amber risk section, gunmetal ink on it) plus the single action colour. Bricolage Grotesque display (tight, large), Hanken Grotesk body, Red Hat Mono only for real data columns. Components are ledger rows, rule lines, tape-style logs, a product window with realistic data. No kickers, no section numbers, no glow, no gradients, no icon tiles.

STORY: Visitor sees an AI trading copilot that explains itself, watches it turn a plain-English question into a scored plan, sees the six gates and the receipt that totals the confidence score, sees their drawdown cap rule everything, trusts the security and phased roadmap, then starts free.

FIRST VIEWPORT: Left, 7 columns: display headline at ~5rem "The AI trading copilot that shows its work.", one-sentence lead, primary "Start with $100k paper money" and quiet secondary "See how it decides". Right, bleeding off the right edge and below the fold: the Araiven workspace window (watchlist rail, live-drawing chart with support/entry/stop/target, decision panel with score count-up and typed reasoning, Approve button). Primary action sits under the headline at left.

FORM: Persuade surface as a product-led ledger: hero workspace, Ask Araiven chat-to-plan, receipt-building gate rail (the receipt totals the hero BTC plan, 82), tabbed platform window (shared-indicator tabs adapted from Watermelon Fluid Tabs), amber-drenched risk guard, event-tape simulator, trust + roadmap, FAQ, close. seed:47791e0fafc06688 (the roll was run after the build; the shipped structure was chosen directly from the owner's research brief, not dealt).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
