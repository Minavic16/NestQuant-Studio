# Brand assets

The current logo was supplied on 25 October 2026 as a 2300 x 2300 PNG: white
artwork on a pure black field. The artwork is a ribbon-form D monogram beside a
high-contrast serif wordmark reading `DESIRED HOMES`, with `INTERIORS` set in
letterspaced capitals below it.

## Files

| File | Size | Use |
| --- | --- | --- |
| `desired-homes-logo.svg` | 1764 x 789 | Full lockup, ink on light surfaces |
| `desired-homes-logo-light.svg` | 1764 x 789 | Full lockup, ivory on dark surfaces |
| `desired-homes-monogram.svg` | 825 x 789 | D monogram only, ink on light surfaces |
| `desired-homes-monogram-light.svg` | 825 x 789 | D monogram only, ivory on dark surfaces |
| `desired-homes-wordmark.svg` | 849 x 428 | Wordmark only, ink on light surfaces |
| `favicon.svg` | 64 x 64 | Browser tab and home screen icon |
| `logo-complete.png` | 1200 x 1200 | Structured-data logo, ivory lockup on the dark field |
| `desired-homes-qr.svg` | Vector | QR code to the production site |
| `desired-homes-qr.png` | 2025 x 2025 | Print and social QR code |

`app/icon.png` is the 512 x 512 opaque app icon. `app/opengraph-image.jpg` is the
1200 x 630 social card. Both are generated from the same traced artwork.

## How the SVG was made

The supplied PNG was measured, cropped to the artwork's bounding box, and traced
with Potrace. The settings were:

- threshold 145
- `blackOnWhite: false` so the white artwork becomes the shape
- `turdSize: 2`
- `alphaMax: 1`
- `optCurve: true`
- `optTolerance: 0.2`

The trace preserves the supplied silhouette, including the thin gap where the
upper ribbon crosses the D. It is not a redraw or a re-typeset approximation.
The measured bounds are:

- full lockup: 1764 x 789 at x 262, y 756
- monogram: 825 x 789 at x 262, y 756
- wordmark: 849 x 428 at x 1177, y 943

## Colours

- Ink: `#211e1b`
- Ivory: `#fbf9f5`
- Dark field: `#211e1b`

The logo is flat colour. Do not add gradients, shadows or metallic effects.

## QR code

The QR code points to `https://desired-homes-interiors.vercel.app`. It uses
error correction level H, a four-module quiet zone, ink modules on an ivory
field. If the production domain changes, regenerate both QR files with the new
origin.
