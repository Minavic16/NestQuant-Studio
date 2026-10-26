# Desired Homes Interiors

Production website for **Desired Homes Interiors**, a Nigerian interiors business selling
curtains, interior decoration accessories and window solutions.

The site is a **catalogue + enquiry platform**: visitors browse the collection, add pieces to
an enquiry list, and send it to the business on WhatsApp or by email. There is no checkout,
no payment and no customer accounts.

- **Conversion path:** Discover → Browse → Inspect → Add to enquiry → Send enquiry → WhatsApp / email
- **Also:** a gallery of the business's completed projects, and a hero led by editorial interior photography
- **Theme:** light and dark, following the visitor's operating-system preference; no toggle, no stored override
- **Business contact:** [desirenwakor@gmail.com](mailto:desirenwakor@gmail.com) · WhatsApp [+234 913 879 7980](https://wa.me/2349138797980)
- **CEO & Creative Director:** Desire Nwakor

## Documentation

| Document | What it covers |
| --- | --- |
| [`DESIGN.md`](./DESIGN.md) | The design system: brand, colour, typography, space, texture, motion, page composition, accessibility, content rules. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Engineering decisions: stack, rendering, directory map, the document store, enquiry/search/contact boundaries, dashboard security, performance, testing, containerisation. |
| [`public/brand/README.md`](./public/brand/README.md) | The supplied logo, how its SVG was traced, the colour values and the QR code. |

## Quick start

```bash
npm install

# Configure the environment (dashboard + analytics live here).
cp .env.example .env.local

# Generate the dashboard password hash and paste it into .env.local.
npm run admin:hash -- "choose-a-long-password"
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"  # ADMIN_SESSION_SECRET

npm run dev            # shop:  http://localhost:3000
                       # admin: http://admin.localhost:3000
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server. |
| `npm run build` | Production build (standalone output for the container). |
| `npm run start` | Serve the production build. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint (flat config, Next + TypeScript presets). |
| `npm run test` | Test suite (Node's built-in runner). |
| `npm run admin:hash` | Generate the dashboard password hash. |
| `./scripts/start-local.sh` | Run the standalone build with `.env.local` loaded. |

All four checks (`lint`, `typecheck`, `test`, `build`) pass on a clean checkout: **134 tests**.

The brand files are committed and documented in `public/brand/README.md`. There is no
runtime build step for the logo.

## Two web addresses

The shop and the dashboard are separate by design:

```
https://www.your-domain.com      → the shop (what customers see)
https://admin.your-domain.com    → the dashboard (only the owner)
```

`ADMIN_HOST` decides which origin serves the dashboard. On the shop's origin, `/admin` is not
addressable at all, so the two can never be reached from one URL. Locally,
`http://admin.localhost:3000` works with no DNS setup.

## The dashboard

Sign in with the password whose hash is in `ADMIN_PASSWORD_HASH`.

| Page | What it does |
| --- | --- |
| **Overview** | Visitors, page views, today's numbers, a 30-day chart, most-viewed pages, referrers, devices, and the review queue at a glance. |
| **Products** | The catalogue at a glance; add, edit or remove products and their images, prices, SKUs and specifications. |
| **Categories** | Rename a collection, change its web address, attach a tile image. |
| **Reviews** | Approve or reject visitor reviews. Nothing is published until you approve it. |
| **Contact & content** | Email address, WhatsApp number, About copy and director details, the values used across the whole site. |
| **Our work** | The portfolio of completed projects. Each entry points at an image in your Google Drive, paste the share link, and the gallery updates. No uploading, no storage limits, and you keep the originals where they already are. |
| **Images** | Upload photography for products, and copy its address into any product. |

Reviews are collected by the site itself and shown only after approval, so the business never
publishes anything it has not read.

## Before going live

1. **Set `NEXT_PUBLIC_SITE_URL`** to the real domain. Until you do, canonical URLs, `sitemap.xml`
   and Open Graph tags use the known production origin `https://desired-homes-interiors.vercel.app`.
2. **Set the three `ADMIN_*` values** (see Quick start). The dashboard refuses to sign anyone in
   while the password hash is missing.
3. **Replace the seeded catalogue** in `data/store/` with real products through the dashboard.
4. **Add real photography** either by uploading product photos in the dashboard, or by sharing
   your past-work photos in Google Drive and pasting the links into the **Our work** page.

Nothing else needs changing: contact details, navigation and copy all live in the dashboard.

## Deploying

### Vercel

Import the repository and Vercel detects Next.js automatically, no build configuration
needed. Set the environment variables from the Quick start in the project settings.

**One caveat:** Vercel's filesystem is read-only, so the admin dashboard's edits, review
submissions and analytics will not persist there. The public catalogue and enquiry flow work
fully. For the dashboard you need a writable filesystem, which means either a VPS with Docker
(below) or a hosted database.

### Any Node host

```bash
npm ci && npm run build
./scripts/start-local.sh      # or: node --env-file=.env.local .next/standalone/server.js
```

### Docker (self-hosted)

```bash
docker compose -f deploy/docker-compose.yml up -d   # builds and runs; persists data in a volume
```

The Dockerfile lives in `deploy/` rather than the repository root so that Vercel uses its
native Next.js builder instead of its container builder.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests and the build on every push, and
builds and pushes the container image to GHCR on `main`. Deploy
(`.github/workflows/deploy.yml`) pulls that image, swaps the container and waits for its health
check. Four repository secrets are needed: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`,
`PUBLIC_URL`.

## Where portfolio images come from

The gallery reads from Drive rather than storing copies: a portfolio entry holds
a Drive reference (a file id or share link) which `lib/media/drive.ts` resolves to
the image URL at render time. Next's image optimiser then produces responsive
AVIF/WebP derivatives, so a visitor on a phone downloads a small file.

- Only Google's image hosts are ever allowed as an image source, and anything a
  hand-edited store can't resolve is dropped rather than stored.
- Images that are no longer shared degrade to a neutral frame, not a broken icon.
- If you would rather host images yourself, `public/uploads/` works too, the
  resolver accepts both.

## Notes for developers

- `config/` holds business facts, `data/` holds content, `lib/` holds behaviour, `components/`
  holds presentation. Components never contain a phone number, a price or a product name.
- Content lives in `data/store/*.json` and is validated on every read; deleting those files
  re-seeds them from the V1 data.
- The enquiry list lives in `localStorage` behind a versioned key and is validated on every read.
- Everything is typed and strict; `npm run typecheck` enforces it.
