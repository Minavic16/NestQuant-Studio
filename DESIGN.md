# DESIGN.md — Desired Homes Interiors

This document records the design decisions behind the website and the reasons for them.
It is the contract between design and implementation: if a visual decision in the code is not
explained here, it is either a bug or should be added here.

---

## 1. What the brand actually is (analysis before pixels)

The supplied logo (`public/brand/source/desired-homes-logo-original.jpg`, measured in
`scripts/_notes/logo-analysis.md`) is:

- a **`DH` monogram ligature** on pure black, rendered in brushed champagne-silver, whose
  `H` stem is a colonnade of vertical slats — a window/curtain reference;
- a high-contrast serif wordmark `DESIRED HOMES` with bevelled metallic edges;
- a letter-spaced `INTERIORS` flanked by hairline rules;
- a letter-spaced tagline `CURTAINS • ACCESSORIES • WINDOW SOLUTIONS`.

Four consequences drive the whole visual system:

1. **The black field belongs to the logo.** Dark sections must use exactly `#000000` so the
   mark blends into them instead of showing a seam. This is why the hero and the closing
   enquiry band are black, and why the logo is never placed on ivory, white or grey.
2. **The metallic is silver/champagne, never gold in the UI.** Gold exists only inside the
   logo's pixels. The site itself is black, white, ivory and neutral grey.
3. **Display type = serif, UI type = sans.** The logo supplies the high-contrast serif
   personality; the interface answers with a neutral system sans. They are opposites and
   never compete.
4. **Letter-spacing is a brand device.** `INTERIORS` and the tagline are wide-tracked small
   caps, so section labels use tracking (0.16em) rather than size or weight for emphasis.

---

## 2. Colour

No gradients, no glass, no accent colours. Every colour below is a token in
`styles/tokens.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-black` | `#000000` | Logo field, hero, closing enquiry band, footer |
| `--color-ink` | `#111111` | Body text, buttons, focus rings |
| `--color-paper` | `#FFFFFF` | Default page surface |
| `--color-ivory` | `#F7F5F0` | Alternative surface, image slots, hero text on black |
| `--color-line` | `#E7E3DC` | Hairline borders on light surfaces |
| `--color-line-strong` | `#DCD6CC` | Stronger separation, input hover |
| `--color-muted` | `#737373` | Secondary text, labels, metadata |
| `--color-line-dark` | `rgba(247,245,240,0.16)` | Hairlines on black surfaces |

Contrast (WCAG 2.2): ink on paper 19.0:1 · ink on ivory 17.9:1 · muted on paper 4.7:1 ·
muted on ivory 4.4:1 (used only at ≥ 13px/400 with bold fallbacks avoided; body-size
secondary text uses `#5C5C5C`, 7.0:1) · ivory on black 19.3:1. `--color-muted` is never used
below 13px for essential text.

Dark surfaces are pure `#000000` by design (§1.1). Text on them is ivory; secondary text on
black is `rgba(247,245,240,0.72)` (11.4:1).

---

## 3. Typography

Two families, both system-resident — **no web fonts are downloaded**, which removes an entire
class of render-blocking requests and CLS.

- **Display** (headlines, product names, logo-adjacent text): `Georgia, "Times New Roman",
  Times, "Noto Serif", serif`
- **UI / body**: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif`

Scale (1rem = 16px):

| Role | Size / line-height | Family / treatment |
| --- | --- | --- |
| Hero headline | `clamp(2rem, 1.15rem + 3.4vw, 3.25rem)` / 1.06 | Serif, tracking −0.015em |
| Section headline | `clamp(1.5rem, 1.2rem + 1.2vw, 2rem)` / 1.15 | Serif |
| Product / category name | 1.0625rem / 1.3 | Serif |
| Body | 1rem / 1.65 | UI sans, ink |
| Body small | 0.875rem / 1.6 | UI sans |
| Label / eyebrow | 0.6875rem, 0.16em, uppercase | UI sans, muted |
| Metadata | 0.75rem / 1.4 | UI sans, muted |

Rules: heading levels are structural, never decorative; no heading is uppercase (uppercase is
reserved for eyebrows and the logo's own text); no font weight above 600; no italic except the
pending-imagery caption; no text is centred for more than two consecutive lines.

---

## 4. Space, grid and rhythm

Spacing scale (tokens `--space-*`): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 px.
Section rhythm: `--space-8` (64px) on mobile, `--space-9` (96px) on tablet, `--space-10`
(128px) on desktop. Nothing else — no ad-hoc margins.

- Content width: `--container: 1240px`, inline padding `--gutter: 20px` (mobile) → 32px (≥900px).
- Measure: prose never exceeds 62ch.
- Baseline: everything aligns to the same left edge inside a section; the only centred
  composition is the hero and the closing band, which are deliberately symmetric.

---

## 5. Shape, borders and elevation

- Radii: `0` on imagery and cards, `2px` (`--radius-sm`) on controls/inputs, `4px`
  (`--radius-md`) on the enquiry drawer. No pills.
- Separation is done with **1px hairlines** (`--color-line`, `--color-line-dark`) and
  whitespace. **There are no shadows anywhere** — not on cards, not on the drawer, not on the
  sticky header. The sticky header uses a hairline bottom border and a solid surface.
- Controls are quiet: primary = ink fill / paper text; secondary = 1px border / transparent
  fill; both 2px radius, 44px minimum height, `140ms` colour transition.

---

## 6. Motion

Motion only confirms interaction. Allowed: colour/opacity transitions (140ms), the enquiry
count badge fading in (160ms), mobile drawer and search panel open/close (180ms, opacity +
6px translate), gallery thumbnail selection (instant). No parallax, no bouncing, no spinning,
no scroll-triggered reveals, no animated backgrounds, no autoplay media.
`prefers-reduced-motion: reduce` collapses every transition and transform to 1ms.

Easing: `cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 7. Imagery strategy (the honest version)

No product or interior photography has been supplied. Rather than fake it, the site ships an
explicit **image slot**:

```
┌───────────────────────────────┐
│         ivory surface         │
│      1px warm-grey hairline   │
│      “IMAGE TO COME”          │   ← 11px, 0.16em tracked, muted
└───────────────────────────────┘
```

- Aspect ratios are fixed in CSS (`aspect-ratio`), so slots never shift layout.
- Each slot declares `width`/`height` and reserves space; when a real image path is added to
  `data/products/*`, the same slot renders it with `next/image` (AVIF/WebP, responsive
  `sizes`, lazy unless first-in-gallery).
- Category tiles on mobile become a horizontally scrollable row (a lookbook rail) rather than
  four cramped cards.
- The hero uses the **supplied logo itself** as its visual anchor on a black field — the only
  truthful large-format visual available. When interior photography arrives, the hero image
  slot replaces the lockup without changing the layout.

Nothing in the UI invents photography, prices, specifications, reviews, awards or statistics.

---

## 8. Page-by-page composition

### 8.1 Header (all pages)
72px tall, paper/ivory, 1px bottom hairline, sticky. Left: the **monogram chip** (the logo's
own pixels, 36px tall). Centre/right: Shop · Categories · About · Contact. Far right: search
icon-button, then Enquiry with count. The logo is the only brand element — no typed wordmark,
no recreated logotype.

### 8.2 Mobile header
56px: monogram chip, then search and menu icon-buttons (44×44 hit areas). Menu opens an
accessible dialog containing Shop · Categories · About · Contact · Enquiry plus the full
lockup at the top — the drawer is the one place the complete brand lockup appears beside the
hero.

### 8.3 Home
1. **Hero** — pure black. Lockup (complete crop), hairline rule, serif proposition
   ("Curtains, accessories and window solutions."), single CTA `Explore Collection`.
2. **Explore** — eyebrow + three image-led category tiles (Curtains, Accessories, Window
   Solutions) with `Explore →`.
3. **Featured** — eyebrow + 4-column product grid (3 ≥900px, 2 below) using `ProductCard`.
4. **Brand statement** — ivory, centred serif line "Thoughtful interiors begin with the
   details." with a text link `About`.
5. **Enquiry band** — black. "Have something in mind?" + "Tell us what you're looking for." +
   `Start an Enquiry`.

No testimonials, no statistics, no newsletter, no social icons (none exist).

### 8.4 Shop
Eyebrow `Shop`, serif headline `The collection`, a quiet search field, category chips
(All · Curtains · Accessories · Window Solutions) and the product grid. Filtering is
instant and client-side; chips reflect the active state with an ink fill.

### 8.5 Product detail
Two columns ≥900px (image gallery left, details right), stacked on mobile. Image dominates:
gallery with a large frame plus thumbnails when more than one image exists. Details column:
category eyebrow, serif name, price or `Price on request`, description, specification list
(only real attributes), SKU, then two actions: `Add to Enquiry` (primary) and
`Ask on WhatsApp` (secondary). Below: back link to the shop.

### 8.6 Categories index
Eyebrow + headline, then the same three tiles as the home page (consistent component,
different framing), each with its live product count.

### 8.7 Category page
Category name as headline, product count, and the product grid filtered to that category.

### 8.8 About
Ivory. Eyebrow `About`, headline "Thoughtful interiors begin with the details.", then a
black band holding the complete lockup, then `Desire Nwakor / CEO & Creative Director`, then
the three service lines (Curtains · Interior accessories · Window solutions) separated by
hairlines, then a contact link. The company description is an editable content field that is
empty until supplied — the page is composed so it still reads as finished without it.

### 8.9 Contact
Eyebrow `Contact`, headline "Let's discuss your space.", then Email and WhatsApp rows with
copy-able values and a `Chat on WhatsApp` button. No address, no map, no social links.

### 8.10 Enquiry
Eyebrow `Your enquiry`, then the item list (name, quantity stepper, remove), then the two
send actions: `Send enquiry on WhatsApp` and `Send enquiry by Email`, then `Clear enquiry`.
Empty state: "Your enquiry list is empty." + `Explore the collection`.

### 8.11 Footer
Black, small. Monogram chip, `Curtains • Accessories • Window Solutions`, three links
(Shop · About · Contact), email, WhatsApp link, `© Desired Homes Interiors`.

---

## 9. Responsive strategy

Four meaningful breakpoints only: **480**, **768**, **1024**, **1280**. Composition changes at
each; nothing is merely scaled down.

| Range | Grid | Notable changes |
| --- | --- | --- |
| < 480 | 2-col product grid, rail categories | Header 56px, single-column product detail, full-width CTAs |
| 480–767 | 2-col products, rail categories | Category tiles grow, more breathing room |
| 768–1023 | 3-col products, 3-across tiles | Header 72px, two-column product detail begins at 1024 |
| ≥ 1024 | 3–4-col products (4 ≥ 1280) | Full two-column product detail, centred hero |

Mobile is a first-class target: 2-column product cards keep imagery ≥ 40% of viewport width,
touch targets ≥ 44px, category discovery scrolls horizontally with scroll-snap.

---

## 10. Accessibility decisions

- Semantic landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page; no skipped levels.
- Skip link as the first focusable element.
- Focus is always visible: 2px ink outline, 2px offset, ivory on black surfaces.
- Mobile menu and search panel are real dialogs (`role="dialog"`, `aria-modal`, focus trap,
  `Escape` to close, focus restored to the trigger).
- Enquiry count is announced through a polite live region; `Add to Enquiry` confirms with
  text ("Added"), never colour alone.
- Quantity steppers are real buttons with `aria-label`s; the remove button is labelled with
  the product name.
- All interactive elements are reachable and operable by keyboard; nothing relies on hover.
- Meaningful `alt` text on every product image; decorative slots are marked `aria-hidden`.
- `prefers-reduced-motion` and `prefers-contrast` respected.

---

## 11. Content rules

- Only supplied facts are stated: business name, CEO/creative director, email, WhatsApp
  number, and the three service lines.
- Prices appear only when genuinely supplied (then formatted `₦1,234`); otherwise the label is
  `Price on request`.
- No addresses, maps, reviews, ratings, awards, statistics, delivery claims, opening hours,
  social accounts, or "as seen in" logos.
- Every section must answer one of three questions: what do they sell, can I find something
  suitable, how do I enquire. Anything else is removed.

---

## 12. Surface texture

The surfaces carry a very fine paper grain: a 200×200 SVG `feTurbulence` tile, repeated, on a
fixed overlay at 3% opacity with `mix-blend-mode: multiply`.

- It is a **texture, not a gradient** — the V1 rule against gradients still holds.
- One data URI, so it costs no network request and cannot be a render-blocking asset.
- `multiply` darkens the paper and leaves the black bands untouched, so the grain belongs to
  the ivory and white surfaces only.
- `pointer-events: none` and above every layer, so it never interferes with interaction.
- Disabled under `prefers-contrast: more`, where texture works against legibility.

## 13. Motion (V2)

Lenis supplies smooth scrolling and GSAP ScrollTrigger supplies scroll-linked reveals. Both are
governed by three rules:

1. **Nothing is hidden by CSS.** The initial state is set from JavaScript, so a visitor with
   JavaScript disabled — or a visitor whose script failed — sees the complete site.
2. **Reduced motion is absolute.** Under `prefers-reduced-motion: reduce` Lenis is never started
   and the reveals never run; changing the preference mid-session tears them down.
3. **Motion is short and functional.** 14px of travel, 0.5s, `power2.out`, once per element —
   never parallax, never bouncing, never scroll-hijacking of the enquiry flow.

The dashboard uses motion differently: counters animate to their value the first time they are
seen, and fall straight to the number when reduced motion is preferred. A metric is never
hidden behind an animation.

## 14. Explicit non-goals

Gradients · glassmorphism · heavy cards · shadows · particle/decorative effects · autoplay or
background video · oversized or all-caps headings · Tailwind-style utility soup · SaaS
landing patterns · fake photography or fake social proof · payment · customer accounts ·
checkout · coupons · live chat · unmoderated reviews.

**Reviews arrived in V2**, through moderation: a review is invisible on the site until the
business approves it. Nothing is ever published that a person has not read first, which is the
only honest way to show social proof.
