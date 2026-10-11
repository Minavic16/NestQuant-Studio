# ARCHITECTURE.md — Desired Homes Interiors

How the site is built, why, and where things change. Written for a developer who joins the
project later: every "where does X live" question is answered once, here.

---

## 1. Stack

| Choice | Version | Why |
| --- | --- | --- |
| Next.js (App Router) | 16.4 | Static-first rendering, file-based routes, built-in image optimisation, metadata/sitemap/robots APIs. No bespoke SSR to maintain. |
| React | 19.3 | Server Components keep the shipped JS tiny; only interactive islands are client-side. |
| TypeScript | 5.9.3 | Strict mode, `noUncheckedIndexedAccess`. Pinned to 5.x for toolchain compatibility (Next's type generation and the ESLint toolchain). |
| CSS Modules + design tokens | — | No utility framework, no runtime CSS-in-JS, no component library. Styles are plain CSS with custom properties; zero style runtime cost. |
| Node test runner + jsdom + Testing Library | — | No test-framework dependency; runs anywhere Node runs. |
| sharp (WASM build on this host) | 0.35 | Image optimisation for `next/image` and the brand-asset pipeline. |
| GSAP (ScrollTrigger) | 3.15 | Scroll-linked reveals, registered once in `MotionProvider`. |
| Lenis | 1.3 | Smooth scrolling, driven by GSAP's ticker. |

**V2 additions** (requested by the business): a document store, an admin dashboard on a
separate origin, moderated reviews and first-party analytics. These are the items the V1
plan listed as "future evolution", built now because they were asked for — and each lands in
the module it was planned to land in (see §16).

Deliberately **not** used: Tailwind, a component library, a state-manager library, a data
fetching library, an animation library, an analytics SDK, a CMS, an icon package. Everything
shipped is either the framework or code in this repository.

---

## 2. Rendering strategy

Every route is **statically generated at build time**. There is no server runtime, no
database and no external API in V1, which removes whole classes of latency and failure.

| Route | Rendering | Data |
| --- | --- | --- |
| `/` | static | featured products, categories |
| `/shop` | static (client-side filter/search over the shipped catalogue) | all products |
| `/shop/[slug]` | static, `generateStaticParams` | one product |
| `/categories` | static | categories + counts |
| `/categories/[slug]` | static, `generateStaticParams` | products in one category |
| `/about`, `/contact` | static | content fields |
| `/enquiry` | static shell + client islands | localStorage |
| `/admin/*` | dynamic (reads the live store) | dashboard, session-guarded |
| `/api/admin/*` | dynamic | authenticated content, reviews, metrics, uploads |
| `/api/metrics`, `/api/reviews` | dynamic | public ingestion, rate-limited |
| `not-found`, `error` | static | — |

Because the catalogue is a typed local module, `getProducts()` is synchronous and the same
code runs on the server (HTML) and the client (filtering). When the catalogue grows past a few
hundred items, only `lib/products/repository.ts` changes (see §16).

---

## 3. Directory map

```
app/                     Routes (App Router). Each folder is a route; page.tsx renders it.
  layout.tsx             Root layout: header, footer, fonts-free typography, metadata.
  page.tsx               Home.
  shop/…, categories/…   Catalogue routes.
  about/ contact/ enquiry/ …
  sitemap.ts robots.ts   SEO artefacts.
  icon.png               Favicon generated from the monogram.
  opengraph-image.jpg    Generated social card (logo on black).

components/
  layout/                Header, Footer, MobileNav, Container, SectionHeading, SkipLink.
  navigation/            PrimaryNav (desktop links), NavLink.
  products/              ProductGrid, ProductCard, ProductGallery, ProductDetails,
                         PriceLabel, MediaSlot (the honest image placeholder).
  enquiry/               EnquiryProvider, EnquiryButton, EnquiryView, EnquiryRow,
                         EnquiryActions, EnquiryCountBadge.
  search/                SearchLauncher (lazy), SearchPanel, SearchInput, SearchResults.
  ui/                    Button, IconButton, Eyebrow, VisuallyHidden, StatusText.

config/
  site.ts                Business identity, site URL, defaults. ← business facts live here.
  contact.ts             Email + WhatsApp number (single source of truth).
  navigation.ts          Primary navigation items.

data/
  store/                 V2 document store (see §4a).
  types.ts               Product / Category / ProductImage / ProductAttribute types.
  categories.ts          The three categories (id, name, slug, blurb-free).
  products/index.ts      Catalogue re-export (swap this file to change the data source).
  products/seed-catalogue.ts   SAMPLE data, clearly marked — replace with real products.
  content/about.ts       Editable content fields (empty until supplied).

lib/
  products/repository.ts ProductRepository interface + local implementation.
  products/filter.ts     Pure filtering/sorting helpers (used by shop + search).
  search/search-service.ts  SearchService interface + local implementation.
  enquiry/store.ts       Framework-agnostic enquiry store (subscribe/getSnapshot).
  enquiry/reducer.ts     Pure reducer: add / remove / setQuantity / clear / hydrate.
  enquiry/storage.ts     localStorage adapter with validation + quota safety.
  enquiry/context.tsx    React bindings (useSyncExternalStore).
  whatsapp/whatsapp.ts   Message building + wa.me URL construction.
  contact/mailto.ts      Email enquiry construction.
  validation/validation.ts  Slug / quantity / enquiry-item validation.
  analytics/analytics.ts  No-op analytics abstraction (tracking call sites only).
  seo/metadata.ts        Shared metadata builders (title, canonical, Open Graph).

public/brand/            Logo crops (generated — see scripts/prepare-brand-assets.mjs).
public/products/         Drop real product photography here (referenced by data files).
public/editorial/        Drop interior photography here (hero, about, category tiles).

styles/tokens.css        Design tokens: colour, type, space, radii, borders, motion, z.
styles/base.css          Reset, element defaults, focus, reduced-motion, print.
scripts/prepare-brand-assets.mjs   Regenerates logo crops + favicon from the original.
scripts/_notes/logo-analysis.md    Measured crop geometry.
```

Rule: **business facts live in `config/`, content lives in `data/`, behaviour lives in
`lib/`.** Components never contain a phone number, an email address, a price, a product name
or a copy string that the client may want to change.

---

## 4. Data layer

`data/types.ts` is the single shape definition:

```ts
type Product = {
  id: string; slug: string; name: string;
  category: CategoryId;
  shortDescription?: string; description?: string;
  images: ProductImage[];        // empty array is valid → renders a MediaSlot
  price?: number;                // only when genuinely known
  currency?: "NGN";
  priceLabel?: string;           // e.g. "Price on request"
  sku?: string;
  attributes?: { label: string; value: string }[];  // real specifications only
  available?: boolean;           // only when actually known
  featured?: boolean;
};
```

`lib/products/repository.ts` exposes an interface (`ProductRepository`) with a local
implementation over the typed module:

```ts
interface ProductRepository {
  getAll(): Product[];
  getBySlug(slug: string): Product | undefined;
  getFeatured(limit?: number): Product[];
  getByCategory(id: CategoryId): Product[];
}
```

The UI depends on the interface, never on the module — swapping in a CMS or a database means
providing a new implementation, not editing components.

### 4a. The document store (V2)

V1 read content from typed modules compiled into the bundle. V2 moves it into JSON documents
on disk so the dashboard can edit it without a database, and so a container can persist it
with one volume:

```
data/store/catalogue.json   products + categories
data/store/site.json        contact details, about copy, hero, settings
data/store/reviews.json     visitor reviews, each with a moderation status
data/store/metrics.json     one aggregated bucket per day
```

- `data/store/store.ts` reads with an mtime-keyed cache, writes atomically
  (temp file + rename), and preserves the last known-good document when a file is unreadable.
- `data/store/repositories.ts` validates every document on read: an unknown category becomes a
  real one, a malformed slug drops the entry rather than producing a broken URL, and a corrupt
  file falls back to the shipped defaults instead of blanking the site.
- Public pages read through the repositories with `revalidate = 60`; admin writes call
  `revalidatePath("/", "layout")`, so an edit is live within a minute and immediately after a save.
- Replacing the store with a database or a CMS means providing the same repository functions.

### Sample data policy

`data/products/seed-catalogue.ts` ships clearly-marked **sample** products so the site can be
demonstrated, QA'd and deployed before real content exists. Sample data asserts nothing
false: no prices, no specifications, no availability, no imagery, generic names drawn from the
brief's own examples. To go live with real content: delete the seed file, add real product
files, and point `data/products/index.ts` at them. If the catalogue is empty the site renders
graceful empty states (and the shop shows "No products yet.").

---

## 5. Enquiry architecture

The enquiry list is **not** a cart: no checkout, no payments, no accounts, no server.

```
EnquiryButton ──dispatch──▶ EnquiryStore ──persist──▶ localStorage
                                  │
                                  └──subscribe──▶ useSyncExternalStore ──▶ UI
```

- `lib/enquiry/reducer.ts` — pure reducer, no React, no DOM. Fully unit-tested.
- `lib/enquiry/store.ts` — tiny external store (`subscribe` / `getSnapshot` / `getServerSnapshot`).
  `getServerSnapshot` returns a constant empty state, so server HTML and the first client
  render always agree (no hydration mismatch) and the header renders identically for everyone.
- `lib/enquiry/storage.ts` — the only module that touches `localStorage`. Wrapped in
  try/catch (private mode, disabled storage, quota) and validates every field on read: slug
  must match `^[a-z0-9-]+$`, quantity an integer 1–99, at most 50 items. Corrupt data is
  discarded, never trusted.
- `components/enquiry/EnquiryProvider.tsx` — hydrates the store once on mount and provides
  the hook; `EnquiryView` renders the list, quantities, removal and the two send actions.

Persistence key is versioned (`desired-homes:enquiry:v1`) so a future schema change can
migrate instead of break.

---

## 6. Search architecture

```ts
interface SearchService {
  search(query: string, options?: { category?: CategoryId; limit?: number }): Product[];
}
```

`lib/search/search-service.ts` implements it locally with a normalising index
(lowercase, accent-stripped, whitespace-collapsed) built from name, category, SKU and
description. The UI (search field, search panel, shop filtering) only ever talks to this
interface, so replacing it with a server route, a database query or a search engine is an
implementation swap. Empty query returns everything; no match returns `[]` and the UI shows
"No products found."

The header search panel is code-split (`next/dynamic`) and imports the index only when the
user opens search — visitors who never search never download it.

---

## 7. Contact, WhatsApp and email

`config/contact.ts` is the only place the contact facts exist:

```ts
export const contactConfig = {
  email: "desirenwakor@gmail.com",
  whatsappNumber: "2349138797980",   // normalised, no +, no spaces
};
```

- `lib/whatsapp/whatsapp.ts` builds messages and `https://wa.me/<number>?text=<encoded>`
  URLs: a multi-item enquiry message (with SKU when present and quantity when > 1) and a
  single-product message. All text goes through `encodeURIComponent`; no number or message
  text is duplicated anywhere else.
- `lib/contact/mailto.ts` builds the `mailto:` URL with subject
  `Product Enquiry - Desired Homes Interiors` and a body listing the items. No backend mail
  server in V1.
- External links use `target="_blank" rel="noopener noreferrer"`.

---

## 8. Images

`next/image` everywhere with explicit `width`/`height` and CSS `aspect-ratio` boxes, so
nothing shifts. Formats: AVIF then WebP. `sizes` are declared per usage so a 300px mobile card
never downloads a 2000px file. The first gallery image is `priority` (eager, high
fetchpriority); everything below the fold is lazy. The logo crops are pre-generated at the
sizes actually used (7–50 kB total for the whole brand) and never re-encoded on the fly unless
a responsive derivative is requested.

Real photography is dropped into `public/products/<slug>/…` or `public/editorial/…` and
referenced from the data files; `MediaSlot` renders the honest placeholder until then.

---

## 9. SEO

- `lib/seo/metadata.ts` builds per-route metadata: title, description, canonical, Open Graph
  (with the generated 1200×630 card), `robots`, `locale: en_NG`.
- `app/sitemap.ts` lists every static route plus every product and category slug.
- `app/robots.ts` allows all and points at the sitemap.
- Semantic HTML, one `h1` per page, slug-based URLs (`/shop/linen-sheer-curtain`).
- JSON-LD: `Organization` on the home page, `Product` + `BreadcrumbList` on product pages.
  Only supplied facts are emitted (name, description, category, SKU, logo).

---

## 10. Security

Attack surface is reduced by *not* building things (no accounts, no payments, no uploads, no
user-generated content, no admin), and hardened with:

- HTTP security headers for every route (`next.config.ts`): `Content-Security-Policy`
  (`default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';
  form-action 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'`),
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `X-Frame-Options: DENY`, `Permissions-Policy`, `Strict-Transport-Security`,
  `Cross-Origin-Opener-Policy: same-origin`.
  `script-src`/`style-src` keep `'unsafe-inline'` because the framework injects inline
  bootstrap and style tags; hardening this to a nonce requires middleware and is documented
  as a follow-up (§16).
- `poweredByHeader: false`; no secrets in source; `NEXT_PUBLIC_*` contains only the site URL.
- All URL construction is encoded; all persisted data is validated; no `dangerouslySetInnerHTML`
  anywhere; external links carry `rel="noopener noreferrer"`.
- Dependencies are minimal and the lockfile are committed.

### The dashboard (V2)

The dashboard is served from a **different origin** than the shop, so the customer site and the
back office never share a URL:

```
https://www.example.com      → the shop
https://admin.example.com    → the dashboard
```

Set `ADMIN_HOST` to the dashboard origin. `proxy.ts` routes by host: on the admin host the
dashboard is served at `/`; on any other host `/admin` is not addressable at all. In
development `http://admin.localhost:3000` works with no DNS setup.

- **Authentication**: one admin password (`ADMIN_PASSWORD_HASH`, a scrypt hash generated by
  `npm run admin:hash`). Sessions are stateless signed cookies — httpOnly, `SameSite=strict`,
  12 hours, verified with a constant-time comparison. There are no accounts, because there is
  one administrator.
- **Defence in depth**: `proxy.ts` redirects unauthenticated dashboard requests to the sign-in
  page, the `(dashboard)` route group's layout redirects again, and every admin API route
  checks the session through `lib/admin/guard.ts`. A mistake in one layer cannot expose the
  back office, and API routes are protected regardless of which host they arrive on.
- **Uploads** are validated by magic bytes (never by the claimed extension), capped at 6 MB,
  restricted to JPEG/PNG/WebP — SVG is rejected because it can carry script — and stored under
  a server-generated name, so nothing a client sends influences a path.
- The dashboard sets `robots: { index: false }` on every page.

---

## 11. Performance budget and loading strategy

Measured on the production build (`npm run build && npm run start`, gzip, modern browser):

| Budget | Target | Measured |
| --- | --- | --- |
| First-load JS, home | < 200 kB | **~153 kB** (framework ~136 kB + app code ~17 kB) |
| Legacy-browser polyfills | modern browsers skip them | 39 kB, loaded with `nomodule` only |
| Route JS: `/shop`, `/shop/[slug]`, `/enquiry` | < 40 kB each | 12–17 kB each |
| Images above the fold | logo only | 7–50 kB total brand assets |
| Web fonts | 0 requests | 0 |
| Third-party scripts | 0 | 0 |

Only the framework's React + App Router runtime is large, and it is shared and cached. The
application itself is ~17 kB gzipped on the home page. (`next build` runs on Webpack in this
project — see §17 — which adds a ~2 kB runtime chunk; a Turbopack build would not
have it.)

How the rest of the budget is met: everything is static HTML; only the header, search launcher,
shop filter, enquiry island and product enquiry button are client components; the search panel and
enquiry view are code-split; no route preloads another route's assets; images are sized and lazy;
no animation library, no icon font, no CSS framework; and no route ships the catalogue into a
shared chunk — verified: the home page's JavaScript contains no product data.

"The initial page must not download the entire catalogue" is enforced structurally: product
data is a static module that is only imported by the routes and islands that need it, and the
enquiry page resolves its products through the repository interface (a future API call), not
by shipping the whole catalogue into every bundle.

---

## 12. Accessibility engineering

Semantic landmarks, one `h1`, skip link, visible 2px focus rings, dialog semantics with focus
trap and restore for the mobile menu and search panel, `aria-live` for enquiry feedback,
44px minimum touch targets, labelled controls, `prefers-reduced-motion` and
`prefers-contrast` support, keyboard-complete flows. Details and the component-level rules are
in `DESIGN.md` §10; enforcement is by test and by review, not by convention alone.

---

## 13. Testing

`npm run test` runs the suite on Node's built-in test runner (see §17): pure logic is tested
directly, and component tests render through a jsdom global installed by `test/jsdom-env.ts`.
Components are created with `createElement` because Node has no JSX transform.

- **Pure logic**: enquiry reducer (add/remove/clamp/clear/hydrate), storage adapter
  (corrupt JSON, invalid entries, quota failure), WhatsApp and mailto message building and
  URL encoding, product repository, search service, validation helpers.
- **Components**: `EnquiryButton` (adds, announces, no duplicates), `EnquiryView` (empty
  state, quantity change, remove, clear), `ProductCard` (link, category, price label),
  `MobileNav` (open/close, focus behaviour).

Tests are co-located as `*.test.ts` next to the code they cover.

---

## 14. Analytics abstraction

### Event tracking (V1)

No analytics vendor is installed. `lib/analytics/analytics.ts` exposes
`trackProductView()`, `trackEnquiryAdded()`, `trackWhatsAppClick()`, `trackEmailClick()` as a
no-op provider behind an interface, and the call sites already use it. Adding a provider
later means implementing one interface — no component changes.

### Visitor metrics (V2)

The dashboard needs to show what is happening on the site, and the business should not have to
trust a third party with its visitors' data. So the website collects its own:

- `components/effects/MetricsReporter.tsx` reports one page view per navigation, through
  `navigator.sendBeacon` (falling back to `fetch(..., { keepalive: true })`), 400ms after paint.
- `app/api/metrics/route.ts` **aggregates into daily buckets**: `views`, unique `visitors`
  (session ids), `paths`, `referrers` and `devices`. The file grows by one entry per day, not
  one per visit, and the sessions list is trimmed to 30 days.
- The route is rate-limited per session (one accepted view per 2 seconds) and never echoes
  anything back, so it cannot be used as an oracle.
- `app/api/admin/metrics/route.ts` turns those buckets into the figures the dashboard shows:
  totals, a 30-day series, most-viewed pages, referrers and devices.
- Everything is behind the session guard. Swap this for a real analytics provider later by
  replacing the collector route alone.

---

## 15. Environment configuration

`.env.example` documents every variable:

```
NEXT_PUBLIC_SITE_URL=https://<domain>       # canonical URLs, sitemap, Open Graph
ADMIN_HOST=admin.<domain>                   # origin that serves the dashboard
ADMIN_SESSION_SECRET=<32+ characters>       # signs dashboard sessions
ADMIN_PASSWORD_HASH=scrypt$<salt>$<hash>    # generated by `npm run admin:hash`
```

`NEXT_PUBLIC_SITE_URL` is the only public variable; the three `ADMIN_*` values are server-side
and never reach the browser. Generate the secret and the password hash with:

```
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
npm run admin:hash -- "the-password-you-choose"
```

Until `NEXT_PUBLIC_SITE_URL` is set, metadata falls back to a placeholder origin that must be
replaced before launch (see `config/site.ts`). The dashboard refuses to sign anyone in while
`ADMIN_PASSWORD_HASH` is unset — it fails closed rather than open.

---

## 16. Future evolution (boundaries, not features)

| Stage | What changes | Where |
| --- | --- | --- |
| ~~V2 CMS / inventory~~ **done** | content now lives in the document store | `data/store/*` |
| ~~V2 admin dashboard~~ **done** | dashboard on a separate origin, host-routed | `app/admin/*`, `proxy.ts`, `lib/admin/*` |
| ~~V2 reviews~~ **done** | moderated visitor reviews | `app/api/reviews`, `components/reviews/*` |
| ~~V2 analytics~~ **done** | first-party metrics, aggregated daily | `app/api/metrics`, `components/admin/MetricsPanel` |
| V2 search at scale | `SearchService` swaps to a server route | `lib/search/search-service.ts` |
| V3 orders / quotes | enquiry becomes server-persisted behind the same store interface | `lib/enquiry/store.ts` (+ a `RemoteEnquiryStorage`) |
| V3 customer accounts | auth + customer area, added alongside existing routes | new `app/account/*` |
| V4 payments | checkout routes; enquiry flow stays intact | new routes, no changes to catalogue/enquiry components |
| Any time: real database | replace the four repository functions | `data/store/repositories.ts` |
| Security hardening | nonce-based CSP | `next.config.ts` |
| Cloud storage for uploads | swap the upload route's destination | `app/api/admin/upload/route.ts` |

Each row is a single-module change: the UI never learns where data comes from.

---

## 17. Known constraints and deliberate deviations

### Where V2 differs from the V1 brief

The original brief (V1) explicitly deferred an admin dashboard, analytics, reviews, accounts and
payments. The business then asked for the first three, so they exist now — but each one is
built at the boundary V1 specified, not bolted on:

- **The document store** replaces the typed modules *behind* the same repository functions, so
  the UI never learned where data comes from.
- **Reviews are moderated by default.** The brief forbade inventing social proof; publishing
  whatever a stranger types would be worse. Submissions queue for approval and only approved
  reviews render, so the site can never display a review the business has not read.
- **Motion is still restrained.** GSAP and Lenis were added for polish, and both are switched off
  entirely under `prefers-reduced-motion`; the reveals start from JavaScript (`gsap.set`), never
  from CSS, so a failed script leaves content visible rather than invisible. The surface texture
  is an SVG noise tile, not a gradient, so the "no gradients" rule still holds.
- **react-bits** is *not* a dependency: the npm package of that name is an unrelated, abandoned
  library that pulls in React 16-era dependencies. The effects it is known for (texture, counters,
  reveals) are implemented directly in `components/effects/` instead.

### Environment-driven choices

- **Tests run on Node's built-in test runner**, not Vitest/Jest. This host cannot load native
  binaries compiled for it (Rollup's binding fails to load), and the project keeps dependencies
  minimal. `test/hooks.mjs` makes application modules importable under Node; the same suite runs
  unchanged on any platform with Node 20.9+.
- **The build uses Webpack** because Turbopack has no native bindings on this host. Both are
  supported by Next 16; switching is a one-word change in `package.json`.
- **TypeScript 5.9** rather than 7.x: the Next codegen and ESLint toolchain are validated against
  5.x; 7.x is a drop-in candidate once the ecosystem confirms it.
- **sharp runs through its WASM build** on this host (no native prebuilt for this platform). On a
  normal Linux x64 host `npm install` picks the native binary automatically; no code change.
- **CSP allows `'unsafe-inline'` for scripts/styles** because the framework injects inline
  bootstrap; the nonce-based variant is a documented follow-up rather than a broken build.
- **Search is client-side** because the catalogue is small; the interface exists so this can move
  server-side without UI changes.

### Content status

- **No photography yet** → `MediaSlot` placeholders and a logo-led hero. Nothing is faked.
- **The store ships seeded** from the V1 sample catalogue, then becomes whatever the dashboard
  saves. Deleting `data/store/*.json` re-seeds it from `data/products/seed-catalogue.ts`.

---

## 18. Commands

```bash
npm run dev             # local dev server (dashboard at admin.localhost:3000)
npm run build           # production build (standalone output for the container)
npm run start           # serve the production build
npm run typecheck       # tsc --noEmit
npm run lint            # eslint
npm run test            # Node test runner
npm run brand:prepare   # regenerate logo crops + favicon from the supplied original
npm run admin:hash      # generate ADMIN_PASSWORD_HASH for the dashboard
./scripts/start-local.sh  # run the standalone build with .env.local loaded

# Container
docker compose up -d                 # build and run
docker compose logs -f web           # follow the logs
```
