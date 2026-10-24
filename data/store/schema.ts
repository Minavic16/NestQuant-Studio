/**
 * Store document schemas.
 *
 * V1 read from typed modules compiled into the bundle. V2 moves content into a
 * runtime store so the admin dashboard can edit it (ARCHITECTURE.md §16). The
 * shapes are deliberately the same as V1's data types so the UI layer does not
 * change — only the source of the data does.
 */

import type { CategoryId, ProductAttribute } from "../types";

/** A review submitted by a visitor, visible only after moderation. */
export type Review = {
  id: string;
  /** Product slug, or "site" for a general business review. */
  subject: string;
  productName: string;
  author: string;
  /** 1–5. */
  rating: number;
  body: string;
  /** ISO timestamp. */
  createdAt: string;
  status: "pending" | "approved" | "rejected";
};

export type StoreContact = {
  email: string;
  /** Normalised wa.me number: digits only. */
  whatsappNumber: string;
};

export type StoreCategory = {
  id: CategoryId;
  name: string;
  slug: string;
  /** Optional editorial image for the category tile. */
  image?: string;
};

export type CatalogueDocument = {
  version: 1;
  products: StoreProduct[];
  categories: StoreCategory[];
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  /** Product family used for grouping in the shop, e.g. "Brackets" or "Rings". */
  type?: string;
  shortDescription?: string;
  description?: string;
  images: StoreImage[];
  price?: number;
  /** The pre-discount price, shown struck through when it is higher than `price`. */
  compareAtPrice?: number;
  currency?: "NGN";
  priceLabel?: string;
  sku?: string;
  attributes?: ProductAttribute[];
  available?: boolean;
  featured?: boolean;
};

export type StoreImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

/**
 * A past job, shown in the portfolio gallery.
 *
 * Images are referenced by their Drive source (a file id or share link) and are
 * resolved at render time, so the business keeps its originals in Drive and the
 * site serves them directly (ARCHITECTURE.md §8).
 */
export type PortfolioItem = {
  id: string;
  slug: string;
  /** Client or project name, e.g. "Mrs Adeyemi — Ikoyi duplex". */
  title: string;
  /** What the job involved. */
  summary: string;
  /** Where the work was done, when the business chooses to say. */
  location?: string;
  /** Year of completion, when known. */
  year?: string;
  /** Services involved, drawn from the categories the business actually offers. */
  services: string[];
  /** Cover image: a Drive file id, share link, or an approved image URL. */
  image: string;
  /** Optional link back to the folder in Drive. */
  driveUrl?: string;
  /** Display order, ascending. */
  order: number;
  published: boolean;
};

export type PortfolioDocument = {
  version: 1;
  items: PortfolioItem[];
};

export type SiteDocument = {
  version: 1;
  contact: StoreContact;
  /** Optional hero media. When absent the hero shows the brand lockup. */
  hero?: {
    image?: string;
    alt?: string;
    eyebrow?: string;
    headline?: string;
    note?: string;
  };
  about: {
    statement: string;
    description: string;
    directorName: string;
    directorRole: string;
    /** Optional image shown in the About band. */
    image?: string;
  };
  /** Free-form key/value settings reserved for future needs. */
  settings: Record<string, string>;
};

export type MetricsDay = {
  /** Total page views. */
  views: number;
  /** Distinct sessions. */
  visitors: number;
  paths: Record<string, number>;
  referrers: Record<string, number>;
  devices: Record<string, number>;
};

export type MetricsDocument = {
  version: 1;
  /** ISO date (YYYY-MM-DD) → aggregated day. */
  days: Record<string, MetricsDay>;
  /** Rolling set of session ids per day, so visitors stay accurate when re-aggregating. */
  sessions: Record<string, string[]>;
};

export type ReviewDocument = {
  version: 1;
  reviews: Review[];
};

export type SessionDocument = {
  version: 1;
  /** Not used in V2 (sessions are stateless signed cookies); reserved for revocation lists. */
  revokedBefore?: string;
};
