# Design System: ALTTEZ

> Single source of truth for generating ALTTEZ screens in Google Stitch.
> Encodes Manual de Marca ALTTEZ v1.1. Every screen — marketing site and product —
> must obey this document. When code and this file disagree, this file wins.

---

## 1. Visual Theme & Atmosphere

A bright, editorial sports platform with the composure of a broadcast graphics
package — confident, sober, never arcade. The atmosphere is warm and luminous:
ivory canvases, generous negative space, and a single bronze accent that signals
action and energy without ever shouting. Think a well-lit press box, not a neon
gaming overlay. Layouts are asymmetric and decisive; motion has weight and intent
("broadcast", not "soft SaaS"). Light always dominates — dark, aggressive
backgrounds are forbidden.

- **Density:** Daily App Balanced (5). Product dashboards lean denser (7) where
  rosters, fixtures, and standings demand it.
- **Variance:** Offset Asymmetric (6). Editorial composition, no dead-center heroes.
- **Motion:** Fluid, weighted (6). Decisive springs, not floaty fades.

The 70 / 20 / 10 discipline governs everything: **70% light neutrals · 20% grafito
· 10% bronze.** Bronze is precious — spend it only on what the user should act on.

---

## 2. Color Palette & Roles

- **Marfil Principal** (#F6F1EA) — Primary background surface, broad sections, arena fills
- **Pure White** (#FFFFFF) — Cards, modals, forms, elevated containers
- **Beige Apoyo** (#EDE8D0) — Secondary surfaces, dividers, soft fills, section banding
- **Grafito** (#1F1F1D) — Logo, headlines, primary text, high-contrast ink (never pure black)
- **Bronce ALTTEZ** (#CE8946) — THE accent: primary buttons, active icons, focus rings, highlights
- **Bronce Suave** (#D8A06B) — Hover states, badges, chart fills, subtle accent backgrounds

**Functional support (use sparingly, muted, never neon):**
- **Success** (#22C55E) — confirmations, live/winning state
- **Amber** (#F5BE05) — caution, yellow-card semantics
- **Danger** (#EF4444) — destructive actions, errors

**Borders & structure:**
- **Whisper Border** (rgba(31,31,29,0.10)) — 1px card and divider lines, tinted to grafito
- **Bronce Border** (rgba(206,137,70,0.28)) — accent borders, active-tile edges

**Hard constraints:**
- Exactly ONE accent family: bronze. No second accent color.
- The legacy `blue` / `purple` / `violet` / `neon` tokens in `palette.js` are
  DEPRECATED — never reference them. Map everything to bronze.
- No dominant neon blue, no electric edges, no strong glows, no aggressive black backgrounds.
- Never pure black `#000000` — use Grafito `#1F1F1D`.
- Shadows tint to grafito (`rgba(31,31,29,…)`), never to a colored hue.

---

## 3. Typography Rules

Brand-mandated single family. **Manrope** is the ALTTEZ typeface — do not substitute.

- **Display / Headlines:** Manrope Bold (700) — track-tight, weight-driven hierarchy,
  controlled scale. Big through confidence, not screaming pixel size. Grafito ink.
- **Subheads:** Manrope SemiBold (600) — section titles, card headers.
- **UI / Buttons:** Manrope Medium (500) — labels, nav, controls.
- **Body:** Manrope Regular (400) — relaxed leading, max 65 characters per line,
  muted grafito for secondary copy.
- **Mono (numbers/data):** JetBrains Mono — scores, timestamps, standings, IDs, and
  all high-density numeric columns in product dashboards. When density > 7, every
  number is mono for tabular alignment.

**Banned:** Inter, generic system stacks, and ALL serif fonts (Times, Georgia,
Garamond). Serif is forbidden everywhere in ALTTEZ — marketing and product alike.
No gradient text on large headers.

---

## 4. The Hero Section

The marketing hero is the first impression — striking, editorial, never generic.

- **Asymmetric structure:** Split-screen or left-aligned. Centered heroes are BANNED.
- **Inline image typography:** Embed small rounded contextual photos (a player, a
  ball, a trophy) inline between headline words at type-height — visual punctuation.
  Signature ALTTEZ technique.
- **No overlap:** Text never sits on top of images. Each element owns its zone.
- **One CTA:** Single bronze primary action. No secondary "Learn more" link.
- **No filler:** No "Scroll to explore", no bouncing chevrons, no scroll arrows.
- Inline hero photos stack below the headline on mobile.

---

## 5. Component Stylings

- **Buttons:** Flat bronze fill (#CE8946) for primary, ghost/outline grafito for
  secondary. Tactile −1px translate on active press. Hover shifts to Bronce Suave
  (#D8A06B). No outer glow, no neon ring, no custom cursor. Focus ring = bronze.
- **Cards:** White (#FFFFFF) on Marfil canvas. Rounded corners (RADIUS lg–xl, 16–20px).
  Diffused grafito-tinted shadow (`0 10px 28px rgba(31,31,29,0.07)`). Use elevation
  ONLY to communicate hierarchy. In dense tables/standings, drop cards for border-top
  dividers and negative space.
- **Inputs/Forms:** Label above field, helper text optional, error text below.
  White fill, whisper border, bronze focus ring. No floating labels.
- **Loading:** Skeletal shimmer matching exact layout dimensions. No circular spinners,
  no neon loaders.
- **Empty States:** Composed illustrative compositions showing how to add the first
  team / fixture / player — not bare "No data" text.
- **Error States:** Inline, clear, danger-red, near the offending field.
- **Badges / Status:** Bronce Suave fills or muted semantic colors (success / amber /
  danger). Sober, never glowing.

---

## 6. Layout Principles

- Grid-first responsive architecture. CSS Grid over flexbox percentage math — no `calc()` hacks.
- Asymmetric splits for heroes and feature sections. Centered heroes banned (variance 6).
- The generic "3 equal cards in a row" feature block is BANNED — use 2-column zig-zag,
  asymmetric grid, or horizontal scroll.
- No overlapping elements — every element holds its own clean spatial zone.
- Contain with max-width (≈1400px centered). Generous internal padding.
- Full-height sections use `min-h-[100dvh]`, never `h-screen`.
- Section rhythm follows brand 70/20/10: mostly Marfil, grafito structure, bronze sparks.

---

## 7. Responsive Rules

- **Mobile-first collapse (< 768px):** all multi-column layouts → single column. No exceptions.
- **No horizontal scroll on mobile** — critical failure if present.
- Headlines scale via `clamp()`. Body text minimum 1rem / 16px.
- All touch targets ≥ 44px.
- Inline hero photos stack below headline on mobile.
- Desktop horizontal nav → clean mobile menu.
- Section gaps shrink proportionally: `clamp(3rem, 8vw, 6rem)`.
- Dense product tables (rosters/standings) become stacked cards or horizontal-scroll
  panels below 768px — never crush columns.

---

## 8. Motion & Interaction

Broadcast-grade: decided, weighty, not soft. Use the project's existing tokens.

- **Spring physics default:** `stiffness: 320, damping: 28` (`SPRING.default`).
  Snappy `420/32` for press feedback, gentle `240/26` for large surfaces. No linear easing.
- **Entrances:** `FADE_UP` (opacity + 12px y) and `SCALE_IN` (opacity + 0.96 scale).
- **Staggered orchestration:** lists cascade at `STAGGER = 0.06s` — never mount instantly.
- **Perpetual micro-loops:** live/active elements get a subtle infinite state (pulse on
  LIVE badges, shimmer on loaders). Restrained — sports broadcast, not arcade.
- **Performance:** animate only `transform` and `opacity`. Never `top`/`left`/`width`/`height`.
  Grain/sheen on fixed pseudo-elements only (see `BEVEL`/`BROADCAST_GRADIENT`).

---

## 9. Anti-Patterns (Banned)

- No emojis anywhere.
- No Inter, no generic system fonts, no serif fonts (anywhere).
- No pure black `#000000` — Grafito `#1F1F1D` only.
- No dominant neon blue, no electric edges, no strong glows, no neon loaders.
- No aggressive dark backgrounds — ALTTEZ is light-first.
- No arcade / gamer aesthetic.
- No second accent color — bronze is the only accent.
- No oversaturated fills; semantic colors stay muted.
- No gradient text on large headers.
- No custom mouse cursors.
- No overlapping elements — clean spatial separation always.
- No 3-equal-column card rows.
- No centered hero sections.
- No filler UI text ("Scroll to explore", "Swipe down", bouncing chevrons, scroll arrows).
- No generic placeholder names ("John Doe", "Acme", "Nexus") — use realistic team/player names.
- No fake round numbers (`99.99%`, `50%`).
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash", "Next-Gen").
- No broken Unsplash links — use `picsum.photos` or SVG avatars.
- No reference to deprecated `blue`/`purple`/`violet`/`neon` palette tokens.
