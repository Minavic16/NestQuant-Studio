import { CATEGORY_IDS } from "../types";
import type { CategoryId, Product, ProductAttribute } from "../types";
import { normaliseImageSource } from "../../lib/media/drive";
import { seedPortfolioItems } from "./seed-portfolio";
import type {
  CatalogueDocument,
  PortfolioDocument,
  PortfolioItem,
  Review,
  ReviewDocument,
  SiteDocument,
  StoreCategory,
  StoreContact,
  StoreProduct,
} from "./schema";
import { readDocument, writeDocument, storePath, STORE_FILES } from "./store";
import { contactConfig } from "../../config/contact";
import { siteConfig } from "../../config/site";
import { seedCatalogue } from "../products/seed-catalogue";
import { categories as defaultCategories } from "../categories";
import { aboutContent } from "../content/about";
import { access } from "node:fs/promises";
import { isValidSlug } from "../../lib/validation/validation";

/**
 * Repositories over the document store.
 *
 * The UI depends on these functions only, so the backing store can be swapped
 * for a database or a CMS without touching a component (ARCHITECTURE.md §4, §16).
 * Documents are validated on read: a malformed file falls back to the shipped
 * defaults rather than breaking the site.
 */

const CATALOGUE_VERSION = 1;
const SITE_VERSION = 1;
const REVIEW_VERSION = 1;

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asCategoryId(value: unknown, fallback: CategoryId): CategoryId {
  return typeof value === "string" && (CATEGORY_IDS as readonly string[]).includes(value)
    ? (value as CategoryId)
    : fallback;
}

function asNumberOrUndefined(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : undefined;
}

function asBooleanOrUndefined(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normaliseImages(value: unknown): StoreProduct["images"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { src, alt, width, height } = entry as Record<string, unknown>;
    if (typeof src !== "string" || src.length === 0) return [];
    return [
      {
        src,
        alt: asString(alt, "Product image"),
        ...(typeof width === "number" ? { width } : {}),
        ...(typeof height === "number" ? { height } : {}),
      },
    ];
  });
}

function normaliseAttributes(value: unknown): ProductAttribute[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const attributes = value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const { label, value: attributeValue } = entry as Record<string, unknown>;
    if (typeof label !== "string" || typeof attributeValue !== "string") return [];
    return [{ label, value: attributeValue }];
  });
  return attributes.length > 0 ? attributes : undefined;
}

/** Validate a catalogue document, filling any gap from the shipped defaults. */
export function validateCatalogue(value: unknown): CatalogueDocument {
  const source = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;

  const products = Array.isArray(source.products)
    ? source.products.flatMap((entry): StoreProduct[] => {
        if (typeof entry !== "object" || entry === null) return [];
        const record = entry as Record<string, unknown>;
        const slug = asOptionalString(record.slug);
        const name = asOptionalString(record.name);
        // A malformed slug would produce an unusable URL, so the entry is
        // rejected rather than coerced.
        if (!slug || !name || !isValidSlug(slug)) return [];
        const category = asCategoryId(record.category, "curtains");
        return [
          {
            id: asString(record.id, slug),
            slug,
            name,
            category,
            ...(asOptionalString(record.shortDescription)
              ? { shortDescription: asOptionalString(record.shortDescription) }
              : {}),
            ...(asOptionalString(record.description)
              ? { description: asOptionalString(record.description) }
              : {}),
            images: normaliseImages(record.images),
            ...(asNumberOrUndefined(record.price) !== undefined
              ? { price: asNumberOrUndefined(record.price) }
              : {}),
            ...(asOptionalString(record.priceLabel) ? { priceLabel: asOptionalString(record.priceLabel) } : {}),
            ...(asOptionalString(record.sku) ? { sku: asOptionalString(record.sku) } : {}),
            ...(normaliseAttributes(record.attributes)
              ? { attributes: normaliseAttributes(record.attributes) }
              : {}),
            ...(asBooleanOrUndefined(record.available) !== undefined
              ? { available: asBooleanOrUndefined(record.available) }
              : {}),
            ...(record.featured === true ? { featured: true } : {}),
          },
        ];
      })
    : [];

  const categoryNames = new Map(defaultCategories.map((category) => [category.id, category.name]));
  const rawCategories = Array.isArray(source.categories) ? source.categories : [];
  const categories = rawCategories.flatMap((entry): StoreCategory[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    const id = asCategoryId(record.id, "curtains");
    const fallbackSlug = asOptionalString(record.slug) ?? id;
    if (!isValidSlug(fallbackSlug)) return [];
    return [
      {
        id,
        slug: fallbackSlug,
        name: asString(record.name, categoryNames.get(id) ?? id),
        ...(asOptionalString(record.image) ? { image: asOptionalString(record.image) } : {}),
      },
    ];
  });

  return { version: CATALOGUE_VERSION, products, categories };
}

/** Build a catalogue document from the V1 typed data (used for first-run seeding). */
export function seedCatalogueDocument(): CatalogueDocument {
  return validateCatalogue({
    version: CATALOGUE_VERSION,
    products: seedCatalogue,
    categories: defaultCategories,
  });
}

export function validateSite(value: unknown): SiteDocument {
  const source = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  const contact = (typeof source.contact === "object" && source.contact !== null
    ? source.contact
    : {}) as Record<string, unknown>;
  const about = (typeof source.about === "object" && source.about !== null
    ? source.about
    : {}) as Record<string, unknown>;
  const hero = (typeof source.hero === "object" && source.hero !== null ? source.hero : {}) as Record<
    string,
    unknown
  >;
  const settings =
    typeof source.settings === "object" && source.settings !== null
      ? (source.settings as Record<string, string>)
      : {};

  return {
    version: SITE_VERSION,
    contact: {
      email: asString(contact.email, contactConfig.email),
      whatsappNumber: asString(contact.whatsappNumber, contactConfig.whatsappNumber),
    },
    hero: {
      ...(asOptionalString(hero.image) ? { image: asOptionalString(hero.image) } : {}),
      ...(asOptionalString(hero.alt) ? { alt: asOptionalString(hero.alt) } : {}),
      ...(asOptionalString(hero.eyebrow) ? { eyebrow: asOptionalString(hero.eyebrow) } : {}),
    },
    about: {
      statement: asString(about.statement, aboutContent.statement),
      description: asString(about.description, aboutContent.description),
      directorName: asString(about.directorName, siteConfig.ceo.name),
      directorRole: asString(about.directorRole, siteConfig.ceo.role),
      ...(asOptionalString(about.image) ? { image: asOptionalString(about.image) } : {}),
    },
    settings,
  };
}

export function seedSiteDocument(): SiteDocument {
  return validateSite({});
}

export function validateReviews(value: unknown): ReviewDocument {
  const source = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  const reviews = Array.isArray(source.reviews)
    ? source.reviews.flatMap((entry): Review[] => {
        if (typeof entry !== "object" || entry === null) return [];
        const record = entry as Record<string, unknown>;
        const id = asOptionalString(record.id);
        const body = asOptionalString(record.body);
        const author = asOptionalString(record.author);
        if (!id || !body || !author) return [];
        const rating = typeof record.rating === "number" ? Math.round(record.rating) : 5;
        const status =
          record.status === "approved" || record.status === "rejected" ? record.status : "pending";
        return [
          {
            id,
            subject: asString(record.subject, "site"),
            productName: asString(record.productName, ""),
            author,
            rating: Math.min(5, Math.max(1, rating)),
            body,
            createdAt: asString(record.createdAt, new Date().toISOString()),
            status,
          },
        ];
      })
    : [];

  return { version: REVIEW_VERSION, reviews };
}

export function seedReviewDocument(): ReviewDocument {
  return validateReviews({});
}

const PORTFOLIO_VERSION = 1;

export function validatePortfolio(value: unknown): PortfolioDocument {
  const source = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;

  const items = Array.isArray(source.items)
    ? source.items.flatMap((entry, index): PortfolioItem[] => {
        if (typeof entry !== "object" || entry === null) return [];
        const record = entry as Record<string, unknown>;
        const slug = asOptionalString(record.slug);
        const title = asOptionalString(record.title);
        // A portfolio item without a usable image cannot be shown, so it is
        // not stored — the admin is told the image was rejected.
        const image = normaliseImageSource(record.image);
        if (!slug || !title || !image) return [];

        // Default to the item's position, so an omitted order still reads
        // sensibly and never references the array being built.
        const order =
          typeof record.order === "number" && Number.isFinite(record.order)
            ? Math.round(record.order)
            : index;

        return [
          {
            id: asString(record.id, slug),
            slug,
            title,
            summary: asOptionalString(record.summary) ?? "",
            ...(asOptionalString(record.location) ? { location: asOptionalString(record.location) } : {}),
            ...(asOptionalString(record.year) ? { year: asOptionalString(record.year) } : {}),
            services: Array.isArray(record.services)
              ? record.services.filter((service): service is string => typeof service === "string" && service.length > 0)
              : [],
            image,
            ...(asOptionalString(record.driveUrl) ? { driveUrl: asOptionalString(record.driveUrl) } : {}),
            order,
            published: record.published !== false,
          },
        ];
      })
    : [];

  return { version: PORTFOLIO_VERSION, items };
}

export function seedPortfolioDocument(): PortfolioDocument {
  return validatePortfolio({ version: 1, items: seedPortfolioItems });
}

/** Ensure every document exists on disk, seeding from the V1 typed data. */
export async function ensureStore(): Promise<void> {
  for (const [file, seed] of [
    [STORE_FILES.catalogue, seedCatalogueDocument()],
    [STORE_FILES.site, seedSiteDocument()],
    [STORE_FILES.reviews, seedReviewDocument()],
    [STORE_FILES.metrics, { version: 1, days: {}, sessions: {} }],
  ] as const) {
    if (!(await fileExists(file))) await writeDocument(file, seed);
  }
}

async function fileExists(file: string): Promise<boolean> {
  try {
    await access(storePath(file as never));
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Public read API — the shape the UI consumes
 * ------------------------------------------------------------------ */

export async function getCatalogue(): Promise<CatalogueDocument> {
  return readDocument(STORE_FILES.catalogue, seedCatalogueDocument(), validateCatalogue);
}

export async function getProducts(): Promise<StoreProduct[]> {
  return (await getCatalogue()).products;
}

export async function getCategories(): Promise<StoreCategory[]> {
  return (await getCatalogue()).categories;
}

export async function getSite(): Promise<SiteDocument> {
  return readDocument(STORE_FILES.site, seedSiteDocument(), validateSite);
}

export async function getContact(): Promise<StoreContact> {
  return (await getSite()).contact;
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  return (
    await readDocument(STORE_FILES.portfolio, seedPortfolioDocument(), validatePortfolio)
  ).items;
}

/** Published portfolio items, in display order. */
export async function getPublishedPortfolio(): Promise<PortfolioItem[]> {
  return (await getPortfolio())
    .filter((item) => item.published)
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export async function getReviews(): Promise<Review[]> {
  return (await readDocument(STORE_FILES.reviews, seedReviewDocument(), validateReviews)).reviews;
}

export async function saveCatalogue(document: CatalogueDocument): Promise<void> {
  await writeDocument(STORE_FILES.catalogue, validateCatalogue(document));
}

export async function saveSite(document: SiteDocument): Promise<void> {
  await writeDocument(STORE_FILES.site, validateSite(document));
}

export async function savePortfolio(items: PortfolioItem[]): Promise<void> {
  await writeDocument(STORE_FILES.portfolio, validatePortfolio({ version: 1, items }));
}

export async function saveReviews(reviews: Review[]): Promise<void> {
  await writeDocument(STORE_FILES.reviews, validateReviews({ version: 1, reviews }));
}

/** Convert a stored product into the shape the existing UI expects. */
export function toProduct(product: StoreProduct): Product {
  const { id, slug, name, category, ...rest } = product;
  return { id, slug, name, category, ...rest };
}

export type { StoreContact, StoreProduct, StoreCategory, Review };
