# Ravora Design System V1.1

## Brand Overview
Ravora is a premium, AI powered wealth copilot. It helps beginners and busy professionals grow their money through intelligent market analysis, opportunity discovery, portfolio insights, and risk management.

* **Target Audience:** Beginners, busy professionals, and investors seeking simplicity and clarity.
* **Core Emotional Goals:** Trustworthy, Intelligent, Premium, Modern, Sophisticated, Future-ready.

---

## 1. Color Palette

### Base Colors
* **Primary Background:** Deep Navy (`#060913` / `hsl(225, 50%, 5%)`)
* **Secondary Background / Card Base:** Midnight Navy (`#0E1325` / `hsl(225, 45%, 10%)`)
* **Accent Primary:** Royal Blue (`#2563EB` / `hsl(221, 83%, 53%)`)
* **Accent Secondary:** Deep Purple (`#7C3AED` / `hsl(263, 83%, 62%)`)

### Status Colors
* **Success / Positive Trend:** Emerald (`#10B981` / `hsl(162, 76%, 41%)`)
* **Warning / Alert:** Amber (`#F59E0B` / `hsl(38, 92%, 50%)`)
* **Error / Negative Trend:** Rose (`#EF4444` / `hsl(0, 84%, 60%)`)

### Ambient Lighting & Gradients
* **Ambient Glow 1 (Primary):** Radial gradient with `#2563EB` at 15% opacity, transitioning to transparent.
* **Ambient Glow 2 (Secondary):** Radial gradient with `#7C3AED` at 15% opacity, transitioning to transparent.
* **Interactive Gradient:** `linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)`
* **Text Gradient:** `linear-gradient(180deg, #FFFFFF 0%, #A5B4FC 100%)`

### Borders & Dividers
* **Default Card Border:** `rgba(255, 255, 255, 0.08)`
* **Active / Hover Card Border:** `rgba(255, 255, 255, 0.16)`
* **Divider Line:** `rgba(255, 255, 255, 0.04)`

---

## 2. Typography

* **Primary Font Family:** `Inter`, sans-serif (clean, professional, fintech grade)
* **Display Font Family:** `Outfit`, sans-serif (premium, high-tech, geometric)

### Type Scale
| Level | Font Family | Size | Weight | Tracking | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display** | Outfit | `4.00rem` (64px) | 700 (Bold) | `-0.02em` | `1.15` | Hero Title |
| **Page Title** | Outfit | `2.50rem` (40px) | 700 (Bold) | `-0.01em` | `1.2` | Main page headings |
| **Section Title**| Outfit | `1.75rem` (28px) | 600 (Semi-Bold)| `0` | `1.3` | Section headings |
| **Card Title** | Inter | `1.25rem` (20px) | 600 (Semi-Bold)| `0` | `1.4` | Card headers |
| **Body Large** | Inter | `1.00rem` (16px) | 400 (Regular) | `0` | `1.6` | Paragraphs, descriptions|
| **Body Small** | Inter | `0.875rem` (14px)| 400 (Regular) | `0` | `1.5` | Labels, details, inputs |
| **Caption** | Inter | `0.75rem` (12px) | 500 (Medium) | `0.02em` | `1.4` | Overlines, badges |

---

## 3. Glassmorphism & Depth

To create a premium SaaS aesthetic with sophisticated depth, all UI components must implement the following treatments:

### Glassmorphic Card Container
```css
.card-glass {
  background: rgba(14, 19, 37, 0.6);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}
```

### Ambient Lighting Glows
* Backgrounds must feature 2–3 large, soft, blurred radial color blobs (`filter: blur(120px)`) placed in the background layer behind hero visuals or sections to create ambient lighting and remove flatness.
* Card elements can have a very subtle, soft drop shadow with a colored tint matching the ambient light (e.g., `box-shadow: 0 10px 40px -10px rgba(37, 99, 235, 0.15)`).

---

## 4. Layout & Spacing

* **Grid System:** 12-column layout with 24px gutters.
* **Spaciousness:** Margins and section paddings should be generous to convey a premium, uncluttered, and professional experience.
  * Section Padding: `80px` to `120px` vertically.
  * Container Max Width: `1200px`.
* **Border Radii:**
  * Pill Badges: `999px`
  * Buttons / Small Inputs: `12px`
  * Cards / Containers: `16px` or `24px`

---

## 5. Components Style Guide

### Buttons
* **Primary Button:** Gradient background `linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)`, white text, soft glow on hover (`box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3)`), scale up slightly (`transform: scale(1.02)`).
* **Secondary / Glass Button:** Background `rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.1)`, white text. On hover, background becomes `rgba(255, 255, 255, 0.1)`.

### Form Fields & Inputs
* Dark backgrounds (`rgba(255, 255, 255, 0.03)`), subtle borders (`rgba(255, 255, 255, 0.08)`), transition to highlighted border (`#2563EB`) on focus.

---

## 6. Visual Direction (3D & Illustrations)

* **Hero Visual Style:** Use high-quality, polished 3D compositions depicting sleek financial assets (floating glass/gold cards, glowing charts, geometric wireframes, or metallic abstract shapes) that represent wealth and intelligence.
* **Reflections & Metallic Finish:** Cards and coins should feature high-contrast glossy surfaces with realistic reflections, metallic gold elements, and deep glass refraction.
* **Micro-interactions:** Hovering over interactive cards must produce a subtle translateY (-4px) movement and an increase in glow/border intensity.

---

## 7. Style Guardrails & Avoidances

* **NO Crypto Casino Vibe:** Avoid neon green/pink overload, spinning slot-like animations, or gamification that undermines trust.
* **NO Binance / TradingView Clones:** Do not clutter screens with dense, multi-panel candlestick charts, order books, or flashing numbers. Keep the data digested and simple.
* **NO Rainbow / Hyper-saturated Gradients:** Limit gradients to smooth, deep blue-to-purple transitions. Avoid harsh multi-color rainbow spreads.
* **NO Cluttered Layouts:** Keep whitespace generous. If the screen feels cramped, increase the padding.

