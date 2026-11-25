---
version: 1
slug: "components-ui-auth-card-tsx"
primary_target: "components/ui/auth-card.tsx"
related_targets: ["components/ui/auth-switch.tsx"]
---

# Surface brief: auth pages (components/ui/auth-card.tsx, auth-switch.tsx)

Mode: Operate (task: sign in, register, recover, verify). Brand lives in precise details. Inherits the established landing world in DESIGN.md (Gunmetal / Stone / Amber, Bricolage Grotesque, Hanken Grotesk, Red Hat Mono for data only, hairline rules, no glow, no gradient). Authentication logic, schemas, routes (/auth/:mode), OAuth, OTP and sandbox behaviour must not change.

## Direction contract

THESIS: A sign-in page should feel like opening a ledger, not entering a casino lobby. Quiet, ruled, fast: one clear task per screen on a flat gunmetal ground, beside a slow Araiven tape that proves the product thinks before it acts. Refuses glass cards, gradient buttons, icon-in-input decoration, uppercase micro-labels and floating mock dashboards.

OWN-WORLD: Landing world extended to forms. Left panel Gunmetal Raised with a hairline edge; right ground Gunmetal Night. Inputs are Gunmetal Inset with 1px Stone borders at control-level contrast (about 0.46 alpha), 8px radius, visible sentence-case labels above. Amber is the single action colour and the focus ring. Errors use text plus an icon in loss red on a tinted full border, never a side bar. Display in Bricolage Grotesque, body Hanken Grotesk, Red Hat Mono only for the tape figures and the code input.

STORY: The visitor knows within a second which task they are on (sign in or create), types with no friction, sees clear inline validation, and feels the product's calm competence in the tape. Switching modes glides a shared tonal pill (Gunmetal Card 2 with an Amber-alpha edge, so the submit button stays the one Amber mass) and cross-fades the form; submit shows a clear busy state.

FIRST VIEWPORT: Desktop: left 46% panel with logo top-left, mode-specific headline and the five-line Araiven tape in the middle, a quiet footer line; right: 400px form column vertically centred, segmented Sign in / Create account control on top, heading, form, primary button full width, social row with provider names. Mobile: single column, logo then form, tape hidden. Primary action sits directly under the last field.

FORM: Operate surface; whole surface inside the established world, structure chosen directly (split panel with ledger tape + flat form), not dealt by concept-seed. seed:9e310bc00e9b46b9 (roll run after the build; the split-panel-with-tape structure was chosen directly from the owner's request, not dealt, and nothing pins it).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
