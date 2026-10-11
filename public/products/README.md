# Drop real product photography here.

Structure the files per product slug, and reference them from `data/products/*.ts`:

```
public/products/linen-sheer-curtain/01.jpg
public/products/linen-sheer-curtain/02.jpg
```

In the product data:

```ts
images: [
  { src: "/products/linen-sheer-curtain/01.jpg", alt: "Sheer linen curtain in a bright living room" },
]
```

Until an image exists, the site renders an honest "Image to come" slot (DESIGN.md §7).

Guidelines:

- The first image in the array is the card image and the priority-loaded gallery image.
- Write `alt` text that describes what the picture shows; it is required for accessibility.
- `next/image` generates responsive AVIF/WebP derivatives at request time, so a 2000px source is
  fine — but do not upload anything above ~2400px on the long edge.
- Use `.jpg` for photography (or `.png` for flat artwork); both are optimised automatically.
