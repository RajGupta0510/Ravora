# Ravora Design System V2.0 (Terminal & Institutional)

## Brand Overview
Ravora is an institutional-grade, AI-powered wealth copilot and algorithmic trading terminal. It delivers real-time market orderbooks, automated opportunity discovery, portfolio insights, and deterministic risk management.

* **Target Audience:** Active traders, systematic investors, and busy professionals seeking clarity and precision.
* **Core Aesthetic:** Institutional Financial Terminal, Clean, Modern, Polished, High-Craft.
* **Design Guidelines:** Inspired by [Mobbin](https://mobbin.com) fintech patterns, [Watermelon UI](https://ui.watermelon.sh) craft standards, and [Impeccable](https://impeccable.style) clean terminal principles.

---

## 1. Core Color Palette

The entire Ravora platform is anchored strictly on three harmonious color families:

### Gunmetal Night (Primary Surfaces & Atmosphere)
Dark, low-fatigue slate backgrounds designed for extended market monitoring sessions.
* **Base Background:** `#0b0e14` (Deep canvas, root background)
* **Surface Secondary / Sidebar:** `#10141d` (Panels, header, nav rails)
* **Surface Card / Container:** `#151a26` (Glass-free solid card background)
* **Surface Elevated / Hover:** `#1b2232` (Interactive cards, active rows)
* **Deep Inset / Input Base:** `#0e121b` (Form inputs, dark recessed wells)

### Stone (Neutrals, Text, and Borders)
High-legibility neutral scale providing crisp contrast without harsh pure white glare.
* **Stone 50 (Text Primary):** `#f8fafc` (Headings, primary numbers, vital metrics)
* **Stone 200 (Text Secondary):** `#cbd5e1` (Subheadings, table labels, active values)
* **Stone 400 (Text Muted):** `#94a3b8` (Captions, timestamps, secondary parameters)
* **Stone Border Subdued:** `rgba(203, 213, 225, 0.08)` (Dividers, internal rows)
* **Stone Border Standard:** `rgba(203, 213, 225, 0.12)` (Card borders, panel outlines)
* **Stone Border Focus:** `rgba(203, 213, 225, 0.25)` (Input borders, hover states)

### Amber (Accent, Highlights & Key Indicators)
The signature focal accent color representing warmth, precision, and active intelligence.
* **Amber 400 (Highlight):** `#fbbf24` (Badges, active icons, selected states, high scores)
* **Amber 500 (Primary Action):** `#f59e0b` (Primary buttons, active indicators, chart entry lines)
* **Amber 600 (Deep Accent):** `#d97706` (Hover gradient stops, focus rings, subtle badges)
* **Amber Tint (12%):** `rgba(245, 158, 11, 0.12)` (Active tab pills, callout card backgrounds)
* **Amber Tint (6%):** `rgba(245, 158, 11, 0.06)` (Table row selection, subtle highlights)

### Financial Data Colors (Standard Market Indicators)
* **Profit / Bullish / Success:** Emerald (`#10b981`)
* **Loss / Bearish / Danger:** Rose / Crimson (`#ef4444`)
* **Neutral / Stasis:** Stone 400 (`#94a3b8`)

---

## 2. Impeccable Design Principles (No AI Slop)

1. **No Chromatic Radial Blur Blobs:** Ambient background glow spheres (`filter: blur(120px)`) are strictly disabled. The interface uses solid gunmetal surfaces with clean 1px stone borders.
2. **No Purple/Blue Generic Gradient Heroes:** The generic purple/indigo AI aesthetic is completely replaced by warm amber accents and deep gunmetal terminal tones.
3. **No Gradient Text Clipping:** Headings use solid `#f8fafc` or `#fbbf24`. Text is never clipped with `-webkit-background-clip: text`, ensuring 100% contrast readability.
4. **No Low-Contrast Gray Text:** Muted text is kept at `#94a3b8` or `#cbd5e1`, passing WCAG AA/AAA standards against `#0b0e14` and `#151a26`.
5. **No Incomplete Side-Tab Borders:** Accent indicators wrap or use dedicated badge pills rather than solitary `border-left` outlines on rounded corners.
6. **Restrained Motion:** Instant or crisp 150ms transitions (`all 0.15s cubic-bezier(0.16, 1, 0.3, 1)`) without floaty or disorienting animations.

---

## 3. Typography

* **Display Family:** `Outfit`, sans-serif (Precision headings, geometric titles)
* **Body & Data Family:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
* **Monospace / Numerical:** `JetBrains Mono`, `Consolas`, monospace (Orderbooks, ticks, prices, coordinates)

### Type Hierarchy
| Level | Font Family | Size | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Outfit | `3.50rem` (56px) | 700 (Bold) | `-0.02em` | Main landing headline |
| **Page Title** | Outfit | `1.75rem` (28px) | 700 (Bold) | `-0.01em` | Screen and modal headers |
| **Section Title**| Outfit | `1.25rem` (20px) | 600 (Semi-Bold)| `-0.01em` | Card groups, panel titles |
| **Card / Widget**| Inter | `0.95rem` (15px) | 600 (Semi-Bold)| `0` | Widget headers, tickers |
| **Data Metric** | Inter / Mono| `1.15rem` (18px) | 700 (Bold) | `0` | PnL, equity, target prices |
| **Body Standard**| Inter | `0.875rem` (14px)| 400 (Regular) | `0` | Analysis prose, descriptions |
| **Data Label** | Inter | `0.70rem` (11px) | 600 (Semi-Bold)| `0.04em` | Uppercase table & metric labels |

---

## 4. Component Standards

### Cards & Panels (`.card-glass`)
* **Background:** Solid `#151a26`
* **Border:** `1px solid rgba(203, 213, 225, 0.12)`
* **Border Radius:** `12px` (standard widgets), `16px` (modal / main containers), `8px` (nested items)
* **Shadow:** `0 8px 24px -4px rgba(0, 0, 0, 0.4)`
* **Hover State:** Border transitions to `rgba(245, 158, 11, 0.3)` or `rgba(203, 213, 225, 0.25)`

### Buttons
* **Primary Button (`.btn-primary`):**
  * Background: Solid `#f59e0b` or subtle brass gradient `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`
  * Text: `#0b0e14` (Gunmetal, 700 bold weight for optimal contrast)
  * Radius: `8px`
  * Hover: Background `#fbbf24`, subtle elevation shadow `0 4px 12px rgba(245, 158, 11, 0.25)`
* **Secondary Button (`.btn-secondary`):**
  * Background: `#10141d`
  * Border: `1px solid rgba(203, 213, 225, 0.15)`
  * Text: `#f8fafc`
  * Hover: Border `rgba(245, 158, 11, 0.4)`, background `#1b2232`

### Inputs & Form Fields
* **Background:** `#0e121b`
* **Border:** `1px solid rgba(203, 213, 225, 0.12)`
* **Text:** `#f8fafc`
* **Placeholder:** `#64748b`
* **Focus State:** Border `#f59e0b`, box-shadow `0 0 0 1px #f59e0b`

### Navigation & Segmented Tabs
* **Container:** Background `#10141d`, border `1px solid rgba(203, 213, 225, 0.12)`, radius `8px`
* **Inactive Tab:** Text `#94a3b8`, transparent background
* **Active Tab:** Background `rgba(245, 158, 11, 0.12)`, border `1px solid rgba(245, 158, 11, 0.35)`, text `#fbbf24`

### Chart Elements
* **Background Canvas:** `#0b0e14`
* **Gridlines:** `rgba(203, 213, 225, 0.05)`
* **Suggested Entry:** Amber (`#f59e0b`)
* **Stop Loss:** Rose (`#ef4444`)
* **Take Profits (TP1, TP2, TP3):** Emerald (`#10b981`)
* **Support / Resistance:** Stone (`#94a3b8`) / Amber-Dark (`#f97316`)

---

## 5. Verification & Quality Assurance

* **TypeScript Compilation:** Validated via `tsc --noEmit` and `vite build`.
* **Impeccable Lint:** Zero slop rules triggered (`npx impeccable detect`).
* **Cross-Environment Consistency:** Shared design tokens applied identically across React SPA (`src/`) and native terminal workspace (`app/`).
