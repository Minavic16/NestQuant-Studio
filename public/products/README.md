# Product photography

Each product has a folder named after its slug, with images numbered in view order:

```
public/products/clamp-style-curtain-bracket/01.jpg
public/products/clamp-style-curtain-bracket/02.jpg
```

The catalogue in `data/products/seed-catalogue.ts` references these paths. The first image is the
card image and the priority-loaded gallery image.

Current files are 1000 × 1250 (4:5), padded with white so every card has the same proportion.
They are copies of the processed inbox files; the submissions remain untouched in the inbox
archive. Six images were cropped to remove another brand's mark before padding.

Guidelines for new photography:

- Keep the 4:5 proportion, or let the card frame crop it centrally.
- Write `alt` text that describes what the picture shows; it is required for accessibility.
- `next/image` generates responsive AVIF/WebP derivatives at request time, so a 2000px source is
  fine — but do not upload anything above ~2400px on the long edge.
- Use `.jpg` for photography (or `.png` for flat artwork); both are optimised automatically.
- If a product has no image, leave `images: []`; the site renders an honest "Image to come" slot
  (DESIGN.md §7) rather than a fake picture.
