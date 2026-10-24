/**
 * Content model. Keep content separate from presentation (ARCHITECTURE.md §4) so the
 * site can later be driven by a CMS without touching components.
 */

/** Category identifiers double as URL slugs: /categories/curtains */
export const CATEGORY_IDS = ["curtains", "accessories", "window-solutions"] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type ProductImage = {
  /** Path under `public/` (e.g. `/products/linen-sheer-curtain/01.jpg`) or an https URL. */
  src: string;
  /** Meaningful description for screen readers. Required — never decorative filler. */
  alt: string;
  /** Intrinsic pixel size when known; used to reserve space and avoid layout shift. */
  width?: number;
  height?: number;
};

export type ProductAttribute = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  /** Product family used for grouping in the shop, e.g. "Brackets" or "Rings". */
  type?: string;
  shortDescription?: string;
  description?: string;
  /** An empty array is valid: the UI renders an honest image slot until media exists. */
  images: ProductImage[];
  /** Only set when a price is genuinely available. Never invented. */
  price?: number;
  /** The pre-discount price, shown struck through when it is higher than `price`. */
  compareAtPrice?: number;
  currency?: "NGN";
  /** Shown instead of a price when none has been supplied, e.g. "Price on request". */
  priceLabel?: string;
  sku?: string;
  /** Real specifications only, in display order. */
  attributes?: ProductAttribute[];
  /** Only set when availability is actually known. */
  available?: boolean;
  featured?: boolean;
};

export type Category = {
  id: CategoryId;
  name: string;
  /** Equals `id`; declared for clarity and future independence of id and slug. */
  slug: string;
};

export type EnquiryItem = {
  slug: string;
  quantity: number;
};

/** An enquiry line resolved against the catalogue. */
export type EnquiryEntry = {
  product: Product;
  quantity: number;
};
