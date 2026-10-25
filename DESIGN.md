# DESIGN.md, Desired Homes Interiors

This document records the design decisions behind the website and the reasons for them.
It is the contract between design and implementation: if a visual decision in the code is not
explained here, it is either a bug or should be added here.

---

## 1. What the brand actually is (analysis before pixels)

The supplied logo (`public/brand/README.md`) is a flat, single-colour lockup:

- a ribbon-form `D` monogram, drawn as a continuous fold;
- a high-contrast serif wordmark `DESIRED HOMES`, stacked in two lines;
- `INTERIORS` in letter-spaced capitals beneath it.

The artwork arrived as white shapes on a black field. The site carries it as a two-tone
vector lockup, ink on paper and ivory on dark. Four consequences drive the visual system:

1. **The mark is flat, not metallic.** No gradients, shadows or gold effects are added.
2. **The wordmark belongs to the logo.** The header uses the supplied lockup rather than a
   typed approximation.
3. **Display type = serif, UI type = sans.** The logo supplies the high-contrast serif
   personality; the interface answers with a neutral system sans. They are opposites and
   never compete.
4. **Letter-spacing is a brand device.** `INTERIORS` is wide-tracked, so section labels use
   tracking (0.14em) rather than size or weight for emphasis.

---

## 2. Colour

No gradients and no glass. A single bronze accent carries links and labels. Every colour
below is a token in `styles/tokens.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-black` | `#211e1b` | Closing bands and footer |
| `--color-ink` | `#24211e` | Body text and primary controls |
| `--color-paper` | `#fbf9f5` | Default warm page surface |
| `--color-paper-bright` | `#fffdf9` | Product and form surfaces |
| `--color-ivory` | `#f2ece2` | Alternative warm surface |
| `--color-surface-soft` | `#eae3d8` | Quiet support panels |
| `--color-line` | `#ddd3c5` | Hairlines on light surfaces |
| `--color-line-strong` | `#c4b8a8` | Stronger separation and control borders |
| `--color-muted` | `#625b54` | Labels and metadata |
| `--color-muted-strong` | `#4a433c` | Secondary body copy |
| `--color-accent` | `#725239` | Bronze accent, links, labels and focus rings |
| `--color-line-dark` | `rgb(251 249 245 / 22%)` | Hairlines on dark surfaces |
| `--color-on-dark-muted` | `#d6ccc1` | Secondary text on dark |

Contrast (WCAG 2.2): ink on paper 15.0:1 · muted on paper 5.9:1 · muted on soft 5.3:1 ·
accent on paper 6.0:1 · on-dark-muted on dark 9.2:1. `--color-muted` is not used below
13px for essential text.

Dark surfaces are the warm ink `#211e1b`, not pure black. Text on them is ivory; secondary
text is `--color-on-dark-muted`.

---

## 3. Typography

Two families, both system-resident, **no web fonts are downloaded**, which removes an entire
class of render-blocking requests and CLS.

- **Display** (headlines, product names, logo-adjacent text): `"Iowan Old Style",
  "Palatino Linotype", "Book Antiqua", Palatino, Georgia, "Noto Serif", serif`
- **UI / body**: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
  "Helvetica Neue", Arial, sans-serif`

Scale (1rem = 16px):

| Role | Size / line-height | Family / treatment |
| --- | --- | --- |
| Hero headline | `clamp(2.5rem, 1.65rem + 3.9vw, 4.5rem)` / 1.03 | Serif, tracking −0.02em |
| Section headline | `clamp(1.9rem, 1.35rem + 2.2vw, 3rem)` / 1.1 | Serif |
| Subsection | `clamp(1.35rem, 1.15rem + 0.8vw, 1.75rem)` / 1.3 | Serif |
| Product / category name | 1.125rem / 1.3 | Serif |
| Body | 1.0625rem / 1.65 | UI sans, ink |
| Body small | 0.9375rem / 1.55 | UI sans |
| Label / eyebrow | 0.75rem, 0.14em, uppercase | UI sans, accent |
| Metadata | 0.8125rem / 1.4 | UI sans, muted |

Rules: heading levels are structural, never decorative; no heading is uppercase (uppercase is
reserved for eyebrows and the logo's own text); no font weight above 600; no italic; no text is
centred for more than two consecutive lines.

---

## 4. Space, grid and rhythm

Spacing scale (tokens `--space-*`): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 px.
Section rhythm is content-driven: `--section-y: clamp(3.25rem, 6.5vw, 7rem)` for full sections
and `--section-y-compact: clamp(2.5rem, 4vw, 4.5rem)` for quiet support blocks. Page-specific
headers add their own top padding, so no blanket margin is applied twice.

- Content width: `--container: 1240px`, inline padding `--gutter: clamp(1.25rem, 4vw, 4rem)`
  (20px on mobile, up to 64px on wide screens).
- Measure: prose never exceeds 62ch.
- Baseline: everything aligns to the same left edge inside a section. The hero and closing band
  are two-column compositions, not centred stacks, so the eye follows one consistent edge.

---

## 5. Shape, borders and elevation

- Radii: `0` on imagery and cards, `2px` (`--radius-sm`) on controls/inputs, `4px`
  (`--radius-md`) on the enquiry drawer. No pills.
- Separation is done with **1px hairlines** (`--color-line`, `--color-line-dark`) and
  whitespace. **Elevation is soft and sparing**, three tokens, nothing else:
  `--shadow-lift` under photography and media frames, `--shadow-control` under
  primary controls on light surfaces, `--shadow-bar` under the sticky header.
  No heavy cards, no floating panels, no glow. The sticky header keeps its
  hairline bottom border and solid surface; the shadow only separates it from
  scrolling content.
- Controls are quiet: primary = ink fill / paper text; secondary = 1px border / transparent
  fill; both 2px radius, 44px minimum height, `160ms` colour transition.

---

## 6. Motion

Motion only confirms interaction. Allowed: colour/opacity transitions (160ms), the enquiry
count badge fading in (160ms), mobile drawer and search panel open/close (200ms, opacity +
6px translate), gallery thumbnail selection (160ms border colour). No parallax, no bouncing,
no spinning, no scroll-triggered reveals, no animated backgrounds, no autoplay media.
`prefers-reduced-motion: reduce` collapses every animation and transition to 0.01ms.

Easing: `cubic-bezier(0.4, 0, 0.2, 1)`.

---

## 7. Imagery strategy (the honest version)

The site separates three kinds of image, and never lets one stand in for another:

- **Project work**: the owner-supplied photographs in `public/portfolio/`, presented as completed
  projects. Only these may be captioned as the business's work.
- **Editorial imagery**: room and material photography in `public/editorial/`, used for
  atmosphere on the hero, category tiles, About and Contact. It is never captioned as a
  completed project. Provenance and licences are recorded in `public/editorial/README.md`.
- **Product photography**: files under `public/products/`. Where a product has no image, or a
  file fails to load, `MediaSlot` renders a quiet ivory frame labelled "Photograph unavailable".
  The frame is never a fake photograph, and the label is never presented as a product.

- Aspect ratios are fixed in CSS (`aspect-ratio`), so frames never shift layout.
- Every image is served through `next/image` with responsive `sizes`; the home hero and the
  About material study are the only priority images, one per page above the fold.
- Category tiles stack as full-width cards on mobile and become a three-across editorial grid
  from 768px. There is no swipe-only rail.
- The hero is an editorial room photograph. The logo is not used as a hero visual.

Nothing in the UI invents photography, prices, specifications, reviews, awards or statistics.

---

## 8. Page-by-page composition

Every interior page (Shop, Categories, Our work, About, Contact, Enquiry) opens
with a page header, eyebrow, headline, optional standfirst, led by a quiet
"Back to Home" link. The header logo alone proved too easy to miss, so the way
home is explicit on every page. Product detail instead links back to Shop, the
more useful destination mid-browse.

### 8.1 Header (all pages)
64px tall on mobile, 72px from 48rem, paper surface, 1px bottom hairline, sticky. Left: the
supplied full lockup as one SVG, 40px tall on mobile, 46px on tablet and 50px on desktop. The
logo link carries the accessible name "Desired Homes Interiors, home". From 64rem: Our work ·
Shop · About · Contact, then search, the enquiry link with count, and `Discuss your space`.
Below 64rem: search and menu icon-buttons with 44×44 hit areas.

### 8.2 Mobile header
The same 64px bar and lockup, then search and menu. The menu opens an accessible dialog on the
dark field, led by the ivory lockup at 40px, followed by Our work · Shop · About · Contact ·
Categories · Enquiry list, then `Discuss your space`, the email address and the WhatsApp link.
The drawer is the only place the light lockup appears outside the footer.

### 8.3 Home
1. **Hero**, warm paper. Editorial room photograph on one side; eyebrow
   "Interiors · Curtains · Window solutions", headline "Curtains that bring a room together.",
   supporting copy, `View our work` and `Discuss your space`, then `Shop the collection`.
2. **Selected work**, the published portfolio with real project photography and a link to
   `Our work`.
3. **What we help with**, the three category entries.
4. **What to send us**, a short guide to a useful first message.
5. **Finishing details**, a preview of four catalogue pieces with a link to the shop.
6. **About**, the material study and Desire Nwakor's role.
7. **Closing enquiry band**, dark, "Start a conversation" and `Discuss your space`.

No testimonials, no statistics, no newsletter, no social icons (none exist).

### 8.4 Shop
Eyebrow `Shop`, serif headline `The collection`, a quiet search field, then two chip groups:
category (All · Curtains · Accessories · Window Solutions) and product type (All types plus
the types present in the catalogue). Filters combine, are stored in the URL (`?q=`,
`?category=`, `?type=`) so a view is shareable, and apply instantly on the client. Chips
reflect the active state with an ink fill, and a clear-filters action appears when any filter
is active.

### 8.5 Product detail
Two columns from 1024px (image gallery left, details right), stacked on mobile. Image dominates:
gallery with a large frame plus thumbnails when more than one image exists. Details column:
category eyebrow, serif name, price or `Price on request`, description, specification list
(only real attributes), SKU, then two actions: `Add to Enquiry` (primary) and
`Ask on WhatsApp` (secondary). Below: approved reviews with a collapsed submission form, then
a back link to the shop.

### 8.6 Categories index
Eyebrow + headline, then the same three tiles as the home page (consistent component,
different framing), each with its live product count.

### 8.7 Category page
Category name as headline, product count, and the product grid filtered to that category.

### 8.8 About
Warm paper. Eyebrow `About`, headline "Desired Homes Interiors", the business description,
Desire Nwakor's role as CEO & Creative Director, then a material-study photograph. Below it,
`What we do` lists the three categories with live counts, then a contact band:
"Start with a conversation." and `Discuss your space`. The company description is an editable
content field, and the page still reads as finished without it.

### 8.9 Contact
Eyebrow `Contact`, headline "Let's discuss your space.", then Email and WhatsApp rows. Below
them, a message builder collects the room and the request, prepares a message and opens it in
WhatsApp or email. Nothing is submitted to the site, and there is no address, map or social
link.

### 8.10 Enquiry
Eyebrow `Enquiry`, then the item list (name, quantity stepper, remove), then the two
send actions: `Send enquiry on WhatsApp` and `Send enquiry by Email`, then `Clear enquiry`.
Empty state: "Your enquiry list is empty." + `Explore the collection`.

### 8.11 Footer
Warm ink, small. The ivory full lockup at 48px, `Curtains • Accessories • Window Solutions`,
a one-line description, then Explore links (Home · Our work · Shop · Categories · About ·
Contact) and the contact column (email and WhatsApp). The bottom line carries
`© Desired Homes Interiors`.

---

## 9. Responsive strategy

Four meaningful breakpoints only: **480**, **768**, **1024**, **1280**. Composition changes at
each; nothing is merely scaled down.

| Range | Grid | Notable changes |
| --- | --- | --- |
| < 480 | 2-col product grid, stacked category list | Header 64px, single-column product detail, full-width CTAs |
| 480–767 | 2-col products, stacked category list | Category tiles grow, more breathing room |
| 768–1023 | 3-col products, 3-across tiles | Header 72px, two-column product detail still stacked |
| ≥ 1024 | 3–4-col products (4 ≥ 1280) | Full two-column product detail, two-column editorial hero |

Mobile is a first-class target: 2-column product cards keep imagery ≥ 40% of viewport width,
touch targets ≥ 44px, and category discovery stacks in full-width cards rather than a
swipe-only rail.

---

## 10. Accessibility decisions

- Semantic landmarks: `header`, `nav`, `main`, `footer`; one `h1` per page; no skipped levels.
- Skip link as the first focusable element.
- Focus is always visible: 2px bronze outline, 3px offset, ivory on dark surfaces.
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
- No addresses, maps, awards, statistics, delivery claims, opening hours, social accounts, or
  "as seen in" logos. Reviews are moderated: only approved submissions can render, and no
  rating, review count or testimonial is invented.
- Every section must answer one of three questions: what do they sell, can I find something
  suitable, how do I enquire. Anything else is removed.

---

## 12. Brand assets

The supplied artwork is a flat, single-colour lockup: a ribbon-form `D` beside a
high-contrast serif wordmark, with `INTERIORS` letter-spaced beneath. It arrived as white
shapes on a black field. The site carries it as a two-tone vector system, ink on light
surfaces and ivory on dark, and never adds gradients, shadows or metallic effects.

| Asset | File | Where it is used |
| --- | --- | --- |
| Full lockup, ink | `public/brand/desired-homes-logo.svg` | Header on every page |
| Full lockup, ivory | `public/brand/desired-homes-logo-light.svg` | Footer and mobile drawer |
| Monogram, ink | `public/brand/desired-homes-monogram.svg` | Reserved for light surfaces |
| Monogram, ivory | `public/brand/desired-homes-monogram-light.svg` | Dashboard |
| Wordmark, ink | `public/brand/desired-homes-wordmark.svg` | Reserved for narrow brand contexts |
| Favicon | `public/brand/favicon.svg` | Browser tab and home screen |
| App icon | `app/icon.png` | 512px opaque app icon |
| Complete square | `public/brand/logo-complete.png` | Structured-data logo |
| Social card | `app/opengraph-image.jpg` | Open Graph and social previews |
| QR code | `public/brand/desired-homes-qr.svg` and `.png` | Print and social link to production |

The SVGs are traced from the supplied 2300 x 2300 PNG, not redrawn. Potrace runs at threshold
145 with `blackOnWhite: false`, `turdSize: 2`, `alphaMax: 1`, `optCurve: true` and
`optTolerance: 0.2`, so the thin fold where the ribbon crosses the D survives. The measured
bounds and full provenance are recorded in `public/brand/README.md`. The assets are committed;
there is no runtime logo build step.

**Rule:** the full lockup is the default. The monogram is used only where the lockup would be
too small to read, which today means the dashboard and the favicon. The hero leads with
photography, not the logo.

## 13. Photography

The home hero, category tiles and material study use editorial room photography, documented
with source and licence in `public/editorial/README.md`. The gallery uses the owner-supplied
project photographs in `public/portfolio/*.webp`, seeded from
`data/store/seed-portfolio.ts`. Editorial images are never captioned as completed work.

Text over photography sits on a flat scrim, never a gradient, so contrast holds
across the whole frame without washing the image out.

## 14. Surface texture

The surfaces carry a very fine paper grain: a 200×200 SVG `feTurbulence` tile, repeated, on a
fixed overlay at 5% opacity with `mix-blend-mode: multiply`.

- It is a **texture, not a gradient**, the V1 rule against gradients still holds.
- One data URI, so it costs no network request and cannot be a render-blocking asset.
- `multiply` darkens the paper and leaves the dark bands untouched, so the grain belongs to
  the light surfaces only.
- `pointer-events: none` and above every layer, so it never interferes with interaction.
- Disabled under `prefers-contrast: more`, where texture works against legibility.

## 15. Motion implementation

There is no animation library. Interaction feedback is CSS transitions on colour, opacity and
a 6px translate, all driven by the tokens in §6. The only scripted motion is the dashboard's
metric counter, a single `requestAnimationFrame` loop that eases a number to its value over
700ms. The counter renders the final value first, so a failed script, a reduced-motion
preference or a zero value leaves the number visible and correct rather than blank.

Nothing animates on scroll, and no motion blocks input or reading.

## 16. Explicit non-goals

Gradients · glassmorphism · heavy cards · heavy shadows · particle/decorative effects · autoplay or
background video · oversized or all-caps headings · Tailwind-style utility soup · SaaS
landing patterns · fake photography or fake social proof · payment · customer accounts ·
checkout · coupons · live chat · unmoderated reviews.

**Reviews arrived in V2**, through moderation: a review is invisible on the site until the
business approves it. Nothing is ever published that a person has not read first, which is the
only honest way to show social proof.
