import type { CategoryId, Product } from "@/data/types";

/** Filters accepted by the shop view. */
export type ProductFilters = {
  /** Free-text query; empty or whitespace-only means "no filter". */
  query?: string;
  /** `"all"` or a specific category id. */
  category?: CategoryId | "all";
  /** `"all"`, omitted, or a product type such as "Brackets". */
  type?: string;
};

/** Category filtering shared by the shop view and the category pages. */
export function filterByCategory(
  products: readonly Product[],
  category: CategoryId | "all" | undefined,
): readonly Product[] {
  if (!category || category === "all") return products;
  return products.filter((product) => product.category === category);
}

/** Product-type filtering, used to group hardware within the shop. */
export function filterByType(
  products: readonly Product[],
  type: string | undefined,
): readonly Product[] {
  if (!type || type === "all") return products;
  return products.filter((product) => product.type === type);
}

/** Match search terms against the searchable fields of a product. */
export function matchesQuery(product: Product, terms: readonly string[]): boolean {
  if (terms.length === 0) return true;

  const haystack = [
    product.name,
    product.type ?? "",
    product.category.replace(/-/g, " "),
    product.sku ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return terms.every((term) => haystack.includes(term));
}

export function normalizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

/**
 * Pure filter used by the shop view and the search panel. `lib/search` owns the
 * swappable SearchService abstraction; this helper is the local, synchronous
 * implementation behind it.
 *
 * Order is preserved: the catalogue is curated type-by-type, and the shop relies
 * on that order to read as a grouped lookbook rather than an alphabetical list.
 */
export function filterProducts(
  products: readonly Product[],
  filters: ProductFilters,
): Product[] {
  const terms = normalizeQuery(filters.query ?? "");

  return filterByType(filterByCategory(products, filters.category), filters.type).filter((product) =>
    matchesQuery(product, terms),
  );
}

/** Product types in catalogue order, for the shop's type filter. */
export function productTypes(products: readonly Product[]): string[] {
  return [...new Set(products.flatMap((product) => (product.type ? [product.type] : [])))];
}
