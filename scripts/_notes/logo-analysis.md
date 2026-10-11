# Logo analysis (measured, not guessed)

Source: `public/brand/source/desired-homes-logo-original.jpg` — 1254 × 1254 JPEG, sRGB, no
EXIF/ICC, 65 kB. Background is **pure black `#000000`** (corner luminance ≈ 0).

Row-band analysis (threshold: luminance > 45) found four content bands:

| Band | Content | Rows | Columns | W × H |
| --- | --- | --- | --- | --- |
| 1 | `DH` monogram (a ligature: the D's bowl flows into the H, whose right stem is a colonnade of slats) | 204–757 | 206–1026 | 821 × 554 |
| 2 | `DESIRED HOMES` serif wordmark | 817–919 | 93–1167 | 1075 × 103 |
| 3 | `INTERIORS` + flanking hairline rules | 953–994 | 93–1160 | 1068 × 42 |
| 4 | Tagline `CURTAINS • ACCESSORIES • WINDOW SOLUTIONS` | 1039–1059 | 134–1123 | 990 × 21 |

Overall content bounding box: rows 204–1059, columns 93–1167 — the lockup is optically
centred with ~90–200 px of black margin.

## Derived crops (`npm run brand:prepare`)

All crops are pixel-faithful regions of the original — nothing is redrawn, re-typeset or
approximated. Padding is symmetric so the metallic mark keeps its original optical margins.

| Output | Crop box | Size | Used for |
| --- | --- | --- | --- |
| `public/brand/logo-monogram.jpg` | 166,164 900×633 | 288 × 202 (7.3 kB) | Header brand chip, footer chip |
| `public/brand/logo-lockup.jpg` | 45,160 1170×878 | 400 × 300 (16.4 kB) | Mobile navigation drawer |
| `public/brand/logo-complete.jpg` | 45,160 1170×943 | 840 × 677 (49.6 kB) | Hero, About, Open Graph |
| `public/brand/desired-homes-logo.jpg` | — | original copy (65 kB) | Untouched source of truth / fallback |
| `app/icon.png` | monogram, letterboxed to square | 256 × 256 (8 kB) | Favicon |

## Design consequences

1. **The black field is part of the asset.** Any surface that hosts the logo must be exactly
   `#000000`, otherwise the logo's black rectangle is visible as a seam. The hero and the
   closing enquiry band are therefore pure black; the mark dissolves into them.
2. **The metallic finish is champagne/silver, not gold.** The UI palette stays black, white,
   ivory and neutral grey (see `DESIGN.md` §2). Gold appears only inside the logo pixels.
3. **The display personality is a high-contrast serif.** The UI uses the opposite pole — a
   neutral system sans — so the two never compete. Display type is a system serif stack
   (Georgia → Times → Noto Serif) with zero font downloads.
4. **Letter-spaced small caps are part of the brand voice** (`INTERIORS`, the tagline), so
   section labels use generous tracking rather than size for emphasis.
5. **The monogram is a ligature**, so it is only ever cropped as a whole — never split into
   separate letters, and never set as text.
