---
name: Ravora
description: The landing page's world. A chronometer on certificate paper, where large Gunmetal case panels hold the instruments and Amber is the jewel, the hand, the marker and the action.
colors:
  stone-paper: "#eef1f5"
  stone-paper-bright: "#f6f8fb"
  paper-surface: "#f8fafc"
  paper-inset: "#e5e9ef"
  ink: "#0b0e14"
  paper-body: "#394456"
  paper-muted: "#5a6578"
  case: "#10141d"
  case-2: "#151a26"
  case-3: "#1b2232"
  case-inset: "#0e121b"
  case-text: "#f8fafc"
  case-body: "#cbd5e1"
  case-muted: "#94a3b8"
  amber: "#f59e0b"
  amber-hi: "#fbbf24"
  amber-deep: "#b45309"
  gain-green: "#10b981"
  gain-green-paper: "#047857"
  loss-red: "#f87171"
  loss-red-paper: "#b91c1c"
typography:
  display:
    fontFamily: "Familjen Grotesk, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(2.7rem, 5.6vw, 5.2rem)"
    fontWeight: 650
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Familjen Grotesk, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.4vw, 3.6rem)"
    fontWeight: 650
    lineHeight: 1.04
    letterSpacing: "-0.034em"
  title:
    fontFamily: "Familjen Grotesk, Albert Sans, system-ui, sans-serif"
    fontSize: "1.6rem"
    fontWeight: 650
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  index-label:
    fontFamily: "Familjen Grotesk, Albert Sans, system-ui, sans-serif"
    fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Albert Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  lead:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1.14rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Albert Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 650
    lineHeight: 1.2
  data:
    fontFamily: "Martian Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "0.78rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  data-figure:
    fontFamily: "Martian Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "clamp(2.4rem, 5vw, 3.3rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.06em"
    fontFeature: "tnum"
rounded:
  xs: "4px"
  sm: "9px"
  md: "10px"
  lg: "18px"
  xl: "22px"
  chat: "28px"
  showcase: "clamp(26px, 3vw, 40px)"
  instrument: "clamp(28px, 3.4vw, 44px)"
  panel: "clamp(28px, 3.6vw, 48px)"
  pill: "99px"
spacing:
  gutter: "28px"
  frame: "clamp(8px, 1.2vw, 18px)"
  section: "clamp(80px, 9vw, 136px)"
  panel-pad: "clamp(64px, 7.5vw, 112px)"
  row: "22px"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 26px"
  button-primary-hover:
    backgroundColor: "{colors.amber-hi}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 26px"
  button-small:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "42px"
    padding: "0 20px"
  case-panel:
    backgroundColor: "{colors.case}"
    textColor: "{colors.case-body}"
    rounded: "{rounded.panel}"
  risk-panel:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
  instrument:
    backgroundColor: "{colors.case}"
    textColor: "{colors.case-body}"
    rounded: "{rounded.instrument}"
    padding: "22px 26px"
  certificate:
    backgroundColor: "{colors.case-2}"
    textColor: "{colors.case-body}"
    rounded: "{rounded.xl}"
    padding: "8px 24px 22px"
  index-item-active:
    backgroundColor: "{colors.case-2}"
    textColor: "{colors.case-text}"
    rounded: "{rounded.xl}"
    padding: "22px 26px"
  showcase:
    backgroundColor: "{colors.case}"
    textColor: "{colors.case-body}"
    rounded: "{rounded.showcase}"
    padding: "26px"
  pair-active:
    backgroundColor: "{colors.case-3}"
    textColor: "{colors.amber-hi}"
    rounded: "{rounded.sm}"
---

# Design System: Ravora (chronometer landing world)

Scope note: the primary system below is the landing page, scoped under `.rv` in `src/components/landing/landing.css`. The auth pages and the dashboard still run on the previous dark world, recorded in the last sections of this file until they are migrated. Do not assume the landing tokens apply there, and do not merge the two without an explicit decision.

## Overview

**Creative North Star: "The Chronometer"**

The page is a certificate-grade timepiece laid on Stone paper. The decision Araiven makes is shown as a movement: a dial whose hand settles on a score, gears that turn as gates engage, a receipt that totals a weighted score, a calibration track that draws as the roadmap advances. Where a conventional page would place cards on a gradient, this one sets a few very large rounded Gunmetal case panels into the paper like instruments into a bench, and lets the paper carry ruled, engraved hairline structure between them.

Stone paper is the ground and Gunmetal is the case. Amber has four jobs and no others: the jewel (the dial's centre stone, lit gear-train jewels), the hand and marker (the highlighter sweep under the hero phrase, the shared index marker, lit ticks), the action colour (every primary button, selected pairs, focus), and exactly one committed full-bleed panel (the risk guard) where ink sits on Amber. Display type is Familjen Grotesk, tight and large; Albert Sans reads; Martian Mono only marks dials and tabular data. Density is moderate and the section rhythm is generous (80 to 136px) between panels.

**Key Characteristics:**
- Large rounded Gunmetal case panels (28 to 48px radius) inset into Stone paper with an 8 to 18px frame, not cards on a page.
- Exactly one full-bleed Amber panel, and it is the risk guard.
- Semantic custom properties (`--t`, `--b`, `--m`, `--r`, `--s`, `--s2`, `--acc`, `--pos`, `--neg`, `--focus`) flip inside `.rv-case` and `.rv-amber`, so every component works on paper, Gunmetal or Amber.
- Signature components are mechanical: dial, gear train, certificate receipt, calibration track.
- Ruled lists and hairlines carry structure; 1.5px ink top rules start each ruled list.
- Depth is tonal; one soft lift under the hero instrument.

## Colors

Cool Stone paper, Gunmetal case, one warm Amber used as a jewel rather than a wash (except once).

### Primary
- **Signal Amber** (#f59e0b): the jewel (dial centre, lit jewels, gear hubs, threshold marker), the hand and marker (hero highlighter sweep, index list bullets, now-node on the track, caret, lit ticks), the action fill (primary buttons, approve), selection, and, once, the full-bleed risk panel.
- **Amber Lift** (#fbbf24): hover for Amber fills, selected pair text, pressed segment text on the Amber panel, and Amber as text on Gunmetal (via `--acc`).
- **Amber Deep** (#b45309): Amber as small text on paper (via `--acc`) and the focus ring colour on paper. It exists because #f59e0b fails contrast as small text on Stone.

### Neutral
- **Stone Paper** (#eef1f5): page ground, nav at 94% alpha, drawer, and the colour punched through gear holes and certificate notches. Stone Paper Bright (#f6f8fb) is declared as a spare lift.
- **Paper Surface** (#f8fafc) and **Paper Inset** (#e5e9ef): `--s` and `--s2` on paper.
- **Ink** (#0b0e14): headings, ink on Amber, and the base of every hairline on paper (15% regular, 8% soft, 42% strong).
- **Paper Body** (#394456) and **Paper Muted** (#5a6578): body and secondary copy on paper.
- **Case** (#10141d), **Case 2** (#151a26), **Case 3** (#1b2232), **Case Inset** (#0e121b): the Gunmetal panel, its raised surface, bezel and user bubble, and its recessed wells.
- **Case Text** (#f8fafc), **Case Body** (#cbd5e1), **Case Muted** (#94a3b8): text on Gunmetal; Case Body is also the hairline hue there (16%, 9%, 42% alpha).

### Semantic (data only)
- **Gain Green** (#10b981) on Gunmetal and **Gain Green Paper** (#047857) on paper; **Loss Red** (#f87171) on Gunmetal and **Loss Red Paper** (#b91c1c) on paper. Used on candles, levels (target and stop), book sides, pass and fail chips, never as sole meaning: values carry signs and labels.

### Named Rules
**The One Panel Rule.** Exactly one panel is flooded with Amber, and it is the one about the user's drawdown cap. On it text and rules are ink, the focus ring is ink and no other chroma appears. A second Amber panel dilutes the veto.
**The Jewel Rule.** Amber is a small bright object (stone, hand, marker, bullet, node, button), never a fill behind content, a tint on idle cards, or a gradient.
**The Deep On Paper Rule.** Amber text on paper is Amber Deep (#b45309); Amber Lift is for Gunmetal. Never set #f59e0b as small text on Stone.
**The Data Color Rule.** Green and red appear only on market data and verdict chips, in the variant matched to the ground.

## Typography

**Display Font:** Familjen Grotesk (with Albert Sans, system-ui)
**Body Font:** Albert Sans (with system-ui, Segoe UI)
**Label/Mono Font:** Martian Mono (with ui-monospace, Cascadia Mono, Consolas)

**Character:** Familjen is wide-shouldered and confident, tight at large sizes; Albert is a calm, neutral reader. Martian Mono is wide and engineered, reserved for dial numerals and tabular figures. All three are self-hosted variable woff2 (`font-display: swap`), declared in `src/theme/ravora-fonts.css`.

### Hierarchy
- **Display** (650, clamp(2.7rem, 5.6vw, 5.2rem), 1.0, -0.04em, balanced): the hero H1; one phrase carries the Amber highlighter sweep.
- **Headline** (650, clamp(2.1rem, 4.4vw, 3.6rem), 1.04, -0.034em, max 19ch, balanced): section H2s. The close CTA raises it to clamp(2.4rem, 5.4vw, 4.6rem), 16ch.
- **Title** (650, 1.15 to 1.6rem, ~1.12, -0.02 to -0.025em): gate, plan, fact and phase headings. Index labels run clamp(1.6rem, 2.8vw, 2.3rem). Gate numerals run clamp(3.2rem, 6.4vw, 5.4rem). The drawdown cap number is Familjen at clamp(4.4rem, 10.5vw, 6rem).
- **Body** (400, 1.0625rem, 1.6): copy; lead is 1.14rem at 1.65, capped at 52ch.
- **Label** (650, 0.9 to 1rem, Albert Sans): buttons, segmented controls, nav links at 550; sentence case, never uppercase.
- **Data** (Martian Mono 500 to 600, 0.68 to 0.84rem, tabular-nums, -0.02em): tape, times, plan grid, table figures, dial numerals, status chips. Large figures (dial score clamp(2.4rem, 5vw, 3.3rem), receipt total 2.6rem, balance 2rem, `.rv-big` 2.4rem) run at -0.05 to -0.06em.

### Named Rules
**The Mono Is A Dial Rule.** Martian Mono marks dials, scores, prices, times, tickers and status chips. Prose, buttons and headings never use it.
**The Tight Display Rule.** Display and headline tracking stays between -0.015em and -0.06em; large size and tight tracking are the voice.

## Layout

A 1240px centred wrap with 28px side padding (20px under 640px). The page alternates paper sections and rounded case panels set in a frame of 8 to 18px, so panel edges sit close to the viewport and paper shows as a thin mat around them. Sections pad clamp(80px, 9vw, 136px); tight sections clamp(56px, 6vw, 96px); panels clamp(64px, 7.5vw, 112px); the close CTA clamp(80px, 10vw, 150px). Splits are asymmetric (hero 1/1.05, ask 0.85/1.15, gates 0.8/1.2, index 0.9/1.1, risk 1/1) and collapse to one column at 1040px; sticky columns (certificate, showcase at top 104px) become static there. On wide screens the hero instrument bleeds off the right edge (negative right margin, square right corners) and sits in-flow below 1041px. Lists are ruled rows: prompts, gates (clamp 76 to 120px numeral column), events (96px time column), facts, FAQ, plan rows. The calibration track is four columns, two at 1040px, one at 640px. Nav is fixed, 74px, paper at 94% alpha with a hairline once scrolled, and a hamburger drawer under 960px. Under 640px the hero note hides and hero buttons stack full width.

## Elevation & Depth

Flat and tonal. Depth is the contrast of Gunmetal panels against paper, stepped Case surfaces inside them (Case, Case 2, Case Inset) and 1px hairlines. The single shadow is the hero instrument's lift (`0 40px 80px -30px rgba(11,14,20,0.5)`), because it is the one object that must read as a precision piece resting on paper. A fixed engraved guilloche (concentric 1px rings at 5.5% ink, masked radially, no glow) sits behind the hero. Rings in the close panel are 1px outlines that expand and fade.

### Named Rules
**The Hairline Over Shadow Rule.** Separate with 1px rules or a tonal step. A shadow belongs to the hero instrument only.
**The No Glow Rule.** No blurred glows, gradient fills or frosted glass; the only gradients are the marquee edge mask and the hero ring mask.

## Shapes

Instruments are generously rounded, details are modest. Case panels 28 to 48px (fluid), hero instrument 28 to 44px, showcase 26 to 40px, chat 28px, certificate and index items 22px, plan card and mock panels 18px, tape 14px, segmented controls 12px with 9px inner segments, buttons 10px, fields 9px, logo mark 9px, chips 6 to 8px, bars 99px. The chat bubble has one 4px corner toward the speaker. Circles are structural: dial, gear and jewel, 26px event ticks, 18px calibration nodes, certificate notches (18px paper-coloured punches on the sides). Rules above ruled lists are 1.5px ink, interior rules are 1px. Bullets are 8 to 9px by 2px amber or muted dashes; marquee separators are rotated 9px amber diamonds.

## Components

### Buttons
- **Shape:** 10px radius, 52px tall (42px small, 44px in plan actions and approve), weight 650, 1.5px transparent border.
- **Primary:** Amber fill, ink text; hover Amber Lift and lifts 2px; active returns to 0; disabled 55% opacity. The trailing arrow slides 5px right on hover.
- **Ghost:** transparent, ink or case-text label, 1.5px strong-rule border; hover darkens the border to full text colour and lifts 2px.
- **Focus:** 2px outline in `--focus` (Amber Deep on paper, Amber on Gunmetal, ink on Amber), 3px offset, on every interactive element.

### Navigation
- Fixed paper bar; links 0.94rem at 550 in body colour, with a 2px Amber underline that scales in from the left on hover and for the active section. Sign-in is a quiet text button beside a small Amber primary. The logo mark is a 32px Gunmetal rounded tile with an Amber glyph. Under 960px a 42px bordered burger opens a paper drawer of ruled links.

### Dial (signature, hero instrument)
- A Gunmetal case holding a circular dial: Case 3 bezel, inset face, 1.4px ticks (major 2.2px) that light Amber up to the score, a 7px Amber arc, Martian Mono numerals, an Amber threshold marker, a white hand that rotates to the score over 1.2s, and a ring-jewel centre (Gunmetal seat, Amber stone). Beneath: a candle strip with dashed entry (Amber), target (green) and stop (red) levels fading on in sequence, a four-column plan grid, typed reasoning behind an Amber block caret, pair switch (active pair is Amber Lift on a 12% Amber tint with a 35% Amber edge), and an Approve button that is ghost until ready, then Amber, then a green done state.

### Gears (signature, Movement)
- A gear train in Gunmetal with Case 3 strokes, paper-coloured holes, rounded spokes and Amber hubs. The three gears genuinely mesh (centre distance is the sum of pitch radii and tooth phase is aligned), and they turn with scroll through a `--p` custom property (0 to 1) set on the section while six ring jewels in seats light Amber as each gate engages. The same dial reappears settled at 82 inside the closing panel.

### Certificate (signature, receipt and key check)
- A raised 22px surface with a 1px hairline and two 18px paper-coloured notches on the sides, a dashed rule under its title, rows that start at 40% opacity and switch on in sequence, and a 2.6rem mono total that turns Amber (`--acc`) on pass, with a verdict line in green. The key-check variant swaps the rows for permission rows with ok and no chips (mono 0.68rem on 12% tints).

### Index List with Shared Marker (showcase)
- Platform tabs are a list of large Familjen labels. The active item opens its heading, copy and dash-bulleted list inside a shared marker (22px radius, surface fill, 1px hairline) that glides between items; inactive labels are muted. A sticky Gunmetal showcase panel on the right swaps its mock (ruled table, order book with scaleX depth bars, ticket, bar rows) with the selection.

### Marquee (Coverage)
- Two rows of display-type names separated by rotated amber diamonds, the second row smaller, muted, with muted diamonds, counter-scrolling at 46s and 58s with 8% edge masks, pausing on hover. Rows are duplicated groups for a seamless loop.

### Ask Araiven (chat, tape, plan card)
- Ruled prompt rows (active in Amber via `--acc`, hover slides 12px right) beside a 28px chat surface: user bubble in Case 3, mono tape lines that fade in, and a 18px plan card with score, definition rows, reasoning and two actions; a filtered plan greys its score.

### Risk Guard (Amber panel)
- Segmented Conservative, Balanced, Aggressive control with a 1.5px ink border; the pressed segment is an ink fill with Amber Lift text. A giant ink cap number, an equity line (2.4px ink stroke, 10% ink area, morphing path, ink dot) and allocation bars in ink on 16% ink, with 1.5px ink top rules.

### Event Tape and Calibration Track
- Events are ruled rows (mono time, Familjen label, detail, 26px tick): current labels turn `--acc`, done ticks fill green with a check. The scenario plays once automatically when the section scrolls into view (the button replays it) with an Amber progress rail above the rows. The roadmap is four staggered steps (each one 38px lower than the last), each with a 2px rule that draws left to right, a large Familjen numeral (Amber for the current phase) and its bullet list.

### FAQ and Facts
- Ruled rows, questions in 1.3rem Familjen with a plus drawn from two 2px bars that rotates to minus; answers cap at 64ch.

## Motion

One easing, `cubic-bezier(0.22, 0.61, 0.36, 1)` (`--ease`), runs entrances and state changes. Scroll reveals come in three authored kinds, all starting from a visible default (script only adds `.is-in`, and keyframes with backwards fill supply the entrance): a plain 24px rise (`k-rise`), a headline line-wipe using clip-path (`k-wipe`) and a panel rise-and-scale (`k-pop`), staggered by `--rv-delay`; lists such as the facts and FAQ stagger by child. The hero headline marker draws in, the dial hand and arc settle on an expo-out curve, the gears turn with scroll, and the amber risk gauge hand swings between stance values.

**Reduced motion:** a `prefers-reduced-motion: reduce` block forces reveal, hero, instrument and phase content visible with transitions and animations removed, shows the highlighter fully drawn, stops the marquees, rings, caret and bars, completes the calibration track, and removes gear, hand and arc transitions; `hooks.ts` also reads the media query so typing and count-up land on their final state.

### Named Rules
**The Visible By Default Rule.** Content is readable without script or entrance animation; reveal state is added by JS only, and keyframes supply entrances, not content.
**The One Easing Rule.** New entrances and state changes use `--ease`; do not introduce bounce or elastic curves.

## Do's and Don'ts

### Do:
- **Do** frame every major section as a rounded Gunmetal case panel on Stone paper, or as ruled rows with a 1.5px ink top rule and 1px interior rules, before reaching for a card.
- **Do** use the semantic variables (`--t`, `--b`, `--m`, `--r`, `--s`, `--s2`, `--acc`) in components so they work on paper, Gunmetal and Amber.
- **Do** keep Amber (#f59e0b) for jewels, hands, markers, action fills and the single risk panel; use Amber Lift (#fbbf24) for text on Gunmetal and Amber Deep (#b45309) for small text on paper.
- **Do** set dial numerals, scores, prices, times and chips in Martian Mono with tabular numerals.
- **Do** label demo figures as illustrative and pair green and red with a sign or label (PRODUCT.md).
- **Do** keep the 2px focus ring in `--focus` and honour `prefers-reduced-motion` for every new animation.

### Don't:
- **Don't** add a second full-bleed Amber panel, gradient fills, glows, frosted glass or icon tiles.
- **Don't** set Martian Mono in prose, buttons or headings.
- **Don't** set #f59e0b as small text on Stone paper.
- **Don't** apply the landing tokens to the auth pages or dashboard; they remain on the previous world until a migration is decided.
- **Don't** invent testimonials, logos, user counts or performance claims; none exist (PRODUCT.md).
- **Don't** put shadows on rows or cards; the hero instrument lift is the only shadow.

## Previous dark world (auth pages and dashboard, pending migration)

The auth pages and the dashboard still render in the earlier "decision ledger" world, scoped by `.ra` and `src/theme` tokens, not by `.rv`. Key tokens: Gunmetal Night #0b0e14 ground, Gunmetal Raised #10141d, Gunmetal Card #151a26, Gunmetal Card 2 #1b2232, Gunmetal Inset #0e121b; Stone Bright #f8fafc, Stone Body #cbd5e1, Stone Quiet #94a3b8; Signal Amber #f59e0b (action) with Amber Lift #fbbf24 (hover and text on dark); Gain Green #10b981 and Loss Red #ef4444 on data only. Fonts: Bricolage Grotesque (display), Hanken Grotesk (body), Red Hat Mono (data), self-hosted and still declared in `src/theme/ravora-fonts.css`. Hairlines are 1px Stone alpha (8%, 12%, 26%); radii 4, 7, 8, 12, 14, 99px; flat and tonal with a single lift shadow on the old hero window.

### Auth pages

Sign-in, registration, forgot, reset and code verification live in `components/ui/auth-card.tsx`, styled by `components/ui/auth-card.css` under the `.ra` scope with the previous world's values. They use the shared fonts via `src/theme/ravora-fonts.css`.

- **Layout:** a 46/54 split on desktop: a Gunmetal Raised story panel (logo, headline that changes with sign-in or register, a five-row ruled Araiven tape in Red Hat Mono labelled "Illustrative sequence, not live data") beside a 400px form column anchored near the top so the mode switch never moves. Under 1000px the story panel is hidden.
- **Mode switch:** two `aria-pressed` buttons with a shared tonal pill (Gunmetal Card 2 with a 1px Amber-alpha edge, springing via motion `layoutId`). The submit button stays the single Amber mass on the page.
- **Fields:** visible sentence-case labels, 48px Gunmetal Inset inputs with an 8px radius and a 1px Stone border at about 0.46 alpha (control-level contrast), one soft Amber ring on focus, inline errors with an icon in loss red and `aria-invalid`. No icons inside inputs, no uppercase micro-labels.
- **Motion:** forms and the story headline cross-fade on mode change (0.3s, the previous world's easing); the tape plays once per visit, outside the keyed block; reduced motion removes it.
- **Do not** reintroduce frosted glass, gradient buttons or icons-in-inputs on these pages.

### Dashboard (Operate extension)

The dashboard under `src/components/dashboard/` is an Operate surface in the previous world: Gunmetal ground, Stone rules and text, one flat Amber action colour, Bricolage for headings and metrics, Hanken Grotesk for everything else. Density is higher than the landing page, so it runs on a dense ramp: 0.72rem captions (the floor), 0.8rem body, 0.88rem values, 1rem, 1.15rem metrics and 1.6rem figures. Labels are sentence case, never uppercase and never widely tracked. Active navigation is a tonal Gunmetal Card 2 step with an inset Amber-alpha ring, not a side stripe. All legacy `--gradient-*` tokens resolve to solid colours (`src/theme/gradients.css`), `.btn-primary` is flat Amber (`src/theme/app.css`), and radii snap to 4, 7, 8, 12, 14 and 99px. The global font tokens in `src/theme/typography.css` point at the shared self-hosted fonts.
