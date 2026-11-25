---
name: Ravora
description: The landing page's world. A dark decision ledger where Amber is both the one action colour and one committed full-bleed field.
colors:
  gunmetal-night: "#0b0e14"
  gunmetal-raised: "#10141d"
  gunmetal-card: "#151a26"
  gunmetal-card-2: "#1b2232"
  gunmetal-inset: "#0e121b"
  stone-text: "#f8fafc"
  stone-body: "#cbd5e1"
  stone-quiet: "#94a3b8"
  amber: "#f59e0b"
  amber-hi: "#fbbf24"
  amber-lo: "#d97706"
  gain-green: "#10b981"
  loss-red: "#ef4444"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 5.1vw, 4.7rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.038em"
  headline:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 4.6vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.032em"
  title:
    fontFamily: "Bricolage Grotesque, Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 600
    lineHeight: 1.2
  data:
    fontFamily: "Red Hat Mono, ui-monospace, Cascadia Mono, Consolas, monospace"
    fontSize: "0.84rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
rounded:
  xs: "4px"
  sm: "7px"
  md: "8px"
  lg: "12px"
  xl: "14px"
  pill: "99px"
spacing:
  gutter: "28px"
  row-sm: "14px"
  row-md: "20px"
  row-lg: "34px"
  section: "128px"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.gunmetal-night}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 26px"
  button-primary-hover:
    backgroundColor: "{colors.amber-hi}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.stone-text}"
    rounded: "{rounded.md}"
    height: "52px"
    padding: "0 26px"
  button-ghost-hover:
    textColor: "{colors.amber-hi}"
  workspace-window:
    backgroundColor: "{colors.gunmetal-card}"
    textColor: "{colors.stone-body}"
    rounded: "{rounded.xl}"
  plan-card:
    backgroundColor: "{colors.gunmetal-raised}"
    rounded: "{rounded.lg}"
  tab-selected:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.gunmetal-night}"
    rounded: "{rounded.sm}"
  risk-field:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.gunmetal-night}"
---

# Design System: Ravora (landing page world)

Scope note: this records the system the landing page shipped, scoped under `.rv` in `src/components/landing/landing.css` with `--rv-*` custom properties. The rest of the app still uses its older tokens in `src/theme` and `styles.css`. Do not assume these tokens apply there, and do not merge the two without an explicit decision.

## Overview

**Creative North Star: "The Decision Ledger"**

The page is one continuous ledger. The same Araiven trade plan reappears at every layer (the ask, the score, the gates, the risk veto, the approval), set as rows, hairline rules, tape-style logs and tabular figures. Where a conventional page would use cards, this one uses ruled rows. Where it would use a gradient CTA, it floods one whole section with Amber.

Gunmetal Night is the ground, Stone carries text and rules, and Amber does two jobs only: the action colour everywhere, and one committed full-bleed field (the risk guard section) with gunmetal ink on it. Display type is tight and large; data is mono and tabular. Density is moderate, with generous 104 to 152px section padding between dense, ruled content.

**Key Characteristics:**
- Ledger rows and 1px Stone rules before any boxed container.
- Amber is the only chromatic accent besides gain green and loss red, which appear only on data.
- One full-bleed Amber field on the page, and it is the risk guard.
- Figures are tabular mono; headings are tightly tracked Bricolage.
- Product window and chat use realistic, illustrative data.
- Depth comes from tonal steps of Gunmetal, not glow.

## Colors

Cold gunmetal ground, cool Stone text, one warm Amber.

### Primary
- **Signal Amber** (#f59e0b): the action colour (primary buttons, selected tab pill, caret, focus ring, selection, active gate number) and, once, the full-bleed risk section background.
- **Amber Lift** (#fbbf24): hover for Amber surfaces, and Amber used as text on dark (active prompt, scores, event labels). Amber Deep (#d97706) is declared but unused in the build.

### Neutral
- **Gunmetal Night** (#0b0e14): page ground; also the ink on Amber surfaces.
- **Gunmetal Raised** (#10141d): alternate sections, nav drawer, window bars, plan card, close CTA.
- **Gunmetal Card** (#151a26): product window, chat, receipt, tab pane, key-check.
- **Gunmetal Card 2** (#1b2232): the user's chat bubble.
- **Gunmetal Inset** (#0e121b): chart well, tape log, mock panels.
- **Stone Bright** (#f8fafc): headings and key figures.
- **Stone Body** (#cbd5e1): body copy; also the hue of every hairline at 8%, 12% and 26% alpha (soft, standard, strong rules).
- **Stone Quiet** (#94a3b8): secondary labels, captions, inactive states.

### Semantic (data only)
- **Gain Green** (#10b981) and **Loss Red** (#ef4444): candles, targets and stops, book sides, pass and fail chips. Never the sole carrier of meaning: values also carry signs, labels (LONG, TARGET, STOP) or position.

### Named Rules
**The One Field Rule.** Exactly one section is flooded with Amber, and it is the one about the user's drawdown cap. On it, text is Gunmetal ink, focus ring flips to ink, and no other color appears. A second Amber field would dilute the veto.
**The Amber Is Action Rule.** Amber marks what the user can do or what is currently selected or lit. It is never decorative fill, border tint on idle cards, or gradient.
**The Data Color Rule.** Green and red appear only on market data and verdict chips.

## Typography

**Display Font:** Bricolage Grotesque (with Hanken Grotesk, system-ui)
**Body Font:** Hanken Grotesk (with system-ui, Segoe UI)
**Label/Mono Font:** Red Hat Mono (with ui-monospace, Cascadia Mono, Consolas)

**Character:** Bricolage is condensed-feeling and tight at large sizes; Hanken stays neutral and readable beside it. Mono is a data instrument, not a flavor. All three are self-hosted variable woff2 files with `font-display: swap`.

### Hierarchy
- **Display** (700, clamp(2.6rem, 5.1vw, 4.7rem), 1.0, -0.038em): the hero H1 only; an em in Amber is allowed for one phrase.
- **Headline** (700, clamp(2.1rem, 4.6vw, 3.6rem), 1.04, -0.032em, max 18ch, balanced): section H2s. The close CTA raises it to clamp(2.4rem, 5.6vw, 4.6rem).
- **Title** (700, 1.25 to 1.9rem, ~1.1, -0.015 to -0.025em): gate titles, pane titles, plan and FAQ headings.
- **Body** (400, 1rem, 1.6; lead 1.12 to 1.2rem, 1.55 to 1.65): copy capped at 40 to 64ch.
- **Label** (600, 0.88 to 0.98rem, Hanken): buttons, tabs, nav; sentence case, never uppercase.
- **Data** (Red Hat Mono 500 to 700, 0.74 to 0.9rem, tabular-nums, -0.01em): table cells, levels, tape, times, gate numbers. Large data figures (score, receipt total, balance) run 2.2 to 3rem at -0.05em; the drawdown cap number is Bricolage 800 at clamp(5rem, 13vw, 9rem), -0.06em.

### Named Rules
**The Mono Is Data Rule.** Red Hat Mono is used only for figures, prices, times, scores, tickers and status chips. Prose, buttons and headings never use it.
**The Tight Display Rule.** Display and headline letter-spacing stays between -0.015em and -0.06em; large size and tight tracking are the voice.

## Layout

A 1240px centered wrap with 28px side padding (20px under 640px). Sections stack at 128px vertical padding (104px at 1040px, 80px at 640px), divided by 8%-alpha Stone top rules; the close CTA is 152px. Two-column splits are asymmetric (0.85/1.15 chat split, 0.7/1.3 tab pane, 1/1.25 hero) and collapse to one column at 1040px. The hero workspace window bleeds off the right edge on wide screens (negative right margin of the computed gutter, square right corners) and sits fully in-flow below 1041px. Lists are rows: prompts, gates (56px number column), events (84px time column), receipt rows, FAQ, facts. Roadmap is a four-column rail on a 1px line, 2 columns at 1040px, 1 at 640px. Nav is fixed, 72px, solid at 94% Gunmetal, with a hamburger drawer under 860px.

## Elevation & Depth

Flat and tonal. Depth is stepped Gunmetal (ground, raised, card, inset) plus 1px Stone hairlines. The single shadow is the hero workspace window's lift (`0 30px 70px rgba(0,0,0,0.55)` with a 1px inset top highlight), because it is the one object that must read as a product floating over the page. The active watchlist row uses an inset 1px Amber ring (45% alpha) rather than a glow.

### Named Rules
**The Hairline Over Shadow Rule.** Separate with 1px Stone-alpha rules or a tonal step. A shadow is reserved for the hero window.

## Shapes

Modest, consistent radii: 4px for chips and focus corners, 7 to 8px for buttons, tabs and inputs, 10 to 12px for plan cards, tape and mock panels, 14px for the main window, chat, tab pane and key-check, 99px only for progress bars. Message bubbles carry one 3px corner toward the speaker. Gate and event ticks are 24px circles; roadmap nodes are 15px circles on the rail. Borders are 1px Stone alpha; the Amber field uses 1.5px ink borders. Bullets are 6 to 8px hairline dashes, not dots.

## Components

### Buttons
- **Shape:** 8px radius, 52px tall (42 to 44px in plan actions and approve, 40px small).
- **Primary:** Amber fill, Gunmetal ink text, weight 600; hover Amber Lift; active nudges 1px down; disabled 55% opacity. Trailing arrow slides 5px right on hover.
- **Ghost:** transparent, Stone text, 26%-alpha Stone border; hover turns border Amber and text Amber Lift.
- **Focus:** 2px Amber outline, 3px offset, on every interactive element; ink outline on the Amber field.

### Navigation
- Text links 0.92rem, Stone Body, with a 1px Amber underline that scales in from the left on hover and for the active section. Sign-in is a quiet text button; the small primary sits beside it. A 30px Amber logo tile holds the mark.

### Workspace Window (signature)
- 14px radius card with a Gunmetal Raised title bar, a three-part body (148px watchlist rail, inset chart well, 230px decision panel) and a footer note. Candles draw in; support zone, entry, target and stop layers fade on in sequence; the score counts up; the reasoning types out behind an Amber block caret; Approve starts disabled (ghost) and becomes Amber when ready, then a green done state.

### Ledger Rows (signature)
- Rows separated by 8% or 12% Stone rules, no fill: ask prompts (hover slides in 12px and turns Stone Bright; active is Amber Lift), gates (dimmed 42% until lit, number turns Amber), events (label turns Amber Lift when current, tick becomes green with a check when done), facts and FAQ (display-type questions, plus-to-minus icon drawn from two 1.5px bars).

### Receipt and Plan Card
- Receipt rows start at 35% opacity and switch on in sequence; the total is a 3rem mono figure that turns Amber Lift on pass. The plan card has a 26%-alpha Stone border, a head with the score, definition rows, a reasoning paragraph and two small actions; a filtered plan greys its score.

### Tabs
- A segmented control with a Gunmetal Raised track and a shared Amber pill that springs between tabs (motion `layoutId`); selected label flips to ink. Panes are a 14px card with a mock panel (ruled table, order book with scaleX depth bars, ticket, bar rows).

### Risk Guard (Amber field)
- Segmented Conservative / Balanced / Aggressive control with a 1.5px ink border; pressed segment is an ink fill with Amber Lift text. A giant ink cap number, an equity line with ink stroke and 10% ink area that morph on change, and allocation bars in ink on 16% ink.

## Motion

Entrances use one easing, `cubic-bezier(0.16, 1, 0.3, 1)`: scroll reveal (opacity plus 20px rise over 0.75s, staggered through a `--rv-delay` custom property, triggered by IntersectionObserver), hero stagger (90 to 240ms steps, content visible by default), candle drawing, bar growth (scaleX), and morphing equity paths (0.6s). State changes use 0.18 to 0.5s ease. The one continuous motion is the 42s coverage marquee (pauses on hover) and the 1s stepped caret blink. Typed reasoning, count-up scores and sequential gate and receipt lighting are driven by hooks in `hooks.ts`.

**Reduced motion:** a `prefers-reduced-motion: reduce` block forces reveal, hero and candle content visible with animations and transitions removed, stops the marquee, bars and caret blink; `hooks.ts` also reads the media query so JS-driven typing and count-up can skip to their final state.

### Named Rules
**The Visible By Default Rule.** Content must be readable without the entrance animation; keyframes only supply the entrance (hero) and reveal state is added by script.

## Do's and Don'ts

### Do:
- **Do** build new sections as ledger rows with 1px Stone-alpha rules (`--rv-line` 12%, `--rv-line-soft` 8%) before reaching for a card.
- **Do** keep Amber (#f59e0b) for actions, selection and the single risk field; use Amber Lift (#fbbf24) for Amber text on dark.
- **Do** set every figure, ticker, time and score in Red Hat Mono with tabular numerals.
- **Do** label demo figures as illustrative, and pair green and red with a sign or label (PRODUCT.md).
- **Do** keep the 2px Amber focus ring and honor `prefers-reduced-motion` for every new animation.

### Don't:
- **Don't** add a second full-bleed Amber section, gradient fills, glows or icon tiles.
- **Don't** use Red Hat Mono for prose, buttons or headings.
- **Don't** apply these `--rv-*` tokens to the app dashboard; its older tokens in `src/theme` and `styles.css` are separate until a migration is decided.
- **Don't** invent testimonials, logos, user counts or performance claims; none exist (PRODUCT.md).
- **Don't** replace the hairline separation with drop shadows on rows or cards.
