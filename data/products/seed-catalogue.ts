import type { Product } from "@/data/types";

/**
 * ============================================================================
 * SAMPLE CATALOGUE — DEMONSTRATION DATA ONLY
 * ============================================================================
 * The business has not yet supplied product content. This file exists so the
 * catalogue, filtering, enquiry and error paths can be demonstrated, tested and
 * deployed before real content arrives.
 *
 * It deliberately asserts nothing that is not true:
 *   • no prices (the UI shows "Price on request")
 *   • no specifications, SKUs or availability
 *   • no photography (the UI shows an honest image slot)
 *   • generic names taken from the brief's own examples
 *
 * TO GO LIVE: delete this file, add one file per product under
 * `data/products/`, and point `data/products/index.ts` at them.
 * ============================================================================
 */
export const seedCatalogue: readonly Product[] = [
  {
    id: "dhs-c-01",
    slug: "linen-sheer-curtain",
    name: "Linen Sheer Curtain",
    category: "curtains",
    images: [],
    featured: true,
  },
  {
    id: "dhs-c-02",
    slug: "modern-panel-curtain",
    name: "Modern Panel Curtain",
    category: "curtains",
    images: [],
    featured: true,
  },
  {
    id: "dhs-a-01",
    slug: "decorative-tieback",
    name: "Decorative Tieback",
    category: "accessories",
    images: [],
    featured: true,
  },
  {
    id: "dhs-a-02",
    slug: "textured-throw-cushion",
    name: "Textured Throw Cushion",
    category: "accessories",
    images: [],
  },
  {
    id: "dhs-w-01",
    slug: "window-roller-blind",
    name: "Window Roller Blind",
    category: "window-solutions",
    images: [],
    featured: true,
  },
  {
    id: "dhs-w-02",
    slug: "wooden-curtain-rod",
    name: "Wooden Curtain Rod",
    category: "window-solutions",
    images: [],
  },
];
